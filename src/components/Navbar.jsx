import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ onOpenCheckout, onOpenDashboard, isEnrolled }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-panel py-3 shadow-2xl border-b border-amber-500/20' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Official TH3ORY Logo Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <Logo className="h-7 sm:h-9" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#pillars" className="hover:text-amber-400 transition-colors">5 Pillars</a>
            <a href="#roadmap" className="hover:text-amber-400 transition-colors">30-Day Roadmap</a>
            <a href="#structure" className="hover:text-amber-400 transition-colors">Structure</a>
            <a href="#outcomes" className="hover:text-amber-400 transition-colors">Outcomes & Bonuses</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {isEnrolled ? (
              <button
                onClick={onOpenDashboard}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-xs uppercase tracking-wider hover:bg-amber-500/25 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                My Dashboard
              </button>
            ) : null}

            <button
              onClick={() => onOpenCheckout()}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-amber-400 border border-amber-500/30"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-800 glass-card rounded-2xl p-5 flex flex-col gap-4 text-slate-200 text-sm font-bold uppercase tracking-wider">
            <a href="#pillars" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400">5 Pillars</a>
            <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400">30-Day Roadmap</a>
            <a href="#structure" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400">Structure</a>
            <a href="#outcomes" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400">Outcomes & Bonuses</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400">Pricing</a>
            
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
              {isEnrolled && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                  className="w-full py-3 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> My Learning Dashboard
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-center shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> {isEnrolled ? 'View Receipt' : 'Start Journey ($299)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
