import React, { useState } from 'react';
import { Flag, ShieldAlert, Sparkles, Save, RefreshCw, CheckCircle2, Sliders, Server, Zap, Lock } from 'lucide-react';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

export default function FeatureFlagsPanel({ themeMode = 'dark' }) {
  const { flags, toggleFlag, saveFlags, refreshFlags, loading } = useFeatureFlags();
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDark = themeMode === 'dark';

  const handleToggle = (flagKey, currentState) => {
    toggleFlag(flagKey, !currentState);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const ok = await saveFlags(flags);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Group flags by category
  const categories = {};
  Object.keys(flags).forEach(key => {
    const flag = flags[key];
    const cat = flag.category || 'General Operations';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ key, ...flag });
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <Sliders className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Vercel Feature Flags Control</h2>
              <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Server className="w-3 h-3 text-amber-500" /> Vercel Serverless + DB Engine
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Dynamically enable, disable, and control frontend components and system operational modes in real-time without redeploying code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refreshFlags()}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Flags
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Feature Flags configuration successfully updated and broadcasted live across production!</span>
        </div>
      )}

      {/* Flag Categories */}
      <div className="space-y-6">
        {Object.keys(categories).map(catName => (
          <div key={catName} className={`border rounded-2xl p-5 space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Flag className="w-4 h-4 text-amber-500" />
              {catName} ({categories[catName].length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories[catName].map(flag => (
                <div
                  key={flag.key}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                    flag.value
                      ? isDark ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/50 border-amber-300'
                      : isDark ? 'bg-slate-950/40 border-slate-800/80 opacity-60' : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{flag.key}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        flag.value
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-500 border-slate-500/30'
                      }`}>
                        {flag.value ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{flag.label}</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{flag.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(flag.key, flag.value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.value ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                        flag.value ? 'translate-x-5 bg-slate-950' : 'translate-x-0 bg-slate-300'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
