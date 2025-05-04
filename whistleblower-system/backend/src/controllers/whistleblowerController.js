const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { createReport, getReportByID, getAllReports } = require('../fabric/whistleblowerContract');
const socket = require('../socket');

// Submit a new whistleblower report
exports.createWhistleblowerReport = async (req, res) => {
  try {
    const { title, description, criticality, department, location, monetaryValue, relationship, encounter, submitter, rewardWallet, anonymous } = req.body;
    
    // Generate a unique ID for the report
    const id = uuidv4();
    
    // Process voice note file if uploaded
    let voiceNote = null;
    let hasVoiceNote = false;
    
    if (req.files && req.files.voiceNote && req.files.voiceNote[0]) {
      const voiceNoteFile = req.files.voiceNote[0];
      voiceNote = `/api/whistleblower/voice-notes/${voiceNoteFile.filename}`;
      hasVoiceNote = true;
    }
    
    // Process document attachments if uploaded
    let documents = [];
    let hasDocuments = false;
    
    if (req.files && req.files.documents) {
      documents = req.files.documents.map(doc => ({
        name: doc.originalname,
        path: `/api/whistleblower/attachments/${doc.filename}`,
        type: doc.mimetype,
        size: doc.size
      }));
      hasDocuments = documents.length > 0;
    }
    
    // Create report object
    const reportData = {
      id,
      title: title || 'Anonymous Report',
      description,
      date: new Date().toISOString(),
      criticality: parseInt(criticality) || 3,
      status: 'pending',
      hasVoiceNote,
      voiceNote,
      hasDocuments,
      documents,
      department: department || '',
      location: location || '',
      monetaryValue: monetaryValue || '',
      relationship: relationship || '',
      encounter: encounter || '',
      submitter: anonymous === 'true' ? null : submitter || null,
      anonymous: anonymous === 'true',
      rewardWallet: rewardWallet || null,
      maskedId: `M-${id.substring(0, 8)}`,
      chatHistory: []
    };
    
    // Submit to blockchain
    await createReport(reportData);
    
    // Emit socket event
    socket.emitNewReport(reportData);
    
    res.status(201).json({
      success: true,
      id: reportData.id,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ success: false, message: error.message || 'Error submitting report' });
  }
};

// Get a report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get report from blockchain
    const report = await getReportByID(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching report' });
  }
};

// Get chat history for a report
exports.getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get report from blockchain
    const report = await getReportByID(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.status(200).json(report.chatHistory || []);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching chat history' });
  }
};

// Send a chat message
exports.sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Get report from blockchain
    const report = await getReportByID(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    // Process attachment if uploaded
    let attachment = null;
    let attachmentName = null;
    let hasAttachment = false;
    
    if (req.file) {
      attachment = `/api/whistleblower/attachments/${req.file.filename}`;
      attachmentName = req.file.originalname;
      hasAttachment = true;
    }
    
    // Create message object
    const message = {
      id: uuidv4(),
      reportId: id,
      content: content || '',
      sender: 'whistleblower',
      timestamp: new Date().toISOString(),
      read: false,
      hasAttachment,
      attachment,
      attachmentName
    };
    
    // Add message to chat history
    if (!report.chatHistory) {
      report.chatHistory = [];
    }
    
    report.chatHistory.push(message);
    
    // Update report on blockchain
    await createReport(report);
    
    // Emit socket event
    socket.emitNewMessage(message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message || 'Error sending message' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { reader } = req.body;
    
    if (!reader) {
      return res.status(400).json({ success: false, message: 'Reader is required' });
    }
    
    // Get report from blockchain
    const report = await getReportByID(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    // Mark messages as read
    if (report.chatHistory && report.chatHistory.length > 0) {
      let updated = false;
      
      report.chatHistory = report.chatHistory.map(msg => {
        if (msg.sender !== reader && !msg.read) {
          updated = true;
          return { ...msg, read: true };
        }
        return msg;
      });
      
      if (updated) {
        // Update report on blockchain
        await createReport(report);
      }
    }
    
    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: error.message || 'Error marking messages as read' });
  }
};
