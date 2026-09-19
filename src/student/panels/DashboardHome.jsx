import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, Clock, Flame, Target, TrendingUp, Play, Star, Zap, Mail, Camera, FileText, ChevronRight } from 'lucide-react';
import { getProgress } from '../studentData';
import { getLevels, getCourseDetails } from '../../data/adminData';
import { fetchStudentDataFromSupabase, subscribeToStudentProgress } from '../../services/supabaseService';
import { getStudentAvatar } from '../../utils/profileStorageEngine';
import ProfileAvatar from '../../components/ProfileAvatar';
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
  const [avatar, setAvatar]     = useState(() => getStudentAvatar(profile?.email) || profile?.avatar || profile?.avatarUrl || '');

  useEffect(() => {
    const email = profile?.email;
    const hStudent = () => setProgress(getProgress(email));
    const hData = () => {
      setLevels(getLevels());
      setDetails(getCourseDetails());
    };
    const hAvatar = (e) => {
      if (e.detail?.avatarUrl !== undefined) setAvatar(e.detail.avatarUrl);
    };

    window.addEventListener('th3ory_student_change', hStudent);
    window.addEventListener('th3ory_data_change', hData);
    window.addEventListener('th3ory_student_avatar_change', hAvatar);

    const refreshDashboard = () => {
      if (email) {
        fetchStudentDataFromSupabase(email).then(data => {
          if (data?.progress) setProgress(data.progress);
        });
      }
      setLevels(getLevels());
      setDetails(getCourseDetails());
      setAvatar(getStudentAvatar(email) || profile?.avatar || '');
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
      window.removeEventListener('th3ory_student_avatar_change', hAvatar);
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
      {/* Welcome Banner with Avatar */}
      <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 border transition-all duration-300 ${
        isLight 
          ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/30 border-slate-200/80 shadow-lg shadow-slate-200/40' 
          : 'glass-card-luxury border-white/10 shadow-2xl shadow-black/60'
      }`}>
        {/* Ambient background aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#7C5CFC]/15 via-[#FFC857]/10 to-transparent blur-3xl pointer-events-none rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#FFC857]/5 blur-2xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7C5CFC] to-[#FFC857] rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative rounded-full ring-2 ring-white/10">
                <ProfileAvatar
                  src={avatar}
                  name={profile?.name || 'Student'}
                  role="student"
                  size="xl"
                  showStatus={true}
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-[#7C5CFC]'}`}>Active Session</p>
              </div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black font-serif tracking-tight mb-2 truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                {profile.name} <span className="font-sans font-normal text-amber-400">👋</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-[#FFC857]/40 rounded-full text-[#FFC857] text-xs font-black uppercase tracking-wider shadow-sm">
                  {profile.plan} Member
                </span>
                <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                  Enrolled {daysSince === 0 ? 'today' : `${daysSince} day${daysSince!==1?'s':''} ago`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('character_code')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#9B7DFF] hover:from-[#6B4BE8] hover:to-[#8B6DF0] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#7C5CFC]/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-[#FFC857] fill-[#FFC857]" />
              <span>Character Code™</span>
            </button>
          </div>
        </div>
      </div>

      {/* THE CHARACTER CODE™ Assessment Quick Launch Banner */}
      <div className={`relative overflow-hidden p-6 sm:p-7 rounded-3xl border transition-all duration-300 ${
        isLight 
          ? 'bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent border-amber-500/30 shadow-md' 
          : 'glass-card-luxury border-[#FFC857]/20 hover:border-[#FFC857]/40'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC857] to-[#FFAA00] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xl shadow-[#FFC857]/20 ring-4 ring-[#FFC857]/20">
              <Zap className="w-7 h-7 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-[#FFC857] border border-[#FFC857]/30">
                  Proprietary Diagnostic
                </span>
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
                  5 Pillars of Executive Mastery
                </span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-black font-serif tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                THE CHARACTER CODE™ Assessment
              </h3>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                Pinpoint your dominant executive identity, stress shadow, and counter-growth evolutionary pathway to command any room.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('character_code')}
            className="w-full lg:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FFC857]/20 transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2.5"
          >
            <span>Launch Matrix Diagnostic</span>
            <span className="text-base">⚡</span>
          </button>
        </div>
      </div>

      {/* Big stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallPct}%`, icon: TrendingUp, color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/15', border: 'border-[#FFC857]/30' },
          { label: 'Lessons Completed', value: `${completedCount} / ${totalLessons}`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
          { label: 'Day Streak', value: `${streak} Days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
          { label: 'Levels Mastered', value: `${levels.filter(l => l.lessons.every(ls => isLessonDone(ls.id))).length} / ${levels.length}`, icon: Award, color: 'text-[#7C5CFC]', bg: 'bg-[#7C5CFC]/15', border: 'border-[#7C5CFC]/30' },
        ].map((s, i) => (
          <div key={i} className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
            isLight 
              ? 'bg-white border-slate-200/80 shadow-md shadow-slate-200/50' 
              : 'glass-card-luxury border-white/10 hover:border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.bg} border ${s.border}`}>
                <s.icon className={`w-4 h-4 ${s.color}`}/>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                Live
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>{s.value}</div>
            <div className={`text-[11px] mt-1.5 uppercase tracking-wider font-extrabold ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>{s.label}</div>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-black text-lg tracking-tight font-serif ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
              Mastery Progress by Level
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
              5 progressive tiers of executive embodiment and elite behavioral influence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {levels.map((lvl, i) => {
            const done = lvl.lessons.filter(ls => isLessonDone(ls.id)).length;
            const pct  = lvl.lessons.length ? Math.round((done / lvl.lessons.length) * 100) : 0;
            const lc   = LEVEL_COLORS[i % LEVEL_COLORS.length];
            return (
              <div key={lvl.id} className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer hover:scale-[1.03] transition-all duration-300 ${
                isLight 
                  ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
                  : `glass-card-luxury border ${lc.border} hover:border-white/30`
              }`}
                onClick={() => onNavigate('course', { levelId: lvl.id })}>
                <div className="relative">
                  <CircleProgress pct={pct} size={76} stroke={7} color={lc.ring}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black font-sans ${lc.text}`}>{pct}%</span>
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${lc.text}`}>{lvl.levelNumber}</p>
                  <p className={`font-bold text-xs sm:text-sm mt-0.5 truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>{lvl.name}</p>
                  <p className={`text-[11px] mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>{done}/{lvl.lessons.length} done</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch into Executive Resources / PDF Workbooks */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-purple-50 via-white to-amber-50 border-purple-200/80 shadow-md' 
          : 'glass-card-luxury border-[#E9E4FF]/12'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC]">
                  Official Sub-Portal
                </span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Executive Materials</span>
              </div>
              <h4 className={`font-black text-lg font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Executive Resource Vault (PDFs)
              </h4>
              <p className={`text-xs mt-0.5 max-w-xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Access official mentalism frameworks, negotiation blueprints, and cheat sheets with our dedicated in-app PDF viewer.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('resources')}
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6344E0] hover:to-[#5233c7] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Open Resources</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Continue learning */}
      {nextLesson && (
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
          isLight 
            ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/40 shadow-lg' 
            : 'glass-card-gold border-[#FFC857]/30'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFC857] animate-pulse" />
                <p className="text-[#FFC857] text-[11px] font-black uppercase tracking-[0.2em]">Next Recommended Step</p>
              </div>
              <h4 className={`font-black text-xl sm:text-2xl font-serif tracking-tight mb-1 truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                {nextLesson.lesson.title}
              </h4>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                {nextLesson.level.levelNumber}: {nextLesson.level.name} · {nextLesson.lesson.duration}
              </p>
            </div>
            <button
              onClick={() => onNavigate('course', { levelId: nextLesson.level.id, lessonId: nextLesson.lesson.id })}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FFC857]/20 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950"/> <span>Resume Module</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct Instructor Concierge Support */}
      <div className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200/80 shadow-md' : 'glass-card-luxury border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 flex items-center justify-center shrink-0 text-[#7C5CFC] shadow-lg shadow-[#7C5CFC]/10">
              <Mail className="w-6 h-6"/>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#7C5CFC]/20 text-[#7C5CFC]">
                  Direct Channel
                </span>
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>Executive Faculty</span>
              </div>
              <h4 className={`font-black text-lg font-serif tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                Executive Faculty Concierge
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                Inquiries, feedback, or coaching guidance: write directly to <span className="font-mono font-bold text-[#FFC857]">team@th3ory.online</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText('team@th3ory.online');
                alert('Copied team@th3ory.online to clipboard!');
              }}
              className={`flex-1 md:flex-none px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              Copy Email
            </button>
            <a
              href="mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass"
              onClick={(e) => {
                window.location.href = "mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass";
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4BE8] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#7C5CFC]/20 cursor-pointer"
            >
              <Mail className="w-4 h-4"/> <span>Email Concierge</span>
            </a>
          </div>
        </div>
      </div>

      {overallPct === 100 && (
        <div className={`text-center py-12 px-6 border rounded-3xl transition-all duration-500 ${
          isLight ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-xl' : 'glass-card-gold border-[#FFC857]/40 shadow-2xl shadow-[#FFC857]/10'
        }`}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#FFC857] to-[#FFAA00] flex items-center justify-center shadow-xl shadow-[#FFC857]/30 text-3xl">
            👑
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FFC857]/20 border border-[#FFC857]/30 text-[#FFC857] text-[11px] font-black uppercase tracking-widest">
            Distinguished Alumni
          </span>
          <h3 className={`text-3xl sm:text-4xl font-black font-serif tracking-tight mt-3 mb-2 ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
            The Masterclass is Complete
          </h3>
          <p className={`max-w-md mx-auto text-sm ${isLight ? 'text-slate-700' : 'text-[#8F94A3]'}`}>
            You have mastered all 30 foundational executive influence modules. Your verified gold-embossed credential has been minted.
          </p>
          <div className="mt-6">
            <button
              onClick={() => onNavigate && onNavigate('certificate')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FFC857]/30 hover:scale-105 active:scale-95 transition-all"
            >
              Access Official Credential 🏆
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
