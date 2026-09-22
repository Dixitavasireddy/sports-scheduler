const request = require('supertest');
const { app, resetDb, createAuthenticatedSession, models } = require('./setup');
const { User } = models;

describe('Authentication Endpoints', () => {
  let agent;
  let csrfToken;

  beforeEach(async () => {
    await resetDb();
    agent = request.agent(app);
    const csrfRes = await agent.get('/api/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
  });

  describe('POST /auth/register', () => {
    it('should register a new player successfully', async () => {
      const res = await agent
        .post('/auth/register')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Lionel Messi',
          email: 'messi@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('messi@example.com');
      expect(res.body.user.role).toBe('PLAYER');
      expect(res.body.user.passwordHash).toBeUndefined();

      // Verify user in DB
      const userInDb = await User.findOne({ where: { email: 'messi@example.com' } });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe('Lionel Messi');
    });

    it('should reject registration when email already exists', async () => {
      await agent
        .post('/auth/register')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      // Refresh CSRF token for the established session
      const freshToken = (await agent.get('/api/csrf-token')).body.csrfToken;

      const res = await agent
        .post('/auth/register')
        .set('X-CSRF-Token', freshToken)
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Registration failed');
    });

    it('should reject registration when passwords do not match', async () => {
      const res = await agent
        .post('/auth/register')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Mismatch User',
          email: 'mismatch@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject registration with invalid email', async () => {
      const res = await agent
        .post('/auth/register')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await User.hashPassword('Secret123!');
      await User.create({
        name: 'Existing Player',
        email: 'player@example.com',
        passwordHash,
        role: 'PLAYER',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await agent
        .post('/auth/login')
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'player@example.com',
          password: 'Secret123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('player@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await agent
        .post('/auth/login')
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'player@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication failed');
    });

    it('should reject login with non-existent email', async () => {
      const res = await agent
        .post('/auth/login')
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'nobody@example.com',
          password: 'Secret123!',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me & POST /auth/logout', () => {
    it('should return 401 when accessing /auth/me without session', async () => {
      const res = await agent.get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return user info when authenticated, and clear session upon logout', async () => {
      // Register and auto-login
      await agent
        .post('/auth/register')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Session User',
          email: 'session@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      const meRes = await agent.get('/auth/me');
      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('session@example.com');

      // Refresh token for logout
      const freshLogoutToken = (await agent.get('/api/csrf-token')).body.csrfToken;

      // Logout
      const logoutRes = await agent
        .post('/auth/logout')
        .set('X-CSRF-Token', freshLogoutToken);
      expect(logoutRes.status).toBe(200);

      // Subsequent /auth/me must be 401
      const afterLogoutRes = await agent.get('/auth/me');
      expect(afterLogoutRes.status).toBe(401);
    });
  });

  describe('PUT /auth/change-password', () => {
    let sessionUser;
    let userAgent;
    let userCsrf;

    beforeEach(async () => {
      const { agent, user, csrfToken } = await createAuthenticatedSession('PLAYER', 'changepw@example.com');
      sessionUser = user;
      userAgent = agent;
      userCsrf = csrfToken;
    });

    it('should successfully update password with valid current credentials', async () => {
      const res = await userAgent
        .put('/auth/change-password')
        .set('X-CSRF-Token', userCsrf)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Password changed successfully/i);

      // Verify old password no longer works
      const oldLoginRes = await userAgent
        .post('/auth/login')
        .set('X-CSRF-Token', userCsrf)
        .send({ email: 'changepw@example.com', password: 'TestPassword123!' });
      expect(oldLoginRes.status).toBe(401);

      // Verify new password works
      const newLoginRes = await userAgent
        .post('/auth/login')
        .set('X-CSRF-Token', userCsrf)
        .send({ email: 'changepw@example.com', password: 'BrandNewPassword123!' });
      expect(newLoginRes.status).toBe(200);
    });

    it('should reject password change when current password is incorrect', async () => {
      const res = await userAgent
        .put('/auth/change-password')
        .set('X-CSRF-Token', userCsrf)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid password');
    });

    it('should reject password change when new password and confirmation mismatch', async () => {
      const res = await userAgent
        .put('/auth/change-password')
        .set('X-CSRF-Token', userCsrf)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'DifferentNewPassword!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
