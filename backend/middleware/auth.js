const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      userInfo: user
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware for optional authentication (for routes that work for both authenticated and anonymous users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      // No token provided, continue as anonymous user
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      // Check if user exists
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          userInfo: user
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      // Invalid token, continue as anonymous user
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

// Middleware to check if user has user role (regular user, not admin)
const requireUser = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('User authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

// Middleware to check if user owns the resource (for user-specific routes)
const checkResourceOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const resourceUserId = req.params[paramName] || req.body[paramName];
      
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // User can only access their own resources
      if (req.user.userId !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during resource ownership check.'
      });
    }
  };
};

// Rate limiting middleware (simple implementation)
const createRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const userKey = req.ip || 'anonymous';
    
    // Clean old entries
    for (const [key, data] of requests) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(key);
      }
    }

    // Check current user's requests
    const userRequests = requests.get(userKey);
    
    if (!userRequests) {
      requests.set(userKey, {
        count: 1,
        firstRequest: now
      });
      return next();
    }

    if (now - userRequests.firstRequest > windowMs) {
      // Reset window
      requests.set(userKey, {
        count: 1,
        firstRequest: now
      });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userRequests.firstRequest)) / 1000)
      });
    }

    userRequests.count++;
    next();
  };
};

// Specific rate limits for different endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 50); // 50 requests per 15 minutes for auth (increased for development/testing)
const chatRateLimit = createRateLimit(60 * 1000, 30); // 30 messages per minute for chat
const generalRateLimit = createRateLimit(15 * 60 * 1000, 200); // 200 requests per 15 minutes general

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireUser,
  checkResourceOwnership,
  authRateLimit,
  chatRateLimit,
  generalRateLimit
};