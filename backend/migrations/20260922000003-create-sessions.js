'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      sportId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sports',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      creatorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      additionalPlayersRequired: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'OPEN',
        allowNull: false,
      },
      cancellationReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      team1Name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Team 1',
      },
      team2Name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Team 2',
      },
      team1Players: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      team2Players: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Sessions');
  },
};
