import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 8-Character Enrollment Code Algorithm ────────────────────────────────────
function generateEnrollmentCode(name = '', dob = '') {
  const lettersOnly = (name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  let namePart = lettersOnly.slice(0, 4);
  if (namePart.length < 4) {
    namePart = namePart.padEnd(4, 'X');
  }
  if (!namePart || namePart === 'XXXX') {
    namePart = 'TH3O';
  }

  let dobPart = '';
  const dobStr = String(dob || '').trim();

  if (dobStr) {
    const matchISO = dobStr.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    if (matchISO) {
      const month = String(matchISO[2]).padStart(2, '0');
      const day = String(matchISO[3]).padStart(2, '0');
      dobPart = day + month;
    } else {
      const matchDMY = dobStr.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
      if (matchDMY) {
        const day = String(matchDMY[1]).padStart(2, '0');
        const month = String(matchDMY[2]).padStart(2, '0');
        dobPart = day + month;
      }
    }
  }

  if (!dobPart || dobPart.length !== 4) {
    dobPart = '2026';
  }

  return (namePart + dobPart).toUpperCase().slice(0, 8);
}

async function resetAndSeedDatabase() {
  console.log('===================================================================');
  console.log('🧹 TH3ORY MASTERCLASS - CLEAR PREVIOUS ENTRIES & SEED SUPABASE DB');
  console.log('===================================================================\n');

  const tablesToClear = ['enrollments', 'student_accounts', 'queries', 'enterprise_quotes', 'contact_inquiries', 'reviews'];

  // 1. Clear previous entries
  console.log('1️⃣ Clearing previous entries from Supabase tables...');
  for (const table of tablesToClear) {
    try {
      const { data: rows } = await supabase.from(table).select('id');
      if (rows && rows.length > 0) {
        for (const row of rows) {
          await supabase.from(table).delete().eq('id', row.id);
        }
      }
      console.log(`  ✅ Cleared previous entries in: ${table}`);
    } catch (err) {
      console.error(`  ❌ Error clearing table ${table}:`, err.message);
    }
  }

  console.log('\n2️⃣ Seeding new test details with 8-character enrollment codes (Name + DOB)...');

  // Test Students data
  const testStudents = [
    {
      orderId: `ORD-LIVE-${Date.now()}-1`,
      name: 'Jonathan Sterling',
      email: 'jonathan.sterling@example.com',
      phone: '+91 98765 43210',
      dob: '2000-05-15',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay',
    },
    {
      orderId: `ORD-LIVE-${Date.now()}-2`,
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      phone: '+1 555 019 2831',
      dob: '1998-12-04',
      planId: 'pro',
      planName: 'TH3ORY Masterclass Pro Pass',
      amountPaid: 149,
      currency: 'USD',
      gateway: 'Stripe',
    },
    {
      orderId: `ORD-LIVE-${Date.now()}-3`,
      name: 'Mentalist Sravan',
      email: 'mentalistsravan@gmail.com',
      phone: '+91 99887 76655',
      dob: '1995-08-25',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay',
    }
  ];

  // Insert Enrollments & Student Accounts
  for (const s of testStudents) {
    const code = generateEnrollmentCode(s.name, s.dob);
    console.log(`\n  👤 Seeding Student: ${s.name} (${s.email})`);
    console.log(`     -> DOB: ${s.dob} | Enrollment Code: ${code} (${code.length} chars)`);

    const enrollmentPayload = {
      order_id: s.orderId,
      name: s.name,
      email: s.email,
      phone: s.phone,
      dob: s.dob,
      plan_id: s.planId,
      plan_name: s.planName,
      amount_paid: s.amountPaid,
      currency: s.currency,
      gateway: s.gateway,
      enrollment_code: code,
    };

    const { error: eErr } = await supabase.from('enrollments').insert([enrollmentPayload]);
    if (eErr) console.error('     ❌ Error inserting enrollment:', eErr.message);
    else console.log('     ✅ Enrollment saved to database.');

    const accountPayload = {
      name: s.name,
      email: s.email,
      enrollment_code: code,
      plan_name: s.planName,
      last_login: new Date().toISOString()
    };

    const { error: aErr } = await supabase.from('student_accounts').upsert([accountPayload], { onConflict: 'email' });
    if (aErr) console.error('     ❌ Error inserting student account:', aErr.message);
    else console.log('     ✅ Student account saved to database.');
  }

  // Seed Student Queries
  console.log('\n3️⃣ Seeding sample student query...');
  const { error: qErr } = await supabase.from('queries').insert([{
    student_name: 'Jonathan Sterling',
    student_email: 'jonathan.sterling@example.com',
    student_plan: 'TH3ORY Masterclass Flagship Pass',
    subject: 'Level 3 Non-Verbal Anchor Evaluation',
    type: 'Curriculum Question',
    message: 'How do we calibrate rapid Micro-Expression reading during live group negotiations?',
    status: 'open'
  }]);
  if (qErr) console.error('  ❌ Error seeding query:', qErr.message);
  else console.log('  ✅ Student query seeded successfully.');

  // Seed Enterprise Quote
  console.log('\n4️⃣ Seeding sample enterprise quote...');
  const { error: eqErr } = await supabase.from('enterprise_quotes').insert([{
    org_name: 'Apex Behavioral Dynamics Institute',
    contact_name: 'Dr. Eleanor Vance',
    email: 'eleanor.vance@apexbehavioral.org',
    phone: '+1 800 555 4321',
    audience_type: 'Senior Executives & Negotiators',
    pupil_count: '100-250',
    notes: 'Institutional cohort license request for 2026 flagship training program.',
    status: 'pending'
  }]);
  if (eqErr) console.error('  ❌ Error seeding enterprise quote:', eqErr.message);
  else console.log('  ✅ Enterprise quote seeded successfully.');

  // Seed Contact Inquiry
  console.log('\n5️⃣ Seeding sample contact inquiry...');
  const { error: ciErr } = await supabase.from('contact_inquiries').insert([{
    name: 'Marcus Vance',
    email: 'marcus.vance@pressagency.com',
    subject: 'Media & Keynote Session Request',
    message: 'Requesting availability for Mentalist Sravan for the Global Behavioral Science Keynote 2026.',
    status: 'new'
  }]);
  if (ciErr) console.error('  ❌ Error seeding contact inquiry:', ciErr.message);
  else console.log('  ✅ Contact inquiry seeded successfully.');

  // Seed Reviews
  console.log('\n6️⃣ Seeding graduate reviews...');
  const sampleReviews = [
    {
      name: 'Vikramaditya Sharma',
      role: 'Chief Executive Officer',
      category: 'Executive Leader',
      rating: 5,
      comment: 'The 5-Level behavioral architecture transformed how our executive team negotiates and commands presence.'
    },
    {
      name: 'Dr. Ananya Roy',
      role: 'Consultant Psychiatrist',
      category: 'Healthcare Professional',
      rating: 5,
      comment: 'Extremely deep insights into non-verbal calibration and psychological frame control. Highly recommended!'
    }
  ];
  const { error: rErr } = await supabase.from('reviews').insert(sampleReviews);
  if (rErr) console.error('  ❌ Error seeding reviews:', rErr.message);
  else console.log('  ✅ Graduate reviews seeded successfully.');

  console.log('\n===================================================================');
  console.log('🎉 SUPABASE DATABASE CLEARED & SEEDED WITH NEW TEST DETAILS!');
  console.log('===================================================================\n');
}

resetAndSeedDatabase().catch(console.error);
