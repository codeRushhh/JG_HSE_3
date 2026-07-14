import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../lib/dataStore.js';

const TILES = [
  {
    key: 'newPermit',
    title: 'New Permit',
    desc: 'Raise a new Permit to Work',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, var(--jg-green-600), var(--jg-green-900))',
    glow: 'rgba(12, 138, 70, 0.18)',
  },
  {
    key: 'register',
    title: 'PTW Register',
    desc: 'View, search & export all permits',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" strokeWidth="2" />
        <path d="M8 8H16M8 12H16M8 16H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #14A8DE, var(--jg-blue-600))',
    glow: 'rgba(0, 145, 201, 0.18)',
  },
  {
    key: 'dashboard',
    title: 'Dashboard',
    desc: 'Status overview & analytics',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V13M11 20V6M18 20V10" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #EDA13F, var(--jg-amber-600))',
    glow: 'rgba(224, 138, 43, 0.18)',
  },
];

export default function Home({ navigate }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((s) => { if (active) setStats(s); })
      .catch((e) => { if (active) setError(e.message || 'Could not load data.'); });
    return () => { active = false; };
  }, []);

  return (
    <div className="container page-enter" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ marginBottom: 26, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Joseph Group"
          style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0, boxShadow: 'var(--shadow-card)' }}
        />
        <div>
          <div className="eyebrow">JOSEPH GROUP &middot; HSE DEPARTMENT</div>
          <h1 style={{ fontSize: 30, marginTop: 4 }}>Permit to Work Application</h1>
          <div className="text-muted" style={{ marginTop: 6, fontSize: 14.5 }}>
            {stats
              ? `${stats.statusCounts.Active} active permit${stats.statusCounts.Active === 1 ? '' : 's'} right now · ${stats.total} total on record`
              : 'Loading permit data…'}
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--jg-red-100)', border: 'none', color: 'var(--jg-red-600)', fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 30,
        }}
      >
        {TILES.map((tile, i) => (
          <button
            key={tile.key}
            onClick={() => navigate(tile.key)}
            className="card card-hover"
            style={{
              textAlign: 'left',
              padding: 24,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              minHeight: 150,
              animation: `page-in 0.4s var(--ease-out) ${i * 0.06}s both`,
            }}
          >
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: tile.gradient,
                boxShadow: `0 6px 16px -4px ${tile.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {tile.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{tile.title}</div>
              <div className="text-muted" style={{ fontSize: 13.5, marginTop: 3 }}>{tile.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="eyebrow">STATUS SNAPSHOT</div>
        </div>
        {!stats ? (
          <div className="text-muted" style={{ fontSize: 13.5 }}>Loading…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14 }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="paper-card" style={{ padding: '14px 16px', transition: 'transform 0.15s var(--ease-out)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--jg-green-900)' }}>{count}</div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
