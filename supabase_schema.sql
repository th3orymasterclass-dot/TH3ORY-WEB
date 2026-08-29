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
    phone TEXT,
    profession TEXT,
    bio TEXT,
    country TEXT,
    dob DATE,
    avatar_url TEXT,
    enrollment_code TEXT DEFAULT 'TH3ORY2026',
    plan_name TEXT DEFAULT 'TH3ORY Masterclass',
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter table statements for student_accounts schema migrations
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.student_accounts ADD COLUMN IF NOT EXISTS avatar_url TEXT;

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

-- 4. ENTERPRISE QUOTES TABLE (Dedicated B2B & Enterprise Quotes CRM)
CREATE TABLE IF NOT EXISTS public.enterprise_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name TEXT NOT NULL,
    industry TEXT,
    employee_size TEXT,
    location TEXT,
    website TEXT,
    contact_name TEXT,
    designation TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'pending',
    last_contacted_at TEXT,
    next_followup_at TEXT,
    proposal_sent TEXT,
    meeting_date TEXT,
    probability TEXT DEFAULT '50%',
    expected_revenue TEXT,
    remarks TEXT,
    audience_type TEXT DEFAULT 'Executive Leaders',
    pupil_count TEXT DEFAULT '50-100',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration Statements for Enterprise Quotes CRM Fields
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS employee_size TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS last_contacted_at TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS next_followup_at TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS proposal_sent TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS meeting_date TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS probability TEXT DEFAULT '50%';
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS expected_revenue TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS remarks TEXT;

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
    email TEXT,
    role TEXT,
    category TEXT DEFAULT 'Learner',
    rating INT DEFAULT 5,
    comment TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration alter statements for reviews schema
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS email TEXT;

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
    note TEXT,
    bookmarked BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, lesson_id)
);

-- Migration alter statements for user_progress schema
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_email_lesson_id_key'
  ) THEN
    ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_email_lesson_id_key UNIQUE (email, lesson_id);
  END IF;
END $$;


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
CREATE INDEX IF NOT EXISTS idx_queries_student_email ON public.queries(student_email);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON public.reviews(email);
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
DROP POLICY IF EXISTS "Allow public read/insert on enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public read/insert on student_accounts" ON public.student_accounts;
DROP POLICY IF EXISTS "Allow public read/insert on queries" ON public.queries;
DROP POLICY IF EXISTS "Allow public read/insert on enterprise_quotes" ON public.enterprise_quotes;
DROP POLICY IF EXISTS "Allow public read/insert on contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public read/insert on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read/insert on course_contents" ON public.course_contents;
DROP POLICY IF EXISTS "Allow public read/insert on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read/insert on newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public read/insert on newsletter_broadcasts" ON public.newsletter_broadcasts;
DROP POLICY IF EXISTS "Allow public read/insert on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow public read/insert on coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read/insert on certificates" ON public.certificates;

CREATE POLICY "Allow public read/insert on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on student_accounts" ON public.student_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on queries" ON public.queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on enterprise_quotes" ON public.enterprise_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on contact_inquiries" ON public.contact_inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on course_contents" ON public.course_contents FOR ALL USING (true) WITH CHECK (true);
-- 12. DEDICATED STUDENT HABIT TRACKERS TABLE (Daily 30-Day Self-Assessment & 5-Pillar Scores)
CREATE TABLE IF NOT EXISTS public.student_habit_trackers (
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
CREATE POLICY "Allow public read/insert on student_habit_trackers" ON public.student_habit_trackers FOR ALL USING (true) WITH CHECK (true);

-- 13. TEAM APPROVAL REQUESTS TABLE (Two-Step Admin Approval Workflow for Team Portal Actions)
CREATE TABLE IF NOT EXISTS public.team_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_name TEXT NOT NULL DEFAULT 'Team Admin',
    team_member_email TEXT,
    module_type TEXT NOT NULL, -- 'enterprise_quotes', 'contact_inquiries', 'affiliate_program'
    action_type TEXT NOT NULL, -- 'update_status', 'reply_inquiry', 'create_coupon', 'update_coupon'
    target_id TEXT,
    proposed_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_approval_requests_status ON public.team_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_team_approval_requests_module ON public.team_approval_requests(module_type);

ALTER TABLE public.team_approval_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/insert on team_approval_requests" ON public.team_approval_requests;
CREATE POLICY "Allow public read/insert on team_approval_requests" ON public.team_approval_requests FOR ALL USING (true) WITH CHECK (true);


-- 13. STUDENT PROGRESS TABLE (Alternative naming for persistent student course progress)
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT true,
    note TEXT,
    bookmarked BOOLEAN DEFAULT false,
    task_steps JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, lesson_id)
);

ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS task_steps JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS task_steps JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_student_progress_email_lesson ON public.student_progress(email, lesson_id);
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/insert on student_progress" ON public.student_progress;
CREATE POLICY "Allow public read/insert on student_progress" ON public.student_progress FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS policies
CREATE POLICY "Allow public read/insert on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on newsletter_broadcasts" ON public.newsletter_broadcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- 16. AMBASSADOR APPLICATIONS TABLE (Campus Ambassador Recruitment & Performance)
CREATE TABLE IF NOT EXISTS public.ambassador_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college_name TEXT NOT NULL,
    degree TEXT,
    year_of_study TEXT,
    social_handles TEXT,
    leadership_exp TEXT,
    motivation TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, INTERVIEW_SCHEDULED, APPROVED, REJECTED
    ambassador_code TEXT UNIQUE,
    password_hash TEXT,
    points INT DEFAULT 0,
    tier TEXT DEFAULT 'Tier 1',
    total_leads INT DEFAULT 0,
    total_enrollments INT DEFAULT 0,
    total_commission NUMERIC(10, 2) DEFAULT 0.00,
    weekly_reports JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- Schema Migration statements for existing table columns
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS year_of_study TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS social_handles TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS leadership_exp TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS ambassador_code TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Tier 1';
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS total_leads INT DEFAULT 0;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS total_enrollments INT DEFAULT 0;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS total_commission NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS weekly_reports JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS interview_notes TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS interview_rating TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS team_recommended_by TEXT;
ALTER TABLE public.ambassador_applications ADD COLUMN IF NOT EXISTS payout_details JSONB DEFAULT '{}'::jsonb;

