import React from 'react';

export default function FormSection({ number, title, subtitle, children }) {
  return (
    <div className="card card-hover" style={{ padding: '22px 22px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {number && <span className="num-chip">{number}</span>}
        <div>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          {subtitle && <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
