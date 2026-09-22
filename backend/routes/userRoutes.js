const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

// List players in the system (for scheduling team members)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });
    return res.json({ users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
