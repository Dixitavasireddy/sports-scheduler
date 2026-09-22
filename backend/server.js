require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const seed = require('./seeders/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('[Server] Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('[Server] Database connected successfully.');

    // Ensure database tables exist
    await sequelize.sync();
    console.log('[Server] Database schema synchronized.');

    // Run seeders to ensure admin and default sports exist
    await seed({ sync: false });

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  SPORTS SCHEDULER BACKEND SERVER RUNNING`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('[Server] Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Server] Error closing database:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
