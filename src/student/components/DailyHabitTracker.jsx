import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Star, Flame, Award, ChevronRight, Sparkles,
  Calendar, FileText, BarChart2, X, HelpCircle, Save, Check, RefreshCw,
  Lock, Play
} from 'lucide-react';
import { getProgress } from '../studentData';
import {
  saveDailyTrackerToSupabase,
  saveHabitTrackerDayToSupabase,
  fetchAllHabitTrackersFromSupabase,
  subscribeToStudentHabitTrackers
} from '../../services/supabaseService';

export const CORE_HABITS = [
  { id: 1, level: 'Presence', levelNumber: 'Level 1', color: 'amber', title: 'Entered a room or conversation at a deliberate, unhurried pace' },
  { id: 2, level: 'Presence', levelNumber: 'Level 1', color: 'amber', title: 'Kept eye contact while listening, not just while speaking' },
  { id: 3, level: 'Power',    levelNumber: 'Level 2', color: 'rose',  title: 'Held a boundary, or gave a clear "positive no"' },
  { id: 4, level: 'Power',    levelNumber: 'Level 2', color: 'rose',  title: 'Paused before responding to pressure instead of reacting' },
  { id: 5, level: 'Warmth',   levelNumber: 'Level 3', color: 'yellow',title: 'Used reflective listening — briefly paraphrased what I heard' },
  { id: 6, level: 'Warmth',   levelNumber: 'Level 3', color: 'yellow',title: 'Gave one specific, genuine piece of recognition' },
  { id: 7, level: 'Connection',levelNumber:'Level 4', color: 'emerald',title:'Followed up with someone within 48 hours, referencing something specific' },
  { id: 8, level: 'Connection',levelNumber:'Level 4', color: 'emerald',title:'Reached out to at least one weak-tie or new contact' },
  { id: 9, level: 'Legacy',   levelNumber: 'Level 5', color: 'purple', title: 'Acted in line with my own stated values under some friction' },
  { id: 10,level: 'Legacy',   levelNumber: 'Level 5', color: 'purple', title: 'Reflected honestly on one interaction I\'d handle differently next time' },
];

export const SCORING_GUIDE = [
  { score: 1, label: 'Did not practice this today' },
  { score: 2, label: 'Attempted it once, inconsistently' },
  { score: 3, label: 'Practiced it deliberately at least once' },
  { score: 4, label: 'Practiced it multiple times, felt natural' },
  { score: 5, label: 'Fully embodied — showed up without having to think about it' },
];

export const CAPSTONE_DAYS = [
  { day: 6,  level: 'Level 1 — Presence', focus: 'Focus for Level 2: Power' },
  { day: 12, level: 'Level 2 — Power',    focus: 'Focus for Level 3: Warmth' },
  { day: 18, level: 'Level 3 — Warmth',   focus: 'Focus for Level 4: Connection' },
  { day: 24, level: 'Level 4 — Connection',focus:'Focus for Level 5: Legacy' },
  { day: 30, level: 'Level 5 — Legacy',    focus: 'Final Mastery & Past Day 30 Habits' },
];