-- 17. AMBASSADOR WEEKLY REPORTS TABLE (Dedicated Activity & Progress Log Ledger)
CREATE TABLE IF NOT EXISTS public.ambassador_weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID REFERENCES public.ambassador_applications(id) ON DELETE CASCADE,
    ambassador_code TEXT NOT NULL,
    posts_count INT DEFAULT 0,
    stories_count INT DEFAULT 0,
    leads_generated INT DEFAULT 0,
    event_notes TEXT,
    challenges TEXT,
    next_week_plan TEXT,
    points_awarded INT DEFAULT 50,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AMBASSADOR LEADS TABLE (Dedicated Trackable Referral & Lead Conversion Ledger)
CREATE TABLE IF NOT EXISTS public.ambassador_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_code TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    college_name TEXT,
    status TEXT DEFAULT 'INTERESTED', -- INTERESTED, ENROLLED, CONVERTED
    commission_earned NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ
);

-- 19. AMBASSADOR PAYOUTS TABLE (Dedicated Financial Ledger & Payout Settlement History)
CREATE TABLE IF NOT EXISTS public.ambassador_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_code TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'UPI', -- UPI, Bank Transfer, PayPal
    payment_details TEXT,
    transaction_reference TEXT,
    status TEXT DEFAULT 'PAID', -- PENDING, PROCESSING, PAID, FAILED
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. AMBASSADOR TASKS TABLE (Dedicated Campaign Quests & Deliverables)
CREATE TABLE IF NOT EXISTS public.ambassador_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_points INT DEFAULT 100,
    reward_bonus NUMERIC(10, 2) DEFAULT 0.00,
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, ARCHIVED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries on ambassador tables
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_code ON public.ambassador_applications(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_email ON public.ambassador_applications(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_reports_code ON public.ambassador_weekly_reports(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_code ON public.ambassador_leads(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_payouts_code ON public.ambassador_payouts(ambassador_code);

-- Enable RLS & Configure Public Access Policies for Ambassador Tables
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/insert on ambassador_applications" ON public.ambassador_applications;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_weekly_reports" ON public.ambassador_weekly_reports;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_leads" ON public.ambassador_leads;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_payouts" ON public.ambassador_payouts;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_tasks" ON public.ambassador_tasks;

CREATE POLICY "Allow public read/insert on ambassador_applications" ON public.ambassador_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on ambassador_weekly_reports" ON public.ambassador_weekly_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on ambassador_leads" ON public.ambassador_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on ambassador_payouts" ON public.ambassador_payouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on ambassador_tasks" ON public.ambassador_tasks FOR ALL USING (true) WITH CHECK (true);

-- INITIAL DEMO SEED DATA (Live Testing Account)
INSERT INTO public.ambassador_applications (
    app_id, name, email, phone, college_name, degree, year_of_study, 
    status, ambassador_code, password_hash, points, tier, total_leads, total_enrollments, total_commission
) VALUES (
    'AMB-APP-100201', 'Alex Vance', 'alex.vance@stanford.edu', '+1 650 555 0192', 
    'Stanford University', 'Computer Science & Business', '3rd Year', 
    'APPROVED', 'AMB-DEMO', 'TH3ORY-AMB-2026', 450, 'Tier 2', 24, 8, 8000.00
) ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION ENABLEMENT
-- Enables instant WebSocket streaming for live updates across all open browsers
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.enrollments,
      public.student_accounts,
      public.queries,
      public.enterprise_quotes,
      public.contact_inquiries,
      public.reviews,
      public.course_contents,
      public.site_settings,
      public.newsletter_subscribers,
      public.newsletter_broadcasts,
      public.user_progress,
      public.student_progress,
      public.coupons,
      public.certificates,
      public.student_habit_trackers,
      public.ambassador_applications,
      public.ambassador_weekly_reports,
      public.ambassador_leads,
      public.ambassador_payouts,
      public.ambassador_tasks;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publication table addition skipped or already present.';
END $$;

-- ==============================================================================
-- OPTIONAL DATA RESET UTILITY (Run in SQL Editor to manually wipe tracker data)
-- ==============================================================================
-- TRUNCATE TABLE public.student_progress CASCADE;
-- TRUNCATE TABLE public.user_progress CASCADE;
-- TRUNCATE TABLE public.student_habit_trackers CASCADE;



