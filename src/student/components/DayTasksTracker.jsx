import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, CheckCircle2, Sparkles, Trophy, Award, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { COURSE_TASKS_DATA } from '../../data/courseTasksData';
import { markLesson } from '../studentData';
import {
  saveTaskStepsToSupabase,
  fetchTaskStepsFromSupabase,
  subscribeToTaskSteps
} from '../../services/supabaseService';

export default function DayTasksTracker({
  dayNumber = 1,
  profile,
  themeMode = 'dark',
  onProgressUpdate
}) {
  const isLight = themeMode === 'light';
  const email = profile?.email || 'default';
  const dayData = COURSE_TASKS_DATA[dayNumber] || COURSE_TASKS_DATA[1];
  const lessonId = `d${dayNumber}`;

  const storageKey = `th3ory_tasks_${email}`;

  // Checked sub-step keys state (e.g. { 'd1_t1_0': true, 'd1_t1_1': true })
  const [checkedSteps, setCheckedSteps] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Fetch live from Supabase on mount & subscribe to real-time changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setCheckedSteps(JSON.parse(raw));
    } catch {}

    if (email && email !== 'default') {
      fetchTaskStepsFromSupabase(email).then(data => {
        if (data && typeof data === 'object') {
          setCheckedSteps(data);
        }
      });

      const unsub = subscribeToTaskSteps(email, (data) => {
        if (data && typeof data === 'object') {
          setCheckedSteps(data);
        }
      });

      return () => unsub();
    }
  }, [email, dayNumber]);

  const persistSteps = (updatedSteps) => {
    setCheckedSteps(updatedSteps);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedSteps));
    } catch {}

    if (email && email !== 'default') {
      // Save current day's steps slice to Supabase student_progress
      const dayStepsSlice = {};
      dayData.tasks.forEach(t => {
        t.subSteps.forEach((_, idx) => {
          const key = `${t.id}_${idx}`;
          if (updatedSteps[key] !== undefined) {
            dayStepsSlice[key] = Boolean(updatedSteps[key]);
          }
        });
      });
      saveTaskStepsToSupabase(email, lessonId, dayStepsSlice);
    }

    checkDayCompletion(updatedSteps);
    if (onProgressUpdate) onProgressUpdate();
  };

  const toggleSubStep = (stepKey) => {
    const updated = { ...checkedSteps, [stepKey]: !checkedSteps[stepKey] };
    persistSteps(updated);
  };

  const isTaskComplete = (task, checkedState = checkedSteps) => {
    return task.subSteps.every((_, idx) => Boolean(checkedState[`${task.id}_${idx}`]));
  };

  const checkDayCompletion = (checkedState) => {
    const allCompleted = dayData.tasks.every(t => isTaskComplete(t, checkedState));
    if (allCompleted) {
      markLesson(lessonId, true, email);
    }
  };

  const toggleTaskAll = (task) => {
    const isComp = isTaskComplete(task);
    const updated = { ...checkedSteps };
    task.subSteps.forEach((_, idx) => {
      updated[`${task.id}_${idx}`] = !isComp;
    });
    persistSteps(updated);
  };

  const resetDayTasks = () => {
    const updated = { ...checkedSteps };
    dayData.tasks.forEach(t => {
      t.subSteps.forEach((_, idx) => {
        delete updated[`${t.id}_${idx}`];
      });
    });
    persistSteps(updated);
  };

  const completedTasksCount = dayData.tasks.filter(t => isTaskComplete(t)).length;
  const totalTasksCount = dayData.tasks.length;
  const dayProgressPct = Math.round((completedTasksCount / totalTasksCount) * 100);
  const isDayFullyComplete = completedTasksCount === totalTasksCount;

  return (
    <div className={`border rounded-2xl p-5 sm:p-7 space-y-6 transition-all ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Level & Day Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black uppercase tracking-wider">
              {dayData.level}
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Day {dayNumber} Checklist
            </span>
          </div>
          <h3 className={`font-black text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {dayData.title}
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Work through each task in order. Checked sub-steps sync live to your account in real-time.
          </p>
        </div>

        <button
          onClick={resetDayTasks}
          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
            isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Reset Day Progress"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Day</span>
        </button>
      </div>

      {/* Progress Bar & Status */}
      <div className={`p-4 rounded-xl border space-y-2 ${
        isDayFullyComplete
          ? isLight ? 'bg-green-50 border-green-200 text-green-900' : 'bg-green-950/40 border-green-500/30 text-green-300'
          : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5">
            {isDayFullyComplete ? <Trophy className="w-4 h-4 text-green-500" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
            <span>Day {dayNumber} Task Completion</span>
          </span>
          <span className="text-amber-500 font-extrabold">
            {completedTasksCount} of {totalTasksCount} Tasks ({dayProgressPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-700/40 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDayFullyComplete ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${dayProgressPct}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {dayData.tasks.map((task, tIndex) => {
          const complete = isTaskComplete(task);
          const checkedCount = task.subSteps.filter((_, idx) => Boolean(checkedSteps[`${task.id}_${idx}`])).length;

          return (
            <div
              key={task.id}
              className={`border rounded-xl p-4 space-y-3 transition-all ${
                complete
                  ? isLight ? 'bg-green-50/50 border-green-200' : 'bg-green-950/20 border-green-500/30'
                  : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950'
              }`}
            >
              {/* Task Title Header */}
              <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => toggleTaskAll(task)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTaskAll(task); }}
                    className="shrink-0 transition-transform active:scale-95"
                  >
                    {complete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/20" />
                    ) : (
                      <Square className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold leading-snug ${
                      complete ? (isLight ? 'text-green-900 line-through opacity-80' : 'text-green-300 line-through opacity-80') : (isLight ? 'text-slate-900' : 'text-white')
                    }`}>
                      {tIndex + 1}. {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    complete
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : checkedCount > 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {complete ? 'DONE ✅' : `${checkedCount}/2 Sub-steps`}
                  </span>
                </div>
              </div>

              {/* Sub-steps Checkbox List */}
              <div className="pl-8 space-y-2 pt-1 border-t border-slate-700/20">
                {task.subSteps.map((subStepText, sIndex) => {
                  const stepKey = `${task.id}_${sIndex}`;
                  const isChecked = Boolean(checkedSteps[stepKey]);

                  return (
                    <label
                      key={stepKey}
                      className={`flex items-start gap-2.5 text-xs font-medium cursor-pointer select-none py-1 px-2 rounded-lg transition-all ${
                        isChecked
                          ? isLight ? 'bg-green-100/60 text-green-950 font-semibold' : 'bg-green-950/40 text-green-300 font-semibold'
                          : isLight ? 'text-slate-700 hover:bg-slate-200/60' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubStep(stepKey)}
                        className="sr-only"
                      />
                      <span className="shrink-0 mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-green-500" />
                        ) : (
                          <Square className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                        )}
                      </span>
                      <span className="flex-1 leading-normal">{subStepText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
