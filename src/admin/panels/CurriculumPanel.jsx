import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

function LessonRow({ lesson, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-800/50 last:border-0">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={lesson.title ?? ''}
          onChange={e => onChange({ ...lesson, title: e.target.value })}
          placeholder="Lesson title"
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50 col-span-2"
        />
        <div className="flex gap-2">
          <input
            value={lesson.duration ?? ''}
            onChange={e => onChange({ ...lesson, duration: e.target.value })}
            placeholder="Duration"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={() => onChange({ ...lesson, preview: !lesson.preview })}
            title={lesson.preview ? 'Free preview' : 'Locked'}
            className={`px-2 rounded-lg border text-xs transition-all ${lesson.preview ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-500'}`}
          >
            {lesson.preview ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <button onClick={onDelete} className="text-red-500/50 hover:text-red-400 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function LevelCard({ level, index, onChange, onDelete }) {
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

  const ACCENT_COLORS = [
    'border-amber-500/40', 'border-purple-500/40', 'border-rose-500/40', 'border-sky-500/40', 'border-amber-400/50'
  ];

  return (
    <div className={`bg-slate-900 border ${ACCENT_COLORS[index % ACCENT_COLORS.length]} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <input value={level.levelNumber ?? ''} onClick={e => e.stopPropagation()} onChange={e => onChange({ ...level, levelNumber: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-400 text-xs font-bold focus:outline-none focus:border-amber-500/50" />
          <input value={level.name ?? ''} onClick={e => e.stopPropagation()} onChange={e => onChange({ ...level, name: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500/50" />
          <input value={level.days ?? ''} onClick={e => e.stopPropagation()} onChange={e => onChange({ ...level, days: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-400 text-xs focus:outline-none focus:border-amber-500/50" />
          <input value={level.tagline ?? ''} onClick={e => e.stopPropagation()} onChange={e => onChange({ ...level, tagline: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-400 text-xs focus:outline-none focus:border-amber-500/50" />
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <span className="text-slate-500 text-xs">{level.lessons?.length ?? 0} lessons</span>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-red-500/50 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
            {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </div>

      {/* Summary */}
      {open && (
        <div className="px-5 pb-2">
          <textarea
            value={level.summary ?? ''}
            onChange={e => onChange({ ...level, summary: e.target.value })}
            placeholder="Level summary..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-amber-500/50 resize-none mb-3"
          />
        </div>
      )}

      {/* Lessons */}
      {open && (
        <div className="px-5 pb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lessons</p>
          {(level.lessons ?? []).map((lesson, li) => (
            <LessonRow
              key={lesson.id || li}
              lesson={lesson}
              onChange={updated => updateLesson(li, updated)}
              onDelete={() => deleteLesson(li)}
            />
          ))}
          <button onClick={addLesson} className="mt-3 text-amber-400 text-xs hover:text-amber-300 font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

export default function CurriculumPanel({ data, save, reset }) {
  const [levels, setLevels] = useState(data.levels ?? []);
  useEffect(() => setLevels(data.levels ?? []), [data.levels]);

  const handleSave = () => save('levels', levels);
  const handleReset = () => { if (window.confirm('Reset curriculum to defaults?')) reset('levels'); };

  const addLevel = () => {
    const newId = `l${Date.now()}`;
    setLevels(prev => [...prev, {
      id: newId, levelNumber: `LEVEL ${prev.length + 1}`, name: 'NEW LEVEL',
      days: 'DAYS ??–??', capstoneDay: 'DAY ?? CAPSTONE', tagline: '', summary: '',
      accentColor: 'border-amber-500/50 bg-amber-500/10 text-amber-400', lessons: []
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Curriculum Levels</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all levels, lessons, and preview access</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {levels.map((level, i) => (
          <LevelCard
            key={level.id || i}
            level={level}
            index={i}
            onChange={updated => setLevels(prev => prev.map((l, li) => li === i ? updated : l))}
            onDelete={() => { if (window.confirm(`Delete level "${level.name}"?`)) setLevels(prev => prev.filter((_, li) => li !== i)); }}
          />
        ))}
      </div>

      <button onClick={addLevel} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/50 text-slate-500 hover:text-amber-400 text-sm font-medium transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add New Level
      </button>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Curriculum
      </button>
    </div>
  );
}
