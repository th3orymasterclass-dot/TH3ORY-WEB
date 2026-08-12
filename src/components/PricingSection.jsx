import React, { useState } from 'react';
import { Tag, Check, Crown, ShieldCheck, HelpCircle, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { pricingPlans } from '../data/courseData';

export default function PricingSection({ onSelectPlan, couponCode, setCouponCode, couponDiscount, setCouponDiscount }) {
  const [isMonthly, setIsMonthly] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponMsg, setCouponMsg] = useState(couponDiscount > 0 ? `${couponCode} applied (${couponDiscount}% OFF)` : '');

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

  return (
    <section id="pricing" className="py-24 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
            <Crown className="w-4 h-4" /> Investment in Your Personal Currency
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            SELECT YOUR <span className="text-gradient-gold">JOURNEY TIER</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Self-paced or live cohort – your journey, your way. All plans include 14-day 100% money-back guarantee.
          </p>

          {/* Billing Switcher (One-time vs Installment) */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-semibold ${!isMonthly ? 'text-white' : 'text-slate-400'}`}>
              One-Time Full Payment
            </span>
            <button
              onClick={() => setIsMonthly(!isMonthly)}
              className="relative w-14 h-8 rounded-full bg-slate-900 p-1 border border-amber-500/30 transition-colors"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-transform ${isMonthly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isMonthly ? 'text-white' : 'text-slate-400'}`}>
              3-Month Split Payment
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                0% Interest
              </span>
            </span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {pricingPlans.map((plan) => {
            const rawPrice = isMonthly ? plan.priceMonthly : plan.priceFull;
            const finalPrice = couponDiscount > 0 ? Math.round(rawPrice * (1 - couponDiscount / 100)) : rawPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'glass-panel border-2 border-amber-500 shadow-2xl shadow-amber-500/20 scale-105 z-10'
                    : 'glass-card border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" /> {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 font-brand">{plan.badge}</div>
                  <h3 className="text-2xl font-bold font-brand text-white">{plan.name}</h3>

                  {/* Price Tag */}
                  <div className="my-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold font-brand text-white">${finalPrice}</span>
                      {couponDiscount > 0 && (
                        <span className="text-lg text-slate-500 line-through">${rawPrice}</span>
                      )}
                      <span className="text-slate-400 text-xs font-semibold">{isMonthly ? '/ month (3 mos)' : 'one-time full access'}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <span className="inline-block mt-1 text-xs font-bold text-emerald-400">
                        {couponDiscount}% Promo Discount Applied
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 my-6 text-xs sm:text-sm text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 opacity-35">
                        <span className="w-4 h-4 text-slate-600 flex-shrink-0 text-center font-bold">✕</span>
                        <span className="line-through">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action Button */}
                <div className="pt-6 border-t border-slate-800">
                  <button
                    onClick={() => onSelectPlan(plan, isMonthly)}
                    className={`w-full py-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                    }`}
                  >
                    <span>Enroll in {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 14-Day 100% Money-Back Guarantee
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
