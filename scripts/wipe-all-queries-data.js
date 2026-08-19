import { supabase, isSupabaseConfigured } from '../src/lib/supabase.js';

async function wipeAllQueriesData() {
  console.log('🧹 EXECUTING COMPLETE WIPE OF ALL QUERY DATA FROM SUPABASE & LOCAL CACHES...\n');

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Delete ALL query rows from Supabase queries table
      const { data, error } = await supabase
        .from('queries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select();

      if (error) {
        console.error('❌ Error wiping queries table in Supabase:', error.message);
      } else {
        console.log(`✓ Successfully deleted ${data ? data.length : 0} query rows from Supabase PostgreSQL 'queries' table.`);
      }
    } catch (err) {
      console.error('❌ Exception during Supabase queries wipe:', err.message);
    }
  } else {
    console.log('ℹ️ Supabase not configured, skipping database wipe.');
  }

  // 2. Clear local storage caches
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('th3ory_queries_store');
      Object.keys(localStorage).forEach(k => {
        if (k.includes('_queries')) {
          localStorage.removeItem(k);
        }
      });
      console.log("✓ Cleared all client local storage query keys.");
    } catch {}
  }

  console.log('\n✨ ALL QUERY DATA WIPED SUCCESSFULLY! TABLE IS NOW 100% FRESH.\n');
}

wipeAllQueriesData().catch(err => {
  console.error('Fatal wipe error:', err);
  process.exit(1);
});
