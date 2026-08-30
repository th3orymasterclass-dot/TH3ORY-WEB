import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, Tag, ArrowRight, Clock, X, CheckCircle2 } from 'lucide-react';
import { getLaunchCountdown, isEarlyBirdActive, LAUNCH_DATE_ISO } from '../data/adminData';

export default function LaunchCountdownBanner({ onOpenCheckout }) {
  const [countdown, setCountdown] = useState(() => getLaunchCountdown(LAUNCH_DATE_ISO));
  const [isEarlyBird, setIsEarlyBird] = useState(() => isEarlyBirdActive(LAUNCH_DATE_ISO));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = getLaunchCountdown(LAUNCH_DATE_ISO);
      setCountdown(updated);
      setIsEarlyBird(isEarlyBirdActive(LAUNCH_DATE_ISO));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || countdown.isLaunched) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-[#120B24] via-[#1F1238] to-[#120B24] border-b border-[#7C5CFC]/30 text-white shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,92,252,0.25),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Launch Announcement Tag & Early Bird Info */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#E9E4FF] font-black uppercase tracking-wider text-[11px] shadow-sm animate-pulse">
            <Rocket className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>LAUNCHING NOV 1, 2026</span>
          </div>

          <div className="flex items-center gap-2 text-[#FAFAF7] font-semibold text-xs">
            <span className="text-[#FFC857] font-bold">✨ Early Bird Special:</span>
            <span className="text-[#E9E4FF]/90">
              {isEarlyBird ? '20% OFF Automatically Applied Till Launch' : 'Course Grand Launching Soon'}
            </span>
          </div>
        </div>

        {/* Center/Right: Live Countdown Units & CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Live Countdown Display */}
          <div className="flex items-center gap-1.5 font-mono">
            {/* Days */}
            <div className="flex flex-col items-center bg-[#15171A]/90 border border-[#7C5CFC]/30 rounded-lg px-2 py-0.5 min-w-[36px]">
              <span className="text-sm font-black text-[#FFC857] leading-none">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="text-[8px] text-[#555A66] font-sans font-bold uppercase">Days</span>
            </div>
            <span className="text-[#7C5CFC] font-bold text-xs">:</span>

            {/* Hours */}
            <div className="flex flex-col items-center bg-[#15171A]/90 border border-[#7C5CFC]/30 rounded-lg px-2 py-0.5 min-w-[36px]">
              <span className="text-sm font-black text-[#FAFAF7] leading-none">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] text-[#555A66] font-sans font-bold uppercase">Hrs</span>
            </div>
            <span className="text-[#7C5CFC] font-bold text-xs">:</span>

            {/* Mins */}
            <div className="flex flex-col items-center bg-[#15171A]/90 border border-[#7C5CFC]/30 rounded-lg px-2 py-0.5 min-w-[36px]">
              <span className="text-sm font-black text-[#FAFAF7] leading-none">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] text-[#555A66] font-sans font-bold uppercase">Mins</span>
            </div>
            <span className="text-[#7C5CFC] font-bold text-xs">:</span>

            {/* Secs */}
            <div className="flex flex-col items-center bg-[#15171A]/90 border border-[#7C5CFC]/30 rounded-lg px-2 py-0.5 min-w-[36px]">
              <span className="text-sm font-black text-[#7C5CFC] leading-none">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] text-[#555A66] font-sans font-bold uppercase">Secs</span>
            </div>
          </div>

          {/* Quick CTA Button */}
          {onOpenCheckout && (
            <button
              onClick={onOpenCheckout}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#9277FF] hover:from-[#6c4ce0] hover:to-[#7C5CFC] text-[#FAFAF7] font-black text-[11px] uppercase tracking-wider shadow-md shadow-[#7C5CFC]/30 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Tag className="w-3 h-3 text-[#FFC857]" />
              <span>Claim Early Bird ($119 / ₹9,599)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Dismiss Button */}
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss launch announcement"
            className="text-[#555A66] hover:text-[#FAFAF7] p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
