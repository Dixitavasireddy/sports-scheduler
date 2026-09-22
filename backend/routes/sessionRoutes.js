const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const participantController = require('../controllers/participantController');
const { requireAuth } = require('../middleware/auth');
const { validate, sessionCreateRules, sessionCancelRules } = require('../middleware/validation');

// Specific user session collections (must precede /:id)
router.get('/my/created', requireAuth, sessionController.getMyCreatedSessions);
router.get('/my/joined', requireAuth, sessionController.getMyJoinedSessions);

// General session listing & detail
router.get('/', requireAuth, sessionController.getSessions);
router.get('/:id', requireAuth, sessionController.getSessionById);

// Create session (both ADMIN and PLAYER)
router.post('/', requireAuth, sessionCreateRules, validate, sessionController.createSession);

// Cancel session (creator only)
router.post('/:id/cancel', requireAuth, sessionCancelRules, validate, sessionController.cancelSession);

// Join / Leave session
router.post('/:id/join', requireAuth, participantController.joinSession);
router.post('/:id/leave', requireAuth, participantController.leaveSession);

module.exports = router;
