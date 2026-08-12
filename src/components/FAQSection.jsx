import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';

export default function FAQSection() {
  const { faqs } = useTh3oryLive();
  const [openIdx, setOpenIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-24 relative bg-slate-950/80 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Everything You Need to <span className="text-gradient">Know</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Have questions about enrollment, payment gateways, or curriculum access? We have answers.
          </p>

          {/* Search Filter */}
          <div className="max-w-md mx-auto relative pt-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 translate-y-1" />
            <input
              type="text"
              placeholder="Search questions (e.g. payment, guarantee, certificate)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No matching questions found for "{searchQuery}".</p>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 bg-slate-900/40 hover:bg-slate-900/70 transition-colors"
                  >
                    <span className="text-base font-bold font-heading text-white flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        {faq.category}
                      </span>
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-white bg-indigo-600' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
