import React, { useState } from 'react';
import { login } from '../lib/dataStore.js';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const ok = await login(password);
    setBusy(false);
    if (ok) {
      onSuccess();
    } else {
      setError('Incorrect password, or unable to reach the server. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'radial-gradient(circle at 20% 15%, var(--jg-navy-600) 0%, var(--jg-navy-900) 60%)',
      }}
    >
      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: 380, overflow: 'hidden' }}>
        <div className="brand-stripe" />
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Joseph Group"
              style={{
                width: 84, height: 84, borderRadius: 20,
                objectFit: 'cover',
                marginBottom: 16,
                boxShadow: '0 2px 10px rgba(22,41,77,0.18)',
              }}
            />
            <h1 style={{ fontSize: 26, textAlign: 'center' }}>Joseph Group PTWA</h1>
            <div className="text-muted" style={{ fontSize: 13.5, marginTop: 4, textAlign: 'center' }}>
              Permit to Work Application &middot; HSE Department
            </div>
          </div>

          <label className="field-label" htmlFor="pw">HSE Password</label>
          <input
            id="pw"
            type="password"
            inputMode="numeric"
            autoFocus
            className="field-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            disabled={busy}
          />
          {error && (
            <div style={{ color: 'var(--jg-red-600)', fontSize: 13, marginTop: 8 }}>{error}</div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={busy}>
            {busy ? 'Signing in…' : 'Log In'}
          </button>

          <div className="text-muted" style={{ fontSize: 11.5, marginTop: 18, textAlign: 'center' }}>
            Since 1978 &middot; HSE Department Access Only
          </div>
        </div>
      </form>
    </div>
  );
}
