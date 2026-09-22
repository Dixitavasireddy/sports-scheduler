const path = require('path');
const fs = require('fs');
const net = require('net');

let pgInstance = null;

// Check if a port is open
function checkPortOpen(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/**
 * Ensures a PostgreSQL instance is running.
 * If a PostgreSQL server is already listening on the configured port, uses that.
 * Otherwise, launches an embedded PostgreSQL cluster on that port.
 */
async function ensurePostgresRunning() {
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const dbName = process.env.DB_NAME || 'sports_scheduler';

  const isPortActive = await checkPortOpen(port, host);
  if (isPortActive) {
    console.log(`[Database] PostgreSQL is actively running on ${host}:${port}.`);
    return { isEmbedded: false, port, host };
  }

  console.log(`[Database] No PostgreSQL found on ${host}:${port}. Initializing Embedded PostgreSQL...`);
  
  // Dynamic import of embedded-postgres
  const EmbeddedPostgresModule = require('embedded-postgres');
  const EmbeddedPostgres = EmbeddedPostgresModule.default || EmbeddedPostgresModule;

  const dbDir = path.resolve(__dirname, '..', 'data', 'pg_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  pgInstance = new EmbeddedPostgres({
    databaseDir: dbDir,
    user,
    password,
    port,
    persistent: true,
  });

  try {
    console.log('[Database] Initializing embedded cluster...');
    await pgInstance.initialise();
  } catch (err) {
    // Already initialized or exists
    console.log('[Database] Cluster init check:', err.message);
  }

  console.log('[Database] Starting embedded PostgreSQL server...');
  await pgInstance.start();
  console.log(`[Database] Embedded PostgreSQL server started on port ${port}.`);

  try {
    await pgInstance.createDatabase(dbName);
    console.log(`[Database] Database "${dbName}" ensured.`);
  } catch (err) {
    // Database might already exist
  }

  return { isEmbedded: true, port, host, pgInstance };
}

async function stopEmbeddedPostgres() {
  if (pgInstance) {
    try {
      console.log('[Database] Stopping embedded PostgreSQL server...');
      await pgInstance.stop();
      pgInstance = null;
    } catch (err) {
      console.error('[Database] Error stopping embedded PostgreSQL:', err.message);
    }
  }
}

module.exports = {
  ensurePostgresRunning,
  stopEmbeddedPostgres,
  checkPortOpen,
};
