import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SessionsBrowsePage from './pages/SessionsBrowsePage';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionDetailPage from './pages/SessionDetailPage';
import MySessionsPage from './pages/MySessionsPage';
import AdminSportsPage from './pages/AdminSportsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Player & Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsBrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/create"
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <SessionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <ProtectedRoute>
                <MySessionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/my-created-sessions" element={<Navigate to="/my-sessions?tab=created" replace />} />
          <Route path="/my-joined-sessions" element={<Navigate to="/my-sessions?tab=joined" replace />} />
          <Route path="/sports" element={<Navigate to="/sessions" replace />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/sports"
            element={
              <ProtectedRoute adminOnly>
                <AdminSportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute adminOnly>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
