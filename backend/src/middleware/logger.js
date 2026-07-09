const morgan = require('morgan');

/**
 * Request logging middleware using morgan.
 * In production, use 'combined' format; otherwise use 'dev'.
 */
const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  {
    skip: (req) => req.url === '/health',
  }
);

module.exports = requestLogger;
