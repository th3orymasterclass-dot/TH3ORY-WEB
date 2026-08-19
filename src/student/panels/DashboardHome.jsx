import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, Clock, Flame, Target, TrendingUp, Play, Star, Zap, Mail } from 'lucide-react';
import { getProgress } from '../studentData';
import { getLevels, getCourseDetails } from '../../data/adminData';
import { fetchStudentDataFromSupabase, subscribeToStudentProgress } from '../../services/supabaseService';
import DailyHabitTracker from '../components/DailyHabitTracker';
import DayTasksTracker from '../components/DayTasksTracker';

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

export default function DashboardHome({ profile, onNavigate, themeMode = 'dark' }) {
  const isLight = themeMode === 'light';
  const [progress, setProgress] = useState(() => getProgress(profile?.email));
  const [levels, setLevels]     = useState(getLevels());
  const [details, setDetails]   = useState(getCourseDetails());

  useEffect(() => {
    const email = profile?.email;
    const hStudent = () => setProgress(getProgress(email));
    const hData = () => {
      setLevels(getLevels());
      setDetails(getCourseDetails());
    };
    window.addEventListener('th3ory_student_change', hStudent);
    window.addEventListener('th3ory_data_change', hData);

    const refreshDashboard = () => {
      if (email) {
        fetchStudentDataFromSupabase(email).then(data => {
          if (data?.progress) setProgress(data.progress);
        });
      }
      setLevels(getLevels());
      setDetails(getCourseDetails());
    };

    window.addEventListener('focus', refreshDashboard);
    document.addEventListener('visibilitychange', refreshDashboard);

    refreshDashboard();

    const unsub = subscribeToStudentProgress(email, (data) => {
      if (data?.progress) setProgress(data.progress);
    });

    return () => {
      window.removeEventListener('th3ory_student_change', hStudent);
      window.removeEventListener('th3ory_data_change', hData);
      window.removeEventListener('focus', refreshDashboard);
      document.removeEventListener('visibilitychange', refreshDashboard);
      unsub();
    };
  }, [profile?.email]);

  const isLessonDone = (lsId) => Boolean(progress[lsId]?.done || progress[lsId] === true);

  const totalLessons    = levels.reduce((a, l) => a + l.lessons.length, 0);
  const completedCount  = Object.keys(progress).filter(isLessonDone).length;
  const overallPct      = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Days since enrolled
  const enrolled   = new Date(profile.enrolledAt);
  const daysSince  = Math.floor((Date.now() - enrolled) / 86400000);
  const streak     = Math.min(daysSince, completedCount); // rough streak estimate

  // Find next lesson to do
  let nextLesson = null;
  outer: for (const lvl of levels) {
    for (const ls of lvl.lessons) {
      if (!isLessonDone(ls.id)) { nextLesson = { level: lvl, lesson: ls }; break outer; }
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className={`relative rounded-2xl overflow-hidden p-7 border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
      }`}
        style={{backgroundImage: isLight ? 'none' : 'radial-gradient(ellipse at 80% 0%, rgba(245,158,11,0.12) 0%, transparent 60%)'}}>
        <div className="relative z-10">
          <p className={`text-sm mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Welcome back,</p>
          <h2 className={`text-3xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.name} 👋</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-600 text-xs font-extrabold">{profile.plan}</span>
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Enrolled {daysSince === 0 ? 'today' : `${daysSince} day${daysSince!==1?'s':''} ago`}</span>
          </div>
        </div>
      </div>

      {/* THE CHARACTER CODE™ Assessment Quick Launch Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        isLight ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-slate-900 via-slate-950 to-[#0A0D14] border-amber-500/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/20">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Psychology Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 text-[10px] font-extrabold">12 ARCHETYPES</span>
            </div>
            <h3 className={`text-xl font-black font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>THE CHARACTER CODE™ Assessment</h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Discover your dominant character identity, 4 influence dimensions, stress shadow, and counter-growth evolution.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('character_code')}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 shrink-0 flex items-center gap-2"
        >
          <span>Launch Assessment ⚡</span>
        </button>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallPct}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Lessons Done', value: `${completedCount} / ${totalLessons}`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Day Streak', value: `${streak}`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Levels Complete', value: levels.filter(l => l.lessons.every(ls => isLessonDone(ls.id))).length, icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <div key={i} className={`border rounded-2xl p-5 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`}/>
            </div>
            <div className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.value}</div>
            <div className={`text-xs mt-1 uppercase tracking-wide font-bold ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Habit & 5-Pillar Self-Assessment Tracker Activity */}
      <DailyHabitTracker
        profile={profile}
        themeMode={themeMode}
        isCourseCompleted={totalLessons > 0 && completedCount >= totalLessons}
        completedCount={completedCount}
        totalLessons={totalLessons}
        onNavigate={onNavigate}
      />

      {/* Interactive 30-Day Course Tasks & Sub-Steps Tracker */}
      <DayTasksTracker
        dayNumber={Math.min(completedCount + 1, 30)}
        profile={profile}
        themeMode={themeMode}
      />


      {/* Level progress rings */}

      <div>
        <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Level Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {levels.map((lvl, i) => {
            const done = lvl.lessons.filter(ls => isLessonDone(ls.id)).length;
            const pct  = lvl.lessons.length ? Math.round((done / lvl.lessons.length) * 100) : 0;
            const lc   = LEVEL_COLORS[i % LEVEL_COLORS.length];
            return (
              <div key={lvl.id} className={`rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform ${
                isLight ? 'bg-white border border-slate-200 shadow-sm' : `bg-gradient-to-b ${lc.bg} border ${lc.border}`
              }`}
                onClick={() => onNavigate('course', { levelId: lvl.id })}>
                <div className="relative">
                  <CircleProgress pct={pct} size={72} stroke={7} color={lc.ring}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black ${lc.text}`}>{pct}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-extrabold uppercase tracking-wider ${lc.text}`}>{lvl.levelNumber}</p>
                  <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{lvl.name}</p>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{done}/{lvl.lessons.length} lessons</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Habit & 5-Pillar Tracker */}
      <DailyHabitTracker profile={profile} themeMode={themeMode} isCourseCompleted={totalLessons > 0 && completedCount >= totalLessons} onNavigate={onNavigate} />

      {/* Continue learning */}
      {nextLesson && (
        <div className={`border rounded-2xl p-6 ${
          isLight ? 'bg-white border-amber-500/40 shadow-sm' : 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/30'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-1">▶ Continue Where You Left Off</p>
              <h4 className={`font-bold text-lg leading-tight mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{nextLesson.lesson.title}</h4>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{nextLesson.level.levelNumber}: {nextLesson.level.name} · {nextLesson.lesson.duration}</p>
            </div>
            <button
              onClick={() => onNavigate('course', { levelId: nextLesson.level.id, lessonId: nextLesson.lesson.id })}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md"
            >
              <Play className="w-4 h-4 fill-slate-950"/> Resume
            </button>
          </div>
        </div>
      )}

      {/* Direct Instructor Support via Email */}
      <div className={`border rounded-2xl p-6 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-500">
              <Mail className="w-5 h-5"/>
            </div>
            <div>
              <h4 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Instructor Team Support</h4>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Have a question or need assistance with your course? Reach out directly via email at <span className="font-mono font-bold text-amber-500">team@th3ory.online</span>.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText('team@th3ory.online');
                alert('Copied team@th3ory.online to clipboard!');
              }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Copy Email
            </button>
            <a
              href="mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass"
              onClick={(e) => {
                // Ensure mailto client triggers smoothly on mobile and desktop
                window.location.href = "mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass";
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              <Mail className="w-4 h-4"/> Email Support
            </a>
          </div>
        </div>
      </div>

      {overallPct === 100 && (
        <div className={`text-center py-10 border rounded-2xl ${
          isLight ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30'
        }`}>
          <div className="text-5xl mb-3">🎓</div>
          <h3 className={`text-2xl font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Congratulations!</h3>
          <p className={isLight ? 'text-slate-700' : 'text-slate-400'}>You've completed the full TH3ORY Masterclass. Your certificate is ready.</p>
        </div>
      )}
    </div>
  );
}
