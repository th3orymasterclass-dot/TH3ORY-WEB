import React, { useState, useEffect } from 'react';
import { Play, Flame, ArrowRight, CheckCircle2, Crown, Sparkles, Tag, Rocket } from 'lucide-react';
import { useTh3oryLive, getLaunchCountdown, isEarlyBirdActive, LAUNCH_DATE_ISO } from '../data/adminData';
import { useFeatureFlags } from '../context/FeatureFlagContext';

export default function HeroSection({ onOpenVideo, onOpenCheckout }) {
  const { courseDetails } = useTh3oryLive();
  const { isFeatureEnabled } = useFeatureFlags();
  const showTrailerButton = isFeatureEnabled('ENABLE_TRAILER_VIDEO', false);
  const showUrgencyBanner = isFeatureEnabled('SHOW_LIMITED_SEATS_BANNER', true);

  const [countdown, setCountdown] = useState(() => getLaunchCountdown(LAUNCH_DATE_ISO));
  const [isEarlyBird, setIsEarlyBird] = useState(() => isEarlyBirdActive(LAUNCH_DATE_ISO));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getLaunchCountdown(LAUNCH_DATE_ISO));
      setIsEarlyBird(isEarlyBirdActive(LAUNCH_DATE_ISO));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-36 sm:pt-40 pb-20 overflow-hidden">
      {/* Dynamic Intelligent Violet Radial Glow Behind Logo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-[#7C5CFC]/20 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-[#E9E4FF]/20 text-xs sm:text-sm font-bold tracking-widest text-[#E9E4FF] uppercase shadow-2xl">
            <Crown className="w-4 h-4 text-[#FFC857] fill-[#FFC857]" />
            <span>{courseDetails.bannerQuote}</span>
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
              alt="TH3ORY Masterclass Logo"
              className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-[820px] h-auto object-contain drop-shadow-[0_0_40px_rgba(124,92,252,0.55)] animate-float"
              style={{ filter: 'drop-shadow(0 0 24px rgba(124,92,252,0.5)) drop-shadow(0 0 60px rgba(124,92,252,0.2))' }}
            />
          </div>

          {/* Masterclass Title Sub-banner */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gradient-violet tracking-tight uppercase">
            {courseDetails.title}
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
            {courseDetails.subtitle}
          </p>

          {/* Urgency Seat & Launch Countdown Counter */}
          {showUrgencyBanner && (
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl glass-card border border-[#7C5CFC]/30 text-xs sm:text-sm text-[#FAFAF7]/90 max-w-full shadow-lg">
              <span className="flex items-center gap-1.5 font-bold text-[#FFC857]">
                <Rocket className="w-4 h-4 text-[#FFC857]" /> Launch Date: {courseDetails.urgency?.startDate || "November 1, 2026"}
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-[#555A66]/40" />
              <span className="text-center sm:text-left text-xs">
                {isEarlyBird ? (
                  <strong className="text-emerald-400">Early Bird 20% OFF Applied</strong>
                ) : (
                  <strong className="text-[#FFC857]">Enrollment Live</strong>
                )} • Launching in
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-[#FAFAF7] bg-[#15171A] px-3 py-1 rounded-lg border border-[#7C5CFC]/40 shadow-inner">
                <span className="text-[#FFC857]">{String(countdown.days).padStart(2, '0')}d</span>:
                <span>{String(countdown.hours).padStart(2, '0')}h</span>:
                <span>{String(countdown.minutes).padStart(2, '0')}m</span>:
                <span className="text-[#7C5CFC]">{String(countdown.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-base uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:shadow-[#7C5CFC]/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>{isEarlyBird ? 'ENROLL WITH EARLY BIRD ($119 / ₹9,599)' : 'START YOUR JOURNEY TODAY ($149 / ₹11,999)'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {showTrailerButton && (
              <button
                onClick={onOpenVideo}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card text-[#FAFAF7] hover:bg-[#15171A] font-semibold text-base border border-[#555A66] hover:border-[#7C5CFC] transition-all flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-[#7C5CFC] ml-0.5" />
                </div>
                <span>Watch Trailer &amp; 30-Day Arc</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#555A66] pt-2 font-medium">
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> 100% ONLINE
            </span>
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> LIFETIME ACCESS
            </span>
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/80">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> LEARN AT YOUR PACE
            </span>
          </div>

        </div>

        {/* 4 Core Poster Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          {courseDetails.stats.map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 text-center hover:translate-y-[-2px] transition-all border border-[#E9E4FF]/15">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase">{stat.value}</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xs text-[#555A66] mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
