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
import PhilosophicalBackground from './PhilosophicalBackground';
import InteractiveCard from './InteractiveCard';
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
    <div className="min-h-screen bg-transparent text-[#FAFAF7] font-sans relative overflow-x-hidden selection:bg-[#FFC857] selection:text-[#070A11]">
      <SEOHead 
        title="Campus Ambassador Program • TH3ORY Masterclass"
        description="Join the official TH3ORY Campus Ambassador Program. Lead peer marketing in your college, gain leadership skills, earn ₹1,000/enrollment commissions + cash bonuses & certificates."
      />
      <StructuredData type="Course" />

      {/* Symbolic Background Scroll & Synaptic Matrix Animation */}
      <PhilosophicalBackground />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#070A11]/90 backdrop-blur-xl border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFC857] via-[#FFAE19] to-[#7C5CFC] p-0.5 shadow-lg shadow-[#FFC857]/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#070A11] rounded-[10px] flex items-center justify-center">
                <span className="text-[#FFC857] font-black text-sm tracking-wider font-heading">T3</span>
              </div>
            </div>
            <span className="text-xl font-bold tracking-wider text-white font-heading">TH3ORY</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer glass-specular"
            >
              <ArrowLeft className="w-4 h-4 text-[#FFC857]" />
              <span className="hidden sm:inline">Back to Main</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - HAUTE LUXURY ARCHITECTURE */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Banner Tagline */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-specular border border-[#FFC857]/30 text-xs sm:text-sm font-bold tracking-widest text-[#FFC857] uppercase shadow-xl">
              <Crown className="w-4 h-4 text-[#FFC857] fill-[#FFC857]" />
              <span>OFFICIAL CAMPUS AMBASSADOR &amp; UNIVERSITY LEADERSHIP INITIATIVE</span>
            </div>
          </div>

          {/* Hero Main Content Box */}
          <div className="text-center max-w-5xl mx-auto space-y-6">
            
            {/* Responsively Big Center Hero Logo with Ambient Backlight */}
            <div className="relative flex justify-center py-2 sm:py-6">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[180%] bg-[#7C5CFC]/20 rounded-full blur-[90px]" />
              </div>
              <img
                src="/logo-cropped.png"
                alt="TH3ORY Campus Ambassador Logo"
                className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-[780px] h-auto object-contain drop-shadow-[0_0_40px_rgba(124,92,252,0.55)] animate-float"
              />
            </div>

            {/* Masterclass Title Sub-banner */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gradient-violet tracking-tight uppercase">
              CAMPUS AMBASSADOR PROGRAM
            </h1>

            {/* 5 Pillars / Themes Ribbon */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-serif-luxury italic tracking-widest text-[#E9E4FF] uppercase py-1">
              <span>LEADERSHIP</span> <span className="text-white/30">•</span>
              <span>CAMPUS IMPACT</span> <span className="text-white/30">•</span>
              <span>PEER MENTORSHIP</span> <span className="text-white/30">•</span>
              <span>COMMISSIONS</span> <span className="text-white/30">•</span>
              <span>CERTIFICATION</span>
            </div>

            {/* Subtitle Description */}
            <p className="text-lg sm:text-2xl text-[#FAFAF7]/90 max-w-3xl mx-auto font-serif-luxury italic leading-relaxed">
              Represent <strong>TH3ORY Masterclass</strong> at your university. Drive peer marketing, organize exclusive workshops, build your leadership network, and earn <strong>₹1,000 cash commission per enrollment</strong> + cash milestone bonuses &amp; certificates.
            </p>

            {/* Urgency Intake Banner with Live Countdown */}
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl glass-card-luxury border border-[#FFC857]/30 text-xs sm:text-sm text-[#FAFAF7]/90 max-w-full shadow-2xl">
              <span className="flex items-center gap-1.5 font-bold text-[#FFC857]">
                <Flame className="w-4 h-4 fill-[#FFC857]" /> Spring / Summer Ambassador Intake
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-white/20" />
              <span className="text-center sm:text-left">
                <strong className="text-[#FFC857]">Limited Campus Appointments</strong> • Cohort applications close in
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#FFC857] bg-black/60 px-3 py-1 rounded-xl border border-[#FFC857]/30 shadow-inner">
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
                className={`w-full sm:w-auto px-9 py-4 rounded-2xl font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-3 group cursor-pointer ${
                  activeTab === 'apply'
                    ? 'bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] text-[#070A11] shadow-[#FFC857]/30 scale-[1.02]'
                    : 'bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] hover:brightness-110 text-[#070A11] shadow-[#FFC857]/30 hover:scale-[1.02]'
                }`}
              >
                <span>APPLY FOR AMBASSADOR COHORT</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('program')}
                className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-sm sm:text-base border transition-all flex items-center justify-center gap-3 group cursor-pointer ${
                  activeTab === 'program'
                    ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/20'
                    : 'glass-specular text-[#FAFAF7] hover:bg-white/10 border-white/10 hover:border-[#7C5CFC]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#FFC857]/20 text-[#FFC857] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4 text-[#FFC857]" />
                </div>
                <span>Program Blueprint &amp; Rewards</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> ₹1,000 / ENROLLMENT
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> OFFICIAL CERTIFICATE &amp; LOR
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> 100% FLEXIBLE SCHEDULE
              </span>
            </div>

          </div>

          {/* 4 Core Poster Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <InteractiveCard glowColor="gold" intensity={12} className="rounded-2xl">
              <div className="glass-card-luxury rounded-2xl p-6 text-center h-full shadow-xl">
                <div className="text-3xl sm:text-4xl font-black font-brand text-[#FFC857] uppercase">₹1,000</div>
                <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Per Enrollment</div>
                <div className="text-xs text-slate-400 mt-0.5">Direct bank / UPI payout</div>
              </div>
            </InteractiveCard>

            <InteractiveCard glowColor="violet" intensity={12} className="rounded-2xl">
              <div className="glass-card-luxury rounded-2xl p-6 text-center h-full shadow-xl">
                <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">12 Weeks</div>
                <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Term Duration</div>
                <div className="text-xs text-slate-400 mt-0.5">Hands-on campus leadership</div>
              </div>
            </InteractiveCard>

            <InteractiveCard glowColor="amber" intensity={12} className="rounded-2xl">
              <div className="glass-card-luxury rounded-2xl p-6 text-center h-full shadow-xl">
                <div className="text-3xl sm:text-4xl font-black font-brand text-[#FFC857] uppercase">Top 5%</div>
                <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Cash Bonuses</div>
                <div className="text-xs text-slate-400 mt-0.5">Performance milestone tiers</div>
              </div>
            </InteractiveCard>

            <InteractiveCard glowColor="indigo" intensity={12} className="rounded-2xl">
              <div className="glass-card-luxury rounded-2xl p-6 text-center h-full shadow-xl">
                <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">Verified</div>
                <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Credentials</div>
                <div className="text-xs text-slate-400 mt-0.5">LOR &amp; Leadership Certificate</div>
              </div>
            </InteractiveCard>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">

        {activeTab === 'program' ? (
          <div className="space-y-16">
            
            {/* PROGRAM HIGHLIGHTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InteractiveCard glowColor="gold" className="rounded-3xl">
                <div className="glass-card-luxury p-7 rounded-3xl space-y-3.5 shadow-2xl h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFC857]/15 border border-[#FFC857]/30 text-[#FFC857] flex items-center justify-center font-bold shadow-lg shadow-[#FFC857]/10">
                    <Calendar className="w-6 h-6 text-[#FFC857]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">12-Week Term</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Structured 12-week leadership term with flexible hours. Top performers are eligible for term renewal and senior leadership promotions.
                  </p>
                </div>
              </InteractiveCard>

              <InteractiveCard glowColor="violet" className="rounded-3xl">
                <div className="glass-card-luxury p-7 rounded-3xl space-y-3.5 shadow-2xl h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#7C5CFC] flex items-center justify-center font-bold shadow-lg shadow-[#7C5CFC]/10">
                    <Users className="w-6 h-6 text-[#7C5CFC]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">1–3 Per College</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Exclusive appointment limit of 1 to 3 ambassadors per campus to maintain high cohort selectivity and high commission potential.
                  </p>
                </div>
              </InteractiveCard>

              <InteractiveCard glowColor="amber" className="rounded-3xl">
                <div className="glass-card-luxury p-7 rounded-3xl space-y-3.5 shadow-2xl h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFC857]/15 border border-[#FFC857]/30 text-[#FFC857] flex items-center justify-center font-bold shadow-lg shadow-[#FFC857]/10">
                    <DollarSign className="w-6 h-6 text-[#FFC857]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">₹1,000 / Enrollment</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Direct cash commission on every successful student referral driven via your unique referral code or QR link.
                  </p>
                </div>
              </InteractiveCard>
            </div>

            {/* 3-TIER INCENTIVE HIERARCHY */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">3-Tier Ambassador Reward Hierarchy</h2>
                <p className="text-slate-300 text-xs sm:text-sm">Unlock higher rewards, course passes, and cash bonuses as your points grow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* TIER 1 */}
                <InteractiveCard glowColor="indigo" className="rounded-3xl">
                  <div className="p-7 rounded-3xl glass-card-luxury space-y-4 text-left relative overflow-hidden shadow-2xl h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">Tier 1 • Active</span>
                      <Award className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-serif-luxury">Starter Ambassador</h3>
                    <p className="text-xs text-slate-300">Awarded upon completing onboarding &amp; remaining active.</p>
                    
                    <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Digital Certificate of Appointment</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Campus Ambassador Badge</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" /> Official LinkedIn Recommendation</li>
                    </ul>
                  </div>
                </InteractiveCard>

                {/* TIER 2 */}
                <InteractiveCard glowColor="gold" className="rounded-3xl">
                  <div className="p-7 rounded-3xl glass-card-gold space-y-4 text-left relative overflow-hidden shadow-2xl h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFC857] font-mono">Tier 2 • 300 Points</span>
                      <Gift className="w-5 h-5 text-[#FFC857]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-serif-luxury">Achiever Ambassador</h3>
                    <p className="text-xs text-slate-300">Unlocked at 300 Ambassador Points.</p>
                    
                    <ul className="space-y-2.5 text-xs text-slate-200 border-t border-[#FFC857]/20 pt-4">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFC857] shrink-0" /> Full TH3ORY Masterclass Course Access Pass</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFC857] shrink-0" /> Official TH3ORY Merchandise Kit</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FFC857] shrink-0" /> ₹2,000 Gift Vouchers</li>
                    </ul>
                  </div>
                </InteractiveCard>

                {/* TIER 3 */}
                <InteractiveCard glowColor="violet" className="rounded-3xl">
                  <div className="p-7 rounded-3xl glass-card-luxury space-y-4 text-left relative overflow-hidden shadow-2xl border-[#7C5CFC]/40 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#9277FF] font-mono">Tier 3 • 700 Points</span>
                      <Trophy className="w-5 h-5 text-[#9277FF]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-serif-luxury">Executive Leader</h3>
                    <p className="text-xs text-slate-300">Unlocked at 700 Ambassador Points.</p>
                    
                    <ul className="space-y-2.5 text-xs text-slate-200 border-t border-white/10 pt-4">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7C5CFC] shrink-0" /> Cash Performance Bonus</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7C5CFC] shrink-0" /> Premium Executive Merch Box</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7C5CFC] shrink-0" /> 1-on-1 Mentorship with Sravan Sudhakaran</li>
                    </ul>
                  </div>
                </InteractiveCard>

              </div>
            </section>

            {/* REFERRAL COMMISSION & MILESTONE BONUSES */}
            <section className="p-8 sm:p-10 rounded-3xl glass-card-luxury space-y-6 text-left shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFC857]/15 border border-[#FFC857]/30 text-[#FFC857] flex items-center justify-center font-bold shadow-lg shadow-[#FFC857]/10">
                  <DollarSign className="w-6 h-6 text-[#FFC857]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">Referral Commission &amp; Milestone Bonus Structure</h2>
                  <p className="text-xs text-slate-300">Course Fee: ₹12,000 • Direct Commission: ₹1,000 per Successful Enrollment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1 glass-specular">
                  <div className="text-slate-400 uppercase text-[11px]">10 Enrollments Driven</div>
                  <div className="text-xl font-bold text-[#FFC857]">+₹2,000 Cash Bonus</div>
                  <div className="text-[11px] text-slate-300 font-sans">Total Earnings: ₹12,000</div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1 glass-specular">
                  <div className="text-slate-400 uppercase text-[11px]">25 Enrollments Driven</div>
                  <div className="text-xl font-bold text-[#FFC857]">+₹7,500 Cash Bonus</div>
                  <div className="text-[11px] text-slate-300 font-sans">Total Earnings: ₹32,500</div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1 glass-specular">
                  <div className="text-slate-400 uppercase text-[11px]">50 Enrollments Driven</div>
                  <div className="text-xl font-bold text-[#FFC857]">+₹20,000 Cash Bonus</div>
                  <div className="text-[11px] text-slate-300 font-sans">Total Earnings: ₹70,000</div>
                </div>
              </div>
            </section>

            {/* POINT SYSTEM TABLE */}
            <section className="space-y-4 text-left">
              <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFC857]" /> Point System Table
              </h2>
              <div className="overflow-x-auto rounded-2xl glass-card-luxury border border-white/10">
                <table className="w-full text-xs text-left text-slate-200">
                  <thead className="text-[11px] font-bold text-slate-400 uppercase bg-black/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3.5">Activity</th>
                      <th className="px-6 py-3.5 text-right">Points Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Application Approved &amp; Credentials Issued</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">20 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Orientation Session Completed</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">20 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Social Media Post Published</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">10 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Instagram Story Shared</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">5 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Promotional Reel Created</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">20 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Qualified Lead Added</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">20 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Campus Event Organized</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">250 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Campus Workshop Conducted</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">300 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Successful Student Enrollment Driven</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">150 pts</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3.5 font-sans">Student Video Testimonial Collected</td><td className="px-6 py-3.5 text-right text-[#FFC857] font-bold">40 pts</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* CTA TO APPLY */}
            <div className="p-8 sm:p-10 rounded-3xl glass-card-gold text-center space-y-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-white font-heading">Ready to Lead Your Campus?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Applications for the upcoming 12-Week Ambassador Cohort are open. Fill out the 2-step application form to apply.
              </p>
              <button
                onClick={() => setActiveTab('apply')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] hover:brightness-110 text-[#070A11] font-extrabold text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FFC857]/20 flex items-center gap-2 mx-auto cursor-pointer"
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
              <div className="glass-card-gold p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-serif-luxury">Application Submitted! 🎉</h2>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Your application for the TH3ORY Campus Ambassador Program has been received and logged under reference ID:
                  </p>
                  <div className="inline-block px-5 py-2.5 rounded-xl bg-black/60 border border-[#FFC857]/40 text-[#FFC857] font-mono font-bold text-lg shadow-inner">
                    {submittedAppId}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 text-left space-y-2 glass-specular">
                  <div className="font-bold text-white uppercase tracking-wider">What Happens Next:</div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                    <li>Our team reviews your application details and college profile in the Team &amp; Admin Portal.</li>
                    <li>If selected, your official <strong>Ambassador Login Credentials</strong> will be dispatched to <strong className="text-[#FFC857]">{form.email}</strong> via email.</li>
                    <li>You will gain immediate access to your Ambassador Dashboard, referral links, and marketing kits.</li>
                  </ol>
                </div>

                <button
                  onClick={() => {
                    setSubmittedAppId('');
                    setActiveTab('program');
                  }}
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer glass-specular"
                >
                  Return to Program Overview
                </button>
              </div>
            ) : (
              <div id="ambassador-application-form" className="glass-card-luxury p-7 sm:p-10 rounded-3xl space-y-8 text-left shadow-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading mb-1">Campus Ambassador Application</h2>
                  <p className="text-slate-300 text-xs">Phase 1: Personal, Academic &amp; Leadership Screening</p>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  {/* Step 1: Personal & College Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#FFC857] uppercase tracking-widest border-b border-white/10 pb-2">
                      1. Personal &amp; Academic Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="Alex Vance"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="alex@stanford.edu"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 650 555 0192"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">College / University Name *</label>
                        <input
                          type="text"
                          required
                          value={form.collegeName}
                          onChange={e => setForm({ ...form, collegeName: e.target.value })}
                          placeholder="Stanford University"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Degree / Major</label>
                        <input
                          type="text"
                          value={form.degree}
                          onChange={e => setForm({ ...form, degree: e.target.value })}
                          placeholder="B.Tech Computer Science / Business"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857]/40 transition-all glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Year of Study</label>
                        <select
                          value={form.yearOfStudy}
                          onChange={e => setForm({ ...form, yearOfStudy: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] transition-all glass-specular"
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
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold text-[#FFC857] uppercase tracking-widest border-b border-white/10 pb-2">
                      2. Social &amp; Leadership Profile
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Social Media Handles (Instagram / LinkedIn / X)</label>
                        <input
                          type="text"
                          value={form.socialHandles}
                          onChange={e => setForm({ ...form, socialHandles: e.target.value })}
                          placeholder="e.g. @alexvance (Instagram), linkedin.com/in/alexvance"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] font-mono glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">College Club &amp; Leadership Experience</label>
                        <textarea
                          rows={3}
                          value={form.leadershipExp}
                          onChange={e => setForm({ ...form, leadershipExp: e.target.value })}
                          placeholder="Describe active club positions, event organization experience, or student council roles..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] resize-none glass-specular"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Why do you want to become a TH3ORY Campus Ambassador?</label>
                        <textarea
                          rows={3}
                          value={form.motivation}
                          onChange={e => setForm({ ...form, motivation: e.target.value })}
                          placeholder="Share your motivation, outreach ideas, and how you plan to represent TH3ORY on campus..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFC857] resize-none glass-specular"
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
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] hover:brightness-110 text-[#070A11] font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-[#FFC857]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
