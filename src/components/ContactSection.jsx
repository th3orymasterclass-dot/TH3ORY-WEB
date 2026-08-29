import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Sparkles, Phone, MapPin, Globe, ShieldCheck, Calendar } from 'lucide-react';
import { saveContactInquiryToSupabase, saveNewsletterSubscriberToSupabase } from '../services/supabaseService';
import CalendlyModal from './CalendlyModal';

export default function ContactSection() {
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Calendly Modal State
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactLoading(true);
    await saveContactInquiryToSupabase(contactForm);
    setContactLoading(false);
    setContactSuccess(true);
    setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    
    setTimeout(() => {
      setContactSuccess(false);
    }, 5000);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    await saveNewsletterSubscriberToSupabase(newsletterEmail, 'website_footer');
    setNewsletterLoading(false);
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <section id="contact" className="py-24 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
            <MessageSquare className="w-4 h-4" /> Get In Touch & Stay Connected
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            CONTACT US & <span className="text-gradient-gold">INSIGHTS</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Have questions about the masterclass, enterprise licensing, or research? Drop us a message or join our cognitive dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Studio Info Card */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mentalist Sravan Production</h3>
                <p className="text-amber-400 text-xs font-semibold">Cognitive Experiments & Behavioral Engineering</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              TH3ORY Masterclass of Influencing is an integrated production platform designed for high-impact behavioral influence, executive tonality, non-verbal communication, and psychological leverage.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Verified digital completion certificates and automated credentials verification desk.</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Global 24/7 multi-device student access portal with live database sync.</span>
              </div>
            </div>
          </div>

          {/* Right Support Guidance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Student Support</h3>
                  <p className="text-slate-400 text-xs">Direct Platform Guidance</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                For account verification, enrollment access, or certificate validation, sign in to the Student Portal or visit your dashboard.
              </p>

              <a
                href="#student"
                onClick={(e) => { e.preventDefault(); window.location.hash = 'student'; window.dispatchEvent(new Event('hashchange')); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Access Student Portal</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
