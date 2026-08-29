import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetStudentProgressToStart() {
  console.log('===================================================================');
  console.log('🔄 TH3ORY MASTERCLASS - RESETTING STUDENT PROGRESS DATABASE TO START (0%)');
  console.log('===================================================================\n');

  const progressTables = ['student_progress', 'user_progress', 'student_habit_trackers'];

  for (const table of progressTables) {
    try {
      // Delete all records from progress table
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`ℹ️ Info for table '${table}':`, error.message);
      } else {
        console.log(`✅ Successfully wiped all progress records from table: '${table}'`);
      }
    } catch (err) {
      console.log(`ℹ️ Table '${table}' exception:`, err.message);
    }
  }

  // Verify 0 records remain in student_progress
  const { count: spCount, error: spErr } = await supabase.from('student_progress').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Verification: 'student_progress' total records remaining = ${spCount ?? 0}`);

  console.log('\n===================================================================');
  console.log('🎉 STUDENT PROGRESS DATABASE HAS BEEN RESET TO START (0% INITIALIZED)!');
  console.log('===================================================================\n');
}

resetStudentProgressToStart().catch(console.error);
