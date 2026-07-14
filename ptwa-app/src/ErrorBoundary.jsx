import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('PTWA runtime error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#16294D' }}>
          <div className="card" style={{ maxWidth: 480, padding: 28 }}>
            <h1 style={{ fontSize: 19, marginBottom: 10 }}>Something went wrong</h1>
            <p style={{ fontSize: 13.5, color: 'var(--jg-charcoal-500)', marginBottom: 14, lineHeight: 1.6 }}>
              PTWA hit an unexpected error instead of loading normally. The technical detail below is usually enough to fix it:
            </p>
            <pre style={{
              background: 'var(--jg-grey-50)', padding: 12, borderRadius: 8, fontSize: 12,
              overflowX: 'auto', color: 'var(--jg-red-600)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
