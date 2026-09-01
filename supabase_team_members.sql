-- ==============================================================================
-- TH3ORY MASTERCLASS - SUPABASE TEAM MEMBERS & ACCOUNT-ALIGNED DATA SHARING SCHEMA
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. TEAM MEMBERS TABLE (Multi-Account Access & Person-Specific Profile)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'Team Officer',
    department TEXT NOT NULL DEFAULT 'General Operations',
    passcode TEXT NOT NULL,
    avatar_url TEXT,
    rep_code TEXT UNIQUE NOT NULL,
    custom_quote TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING', 'SUSPENDED'
    assigned_data_scope JSONB DEFAULT '{"view_all": false, "allowed_departments": ["General Operations"]}'::jsonb,
    stats JSONB DEFAULT '{"clicks": 0, "leads": 0, "quotes_handled": 0, "enrollments_assisted": 0}'::jsonb,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_member_id ON public.team_members(member_id);
CREATE INDEX IF NOT EXISTS idx_team_members_rep_code ON public.team_members(rep_code);

-- Alter enterprise_quotes to support account-specific alignment and assignment
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS rep_code TEXT;
ALTER TABLE public.enterprise_quotes ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Alter contact_inquiries to support account-specific alignment and assignment
ALTER TABLE public.contact_inquiries ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.contact_inquiries ADD COLUMN IF NOT EXISTS rep_code TEXT;
ALTER TABLE public.contact_inquiries ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- 2. TEAM SHARED ASSETS & PERSONAL NOTES TABLE (Account-Scoped Data Sharing)
CREATE TABLE IF NOT EXISTS public.team_shared_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'pitch_kit', -- 'pitch_kit', 'brochure', 'internal_brief', 'note'
    content TEXT,
    target_member_id TEXT, -- NULL for all team, or specific member_id
    target_department TEXT, -- NULL for all, or department name
    created_by TEXT NOT NULL,
    is_public_shareable BOOLEAN DEFAULT false,
    share_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and setup permissive policies for authenticated / anon API service
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shared_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of active team members" ON public.team_members;
CREATE POLICY "Allow public read of active team members" ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow team member registration and updates" ON public.team_members;
CREATE POLICY "Allow team member registration and updates" ON public.team_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow team shared assets access" ON public.team_shared_assets;
CREATE POLICY "Allow team shared assets access" ON public.team_shared_assets FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_shared_assets;

-- Seed default initial team profiles
INSERT INTO public.team_members (member_id, name, email, phone, role, department, passcode, rep_code, status, custom_quote)
VALUES
    ('TEAM-MEM-1001', 'Alex Vance', 'alex.ops@th3ory.online', '+91 98765 01001', 'Enterprise Outreach Lead', 'Enterprise & B2B', 'TEAM2026', 'REP-ALEX', 'ACTIVE', 'Transforming corporate leadership through behavioral engineering.'),
    ('TEAM-MEM-1002', 'Priya Sharma', 'priya.campus@th3ory.online', '+91 98765 01002', 'Institutional & Campus Director', 'Campus & University', 'TEAM2026', 'REP-PRIYA', 'ACTIVE', 'Empowering the next generation of communicators across elite universities.'),
    ('TEAM-MEM-1003', 'Vikram Rao', 'vikram.growth@th3ory.online', '+91 98765 01003', 'Growth & Affiliates Strategist', 'Growth & Partnerships', 'TEAM2026', 'REP-VIKRAM', 'ACTIVE', 'Expanding cognitive science and executive influence worldwide.')
ON CONFLICT (member_id) DO NOTHING;
