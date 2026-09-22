'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SessionParticipants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      sessionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      team: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Team A',
      },
      joinedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
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

    await queryInterface.addIndex('SessionParticipants', ['sessionId', 'userId'], {
      unique: true,
      name: 'unique_session_user_participation',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('SessionParticipants');
  },
};
