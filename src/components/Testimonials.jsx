import React, { useState } from 'react';
import { Star, MessageSquare, Quote, Sparkles } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function Testimonials() {
  const { reviews } = useTh3oryLive();
  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Career Switcher', 'Advanced Developer', 'Learner'];

  const filteredReviews = filterCategory === 'All'
    ? reviews
    : reviews.filter(r => r.category === filterCategory);

  return (
    <section id="reviews" className="py-24 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold uppercase tracking-wider border border-pink-500/20">
            <MessageSquare className="w-4 h-4" /> Verified Graduate Wall of Love
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Loved by <span className="text-gradient">14,000+ Engineers</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See how our graduates transitioned into AI engineering roles at top tech companies.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredReviews.map(rev => (
            <div
              key={rev.id}
              className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 relative group"
            >
              <Quote className="w-8 h-8 text-indigo-500/20 absolute top-6 right-6 group-hover:text-indigo-500/40 transition-colors" />

              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                  <p className="text-xs text-indigo-400">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
