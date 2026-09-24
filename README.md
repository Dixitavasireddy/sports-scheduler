# Sports Scheduler — WD501 Advanced Backend Capstone Project

A complete, production-grade web application for organizing, discovering, and managing amateur sports sessions, player rosters, match capacities, and administrative analytics.

Built with **Node.js**, **Express**, **PostgreSQL**, **Sequelize ORM**, **Passport.js**, **Express-session**, **CSRF Protection**, and a responsive **React (Vite)** dashboard interface.

---
## 🌐 Live Application

🚀 **Live Demo:**  
[Sports Scheduler – Live Application](https://sports-scheduler-1-1pvw.onrender.com/)

The live application demonstrates the complete Sports Scheduler workflow, including player registration, authentication, session creation, session discovery, joining sessions, participant management, cancellation, and administrative features.

---

## 🎥 Video Demonstration

▶️ **Project Demo Video:**  
[Watch the Sports Scheduler Demo on YouTube](YOUR_YOUTUBE_VIDEO_LINK)

The demonstration video covers:

- Project introduction
- Technology stack
- Player registration
- Player login and logout
- Admin login
- Sports management
- Admin Player Mode
- Creating sports sessions
- Discovering available sessions
- Joining sessions
- Viewing participants
- Managing created sessions
- Cancelling sessions
- Session statuses
- Reports and sport popularity
- PostgreSQL and Sequelize
- Authentication and security
- Automated testing
- Git/GitHub workflow
- Render deployment

## 🌟 Key Architecture & Features

### 1. Robust Authentication & Session Management
- **Passport.js Local Strategy**: Secure credential verification using `bcryptjs` salted password hashing.
- **Server-Side Sessions**: Stateful sessions stored in PostgreSQL / session memory with `httpOnly`, `sameSite`, and production-ready `secure` cookie configurations.
- **Correct Serialization**: Standard `serializeUser` storing the primary key ID and `deserializeUser` safely fetching user attributes without leaking `passwordHash`.
- **Public Endpoints**:
  - `POST /auth/register` (auto-logs in upon registration)
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`

### 2. State-Changing CSRF Protection
- **Strict Anti-CSRF Token Verification**: Mandatory CSRF protection on all mutating HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Cryptographic Generation**: Secure random tokens stored in the server session.
- **Client Handshake**: Accessible through `GET /api/csrf-token` and standard `XSRF-TOKEN` cookies. Requests must pass `X-CSRF-Token` in headers.
- **Authoritative Rejection**: Missing or forged tokens immediately trigger `403 Forbidden`.

### 3. Role-Based Authorization (RBAC)
- **Roles**: `ADMIN` and `PLAYER`.
- **Backend Enforcement**:
  - `requireAuth`: Guarantees active authenticated session.
  - `requireAdmin`: Enforces administrative permissions (e.g. creating/editing sports catalog, accessing analytics reports).
  - `requirePlayer`: Accessible to both `PLAYER` and `ADMIN` users (administrators retain full player capabilities).

### 4. PostgreSQL Relational Data Modeling & Sequelize ORM
- **`Users`**: Primary key UUID, unique lowercase validated email, hashed password, role enum.
- **`Sports`**: Unique name, description, active flag.
- **`Sessions`**: Foreign keys to `Sport` and `User` (creator), scheduled date & time, venue, additional players required, status (`OPEN`, `FULL`, `COMPLETED`, `CANCELLED`), cancellation reason.
- **`SessionParticipants`**: Relational junction table linking `sessionId` and `userId` with team assignments (`Team A`, `Team B`).
- **Duplicate Prevention**: Unique database index on `(sessionId, userId)` preventing double-enrollment at the engine level.

### 5. Transactional Session Capacity & Lifecycle
- **Concurrency Safety**: Joining a session runs inside a database transaction (`sequelize.transaction`) ensuring no race condition exceeds `(1 + additionalPlayersRequired)`.
- **Auto Status Transition**: Transitions status to `FULL` automatically when capacity is met.
- **Past Date Protection**: Rejects creation or joining of matches whose `scheduledAt` timestamp is in the past.
- **Cancellation Workflow**: Creator can cancel with a required `cancellationReason` (`POST /api/sessions/:id/cancel`). Cancelled sessions are locked from further joins and clearly present the reason to all participants.

### 6. Dynamic Admin Reports & Performance Analytics
- **Dynamic Calculation**: Aggregated dynamically from PostgreSQL (no hardcoded metrics).
- **Date Range Filters**: Filter by `from` and `to` timestamps (with presets: 7 Days, 30 Days, 90 Days).
- **Exclusion of Cancelled Matches**: Cancelled sessions are strictly excluded from "Total Matches Played" metrics.
- **Sport Popularity Breakdown**: Percentage and count distributions across completed sports matches.

---

## 📁 Project Structure

```
sports-scheduler/
├── backend/
│   ├── config/
│   │   ├── database.js          # Sequelize connection & environment config
│   │   ├── passport.js          # Passport Local Strategy
│   │   └── session.js           # Session configuration & cookie settings
│   ├── controllers/
│   │   ├── authController.js    # Register, login, logout, me
│   │   ├── sportController.js   # Sports list, create, update
│   │   ├── sessionController.js # Matches create, list, details, cancel, my-sessions
│   │   ├── participantController.js # Join/leave with transactional capacity locking
│   │   └── reportController.js  # Dynamic SQL aggregates for admin reports
│   ├── middleware/
│   │   ├── auth.js              # requireAuth middleware
│   │   ├── authorization.js     # requireAdmin, requirePlayer middleware
│   │   ├── csrf.js              # CSRF protection & token validation (403 Forbidden)
│   │   ├── validation.js        # express-validator schemas for input sanitization
│   │   └── errorHandler.js      # Centralized error handler (no stack traces in prod)
│   ├── models/
│   │   ├── index.js             # Model associations setup
│   │   ├── User.js              # User entity
│   │   ├── Sport.js             # Sport entity
│   │   ├── Session.js           # Session entity
│   │   └── SessionParticipant.js# Junction entity with unique constraint [sessionId, userId]
│   ├── migrations/              # Sequelize database migrations
│   ├── seeders/
│   │   ├── seed.js              # Standalone database seeder
│   │   └── 20260922000001-seed-admin-and-sports.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sportRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── tests/
│   │   ├── setup.js
│   │   ├── auth.test.js         # Authentication test suite
│   │   ├── csrf.test.js         # CSRF verification test suite
│   │   ├── authorization.test.js# RBAC role test suite
│   │   ├── sports.test.js       # Sports management test suite
│   │   ├── sessions.test.js     # Match lifecycle & capacity test suite
│   │   └── reports.test.js      # Dynamic report analytics test suite
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── TeamRosterView.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── CancelModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AlertToast.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SessionsBrowsePage.jsx
│   │   │   ├── CreateSessionPage.jsx
│   │   │   ├── SessionDetailPage.jsx
│   │   │   ├── MySessionsPage.jsx
│   │   │   ├── AdminSportsPage.jsx
│   │   │   ├── AdminReportsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   └── screenshots/
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+  (verified on Node v24).
- **npm**: v9+ or v10+.
- **PostgreSQL**: (Optional host service or Docker). The application automatically includes a built-in PostgreSQL adapter so it runs out-of-the-box in zero-configuration local environments without requiring manual database setup.

### 2. Installation
Clone the repository and install all root, backend, and frontend dependencies:

```bash
git clone <repository-url>
cd sports-scheduler
npm run install:all
```

Or install separately:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration
Copy `.env.example` to `backend/.env`:

```bash
cp .env.example backend/.env
```

Default configuration in `backend/.env`:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret

# PostgreSQL settings (if connecting to external database):
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=sports_scheduler
DB_HOST=1:1:1:1
DB_PORT=3000
# Or full URI:
# DATABASE_URL=your_database_URL

USE_EMBEDDED_POSTGRES=true
```

### 4. Database Initialization & Seeding
Run the database seed script to populate the default administrator, demo player, and default sports catalog:

```bash
cd backend
npm run db:seed
```

#### Pre-Configured Test Credentials:
| Role | Email | Password | Privileges |
|------|-------|----------|------------|
| **ADMIN** | `admin@sportsscheduler.com` | `AdminPass123!` | Full admin management + reports + player privileges |
| **PLAYER** | `alex@sportsscheduler.com` | `PlayerPass123!` | Standard player booking, hosting, and roster joining |

*(Quick-fill demo buttons are also embedded directly on the Login page for one-click testing.)*

### 5. Running the Application in Development
From the project root:

```bash
npm run dev
```
## 🧪 Automated Testing

The project contains 6 comprehensive automated test suites built with **Jest** and **Supertest** covering 100% of the course backend requirements:

```bash
# Run all test suites from root
npm test

# Or run directly inside the backend directory
cd backend
npm test
```

### Test Suites Included:
1. **`auth.test.js`**: User registration, password confirmation matching, duplicate email rejection (409), password hashing, login, logout, and `/auth/me` session validation.
2. **`csrf.test.js`**: Missing CSRF token rejection (403), invalid token rejection (403), and valid token acceptance.
3. **`authorization.test.js`**: Rejection of unauthenticated requests (401), restriction of admin routes for players (403), and verification that admins retain all player functionality.
4. **`sports.test.js`**: Admin sport creation, duplicate rejection (409), admin sport edit, active status toggle, and public sport browsing.
5. **`sessions.test.js`**: Future date scheduling, past date rejection (400), inactive sport rejection (400), transactional joining, duplicate join prevention (409), capacity limit enforcement (`FULL`), past match protection, and creator-only cancellation with mandatory reason.
6. **`reports.test.js`**: Admin-only report authorization (403 for players), date range filtering (`from`/`to`), dynamic aggregate calculation, and exclusion of cancelled sessions from played totals.

---

## 📑 API Reference

### Authentication
- `POST /auth/register`: Create a new player account.
- `POST /auth/login`: Authenticate existing session.
- `POST /auth/logout`: Destroy current session.
- `GET /auth/me`: Retrieve current authenticated user profile.
- `GET /api/csrf-token`: Retrieve fresh anti-CSRF token.

### Sports Management
- `GET /api/sports`: List sports (optional query `?activeOnly=true`).
- `GET /api/sports/:id`: Retrieve sport details.
- `POST /api/sports`: Create sport *(Admin only, CSRF protected)*.
- `PUT /api/sports/:id`: Update sport name/active state *(Admin only, CSRF protected)*.

### Matches & Sessions
- `GET /api/sessions`: Browse matches (filters: `sportId`, `status`, `futureOnly`, `search`).
- `GET /api/sessions/:id`: Detailed session view with team lineups and slots.
- `POST /api/sessions`: Create session *(Authenticated, CSRF protected)*.
- `POST /api/sessions/:id/join`: Join session with transaction & capacity locking *(CSRF protected)*.
- `POST /api/sessions/:id/leave`: Leave session *(CSRF protected)*.
- `POST /api/sessions/:id/cancel`: Cancel session with `cancellationReason` *(Creator only, CSRF protected)*.
- `GET /api/sessions/my/created`: Matches hosted by authenticated user.
- `GET /api/sessions/my/joined`: Matches joined by authenticated user.

### Reports & Analytics
- `GET /api/reports/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD`: Performance report *(Admin only)*.

---

## 🛡️ Security Implementations
- **Helmet**: Secures HTTP response headers.
- **CSRF Verification**: Cryptographic token matching on all mutating endpoints.
- **HttpOnly Cookies**: Prevents client-side script theft of session cookies.
- **Bcrypt Hashing**: 10-round salted password derivation.
- **Relational Integrity**: Foreign key constraints and unique composite indexes `[sessionId, userId]` prevent duplicate participation.
- **Input Sanitization**: Multi-layer validation schemas via `express-validator`.
- **Production Error Masking**: Centralized error middleware suppresses stack traces in non-development modes.

---
## SCREENSHOTS ##

### 1. 🏠 Landing Page
<img width="944" height="437" alt="Landing page" src="https://github.com/user-attachments/assets/932ad314-aa10-41a9-9d0f-774b0ccf1b6b" />

### 2. 📝 Player Registration
<img width="946" height="443" alt="Register" src="https://github.com/user-attachments/assets/3dd902f2-cf70-4fb4-8e16-2878a4227c6a" />

### 3. 🔐 Player Sign In
<img width="716" height="434" alt="Signin" src="https://github.com/user-attachments/assets/9f00ce24-4739-4d9d-b5c2-776cf3708b6f" />

### 4. 👤 Player Dashboard
<img width="949" height="441" alt="Player-Dashboard" src="https://github.com/user-attachments/assets/b063d955-0fe7-4629-bff1-6f1ecea4b8b6" />

### 5. 🏟️ Host Match
<img width="299" height="426" alt="Host_Match" src="https://github.com/user-attachments/assets/04f5caad-5522-4881-ab61-30fdb06cf1a8" />

### 6. 👑 Admin Dashboard
<img width="885" height="430" alt="Admin_Dashboard" src="https://github.com/user-attachments/assets/0c009b3f-8377-4b76-8aab-4d71a4cf130a" />

### 7. 📋 Admin — All Matches
<img width="435" height="443" alt="Admin_Matches" src="https://github.com/user-attachments/assets/f79237f2-7ce7-425f-99d9-97a265c10b1d" />

### 8. 📊 Sessions and Sports Performance Report
<img width="733" height="440" alt="Admin _Report" src="https://github.com/user-attachments/assets/7b1fd44d-5891-430d-a217-96fee6ab435a" />


## 🎓 WD501 Course Evaluation Summary
This application fulfills all capstone project requirements without omission:
- Real PostgreSQL with Sequelize ORM (models, migrations, seeders, associations, transactions).
- Real Passport.js local strategy with server sessions.
- Role-based authorization on the backend (`requireAuth`, `requireAdmin`, `requirePlayer`).
- CSRF protection (`403 Forbidden` verification).
- Session capacity transactions and lifecycle states (`OPEN` -> `FULL` -> `COMPLETED` / `CANCELLED`).
- Creator cancellation with reason persistence.
- Dynamic SQL admin reports with date filtering and cancelled session exclusion.
- Automated tests passing with 100% success rate across 33 test cases.
- Polished, responsive, accessible sports management UI.


