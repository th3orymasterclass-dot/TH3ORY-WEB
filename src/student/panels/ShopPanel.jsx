import React, { useState } from 'react';
import { ShoppingCart, Check, Tag, Sparkles, CreditCard, X, Star, Crown } from 'lucide-react';
import { getAddons, getPlans, getCourseDetails } from '../../data/adminData';

function AddonCard({ addon, onBuy }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`bg-slate-900 border ${hover ? 'border-amber-500/50' : 'border-slate-800'} rounded-2xl p-6 transition-all`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-white font-bold text-base leading-snug">{addon.name}</h3>
          <p className="text-slate-400 text-sm mt-1.5">{addon.description}</p>
        </div>
        <span className="shrink-0 text-2xl font-black text-amber-400">${addon.price}</span>
      </div>
      <button onClick={() => onBuy(addon)}
        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2">
        <ShoppingCart className="w-4 h-4"/> Add to Order
      </button>
    </div>
  );
}

function PlanUpgradeCard({ plan, currentPlan }) {
  const isCurrent = currentPlan === plan.name;
  const isHigher = !isCurrent;
  return (
    <div className={`relative bg-slate-900 border rounded-2xl p-6 transition-all ${plan.popular ? 'border-amber-500/50' : 'border-slate-800'}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full text-slate-950 text-xs font-black flex items-center gap-1">
          <Crown className="w-3 h-3"/> Most Popular
        </div>
      )}
      {isCurrent && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold">Your Plan</div>
      )}
      <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black text-white">${plan.priceFull}</span>
        <span className="text-slate-500 text-sm">full / or ${plan.priceMonthly}/mo</span>
      </div>
      <ul className="space-y-2 mb-5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0"/> {f}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <div className="w-full py-2.5 text-center text-green-400 border border-green-500/30 rounded-xl text-sm font-bold bg-green-500/10">
          ✓ Currently Enrolled
        </div>
      ) : (
        <button
          onClick={() => window.open('/', '_blank')}
          className={`w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${plan.popular ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'border border-slate-600 text-slate-300 hover:border-amber-500/50 hover:text-amber-400'}`}
        >
          Upgrade Plan →
        </button>
      )}
    </div>
  );
}

function CheckoutModal({ addon, onClose }) {
  const [step, setStep] = useState(1);
  const [card, setCard] = useState({ num: '', exp: '', cvv: '', name: '' });

  const handlePay = (e) => {
    e.preventDefault();
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-green-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-400"/>
          </div>
          <h3 className="text-white font-black text-xl mb-2">Order Confirmed!</h3>
          <p className="text-slate-400 text-sm mb-1">{addon.name}</p>
          <p className="text-slate-500 text-xs mb-6">A confirmation email will be sent to your registered address.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-bold">Complete Purchase</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Order summary */}
          <div className="bg-slate-950 rounded-xl p-4 flex justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{addon.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">Add-on</p>
            </div>
            <span className="text-amber-400 font-black text-xl">${addon.price}</span>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Name on Card</label>
              <input required value={card.name} onChange={e => setCard(c => ({...c, name: e.target.value}))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label>
              <input required maxLength={19} placeholder="4242 4242 4242 4242" value={card.num}
                onChange={e => setCard(c => ({...c, num: e.target.value.replace(/[^\d ]/g,'')}))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 font-mono"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiry</label>
                <input required placeholder="MM/YY" maxLength={5} value={card.exp}
                  onChange={e => setCard(c => ({...c, exp: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 font-mono"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">CVV</label>
                <input required type="password" maxLength={4} placeholder="•••" value={card.cvv}
                  onChange={e => setCard(c => ({...c, cvv: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 font-mono"/>
              </div>
            </div>
            <button type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              <CreditCard className="w-4 h-4"/> Pay ${addon.price}
            </button>
          </form>

          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <div className="w-3 h-3 border border-slate-600 rounded-sm flex items-center justify-center"><Check className="w-2 h-2"/></div>
            Secured by 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPanel({ profile }) {
  const addons = getAddons();
  const plans  = getPlans();
  const [tab, setTab]       = useState('addons');
  const [checkout, setCheckout] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Upgrade & Add-ons</h2>
        <p className="text-slate-500 text-sm mt-1">Enhance your learning experience with extra sessions and resources</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        {[{ id:'addons', label:'Add-ons' }, { id:'upgrade', label:'Upgrade Plan' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'addons' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0"/>
            <p className="text-amber-300 text-sm">As an enrolled student, you get <strong>priority access</strong> to all add-ons at exclusive rates.</p>
          </div>
          {addons.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No add-ons available right now. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addons.map(addon => <AddonCard key={addon.id} addon={addon} onBuy={setCheckout}/>)}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => <PlanUpgradeCard key={plan.id} plan={plan} currentPlan={profile.plan}/>)}
        </div>
      )}

      {checkout && <CheckoutModal addon={checkout} onClose={() => setCheckout(null)}/>}
    </div>
  );
}
