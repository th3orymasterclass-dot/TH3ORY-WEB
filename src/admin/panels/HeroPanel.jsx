import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, ShieldCheck, Plus, Trash2, Layout, Crown } from 'lucide-react';

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

export default function HeroPanel({ data, save, reset, themeMode = 'dark' }) {
  const [d, setD] = useState(data?.courseDetails || {});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (data?.courseDetails) {
      setD(data.courseDetails);
    }
  }, [data?.courseDetails]);

  const update = (key, val) => setD(prev => ({ ...prev, [key]: val }));

  const updateStat = (index, field, val) => {
    const next = [...(d.stats || [])];
    next[index] = { ...next[index], [field]: val };
    setD(prev => ({ ...prev, stats: next }));
  };

  const addStat = () => {
    const next = [...(d.stats || []), { label: "NEW STAT", value: "100%", detail: "Stat detail description" }];
    setD(prev => ({ ...prev, stats: next }));
  };

  const removeStat = (index) => {
    const next = (d.stats || []).filter((_, i) => i !== index);
    setD(prev => ({ ...prev, stats: next }));
  };

  const handleSave = () => {
    save('courseDetails', d);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => { 
    if (window.confirm('Reset Hero Section & Branding to defaults?')) {
      reset('courseDetails');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5" /> Hero & Branding Control
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Hero Section & Brand Identity
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Control the top banner quote, main title, subtitle, tagline, brand titles, and the 4 poster stat cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-950" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Live!' : 'Save Hero'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Fields */}
      <div className={`border rounded-2xl p-6 space-y-6 shadow-xs ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          Headlines & Typography
        </h3>

        <Field 
          label="Top Ribbon Banner Quote" 
          name="bannerQuote" 
          value={d.bannerQuote} 
          onChange={update} 
          isDark={isDark} 
        />

        <Field 
          label="Masterclass Main Headline (Title)" 
          name="title" 
          value={d.title} 
          onChange={update} 
          isDark={isDark} 
        />

        <Field 
          label="Hero Subtitle / Description" 
          name="subtitle" 
          value={d.subtitle} 
          onChange={update} 
          rows={3} 
          isDark={isDark} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Brand Name" 
            name="brandName" 
            value={d.brandName} 
            onChange={update} 
            isDark={isDark} 
          />
          <Field 
            label="Production House Name" 
            name="productionHouse" 
            value={d.productionHouse} 
            onChange={update} 
            isDark={isDark} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Site Tagline" 
            name="tagline" 
            value={d.tagline} 
            onChange={update} 
            isDark={isDark} 
          />
          <Field 
            label="Language / Captions" 
            name="language" 
            value={d.language} 
            onChange={update} 
            isDark={isDark} 
          />
        </div>
      </div>

      {/* 4 Core Poster Stats CRUD */}
      <div className={`border rounded-2xl p-6 space-y-6 shadow-xs ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Hero 4 Core Poster Stats ({d.stats?.length || 0})
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Displayed in the grid beneath the hero call to action.
            </p>
          </div>

          <button
            onClick={addStat}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stat Card
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {d.stats?.map((st, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-3 relative ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  STAT 0{idx + 1}
                </span>
                <button
                  onClick={() => removeStat(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Large Stat Value
                </label>
                <input
                  type="text"
                  value={st.value || ''}
                  onChange={e => updateStat(idx, 'value', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-sm font-black text-amber-400 ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Label / Name
                </label>
                <input
                  type="text"
                  value={st.label || ''}
                  onChange={e => updateStat(idx, 'label', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Detail Subtitle
                </label>
                <input
                  type="text"
                  value={st.detail || ''}
                  onChange={e => updateStat(idx, 'detail', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
