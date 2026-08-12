import React from 'react';
import { Crown, Zap, Heart, Share2, TrendingUp, Award, FileText, BookMarked, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function OutcomesSection() {
  const { courseDetails } = useTh3oryLive();
  const iconMap = {
    Crown: Crown,
    Zap: Zap,
    Heart: Heart,
    Share2: Share2,
    TrendingUp: TrendingUp,
    Award: Award,
    FileText: FileText,
    BookMarked: BookMarked,
    Users: Users
  };

  return (
    <section id="outcomes" className="py-24 relative bg-slate-950/90 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* SECTION 1: BY THE END OF 30 DAYS, YOU WILL */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              <Sparkles className="w-4 h-4" /> Guaranteed Personal Transformation
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              BY THE END OF 30 DAYS, <span className="text-gradient-gold">YOU WILL:</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              30 days can change how the world sees you. Are you ready?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseDetails.outcomes.map((item, idx) => {
              const IconComp = iconMap[item.icon] || Award;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold font-brand text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: BONUS WITH THE PROGRAM */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-amber-500/30 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Included Free With Enrollment</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              BONUS WITH THE <span className="text-gradient-gold">PROGRAM</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseDetails.bonuses.map((bonus, idx) => {
              const IconComp = iconMap[bonus.icon] || FileText;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3 hover:border-amber-500/40 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold font-brand text-white uppercase">{bonus.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{bonus.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: CALLOUT BANNER FROM FOOTER OF POSTER */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl sm:text-4xl font-black font-brand text-white tracking-wider">
            30 DAYS CAN CHANGE HOW THE WORLD SEES YOU. <br />
            <span className="text-amber-400">ARE YOU READY?</span>
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto italic font-serif">
            "{courseDetails.footerQuote}"
          </p>
        </div>

      </div>
    </section>
  );
}
