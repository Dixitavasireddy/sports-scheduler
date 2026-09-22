import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layers, Plus, Edit2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import AlertToast from '../components/AlertToast';

export default function AdminSportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null); // null = Add, obj = Edit

  // Form states
  const [sportName, setSportName] = useState('');
  const [sportDescription, setSportDescription] = useState('');
  const [sportActive, setSportActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadSports = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/sports');
      setSports(data.sports || []);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to load sports list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  const openAddModal = () => {
    setEditingSport(null);
    setSportName('');
    setSportDescription('');
    setSportActive(true);
    setModalOpen(true);
  };

  const openEditModal = (sport) => {
    setEditingSport(sport);
    setSportName(sport.name);
    setSportDescription(sport.description || '');
    setSportActive(sport.active);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sportName.trim()) return;

    try {
      setFormSubmitting(true);
      if (editingSport) {
        // Update
        await api.put(`/api/sports/${editingSport.id}`, {
          name: sportName.trim(),
          description: sportDescription.trim(),
          active: sportActive,
        });
        setToastType('success');
        setToastMessage(`Sport "${sportName.trim()}" updated successfully.`);
      } else {
        // Create
        await api.post('/api/sports', {
          name: sportName.trim(),
          description: sportDescription.trim(),
          active: sportActive,
        });
        setToastType('success');
        setToastMessage(`Sport "${sportName.trim()}" created successfully.`);
      }
      setModalOpen(false);
      await loadSports();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to save sport.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#818cf8',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: 4,
              }}
            >
              ADMINISTRATOR
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
            Sports Catalog Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
            Create sports, configure descriptions, and activate or deactivate sports from session scheduling.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add New Sport
        </button>
      </div>

      <AlertToast type={toastType} message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sport Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Loading sports catalog...
                  </td>
                </tr>
              ) : sports.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No sports defined. Click "Add New Sport" above to create one.
                  </td>
                </tr>
              ) : (
                sports.map((sport) => (
                  <tr key={sport.id}>
                    <td>
                      <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{sport.name}</strong>
                    </td>
                    <td style={{ color: '#94a3b8', maxWidth: 380 }}>
                      {sport.description || <span style={{ color: '#64748b' }}>None</span>}
                    </td>
                    <td>
                      {sport.active ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#34d399',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#f87171',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                      {new Date(sport.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(sport)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: 'auto' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Sport Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '1.25rem' }}>
              {editingSport ? `Edit Sport: ${editingSport.name}` : 'Add New Sport'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="sport-name-input">
                  Sport Name <span style={{ color: '#10b981' }}>*</span>
                </label>
                <input
                  id="sport-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pickleball, Rugby, Swimming"
                  required
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sport-desc-input">
                  Description
                </label>
                <textarea
                  id="sport-desc-input"
                  className="form-textarea"
                  rows={3}
                  placeholder="Brief description of gameplay, requirements, or format..."
                  value={sportDescription}
                  onChange={(e) => setSportDescription(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  id="sport-active-input"
                  type="checkbox"
                  style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                  checked={sportActive}
                  onChange={(e) => setSportActive(e.target.checked)}
                  disabled={formSubmitting}
                />
                <label htmlFor="sport-active-input" style={{ color: '#f8fafc', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Sport is Active (Available for new sessions)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="btn btn-primary">
                  {formSubmitting ? 'Saving...' : editingSport ? 'Save Changes' : 'Create Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
