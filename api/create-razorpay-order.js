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

    const { amount: clientAmount, currency = 'INR', receipt, notes, couponCode } = req.body || {};

    // Official authoritative server plan prices
    const OFFICIAL_PRICES = {
      INR: 11999,
      USD: 149,
    };

    const targetCurrency = (currency || 'INR').toUpperCase();
    const basePrice = OFFICIAL_PRICES[targetCurrency] || OFFICIAL_PRICES.INR;

    // Server-side coupon verification
    let discountPct = 0;
    const cleanCoupon = (couponCode || notes?.couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'TH3ORY20' || cleanCoupon === 'TH3ORY2026') {
      discountPct = 20;
    } else if (cleanCoupon === 'VIP50') {
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
