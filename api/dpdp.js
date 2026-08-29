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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const action = (req.query?.action || body?.action || 'consent').toLowerCase();

  try {
    // -------------------------------------------------------------
    // ACTION 1: CONSENT (Capture / Status)
    // -------------------------------------------------------------
    if (action === 'consent') {
      if (req.method === 'POST') {
        const { email, consents = {}, source = 'api', userId = null, metadata = {} } = body;
        if (!email) return res.status(400).json({ success: false, error: 'Missing email' });

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
          await supabase.from('dpdp_consent_records').insert(records);
        }

        return res.status(200).json({ success: true, count: records.length });
      }

      // GET
      const { email } = req.query || {};
      if (!email) return res.status(400).json({ success: false, error: 'Email required' });

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
    }

    // -------------------------------------------------------------
    // ACTION 2: DSR (Access, Erasure, Correction, Nomination)
    // -------------------------------------------------------------
    if (action === 'dsr') {
      if (req.method === 'POST') {
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
          await supabase.from('dpdp_user_requests').insert([requestRecord]);
        }

        return res.status(200).json({ success: true, requestId, data: requestRecord });
      }

      // GET
      const { email, requestId } = req.query || {};
      if (supabase) {
        let q = supabase.from('dpdp_user_requests').select('*');
        if (requestId) q = q.eq('request_id', requestId.trim().toUpperCase());
        else if (email) q = q.eq('email', email.trim().toLowerCase()).order('created_at', { ascending: false });
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ success: true, requests: data || [] });
      }
      return res.status(200).json({ success: true, requests: [] });
    }

    // -------------------------------------------------------------
    // ACTION 3: EXPORT (Structured Data Portability JSON/CSV)
    // -------------------------------------------------------------
    if (action === 'export') {
      const email = (req.query?.email || body?.email || '').trim().toLowerCase();
      const format = (req.query?.format || body?.format || 'json').toLowerCase();

      if (!email) return res.status(400).json({ success: false, error: 'Email parameter required.' });

      let accountData = [], enrollmentData = [], progressData = [], queriesData = [], consentData = [], certData = [];

      if (supabase) {
        const [accRes, enrRes, progRes, qRes, conRes, certRes] = await Promise.all([
          supabase.from('student_accounts').select('id, email, name, phone, profession, bio, country, dob, enrollment_code, plan_name, created_at, last_login').eq('email', email),
          supabase.from('enrollments').select('id, order_id, name, email, phone, city, country, plan_name, amount_paid, currency, gateway, created_at').eq('email', email),
          supabase.from('user_progress').select('lesson_id, completed, note, bookmarked, updated_at').eq('email', email),
          supabase.from('queries').select('id, subject, type, message, status, reply, created_at').eq('student_email', email),
          supabase.from('dpdp_consent_records').select('consent_type, status, version, purpose, source, granted_at, withdrawn_at').eq('email', email),
          supabase.from('certificates').select('cert_id, student_name, course_name, issue_date').eq('email', email)
        ]);

        accountData = accRes.data || [];
        enrollmentData = enrRes.data || [];
        progressData = progRes.data || [];
        queriesData = qRes.data || [];
        consentData = conRes.data || [];
        certData = certRes.data || [];
      }

      const exportBundle = {
        exportMetadata: {
          standard: "Digital Personal Data Protection Act, 2023 (DPDP Act) - Right to Data Portability",
          dataPrincipalEmail: email,
          exportedAt: new Date().toISOString(),
          dataFiduciary: "TH3ORY Masterclass of Influencing"
        },
        personalProfile: accountData,
        ordersAndInvoices: enrollmentData,
        learningProgress: progressData,
        supportQueries: queriesData,
        consentHistory: consentData,
        completionCertificates: certData
      };

      if (format === 'csv') {
        let csv = 'Domain,Field,Value,Timestamp\n';
        accountData.forEach(a => { csv += `Profile,Name,"${a.name}",${a.created_at}\nProfile,Email,"${a.email}",${a.created_at}\n`; });
        enrollmentData.forEach(e => { csv += `Order,${e.order_id},"${e.plan_name}",${e.created_at}\n`; });
        progressData.forEach(p => { csv += `Progress,${p.lesson_id},"Completed: ${p.completed}",${p.updated_at}\n`; });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=th3ory_dpdp_export_${email.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        return res.status(200).send(csv);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=th3ory_dpdp_export_${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
      return res.status(200).json(exportBundle);
    }

    // -------------------------------------------------------------
    // ACTION 4: GRIEVANCE (Section 13)
    // -------------------------------------------------------------
    if (action === 'grievance') {
      if (req.method === 'POST') {
        const { name, email, phone = '', category, subject, description } = body;
        if (!name || !email || !category || !subject || !description) {
          return res.status(400).json({ success: false, error: 'All fields are required.' });
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
          timeline: [{ action: 'TICKET_CREATED', timestamp: now.toISOString(), performedBy: 'Data Principal', notes: `Category: ${category}` }],
          created_at: now.toISOString()
        };

        if (supabase) {
          await supabase.from('dpdp_grievances').insert([grievanceRecord]);
        }

        return res.status(200).json({ success: true, ticketId, slaDeadline, data: grievanceRecord });
      }

      // GET
      const { ticketId, email } = req.query || {};
      if (supabase) {
        let q = supabase.from('dpdp_grievances').select('*');
        if (ticketId) q = q.eq('ticket_id', ticketId.trim().toUpperCase());
        else if (email) q = q.eq('email', email.trim().toLowerCase()).order('created_at', { ascending: false });
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ success: true, grievances: data || [] });
      }
      return res.status(200).json({ success: true, grievances: [] });
    }

    return res.status(400).json({ success: false, error: `Invalid action: ${action}` });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
