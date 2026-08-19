import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllTables() {
  const tables = [
    'enrollments',
    'student_accounts',
    'queries',
    'enterprise_quotes',
    'contact_inquiries',
    'reviews',
    'course_contents',
    'newsletter_subscribers',
    'newsletter_broadcasts',
    'user_progress',
    'certificates',
    'coupons'
  ];

  console.log('===================================================================');
  console.log('🔍 SUPABASE TABLE SCHEMA CACHE STATUS CHECK');
  console.log('===================================================================\n');

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (error) {
      console.log(`❌ Table '${t}':`, error.message, `(Code: ${error.code})`);
    } else {
      console.log(`✅ Table '${t}': Table EXISTS in Supabase schema cache (${data.length} rows checked).`);
    }
  }
  console.log('\n===================================================================');
}

checkAllTables().catch(console.error);
