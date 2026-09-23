const request = require('supertest');
const { app, resetDb } = require('./setup');

describe('CSRF Protection Verification', () => {
  let agent;

  beforeEach(async () => {
    await resetDb();
    agent = request.agent(app);
  });

  it('should reject a state-changing POST request when CSRF token is completely missing', async () => {
    // Attempt registration with no X-CSRF-Token header
    const res = await agent.post('/auth/register').send({
      name: 'Hacker User',
      email: 'hacker@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/CSRF token missing/i);
  });

  it('should reject a state-changing POST request when CSRF token is forged / invalid', async () => {
    // Initialize session first via get
    await agent.get('/api/csrf-token');

    // Send forged token
    const res = await agent
      .post('/auth/register')
      .set('X-CSRF-Token', 'forged-malicious-token-12345')
      .send({
        name: 'Hacker User',
        email: 'hacker@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Invalid CSRF token/i);
  });

  it('should succeed when a valid CSRF token is retrieved and submitted with mutating requests', async () => {
    // 1. Fetch valid token
    const tokenRes = await agent.get('/api/csrf-token');
    expect(tokenRes.status).toBe(200);
    const validToken = tokenRes.body.csrfToken;
    expect(validToken).toBeDefined();

    // 2. Submit with X-CSRF-Token header
    const res = await agent
      .post('/auth/register')
      .set('X-CSRF-Token', validToken)
      .send({
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('valid@example.com');
  });

  it('should succeed when a valid signed CSRF token is submitted even without prior session cookies (cross-origin resilient)', async () => {
    // 1. Fetch valid token without maintaining session agent
    const tokenRes = await request(app).get('/api/csrf-token');
    expect(tokenRes.status).toBe(200);
    const validToken = tokenRes.body.csrfToken;

    // 2. Submit with a FRESH client that has NO session cookie
    const freshClient = request(app);
    const res = await freshClient
      .post('/auth/register')
      .set('X-CSRF-Token', validToken)
      .send({
        name: 'Cross Origin User',
        email: 'crossorigin@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('crossorigin@example.com');
  });
});

