import React, { useState } from 'react';
import { Star, Send, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getMyReview, saveMyReview } from '../studentData';
import { lsSet, getCourseDetails } from '../../data/adminData';
import { saveReviewToSupabase } from '../../services/supabaseService';

function StarPicker({ value, onChange, size = 7 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110">
          <Star className={`w-${size} h-${size} transition-colors ${n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}/>
        </button>
      ))}
    </div>
  );
}

const LABELS = ['','Terrible','Poor','Okay','Great','Excellent — 5 Stars!'];

export default function ReviewPanel({ profile }) {
  const existing = getMyReview();
  const [submitted, setSubmitted] = useState(!!existing);
  const [form, setForm] = useState(existing || {
    rating: 5, comment: '', role: '', category: 'Learner',
  });
  const [loading, setLoading] = useState(false);

  const up = (k, v) => setForm(f => ({...f, [k]: v}));

  const CATEGORIES = ['Student', 'Professional', 'Entrepreneur', 'Executive Leader', 'High Achiever', 'Learner'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim() || form.comment.length < 20) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Save to student store
    const review = { ...form, name: profile.name, id: `r_${Date.now()}` };
    saveMyReview(review);
    await saveReviewToSupabase(review);

    // Also push into the public reviews array (admin can see it)
    const existing = JSON.parse(localStorage.getItem('th3ory_admin_reviews') || 'null');
    const baseReviews = existing || [];
    const alreadyMine = baseReviews.find(r => r.id?.startsWith('r_') && r.name === profile.name);
    if (!alreadyMine) {
      lsSet('reviews', [...baseReviews, { ...review, avatar: '' }]);
    }

    setSubmitted(true);
    setLoading(false);
  };

  const details = getCourseDetails();

  if (submitted) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white">Leave a Review</h2>
          <p className="text-slate-500 text-sm mt-1">Your feedback helps other students</p>
        </div>
        <div className="max-w-lg mx-auto text-center py-14 bg-slate-900 border border-green-500/30 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-400"/>
          </div>
          <h3 className="text-white font-black text-xl mb-2">Review Submitted!</h3>
          <div className="flex justify-center mb-4">
            <StarPicker value={form.rating} onChange={() => {}} size={6}/>
          </div>
          <p className="text-slate-400 text-sm italic max-w-xs mx-auto">"{form.comment}"</p>
          <p className="text-slate-500 text-xs mt-3">— {profile.name}</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 text-amber-400 text-sm hover:underline">Edit Review</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Leave a Review</h2>
        <p className="text-slate-500 text-sm mt-1">Share your TH3ORY experience to inspire others</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 mb-6">
          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"/>
          <p className="text-amber-300 text-sm">Your review will appear on the public course page and help future students make the right decision.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
          {/* Course being reviewed */}
          <div className="pb-4 border-b border-slate-800">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Reviewing</p>
            <p className="text-white font-bold">{details?.title || 'MASTERCLASS OF INFLUENCING'}</p>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Rating</label>
            <StarPicker value={form.rating} onChange={v => up('rating', v)} size={9}/>
            <p className={`text-sm mt-2 font-semibold ${form.rating >= 4 ? 'text-amber-400' : form.rating >= 3 ? 'text-yellow-500' : 'text-red-400'}`}>
              {LABELS[form.rating]}
            </p>
          </div>

          {/* Role & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Role / Title</label>
              <input value={form.role} onChange={e => up('role', e.target.value)}
                placeholder="e.g. Marketing Manager, Student, Founder"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <select value={form.category} onChange={e => up('category', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Review</label>
            <textarea rows={5} required value={form.comment} onChange={e => up('comment', e.target.value)}
              placeholder="What was your experience? What did you learn? How has it impacted you? (min. 20 characters)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/60 resize-none placeholder-slate-600"/>
            <p className={`text-xs mt-1 ${form.comment.length < 20 ? 'text-slate-600' : 'text-green-400'}`}>
              {form.comment.length} chars {form.comment.length < 20 && `(need ${20 - form.comment.length} more)`}
            </p>
          </div>

          <button type="submit" disabled={loading || form.comment.length < 20}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"/>
              : <Send className="w-4 h-4"/>}
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
