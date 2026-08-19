import React, { useState, useEffect } from 'react';
import { Star, Send, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getMyReview, saveMyReview } from '../studentData';
import { lsSet, getCourseDetails } from '../../data/adminData';
import { saveReviewToSupabase, fetchStudentReviewFromSupabase, subscribeToStudentReview } from '../../services/supabaseService';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

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

export default function ReviewPanel({ profile, themeMode = 'dark' }) {
  const isLight = themeMode === 'light';
  const { isFeatureEnabled } = useFeatureFlags();
  const isReviewsEnabled = isFeatureEnabled('ENABLE_LIVE_REVIEWS', true);

  const existing = getMyReview(profile?.email);
  const [submitted, setSubmitted] = useState(!!existing);
  const [form, setForm] = useState(existing || {
    rating: 5, comment: '', role: '', category: 'Learner',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = profile?.email;
    if (email) {
      fetchStudentReviewFromSupabase(email).then(rev => {
        if (rev) {
          setForm(rev);
          setSubmitted(true);
        }
      });
    }

    const unsub = subscribeToStudentReview(email, (rev) => {
      if (rev) {
        setForm(rev);
        setSubmitted(true);
      }
    });

    return () => unsub();
  }, [profile?.email]);

  const up = (k, v) => setForm(f => ({...f, [k]: v}));

  const CATEGORIES = ['Student', 'Professional', 'Entrepreneur', 'Executive Leader', 'High Achiever', 'Learner'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReviewsEnabled) return;
    if (!form.comment.trim() || form.comment.length < 20) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Save to student store & Supabase
    const review = { ...form, name: profile.name, email: profile.email, id: `r_${Date.now()}` };
    saveMyReview(review, profile?.email);
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
          <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Leave a Review</h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Your feedback helps other students</p>
        </div>
        <div className={`max-w-lg mx-auto text-center py-14 border rounded-2xl ${
          isLight ? 'bg-white border-green-500/40 shadow-sm' : 'bg-slate-900 border-green-500/30'
        }`}>
          <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-500"/>
          </div>
          <h3 className={`font-black text-xl mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Review Submitted!</h3>
          <div className="flex justify-center mb-4">
            <StarPicker value={form.rating} onChange={() => {}} size={6}/>
          </div>
          <p className={`text-sm italic max-w-xs mx-auto ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>"{form.comment}"</p>
          <p className={`text-xs mt-3 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>— {profile.name}</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 text-amber-600 text-sm hover:underline font-bold">Edit Review</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isReviewsEnabled && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-600 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Graduate review submissions are currently paused by system administration.</span>
        </div>
      )}

      <div>
        <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Leave a Review</h2>
        <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Share your TH3ORY experience to inspire others</p>
      </div>

      <div className="max-w-2xl">
        <div className={`border rounded-2xl p-5 flex items-start gap-3 mb-6 ${
          isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"/>
          <p className={`text-sm ${isLight ? 'text-slate-800' : 'text-amber-300'}`}>Your review will appear on the public course page and help future students make the right decision.</p>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-2xl p-5 sm:p-7 space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Course being reviewed */}
          <div className={`pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Reviewing</p>
            <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{details?.title || 'MASTERCLASS OF INFLUENCING'}</p>
          </div>

          {/* Star rating */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Your Rating</label>
            <StarPicker value={form.rating} onChange={v => up('rating', v)} size={9}/>
            <p className={`text-sm mt-2 font-semibold ${form.rating >= 4 ? 'text-amber-500' : form.rating >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
              {LABELS[form.rating]}
            </p>
          </div>

          {/* Role & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Your Role / Title</label>
              <input value={form.role} onChange={e => up('role', e.target.value)}
                placeholder="e.g. Marketing Manager, Student, Founder"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                }`}/>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Category</label>
              <select value={form.category} onChange={e => up('category', e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Your Review</label>
            <textarea rows={5} required value={form.comment} onChange={e => up('comment', e.target.value)}
              placeholder="What was your experience? What did you learn? How has it impacted you? (min. 20 characters)"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 resize-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
              }`}/>
            <p className={`text-xs mt-1 ${form.comment.length < 20 ? (isLight ? 'text-slate-500' : 'text-slate-600') : 'text-green-500 font-bold'}`}>
              {form.comment.length} chars {form.comment.length < 20 && `(need ${20 - form.comment.length} more)`}
            </p>
          </div>

          <button type="submit" disabled={loading || form.comment.length < 20}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md">
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
