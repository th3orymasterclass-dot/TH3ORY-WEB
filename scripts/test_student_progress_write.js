import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStudentProgressWrite() {
  console.log('===================================================================');
  console.log('🧪 TESTING WRITE & READ ON SUPABASE TABLE: student_progress');
  console.log('===================================================================\n');

  const testEmail = 'alexander.vance@vanderbilt.edu';
  const lessonId = 'l1_1';

  // 1. Insert/Upsert row into student_progress
  console.log('1️⃣ Writing completed lesson to student_progress...');
  const { data: upsertData, error: upsertErr } = await supabase
    .from('student_progress')
    .upsert([{
      email: testEmail,
      lesson_id: lessonId,
      completed: true,
      updated_at: new Date().toISOString()
    }], { onConflict: 'email,lesson_id' });

  if (upsertErr) {
    console.log('   Upsert Error:', upsertErr.message, upsertErr.code);
    console.log('   Testing select-then-update/insert fallback...');
    const { data: matched } = await supabase
      .from('student_progress')
      .select('id')
      .ilike('email', testEmail)
      .eq('lesson_id', lessonId)
      .limit(1);

    if (matched && matched.length > 0) {
      await supabase
        .from('student_progress')
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq('id', matched[0].id);
    } else {
      await supabase
        .from('student_progress')
        .insert([{ email: testEmail, lesson_id: lessonId, completed: true }]);
    }
  } else {
    console.log('   ✅ Upsert into student_progress SUCCEEDED!');
  }

  // 2. Fetch rows
  console.log('\n2️⃣ Fetching rows from student_progress for:', testEmail);
  const { data: rows, error: fetchErr } = await supabase
    .from('student_progress')
    .select('email, lesson_id, completed, note, bookmarked')
    .ilike('email', testEmail);

  console.log('   Fetched Rows:', rows);
  console.log('\n===================================================================');
}

testStudentProgressWrite().catch(console.error);
