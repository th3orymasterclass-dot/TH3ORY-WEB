import { saveQueryToSupabase, fetchQueriesFromSupabase } from '../src/services/supabaseService.js';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase.js';

async function testQueryDeduplication() {
  console.log('🧪 TESTING QUERY DEDUPLICATION & LOCALSTORAGE ELIMINATION...\n');

  const testEmail = 'qa.tester@th3ory.io';
  const testSubject = `Automated QA Lock Test ${Date.now()}`;
  const testMessage = 'Testing concurrent insertion locking to prevent duplicate queries.';

  console.log('1. Dispatching 3 concurrent saveQueryToSupabase calls...');
  const results = await Promise.all([
    saveQueryToSupabase({ studentEmail: testEmail, subject: testSubject, message: testMessage, studentName: 'QA Tester' }),
    saveQueryToSupabase({ studentEmail: testEmail, subject: testSubject, message: testMessage, studentName: 'QA Tester' }),
    saveQueryToSupabase({ studentEmail: testEmail, subject: testSubject, message: testMessage, studentName: 'QA Tester' })
  ]);

  console.log('✓ Concurrent save calls completed. Result IDs:', results.map(r => r.id));

  if (isSupabaseConfigured && supabase) {
    const { data: dbRows, error } = await supabase
      .from('queries')
      .select('*')
      .ilike('student_email', testEmail)
      .eq('subject', testSubject);

    if (error) {
      console.error('❌ Error checking database rows:', error.message);
    } else {
      console.log(`✓ Database query count for subject "${testSubject}": ${dbRows?.length}`);
      if (dbRows?.length === 1) {
        console.log('  PASS: Exactly 1 row saved in database!');
      } else {
        console.error(`  FAIL: Expected 1 row in DB but got ${dbRows?.length}`);
      }

      // Cleanup test row
      await supabase.from('queries').delete().ilike('student_email', testEmail);
    }
  }

  const fetched = await fetchQueriesFromSupabase(testEmail);
  console.log(`✓ fetchedQueriesFromSupabase count: ${fetched.length}`);

  console.log('\n✨ QUERY DEDUPLICATION TEST COMPLETE!\n');
}

testQueryDeduplication().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
