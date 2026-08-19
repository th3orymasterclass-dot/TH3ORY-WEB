import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Sparkles, Phone, MapPin, Globe, ShieldCheck } from 'lucide-react';
import { saveContactInquiryToSupabase, saveNewsletterSubscriberToSupabase } from '../services/supabaseService';

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* LEFT: Contact Message Form */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Send Us a Direct Message</h3>
                <p className="text-slate-400 text-xs">Mentalist Sravan Production Support Desk</p>
              </div>
            </div>

            {contactSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-fade-in my-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-emerald-300 font-bold text-base">Message Sent Successfully!</h4>
                <p className="text-slate-300 text-xs">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Inquiry Topic</label>
                  <select
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="General Inquiry">General Course Inquiry</option>
                    <option value="Enterprise Quote">Enterprise & Team Licensing</option>
                    <option value="Technical Support">Student Portal Support</option>
                    <option value="Media & Press">Media, Press & Speaking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your question or message here..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactLoading ? 'Sending Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Newsletter & Studio Details */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Newsletter Card */}
            <div className="glass-panel rounded-3xl p-8 border border-amber-500/30 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-brand">Cognitive Dispatch</h3>
                  <p className="text-amber-400 text-xs font-semibold">Weekly Behavioral Insights Newsletter</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Join 18,000+ leaders receiving Mentalist Sravan's weekly breakdown of micro-expressions, executive tonality, and high-impact influence breakdowns.
              </p>

              {newsletterSubscribed ? (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>You're subscribed! Welcome to the Cognitive Dispatch.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{newsletterLoading ? 'Subscribing...' : 'Subscribe Free'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Studio Info Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Mentalist Sravan Production</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Integrated Production House for Cognitive Experiments</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="mailto:team@th3ory.online?subject=Course%20Inquiry%20-%20TH3ORY%20Masterclass" className="hover:text-amber-400 font-mono font-bold text-amber-500 transition-colors">team@th3ory.online</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Encrypted Student Data & Direct Support</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
