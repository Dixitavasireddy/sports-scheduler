const { sequelize } = require('../config/database');

const UserModel = require('./User');
const SportModel = require('./Sport');
const SessionModel = require('./Session');
const SessionParticipantModel = require('./SessionParticipant');

const User = UserModel(sequelize);
const Sport = SportModel(sequelize);
const Session = SessionModel(sequelize);
const SessionParticipant = SessionParticipantModel(sequelize);

// User <-> Session (Creator relationship)
User.hasMany(Session, { foreignKey: 'creatorId', as: 'createdSessions' });
Session.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Sport <-> Session
Sport.hasMany(Session, { foreignKey: 'sportId', as: 'sessions' });
Session.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });

// Session <-> SessionParticipant
Session.hasMany(SessionParticipant, {
  foreignKey: 'sessionId',
  as: 'participants',
  onDelete: 'CASCADE',
});
SessionParticipant.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });

// User <-> SessionParticipant
User.hasMany(SessionParticipant, {
  foreignKey: 'userId',
  as: 'participations',
  onDelete: 'CASCADE',
});
SessionParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Many-to-Many: User <-> Session through SessionParticipant
User.belongsToMany(Session, {
  through: SessionParticipant,
  foreignKey: 'userId',
  otherKey: 'sessionId',
  as: 'joinedSessions',
});
Session.belongsToMany(User, {
  through: SessionParticipant,
  foreignKey: 'sessionId',
  otherKey: 'userId',
  as: 'players',
});

module.exports = {
  sequelize,
  User,
  Sport,
  Session,
  SessionParticipant,
};
