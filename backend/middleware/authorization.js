/**
 * Authorization middleware for Role-Based Access Control (RBAC).
 */

// Require ADMIN role
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access forbidden: Administrator privileges required.',
    });
  }

  return next();
}

// Require PLAYER (Admins also allowed to perform all player functions)
function requirePlayer(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in.',
    });
  }

  if (req.user.role !== 'PLAYER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access forbidden: Player access required.',
    });
  }

  return next();
}

module.exports = {
  requireAdmin,
  requirePlayer,
};
