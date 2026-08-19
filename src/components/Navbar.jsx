import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingBag, Menu, X, ArrowRight, LogIn, Mail } from 'lucide-react';
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

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#FAFAF7]/80">
            <a href="#pillars" className="hover:text-[#7C5CFC] transition-colors">5 Pillars</a>
            <a href="#instructor" className="hover:text-[#7C5CFC] transition-colors">Instructor</a>
            <a href="#roadmap" className="hover:text-[#7C5CFC] transition-colors">30-Day Roadmap</a>
            <a href="#structure" className="hover:text-[#7C5CFC] transition-colors">Structure</a>
            <a href="#outcomes" className="hover:text-[#7C5CFC] transition-colors">Outcomes &amp; Bonuses</a>
            <a href="#pricing" className="hover:text-[#7C5CFC] transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-[#7C5CFC] transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#FFC857]" /> Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Sign In Button */}
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-4 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#1a1d22] text-[#E9E4FF] border border-[#7C5CFC]/40 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Sign In</span>
            </a>

            {isEnrolled ? (
              <button
                onClick={onOpenDashboard}
                className="px-4 py-2.5 rounded-xl bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30 font-semibold text-xs uppercase tracking-wider hover:bg-[#7C5CFC]/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFC857]" />
                My Dashboard
              </button>
            ) : null}

            <button
              onClick={() => onOpenCheckout()}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 hover:shadow-[#7C5CFC]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isEnrolled ? 'View Receipt' : 'Start Your Journey'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
              className="px-3 py-1.5 rounded-lg bg-[#15171A] text-[#FFC857] border border-[#7C5CFC]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#15171A] text-[#FFC857] border border-[#7C5CFC]/30"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#555A66]/30 glass-card rounded-2xl p-5 flex flex-col gap-4 text-[#FAFAF7] text-sm font-bold uppercase tracking-wider animate-fade-in">
            <a href="#pillars" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">5 Pillars</a>
            <a href="#instructor" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">Instructor</a>
            <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">30-Day Roadmap</a>
            <a href="#structure" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">Structure</a>
            <a href="#outcomes" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">Outcomes &amp; Bonuses</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">Pricing</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7C5CFC]">Contact Us</a>
            
            <div className="pt-2 border-t border-[#555A66]/30 flex flex-col gap-3">
              <a
                href="#student"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
                className="w-full py-3 rounded-xl bg-[#15171A] text-[#E9E4FF] border border-[#7C5CFC]/40 text-center font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#FFC857]" /> Student Sign In / Portal
              </a>

              {isEnrolled && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                  className="w-full py-3 rounded-xl bg-[#7C5CFC]/20 text-[#E9E4FF] font-semibold text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFC857]" /> My Learning Dashboard
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenCheckout(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-extrabold text-center shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> {isEnrolled ? 'View Receipt' : 'Start Journey ($149 / ₹11,999)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
