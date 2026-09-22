import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlusCircle, Calendar, MapPin, Users, ArrowLeft, Trophy, UserPlus, X, ShieldCheck } from 'lucide-react';
import AlertToast from '../components/AlertToast';

export default function CreateSessionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sports, setSports] = useState([]);
  const [sportId, setSportId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [venue, setVenue] = useState('');

  // Team configurations & pre-filled players
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Input, setTeam1Input] = useState('');
  const [team2Input, setTeam2Input] = useState('');
  const [hostTeam, setHostTeam] = useState('Team 1');

  // Number of additional players looking for
  const [additionalPlayersRequired, setAdditionalPlayersRequired] = useState(4);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Minimum date = current moment in YYYY-MM-DDTHH:mm format
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  useEffect(() => {
    async function loadActiveSports() {
      try {
        const data = await api.get('/api/sports?activeOnly=true');
        const activeSports = data.sports || [];
        setSports(activeSports);
        if (activeSports.length > 0) {
          setSportId(activeSports[0].id);
        }
      } catch (err) {
        console.error('Failed to load sports:', err);
      }
    }
    loadActiveSports();
  }, []);

  const handleAddPlayerTeam1 = (e) => {
    e?.preventDefault();
    if (!team1Input.trim()) return;
    setTeam1Players([...team1Players, team1Input.trim()]);
    setTeam1Input('');
  };

  const handleRemovePlayerTeam1 = (index) => {
    setTeam1Players(team1Players.filter((_, i) => i !== index));
  };

  const handleAddPlayerTeam2 = (e) => {
    e?.preventDefault();
    if (!team2Input.trim()) return;
    setTeam2Players([...team2Players, team2Input.trim()]);
    setTeam2Input('');
  };

  const handleRemovePlayerTeam2 = (index) => {
    setTeam2Players(team2Players.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!sportId) {
      setErrorMessage('Please select a sport.');
      return;
    }

    if (!scheduledAt) {
      setErrorMessage('Please specify match date and time.');
      return;
    }

    if (new Date(scheduledAt) <= new Date()) {
      setErrorMessage('Match date and time must be set in the future.');
      return;
    }

    if (!venue.trim()) {
      setErrorMessage('Please provide a venue or court name.');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/sessions', {
        sportId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        venue: venue.trim(),
        additionalPlayersRequired: parseInt(additionalPlayersRequired, 10) || 0,
        team: hostTeam === 'Team 1' ? (team1Name.trim() || 'Team 1') : (team2Name.trim() || 'Team 2'),
        team1Name: team1Name.trim() || 'Team 1',
        team2Name: team2Name.trim() || 'Team 2',
        team1Players,
        team2Players,
      });

      navigate(`/sessions/${data.session.id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create match session.');
    } finally {
      setLoading(false);
    }
  };

  const totalPreFilled = team1Players.length + team2Players.length;
  const totalCapacity = 1 + totalPreFilled + (parseInt(additionalPlayersRequired, 10) || 0);

  return (
    <div style={{ maxWidth: 720, margin: '1.5rem auto' }}>
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
          <ArrowLeft size={16} /> Back to Matches
        </Link>
        <h1 style={{ fontSize: '1.85rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
          Host a Sports Match
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
          Schedule a game, add available players to Team 1 and Team 2, and specify additional spots needed.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <AlertToast type="error" message={errorMessage} onClose={() => setErrorMessage('')} />

        <form onSubmit={handleSubmit}>
          {/* Sport Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="match-sport">
              Sport <span style={{ color: '#10b981' }}>*</span>
            </label>
            <select
              id="match-sport"
              className="form-select"
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              required
              disabled={loading}
            >
              {sports.length === 0 ? (
                <option value="">No active sports available</option>
              ) : (
                sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.description ? `— ${s.description}` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="match-time">
              Match Date & Start Time <span style={{ color: '#10b981' }}>*</span>
            </label>
            <input
              id="match-time"
              type="datetime-local"
              className="form-input"
              min={minDateTime}
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={loading}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Sessions cannot be scheduled in the past or overlap with matches you are already in.
            </span>
          </div>

          {/* Venue */}
          <div className="form-group">
            <label className="form-label" htmlFor="match-venue">
              Venue / Court / Pitch Location <span style={{ color: '#10b981' }}>*</span>
            </label>
            <input
              id="match-venue"
              type="text"
              className="form-input"
              placeholder="e.g. City Sports Arena, Turf Pitch 2, 5th Floor"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Teams and Player Rosters Section */}
          <div style={{ borderTop: '1px solid #1f293d', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#38bdf8" /> Team Rosters & Available Players
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Fill in the names of players who are already confirmed to play in Team 1 and Team 2.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {/* Team 1 Box */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label" style={{ color: '#38bdf8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Team 1 Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    placeholder="e.g. Team A or Red Strikers"
                    disabled={loading}
                  />
                </div>

                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Already Available Players ({team1Players.length})
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={team1Input}
                    onChange={(e) => setTeam1Input(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlayerTeam1();
                      }
                    }}
                    placeholder="Type player name & press Add"
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayerTeam1}
                    className="btn btn-secondary"
                    style={{ minHeight: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                    disabled={!team1Input.trim() || loading}
                  >
                    Add
                  </button>
                </div>

                {/* Team 1 Player List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '32px' }}>
                  {team1Players.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No players added yet</span>
                  ) : (
                    team1Players.map((name, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '6px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerTeam1(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Team 2 Box */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label" style={{ color: '#f59e0b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Team 2 Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    placeholder="e.g. Team B or Blue Titans"
                    disabled={loading}
                  />
                </div>

                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Already Available Players ({team2Players.length})
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={team2Input}
                    onChange={(e) => setTeam2Input(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlayerTeam2();
                      }
                    }}
                    placeholder="Type player name & press Add"
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayerTeam2}
                    className="btn btn-secondary"
                    style={{ minHeight: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                    disabled={!team2Input.trim() || loading}
                  >
                    Add
                  </button>
                </div>

                {/* Team 2 Player List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '32px' }}>
                  {team2Players.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No players added yet</span>
                  ) : (
                    team2Players.map((name, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerTeam2(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Host Team & Additional Players Required */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="host-team">
                Your Team (Host Assignment)
              </label>
              <select
                id="host-team"
                className="form-select"
                value={hostTeam}
                onChange={(e) => setHostTeam(e.target.value)}
                disabled={loading}
              >
                <option value="Team 1">{team1Name || 'Team 1'}</option>
                <option value="Team 2">{team2Name || 'Team 2'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="match-players">
                Additional Players Looking For <span style={{ color: '#10b981' }}>*</span>
              </label>
              <input
                id="match-players"
                type="number"
                className="form-input"
                min="0"
                max="50"
                required
                value={additionalPlayersRequired}
                onChange={(e) => setAdditionalPlayersRequired(e.target.value)}
                disabled={loading}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                Open spots that other players can join through this platform.
              </span>
            </div>
          </div>

          {/* Roster & Capacity Summary Box */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Match Capacity Breakdown
              </div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                <strong>1</strong> Host ({hostTeam}) + <strong>{totalPreFilled}</strong> Pre-filled players + <strong>{parseInt(additionalPlayersRequired, 10) || 0}</strong> Open spots
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Capacity</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {totalCapacity} Players
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/sessions" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || sports.length === 0}
              className="btn btn-primary"
            >
              <PlusCircle size={16} />
              {loading ? 'Creating Match...' : 'Publish Match Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
