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
    coupon_code TEXT DEFAULT 'NONE',
    affiliation_name TEXT DEFAULT 'Direct',
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter table statements for existing database schema migrations
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT 'NONE';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS affiliation_name TEXT DEFAULT 'Direct';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00;

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

-- 8. SITE SETTINGS TABLE (Live Dynamic Website Config & Price Overrides)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NEWSLETTER SUBSCRIBERS TABLE (Cognitive Dispatch Newsletter Subscribers)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'website_footer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NEWSLETTER BROADCASTS TABLE (Dispatched Newsletters & File Attachments)
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

-- 11. USER PROGRESS TABLE (Persistent Student Course Module Progress Tracking)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, lesson_id)
);

-- 12. COUPONS TABLE (Official Database Discount Coupon Management)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_uses INT DEFAULT 1000,
    current_uses INT DEFAULT 0,
    expiry_date TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CERTIFICATES TABLE (Official Verifiable Graduate Completion Certificates)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cert_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_name TEXT DEFAULT 'TH3ORY Masterclass of Influencing',
    issue_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance & Security High-Frequency Query Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_order_id ON public.enrollments(order_id);
CREATE INDEX IF NOT EXISTS idx_student_accounts_email ON public.student_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_progress_email_lesson ON public.user_progress(email, lesson_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(cert_id);

-- Seed default coupons
INSERT INTO public.coupons (code, discount_percentage, active)
VALUES 
  ('TH3ORY20', 20.00, true),
  ('TH3ORY2026', 20.00, true),
  ('VIP50', 50.00, true)
ON CONFLICT (code) DO NOTHING;

-- Seed sample default certificate for verification testing
INSERT INTO public.certificates (cert_id, email, student_name, course_name, issue_date)
VALUES 
  ('TH3ORY-CERT-2026-99', 'student@example.com', 'Alexander Vance', 'TH3ORY Masterclass of Influencing', '2026-08-15')
ON CONFLICT (cert_id) DO NOTHING;

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
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read/Write policies for active client operations
CREATE POLICY "Allow public read/insert on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on student_accounts" ON public.student_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on queries" ON public.queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on enterprise_quotes" ON public.enterprise_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on contact_inquiries" ON public.contact_inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on course_contents" ON public.course_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on newsletter_broadcasts" ON public.newsletter_broadcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

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
      public.site_settings,
      public.newsletter_subscribers,
      public.newsletter_broadcasts,
      public.user_progress,
      public.coupons,
      public.certificates;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publication table addition skipped or already present.';
END $$;

