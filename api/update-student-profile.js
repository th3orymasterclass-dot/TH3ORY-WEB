import { createClient } from '@supabase/supabase-js';
import { requireStudentAuth } from './_lib/auth.js';
import { setStrictCorsHeaders, escapeHtml, getClientIp, checkRateLimit } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`profile_update_${clientIp}`, 30, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded for profile updates' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { profile } = body;
    if (!profile || !profile.email) {
      return res.status(400).json({ success: false, error: 'Student email is required for profile update' });
    }

    const cleanEmail = String(profile.email).trim().toLowerCase();

    // Verify authenticated identity matches target student email (BOLA / IDOR Protection)
    const authUser = requireStudentAuth(req, res, cleanEmail);
    if (!authUser) return; // 401 or 403 response already sent by requireStudentAuth

    // Strict input sanitization & length limits
    const sanitizedName = String(profile.name || '').slice(0, 100).trim();
    const sanitizedPhone = String(profile.phone || '').replace(/[^0-9+\s\-()]/g, '').slice(0, 25);
    const sanitizedProfession = String(profile.profession || '').slice(0, 100).trim();
    const sanitizedBio = String(profile.bio || '').slice(0, 500).trim();
    const sanitizedCountry = String(profile.country || '').slice(0, 60).trim();
    const sanitizedAvatar = String(profile.avatar || profile.avatar_url || '').slice(0, 500).trim();
    const sanitizedDob = profile.dob ? String(profile.dob).slice(0, 20).trim() : null;

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let dbUpdated = false;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const payload = {
        name: sanitizedName || 'Student',
        phone: sanitizedPhone,
        profession: sanitizedProfession,
        bio: sanitizedBio,
        country: sanitizedCountry,
        dob: sanitizedDob,
        avatar_url: sanitizedAvatar,
      };

      // 1. Update or upsert student_accounts
      const { error: err1 } = await supabase
        .from('student_accounts')
        .upsert([{ ...payload, email: cleanEmail }], { onConflict: 'email' });

      if (err1) {
        console.warn('[Update Student Profile API] student_accounts warning:', err1.message);
      } else {
        dbUpdated = true;
      }

      // 2. Update enrollments table matching email
      const { error: err2 } = await supabase
        .from('enrollments')
        .update({
          name: payload.name,
          phone: payload.phone,
          profession: payload.profession,
          country: payload.country,
          dob: payload.dob
        })
        .eq('email', cleanEmail);

      if (err2) {
        console.warn('[Update Student Profile API] enrollments warning:', err2.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      dbUpdated,
      profile: {
        name: sanitizedName,
        email: cleanEmail,
        phone: sanitizedPhone,
        profession: sanitizedProfession,
        bio: sanitizedBio,
        country: sanitizedCountry,
        dob: sanitizedDob,
        avatar: sanitizedAvatar,
        plan: profile.plan || 'TH3ORY Masterclass',
        enrolledAt: profile.enrolledAt || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Update Student Profile API Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to update student profile' });
  }
}
