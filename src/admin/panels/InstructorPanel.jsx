import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function InstructorPanel({ data, save, reset, themeMode = 'dark' }) {
  const [d, setD] = useState(data.courseDetails);
  const isDark = themeMode === 'dark';

  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const inst = d?.instructor ?? {};
  const updateInst = (key, val) => setD(prev => ({ ...prev, instructor: { ...prev.instructor, [key]: val } }));

  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset instructor info?')) reset('courseDetails'); };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Instructor</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Edit instructor profile shown on the public page</p>
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
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Avatar preview */}
      <div className={`flex items-center gap-4 p-4 border rounded-2xl shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <img src={(inst.avatar && !inst.avatar.includes('unsplash.com')) ? inst.avatar : '/instructor.png'} alt="" className={`w-16 h-16 rounded-2xl object-cover border ${
          isDark ? 'border-slate-700' : 'border-slate-300'
        }`} onError={e => e.target.style.display='none'} />
        <div>
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{inst.name || 'SRAVAN SUDHAKARAN'}</p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{inst.role || 'Mentalist, Human Behaviour Coach, Hypnotist, Criminologist, LifeSkill Trainer, Author'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Name', key: 'name' },
          { label: 'Role / Title', key: 'role' },
          { label: 'Avatar Image URL', key: 'avatar' },
        ].map(f => (
          <div key={f.key}>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.label}</label>
            <input
              value={inst[f.key] ?? ''}
              onChange={e => updateInst(f.key, e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            />
          </div>
        ))}

        <div>
          <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Bio</label>
          <textarea
            rows={4}
            value={inst.bio ?? ''}
            onChange={e => updateInst('bio', e.target.value)}
            className={`w-full border rounded-xl p-3 text-sm transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
