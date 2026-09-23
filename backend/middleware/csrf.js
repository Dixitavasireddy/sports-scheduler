const crypto = require('crypto');

const DEFAULT_SECRET = 'supersecret_sports_scheduler_session_key_wd501_2026';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cryptographically signed CSRF token tied to the server secret.
 * Format: <nonce>.<timestampHex>.<hmacSignature>
 */
function generateSignedToken(secret = process.env.SESSION_SECRET || DEFAULT_SECRET) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestampHex = Date.now().toString(36);
  const payload = `${nonce}.${timestampHex}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify a signed CSRF token against secret and expiration window.
 */
function verifySignedToken(token, secret = process.env.SESSION_SECRET || DEFAULT_SECRET) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [nonce, timestampHex, signature] = parts;
  if (!nonce || !timestampHex || !signature) return false;

  const timestamp = parseInt(timestampHex, 36);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Valid within TTL and not in the distant future (>1 min clock skew)
  if (now - timestamp > TOKEN_TTL_MS || timestamp > now + 60000) {
    return false;
  }

  const payload = `${nonce}.${timestampHex}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Helper to determine secure cookie flag.
 */
function isSecureCookie() {
  return process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
}

/**
 * Robust CSRF protection middleware for session-authenticated state changes.
 * Supports session matching, double-submit cookie, and cryptographic HMAC token validation.
 */
function csrfProtection(req, res, next) {
  // Ensure session exists
  if (!req.session) {
    return res.status(500).json({ error: 'Session not initialized for CSRF protection' });
  }

  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  const secure = isSecureCookie();

  // Generate a CSRF token if one does not exist for this session
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateSignedToken(secret);
  }

  // Safe HTTP methods: GET, HEAD, OPTIONS
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // Send cookie for clients that read XSRF-TOKEN
    res.cookie('XSRF-TOKEN', req.session.csrfToken, {
      httpOnly: false,
      sameSite: secure ? 'none' : 'lax',
      secure,
      maxAge: TOKEN_TTL_MS,
    });
    return next();
  }

  // Mutating HTTP methods: POST, PUT, PATCH, DELETE
  const clientToken =
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    (req.body && req.body._csrf);

  if (!clientToken) {
    return res.status(403).json({
      error: 'CSRF token missing. Please include X-CSRF-Token header.',
      code: 'EBADCSRFTOKEN',
    });
  }

  // Multi-tier validation:
  // 1. Direct session token match
  const matchesSession = Boolean(req.session.csrfToken && clientToken === req.session.csrfToken);
  // 2. Cookie token match (Double-submit)
  const matchesCookie = Boolean(req.cookies && req.cookies['XSRF-TOKEN'] && clientToken === req.cookies['XSRF-TOKEN']);
  // 3. Cryptographic HMAC signature check
  const isValidSigned = verifySignedToken(clientToken, secret);

  if (!matchesSession && !matchesCookie && !isValidSigned) {
    return res.status(403).json({
      error: 'Invalid CSRF token. Request rejected.',
      code: 'EBADCSRFTOKEN',
    });
  }

  // Synchronize session token if validated via signature or cookie
  if (!req.session.csrfToken || req.session.csrfToken !== clientToken) {
    req.session.csrfToken = clientToken;
  }

  return next();
}

/**
 * Controller endpoint to retrieve current CSRF token.
 */
function getCsrfToken(req, res) {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  const secure = isSecureCookie();

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateSignedToken(secret);
  }

  // Also send XSRF-TOKEN cookie
  res.cookie('XSRF-TOKEN', req.session.csrfToken, {
    httpOnly: false,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: TOKEN_TTL_MS,
  });

  return res.json({ csrfToken: req.session.csrfToken });
}

module.exports = {
  csrfProtection,
  getCsrfToken,
  generateSignedToken,
  verifySignedToken,
};
