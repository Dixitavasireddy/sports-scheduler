import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Users,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Plus,
  LogOut,
  XCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import TeamRosterView from '../components/TeamRosterView';
import CancelModal from '../components/CancelModal';
import AlertToast from '../components/AlertToast';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [teamSelection, setTeamSelection] = useState('Team A');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/sessions/${id}`);
      setSession(data.session);
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.message || 'Failed to load match details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      await api.post(`/api/sessions/${id}/join`, { team: teamSelection });
      setAlertType('success');
      setAlertMessage('Successfully registered for the match!');
      await loadSession();
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.message || 'Failed to join match');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this match?')) return;
    try {
      setLeaving(true);
      await api.post(`/api/sessions/${id}/leave`, {});
      setAlertType('success');
      setAlertMessage('You have left the match.');
      await loadSession();
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.message || 'Failed to leave match');
    } finally {
      setLeaving(false);
    }
  };

  const handleCancelConfirm = async (cancellationReason) => {
    try {
      setCancelling(true);
      await api.post(`/api/sessions/${id}/cancel`, { cancellationReason });
      setCancelModalOpen(false);
      setAlertType('success');
      setAlertMessage('Match session has been cancelled.');
      await loadSession();
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.message || 'Failed to cancel match');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        Loading match details...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Session Not Found</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          This match session may have been deleted or the link is invalid.
        </p>
        <Link to="/sessions" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Matches
        </Link>
      </div>
    );
  }

  const isCreator = session.creatorId === user?.id;
  const isEnrolled = (session.participants || []).some((p) => p.userId === user?.id);
  const isCancelled = session.status === 'CANCELLED';
  const isFull = session.isFull || session.status === 'FULL';
  const isPast = session.isPast;
  const canJoin = !isEnrolled && !isCancelled && !isFull && !isPast;

  const dateObj = new Date(session.scheduledAt);
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Navigation & Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/sessions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Browse
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {session.sport?.name}
              </span>
              <StatusBadge status={session.status} />
            </div>
            <h1 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
              {session.venue}
            </h1>
          </div>

          {/* Top Quick Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(isCreator || user?.role === 'ADMIN') && !isCancelled && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="btn btn-outline-danger"
              >
                <XCircle size={16} /> Cancel Session {user?.role === 'ADMIN' && !isCreator && '(Admin)'}
              </button>
            )}
            {isEnrolled && !isCreator && !isCancelled && !isPast && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="btn btn-secondary"
              >
                <LogOut size={16} /> {leaving ? 'Leaving...' : 'Leave Match'}
              </button>
            )}
          </div>
        </div>
      </div>

      <AlertToast type={alertType} message={alertMessage} onClose={() => setAlertMessage('')} />

      {/* Cancellation Notice Banner (Section 27) */}
      {isCancelled && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 12,
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fecdd3',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          <AlertTriangle size={24} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
              This Match Session is CANCELLED
            </div>
            <div style={{ fontSize: '0.925rem', marginBottom: '0.4rem' }}>
              {session.cancellationReason ? (
                <span>
                  <strong>Cancellation Reason:</strong> &ldquo;{session.cancellationReason}&rdquo;
                </span>
              ) : (
                'This session has been cancelled.'
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fda4af' }}>
              No further participation changes or registrations are allowed.
            </div>
          </div>
        </div>
      )}

      {/* Past Session Alert */}
      {isPast && !isCancelled && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 8,
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            color: '#bae6fd',
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
          }}
        >
          This match was scheduled for <strong>{dateFormatted}</strong> and has concluded.
        </div>
      )}

      {/* Key Match Details Grid */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          padding: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            DATE & TIME
          </div>
          <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
            {dateFormatted}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
            {timeFormatted}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            SESSION HOST
          </div>
          <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
            {session.creator?.name}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {session.creator?.email}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            CAPACITY & SLOTS
          </div>
          <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
            {session.currentParticipants + (session.prefilledCount || 0)} of {session.totalCapacity} Players Confirmed
          </div>
          <div style={{ color: session.availableSlots > 0 ? '#10b981' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            {session.availableSlots > 0 ? `${session.availableSlots} open spots available` : 'Full capacity'}
          </div>
        </div>
      </div>

      {/* Join Box (if eligible) */}
      {canJoin && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                Spots Are Open — Join This Match
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Choose your preferred team designation and secure your spot on the roster.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ width: 'auto', minHeight: 42, padding: '0.4rem 0.85rem' }}
                value={teamSelection}
                onChange={(e) => setTeamSelection(e.target.value)}
              >
                <option value={session.team1Name || 'Team 1'}>{session.team1Name || 'Team 1'}</option>
                <option value={session.team2Name || 'Team 2'}>{session.team2Name || 'Team 2'}</option>
              </select>

              <button
                onClick={handleJoin}
                disabled={joining}
                className="btn btn-primary"
                style={{ minHeight: 42 }}
              >
                <Plus size={16} /> {joining ? 'Securing Spot...' : 'Confirm Join'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roster & Lineup Section */}
      <TeamRosterView
        session={session}
        currentUserId={user?.id}
        onJoin={handleJoin}
        joining={joining}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        sessionTitle={`${session.sport?.name} at ${session.venue}`}
        loading={cancelling}
      />
    </div>
  );
}
