import React, { useState, useEffect } from 'react';
import { Play, Flame, ArrowRight, CheckCircle2, Crown } from 'lucide-react';
import { courseDetails } from '../data/courseData';

export default function HeroSection({ onOpenVideo, onOpenCheckout }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

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

  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Dynamic Gold Radial Glow Behind Logo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-amber-500/20 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-amber-500/30 text-xs sm:text-sm font-bold tracking-widest text-amber-300 uppercase shadow-2xl">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{courseDetails.bannerQuote}</span>
          </div>
        </div>

        {/* Hero Main Content Box */}
        <div className="text-center max-w-5xl mx-auto space-y-6">
          
          {/* Responsively Big Center Hero Logo with Ambient Backlight */}
          <div className="relative flex justify-center py-2 sm:py-6">
            {/* Glow orb behind logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[90%] h-[200%] bg-amber-500/15 rounded-full blur-[80px]" />
            </div>
            <img
              src="/logo-cropped.png"
              alt="TH3ORY Masterclass Logo"
              className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-[820px] h-auto object-contain drop-shadow-[0_0_40px_rgba(245,158,11,0.55)] animate-float"
              style={{ filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.5)) drop-shadow(0 0 60px rgba(245,158,11,0.2))' }}
            />
          </div>

          {/* Masterclass Title Sub-banner */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gradient-gold tracking-tight uppercase">
            {courseDetails.title}
          </h1>

          {/* 5 Pillars Ribbon */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-extrabold tracking-widest text-amber-300 uppercase py-1">
            <span>PRESENCE</span> <span className="text-slate-600">•</span>
            <span>POWER</span> <span className="text-slate-600">•</span>
            <span>WARMTH</span> <span className="text-slate-600">•</span>
            <span>CONNECTION</span> <span className="text-slate-600">•</span>
            <span>LEGACY</span>
          </div>

          {/* Subtitle Description */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {courseDetails.subtitle}
          </p>

          {/* Urgency Seat Counter */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl glass-card border border-amber-500/20 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" /> Cohort #{courseDetails.urgency.cohortNumber}
            </span>
            <span className="h-3 w-px bg-slate-800" />
            <span>
              <strong className="text-pink-400">{courseDetails.urgency.seatsLeft} Seats Remaining</strong> • Registration closes in
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <span>START YOUR JOURNEY TODAY ($299)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenVideo}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card text-white hover:bg-slate-800/80 font-semibold text-base border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-amber-400 ml-0.5" />
              </div>
              <span>Watch Trailer & 30-Day Arc</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> 100% ONLINE
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> LIFETIME ACCESS
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> LEARN AT YOUR PACE
            </span>
          </div>

        </div>

        {/* 4 Core Poster Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          {courseDetails.stats.map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-amber-500/20">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-gold uppercase">{stat.value}</div>
              <div className="text-sm font-extrabold text-slate-100 mt-1 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
