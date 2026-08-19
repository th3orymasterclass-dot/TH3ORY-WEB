import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStudentProgressTable() {
  console.log('===================================================================');
  console.log('🔍 TESTING TABLE NAME: student_progress IN SUPABASE');
  console.log('===================================================================\n');

  const { data, error } = await supabase.from('student_progress').select('*').limit(5);

  if (error) {
    console.log('❌ Error querying student_progress:', error);
  } else {
    console.log('✅ SUCCESS! Table student_progress EXISTS in Supabase!');
    console.log('   Sample Rows:', data);
  }
  console.log('\n===================================================================');
}

checkStudentProgressTable().catch(console.error);
