import React, { useState } from 'react';
import { BookOpen, ChevronDown, PlayCircle, Lock, HelpCircle, CheckCircle2, XCircle, FileText, Calendar, Mountain, Clock, Award, Crown, Sparkles } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';
import { useFeatureFlags } from '../context/FeatureFlagContext';

export default function CurriculumExplorer({ onOpenVideo }) {
  const { courseDetails, levels } = useTh3oryLive();
  const { isFeatureEnabled } = useFeatureFlags();
  const showTrailerButton = isFeatureEnabled('ENABLE_TRAILER_VIDEO', false);
  const [activeLevelId, setActiveLevelId] = useState((levels && levels[0]) ? levels[0].id : 'level-1');
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

  const toggleLevel = (id) => {
    setActiveLevelId(activeLevelId === id ? null : id);
  };

  return (
    <section id="roadmap" className="py-24 sm:py-28 relative bg-transparent border-t border-[#E9E4FF]/10 overflow-hidden">
      {/* Background ambient spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#7C5CFC]/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-specular text-[#FFC857] text-xs font-extrabold uppercase tracking-widest border border-[#FFC857]/30 shadow-lg">
            <BookOpen className="w-4 h-4 text-[#FFC857]" /> 30-Day Guided Learning Arc
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            THE 30-DAY <span className="text-gradient-gold">ROADMAP</span>
          </h2>
          <p className="text-[#FAFAF7]/80 text-base sm:text-lg font-serif-luxury italic">
            5 Levels • 50 Modules • 5 Weekly Capstones • Daily Practice Exercises
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowSyllabusModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-luxury-ghost text-xs font-bold uppercase tracking-wider transition-all"
            >
              <FileText className="w-4 h-4 text-[#FFC857]" /> Download Complete 30-Day Roadmap PDF
            </button>
          </div>
        </div>

        {/* HOW THE COURSE IS STRUCTURED */}
        <div id="structure" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {courseDetails.structure.map((item, idx) => (
            <div key={idx} className="glass-card-luxury rounded-2xl p-6 sm:p-7 space-y-3.5 border border-[#E9E4FF]/15 group">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFC]/20 to-[#FFC857]/15 text-[#FFC857] flex items-center justify-center border border-[#FFC857]/30 font-bold shadow-md group-hover:scale-105 transition-transform">
                  {idx === 0 && <BookOpen className="w-6 h-6" />}
                  {idx === 1 && <Calendar className="w-6 h-6" />}
                  {idx === 2 && <Mountain className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-black font-brand text-white">{item.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#FAFAF7]/75 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* 5 LEVELS ROADMAP ACCORDION */}
        <div className="max-w-4xl mx-auto space-y-4">
          {(levels || []).map((lvl) => {
            const isOpen = activeLevelId === lvl.id;

            return (
              <div
                key={lvl.id}
                className={`glass-specular rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-[#FFC857]/45 shadow-2xl shadow-[#FFC857]/10' : 'border-[#E9E4FF]/12 hover:border-[#7C5CFC]/35'
                }`}
              >
                {/* Level Header Bar */}
                <button
                  onClick={() => toggleLevel(lvl.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 bg-[#0B0F19]/80 hover:bg-[#15171A]/90 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFC857]/20 to-[#E5AA30]/20 text-[#FFC857] text-xs font-black font-brand border border-[#FFC857]/30 whitespace-nowrap shadow-xs">
                      {lvl.levelNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-lg sm:text-2xl font-black font-brand text-white tracking-wider truncate">
                          {lvl.name}
                        </h3>
                        <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#15171A] text-[#FFC857] border border-[#FFC857]/30 font-mono font-bold">
                          {lvl.days}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#FAFAF7]/75 mt-1 font-medium leading-relaxed">{lvl.tagline} — {lvl.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs px-3 py-1 rounded-lg bg-[#7C5CFC]/15 text-[#E9E4FF] font-extrabold uppercase hidden sm:block border border-[#7C5CFC]/30">
                      {lvl.capstoneDay}
                    </span>
                    <div className={`p-2 rounded-xl bg-[#15171A] border border-[#E9E4FF]/15 text-[#FAFAF7] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#070A11] bg-[#FFC857] border-[#FFC857]' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </button>

                {/* Level Body Content */}
                {isOpen && (
                  <div className="p-5 sm:p-7 border-t border-[#E9E4FF]/12 space-y-6 bg-[#070A11]/60 animate-fade-in">
                    
                    {/* Lessons Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#E9E4FF]/70 uppercase tracking-wider font-brand">Level Lessons &amp; Capstone ({lvl.lessons.length})</h4>
                        <span className="text-xs text-[#FFC857] font-semibold">{lvl.capstoneDay}</span>
                      </div>

                      <div className="grid gap-2 sm:gap-2.5">
                        {lvl.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${
                              lesson.preview ? 'bg-[#7C5CFC]/15 border border-[#7C5CFC]/40 hover:border-[#7C5CFC]' : 'bg-[#0B0F19]/80 border border-[#E9E4FF]/10 hover:border-[#E9E4FF]/20'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {lesson.preview && showTrailerButton ? (
                                <button
                                  onClick={onOpenVideo}
                                  className="p-1.5 rounded-lg bg-[#7C5CFC]/25 text-[#E9E4FF] hover:scale-110 transition-transform shrink-0 cursor-pointer"
                                  title="Play Preview Teaser"
                                >
                                  <PlayCircle className="w-5 h-5 text-[#FFC857]" />
                                </button>
                              ) : (
                                <div className="p-1.5 rounded-lg bg-[#15171A] text-[#555A66] shrink-0 border border-[#555A66]/30">
                                  <Lock className="w-4 h-4" />
                                </div>
                              )}
                              <span className={`font-semibold truncate ${lesson.preview && showTrailerButton ? 'text-[#FAFAF7]' : 'text-[#FAFAF7]/90'}`}>
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-[#555A66] font-mono">{lesson.duration}</span>
                              {lesson.preview && showTrailerButton ? (
                                <button
                                  onClick={onOpenVideo}
                                  className="text-xs px-3 py-1 rounded-lg bg-[#7C5CFC] text-[#FAFAF7] font-bold hover:bg-[#6c4ce0] transition-colors cursor-pointer shadow-sm shadow-[#7C5CFC]/30"
                                >
                                  Preview
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#555A66] font-semibold uppercase tracking-wider">Locked</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Syllabus Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A11]/85 backdrop-blur-md">
          <div className="glass-modal p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 text-center border border-[#FFC857]/35 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#7C5CFC]/20 to-[#FFC857]/20 text-[#FFC857] flex items-center justify-center border border-[#FFC857]/30 shadow-md">
              <FileText className="w-7 h-7 text-[#FFC857]" />
            </div>
            <h3 className="text-xl font-black font-brand text-white">TH3ORY 30-Day Masterclass Roadmap PDF</h3>
            <p className="text-xs sm:text-sm text-[#FAFAF7]/80 leading-relaxed font-normal">
              Complete breakdown of all 50 daily modules, 5 level capstones, daily practice prompts, and 100-day influence journal blueprint.
            </p>
            <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#E9E4FF]/15 text-xs text-left text-[#E9E4FF]/70 space-y-1.5 font-mono">
              <div className="flex items-center gap-2">📄 <span>File: TH3ORY_Masterclass_Influencing_2026.pdf</span></div>
              <div className="flex items-center gap-2">📦 <span>Size: 6.2 MB • Verified Official Syllabus</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="flex-1 py-2.5 rounded-xl btn-luxury-ghost text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert("🎉 TH3ORY Roadmap PDF download initiated!");
                  setShowSyllabusModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl btn-luxury-gold text-xs text-center shadow-lg"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
