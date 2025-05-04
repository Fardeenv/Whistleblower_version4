const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');
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
    
    // Check if the user has management role
    if (decoded.role !== 'management') {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Login for management
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // In a real application, you would check against a database
  // For this example, we'll use a simple hardcoded check
  const managers = {
    'manager1': { password: 'mgmtpass1', name: 'John Manager' },
    'manager2': { password: 'mgmtpass2', name: 'Jane Manager' }
  };
  
  if (managers[username] && managers[username].password === password) {
    const token = jwt.sign({ 
      username, 
      role: 'management',
      name: managers[username].name,
      id: username
    }, process.env.JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ 
      token,
      user: {
        id: username,
        name: managers[username].name,
        role: 'management'
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }
});

// Get all reports (with complete details)
router.get('/reports', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.query;
    const { gateway, contract } = await connectToNetwork('admin');
    
    let reportsBuffer;
    if (status) {
      reportsBuffer = await contract.evaluateTransaction('getReportsByStatus', status);
    } else {
      const allReportsBuffer = await contract.evaluateTransaction('getAllReports');
      reportsBuffer = allReportsBuffer;
    }
    
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

// Reopen an investigation
router.post('/reports/:id/reopen', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reopenReason } = req.body;
    const managerId = req.user.id;
    
    if (!reopenReason) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Reopen reason is required'
      });
    }
    
    const { gateway, contract } = await connectToNetwork('admin');
    
    const reportBuffer = await contract.submitTransaction(
      'reopenInvestigation',
      id,
      managerId,
      reopenReason
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    await disconnectFromNetwork(gateway);
    
    // Notify connected clients about status change
    const io = req.app.get('io');
    if (io) {
      io.to(`report_${id}`).emit('report_status_changed', {
        reportId: id,
        status: 'pending',
        reopenReason
      });
    }
    
    res.status(200).json(updatedReport);
  } catch (error) {
     if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    } else if (error.message.includes('not completed')) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Only completed investigations can be reopened'
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
    
    // Get all investigators who have reports assigned
    const investigators = {};
    for (const report of underInvestigationReports) {
      if (report.assignedTo && report.assignedName) {
        if (!investigators[report.assignedTo]) {
          investigators[report.assignedTo] = {
            id: report.assignedTo,
            name: report.assignedName,
            activeReports: 0,
            completedReports: 0
          };
        }
        investigators[report.assignedTo].activeReports++;
      }
    }
    
    for (const report of completedReports) {
      if (report.assignedTo && report.assignedName) {
        if (!investigators[report.assignedTo]) {
          investigators[report.assignedTo] = {
            id: report.assignedTo,
            name: report.assignedName,
            activeReports: 0,
            completedReports: 0
          };
        }
        investigators[report.assignedTo].completedReports++;
      }
    }
    
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
      },
      investigators: Object.values(investigators)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
