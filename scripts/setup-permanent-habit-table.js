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

async function checkAndSetupHabitTable() {
  console.log('🔍 Checking Permanent Daily Habit Tracker Table (student_habit_trackers) in Supabase...');
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  try {
    const { data, error } = await supabase
      .from('student_habit_trackers')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`\n⚠️ Notice: Table 'student_habit_trackers' is not yet created in the Supabase database schema cache.`);
      console.log(`\n📋 TO CREATE IT PERMANENTLY IN SUPABASE:`);
      console.log(`1. Open your Supabase Dashboard: https://app.supabase.com`);
      console.log(`2. Click 'SQL Editor' on the left sidebar.`);
      console.log(`3. Paste & run the following SQL script:\n`);
      console.log(`----------------------------------------------------------------`);
      console.log(`CREATE TABLE IF NOT EXISTS public.student_habit_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    pillar_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score INT DEFAULT 0,
    note TEXT,
    weekly_reflection JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_habit_day UNIQUE (email, day_number)
);

CREATE INDEX IF NOT EXISTS idx_student_habit_trackers_email ON public.student_habit_trackers(email);
CREATE INDEX IF NOT EXISTS idx_student_habit_trackers_email_day ON public.student_habit_trackers(email, day_number);

ALTER TABLE public.student_habit_trackers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/insert on student_habit_trackers" ON public.student_habit_trackers;
CREATE POLICY "Allow public read/insert on student_habit_trackers" ON public.student_habit_trackers FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_habit_trackers;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;`);
      console.log(`----------------------------------------------------------------\n`);
    } else {
      console.log(`✅ Table 'student_habit_trackers' EXISTS PERMANENTLY in Supabase! Found ${data ? data.length : 0} records.`);
    }
  } catch (err) {
    console.error('❌ Table check error:', err.message);
  }
}

checkAndSetupHabitTable();
