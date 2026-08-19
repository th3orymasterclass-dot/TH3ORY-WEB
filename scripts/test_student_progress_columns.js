import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPossibleColumns() {
  const columnCombos = [
    { name: 'email & lesson_id', payload: { email: 'test@test.com', lesson_id: 'l1_1' } },
    { name: 'student_email & lesson_id', payload: { student_email: 'test@test.com', lesson_id: 'l1_1' } },
    { name: 'user_email & lesson_id', payload: { user_email: 'test@test.com', lesson_id: 'l1_1' } },
    { name: 'student_id & lesson_id', payload: { student_id: 'test@test.com', lesson_id: 'l1_1' } }
  ];

  console.log('===================================================================');
  console.log('🧪 TESTING COLUMN SCHEMAS ON TABLE: student_progress');
  console.log('===================================================================\n');

  for (const combo of columnCombos) {
    const { data, error } = await supabase.from('student_progress').insert([combo.payload]).select();
    if (error) {
      console.log(`❌ Combo '${combo.name}':`, error.message, `(Code: ${error.code})`);
    } else {
      console.log(`🎉 SUCCESS! Combo '${combo.name}' inserted row:`, data);
      // Clean up test row
      await supabase.from('student_progress').delete().eq('id', data[0].id);
      break;
    }
  }
  console.log('\n===================================================================');
}

testPossibleColumns().catch(console.error);
