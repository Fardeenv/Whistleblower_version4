const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');
const router = express.Router();

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if it's a voice note or other file attachment
    if (file.fieldname === 'voiceNote') {
      cb(null, 'uploads/audio');
    } else if (file.fieldname === 'attachments') {
      cb(null, 'uploads/files');
    } else if (file.fieldname === 'chatAttachment') {
      cb(null, 'uploads/chat-attachments');
    } else {
      cb(null, 'uploads');
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  }
});

// Configure file size limits and filters
const upload = multer({
  storage,
  limits: { 
    fileSize: 15 * 1024 * 1024 // 15MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'voiceNote') {
      // Accept only audio files for voice notes
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for voice notes!'), false);
      }
    } else {
      // For other attachments, accept common file types
      const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
        'application/json',
        'application/zip'
      ];
      
      if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not supported!'), false);
      }
    }
  }
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Middleware to handle file uploads for report submission
const reportUpload = upload.fields([
  { name: 'voiceNote', maxCount: 1 },
  { name: 'attachments', maxCount: 5 } // Allow up to 5 file attachments
]);

// Middleware to handle file uploads for chat messages
const chatUpload = upload.single('chatAttachment');

// File metadata storage (in-memory for demo purposes, use a database in production)
const fileMetadataStore = {};

// Submit a new whistleblower report
router.post('/reports', reportUpload, async (req, res, next) => {
  try {
    const {
      title,
      description,
      submitter = 'anonymous',
      criticality = 3, // Default to medium criticality
      rewardWallet = '',
      department = '',
      location = '',
      monetaryValue = '',
      relationship = '',
      encounter = '',
      authoritiesAware = false,
      voiceToText = ''
    } = req.body;

    if (!title && !description && !req.files?.voiceNote && !req.files?.attachments) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Either title, description, voice note, or attachments are required'
      });
    }

    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    // Handle voice note if uploaded
    let voiceNote = '';
    let hasVoiceNote = false;

    if (req.files?.voiceNote) {
      voiceNote = `/uploads/audio/${req.files.voiceNote[0].filename}`;
      hasVoiceNote = true;
    }

    // Handle file attachments if uploaded
    let attachmentsArray = [];
    if (req.files?.attachments) {
      attachmentsArray = req.files.attachments.map(file => {
        return {
          fileName: file.originalname,
          fileType: file.mimetype,
          filePath: `/uploads/files/${file.filename}`,
          timestamp: new Date().toISOString(),
          uploadedBy: 'whistleblower',
          fileSize: formatFileSize(file.size)
        };
      });
      
      // Store file metadata separately instead of in blockchain
      fileMetadataStore[id] = attachmentsArray;
    }

    // Connect to the blockchain
    const { gateway, contract } = await connectToNetwork('admin');

    // Submit report without attachments to avoid blockchain serialization issues
    await contract.submitTransaction(
      'submitReport',
      id,
      title || '',
      description || '',
      submitter,
      date,
      criticality.toString(),
      rewardWallet,
      voiceNote,
      hasVoiceNote.toString(),
      department,
      location,
      monetaryValue,
      relationship,
      encounter,
      authoritiesAware.toString(),
      voiceToText || '',
      '[]'  // Empty array for attachments in blockchain
    );

    await disconnectFromNetwork(gateway);

    // Notify any connected clients about new report
    const io = req.app.get('io');
    if (io) {
      io.emit('new_report', { id, title, date, criticality });
    }

    // Return the complete data including attachments to the client
    res.status(201).json({
      id,
      title,
      description,
      submitter,
      date,
      status: 'pending',
      criticality,
      rewardWallet,
      voiceNote,
      hasVoiceNote,
      department,
      location,
      monetaryValue,
      relationship,
      encounter,
      authoritiesAware,
      voiceToText,
      attachments: attachmentsArray
    });
  } catch (error) {
    console.error("Error in report submission:", error);
    
    // Clean up any uploaded files if there was an error
    if (req.files) {
      if (req.files.voiceNote) {
        fs.unlinkSync(req.files.voiceNote[0].path);
      }
      if (req.files.attachments) {
        req.files.attachments.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    }
    next(error);
  }
});

// Get a specific report by ID
router.get('/reports/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gateway, contract } = await connectToNetwork('admin');

    const reportBuffer = await contract.evaluateTransaction('queryReportById', id);
    const report = JSON.parse(reportBuffer.toString());

    await disconnectFromNetwork(gateway);

    // Add file attachments from local storage if available
    if (fileMetadataStore[id]) {
      report.attachments = fileMetadataStore[id];
    }

    res.status(200).json(report);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: `Report with ID ${req.params.id} not found`
      });
    }
    next(error);
  }
});

// Get chat history for a report
router.get('/reports/:id/chat', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gateway, contract } = await connectToNetwork('admin');

    const reportBuffer = await contract.evaluateTransaction('queryReportById', id);
    const report = JSON.parse(reportBuffer.toString());

    await disconnectFromNetwork(gateway);

    if (!report.chatHistory) {
      report.chatHistory = [];
    }

    res.status(200).json(report.chatHistory);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: `Report with ID ${req.params.id} not found`
      });
    }
    next(error);
  }
});

// Add a chat message to a report
router.post('/reports/:id/chat', chatUpload, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sender, content } = req.body;

    if (!sender || (!content && !req.file)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Sender and either content or attachment are required'
      });
    }

    const timestamp = new Date().toISOString();
    const { gateway, contract } = await connectToNetwork('admin');

    // Process attachment if provided
    let attachmentJson = '';
    if (req.file) {
      const attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: `/uploads/chat-attachments/${req.file.filename}`,
        timestamp: timestamp,
        uploadedBy: sender,
        fileSize: formatFileSize(req.file.size)
      };
      attachmentJson = JSON.stringify(attachment);
    }

    const reportBuffer = await contract.submitTransaction(
      'addChatMessage',
      id,
      sender,
      content || '',
      timestamp,
      attachmentJson
    );

    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);

    // Get the newly added message (last message in chat history)
    const newMessage = updatedReport.chatHistory[updatedReport.chatHistory.length - 1];

    // Notify connected clients about new message
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('new_message', {
        reportId: id,
        ...newMessage
      });
    }

    res.status(201).json({
      reportId: id,
      chatMessage: newMessage
    });
  } catch (error) {
    // Clean up the uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: `Report with ID ${req.params.id} not found`
      });
    }
    next(error);
  }
});

// Mark messages as read
router.put('/reports/:id/chat/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reader } = req.body;

    if (!reader) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Reader identifier is required'
      });
    }

    const { gateway, contract } = await connectToNetwork('admin');

    const reportBuffer = await contract.submitTransaction(
      'markChatMessagesAsRead',
      id,
      reader
    );

    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);

    res.status(200).json({
      success: true,
      reportId: id,
      message: "Chat messages marked as read"
    });
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: `Report with ID ${req.params.id} not found`
      });
    }
    next(error);
  }
});

module.exports = router;
