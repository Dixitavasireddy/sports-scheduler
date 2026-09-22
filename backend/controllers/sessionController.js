const { Op } = require('sequelize');
const { sequelize, Session, Sport, User, SessionParticipant } = require('../models');

// Helper to format session with capacity metrics
function formatSessionWithMetrics(sessionInstance) {
  const session = sessionInstance.toJSON ? sessionInstance.toJSON() : sessionInstance;
  const team1List = Array.isArray(session.team1Players) ? session.team1Players : [];
  const team2List = Array.isArray(session.team2Players) ? session.team2Players : [];
  const prefilledCount = team1List.length + team2List.length;
  const totalCapacity = 1 + prefilledCount + (session.additionalPlayersRequired || 0);
  const currentParticipants = (session.participants || []).length;
  const availableSlots = Math.max(0, 1 + (session.additionalPlayersRequired || 0) - currentParticipants);
  const isPast = new Date(session.scheduledAt) <= new Date();

  return {
    ...session,
    team1Players: team1List,
    team2Players: team2List,
    totalCapacity,
    currentParticipants,
    prefilledCount,
    availableSlots,
    isPast,
    isFull: availableSlots === 0 || session.status === 'FULL',
  };
}

/**
 * Create a new sports session.
 * Open to both ADMIN and PLAYER users.
 */
