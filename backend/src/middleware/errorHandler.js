const { serverError } = require('../utils/response');

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a standard JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message || err);

  // Handle specific known error types
  if (err.code === '23505') {
    // PostgreSQL unique violation
    return res.status(409).json({
      code: 409,
      data: null,
      message: 'Duplicate entry, resource already exists',
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      code: 400,
      data: null,
      message: 'Referenced resource does not exist',
    });
  }

  if (err.code === '23502') {
    // PostgreSQL not null violation
    return res.status(400).json({
      code: 400,
      data: null,
      message: 'Required field is missing',
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      code: 400,
      data: null,
      message: 'Invalid JSON in request body',
    });
  }

  return serverError(res, process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error');
};

module.exports = errorHandler;
