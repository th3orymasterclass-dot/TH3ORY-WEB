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
      {/* Dynamic Ambient Luxury Spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[950px] h-[450px] sm:h-[550px] bg-gradient-to-br from-[#7C5CFC]/25 via-[#6344E0]/15 to-transparent rounded-full blur-[140px] sm:blur-[180px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-[#FFC857]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-specular border border-[#E9E4FF]/25 text-xs sm:text-sm font-bold tracking-widest text-[#E9E4FF] uppercase shadow-2xl">
            <Crown className="w-4 h-4 text-[#FFC857] fill-[#FFC857] shrink-0" />
            <span>{courseDetails.bannerQuote}</span>
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
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-serif-luxury italic tracking-widest text-[#E9E4FF] uppercase py-1">
            <span className="hover:text-[#FFC857] transition-colors">PRESENCE</span> <span className="text-[#FFC857]">•</span>
            <span className="hover:text-[#FFC857] transition-colors">POWER</span> <span className="text-[#FFC857]">•</span>
            <span className="hover:text-[#FFC857] transition-colors">WARMTH</span> <span className="text-[#FFC857]">•</span>
            <span className="hover:text-[#FFC857] transition-colors">CONNECTION</span> <span className="text-[#FFC857]">•</span>
            <span className="hover:text-[#FFC857] transition-colors">LEGACY</span>
          </div>

          {/* Subtitle Description */}
          <p className="text-lg sm:text-2xl text-[#FAFAF7]/90 max-w-3xl mx-auto font-serif-luxury italic leading-relaxed">
            {courseDetails.subtitle}
          </p>

          {/* Urgency Seat & Launch Countdown Digital Clock */}
          {showUrgencyBanner && (
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-6 py-3.5 rounded-2xl glass-specular border border-[#7C5CFC]/35 text-xs sm:text-sm text-[#FAFAF7] max-w-full shadow-2xl">
              <span className="flex items-center gap-2 font-bold text-[#FFC857]">
                <Rocket className="w-4 h-4 text-[#FFC857] shrink-0" /> Launch Date: November 1, 2026
              </span>
              <span className="hidden sm:inline-block h-4 w-px bg-[#555A66]/50" />
              <span className="text-center sm:text-left text-xs text-[#E9E4FF]">
                {isEarlyBird ? (
                  <strong className="text-emerald-400 font-extrabold">Early Bird 20% OFF Applied</strong>
                ) : (
                  <strong className="text-[#FFC857] font-extrabold">Enrollment Live</strong>
                )} • Launching in
              </span>
              
              {/* Digital Countdown Timer Blocks */}
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#FAFAF7]">
                <div className="bg-[#0B0F19] border border-[#7C5CFC]/40 px-2.5 py-1 rounded-lg text-center shadow-inner">
                  <span className="text-sm sm:text-base text-[#FFC857]">{String(countdown.days).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-[#555A66] font-sans uppercase">days</span>
                </div>
                <span className="text-[#7C5CFC] font-bold">:</span>
                <div className="bg-[#0B0F19] border border-[#7C5CFC]/40 px-2.5 py-1 rounded-lg text-center shadow-inner">
                  <span className="text-sm sm:text-base text-[#FAFAF7]">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-[#555A66] font-sans uppercase">hrs</span>
                </div>
                <span className="text-[#7C5CFC] font-bold">:</span>
                <div className="bg-[#0B0F19] border border-[#7C5CFC]/40 px-2.5 py-1 rounded-lg text-center shadow-inner">
                  <span className="text-sm sm:text-base text-[#FAFAF7]">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-[#555A66] font-sans uppercase">min</span>
                </div>
                <span className="text-[#7C5CFC] font-bold">:</span>
                <div className="bg-[#0B0F19] border border-[#7C5CFC]/40 px-2.5 py-1 rounded-lg text-center shadow-inner">
                  <span className="text-sm sm:text-base text-emerald-400">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-[#555A66] font-sans uppercase">sec</span>
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 btn-luxury-primary text-sm sm:text-base flex items-center justify-center gap-3 group"
            >
              <span>{isEarlyBird ? 'ENROLL WITH EARLY BIRD ($119 / ₹9,599)' : 'START YOUR JOURNEY TODAY ($149 / ₹11,999)'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform shrink-0" />
            </button>

            {showTrailerButton && (
              <button
                onClick={onOpenVideo}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card-luxury text-[#FAFAF7] hover:bg-[#15171A] font-semibold text-sm sm:text-base border border-[#555A66]/50 hover:border-[#7C5CFC] transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-[#7C5CFC] ml-0.5" />
                </div>
                <span>Watch Trailer &amp; 30-Day Arc</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#555A66] pt-2 font-medium">
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/90">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> 100% ONLINE
            </span>
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/90">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> LIFETIME ACCESS
            </span>
            <span className="flex items-center gap-1.5 text-[#FAFAF7]/90">
              <CheckCircle2 className="w-4 h-4 text-[#FFC857]" /> LEARN AT YOUR PACE
            </span>
          </div>

        </div>

        {/* 4 Core Poster Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          {courseDetails.stats.map((stat, idx) => (
            <div key={idx} className="glass-card-luxury rounded-2xl p-6 text-center hover:translate-y-[-3px] transition-all border border-[#E9E4FF]/15 group">
              <div className="text-3xl sm:text-4xl font-black font-brand text-gradient-violet uppercase group-hover:scale-105 transition-transform">{stat.value}</div>
              <div className="text-sm font-extrabold text-[#FAFAF7] mt-1.5 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xs text-[#555A66] mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
