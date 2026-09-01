import React, { useState, useCallback } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';

export default function TeamLogin({ onAuthenticated }) {
  const [passcode, setPasscode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Validate team credentials (e.g. TEAM2026 or TH3ORY@team2026)
      const clean = passcode.trim().toUpperCase();
      if (clean === 'TEAM2026' || passcode === 'TH3ORY@team2026') {
        const teamObj = {
          role: 'team_admin',
          name: 'TH3ORY Team Officer',
          email: 'team@th3ory.online',
          loginAt: Date.now()
        };
        sessionStorage.setItem('th3ory_team_auth', '1');
        sessionStorage.setItem('th3ory_team_profile', JSON.stringify(teamObj));
        localStorage.setItem('th3ory_team_auth', '1');
        setLoading(false);
        onAuthenticated(teamObj);
      } else {
        setError('Invalid team passcode. Access restricted.');
        setPasscode('');
        setLoading(false);
      }
    }, 400);
  }, [passcode, onAuthenticated]);

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.1) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 shadow-2xl mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">TH3ORY Team Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Restricted Access — Data Policy Compliant Operations</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Team Security Passcode</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  autoFocus
                  required
                  placeholder="Enter your assigned team passcode"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? 'Verifying Passcode...' : 'Enter Team Portal'}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <p className="font-bold text-indigo-300 mb-0.5">🔒 Data Access Policy Enforced:</p>
            <p>Access is restricted strictly to Enterprise Quotes, Contact Inquiries, and Affiliate Program. All modifications require primary Admin approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
