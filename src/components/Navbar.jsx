import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingBag, ArrowRight, LogIn, Sun, Moon, Building2, Award, Flame, Menu, X, Users } from 'lucide-react';
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
      scrolled ? 'glass-specular shadow-2xl border-b border-[#E9E4FF]/20 backdrop-blur-xl' : 'bg-[#15171A]/95 backdrop-blur-lg border-b border-[#E9E4FF]/10'
    }`}>
      {/* Top Real-Time Launch Countdown & Early Bird Banner */}
      <LaunchCountdownBanner onOpenCheckout={onOpenCheckout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Official TH3ORY Logo Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavClick(''); }}
            className="flex items-center gap-3 group shrink-0 focus:outline-hidden"
            aria-label="TH3ORY Masterclass Home"
          >
            <Logo className="h-7 sm:h-9 transition-transform group-hover:scale-[1.02]" />
          </a>

          {/* Desktop Navigation Capsule */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5">
            {/* Light/Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all shrink-0 cursor-pointer hover:border-amber-400/40"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Founding Launch Special Link */}
            <a
              href="https://rzp.io/rzp/th3orylaunch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-[11px] xl:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer shrink-0 border border-red-400/40 animate-pulse"
            >
              <Flame className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>Launch ₹499</span>
            </a>

            {/* Campus Ambassador Program Link */}
            <a
              href="#ambassador"
              onClick={(e) => { e.preventDefault(); handleNavClick('ambassador'); }}
              className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] xl:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 hover:border-purple-400/60 hover:text-purple-200"
            >
              <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Ambassadors</span>
            </a>

            {/* Enterprise Page Option */}
            <a
              href="#enterprise"
              onClick={(e) => { e.preventDefault(); handleNavClick('enterprise'); }}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] xl:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 hover:border-amber-400/60 hover:text-amber-200"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Enterprise</span>
            </a>

            {/* Private Community Wall */}
            <a
              href="#community"
              onClick={(e) => { e.preventDefault(); handleNavClick('community'); }}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] xl:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 hover:border-cyan-400/60 hover:text-cyan-200"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Community</span>
            </a>

            {/* Sign In Button */}
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); handleNavClick('student'); }}
              className="px-3 py-2 rounded-xl bg-[#0B0F19] hover:bg-[#15171A] text-[#E9E4FF] border border-[#7C5CFC]/40 text-[11px] xl:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 hover:border-[#7C5CFC] hover:text-[#FAFAF7]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
              <span>Sign In</span>
            </a>

            {isEnrolled && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                className="px-3.5 py-2 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-semibold text-[11px] xl:text-xs uppercase tracking-wider hover:bg-[#7C5CFC]/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFC857] shrink-0" />
                <span>My Dashboard</span>
              </button>
            )}

            {/* Start Your Journey / Checkout Button */}
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
              className="relative group overflow-hidden px-4 xl:px-5 py-2 rounded-xl btn-luxury-primary text-[11px] xl:text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>

          {/* Mobile Right Controls: Theme + CTA + Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/60 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle theme mode"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
              className="px-3 py-2 rounded-xl btn-luxury-primary text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer min-h-[40px]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Enroll</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0B0F19] text-[#FAFAF7] border border-[#E9E4FF]/20 hover:bg-[#15171A] transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-hidden"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FFC857]" /> : <Menu className="w-5 h-5 text-[#FAFAF7]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Slide-Down Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 sm:px-6 pb-4 animate-fade-in">
          <div className="glass-specular rounded-2xl p-4 sm:p-5 border border-[#E9E4FF]/20 space-y-3 shadow-2xl backdrop-blur-2xl">
            
            {/* Mobile Menu Brand Header */}
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-[#E9E4FF]/10">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavClick(''); }}
                className="flex items-center gap-2.5"
              >
                <Logo className="h-7" />
              </a>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC857] px-2.5 py-0.5 rounded-full bg-[#FFC857]/10 border border-[#FFC857]/20">
                Masterclass
              </span>
            </div>

            {/* VIP Special Link */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#555A66] px-1">Special Launch Access</span>
              <a
                href="https://rzp.io/rzp/th3orylaunch"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] p-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-red-600/30 border border-red-400/40"
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-white shrink-0" /> Launch Access Offer
                </span>
                <span className="bg-black/40 px-2 py-0.5 rounded-lg text-[11px] font-mono">₹499</span>
              </a>
            </div>

            {/* Portal Navigation Group */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#555A66] px-1">Portals &amp; Programs</span>
              
              <a
                href="#ambassador"
                onClick={(e) => { e.preventDefault(); handleNavClick('ambassador'); }}
                className="w-full min-h-[44px] p-3 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all hover:bg-purple-500/20"
              >
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Campus Ambassadors</span>
              </a>

              <a
                href="#enterprise"
                onClick={(e) => { e.preventDefault(); handleNavClick('enterprise'); }}
                className="w-full min-h-[44px] p-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all hover:bg-amber-500/20"
              >
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Enterprise &amp; Teams</span>
              </a>

              <a
                href="#community"
                onClick={(e) => { e.preventDefault(); handleNavClick('community'); }}
                className="w-full min-h-[44px] p-3 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all hover:bg-cyan-500/20"
              >
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Private Community Wall</span>
              </a>

              <a
                href="#student"
                onClick={(e) => { e.preventDefault(); handleNavClick('student'); }}
                className="w-full min-h-[44px] p-3 rounded-xl bg-[#0B0F19] text-[#E9E4FF] border border-[#7C5CFC]/40 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all hover:bg-[#15171A]"
              >
                <LogIn className="w-4 h-4 text-[#FFC857] shrink-0" />
                <span>Student Portal / Sign In</span>
              </a>
            </div>

            {/* Direct Enroll / Dashboard Actions */}
            <div className="pt-2 border-t border-[#E9E4FF]/10 space-y-2">
              {isEnrolled && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                  className="w-full min-h-[44px] p-3 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFC857] shrink-0" />
                  <span>View My Student Dashboard</span>
                </button>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
                className="w-full min-h-[48px] p-3.5 rounded-xl btn-luxury-primary text-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey Now'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

