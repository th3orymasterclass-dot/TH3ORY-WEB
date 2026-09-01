import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, Users, ArrowRight, UserPlus, Sparkles, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { fetchTeamMemberByCredentialsFromSupabase, fetchAllTeamMembersFromSupabase } from '../services/supabaseService';

export default function TeamLogin({ onAuthenticated }) {
  const [identifier, setIdentifier] = useState(''); // Email or Member ID
  const [passcode, setPasscode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [selectedSavedMember, setSelectedSavedMember] = useState(null);

  // Load known or saved team profiles for instant multi-account switcher
  useEffect(() => {
    async function loadMembers() {
      try {
        const all = await fetchAllTeamMembersFromSupabase();
        if (all && all.length > 0) {
          setSavedProfiles(all.slice(0, 4));
        }
      } catch {}
    }
    loadMembers();

    // Check if there was an active profile recently
    try {
      const active = JSON.parse(localStorage.getItem('th3ory_team_profile') || 'null');
      if (active && active.email) {
        setIdentifier(active.email);
        setSelectedSavedMember(active);
      }
    } catch {}
  }, []);

  const handleSelectAccount = (m) => {
    setSelectedSavedMember(m);
    setIdentifier(m.email || m.memberId || m.member_id);
    setError('');
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetInput = identifier.trim();
    const cleanPasscode = passcode.trim();

    try {
      // Authenticate via Supabase / Local Storage
      const res = await fetchTeamMemberByCredentialsFromSupabase(targetInput || cleanPasscode, cleanPasscode);

      if (res && res.success && res.member) {
        const member = res.member;
        const teamObj = {
          role: member.role || 'Enterprise Outreach Lead',
          name: member.name || 'Team Officer',
          email: member.email || 'team@th3ory.online',
          memberId: member.memberId || member.member_id || 'TEAM-MEM-1001',
          repCode: member.repCode || member.rep_code || 'REP-TEAM',
          department: member.department || 'Enterprise & B2B',
          phone: member.phone || '',
          customQuote: member.customQuote || member.custom_quote || '',
          status: member.status || 'ACTIVE',
          loginAt: Date.now()
        };

        sessionStorage.setItem('th3ory_team_auth', '1');
        sessionStorage.setItem('th3ory_team_profile', JSON.stringify(teamObj));
        localStorage.setItem('th3ory_team_auth', '1');
        localStorage.setItem('th3ory_team_profile', JSON.stringify(teamObj));

        setLoading(false);
        onAuthenticated(teamObj);
      } else {
        // Check master passcode override
        const clean = cleanPasscode.toUpperCase();
        if (clean === 'TEAM2026' || cleanPasscode === 'TH3ORY@team2026') {
          const fallbackTeamObj = {
            role: 'Enterprise Outreach Lead',
            name: targetInput ? targetInput.split('@')[0] : 'TH3ORY Team Officer',
            email: targetInput || 'team@th3ory.online',
            memberId: 'TEAM-MEM-1001',
            repCode: 'REP-TEAM',
            department: 'Enterprise & B2B',
            loginAt: Date.now()
          };
          sessionStorage.setItem('th3ory_team_auth', '1');
          sessionStorage.setItem('th3ory_team_profile', JSON.stringify(fallbackTeamObj));
          localStorage.setItem('th3ory_team_auth', '1');
          localStorage.setItem('th3ory_team_profile', JSON.stringify(fallbackTeamObj));
          setLoading(false);
          onAuthenticated(fallbackTeamObj);
        } else {
          setError(res?.error || 'Invalid credentials or team passcode. Access restricted.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.warn('Login error:', err);
      setError('An error occurred during authentication. Please check credentials.');
      setLoading(false);
    }
  }, [identifier, passcode, onAuthenticated]);

  return (
    <div 
      className="min-h-screen bg-[#05080F] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white" 
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 65%)' }}
    >
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 shadow-2xl shadow-indigo-500/10">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">TH3ORY Team Portal</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Multi-Account Access &amp; Account-Aligned Data Workspace
          </p>
        </div>

        {/* Multi-Account Quick Selectors */}
        {savedProfiles.length > 0 && (
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-3.5 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Switch or Select Team Account
              </span>
              <span className="text-[10px] font-medium text-indigo-400">
                {savedProfiles.length} Registered Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedProfiles.map(m => {
                const isSelected = identifier === m.email || identifier === m.memberId || identifier === m.member_id;
                return (
                  <button
                    key={m.memberId || m.member_id || m.email}
                    type="button"
                    onClick={() => handleSelectAccount(m)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                      {(m.name || 'T')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{m.role || m.department}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Official Work Email or Member ID
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="e.g. alex.ops@th3ory.online or TEAM-MEM-1001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Account Security Passcode
                </label>
                <span className="text-[10px] text-slate-500">Default: TEAM2026</span>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  autoFocus={!identifier}
                  required
                  placeholder="Enter your security passcode"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{loading ? 'Authenticating Account...' : 'Sign In to My Team Workspace'}</span>
            </button>
          </form>

          {/* Allocation Link for New Team Registration */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Need a separate team account or allocated workspace?
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/team-register';
                window.dispatchEvent(new Event('hashchange'));
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/30 text-indigo-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Register New Team Member Profile →</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
            <p className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Account-Aligned Data Access:
            </p>
            <p>
              Each team member logs into a segregated operational workspace containing tailor-made shareable outreach collateral, personal tracking links, and assigned client data.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
