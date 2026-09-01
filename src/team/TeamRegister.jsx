import React, { useState } from 'react';
import { 
  Users, Shield, Lock, Mail, Phone, Building2, Briefcase, 
  ArrowRight, CheckCircle2, Copy, Check, Sparkles, ArrowLeft,
  KeyRound, Award, Share2, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import Logo from '../components/Logo';
import SEOHead from '../components/SEOHead';
import { saveTeamMemberRegistrationToSupabase } from '../services/supabaseService';

const DEPARTMENTS = [
  { 
    id: 'Enterprise & B2B', 
    label: 'Enterprise & B2B Solutions', 
    desc: 'Managing corporate quotes, HR leadership proposals, and CXO negotiation pipelines.',
    defaultRole: 'Enterprise Outreach Lead'
  },
  { 
    id: 'Campus & University', 
    label: 'Campus & Institutional Outreach', 
    desc: 'University partnerships, campus ambassador management, and academic keynote proposals.',
    defaultRole: 'Institutional & Campus Director'
  },
  { 
    id: 'Growth & Partnerships', 
    label: 'Growth, Affiliates & PR', 
    desc: 'Affiliate network, influencer collaborations, media campaigns, and community growth.',
    defaultRole: 'Growth & Affiliates Strategist'
  },
  { 
    id: 'Customer Operations', 
    label: 'Customer Relations & Dispatch', 
    desc: 'Contact inquiries, student escalations, newsletter dispatches, and compliance logs.',
    defaultRole: 'Operations & Relations Officer'
  }
];

export default function TeamRegister({ onRegistrationSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Enterprise & B2B',
    role: 'Enterprise Outreach Lead',
    passcode: '',
    repCode: '',
    customQuote: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredMember, setRegisteredMember] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    const firstWord = val.trim().split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase();
    setForm(prev => ({
      ...prev,
      name: val,
      repCode: prev.repCode && !prev.repCode.startsWith(`REP-${firstWord}`) ? prev.repCode : (firstWord ? `REP-${firstWord}` : '')
    }));
  };

  const handleDeptSelect = (dept) => {
    setForm(prev => ({
      ...prev,
      department: dept.id,
      role: dept.defaultRole
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.passcode) {
      setErrorMsg('Please complete all mandatory fields (Name, Email, and Passcode).');
      return;
    }

    if (form.passcode.length < 4) {
      setErrorMsg('Security passcode must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const generatedMemberId = `TEAM-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        ...form,
        memberId: generatedMemberId,
        repCode: form.repCode || `REP-${form.name.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase() || 'OFFICER'}`
      };

      const res = await saveTeamMemberRegistrationToSupabase(payload);
      if (res && res.success && res.member) {
        setRegisteredMember(res.member);
      } else {
        setRegisteredMember(payload);
      }
    } catch (err) {
      console.warn('Error during team registration:', err);
      setRegisteredMember({
        ...form,
        memberId: `TEAM-MEM-${Math.floor(1000 + Math.random() * 9000)}`,
        repCode: form.repCode || 'REP-TEAM'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!registeredMember) return;
    const text = `TH3ORY Team Portal Credentials\n───────────────────────────\nName: ${registeredMember.name}\nEmail: ${registeredMember.email}\nMember ID: ${registeredMember.memberId || registeredMember.member_id}\nRep Code: ${registeredMember.repCode || registeredMember.rep_code}\nDepartment: ${registeredMember.department}\nRole: ${registeredMember.role}\nLogin URL: https://th3ory.online/#/team`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  const handleEnterPortalDirectly = () => {
    if (!registeredMember) return;
    const teamObj = {
      role: registeredMember.role || 'team_admin',
      name: registeredMember.name,
      email: registeredMember.email,
      memberId: registeredMember.memberId || registeredMember.member_id,
      repCode: registeredMember.repCode || registeredMember.rep_code,
      department: registeredMember.department,
      phone: registeredMember.phone,
      customQuote: registeredMember.customQuote || registeredMember.custom_quote,
      loginAt: Date.now()
    };
    sessionStorage.setItem('th3ory_team_auth', '1');
    sessionStorage.setItem('th3ory_team_profile', JSON.stringify(teamObj));
    localStorage.setItem('th3ory_team_auth', '1');
    localStorage.setItem('th3ory_team_profile', JSON.stringify(teamObj));

    if (onRegistrationSuccess) {
      onRegistrationSuccess(teamObj);
    } else {
      window.location.hash = '#/team';
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-[#FAFAF7] font-sans relative selection:bg-indigo-500 selection:text-white pb-20">
      <SEOHead 
        title="Team Member Registration • TH3ORY Portal"
        description="Register an official team member account for TH3ORY Masterclass operational access, client management, and tailor-made outreach dashboards."
      />

      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-indigo-950/80 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { window.location.hash = '#/team'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Already Registered? Log In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {!registeredMember ? (
          <div className="space-y-8 animate-fade-in">
            {/* Header Hero */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold uppercase tracking-widest">
                <Users className="w-4 h-4" /> Team Operational Access
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Team Member Registration
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                Allocate your dedicated team profile. Once provisioned, you will unlock your multi-account workspace with tailor-made shareable marketing collateral and account-aligned data.
              </p>
            </div>

            {/* Registration Card */}
            <div className="bg-slate-900/80 border border-indigo-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Personal Information */}
                <div>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 1. Member Profile & Identity
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Full Name <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={handleNameChange}
                        placeholder="e.g. Alex Vance"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Official / Work Email <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="e.g. alex.ops@th3ory.online"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Personal Representative Tracking Tag
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.repCode}
                          onChange={e => setForm({ ...form, repCode: e.target.value.toUpperCase() })}
                          placeholder="e.g. REP-ALEX"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-indigo-300 font-mono font-bold placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 uppercase font-bold">
                          Tracking ID
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Department & Role Alignment */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> 2. Department & Operational Domain
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {DEPARTMENTS.map(dept => {
                      const isSelected = form.department === dept.id;
                      return (
                        <div
                          key={dept.id}
                          onClick={() => handleDeptSelect(dept)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{dept.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{dept.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Specific Designation / Role Title
                    </label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Enterprise Outreach Lead"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* 3. Security Access Passcode */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> 3. Security Passcode & Access Key
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Create Personal Login Passcode <span className="text-indigo-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={form.passcode}
                          onChange={e => setForm({ ...form, passcode: e.target.value })}
                          placeholder="Enter secret passcode"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">You will use this passcode with your Email or Member ID to sign in.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Personal Motto / Professional Bio
                      </label>
                      <input
                        type="text"
                        value={form.customQuote}
                        onChange={e => setForm({ ...form, customQuote: e.target.value })}
                        placeholder="e.g. Behavioral engineering & high-impact client strategy."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Provisioning Account...' : 'Complete Team Registration & Allocate Portal'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Success Screen & Credentials Confirmation Card */
          <div className="max-w-2xl mx-auto space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Team Member Profile Allocated!
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Your person-specific access credentials and tailor-made dashboard have been provisioned successfully.
              </p>
            </div>

            {/* Credential Card */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0B0F19] to-indigo-950/40 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between border-b border-indigo-950 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {(registeredMember.name || 'T')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{registeredMember.name}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{registeredMember.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {registeredMember.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Official Member ID</span>
                  <p className="font-mono font-black text-sm text-indigo-300">
                    {registeredMember.memberId || registeredMember.member_id}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Representative Tracking Tag</span>
                  <p className="font-mono font-black text-sm text-purple-300">
                    {registeredMember.repCode || registeredMember.rep_code}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Login Email</span>
                  <p className="font-semibold text-white truncate">
                    {registeredMember.email}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Assigned Department</span>
                  <p className="font-semibold text-white truncate">
                    {registeredMember.department}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Your workspace is now isolated and aligned to your account. All shared outreach links, B2B quote inquiries, and client communications will attribute directly to your rep handle.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedCreds ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                  <span>{copiedCreds ? 'Credentials Copied!' : 'Copy Credential Details'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleEnterPortalDirectly}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  <span>Launch Team Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
