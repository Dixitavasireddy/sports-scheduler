const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate, registerRules, loginRules, changePasswordRules } = require('../middleware/validation');

// Public registration endpoint
router.post('/register', registerRules, validate, authController.register);

// Authentication login endpoint
router.post('/login', loginRules, validate, authController.login);

// Session termination endpoint
router.post('/logout', authController.logout);

// Current session inspector endpoint
router.get('/me', authController.getMe);

// Change password endpoint (authenticated user)
router.put('/change-password', requireAuth, changePasswordRules, validate, authController.changePassword);

module.exports = router;
