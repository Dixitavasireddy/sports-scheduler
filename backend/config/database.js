const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

const { Sequelize } = require('sequelize');

let sequelize;
let isMockPg = false;

function getSequelizeInstance() {
  if (sequelize) return sequelize;

  const isTest = process.env.NODE_ENV === 'test';
  const isProd = process.env.NODE_ENV === 'production';
  const forceMockPg = process.env.USE_MOCK_PG === 'true';

  // If force mock pg or embedded postgres mode (default when no DATABASE_URL)
  if (forceMockPg || (!process.env.DATABASE_URL && process.env.USE_EMBEDDED_POSTGRES !== 'false')) {
    isMockPg = true;
    const { newDb } = require('pg-mem');
    const db = newDb({ autoCreateForeignKeyIndices: true });
    
    // Support common PG extensions and functions
    db.public.registerFunction({
      name: 'version',
      returns: db.public.getType('text'),
      implementation: () => 'PostgreSQL 16.0 (pg-mem)',
    });

    const pg = db.adapters.createPg();
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: pg,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    });
    return sequelize;
  }

  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      dialectOptions: isProd
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'sports_scheduler',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        dialectOptions: isProd
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }

  return sequelize;
}

sequelize = getSequelizeInstance();

module.exports = {
  sequelize,
  getSequelizeInstance,
  isMockPg: () => isMockPg,
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sports_scheduler',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'sports_scheduler_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
