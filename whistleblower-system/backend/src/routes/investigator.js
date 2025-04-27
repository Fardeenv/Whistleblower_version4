const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');
const { processReward } = require('../services/crypto');
const router = express.Router();

// Authentication middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if the user has investigator role
    if (decoded.role !== 'investigator') {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Login for investigators
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // In a real application, you would check against a database
  // For this example, we'll use a simple hardcoded check
  const investigators = {
    'investigator1': { password: 'securepass1', name: 'John Investigator' },
    'investigator2': { password: 'securepass2', name: 'Jane Investigator' }
  };
  
  if (investigators[username] && investigators[username].password === password) {
    const token = jwt.sign({ 
      username, 
      role: 'investigator',
      name: investigators[username].name,
      id: username
    }, process.env.JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ 
      token,
      user: {
        id: username,
        name: investigators[username].name,
        role: 'investigator'
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }
});

// Get reports by status with criticality sorting
router.get('/reports', verifyToken, async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportsBuffer = await contract.evaluateTransaction('getReportsByStatus', status);
    const reports = JSON.parse(reportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

// Get unassigned reports
router.get('/reports/unassigned', verifyToken, async (req, res, next) => {
  try {
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportsBuffer = await contract.evaluateTransaction('getUnassignedReports');
    const reports = JSON.parse(reportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

// Get reports assigned to a specific investigator
router.get('/my-reports', verifyToken, async (req, res, next) => {
  try {
    const investigatorId = req.user.id;
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportsBuffer = await contract.evaluateTransaction('getReportsByInvestigator', investigatorId);
    const reports = JSON.parse(reportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

// Get a specific report
router.get('/reports/:id', verifyToken, async (req, res, next) => {
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

// Assign a report to self
router.post('/reports/:id/assign', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const investigatorId = req.user.id;
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'assignReport',
      id,
      investigatorId
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'under_investigation',
        assignedTo: investigatorId
      });
    }
    
    res.status(200).json(updatedReport);
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

// Mark investigation as complete
router.post('/reports/:id/complete', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const investigatorId = req.user.id;
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    // First get the report to check if it has a reward wallet
    const reportBuffer = await contract.evaluateTransaction('queryReportById', id);
    const report = JSON.parse(reportBuffer.toString());
    
    // Complete the investigation
    const updatedReportBuffer = await contract.submitTransaction(
      'completeInvestigation',
      id,
      investigatorId
    );
    
    const updatedReport = JSON.parse(updatedReportBuffer.toString());
    
    // Process reward if wallet is provided
    let rewardProcessed = false;
    if (report.rewardWallet && report.rewardWallet.trim() !== '') {
      try {
        await processReward(report.rewardWallet, process.env.REWARD_AMOUNT, process.env.REWARD_CURRENCY);
        rewardProcessed = true;
      } catch (rewardError) {
        console.error('Error processing reward:', rewardError);
        // We still mark the investigation as complete even if reward fails
      }
    }
    
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'completed',
        rewardProcessed
      });
    }
    
    res.status(200).json({
      ...updatedReport,
      rewardProcessed
    });
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('not assigned')) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You are not assigned to this report' 
      });
    } else if (error.message.includes('not under investigation')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is not under investigation' 
      });
    }
    next(error);
  }
});

// Add chat message to a report
router.post('/reports/:id/chat', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sender = req.user.id; // Investigator ID
    
    if (!content) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Message content is required' 
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

// Mark chat messages as read
router.put('/reports/:id/chat/read', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const reader = req.user.id; // Investigator ID
    
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

// Get statistics
router.get('/statistics', verifyToken, async (req, res, next) => {
  try {
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Get reports of different statuses
    const pendingReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'pending');
    const underInvestigationReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'under_investigation');
    const completedReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'completed');
    
    const pendingReports = JSON.parse(pendingReportsBuffer.toString());
    const underInvestigationReports = JSON.parse(underInvestigationReportsBuffer.toString());
    const completedReports = JSON.parse(completedReportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    // Calculate statistics
    const totalReports = pendingReports.length + underInvestigationReports.length + completedReports.length;
    
    res.status(200).json({
      totalReports,
      byStatus: {
        pending: pendingReports.length,
        under_investigation: underInvestigationReports.length,
        completed: completedReports.length
      },
      byCriticality: {
        high: [...pendingReports, ...underInvestigationReports, ...completedReports].filter(r => r.criticality >= 4).length,
        medium: [...pendingReports, ...underInvestigationReports, ...completedReports].filter(r => r.criticality === 3).length,
        low: [...pendingReports, ...underInvestigationReports, ...completedReports].filter(r => r.criticality <= 2).length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
