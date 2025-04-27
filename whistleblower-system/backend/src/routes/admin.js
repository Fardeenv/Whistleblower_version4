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
    
    // Admin role check
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ 
      username, 
      role: 'admin'
    }, process.env.JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ 
      token,
      user: {
        username,
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }
});

// Get all reports
router.get('/reports', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.query;
    const { gateway, contract } = await connectToNetwork('admin');
    
    let reportsBuffer;
    if (status) {
      reportsBuffer = await contract.evaluateTransaction('getReportsByStatus', status);
    } else {
      reportsBuffer = await contract.evaluateTransaction('getAllReports');
    }
    
    const reports = JSON.parse(reportsBuffer.toString());
    
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(reports);
  } catch (error) {
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
