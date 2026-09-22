process.env.NODE_ENV = 'test';
process.env.USE_EMBEDDED_POSTGRES = 'true';
process.env.DB_LOGGING = 'false';

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Sport, Session, SessionParticipant } = require('../models');

let isInitialized = false;

/**
 * Reset test database records.
 */
async function resetDb() {
  if (!isInitialized) {
    await sequelize.sync();
    isInitialized = true;
  }
  await SessionParticipant.destroy({ where: {}, truncate: false });
  await Session.destroy({ where: {}, truncate: false });
  await Sport.destroy({ where: {}, truncate: false });
  await User.destroy({ where: {}, truncate: false });
}

/**
 * Creates an authenticated supertest agent session for testing.
 * Automatically acquires CSRF token, registers/logs in, and returns { agent, user, csrfToken }.
 */
async function createAuthenticatedSession(role = 'PLAYER', customEmail = null) {
  const agent = request.agent(app);

  // 1. Fetch CSRF token
  const csrfRes = await agent.get('/api/csrf-token');
  const csrfToken = csrfRes.body.csrfToken;

  // 2. Create and login user
  const email = customEmail || `${role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
  const password = 'TestPassword123!';
  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name: `${role} Test User`,
    email,
    passwordHash,
    role,
  });

  // 3. Authenticate via login endpoint
  const loginRes = await agent
    .post('/auth/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ email, password });

  if (loginRes.status !== 200) {
    throw new Error(`Failed to login test user: ${loginRes.body.message || loginRes.text}`);
  }

  // 4. Retrieve refreshed CSRF token for the authenticated session
  const freshCsrfRes = await agent.get('/api/csrf-token');
  const freshCsrfToken = freshCsrfRes.body.csrfToken;

  return {
    agent,
    user,
    csrfToken: freshCsrfToken,
    password,
  };
}

module.exports = {
  app,
  resetDb,
  createAuthenticatedSession,
  models: { User, Sport, Session, SessionParticipant },
};
