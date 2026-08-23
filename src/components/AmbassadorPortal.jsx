import React, { useState, useEffect } from 'react';
import { 
  Lock, Award, ShieldCheck, Zap, Users, ArrowRight, CheckCircle2, 
  Send, Copy, Download, Share2, Target, Trophy, Calendar, Check, 
  AlertCircle, ArrowLeft, LogOut, FileText, QrCode, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import { fetchAmbassadorByCodeFromSupabase, saveAmbassadorWeeklyReportToSupabase } from '../services/supabaseService';

export default function AmbassadorPortal() {
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Weekly Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    postsCount: 3,
    storiesCount: 6,
    leadsGenerated: 5,
    eventNotes: '',
    challenges: '',
    nextWeekPlan: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Auto-login from persistent session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('th3ory_ambassador_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.ambassadorCode) {
          fetchAmbassadorByCodeFromSupabase(parsed.ambassadorCode).then(res => {
            if (res) setAmbassador(res);
          });
        }
      }
    } catch {}
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authCode) return;

    setLoading(true);
    setLoginError('');

    try {
      const res = await fetchAmbassadorByCodeFromSupabase(authCode);
      if (res) {
        setAmbassador(res);
        try {
          sessionStorage.setItem('th3ory_ambassador_session', JSON.stringify(res));
        } catch {}
      } else {
        setLoginError('Invalid Ambassador Code or Password. Try logging in with demo code: AMB-DEMO');
      }
    } catch (err) {
      setLoginError('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAmbassador(null);
    try {
      sessionStorage.removeItem('th3ory_ambassador_session');
    } catch {}
  };

  const handleCopyReferralLink = () => {
    if (!ambassador) return;
    const link = `https://th3ory.online/#/enroll?ambassador=${ambassador.ambassadorCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWeeklyReportSubmit = async (e) => {
    e.preventDefault();
    if (!ambassador) return;

    setSubmittingReport(true);
    try {
      await saveAmbassadorWeeklyReportToSupabase(ambassador.ambassadorCode, reportForm);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        // Refresh ambassador data
        fetchAmbassadorByCodeFromSupabase(ambassador.ambassadorCode).then(res => {
          if (res) setAmbassador(res);
        });
      }, 1500);
    } catch (err) {
      console.warn('Report submission error:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const referralLink = ambassador ? `https://th3ory.online/#/enroll?ambassador=${ambassador.ambassadorCode}` : '';
  const currentPoints = ambassador ? (ambassador.points || 0) : 0;
  const nextTierPoints = currentPoints >= 700 ? 700 : (currentPoints >= 300 ? 700 : 300);
  const tierProgressPct = Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

  return (
    <div className="min-h-screen bg-[#05080f] text-[#FAFAF7] font-sans relative overflow-x-hidden">
      <SEOHead 
        title="Ambassador Dashboard • TH3ORY Masterclass"
        description="Private Campus Ambassador Command Center. Track referral leads, driven enrollments, commissions (₹), weekly Friday reports, and marketing kits."
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          <div className="flex items-center gap-3">
            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'ambassador'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Program Info</span>
            </a>

            {ambassador && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {!ambassador ? (

          /* LOGIN SCREEN */
          <div className="max-w-md mx-auto py-12 animate-fade-in text-left">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 bg-slate-950 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-white font-heading">Ambassador Portal Login</h1>
                <p className="text-xs text-slate-400">Access your private campus referral dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ambassador Code / Email *</label>
                  <input
                    type="text"
                    required
                    value={authCode}
                    onChange={e => setAuthCode(e.target.value)}
                    placeholder="e.g. AMB-DEMO or alex@stanford.edu"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? 'Authenticating...' : 'Sign In To Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthCode('AMB-DEMO');
                      setPassword('TH3ORY-AMB-2026');
                    }}
                    className="text-[11px] text-amber-400 underline font-mono hover:text-amber-300"
                  >
                    Click to load Demo Ambassador Credentials (AMB-DEMO)
                  </button>
                </div>
              </form>
            </div>
          </div>

        ) : (

          /* AMBASSADOR DASHBOARD WORKSPACE */
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* AMBASSADOR PROFILE HEADER CARD */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-xl flex items-center justify-center font-mono">
                  {ambassador.name ? ambassador.name.substring(0, 2).toUpperCase() : 'AM'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">{ambassador.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                      ● Active Ambassador
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    🎓 {ambassador.collegeName || 'Stanford University'} • {ambassador.degree || 'Computer Science'} ({ambassador.yearOfStudy || '3rd Year'})
                  </p>
                </div>
              </div>

              {/* TIER BADGE & ACTION BUTTONS */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{ambassador.tier || 'Tier 1 Ambassador'}</span>
                </div>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Friday Report</span>
                </button>
              </div>
            </div>

            {/* REFERRAL CODE & LINK CARD */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" /> Unique Referral Code &amp; Student Link
                  </h3>
                  <p className="text-xs text-slate-400">Share your referral link with college peers to earn ₹1,000 cash commission per enrollment.</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/30">
                  CODE: {ambassador.ambassadorCode}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyReferralLink}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                </button>
              </div>
            </div>

            {/* PERFORMANCE METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-500 text-xs uppercase font-mono font-bold">Total Points</div>
                <div className="text-2xl font-black text-amber-400 font-mono">{currentPoints} pts</div>
                <div className="text-[10px] text-slate-400">Point Score</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-500 text-xs uppercase font-mono font-bold">Qualified Leads</div>
                <div className="text-2xl font-black text-indigo-400 font-mono">{ambassador.totalLeads || 0}</div>
                <div className="text-[10px] text-slate-400">Student Leads</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-500 text-xs uppercase font-mono font-bold">Enrollments</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{ambassador.totalEnrollments || 0}</div>
                <div className="text-[10px] text-slate-400">Driven Purchases</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-500 text-xs uppercase font-mono font-bold">Total Commission</div>
                <div className="text-2xl font-black text-amber-300 font-mono">₹{(ambassador.totalCommission || 0).toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">₹1,000 / Enrollment</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-slate-500 text-xs uppercase font-mono font-bold">Sunday Rank</div>
                <div className="text-2xl font-black text-purple-400 font-mono">#3 Leader</div>
                <div className="text-[10px] text-slate-400">College Standings</div>
              </div>
            </div>

            {/* TIER PROGRESS BAR */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 font-heading">Progress to Next Tier Level</span>
                <span className="text-amber-400 font-mono">{currentPoints} / {nextTierPoints} Points ({tierProgressPct}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${tierProgressPct}%` }}
                />
              </div>
            </div>

            {/* AMBASSADOR TOOLKIT & DOWNLOADS */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" /> Ambassador Marketing &amp; Sales Toolkit
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* MARKETING ASSETS */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Marketing Assets
                  </div>
                  <h3 className="text-base font-bold text-white">Social Templates &amp; Reels</h3>
                  <p className="text-xs text-slate-400">Download high-converting Instagram stories, reels scripts, and poster graphics.</p>
                  <button
                    onClick={() => alert('Downloading TH3ORY Campus Marketing Toolkit zip archive...')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Marketing Kit (.ZIP)
                  </button>
                </div>

                {/* SALES ASSETS */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> Sales &amp; Pitch Assets
                  </div>
                  <h3 className="text-base font-bold text-white">FAQ &amp; Pitch Deck</h3>
                  <p className="text-xs text-slate-400">Student FAQs, pricing documentation, WhatsApp pitch templates, and testimonials.</p>
                  <button
                    onClick={() => alert('Downloading TH3ORY Campus Pitch Deck & FAQ documentation...')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Sales Kit (.PDF)
                  </button>
                </div>

                {/* EVENT KITS */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" /> Event &amp; Workshop Kit
                  </div>
                  <h3 className="text-base font-bold text-white">Workshop Presentation</h3>
                  <p className="text-xs text-slate-400">Campus workshop slides, student attendance trackers, registration sheets &amp; checklists.</p>
                  <button
                    onClick={() => alert('Downloading Campus Workshop Event Kit slides...')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Event Kit (.PPTX)
                  </button>
                </div>

              </div>
            </section>

          </div>
        )}

      </div>

      {/* WEEKLY REPORT SUBMISSION MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Friday Weekly Activity Report</h3>
                <p className="text-xs text-slate-400">Submit your weekly campus outreach report (+50 pts bonus)</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Report Submitted! 🎉</h4>
                <p className="text-xs text-slate-300">+50 Points awarded to your ambassador profile.</p>
              </div>
            ) : (
              <form onSubmit={handleWeeklyReportSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Posts</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.postsCount}
                      onChange={e => setReportForm({ ...reportForm, postsCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stories</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.storiesCount}
                      onChange={e => setReportForm({ ...reportForm, storiesCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Leads</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.leadsGenerated}
                      onChange={e => setReportForm({ ...reportForm, leadsGenerated: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Campus Event / Workshop Activity</label>
                  <textarea
                    rows={2}
                    value={reportForm.eventNotes}
                    onChange={e => setReportForm({ ...reportForm, eventNotes: e.target.value })}
                    placeholder="Details on campus info sessions or student discussions..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Next Week's Action Plan</label>
                  <textarea
                    rows={2}
                    value={reportForm.nextWeekPlan}
                    onChange={e => setReportForm({ ...reportForm, nextWeekPlan: e.target.value })}
                    placeholder="Planned posts, student group outreach, or club partnerships..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Weekly Activity Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
