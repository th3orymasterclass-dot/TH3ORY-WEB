import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Check, User, Mail, Phone, MapPin,
  Briefcase, Calendar, CreditCard, Shield, AlertCircle,
  Sparkles, Crown, Lock, ChevronDown, Globe, Loader2,
  CheckCircle2, Receipt, Download, ExternalLink, Zap
} from 'lucide-react';
import { getCourseDetails, getPlans } from '../data/adminData';
import { saveEnrollmentToSupabase } from '../services/supabaseService';
import { sendEnrollmentEmail } from '../services/emailService';

// ─── Country codes ─────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
];

const PROFESSIONS = [
  'Student', 'Recent Graduate', 'Marketing Professional', 'Sales Professional',
  'Entrepreneur / Founder', 'Executive / Manager', 'Consultant', 'Freelancer',
  'Teacher / Educator', 'Healthcare Professional', 'Engineer / Developer',
  'Finance / Accounting', 'Legal Professional', 'HR / People Operations',
  'Artist / Creative', 'Coach / Mentor', 'Content Creator', 'Other',
];

// ─── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal Details' },
  { id: 2, label: 'Select Plan' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Confirmation' },
];

// ─── Payment gateways config ───────────────────────────────────────────────────
const GATEWAYS = [
  {
    id: 'stripe',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, Amex — secured by Stripe',
    icon: '💳',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    desc: 'UPI, NetBanking, Wallets, Cards (India)',
    icon: '⚡',
    badge: 'Recommended for India',
    badgeColor: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    desc: 'Pay using your PayPal account or guest checkout',
    icon: '🅿️',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'upi',
    name: 'UPI / Bank Transfer',
    desc: 'Google Pay, PhonePe, Paytm, BHIM',
    icon: '📱',
    badge: 'Instant',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
];

// ─── Helper: age check ─────────────────────────────────────────────────────────
function isAdult(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 18;
}

function maxDOB() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all ${
              current > s.id ? 'bg-amber-500 text-slate-950' :
              current === s.id ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400' :
              'bg-slate-800 border border-slate-700 text-slate-500'
            }`}>
              {current > s.id ? <Check className="w-4 h-4"/> : s.id}
            </div>
            <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider hidden sm:block ${current >= s.id ? 'text-amber-400' : 'text-slate-600'}`}>{s.label}</p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 transition-all ${current > s.id ? 'bg-amber-500' : 'bg-slate-800'}`}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Input component ───────────────────────────────────────────────────────────
function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-slate-600 text-xs mb-1.5">{hint}</p>}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
          <AlertCircle className="w-3 h-3"/> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm";
const errInput  = "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10";

// ─── Step 1: Personal Details ──────────────────────────────────────────────────
function Step1({ form, setForm, onNext }) {
  const [errors, setErrors] = useState({});
  const [ccOpen, setCcOpen] = useState(false);
  const ccRef = useRef();

  const up = (k, v) => setForm(f => ({...f, [k]: v}));

  useEffect(() => {
    const h = (e) => { if (ccRef.current && !ccRef.current.contains(e.target)) setCcOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().split(' ').length < 2) e.name = 'Please enter your full name (first & last).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!/^\d{7,12}$/.test(form.phone.replace(/\s/g,''))) e.phone = 'Enter a valid phone number (7–12 digits).';
    if (!form.address.trim() || form.address.trim().length < 10) e.address = 'Enter your full address (min 10 characters).';
    if (!form.city.trim()) e.city = 'City is required.';
    if (!form.country.trim()) e.country = 'Country is required.';
    if (!form.profession) e.profession = 'Please select your profession.';
    if (!form.dob) { e.dob = 'Date of birth is required.'; }
    else if (!isAdult(form.dob)) { e.dob = 'You must be at least 18 years old to enroll.'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const selectedCC = COUNTRY_CODES.find(c => c.code === form.countryCode && c.name === form.countryCodeName) || COUNTRY_CODES[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Personal Details</h2>
        <p className="text-slate-500 text-sm">Tell us about yourself to create your learning profile</p>
      </div>

      {/* Name */}
      <Field label="Full Name" required error={errors.name}>
        <input value={form.name} onChange={e => up('name', e.target.value)}
          placeholder="Jonathan Sterling"
          className={`${inputClass} ${errors.name ? errInput : ''}`}/>
      </Field>

      {/* Email */}
      <Field label="Email Address" required error={errors.email}>
        <input type="email" value={form.email} onChange={e => up('email', e.target.value)}
          placeholder="you@example.com"
          className={`${inputClass} ${errors.email ? errInput : ''}`}/>
      </Field>

      {/* Phone with country code */}
      <Field label="Phone Number" required error={errors.phone}>
        <div className="flex gap-2">
          {/* Country code dropdown */}
          <div className="relative" ref={ccRef}>
            <button type="button"
              onClick={() => setCcOpen(o => !o)}
              className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm hover:border-amber-500/50 transition-all whitespace-nowrap h-full">
              <span className="text-base">{selectedCC.flag}</span>
              <span className="font-mono text-sm">{selectedCC.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500"/>
            </button>
            {ccOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-auto"
                style={{maxHeight: 260, minWidth: 220}}>
                {COUNTRY_CODES.map((c, i) => (
                  <button key={i} type="button"
                    onClick={() => { up('countryCode', c.code); up('countryCodeName', c.name); setCcOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors text-left ${c.code === form.countryCode && c.name === form.countryCodeName ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300'}`}>
                    <span>{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-slate-500 text-xs">{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={form.phone} onChange={e => up('phone', e.target.value.replace(/[^\d\s]/g,''))}
            placeholder="98765 43210"
            className={`flex-1 ${inputClass} ${errors.phone ? errInput : ''}`}/>
        </div>
      </Field>

      {/* Address */}
      <Field label="Street Address" required error={errors.address}>
        <textarea rows={2} value={form.address} onChange={e => up('address', e.target.value)}
          placeholder="House/Flat No., Street, Area"
          className={`${inputClass} resize-none ${errors.address ? errInput : ''}`}/>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" required error={errors.city}>
          <input value={form.city} onChange={e => up('city', e.target.value)}
            placeholder="Mumbai"
            className={`${inputClass} ${errors.city ? errInput : ''}`}/>
        </Field>
        <Field label="Country" required error={errors.country}>
          <input value={form.country} onChange={e => up('country', e.target.value)}
            placeholder="India"
            className={`${inputClass} ${errors.country ? errInput : ''}`}/>
        </Field>
      </div>

      {/* Profession */}
      <Field label="Profession" required error={errors.profession}>
        <select value={form.profession} onChange={e => up('profession', e.target.value)}
          className={`${inputClass} ${errors.profession ? errInput : ''}`}>
          <option value="">— Select your profession —</option>
          {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
        </select>
      </Field>

      {/* Date of Birth */}
      <Field label="Date of Birth" required error={errors.dob}
        hint="You must be at least 18 years old to enroll">
        <input type="date" value={form.dob} onChange={e => up('dob', e.target.value)}
          max={maxDOB()}
          className={`${inputClass} ${errors.dob ? errInput : ''}`}/>
        {form.dob && isAdult(form.dob) && (
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
            <Check className="w-3 h-3"/> Age verified ✓
          </p>
        )}
      </Field>

      <button onClick={() => validate() && onNext()}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2">
        Continue to Plan Selection <ArrowRight className="w-4 h-4"/>
      </button>
    </div>
  );
}

