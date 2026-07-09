const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'fitbuddy_dev_secret';

/**
 * Generate a JWT token for a given user.
 * @param {number} userId
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Authentication middleware.
 * Extracts and verifies JWT from the Authorization header (Bearer token).
 * On success, attaches `req.user` with `{ user_id }`.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return unauthorized(res, 'Token is empty');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { user_id: decoded.user_id };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired');
    }
    return unauthorized(res, 'Invalid token');
  }
};

/**
 * Optional authentication middleware.
 * Attaches `req.user` if a valid token is present, but does not block the request.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { user_id: decoded.user_id };
    } catch (_) {
      // ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = { generateToken, authenticate, optionalAuth };
