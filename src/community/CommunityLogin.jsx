import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Logo from '../components/Logo';
import { authenticateCommunityMemberInSupabase } from '../services/supabaseService';

export default function CommunityLogin({ onAuthenticated }) {
  const getInitialEmail = () => {
    try {
      const hash = window.location.hash || '';
      const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : window.location.search);
      return params.get('email') || '';
    } catch {
      return '';
    }
  };

  const [email, setEmail] = useState(getInitialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusNotice('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Please enter a valid registered email address.');
    }
    if (!cleanPassword) {
      return setError('Please enter your password.');
    }

    setLoading(true);

    try {
      const res = await authenticateCommunityMemberInSupabase(cleanEmail, cleanPassword);

      if (res.success && res.member) {
        sessionStorage.setItem('th3ory_community_member', JSON.stringify(res.member));
        localStorage.setItem('th3ory_community_member_persistent', JSON.stringify(res.member));
        setLoading(false);
        if (typeof onAuthenticated === 'function') {
          onAuthenticated(res.member);
        } else {
          window.location.hash = '#/community';
        }
        return;
      }

      if (res.status === 'pending') {
        setStatusNotice(res.error || 'Your registration has been submitted and is currently pending review by TH3ORY Administration.');
        setLoading(false);
        return;
      }

      setError(res.error || 'Invalid credentials. Please verify your email and password.');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-[#FAFAF7] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#FFC857] selection:text-[#070A11]">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-[#7C5CFC]/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[250px] bg-[#FFC857]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header Branding */}
      <div className="relative z-10 mb-6 text-center">
        <a href="#/" className="inline-flex items-center gap-3 mb-3 cursor-pointer group">
          <Logo className="h-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-wider text-white font-heading">TH3ORY</span>
        </a>
        <div className="block">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFC857]/10 border border-[#FFC857]/30 text-[#FFC857] text-xs font-semibold tracking-wide shadow-sm shadow-[#FFC857]/10">
            <Users className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>Private Community Portal</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md glass-card-luxury rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-serif-luxury text-white tracking-tight">Community Log In</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Enter your approved credentials to access weekly sessions, files, and discussion threads.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs leading-relaxed animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {statusNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FFC857]/10 border border-[#FFC857]/30 flex items-start gap-2.5 text-[#FFC857] text-xs leading-relaxed animate-fade-in">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#FFC857]" />
            <div>
              <p className="font-semibold text-[#FFC857]">Account Review In Progress</p>
              <p className="mt-1 text-slate-300">{statusNotice}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-black/40 border border-white/10 focus:border-[#FFC857]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/40 border border-white/10 focus:border-[#FFC857]/60 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] hover:brightness-110 text-[#070A11] font-bold text-sm rounded-xl shadow-lg shadow-[#FFC857]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#070A11] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Community</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center flex items-center justify-between text-xs text-slate-400">
          <span>Received an invite link?</span>
          <a
            href="#/community-register"
            className="text-[#FFC857] hover:underline font-semibold transition-colors cursor-pointer"
          >
            Apply for Access &rarr;
          </a>
        </div>
      </div>

      <div className="relative z-10 mt-6 text-center">
        <a href="#/" className="text-xs text-slate-400 hover:text-white transition-colors">
          &larr; Return to TH3ORY Home
        </a>
      </div>
    </div>
  );
}
