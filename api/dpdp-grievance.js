// Serverless Endpoint: DPDP Section 13 Grievance Redressal API (Node.js runtime)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase configuration missing.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // POST: Submit a Grievance Ticket
  if (req.method === 'POST') {
    try {
      const { name, email, phone = '', category, subject, description } = req.body || {};

      if (!name || !email || !category || !subject || !description) {
        return res.status(400).json({ error: 'All fields (name, email, category, subject, description) are required.' });
      }

      const ticketId = `DPDP-GRV-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const grievanceRecord = {
        ticket_id: ticketId,
        email: email.trim().toLowerCase(),
        data_principal_name: name.trim(),
        phone: phone.trim(),
        category: category,
        subject: subject.trim(),
        description: description.trim(),
        status: 'open',
        priority: category === 'security_concern' ? 'critical' : 'high',
        assigned_to: 'Data Protection Officer',
        sla_deadline: slaDeadline,
        timeline: [
          {
            action: 'TICKET_CREATED',
            timestamp: now.toISOString(),
            performedBy: 'Data Principal',
            notes: `Submitted under category: ${category}`
          }
        ],
        created_at: now.toISOString()
      };

      const { data, error } = await supabase
        .from('dpdp_grievances')
        .insert([grievanceRecord])
        .select();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        ticketId,
        message: 'Grievance officially registered with TH3ORY Data Protection Officer under Section 13.',
        slaDeadline,
        data: data?.[0] || grievanceRecord
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET: Retrieve Grievance Status
  if (req.method === 'GET') {
    try {
      const { ticketId, email } = req.query || {};

      if (!ticketId && !email) {
        return res.status(400).json({ error: 'Provide either ticketId or email.' });
      }

      let query = supabase.from('dpdp_grievances').select('*');

      if (ticketId) {
        query = query.eq('ticket_id', ticketId.trim().toUpperCase());
      } else if (email) {
        query = query.eq('email', email.trim().toLowerCase()).order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, grievances: data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
