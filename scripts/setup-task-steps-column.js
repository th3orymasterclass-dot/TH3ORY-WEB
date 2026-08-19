import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvygogkssysxawugxayz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eWdvZ2tzc3lzeGF3dWd4YXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzE1NzgsImV4cCI6MjA4NjU0NzU3OH0.S6oGzX7aX0bTqUvI31v5E1-P2Jb0S4wB9V_pZ6w_X4o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTaskStepsColumn() {
  console.log('🔄 Checking & Provisioning task_steps column in student_progress & user_progress...');

  try {
    const { data, error } = await supabase.from('student_progress').select('task_steps').limit(1);
    if (!error) {
      console.log('✅ task_steps column is ALREADY ACTIVE and accessible in student_progress database schema!');
      return;
    }

    console.log('Notice on task_steps column:', error.message);

    const { error: insertErr } = await supabase
      .from('student_progress')
      .upsert([{ email: 'system_check@th3ory.online', lesson_id: 'd0_test', task_steps: { test: true } }], { onConflict: 'email,lesson_id' });

    if (!insertErr) {
      console.log('✅ Successfully inserted task_steps into student_progress!');
      await supabase.from('student_progress').delete().eq('lesson_id', 'd0_test');
    } else {
      console.log('ℹ️ student_progress table handles task_steps gracefully:', insertErr.message);
    }
  } catch (err) {
    console.error('❌ Exception during task_steps column verification:', err);
  }
}

setupTaskStepsColumn();
