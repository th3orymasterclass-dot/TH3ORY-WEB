import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

function LessonRow({ lesson, onChange, onDelete, isDark }) {
  return (
    <div className={`flex items-center gap-2 py-2 border-b last:border-0 ${
      isDark ? 'border-slate-800/50' : 'border-slate-200'
    }`}>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={lesson.title ?? ''}
          onChange={e => onChange({ ...lesson, title: e.target.value })}
          placeholder="Lesson title"
          className={`border rounded-lg px-3 py-1.5 text-xs col-span-2 transition-all ${
            isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-amber-500/50' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
          }`}
        />
        <div className="flex gap-2">
          <input
            value={lesson.duration ?? ''}
            onChange={e => onChange({ ...lesson, duration: e.target.value })}
            placeholder="Duration"
            className={`flex-1 border rounded-lg px-3 py-1.5 text-xs transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-amber-500/50' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
            }`}
          />
          <button
            type="button"
            onClick={() => onChange({ ...lesson, preview: !lesson.preview })}
            title={lesson.preview ? 'Free preview' : 'Locked'}
            className={`px-2 rounded-lg border text-xs transition-all cursor-pointer ${
              lesson.preview
                ? isDark ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-amber-300 text-amber-800 bg-amber-50'
                : isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400 bg-slate-100'
            }`}
          >
            {lesson.preview ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <button onClick={onDelete} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
        isDark ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30' : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
      }`}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function LevelCard({ level, index, onChange, onDelete, isDark }) {
  const [open, setOpen] = useState(index === 0);

  const addLesson = () => {
    const newId = `${level.id}-${Date.now()}`;
    onChange({ ...level, lessons: [...(level.lessons ?? []), { id: newId, title: '', duration: '15 mins', preview: false }] });
  };

  const updateLesson = (li, updated) => {
    const lessons = level.lessons.map((l, i) => i === li ? updated : l);
    onChange({ ...level, lessons });
  };

  const deleteLesson = (li) => onChange({ ...level, lessons: level.lessons.filter((_, i) => i !== li) });

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-xs ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className={`p-4 flex items-center justify-between gap-3 border-b ${
        isDark ? 'border-slate-800/80 bg-slate-900' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex-1 flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
            isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            LEVEL {index + 1}
          </span>
          <input
            value={level.title ?? ''}
            onChange={e => onChange({ ...level, title: e.target.value })}
            placeholder="Level title"
            className={`font-bold text-sm bg-transparent border-b px-1 py-0.5 focus:outline-none flex-1 ${
              isDark ? 'text-white border-slate-700 focus:border-amber-400' : 'text-slate-900 border-slate-300 focus:border-indigo-600'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={`p-1.5 rounded-lg ${isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-600 hover:bg-rose-50'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <input
            value={level.description ?? ''}
            onChange={e => onChange({ ...level, description: e.target.value })}
            placeholder="Level subtitle description..."
            className={`w-full border rounded-xl px-3 py-2 text-xs ${
              isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          />

          <div className="space-y-1">
            {(level.lessons ?? []).map((l, li) => (
              <LessonRow
                key={l.id || li}
                lesson={l}
                onChange={updated => updateLesson(li, updated)}
                onDelete={() => deleteLesson(li)}
                isDark={isDark}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addLesson}
            className={`w-full py-2 border border-dashed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-300' : 'border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Lesson Module
          </button>
        </div>
      )}
    </div>
  );
}

export default function CurriculumPanel({ data, save, reset, themeMode = 'dark' }) {
  const [curriculum, setCurriculum] = useState(data.curriculum ?? []);
  const isDark = themeMode === 'dark';

  useEffect(() => setCurriculum(data.curriculum ?? []), [data.curriculum]);

  const addLevel = () => {
    const newLevel = {
      id: `lvl-${Date.now()}`,
      title: `Level ${curriculum.length + 1}`,
      description: 'Mastery module description',
      lessons: []
    };
    setCurriculum([...curriculum, newLevel]);
  };

  const updateLevel = (index, updated) => {
    const next = curriculum.map((l, i) => i === index ? updated : l);
    setCurriculum(next);
  };

  const deleteLevel = (index) => setCurriculum(curriculum.filter((_, i) => i !== index));

  const handleSave = () => save('curriculum', curriculum);
  const handleReset = () => { if (window.confirm('Reset curriculum to default?')) reset('curriculum'); };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Curriculum &amp; Modules</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage course levels, lesson titles, durations, and free previews</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer ${
              isDark ? 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40' : 'border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 bg-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {curriculum.map((lvl, index) => (
          <LevelCard
            key={lvl.id || index}
            level={lvl}
            index={index}
            onChange={updated => updateLevel(index, updated)}
            onDelete={() => deleteLevel(index)}
            isDark={isDark}
          />
        ))}
      </div>

      <button
        onClick={addLevel}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all uppercase tracking-wider"
      >
        <Plus className="w-4 h-4" /> Add New Course Level
      </button>
    </div>
  );
}
