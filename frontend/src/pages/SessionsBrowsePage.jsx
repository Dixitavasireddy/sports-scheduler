import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Filter, PlusCircle, Calendar, RefreshCw } from 'lucide-react';
import SessionCard from '../components/SessionCard';
import AlertToast from '../components/AlertToast';

export default function SessionsBrowsePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [futureOnly, setFutureOnly] = useState(false);

  const [joiningId, setJoiningId] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedSport) queryParams.set('sportId', selectedSport);
      if (selectedStatus) queryParams.set('status', selectedStatus);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (futureOnly) queryParams.set('futureOnly', 'true');

      const [sessRes, sportsRes] = await Promise.all([
        api.get(`/api/sessions?${queryParams.toString()}`),
        api.get('/api/sports'),
      ]);

      setSessions(sessRes.sessions || []);
      setSports(sportsRes.sports || []);
    } catch (err) {
      console.error(err);
      setAlertType('error');
      setAlertMessage(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSport, selectedStatus, futureOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleJoin = async (sessionId) => {
    try {
      setJoiningId(sessionId);
      await api.post(`/api/sessions/${sessionId}/join`, {});
      setAlertType('success');
      setAlertMessage('You have successfully joined this match!');
      await loadData();
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.message || 'Could not join session');
    } finally {
      setJoiningId(null);
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
          <h1 style={{ fontSize: '1.85rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
            Browse Sports Matches
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
            Find upcoming sessions across venues, check available slots, and register for teams.
          </p>
        </div>

        <Link to="/sessions/create" className="btn btn-primary">
          <PlusCircle size={16} /> Host a Match
        </Link>
      </div>

      <AlertToast
        type={alertType}
        message={alertMessage}
        onClose={() => setAlertMessage('')}
      />

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}
        >
          {/* Search Query */}
          <div>
            <label className="form-label" htmlFor="filter-search">
              Search Venue / Location
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="filter-search"
                type="text"
                className="form-input"
                placeholder="e.g. Metro Turf, Arena..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Sport Filter */}
          <div>
            <label className="form-label" htmlFor="filter-sport">
              Sport
            </label>
            <select
              id="filter-sport"
              className="form-select"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              <option value="">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {!s.active ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label" htmlFor="filter-status">
              Match Status
            </label>
            <select
              id="filter-status"
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open (Spots Available)</option>
              <option value="FULL">Full</option>
              <option value="COMPLETED">Played / Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Actions & Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ flex: 1, minHeight: 48 }}
            >
              <Filter size={15} /> Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSport('');
                setSelectedStatus('');
                setSearchQuery('');
                setFutureOnly(false);
              }}
              className="btn btn-secondary"
              title="Reset Filters"
              style={{ padding: '0 0.85rem', minHeight: 48 }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </form>

        {/* Quick Filter Status Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', borderTop: '1px solid #1f293d', paddingTop: '0.85rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center', marginRight: '0.25rem' }}>Quick View:</span>
          <button
            type="button"
            onClick={() => setSelectedStatus('')}
            className={`btn ${selectedStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minHeight: '34px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
          >
            All Matches
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('OPEN')}
            className={`btn ${selectedStatus === 'OPEN' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minHeight: '34px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
          >
            Open Matches
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('CANCELLED')}
            className={`btn ${selectedStatus === 'CANCELLED' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ minHeight: '34px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
          >
            Cancelled Matches & Reasons
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading matches...
        </div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Calendar size={40} color="#475569" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
            No Matches Found
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            No sessions match your filter criteria. Try adjusting the sport or status filter.
          </p>
          <Link to="/sessions/create" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <PlusCircle size={16} /> Host a Match Now
          </Link>
        </div>
      ) : (
        <div className="grid-responsive">
          {sessions.map((sess) => (
            <SessionCard
              key={sess.id}
              session={sess}
              currentUserId={user?.id}
              onJoin={handleJoin}
              joiningId={joiningId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