export default function DailyHabitTracker({
  profile,
  themeMode = 'dark',
  isCourseCompleted = false,
  completedCount = 0,
  totalLessons = 30,
  onNavigate
}) {
  const isLight = themeMode === 'light';
  const email = profile?.email;

  // Determine current Day (1-30) based on completed lessons count or enrolled days
  const progress = getProgress(email);
  const doneLessonsCount = Object.keys(progress).length;
  const currentDay = Math.min(30, Math.max(1, doneLessonsCount || 1));

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [trackers, setTrackers] = useState({});
  const [showGridModal, setShowGridModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  // Current day tracker state
  const dayKey = `day_${selectedDay}`;
  const currentTracker = trackers[dayKey] || {
    scores: {},
    pillarScores: { Presence: 0, Power: 0, Warmth: 0, Connection: 0, Legacy: 0 },
    note: '',
    weeklyReflection: { strongest: '', weakest: '', moment: '', focus: '' }
  };

  // Load from localStorage and Supabase on mount + subscribe to Realtime updates
  useEffect(() => {
    if (!email) return;
    const localRaw = localStorage.getItem(`th3ory_trackers_${email}`);
    if (localRaw) {
      try { setTrackers(JSON.parse(localRaw)); } catch (e) {}
    }

    fetchAllHabitTrackersFromSupabase(email).then(remoteData => {
      if (remoteData && Object.keys(remoteData).length > 0) {
        setTrackers(remoteData);
        localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(remoteData));
      }
    });

    const unsub = subscribeToStudentHabitTrackers(email, (updatedRemote) => {
      if (updatedRemote && Object.keys(updatedRemote).length > 0) {
        setTrackers(updatedRemote);
        localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(updatedRemote));
      }
    });

    return () => unsub();
  }, [email]);

  const checkCourseAccess = () => {
    if (!isCourseCompleted) {
      setShowLockModal(true);
      return false;
    }
    return true;
  };

  const handleScoreChange = (habitId, score) => {
    if (!checkCourseAccess()) return;

    const updatedScores = { ...(currentTracker.scores || {}), [habitId]: score };
    
    // Recalculate 5-Pillar Scores
    const pillarScores = { Presence: 0, Power: 0, Warmth: 0, Connection: 0, Legacy: 0 };
    CORE_HABITS.forEach(h => {
      const s = updatedScores[h.id] || 0;
      pillarScores[h.level] = (pillarScores[h.level] || 0) + s;
    });

    const updatedDay = {
      ...currentTracker,
      scores: updatedScores,
      pillarScores,
      updatedAt: new Date().toISOString()
    };

    const updatedAll = { ...trackers, [dayKey]: updatedDay };
    setTrackers(updatedAll);
    localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(updatedAll));
    saveHabitTrackerDayToSupabase(email, selectedDay, updatedDay);
  };

  const handleNoteChange = (text) => {
    if (!checkCourseAccess()) return;

    const updatedDay = { ...currentTracker, note: text, updatedAt: new Date().toISOString() };
    const updatedAll = { ...trackers, [dayKey]: updatedDay };
    setTrackers(updatedAll);
    localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(updatedAll));
    saveHabitTrackerDayToSupabase(email, selectedDay, updatedDay);
  };

  const handleReflectionChange = (field, text) => {
    if (!checkCourseAccess()) return;

    const updatedReflection = { ...(currentTracker.weeklyReflection || {}), [field]: text };
    const updatedDay = { ...currentTracker, weeklyReflection: updatedReflection, updatedAt: new Date().toISOString() };
    const updatedAll = { ...trackers, [dayKey]: updatedDay };
    setTrackers(updatedAll);
    localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(updatedAll));
    saveHabitTrackerDayToSupabase(email, selectedDay, updatedDay);
  };

  const handleSave = async () => {
    if (!checkCourseAccess()) return;
    if (!email) return;

    localStorage.setItem(`th3ory_trackers_${email}`, JSON.stringify(trackers));
    await saveDailyTrackerToSupabase(email, trackers);
    await saveHabitTrackerDayToSupabase(email, selectedDay, currentTracker);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Calculate total day score out of 50 (10 habits x 5 max score) or out of 25 for 5 Pillars
  const habitScoresArray = Object.values(currentTracker.scores || {});
  const totalScore = habitScoresArray.reduce((a, b) => a + b, 0);
  const isCapstoneDay = CAPSTONE_DAYS.some(c => c.day === selectedDay);
  const capstoneInfo = CAPSTONE_DAYS.find(c => c.day === selectedDay);

  return (
    <div className={`border rounded-2xl p-5 sm:p-7 space-y-6 transition-all ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Course Lock Notice Banner */}
      {!isCourseCompleted && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isLight ? 'bg-amber-50 border-amber-200 text-slate-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">Daily Habit Tracker Unlocks After 100% Course Completion</span>
              <span className="text-xs opacity-90">Progress: {completedCount} of {totalLessons} Lessons Completed ({totalLessons ? Math.round((completedCount/totalLessons)*100) : 0}%)</span>
            </div>
          </div>
          <button
            onClick={() => setShowLockModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider shrink-0 transition-all shadow-md"
          >
            View Requirements
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-500 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Daily Activity
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>30-Day Course Tracker</span>
          </div>
          <h3 className={`font-black text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Daily Habit &amp; 5-Pillar Self-Assessment
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Track whether your core daily habits show up in your real life. Takes 2 minutes at the end of the day.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setShowGuide(g => !g)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Scoring Guide"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Scoring Guide</span>
          </button>
          <button
            onClick={() => setShowGridModal(true)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>30-Day Grid</span>
          </button>
        </div>
      </div>

      {/* Scoring Guide Collapsible Box */}
      {showGuide && (
        <div className={`p-4 rounded-xl border space-y-3 ${
          isLight ? 'bg-amber-50/60 border-amber-200 text-slate-800' : 'bg-slate-950 border-amber-500/30 text-slate-300'
        }`}>
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Scoring Guide (1–5 Scale)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {SCORING_GUIDE.map(g => (
              <div key={g.score} className={`p-2.5 rounded-lg border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center mr-1.5">
                  {g.score}
                </span>
                <span className="font-medium leading-tight">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className={`text-xs font-extrabold uppercase shrink-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Select Day:</span>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
          const isSelected = selectedDay === d;
          const isCap = CAPSTONE_DAYS.some(c => c.day === d);
          const hasData = Boolean(trackers[`day_${d}`]?.updatedAt);

          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 select-none flex items-center gap-1 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-105'
                  : hasData
                  ? isLight ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-green-950/60 border border-green-500/30 text-green-400'
                  : isLight ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Day {d} {isCap && <span className="text-[10px] opacity-80">🏆</span>}
            </button>
          );
        })}
      </div>

      {/* Day Header Summary Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h4 className={`font-black text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Day {selectedDay} Self-Assessment
            </h4>
            {isCapstoneDay && (
              <span className="bg-amber-500/20 text-amber-500 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                🏆 Capstone Day
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
            Rate each habit from 1 to 5. Live calculated total score is saved automatically.
          </p>
        </div>

        {/* Total Score Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Today's Score:</span>
            <div className="text-2xl font-black text-amber-500">{totalScore} / 50</div>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedNotice ? 'Saved!' : 'Save Tracker'}</span>
          </button>
        </div>
      </div>

      {/* 10 Core Habits Scoring Table */}
      <div className="space-y-3">
        <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center justify-between ${
          isLight ? 'text-slate-700' : 'text-slate-400'
        }`}>
          <span>The 10 Core Daily Habits</span>
          <span className="text-[10px] text-slate-500">Scale 1 (Low) → 5 (Fully Embodied)</span>
        </h4>

        <div className="space-y-2">
          {CORE_HABITS.map((habit, index) => {
            const currentScore = currentTracker.scores?.[habit.id] || 0;

            return (
              <div
                key={habit.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {habit.levelNumber}: {habit.level}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {habit.title}
                    </p>
                  </div>
                </div>

                {/* 1-5 Score Picker Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 justify-end mt-2 md:mt-0">
                  {[1, 2, 3, 4, 5].map(score => {
                    const active = currentScore === score;

                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleScoreChange(habit.id, score)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          active
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-110 ring-2 ring-amber-400'
                            : isLight
                            ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={SCORING_GUIDE[score - 1].label}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Pillar Score Summary Breakdown */}
      <div className={`p-4 rounded-xl border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800'
      }`}>
        <h4 className={`font-bold text-xs uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
          5-Pillar Score Breakdown (Max 10 per Pillar)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['Presence', 'Power', 'Warmth', 'Connection', 'Legacy'].map(pillar => {
            const pScore = currentTracker.pillarScores?.[pillar] || 0;

            return (
              <div key={pillar} className={`p-3 rounded-lg border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-[10px] font-black uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{pillar}</span>
                <div className="text-lg font-black text-amber-500 mt-0.5">{pScore} / 10</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Reflection Note */}
      <div className="space-y-2">
        <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
          Daily Reflection Note (Optional)
        </label>
        <textarea
          rows={3}
          value={currentTracker.note || ''}
          onChange={e => handleNoteChange(e.target.value)}
          placeholder="Reflect briefly on your daily practice (e.g. Which habit felt easiest? Where did you encounter friction?)"
          className={`w-full border rounded-xl p-3.5 text-sm focus:outline-none focus:border-amber-500/60 resize-none ${
            isLight
              ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
              : 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
          }`}
        />
      </div>

      {/* Capstone Weekly Reflection Box (Unlocked on Capstone Days) */}
      {isCapstoneDay && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-950 border-purple-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            <h4 className={`font-black text-base ${isLight ? 'text-purple-900' : 'text-purple-300'}`}>
              Weekly Capstone Reflection — {capstoneInfo?.level}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Strongest habit this week:
              </label>
              <input
                value={currentTracker.weeklyReflection?.strongest || ''}
                onChange={e => handleReflectionChange('strongest', e.target.value)}
                placeholder="e.g. Deliberate unhurried pace"
                className={`w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-amber-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Weakest habit this week:
              </label>
              <input
                value={currentTracker.weeklyReflection?.weakest || ''}
                onChange={e => handleReflectionChange('weakest', e.target.value)}
                placeholder="e.g. Reaching out to weak-ties"
                className={`w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-amber-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              One specific moment this level's skill changed an outcome:
            </label>
            <textarea
              rows={2}
              value={currentTracker.weeklyReflection?.moment || ''}
              onChange={e => handleReflectionChange('moment', e.target.value)}
              placeholder="Describe a real conversation or interaction where your skill changed the result…"
              className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 resize-none ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            />
          </div>
        </div>
      )}

      {/* 30-Day Grid Full Modal */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto border rounded-2xl p-6 shadow-2xl space-y-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
              <div>
                <h3 className="font-black text-xl">30-Day Habit Tracker Grid</h3>
                <p className="text-xs text-slate-500">Overview of your habit scores across all 30 days of the program</p>
              </div>
              <button onClick={() => setShowGridModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-950 text-slate-400'}>
                    <th className="p-2.5 border border-slate-700/30">Habit</th>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <th key={d} className="p-2 border border-slate-700/30 text-center font-bold">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CORE_HABITS.map(h => (
                    <tr key={h.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-950/40'}>
                      <td className="p-2.5 border border-slate-700/30 font-medium truncate max-w-[200px]" title={h.title}>
                        {h.id}. {h.title}
                      </td>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                        const score = trackers[`day_${d}`]?.scores?.[h.id] || 0;
                        return (
                          <td key={d} className="p-1 border border-slate-700/30 text-center">
                            {score > 0 ? (
                              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-black text-[10px] ${
                                score >= 4 ? 'bg-green-500 text-slate-950' : score >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white'
                              }`}>
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowGridModal(false)}
                className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
              >
                Close Grid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Completion Required Pop-up Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg border rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 ${
            isLight ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-900 border-amber-500/40 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Course Completion Required</h3>
                  <p className="text-xs text-amber-500 font-bold">Unlock Daily Self-Assessment Tracker</p>
                </div>
              </div>
              <button onClick={() => setShowLockModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
              isLight ? 'bg-amber-50 border-amber-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              The <strong>Daily Habit &amp; 5-Pillar Self-Assessment Tracker</strong> is designed for daily practice after mastering all 30 course lessons.
              <br /><br />
              Please complete the video course first to unlock your daily habit tracking!
            </div>

            {/* Course Progress Status */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-400'}>Your Course Progress</span>
                <span className="text-amber-500">{completedCount} of {totalLessons} Lessons ({totalLessons ? Math.round((completedCount/totalLessons)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalLessons ? Math.round((completedCount/totalLessons)*100) : 0}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowLockModal(false)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex-1 ${
                  isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowLockModal(false);
                  if (onNavigate) onNavigate('course');
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 flex-1 shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Continue Video Course</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

