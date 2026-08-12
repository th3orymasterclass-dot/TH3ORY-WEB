import React from 'react';
import { Sparkles, ShieldCheck, Lock, CreditCard, Heart } from 'lucide-react';
import { courseDetails } from '../data/courseData';

export default function Footer({ onOpenCheckout }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading text-white">NeuralAcademy</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              The premier interactive bootcamp for full-stack AI system engineering, autonomous multi-agent swarms, RAG architectures, and Stripe SaaS monetization.
            </p>
            <div className="flex items-center gap-4 text-slate-500 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> 14-Day 100% Money-Back Guarantee
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Lock className="w-4 h-4" /> 256-Bit SSL Checkout
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-heading">Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#curriculum" className="hover:text-indigo-400 transition-colors">Course Curriculum</a></li>
              <li><a href="#projects" className="hover:text-indigo-400 transition-colors">Capstone Projects</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing & Tiers</a></li>
              <li><a href="#reviews" className="hover:text-indigo-400 transition-colors">Student Reviews</a></li>
              <li><a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ & Support</a></li>
            </ul>
          </div>

          {/* Supported Gateways */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-heading">Payment Gateways</h4>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <CreditCard className="w-4 h-4 text-indigo-400" /> Stripe, PayPal, Apple Pay, UPI
              </div>
              <p className="text-[11px] text-slate-500">
                Instant enrollment processing with automated PDF invoice and student portal credential generation.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 NeuralAcademy Inc. All rights reserved. Dr. Alex Rivera AI Masterclass.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 mx-0.5" /> for modern creators and AI engineers.
          </div>
        </div>

      </div>
    </footer>
  );
}