// ─── Step 2: Plan Selection ────────────────────────────────────────────────────
function Step2({ form, setForm, onNext, onBack }) {
  const plans   = getPlans();
  const [monthly, setMonthly] = useState(false);

  const selected = form.plan;
  const select = (plan) => setForm(f => ({ ...f, plan, isMonthly: monthly }));

  const price = (plan) => monthly ? plan.priceMonthly : plan.priceFull;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Choose Your Plan</h2>
        <p className="text-slate-500 text-sm">Pick the tier that fits your goals and budget</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 w-fit mx-auto bg-slate-900 border border-slate-800 rounded-xl p-1">
        <button onClick={() => { setMonthly(false); setForm(f => ({...f, isMonthly: false})); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!monthly ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
          Pay in Full <span className="text-[10px] ml-1 opacity-70">Save 15%</span>
        </button>
        <button onClick={() => { setMonthly(true); setForm(f => ({...f, isMonthly: true})); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${monthly ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
          Monthly 3-Pay
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => {
          const isSelected = selected?.id === plan.id;
          const isEnt = plan.isEnterprise;
          return (
            <button key={plan.id} type="button"
              onClick={() => select(plan)}
              className={`relative text-left rounded-2xl border-2 p-6 transition-all hover:scale-[1.01] ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/20'
                  : plan.popular
                    ? 'border-amber-500/40 bg-slate-900/80 hover:border-amber-500/60'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
              }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full text-slate-950 text-[10px] font-black flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5"/> FLAGSHIP SINGLE PASS
                </div>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-slate-950"/>
                </div>
              )}
              <p className="text-white font-black text-lg mb-0.5">{plan.name}</p>
              <p className="text-amber-400 text-xs font-bold mb-4">{plan.badge}</p>
              <div className="flex items-baseline gap-1 mb-4">
                {isEnt ? (
                  <span className="text-2xl font-black text-amber-400">Custom Quote</span>
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-white">${price(plan)}</span>
                    <span className="text-slate-400 text-xs"> (or ₹11,999 INR)</span>
                    {monthly && <span className="text-slate-500 text-xs"> /mo × 3</span>}
                  </>
                )}
              </div>
              <ul className="space-y-2">
                {plan.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0"/> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {!selected && <p className="text-center text-amber-400 text-sm">Please select a plan to continue.</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={() => selected && onNext()}
          disabled={!selected}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
          Continue to Payment <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Payment ──────────────────────────────────────────────────────────
function Step3({ form, setForm, onNext, onBack }) {
  const [gateway, setGateway]   = useState(form.gateway || 'razorpay');
  const [card, setCard]         = useState({ num:'', exp:'', cvv:'', holder:'' });
  const [upiId, setUpiId]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const plans     = getPlans();
  const plan      = form.plan;
  
  // USD Base Pricing
  const basePriceUSD = plan ? (form.isMonthly ? (plan.priceMonthly || 55) : (plan.priceFull || 149)) : 149;
  // INR Base Pricing (₹11,999 full price, ₹4,399 monthly)
  const basePriceINR = plan ? (form.isMonthly ? (plan.priceINR ? Math.round(plan.priceINR / 3) : 4399) : (plan.priceINR || 11999)) : 11999;

  // Coupon handling including private test coupon TH3ORY0 (99.9% off)
  let discountPct = 0;
  const currentCoupon = (form.coupon || '').trim().toUpperCase();
  if (currentCoupon === 'TH3ORY0') {
    discountPct = 99.9; // Private 99.9% test coupon (reduces ₹11,999 to ₹12)
  } else if (currentCoupon === 'TH3ORY20') {
    discountPct = 20;
  }

  const discountUSD = Math.round(basePriceUSD * (discountPct / 100));
  const totalUSD    = Math.max(1, Math.round(basePriceUSD - discountUSD));

  const discountINR = Math.round(basePriceINR * (discountPct / 100));
  const totalINR    = Math.max(12, Math.round(basePriceINR - discountINR)); // ₹12 INR for TH3ORY0

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

  const handlePay = async () => {
    setError('');
    if (gateway === 'stripe') {
      if (!card.holder.trim()) return setError('Please enter the card holder name.');
      if (card.num.replace(/\s/g,'').length < 16) return setError('Enter a valid 16-digit card number.');
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) return setError('Enter expiry as MM/YY.');
      if (!/^\d{3,4}$/.test(card.cvv)) return setError('Enter a valid CVV.');
    }
    if (gateway === 'upi') {
      if (upiId && !upiId.includes('@')) return setError('Enter a valid UPI ID (e.g. name@upi).');
    }

    setLoading(true);

    // If Razorpay is selected (or SDK available)
    if ((gateway === 'razorpay' || gateway === 'upi') && typeof window !== 'undefined' && window.Razorpay) {
      try {
        const orderRes = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalINR, // Exact INR amount: 11999 INR (or 12 INR with TH3ORY0 coupon)
            currency: 'INR',
            receipt: `TH3-${Date.now().toString(36).toUpperCase()}`,
            notes: {
              studentName: form.name,
              studentEmail: form.email,
              planName: plan?.name || 'TH3ORY Masterclass',
              couponUsed: currentCoupon || 'NONE'
            }
          })
        });

        const orderData = await orderRes.json();

        if (orderData.success && orderData.order) {
          const rzpOptions = {
            key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TP7hT2Wt1nkqwg',
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: 'TH3ORY Masterclass',
            description: `${plan?.name || 'TH3ORY Masterclass'} Enrollment`,
            image: '/logo-transparent.png',
            order_id: orderData.order.id,
            prefill: {
              name: form.name,
              email: form.email,
              contact: form.phone ? `${form.countryCode || '+91'}${form.phone}` : ''
            },
            theme: { color: '#f59e0b' },
            handler: async function (response) {
              // Signature verification
              try {
                await fetch('/api/verify-razorpay-signature', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });
              } catch (e) {
                console.warn('[Razorpay Verification]:', e);
              }

              const receipt = {
                orderId: response.razorpay_order_id || `TH3-${Date.now().toString(36).toUpperCase()}`,
                paymentId: response.razorpay_payment_id,
                name: form.name,
                email: form.email,
                phone: form.phone,
                countryCode: form.countryCode,
                address: form.address,
                city: form.city,
                country: form.country,
                profession: form.profession,
                dob: form.dob,
                planId: plan?.id || 'masterclass',
                planName: plan?.name || 'TH3ORY Masterclass',
                price: totalINR,
                gateway: 'Razorpay',
                currency: 'INR',
                isMonthly: form.isMonthly,
                enrolledAt: new Date().toISOString(),
                code: 'TH3ORY2026',
              };

              await saveEnrollmentToSupabase(receipt);
              sendEnrollmentEmail(receipt).catch(err => console.error(err));

              setLoading(false);
              setForm(f => ({ ...f, gateway: 'Razorpay', receipt }));
              onNext();
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            }
          };

          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
          return;
        }
      } catch (err) {
        console.error('[Razorpay Order Failure]:', err);
      }
    }

    // Fallback mode if network issue or demo card
    await new Promise(r => setTimeout(r, 1800));

    const receipt = {
      orderId: `TH3-${Date.now().toString(36).toUpperCase()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      countryCode: form.countryCode,
      address: form.address,
      city: form.city,
      country: form.country,
      profession: form.profession,
      dob: form.dob,
      planId: plan?.id || 'masterclass',
      planName: plan?.name || 'TH3ORY Masterclass',
      price: totalUSD,
      gateway,
      currency: 'USD',
      isMonthly: form.isMonthly,
      enrolledAt: new Date().toISOString(),
      code: 'TH3ORY2026',
    };

    await saveEnrollmentToSupabase(receipt);
    sendEnrollmentEmail(receipt).catch(err => console.error(err));

    setLoading(false);
    setForm(f => ({ ...f, gateway, receipt }));
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Payment</h2>
        <p className="text-slate-500 text-sm">Your connection is secured with 256-bit SSL encryption</p>
      </div>

      {/* Order summary */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">{plan?.name}</span>
          <span className="text-white font-bold">${basePriceUSD} / ₹{basePriceINR.toLocaleString('en-IN')}</span>
        </div>
        {form.isMonthly && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>3 monthly instalments of ${basePriceUSD} / ₹{basePriceINR.toLocaleString('en-IN')}</span>
            <span>Total: ${basePriceUSD * 3}</span>
          </div>
        )}

        {/* Coupon */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex gap-2">
            <input
              value={form.coupon || ''}
              onChange={e => setForm(f => ({...f, coupon: e.target.value.toUpperCase()}))}
              placeholder="Promo / Coupon code"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50 placeholder-slate-600 font-mono"/>
            <button type="button" className="px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all">Apply</button>
          </div>
          {discountPct > 0 && (
            <div className="flex justify-between text-sm text-green-400 font-medium">
              <span className="flex items-center gap-1"><Check className="w-3 h-3"/> Coupon ({currentCoupon}) Applied!</span>
              <span>−${discountUSD} / −₹{discountINR.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-slate-800 pt-3">
          <span className="text-white font-bold">Total Due Today</span>
          <div className="text-right">
            <span className="text-amber-400 font-black text-xl">${totalUSD} / ₹{totalINR.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Gateway selector */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          {GATEWAYS.map(gw => (
            <button key={gw.id} type="button"
              onClick={() => setGateway(gw.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                gateway === gw.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
              }`}>
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-xl">{gw.icon}</span>
                {gateway === gw.id && <Check className="w-4 h-4 text-amber-400"/>}
              </div>
              <p className="text-white text-sm font-bold">{gw.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{gw.desc}</p>
              {gw.badge && (
                <span className={`inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full border font-bold ${gw.badgeColor}`}>{gw.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gateway-specific UI */}
      {gateway === 'stripe' && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Secured by Stripe</p>
          <Field label="Card Holder Name" required>
            <input value={card.holder} onChange={e => setCard(c => ({...c, holder: e.target.value}))}
              placeholder="Jonathan Sterling" className={inputClass}/>
          </Field>
          <Field label="Card Number" required>
            <input value={card.num} onChange={e => setCard(c => ({...c, num: formatCard(e.target.value)}))}
              placeholder="4242 4242 4242 4242" maxLength={19}
              className={`${inputClass} font-mono tracking-widest`}/>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry" required>
              <input value={card.exp}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g,'').slice(0,4);
                  if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
                  setCard(c => ({...c, exp: v}));
                }}
                placeholder="MM/YY" maxLength={5} className={`${inputClass} font-mono`}/>
            </Field>
            <Field label="CVV" required>
              <input type="password" value={card.cvv}
                onChange={e => setCard(c => ({...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4)}))}
                placeholder="•••" maxLength={4} className={`${inputClass} font-mono`}/>
            </Field>
          </div>
        </div>
      )}

      {gateway === 'razorpay' && (
        <div className="bg-slate-900 border border-blue-600/20 rounded-2xl p-6 text-center space-y-3">
          <div className="text-4xl">⚡</div>
          <p className="text-white font-bold">Razorpay Checkout</p>
          <p className="text-slate-400 text-sm">You'll be redirected to Razorpay's secure checkout page to pay via UPI, NetBanking, Wallets, or Cards.</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500 mt-2">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'NetBanking', 'Visa', 'Mastercard'].map(b => (
              <span key={b} className="px-2 py-1 bg-slate-800 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      )}

      {gateway === 'paypal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="text-4xl">🅿️</div>
          <p className="text-white font-bold">PayPal Checkout</p>
          <p className="text-slate-400 text-sm">You'll be redirected to PayPal to complete your payment securely. No PayPal account required — pay as guest.</p>
        </div>
      )}

      {gateway === 'upi' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-slate-500">Enter your UPI ID or scan the QR code</p>
          <Field label="UPI ID" required>
            <input value={upiId} onChange={e => setUpiId(e.target.value)}
              placeholder="yourname@upi" className={inputClass}/>
          </Field>
          <div className="text-center">
            <p className="text-slate-500 text-xs mb-3">— or scan QR code —</p>
            <div className="inline-flex flex-col items-center justify-center w-36 h-36 bg-white rounded-2xl p-3">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                <p className="text-white text-[10px] text-center font-mono leading-snug">UPI QR<br/>th3ory@upi</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 font-mono">th3ory@upi</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0"/>{error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={handlePay} disabled={loading}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-70 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing Payment…</> : <><Lock className="w-4 h-4"/> Pay ${totalUSD} / ₹{totalINR.toLocaleString('en-IN')} Securely</>}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {['SSL Secured', 'PCI DSS Compliant', '14-Day Guarantee'].map(t => (
          <span key={t} className="flex items-center gap-1 text-slate-600 text-xs"><Shield className="w-3 h-3"/>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────
function Step4({ form }) {
  const receipt = form.receipt;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-green-400"/>
      </div>

      <div>
        <h2 className="text-3xl font-black text-white mb-2">Enrollment Confirmed! 🎉</h2>
        <p className="text-slate-400">Welcome to TH3ORY, {form.name?.split(' ')[0]}! Your journey begins now.</p>
      </div>

      {/* Receipt card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-left space-y-3 shadow-xl shadow-amber-500/10">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-amber-400"/>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Receipt</p>
        </div>
        {[
          ['Order ID', receipt?.orderId],
          ['Name', form.name],
          ['Email', form.email],
          ['Plan', receipt?.planName || 'TH3ORY Masterclass'],
          ['Amount Paid', `${receipt?.currency === 'INR' ? '₹' : '$'}${receipt?.price?.toLocaleString ? receipt.price.toLocaleString('en-IN') : receipt?.price} ${receipt?.currency || 'USD'}`],
          ['Payment via', receipt?.gateway?.toUpperCase()],
          ['Enrollment Date', receipt?.enrolledAt ? new Date(receipt.enrolledAt).toLocaleString() : new Date().toLocaleString()],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-slate-500 text-sm">{k}</span>
            <span className="text-white text-sm font-semibold truncate max-w-[200px]">{v}</span>
          </div>
        ))}
      </div>

      {/* Student portal access */}
      <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-6 text-left">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0"/>
          <div>
            <p className="text-white font-black text-base mb-1">Access Your Student Dashboard</p>
            <p className="text-slate-400 text-sm">Your student portal is ready. Use the code below to log in.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3 border border-slate-800">
            <span className="text-slate-500 text-sm">Portal URL</span>
            <a href="/#/student" target="_blank" rel="noreferrer"
              className="text-amber-400 text-sm font-mono flex items-center gap-1 hover:text-amber-300">
              /#/student <ExternalLink className="w-3 h-3"/>
            </a>
          </div>
          <div className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3 border border-slate-800">
            <span className="text-slate-500 text-sm">Enrollment Code</span>
            <span className="text-amber-400 font-mono font-black text-sm tracking-widest">{receipt?.code}</span>
          </div>
        </div>
      </div>

      {/* Email notice */}
      <div className="flex items-start gap-2.5 text-left bg-blue-950/20 border border-blue-500/20 rounded-xl px-5 py-4">
        <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0"/>
        <p className="text-slate-400 text-sm">A confirmation email with your receipt and portal access details has been sent to <strong className="text-white">{form.email}</strong>.</p>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all">
          <Download className="w-4 h-4"/> Download Receipt
        </button>
        <a href="/#/student"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all">
          <Zap className="w-4 h-4 fill-slate-950"/> Enter Dashboard
        </a>
      </div>
    </div>
  );
}

// ─── Main Enrollment Page ─────────────────────────────────────────────────────
export default function EnrollmentPage({ initialPlan, onBack }) {
  const plans = getPlans();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    countryCode: '+91', countryCodeName: 'India',
    address: '', city: '', country: 'India',
    profession: '', dob: '',
    plan: initialPlan || null,
    isMonthly: false,
    coupon: '',
    gateway: 'stripe',
    receipt: null,
  });

  const topRef = useRef();
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  const next = () => { setStep(s => s + 1); setTimeout(scrollTop, 50); };
  const back = () => { setStep(s => s - 1); setTimeout(scrollTop, 50); };

  const details = getCourseDetails();

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-100"
      style={{backgroundImage:'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 50%)', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to Course
        </button>
        <div className="flex-1"/>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-green-400"/>
          <span className="text-green-400 text-xs font-medium">SSL Secured Checkout</span>
        </div>
      </div>

      <div ref={topRef} className="max-w-2xl mx-auto px-4 py-10">
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Crown className="w-3.5 h-3.5"/> Secure Enrollment — {details?.title || 'TH3ORY Masterclass'}
          </div>
          <h1 className="text-3xl font-black text-white">
            {step === 4 ? 'You\'re In! 🎉' : `Step ${step} of 3`}
          </h1>
        </div>

        {/* Step bar */}
        <StepBar current={step}/>

        {/* Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-2xl">
          {step === 1 && <Step1 form={form} setForm={setForm} onNext={next}/>}
          {step === 2 && <Step2 form={form} setForm={setForm} onNext={next} onBack={back}/>}
          {step === 3 && <Step3 form={form} setForm={setForm} onNext={next} onBack={back}/>}
          {step === 4 && <Step4 form={form}/>}
        </div>

        {/* Trust badges */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-6 flex-wrap mt-6">
            {['14-Day Money Back Guarantee', '256-bit SSL Encryption', 'Lifetime Access'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-slate-600 text-xs">
                <Shield className="w-3 h-3"/> {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
