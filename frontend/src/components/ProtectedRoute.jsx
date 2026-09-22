import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: '#94a3b8',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #1f293d',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.9rem' }}>Verifying session authentication...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '4rem auto',
          textAlign: 'center',
          padding: '2.5rem',
          background: '#111827',
          border: '1px solid #1f293d',
          borderRadius: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f43f5e',
            margin: '0 auto 1.25rem',
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
          This page requires administrator privileges. Your current account role is restricted to player access.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return children;
}
