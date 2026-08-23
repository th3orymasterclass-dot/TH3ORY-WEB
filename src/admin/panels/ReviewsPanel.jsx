import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Star } from 'lucide-react';

function StarPicker({ value, onChange, isDark }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className="cursor-pointer">
          <Star className={`w-4 h-4 ${n <= value ? 'fill-amber-400 text-amber-400' : isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}

const BLANK_REVIEW = { id: '', name: '', role: '', avatar: '', rating: 5, category: '', comment: '' };

export default function ReviewsPanel({ data, save, reset, themeMode = 'dark' }) {
  const [reviews, setReviews] = useState(data.reviews ?? []);
  const isDark = themeMode === 'dark';

  useEffect(() => setReviews(data.reviews ?? []), [data.reviews]);

  const handleSave = () => save('reviews', reviews);
  const handleReset = () => { if (window.confirm('Reset reviews?')) reset('reviews'); };

  const update = (i, key, val) => setReviews(prev => prev.map((r, ri) => ri === i ? { ...r, [key]: val } : r));
  const add = () => setReviews(prev => [...prev, { ...BLANK_REVIEW, id: `r${Date.now()}` }]);
  const remove = (i) => { if (window.confirm('Delete this review?')) setReviews(prev => prev.filter((_, ri) => ri !== i)); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Student Reviews</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage testimonials shown on the public page</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, i) => (
          <div key={review.id || i} className={`border rounded-2xl p-5 space-y-3 shadow-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start justify-between">
              <StarPicker value={review.rating} onChange={val => update(i, 'rating', val)} isDark={isDark} />
              <button onClick={() => remove(i)} className={`p-1 rounded cursor-pointer ${
                isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-500 hover:bg-rose-50'
              }`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {[
              { label: 'Name', key: 'name' },
              { label: 'Role / Title', key: 'role' },
              { label: 'Category', key: 'category', hint: 'e.g. Executive Leader, Entrepreneur' },
              { label: 'Avatar URL', key: 'avatar' },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.label}</label>
                <input
                  value={review[f.key] ?? ''}
                  onChange={e => update(i, f.key, e.target.value)}
                  placeholder={f.hint}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-semibold mt-1 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            ))}

            <div>
              <label className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Review Quote</label>
              <textarea
                rows={3}
                value={review.comment ?? ''}
                onChange={e => update(i, 'comment', e.target.value)}
                className={`w-full border rounded-xl p-3 text-xs mt-1 ${
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
        <Plus className="w-4 h-4" /> Add New Review
      </button>
    </div>
  );
}
