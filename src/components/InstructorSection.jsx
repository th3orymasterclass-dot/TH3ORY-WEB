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
    <section id="instructor" className="py-20 bg-[#15171A] border-t border-[#555A66]/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimalist Card Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#E9E4FF]/15 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Instructor Image */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-[#7C5CFC]/30 bg-[#15171A] shadow-lg">
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
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC857]">
                Lead Mentor & Founder
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#FAFAF7] mt-1">
                SRAVAN SUDHAKARAN
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[#555A66] font-medium">
                <span className="flex items-center gap-1 text-[#FFC857] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#FFC857]" /> 4.98 Rating
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#15171A] border border-[#E9E4FF]/15 text-[#E9E4FF] text-xs font-semibold hover:border-[#7C5CFC]/50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#FFC857]" />
                    {r.name}
                  </span>
                );
              })}
            </div>

            <p className="text-[#FAFAF7]/90 text-sm leading-relaxed font-normal">
              {inst.bio || "Sravan Sudhakaran combines mentalism, behavioral science, hypnosis, and criminology to decode non-verbal communication and cognitive influence. His 30-day TH3ORY framework empowers professionals, students, and leaders with real-world psychological mastery."}
            </p>

            {onOpenCheckout && (
              <div className="pt-2">
                <button
                  onClick={onOpenCheckout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Train Under Sravan</span>
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
