require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const createSessionMiddleware = require('./config/session');
const passport = require('./config/passport');
const { csrfProtection, getCsrfToken } = require('./middleware/csrf');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const sportRoutes = require('./routes/sportRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting session credentials
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, supertest)
      if (!origin || origin === clientUrl || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, or specific origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'csrf-token', 'Cookie'],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Server-side session management
app.use(createSessionMiddleware());

// Passport authentication initialization
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Endpoint to retrieve CSRF token
app.get('/api/csrf-token', getCsrfToken);

// Real CSRF protection for all state-mutating requests
app.use(csrfProtection);

// API Routes
app.use('/auth', authRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

const path = require('path');
const fs = require('fs');

// Serve static frontend build if present
const clientDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
