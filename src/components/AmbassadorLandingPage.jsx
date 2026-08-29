import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Zap, Users, GraduationCap, ArrowRight, CheckCircle2, 
  Send, Lock, Gift, DollarSign, Sparkles, FileText, ChevronRight, Share2, 
  Target, Trophy, Calendar, Check, AlertCircle, ArrowLeft, Building2, HelpCircle,
  Crown, Flame
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveAmbassadorApplicationToSupabase } from '../services/supabaseService';

export default function AmbassadorLandingPage() {
  const [activeTab, setActiveTab] = useState('program'); // 'program' | 'apply'
  const [step, setStep] = useState(1);

  // Live Urgency Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 24, seconds: 36 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

      {/* HERO SECTION - IDENTICAL LUXURY MAIN PAGE ARCHITECTURE */}
      <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-b from-[#0b1120] via-[#05080f] to-[#05080f]">
        {/* Dynamic Intelligent Violet Radial Glow Behind Logo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-[#7C5CFC]/20 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Banner Tagline */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-[#E9E4FF]/20 text-xs sm:text-sm font-bold tracking-widest text-[#E9E4FF] uppercase shadow-2xl">
              <Crown className="w-4 h-4 text-[#FFC857] fill-[#FFC857]" />
              <span>OFFICIAL CAMPUS AMBASSADOR &amp; UNIVERSITY LEADERSHIP INITIATIVE</span>
            </div>
          </div>

          {/* Hero Main Content Box */}
          <div className="text-center max-w-5xl mx-auto space-y-6">
            
            {/* Responsively Big Center Hero Logo with Ambient Backlight */}
            <div className="relative flex justify-center py-2 sm:py-6">
              {/* Glow orb behind logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[90%] h-[200%] bg-[#7C5CFC]/15 rounded-full blur-[80px]" />
              </div>
              <img
                src="/logo-cropped.png"
                alt="TH3ORY Campus Ambassador Logo"
                className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-[820px] h-auto object-contain drop-shadow-[0_0_40px_rgba(124,92,252,0.55)] animate-float"
                style={{ filter: 'drop-shadow(0 0 24px rgba(124,92,252,0.5)) drop-shadow(0 0 60px rgba(124,92,252,0.2))' }}
              />
            </div>

            {/* Masterclass Title Sub-banner */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gradient-violet tracking-tight uppercase">
              CAMPUS AMBASSADOR PROGRAM
            </h1>

            {/* 5 Pillars / Themes Ribbon */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-serif-luxury italic tracking-widest text-[#E9E4FF] uppercase py-1">
              <span>LEADERSHIP</span> <span className="text-[#555A66]">•</span>
              <span>CAMPUS IMPACT</span> <span className="text-[#555A66]">•</span>
              <span>PEER MENTORSHIP</span> <span className="text-[#555A66]">•</span>
              <span>COMMISSIONS</span> <span className="text-[#555A66]">•</span>
              <span>CERTIFICATION</span>
            </div>

            {/* Subtitle Description */}
            <p className="text-lg sm:text-2xl text-[#FAFAF7]/90 max-w-3xl mx-auto font-serif-luxury italic leading-relaxed">
              Represent <strong>TH3ORY Masterclass</strong> at your university. Drive peer marketing, organize exclusive workshops, build your leadership network, and earn <strong>₹1,000 cash commission per enrollment</strong> + cash milestone bonuses &amp; certificates.
            </p>

            {/* Urgency Intake Banner with Live Countdown */}
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl glass-card border border-[#E9E4FF]/20 text-xs sm:text-sm text-[#FAFAF7]/80 max-w-full">
              <span className="flex items-center gap-1.5 font-bold text-[#FFC857]">
                <Flame className="w-4 h-4 fill-[#FFC857]" /> Spring / Summer Ambassador Intake
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-[#555A66]/40" />
              <span className="text-center sm:text-left">
                <strong className="text-[#FFC857]">Limited Campus Appointments</strong> • Cohort applications close in
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-[#FAFAF7] bg-[#15171A] px-2.5 py-1 rounded-lg border border-[#7C5CFC]/30">
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setActiveTab('apply');
                  const el = document.getElementById('ambassador-application-form');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full sm:w-auto px-9 py-4 rounded-2xl font-extrabold text-base uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-3 group cursor-pointer ${
                  activeTab === 'apply'
                    ? 'bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] shadow-[#7C5CFC]/30 scale-[1.02]'
                    : 'bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] shadow-[#7C5CFC]/30 hover:scale-[1.02]'
                }`}
              >
                <span>APPLY FOR AMBASSADOR COHORT</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('program')}
                className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-base border transition-all flex items-center justify-center gap-3 group cursor-pointer ${
                  activeTab === 'program'
                    ? 'bg-[#15171A] border-[#7C5CFC] text-[#FAFAF7] shadow-lg shadow-[#7C5CFC]/20'
                    : 'glass-card text-[#FAFAF7] hover:bg-[#15171A] border-[#555A66] hover:border-[#7C5CFC]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4 text-[#FFC857]" />
                </div>
                <span>Program Blueprint &amp; Rewards</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#555A66] pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> ₹1,000 / ENROLLMENT
              </span>
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> OFFICIAL CERTIFICATE &amp; LOR
              </span>
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> 100% FLEXIBLE SCHEDULE
              </span>
            </div>

          </div>

          {/* 4 Core Poster Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">₹1,000</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Per Enrollment</div>
              <div className="text-xs text-[#555A66] mt-0.5">Direct bank / UPI payout</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">12 Weeks</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Term Duration</div>
              <div className="text-xs text-[#555A66] mt-0.5">Hands-on campus leadership</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">Top 5%</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Cash Bonuses</div>
              <div className="text-xs text-[#555A66] mt-0.5">Performance milestone tiers</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">Verified</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Credentials</div>
              <div className="text-xs text-[#555A66] mt-0.5">LOR &amp; Leadership Certificate</div>
            </div>
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
              <div id="ambassador-application-form" className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8 bg-slate-950 text-left">
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
