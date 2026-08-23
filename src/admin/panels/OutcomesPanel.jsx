import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function OutcomesPanel({ data, save, reset, themeMode = 'dark' }) {
  const [d, setD] = useState(data.courseDetails);
  const isDark = themeMode === 'dark';

  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset outcomes & pillars?')) reset('courseDetails'); };

  const updateArr = (key, i, field, val) => setD(prev => ({
    ...prev,
    [key]: prev[key].map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }));
  const addItem = (key, blank) => setD(prev => ({ ...prev, [key]: [...(prev[key] ?? []), blank] }));
  const removeItem = (key, i) => setD(prev => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));

  const outcomes = d?.outcomes ?? [];
  const pillars = d?.pillars ?? [];
  const whoFor = d?.whoIsThisFor ?? [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Outcomes &amp; Pillars</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Edit outcome cards, pillars, and target audience</p>
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
            <Save className="w-3.5 h-3.5" /> Save All
          </button>
        </div>
      </div>

      {/* Outcomes */}
      <section>
        <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Learning Outcomes (6 Cards)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.map((o, i) => (
            <div key={i} className={`border rounded-2xl p-4 space-y-2 shadow-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Outcome {i + 1}</span>
                <button
                  onClick={() => removeItem('outcomes', i)}
                  className={`p-1 rounded cursor-pointer ${isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-500 hover:bg-rose-50'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {['title', 'description', 'icon'].map(f => (
                <input
                  key={f}
                  placeholder={f}
                  value={o[f] ?? ''}
                  onChange={e => updateArr('outcomes', i, f, e.target.value)}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              ))}
            </div>
          ))}
          <button
            onClick={() => addItem('outcomes', { title: '', description: '', icon: 'Star' })}
            className={`border-2 border-dashed rounded-2xl p-4 transition-all flex items-center justify-center gap-2 text-sm font-bold min-h-[100px] cursor-pointer ${
              isDark ? 'border-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-amber-400' : 'border-slate-300 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            <Plus className="w-4 h-4" /> Add Outcome
          </button>
        </div>
      </section>
    </div>
  );
}
