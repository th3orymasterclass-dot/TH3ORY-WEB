import { supabase, isSupabaseConfigured } from '../src/lib/supabase.js';

async function resetQueriesSession() {
  console.log('🧹 RESETTING QUERIES SESSION & DEDUPLICATING SUPABASE DATABASE...\n');

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: allQueries, error: fetchErr } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchErr) {
        console.error('❌ Error fetching queries from Supabase:', fetchErr.message);
      } else if (allQueries && allQueries.length > 0) {
        console.log(`Found ${allQueries.length} total query rows in Supabase database.`);

        const grouped = new Map();
        const idsToDelete = [];

        allQueries.forEach(q => {
          const compKey = `${(q.student_email || '').trim().toLowerCase()}::${(q.subject || '').trim()}::${(q.message || '').trim()}`;
          if (!grouped.has(compKey)) {
            grouped.set(compKey, q);
          } else {
            const existing = grouped.get(compKey);
            if ((q.status === 'answered' || q.reply) && existing.status !== 'answered') {
              idsToDelete.push(existing.id);
              grouped.set(compKey, q);
            } else {
              idsToDelete.push(q.id);
            }
          }
        });

        if (idsToDelete.length > 0) {
          console.log(`Deleting ${idsToDelete.length} duplicate query records:`, idsToDelete);
          const { error: delErr } = await supabase
            .from('queries')
            .delete()
            .in('id', idsToDelete);

          if (delErr) {
            console.error('❌ Error deleting duplicates:', delErr.message);
          } else {
            console.log(`✓ Cleaned up ${idsToDelete.length} duplicate query rows from Supabase database.`);
          }
        } else {
          console.log('✓ No duplicate query rows found in Supabase database.');
        }

        console.log(`✓ Active clean queries in database: ${grouped.size}`);
      } else {
        console.log('✓ Database queries table is empty.');
      }
    } catch (err) {
      console.error('❌ Exception during Supabase queries deduplication:', err.message);
    }
  } else {
    console.log('ℹ️ Supabase not configured, skipping database reset.');
  }

  console.log('\n✨ QUERIES SESSION RESET SUCCESSFULLY!\n');
}

resetQueriesSession().catch(err => {
  console.error('Fatal reset error:', err);
  process.exit(1);
});
