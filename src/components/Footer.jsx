import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Heart, GraduationCap, ArrowRight, Sparkles, Brain, Clapperboard, FileText } from 'lucide-react';
import Logo from './Logo';
import { getCourseDetails } from '../data/adminData';
import LegalModal from './LegalModal';

export default function Footer({ onOpenCheckout }) {
  const details = getCourseDetails();
  const [legalModalTab, setLegalModalTab] = useState(null);

  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 pt-16 pb-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
              className="inline-block"
            >
              <Logo className="h-8 sm:h-9" />
            </a>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-widest">
              <Clapperboard className="w-3.5 h-3.5" /> Mentalist Sravan Production
            </div>

            <p className="text-slate-300 max-w-md leading-relaxed text-xs sm:text-sm font-medium">
              An integrated production house for cognitive experiments, behavioral engineering, non-verbal communication, and high-impact psychological influence.
            </p>

            <p className="text-slate-500 italic text-xs border-l-2 border-amber-500/40 pl-3">
              "{details.footerQuote || 'Your influence is your currency. Invest in it daily. TH3ORY is your blueprint.'}"
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-2">
              <button 
                onClick={() => setLegalModalTab('refund')} 
                className="flex items-center gap-1.5 text-green-400 text-xs font-semibold hover:underline cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> 14-Day 100% Money-Back Guarantee
              </button>
              <button 
                onClick={() => setLegalModalTab('privacy')} 
                className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold hover:underline cursor-pointer"
              >
                <Lock className="w-4 h-4" /> 256-Bit SSL Checkout
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Navigation &amp; Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://rzp.io/rzp/th3orylaunch" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors text-red-500 font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  🔥 Founding Launch (₹499 Special) →
                </a>
              </li>
              <li><a href="#pillars" className="hover:text-amber-400 transition-colors">5 Pillars of Influence</a></li>
              <li><a href="#roadmap" className="hover:text-amber-400 transition-colors">30-Day Level Roadmap</a></li>
              <li><a href="#outcomes" className="hover:text-amber-400 transition-colors">Outcomes &amp; Bonuses</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing &amp; Plans</a></li>
              <li>
                <a 
                  href="#masterclass" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'masterclass'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-[#7C5CFC] transition-colors text-[#E9E4FF] font-semibold cursor-pointer"
                >
                  30-Day Masterclass Deep-Dive →
                </a>
              </li>
              <li>
                <a 
                  href="#affiliate" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'affiliate'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-[#10B981] transition-colors text-[#10B981] font-semibold cursor-pointer"
                >
                  Affiliate Partner Network →
                </a>
              </li>
              <li>
                <a 
                  href="#colleges" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'colleges'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-[#60A5FA] transition-colors text-[#60A5FA] font-semibold cursor-pointer"
                >
                  College &amp; University Workshops →
                </a>
              </li>
              <li>
                <a 
                  href="#ambassador" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'ambassador'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-purple-400 transition-colors text-purple-300 font-semibold cursor-pointer"
                >
                  Campus Ambassador Program →
                </a>
              </li>
              <li>
                <a 
                  href="#enterprise" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'enterprise'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-amber-400 transition-colors text-amber-300 font-semibold cursor-pointer"
                >
                  Enterprise Programs →
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'privacy'; window.dispatchEvent(new Event('hashchange')); }} 
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer font-semibold text-emerald-400"
                >
                  Privacy Policy &amp; Data Rights →
                </a>
              </li>
              <li><button onClick={() => setLegalModalTab('terms')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => setLegalModalTab('refund')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">Refund Policy</button></li>
              <li className="pt-2 border-t border-slate-900">
                <a
                  href="#student"
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5"/> Student Portal →
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Gateways & Production Badge */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Production &amp; Checkout</h4>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-amber-400" /> Stripe, Razorpay, PayPal, UPI
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Direct cognitive experiment enrollment powered by Mentalist Sravan Production with automated access generation.
              </p>
              <button
                onClick={() => { window.location.hash = 'enroll'; window.dispatchEvent(new Event('hashchange')); }}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Enroll Now ($149 / ₹11,999)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Mentalist Sravan Production. All rights reserved. TH3ORY Masterclass of Influencing.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#privacy"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'privacy'; window.dispatchEvent(new Event('hashchange')); }}
              className="hover:text-amber-400 transition-colors cursor-pointer text-slate-300 font-semibold"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <button onClick={() => setLegalModalTab('terms')} className="hover:text-amber-400 transition-colors cursor-pointer">Terms</button>
            <span>•</span>
            <button onClick={() => setLegalModalTab('refund')} className="hover:text-amber-400 transition-colors cursor-pointer">Refunds</button>
            <span>•</span>
            <a
              href="#student"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Student Login
            </a>
            <span>•</span>
            <a
              href="#team"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'team'; window.dispatchEvent(new Event('hashchange')); }}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Team Access
            </a>
          </div>
        </div>

      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={Boolean(legalModalTab)}
        onClose={() => setLegalModalTab(null)}
        initialTab={legalModalTab || 'privacy'}
      />
    </footer>
  );
}

