import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SessionCard({ session, currentUserId, onJoin, joiningId }) {
  if (!session) return null;

  const {
    id,
    sport,
    creator,
    scheduledAt,
    venue,
    totalCapacity,
    currentParticipants,
    availableSlots,
    status,
    isPast,
    isFull,
    participants = [],
  } = session;

  const isCreator = creator?.id === currentUserId;
  const isEnrolled = participants.some((p) => p.userId === currentUserId);
  const isCancelled = status === 'CANCELLED';

  const dateObj = new Date(scheduledAt);
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const percentFilled = Math.min(100, Math.round((currentParticipants / totalCapacity) * 100));

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar: Sport and Status */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '0.25rem 0.65rem',
              borderRadius: 6,
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            {sport?.name || 'General Sport'}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Venue Title */}
        <h4
          style={{
            fontSize: '1.15rem',
            color: '#f8fafc',
            marginBottom: '0.75rem',
            fontWeight: 700,
          }}
        >
          {venue}
        </h4>

        {/* Date & Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        >
          <Calendar size={15} color="#0ea5e9" />
          <span>
            {dateFormatted} &bull; {timeFormatted}
          </span>
        </div>

        {/* Host info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.825rem',
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={14} color="#6366f1" />
          <span>Hosted by {creator?.name || 'Player'}</span>
          {isCreator && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>(You)</span>
          )}
        </div>

        {/* Cancellation Notice if applicable */}
        {isCancelled && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 6,
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fecdd3',
              fontSize: '0.825rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Match Cancelled
            </div>
            <div>
              <strong>Reason:</strong> {session.cancellationReason || 'Cancelled by organizer / administrator'}
            </div>
          </div>
        )}

        {/* Capacity Progress */}
        {!isCancelled && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#94a3b8',
                marginBottom: '0.35rem',
              }}
            >
              <span>
                {(currentParticipants || 0) + (session.prefilledCount || 0)} / {totalCapacity} players
              </span>
              <span style={{ fontWeight: 600, color: availableSlots > 0 ? '#10b981' : '#f59e0b' }}>
                {availableSlots > 0 ? `${availableSlots} spots left` : 'Full'}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${percentFilled}%`,
                  background: availableSlots === 0 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          borderTop: '1px solid #1f293d',
          paddingTop: '1rem',
          marginTop: '0.5rem',
        }}
      >
        <Link
          to={`/sessions/${id}`}
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: '0.85rem', minHeight: 38 }}
        >
          Details <ArrowRight size={14} />
        </Link>

        {isEnrolled ? (
          <span
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Check size={14} /> Enrolled
          </span>
        ) : availableSlots > 0 && !isCancelled && !isPast ? (
          <button
            onClick={() => onJoin && onJoin(id)}
            disabled={joiningId === id}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', minHeight: 38, padding: '0.5rem 1rem' }}
          >
            {joiningId === id ? 'Joining...' : 'Quick Join'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
