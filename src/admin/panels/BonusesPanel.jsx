import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function BonusesPanel({ data, save, reset, themeMode = 'dark' }) {
  const [courseDetails, setCD] = useState(data.courseDetails);
  const [addons, setAddons] = useState(data.addons ?? []);
  const isDark = themeMode === 'dark';

  useEffect(() => { setCD(data.courseDetails); setAddons(data.addons ?? []); }, [data]);

  const bonuses = courseDetails?.bonuses ?? [];
  const updateBonus = (i, key, val) => setCD(prev => ({
    ...prev, bonuses: prev.bonuses.map((b, bi) => bi === i ? { ...b, [key]: val } : b)
  }));

  const handleSave = () => {
    save('courseDetails', courseDetails);
    save('addons', addons);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Bonuses &amp; Add-ons</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Edit included bonuses and checkout upsell add-ons</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if(window.confirm('Reset?')){ reset('courseDetails'); reset('addons'); }}}
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

      {/* Bonuses */}
      <div>
        <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Included Bonuses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bonuses.map((bonus, i) => (
            <div key={i} className={`border rounded-2xl p-4 space-y-3 shadow-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bonus {i + 1}</span>
                <button
                  onClick={() => setCD(prev => ({ ...prev, bonuses: prev.bonuses.filter((_, bi) => bi !== i) }))}
                  className={`p-1 rounded cursor-pointer ${isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-500 hover:bg-rose-50'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {[
                { label: 'Bonus Name', key: 'name' },
                { label: 'Description', key: 'description' },
                { label: 'Icon (Lucide name)', key: 'icon' },
              ].map(f => (
                <div key={f.key}>
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.label}</label>
                  <input
                    value={bonus[f.key] ?? ''}
                    onChange={e => updateBonus(i, f.key, e.target.value)}
                    className={`w-full border rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
