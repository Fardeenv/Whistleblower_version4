const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { connectToNetwork, disconnectFromNetwork } = require('../fabric/network');

const router = express.Router();

// Submit a new whistleblower report
router.post('/reports', async (req, res, next) => {
  try {
    const { title, description, submitter = 'anonymous' } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Title and description are required' 
      });
    }

    // Generate a unique ID for the report
    const id = uuidv4();
    // Get current date in YYYY-MM-DD format
    const date = new Date().toISOString().split('T')[0];

    // Connect to the network
    const { gateway, contract } = await connectToNetwork('admin');

    // Submit the transaction
    await contract.submitTransaction(
      'submitReport',
      id,
      title,
      description,
      submitter,
      date
    );

    // Disconnect from the network
    await disconnectFromNetwork(gateway);

    res.status(201).json({
      id,
      title,
      description,
      submitter,
      date,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
});

// Get a report by ID
router.get('/reports/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Connect to the network
    const { gateway, contract } = await connectToNetwork('admin');

    // Evaluate the transaction
    const reportBuffer = await contract.evaluateTransaction('queryReportById', id);
    const report = JSON.parse(reportBuffer.toString());

    // Disconnect from the network
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

// Update report status
router.put('/reports/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Status is required' 
      });
    }

    // Connect to the network
    const { gateway, contract } = await connectToNetwork('admin');

    // Submit the transaction
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
      return res.status(404).json({ 
        error: 'Not found', 
        message: `Report with ID ${req.params.id} not found` 
      });
    }
    next(error);
  }
});

module.exports = router;
