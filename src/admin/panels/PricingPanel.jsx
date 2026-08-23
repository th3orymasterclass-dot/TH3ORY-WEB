import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Star, Crown } from 'lucide-react';

export default function PricingPanel({ data, save, reset, themeMode = 'dark' }) {
  const [plans, setPlans] = useState(data.plans ?? []);
  const isDark = themeMode === 'dark';

  useEffect(() => setPlans(data.plans ?? []), [data.plans]);

  const handleSave = () => save('plans', plans);
  const handleReset = () => { if (window.confirm('Reset pricing to defaults?')) reset('plans'); };

  const updatePlan = (i, key, val) => setPlans(prev => prev.map((p, pi) => pi === i ? { ...p, [key]: val } : p));
  const updateFeature = (pi, fi, val, listKey) => setPlans(prev => prev.map((p, i) => {
    if (i !== pi) return p;
    const arr = [...(p[listKey] ?? [])];
    arr[fi] = val;
    return { ...p, [listKey]: arr };
  }));
  const addFeature = (pi, listKey) => setPlans(prev => prev.map((p, i) => i === pi ? { ...p, [listKey]: [...(p[listKey] ?? []), ''] } : p));
  const removeFeature = (pi, fi, listKey) => setPlans(prev => prev.map((p, i) => i === pi ? { ...p, [listKey]: p[listKey].filter((_, fii) => fii !== fi) } : p));

  const PLAN_COLORS = isDark
    ? ['border-slate-800', 'border-amber-500/60', 'border-purple-500/60']
    : ['border-slate-200', 'border-amber-400', 'border-purple-300'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Pricing Plans</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage all tiers, prices, and feature lists</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((plan, pi) => (
          <div key={plan.id || pi} className={`border ${PLAN_COLORS[pi % PLAN_COLORS.length]} rounded-2xl p-5 space-y-4 shadow-xs ${
            isDark ? 'bg-slate-900/90' : 'bg-white'
          }`}>
            {/* Popular toggle */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plan {pi + 1}</span>
              <button
                type="button"
                onClick={() => updatePlan(pi, 'popular', !plan.popular)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  plan.popular
                    ? isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-50 text-amber-800 border border-amber-300'
                    : isDark ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                <Crown className="w-3 h-3" /> {plan.popular ? 'Popular ✓' : 'Set Popular'}
              </button>
            </div>

            {/* Basic fields */}
            {[
              { label: 'Plan Name', key: 'name' },
              { label: 'Badge Text', key: 'badge' },
              { label: 'Full Price ($)', key: 'priceFull', type: 'number' },
              { label: 'INR Price (₹)', key: 'priceINR', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={plan[f.key] ?? ''}
                  onChange={e => updatePlan(pi, f.key, f.type === 'number' ? +e.target.value : e.target.value)}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold mt-1 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            ))}

            {/* Features lists */}
            {['features', 'notIncluded'].map(listKey => (
              <div key={listKey} className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase ${listKey === 'features' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {listKey === 'features' ? '✓ Included Features' : '✕ Excluded Features'}
                  </span>
                  <button
                    type="button"
                    onClick={() => addFeature(pi, listKey)}
                    className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-amber-400 hover:text-amber-300' : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                {(plan[listKey] ?? []).map((feat, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <input
                      value={feat}
                      onChange={e => updateFeature(pi, fi, e.target.value, listKey)}
                      className={`flex-1 border rounded-lg px-2.5 py-1 text-xs ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(pi, fi, listKey)}
                      className={`p-1 rounded ${isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
