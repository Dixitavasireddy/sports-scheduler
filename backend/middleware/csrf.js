const crypto = require('crypto');

/**
 * Robust CSRF protection middleware for session-authenticated state changes.
 */
function csrfProtection(req, res, next) {
  // Ensure session exists
  if (!req.session) {
    return res.status(500).json({ error: 'Session not initialized for CSRF protection' });
  }

  // Generate a CSRF token if one does not exist for this session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // Send cookie for clients that read XSRF-TOKEN
    res.cookie('XSRF-TOKEN', req.session.csrfToken, {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
    });
    return next();
  }

  // Mutating HTTP methods: POST, PUT, PATCH, DELETE
  const clientToken =
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    (req.body && req.body._csrf);

  if (!clientToken) {
    return res.status(403).json({
      error: 'CSRF token missing. Please include X-CSRF-Token header.',
      code: 'EBADCSRFTOKEN',
    });
  }

  if (clientToken !== req.session.csrfToken) {
    return res.status(403).json({
      error: 'Invalid CSRF token. Request rejected.',
      code: 'EBADCSRFTOKEN',
    });
  }

  return next();
}

/**
 * Controller endpoint to retrieve current CSRF token.
 */
function getCsrfToken(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return res.json({ csrfToken: req.session.csrfToken });
}

module.exports = {
  csrfProtection,
  getCsrfToken,
};
