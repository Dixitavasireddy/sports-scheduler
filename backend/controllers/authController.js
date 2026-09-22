const passport = require('passport');
const { User } = require('../models');

/**
 * Register a new player account.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if email already registered
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'PLAYER',
    });

    // Automatically establish session upon registration
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({
        message: 'Account registered successfully',
        user: user.toJSON(),
      });
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate existing user via Passport LocalStrategy.
 */
function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: info?.message || 'Invalid email or password',
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({
        message: 'Logged in successfully',
        user: user.toJSON(),
      });
    });
  })(req, res, next);
}

/**
 * Terminate user session.
 */
function logout(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.json({ message: 'Already logged out' });
  }

  req.logout((err) => {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie('sports_scheduler_sid');
        return res.json({ message: 'Logged out successfully' });
      });
    } else {
      return res.json({ message: 'Logged out successfully' });
    }
  });
}

/**
 * Get current session user.
 */
function getMe(req, res) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return res.json({ user: req.user.toJSON ? req.user.toJSON() : req.user });
  }
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'No active session found.',
  });
}

/**
 * Change account password (authenticated user).
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.validPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Current password does not match our records.',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return res.json({
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
};
