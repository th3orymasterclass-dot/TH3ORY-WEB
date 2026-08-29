import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Crown, ShieldCheck, ArrowRight, CheckCircle2, Send, Sparkles, 
  Award, Layers, Zap, Clock, BarChart3, ArrowLeft, Lightbulb, Compass, 
  ChevronLeft, ChevronRight, Target, Check, AlertCircle, FileText, Globe, Star,
  LayoutGrid, Calendar, Flame
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveEnterpriseQuoteToSupabase } from '../services/supabaseService';
import CalendlyModal from './CalendlyModal';

export default function EnterprisePage({ onBack }) {
  // Carousel State
  const [activeItem, setActiveItem] = useState(0);

  // Live Urgency Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 45, seconds: 20 });

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

  // Quote Enquiry Form State
  const [formData, setFormData] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    designation: '',
    audienceType: 'Managers & Department Heads',
    pupilCount: '50-100',
    deliveryFormat: '3-Day Corporate Intensive',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  // Scroll Helper
  const scrollToForm = (format = null) => {
    if (format) {
      setFormData(prev => ({ ...prev, deliveryFormat: format }));
    }
    const el = document.getElementById('enterprise-quote-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orgName || !formData.email || !formData.contactName) return;

    setLoading(true);
    await saveEnterpriseQuoteToSupabase(formData);
    const ref = `ENT-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceId(ref);
    setLoading(false);
    setSuccess(true);
  };

  // Executive Program Carousel Items
  const carouselItems = [
    {
      badge: "THE PARADIGM SHIFT",
      navLabel: "Paradigm Shift",
      title: "The Workplace Has Changed",
      quote: "Technical excellence gets you hired. Human influence gets you promoted and creates business leverage.",
      content: "Modern organizations rarely fail due to technical deficiencies. They struggle when high-performing professionals cannot influence without authority, navigate cross-departmental alignment, or build rapid stakeholder trust under pressure.",
      highlights: ["Cross-Functional Alignment", "Influence Without Authority", "Executive Credibility", "Rapid Trust Acceleration"]
    },
    {
      badge: "THE BUSINESS CHALLENGE",
      navLabel: "Business Challenge",
      title: "The Hidden Costs of Ineffective Communication",
      quote: "Ineffective communication is a silent balance sheet drain.",
      content: "Unresolved friction, hesitation in client conversations, and weak relationship capital silently erode team velocity, manager retention, and revenue execution across enterprise teams.",
      highlights: ["Siloed Department Friction", "Low Executive Presence", "Conflict Escalation Costs", "Hesitation in High-Stakes Deals"]
    },
    {
      badge: "OUR PHILOSOPHY",
      navLabel: "Ethical Philosophy",
      title: "Ethical Influence Architecture™",
      quote: "We do not teach manipulation. We teach ethical influence built on absolute trust.",
      content: "Every module is anchored in 4 foundational principles: Transparency, Respect, Mutual Benefit, and Accountability. Leaders learn to influence through authentic trust rather than institutional pressure.",
      highlights: ["Transparency First", "Uncompromising Respect", "Mutual Benefit Design", "Accountable ROI"]
    },
    {
      badge: "CORE ARCHITECTURE",
      navLabel: "5-Pillar Framework",
      title: "The Five-Pillar Leadership Framework",
      quote: "A comprehensive ecosystem covering Presence, Power, Warmth, Strategic Connections, and Legacy.",
      content: "Instead of isolated soft-skills workshops, our progressive framework builds a complete behavioral operating system that scales across emerging leaders, senior managers, and CXOs.",
      highlights: ["Pillar 1: Presence", "Pillar 2: Power", "Pillar 3: Warmth", "Pillar 4: Strategic Connections", "Pillar 5: Legacy"]
    },
    {
      badge: "HIGH-IMPACT DELIVERY",
      navLabel: "Signature Intensive",
      title: "Signature 3-Day Corporate Intensive",
      quote: "From communication psychology on Day 1 to strategic relationship systems on Day 3.",
      content: "An immersive, high-yield workshop packed with live business simulations, role plays, executive voice coaching, and personalized 90-day action plans.",
      highlights: ["Day 1: Presence & Psychology", "Day 2: Influence & Negotiation", "Day 3: Systems & Legacy", "90-Day Follow-Up Review"]
    }
  ];

  const handleNext = () => {
    setActiveItem((prev) => (prev + 1) % carouselItems.length);
  };

  const handlePrev = () => {
    setActiveItem((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] relative selection:bg-[#7C5CFC] selection:text-[#FAFAF7]">
      <SEOHead 
        title="Enterprise Leadership & Corporate Solutions | Influence & Networking Mastery™"
        description="Empower your organization with Influence & Networking Mastery™. Executive corporate training, 3-day corporate intensives, and custom enterprise cohorts for HR, L&D, and CXOs."
        canonicalUrl="https://th3ory.online/#/enterprise"
      />
      <StructuredData />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-panel py-3.5 shadow-2xl border-b border-[#E9E4FF]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack || (() => { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); })}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Back to Main</span>
              </button>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
                className="flex items-center gap-2"
              >
                <Logo className="h-7 sm:h-9" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#FFC857] text-xs font-extrabold tracking-wide">
                <Crown className="w-3.5 h-3.5 text-[#FFC857]" /> Executive Corporate Solutions &amp; Enterprise Architecture
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION - IDENTICAL LUXURY MAIN PAGE ARCHITECTURE */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Dynamic Intelligent Violet Radial Glow Behind Logo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-[#7C5CFC]/20 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Banner Tagline */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-[#E9E4FF]/20 text-xs sm:text-sm font-bold tracking-widest text-[#E9E4FF] uppercase shadow-2xl">
              <Crown className="w-4 h-4 text-[#FFC857] fill-[#FFC857]" />
              <span>EXECUTIVE CORPORATE LEADERSHIP &amp; ENTERPRISE SOLUTIONS</span>
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
                alt="TH3ORY Enterprise Solutions Logo"
                className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-[820px] h-auto object-contain drop-shadow-[0_0_40px_rgba(124,92,252,0.55)] animate-float"
                style={{ filter: 'drop-shadow(0 0 24px rgba(124,92,252,0.5)) drop-shadow(0 0 60px rgba(124,92,252,0.2))' }}
              />
            </div>

            {/* Masterclass Title Sub-banner */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gradient-violet tracking-tight uppercase">
              INFLUENCE &amp; NETWORKING MASTERY™ ENTERPRISE
            </h1>

            {/* 5 Pillars Ribbon */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-serif-luxury italic tracking-widest text-[#E9E4FF] uppercase py-1">
              <span>PRESENCE</span> <span className="text-[#555A66]">•</span>
              <span>POWER</span> <span className="text-[#555A66]">•</span>
              <span>WARMTH</span> <span className="text-[#555A66]">•</span>
              <span>CONNECTION</span> <span className="text-[#555A66]">•</span>
              <span>LEGACY</span>
            </div>

            {/* Subtitle Description */}
            <p className="text-lg sm:text-2xl text-[#FAFAF7]/90 max-w-3xl mx-auto font-serif-luxury italic leading-relaxed">
              A structured leadership development architecture designed for HR, L&amp;D Leaders, Business Heads, Founders, and CXOs. Transform individual contributor talent into influential, high-trust organizational leaders.
            </p>

            {/* Urgency Intake Banner with Live Countdown */}
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl glass-card border border-[#E9E4FF]/20 text-xs sm:text-sm text-[#FAFAF7]/80 max-w-full">
              <span className="flex items-center gap-1.5 font-bold text-[#FFC857]">
                <Flame className="w-4 h-4 fill-[#FFC857]" /> Q1/Q2 Corporate Cohort Intake
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-[#555A66]/40" />
              <span className="text-center sm:text-left">
                <strong className="text-[#FFC857]">Limited Enterprise Capacity</strong> • Executive slots closing in
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
                onClick={() => scrollToForm()}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-base uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:shadow-[#7C5CFC]/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>REQUEST CUSTOM ENTERPRISE PROPOSAL</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsCalendlyOpen(true)}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card text-[#FAFAF7] hover:bg-[#15171A] font-semibold text-base border border-[#555A66] hover:border-[#7C5CFC] transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4 text-[#FFC857]" />
                </div>
                <span>Schedule Strategy Call</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#555A66] pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> 100% CUSTOM CURRICULUM
              </span>
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> ON-SITE &amp; LIVE HYBRID
              </span>
              <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> MEASURABLE 90-DAY ROI
              </span>
            </div>

          </div>

          {/* 4 Core Poster Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">5 Pillars</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Leadership System</div>
              <div className="text-xs text-[#555A66] mt-0.5">Complete behavioral architecture</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">4 Formats</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Flexible Delivery</div>
              <div className="text-xs text-[#555A66] mt-0.5">Intensive, Cohort, Accelerator, Academy</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">4 Principles</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Ethical Influence</div>
              <div className="text-xs text-[#555A66] mt-0.5">Transparency, Respect, Mutual Benefit</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">90-Day</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">Impact Audit</div>
              <div className="text-xs text-[#555A66] mt-0.5">Pre &amp; post leadership review</div>
            </div>
          </div>

        </div>
      </section>

      {/* EXECUTIVE PROGRAM CAROUSEL SECTION */}
      <section id="program-carousel" className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C5CFC]/15 text-[#FFC857] text-xs font-bold uppercase tracking-widest border border-[#7C5CFC]/30">
              <LayoutGrid className="w-4 h-4 text-[#FFC857]" /> Program Highlights &amp; Foundations
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              EXECUTIVE PROGRAM <span className="text-gradient-violet">CAROUSEL</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Explore the core pillars, ethical principles, and strategic foundations of Influence &amp; Networking Mastery™.
            </p>
          </div>

          {/* Interactive Carousel Component */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#7C5CFC]/30 shadow-2xl space-y-8 relative">
            
            {/* Carousel Item Selection Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800/80 pb-6">
              {carouselItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveItem(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition-all cursor-pointer ${
                    activeItem === idx
                      ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-white shadow-lg shadow-[#7C5CFC]/30 scale-[1.03]'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {item.navLabel}
                </button>
              ))}
            </div>

            {/* Active Carousel Card Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
              
              {/* Carousel Content */}
              <div className="lg:col-span-7 space-y-5 text-left animate-fade-in">
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                  {carouselItems[activeItem].badge}
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-heading">
                  {carouselItems[activeItem].title}
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {carouselItems[activeItem].content}
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 border-l-4 border-amber-400 text-slate-200 italic text-xs sm:text-sm font-medium">
                  "{carouselItems[activeItem].quote}"
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Strategic Focus Areas:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-200">
                    {carouselItems[activeItem].highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Visual Card & Controls */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-8 border border-amber-500/20 text-center space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-[#15171A] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#FFC857] p-0.5 mx-auto shadow-xl">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                      <Crown className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase">Influence &amp; Networking Mastery™</div>
                    <div className="text-lg font-bold text-white font-brand">{carouselItems[activeItem].navLabel}</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Custom tailored for corporate teams, HR cohorts, executive retreats, and annual academies.
                    </p>
                  </div>
                </div>

                {/* Prev & Next Controls */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={handlePrev}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1.5">
                    {carouselItems.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        onClick={() => setActiveItem(dotIdx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          activeItem === dotIdx ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* COMPARISON: TRADITIONAL SOFT SKILLS VS INFLUENCE & NETWORKING MASTERY */}
      <section className="py-20 bg-[#15171A] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
              <BarChart3 className="w-4 h-4" /> Uncompromising Quality Standard
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              TRADITIONAL TRAINING VS <span className="text-gradient-amber">OUR SYSTEM</span>
            </h2>
            <p className="text-slate-400 text-base">
              Why leading HR and L&amp;D executives choose Influence &amp; Networking Mastery™ over traditional soft skills seminars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Training */}
            <div className="glass-card rounded-3xl p-8 border border-rose-500/20 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold uppercase">Traditional Soft Skills</span>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Motivational but Unchanged</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Focuses on temporary inspiration and generic slides</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Teaches theoretical concepts without deliberate behavioral practice</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Zero post-training follow-up or structured behavior tracking</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Unmeasured organizational ROI and persistent team friction</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                Result: Employees return inspired for 48 hours… but quickly revert to legacy habits.
              </div>
            </div>

            {/* Influence & Networking Mastery */}
            <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 space-y-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase">Influence &amp; Networking Mastery™</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Repeatable Behavioral Habits</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Anchored in cognitive psychology and real workplace simulations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>5-Pillar leadership framework covering Presence, Power &amp; Legacy</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>30-60-90 day post-program behavioral impact reviews</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Measurable improvements in manager retention &amp; executive presence</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-300 font-semibold text-xs">
                Result: Sustainable behavioral transformation that scales across teams and executive pipelines.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* THE FIVE-PILLAR LEADERSHIP FRAMEWORK */}
      <section className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C5CFC]/15 text-[#FFC857] text-xs font-bold uppercase tracking-widest border border-[#7C5CFC]/30">
              <Layers className="w-4 h-4 text-[#FFC857]" /> Complete Leadership Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              THE FIVE-PILLAR <span className="text-gradient-violet">LEADERSHIP FRAMEWORK</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Most leadership programs focus on one skill. We build the complete leadership architecture across 5 core pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Pillar: Presence */}
            <div className="glass-panel rounded-3xl p-6 border border-[#7C5CFC]/30 space-y-4 hover:border-[#7C5CFC] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-brand">Presence</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Professional confidence and executive presence. Master non-verbal posture, executive vocal resonance, and commanding room authority.
                </p>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
                <li>• Executive Voice &amp; Body Language</li>
                <li>• Professional Confidence</li>
                <li>• Relationship Foundations</li>
              </ul>
            </div>

            {/* Pillar: Power */}
            <div className="glass-panel rounded-3xl p-6 border border-[#7C5CFC]/30 space-y-4 hover:border-[#7C5CFC] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-brand">Power</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Influence, negotiation, and decision-making. Lead under pressure, influence without formal authority, and steer critical conversations.
                </p>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
                <li>• Power Without Authority</li>
                <li>• Negotiation Tactics</li>
                <li>• Strategic Decision Conversations</li>
              </ul>
            </div>

            {/* Pillar: Warmth */}
            <div className="glass-panel rounded-3xl p-6 border border-[#7C5CFC]/30 space-y-4 hover:border-[#7C5CFC] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-brand">Warmth</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Trust, empathy, and emotional intelligence. Build deep psychological safety, defuse conflict early, and earn genuine rapport.
                </p>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
                <li>• Conflict De-escalation</li>
                <li>• Emotional Intelligence</li>
                <li>• Rapport &amp; Empathy Building</li>
              </ul>
            </div>

            {/* Pillar: Strategic Connections */}
            <div className="glass-panel rounded-3xl p-6 border border-[#7C5CFC]/30 space-y-4 hover:border-[#7C5CFC] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-brand">Strategic Connections</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Networking and relationship capital. Develop high-yield internal and external professional relationship systems.
                </p>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
                <li>• Stakeholder Mapping</li>
                <li>• High-Yield Networking</li>
                <li>• Strategic Relationship Capital</li>
              </ul>
            </div>

            {/* Pillar: Legacy */}
            <div className="glass-panel rounded-3xl p-6 border border-[#7C5CFC]/30 space-y-4 hover:border-[#7C5CFC] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white font-brand">Legacy</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Leadership and long-term influence. Cultivate a sustainable personal brand, mentor future managers, and leave lasting impact.
                </p>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800 pt-3">
                <li>• Executive Personal Branding</li>
                <li>• Leadership Pipeline Building</li>
                <li>• Long-Term Career Systems</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* SIGNATURE 3-DAY INTENSIVE ROADMAP */}
      <section className="py-20 bg-[#15171A] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              <Clock className="w-4 h-4" /> Curriculum Roadmap
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">OUR SIGNATURE 3-DAY CORPORATE INTENSIVE</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A immersive, high-impact cohort experience built around simulations, role plays, and executive feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Day One */}
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold uppercase">Day One</span>
                <span className="text-slate-500 text-xs font-mono">Module 01 - 03</span>
              </div>
              <h3 className="text-xl font-bold text-white">Executive Presence &amp; Psychology</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Executive Presence, Communication Psychology, Body Language, Professional Confidence, Executive Voice, and Relationship Foundations.
              </p>
            </div>

            {/* Day Two */}
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#7C5CFC]/20 text-[#E9E4FF] text-xs font-extrabold uppercase">Day Two</span>
                <span className="text-slate-500 text-xs font-mono">Module 04 - 06</span>
              </div>
              <h3 className="text-xl font-bold text-white">Influence &amp; Negotiation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Strategic Communication, Negotiation Frameworks, Conflict Management, Power Without Authority, and High-Stakes Decision Conversations.
              </p>
            </div>

            {/* Day Three */}
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase">Day Three</span>
                <span className="text-slate-500 text-xs font-mono">Module 07 - 10</span>
              </div>
              <h3 className="text-xl font-bold text-white">Networking &amp; Leadership Integration</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Networking Systems, Stakeholder Management, Personal Branding, Relationship Systems, 90-Day Action Planning, and Leadership Integration.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* DELIVERY FORMATS & TARGET AUDIENCE */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Delivery Formats */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
                <Layers className="w-4 h-4" /> Flexible Engagement Options
              </div>
              <h3 className="text-3xl font-extrabold text-white">DELIVERY FORMATS</h3>
              <p className="text-slate-400 text-sm">
                Customized to fit your organizational timeline, cohort size, and learning objectives. Click any format to pre-select it in the quote enquiry form.
              </p>

              <div className="space-y-4 pt-2">
                <button
                  onClick={() => scrollToForm('3-Day Corporate Intensive')}
                  className="w-full p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-400 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">3-Day Corporate Intensive</div>
                    <div className="text-xs text-slate-400">Immersive onsite/virtual workshop</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">Fast-Track</span>
                </button>

                <button
                  onClick={() => scrollToForm('6-Week Leadership Cohort')}
                  className="w-full p-5 rounded-2xl glass-card border border-slate-800 hover:border-[#7C5CFC] flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-[#FFC857] transition-colors">6-Week Leadership Cohort</div>
                    <div className="text-xs text-slate-400">Blended accelerator &amp; peer coaching</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#FFC857] text-xs font-bold border border-[#7C5CFC]/20">Most Popular</span>
                </button>

                <button
                  onClick={() => scrollToForm('12-Week Executive Accelerator')}
                  className="w-full p-5 rounded-2xl glass-card border border-slate-800 hover:border-emerald-400 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">12-Week Executive Accelerator</div>
                    <div className="text-xs text-slate-400">1-on-1 executive coaching &amp; mastery</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">High Impact</span>
                </button>

                <button
                  onClick={() => scrollToForm('Annual Enterprise Academy')}
                  className="w-full p-5 rounded-2xl glass-card border border-slate-800 hover:border-purple-400 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Annual Enterprise Academy</div>
                    <div className="text-xs text-slate-400">Organization-wide development journey</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">Annual License</span>
                </button>
              </div>
            </div>

            {/* Who Is This Program For & Deliverables */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                <Users className="w-4 h-4" /> Audience &amp; Takeaways
              </div>
              <h3 className="text-3xl font-extrabold text-white">WHO IS THIS PROGRAM FOR?</h3>
              <p className="text-slate-400 text-sm">
                Designed for high-potentials, decision makers, and teams needing strong interpersonal influence.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Emerging Leaders', 'Managers & Senior Managers', 'Department Heads', 
                  'Business Development & Sales Teams', 'Client Success Teams', 
                  'Project Managers', 'High-Potential Employees', 'Graduate Leadership Programs', 
                  'Founders & CXOs'
                ].map((aud, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                    ✓ {aud}
                  </span>
                ))}
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-[#7C5CFC]/30 space-y-3 pt-4">
                <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Participant Deliverables Included:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>• Professional Workbook</div>
                  <div>• Influence Toolkit</div>
                  <div>• Networking Playbook</div>
                  <div>• Negotiation Templates</div>
                  <div>• Conversation Scripts</div>
                  <div>• 90-Day Action Plan</div>
                  <div>• Digital Learning Resources</div>
                  <div>• Completion Certificate</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CUSTOM QUOTE ENQUIRY FORM SECTION */}
      <section id="enterprise-quote-form" className="py-24 bg-[#15171A] border-t border-slate-900 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest border border-amber-500/30">
              <Send className="w-4 h-4 text-amber-400" /> Executive Consultation &amp; Enterprise Quotes
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
              REQUEST AN <span className="text-gradient-gold">ENTERPRISE QUOTE</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Partner with our corporate team to receive a tailored proposal, custom curriculum map, and transparent enterprise pricing for your organization.
            </p>
          </div>

          {/* 2-Column Executive Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Corporate Guarantees & Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#15171A]">
                
                <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-brand">Enterprise Guarantee</h3>
                    <p className="text-slate-400 text-xs">Direct HR &amp; CXO Engagement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">24-Hour SLA Response</h4>
                      <p className="text-slate-400 text-xs">Our Corporate Director personally reviews and responds to every enterprise enquiry within 24 hours.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#7C5CFC]/15 text-[#FFC857] flex items-center justify-center shrink-0 mt-0.5 border border-[#7C5CFC]/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Proposal &amp; Map</h4>
                      <p className="text-slate-400 text-xs">Receive a comprehensive PDF breakdown matching your specific cohort size, industry, and timeline.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Confidential &amp; Secure</h4>
                      <p className="text-slate-400 text-xs">Your organizational details and learning objectives are strictly protected under enterprise NDA standards.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" /> Program Direct Line
                  </div>
                  <div className="text-xs text-slate-300 font-medium">Need immediate assistance with an RFP or tender proposal?</div>
                  <div className="text-xs font-mono text-white font-bold">enterprise@th3ory.online</div>
                </div>

              </div>
            </div>

            {/* Right Column: Re-constructed Aligned Quote Form */}
            <div className="lg:col-span-8">
              <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl relative bg-slate-950/90">
                {success ? (
                  <div className="p-8 bg-emerald-500/15 border border-emerald-500/40 rounded-3xl text-center space-y-5 animate-fade-in my-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                      Reference ID: {referenceId}
                    </div>
                    <h3 className="text-2xl font-extrabold text-white font-heading">Enterprise Quote Request Received!</h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for submitting your details. Our Corporate Programs Director will contact you within 24 business hours with a tailored proposal.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Another Quote Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    
                    {/* SECTION 1: Organization & Primary Contact */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
                          1. Organization &amp; Primary Contact
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Organization / Company Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Stanford University / Tech Corp"
                            value={formData.orgName}
                            onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Contact Person Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={formData.contactName}
                            onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Work Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="sarah@company.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Phone / Mobile Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Program Requirements & Scope */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Users className="w-4 h-4 text-[#7C5CFC]" />
                        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
                          2. Program Requirements &amp; Scope
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Target Audience
                          </label>
                          <select
                            value={formData.audienceType}
                            onChange={e => setFormData({ ...formData, audienceType: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-3 text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all cursor-pointer"
                          >
                            <option value="Emerging Leaders & High Potentials">Emerging Leaders &amp; High Potentials</option>
                            <option value="Managers & Department Heads">Managers &amp; Department Heads</option>
                            <option value="Sales & BD Teams">Sales &amp; BD Teams</option>
                            <option value="Executives & CXOs">Executives &amp; CXOs</option>
                            <option value="Mixed Cohort">Mixed Cohort</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Estimated Participants
                          </label>
                          <select
                            value={formData.pupilCount}
                            onChange={e => setFormData({ ...formData, pupilCount: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-3 text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all cursor-pointer"
                          >
                            <option value="10-50">10 – 50 Pupils</option>
                            <option value="50-100">50 – 100 Pupils</option>
                            <option value="100-500">100 – 500 Pupils</option>
                            <option value="500+">500+ Pupils (Campus License)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Preferred Delivery Format
                          </label>
                          <select
                            value={formData.deliveryFormat}
                            onChange={e => setFormData({ ...formData, deliveryFormat: e.target.value })}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-3 text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all cursor-pointer"
                          >
                            <option value="3-Day Corporate Intensive">3-Day Corporate Intensive</option>
                            <option value="6-Week Leadership Cohort">6-Week Leadership Cohort</option>
                            <option value="12-Week Executive Accelerator">12-Week Executive Accelerator</option>
                            <option value="Annual Enterprise Academy">Annual Enterprise Academy</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Customization Notes */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
                          3. Customization &amp; Learning Objectives
                        </h3>
                      </div>
                      
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Specific Learning Goals or Preferred Training Dates
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your team's specific goals, key challenges, or preferred training dates..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none placeholder:text-slate-600"
                      />
                    </div>

                    {/* Submit Button & Security Reassurance */}
                    <div className="space-y-4 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Send className="w-5 h-5" />
                        <span>{loading ? 'Submitting Quote Request...' : 'Submit Enterprise Quote Enquiry'}</span>
                      </button>

                      <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        Confidential Submission • Realtime Supabase Sync • 24-Hour SLA Guarantee
                      </p>
                    </div>

                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        &copy; 2026 Mentalist Sravan Production. Influence &amp; Networking Mastery™ Enterprise Solutions.
      </footer>

      {/* Calendly Executive Strategy Call Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        title="Schedule Enterprise Licensing Strategy Call"
        subtitle="Book a private consultation with TH3ORY corporate licensing team"
      />
    </div>
  );
}
