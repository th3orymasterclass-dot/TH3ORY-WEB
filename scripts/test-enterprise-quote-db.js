import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNTIwNjUsImV4cCI6MjA1NjkyODA2NX0.5yX-fD7JkX7N4mP43o77aY_z1xN-6J8F3o2p9j';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('🧪 Testing Enterprise Quotes table in Supabase...');

  const sampleQuote = {
    org_name: 'Apex Global Technologies',
    contact_name: 'Dr. Marcus Vance',
    email: 'marcus.vance@apexglobal.tech',
    phone: '+1 (555) 234-5678',
    audience_type: 'Corporate Executives & AI Engineers',
    pupil_count: '100-250',
    notes: 'Sample Enterprise License Request for TH3ORY Masterclass Team Training cohort.',
    status: 'pending'
  };

  // 1. Insert sample quote
  console.log('📥 Inserting sample enterprise quote into Supabase enterprise_quotes table...');
  const { data: insertData, error: insertError } = await supabase
    .from('enterprise_quotes')
    .insert([sampleQuote])
    .select();

  if (insertError) {
    console.error('❌ Insert Error:', insertError.message);
    console.log('Attempting fallback insertion into queries table...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('queries')
      .insert([{
        student_name: sampleQuote.contact_name,
        student_email: sampleQuote.email,
        student_plan: 'Enterprise Quote',
        subject: `Enterprise Quote Request: ${sampleQuote.org_name}`,
        type: 'Enterprise Quote',
        message: `Org: ${sampleQuote.org_name} | Audience: ${sampleQuote.audience_type} | Pupils: ${sampleQuote.pupil_count} | Phone: ${sampleQuote.phone} | Notes: ${sampleQuote.notes}`,
        status: 'open'
      }])
      .select();

    if (fallbackError) {
      console.error('❌ Fallback Insert Error:', fallbackError.message);
    } else {
      console.log('✅ Fallback Insert Successful into queries table:', fallbackData);
    }
  } else {
    console.log('✅ Insert Successful into enterprise_quotes table:', insertData);
  }

  // 2. Fetch all quotes
  console.log('\n🔍 Fetching all enterprise quotes from Supabase...');
  const { data: quotes, error: fetchError } = await supabase
    .from('enterprise_quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Fetch Error:', fetchError.message);
  } else {
    console.log(`✅ Successfully fetched ${quotes ? quotes.length : 0} enterprise quotes from Supabase:`);
    console.log(JSON.stringify(quotes, null, 2));
  }
}

runTest();
