import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Trophy,
  Filter,
  Download,
  Activity,
} from 'lucide-react';
import AlertToast from '../components/AlertToast';

export default function AdminReportsPage() {
  // Date ranges
  const defaultTo = new Date().toISOString().split('T')[0];
  const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReports = async (from = fromDate, to = toDate) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await api.get(`/api/reports/sessions?from=${from}&to=${to}`);
      setReport(data.report);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(fromDate, toDate);
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReports(fromDate, toDate);
  };

  const applyPreset = (days) => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    setFromDate(from);
    setToDate(to);
    fetchReports(from, to);
  };

  const summary = report?.summary || {};
  const statusBreakdown = report?.statusBreakdown || {};
  const sportPopularity = report?.sportPopularity || [];

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
                color: '#a78bfa',
                background: 'rgba(167, 139, 250, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: 4,
              }}
            >
              ADMINISTRATIVE ANALYTICS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
            Sessions & Sports Performance Report
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>
            Dynamic PostgreSQL query aggregates. Cancelled sessions are strictly excluded from played totals.
          </p>
        </div>
      </div>

      <AlertToast type="error" message={errorMessage} onClose={() => setErrorMessage('')} />

      {/* Date Range Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <form
          onSubmit={handleApplyFilter}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label" htmlFor="report-from">
              From Date
            </label>
            <input
              id="report-from"
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label" htmlFor="report-to">
              To Date
            </label>
            <input
              id="report-to"
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ minHeight: 48 }}>
            <Filter size={15} /> Apply Range
          </button>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', minHeight: 48, padding: '0 0.85rem' }}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', minHeight: 48, padding: '0 0.85rem' }}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => applyPreset(90)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', minHeight: 48, padding: '0 0.85rem' }}
            >
              Last 90 Days
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Calculating report aggregates from database...
        </div>
      ) : report ? (
        <>
          {/* KPI Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {/* Total Sessions */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL SCHEDULED</span>
                <Calendar size={18} color="#0ea5e9" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                {summary.totalSessions}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sessions in selected window</div>
            </div>

            {/* Total Played */}
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>SESSIONS PLAYED</span>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                {summary.totalPlayed}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Excludes cancelled matches</div>
            </div>

            {/* Total Cancelled */}
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f43f5e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#fb7185', fontWeight: 700 }}>CANCELLED</span>
                <XCircle size={18} color="#f43f5e" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>
                {summary.totalCancelled}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>With documented reasons</div>
            </div>

            {/* Total Attendance */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>PLAYER ATTENDANCE</span>
                <Users size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                {summary.totalParticipantsInPlayed}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Avg {summary.averagePlayersPerPlayedSession} players / game
              </div>
            </div>
          </div>

          {/* Visualization Section: Sport Popularity & Status Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Visual Bar Chart: Sport Popularity */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <BarChart3 size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Sport Popularity (Played Matches)</h3>
              </div>

              {sportPopularity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No matches completed in this date window.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sportPopularity.map((item, idx) => (
                    <div key={item.sport}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.sport}</span>
                        <span style={{ color: '#94a3b8' }}>
                          <strong>{item.count}</strong> matches ({item.percentage}%)
                        </span>
                      </div>
                      <div className="progress-bar" style={{ height: 10 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.percentage}%`,
                            background: idx === 0 ? '#10b981' : idx === 1 ? '#0ea5e9' : '#818cf8',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Breakdown Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Activity size={20} color="#0ea5e9" />
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Match Status Distribution</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>COMPLETED / PLAYED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                    {statusBreakdown.COMPLETED}
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: '#34d399' }}>OPEN UPCOMING</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                    {statusBreakdown.OPEN}
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>FULL UPCOMING</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                    {statusBreakdown.FULL}
                  </div>
                </div>

                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: '#fb7185' }}>CANCELLED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                    {statusBreakdown.CANCELLED}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popularity Detailed Data Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1f293d' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>Sport Breakdown Table</h3>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Sport</th>
                    <th>Played Matches</th>
                    <th>Share of Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sportPopularity.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No match records available in this range.
                      </td>
                    </tr>
                  ) : (
                    sportPopularity.map((sp) => (
                      <tr key={sp.sport}>
                        <td>
                          <strong style={{ color: '#f8fafc' }}>{sp.sport}</strong>
                        </td>
                        <td>{sp.count}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: 4,
                              background: '#1e293b',
                              fontWeight: 600,
                              color: '#34d399',
                            }}
                          >
                            {sp.percentage}%
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Active in Period</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
