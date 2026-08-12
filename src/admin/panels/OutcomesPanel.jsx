import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function OutcomesPanel({ data, save, reset }) {
  const [d, setD] = useState(data.courseDetails);
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
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Outcomes &amp; Pillars</h2>
          <p className="text-slate-500 text-sm mt-1">Edit outcome cards, pillars, and target audience</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Save className="w-3.5 h-3.5" /> Save All
          </button>
        </div>
      </div>

      {/* Outcomes */}
      <section>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Learning Outcomes (6 Cards)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.map((o, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Outcome {i + 1}</span>
                <button onClick={() => removeItem('outcomes', i)} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {['title', 'description', 'icon'].map(f => (
                <input key={f} placeholder={f} value={o[f] ?? ''}
                  onChange={e => updateArr('outcomes', i, f, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
              ))}
            </div>
          ))}
          <button onClick={() => addItem('outcomes', { title: '', description: '', icon: 'Star' })}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm min-h-[100px]">
            <Plus className="w-4 h-4" /> Add Outcome
          </button>
        </div>
      </section>

      {/* Pillars */}
      <section>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Course Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, i) => (
            <div key={p.id || i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Pillar {i + 1}</span>
                <button onClick={() => removeItem('pillars', i)} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {['name', 'tagline', 'icon', 'color'].map(f => (
                <input key={f} placeholder={f} value={p[f] ?? ''}
                  onChange={e => updateArr('pillars', i, f, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
              ))}
            </div>
          ))}
          <button onClick={() => addItem('pillars', { id: `p${Date.now()}`, name: '', tagline: '', icon: 'Star', color: 'from-amber-500 to-yellow-600' })}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm min-h-[100px]">
            <Plus className="w-4 h-4" /> Add Pillar
          </button>
        </div>
      </section>

      {/* Who is this for */}
      <section>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Who Is This For</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whoFor.map((w, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Audience {i + 1}</span>
                <button onClick={() => removeItem('whoIsThisFor', i)} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {['title', 'description', 'icon'].map(f => (
                <input key={f} placeholder={f} value={w[f] ?? ''}
                  onChange={e => updateArr('whoIsThisFor', i, f, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
              ))}
            </div>
          ))}
          <button onClick={() => addItem('whoIsThisFor', { title: '', description: '', icon: 'Users' })}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm min-h-[100px]">
            <Plus className="w-4 h-4" /> Add Audience
          </button>
        </div>
      </section>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Outcomes &amp; Pillars
      </button>
    </div>
  );
}
