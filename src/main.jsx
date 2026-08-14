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
    try { return JSON.parse(sessionStorage.getItem('th3ory_student_auth') || 'null'); } catch { return null; }
  });

  useEffect(() => {
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
      return <StudentLogin onAuthenticated={(profile) => {
        setStudentProfile(profile);
      }}/>;
    }
    return <StudentApp profile={studentProfile} onLogout={() => {
      sessionStorage.removeItem('th3ory_student_auth');
      setStudentProfile(null);
      window.location.hash = '';
      setView('public');
    }}/>;
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
      </FeatureFlagProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

