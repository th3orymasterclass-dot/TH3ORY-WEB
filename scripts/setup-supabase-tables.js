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

console.log('To make `newsletter_subscribers` and `newsletter_broadcasts` visible in Supabase:');
console.log('-------------------------------------------------------------------');
console.log('1. Open your Supabase SQL Editor directly at:');
console.log('   👉 https://supabase.com/dashboard/project/qngzfcpnjpabaornddau/sql/new\n');
console.log('2. Paste the following SQL script into the query editor:\n');

console.log(`
-- 9. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'website_footer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NEWSLETTER BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name TEXT,
    recipients_count INT DEFAULT 0,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/insert on newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on newsletter_broadcasts" ON public.newsletter_broadcasts FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_subscribers, public.newsletter_broadcasts;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipped publication addition.';
END $$;
`);

console.log('3. Click "RUN" (or press Ctrl+Enter / Cmd+Enter).\n');
console.log('Both tables will instantly appear in your Supabase Table Editor under `public` schema!');
console.log('===================================================================\n');

