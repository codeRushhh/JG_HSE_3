import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../lib/dataStore.js';

const STATUS_COLORS = {
  Active: 'var(--jg-green-700)',
  'Job Completed': 'var(--jg-blue-600)',
  Suspended: 'var(--jg-amber-600)',
  Cancelled: 'var(--jg-red-600)',
  Revalidated: 'var(--jg-navy-700)',
};

function StatCard({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: accent || 'var(--jg-charcoal-900)' }}>{value}</div>
      <div className="text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((s) => { if (active) setStats(s); })
      .catch((e) => { if (active) setError(e.message || 'Could not load data.'); });
    return () => { active = false; };
  }, []);

  if (error) {
    return <div className="container" style={{ paddingTop: 40 }}><p style={{ color: 'var(--jg-red-600)' }}>{error}</p></div>;
  }
  if (!stats) {
    return <div className="container" style={{ paddingTop: 40 }}><p className="text-muted">Loading dashboard…</p></div>;
  }

  const maxTypeCount = Math.max(1, ...Object.values(stats.byType));
  const maxStatusCount = Math.max(1, ...Object.values(stats.statusCounts));

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 50 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">OVERVIEW</div>
        <h1 style={{ fontSize: 26, marginTop: 4 }}>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Permits" value={stats.total} />
        <StatCard label="Today" value={stats.todayCount} accent="var(--jg-green-700)" />
        <StatCard label="This Week" value={stats.weekCount} accent="var(--jg-blue-600)" />
        <StatCard label="This Month" value={stats.monthCount} accent="var(--jg-amber-600)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>PERMIT STATUS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span>{status}</span>
                  <span className="text-mono" style={{ fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{ background: 'var(--jg-grey-100)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / maxStatusCount) * 100}%`,
                    background: STATUS_COLORS[status],
                    height: '100%',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>REPORTS BY PERMIT TYPE</div>
          {Object.keys(stats.byType).length === 0 ? (
            <div className="text-muted" style={{ fontSize: 13.5 }}>No permits submitted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 140, fontSize: 12.5, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{type}</div>
                  <div style={{ flex: 1, background: 'var(--jg-grey-100)', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxTypeCount) * 100}%`,
                      background: 'var(--jg-green-700)',
                      height: '100%',
                      borderRadius: 6,
                      minWidth: count > 0 ? 6 : 0,
                    }} />
                  </div>
                  <div className="text-mono" style={{ fontSize: 12.5, fontWeight: 700, width: 20, textAlign: 'right' }}>{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
