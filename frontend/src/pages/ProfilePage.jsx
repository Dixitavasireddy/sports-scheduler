import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  if (!user) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.put('/auth/change-password', pwForm);
      setPwSuccess(res.message || 'Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: user.role === 'ADMIN' ? '#4f46e5' : '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
              {user.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.email}</span>
              <StatusBadge status={user.role} />
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div style={{ borderTop: '1px solid #1f293d', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <KeyRound size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>Change Password</h3>
          </div>

          {pwSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <CheckCircle2 size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Current Password
              </label>
              <input
                type="password"
                className="input"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="input"
                  required
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Min. 8 characters"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="input"
                  required
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ borderTop: '1px solid #1f293d', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '1rem' }}>
            Account Capabilities
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Browse and join public match sessions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Host new match sessions with custom venue and team setups</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Manage player rosters and cancel hosted matches with reasons</span>
            </div>
            {user.role === 'ADMIN' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="#818cf8" />
                  <span>Admin access: Create, edit, and toggle active sports</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="#818cf8" />
                  <span>Admin access: View date-filtered SQL performance reports</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #1f293d', paddingTop: '1.5rem' }}>
          <button onClick={logout} className="btn btn-outline-danger">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
