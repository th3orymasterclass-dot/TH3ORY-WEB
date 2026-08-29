-- ==============================================================================
-- TH3ORY MASTERCLASS - DEDICATED CAMPUS AMBASSADOR SYSTEM SCHEMAS & MIGRATION
-- Run this complete script in the Supabase SQL Editor (https://supabase.com)
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AMBASSADOR APPLICATIONS TABLE (Recruitment, Profiles, Credentials & Stats)
CREATE TABLE IF NOT EXISTS public.ambassador_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
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

-- 2. AMBASSADOR WEEKLY REPORTS TABLE (Dedicated Activity & Task Log Ledger)
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

-- 3. AMBASSADOR LEADS TABLE (Dedicated Trackable Referral & Lead Conversion Ledger)
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

-- 4. AMBASSADOR PAYOUTS TABLE (Dedicated Financial Ledger & Payout Settlement History)
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

-- 5. AMBASSADOR TASKS TABLE (Dedicated Campaign Quests & Deliverables)
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_code ON public.ambassador_applications(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_email ON public.ambassador_applications(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_reports_code ON public.ambassador_weekly_reports(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_code ON public.ambassador_leads(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_payouts_code ON public.ambassador_payouts(ambassador_code);

-- Enable RLS & Configure Permissive Idempotent Security Policies
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

-- 6. INITIAL DEMO SEED DATA (Live Testing Account)
INSERT INTO public.ambassador_applications (
    app_id, name, email, phone, college_name, degree, year_of_study, 
    status, ambassador_code, password_hash, points, tier, total_leads, total_enrollments, total_commission
) VALUES (
    'AMB-APP-100201', 'Alex Vance', 'alex.vance@stanford.edu', '+1 650 555 0192', 
    'Stanford University', 'Computer Science & Business', '3rd Year', 
    'APPROVED', 'AMB-DEMO', 'TH3ORY-AMB-2026', 450, 'Tier 2', 24, 8, 8000.00
) ON CONFLICT (email) DO NOTHING;

-- Enable Supabase Realtime Replication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.ambassador_applications,
      public.ambassador_weekly_reports,
      public.ambassador_leads,
      public.ambassador_payouts,
      public.ambassador_tasks;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publication addition skipped or already present.';
END $$;
