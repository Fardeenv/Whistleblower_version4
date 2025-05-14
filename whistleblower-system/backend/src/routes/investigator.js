const express = require('express');
const { generateToken } = require('../services/auth');
const { authenticate, authorize } = require('../services/auth');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');
const { processReward } = require('../services/crypto');
const { getRewardBalance, deductReward } = require('../services/reward');
const router = express.Router();

// Hard-coded users (in a real-world scenario, use a database)
const users = {
  investigators: {
    'investigator1': { password: 'securepass1', name: 'John Investigator', role: 'investigator' },
    'investigator2': { password: 'securepass2', name: 'Jane Investigator', role: 'investigator' }
  },
  management: {
    'manager1': { password: 'managerpass1', name: 'Alex Manager', role: 'management' },
    'manager2': { password: 'managerpass2', name: 'Sam Manager', role: 'management' }
  }
};

// Login for investigators and management
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if user exists in investigators
  if (users.investigators[username] && users.investigators[username].password === password) {
    const token = generateToken({ 
      id: username, 
      name: users.investigators[username].name,
      role: 'investigator'
    });
    
    return res.json({ 
      token,
      user: {
        id: username,
        name: users.investigators[username].name,
        role: 'investigator'
      }
    });
  }
  
  // Check if user exists in management
  if (users.management[username] && users.management[username].password === password) {
    const token = generateToken({ 
      id: username, 
      name: users.management[username].name,
      role: 'management'
    });
    
    return res.json({ 
      token,
      user: {
        id: username,
        name: users.management[username].name,
        role: 'management'
      }
    });
  }
  
  // Neither investigator nor management
  res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
});

// Get current reward balance (management only)
router.get('/reward-balance', authenticate, authorize(['management']), (req, res) => {
  try {
    const balance = getRewardBalance();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Get reports by status with criticality sorting - both roles
router.get('/reports', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
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

// Get unassigned reports - both roles
router.get('/reports/unassigned', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
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

// Get reports assigned to a specific investigator - investigator only
router.get('/my-reports', authenticate, authorize(['investigator']), async (req, res, next) => {
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

// Get a specific report - both roles
router.get('/reports/:id', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
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

// Assign a report to investigator - investigator only
router.post('/reports/:id/investigate', authenticate, authorize(['investigator']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const investigatorId = req.user.id;
    const investigatorName = req.user.name;
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'assignReport',
      id,
      investigatorId,
      investigatorName
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'under_investigation',
        assignedTo: investigatorId,
        assignedToName: investigatorName
      });
    }
    
    res.status(200).json(updatedReport);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('not eligible')) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You are not eligible to investigate this reopened report' 
      });
    }
    next(error);
  }
});

// Add management summary - investigator only
router.post('/reports/:id/management-summary', authenticate, authorize(['investigator']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;
    const investigatorId = req.user.id;
    
    if (!summary || summary.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Summary is required' 
      });
    }
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'addManagementSummary',
      id,
      investigatorId,
      summary
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(updatedReport);
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
    }
    next(error);
  }
});

// Complete investigation - investigator only
router.post('/reports/:id/complete', authenticate, authorize(['investigator']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const investigatorId = req.user.id;
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    // First get the report to check if management summary exists
    const reportBuffer = await contract.evaluateTransaction('queryReportById', id);
    const report = JSON.parse(reportBuffer.toString());
    
    // Check if management summary exists
    if (!report.managementSummary || report.managementSummary.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'You must add a management summary before completing the investigation' 
      });
    }
    
    // Complete the investigation
    const updatedReportBuffer = await contract.submitTransaction(
      'completeInvestigation',
      id,
      investigatorId
    );
    
    const updatedReport = JSON.parse(updatedReportBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'investigation_complete'
      });
    }
    
    res.status(200).json(updatedReport);
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
    } else if (error.message.includes('MANAGEMENT_SUMMARY_REQUIRED')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Management summary is required to complete investigation' 
      });
    }
    next(error);
  }
});

// Permanently close case - management only
router.post('/reports/:id/permanently-close', authenticate, authorize(['management']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { closureSummary } = req.body;
    const managementId = req.user.id;
    
    if (!closureSummary || closureSummary.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Closure summary is required' 
      });
    }
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Permanently close the case
    const updatedReportBuffer = await contract.submitTransaction(
      'permanentlyCloseCase',
      id,
      managementId,
      closureSummary
    );
    
    const updatedReport = JSON.parse(updatedReportBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'completed',
        permanentlyClosed: true
      });
    }
    
    res.status(200).json(updatedReport);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
     } else if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('already permanently closed')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is already permanently closed' 
      });
    } else if (error.message.includes('not in investigation_complete state')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is not in investigation_complete state' 
      });
    }
    next(error);
  }
});

