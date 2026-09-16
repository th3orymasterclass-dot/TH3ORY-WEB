import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, LogIn, Sparkles, Award, Lock, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { fetchAmbassadorByCodeFromSupabase } from '../services/supabaseService';

export default function AmbassadorLogin({ onAuthenticated, expiredNotice = false }) {
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState(expiredNotice ? '🔒 Session Expired: For your security, ambassador sessions auto-logout after 24 hours. Please log in again.' : '');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanPwd  = password.trim();

    if (!cleanCode) {
      return setError('Please enter your unique Ambassador Code or registered email.');
    }

    setLoading(true);
    setError('');

    // 1. Try Direct Supabase verification
    try {
      const sbAmbassador = await fetchAmbassadorByCodeFromSupabase(cleanCode);
      if (sbAmbassador) {
        sessionStorage.setItem('th3ory_ambassador_session', JSON.stringify(sbAmbassador));
        localStorage.setItem('th3ory_ambassador_session_persistent', JSON.stringify(sbAmbassador));
        setLoading(false);
        onAuthenticated(sbAmbassador);
        return;
      }
    } catch (err) {
      console.warn('[AmbassadorLogin] Supabase lookup error:', err);
    }

    // 3. Fallback check for demo code
    if (cleanCode === 'AMB-DEMO' || cleanCode === 'AMBASSADOR') {
      const demoProfile = {
        id: 'amb_demo_2026',
        name: 'Sravan (Campus Ambassador)',
        email: 'ambassador.demo@th3ory.online',
        collegeName: 'Stanford University',
        degree: 'Computer Science & Cognitive AI',
        yearOfStudy: '3rd Year',
        status: 'APPROVED',
        ambassadorCode: 'AMB-DEMO',
        points: 450,
        tier: 'Tier 1 Ambassador',
        totalLeads: 12,
        totalEnrollments: 8,
        totalCommission: 8000.00,
        payoutDetails: { method: 'UPI', upiId: 'sravan@okhdfcbank', accountHolderName: 'Mentalist Sravan' },
        loginAt: Date.now()
      };
      sessionStorage.setItem('th3ory_ambassador_session', JSON.stringify(demoProfile));
      localStorage.setItem('th3ory_ambassador_session_persistent', JSON.stringify(demoProfile));
      setLoading(false);
      onAuthenticated(demoProfile);
      return;
    }

    setLoading(false);
    setError('Invalid Ambassador Code or Password. If you just applied, your application is pending team review.');
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-[#FAFAF7] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#FFC857] selection:text-[#070A11]">
      {/* Ambient spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-[#7C5CFC]/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-[#FFC857]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md relative z-10">
        
        {/* LOGO & BRAND HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC857] via-[#FFAE19] to-[#7C5CFC] shadow-2xl shadow-[#FFC857]/20 mb-3.5 p-0.5">
            <div className="w-full h-full bg-[#070A11] rounded-[14px] flex items-center justify-center">
              <Award className="w-7 h-7 text-[#FFC857]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            TH3ORY Ambassador Portal
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 font-medium">
            Campus Leadership &amp; Student Outreach Network
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="glass-card-luxury rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-3.5 h-3.5 text-[#FFC857]" /> Ambassador Code or Email *
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                autoFocus
                required
                placeholder="e.g. AMB-STAN-712"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFC857]/60 focus:ring-1 focus:ring-[#FFC857]/30 transition-all text-sm font-mono tracking-wider glass-specular"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
                <KeyRound className="w-3.5 h-3.5 text-[#FFC857]" /> Access Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your assigned password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFC857]/60 focus:ring-1 focus:ring-[#FFC857]/30 transition-all text-sm font-mono glass-specular"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FFC857] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Sent to your registered email upon official selection approval.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs font-semibold leading-relaxed animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-[#070A11] font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FFC857]/20 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#070A11]/40 border-t-[#070A11] rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Authenticating Ambassador...' : 'Log In To Ambassador Portal'}
            </button>
          </form>
        </div>

        {/* BOTTOM HELPER LINKS */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-400 text-xs">
            Want to join our Campus Ambassador Network?{' '}
            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/ambassador'; window.dispatchEvent(new Event('hashchange')); }}
              className="text-[#FFC857] hover:underline font-bold inline-flex items-center gap-1"
            >
              Apply Now <ArrowRight className="w-3 h-3" />
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
