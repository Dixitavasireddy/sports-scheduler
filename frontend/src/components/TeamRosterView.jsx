import React from 'react';
import { Users, User, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function TeamRosterView({ session, currentUserId, onJoin, joining }) {
  if (!session) return null;

  const participants = session.participants || [];
  const creatorId = session.creatorId;
  const availableSlots = session.availableSlots || 0;
  const isCancelled = session.status === 'CANCELLED';
  const isFull = session.isFull || session.status === 'FULL';
  const isPast = session.isPast;

  const userAlreadyJoined = participants.some((p) => p.userId === currentUserId);
  const canJoin = !userAlreadyJoined && !isCancelled && !isFull && !isPast;

  const team1Name = session.team1Name || 'Team 1';
  const team2Name = session.team2Name || 'Team 2';
  const team1PreFilled = Array.isArray(session.team1Players) ? session.team1Players : [];
  const team2PreFilled = Array.isArray(session.team2Players) ? session.team2Players : [];

  // Categorize registered participants
  const team1Registered = participants.filter(
    (p) =>
      (p.team || '').toLowerCase() === team1Name.toLowerCase() ||
      (p.team || '').toLowerCase().includes('1') ||
      (p.team || '').toLowerCase().includes('a') ||
      !p.team
  );
  const team2Registered = participants.filter(
    (p) =>
      (p.team || '').toLowerCase() === team2Name.toLowerCase() ||
      (p.team || '').toLowerCase().includes('2') ||
      (p.team || '').toLowerCase().includes('b')
  );

  const renderPlayerCard = (p) => {
    const isCreator = p.userId === creatorId;
    const isMe = p.userId === currentUserId;
    const name = p.user ? p.user.name : 'Registered Player';
    const initial = name.charAt(0).toUpperCase();

    return (
      <div
        key={p.id || p.userId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: isMe ? 'rgba(16, 185, 129, 0.08)' : '#1e293b',
          border: `1px solid ${isMe ? 'rgba(16, 185, 129, 0.4)' : '#334155'}`,
          borderRadius: 8,
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isMe ? '#10b981' : isCreator ? '#6366f1' : '#475569',
              color: isMe ? '#022c22' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
              {name} {isMe && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>(You)</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {p.team || 'Player'}
            </div>
          </div>
        </div>

        {isCreator && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.725rem',
              fontWeight: 600,
              color: '#a5b4fc',
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: 4,
            }}
          >
            <ShieldCheck size={13} /> Host
          </span>
        )}
      </div>
    );
  };

  const renderPrefilledCard = (name, index) => (
    <div
      key={`prefilled-${name}-${index}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid #1f293d',
        borderRadius: 8,
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#334155',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{name}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confirmed Teammate</div>
        </div>
      </div>

      <span
        style={{
          fontSize: '0.725rem',
          fontWeight: 600,
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.12)',
          padding: '0.2rem 0.5rem',
          borderRadius: 4,
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        Host Roster
      </span>
    </div>
  );

  const renderEmptySlot = (index) => (
    <div
      key={`empty-${index}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px dashed #334155',
        borderRadius: 8,
        marginBottom: '0.5rem',
        color: '#64748b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          <User size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>Open Player Spot</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting registration</div>
        </div>
      </div>

      {canJoin && (
        <button
          onClick={() => onJoin && onJoin()}
          disabled={joining}
          className="btn btn-primary"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', minHeight: 'auto' }}
        >
          <Plus size={14} /> Join
        </button>
      )}
    </div>
  );

  const totalFilled = participants.length + team1PreFilled.length + team2PreFilled.length;

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Match Rosters & Lineup</h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          <strong>{totalFilled}</strong> of <strong>{session.totalCapacity}</strong> players confirmed &bull;{' '}
          <span style={{ color: availableSlots > 0 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {availableSlots > 0 ? `${availableSlots} open spots` : 'Full capacity'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Team 1 Column */}
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#38bdf8',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }}></span>
            {team1Name} ({team1Registered.length + team1PreFilled.length})
          </div>

          {team1Registered.map(renderPlayerCard)}
          {team1PreFilled.map((name, idx) => renderPrefilledCard(name, idx))}

          {team1Registered.length === 0 && team1PreFilled.length === 0 && (
            <div style={{ padding: '1rem', border: '1px dashed #334155', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No players in {team1Name} yet
            </div>
          )}
        </div>

        {/* Team 2 Column */}
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#f59e0b',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
            {team2Name} ({team2Registered.length + team2PreFilled.length})
          </div>

          {team2Registered.map(renderPlayerCard)}
          {team2PreFilled.map((name, idx) => renderPrefilledCard(name, idx))}

          {team2Registered.length === 0 && team2PreFilled.length === 0 && (
            <div style={{ padding: '1rem', border: '1px dashed #334155', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No players in {team2Name} yet
            </div>
          )}
        </div>
      </div>

      {/* Open Additional Player Slots (Looking for X more) */}
      {availableSlots > 0 && !isCancelled && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1f293d', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Open Recruiting Slots ({availableSlots} spots looking for players)
          </div>
          <div>
            {Array.from({ length: Math.min(6, availableSlots) }).map((_, i) => renderEmptySlot(i))}
            {availableSlots > 6 && (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                + {availableSlots - 6} additional open spots available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
