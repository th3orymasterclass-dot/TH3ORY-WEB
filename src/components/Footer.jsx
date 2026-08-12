import React from 'react';
import { ShieldCheck, Lock, CreditCard, Heart, GraduationCap, ArrowRight, Sparkles, Brain, Clapperboard } from 'lucide-react';
import Logo from './Logo';
import { getCourseDetails } from '../data/adminData';

export default function Footer({ onOpenCheckout }) {
  const details = getCourseDetails();

  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 pt-16 pb-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <a href="#" className="inline-block">
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
              <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> 14-Day 100% Money-Back Guarantee
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Lock className="w-4 h-4" /> 256-Bit SSL Checkout
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#pillars" className="hover:text-amber-400 transition-colors">5 Pillars of Influence</a></li>
              <li><a href="#roadmap" className="hover:text-amber-400 transition-colors">30-Day Level Roadmap</a></li>
              <li><a href="#outcomes" className="hover:text-amber-400 transition-colors">Outcomes & Bonuses</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing & Plans</a></li>
              <li><a href="#faq" className="hover:text-amber-400 transition-colors">FAQ & Support</a></li>
              <li className="pt-2 border-t border-slate-900">
                <a href="/#/student" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5"/> Student Portal →
                </a>
              </li>
              <li>
                <a href="/#/enroll" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5"/> Enrollment Page →
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Gateways & Production Badge */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Production & Checkout</h4>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-amber-400" /> Stripe, Razorpay, PayPal, UPI
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Direct cognitive experiment enrollment powered by Mentalist Sravan Production with automated access generation.
              </p>
              <button
                onClick={() => window.location.hash = '/enroll'}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Enroll Now ($299)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Mentalist Sravan Production. All rights reserved. TH3ORY Masterclass of Influencing.
          </div>
          <div className="flex items-center gap-3">
            <a href="/#/student" className="hover:text-amber-400 transition-colors">Student Login</a>
            <span>•</span>
            <a href="/#/admin-th3ory-x9k2" className="hover:text-amber-400 transition-colors">Admin Portal</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
