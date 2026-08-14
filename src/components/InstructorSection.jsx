import React from 'react';
import { ArrowRight, Star, Brain, UserCheck, Eye, ShieldCheck, Award, BookOpen } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function InstructorSection({ onOpenCheckout }) {
  const { courseDetails } = useTh3oryLive();
  const inst = courseDetails?.instructor || {};

  const roles = [
    { name: "Mentalist", icon: Brain },
    { name: "Human Behaviour Coach", icon: UserCheck },
    { name: "Hypnotist", icon: Eye },
    { name: "Criminologist", icon: ShieldCheck },
    { name: "LifeSkill Trainer", icon: Award },
    { name: "Author", icon: BookOpen }
  ];

  const avatarSrc = (inst?.avatar && !inst.avatar.includes('unsplash.com')) ? inst.avatar : "/instructor.png";

  return (
    <section id="instructor" className="py-20 bg-slate-950/60 border-t border-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimalist Card Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800/80 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Instructor Image */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-amber-500/25 bg-slate-900 shadow-lg">
              <img
                src={avatarSrc}
                alt="Sravan Sudhakaran"
                className="w-full h-auto object-cover object-top hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Instructor Details */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Lead Mentor & Founder
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mt-1">
                SRAVAN SUDHAKARAN
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.98 Rating
                </span>
                <span>•</span>
                <span>18,450+ Pupils Trained</span>
              </div>
            </div>

            {/* Minimalist Roles Tags */}
            <div className="flex flex-wrap gap-2">
              {roles.map((r, i) => {
                const Icon = r.icon;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-amber-500/20 text-slate-200 text-xs font-semibold hover:border-amber-400/50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    {r.name}
                  </span>
                );
              })}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              {inst.bio || "Sravan Sudhakaran combines mentalism, behavioral science, hypnosis, and criminology to decode non-verbal communication and cognitive influence. His 30-day TH3ORY framework empowers professionals, students, and leaders with real-world psychological mastery."}
            </p>

            {onOpenCheckout && (
              <div className="pt-2">
                <button
                  onClick={onOpenCheckout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Learn Under Sravan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
