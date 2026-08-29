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
    <section id="roadmap" className="py-24 relative bg-slate-950/80 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
            <BookOpen className="w-4 h-4" /> 30-Day Guided Learning Arc
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            THE 30-DAY <span className="text-gradient-gold">ROADMAP</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            5 Levels • 50 Modules • 5 Weekly Capstones • Daily Practice Exercises
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowSyllabusModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-amber-400" /> Download Complete 30-Day Roadmap PDF
            </button>
          </div>
        </div>

        {/* HOW THE COURSE IS STRUCTURED */}
        <div id="structure" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {courseDetails.structure.map((item, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 space-y-3 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 font-bold">
                  {idx === 0 && <BookOpen className="w-5 h-5" />}
                  {idx === 1 && <Calendar className="w-5 h-5" />}
                  {idx === 2 && <Mountain className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-extrabold font-brand text-white">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* 5 LEVELS ROADMAP ACCORDION */}
        <div className="max-w-4xl mx-auto space-y-5">
          {(levels || []).map((lvl) => {
            const isOpen = activeLevelId === lvl.id;

            return (
              <div
                key={lvl.id}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-amber-500/50 shadow-xl shadow-amber-500/10' : 'border-slate-800'
                }`}
              >
                {/* Level Header Bar */}
                <button
                  onClick={() => toggleLevel(lvl.id)}
                  className="w-full p-4 sm:p-6 text-left flex items-start sm:items-center justify-between gap-3 bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black font-brand border border-amber-500/30 whitespace-nowrap">
                      {lvl.levelNumber}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-lg sm:text-2xl font-black font-brand text-white tracking-wider">
                          {lvl.name}
                        </h3>
                        <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20 font-mono">
                          {lvl.days}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">{lvl.tagline} — {lvl.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-extrabold uppercase hidden sm:block border border-amber-500/20">
                      {lvl.capstoneDay}
                    </span>
                    <div className={`p-2 rounded-xl bg-slate-800 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-950 bg-amber-400' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </button>

                {/* Level Body Content */}
                {isOpen && (
                  <div className="p-6 border-t border-slate-800/80 space-y-6 bg-slate-950/60 animate-fade-in">
                    
                    {/* Lessons Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level Lessons & Capstone ({lvl.lessons.length})</h4>
                        <span className="text-xs text-amber-400 font-semibold">{lvl.capstoneDay}</span>
                      </div>

                      <div className="grid gap-2">
                        {lvl.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${
                              lesson.preview ? 'bg-amber-950/30 border border-amber-500/30 hover:border-amber-500/60' : 'bg-slate-900/40 border border-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {lesson.preview && showTrailerButton ? (
                                <button
                                  onClick={onOpenVideo}
                                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:scale-110 transition-transform"
                                  title="Play Preview Teaser"
                                >
                                  <PlayCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-500">
                                  <Lock className="w-4 h-4" />
                                </div>
                              )}
                              <span className={`font-medium ${lesson.preview && showTrailerButton ? 'text-amber-200' : 'text-slate-200'}`}>
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">{lesson.duration}</span>
                              {lesson.preview && showTrailerButton ? (
                                <button
                                  onClick={onOpenVideo}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
                                >
                                  Preview
                                </button>
                              ) : (
                                <span className="text-xs text-slate-600">Locked</span>
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

      {/* Syllabus Modal Simulator */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 text-center border border-amber-500/30">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-brand text-white">TH3ORY 30-Day Masterclass Roadmap PDF</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Complete breakdown of all 50 daily modules, 5 level capstones, daily practice prompts, and 100-day influence journal blueprint.
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left text-slate-400 space-y-1 font-mono">
              <div>📄 File: TH3ORY_Masterclass_Influencing_2026.pdf</div>
              <div>📦 Size: 6.2 MB • Verified Official Syllabus</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-medium"
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg text-center"
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
