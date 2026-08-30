import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from './_lib/auth.js';
import { setStrictCorsHeaders, getClientIp } from './_lib/security.js';

// Default system feature flags with default states and descriptions
const DEFAULT_FEATURE_FLAGS = {
  SHOW_QUICK_ENROLLMENT_BAR: {
    enabled: true,
    name: 'Quick Enrollment Bar',
    description: 'Displays the sticky bottom bar on landing page for instant checkout access.',
    category: 'Conversion & Urgency'
  },
  SHOW_LIMITED_SEATS_BANNER: {
    enabled: true,
    name: 'Limited Seats Urgency Badge',
    description: 'Shows live seat availability urgency counters (e.g. 5 seats left).',
    category: 'Conversion & Urgency'
  },
  ENABLE_VIP_DISCOUNT: {
    enabled: true,
    name: 'VIP 50% Discount Coupons',
    description: 'Enables high-tier VIP discount codes (VIP50) on pricing checkout.',
    category: 'Promotions & Pricing'
  },
  ENABLE_STUDENT_COMMUNITY: {
    enabled: true,
    name: 'Student Query & Support Sessions',
    description: 'Enables direct student query threads and mentor support inside Student Portal.',
    category: 'LMS Portal'
  },
  ENABLE_LIVE_REVIEWS: {
    enabled: true,
    name: 'Graduate Testimonials Wall',
    description: 'Renders the public graduate Wall of Love reviews section on landing page.',
    category: 'Social Proof'
  },
  ENABLE_TRAILER_VIDEO: {
    enabled: false,
    name: 'Watch Trailer Video Button',
    description: 'Controls the display of the Watch Trailer & 30-Day Arc video modal button on the main homepage.',
    category: 'Landing Page & Media'
  },
  MAINTENANCE_MODE: {
    enabled: false,
    name: 'Platform Maintenance Mode',
    description: 'Puts checkout and portal in maintenance mode with system notice.',
    category: 'System Operations'
  },
  ENABLE_RAZORPAY_SANDBOX: {
    enabled: false,
    name: 'Payment Sandbox Mode',
    description: 'Forces Razorpay gateway to operate in test/sandbox environment.',
    category: 'System Operations'
  }
};

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  // GET: Public read for feature flags
  if (req.method === 'GET') {
    try {
      let activeFlags = { ...DEFAULT_FEATURE_FLAGS };

      // Overwrite with Vercel Environment Variables if present (VERCEL_FLAGS_*)
      Object.keys(activeFlags).forEach(key => {
        const envVal = process.env[`VERCEL_FLAGS_${key}`] || process.env[key];
        if (envVal !== undefined) {
          activeFlags[key].enabled = envVal === 'true' || envVal === '1';
        }
      });

      // Overwrite with dynamic DB site_settings if available
      if (supabase) {
        const { data: dbSetting } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'feature_flags')
          .maybeSingle();

        if (dbSetting && dbSetting.setting_value) {
          const dbFlags = dbSetting.setting_value;
          Object.keys(dbFlags).forEach(key => {
            if (activeFlags[key]) {
              activeFlags[key].enabled = Boolean(dbFlags[key].enabled);
            } else {
              activeFlags[key] = dbFlags[key];
            }
          });
        }
      }

      return res.status(200).json({
        success: true,
        flags: activeFlags,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Feature Flags GET Error]:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch feature flags',
        flags: DEFAULT_FEATURE_FLAGS
      });
    }
  }

  // POST: Edit feature flags (Strictly Admin Authenticated)
  if (req.method === 'POST') {
    const adminUser = requireAdminAuth(req, res);
    if (!adminUser) return; // 401/403 sent

    try {
      const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { flags } = bodyObj;

      if (!flags || typeof flags !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid feature flags payload' });
      }

      // Save to Supabase site_settings table
      if (supabase) {
        const { error: dbError } = await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'feature_flags',
            setting_value: flags,
            updated_at: new Date().toISOString()
          }], { onConflict: 'setting_key' });

        if (dbError) {
          console.warn('[Feature Flags DB Save Warning]:', dbError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Feature flags updated successfully by authorized administrator',
        flags
      });
    } catch (error) {
      console.error('[Feature Flags POST Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to update feature flags' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