// Process reward - management only
router.post('/reports/:id/process-reward', authenticate, authorize(['management']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rewardNote, rewardAmount } = req.body;
    const managementId = req.user.id;
    
    if (!rewardNote || rewardNote.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Reward note is required' 
      });
    }
    
    if (!rewardAmount || isNaN(rewardAmount) || rewardAmount <= 0) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Valid reward amount is required' 
      });
    }
    
    // Check if we have enough balance
    const currentBalance = getRewardBalance();
    if (rewardAmount > currentBalance) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: `Insufficient reward balance. Current balance: ${currentBalance}` 
      });
    }
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Process the reward
    const updatedReportBuffer = await contract.submitTransaction(
      'processReward',
      id,
      managementId,
      rewardNote,
      rewardAmount.toString()
    );
    
    const updatedReport = JSON.parse(updatedReportBuffer.toString());
    
    // Deduct the reward from balance
    deductReward(rewardAmount);
    
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about reward
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('reward_processed', {
        reportId: id,
        rewardNote,
        rewardAmount,
        rewardProcessed: true
      });
    }
    
    res.status(200).json({
      ...updatedReport,
      currentBalance: getRewardBalance()
    });
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('not permanently closed')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is not permanently closed' 
      });
    } else if (error.message.includes('does not have a reward wallet')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report does not have a reward wallet' 
      });
    } else if (error.message.includes('already processed')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Reward is already processed' 
      });
    } else if (error.message.includes('Invalid reward amount') || error.message.includes('Insufficient reward balance')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: error.message 
      });
    }
    next(error);
  }
});

// Reopen investigation - management only
router.post('/reports/:id/reopen', authenticate, authorize(['management']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Reason for reopening is required' 
      });
    }
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'reopenInvestigation',
      id,
      reason
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'pending',
        isReopened: true,
        reason: reason
      });
    }
    
    res.status(200).json(updatedReport);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('not in a completed state')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is not in a completed state and cannot be reopened' 
      });
    } else if (error.message.includes('permanently closed')) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Report is permanently closed and cannot be reopened' 
      });
    }
    next(error);
  }
});

// Add chat message to a report - both roles
router.post('/reports/:id/chat', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sender = req.user.id; // User ID
    
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

// Mark chat messages as read - both roles
router.put('/reports/:id/chat/read', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const reader = req.user.id; // User ID
    
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

// Get statistics - both roles
router.get('/statistics', authenticate, authorize(['investigator', 'management']), async (req, res, next) => {
  try {
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Get reports of different statuses
    const pendingReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'pending');
    const underInvestigationReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'under_investigation');
    const investigationCompleteReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'investigation_complete');  
    const completedReportsBuffer = await contract.evaluateTransaction('getReportsByStatus', 'completed');
    
    const pendingReports = JSON.parse(pendingReportsBuffer.toString());
    const underInvestigationReports = JSON.parse(underInvestigationReportsBuffer.toString());
    const investigationCompleteReports = JSON.parse(investigationCompleteReportsBuffer.toString());
    const completedReports = JSON.parse(completedReportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    // Calculate statistics
    const totalReports = pendingReports.length + underInvestigationReports.length + 
                        investigationCompleteReports.length + completedReports.length;
    
    let stats = {
      totalReports,
      byStatus: {
        pending: pendingReports.length,
        under_investigation: underInvestigationReports.length,
        investigation_complete: investigationCompleteReports.length,
        completed: completedReports.length
      },
      byCriticality: {
        high: [...pendingReports, ...underInvestigationReports, ...investigationCompleteReports, ...completedReports]
              .filter(r => r.criticality >= 4).length,
        medium: [...pendingReports, ...underInvestigationReports, ...investigationCompleteReports, ...completedReports]
              .filter(r => r.criticality === 3).length,
        low: [...pendingReports, ...underInvestigationReports, ...investigationCompleteReports, ...completedReports]
              .filter(r => r.criticality <= 2).length
      }
    };
    
    // Add reward balance for management
    if (req.user.role === 'management') {
      stats.rewardBalance = getRewardBalance();
    }
    
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
