import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Flame } from 'lucide-react';

export default function UrgencyPanel({ data, save, reset, themeMode = 'dark' }) {
  const [d, setD] = useState(data.courseDetails);
  const isDark = themeMode === 'dark';

  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const update = (key, val) => setD(prev => ({ ...prev, urgency: { ...prev.urgency, [key]: val } }));
  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset urgency settings?')) reset('courseDetails'); };

  const u = d?.urgency ?? {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Urgency &amp; Seats</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Controls the live countdown and scarcity indicators</p>
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

      {/* Preview badge */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
        isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span className={`font-bold text-sm ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
          COHORT #{u.cohortNumber} — {u.seatsLeft} Seats Remaining — Starts {u.startDate}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: 'Cohort Number', key: 'cohortNumber', type: 'number' },
          { label: 'Seats Left', key: 'seatsLeft', type: 'number' },
          { label: 'Start / Launch Date Display', key: 'startDate', type: 'text' },
          { label: 'Launch Timestamp (e.g. 2026-11-01T00:00:00+05:30)', key: 'launchDate', type: 'text' },
          { label: 'Days Remaining (Urgency Indicator)', key: 'daysRemaining', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.label}</label>
            <input
              type={f.type}
              value={u[f.key] ?? ''}
              onChange={e => update(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
                isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-500/60' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 shadow-xs'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Coupon codes section */}
      <div className={`border rounded-2xl p-6 shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Coupon Code</h3>
        <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Specify default code applied at checkout</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Coupon Code</label>
            <input
              type="text"
              value={d.couponCode ?? ''}
              onChange={e => setD(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
              className={`w-full border rounded-xl px-4 py-2.5 font-mono uppercase text-sm ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Discount Percentage (%)</label>
            <input
              type="number"
              value={d.couponDiscount ?? 0}
              onChange={e => setD(prev => ({ ...prev, couponDiscount: +e.target.value }))}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
