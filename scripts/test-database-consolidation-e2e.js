import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qngzfcpnjpabaornddau.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function runE2ETests() {
  console.log('========================================================================');
  console.log('  TH3ORY MASTERCLASS — DATABASE STRUCTURE INTEGRITY & VIEWS E2E TEST');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // Suite 1: Physical Tables Accessibility Audit (27 tables)
  // --------------------------------------------------------------------------
  console.log('▶ [Suite 1/3]: Physical Tables Select Audit (All 27 Tables)');

  const physicalTables = [
    'ambassador_applications',
    'ambassador_leads',
    'ambassador_payouts',
    'ambassador_tasks',
    'blogs',
    'certificates',
    'community_members',
    'community_posts',
    'contact_inquiries',
    'coupons',
    'course_contents',
    'dpdp_audit_logs',
    'dpdp_consent_records',
    'dpdp_retention_policies',
    'dpdp_user_requests',
    'enrollments',
    'enterprise_quotes',
    'newsletter_broadcasts',
    'newsletter_subscribers',
    'queries',
    'reviews',
    'site_settings',
    'student_accounts',
    'student_habit_trackers',
    'team_members',
    'team_shared_assets',
    'user_progress'
  ];

  for (const table of physicalTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      assert(!error || error.code === 'PGRST116', `Table ${table} is accessible and responds (Error: ${error ? error.message : 'None'})`);
    } catch (err) {
      assert(false, `Table ${table} threw network exception: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // Suite 2: Consolidated Updatable Views Audit (8 Views)
  // --------------------------------------------------------------------------
  console.log('\n▶ [Suite 2/3]: Consolidated Updatable Views Select Audit (8 Views)');

  const updatableViews = [
    'student_progress',
    'community_reactions',
    'community_comments',
    'ambassador_weekly_reports',
    'dpdp_deletion_logs',
    'dpdp_breach_incidents',
    'dpdp_grievances',
    'dpdp_parental_consents'
  ];

  for (const viewName of updatableViews) {
    try {
      const { data, error } = await supabase.from(viewName).select('*').limit(1);
      assert(!error, `View ${viewName} queryable via Supabase client (Count: ${data ? data.length : 0})`);
    } catch (err) {
      assert(false, `View ${viewName} threw exception: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // Suite 3: Updatable Views INSTEAD OF Trigger Live Verification
  // --------------------------------------------------------------------------
  console.log('\n▶ [Suite 3/3]: Updatable Views INSTEAD OF Trigger Live Verification');

  const testEmail = `qa_test_${Date.now()}@th3ory.online`;
  const testLesson = 'qa_lesson_module_1';

  // 1. student_progress view -> user_progress table
  try {
    const { error: insErr } = await supabase.from('student_progress').insert([{
      student_name: testEmail,
      lesson_id: testLesson,
      completed: true,
      note: 'QA automated test note'
    }]);

    assert(!insErr, `Insert into view student_progress succeeded (Error: ${insErr ? insErr.message : 'None'})`);

    const { data: upRow, error: upErr } = await supabase
      .from('user_progress')
      .select('*')
      .eq('email', testEmail)
      .eq('lesson_id', testLesson)
      .maybeSingle();

    assert(!upErr && upRow && upRow.completed === true, `Underlying user_progress row populated by trigger (completed: ${upRow ? upRow.completed : 'N/A'})`);
    assert(upRow && upRow.note === 'QA automated test note', `Underlying user_progress note synced properly: "${upRow ? upRow.note : ''}"`);

    await supabase.from('user_progress').delete().eq('email', testEmail);
    console.log('    ✓ Test record cleaned up from user_progress');
  } catch (err) {
    assert(false, `student_progress view trigger test failed: ${err.message}`);
  }

  // 2. DPDP deletion logs view -> dpdp_audit_logs table
  try {
    const certId = `CERT-DEL-${Date.now()}`;
    const { error: delLogErr } = await supabase.from('dpdp_deletion_logs').insert([{
      certificate_id: certId,
      data_principal_email: testEmail,
      request_id: `REQ-${Date.now()}`,
      categories_erased: ['personal_data', 'profile'],
      records_erased_count: 5,
      anonymized_count: 2,
      erasure_method: 'crypto_shredding',
      performed_by: 'QA Automation Suite'
    }]);

    assert(!delLogErr, `Insert into view dpdp_deletion_logs succeeded (Error: ${delLogErr ? delLogErr.message : 'None'})`);

    const { data: auditRow, error: auditErr } = await supabase
      .from('dpdp_audit_logs')
      .select('*')
      .eq('actor_email', testEmail)
      .eq('certificate_id', certId)
      .maybeSingle();

    assert(!auditErr && auditRow && auditRow.certificate_id === certId, `Underlying dpdp_audit_logs received deletion log (certId: ${auditRow ? auditRow.certificate_id : 'N/A'})`);
    assert(auditRow && auditRow.action === 'DATA_ERASURE_PURGE', `Underlying dpdp_audit_logs action mapped to DATA_ERASURE_PURGE`);

    await supabase.from('dpdp_audit_logs').delete().eq('actor_email', testEmail);
    console.log('    ✓ Test record cleaned up from dpdp_audit_logs');
  } catch (err) {
    assert(false, `dpdp_deletion_logs view trigger test failed: ${err.message}`);
  }

  // 3. DPDP grievances view -> dpdp_user_requests table
  try {
    const ticketId = `GRV-QA-${Date.now()}`;
    const { error: grievErr } = await supabase.from('dpdp_grievances').insert([{
      ticket_id: ticketId,
      email: testEmail,
      data_principal_name: 'QA Test Student',
      phone: '+91 99999 88888',
      category: 'consent_withdrawal',
      subject: 'QA Test Grievance Subject',
      description: 'Testing unified dpdp_user_requests structure with view triggers',
      status: 'open'
    }]);

    assert(!grievErr, `Insert into view dpdp_grievances succeeded (Error: ${grievErr ? grievErr.message : 'None'})`);

    const { data: reqRow, error: reqErr } = await supabase
      .from('dpdp_user_requests')
      .select('*')
      .eq('request_id', ticketId)
      .eq('request_type', 'grievance')
      .maybeSingle();

    assert(!reqErr && reqRow && reqRow.request_id === ticketId, `Underlying dpdp_user_requests received grievance (ticketId: ${reqRow ? reqRow.request_id : 'N/A'})`);
    assert(reqRow && reqRow.request_type === 'grievance', `Underlying dpdp_user_requests request_type correctly flagged as "grievance"`);

    await supabase.from('dpdp_user_requests').delete().eq('request_id', ticketId);
    console.log('    ✓ Test record cleaned up from dpdp_user_requests');
  } catch (err) {
    assert(false, `dpdp_grievances view trigger test failed: ${err.message}`);
  }

  // 4. DPDP breach incidents view -> dpdp_audit_logs table
  try {
    const breachIncidentId = `INC-QA-${Date.now()}`;
    const { error: breachErr } = await supabase.from('dpdp_breach_incidents').insert([{
      incident_id: breachIncidentId,
      title: 'Simulated breach containment test',
      severity: 'low',
      affected_principals_count: 0,
      description: 'Simulated breach test',
      status: 'resolved'
    }]);

    assert(!breachErr, `Insert into view dpdp_breach_incidents succeeded (Error: ${breachErr ? breachErr.message : 'None'})`);

    const { data: breachRow, error: breachAuditErr } = await supabase
      .from('dpdp_audit_logs')
      .select('*')
      .eq('resource_id', breachIncidentId)
      .maybeSingle();

    assert(!breachAuditErr && breachRow && breachRow.resource_id === breachIncidentId, `Underlying dpdp_audit_logs received breach incident`);

    await supabase.from('dpdp_audit_logs').delete().eq('resource_id', breachIncidentId);
    console.log('    ✓ Test record cleaned up from dpdp_audit_logs');
  } catch (err) {
    assert(false, `dpdp_breach_incidents view trigger test failed: ${err.message}`);
  }

  // 5. DPDP parental consents view -> dpdp_user_requests table
  try {
    const parentConsentToken = `TOKEN-QA-${Date.now()}`;
    const { error: parentErr } = await supabase.from('dpdp_parental_consents').insert([{
      consent_token: parentConsentToken,
      minor_name: 'Minor Student Candidate',
      minor_email: testEmail,
      guardian_name: 'Guardian Test',
      guardian_email: `guardian_${Date.now()}@th3ory.online`,
      guardian_phone: '+91 98888 77777',
      relationship: 'parent',
      status: 'verified'
    }]);

    assert(!parentErr, `Insert into view dpdp_parental_consents succeeded (Error: ${parentErr ? parentErr.message : 'None'})`);

    const { data: parentRow, error: parentAuditErr } = await supabase
      .from('dpdp_user_requests')
      .select('*')
      .eq('consent_token', parentConsentToken)
      .maybeSingle();

    assert(!parentAuditErr && parentRow && parentRow.consent_token === parentConsentToken, `Underlying dpdp_user_requests received parental consent record`);

    await supabase.from('dpdp_user_requests').delete().eq('consent_token', parentConsentToken);
    console.log('    ✓ Test record cleaned up from dpdp_user_requests');
  } catch (err) {
    assert(false, `dpdp_parental_consents view trigger test failed: ${err.message}`);
  }

  // 6. Community Comments & Reactions views -> community_posts JSONB
  try {
    const testPostId = `post-qa-${Date.now()}`;
    const { error: postErr } = await supabase.from('community_posts').insert([{
      id: testPostId,
      title: 'QA Automated Verification Post',
      content: 'Testing unified reactions and comments JSONB structures',
      post_type: 'discussion',
      reactions: [],
      comments: []
    }]);

    assert(!postErr, `Created parent community_post for reactions/comments testing (Error: ${postErr ? postErr.message : 'None'})`);

    if (!postErr) {
      // Test community_comments view
      const { error: commentErr } = await supabase.from('community_comments').insert([{
        post_id: testPostId,
        member_id: 'qa_user_1',
        member_name: 'Test Member',
        comment: 'Great insights on cognitive bias!'
      }]);

      assert(!commentErr, `Insert into view community_comments succeeded (Error: ${commentErr ? commentErr.message : 'None'})`);

      // Test community_reactions view
      const { error: reactErr } = await supabase.from('community_reactions').insert([{
        post_id: testPostId,
        member_id: 'qa_user_1',
        member_name: 'Test Member',
        emoji: '🔥'
      }]);

      assert(!reactErr, `Insert into view community_reactions succeeded (Error: ${reactErr ? reactErr.message : 'None'})`);

      // Fetch the parent post and verify comments & reactions JSONB
      const { data: verifiedPost, error: verErr } = await supabase
        .from('community_posts')
        .select('comments, reactions')
        .eq('id', testPostId)
        .single();

      const comments = verifiedPost ? verifiedPost.comments : [];
      const reactions = verifiedPost ? verifiedPost.reactions : [];

      assert(!verErr && Array.isArray(comments) && comments.length > 0, `community_posts.comments JSONB populated by trigger (Count: ${comments.length})`);
      assert(!verErr && Array.isArray(reactions) && reactions.length > 0, `community_posts.reactions JSONB populated by trigger (Count: ${reactions.length})`);

      await supabase.from('community_posts').delete().eq('id', testPostId);
      console.log('    ✓ Test community post cleaned up');
    }
  } catch (err) {
    assert(false, `Community views trigger test failed: ${err.message}`);
  }

  // 7. Ambassador weekly reports view -> ambassador_applications.weekly_reports JSONB
  try {
    const ambEmail = `amb_qa_${Date.now()}@th3ory.online`;
    const ambCode = `QA${Date.now().toString().slice(-4)}`;
    const { error: appErr } = await supabase.from('ambassador_applications').insert([{
      name: 'QA Ambassador',
      email: ambEmail,
      phone: '+91 99999 00000',
      college_name: 'QA Institute of Cognitive Science',
      status: 'APPROVED',
      ambassador_code: ambCode
    }]);

    assert(!appErr, `Created parent ambassador_application for weekly report testing (Error: ${appErr ? appErr.message : 'None'})`);

    if (!appErr) {
      const { error: reportErr } = await supabase.from('ambassador_weekly_reports').insert([{
        ambassador_code: ambCode,
        posts_count: 5,
        stories_count: 2,
        leads_generated: 12,
        event_notes: 'QA Weekly report via consolidated view'
      }]);

      assert(!reportErr, `Insert into view ambassador_weekly_reports by ambassador_code succeeded (Error: ${reportErr ? reportErr.message : 'None'})`);

      // Clean up via delete trigger / cascade
      await supabase.from('ambassador_applications').delete().eq('ambassador_code', ambCode);
      console.log('    ✓ Test ambassador application cleaned up');
    }
  } catch (err) {
    assert(false, `ambassador_weekly_reports view trigger test failed: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log(`  FINAL RESULTS: ${passed} Passed | ${failed} Failed | ${total} Total`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runE2ETests();
