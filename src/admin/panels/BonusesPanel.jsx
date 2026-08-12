import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function BonusesPanel({ data, save, reset }) {
  const [courseDetails, setCD] = useState(data.courseDetails);
  const [addons, setAddons] = useState(data.addons ?? []);
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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Bonuses &amp; Add-ons</h2>
          <p className="text-slate-500 text-sm mt-1">Edit included bonuses and checkout upsell add-ons</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if(window.confirm('Reset?')){ reset('courseDetails'); reset('addons'); }}}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Save className="w-3.5 h-3.5" /> Save All
          </button>
        </div>
      </div>

      {/* Bonuses */}
      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Included Bonuses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bonuses.map((bonus, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Bonus {i + 1}</span>
                <button onClick={() => setCD(prev => ({ ...prev, bonuses: prev.bonuses.filter((_, bi) => bi !== i) }))}
                  className="text-red-500/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {[
                { label: 'Bonus Name', key: 'name' },
                { label: 'Description', key: 'description' },
                { label: 'Icon (Lucide name)', key: 'icon' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                  <input value={bonus[f.key] ?? ''} onChange={e => updateBonus(i, f.key, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50" />
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => setCD(prev => ({ ...prev, bonuses: [...(prev.bonuses ?? []), { name: '', description: '', icon: 'Gift' }] }))}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm min-h-[120px]">
            <Plus className="w-4 h-4" /> Add Bonus
          </button>
        </div>
      </div>

      {/* Addons */}
      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Checkout Add-ons (Upsells)</h3>
        <div className="space-y-4">
          {addons.map((addon, i) => (
            <div key={addon.id || i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Add-on {i + 1}</span>
                <button onClick={() => { if(window.confirm('Delete add-on?')) setAddons(prev => prev.filter((_, ai) => ai !== i)); }}
                  className="text-red-500/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Add-on Name</label>
                  <input value={addon.name ?? ''} onChange={e => setAddons(prev => prev.map((a, ai) => ai === i ? { ...a, name: e.target.value } : a))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Price ($)</label>
                  <input type="number" value={addon.price ?? ''} onChange={e => setAddons(prev => prev.map((a, ai) => ai === i ? { ...a, price: +e.target.value } : a))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Description</label>
                <textarea rows={2} value={addon.description ?? ''} onChange={e => setAddons(prev => prev.map((a, ai) => ai === i ? { ...a, description: e.target.value } : a))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
          ))}
          <button onClick={() => setAddons(prev => [...prev, { id: `a${Date.now()}`, name: '', price: 0, description: '' }])}
            className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Upsell Add-on
          </button>
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Bonuses &amp; Add-ons
      </button>
    </div>
  );
}
