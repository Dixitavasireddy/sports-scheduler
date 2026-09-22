const { resetDb, createAuthenticatedSession, models } = require('./setup');
const { Sport, Session, SessionParticipant } = models;

describe('Session & Match Management', () => {
  let player1;
  let player2;
  let player3;
  let activeSport;
  let inactiveSport;

  beforeEach(async () => {
    await resetDb();
    player1 = await createAuthenticatedSession('PLAYER', 'player1@test.com');
    player2 = await createAuthenticatedSession('PLAYER', 'player2@test.com');
    player3 = await createAuthenticatedSession('PLAYER', 'player3@test.com');

    activeSport = await Sport.create({ name: 'Football', active: true });
    inactiveSport = await Sport.create({ name: 'Curling', active: false });
  });

  describe('Session Creation & Validation', () => {
    it('should allow player to create a session with creator auto-enrolled as participant', async () => {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const res = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Champions Turf, Pitch 2',
          additionalPlayersRequired: 3,
          team: 'Team Red',
        });

      expect(res.status).toBe(201);
      expect(res.body.session.venue).toBe('Champions Turf, Pitch 2');
      expect(res.body.session.status).toBe('OPEN');
      expect(res.body.session.availableSlots).toBe(3); // 1 creator + 3 additional = 4 capacity, 1 participant = 3 slots
      expect(res.body.session.participants.length).toBe(1);
      expect(res.body.session.participants[0].userId).toBe(player1.user.id);
      expect(res.body.session.participants[0].team).toBe('Team Red');
    });

    it('should reject session creation with a past date/time', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      const res = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt: pastDate,
          venue: 'Old Arena',
          additionalPlayersRequired: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject session creation with an inactive sport', async () => {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();
      const res = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: inactiveSport.id,
          scheduledAt,
          venue: 'Ice Rink',
          additionalPlayersRequired: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Inactive sport');
    });

    it('should allow creating a session with pre-filled team players and custom team names', async () => {
      const scheduledAt = new Date(Date.now() + 172800000).toISOString(); // 2 days later
      const res = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Metropolitan Stadium',
          additionalPlayersRequired: 4,
          team1Name: 'Red Strikers',
          team2Name: 'Blue Titans',
          team1Players: ['Carlos', 'David'],
          team2Players: ['Sam', 'Leo'],
          team: 'Red Strikers',
        });

      expect(res.status).toBe(201);
      expect(res.body.session.team1Name).toBe('Red Strikers');
      expect(res.body.session.team2Name).toBe('Blue Titans');
      expect(res.body.session.team1Players).toEqual(['Carlos', 'David']);
      expect(res.body.session.team2Players).toEqual(['Sam', 'Leo']);
      // 1 host + 4 prefilled + 4 additional = 9 total capacity, 4 open slots
      expect(res.body.session.totalCapacity).toBe(9);
      expect(res.body.session.availableSlots).toBe(4);
    });

    it('should prevent creator from hosting multiple matches at the exact same date and time', async () => {
      const scheduledAt = new Date(Date.now() + 259200000).toISOString(); // 3 days later
      // First session created successfully
      const res1 = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Court 1',
          additionalPlayersRequired: 2,
        });
      expect(res1.status).toBe(201);

      // Attempt to create second session at the exact same scheduledAt
      const res2 = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Court 2',
          additionalPlayersRequired: 2,
        });

      expect(res2.status).toBe(409);
      expect(res2.body.error).toBe('Time conflict');
    });
  });

  describe('Session Joining & Capacity Management', () => {
    let session;

    beforeEach(async () => {
      // Create a session requiring only 1 additional player (total capacity: 2)
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();
      const createRes = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Elite Tennis Club',
          additionalPlayersRequired: 1,
          team: 'Team A',
        });
      session = createRes.body.session;
    });

    it('should allow a second player to join the session', async () => {
      const joinRes = await player2.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send({ team: 'Team B' });

      expect(joinRes.status).toBe(200);
      expect(joinRes.body.session.status).toBe('FULL'); // Because 1 additional was required and now filled!
      expect(joinRes.body.session.participants.length).toBe(2);

      const p2 = joinRes.body.session.participants.find((p) => p.userId === player2.user.id);
      expect(p2).toBeDefined();
      expect(p2.team).toBe('Team B');
    });

    it('should prevent a user from joining the same session twice (duplicate prevention)', async () => {
      // player2 joins once
      await player2.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      // player2 attempts to join again
      const secondJoinRes = await player2.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      expect(secondJoinRes.status).toBe(409);
      expect(secondJoinRes.body.error).toBe('Already joined');
    });

    it('should reject third player when session capacity is reached (FULL status)', async () => {
      // player2 joins -> capacity reaches limit (1 creator + 1 additional = 2)
      await player2.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      // player3 tries to join
      const thirdJoinRes = await player3.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player3.csrfToken)
        .send();

      expect(thirdJoinRes.status).toBe(400);
      expect(thirdJoinRes.body.error).toBe('Session full');
    });

    it('should reject joining a session that has already passed', async () => {
      // Create a past session directly in DB
      const pastSession = await Session.create({
        sportId: activeSport.id,
        creatorId: player1.user.id,
        scheduledAt: new Date(Date.now() - 3600000), // 1 hour ago
        venue: 'Historic Pitch',
        additionalPlayersRequired: 2,
        status: 'OPEN',
      });

      const res = await player2.agent
        .post(`/api/sessions/${pastSession.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already passed/i);
    });

    it('should reject joining if user is already enrolled in another match at the exact same date and time', async () => {
      const scheduledAt = new Date(Date.now() + 345600000).toISOString(); // 4 days later
      // Session 1 created by player1
      const res1 = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Turf A',
          additionalPlayersRequired: 2,
        });
      // Session 2 created by player3
      const res2 = await player3.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player3.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Turf B',
          additionalPlayersRequired: 2,
        });

      // player2 joins Session 1
      const join1 = await player2.agent
        .post(`/api/sessions/${res1.body.session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();
      expect(join1.status).toBe(200);

      // player2 attempts to join Session 2 at the exact same scheduledAt
      const join2 = await player2.agent
        .post(`/api/sessions/${res2.body.session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();
      expect(join2.status).toBe(409);
      expect(join2.body.error).toBe('Time conflict');
    });
  });

  describe('Session Cancellation', () => {
    let session;

    beforeEach(async () => {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();
      const createRes = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Community Hall',
          additionalPlayersRequired: 2,
        });
      session = createRes.body.session;
    });

    it('should allow the creator to cancel the session with a reason', async () => {
      const cancelRes = await player1.agent
        .post(`/api/sessions/${session.id}/cancel`)
        .set('X-CSRF-Token', player1.csrfToken)
        .send({ cancellationReason: 'Heavy rain flooded the outdoor court.' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.session.status).toBe('CANCELLED');
      expect(cancelRes.body.session.cancellationReason).toBe('Heavy rain flooded the outdoor court.');
    });

    it('should allow an administrator to cancel any session with a reason', async () => {
      const admin = await createAuthenticatedSession('ADMIN', 'admin_cancel_test@example.com');
      const cancelRes = await admin.agent
        .post(`/api/sessions/${session.id}/cancel`)
        .set('X-CSRF-Token', admin.csrfToken)
        .send({ cancellationReason: 'Court closed by municipal authority for safety inspection.' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.session.status).toBe('CANCELLED');
      expect(cancelRes.body.session.cancellationReason).toBe(
        'Court closed by municipal authority for safety inspection.'
      );
    });

    it('should forbid a non-creator non-admin from cancelling the session', async () => {
      const cancelRes = await player2.agent
        .post(`/api/sessions/${session.id}/cancel`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send({ cancellationReason: 'I want to cancel this.' });

      expect(cancelRes.status).toBe(403);
      expect(cancelRes.body.message).toMatch(/Only the session creator/i);
    });

    it('should prevent joining a cancelled session', async () => {
      // Cancel session
      await player1.agent
        .post(`/api/sessions/${session.id}/cancel`)
        .set('X-CSRF-Token', player1.csrfToken)
        .send({ cancellationReason: 'Venue unavailable.' });

      // player2 attempts to join
      const joinRes = await player2.agent
        .post(`/api/sessions/${session.id}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      expect(joinRes.status).toBe(400);
      expect(joinRes.body.message).toMatch(/Cannot join a cancelled session/i);
    });
  });

  describe('User Specific Collections: My Created & My Joined', () => {
    it('should accurately list created and joined sessions for the logged-in user', async () => {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();

      // player1 creates session
      const createRes = await player1.agent
        .post('/api/sessions')
        .set('X-CSRF-Token', player1.csrfToken)
        .send({
          sportId: activeSport.id,
          scheduledAt,
          venue: 'Downtown Field',
          additionalPlayersRequired: 2,
        });
      const sessId = createRes.body.session.id;

      // player2 joins
      await player2.agent
        .post(`/api/sessions/${sessId}/join`)
        .set('X-CSRF-Token', player2.csrfToken)
        .send();

      // Check player1 my created
      const p1CreatedRes = await player1.agent.get('/api/sessions/my/created');
      expect(p1CreatedRes.status).toBe(200);
      expect(p1CreatedRes.body.sessions.length).toBe(1);
      expect(p1CreatedRes.body.sessions[0].id).toBe(sessId);

      // Check player2 my joined
      const p2JoinedRes = await player2.agent.get('/api/sessions/my/joined');
      expect(p2JoinedRes.status).toBe(200);
      expect(p2JoinedRes.body.sessions.length).toBe(1);
      expect(p2JoinedRes.body.sessions[0].id).toBe(sessId);
    });
  });
});
