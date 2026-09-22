const { resetDb, createAuthenticatedSession, models } = require('./setup');
const { Sport, Session, SessionParticipant } = models;

describe('Admin Reports & Analytics API', () => {
  let adminSession;
  let playerSession;
  let football;
  let tennis;

  beforeEach(async () => {
    await resetDb();
    adminSession = await createAuthenticatedSession('ADMIN');
    playerSession = await createAuthenticatedSession('PLAYER');

    football = await Sport.create({ name: 'Football', active: true });
    tennis = await Sport.create({ name: 'Tennis', active: true });

    // Seed test session data with past and future dates
    const now = new Date();

    // 1. Played Football match (5 days ago, status COMPLETED)
    const playedFootball = await Session.create({
      sportId: football.id,
      creatorId: adminSession.user.id,
      scheduledAt: new Date(now.getTime() - 5 * 86400000),
      venue: 'Camp Nou Arena',
      additionalPlayersRequired: 1,
      status: 'COMPLETED',
    });
    await SessionParticipant.create({ sessionId: playedFootball.id, userId: adminSession.user.id });

    // 2. Played Tennis match (3 days ago, status COMPLETED)
    const playedTennis = await Session.create({
      sportId: tennis.id,
      creatorId: adminSession.user.id,
      scheduledAt: new Date(now.getTime() - 3 * 86400000),
      venue: 'Wimbledon Court 1',
      additionalPlayersRequired: 1,
      status: 'COMPLETED',
    });
    await SessionParticipant.create({ sessionId: playedTennis.id, userId: adminSession.user.id });

    // 3. Cancelled Football match (4 days ago, status CANCELLED) -> MUST NOT be counted as played!
    const cancelledFootball = await Session.create({
      sportId: football.id,
      creatorId: adminSession.user.id,
      scheduledAt: new Date(now.getTime() - 4 * 86400000),
      venue: 'Storm Stadium',
      additionalPlayersRequired: 2,
      status: 'CANCELLED',
      cancellationReason: 'Severe thunderstorm',
    });
    await SessionParticipant.create({ sessionId: cancelledFootball.id, userId: adminSession.user.id });

    // 4. Upcoming Football match (in 2 days, status OPEN)
    const upcomingFootball = await Session.create({
      sportId: football.id,
      creatorId: adminSession.user.id,
      scheduledAt: new Date(now.getTime() + 2 * 86400000),
      venue: 'Future Arena',
      additionalPlayersRequired: 3,
      status: 'OPEN',
    });
    await SessionParticipant.create({ sessionId: upcomingFootball.id, userId: adminSession.user.id });
  });

  it('should restrict reports access to ADMIN users only', async () => {
    const playerRes = await playerSession.agent.get('/api/reports/sessions');
    expect(playerRes.status).toBe(403);

    const adminRes = await adminSession.agent.get('/api/reports/sessions');
    expect(adminRes.status).toBe(200);
  });

  it('should dynamically calculate total sessions played and exclude cancelled sessions', async () => {
    const from = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    const to = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

    const res = await adminSession.agent.get(`/api/reports/sessions?from=${from}&to=${to}`);

    expect(res.status).toBe(200);
    const { summary, statusBreakdown, sportPopularity } = res.body.report;

    // Total sessions created in window = 4
    expect(summary.totalSessions).toBe(4);

    // CRITICAL: Total played = 2 (1 Football, 1 Tennis). Cancelled match MUST NOT be counted as played!
    expect(summary.totalPlayed).toBe(2);
    expect(summary.totalCancelled).toBe(1);
    expect(statusBreakdown.CANCELLED).toBe(1);
    expect(statusBreakdown.COMPLETED).toBe(2);

    // Sport popularity for played sessions: 1 Football (50%), 1 Tennis (50%)
    expect(sportPopularity.length).toBe(2);
    const footballStat = sportPopularity.find((s) => s.sport === 'Football');
    const tennisStat = sportPopularity.find((s) => s.sport === 'Tennis');
    expect(footballStat.count).toBe(1);
    expect(tennisStat.count).toBe(1);
    expect(footballStat.percentage).toBe(50);
    expect(tennisStat.percentage).toBe(50);
  });

  it('should reject invalid date formats or "from" date after "to" date', async () => {
    const res = await adminSession.agent.get('/api/reports/sessions?from=2026-12-31&to=2026-01-01');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid date range');
  });
});
