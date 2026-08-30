import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Check, RotateCcw, ShieldCheck, Plus, Trash2, 
  Eye, Zap, Heart, Users, Award, GraduationCap, Briefcase, TrendingUp, Star 
} from 'lucide-react';

export default function PillarsPanel({ data, save, reset, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  const courseDetails = data?.courseDetails || {};

  const [pillars, setPillars] = useState(courseDetails.pillars || []);
  const [differentiators, setDifferentiators] = useState(courseDetails.differentiators || []);
  const [whoIsThisFor, setWhoIsThisFor] = useState(courseDetails.whoIsThisFor || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data?.courseDetails) {
      setPillars(data.courseDetails.pillars || []);
      setDifferentiators(data.courseDetails.differentiators || []);
      setWhoIsThisFor(data.courseDetails.whoIsThisFor || []);
    }
  }, [data?.courseDetails]);

  const handleSave = () => {
    const updated = {
      ...courseDetails,
      pillars,
      differentiators,
      whoIsThisFor
    };
    save('courseDetails', updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset Pillars, Differentiators, and Target Audiences to defaults?')) {
      reset('courseDetails');
    }
  };

  // Pillar Helpers
  const updatePillar = (idx, field, val) => {
    const next = [...pillars];
    next[idx] = { ...next[idx], [field]: val };
    setPillars(next);
  };

  const addPillar = () => {
    setPillars(prev => [
      ...prev,
      {
        id: `p${prev.length + 1}`,
        name: 'NEW PILLAR',
        tagline: 'Tagline explaining this psychological pillar.',
        icon: 'Sparkles',
        color: 'from-amber-500 to-yellow-600'
      }
    ]);
  };

  const removePillar = (idx) => {
    setPillars(prev => prev.filter((_, i) => i !== idx));
  };

  // Differentiators Helpers
  const updateDiff = (idx, val) => {
    const next = [...differentiators];
    next[idx] = val;
    setDifferentiators(next);
  };

  const addDiff = () => {
    setDifferentiators(prev => [...prev, 'New psychology-backed differentiator or program benefit.']);
  };

  const removeDiff = (idx) => {
    setDifferentiators(prev => prev.filter((_, i) => i !== idx));
  };

  // Who Is This For Helpers
  const updateTarget = (idx, field, val) => {
    const next = [...whoIsThisFor];
    next[idx] = { ...next[idx], [field]: val };
    setWhoIsThisFor(next);
  };

  const addTarget = () => {
    setWhoIsThisFor(prev => [
      ...prev,
      {
        title: 'NEW AUDIENCE',
        description: 'How this masterclass helps this specific profile succeed.',
        icon: 'Users'
      }
    ]);
  };

  const removeTarget = (idx) => {
    setWhoIsThisFor(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 5-Level Psychological Framework
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Pillars & Differentiators
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage the 5 Pillars of Influence, Program Differentiators, and "Who Is This For" cards.
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
              <span>{savedSuccess ? 'Saved Live!' : 'Save Pillars'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: 5 PILLARS OF INFLUENCE */}
      <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              The 5 Pillars of Influence ({pillars.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Presence, Power, Warmth, Connection, Legacy.
            </p>
          </div>

          <button
            onClick={addPillar}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Pillar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p, idx) => (
            <div
              key={p.id || idx}
              className={`p-4 rounded-xl border space-y-3 relative ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  PILLAR 0{idx + 1}
                </span>
                <button
                  onClick={() => removePillar(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Pillar Name
                </label>
                <input
                  type="text"
                  value={p.name || ''}
                  onChange={e => updatePillar(idx, 'name', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tagline
                </label>
                <textarea
                  rows={2}
                  value={p.tagline || ''}
                  onChange={e => updatePillar(idx, 'tagline', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: WHY TH3ORY WORKS (DIFFERENTIATORS) */}
      <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Program Differentiators ({differentiators.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Key bullet points explaining what makes TH3ORY unique.
            </p>
          </div>

          <button
            onClick={addDiff}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Differentiator
          </button>
        </div>

        <div className="space-y-3">
          {differentiators.map((diff, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 w-6 shrink-0">#{idx + 1}</span>
              <input
                type="text"
                value={diff}
                onChange={e => updateDiff(idx, e.target.value)}
                className={`flex-1 px-3.5 py-2 rounded-xl border text-xs sm:text-sm ${
                  isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                onClick={() => removeDiff(idx)}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: WHO IS THIS FOR? */}
      <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Who Is This For? ({whoIsThisFor.length} Audiences)
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Target demographic and career segment cards.
            </p>
          </div>

          <button
            onClick={addTarget}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Audience
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {whoIsThisFor.map((target, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-3 relative ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  AUDIENCE 0{idx + 1}
                </span>
                <button
                  onClick={() => removeTarget(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Title (e.g. STUDENTS, PROFESSIONALS)
                </label>
                <input
                  type="text"
                  value={target.title || ''}
                  onChange={e => updateTarget(idx, 'title', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={target.description || ''}
                  onChange={e => updateTarget(idx, 'description', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'
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
