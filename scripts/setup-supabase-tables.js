import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFilePath = path.join(__dirname, '..', 'supabase_schema.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

console.log('===================================================================');
console.log('⚡ TH3ORY MASTERCLASS - SUPABASE SQL EDITOR DIRECT EXECUTION GUIDE');
console.log('===================================================================');
console.log(`\n📄 SQL Schema File Loaded: ${sqlFilePath} (${sqlContent.length} bytes)\n`);

console.log('To execute this SQL schema directly in your live Supabase project:');
console.log('-------------------------------------------------------------------');
console.log('1. Open your Supabase SQL Editor directly at:');
console.log('   👉 https://supabase.com/dashboard/project/qngzfcpnjpabaornddau/sql/new\n');
console.log('2. Click "New Query" and paste the contents of `supabase_schema.sql`.\n');
console.log('3. Click "RUN" (or press Ctrl+Enter / Cmd+Enter).\n');

console.log('All 9 tables (queries, enterprise_quotes, contact_inquiries, enrollments, student_accounts, reviews, course_contents, community_messages, site_settings) will be created with full RLS permissions and Realtime WebSocket replication!');
console.log('===================================================================\n');
