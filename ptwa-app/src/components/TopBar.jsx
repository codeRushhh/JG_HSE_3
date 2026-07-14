import React, { useState } from 'react';

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'newPermit', label: 'New Permit' },
  { key: 'register', label: 'Register' },
  { key: 'dashboard', label: 'Dashboard' },
];

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: 8,
        minWidth: 40,
        minHeight: 40,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

export default function TopBar({ view, navigate, onLogout, onBack, canGoBack, onRefresh }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleRefreshClick = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 500);
  };

  return (
    <>
      <header
        className="no-print"
        style={{
          background: 'var(--jg-navy-900)',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            {canGoBack && (
              <IconButton label="Back" onClick={onBack}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconButton>
            )}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 0 }}
              onClick={() => navigate('home')}
            >
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Joseph Group"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  objectFit: 'cover',
                  flexShrink: 0,
                  background: 'white',
                }}
              />
              <div style={{ lineHeight: 1.1, overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '0.02em' }}>
                  PTWA
                </div>
                <div style={{ fontSize: 10, color: 'var(--jg-green-100)', opacity: 0.75, letterSpacing: '0.04em' }}>
                  PERMIT TO WORK
                </div>
              </div>
            </div>
          </div>

          <nav style={{ display: 'none' }} className="tb-desktop-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className="btn btn-ghost btn-sm"
                style={{
                  color: view === item.key ? 'var(--jg-amber-600)' : 'white',
                  background: 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <IconButton label="Refresh" onClick={handleRefreshClick}>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                style={{ transition: 'transform 0.5s ease', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
              >
                <path d="M20 11A8 8 0 1 0 18.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 5V11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>

            <IconButton label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>
          </div>
        </div>
        <div className="brand-stripe" />
      </header>

      {menuOpen && (
        <div
          className="no-print"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(22,32,28,0.5)', zIndex: 50,
            display: 'flex', justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 270, background: 'white', height: '100%', padding: 20,
              display: 'flex', flexDirection: 'column', gap: 6,
              boxShadow: 'var(--shadow-pop)',
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 8 }}>NAVIGATE</div>

            <button
              onClick={() => { navigate('home'); setMenuOpen(false); }}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start',
                background: view === 'home' ? 'var(--jg-green-50)' : 'transparent',
                color: view === 'home' ? 'var(--jg-navy-700)' : 'var(--jg-charcoal-900)',
              }}
            >
              Home
            </button>

            {canGoBack && (
              <button
                onClick={() => { onBack(); setMenuOpen(false); }}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start' }}
              >
                Back
              </button>
            )}

            {NAV_ITEMS.filter((i) => i.key !== 'home').map((item) => (
              <button
                key={item.key}
                onClick={() => { navigate(item.key); setMenuOpen(false); }}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  background: view === item.key ? 'var(--jg-green-50)' : 'transparent',
                  color: view === item.key ? 'var(--jg-navy-700)' : 'var(--jg-charcoal-900)',
                }}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => { handleRefreshClick(); setMenuOpen(false); }}
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start' }}
            >
              Refresh This Page
            </button>

            <div style={{ borderTop: '1px solid var(--jg-grey-100)', margin: '12px 0' }} />
            <button
              onClick={() => { window.location.href = '/'; }}
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start' }}
            >
              ← Back to Portal
            </button>
            <button
              onClick={() => { onLogout(); setMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
