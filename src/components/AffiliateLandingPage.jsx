import React, { useState } from 'react';
import { 
  Share2, DollarSign, Award, ArrowRight, CheckCircle2, Send, Sparkles, 
  TrendingUp, Users, ShieldCheck, Gift, ChevronRight, Calculator, ArrowLeft, HelpCircle
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveAffiliateApplicationToSupabase } from '../services/supabaseService';

export default function AffiliateLandingPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'apply'
  const [monthlyReferrals, setMonthlyReferrals] = useState(15);
  const commissionPerEnrollment = 1800; // ₹1,800 per enrollment (15% of ₹12,000)

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    websiteOrChannel: '',
    audienceSize: '5,000 - 25,000',
    promotionStrategy: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const estimatedEarnings = monthlyReferrals * commissionPerEnrollment;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setErrorMsg('Please complete required fields (Name and Email).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await saveAffiliateApplicationToSupabase(form);
      setSubmittedAppId(res?.appId || `AFF-APP-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch {
      setSubmittedAppId(`AFF-APP-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] font-sans relative overflow-x-hidden">
      <SEOHead 
        title="Affiliate & Influencer Partner Network • TH3ORY Masterclass"
        description="Partner with TH3ORY Masterclass. Share flagship human influence & executive demeanor masterclasses with your audience and earn up to ₹1,800 cash commission per enrollment."
      />
      <StructuredData type="Course" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#E9E4FF]/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === 'apply' ? 'overview' : 'apply')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{activeTab === 'apply' ? 'View Partner Benefits' : 'Apply for Affiliate Network'}</span>
            </button>

            <button
              onClick={() => {
                if (onBack) onBack();
                else { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }
              }}
              className="px-3 py-2 rounded-xl glass-panel text-[#555A66] hover:text-[#FAFAF7] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Main Site</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C5CFC]/15 blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#FFC857]/30 text-[#FFC857] text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#FFC857]" />
            <span>Official Affiliate &amp; Creator Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-[#FAFAF7] uppercase tracking-tight leading-tight">
            MONETIZE YOUR AUDIENCE WITH <span className="text-gradient-violet">TH3ORY</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#FAFAF7]/80 font-serif-luxury italic leading-relaxed">
            Partner with the premier human influence, executive presence, and behavioral demeanor masterclass. Earn high-converting <strong className="text-[#FFC857]">₹1,800 commission per enrollment</strong> with automated weekly payouts.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('apply')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Join Partner Network</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {activeTab === 'overview' ? (
          <div className="space-y-16">

            {/* INTERACTIVE EARNINGS CALCULATOR CAROUSEL */}
            <div className="glass-panel p-8 rounded-3xl border border-[#7C5CFC]/30 space-y-6 bg-[#0B0F19]/90 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#555A66]/30 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#7C5CFC] uppercase tracking-wider">
                    <Calculator className="w-4 h-4 text-[#7C5CFC]" /> Interactive Revenue Projection
                  </div>
                  <h2 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase mt-1">Affiliate Earnings Simulator</h2>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#555A66] uppercase">Commission Rate</div>
                  <div className="text-lg font-bold text-[#10B981]">15% (₹1,800 / sale)</div>
                </div>
              </div>

              {/* Dynamic Slider */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#FAFAF7]">
                  <span>Monthly Student Referrals: <strong className="text-[#FFC857] text-lg font-mono">{monthlyReferrals}</strong></span>
                  <span className="text-xs text-[#555A66]">Drag slider to adjust</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={monthlyReferrals}
                  onChange={(e) => setMonthlyReferrals(Number(e.target.value))}
                  className="w-full h-3 bg-[#15171A] rounded-lg appearance-none cursor-pointer accent-[#7C5CFC]"
                />
              </div>

              {/* Calculator Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-center">
                <div className="p-4 rounded-2xl bg-[#15171A] border border-[#555A66]/30">
                  <div className="text-xs text-[#555A66] uppercase font-sans">Monthly Referrals</div>
                  <div className="text-2xl font-black text-[#FAFAF7] mt-1">{monthlyReferrals}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#15171A] border border-[#555A66]/30">
                  <div className="text-xs text-[#555A66] uppercase font-sans">Per Sale Commission</div>
                  <div className="text-2xl font-black text-[#10B981] mt-1">₹1,800</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC]/20 to-[#FFC857]/20 border border-[#FFC857]/40">
                  <div className="text-xs text-[#FFC857] uppercase font-sans font-bold">Estimated Monthly Payout</div>
                  <div className="text-3xl font-black text-[#FFC857] mt-1">₹{estimatedEarnings.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 4-STEP PARTNERSHIP WORKFLOW */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#FAFAF7] uppercase">How The Partner Program Works</h2>
                <p className="text-[#FAFAF7]/70 font-serif-luxury italic">Four seamless steps from application to automated weekly bank transfers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: "01", title: "Apply & Get Verified", desc: "Submit your channel or audience details. Quick 24-hour verification." },
                  { step: "02", title: "Receive Custom Links", desc: "Get unique referral URL + custom discount promo code for your followers." },
                  { step: "03", title: "Promote & Recommend", desc: "Share TH3ORY Masterclass via YouTube, LinkedIn, Instagram, or newsletter." },
                  { step: "04", title: "Weekly Bank Payouts", desc: "Track conversions in real-time and get automated weekly UPI/Bank payouts." }
                ].map((item, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-3xl border border-[#E9E4FF]/15 space-y-3 relative hover:border-[#7C5CFC] transition-all bg-[#0B0F19]/80">
                    <div className="text-3xl font-black font-mono text-[#7C5CFC]">{item.step}</div>
                    <h3 className="text-lg font-bold text-[#FAFAF7] font-heading">{item.title}</h3>
                    <p className="text-xs text-[#FAFAF7]/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MARKETING KIT PERKS & RESOURCES */}
            <div className="p-8 rounded-3xl bg-[#0B0F19] border border-[#555A66]/30 space-y-6">
              <h2 className="text-xl font-bold font-heading text-[#FAFAF7] uppercase flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#FFC857]" /> Turnkey Affiliate Marketing Kit Provided
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#FAFAF7]/80">
                <div className="p-4 rounded-2xl bg-[#15171A] border border-[#E9E4FF]/10 space-y-2">
                  <strong className="text-[#FAFAF7] block text-sm font-heading">🎨 High-Res Banners &amp; Social Assets</strong>
                  <p>Ready-to-use story templates, carousel graphics, and banner ads optimized for LinkedIn, Instagram, and web.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#15171A] border border-[#E9E4FF]/10 space-y-2">
                  <strong className="text-[#FAFAF7] block text-sm font-heading">📝 Email &amp; Newsletter Copies</strong>
                  <p>High-converting email sequences written by top copywriters to introduce TH3ORY to your subscribers.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#15171A] border border-[#E9E4FF]/10 space-y-2">
                  <strong className="text-[#FAFAF7] block text-sm font-heading">🏷️ Exclusive Custom Promo Code</strong>
                  <p>Offer your audience an exclusive 10% OFF discount code tied specifically to your partner account.</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* INTAKE FORM TAB */
          <div className="max-w-2xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-[#7C5CFC]/40 space-y-8 bg-[#0B0F19]/90 shadow-2xl">
            {submittedAppId ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase">APPLICATION SUBMITTED!</h2>
                <p className="text-sm text-[#FAFAF7]/80 leading-relaxed max-w-md mx-auto">
                  Thank you for applying to the TH3ORY Partner Network. Your application reference ID is:
                </p>
                <div className="inline-block bg-[#15171A] px-6 py-3 rounded-2xl border border-[#7C5CFC]/40 font-mono font-bold text-lg text-[#FFC857]">
                  {submittedAppId}
                </div>
                <p className="text-xs text-[#555A66]">Our team will review your application within 24 hours and send your custom affiliate links over email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2 border-b border-[#555A66]/30 pb-6">
                  <h2 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase">BECOME A TH3ORY AFFILIATE</h2>
                  <p className="text-xs text-[#FAFAF7]/70 font-serif-luxury italic">Fill in your details to get your verified partner link and custom promo code.</p>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Phone / WhatsApp</label>
                    <input 
                      type="tel" 
                      value={form.phone} 
                      onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Audience Size</label>
                    <select 
                      value={form.audienceSize} 
                      onChange={e => setForm({...form, audienceSize: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                    >
                      <option value="1,000 - 5,000">1,000 - 5,000 Followers</option>
                      <option value="5,000 - 25,000">5,000 - 25,000 Followers</option>
                      <option value="25,000 - 100,000">25,000 - 100,000 Followers</option>
                      <option value="100,000+">100,000+ Followers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Website, YouTube Channel, or Social Profile URL</label>
                  <input 
                    type="url" 
                    value={form.websiteOrChannel} 
                    onChange={e => setForm({...form, websiteOrChannel: e.target.value})}
                    placeholder="https://youtube.com/@channel or instagram.com/handle"
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">How do you plan to promote TH3ORY?</label>
                  <textarea 
                    rows={3}
                    value={form.promotionStrategy} 
                    onChange={e => setForm({...form, promotionStrategy: e.target.value})}
                    placeholder="E.g., Dedicating a YouTube video segment, Instagram Stories, LinkedIn posts..."
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Submitting Application...' : 'Submit Partner Application →'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
