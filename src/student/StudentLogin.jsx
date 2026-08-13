import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, AlertCircle, LogIn, Sparkles, Mail, Lock } from 'lucide-react';
import { verifyStudentCodeWithSupabase, generateEnrollmentCode } from '../services/supabaseService';

// Default fallback codes for local testing
const FALLBACK_CODES = ['TH3ORY26', 'TH3ORY2026'];

export default function StudentLogin({ onAuthenticated }) {
  const [email, setEmail]   = useState('');
  const [code, setCode]     = useState('');
  const [showCode, setShow] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const inputCode  = code.trim().toUpperCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    if (!inputCode) {
      return setError('Please enter your 8-character enrollment code.');
    }
    
    setLoading(true);
    setError('');

    // 1. Try Supabase verification first
    const sbStudent = await verifyStudentCodeWithSupabase(cleanEmail, inputCode);

    if (sbStudent) {
      const profile = {
        name: sbStudent.name || cleanEmail.split('@')[0],
        email: sbStudent.email || cleanEmail,
        enrolledAt: sbStudent.enrolledAt || new Date().toISOString(),
        plan: sbStudent.plan || 'TH3ORY Masterclass',
      };
      sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
      setLoading(false);
      onAuthenticated(profile);
      return;
    }

    // 2. Local Storage Fallback Verification
    try {
      const localEnrollments = JSON.parse(localStorage.getItem('th3ory_local_enrollments') || '[]');
      const matchedLocal = localEnrollments.find(item => {
        const itemEmail = (item.email || item.studentEmail || '').trim().toLowerCase();
        if (itemEmail !== cleanEmail) return false;
        const storedCode = (item.code || item.enrollment_code || '').trim().toUpperCase();
        if (storedCode === inputCode) return true;
        const computed = generateEnrollmentCode(item.name || item.studentName, item.dob).toUpperCase();
        return computed === inputCode;
      });

      if (matchedLocal) {
        const profile = {
          name: matchedLocal.name || matchedLocal.studentName || cleanEmail.split('@')[0],
          email: cleanEmail,
          enrolledAt: matchedLocal.created_at || new Date().toISOString(),
          plan: matchedLocal.plan_name || matchedLocal.planName || 'TH3ORY Masterclass',
        };
        sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
        setLoading(false);
        onAuthenticated(profile);
        return;
      }
    } catch (err) {
      console.warn('[StudentLogin] Error checking local storage:', err);
    }

    // 3. Fallback code check for demo / test accounts
    if (FALLBACK_CODES.includes(inputCode)) {
      const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const profile = {
        name: defaultName,
        email: cleanEmail,
        enrolledAt: localStorage.getItem('th3ory_student_enrolledAt') || new Date().toISOString(),
        plan: localStorage.getItem('th3ory_student_plan') || 'TH3ORY Masterclass',
      };
      localStorage.setItem('th3ory_student_enrolledAt', profile.enrolledAt);
      localStorage.setItem('th3ory_student_plan', profile.plan);
      sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
      setLoading(false);
      onAuthenticated(profile);
      return;
    }

    setLoading(false);
    setError('Invalid enrollment code or email. Please check your order receipt or welcome email.');
    setCode('');
  };

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4"
      style={{backgroundImage:'radial-gradient(ellipse at 60% 20%, rgba(245,158,11,0.07) 0%, transparent 55%)'}}>
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-2xl shadow-amber-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">TH3ORY Student Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Access your enrolled course dashboard</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500"/> Student Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
                placeholder="e.g. student@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500"/> Enrollment Access Code (8 Characters)
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  required
                  maxLength={12}
                  placeholder="e.g. JONA1505"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-mono tracking-wider"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400">
                  {showCode ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Combined 8-character code (Name + Date of Birth, e.g. <span className="font-mono text-amber-400 font-bold">JONA1505</span>).
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0"/>{error}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !code}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"/>
                : <LogIn className="w-4 h-4"/>}
              {loading ? 'Verifying Credentials…' : 'Enter My Dashboard'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-slate-600 text-xs">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-600/50 shrink-0"/>
            <span>Your 8-character enrollment code was sent to your registered email after purchase.</span>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">
          Not enrolled yet?{' '}
          <a href="/" className="text-amber-500/80 hover:text-amber-400 underline">View the course →</a>
        </p>
      </div>
    </div>
  );
}

