import React from 'react';

export default function StatusBadge({ status }) {
  const cls = `status-${(status || '').replace(/\s+/g, '')}`;
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
