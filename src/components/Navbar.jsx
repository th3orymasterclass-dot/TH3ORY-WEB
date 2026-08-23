import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingBag, ArrowRight, LogIn, Sun, Moon, Building2 } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ onOpenCheckout, onOpenDashboard, isEnrolled }) {
  const [scrolled, setScrolled] = useState(false);
  const [themeMode, setThemeMode] = useState(() => (
    localStorage.getItem('th3ory_theme') || 'dark'
  ));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('th3ory_theme', next);
    window.dispatchEvent(new CustomEvent('th3ory_theme_change', { detail: next }));
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-panel py-3 shadow-2xl border-b border-[#E9E4FF]/15' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Official TH3ORY Logo Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          {/* Clean Action Buttons & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Light/Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all shrink-0 cursor-pointer"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Enterprise Quote Option */}
            <a
              href="#enterprise"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'enterprise'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Enterprise Quote</span>
            </a>

            {/* Sign In Button */}
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#15171A] hover:bg-[#1a1d22] text-[#E9E4FF] border border-[#7C5CFC]/40 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Sign In</span>
            </a>

            {isEnrolled && (
              <button
                onClick={onOpenDashboard}
                className="hidden sm:flex px-4 py-2.5 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-semibold text-xs uppercase tracking-wider hover:bg-[#7C5CFC]/25 transition-all items-center gap-2 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFC857]" />
                <span>My Dashboard</span>
              </button>
            )}

            {/* Start Your Journey / Checkout Button */}
            <button
              onClick={() => onOpenCheckout()}
              className="relative group overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform hidden sm:inline-block" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
