import { createClient } from '@supabase/supabase-js';
import { setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

const STATIC_FALLBACK_COUPONS = {
  'TH3ORY20': { discountPercentage: 20, active: true },
  'TH3ORY2026': { discountPercentage: 20, active: true },
  'VIP50': { discountPercentage: 50, active: true }
};

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`coupon_validate_${clientIp}`, 15, 60 * 1000); // 15 checks per minute
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Too many coupon validation attempts. Please slow down.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { couponCode } = body;

    const code = String(couponCode || '').trim().toUpperCase().slice(0, 30);

    if (!code || !/^[A-Z0-9_-]+$/.test(code)) {
      return res.status(400).json({ success: false, error: 'Valid coupon code is required' });
    }

    // Check Vercel Feature Flag for VIP Discounts
    const vipFlag = process.env.VERCEL_FLAGS_ENABLE_VIP_DISCOUNT || process.env.ENABLE_VIP_DISCOUNT;
    const isVipDisabled = vipFlag === 'false' || vipFlag === '0';
    if ((code === 'VIP50' || code.startsWith('VIP')) && isVipDisabled) {
      return res.status(400).json({
        success: false,
        error: 'VIP discount coupons are currently paused by administration.'
      });
    }

    // Try database check first
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: dbCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();

      if (dbCoupon) {
        return res.status(200).json({
          success: true,
          coupon: {
            code: dbCoupon.code,
            discountPercentage: Number(dbCoupon.discount_percentage || 0),
            discountAmount: Number(dbCoupon.discount_amount || 0)
          }
        });
      }
    }

    // Static fallback check
    const matched = STATIC_FALLBACK_COUPONS[code];
    if (matched && matched.active) {
      return res.status(200).json({
        success: true,
        coupon: {
          code: code,
          discountPercentage: matched.discountPercentage,
          discountAmount: 0
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: `Invalid or expired coupon code`
    });
  } catch (error) {
    console.error('[Validate Coupon API Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Coupon validation service error' });
  }
}
