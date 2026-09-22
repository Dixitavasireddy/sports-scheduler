/**
 * Centralized application error handling middleware.
 */
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';

  // Log error (safeguarding against logging passwords or secrets)
  if (!isProd && process.env.NODE_ENV !== 'test') {
    console.error('[Error Handler]', err);
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    return res.status(400).json({
      error: 'Database validation error',
      message: messages[0] || 'Invalid data submitted',
      details: messages,
    });
  }

  // Handle CSRF error
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      message: 'Form submission failed verification.',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
  };

  // Only attach stack in development
  if (!isProd && process.env.NODE_ENV !== 'test') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
