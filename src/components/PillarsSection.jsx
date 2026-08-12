import React from 'react';
import { Eye, Zap, Heart, Users, Award, CheckCircle2, GraduationCap, Briefcase, TrendingUp, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { courseDetails } from '../data/courseData';

export default function PillarsSection() {
  const iconMap = {
    Eye: Eye,
    Zap: Zap,
    Heart: Heart,
    Users: Users,
    Award: Award,
    GraduationCap: GraduationCap,
    Briefcase: Briefcase,
    TrendingUp: TrendingUp,
    Star: Star
  };

  return (
    <section id="pillars" className="py-24 relative bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* SECTION 1: THE 5 PILLARS OF INFLUENCE */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              <Sparkles className="w-4 h-4" /> Proven 5-Level Psychological Framework
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              The 5 Pillars of <span className="text-gradient-gold">Influence</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Every interaction is an opportunity. Build magnetic presence, command respect, and leave a lasting legacy.
            </p>
          </div>

          {/* 5 Pillars Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {courseDetails.pillars.map((pillar, idx) => {
              const IconComp = iconMap[pillar.icon] || Sparkles;
              return (
                <div
                  key={pillar.id}
                  className="glass-panel rounded-2xl p-6 text-center space-y-4 border border-amber-500/20 hover:border-amber-400/60 hover:translate-y-[-4px] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">PILLAR 0{idx + 1}</span>
                    <h3 className="text-xl font-extrabold font-brand text-white mt-0.5">{pillar.name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {pillar.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: WHAT MAKES THIS PROGRAM DIFFERENT? */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-amber-500/25 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Why TH3ORY Works</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              WHAT MAKES THIS <br />
              <span className="text-gradient-gold">PROGRAM DIFFERENT?</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Designed for high performers who want actionable psychology-backed habits rather than passive theory.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courseDetails.differentiators.map((diff, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-normal">{diff}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: WHO IS THIS FOR? */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              WHO IS <span className="text-gradient-gold">THIS FOR?</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Tailored strategies for every stage of your career and leadership journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {courseDetails.whoIsThisFor.map((target, idx) => {
              const IconComp = iconMap[target.icon] || Users;
              return (
                <div key={idx} className="glass-card rounded-2xl p-5 text-center space-y-3 border border-slate-800 hover:border-amber-500/40 transition-all">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold font-brand text-white">{target.title}</h4>
                  <p className="text-xs text-slate-400">{target.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
