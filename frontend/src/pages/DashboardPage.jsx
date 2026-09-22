import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Users,
  Trophy,
  PlusCircle,
  ArrowRight,
  Activity,
  Layers,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import SessionCard from '../components/SessionCard';
import StatusBadge from '../components/StatusBadge';
import AlertToast from '../components/AlertToast';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [createdSessions, setCreatedSessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [openSessions, setOpenSessions] = useState([]);
  const [sportsCount, setSportsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [joiningId, setJoiningId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [myCreatedRes, myJoinedRes, allOpenRes, sportsRes] = await Promise.all([
        api.get('/api/sessions/my/created'),
        api.get('/api/sessions/my/joined'),
        api.get('/api/sessions?futureOnly=true&status=OPEN'),
        api.get('/api/sports?activeOnly=true'),
      ]);

      setCreatedSessions(myCreatedRes.sessions || []);
      setJoinedSessions(myJoinedRes.sessions || []);
      setOpenSessions(allOpenRes.sessions || []);
      setSportsCount((sportsRes.sports || []).length);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickJoin = async (sessionId) => {
    try {
      setJoiningId(sessionId);
      await api.post(`/api/sessions/${sessionId}/join`, {});
      setActionMessage('Successfully joined the session!');
      await loadData();
    } catch (err) {
      setActionMessage(err.message || 'Failed to join session');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #1f293d',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.85rem', color: '#f8fafc' }}>
              Hello, {user?.name.split(' ')[0]}
            </h1>
            <StatusBadge status={user?.role} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
            Coordinate your matches, manage lineups, and check upcoming sports events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/sessions/create" className="btn btn-primary">
            <PlusCircle size={16} /> Host Match
          </Link>
          <Link to="/sessions" className="btn btn-secondary">
            Browse All Matches <ArrowRight size={16} />
          </Link>
          {isAdmin && (
            <Link to="/admin/reports" className="btn btn-secondary" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}>
              <BarChart3 size={16} color="#818cf8" /> Reports Dashboard
            </Link>
          )}
        </div>
      </div>

      <AlertToast type="success" message={actionMessage} onClose={() => setActionMessage('')} />

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>MATCHES JOINED</span>
            <Users size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>
            {joinedSessions.length}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>
            Active & completed matches
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>MATCHES HOSTED</span>
            <Calendar size={18} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>
            {createdSessions.length}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>
            Organized by you
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>AVAILABLE OPEN MATCHES</span>
            <Activity size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>
            {openSessions.length}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>
            Open for players
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>SPORTS CATALOG</span>
            <Layers size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc' }}>
            {sportsCount}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>
            Available to schedule
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Open Public Sessions Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Upcoming Open Matches</h3>
            <Link to="/sessions" style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          {openSessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <Trophy size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No open upcoming matches right now.</p>
              <Link to="/sessions/create" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                Host the First Match
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {openSessions.slice(0, 4).map((sess) => (
                <SessionCard
                  key={sess.id}
                  session={sess}
                  currentUserId={user?.id}
                  onJoin={handleQuickJoin}
                  joiningId={joiningId}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Matches Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>My Matches</h3>
            <Link to="/my-sessions" style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>
              Manage
            </Link>
          </div>

          {joinedSessions.length === 0 && createdSessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <Calendar size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>You haven't joined or hosted any matches yet.</p>
              <Link to="/sessions" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                Explore Matches to Join
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...createdSessions, ...joinedSessions]
                .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
                .slice(0, 4)
                .map((sess) => (
                  <SessionCard key={sess.id} session={sess} currentUserId={user?.id} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
