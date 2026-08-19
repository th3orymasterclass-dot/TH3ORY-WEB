import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { profile } = body;
    if (!profile || !profile.email) {
      return res.status(400).json({ success: false, error: 'Student email is required for profile update' });
    }

    const cleanEmail = profile.email.trim().toLowerCase();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let dbUpdated = false;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const payload = {
        name: profile.name || 'Student',
        phone: profile.phone || '',
        profession: profile.profession || '',
        bio: profile.bio || '',
        country: profile.country || '',
        dob: profile.dob || null,
        avatar_url: profile.avatar || '',
      };

      // 1. Update or upsert student_accounts
      const { error: err1 } = await supabase
        .from('student_accounts')
        .upsert([{ ...payload, email: cleanEmail }], { onConflict: 'email' });

      if (err1) {
        console.warn('[Update Student Profile API] student_accounts error:', err1.message);
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
        console.warn('[Update Student Profile API] enrollments error:', err2.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully in Supabase',
      dbUpdated,
      profile: {
        name: profile.name,
        email: cleanEmail,
        phone: profile.phone || '',
        profession: profile.profession || '',
        bio: profile.bio || '',
        country: profile.country || '',
        dob: profile.dob || null,
        avatar: profile.avatar || '',
        plan: profile.plan || 'TH3ORY Masterclass',
        enrolledAt: profile.enrolledAt || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Update Student Profile API Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update student profile' });
  }
}
