import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, Clock, Flame, Target, TrendingUp, Play, Star } from 'lucide-react';
import { getProgress } from '../studentData';
import { getLevels, getCourseDetails } from '../../data/adminData';

function CircleProgress({ pct, size = 80, stroke = 8, color = '#f59e0b' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 1s ease'}}/>
    </svg>
  );
}

const LEVEL_COLORS = [
  { ring: '#f59e0b', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400' },
  { ring: '#a855f7', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400' },
  { ring: '#f43f5e', bg: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400' },
  { ring: '#38bdf8', bg: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-500/30', text: 'text-sky-400' },
  { ring: '#fbbf24', bg: 'from-yellow-400/20 to-yellow-500/5', border: 'border-yellow-400/30', text: 'text-yellow-300' },
];

export default function DashboardHome({ profile, onNavigate }) {
  const [progress, setProgress] = useState(getProgress());
  const [levels, setLevels]     = useState(getLevels());
  const [details, setDetails]   = useState(getCourseDetails());

  useEffect(() => {
    const hStudent = () => setProgress(getProgress());
    const hData = () => {
      setLevels(getLevels());
      setDetails(getCourseDetails());
    };
    window.addEventListener('th3ory_student_change', hStudent);
    window.addEventListener('th3ory_data_change', hData);
    return () => {
      window.removeEventListener('th3ory_student_change', hStudent);
      window.removeEventListener('th3ory_data_change', hData);
    };
  }, []);

  const totalLessons    = levels.reduce((a, l) => a + l.lessons.length, 0);
  const completedCount  = Object.keys(progress).length;
  const overallPct      = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Days since enrolled
  const enrolled   = new Date(profile.enrolledAt);
  const daysSince  = Math.floor((Date.now() - enrolled) / 86400000);
  const streak     = Math.min(daysSince, completedCount); // rough streak estimate

  // Find next lesson to do
  let nextLesson = null;
  outer: for (const lvl of levels) {
    for (const ls of lvl.lessons) {
      if (!progress[ls.id]) { nextLesson = { level: lvl, lesson: ls }; break outer; }
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative rounded-2xl overflow-hidden p-7 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800"
        style={{backgroundImage:'radial-gradient(ellipse at 80% 0%, rgba(245,158,11,0.12) 0%, transparent 60%)'}}>
        <div className="relative z-10">
          <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
          <h2 className="text-3xl font-black text-white mb-3">{profile.name} 👋</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">{profile.plan}</span>
            <span className="text-slate-500 text-xs">Enrolled {daysSince === 0 ? 'today' : `${daysSince} day${daysSince!==1?'s':''} ago`}</span>
          </div>
        </div>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallPct}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Lessons Done', value: `${completedCount} / ${totalLessons}`, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Day Streak', value: `${streak}`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Levels Complete', value: levels.filter(l => l.lessons.every(ls => progress[ls.id])).length, icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`}/>
            </div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Level progress rings */}
      <div>
        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Level Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {levels.map((lvl, i) => {
            const done = lvl.lessons.filter(ls => progress[ls.id]).length;
            const pct  = lvl.lessons.length ? Math.round((done / lvl.lessons.length) * 100) : 0;
            const lc   = LEVEL_COLORS[i % LEVEL_COLORS.length];
            return (
              <div key={lvl.id} className={`bg-gradient-to-b ${lc.bg} border ${lc.border} rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
                onClick={() => onNavigate('course', { levelId: lvl.id })}>
                <div className="relative">
                  <CircleProgress pct={pct} size={72} stroke={7} color={lc.ring}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black ${lc.text}`}>{pct}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${lc.text}`}>{lvl.levelNumber}</p>
                  <p className="text-white font-bold text-sm">{lvl.name}</p>
                  <p className="text-slate-500 text-xs">{done}/{lvl.lessons.length} lessons</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue learning */}
      {nextLesson && (
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">▶ Continue Where You Left Off</p>
              <h4 className="text-white font-bold text-lg leading-tight mb-1">{nextLesson.lesson.title}</h4>
              <p className="text-slate-500 text-sm">{nextLesson.level.levelNumber}: {nextLesson.level.name} · {nextLesson.lesson.duration}</p>
            </div>
            <button
              onClick={() => onNavigate('course', { levelId: nextLesson.level.id, lessonId: nextLesson.lesson.id })}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950"/> Resume
            </button>
          </div>
        </div>
      )}

      {overallPct === 100 && (
        <div className="text-center py-10 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl">
          <div className="text-5xl mb-3">🎓</div>
          <h3 className="text-2xl font-black text-white mb-2">Congratulations!</h3>
          <p className="text-slate-400">You've completed the full TH3ORY Masterclass. Your certificate is ready.</p>
        </div>
      )}
    </div>
  );
}
