import { createClient } from '@supabase/supabase-js';
import { requireStudentAuth, requireAdminAuth, extractToken, verifyJwt } from './_lib/auth.js';
import { setStrictCorsHeaders, sanitizeForCsv, escapeHtml, getClientIp, checkRateLimit } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const action = String(req.query?.action || body?.action || 'consent').toLowerCase();
  const clientIp = getClientIp(req);

  try {
    // -------------------------------------------------------------
    // ACTION 1: CONSENT (Capture / Status)
    // -------------------------------------------------------------
    if (action === 'consent') {
      if (req.method === 'POST') {
        const { email, consents = {}, source = 'api', userId = null, metadata = {} } = body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        const cleanEmail = String(email).trim().toLowerCase().slice(0, 254);
        const userAgent = String(req.headers['user-agent'] || 'Unknown').slice(0, 255);
        const timestamp = new Date().toISOString();

        const records = Object.entries(consents).map(([type, isGranted]) => ({
          email: cleanEmail,
          user_id: userId,
          consent_type: String(type).slice(0, 50),
          status: isGranted ? 'granted' : 'declined',
          version: '1.0',
          privacy_policy_version: '2026.1',
          language: 'en',
          source: String(source).slice(0, 50),
          purpose: `Consent for ${type}`,
          ip_address: clientIp,
          user_agent: userAgent,
          metadata: { ...metadata, serverTimestamp: timestamp },
          granted_at: isGranted ? timestamp : null,
          withdrawn_at: isGranted ? null : timestamp
        }));

        if (supabase && records.length > 0) {
          await supabase.from('dpdp_consent_records').insert(records);
        }

        return res.status(200).json({ success: true, count: records.length });
      }

      // GET: Get consent status
      const { email } = req.query || {};
      if (!email) return res.status(400).json({ success: false, error: 'Email parameter required' });

      const cleanEmail = String(email).trim().toLowerCase();

      if (supabase) {
        const { data, error } = await supabase
          .from('dpdp_consent_records')
          .select('*')
          .eq('email', cleanEmail)
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
        const rateCheck = checkRateLimit(`dsr_post_${clientIp}`, 10, 60 * 60 * 1000);
        if (!rateCheck.allowed) {
          return res.status(429).json({ success: false, error: 'Too many DSR requests submitted' });
        }

        const { email, name, requestType, payload = {} } = body;
        if (!email || !name || !requestType) {
          return res.status(400).json({ success: false, error: 'Missing required fields: email, name, requestType' });
        }

        const cleanEmail = String(email).trim().toLowerCase().slice(0, 254);
        const cleanName = String(name).trim().slice(0, 100);
        const cleanType = String(requestType).trim().slice(0, 50);

        const requestId = `DSR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const slaDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const requestRecord = {
          request_id: requestId,
          email: cleanEmail,
          data_principal_name: cleanName,
          request_type: cleanType,
          status: 'received',
          priority: cleanType === 'erasure' ? 'urgent' : 'normal',
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

      // GET: Query user requests (requires auth or requestId check)
      const { email, requestId } = req.query || {};
      const token = extractToken(req);
      const authUser = token ? verifyJwt(token) : null;

      if (supabase) {
        let q = supabase.from('dpdp_user_requests').select('*');
        if (requestId) {
          q = q.eq('request_id', String(requestId).trim().toUpperCase());
        } else if (email) {
          const cleanEmail = String(email).trim().toLowerCase();
          // If not admin and not the matching student, reject
          if (!authUser || (authUser.role !== 'admin' && authUser.email !== cleanEmail)) {
            return res.status(401).json({ success: false, error: 'Authentication required to view personal requests' });
          }
          q = q.eq('email', cleanEmail).order('created_at', { ascending: false });
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ success: true, requests: data || [] });
      }
      return res.status(200).json({ success: true, requests: [] });
    }

    // -------------------------------------------------------------
    // ACTION 3: EXPORT (Protected Structured Data Portability)
    // -------------------------------------------------------------
    if (action === 'export') {
      const email = String(req.query?.email || body?.email || '').trim().toLowerCase();
      const format = String(req.query?.format || body?.format || 'json').toLowerCase();

      if (!email) return res.status(400).json({ success: false, error: 'Email parameter required.' });

      // Enforce Authentication on Data Portability Export
      const authUser = requireStudentAuth(req, res, email);
      if (!authUser) return; // 401/403 sent

      let accountData = [], enrollmentData = [], progressData = [], queriesData = [], consentData = [], certData = [];

      if (supabase) {
        const [accRes, enrRes, progRes, qRes, conRes, certRes] = await Promise.all([
          supabase.from('student_accounts').select('id, email, name, phone, profession, bio, country, dob, plan_name, created_at, last_login').eq('email', email),
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
        accountData.forEach(a => {
          csv += `Profile,Name,"${sanitizeForCsv(a.name)}",${a.created_at || ''}\n`;
          csv += `Profile,Email,"${sanitizeForCsv(a.email)}",${a.created_at || ''}\n`;
          csv += `Profile,Phone,"${sanitizeForCsv(a.phone)}",${a.created_at || ''}\n`;
        });
        enrollmentData.forEach(e => {
          csv += `Order,${sanitizeForCsv(e.order_id)},"${sanitizeForCsv(e.plan_name)}",${e.created_at || ''}\n`;
        });
        progressData.forEach(p => {
          csv += `Progress,${sanitizeForCsv(p.lesson_id)},"Completed: ${p.completed}",${p.updated_at || ''}\n`;
        });

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
        const rateCheck = checkRateLimit(`grievance_${clientIp}`, 5, 60 * 60 * 1000);
        if (!rateCheck.allowed) {
          return res.status(429).json({ success: false, error: 'Too many grievance submissions' });
        }

        const { name, email, phone = '', category, subject, description } = body;
        if (!name || !email || !category || !subject || !description) {
          return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        const ticketId = `DPDP-GRV-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const slaDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const grievanceRecord = {
          ticket_id: ticketId,
          email: String(email).trim().toLowerCase().slice(0, 254),
          data_principal_name: String(name).trim().slice(0, 100),
          phone: String(phone).trim().slice(0, 25),
          category: String(category).slice(0, 50),
          subject: String(subject).trim().slice(0, 200),
          description: String(description).trim().slice(0, 2000),
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
      const token = extractToken(req);
      const authUser = token ? verifyJwt(token) : null;

      if (supabase) {
        let q = supabase.from('dpdp_grievances').select('*');
        if (ticketId) {
          q = q.eq('ticket_id', String(ticketId).trim().toUpperCase());
        } else if (email) {
          const cleanEmail = String(email).trim().toLowerCase();
          if (!authUser || (authUser.role !== 'admin' && authUser.email !== cleanEmail)) {
            return res.status(401).json({ success: false, error: 'Authentication required to view grievances' });
          }
          q = q.eq('email', cleanEmail).order('created_at', { ascending: false });
        }
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json({ success: true, grievances: data || [] });
      }
      return res.status(200).json({ success: true, grievances: [] });
    }

    return res.status(400).json({ success: false, error: `Invalid action: ${action}` });

  } catch (err) {
    console.error('[DPDP API Error]:', err.message);
    return res.status(500).json({ success: false, error: 'DPDP service error' });
  }
}
