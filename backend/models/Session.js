const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Session = sequelize.define(
    'Session',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sportId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Sports',
          key: 'id',
        },
      },
      creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          notEmpty: { msg: 'Scheduled date and time is required' },
        },
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Venue cannot be empty' },
          len: { args: [2, 255], msg: 'Venue must be between 2 and 255 characters' },
        },
        set(value) {
          if (value) {
            this.setDataValue('venue', value.trim());
          }
        },
      },
      additionalPlayersRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: { msg: 'Additional players must be an integer' },
          min: { args: [0], msg: 'Additional players required cannot be negative' },
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'OPEN',
        allowNull: false,
        validate: {
          isIn: {
            args: [['OPEN', 'FULL', 'COMPLETED', 'CANCELLED']],
            msg: 'Invalid session status',
          },
        },
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      team1Name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Team 1',
      },
      team2Name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Team 2',
      },
      team1Players: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      team2Players: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: 'Sessions',
      timestamps: true,
    }
  );

  return Session;
};
