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

  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TP7hT2Wt1nkqwg';
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'd1lNjZc17928tyS5hcQu5OV2';

  if (!razorpayKeyId || !razorpaySecret) {
    return res.status(500).json({ error: 'Razorpay keys not configured on server' });
  }

  try {
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    // Amount in Razorpay is in sub-units (e.g., paise for INR)
    // 1 INR = 100 paise
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: currency.toUpperCase(),
      receipt: receipt || `ORD-${Date.now()}`,
      notes: notes || {},
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
