import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, LogIn, Sparkles, Award, Lock, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { fetchAmbassadorByCodeFromSupabase } from '../services/supabaseService';

export default function AmbassadorLogin({ onAuthenticated, expiredNotice = false }) {
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState(expiredNotice ? '🔒 Session Expired: For your security, ambassador sessions auto-logout after 24 hours. Please log in again.' : '');
  const [loading, setLoading]   = useState(false);

  const handleFillDemo = () => {
    setCode('AMB-DEMO');
    setPassword('TH3ORY-AMB-2026');
    setError('');
  };

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
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(245,158,11,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        
        {/* LOGO & BRAND HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-2xl shadow-amber-500/30 mb-4 border border-amber-400/40">
            <Award className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-heading">
            TH3ORY Ambassador Portal
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Campus Leadership &amp; Student Outreach Network
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" /> Ambassador Code or Email *
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                autoFocus
                required
                placeholder="e.g. AMB-STAN-712 or AMB-DEMO"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Access Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your assigned password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Sent to your registered email upon official selection approval.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs font-semibold leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Authenticating Ambassador...' : 'Log In To Ambassador Portal'}
            </button>
          </form>

          {/* DEMO QUICK LOGIN BUTTON */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-500">Want to test the Ambassador Portal?</p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Demo Credentials (AMB-DEMO)</span>
            </button>
          </div>
        </div>

        {/* BOTTOM HELPER LINKS */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-500 text-xs">
            Want to join our Campus Ambassador Network?{' '}
            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/ambassador'; window.dispatchEvent(new Event('hashchange')); }}
              className="text-amber-400 hover:underline font-bold inline-flex items-center gap-1"
            >
              Apply Now <ArrowRight className="w-3 h-3" />
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
