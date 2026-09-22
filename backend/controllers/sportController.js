const { Sport } = require('../models');

/**
 * List all sports (authenticated users).
 * Optional query: ?activeOnly=true
 */
async function getSports(req, res, next) {
  try {
    const { activeOnly } = req.query;
    const where = {};
    if (activeOnly === 'true') {
      where.active = true;
    }

    const sports = await Sport.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return res.json({ sports });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new sport (ADMIN only).
 */
async function createSport(req, res, next) {
  try {
    const { name, description, active } = req.body;

    const existing = await Sport.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(409).json({
        error: 'Duplicate sport',
        message: `Sport "${name.trim()}" already exists.`,
      });
    }

    const sport = await Sport.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      active: active !== undefined ? Boolean(active) : true,
    });

    return res.status(201).json({
      message: 'Sport created successfully',
      sport,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing sport (ADMIN only).
 */
async function updateSport(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const sport = await Sport.findByPk(id);
    if (!sport) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sport not found',
      });
    }

    if (name && name.trim() !== sport.name) {
      const duplicate = await Sport.findOne({ where: { name: name.trim() } });
      if (duplicate && duplicate.id !== sport.id) {
        return res.status(409).json({
          error: 'Duplicate sport',
          message: `Another sport named "${name.trim()}" already exists.`,
        });
      }
      sport.name = name.trim();
    }

    if (description !== undefined) {
      sport.description = description ? description.trim() : null;
    }

    if (active !== undefined) {
      sport.active = Boolean(active);
    }

    await sport.save();

    return res.json({
      message: 'Sport updated successfully',
      sport,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single sport details.
 */
async function getSportById(req, res, next) {
  try {
    const { id } = req.params;
    const sport = await Sport.findByPk(id);
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }
    return res.json({ sport });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSports,
  createSport,
  updateSport,
  getSportById,
};
