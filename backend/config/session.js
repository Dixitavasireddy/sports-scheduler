const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

const session = require('express-session');
const pgSimple = require('connect-pg-simple');
const { isMockPg } = require('./database');

function createSessionMiddleware() {
  const isProd = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET || 'supersecret_sports_scheduler_session_key_wd501_2026';

  let store;

  // Use PostgreSQL session store only if real external PostgreSQL is active
  const isEmbedded = isMockPg() || process.env.USE_EMBEDDED_POSTGRES === 'true';
  if (!isEmbedded && (process.env.DATABASE_URL || (process.env.DB_HOST && process.env.USE_EMBEDDED_POSTGRES === 'false'))) {
    try {
      const PgSession = pgSimple(session);
      store = new PgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          host: process.env.DB_HOST || '127.0.0.1',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'sports_scheduler',
        },
        createTableIfMissing: true,
      });
      console.log('[Session] Using PostgreSQL-backed session store (connect-pg-simple)');
    } catch (err) {
      console.log('[Session] Fallback to default session store:', err.message);
    }
  }

  return session({
    store: store || new session.MemoryStore(),
    name: 'sports_scheduler_sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd && process.env.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

module.exports = createSessionMiddleware;
