import React, { useState, useEffect } from 'react';
import { 
  Flame, Tag, Sparkles, Crown, Users, Award, Zap, Check, 
  RotateCcw, ShieldCheck, Plus, Trash2, Link as LinkIcon 
} from 'lucide-react';
import { defaultCampaign } from '../../data/courseData';

export default function CampaignPanel({ data, save, reset, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  const initial = data?.campaign || defaultCampaign;

  const [d, setD] = useState(initial);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data?.campaign) {
      setD(data.campaign);
    }
  }, [data?.campaign]);

  const update = (key, val) => setD(prev => ({ ...prev, [key]: val }));

  const updateFeature = (index, field, val) => {
    const next = [...(d.features || [])];
    next[index] = { ...next[index], [field]: val };
    setD(prev => ({ ...prev, features: next }));
  };

  const addFeature = () => {
    const next = [...(d.features || []), {
      title: "NEW FEATURE BONUS",
      subtitle: "EXCLUSIVE PERK",
      description: "Description of the campaign bonus or masterclass component.",
      icon: "Sparkles"
    }];
    setD(prev => ({ ...prev, features: next }));
  };

  const removeFeature = (index) => {
    const next = d.features.filter((_, i) => i !== index);
    setD(prev => ({ ...prev, features: next }));
  };

  const handleSave = () => {
    save('campaign', d);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset launch campaign settings to defaults?')) {
      reset('campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5" /> Founding Launch Campaign
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Launch Campaign & Special Offer
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Control promotional pricing (₹499), urgency metrics, copy, payment link, and perks.
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Live!' : 'Save Campaign'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Campaign Configuration Form */}
      <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          Headline & Pricing Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Campaign Badge Text
            </label>
            <input
              type="text"
              value={d.badge || ''}
              onChange={e => update('badge', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Bonus Ribbon Tag
            </label>
            <input
              type="text"
              value={d.bonusTag || ''}
              onChange={e => update('bonusTag', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Launch Price (INR ₹)
            </label>
            <input
              type="number"
              value={d.launchPriceINR || 499}
              onChange={e => update('launchPriceINR', Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-black text-red-500 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Regular Price (INR ₹)
            </label>
            <input
              type="number"
              value={d.regularPriceINR || 11999}
              onChange={e => update('regularPriceINR', Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400 line-through' : 'bg-slate-50 border-slate-300 text-slate-400 line-through'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Seats Total
            </label>
            <input
              type="number"
              value={d.seatsTotal || 100}
              onChange={e => update('seatsTotal', Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Seats Claimed
            </label>
            <input
              type="number"
              value={d.seatsClaimed || 74}
              onChange={e => update('seatsClaimed', Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-amber-400 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Direct Razorpay Payment Link
            </label>
            <div className="relative">
              <input
                type="text"
                value={d.rzpLink || ''}
                onChange={e => update('rzpLink', e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                  isDark ? 'bg-slate-800/80 border-slate-700 text-indigo-300' : 'bg-slate-50 border-slate-300 text-indigo-600'
                }`}
              />
              <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Punchline Tagline
            </label>
            <input
              type="text"
              value={d.tagline || ''}
              onChange={e => update('tagline', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Campaign Feature Cards CRUD */}
      <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Campaign Feature Boxes ({d.features?.length || 0})
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Features highlighted in the launch promotional box.
            </p>
          </div>

          <button
            onClick={addFeature}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Feature
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {d.features?.map((feat, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-3 relative ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                  BOX #{idx + 1}
                </span>
                <button
                  onClick={() => removeFeature(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={feat.title || ''}
                  onChange={e => updateFeature(idx, 'title', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Subtitle
                </label>
                <input
                  type="text"
                  value={feat.subtitle || ''}
                  onChange={e => updateFeature(idx, 'subtitle', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={feat.description || ''}
                  onChange={e => updateFeature(idx, 'description', e.target.value)}
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
