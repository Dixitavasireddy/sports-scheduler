const request = require('supertest');
const { app, resetDb, createAuthenticatedSession, models } = require('./setup');
const { Sport } = models;

describe('Role-Based Authorization (RBAC)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('should reject unauthenticated requests to protected endpoints with 401', async () => {
    const unauthenticatedAgent = request(app);

    const sportsRes = await unauthenticatedAgent.get('/api/sports');
    expect(sportsRes.status).toBe(401);

    const sessionsRes = await unauthenticatedAgent.get('/api/sessions');
    expect(sessionsRes.status).toBe(401);
  });

  it('should prevent standard PLAYER users from accessing ADMIN-only endpoints with 403', async () => {
    const { agent, csrfToken } = await createAuthenticatedSession('PLAYER');

    // 1. Attempt creating a sport as a player
    const createSportRes = await agent
      .post('/api/sports')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Unauthorized Sport', description: 'Testing RBAC' });

    expect(createSportRes.status).toBe(403);
    expect(createSportRes.body.error).toMatch(/Administrator privileges required/i);

    // 2. Attempt updating a sport as a player
    const sport = await Sport.create({ name: 'Soccer' });
    const updateSportRes = await agent
      .put(`/api/sports/${sport.id}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Hacked Soccer' });

    expect(updateSportRes.status).toBe(403);

    // 3. Attempt accessing admin reports
    const reportRes = await agent.get('/api/reports/sessions');
    expect(reportRes.status).toBe(403);
  });

  it('should allow ADMIN users to perform both administrator actions and player actions', async () => {
    const { agent, csrfToken } = await createAuthenticatedSession('ADMIN');

    // Admin can create a sport
    const sportRes = await agent
      .post('/api/sports')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Squash', description: 'Fast indoor sport' });

    expect(sportRes.status).toBe(201);
    const sportId = sportRes.body.sport.id;

    // Admin can access reports
    const reportRes = await agent.get('/api/reports/sessions');
    expect(reportRes.status).toBe(200);

    // Admin can also create a player session (player functionality retained!)
    const sessionRes = await agent
      .post('/api/sessions')
      .set('X-CSRF-Token', csrfToken)
      .send({
        sportId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        venue: 'Court 3, Sportsplex',
        additionalPlayersRequired: 2,
        team: 'Team Alpha',
      });

    expect(sessionRes.status).toBe(201);
    expect(sessionRes.body.session.venue).toBe('Court 3, Sportsplex');
  });
});
