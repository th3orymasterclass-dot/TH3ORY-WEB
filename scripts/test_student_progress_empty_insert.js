import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmptyInsert() {
  console.log('===================================================================');
  console.log('🧪 TESTING EMPTY INSERT ON TABLE: student_progress');
  console.log('===================================================================\n');

  const { data, error } = await supabase.from('student_progress').insert([{}], { defaultToNull: true }).select('*');

  if (error) {
    console.log('❌ Empty Insert Error:', error);
  } else {
    console.log('🎉 Empty Insert Succeeded! Row:', data[0]);
    console.log('   Table Column Names:', Object.keys(data[0]));
    // Clean up
    await supabase.from('student_progress').delete().eq('id', data[0].id);
  }
  console.log('\n===================================================================');
}

testEmptyInsert().catch(console.error);
