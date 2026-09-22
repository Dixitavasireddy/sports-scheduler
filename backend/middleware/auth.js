/**
 * Authentication check middleware.
 * Ensures the user has an active, authenticated session.
 */
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({
    error: 'Authentication required. Please log in to continue.',
  });
}

module.exports = {
  requireAuth,
};
