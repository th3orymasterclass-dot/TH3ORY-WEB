import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  // POST: Record affirmative consent or withdrawal
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { email, consents = {}, source = 'api', userId = null, metadata = {} } = body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Missing required field: email' });
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const timestamp = new Date().toISOString();

      const records = Object.entries(consents).map(([type, isGranted]) => ({
        email: email.trim().toLowerCase(),
        user_id: userId,
        consent_type: type,
        status: isGranted ? 'granted' : 'declined',
        version: '1.0',
        privacy_policy_version: '2026.1',
        language: 'en',
        source: source,
        purpose: `Consent for ${type}`,
        ip_address: String(clientIp).split(',')[0].trim(),
        user_agent: userAgent,
        metadata: { ...metadata, serverTimestamp: timestamp },
        granted_at: isGranted ? timestamp : null,
        withdrawn_at: isGranted ? null : timestamp
      }));

      if (supabase) {
        await supabase
          .from('dpdp_consent_records')
          .insert(records);
      }

      return res.status(200).json({
        success: true,
        message: 'DPDP consent records successfully registered.',
        count: records.length
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET: Fetch active consent status for an email
  if (req.method === 'GET') {
    try {
      const { email } = req.query || {};
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email parameter required.' });
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('dpdp_consent_records')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ success: true, records: data || [] });
      }

      return res.status(200).json({ success: true, records: [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
