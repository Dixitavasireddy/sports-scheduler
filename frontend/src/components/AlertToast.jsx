import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AlertToast({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        padding: '0.85rem 1.25rem',
        borderRadius: 8,
        background: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
        color: isSuccess ? '#a7f3d0' : '#fecdd3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        fontSize: '0.9rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {isSuccess ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f43f5e" />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
