-- ==============================================================================
-- TH3ORY MASTERCLASS - SUPABASE PRODUCTION DATABASE SCHEMA & REALTIME SETUP
-- Run this complete script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENROLLMENTS TABLE (Purchases, Transactions & Student Data)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country_code TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    profession TEXT,
    dob DATE,
    plan_id TEXT DEFAULT 'pro',
    plan_name TEXT DEFAULT 'TH3ORY Masterclass',
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    gateway TEXT DEFAULT 'stripe',
    is_monthly BOOLEAN DEFAULT false,
    enrollment_code TEXT DEFAULT 'TH3ORY2026',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT ACCOUNTS TABLE (Registered Students & Portal Access)
CREATE TABLE IF NOT EXISTS public.student_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    enrollment_code TEXT DEFAULT 'TH3ORY2026',
    plan_name TEXT DEFAULT 'TH3ORY Masterclass',
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT QUERIES TABLE (Dedicated Student Portal Support Threads)
CREATE TABLE IF NOT EXISTS public.queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    student_email TEXT,
    student_plan TEXT,
    subject TEXT NOT NULL,
    type TEXT DEFAULT 'General Question',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENTERPRISE QUOTES TABLE (Dedicated B2B & Institutional Licensing Inquiries)
CREATE TABLE IF NOT EXISTS public.enterprise_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    audience_type TEXT DEFAULT 'Students',
    pupil_count TEXT DEFAULT '50-100',
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTACT INQUIRIES TABLE (Dedicated Public Contact Us Form Submissions)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS TABLE (Public Wall of Love Graduate Testimonials)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    category TEXT DEFAULT 'Learner',
    rating INT DEFAULT 5,
    comment TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COURSE CONTENTS TABLE (Streaming Video URLs, PDFs & Worksheets)
CREATE TABLE IF NOT EXISTS public.course_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    pdf_url TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNITY MESSAGES TABLE (Live Realtime WebSocket Community Chat & ChatMCP)
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL DEFAULT 'general-lounge',
    sender_name TEXT NOT NULL,
    sender_email TEXT,
    sender_role TEXT DEFAULT 'student',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SITE SETTINGS TABLE (Live Dynamic Website Config & Price Overrides)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) PERMISSIONS
-- Grant anonymous/public access to insert & read records for seamless web functionality
-- ==============================================================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read/Write policies for active client operations
CREATE POLICY "Allow public read/insert on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on student_accounts" ON public.student_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on queries" ON public.queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on enterprise_quotes" ON public.enterprise_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on contact_inquiries" ON public.contact_inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on course_contents" ON public.course_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on community_messages" ON public.community_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION ENABLEMENT
-- Enables instant WebSocket streaming for live updates across all open browsers
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.queries,
      public.enterprise_quotes,
      public.contact_inquiries,
      public.reviews,
      public.course_contents,
      public.community_messages,
      public.site_settings;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publication table addition skipped or already present.';
END $$;
