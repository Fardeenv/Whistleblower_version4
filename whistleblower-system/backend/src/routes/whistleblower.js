const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');
const router = express.Router();

// Configure multer storage for voice note uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Submit a new whistleblower report
router.post('/reports', upload.single('voiceNote'), async (req, res, next) => {
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
      authoritiesAware = false
    } = req.body;

    if (!title && !description && !req.file) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Either title, description, or voice note is required' 
      });
    }

    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Handle voice note if uploaded
    let voiceNote = '';
    let hasVoiceNote = false;
    
    if (req.file) {
      voiceNote = `/uploads/audio/${req.file.filename}`;
      hasVoiceNote = true;
    }
    
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
      authoritiesAware.toString()
    );
    
    await disconnectFromNetwork(gateway);
    
    // Notify any connected clients about new report
    const io = req.app.get('io');
    if (io) {
      io.emit('new_report', { id, title, date, criticality });
    }
    
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
      authoritiesAware
    });
  } catch (error) {
    if (req.file) {
      // Clean up the file if there was an error
      fs.unlinkSync(req.file.path);
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
router.post('/reports/:id/chat', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sender, content } = req.body;
    
    if (!sender || !content) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Sender and content are required' 
      });
    }
    
    const timestamp = new Date().toISOString();
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'addChatMessage',
      id,
      sender,
      content,
      timestamp
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about new message
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('new_message', {
        reportId: id,
        sender,
        content,
        timestamp,
        isRead: false
      });
    }
    
    res.status(201).json({
      reportId: id,
      chatMessage: {
        sender,
        content,
        timestamp,
        isRead: false
      }
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
