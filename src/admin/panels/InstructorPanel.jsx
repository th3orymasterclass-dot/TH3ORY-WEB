import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function InstructorPanel({ data, save, reset }) {
  const [d, setD] = useState(data.courseDetails);
  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const inst = d?.instructor ?? {};
  const updateInst = (key, val) => setD(prev => ({ ...prev, instructor: { ...prev.instructor, [key]: val } }));

  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset instructor info?')) reset('courseDetails'); };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Instructor</h2>
          <p className="text-slate-500 text-sm mt-1">Edit instructor profile shown on the public page</p>
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

      {/* Avatar preview */}
      {inst.avatar && (
        <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <img src={inst.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-700" onError={e => e.target.style.display='none'} />
          <div>
            <p className="text-white font-bold text-sm">{inst.name || 'Instructor Name'}</p>
            <p className="text-slate-400 text-xs">{inst.role || 'Role'}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {[
          { label: 'Name', key: 'name' },
          { label: 'Role / Title', key: 'role' },
          { label: 'Avatar Image URL', key: 'avatar' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
            <input
              value={inst[f.key] ?? ''}
              onChange={e => updateInst(f.key, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</label>
          <textarea
            rows={4}
            value={inst.bio ?? ''}
            onChange={e => updateInst('bio', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 resize-y"
          />
        </div>

        {/* Companies */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Companies / Credentials</label>
          <div className="space-y-2">
            {(inst.companies ?? []).map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={c}
                  onChange={e => {
                    const arr = [...inst.companies]; arr[i] = e.target.value;
                    updateInst('companies', arr);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <button onClick={() => updateInst('companies', inst.companies.filter((_, ci) => ci !== i))}
                  className="text-red-500/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => updateInst('companies', [...(inst.companies ?? []), ''])}
              className="text-amber-400 text-sm hover:text-amber-300 font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Credential
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Instructor
      </button>
    </div>
  );
}
