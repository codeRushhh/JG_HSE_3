import React from 'react';

export default function FormSection({ number, title, subtitle, children }) {
  return (
    <div className="card" style={{ padding: '22px 22px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        {number && (
          <span
            className="text-mono"
            style={{
              fontSize: 12, fontWeight: 700, color: 'var(--jg-green-700)',
              background: 'var(--jg-green-50)', borderRadius: 6, padding: '3px 8px',
            }}
          >
            {number}
          </span>
        )}
        <div>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          {subtitle && <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
