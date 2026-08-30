import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Layout, Sparkles, Flame, BookOpen, Target, 
  User, GraduationCap, Star, Tag, MessageSquare, HelpCircle, 
  ShoppingBag, Check, RotateCcw, ShieldCheck 
} from 'lucide-react';

export default function SectionVisibilityPanel({ data, save, reset, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  const currentVisibility = data?.sectionVisibility || {};

  const [visibility, setVisibility] = useState({
    hero: true,
    campaign: true,
    pillars: true,
    curriculum: true,
    outcomes: true,
    instructor: true,
    offlineTrainings: true,
    reviews: false,
    pricing: true,
    contact: true,
    faqs: true,
    quickEnrollmentBar: true,
    ...currentVisibility
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data?.sectionVisibility) {
      setVisibility(prev => ({ ...prev, ...data.sectionVisibility }));
    }
  }, [data?.sectionVisibility]);

  const toggle = (key) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    save('sectionVisibility', visibility);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all section visibility settings to defaults? (Reviews will remain disabled by default)')) {
      reset('sectionVisibility');
    }
  };

  const sections = [
    { key: 'hero', label: 'Hero & Branding Section', icon: Layout, desc: 'Top main banner, logo, 4 core stats, and primary enrollment CTA.' },
    { key: 'campaign', label: 'Founding Launch Campaign', icon: Flame, desc: 'Special limited-time launch offer banner (₹499 offer) & perks.' },
    { key: 'pillars', label: '5 Pillars & Differentiators', icon: Sparkles, desc: '5 Pillars of Influence, "Why TH3ORY Works", and target audiences.' },
    { key: 'curriculum', label: 'Curriculum & 30-Day Roadmap', icon: BookOpen, desc: '5 Levels, 50 daily lessons, capstones, and interactive lesson viewer.' },
    { key: 'outcomes', label: 'Core Outcomes & Bonuses', icon: Target, desc: '6 Transformation pillars, 4 bonus packages, and footer quote.' },
    { key: 'instructor', label: 'Instructor Spotlight (Sravan)', icon: User, desc: 'Lead Mentor bio, avatar, rating, credentials, and experience.' },
    { key: 'offlineTrainings', label: 'Previous Offline Trainings Marquee', icon: GraduationCap, desc: 'Horizontal infinite marquee showing live campus & institutional photos.' },
    { key: 'reviews', label: 'Reviews & Testimonials', icon: Star, desc: 'Student reviews and wall of love (currently disabled by request).' },
    { key: 'pricing', label: 'Pricing & Enrollment Plans', icon: Tag, desc: 'Pricing cards, feature lists, currency toggle, and coupon input.' },
    { key: 'contact', label: 'Contact & Insights Section', icon: MessageSquare, desc: 'Contact inquiry form, studio info, newsletter box, and support card.' },
    { key: 'faqs', label: 'Frequently Asked Questions', icon: HelpCircle, desc: 'Categorized accordion FAQs with instant answers.' },
    { key: 'quickEnrollmentBar', label: 'Sticky Bottom Quick Bar', icon: ShoppingBag, desc: 'Floating bottom enrollment bar with coupon code reminder.' }
  ];

  const activeCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layout className="w-3.5 h-3.5" /> Homepage Layout & Master Switches
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Section Visibility Control
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Instantly toggle any section ON or OFF on the public landing page with zero code deployment.
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Live!' : 'Save Visibility'}</span>
            </button>
          </div>
        </div>

        {/* Quick status pill */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Active Sections: <strong className="text-indigo-400 font-bold">{activeCount} of {sections.length}</strong>
          </span>
          <span className="text-amber-400 font-medium">
            ● Realtime sync active with public website
          </span>
        </div>
      </div>

      {/* Grid of section toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isVisible = visibility[sec.key] !== false;

          return (
            <div
              key={sec.key}
              onClick={() => toggle(sec.key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isVisible
                  ? isDark 
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                    : 'bg-white border-indigo-300 shadow-md'
                  : isDark
                    ? 'bg-slate-900/30 border-slate-800 opacity-60 hover:opacity-100'
                    : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isVisible
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    : isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-200 text-slate-400 border-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sec.label}
                    </h3>
                    {sec.key === 'reviews' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400 uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {sec.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(sec.key); }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isVisible ? 'bg-indigo-600' : isDark ? 'bg-slate-800' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isVisible}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isVisible ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
