import { createClient } from '@supabase/supabase-js';

const SAMPLE_CERTIFICATES = {
  'TH3ORY-CERT-2026-99': {
    certId: 'TH3ORY-CERT-2026-99',
    studentName: 'Alexander Vance',
    courseName: 'TH3ORY Masterclass of Influencing',
    issueDate: '2026-08-15',
    verified: true
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const certIdParam = query.certId || query.id;
  const certId = (certIdParam || '').trim().toUpperCase();

  if (!certId) {
    return res.status(400).json({ success: false, error: 'Certificate ID parameter is required' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('cert_id', certId)
        .single();

      if (cert) {
        return res.status(200).json({
          success: true,
          certificate: {
            certId: cert.cert_id,
            studentName: cert.student_name,
            email: cert.email,
            courseName: cert.course_name || 'TH3ORY Masterclass of Influencing',
            issueDate: cert.issue_date || cert.created_at,
            verified: true
          }
        });
      }
    }

    // Check sample fallback
    const matched = SAMPLE_CERTIFICATES[certId];
    if (matched) {
      return res.status(200).json({
        success: true,
        certificate: matched
      });
    }

    return res.status(404).json({
      success: false,
      error: `Certificate ID '${certId}' not found in official registry.`
    });
  } catch (error) {
    console.error('[Verify Certificate API Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Verification failed' });
  }
}
