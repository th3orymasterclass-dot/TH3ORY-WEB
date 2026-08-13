import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminApp   from './admin/AdminApp.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import StudentApp   from './student/StudentApp.jsx';
import StudentLogin from './student/StudentLogin.jsx';
import EnrollmentPage from './components/EnrollmentPage.jsx';
import './index.css';

const ADMIN_HASH   = '/admin-th3ory-x9k2';
const STUDENT_HASH = '/student';
const ENROLL_HASH  = '/enroll';

function Root() {
  const getInitialView = () => {
    const h = (window.location.hash || '').toLowerCase();
    const p = (window.location.pathname || '').toLowerCase();

    if (h.includes('admin') || p.includes('admin')) return 'admin';
    if (h.includes('student') || p.includes('student')) return 'student';
    if (h.includes('enroll') || p.includes('enroll')) return 'enroll';
    return 'public';
  };

  const [view, setView] = useState(getInitialView);

  const [adminAuthed,   setAdminAuthed]   = useState(() => sessionStorage.getItem('th3ory_admin_auth') === '1');
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

  // ── Public ─────────────────────────────────────────────────────────────────
  return <App/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root/>
  </React.StrictMode>
);
