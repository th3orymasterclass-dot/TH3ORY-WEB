import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullProgressFlow() {
  console.log('===================================================================');
  console.log('🧪 TESTING FULL END-TO-END FLOW ON SUPABASE TABLE: student_progress');
  console.log('===================================================================\n');

  const testEmail = 'alexander.vance@vanderbilt.edu';
  const lessonId = 'l1_1';

  // 1. Check existing rows
  console.log('1️⃣ Querying student_progress for:', testEmail);
  const { data: existingRows } = await supabase
    .from('student_progress')
    .select('id, lesson_id, completed')
    .ilike('student_name', testEmail);

  console.log('   Found existing rows:', existingRows);

  // 2. Perform write/upsert
  console.log('\n2️⃣ Saving progress (lesson completed = true)...');
  const { data: match } = await supabase
    .from('student_progress')
    .select('id')
    .ilike('student_name', testEmail)
    .eq('lesson_id', lessonId)
    .limit(1);

  if (match && match.length > 0) {
    console.log('   Updating existing row ID:', match[0].id);
    const { error: updateErr } = await supabase
      .from('student_progress')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', match[0].id);
    console.log('   Update Result Error:', updateErr);
  } else {
    console.log('   Inserting new row into student_progress...');
    const { data: inserted, error: insertErr } = await supabase
      .from('student_progress')
      .insert([{
        student_name: testEmail,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      }])
      .select();
    console.log('   Insert Result:', { inserted, insertErr });
  }

  // 3. Verify fetch
  console.log('\n3️⃣ Fetching back all progress from Supabase student_progress table...');
  const { data: finalProgress, error: fetchErr } = await supabase
    .from('student_progress')
    .select('lesson_id, completed, completed_at')
    .ilike('student_name', testEmail);

  console.log('   Final Rows in Supabase DB:', finalProgress);
  console.log('\n===================================================================');
}

testFullProgressFlow().catch(console.error);
