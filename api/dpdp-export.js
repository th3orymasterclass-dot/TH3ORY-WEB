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
  const email = (req.query?.email || body?.email || '').trim().toLowerCase();
  const format = (req.query?.format || body?.format || 'json').toLowerCase();

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email parameter required for data export.' });
  }

  try {
    let accountData = [];
    let enrollmentData = [];
    let progressData = [];
    let queriesData = [];
    let consentData = [];
    let certData = [];

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
      let csvContent = 'Domain,Field,Value,Timestamp\n';
      
      accountData.forEach(acc => {
        csvContent += `Profile,Name,"${acc.name}",${acc.created_at}\n`;
        csvContent += `Profile,Email,"${acc.email}",${acc.created_at}\n`;
        csvContent += `Profile,Phone,"${acc.phone || ''}",${acc.created_at}\n`;
      });

      enrollmentData.forEach(enr => {
        csvContent += `Order,${enr.order_id},"${enr.plan_name} (${enr.amount_paid} ${enr.currency})",${enr.created_at}\n`;
      });

      progressData.forEach(p => {
        csvContent += `Progress,${p.lesson_id},"Completed: ${p.completed}",${p.updated_at}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=th3ory_dpdp_export_${email.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      return res.status(200).send(csvContent);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=th3ory_dpdp_export_${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    return res.status(200).json(exportBundle);

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
