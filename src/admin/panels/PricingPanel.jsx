import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Star, Crown } from 'lucide-react';

export default function PricingPanel({ data, save, reset }) {
  const [plans, setPlans] = useState(data.plans ?? []);
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

  const PLAN_COLORS = ['border-slate-600', 'border-amber-500/60', 'border-purple-500/60'];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Pricing Plans</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all tiers, prices, and feature lists</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((plan, pi) => (
          <div key={plan.id || pi} className={`bg-slate-900 border ${PLAN_COLORS[pi % PLAN_COLORS.length]} rounded-2xl p-5 space-y-4`}>
            {/* Popular toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan {pi + 1}</span>
              <button
                onClick={() => updatePlan(pi, 'popular', !plan.popular)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${plan.popular ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                <Crown className="w-3 h-3" /> {plan.popular ? 'Popular ✓' : 'Set Popular'}
              </button>
            </div>

            {/* Basic fields */}
            {[
              { label: 'Plan Name', key: 'name' },
              { label: 'Badge Text', key: 'badge' },
              { label: 'Full Price ($)', key: 'priceFull', type: 'number' },
              { label: 'Monthly Price ($)', key: 'priceMonthly', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={plan[f.key] ?? ''}
                  onChange={e => updatePlan(pi, f.key, f.type === 'number' ? +e.target.value : e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
            ))}

            {/* Features */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">✓ Included Features</label>
              <div className="space-y-1.5">
                {(plan.features ?? []).map((f, fi) => (
                  <div key={fi} className="flex items-center gap-1.5">
                    <input value={f} onChange={e => updateFeature(pi, fi, e.target.value, 'features')}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
                    <button onClick={() => removeFeature(pi, fi, 'features')} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addFeature(pi, 'features')} className="text-amber-400 text-xs hover:text-amber-300 font-medium">+ Add</button>
              </div>
            </div>

            {/* Not included */}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">✗ Not Included</label>
              <div className="space-y-1.5">
                {(plan.notIncluded ?? []).map((f, fi) => (
                  <div key={fi} className="flex items-center gap-1.5">
                    <input value={f} onChange={e => updateFeature(pi, fi, e.target.value, 'notIncluded')}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
                    <button onClick={() => removeFeature(pi, fi, 'notIncluded')} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addFeature(pi, 'notIncluded')} className="text-slate-400 text-xs hover:text-slate-300 font-medium">+ Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Pricing
      </button>
    </div>
  );
}
