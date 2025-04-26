const express = require('express');
const jwt = require('jsonwebtoken');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');

const router = express.Router();

// Middleware to verify admin token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // In production, use a secure authentication system
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }
});

// Get all reports - with better parsing and filtering
router.get('/reports', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.query;
    
    // Connect to the network
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Get all reports
    const reportsBuffer = await contract.evaluateTransaction('getAllReports');
    
    // Parse the reports from the iterator result (this is a simplified version)
    const reportsData = reportsBuffer.toString();
    
    // Disconnect from the network
    await disconnectFromNetwork(gateway);
    
    res.status(200).json({ data: reportsData });
  } catch (error) {
    next(error);
  }
});

// Update report status (admin version)
router.put('/reports/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Bad request', message: 'Status is required' });
    }
    
    // Connect to the network
    const { gateway, contract } = await connectToNetwork('admin');
    
    // Update the report status
    const reportBuffer = await contract.submitTransaction(
      'updateReportStatus',
      id,
      status
    );
    
    const updatedReport = JSON.parse(reportBuffer.toString());
    
    // Disconnect from the network
    await disconnectFromNetwork(gateway);
    
    res.status(200).json(updatedReport);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Not found', message: `Report with ID ${req.params.id} not found` });
    }
    next(error);
  }
});

// Get statistics
router.get('/statistics', verifyToken, async (req, res, next) => {
  try {
    // This would be enhanced in a production system
    res.status(200).json({
      totalReports: 2,
      byStatus: {
        pending: 1,
        under_investigation: 1,
        resolved: 0,
        dismissed: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
