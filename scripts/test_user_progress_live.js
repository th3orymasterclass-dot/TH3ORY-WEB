import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLiveProgress() {
  console.log('===================================================================');
  console.log('🧪 TESTING SUPABASE USER_PROGRESS TABLE DIRECT INSERT & UPSERT');
  console.log('===================================================================\n');

  const testEmail = 'alexander.vance@vanderbilt.edu';
  const lessonId = 'l1_1';

  // 1. Check existing rows
  console.log('1️⃣ Querying user_progress for:', testEmail);
  const { data: existingRows, error: selectErr } = await supabase
    .from('user_progress')
    .select('*')
    .ilike('email', testEmail);

  console.log('   Select Result:', { count: existingRows?.length, selectErr });

  // 2. Perform Upsert
  console.log('\n2️⃣ Performing upsert on user_progress (completed: true)...');
  const { data: upsertData, error: upsertErr } = await supabase
    .from('user_progress')
    .upsert([{
      email: testEmail,
      lesson_id: lessonId,
      completed: true,
      updated_at: new Date().toISOString()
    }], { onConflict: 'email,lesson_id' });

  console.log('   Upsert Error:', upsertErr);

  // 3. Fallback logic check if upsert error
  if (upsertErr) {
    console.log('\n3️⃣ Testing fallback select-then-update/insert logic...');
    const { data: matched } = await supabase
      .from('user_progress')
      .select('id')
      .ilike('email', testEmail)
      .eq('lesson_id', lessonId)
      .limit(1);

    if (matched && matched.length > 0) {
      console.log('   Updating existing row ID:', matched[0].id);
      const { error: updateErr } = await supabase
        .from('user_progress')
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq('id', matched[0].id);
      console.log('   Update Result Error:', updateErr);
    } else {
      console.log('   Inserting new row...');
      const { error: insertErr } = await supabase
        .from('user_progress')
        .insert([{ email: testEmail, lesson_id: lessonId, completed: true }]);
      console.log('   Insert Result Error:', insertErr);
    }
  }

  // 4. Verify Final State
  console.log('\n4️⃣ Verifying final user_progress state in Supabase...');
  const { data: finalRows, error: finalErr } = await supabase
    .from('user_progress')
    .select('*')
    .ilike('email', testEmail);

  console.log('   Final Rows in DB:', finalRows);
  console.log('===================================================================\n');
}

testLiveProgress().catch(console.error);
