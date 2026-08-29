import React, { useState } from 'react';
import { Crown, Trophy, Sparkles, Gift, Flame, ArrowRight, CheckCircle2, UserCheck, Shield, ExternalLink, Eye, X, Zap } from 'lucide-react';

export default function CampaignSection() {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const RZP_LINK = "https://rzp.io/rzp/th3orylaunch";

  return (
    <section id="launch-campaign" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#070A11] via-[#0D0B14] to-[#070A11] border-y border-red-900/30 overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* CAMPAIGN HEADER BADGE & TITLE */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 via-red-900/50 to-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold tracking-widest uppercase shadow-lg animate-pulse">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            <span>FOUNDING LAUNCH CAMPAIGN — SPECIAL OFFER</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black font-brand text-white tracking-tight uppercase">
              TH3ORY
            </h2>
            <p className="text-sm sm:text-base font-bold font-mono tracking-widest text-red-500 uppercase">
              MASTERCLASS OF INFLUENCING
            </p>
          </div>

          <div className="pt-2">
            <h3 className="text-xl sm:text-3xl font-extrabold font-heading text-slate-100 leading-tight">
              UNDERSTAND WHY PEOPLE <br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-red-400 bg-clip-text text-transparent uppercase tracking-wider">
                LISTEN. CONNECT. TRUST. REMEMBER. FOLLOW.
              </span>
            </h3>
          </div>
        </div>

        {/* SECTION 1: PRICING & 30-DAY JOURNEY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: FOUNDING LAUNCH PRICE BOX (5 COLS) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#160B12] via-[#0F0D1A] to-[#0A0B14] border-2 border-red-600/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden group hover:border-red-500/70 transition-all">
            
            <div className="absolute top-0 right-0 px-4 py-1 bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-bl-2xl">
              LIMITED TIME
            </div>

            <div className="space-y-4 text-center sm:text-left">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                LAUNCH SPECIAL
              </span>

              <div className="py-2">
                <div className="text-6xl sm:text-7xl font-black font-heading text-red-500 tracking-tight flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-4xl text-red-400">₹</span>499
                </div>
                <div className="inline-block mt-2 px-3 py-1 bg-red-950/60 border border-red-500/30 rounded-lg text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  FOUNDING ACCESS PRICE
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 text-left">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase font-heading">
                  <Crown className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span>INCLUDES 1 YEAR OF EXCLUSIVE ACCESS TO INFLUENCING PSYCHOLOGY MEMBERSHIP</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  New &amp; exclusive content, insights, and cognitive learning all year long.
                </p>
              </div>
            </div>

            {/* DIRECT REDIRECT CTA BUTTON */}
            <div className="space-y-3 pt-2">
              <a
                href={RZP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 hover:shadow-red-500/50 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>JOIN THE LAUNCH FOR ₹499</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={() => setIsPosterModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>View Official Launch Poster</span>
              </button>
            </div>

          </div>

          {/* RIGHT: THE 30-DAY JOURNEY (7 COLS) */}
          <div className="lg:col-span-7 bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black font-heading text-white uppercase tracking-wide">
                  THE 30-DAY JOURNEY
                </h3>
                <p className="text-xs text-slate-400 font-mono">5 Masterclass Core Modules</p>
              </div>
              <span className="px-3 py-1 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono font-bold rounded-full uppercase">
                5 LEVELS
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Level 01 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  01
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                    <span>PRESENCE</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Build a powerful first impression and develop a memorable, commanding social presence.
                  </p>
                </div>
              </div>

              {/* Level 02 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  02
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                    POWER
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Understand social power, influence, framing, negotiation, and high-stakes communication under pressure.
                  </p>
                </div>
              </div>

              {/* Level 03 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  03
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                    WARMTH
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Develop emotional intelligence, deep listening, empathy, and make people feel genuinely seen and valued.
                  </p>
                </div>
              </div>

              {/* Level 04 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  04
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                    CONNECTION
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Master networking, relationship-building, storytelling, digital presence, and meaningful social capital.
                  </p>
                </div>
              </div>

              {/* Level 05 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  05
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading uppercase tracking-wider">
                    LEGACY
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Bring everything together — charisma, executive leadership, high-impact influence, and a lasting legacy.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* SECTION 2: LAUNCH GIVEAWAY BANNER */}
        <div className="bg-gradient-to-r from-red-950/60 via-[#1A0B14] to-red-950/60 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/40 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-red-400" />
              <span>EXCLUSIVE CAMPAIGN BONUSES</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-brand text-white uppercase tracking-wider">
              LAUNCH GIVEAWAY
            </h3>
          </div>

          {/* Giveaway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            
            {/* 5 Lucky Winners */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-red-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-white font-heading uppercase">
                5 LUCKY WINNERS
              </h4>
              <p className="text-xs text-slate-300">
                Get the complete <strong>TH3ORY: Masterclass of Influencing</strong>, valued at <span className="text-red-400 font-bold font-mono">₹11,999</span>.
              </p>
            </div>

            {/* Plus Divider */}
            <div className="md:col-span-1 text-center font-black text-2xl text-amber-400">
              +
            </div>

            {/* 1 Grand Prize Winner */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <h4 className="text-base font-extrabold text-amber-400 font-heading uppercase">
                1 GRAND PRIZE WINNER
              </h4>
              <p className="text-xs text-slate-300">
                Receive 3 months of exclusive <strong>1-to-1 personal training with Sravan Sudhakaran</strong>, valued at <span className="text-amber-400 font-bold font-mono">₹1,00,000</span>.
              </p>
            </div>

          </div>

          {/* Grand Giveaway Prize Total Highlight */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest text-center shadow-lg">
            🎁 ₹1,59,995 WORTH OF PRIZES BEING GIVEN AWAY ACROSS 6 WINNERS!
          </div>

        </div>

        {/* SECTION 3: WHO IS TH3ORY FOR? (6 AUDIENCES) */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white uppercase tracking-wider">
              WHO IS <span className="text-red-500">TH3ORY</span> FOR?
            </h3>
            <p className="text-xs text-slate-400 font-mono">Designed for high-impact communication across domains</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">STUDENTS</div>
              <p className="text-[11px] text-slate-400 leading-snug">Stronger communication &amp; social confidence</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">PROFESSIONALS</div>
              <p className="text-[11px] text-slate-400 leading-snug">Communicate &amp; lead more effectively</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">ENTREPRENEURS</div>
              <p className="text-[11px] text-slate-400 leading-snug">Stronger relationships &amp; influence</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">NETWORKERS</div>
              <p className="text-[11px] text-slate-400 leading-snug">Build meaningful social connections</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">SALES &amp; MARKETING</div>
              <p className="text-[11px] text-slate-400 leading-snug">Work through high-impact communication</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2 hover:border-red-500/40 transition-all">
              <div className="text-red-400 font-bold text-xs uppercase font-heading">HIGH ACHIEVERS</div>
              <p className="text-[11px] text-slate-400 leading-snug">Expand personal influence &amp; authority</p>
            </div>

          </div>
        </div>

        {/* SECTION 4: KEY PILLARS BADGE BAR */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-300 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>30 DAYS.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>5 LEVELS.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>PRACTICAL APPLICATION.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>1 YEAR OF CONTINUED LEARNING.</span>
          </div>
        </div>

        {/* SECTION 5: FINAL CAMPAIGN FOOTER CTA */}
        <div className="bg-gradient-to-r from-red-950 via-[#140810] to-red-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black font-brand text-white uppercase tracking-wide">
              YOUR INFLUENCE IS YOUR CURRENCY.
            </h3>
            <p className="text-red-400 font-bold font-heading text-base uppercase tracking-wider">
              INVEST IN IT.
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              *Prize eligibility, membership access, course access, and launch terms are subject to official campaign rules.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={RZP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 transition-all cursor-pointer group"
            >
              <span>JOIN THE LAUNCH FOR ₹499</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>

      </div>

      {/* POSTER LIGHTBOX MODAL */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h4 className="text-sm font-bold text-white font-heading">Official Founding Launch Poster</h4>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-center bg-black flex items-center justify-center">
              <img
                src="/founding_launch_poster.png"
                alt="TH3ORY Founding Launch Poster"
                className="max-h-[75vh] w-auto mx-auto rounded-xl object-contain shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Founding Launch Special — ₹499</span>
              <a
                href={RZP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Join Launch Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
