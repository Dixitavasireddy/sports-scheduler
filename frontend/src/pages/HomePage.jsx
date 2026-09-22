import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Users, ShieldCheck, ArrowRight, Activity, MapPin } from 'lucide-react';
import { api } from '../services/api';
import SessionCard from '../components/SessionCard';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [featuredSessions, setFeaturedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        if (isAuthenticated) {
          const data = await api.get('/api/sessions?futureOnly=true');
          setFeaturedSessions((data.sessions || []).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, [isAuthenticated]);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 0 3rem',
          textAlign: 'center',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: 9999,
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <Activity size={15} /> Real-Time Sports Session Coordinator
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#f8fafc',
            fontWeight: 800,
          }}
        >
          Schedule Matches. Fill Courts. <span style={{ color: '#10b981' }}>Play Together.</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '2.25rem',
          }}
        >
          A production-grade sports scheduling platform with PostgreSQL transactions, Passport.js session security,
          role-based authorization, and real-time team lineup management.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
              <Link to="/sessions/create" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                + Host New Match
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                Sign In to Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ margin: '4rem 0' }}>
        <div className="grid-responsive">
          <div className="card" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Dynamic Scheduling
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
              Host matches with date, venue, team configurations, and required players. Automatically locks when capacity is reached.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Team Lineups & Capacity
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
              Transactional participation guarantees no double-booking or overfilling. Join with team tags and manage rosters cleanly.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Enterprise Security
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
              Strict RBAC authorization, Passport.js server-side sessions, double-submit CSRF verification, and hashed credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Matches Preview (if authenticated) */}
      {isAuthenticated && featuredSessions.length > 0 && (
        <section style={{ margin: '3rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>Upcoming Public Matches</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Open sessions ready for additional players</p>
            </div>
            <Link to="/sessions" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-responsive">
            {featuredSessions.map((sess) => (
              <SessionCard key={sess.id} session={sess} currentUserId={user?.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
