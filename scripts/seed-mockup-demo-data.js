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

async function updateMockupTestCasesInSupabase() {
  console.log('===================================================================');
  console.log('🚀 TH3ORY MASTERCLASS - UPDATING COMPLETE MOCKUP TEST CASES IN SUPABASE');
  console.log('===================================================================\n');

  let successCount = 0;
  let errorCount = 0;

  const logStep = (success, msg) => {
    if (success) {
      successCount++;
      console.log(`   ✅ ${msg}`);
    } else {
      errorCount++;
      console.error(`   ❌ ${msg}`);
    }
  };

  // 1. Student Accounts & Enrollments Test Cases
  console.log('1️⃣ Updating Student Accounts & Enrollment Test Cases...');
  const demoStudents = [
    {
      orderId: 'ORD-DEMO-1001',
      name: 'Alexander Vance',
      email: 'alexander.vance@vanderbilt.edu',
      phone: '+1 615 322 7311',
      dob: '1997-03-14',
      code: 'ALEX1403',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay'
    },
    {
      orderId: 'ORD-DEMO-1002',
      name: 'Elena Rostova',
      email: 'elena.rostova@behavioral-insights.co',
      phone: '+44 20 7946 0912',
      dob: '1999-11-22',
      code: 'ELEN2211',
      planId: 'pro',
      planName: 'TH3ORY Masterclass Pro Pass',
      amountPaid: 149,
      currency: 'USD',
      gateway: 'Stripe'
    },
    {
      orderId: 'ORD-DEMO-1003',
      name: 'David K. Miller',
      email: 'd.miller@morgan-consulting.com',
      phone: '+1 212 555 0188',
      dob: '1994-06-08',
      code: 'DAVI0806',
      planId: 'vip',
      planName: 'TH3ORY VIP Executive Mentorship Pass',
      amountPaid: 299,
      currency: 'USD',
      gateway: 'Stripe'
    },
    {
      orderId: 'ORD-DEMO-1004',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@oxford.ac.uk',
      phone: '+44 1865 270000',
      dob: '1992-09-18',
      code: 'DRSA1809',
      planId: 'masterclass',
      planName: 'TH3ORY Masterclass Flagship Pass',
      amountPaid: 11999,
      currency: 'INR',
      gateway: 'Razorpay'
    },
    {
      orderId: 'ORD-DEMO-1005',
      name: 'Mentalist Sravan',
      email: 'mentalistsravan@gmail.com',
      phone: '+91 98765 43210',
      dob: '1995-08-23',
      code: 'SRAV2308',
      planId: 'founder',
      planName: 'TH3ORY Founder Executive VIP Pass',
      amountPaid: 0,
      currency: 'INR',
      gateway: 'System Admin'
    },
    {
      orderId: 'ORD-DEMO-1006',
      name: 'Marcus Sterling',
      email: 'm.sterling@harvard.edu',
      phone: '+1 617 495 1000',
      dob: '1996-05-10',
      code: 'MARC1005',
      planId: 'pro',
      planName: 'TH3ORY Masterclass Pro Pass',
      amountPaid: 149,
      currency: 'USD',
      gateway: 'Stripe'
    }
  ];

  for (const s of demoStudents) {
    const code = s.code || generateEnrollmentCode(s.name, s.dob);

    const { error: eErr } = await supabase.from('enrollments').upsert([{
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
      enrollment_code: code
    }], { onConflict: 'order_id' });

    logStep(!eErr, `Enrollment Test Case: ${s.name} (${s.email}) -> Code: ${code} ${eErr ? '| Error: ' + eErr.message : ''}`);

    const { error: aErr } = await supabase.from('student_accounts').upsert([{
      email: s.email,
      name: s.name,
      enrollment_code: code,
      plan_name: s.planName,
      last_login: new Date().toISOString()
    }], { onConflict: 'email' });

    logStep(!aErr, `Student Account Test Case: ${s.name} (${s.email}) ${aErr ? '| Error: ' + aErr.message : ''}`);
  }

  // 2. Student Progress Test Cases
  console.log('\n2️⃣ Updating Student Progress Test Cases...');
  const progressLessons = [
    { student_name: 'alexander.vance@vanderbilt.edu', lesson_id: '1-1', completed: true },
    { student_name: 'alexander.vance@vanderbilt.edu', lesson_id: '1-2', completed: true },
    { student_name: 'alexander.vance@vanderbilt.edu', lesson_id: '1-3', completed: true },
    { student_name: 'alexander.vance@vanderbilt.edu', lesson_id: '2-1', completed: true },
    { student_name: 'alexander.vance@vanderbilt.edu', lesson_id: '2-2', completed: true },
    { student_name: 'elena.rostova@behavioral-insights.co', lesson_id: '1-1', completed: true },
    { student_name: 'elena.rostova@behavioral-insights.co', lesson_id: '1-2', completed: true },
    { student_name: 'mentalistsravan@gmail.com', lesson_id: '1-1', completed: true },
    { student_name: 'mentalistsravan@gmail.com', lesson_id: '1-2', completed: true },
    { student_name: 'mentalistsravan@gmail.com', lesson_id: '2-1', completed: true },
    { student_name: 'mentalistsravan@gmail.com', lesson_id: '3-1', completed: true }
  ];

  for (const item of progressLessons) {
    const { error: pErr } = await supabase.from('student_progress').upsert([item], { onConflict: 'student_name,lesson_id' });
    logStep(!pErr, `Progress Test Case: ${item.student_name} [Lesson ${item.lesson_id}] ${pErr ? '| Error: ' + pErr.message : ''}`);
  }

  // 3. 30-Day Habit Tracker Test Cases
  console.log('\n3️⃣ Updating 30-Day Habit Tracker Test Cases...');
  const habitTrackers = [
    {
      email: 'mentalistsravan@gmail.com',
      day_number: 1,
      scores: { focus: 95, calm: 90, bodyLanguage: 98, magnetism: 92, calibration: 96 },
      pillar_scores: { mentalFocus: 95, emotionalCalm: 90, nonVerbalMastery: 98, socialMagnetism: 92, dailyCalibration: 96 },
      total_score: 94,
      note: 'Day 1: Baseline micro-calibration drill completed cleanly.'
    },
    {
      email: 'mentalistsravan@gmail.com',
      day_number: 2,
      scores: { focus: 92, calm: 88, bodyLanguage: 95, magnetism: 90, calibration: 94 },
      pillar_scores: { mentalFocus: 92, emotionalCalm: 88, nonVerbalMastery: 95, socialMagnetism: 90, dailyCalibration: 94 },
      total_score: 92,
      note: 'Day 2: Vocal pacing & eye-tracking resonance exercise.'
    },
    {
      email: 'alexander.vance@vanderbilt.edu',
      day_number: 1,
      scores: { focus: 85, calm: 80, bodyLanguage: 90, magnetism: 82, calibration: 88 },
      pillar_scores: { mentalFocus: 85, emotionalCalm: 80, nonVerbalMastery: 90, socialMagnetism: 82, dailyCalibration: 88 },
      total_score: 85,
      note: 'Day 1: Completed initial self-assessment matrix.'
    },
    {
      email: 'elena.rostova@behavioral-insights.co',
      day_number: 1,
      scores: { focus: 88, calm: 85, bodyLanguage: 92, magnetism: 86, calibration: 90 },
      pillar_scores: { mentalFocus: 88, emotionalCalm: 85, nonVerbalMastery: 92, socialMagnetism: 86, dailyCalibration: 90 },
      total_score: 88,
      note: 'Day 1: Executive presence calibration logged.'
    }
  ];

  for (const h of habitTrackers) {
    const { error: hErr } = await supabase.from('student_habit_trackers').upsert([h], { onConflict: 'email,day_number' });
    logStep(!hErr, `Habit Tracker Test Case: ${h.email} [Day ${h.day_number}] ${hErr ? '| Error: ' + hErr.message : ''}`);
  }

  // 4. Campus Ambassador Network Test Cases
  console.log('\n4️⃣ Updating Campus Ambassador Program Test Cases...');
  const ambassadorApps = [
    {
      app_id: 'AMB-APP-100201',
      name: 'Alex Vance',
      email: 'alex.vance@stanford.edu',
      phone: '+1 650 555 0192',
      college_name: 'Stanford University',
      degree: 'Computer Science & Business',
      year_of_study: '3rd Year',
      status: 'APPROVED',
      ambassador_code: 'AMB-DEMO',
      password_hash: 'TH3ORY-AMB-2026',
      points: 450,
      tier: 'Tier 2',
      total_leads: 24,
      total_enrollments: 8,
      total_commission: 8000.00,
      approved_at: new Date().toISOString()
    },
    {
      app_id: 'AMB-APP-100202',
      name: 'Marcus Sterling',
      email: 'm.sterling@harvard.edu',
      phone: '+1 617 495 1000',
      college_name: 'Harvard University',
      degree: 'Economics & Behavioral Science',
      year_of_study: '4th Year',
      status: 'APPROVED',
      ambassador_code: 'AMB-HARV-102',
      password_hash: 'TH3ORY-AMB-2026',
      points: 320,
      tier: 'Tier 1',
      total_leads: 15,
      total_enrollments: 5,
      total_commission: 5000.00,
      approved_at: new Date().toISOString()
    },
    {
      app_id: 'AMB-APP-100203',
      name: 'Priya Sharma',
      email: 'psharma@mit.edu',
      phone: '+1 617 253 1000',
      college_name: 'MIT Sloan School of Management',
      degree: 'MBA candidate',
      year_of_study: '1st Year',
      status: 'INTERVIEW_COMPLETED'
    },
    {
      app_id: 'AMB-APP-100204',
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@cambridge.ac.uk',
      phone: '+44 1223 337733',
      college_name: 'University of Cambridge',
      degree: 'Psychology & Neuroscience',
      year_of_study: '2nd Year',
      status: 'PENDING'
    }
  ];

  for (const amb of ambassadorApps) {
    const { error: ambErr } = await supabase.from('ambassador_applications').upsert([amb], { onConflict: 'email' });
    logStep(!ambErr, `Ambassador Application Test Case: ${amb.name} (${amb.email}) [${amb.status}] ${ambErr ? '| Error: ' + ambErr.message : ''}`);
  }

  // Ambassador Payout Test Cases
  const ambassadorPayouts = [
    {
      ambassador_code: 'AMB-DEMO',
      amount: 5000.00,
      payment_method: 'UPI',
      payment_details: 'alexvance@okaxis',
      transaction_reference: 'TXN-AMB-998822',
      status: 'PAID',
      notes: 'Payout processed cleanly for 5 campus student conversions.'
    },
    {
      ambassador_code: 'AMB-DEMO',
      amount: 3000.00,
      payment_method: 'Bank Transfer',
      payment_details: 'Wells Fargo Account ending #4892',
      transaction_reference: 'TXN-AMB-998823',
      status: 'PROCESSING',
      notes: 'Direct deposit processing for 3 recent student enrollments.'
    },
    {
      ambassador_code: 'AMB-HARV-102',
      amount: 5000.00,
      payment_method: 'PayPal',
      payment_details: 'm.sterling@harvard.edu',
      transaction_reference: 'TXN-AMB-998824',
      status: 'PAID',
      notes: 'PayPal payout settled for Harvard campus outreach campaign.'
    }
  ];
  for (const p of ambassadorPayouts) {
    const { error: payErr } = await supabase.from('ambassador_payouts').insert([p]);
    logStep(!payErr, `Ambassador Payout Test Case: ${p.ambassador_code} ₹${p.amount} [${p.status}] ${payErr ? '| Error: ' + payErr.message : ''}`);
  }

  // Ambassador Campaign Tasks Test Cases
  const ambTasks = [
    {
      title: '🌟 Host Campus Masterclass Info Session',
      description: 'Organize a 20-minute physical or virtual session introducing TH3ORY influence principles.',
      reward_points: 150,
      reward_bonus: 500.00,
      status: 'ACTIVE'
    },
    {
      title: '📸 Social Media Influence Story Blast',
      description: 'Post 3 Instagram / LinkedIn stories highlighting your ambassador journey with your referral link.',
      reward_points: 50,
      reward_bonus: 0.00,
      status: 'ACTIVE'
    },
    {
      title: '📜 Distribute 50 Campus Promotional Kits',
      description: 'Hand out official TH3ORY curriculum flyers during college orientation week.',
      reward_points: 100,
      reward_bonus: 250.00,
      status: 'ACTIVE'
    }
  ];
  for (const t of ambTasks) {
    const { error: tErr } = await supabase.from('ambassador_tasks').insert([t]);
    logStep(!tErr, `Ambassador Task Test Case: ${t.title} ${tErr ? '| Error: ' + tErr.message : ''}`);
  }

  // Ambassador Leads Test Cases
  const ambLeads = [
    {
      ambassador_code: 'AMB-DEMO',
      student_name: 'Jessica Alba',
      student_email: 'jessica@stanford.edu',
      student_phone: '+1 650 555 9182',
      college_name: 'Stanford University',
      status: 'ENROLLED',
      commission_earned: 1000.00
    },
    {
      ambassador_code: 'AMB-DEMO',
      student_name: 'Michael Chang',
      student_email: 'm.chang@stanford.edu',
      student_phone: '+1 650 555 8122',
      college_name: 'Stanford University',
      status: 'INTERESTED',
      commission_earned: 0.00
    },
    {
      ambassador_code: 'AMB-HARV-102',
      student_name: 'Samantha Reed',
      student_email: 's.reed@harvard.edu',
      student_phone: '+1 617 555 4910',
      college_name: 'Harvard University',
      status: 'ENROLLED',
      commission_earned: 1000.00
    }
  ];
  for (const l of ambLeads) {
    const { error: lErr } = await supabase.from('ambassador_leads').insert([l]);
    logStep(!lErr, `Ambassador Lead Test Case: ${l.student_name} (${l.ambassador_code}) [${l.status}] ${lErr ? '| Error: ' + lErr.message : ''}`);
  }

  // 5. Support Queries & Instructor Responses Test Cases
  console.log('\n5️⃣ Updating Student Support Query Test Cases...');
  const supportQueries = [
    {
      student_name: 'Elena Rostova',
      student_email: 'elena.rostova@behavioral-insights.co',
      student_plan: 'TH3ORY Masterclass Pro Pass',
      subject: 'Level 4 Micro-Expression Micro-Calibrations during High-Stakes Negotiations',
      type: 'Technical Question',
      message: 'How do we distinguish genuine suppressed anxiety from intentional deception when reading rapid upper-facial tension?',
      status: 'answered',
      reply: 'Great question Elena! Focus on the bilateral asymmetry in the brow furrow—spontaneous micro-expressions are strictly symmetrical, whereas conscious masking shows slight latency.',
      replied_at: new Date().toISOString()
    },
    {
      student_name: 'David K. Miller',
      student_email: 'd.miller@morgan-consulting.com',
      student_plan: 'TH3ORY VIP Executive Mentorship Pass',
      subject: 'Executive VIP 1-on-1 Mentorship Schedule with Mentalist Sravan',
      type: 'Scheduling / VIP',
      message: 'Requesting confirmation for Thursday executive calibration session.',
      status: 'answered',
      reply: 'Your executive calibration session is confirmed for Thursday at 4 PM GMT with Mentalist Sravan.',
      replied_at: new Date().toISOString()
    },
    {
      student_name: 'Marcus Sterling',
      student_email: 'm.sterling@harvard.edu',
      student_plan: 'TH3ORY Masterclass Pro Pass',
      subject: 'Linguistic Anchoring Drills in Level 2',
      type: 'Curriculum Question',
      message: 'Can you provide additional breakdown examples of conversational sub-vocalization?',
      status: 'open'
    }
  ];

  const { error: sqErr } = await supabase.from('queries').insert(supportQueries);
  logStep(!sqErr, `Support Query Test Cases Seeded ${sqErr ? '| Error: ' + sqErr.message : ''}`);

  // 6. Enterprise Quotes & Contact Inquiries Test Cases
  console.log('\n6️⃣ Updating B2B Enterprise Quotes & Keynote Inquiry Test Cases...');
  const enterpriseQuotes = [
    {
      org_name: 'Quantum Behavioral Dynamics',
      contact_name: 'Marcus Thorne',
      email: 'm.thorne@quantumbd.io',
      phone: '+1 415 555 0199',
      audience_type: 'Senior Negotiators & Trial Lawyers',
      pupil_count: '250-500',
      notes: 'Institutional cohort license request for 2026 flagship training program.',
      status: 'pending'
    },
    {
      org_name: 'Apex Global Leadership Institute',
      contact_name: 'Victoria Vance',
      email: 'v.vance@apexleadership.org',
      phone: '+1 212 555 9011',
      audience_type: 'Executive Board Members',
      pupil_count: '100-250',
      notes: 'Custom corporate influence workshop request.',
      status: 'contacted'
    }
  ];
  for (const eq of enterpriseQuotes) {
    const { error: eqErr } = await supabase.from('enterprise_quotes').insert([eq]);
    logStep(!eqErr, `Enterprise Quote Test Case: ${eq.org_name} [${eq.status}] ${eqErr ? '| Error: ' + eqErr.message : ''}`);
  }

  const { error: ciErr } = await supabase.from('contact_inquiries').insert([{
    name: 'Sophia Lin',
    email: 'sophia@keynotebureau.org',
    subject: 'Mentalist Sravan Keynote Speaker Request for World Behavioral Summit 2026',
    message: 'We would love to invite Mentalist Sravan to deliver the opening keynote in London in October 2026.',
    status: 'new'
  }]);
  logStep(!ciErr, `Contact Inquiry Test Case Seeded ${ciErr ? '| Error: ' + ciErr.message : ''}`);

  // 7. Wall of Love Reviews Test Cases
  console.log('\n7️⃣ Updating Wall of Love Reviews Test Cases...');
  const reviews = [
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
  const { error: revErr } = await supabase.from('reviews').insert(reviews);
  logStep(!revErr, `Wall of Love Reviews Test Cases Seeded ${revErr ? '| Error: ' + revErr.message : ''}`);

  // 8. Site Settings Audit Record
  console.log('\n8️⃣ Updating System Settings Audit Record...');
  const { error: sErr } = await supabase.from('site_settings').upsert([{
    setting_key: 'system_last_audit',
    setting_value: { status: 'OPTIMAL', timestamp: new Date().toISOString(), total_records_synced: successCount },
    updated_at: new Date().toISOString()
  }], { onConflict: 'setting_key' });
  logStep(!sErr, `Site Settings Audit Record Seeded ${sErr ? '| Error: ' + sErr.message : ''}`);

  console.log('\n===================================================================');
  console.log(`🎉 ALL MOCKUP TEST CASE DATASETS UPDATED SUCCESSFULLY IN SUPABASE!`);
  console.log(`   Successes: ${successCount} | Errors: ${errorCount}`);
  console.log('===================================================================\n');
}

updateMockupTestCasesInSupabase().catch(console.error);
