import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Flame } from 'lucide-react';

export default function UrgencyPanel({ data, save, reset }) {
  const [d, setD] = useState(data.courseDetails);
  useEffect(() => setD(data.courseDetails), [data.courseDetails]);

  const update = (key, val) => setD(prev => ({ ...prev, urgency: { ...prev.urgency, [key]: val } }));
  const handleSave = () => save('courseDetails', d);
  const handleReset = () => { if (window.confirm('Reset urgency settings?')) reset('courseDetails'); };

  const u = d?.urgency ?? {};

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Urgency &amp; Seats</h2>
          <p className="text-slate-500 text-sm mt-1">Controls the live countdown and scarcity indicators</p>
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

      {/* Preview badge */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
        <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
        <span className="text-amber-300 font-bold text-sm">
          COHORT #{u.cohortNumber} — {u.seatsLeft} Seats Remaining — Starts {u.startDate}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: 'Cohort Number', key: 'cohortNumber', type: 'number' },
          { label: 'Seats Left', key: 'seatsLeft', type: 'number' },
          { label: 'Start Date', key: 'startDate', type: 'text' },
          { label: 'Days Remaining (Urgency Timer)', key: 'daysRemaining', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={u[f.key] ?? ''}
              onChange={e => update(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/60 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Coupon codes section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Active Coupon Code</h3>
        <p className="text-slate-500 text-xs mb-4">Currently hardcoded as TH3ORY20 (20% off). Edit in CheckoutModal.jsx to change.</p>
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-950 rounded-xl border border-slate-700">
          <span className="font-mono text-amber-400 font-bold text-sm">TH3ORY20</span>
          <span className="text-slate-500 text-xs">→ 20% discount applied at checkout</span>
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Urgency Settings
      </button>
    </div>
  );
}
