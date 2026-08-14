import React, { useState } from 'react';
import { Flag, ShieldAlert, Sparkles, Save, RefreshCw, CheckCircle2, Sliders, Server, Zap, Lock } from 'lucide-react';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

export default function FeatureFlagsPanel() {
  const { flags, toggleFlag, saveFlags, refreshFlags, loading } = useFeatureFlags();
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-black text-xl tracking-tight">Vercel Feature Flags Control</h2>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Server className="w-3 h-3" /> Vercel Serverless + DB Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Dynamically enable, disable, and control frontend components and system operational modes in real-time without redeploying code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refreshFlags()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save & Deploy Flags'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Feature flag updates deployed and synchronized successfully across serverless handlers &amp; clients!
        </div>
      )}

      {/* Categories Grid */}
      <div className="space-y-6">
        {Object.keys(categories).map(catName => (
          <div key={catName} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-amber-400" /> {catName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories[catName].map(flag => (
                <div
                  key={flag.key}
                  className={`p-4 rounded-xl border transition-all ${
                    flag.enabled
                      ? 'bg-slate-950 border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/40 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">{flag.name}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            flag.enabled
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-snug">{flag.description}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(flag.key, flag.enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        flag.enabled ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                          flag.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 flex items-center justify-between">
                    <span>FLAG KEY: <strong className="text-slate-300">{flag.key}</strong></span>
                    <span className="text-amber-400/80">VERCEL_FLAGS_{flag.key}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
