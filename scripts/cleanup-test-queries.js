import { supabase, isSupabaseConfigured } from '../src/lib/supabase.js';

async function cleanupTestQueries() {
  console.log('🧹 CLEANING UP ALL TEST QUERY DATA FROM SUPABASE & LOCAL CACHES...\n');

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Delete test queries with test emails or test subjects
      const { data, error } = await supabase
        .from('queries')
        .delete()
        .or('student_email.ilike.%test%,subject.ilike.%test%,message.ilike.%test%,student_name.ilike.%test%')
        .select();

      if (error) {
        console.error('❌ Error deleting test queries from Supabase:', error.message);
      } else {
        console.log(`✓ Deleted ${data ? data.length : 0} test query records from Supabase database table 'queries'.`);
      }
    } catch (err) {
      console.error('❌ Exception during Supabase cleanup:', err.message);
    }
  } else {
    console.log('ℹ️ Supabase not configured, skipping remote table wipe.');
  }

  // 2. Clear local storage caches if in node with localStorage mock or browser
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('th3ory_queries_store');
      console.log("✓ Cleared local storage cache 'th3ory_queries_store'.");
    } catch {}
  }

  console.log('\n✨ TEST DATA CLEANUP COMPLETE!\n');
}

cleanupTestQueries().catch(err => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
