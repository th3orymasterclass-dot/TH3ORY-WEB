import { createClient } from '@supabase/supabase-js';

const FALLBACK_CODES = ['TH3ORY26', 'TH3ORY2026'];

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
    const { email, code } = req.body || {};

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Enrollment code is required' });
    }

    // 1. Check Supabase DB
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check student_accounts table
      const { data: student } = await supabase
        .from('student_accounts')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (student) {
        const storedCode = (student.enrollment_code || '').trim().toUpperCase();
        if (storedCode === cleanCode || FALLBACK_CODES.includes(cleanCode)) {
          return res.status(200).json({
            success: true,
            student: {
              name: student.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              plan: student.plan_name || 'TH3ORY Masterclass',
              enrolledAt: student.created_at || new Date().toISOString()
            }
          });
        }
      }

      // Check enrollments table
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (enrollment) {
        const storedCode = (enrollment.enrollment_code || '').trim().toUpperCase();
        if (storedCode === cleanCode || FALLBACK_CODES.includes(cleanCode)) {
          return res.status(200).json({
            success: true,
            student: {
              name: enrollment.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              plan: enrollment.plan_name || 'TH3ORY Masterclass',
              enrolledAt: enrollment.created_at || new Date().toISOString()
            }
          });
        }
      }
    }

    // 2. Fallback check for demo / test accounts
    if (FALLBACK_CODES.includes(cleanCode)) {
      const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return res.status(200).json({
        success: true,
        student: {
          name: defaultName,
          email: cleanEmail,
          plan: 'TH3ORY Masterclass',
          enrolledAt: new Date().toISOString()
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid enrollment code or email address.'
    });
  } catch (error) {
    console.error('[Student Auth API Exception]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Authentication failed' });
  }
}
