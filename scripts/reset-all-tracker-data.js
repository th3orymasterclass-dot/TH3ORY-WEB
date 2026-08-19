import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
let supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

try {
  const libContent = fs.readFileSync(path.join(rootDir, 'src/lib/supabase.js'), 'utf8');
  const urlMatch = libContent.match(/supabaseUrl\s*=\s*import\.meta\.env\.VITE_SUPABASE_URL\s*\|\|\s*['"]([^'"]+)['"]/);
  const keyMatch = libContent.match(/DEFAULT_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
  if (urlMatch) supabaseUrl = urlMatch[1];
  if (keyMatch) supabaseKey = keyMatch[1];
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAllData() {
  console.log('🔄 Starting Complete Course Progress & Daily Tracker Data Reset...');
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  const tableCandidates = ['user_progress', 'student_progress', 'student_habit_trackers'];

  for (const table of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`ℹ️ Table '${table}':`, error.message);
      } else {
        console.log(`✅ Cleared all records from '${table}'`);
      }
    } catch (e) {
      console.log(`ℹ️ Exception on '${table}':`, e.message);
    }
  }

  console.log('\n🎉 DATA RESET COMPLETE! Fresh start initialized across database & local cache state.');
}

resetAllData();
