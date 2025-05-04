const jwt = require('jsonwebtoken');

// Middleware for investigator authentication
const verifyInvestigator = (req, res, next) => {
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

// Middleware for management authentication
const verifyManager = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if the user has management role
    if (decoded.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

// Middleware for both investigator and management roles
const verifyStaff = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if the user has either investigator or manager role
    if (decoded.role !== 'investigator' && decoded.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

module.exports = {
  verifyInvestigator,
  verifyManager,
  verifyStaff
};
