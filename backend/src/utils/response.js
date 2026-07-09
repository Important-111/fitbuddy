/**
 * Standard JSON response helpers.
 * All responses follow: { code: 0, data: ..., message: "ok" }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {any} data - Response payload
 * @param {string} [message='ok']
 * @param {number} [statusCode=200]
 */
const success = (res, data = null, message = 'ok', statusCode = 200) => {
  return res.status(statusCode).json({ code: 0, data, message });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message - Error description
 * @param {number} [statusCode=400]
 * @param {any} [errors] - Optional validation error details
 */
const error = (res, message, statusCode = 400, errors = null) => {
  const body = { code: statusCode, data: null, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Send a 401 unauthorized response.
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({ code: 401, data: null, message });
};

/**
 * Send a 403 forbidden response.
 */
const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({ code: 403, data: null, message });
};

/**
 * Send a 404 not found response.
 */
const notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({ code: 404, data: null, message });
};

/**
 * Send a 500 internal server error response.
 */
const serverError = (res, message = 'Internal server error') => {
  return res.status(500).json({ code: 500, data: null, message });
};

module.exports = { success, error, unauthorized, forbidden, notFound, serverError };
