import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`order_create_${clientIp}`, 20, 5 * 60 * 1000); // max 20 orders per 5 min
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Order creation rate limit exceeded. Please wait a few moments before trying again.'
    });
  }

  // Check Maintenance Mode Feature Flag
  const maintenanceFlag = process.env.VERCEL_FLAGS_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE;
  if (maintenanceFlag === 'true' || maintenanceFlag === '1') {
    return res.status(503).json({
      success: false,
      error: 'Platform is currently undergoing scheduled maintenance. Live checkout is temporarily paused.'
    });
  }

  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpaySecret) {
    console.error('[Razorpay API Error]: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables');
    return res.status(500).json({ success: false, error: 'Payment gateway configuration is missing on server' });
  }

  try {
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount: clientAmount, currency = 'INR', receipt, notes = {}, couponCode, planId } = body;

    // Official authoritative server plan base prices
    const OFFICIAL_PRICES = {
      INR: {
        'launch-special': 499,
        'starter': 3999,
        'pro': 11999,
        'elite': 24999,
        'default': 11999
      },
      USD: {
        'launch-special': 9,
        'starter': 49,
        'pro': 149,
        'elite': 299,
        'default': 149
      }
    };

    const targetCurrency = String(currency || 'INR').toUpperCase();
    const validCurrency = (targetCurrency === 'USD') ? 'USD' : 'INR';
    
    // Determine base price based on plan or launch offer
    let basePrice = OFFICIAL_PRICES[validCurrency]['default'];
    if (planId && OFFICIAL_PRICES[validCurrency][planId]) {
      basePrice = OFFICIAL_PRICES[validCurrency][planId];
    } else if (Number(clientAmount) === 499 && validCurrency === 'INR') {
      basePrice = 499; // Special launch campaign pricing
    } else if (Number(clientAmount) === 9 && validCurrency === 'USD') {
      basePrice = 9;
    }

    // Server-side coupon verification
    let discountPct = 0;
    let discountFixed = 0;
    const cleanCoupon = String(couponCode || notes.couponCode || '').trim().toUpperCase();

    if (cleanCoupon) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: dbCoupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCoupon)
          .eq('active', true)
          .single();

        if (dbCoupon) {
          discountPct = Number(dbCoupon.discount_percentage || 0);
          discountFixed = Number(dbCoupon.discount_amount || 0);
        }
      }

      // Static authorized promo fallback if DB offline
      if (discountPct === 0 && discountFixed === 0) {
        if (cleanCoupon === 'TH3ORY20' || cleanCoupon === 'TH3ORY2026') discountPct = 20;
        if (cleanCoupon === 'VIP50' && process.env.ENABLE_VIP_DISCOUNT !== 'false') discountPct = 50;
      }
    }

    // Compute final price strictly on the server
    let finalAmount = basePrice;
    if (discountPct > 0) {
      finalAmount = Math.max(1, Math.round(basePrice * (1 - discountPct / 100)));
    } else if (discountFixed > 0) {
      finalAmount = Math.max(1, basePrice - discountFixed);
    }

    // Amount in Razorpay is in sub-units (paise for INR, cents for USD)
    const subUnitMultiplier = 100;
    const orderOptions = {
      amount: Math.round(finalAmount * subUnitMultiplier),
      currency: validCurrency,
      receipt: String(receipt || `ORD-${Date.now()}`).slice(0, 40),
      notes: {
        couponCode: cleanCoupon || 'NONE',
        serverVerifiedPrice: String(finalAmount),
        planId: String(planId || 'pro'),
        clientIp
      },
    };

    const order = await instance.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      keyId: razorpayKeyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('[Razorpay Order Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
}
