const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorization');

// Admin-only reports route
router.get('/sessions', requireAuth, requireAdmin, reportController.getSessionReports);

module.exports = router;
