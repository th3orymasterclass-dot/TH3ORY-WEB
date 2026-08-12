import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, AlertCircle, LogIn, Sparkles } from 'lucide-react';
import { verifyStudentCodeWithSupabase } from '../services/supabaseService';

// Enrollment key fallback
const ENROLLMENT_CODE = 'TH3ORY2026';

export default function StudentLogin({ onAuthenticated }) {
  const [name, setName]     = useState('');
  const [code, setCode]     = useState('');
  const [showCode, setShow] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your full name or email.');
    const inputCode = code.trim().toUpperCase();
    
    setLoading(true);

    // Try Supabase verification first
    const sbStudent = await verifyStudentCodeWithSupabase(name.trim(), inputCode);

    if (sbStudent) {
      const profile = {
        name: sbStudent.name,
        email: sbStudent.email,
        enrolledAt: sbStudent.enrolledAt,
        plan: sbStudent.plan || 'TH3ORY Masterclass',
      };
      sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
      setLoading(false);
      onAuthenticated(profile);
      return;
    }

    // Fallback code check
    if (inputCode !== ENROLLMENT_CODE) {
      setLoading(false);
      setError('Invalid enrollment code. Please check your order receipt or email.');
      setCode('');
      return;
    }

    const profile = {
      name: name.trim(),
      enrolledAt: localStorage.getItem('th3ory_student_enrolledAt') || new Date().toISOString(),
      plan: localStorage.getItem('th3ory_student_plan') || 'TH3ORY Masterclass',
    };
    localStorage.setItem('th3ory_student_enrolledAt', profile.enrolledAt);
    localStorage.setItem('th3ory_student_plan', profile.plan);
    sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
    setLoading(false);
    onAuthenticated(profile);
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
                placeholder="e.g. Jonathan Sterling"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Enrollment Code</label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  placeholder="Check your welcome email"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400">
                  {showCode ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0"/>{error}
              </div>
            )}

            <button type="submit" disabled={loading || !name || !code}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"/>
                : <LogIn className="w-4 h-4"/>}
              {loading ? 'Verifying…' : 'Enter My Dashboard'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-slate-600 text-xs">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-600/50 shrink-0"/>
            <span>Your enrollment code was sent to your registered email after purchase. Contact support if you need help.</span>
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
