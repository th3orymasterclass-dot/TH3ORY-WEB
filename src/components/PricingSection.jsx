import React, { useState } from 'react';
import { Tag, Check, Crown, ShieldCheck, ArrowRight, Building2, Globe2, Users, Sparkles, Send, X } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';
import { saveEnterpriseQuoteToSupabase } from '../services/supabaseService';
import { sendEnrollmentEmail } from '../services/emailService';

export default function PricingSection({ onSelectPlan, couponCode, setCouponCode, couponDiscount, setCouponDiscount }) {
  const { plans } = useTh3oryLive();
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'
  const [isMonthly, setIsMonthly] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponMsg, setCouponMsg] = useState(couponDiscount > 0 ? `${couponCode} applied (${couponDiscount}% OFF)` : '');

  // Enterprise Quote Modal State
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [entForm, setEntForm] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    audienceType: 'Students',
    pupilCount: '50-100',
    notes: ''
  });
  const [entLoading, setEntLoading] = useState(false);
  const [entSuccess, setEntSuccess] = useState(false);

  const applyCoupon = (e) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (clean === 'TH3ORY20' || clean === 'EARLYBIRD20' || clean === 'FUTURE10') {
      const discountPct = (clean === 'TH3ORY20' || clean === 'EARLYBIRD20') ? 20 : 10;
      setCouponDiscount(discountPct);
      setCouponCode(clean);
      setCouponMsg(`🎉 Code ${clean} applied! You get ${discountPct}% OFF.`);
    } else if (clean === '') {
      setCouponDiscount(0);
      setCouponCode('');
      setCouponMsg('');
    } else {
      setCouponMsg('❌ Invalid promo code. Try "TH3ORY20"');
    }
  };

  const handleEnterpriseSubmit = async (e) => {
    e.preventDefault();
    if (!entForm.orgName || !entForm.email) return;
    setEntLoading(true);

    await saveEnterpriseQuoteToSupabase(entForm);
    setEntLoading(false);
    setEntSuccess(true);
    setTimeout(() => {
      setEntSuccess(false);
      setShowEnterpriseModal(false);
    }, 3000);
  };

  return (
    <section id="pricing" className="py-24 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
            <Crown className="w-4 h-4" /> Transparent Pricing & Enterprise Access
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            CHOOSE YOUR <span className="text-gradient-gold">PASS</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Get single full access to the flagship 30-day masterclass, or request a custom enterprise quote for your pupils.
          </p>

          {/* Controls: Currency Switcher + Billing Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            
            {/* Currency Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg transition-all ${currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                🇺🇸 USD ($149)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg transition-all ${currency === 'INR' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                🇮🇳 INR (₹11,999)
              </button>
            </div>

            {/* Split Payment Switcher */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${!isMonthly ? 'text-white' : 'text-slate-400'}`}>
                One-Time Full
              </span>
              <button
                onClick={() => setIsMonthly(!isMonthly)}
                className="relative w-12 h-7 rounded-full bg-slate-900 p-1 border border-amber-500/30 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-transform ${isMonthly ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isMonthly ? 'text-white' : 'text-slate-400'}`}>
                3-Month Instalments
              </span>
            </div>

          </div>

          {/* Promo Coupon Bar */}
          <div className="max-w-md mx-auto pt-2">
            <form onSubmit={applyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Promo Code (Try 'TH3ORY20')"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors"
              >
                Apply
              </button>
            </form>
            {couponMsg && (
              <p className={`text-xs mt-2 font-medium ${couponDiscount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {couponMsg}
              </p>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {(plans || []).map((plan) => {
            const isEnt = plan.isEnterprise;
            
            // Currency calculation
            let displayPriceStr = '';
            let rawPrice = 0;

            if (!isEnt) {
              if (currency === 'INR') {
                rawPrice = isMonthly ? 4299 : 11999;
                const finalPrice = couponDiscount > 0 ? Math.round(rawPrice * (1 - couponDiscount / 100)) : rawPrice;
                displayPriceStr = `₹${finalPrice.toLocaleString('en-IN')}`;
              } else {
                rawPrice = isMonthly ? 55 : 149;
                const finalPrice = couponDiscount > 0 ? Math.round(rawPrice * (1 - couponDiscount / 100)) : rawPrice;
                displayPriceStr = `$${finalPrice}`;
              }
            }

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'glass-panel border-2 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02] z-10'
                    : 'glass-card border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" /> Flagship Single Pass
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 font-brand">{plan.badge}</div>
                  <h3 className="text-2xl font-bold font-brand text-white">{plan.name}</h3>

                  {/* Price Tag */}
                  <div className="my-6 min-h-[70px] flex flex-col justify-center">
                    {isEnt ? (
                      <div>
                        <span className="text-3xl sm:text-4xl font-extrabold font-brand text-amber-400">Custom Quote</span>
                        <p className="text-slate-400 text-xs mt-1">Tailored pricing for pupils (Students & Professionals)</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-extrabold font-brand text-white">{displayPriceStr}</span>
                          {couponDiscount > 0 && (
                            <span className="text-lg text-slate-500 line-through">
                              {currency === 'INR' ? `₹${rawPrice}` : `$${rawPrice}`}
                            </span>
                          )}
                          <span className="text-slate-400 text-xs font-semibold">
                            {isMonthly ? '/ month (3 mos)' : `one-time (${currency})`}
                          </span>
                        </div>
                        {couponDiscount > 0 && (
                          <span className="inline-block mt-1 text-xs font-bold text-emerald-400">
                            {couponDiscount}% Promo Discount Applied
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 my-6 text-xs sm:text-sm text-slate-300 border-t border-slate-900 pt-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action Button */}
                <div className="pt-6 border-t border-slate-800">
                  {isEnt ? (
                    <button
                      onClick={() => setShowEnterpriseModal(true)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Get Custom Quote for Pupils</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectPlan(plan, isMonthly)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Enroll in Masterclass ({displayPriceStr})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  
                  <p className="text-[11px] text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    {isEnt ? 'Instant Enterprise SLA & Bulk Support' : '14-Day 100% Money-Back Guarantee'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Enterprise Custom Quote Modal */}
      {showEnterpriseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowEnterpriseModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise & Team Quote</h3>
                <p className="text-slate-400 text-xs">For Colleges, Universities, Companies & Cohorts</p>
              </div>
            </div>

            {entSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 my-4">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-emerald-400 font-bold text-base">Quote Request Received!</h4>
                <p className="text-slate-300 text-xs">Our Enterprise Director will reach out to you within 24 hours with a custom proposal.</p>
              </div>
            ) : (
              <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Organization / School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University / Tech Corp"
                    value={entForm.orgName}
                    onChange={e => setEntForm({...entForm, orgName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={entForm.contactName}
                      onChange={e => setEntForm({...entForm, contactName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@org.com"
                      value={entForm.email}
                      onChange={e => setEntForm({...entForm, email: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Audience</label>
                    <select
                      value={entForm.audienceType}
                      onChange={e => setEntForm({...entForm, audienceType: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Students">Students / Pupils</option>
                      <option value="Professionals">Working Professionals</option>
                      <option value="Corporate Team">Corporate Executives</option>
                      <option value="Mixed Cohort">Mixed Cohort</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Pupils</label>
                    <select
                      value={entForm.pupilCount}
                      onChange={e => setEntForm({...entForm, pupilCount: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="10-50">10 – 50 Pupils</option>
                      <option value="50-100">50 – 100 Pupils</option>
                      <option value="100-500">100 – 500 Pupils</option>
                      <option value="500+">500+ Pupils (Campus License)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Additional Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Specific topics, preferred start date, or LMS integration needs..."
                    value={entForm.notes}
                    onChange={e => setEntForm({...entForm, notes: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={entLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{entLoading ? 'Submitting Request...' : 'Submit Custom Quote Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
