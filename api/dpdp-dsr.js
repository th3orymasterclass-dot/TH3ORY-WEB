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

  // POST: Create a new Data Subject Request (Access, Erasure, Correction, Nomination)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { email, name, requestType, payload = {} } = body;

      if (!email || !name || !requestType) {
        return res.status(400).json({ success: false, error: 'Missing required fields: email, name, requestType' });
      }

      const requestId = `DSR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const requestRecord = {
        request_id: requestId,
        email: email.trim().toLowerCase(),
        data_principal_name: name.trim(),
        request_type: requestType,
        status: 'received',
        priority: requestType === 'erasure' ? 'urgent' : 'normal',
        is_verified: true,
        verified_at: now.toISOString(),
        request_payload: payload,
        sla_deadline: slaDeadline,
        created_at: now.toISOString()
      };

      if (supabase) {
        await supabase
          .from('dpdp_user_requests')
          .insert([requestRecord]);
      }

      return res.status(200).json({
        success: true,
        requestId,
        message: `Your ${requestType} request has been officially recorded under DPDP Act 2023.`,
        data: requestRecord
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET: Retrieve DSR requests by email or request_id
  if (req.method === 'GET') {
    try {
      const { email, requestId } = req.query || {};

      if (!requestId && !email) {
        return res.status(400).json({ success: false, error: 'Either email or requestId parameter is required.' });
      }

      if (supabase) {
        let query = supabase.from('dpdp_user_requests').select('*');

        if (requestId) {
          query = query.eq('request_id', requestId.trim().toUpperCase());
        } else if (email) {
          query = query.eq('email', email.trim().toLowerCase()).order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json({ success: true, requests: data || [] });
      }

      return res.status(200).json({ success: true, requests: [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
