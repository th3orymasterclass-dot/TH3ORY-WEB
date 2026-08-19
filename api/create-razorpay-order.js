import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Maintenance Mode Feature Flag
  const maintenanceFlag = process.env.VERCEL_FLAGS_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE;
  if (maintenanceFlag === 'true' || maintenanceFlag === '1') {
    return res.status(503).json({
      success: false,
      error: 'Platform is currently under maintenance. Live checkout & order creation are temporarily paused.'
    });
  }

  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpaySecret) {
    console.error('[Razorpay API Error]: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables');
    return res.status(500).json({ error: 'Razorpay payment Gateway keys are not configured on server' });
  }

  try {
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount: clientAmount, currency = 'INR', receipt, notes, couponCode } = body;

    // Official authoritative server plan prices
    const OFFICIAL_PRICES = {
      INR: 11999,
      USD: 149,
    };

    const targetCurrency = (currency || 'INR').toUpperCase();
    const basePrice = OFFICIAL_PRICES[targetCurrency] || OFFICIAL_PRICES.INR;

    // Check VIP Discount Feature Flag
    const vipFlag = process.env.VERCEL_FLAGS_ENABLE_VIP_DISCOUNT || process.env.ENABLE_VIP_DISCOUNT;
    const isVipDisabled = vipFlag === 'false' || vipFlag === '0';

    // Check Razorpay Sandbox Mode Feature Flag
    const sandboxFlag = process.env.VERCEL_FLAGS_ENABLE_RAZORPAY_SANDBOX || process.env.ENABLE_RAZORPAY_SANDBOX;
    const isSandboxActive = sandboxFlag === 'true' || sandboxFlag === '1';

    // Server-side coupon verification
    let discountPct = 0;
    const cleanCoupon = (couponCode || notes?.couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'TH3ORY20' || cleanCoupon === 'TH3ORY2026') {
      discountPct = 20;
    } else if (cleanCoupon === 'VIP50' && !isVipDisabled) {
      discountPct = 50;
    }

    const calculatedPrice = basePrice * (1 - discountPct / 100);

    // Prefer server-calculated price over raw client amount to prevent price tampering
    const finalAmount = calculatedPrice > 0 ? calculatedPrice : (Number(clientAmount) || basePrice);

    if (clientAmount && Math.abs(Number(clientAmount) - calculatedPrice) > 1) {
      console.warn(`[Price Warning]: Client sent amount ${clientAmount}, but server calculated ${calculatedPrice}. Using server price.`);
    }

    // Amount in Razorpay is in sub-units (e.g., paise for INR)
    // 1 INR = 100 paise
    const options = {
      amount: Math.round(Number(finalAmount) * 100),
      currency: targetCurrency,
      receipt: receipt || `ORD-${Date.now()}`,
      notes: {
        ...(notes || {}),
        couponCode: cleanCoupon || 'NONE',
        serverVerifiedPrice: finalAmount,
        sandboxMode: isSandboxActive,
      },
    };

    const order = await instance.orders.create(options);

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
    console.error('[Razorpay Order Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Razorpay order',
    });
  }
}
