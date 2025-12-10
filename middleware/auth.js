const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Invalid authentication token'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token',
      message: 'Please authenticate with a valid token'
    });
  }
};

/**
 * Admin authentication middleware
 * Requires user to have admin role
 */
const adminAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  
  next();
};

/**
 * Verified user middleware
 * Requires user to be verified
 */
const verifiedUser = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Verification required',
      message: 'Please verify your account to access this resource'
    });
  }
  
  next();
};

module.exports = { auth, adminAuth, verifiedUser };
