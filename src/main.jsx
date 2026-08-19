import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminApp   from './admin/AdminApp.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import StudentApp   from './student/StudentApp.jsx';
import StudentLogin from './student/StudentLogin.jsx';
import EnrollmentPage from './components/EnrollmentPage.jsx';
import CertificateVerification from './components/CertificateVerification.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

function Root() {
  const getInitialView = () => {
    const h = (window.location.hash || '').toLowerCase();
    const p = (window.location.pathname || '').toLowerCase();

    if (h.includes('admin') || p.includes('admin')) return 'admin';
    if (h.includes('student') || p.includes('student')) return 'student';
    if (h.includes('enroll') || p.includes('enroll')) return 'enroll';
    if (h.includes('verify') || p.includes('verify')) return 'verify';
    if (h.includes('404')) return '404';
    return 'public';
  };

  const [view, setView] = useState(getInitialView);

  const [adminAuthed,   setAdminAuthed]   = useState(() => (
    sessionStorage.getItem('th3ory_admin_auth') === '1' || localStorage.getItem('th3ory_admin_auth') === '1'
  ));
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('th3ory_student_auth') || localStorage.getItem('th3ory_student_auth_persistent') || 'null');
    } catch { return null; }
  });

  useEffect(() => {
    // Purge legacy th3ory_local_ localStorage keys to ensure 100% pure Supabase live sync
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('th3ory_local_') || key.startsWith('th3ory_progress_') || key.startsWith('th3ory_notes_') || key.startsWith('th3ory_bookmarks_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    const handler = () => {
      setView(getInitialView());
    };
    window.addEventListener('hashchange', handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('hashchange', handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // ── Admin ──────────────────────────────────────────────────────────────────
  if (view === 'admin') {
    if (!adminAuthed) return <AdminLogin onAuthenticated={() => setAdminAuthed(true)}/>;
    return <AdminApp onLogout={() => {
      sessionStorage.removeItem('th3ory_admin_auth');
      localStorage.removeItem('th3ory_admin_auth');
      setAdminAuthed(false);
      window.location.hash = '';
      setView('public');
    }}/>;
  }

  // ── Student ────────────────────────────────────────────────────────────────
  if (view === 'student') {
    if (!studentProfile) {
      return <StudentLogin
        expiredNotice={sessionExpiredNotice}
        onAuthenticated={(profile) => {
          setSessionExpiredNotice(false);
          setStudentProfile(profile);
        }}
      />;
    }
    return <StudentApp
      profile={studentProfile}
      onLogout={(opts = {}) => {
        sessionStorage.removeItem('th3ory_student_auth');
        localStorage.removeItem('th3ory_student_auth_persistent');
        setStudentProfile(null);
        if (opts?.expired) {
          setSessionExpiredNotice(true);
        } else {
          setSessionExpiredNotice(false);
          window.location.hash = '';
          setView('public');
        }
      }}
    />;
  }

  // ── Enrollment Page ────────────────────────────────────────────────────────
  if (view === 'enroll') {
    return <EnrollmentPage onBack={() => { window.location.hash = ''; setView('public'); }} />;
  }

  // ── Certificate Verification ────────────────────────────────────────────────
  if (view === 'verify') {
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const certIdParam = parts[2] ? parts[2].toUpperCase() : 'TH3ORY-CERT-2026-99';
    return <CertificateVerification initialCertId={certIdParam} />;
  }

  // ── 404 Page ───────────────────────────────────────────────────────────────
  if (view === '404') {
    return <NotFoundPage />;
  }

  // ── Public ─────────────────────────────────────────────────────────────────
  return <App/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FeatureFlagProvider>
        <Root/>
        <Analytics/>
      </FeatureFlagProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

