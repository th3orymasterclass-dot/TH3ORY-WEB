import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectColumns() {
  console.log('===================================================================');
  console.log('🔍 INSPECTING COLUMNS OF TABLE: student_progress');
  console.log('===================================================================\n');

  // Query table with select *
  const { data, error } = await supabase.from('student_progress').select('*').limit(1);

  if (error) {
    console.log('❌ Select Error:', error);
  } else {
    console.log('✅ Select succeeded! Rows:', data);
    if (data.length > 0) {
      console.log('   Available Columns:', Object.keys(data[0]));
    } else {
      console.log('   Table is currently empty (0 rows).');
    }
  }

  // Try inserting a generic row or checking schema
  console.log('\n===================================================================');
}

inspectColumns().catch(console.error);
