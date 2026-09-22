import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, Users, PlusCircle, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';
import SessionCard from '../components/SessionCard';
import CancelModal from '../components/CancelModal';
import AlertToast from '../components/AlertToast';

export default function MySessionsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'created';

  const [createdSessions, setCreatedSessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation state
  const [cancelModalSession, setCancelModalSession] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadMySessions = async () => {
    try {
      setLoading(true);
      const [createdRes, joinedRes] = await Promise.all([
        api.get('/api/sessions/my/created'),
        api.get('/api/sessions/my/joined'),
      ]);
      setCreatedSessions(createdRes.sessions || []);
      setJoinedSessions(joinedRes.sessions || []);
    } catch (err) {
      console.error(err);
      setToastType('error');
      setToastMessage(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMySessions();
  }, []);

  const handleCancelConfirm = async (cancellationReason) => {
    if (!cancelModalSession) return;
    try {
      setCancelling(true);
      await api.post(`/api/sessions/${cancelModalSession.id}/cancel`, { cancellationReason });
      setToastType('success');
      setToastMessage('Match session successfully cancelled.');
      setCancelModalSession(null);
      await loadMySessions();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to cancel match.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
            My Matches & Sessions
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
            Manage the matches you host and review sessions you are playing in.
          </p>
        </div>

        <Link to="/sessions/create" className="btn btn-primary">
          <PlusCircle size={16} /> Host New Match
        </Link>
      </div>

      <AlertToast type={toastType} message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #1f293d',
          marginBottom: '2rem',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={() => setSearchParams({ tab: 'created' })}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'created' ? '#10b981' : 'transparent'}`,
            color: activeTab === 'created' ? '#10b981' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={16} /> Hosted by Me ({createdSessions.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'joined' })}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'joined' ? '#0ea5e9' : 'transparent'}`,
            color: activeTab === 'joined' ? '#0ea5e9' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={16} /> Joined by Me ({joinedSessions.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading your matches...
        </div>
      ) : activeTab === 'created' ? (
        createdSessions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Calendar size={40} color="#475569" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
              No Hosted Matches Yet
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              You haven't scheduled any sports sessions yet.
            </p>
            <Link to="/sessions/create" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              <PlusCircle size={16} /> Host Your First Match
            </Link>
          </div>
        ) : (
          <div className="grid-responsive">
            {createdSessions.map((sess) => (
              <div key={sess.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <SessionCard session={sess} currentUserId={user?.id} />
                {sess.status !== 'CANCELLED' && (
                  <button
                    onClick={() => setCancelModalSession(sess)}
                    className="btn btn-outline-danger"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', minHeight: 34 }}
                  >
                    <XCircle size={14} /> Cancel This Match
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : joinedSessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Users size={40} color="#475569" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
            No Joined Matches
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            You haven't registered for any matches yet. Browse open sessions to join!
          </p>
          <Link to="/sessions" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
            Browse Available Matches <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid-responsive">
          {joinedSessions.map((sess) => (
            <SessionCard key={sess.id} session={sess} currentUserId={user?.id} />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={Boolean(cancelModalSession)}
        onClose={() => setCancelModalSession(null)}
        onConfirm={handleCancelConfirm}
        sessionTitle={cancelModalSession ? `${cancelModalSession.sport?.name} at ${cancelModalSession.venue}` : ''}
        loading={cancelling}
      />
    </div>
  );
}
