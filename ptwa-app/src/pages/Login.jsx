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
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #16294D 0%, #0f1d3a 55%, #0a1526 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute', width: 460, height: 460, borderRadius: '50%', top: -160, left: -140,
        background: 'radial-gradient(circle, rgba(18,163,84,0.35), transparent 70%)',
        filter: 'blur(10px)', animation: 'float-a 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%', bottom: -150, right: -120,
        background: 'radial-gradient(circle, rgba(0,145,201,0.28), transparent 70%)',
        filter: 'blur(10px)', animation: 'float-b 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%', top: '35%', right: '12%',
        background: 'radial-gradient(circle, rgba(240,187,28,0.18), transparent 70%)',
        filter: 'blur(10px)', animation: 'float-a 13s ease-in-out infinite reverse',
      }} />

      <style>{`
        @keyframes float-a { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,18px); } }
        @keyframes float-b { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-20px,-16px); } }
        @keyframes login-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes logo-pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="glass-panel"
        style={{
          width: '100%', maxWidth: 380, overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-pop)',
          position: 'relative',
          zIndex: 1,
          animation: 'login-in 0.5s var(--ease-out) both',
        }}
      >
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
                boxShadow: '0 10px 30px -8px rgba(22,41,77,0.35)',
                animation: 'logo-pop 0.5s var(--ease-out) 0.1s both',
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
