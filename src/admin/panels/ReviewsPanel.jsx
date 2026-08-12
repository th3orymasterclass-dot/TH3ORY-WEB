import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Star } from 'lucide-react';

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)}>
          <Star className={`w-4 h-4 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
        </button>
      ))}
    </div>
  );
}

const BLANK_REVIEW = { id: '', name: '', role: '', avatar: '', rating: 5, category: '', comment: '' };

export default function ReviewsPanel({ data, save, reset }) {
  const [reviews, setReviews] = useState(data.reviews ?? []);
  useEffect(() => setReviews(data.reviews ?? []), [data.reviews]);

  const handleSave = () => save('reviews', reviews);
  const handleReset = () => { if (window.confirm('Reset reviews?')) reset('reviews'); };

  const update = (i, key, val) => setReviews(prev => prev.map((r, ri) => ri === i ? { ...r, [key]: val } : r));
  const add = () => setReviews(prev => [...prev, { ...BLANK_REVIEW, id: `r${Date.now()}` }]);
  const remove = (i) => { if (window.confirm('Delete this review?')) setReviews(prev => prev.filter((_, ri) => ri !== i)); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Student Reviews</h2>
          <p className="text-slate-500 text-sm mt-1">Manage testimonials shown on the public page</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, i) => (
          <div key={review.id || i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <StarPicker value={review.rating} onChange={val => update(i, 'rating', val)} />
              <button onClick={() => remove(i)} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>

            {[
              { label: 'Name', key: 'name' },
              { label: 'Role / Title', key: 'role' },
              { label: 'Category', key: 'category', hint: 'e.g. Executive Leader, Entrepreneur' },
              { label: 'Avatar URL', key: 'avatar' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                <input
                  value={review[f.key] ?? ''}
                  onChange={e => update(i, f.key, e.target.value)}
                  placeholder={f.hint ?? ''}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Review Comment</label>
              <textarea
                rows={3}
                value={review.comment ?? ''}
                onChange={e => update(i, 'comment', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
          </div>
        ))}

        {/* Add new */}
        <button
          onClick={add}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 text-slate-500 hover:text-amber-400 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px]"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Add Review</span>
        </button>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Reviews
      </button>
    </div>
  );
}
