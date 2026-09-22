const { resetDb, createAuthenticatedSession, models } = require('./setup');
const { Sport } = models;

describe('Sports Management API', () => {
  let adminSession;
  let playerSession;

  beforeEach(async () => {
    await resetDb();
    adminSession = await createAuthenticatedSession('ADMIN');
    playerSession = await createAuthenticatedSession('PLAYER');
  });

  it('should allow an admin to create a new sport', async () => {
    const res = await adminSession.agent
      .post('/api/sports')
      .set('X-CSRF-Token', adminSession.csrfToken)
      .send({
        name: 'Badminton',
        description: 'Indoor singles and doubles racquet sport',
        active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.sport.name).toBe('Badminton');
    expect(res.body.sport.active).toBe(true);

    const sportInDb = await Sport.findOne({ where: { name: 'Badminton' } });
    expect(sportInDb).not.toBeNull();
  });

  it('should prevent creating duplicate sports', async () => {
    await adminSession.agent
      .post('/api/sports')
      .set('X-CSRF-Token', adminSession.csrfToken)
      .send({ name: 'Cricket', description: 'T20 match' });

    const duplicateRes = await adminSession.agent
      .post('/api/sports')
      .set('X-CSRF-Token', adminSession.csrfToken)
      .send({ name: 'Cricket', description: 'Another cricket' });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error).toBe('Duplicate sport');
  });

  it('should allow an admin to edit sport details and toggle active status', async () => {
    const sport = await Sport.create({
      name: 'Padel',
      description: 'Original description',
      active: true,
    });

    const res = await adminSession.agent
      .put(`/api/sports/${sport.id}`)
      .set('X-CSRF-Token', adminSession.csrfToken)
      .send({
        name: 'Padel Tennis',
        description: 'Updated description for padel',
        active: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.sport.name).toBe('Padel Tennis');
    expect(res.body.sport.active).toBe(false);

    const updatedInDb = await Sport.findByPk(sport.id);
    expect(updatedInDb.active).toBe(false);
  });

  it('should allow authenticated players to browse the sports list', async () => {
    await Sport.create({ name: 'Tennis', active: true });
    await Sport.create({ name: 'Curling', active: false });

    const res = await playerSession.agent.get('/api/sports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sports)).toBe(true);
    expect(res.body.sports.length).toBe(2);

    // Test activeOnly filter
    const activeRes = await playerSession.agent.get('/api/sports?activeOnly=true');
    expect(activeRes.status).toBe(200);
    expect(activeRes.body.sports.length).toBe(1);
    expect(activeRes.body.sports[0].name).toBe('Tennis');
  });
});
