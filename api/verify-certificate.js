import { createClient } from '@supabase/supabase-js';
import { safeCompare, setStrictCorsHeaders, getClientIp, checkRateLimit } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  const clientIp = getClientIp(req);
  const query = req.query || {};

  // Stream Key Verification Action
  if (query.action === 'stream-key' || req.headers['x-stream-action'] === 'true') {
    const streamKey = String(req.body?.name || query.name || req.body?.key || query.key || '').trim();
    const validSecretKey = process.env.LIVE_STREAM_SECRET_KEY || 'th3ory_live_masterclass_key_2026';
    
    // Strict exact timing-safe comparison without loose prefix bypasses
    const isAuthorized = streamKey && safeCompare(streamKey, validSecretKey);

    if (isAuthorized) return res.status(200).send('OK');
    return res.status(403).send('Forbidden: Invalid Stream Key');
  }

  // Certificate Verification Action
  const rateCheck = checkRateLimit(`cert_verify_${clientIp}`, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
  }

  const certIdParam = query.certId || query.id;
  const certId = String(certIdParam || '').trim().toUpperCase().slice(0, 50);

  if (!certId || !/^[A-Z0-9_-]+$/.test(certId)) {
    return res.status(400).json({ success: false, error: 'Valid Certificate ID parameter is required' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: cert } = await supabase
        .from('certificates')
        .select('cert_id, student_name, course_name, issue_date, created_at')
        .eq('cert_id', certId)
        .maybeSingle();

      if (cert) {
        return res.status(200).json({
          success: true,
          certificate: {
            certId: cert.cert_id,
            studentName: cert.student_name,
            courseName: cert.course_name || 'TH3ORY Masterclass of Influencing',
            issueDate: cert.issue_date || cert.created_at,
            verified: true
          }
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'Certificate not found in official registry',
      certId
    });
  } catch (err) {
    console.error('[Verify Certificate API Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Certificate verification service error' });
  }
}
