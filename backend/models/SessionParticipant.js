const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionParticipant = sequelize.define(
    'SessionParticipant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      team: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Team A',
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'SessionParticipants',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['sessionId', 'userId'],
          name: 'unique_session_user_participation',
        },
      ],
    }
  );

  return SessionParticipant;
};
