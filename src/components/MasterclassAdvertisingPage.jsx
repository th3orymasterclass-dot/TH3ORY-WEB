import React, { useState } from 'react';
import { 
  Crown, Sparkles, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, 
  Play, Zap, ShieldCheck, Star, Layers, Target, Compass, Award, ArrowLeft
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';

export default function MasterclassAdvertisingPage({ onOpenCheckout, onOpenVideo, onBack }) {
  const [activeLevel, setActiveLevel] = useState(0);

  const levels = [
    {
      level: "LEVEL 01",
      days: "Days 1 – 6",
      title: "Foundation of Executive Presence",
      tagline: "Commanding physical space & posture baseline before speaking a single word.",
      details: [
        "Somatic grounding & posture recalibration for effortless authority",
        "Vocal resonance engineering: Pitch control & strategic pauses",
        "Subconscious gaze patterns: Eliminating non-verbal hesitation signals",
        "Environmental spatial ownership in boardrooms and keynotes"
      ]
    },
    {
      level: "LEVEL 02",
      days: "Days 7 – 12",
      title: "Micro-Expressions & Behavioral Deception",
      tagline: "Reading hidden emotional states and non-verbal cues under pressure.",
      details: [
        "FACS (Facial Action Coding System) micro-expression decoding",
        "Detecting micro-hesitations & concealed objections in high-stakes deals",
        "Verbal statement analysis: Identifying deceptive phrasing & stress spikes",
        "Establishing rapid baseline reading across diverse personalities"
      ]
    },
    {
      level: "LEVEL 03",
      days: "Days 13 – 18",
      title: "Conversational Dominance & Emotional Resonance",
      tagline: "Guiding conversation direction without appearing aggressive or pushy.",
      details: [
        "Strategic question framing to guide stakeholder thought patterns",
        "Calibrated empathy: Balancing warmth with unshakeable conviction",
        "Storytelling architecture: Translating complex ideas into memorable visions",
        "Pacing & leading techniques to shift hostile rooms into consensus"
      ]
    },
    {
      level: "LEVEL 04",
      days: "Days 19 – 24",
      title: "High-Stakes Negotiation & Group Dynamics",
      tagline: "Influencing key decision-makers and overcoming complex objections.",
      details: [
        "Tactical negotiation dynamics: Anchoring, framing, and silence levers",
        "Mapping group power hierarchies in multi-stakeholder meetings",
        "Neutralizing aggressive tactics & public pressure gracefully",
        "Closing high-ticket commitments with complete alignment"
      ]
    },
    {
      level: "LEVEL 05",
      days: "Days 25 – 30",
      title: "Legacy Operating System & Habit Integration",
      tagline: "Automating your influence OS into permanent long-term behavior.",
      details: [
        "Daily 10-minute influence habit tracker & accountability loops",
        "Designing your personal influence signature & executive brand",
        "Long-term relationship capital management & network leverage",
        "Final Capstone simulation & TH3ORY Masterclass Certification"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] font-sans relative overflow-x-hidden">
      <SEOHead 
        title="30-Day Masterclass Program Architecture • TH3ORY"
        description="Explore the complete 30-Day Human Influence System by Mentalist Sravan Sudhakaran. Level-by-level curriculum breakdown, 5-Pillar framework, and daily habit tracking."
      />
      <StructuredData type="Course" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#E9E4FF]/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCheckout}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Enroll Now ($149 / ₹11,999)</span>
            </button>

            <button
              onClick={() => {
                if (onBack) onBack();
                else { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }
              }}
              className="px-3 py-2 rounded-xl glass-panel text-[#555A66] hover:text-[#FAFAF7] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#7C5CFC]/20 blur-[180px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#E9E4FF]/20 text-[#E9E4FF] text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4 text-[#FFC857]" />
            <span>The Complete 30-Day Transformation Arc</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-[#FAFAF7] uppercase tracking-tight leading-tight">
            THE FLAGSHIP <span className="text-gradient-violet">30-DAY INFLUENCE</span> ARCHITECTURE
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#FAFAF7]/80 font-serif-luxury italic leading-relaxed">
            A progressive, science-backed behavioral transformation system designed to elevate your executive presence, psychological perception, and relationship capital in 30 days.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onOpenCheckout}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Full Lifetime Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenVideo && (
              <button
                onClick={onOpenVideo}
                className="px-6 py-4 rounded-2xl glass-card text-[#FAFAF7] font-semibold text-sm border border-[#555A66] hover:border-[#7C5CFC] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#7C5CFC] fill-[#7C5CFC]" />
                <span>Watch Trailer Video</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* LEVEL-BY-LEVEL CAROUSEL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        
        {/* CAROUSEL CONTROLLER */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#7C5CFC]/30 bg-[#0B0F19]/90 space-y-8 shadow-2xl relative">
          
          {/* Level Switcher Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-[#555A66]/30 pb-4 scrollbar-none">
            {levels.map((lvl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLevel(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeLevel === idx
                    ? 'bg-[#7C5CFC] text-[#FAFAF7] shadow-lg shadow-[#7C5CFC]/30 scale-[1.02]'
                    : 'text-[#555A66] hover:text-[#FAFAF7] hover:bg-[#15171A]'
                }`}
              >
                {lvl.level} • {lvl.days}
              </button>
            ))}
          </div>

          {/* Active Level Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Title & Tagline */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-block px-3 py-1 rounded-lg bg-[#7C5CFC]/20 text-[#7C5CFC] font-mono text-xs font-bold">
                {levels[activeLevel].level} ({levels[activeLevel].days})
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#FAFAF7] uppercase leading-tight">
                {levels[activeLevel].title}
              </h2>
              <p className="text-sm text-[#FFC857] font-serif-luxury italic leading-relaxed">
                "{levels[activeLevel].tagline}"
              </p>
            </div>

            {/* Right Column: Key Modules Checklist */}
            <div className="lg:col-span-7 bg-[#15171A] p-6 sm:p-8 rounded-2xl border border-[#E9E4FF]/10 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#555A66]">Core Learning Outcomes</h3>
              <div className="space-y-3">
                {levels[activeLevel].details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3 text-sm text-[#FAFAF7]/90">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Carousel Arrows Nav */}
          <div className="flex justify-between items-center pt-4 border-t border-[#555A66]/30">
            <button
              onClick={() => setActiveLevel(prev => (prev > 0 ? prev - 1 : levels.length - 1))}
              className="px-4 py-2 rounded-xl glass-card text-xs font-bold uppercase text-[#FAFAF7]/80 hover:text-[#FAFAF7] flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Level
            </button>

            <span className="text-xs font-mono text-[#555A66]">
              Level {activeLevel + 1} of {levels.length}
            </span>

            <button
              onClick={() => setActiveLevel(prev => (prev < levels.length - 1 ? prev + 1 : 0))}
              className="px-4 py-2 rounded-xl glass-card text-xs font-bold uppercase text-[#FAFAF7]/80 hover:text-[#FAFAF7] flex items-center gap-1 cursor-pointer"
            >
              Next Level <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 5 PILLARS FLOWCHART */}
        <div className="space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#FAFAF7] uppercase">The 5 Pillars Operating System</h2>
            <p className="text-[#FAFAF7]/70 font-serif-luxury italic">A interconnected framework scaling from inner confidence to public legacy.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-left font-mono text-xs">
            {[
              { pillar: "01", title: "PRESENCE", color: "text-[#7C5CFC]", desc: "Physical space, posture, vocal resonance, non-verbal confidence." },
              { pillar: "02", title: "POWER", color: "text-[#FFC857]", desc: "Conviction, authority levers, boundary setting, decision control." },
              { pillar: "03", title: "WARMTH", color: "text-[#3B82F6]", desc: "Empathy, active listening, rapid rapport, emotional safety." },
              { pillar: "04", title: "CONNECTION", color: "text-[#10B981]", desc: "Strategic networking, trust architecture, relationship capital." },
              { pillar: "05", title: "LEGACY", color: "text-[#F472B6]", desc: "Long-term influence systems, ethical leadership, mentor status." }
            ].map((p, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-[#E9E4FF]/10 space-y-2 bg-[#0B0F19]/80">
                <div className={`text-2xl font-black ${p.color}`}>{p.pillar}</div>
                <strong className="block text-sm font-bold text-[#FAFAF7] font-heading">{p.title}</strong>
                <p className="text-[11px] text-[#555A66] font-sans leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUCTOR SPOTLIGHT */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0F19] border border-[#555A66]/30 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#FFC857] p-1 shrink-0 shadow-2xl">
            <div className="w-full h-full rounded-full bg-[#15171A] flex items-center justify-center font-black font-brand text-3xl text-[#FFC857]">
              SS
            </div>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-[#FFC857]/10 text-[#FFC857] text-xs font-bold uppercase tracking-wider">
              Lead Masterclass Instructor
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-[#FAFAF7]">Mentalist Sravan Sudhakaran</h3>
            <p className="text-sm text-[#FAFAF7]/80 leading-relaxed font-serif-luxury italic">
              Renowned mentalist, behavioral perception strategist, and executive influence coach. Sravan has trained high-net-worth founders, corporate leaders, and elite professionals in the science of subtle human influence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
