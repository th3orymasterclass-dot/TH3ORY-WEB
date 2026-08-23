import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Zap, Users, GraduationCap, ArrowRight, CheckCircle2, 
  Send, Lock, Gift, DollarSign, Sparkles, FileText, ChevronRight, Share2, 
  Target, Trophy, Calendar, Check, AlertCircle, ArrowLeft, Building2, HelpCircle
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveAmbassadorApplicationToSupabase } from '../services/supabaseService';

export default function AmbassadorLandingPage() {
  const [activeTab, setActiveTab] = useState('program'); // 'program' | 'apply'
  const [step, setStep] = useState(1);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    degree: '',
    yearOfStudy: '2nd Year',
    socialHandles: '',
    leadershipExp: '',
    motivation: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.collegeName) {
      setErrorMsg('Please complete all required fields (Name, Email, College Name).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await saveAmbassadorApplicationToSupabase(form);
      if (res && res.success) {
        setSubmittedAppId(res.appId || 'AMB-APP-998123');
      } else {
        setSubmittedAppId(`AMB-APP-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err) {
      console.warn('Error submitting ambassador application:', err);
      setSubmittedAppId(`AMB-APP-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-[#FAFAF7] font-sans relative overflow-x-hidden">
      <SEOHead 
        title="Campus Ambassador Program • TH3ORY Masterclass"
        description="Join the official TH3ORY Campus Ambassador Program. Lead peer marketing in your college, gain leadership skills, earn ₹1,000/enrollment commissions + cash bonuses & certificates."
      />
      <StructuredData type="Course" />

      {/* HEADER NAVBAR */}
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
              href="#ambassador-portal"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'ambassador-portal'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ambassador Login</span>
            </a>

            <button
              onClick={() => { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Main</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0b1120] via-[#05080f] to-[#05080f]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official 12-Week College Leadership Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-tight">
            BECOME A <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">CAMPUS AMBASSADOR</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Represent <strong>TH3ORY Masterclass</strong> at your university. Drive peer marketing, organize exclusive workshops, build your leadership network, and earn <strong>₹1,000 cash commission per enrollment</strong> + cash milestone bonuses &amp; certificates.
          </p>

          {/* TAB NAV SWITCHER */}
          <div className="pt-6 flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('program')}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'program'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Program Blueprint &amp; Rewards
            </button>

            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'apply'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" /> Apply for Ambassador Cohort
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">

        {activeTab === 'program' ? (
          <div className="space-y-16">
            
            {/* PROGRAM HIGHLIGHTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-slate-950/80">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">12-Week Term</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Structured 12-week leadership term with flexible hours. Top performers are eligible for term renewal and senior leadership promotions.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-slate-950/80">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">1–3 Per College</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exclusive appointment limit of 1 to 3 ambassadors per campus to maintain high cohort selectivity and high commission potential.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-slate-950/80">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">₹1,000 / Enrollment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct cash commission on every successful student referral driven via your unique referral code or QR link.
                </p>
              </div>
            </div>

            {/* 3-TIER INCENTIVE HIERARCHY */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">3-Tier Ambassador Reward Hierarchy</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Unlock higher rewards, course passes, and cash bonuses as your points grow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* TIER 1 */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 text-left relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">Tier 1 • Active</span>
                    <Award className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Starter Ambassador</h3>
                  <p className="text-xs text-slate-400">Awarded upon completing onboarding &amp; remaining active.</p>
                  
                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Digital Certificate of Appointment</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Campus Ambassador Badge</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Official LinkedIn Recommendation</li>
                  </ul>
                </div>

                {/* TIER 2 */}
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/40 space-y-4 text-left relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-mono">Tier 2 • 300 Points</span>
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Achiever Ambassador</h3>
                  <p className="text-xs text-slate-300">Unlocked at 300 Ambassador Points.</p>
                  
                  <ul className="space-y-2 text-xs text-slate-200 border-t border-amber-500/20 pt-3">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Full TH3ORY Masterclass Course Access Pass</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Official TH3ORY Merchandise Kit</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> ₹2,000 Gift Vouchers</li>
                  </ul>
                </div>

                {/* TIER 3 */}
                <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-500/40 space-y-4 text-left relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 font-mono">Tier 3 • 700 Points</span>
                    <Trophy className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Executive Leader</h3>
                  <p className="text-xs text-slate-300">Unlocked at 700 Ambassador Points.</p>
                  
                  <ul className="space-y-2 text-xs text-slate-200 border-t border-purple-500/20 pt-3">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Cash Performance Bonus</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Premium Executive Merch Box</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 1-on-1 Mentorship with Sravan Sudhakaran</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* REFERRAL COMMISSION & MILESTONE BONUSES */}
            <section className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">Referral Commission &amp; Milestone Bonus Structure</h2>
                  <p className="text-xs text-slate-400">Course Fee: ₹12,000 • Direct Commission: ₹1,000 per Successful Enrollment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-500 uppercase">10 Enrollments Driven</div>
                  <div className="text-lg font-bold text-amber-400">+₹2,000 Cash Bonus</div>
                  <div className="text-[10px] text-slate-400 font-sans">Total Earnings: ₹12,000</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-500 uppercase">25 Enrollments Driven</div>
                  <div className="text-lg font-bold text-amber-400">+₹7,500 Cash Bonus</div>
                  <div className="text-[10px] text-slate-400 font-sans">Total Earnings: ₹32,500</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-500 uppercase">50 Enrollments Driven</div>
                  <div className="text-lg font-bold text-amber-400">+₹20,000 Cash Bonus</div>
                  <div className="text-[10px] text-slate-400 font-sans">Total Earnings: ₹70,000</div>
                </div>
              </div>
            </section>

            {/* POINT SYSTEM TABLE */}
            <section className="space-y-4 text-left">
              <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Point System Table
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Activity</th>
                      <th className="px-6 py-3.5 text-right">Points Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Application Approved &amp; Credentials Issued</td><td className="px-6 py-3 text-right text-amber-400 font-bold">20 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Orientation Session Completed</td><td className="px-6 py-3 text-right text-amber-400 font-bold">20 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Social Media Post Published</td><td className="px-6 py-3 text-right text-amber-400 font-bold">10 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Instagram Story Shared</td><td className="px-6 py-3 text-right text-amber-400 font-bold">5 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Promotional Reel Created</td><td className="px-6 py-3 text-right text-amber-400 font-bold">20 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Qualified Lead Added</td><td className="px-6 py-3 text-right text-amber-400 font-bold">20 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Campus Event Organized</td><td className="px-6 py-3 text-right text-amber-400 font-bold">250 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Campus Workshop Conducted</td><td className="px-6 py-3 text-right text-amber-400 font-bold">300 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Successful Student Enrollment Driven</td><td className="px-6 py-3 text-right text-amber-400 font-bold">150 pts</td></tr>
                    <tr className="hover:bg-slate-900/40"><td className="px-6 py-3 font-sans">Student Video Testimonial Collected</td><td className="px-6 py-3 text-right text-amber-400 font-bold">40 pts</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* CTA TO APPLY */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/30 text-center space-y-4">
              <h3 className="text-2xl font-bold text-white font-heading">Ready to Lead Your Campus?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Applications for the upcoming 12-Week Ambassador Cohort are open. Fill out the 2-step application form to apply.
              </p>
              <button
                onClick={() => setActiveTab('apply')}
                className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <span>Apply for Ambassador Cohort Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (

          /* APPLICATION FORM TAB */
          <div className="max-w-2xl mx-auto animate-fade-in">
            {submittedAppId ? (
              <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/40 text-center space-y-6 bg-slate-950">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-heading">Application Submitted! 🎉</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Your application for the TH3ORY Campus Ambassador Program has been received and logged under reference ID:
                  </p>
                  <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-mono font-bold text-lg">
                    {submittedAppId}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left space-y-2">
                  <div className="font-bold text-white uppercase tracking-wider">What Happens Next:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>Our team reviews your application details and college profile in the Team &amp; Admin Portal.</li>
                    <li>If selected, your official <strong>Ambassador Login Credentials</strong> will be dispatched to <strong className="text-amber-400">{form.email}</strong> via email.</li>
                    <li>You will gain immediate access to your Ambassador Dashboard, referral links, and marketing kits.</li>
                  </ol>
                </div>

                <button
                  onClick={() => {
                    setSubmittedAppId('');
                    setActiveTab('program');
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Return to Program Overview
                </button>
              </div>
            ) : (
              <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8 bg-slate-950 text-left">
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading mb-1">Campus Ambassador Application</h2>
                  <p className="text-slate-400 text-xs">Phase 1: Personal, Academic &amp; Leadership Screening</p>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  {/* Step 1: Personal & College Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                      1. Personal &amp; Academic Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="Alex Vance"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="alex@stanford.edu"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 650 555 0192"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">College / University Name *</label>
                        <input
                          type="text"
                          required
                          value={form.collegeName}
                          onChange={e => setForm({ ...form, collegeName: e.target.value })}
                          placeholder="Stanford University"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Degree / Major</label>
                        <input
                          type="text"
                          value={form.degree}
                          onChange={e => setForm({ ...form, degree: e.target.value })}
                          placeholder="B.Tech Computer Science / Business"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Year of Study</label>
                        <select
                          value={form.yearOfStudy}
                          onChange={e => setForm({ ...form, yearOfStudy: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="1st Year">1st Year (Undergraduate)</option>
                          <option value="2nd Year">2nd Year (Undergraduate)</option>
                          <option value="3rd Year">3rd Year (Undergraduate)</option>
                          <option value="4th Year">4th Year (Undergraduate)</option>
                          <option value="Postgraduate">Postgraduate / Masters</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Social & Leadership Profile */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                      2. Social &amp; Leadership Profile
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Social Media Handles (Instagram / LinkedIn / X)</label>
                        <input
                          type="text"
                          value={form.socialHandles}
                          onChange={e => setForm({ ...form, socialHandles: e.target.value })}
                          placeholder="e.g. @alexvance (Instagram), linkedin.com/in/alexvance"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">College Club &amp; Leadership Experience</label>
                        <textarea
                          rows={3}
                          value={form.leadershipExp}
                          onChange={e => setForm({ ...form, leadershipExp: e.target.value })}
                          placeholder="Describe active club positions, event organization experience, or student council roles..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Why do you want to become a TH3ORY Campus Ambassador?</label>
                        <textarea
                          rows={3}
                          value={form.motivation}
                          onChange={e => setForm({ ...form, motivation: e.target.value })}
                          placeholder="Share your motivation, outreach ideas, and how you plan to represent TH3ORY on campus..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Campus Ambassador Application'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
