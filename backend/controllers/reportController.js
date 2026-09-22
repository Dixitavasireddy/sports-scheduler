const { Op } = require('sequelize');
const { Session, Sport, SessionParticipant, User } = require('../models');

/**
 * Generate dynamic reports for administrators.
 * Endpoint: GET /api/reports/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
async function getSessionReports(req, res, next) {
  try {
    const { from, to } = req.query;

    let fromDate;
    let toDate;

    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date',
          message: 'The "from" date parameter is invalid. Please use YYYY-MM-DD format.',
        });
      }
    } else {
      // Default to 30 days ago
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      fromDate.setHours(0, 0, 0, 0);
    }

    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date',
          message: 'The "to" date parameter is invalid. Please use YYYY-MM-DD format.',
        });
      }
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
    } else {
      // Default to end of current day
      toDate = new Date();
      toDate.setHours(23, 59, 59, 999);
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'The "from" date cannot be after the "to" date.',
      });
    }

    // Query all sessions in range
    const sessions = await Session.findAll({
      where: {
        scheduledAt: {
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
        },
      },
      include: [
        { model: Sport, as: 'sport' },
        { model: SessionParticipant, as: 'participants' },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    const now = new Date();

    // Calculate metrics
    let totalSessions = sessions.length;
    let totalPlayed = 0;
    let totalCancelled = 0;
    let totalUpcoming = 0;
    let totalParticipantsInPlayed = 0;

    const sportCounts = {};
    const statusCounts = {
      COMPLETED: 0,
      OPEN: 0,
      FULL: 0,
      CANCELLED: 0,
    };

    sessions.forEach((s) => {
      const isCancelled = s.status === 'CANCELLED';
      const isPast = new Date(s.scheduledAt) <= now;
      const isPlayed = !isCancelled && (s.status === 'COMPLETED' || isPast);

      // Status breakdown
      if (isCancelled) {
        statusCounts.CANCELLED += 1;
        totalCancelled += 1;
      } else if (isPlayed) {
        statusCounts.COMPLETED += 1;
        totalPlayed += 1;
        totalParticipantsInPlayed += (s.participants || []).length;

        // Sport popularity (played sessions only)
        const sportName = s.sport ? s.sport.name : 'Unknown';
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      } else if (s.status === 'FULL') {
        statusCounts.FULL += 1;
        totalUpcoming += 1;
      } else {
        statusCounts.OPEN += 1;
        totalUpcoming += 1;
      }
    });

    // Format sport popularity as an array with percentages
    const sportPopularity = Object.keys(sportCounts)
      .map((sportName) => {
        const count = sportCounts[sportName];
        const percentage = totalPlayed > 0 ? parseFloat(((count / totalPlayed) * 100).toFixed(1)) : 0;
        return {
          sport: sportName,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);

    return res.json({
      report: {
        dateRange: {
          from: fromDate.toISOString().split('T')[0],
          to: toDate.toISOString().split('T')[0],
        },
        summary: {
          totalSessions,
          totalPlayed,
          totalCancelled,
          totalUpcoming,
          totalParticipantsInPlayed,
          averagePlayersPerPlayedSession:
            totalPlayed > 0 ? parseFloat((totalParticipantsInPlayed / totalPlayed).toFixed(1)) : 0,
        },
        statusBreakdown: statusCounts,
        sportPopularity,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSessionReports,
};
