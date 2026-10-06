import { createClient } from '@supabase/supabase-js';
import { signJwt, requireStudentAuth } from './_lib/auth.js';
import { safeCompare, setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

export async function updateProfileHandler(req, res) {
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

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const action = req.query?.action;

  // Handle student profile update action
  if (action === 'update-profile' || body?.profile || req.url?.includes('update-student-profile')) {
    return updateProfileHandler(req, res);
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`student_auth_${clientIp}`, 15, 10 * 60 * 1000); // 15 attempts per 10 min
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.'
    });
  }

  try {
    const { email, code } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length > 254) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    if (!cleanCode || cleanCode.length > 32) {
      return res.status(400).json({ success: false, error: 'Enrollment code is required' });
    }

    // Helper to generate enrollment code from Name + DOB
    function generateEnrollmentCode(name = '', dob = '') {
      const lettersOnly = (name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
      let namePart = lettersOnly.slice(0, 4);
      if (namePart.length < 4) namePart = namePart.padEnd(4, 'X');
      if (!namePart || namePart === 'XXXX') namePart = 'TH3O';

      let dobPart = '';
      const dobStr = String(dob || '').trim();
      if (dobStr) {
        const matchISO = dobStr.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
        if (matchISO) {
          dobPart = String(matchISO[3]).padStart(2, '0') + String(matchISO[2]).padStart(2, '0');
        } else {
          const matchDMY = dobStr.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
          if (matchDMY) {
            dobPart = String(matchDMY[1]).padStart(2, '0') + String(matchDMY[2]).padStart(2, '0');
          }
        }
      }
      if (!dobPart || dobPart.length !== 4) dobPart = '2026';
      return (namePart + dobPart).toUpperCase().slice(0, 8);
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let matchedStudent = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Check student_accounts table
      const { data: students } = await supabase
        .from('student_accounts')
        .select('*')
        .eq('email', cleanEmail)
        .limit(10);

      if (students && students.length > 0) {
        matchedStudent = students.find(s => {
          const storedCode = (s.enrollment_code || '').trim().toUpperCase();
          if (storedCode && safeCompare(storedCode, cleanCode)) return true;
          const computed = generateEnrollmentCode(s.name, s.dob).toUpperCase();
          return safeCompare(computed, cleanCode);
        });
      }

      // 2. Check enrollments table if not matched in student_accounts
      if (!matchedStudent) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*')
          .eq('email', cleanEmail)
          .limit(10);

        if (enrollments && enrollments.length > 0) {
          const matchedEnrollment = enrollments.find(e => {
            const storedCode = (e.enrollment_code || '').trim().toUpperCase();
            if (storedCode && safeCompare(storedCode, cleanCode)) return true;
            const computed = generateEnrollmentCode(e.name, e.dob).toUpperCase();
            return safeCompare(computed, cleanCode);
          });

          if (matchedEnrollment) {
            matchedStudent = {
              name: matchedEnrollment.name,
              email: matchedEnrollment.email,
              phone: matchedEnrollment.phone,
              profession: matchedEnrollment.profession,
              country: matchedEnrollment.country,
              plan_name: matchedEnrollment.plan_name,
              created_at: matchedEnrollment.created_at
            };
          }
        }
      }
    }

    // Demo/Development fallback only if explicitly enabled via environment variable
    if (!matchedStudent && process.env.ALLOW_DEMO_AUTH === 'true' && (cleanCode === 'TH3ORY26' || cleanCode === 'TH3ORY2026')) {
      const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      matchedStudent = {
        name: defaultName,
        email: cleanEmail,
        plan_name: 'TH3ORY Masterclass Demo',
        created_at: new Date().toISOString()
      };
    }

    if (matchedStudent) {
      // Issue signed Student JWT valid for 7 days
      const token = signJwt({
        role: 'student',
        email: cleanEmail,
        name: matchedStudent.name || cleanEmail.split('@')[0],
        sub: matchedStudent.id || `student_${cleanEmail}`,
      }, 7 * 24 * 3600);

      return res.status(200).json({
        success: true,
        token,
        student: {
          name: matchedStudent.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: matchedStudent.phone || '',
          profession: matchedStudent.profession || '',
          bio: matchedStudent.bio || '',
          country: matchedStudent.country || '',
          avatar: matchedStudent.avatar_url || matchedStudent.avatar || '',
          plan: matchedStudent.plan_name || 'TH3ORY Masterclass',
          enrolledAt: matchedStudent.created_at || new Date().toISOString(),
          loginAt: Date.now()
        }
      });
    }

    // Generic error to prevent account enumeration
    return res.status(401).json({
      success: false,
      error: 'Invalid email address or enrollment credentials.'
    });
  } catch (error) {
    console.error('[Student Auth API Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Authentication service error' });
  }
}
