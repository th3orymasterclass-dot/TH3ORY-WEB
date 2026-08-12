import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

const BLANK_FAQ = { category: '', question: '', answer: '' };

export default function FAQPanel({ data, save, reset }) {
  const [faqs, setFaqs] = useState(data.faqs ?? []);
  useEffect(() => setFaqs(data.faqs ?? []), [data.faqs]);

  const handleSave = () => save('faqs', faqs);
  const handleReset = () => { if (window.confirm('Reset FAQs to defaults?')) reset('faqs'); };

  const update = (i, key, val) => setFaqs(prev => prev.map((f, fi) => fi === i ? { ...f, [key]: val } : f));
  const add = () => setFaqs(prev => [...prev, { ...BLANK_FAQ }]);
  const remove = (i) => { if (window.confirm('Delete FAQ?')) setFaqs(prev => prev.filter((_, fi) => fi !== i)); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">FAQs</h2>
          <p className="text-slate-500 text-sm mt-1">Manage frequently asked questions</p>
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

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">FAQ {i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-500/50 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Category</label>
              <input
                value={faq.category ?? ''}
                onChange={e => update(i, 'category', e.target.value)}
                placeholder="e.g. Format & Schedule, Payment, Guarantee"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Question</label>
              <input
                value={faq.question ?? ''}
                onChange={e => update(i, 'question', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Answer</label>
              <textarea
                rows={3}
                value={faq.answer ?? ''}
                onChange={e => update(i, 'answer', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-y"
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={add}
        className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm font-medium">
        <Plus className="w-4 h-4" /> Add FAQ
      </button>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save FAQs
      </button>
    </div>
  );
}
