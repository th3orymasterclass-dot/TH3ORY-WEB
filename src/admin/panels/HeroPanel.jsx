import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

function Field({ label, name, value, onChange, type = 'text', rows, hint, isDark = true }) {
  return (
    <div>
      <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
      {hint && <p className={`text-xs mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{hint}</p>}
      {rows ? (
        <textarea
          rows={rows}
          value={value ?? ''}
          onChange={e => onChange(name, e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm resize-y transition-all ${
            isDark
              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-amber-500/60'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
            isDark
              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-amber-500/60'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
          }`}
        />
      )}
    </div>
  );
}

export default function HeroPanel({ data, save, reset, defaults, themeMode = 'dark' }) {
  const [d, setD] = useState(data.courseDetails);
  const isDark = themeMode === 'dark';

  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const update = (key, val) => setD(prev => ({ ...prev, [key]: val }));
  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset Hero to defaults?')) reset('courseDetails'); };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Hero &amp; Branding</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Controls the top hero section and site-wide text</p>
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

      <div className={`border rounded-2xl p-6 space-y-6 shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <Field label="Hero Title" name="title" value={d.title} onChange={update} isDark={isDark} />
        <Field label="Hero Subtitle" name="subtitle" value={d.subtitle} onChange={update} rows={2} isDark={isDark} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Instructor Name" name="instructor" value={d.instructor} onChange={update} isDark={isDark} />
          <Field label="Instructor Title / Role" name="instructorTitle" value={d.instructorTitle} onChange={update} isDark={isDark} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Duration" name="duration" value={d.duration} onChange={update} isDark={isDark} />
          <Field label="Language" name="language" value={d.language} onChange={update} isDark={isDark} />
        </div>
        <Field label="Hero Video Embed URL (Vimeo / YouTube)" name="heroVideoUrl" value={d.heroVideoUrl} onChange={update} hint="Paste direct embed link e.g. https://player.vimeo.com/video/..." isDark={isDark} />
      </div>
    </div>
  );
}
