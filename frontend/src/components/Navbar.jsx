import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Calendar,
  PlusCircle,
  BarChart3,
  Layers,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: '#0d131f',
        borderBottom: '1px solid #1f293d',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#022c22',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.02em',
                color: '#f8fafc',
                lineHeight: 1.1,
              }}
            >
              Sports<span style={{ color: '#10b981' }}>Scheduler</span>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              WD501 Advanced Backend
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/dashboard') ? '#10b981' : '#94a3b8',
                  background: isActive('/dashboard') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Calendar size={16} />
                Dashboard
              </Link>

              <Link
                to="/sessions"
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/sessions') ? '#10b981' : '#94a3b8',
                  background: isActive('/sessions') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Browse Matches
              </Link>

              <Link
                to="/my-sessions"
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 6,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive('/my-sessions') ? '#10b981' : '#94a3b8',
                  background: isActive('/my-sessions') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                }}
              >
                My Matches
              </Link>

              <Link
                to="/sessions/create"
                className="btn btn-primary"
                style={{
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.85rem',
                  minHeight: 'auto',
                }}
              >
                <PlusCircle size={15} />
                Host Match
              </Link>

              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                  <Link
                    to="/admin/sports"
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isActive('/admin/sports') ? '#38bdf8' : '#cbd5e1',
                      background: isActive('/admin/sports') ? 'rgba(14, 165, 233, 0.15)' : '#1e293b',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Layers size={14} />
                    Sports
                  </Link>

                  <Link
                    to="/admin/reports"
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isActive('/admin/reports') ? '#a78bfa' : '#cbd5e1',
                      background: isActive('/admin/reports') ? 'rgba(167, 139, 250, 0.15)' : '#1e293b',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <BarChart3 size={14} />
                    Reports
                  </Link>
                </div>
              )}

              {/* User badge and logout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginLeft: '1rem',
                  paddingLeft: '1rem',
                  borderLeft: '1px solid #1f293d',
                }}
              >
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isAdmin ? '#4f46e5' : '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      {user.name.split(' ')[0]}
                    </div>
                    <StatusBadge status={user.role} />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                <LogIn size={16} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                <UserPlus size={16} />
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            display: 'none',
            cursor: 'pointer',
          }}
          className="mobile-nav-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#0d131f',
            borderTop: '1px solid #1f293d',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                </div>
                <StatusBadge status={user.role} />
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc' }}>
                Dashboard
              </Link>
              <Link to="/sessions" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc' }}>
                Browse Matches
              </Link>
              <Link to="/sessions/create" onClick={() => setMobileMenuOpen(false)} style={{ color: '#10b981' }}>
                + Host Match
              </Link>
              <Link to="/my-sessions" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc' }}>
                My Matches
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/sports" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8' }}>
                    Sports Management
                  </Link>
                  <Link to="/admin/reports" onClick={() => setMobileMenuOpen(false)} style={{ color: '#a78bfa' }}>
                    Admin Reports
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-outline-danger"
              >
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
