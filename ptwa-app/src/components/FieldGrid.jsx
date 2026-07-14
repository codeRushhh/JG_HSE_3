import React from 'react';

export default function FieldGrid({ children, columns = 2 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '14px 16px',
      }}
      className="field-grid"
      data-columns={columns}
    >
      {children}
    </div>
  );
}

export function Field({ label, hint, children, span }) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : undefined}>
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}
