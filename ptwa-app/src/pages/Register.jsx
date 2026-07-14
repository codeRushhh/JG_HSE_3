import React, { useState, useMemo, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { getAllPermits, permitsToCSV, downloadBlob, formatDate } from '../lib/dataStore.js';
import { PERMIT_TYPES, STATUS_OPTIONS } from '../data/permitLibrary.js';

export default function RegisterPage({ navigate }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    let active = true;
    getAllPermits()
      .then((list) => { if (active) { setAll(list); setLoading(false); } })
      .catch((e) => { if (active) { setError(e.message || 'Could not load the register.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...all];
    if (typeFilter !== 'All') list = list.filter((p) => p.permitType === typeFilter);
    if (statusFilter !== 'All') list = list.filter((p) => p.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => [
        p.permitNo, p.applicantName, p.companyName, p.receiverName,
        p.building, p.floor, p.area, p.permitType, p.description,
      ].some((v) => String(v || '').toLowerCase().includes(q)));
    }
    list.sort((a, b) => (sortDesc ? 1 : -1) * (new Date(b.createdAt) - new Date(a.createdAt)));
    return list;
  }, [all, query, typeFilter, statusFilter, sortDesc]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const exportCSV = (list) => {
    const csv = permitsToCSV(list);
    downloadBlob(csv, `PTW_Register_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 50 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div className="eyebrow">HSE-REG-PTW-01</div>
          <h1 style={{ fontSize: 26, marginTop: 4 }}>PTW Register</h1>
          <div className="text-muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            {loading ? 'Loading…' : `${filtered.length} of ${all.length} permits`}
          </div>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(selected.length ? filtered.filter((p) => selected.includes(p.id)) : filtered)}>
            Export CSV{selected.length ? ` (${selected.length})` : ''}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print Register</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('newPermit')}>+ New Permit</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--jg-red-100)', border: 'none', color: 'var(--jg-red-600)', fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className="card no-print" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="field-input" style={{ flex: '2 1 220px' }}
          placeholder="Search permit no., applicant, company, location…"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <select className="field-select" style={{ flex: '1 1 160px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Permit Types</option>
          {PERMIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="field-select" style={{ flex: '1 1 160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setSortDesc((s) => !s)}>
          Date {sortDesc ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      <div className="card scroll-area" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 50, textAlign: 'center', color: 'var(--jg-charcoal-500)' }}>Loading register…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center', color: 'var(--jg-charcoal-500)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No permits match this view</div>
            <div style={{ fontSize: 13.5 }}>Adjust your search/filters, or raise a new permit.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--jg-grey-50)', textAlign: 'left' }}>
                <th className="no-print" style={{ padding: '10px 12px' }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th style={{ padding: '10px 12px' }}>PTW No.</th>
                <th style={{ padding: '10px 12px' }}>Date Raised</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Location</th>
                <th style={{ padding: '10px 12px' }}>Contractor</th>
                <th style={{ padding: '10px 12px' }}>Applicant</th>
                <th style={{ padding: '10px 12px' }}>Job Start</th>
                <th style={{ padding: '10px 12px' }}>Expiry</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: '1px solid var(--jg-grey-100)', cursor: 'pointer' }}
                  onClick={() => navigate('permitDetail', { permitId: p.id })}
                >
                  <td className="no-print" style={{ padding: '10px 12px' }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="text-mono" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--jg-green-700)' }}>{p.permitNo}</td>
                  <td style={{ padding: '10px 12px' }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '10px 12px' }}>{p.permitType}</td>
                  <td style={{ padding: '10px 12px' }}>{[p.building, p.floor, p.area].filter(Boolean).join(' / ') || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{p.companyName || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{p.applicantName || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{p.jobStartDate} {p.jobStartTime}</td>
                  <td style={{ padding: '10px 12px' }}>{p.expiryDate} {p.expiryTime}</td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
