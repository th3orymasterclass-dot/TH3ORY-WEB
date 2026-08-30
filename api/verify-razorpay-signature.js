import crypto from 'crypto';
import { safeCompare, setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`verify_sig_${clientIp}`, 30, 5 * 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Too many verification attempts' });
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    console.error('[Razorpay Signature Error]: RAZORPAY_KEY_SECRET environment variable is missing.');
    return res.status(500).json({ success: false, error: 'Server configuration error: missing payment secret' });
  }

  try {
    const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = bodyObj;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing required Razorpay parameters' });
    }

    const payload = `${String(razorpay_order_id).trim()}|${String(razorpay_payment_id).trim()}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(payload)
      .digest('hex');

    // Constant-time HMAC comparison
    const isValid = safeCompare(expectedSignature, String(razorpay_signature).trim());

    if (isValid) {
      return res.status(200).json({
        success: true,
        message: 'Razorpay payment signature verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid Razorpay payment signature',
      });
    }
  } catch (error) {
    console.error('[Razorpay Signature Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Signature verification service error',
    });
  }
}
