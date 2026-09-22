const { Op } = require('sequelize');
const { sequelize, Session, SessionParticipant, User, Sport } = require('../models');

/**
 * Join a sports session.
 * Enforces transaction safety, capacity limits, date validation, and duplicate prevention.
 */
async function joinSession(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { team } = req.body;

    // Fetch session with transaction
    const session = await Session.findByPk(id, { transaction });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found.',
      });
    }

    // Check cancellation
    if (session.status === 'CANCELLED') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Cannot join a cancelled session.',
      });
    }

    // Check past date/time
    const sessionDate = new Date(session.scheduledAt);
    if (sessionDate <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Cannot join a session that has already passed.',
      });
    }

    // Check if user is already a participant in THIS session
    const existingParticipation = await SessionParticipant.findOne({
      where: { sessionId: id, userId },
      transaction,
    });

    if (existingParticipation) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Already joined',
        message: 'You are already registered as a participant in this session.',
      });
    }

    // Schedule conflict check: User cannot join another match at the exact same date & time
    const conflictingParticipation = await SessionParticipant.findOne({
      where: { userId },
      include: [
        {
          model: Session,
          as: 'session',
          where: {
            id: { [Op.ne]: id },
            status: { [Op.ne]: 'CANCELLED' },
            scheduledAt: session.scheduledAt,
          },
        },
      ],
      transaction,
    });

    if (conflictingParticipation) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Time conflict',
        message: 'Schedule conflict: You are already enrolled in another match at this exact date and time.',
      });
    }

    // Check capacity
    const currentCount = await SessionParticipant.count({
      where: { sessionId: id },
      transaction,
    });

    const totalCapacity = 1 + session.additionalPlayersRequired;

    if (currentCount >= totalCapacity || session.status === 'FULL') {
      session.status = 'FULL';
      await session.save({ transaction });
      await transaction.rollback();
      return res.status(400).json({
        error: 'Session full',
        message: 'This session has already reached maximum capacity.',
      });
    }

    // Default team assignment if not specified
    const assignedTeam = team && team.trim() ? team.trim() : currentCount % 2 === 0 ? 'Team A' : 'Team B';

    // Create participant entry
    const participant = await SessionParticipant.create(
      {
        sessionId: id,
        userId,
        team: assignedTeam,
        joinedAt: new Date(),
      },
      { transaction }
    );

    // Update session status to FULL if capacity is now reached
    if (currentCount + 1 >= totalCapacity) {
      session.status = 'FULL';
      await session.save({ transaction });
    }

    await transaction.commit();

    // Fetch updated session with all participants and sport
    const updatedSession = await Session.findByPk(id, {
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

    return res.status(200).json({
      message: 'Successfully joined the session!',
      session: updatedSession,
      participant,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    // Handle unique constraint violation gracefully
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Already joined',
        message: 'You are already registered for this session.',
      });
    }
    next(err);
  }
}

/**
 * Leave a sports session (if not creator, not cancelled, and not past).
 */
async function leaveSession(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await Session.findByPk(id, { transaction });
    if (!session) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.creatorId === userId) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Cannot leave',
        message: 'As the creator, you cannot leave your own session. You may cancel it instead.',
      });
    }

    if (session.status === 'CANCELLED') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Session is already cancelled.' });
    }

    const sessionDate = new Date(session.scheduledAt);
    if (sessionDate <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cannot leave a session that has already taken place.' });
    }

    const participant = await SessionParticipant.findOne({
      where: { sessionId: id, userId },
      transaction,
    });

    if (!participant) {
      await transaction.rollback();
      return res.status(404).json({ error: 'You are not enrolled in this session.' });
    }

    await participant.destroy({ transaction });

    // If session was FULL, reopen it
    if (session.status === 'FULL') {
      session.status = 'OPEN';
      await session.save({ transaction });
    }

    await transaction.commit();

    return res.json({
      message: 'Successfully left the session.',
      sessionId: id,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    next(err);
  }
}

module.exports = {
  joinSession,
  leaveSession,
};
