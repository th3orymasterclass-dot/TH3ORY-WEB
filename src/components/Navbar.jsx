import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingBag, ArrowRight, LogIn, Sun, Moon, Building2, Award, Flame, Menu, X } from 'lucide-react';
import Logo from './Logo';
import LaunchCountdownBanner from './LaunchCountdownBanner';

export default function Navbar({ onOpenCheckout, onOpenDashboard, isEnrolled }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleNavClick = (hash) => {
    setMobileMenuOpen(false);
    if (hash) {
      window.location.hash = hash;
      window.dispatchEvent(new Event('hashchange'));
    } else {
      window.location.hash = '';
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-panel shadow-2xl border-b border-[#E9E4FF]/15' : 'bg-[#15171A]/90 backdrop-blur-md border-b border-[#E9E4FF]/10'
    }`}>
      {/* Top Real-Time Launch Countdown & Early Bird Banner */}
      <LaunchCountdownBanner onOpenCheckout={onOpenCheckout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          
          {/* Official TH3ORY Logo Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavClick(''); }}
            className="flex items-center gap-3 group shrink-0"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
            {/* Light/Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all shrink-0 cursor-pointer"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Founding Launch Special Link */}
            <a
              href="https://rzp.io/rzp/th3orylaunch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer shrink-0 animate-pulse"
            >
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              <span>Launch ₹499</span>
            </a>

            {/* Campus Ambassador Program Link */}
            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); handleNavClick('ambassador'); }}
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Ambassadors</span>
            </a>

            {/* Enterprise Page Option */}
            <a
              href="#enterprise"
              onClick={(e) => { e.preventDefault(); handleNavClick('enterprise'); }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Enterprise</span>
            </a>

            {/* Sign In Button */}
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); handleNavClick('student'); }}
              className="px-3.5 py-2 rounded-xl bg-[#15171A] hover:bg-[#1a1d22] text-[#E9E4FF] border border-[#7C5CFC]/40 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Sign In</span>
            </a>

            {isEnrolled && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                className="px-4 py-2 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-semibold text-xs uppercase tracking-wider hover:bg-[#7C5CFC]/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFC857]" />
                <span>My Dashboard</span>
              </button>
            )}

            {/* Start Your Journey / Checkout Button */}
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
              className="relative group overflow-hidden px-4 xl:px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Right Controls: Theme + CTA + Mobile Hamburger Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all cursor-pointer"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-extrabold text-[11px] uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Enroll</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0B0F19] text-[#FAFAF7] border border-[#E9E4FF]/20 hover:bg-[#15171A] transition-all cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FFC857]" /> : <Menu className="w-5 h-5 text-[#FAFAF7]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Slide-Down Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 px-4 sm:px-6 animate-fade-in">
          <div className="glass-modal rounded-2xl p-5 border border-[#E9E4FF]/20 space-y-3 shadow-2xl">
            <a
              href="https://rzp.io/rzp/th3orylaunch"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 fill-white" /> Launch Access Offer
              </span>
              <span className="bg-black/30 px-2 py-0.5 rounded text-[11px]">₹499</span>
            </a>

            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); handleNavClick('ambassador'); }}
              className="w-full p-3 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>Campus Ambassadors</span>
            </a>

            <a
              href="#enterprise"
              onClick={(e) => { e.preventDefault(); handleNavClick('enterprise'); }}
              className="w-full p-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Enterprise &amp; Teams</span>
            </a>

            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); handleNavClick('student'); }}
              className="w-full p-3 rounded-xl bg-[#15171A] text-[#E9E4FF] border border-[#7C5CFC]/40 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#FFC857]" />
              <span>Student Portal / Sign In</span>
            </a>

            {isEnrolled && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                className="w-full p-3 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFC857]" />
                <span>View My Student Dashboard</span>
              </button>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/30 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey Now'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

