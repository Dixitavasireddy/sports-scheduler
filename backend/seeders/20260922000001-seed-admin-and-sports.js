'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPass = await bcrypt.hash('AdminPass123!', 10);
    const playerPass = await bcrypt.hash('PlayerPass123!', 10);
    const now = new Date();

    const adminId = uuidv4();
    const playerId = uuidv4();

    await queryInterface.bulkInsert('Users', [
      {
        id: adminId,
        name: 'System Administrator',
        email: 'admin@sportsscheduler.com',
        passwordHash: adminPass,
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: playerId,
        name: 'Alex Morgan',
        email: 'alex@sportsscheduler.com',
        passwordHash: playerPass,
        role: 'PLAYER',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const sports = [
      { id: uuidv4(), name: 'Football', description: '5v5 and 11v11 pitch soccer matches', active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Basketball', description: 'Half-court and full-court basketball', active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Tennis', description: 'Singles and doubles tennis', active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Badminton', description: 'Indoor wooden court badminton', active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Cricket', description: 'T20 box and turf pitch cricket', active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Volleyball', description: 'Indoor court and beach volleyball', active: true, createdAt: now, updatedAt: now },
    ];

    await queryInterface.bulkInsert('Sports', sports);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Sports', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
