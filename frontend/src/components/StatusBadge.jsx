import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const norm = (status || '').toUpperCase();

  let badgeClass = 'badge-open';
  let label = norm;

  switch (norm) {
    case 'OPEN':
      badgeClass = 'badge-open';
      label = 'Open for Players';
      break;
    case 'FULL':
      badgeClass = 'badge-full';
      label = 'Match Full';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-completed';
      label = 'Played';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-cancelled';
      label = 'Cancelled';
      break;
    case 'ADMIN':
      badgeClass = 'badge-admin';
      label = 'Admin';
      break;
    case 'PLAYER':
      badgeClass = 'badge-player';
      label = 'Player';
      break;
    default:
      badgeClass = 'badge-open';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {label}
    </span>
  );
}
