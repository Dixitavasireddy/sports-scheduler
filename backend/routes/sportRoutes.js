const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorization');
const { validate, sportRules } = require('../middleware/validation');

// Authenticated users can browse sports
router.get('/', requireAuth, sportController.getSports);
router.get('/:id', requireAuth, sportController.getSportById);

// Admin-only endpoints to manage sports
router.post('/', requireAuth, requireAdmin, sportRules, validate, sportController.createSport);
router.put('/:id', requireAuth, requireAdmin, sportRules, validate, sportController.updateSport);

module.exports = router;
