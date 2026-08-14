import React from 'react';
import { Sparkles, Brain, UserCheck, Eye, ShieldCheck, BookOpen, Award, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function InstructorSection({ onOpenCheckout }) {
  const { courseDetails } = useTh3oryLive();
  const inst = courseDetails?.instructor || {};

  const titlesList = [
    {
      role: "Mentalist",
      desc: "Master of cognitive perception, non-verbal cues, and mind influence tactics.",
      icon: Brain,
      color: "from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30"
    },
    {
      role: "Human Behaviour Coach",
      desc: "Decoding human actions, behavioral engineering, and habit rewiring.",
      icon: UserCheck,
      color: "from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30"
    },
    {
      role: "Hypnotist",
      desc: "Subconscious mind conditioning, focus state optimization, and suggestion science.",
      icon: Eye,
      color: "from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30"
    },
    {
      role: "Criminologist",
      desc: "Scientific deception detection, behavioral profiling, and high-stakes analysis.",
      icon: ShieldCheck,
      color: "from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30"
    },
    {
      role: "LifeSkill Trainer",
      desc: "Executive presence, elite interpersonal skills, and personal leadership.",
      icon: Award,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30"
    },
    {
      role: "Author",
      desc: "Published author sharing structured blueprints on human influence and growth.",
      icon: BookOpen,
      color: "from-amber-400/20 to-orange-500/10 text-amber-300 border-amber-400/30"
    }
  ];

  return (
    <section id="instructor" className="py-24 relative bg-slate-950/80 border-t border-slate-900 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest border border-amber-500/30 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" /> Meet Your Lead Mentor
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Learn From <span className="text-gradient-gold">SRAVAN SUDHAKARAN</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
            Mentalist • Human Behaviour Coach • Hypnotist • Criminologist • LifeSkill Trainer • Author
          </p>
        </div>

        {/* Main Instructor Profile Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-amber-500/30 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-2xl relative">
          
          {/* Left Column: Image with Portrait Lighting & Rubik's Cube detail */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-full max-w-sm sm:max-w-md">
              {/* Decorative Glowing Backdrop Frame */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 opacity-30 group-hover:opacity-60 blur-xl transition-all duration-500" />
              
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-slate-900 shadow-2xl">
                <img
                  src={inst.avatar || "/instructor.png"}
                  alt="Sravan Sudhakaran - Mentalist & Human Behaviour Coach"
                  className="w-full h-auto object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Rating Pill */}
                <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-2xl p-3 border border-amber-500/40 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-brand">SRAVAN SUDHAKARAN</div>
                    <div className="text-[11px] text-amber-400 font-medium">Founder & Master Instructor</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-extrabold text-amber-300">4.98</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Below Photo */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm sm:max-w-md mt-4">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-extrabold text-amber-400 font-mono">18,450+</div>
                <div className="text-[11px] text-slate-400 font-medium">Students Trained</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-extrabold text-amber-400 font-mono">6 Disciplines</div>
                <div className="text-[11px] text-slate-400 font-medium">Integrated Mastery</div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Bio & Specialization Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <div className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest">
                Multidisciplinary Behavioral Expert
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Decoding Human Influence Through <span className="text-gradient-gold">Science & Perception</span>
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {inst.bio || "Sravan Sudhakaran is a renowned Mentalist, Human Behaviour Coach, Hypnotist, Criminologist, LifeSkill Trainer, and Author. With deep expertise in psychological influence, behavioral engineering, and non-verbal communication, Sravan empowers leaders, students, and professionals to master body language, cognitive perception, and elite interpersonal influence."}
              </p>
            </div>

            {/* 6 Multidisciplinary Pillars Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                6 Areas of Expertise Integrated Into TH3ORY
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {titlesList.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-3 group"
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white font-brand">{item.role}</div>
                        <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Takeaway & CTA Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Direct mentorship access in Cohort Q&A sessions</span>
              </div>

              {onOpenCheckout && (
                <button
                  onClick={onOpenCheckout}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>Learn With Sravan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
