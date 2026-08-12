import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

function Field({ label, name, value, onChange, type = 'text', rows, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      {hint && <p className="text-slate-600 text-xs mb-1.5">{hint}</p>}
      {rows ? (
        <textarea
          rows={rows}
          value={value ?? ''}
          onChange={e => onChange(name, e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 text-sm resize-y"
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 text-sm"
        />
      )}
    </div>
  );
}

export default function HeroPanel({ data, save, reset, defaults }) {
  const [d, setD] = useState(data.courseDetails);
  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const update = (key, val) => setD(prev => ({ ...prev, [key]: val }));
  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset Hero to defaults?')) reset('courseDetails'); };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Hero &amp; Branding</h2>
          <p className="text-slate-500 text-sm mt-1">Controls the top hero section and site-wide text</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Brand Name" name="brandName" value={d?.brandName} onChange={update} />
        <Field label="Rating" name="rating" value={d?.rating} onChange={update} type="number" />
        <Field label="Total Students" name="totalStudents" value={d?.totalStudents} onChange={update} type="number" />
        <Field label="Last Updated" name="lastUpdated" value={d?.lastUpdated} onChange={update} />
        <Field label="Course Badge" name="badge" value={d?.badge} onChange={update} />
        <Field label="Language" name="language" value={d?.language} onChange={update} />
      </div>

      <div className="space-y-4">
        <Field label="Course Title" name="title" value={d?.title} onChange={update} hint="Displayed as the large heading below the logo" />
        <Field label="Subtitle / Description" name="subtitle" value={d?.subtitle} onChange={update} rows={3} />
        <Field label="Banner Quote (Top Ribbon)" name="bannerQuote" value={d?.bannerQuote} onChange={update} rows={2} />
        <Field label="Footer Quote" name="footerQuote" value={d?.footerQuote} onChange={update} rows={2} />
        <Field label="Tagline" name="tagline" value={d?.tagline} onChange={update} />
      </div>

      {/* Stats cards */}
      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Hero Stat Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(d?.stats ?? []).map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-500 font-bold uppercase">Card {i + 1}</p>
              {['label', 'value', 'detail'].map(f => (
                <input
                  key={f}
                  placeholder={f}
                  value={stat[f] ?? ''}
                  onChange={e => {
                    const newStats = d.stats.map((s, si) => si === i ? { ...s, [f]: e.target.value } : s);
                    update('stats', newStats);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 capitalize"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Differentiators */}
      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Differentiators (Bullet Points)</h3>
        <div className="space-y-2">
          {(d?.differentiators ?? []).map((diff, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={diff}
                onChange={e => {
                  const arr = [...d.differentiators]; arr[i] = e.target.value;
                  update('differentiators', arr);
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
              <button onClick={() => update('differentiators', d.differentiators.filter((_, si) => si !== i))}
                className="text-red-500/60 hover:text-red-400 text-xl leading-none">×</button>
            </div>
          ))}
          <button onClick={() => update('differentiators', [...(d?.differentiators ?? []), ''])}
            className="text-amber-400 text-sm hover:text-amber-300 font-medium">+ Add Point</button>
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save All Hero Changes
      </button>
    </div>
  );
}
