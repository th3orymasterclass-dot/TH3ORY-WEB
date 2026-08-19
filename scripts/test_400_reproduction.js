import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test400Reproduction() {
  console.log('===================================================================');
  console.log('🔍 REPRODUCING 400 ERROR FROM HAR LOGS');
  console.log('===================================================================\n');

  const testEmail = 'alexander.vance@vanderbilt.edu';

  // Test 1: Querying with note and bookmarked (WILL CAUSE 400 BAD REQUEST)
  console.log('1️⃣ Querying student_progress with note, bookmarked...');
  const { data: d1, error: err1 } = await supabase
    .from('student_progress')
    .select('lesson_id, completed, completed_at, note, bookmarked')
    .ilike('student_name', testEmail);

  console.log('   Result 1 Error:', err1);

  // Test 2: Querying ONLY existing columns (id, student_name, lesson_id, completed, completed_at)
  console.log('\n2️⃣ Querying student_progress with ONLY existing columns...');
  const { data: d2, error: err2 } = await supabase
    .from('student_progress')
    .select('lesson_id, completed, completed_at')
    .ilike('student_name', testEmail);

  console.log('   Result 2 Data:', d2);
  console.log('   Result 2 Error:', err2);
  console.log('\n===================================================================');
}

test400Reproduction().catch(console.error);
