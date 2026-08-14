import React from 'react';
import { X, BookOpen, Award, MessageSquare, Github, Calendar, CheckCircle2, PlayCircle, Lock, Download, Shield, Sparkles, Crown } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function StudentDashboardModal({ isOpen, onClose, receipt }) {
  const { levels: roadmapLevels, courseDetails } = useTh3oryLive();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden border border-amber-500/30 my-8 shadow-2xl">
        
        {/* Top Portal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-brand text-white">TH3ORY Student Learning Portal</h3>
              <p className="text-xs text-amber-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Student Portal • Cohort #15
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Welcome Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Welcome back</span>
              <h4 className="text-xl font-extrabold font-brand text-white">{receipt?.studentName || 'Sarah Connor'}</h4>
              <p className="text-xs text-slate-300">Course Progress: <strong className="text-amber-400">Level 1 (Presence) in progress</strong></p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => alert("🎉 Discord Invite: redirecting to #th3ory-cohort-15")}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-colors shadow-lg"
              >
                <MessageSquare className="w-4 h-4" /> Discord Lounge
              </button>
              <button
                onClick={() => alert("📄 Worksheets Download: TH3ORY_Actionable_Templates_Pack.zip")}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" /> Worksheets Pack
              </button>
            </div>
          </div>

          {/* Quick Schedule & Certificate Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Next Live Q&A Mastermind Call</div>
                <div className="text-sm font-bold text-white">Thursday, 6:00 PM EST</div>
                <div className="text-[11px] text-amber-400">Hosted by {courseDetails.instructor.name}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Verified Certificate Status</div>
                <div className="text-sm font-bold text-white">Unlocked at Day 30 Capstone</div>
                <div className="text-[11px] text-slate-400">Cryptographically signed badge</div>
              </div>
            </div>
          </div>

          {/* Unlocked Course Levels */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-brand">TH3ORY 5-Level Roadmap Modules</h4>
            
            <div className="space-y-3">
              {roadmapLevels.map((lvl, idx) => (
                <div key={lvl.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold font-brand text-white">{lvl.name} ({lvl.days})</h5>
                        <p className="text-[11px] text-slate-400">{lvl.tagline}</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">{lvl.capstoneDay}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                    {lvl.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        onClick={() => alert(`▶ Playing Lesson: ${lesson.title}`)}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 line-clamp-1">
                          <PlayCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          {lesson.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between px-6">
          <span>Logged in as <strong>{receipt?.studentEmail || 'student@th3ory.io'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
          >
            Close Dashboard Preview
          </button>
        </div>

      </div>
    </div>
  );
}
