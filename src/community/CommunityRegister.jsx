import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Mail, Lock, Eye, EyeOff, CheckCircle2, Clock, ArrowRight, AlertCircle, Users } from 'lucide-react';
import { registerCommunityMemberInSupabase, authenticateCommunityMemberInSupabase, subscribeToCommunityFeed } from '../services/supabaseService';
import Logo from '../components/Logo';

export default function CommunityRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredMember, setRegisteredMember] = useState(null);
  const [checkStatusLoading, setCheckStatusLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.email.trim() || !form.email.includes('@')) return setError('Please enter a valid email address.');
    if (!form.password.trim() || form.password.length < 6) return setError('Password must be at least 6 characters long.');

    setLoading(true);

    try {
      const res = await registerCommunityMemberInSupabase(form);
      if (!res.success) {
        setError(res.error || 'Failed to submit registration. Please try again.');
        setLoading(false);
        return;
      }

      setRegisteredMember(res.member || { name: form.name, email: form.email, status: 'pending' });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Real-time listener for instant approval detection
  useEffect(() => {
    if (!registeredMember?.email) return;

    const unsubscribe = subscribeToCommunityFeed(async () => {
      try {
        const authRes = await authenticateCommunityMemberInSupabase(registeredMember.email, form.password || 'temp');
        if (authRes.success) {
          setStatusNotice('🎉 Excellent news! Your account has been approved by the Administration! Redirecting to login...');
          setTimeout(() => {
            window.location.hash = `#/community-login?email=${encodeURIComponent(registeredMember.email)}`;
          }, 1500);
        }
      } catch {}
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [registeredMember?.email, form.password]);

  const handleCheckStatus = async () => {
    if (!registeredMember?.email) return;
    setCheckStatusLoading(true);
    setStatusNotice('');

    try {
      const authRes = await authenticateCommunityMemberInSupabase(registeredMember.email, form.password || 'temp');
      if (authRes.success) {
        setStatusNotice('🎉 Excellent news! Your account has been approved by the Administration! Redirecting to login...');
        setTimeout(() => {
          window.location.hash = '#/community-login';
        }, 1500);
      } else if (authRes.status === 'pending') {
        setStatusNotice('⏳ Status: Your application is currently in the review queue with TH3ORY Administration.');
      } else if (authRes.status === 'rejected') {
        setStatusNotice('❌ Status: Your application was not approved.');
      } else {
        setStatusNotice('⏳ Status: Pending review by administration.');
      }
    } catch {
      setStatusNotice('⏳ Application is currently under review.');
    } finally {
      setCheckStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[300px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header Branding */}
      <div className="relative z-10 mb-6 text-center">
        <a href="#/" className="inline-flex items-center gap-2 mb-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#070a11] rounded-[10px] flex items-center justify-center">
              <span className="text-amber-400 font-black text-sm tracking-wider font-brand">T3</span>
            </div>
          </div>
          <span className="text-xl font-bold tracking-wider text-white font-brand">TH3ORY</span>
        </a>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
          <Users className="w-3.5 h-3.5" />
          <span>Exclusive Community Invitation</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg bg-[#0c121e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        {!registeredMember ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Request Community Membership
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Join the private circle of cognitive experimenters, negotiators, and behavioral architects.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs leading-relaxed animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Elena Rostova"
                    className="w-full bg-[#070a11] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="elena.rostova@organization.com"
                    className="w-full bg-[#070a11] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-[#070a11] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters. You will use this to sign in once approved.</p>
              </div>

              {/* Background / Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Professional Discipline / Focus (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="e.g. Cognitive Psychologist, Trial Attorney, Leadership Coach..."
                  className="w-full bg-[#070a11] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Membership Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center flex items-center justify-between text-xs text-slate-400">
              <span>Already an approved member?</span>
              <a
                href="#/community-login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
              >
                Log In to Community &rarr;
              </a>
            </div>
          </>
        ) : (
          /* Post-submission pending approval state */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <span>Status: Awaiting Admin Approval</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Application Received!</h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{registeredMember.name}</strong>. Your membership application for the private TH3ORY Community has been queued for review by Administration.
              </p>
            </div>

            <div className="bg-[#070a11] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between text-slate-400">
                <span>Registered Email:</span>
                <span className="text-white font-mono">{registeredMember.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Review Window:</span>
                <span className="text-amber-400 font-semibold">Typically within 24 hours</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Activation Notice:</span>
                <span className="text-emerald-400">Official Login Link sent via email</span>
              </div>
            </div>

            {statusNotice && (
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                {statusNotice}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkStatusLoading}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {checkStatusLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Check Current Approval Status</span>
                )}
              </button>

              <a
                href="#/community-login"
                className="w-full py-2.5 px-4 text-amber-400 hover:text-amber-300 font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                Go to Community Login Page
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer reassurance note */}
      <p className="relative z-10 text-[11px] text-slate-500 mt-6 text-center max-w-sm">
        TH3ORY is an invite-only masterclass community governed by strict ethical practice guidelines.
      </p>
    </div>
  );
}
