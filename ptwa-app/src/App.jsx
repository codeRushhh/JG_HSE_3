import React, { useState, useEffect, useCallback, useRef } from 'react';
import { isLoggedIn, logout, onAuthStateChange } from './lib/dataStore.js';
import { isSupabaseConfigured } from './lib/supabaseClient.js';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import NewPermit from './pages/NewPermit.jsx';
import RegisterPage from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PermitDetail from './pages/PermitDetail.jsx';
import TopBar from './components/TopBar.jsx';

const NAV_STORAGE_KEY = 'jg_ptwa_nav_state';
const HOME_STATE = { view: 'home', activePermitId: null, editPermitId: null };

function loadSavedNavState() {
  try {
    const raw = sessionStorage.getItem(NAV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function persistNavState(state) {
  try {
    sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* ignore */
  }
}

export default function App() {
  // null = still checking Supabase session, true/false once known
  const [authed, setAuthed] = useState(null);

  const savedNav = loadSavedNavState() || HOME_STATE;
  const [view, setView] = useState(savedNav.view);
  const [activePermitId, setActivePermitId] = useState(savedNav.activePermitId ?? null);
  const [editPermitId, setEditPermitId] = useState(savedNav.editPermitId ?? null);
  const [refreshKey, setRefreshKey] = useState(0);

  const stackRef = useRef([savedNav]);

  useEffect(() => {
    document.title = 'Joseph Group PTWA';
  }, []);

  // Check Supabase session on load, then keep it in sync (token refresh, sign-out elsewhere)
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthed(false); return undefined; }
    let active = true;
    isLoggedIn().then((ok) => { if (active) setAuthed(ok); });
    const sub = onAuthStateChange((ok) => { if (active) setAuthed(ok); });
    return () => { active = false; sub?.unsubscribe?.(); };
  }, []);

  const applyState = useCallback((state) => {
    setView(state.view);
    setActivePermitId(state.activePermitId ?? null);
    setEditPermitId(state.editPermitId ?? null);
    persistNavState(state);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, []);

  const navigate = useCallback((nextView, opts = {}) => {
    const state = {
      view: nextView,
      activePermitId: opts.permitId !== undefined ? opts.permitId : null,
      editPermitId: opts.editPermitId !== undefined ? opts.editPermitId : null,
    };
    const top = stackRef.current[stackRef.current.length - 1];
    if (top && top.view === state.view && top.activePermitId === state.activePermitId && top.editPermitId === state.editPermitId) {
      applyState(state);
      return;
    }
    stackRef.current.push(state);
    window.history.pushState(state, '', '#' + state.view);
    applyState(state);
  }, [applyState]);

  const goBack = useCallback(() => {
    if (stackRef.current.length > 1) {
      stackRef.current.pop();
      const prev = stackRef.current[stackRef.current.length - 1];
      applyState(prev);
      window.history.back();
    } else {
      navigate('home');
    }
  }, [applyState, navigate]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (authed !== true) return undefined;
    window.history.replaceState(stackRef.current[0], '', '#' + stackRef.current[0].view);

    const onPopState = () => {
      if (stackRef.current.length > 1) {
        stackRef.current.pop();
        const prev = stackRef.current[stackRef.current.length - 1];
        applyState(prev);
      } else {
        applyState(stackRef.current[0]);
        window.history.pushState(stackRef.current[0], '', '#' + stackRef.current[0].view);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [authed, applyState]);

  const handleLoginSuccess = () => {
    setAuthed(true);
    stackRef.current = [HOME_STATE];
    applyState(HOME_STATE);
    window.history.replaceState(HOME_STATE, '', '#home');
  };

  const handleLogout = async () => {
    await logout();
    try { sessionStorage.removeItem(NAV_STORAGE_KEY); } catch (e) { /* ignore */ }
    setAuthed(false);
    stackRef.current = [HOME_STATE];
  };

  if (!isSupabaseConfigured) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--jg-navy-900)' }}>
        <div className="card" style={{ maxWidth: 460, padding: 28, textAlign: 'center' }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Joseph Group" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', marginBottom: 14 }} />
          <h1 style={{ fontSize: 20, marginBottom: 10 }}>Supabase isn't connected yet</h1>
          <p style={{ fontSize: 13.5, color: 'var(--jg-charcoal-500)', lineHeight: 1.6 }}>
            This deploy is missing <code className="text-mono">VITE_SUPABASE_URL</code> and/or <code className="text-mono">VITE_SUPABASE_ANON_KEY</code>.
            Add both under Netlify → Site configuration → Environment variables, then trigger a new deploy.
          </p>
        </div>
      </div>
    );
  }

  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jg-navy-900)' }}>
        <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.04em' }}>
          Loading Joseph Group PTWA…
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  const canGoBack = stackRef.current.length > 1;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        view={view}
        navigate={navigate}
        onLogout={handleLogout}
        onBack={goBack}
        canGoBack={canGoBack}
        onRefresh={refresh}
      />
      <div style={{ flex: 1 }} key={`${view}-${activePermitId || ''}-${editPermitId || ''}-${refreshKey}`}>
        {view === 'home' && <Home navigate={navigate} />}
        {view === 'newPermit' && (
          <NewPermit navigate={navigate} editPermitId={editPermitId} />
        )}
        {view === 'register' && <RegisterPage navigate={navigate} />}
        {view === 'dashboard' && <Dashboard navigate={navigate} />}
        {view === 'permitDetail' && (
          <PermitDetail permitId={activePermitId} navigate={navigate} />
        )}
      </div>
    </div>
  );
}
