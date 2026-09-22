import React from 'react';
import { Shield, Database, Lock, Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0a0e17',
        borderTop: '1px solid #1f293d',
        padding: '2.5rem 1.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#022c22',
              }}
            >
              <Trophy size={16} />
            </div>
            <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
              Sports Scheduler
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 9999,
                background: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
              }}
            >
              WD501 Advanced Backend Capstone
            </span>
          </div>

          {/* Security & Tech Highlights */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              color: '#64748b',
              fontSize: '0.825rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Database size={14} color="#38bdf8" /> PostgreSQL & Sequelize
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} color="#10b981" /> Passport.js & Sessions
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} color="#a78bfa" /> CSRF & RBAC Protected
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            borderTop: '1px solid #172033',
            paddingTop: '1.25rem',
            color: '#475569',
            fontSize: '0.8rem',
          }}
        >
          <div>
            Built with production architecture: Node.js, Express, PostgreSQL, React, and Vite.
          </div>
          <div>
            Default Admin: <code style={{ color: '#94a3b8' }}>admin@sportsscheduler.com</code>
          </div>
        </div>
      </div>
    </footer>
  );
}
