import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  if (!dobPart || dobPart.length !== 4) dobPart = '2026';
  return (namePart + dobPart).toUpperCase().slice(0, 8);
}

async function wipeAndSeedAllTables() {
  console.log('===================================================================');
  console.log('🔥 TH3ORY MASTERCLASS - COMPLETE DATABASE WIPE & BRAND-NEW SEEDING');
  console.log('===================================================================\n');

  const tablesToWipe = [
    'user_progress',
    'queries',
    'reviews',
    'enterprise_quotes',
    'contact_inquiries',
    'coupons',
    'certificates',
    'newsletter_subscribers',
    'newsletter_broadcasts',
    'student_accounts',
    'enrollments'
  ];

  // 1. Wipe all previous data
  console.log('1️⃣ Wiping all existing rows from all Supabase tables...');
  for (const table of tablesToWipe) {
    try {
      const { data: rows } = await supabase.from(table).select('id');
      if (rows && rows.length > 0) {
        for (const row of rows) {
          await supabase.from(table).delete().eq('id', row.id);
        }
      }
      console.log(`  🔥 Cleared all rows in table: ${table}`);
    } catch (err) {
      console.log(`  ℹ️ Table ${table} info:`, err.message);
    }
  }

  console.log('\n2️⃣ Seeding brand-new student accounts & enrollments...');

  const newStudents = [
    {
      orderId: `ORD-LIVE-${Date.now()}-101`,
      name: 'Alexander Vance',
      email: 'alexander.vance@vanderbilt.edu',
      phone: '+1 615 322 7311',
      dob: '1997-03-14',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay',
    },
    {
      orderId: `ORD-LIVE-${Date.now()}-102`,
      name: 'Elena Rostova',
      email: 'elena.rostova@behavioral-insights.co',
      phone: '+44 20 7946 0912',
      dob: '1999-11-22',
      planId: 'pro',
      planName: 'TH3ORY Masterclass Pro Pass',
      amountPaid: 149,
      currency: 'USD',
      gateway: 'Stripe',
    },
    {
      orderId: `ORD-LIVE-${Date.now()}-103`,
      name: 'David K. Miller',
      email: 'd.miller@morgan-consulting.com',
      phone: '+1 212 555 0188',
      dob: '1994-06-08',
      planId: 'vip',
      planName: 'TH3ORY VIP Executive Mentorship Pass',
      amountPaid: 299,
      currency: 'USD',
      gateway: 'Stripe',
    },
    {
      orderId: `ORD-LIVE-${Date.now()}-104`,
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@oxford.ac.uk',
      phone: '+44 1865 270000',
      dob: '1992-09-18',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay',
    }
  ];

  for (const s of newStudents) {
    const code = generateEnrollmentCode(s.name, s.dob);
    console.log(`\n  👤 Seeding Student: ${s.name} (${s.email})`);
    console.log(`     -> DOB: ${s.dob} | Code: ${code} (${code.length} chars)`);

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
    else console.log('     ✅ Enrollment created.');

    const accountPayload = {
      name: s.name,
      email: s.email,
      enrollment_code: code,
      plan_name: s.planName,
      last_login: new Date().toISOString()
    };

    const { error: aErr } = await supabase.from('student_accounts').upsert([accountPayload], { onConflict: 'email' });
    if (aErr) console.error('     ❌ Error inserting student account:', aErr.message);
    else console.log('     ✅ Student account created.');
  }

  // 3. Seed Support Query Threads
  console.log('\n3️⃣ Seeding new support query threads...');
  const sampleQueries = [
    {
      student_name: 'Elena Rostova',
      student_email: 'elena.rostova@behavioral-insights.co',
      student_plan: 'TH3ORY Masterclass Pro Pass',
      subject: 'Level 4 Micro-Expression Micro-Calibrations during High-Stakes Negotiations',
      type: 'Technical Issue',
      message: 'How do we distinguish genuine suppressed anxiety from intentional deception when reading rapid upper-facial tension?',
      status: 'inprogress',
      reply: 'Great question Elena! Focus on the bilateral asymmetry in the brow furrow—spontaneous micro-expressions are always strictly symmetrical.'
    },
    {
      student_name: 'David K. Miller',
      student_email: 'd.miller@morgan-consulting.com',
      student_plan: 'TH3ORY VIP Executive Mentorship Pass',
      subject: 'Executive VIP 1-on-1 Mentorship Schedule with Mentalist Sravan',
      type: 'Scheduling / Cohort',
      message: 'Requesting confirmation for Thursday executive calibration session.',
      status: 'answered',
      reply: 'Your executive calibration session is confirmed for Thursday at 4 PM GMT with Mentalist Sravan.'
    }
  ];
  const { error: qErr } = await supabase.from('queries').insert(sampleQueries);
  if (qErr) console.error('  ❌ Error seeding queries:', qErr.message);
  else console.log('  ✅ Support queries seeded successfully.');

  // 4. Seed Enterprise Quote
  console.log('\n4️⃣ Seeding new enterprise quote...');
  const { error: eqErr } = await supabase.from('enterprise_quotes').insert([{
    org_name: 'Quantum Behavioral Dynamics',
    contact_name: 'Marcus Thorne',
    email: 'm.thorne@quantumbd.io',
    phone: '+1 415 555 0199',
    audience_type: 'Senior Negotiators & Trial Lawyers',
    pupil_count: '250-500',
    notes: 'Institutional cohort license request for 2026 flagship training program.',
    status: 'pending'
  }]);
  if (eqErr) console.error('  ❌ Error seeding enterprise quote:', eqErr.message);
  else console.log('  ✅ Enterprise quote seeded successfully.');

  // 5. Seed Contact Inquiry
  console.log('\n5️⃣ Seeding new contact inquiry...');
  const { error: ciErr } = await supabase.from('contact_inquiries').insert([{
    name: 'Sophia Lin',
    email: 'sophia@keynotebureau.org',
    subject: 'Mentalist Sravan Keynote Speaker Request for World Behavioral Summit 2026',
    message: 'We would love to invite Mentalist Sravan to deliver the opening keynote in London in October 2026.',
    status: 'new'
  }]);
  if (ciErr) console.error('  ❌ Error seeding contact inquiry:', ciErr.message);
  else console.log('  ✅ Contact inquiry seeded successfully.');

  // 6. Seed Wall of Love Graduate Reviews
  console.log('\n6️⃣ Seeding brand-new Wall of Love reviews...');
  const sampleReviews = [
    {
      name: 'Alexander Vance',
      role: 'Lead Behavioral Researcher, Cambridge',
      category: 'Academic & Researcher',
      rating: 5,
      comment: 'The 5-Level behavioral architecture is the most rigorous, actionable system for non-verbal calibration ever created. Essential for anyone in leadership.'
    },
    {
      name: 'Elena Rostova',
      role: 'Managing Partner, Rostova & Co',
      category: 'Executive Leader',
      rating: 5,
      comment: 'Mentalist Sravan\'s masterclass completely reshaped how our executive team approaches high-stakes M&A negotiations.'
    },
    {
      name: 'David K. Miller',
      role: 'Venture Capital Partner',
      category: 'Investor & Partner',
      rating: 5,
      comment: 'Hands down the highest ROI training I have taken in my 15-year career. Instant real-time cognitive advantage.'
    }
  ];
  const { error: rErr } = await supabase.from('reviews').insert(sampleReviews);
  if (rErr) console.error('  ❌ Error seeding reviews:', rErr.message);
  else console.log('  ✅ Graduate reviews seeded successfully.');

  console.log('\n===================================================================');
  console.log('🎉 ALL SUPABASE TABLES PURGED & BRAND-NEW SEED DATA INSTALLED!');
  console.log('===================================================================\n');
}

wipeAndSeedAllTables().catch(console.error);
