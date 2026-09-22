require('dotenv').config();
const { sequelize, User, Sport, Session, SessionParticipant } = require('../models');

async function seed(options = {}) {
  console.log('[Seeder] Starting database seed...');
  if (options.sync !== false) {
    try {
      await sequelize.sync();
    } catch (e) {
      // Tables and indexes may already exist
    }
  }

  // Create or update Admin account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sportsscheduler.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const adminHash = await User.hashPassword(adminPassword);

  let admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'ADMIN',
    });
    console.log(`[Seeder] Created default admin: ${adminEmail} (password: ${adminPassword})`);
  } else {
    admin.role = 'ADMIN';
    admin.passwordHash = adminHash;
    await admin.save();
    console.log(`[Seeder] Updated existing admin account: ${adminEmail}`);
  }

  // Create demo Player account
  const playerEmail = 'alex@sportsscheduler.com';
  const playerPassword = 'PlayerPass123!';
  const playerHash = await User.hashPassword(playerPassword);

  let player = await User.findOne({ where: { email: playerEmail } });
  if (!player) {
    player = await User.create({
      name: 'Alex Morgan',
      email: playerEmail,
      passwordHash: playerHash,
      role: 'PLAYER',
    });
    console.log(`[Seeder] Created default player: ${playerEmail} (password: ${playerPassword})`);
  }

  // Seed default sports
  const defaultSports = [
    { name: 'Football', description: '5v5 and 11v11 pitch soccer matches with team kits', active: true },
    { name: 'Basketball', description: 'Half-court and full-court fast-paced basketball', active: true },
    { name: 'Tennis', description: 'Singles and doubles clay/hard court tennis', active: true },
    { name: 'Badminton', description: 'Indoor wooden court badminton rallies', active: true },
    { name: 'Cricket', description: 'T20 box and turf pitch cricket matches', active: true },
    { name: 'Volleyball', description: 'Indoor court and beach volleyball spikes', active: true },
    { name: 'Pickleball', description: 'Fast growing paddle sport on dedicated courts', active: true },
    { name: 'Squash', description: 'High intensity indoor wall racquet sport', active: false }, // Inactive example for testing
  ];

  for (const sportData of defaultSports) {
    let sport = await Sport.findOne({ where: { name: sportData.name } });
    if (!sport) {
      sport = await Sport.create(sportData);
      console.log(`[Seeder] Created sport: ${sport.name}`);
    }
  }

  // Create demo future sessions if none exist
  const existingSessions = await Session.count();
  if (existingSessions === 0) {
    const football = await Sport.findOne({ where: { name: 'Football' } });
    const basketball = await Sport.findOne({ where: { name: 'Basketball' } });
    const tennis = await Sport.findOne({ where: { name: 'Tennis' } });

    if (football && basketball) {
      // Session 1: Open upcoming football session
      const sess1 = await Session.create({
        sportId: football.id,
        creatorId: admin.id,
        scheduledAt: new Date(Date.now() + 2 * 86400000), // in 2 days
        venue: 'Metro Turf Arena, Court 1',
        additionalPlayersRequired: 4,
        status: 'OPEN',
      });
      await SessionParticipant.create({
        sessionId: sess1.id,
        userId: admin.id,
        team: 'Team Red',
      });

      // Session 2: Basketball session with 2 spots
      const sess2 = await Session.create({
        sportId: basketball.id,
        creatorId: player.id,
        scheduledAt: new Date(Date.now() + 3 * 86400000), // in 3 days
        venue: 'Downtown YMCA Court B',
        additionalPlayersRequired: 3,
        status: 'OPEN',
      });
      await SessionParticipant.create({
        sessionId: sess2.id,
        userId: player.id,
        team: 'Team Blue',
      });

      // Session 3: Completed match in the past
      if (tennis) {
        const sess3 = await Session.create({
          sportId: tennis.id,
          creatorId: admin.id,
          scheduledAt: new Date(Date.now() - 5 * 86400000), // 5 days ago
          venue: 'Grand Slam Tennis Center, Court 4',
          additionalPlayersRequired: 1,
          status: 'COMPLETED',
        });
        await SessionParticipant.create({
          sessionId: sess3.id,
          userId: admin.id,
          team: 'Team A',
        });
        await SessionParticipant.create({
          sessionId: sess3.id,
          userId: player.id,
          team: 'Team B',
        });
      }

      console.log('[Seeder] Created initial demo sessions and participants.');
    }
  }

  console.log('[Seeder] Database seeding completed successfully.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seeder] Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = seed;
