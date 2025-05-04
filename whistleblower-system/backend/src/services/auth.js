const jwt = require('jsonwebtoken');

/**
 * Generate authentication token for users
 * @param {Object} user - User data including id, role, name
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const tokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role 
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Allowed roles
 * @returns {Function} - Middleware function
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize
};
