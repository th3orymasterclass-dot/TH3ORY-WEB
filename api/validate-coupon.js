import { createClient } from '@supabase/supabase-js';

const SAMPLE_COUPONS = {
  'TH3ORY20': { discountPercentage: 20, active: true },
  'TH3ORY2026': { discountPercentage: 20, active: true },
  'VIP50': { discountPercentage: 50, active: true }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { couponCode } = req.body || {};

    const code = (couponCode || '').trim().toUpperCase();

    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
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
        .single();

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

    // Fallback static check
    const matched = SAMPLE_COUPONS[code];
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
      error: `Invalid or expired coupon code: '${code}'`
    });
  } catch (error) {
    console.error('[Validate Coupon API Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Coupon validation failed' });
  }
}