async function createSession(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const {
      sportId,
      scheduledAt,
      venue,
      additionalPlayersRequired = 0,
      team = 'Team 1',
      team1Name = 'Team 1',
      team2Name = 'Team 2',
      team1Players = [],
      team2Players = [],
    } = req.body;
    const creatorId = req.user.id;

    // Validate sport
    const sport = await Sport.findByPk(sportId, { transaction });
    if (!sport) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Invalid sport',
        message: 'The selected sport does not exist.',
      });
    }

    if (!sport.active) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Inactive sport',
        message: `Sport "${sport.name}" is currently inactive and cannot be scheduled.`,
      });
    }

    // Validate date in future
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid date/time',
        message: 'Session date and time must be set in the future.',
      });
    }

    // Schedule conflict check: Creator should not host or join another match at the exact same date & time
    const conflictingParticipation = await SessionParticipant.findOne({
      where: { userId: creatorId },
      include: [
        {
          model: Session,
          as: 'session',
          where: {
            status: { [Op.ne]: 'CANCELLED' },
            scheduledAt: scheduledDate,
          },
        },
      ],
      transaction,
    });

    if (conflictingParticipation) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Time conflict',
        message: 'Schedule conflict: You are already enrolled in or hosting another match at this exact date and time.',
      });
    }

    // Parse pre-filled player lists
    const parsePlayerList = (val) => {
      if (Array.isArray(val)) {
        return val.map((p) => String(p).trim()).filter(Boolean);
      }
      if (typeof val === 'string') {
        return val.split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
      }
      return [];
    };

    const parsedTeam1 = parsePlayerList(team1Players);
    const parsedTeam2 = parsePlayerList(team2Players);

    // Create session record
    const session = await Session.create(
      {
        sportId,
        creatorId,
        scheduledAt: scheduledDate,
        venue: venue.trim(),
        additionalPlayersRequired: parseInt(additionalPlayersRequired, 10) || 0,
        team1Name: team1Name.trim() || 'Team 1',
        team2Name: team2Name.trim() || 'Team 2',
        team1Players: parsedTeam1,
        team2Players: parsedTeam2,
        status: 'OPEN',
      },
      { transaction }
    );

    // Creator is automatically registered as the first participant
    await SessionParticipant.create(
      {
        sessionId: session.id,
        userId: creatorId,
        team: team && team.trim() ? team.trim() : (team1Name.trim() || 'Team 1'),
        joinedAt: new Date(),
      },
      { transaction }
    );

    // If additional players required is 0, session is already full
    if (session.additionalPlayersRequired === 0) {
      session.status = 'FULL';
      await session.save({ transaction });
    }

    await transaction.commit();

    // Fetch complete session details
    const fullSession = await Session.findByPk(session.id, {
      include: [
        { model: Sport, as: 'sport' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: SessionParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    return res.status(201).json({
      message: 'Session created successfully',
      session: formatSessionWithMetrics(fullSession),
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    next(err);
  }
}

/**
 * List all sessions with flexible filtering.
 */
async function getSessions(req, res, next) {
  try {
    const { sportId, status, futureOnly, search } = req.query;
    const where = {};

    if (sportId) {
      where.sportId = sportId;
    }

    if (status) {
      where.status = status;
    }

    if (futureOnly === 'true') {
      where.scheduledAt = { [Op.gt]: new Date() };
    }

    if (search) {
      where.venue = { [Op.iLike]: `%${search.trim()}%` };
    }

    const sessions = await Session.findAll({
      where,
      include: [
        { model: Sport, as: 'sport' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: SessionParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    // Check for past sessions that should be marked COMPLETED if not CANCELLED
    const now = new Date();
    for (const s of sessions) {
      if (new Date(s.scheduledAt) < now && s.status !== 'CANCELLED' && s.status !== 'COMPLETED') {
        s.status = 'COMPLETED';
        await s.save();
      }
    }

    const formatted = sessions.map(formatSessionWithMetrics);

    return res.json({ sessions: formatted });
  } catch (err) {
    next(err);
  }
}

/**
 * Get details for a single session.
 */
async function getSessionById(req, res, next) {
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id, {
      include: [
        { model: Sport, as: 'sport' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: SessionParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found.',
      });
    }

    // Auto-update to COMPLETED if past and not cancelled
    if (new Date(session.scheduledAt) < new Date() && session.status !== 'CANCELLED' && session.status !== 'COMPLETED') {
      session.status = 'COMPLETED';
      await session.save();
    }

    return res.json({ session: formatSessionWithMetrics(session) });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel a session (CREATOR ONLY).
 */
async function cancelSession(req, res, next) {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;

    const session = await Session.findByPk(id, {
      include: [
        { model: Sport, as: 'sport' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: SessionParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found.',
      });
    }

    // Authoritative check: Only creator or Administrator can cancel!
    const isAdmin = req.user.role === 'ADMIN';
    if (session.creatorId !== userId && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the session creator or an administrator can cancel this session.',
      });
    }

    if (session.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'Already cancelled',
        message: 'This session has already been cancelled.',
      });
    }

    session.status = 'CANCELLED';
    session.cancellationReason = cancellationReason.trim();
    await session.save();

    return res.json({
      message: 'Session cancelled successfully',
      session: formatSessionWithMetrics(session),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get sessions created by currently logged-in user.
 */
async function getMyCreatedSessions(req, res, next) {
  try {
    const userId = req.user.id;

    const sessions = await Session.findAll({
      where: { creatorId: userId },
      include: [
        { model: Sport, as: 'sport' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: SessionParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['scheduledAt', 'DESC']],
    });

    return res.json({ sessions: sessions.map(formatSessionWithMetrics) });
  } catch (err) {
    next(err);
  }
}

/**
 * Get sessions joined by currently logged-in user.
 */
async function getMyJoinedSessions(req, res, next) {
  try {
    const userId = req.user.id;

    const participations = await SessionParticipant.findAll({
      where: { userId },
      include: [
        {
          model: Session,
          as: 'session',
          include: [
            { model: Sport, as: 'sport' },
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            {
              model: SessionParticipant,
              as: 'participants',
              include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            },
          ],
        },
      ],
      order: [[{ model: Session, as: 'session' }, 'scheduledAt', 'DESC']],
    });

    const joinedSessions = participations.map((p) => {
      const formatted = formatSessionWithMetrics(p.session);
      return {
        ...formatted,
        myTeam: p.team,
        joinedAt: p.joinedAt,
      };
    });

    return res.json({ sessions: joinedSessions });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  cancelSession,
  getMyCreatedSessions,
  getMyJoinedSessions,
};
