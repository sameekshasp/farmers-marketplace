const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Farmer-specific middleware
const requireFarmer = authorizeRoles('farmer', 'admin');

// Admin-specific middleware
const requireAdmin = authorizeRoles('admin');

// Buyer or Farmer middleware
const requireBuyerOrFarmer = authorizeRoles('buyer', 'farmer', 'admin');

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireFarmer,
  requireAdmin,
  requireBuyerOrFarmer
};
