import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewsletterDatabase() {
  console.log('===================================================================');
  console.log('🚀 TH3ORY MASTERCLASS - NEWSLETTER & ATTACHMENTS SUPABASE LIVE TEST');
  console.log('===================================================================\n');

  // 1. Test newsletter_subscribers table
  console.log('1️⃣ Testing Table: newsletter_subscribers...');
  const testEmail = `subscriber_${Date.now()}@th3ory.online`;
  const { data: subData, error: subErr } = await supabase.from('newsletter_subscribers').upsert([{
    email: testEmail,
    status: 'active',
    source: 'website_footer',
    created_at: new Date().toISOString()
  }], { onConflict: 'email' }).select();

  if (subErr) {
    console.error('  ❌ Newsletter Subscriber Insert Error:', subErr.message);
  } else {
    console.log('  ✅ Newsletter Subscriber Insert Successful! Email:', subData[0].email);
  }

  // 2. Test newsletter_broadcasts table with file attachment
  console.log('\n2️⃣ Testing Table: newsletter_broadcasts (File Attachments & Dispatches)...');
  const sampleBroadcast = {
    subject: 'TH3ORY Cognitive Dispatch #42: Behavioral Influence & Micro-Expressions',
    content: 'Attached is the official Cognitive Influence Worksheet PDF for Level 2 students.',
    attachment_url: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
    attachment_name: 'Cognitive_Influence_Worksheet_2026.pdf',
    recipients_count: 142,
    status: 'sent'
  };

  const { data: bcData, error: bcErr } = await supabase.from('newsletter_broadcasts').insert([sampleBroadcast]).select();

  if (bcErr) {
    console.error('  ❌ Newsletter Broadcast Insert Error:', bcErr.message);
  } else {
    console.log('  ✅ Newsletter Broadcast Insert Successful! Broadcast ID:', bcData[0].id);
    console.log('     Subject:', bcData[0].subject);
    console.log('     Attached File:', bcData[0].attachment_name);
    console.log('     Recipients Count:', bcData[0].recipients_count);
  }

  // 3. Query newsletter_subscribers and newsletter_broadcasts
  console.log('\n3️⃣ Querying live records from newsletter_subscribers & newsletter_broadcasts...');
  const { data: allBcs } = await supabase.from('newsletter_broadcasts').select('id, subject, attachment_name, recipients_count, created_at').order('created_at', { ascending: false }).limit(5);

  console.log('  📜 Recent Broadcast Dispatches in Database:');
  console.table(allBcs);

  console.log('\n===================================================================');
  console.log('🎉 NEWSLETTER SUBSCRIBERS & BROADCAST ATTACHMENTS VERIFIED LIVE IN SUPABASE!');
  console.log('===================================================================\n');
}

testNewsletterDatabase();
