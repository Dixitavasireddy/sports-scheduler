import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function CancelModal({ isOpen, onClose, onConfirm, sessionTitle, loading }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
      // Auto-focus after modal transition
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Please provide a descriptive reason (at least 3 characters).');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
      style={{ zIndex: 1000, pointerEvents: 'auto' }}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto', position: 'relative' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Cancel Match</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(loading)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Are you sure you want to cancel {sessionTitle ? <strong>{sessionTitle}</strong> : 'this session'}? All enrolled
          participants and administrators will see this reason, and the session will be archived.
        </p>

        {error && (
          <div style={{ color: '#fb7185', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="cancel-reason">
              Cancellation Reason <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="cancel-reason"
              className="form-textarea"
              rows={4}
              placeholder="e.g. Venue double-booked, adverse weather conditions, court maintenance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={Boolean(loading)}
              required
              autoFocus
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem 1rem',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                pointerEvents: 'auto',
                cursor: 'text',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(loading)}
              className="btn btn-secondary"
            >
              Keep Session
            </button>
            <button
              type="submit"
              disabled={Boolean(loading) || !reason.trim()}
              className="btn btn-danger"
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
