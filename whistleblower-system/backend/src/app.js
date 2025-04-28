const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const whistleblowerRoutes = require('./routes/whistleblower');
const investigatorRoutes = require('./routes/investigator');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define routes
app.use('/api/whistleblower', whistleblowerRoutes);
app.use('/api/investigator', investigatorRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'up' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
  });
});

module.exports = app;
