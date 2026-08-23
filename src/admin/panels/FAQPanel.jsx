import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

const BLANK_FAQ = { category: '', question: '', answer: '' };

export default function FAQPanel({ data, save, reset, themeMode = 'dark' }) {
  const [faqs, setFaqs] = useState(data.faqs ?? []);
  const isDark = themeMode === 'dark';

  useEffect(() => setFaqs(data.faqs ?? []), [data.faqs]);

  const handleSave = () => save('faqs', faqs);
  const handleReset = () => { if (window.confirm('Reset FAQs to defaults?')) reset('faqs'); };

  const update = (i, key, val) => setFaqs(prev => prev.map((f, fi) => fi === i ? { ...f, [key]: val } : f));
  const add = () => setFaqs(prev => [...prev, { ...BLANK_FAQ }]);
  const remove = (i) => { if (window.confirm('Delete FAQ?')) setFaqs(prev => prev.filter((_, fi) => fi !== i)); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>FAQs</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage frequently asked questions</p>
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

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className={`border rounded-2xl p-5 space-y-3 shadow-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>FAQ {i + 1}</span>
              <button
                onClick={() => remove(i)}
                className={`p-1 rounded cursor-pointer ${
                  isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-500 hover:bg-rose-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category</label>
              <input
                value={faq.category ?? ''}
                onChange={e => update(i, 'category', e.target.value)}
                placeholder="e.g. Format & Schedule, Payment, Guarantee"
                className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Question</label>
              <input
                value={faq.question ?? ''}
                onChange={e => update(i, 'question', e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Answer</label>
              <textarea
                rows={3}
                value={faq.answer ?? ''}
                onChange={e => update(i, 'answer', e.target.value)}
                className={`w-full border rounded-xl p-3 text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer uppercase tracking-wider"
      >
        <Plus className="w-4 h-4" /> Add FAQ Item
      </button>
    </div>
  );
}
