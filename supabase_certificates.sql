-- ─── TH3ORY MASTERCLASS - DEDICATED CERTIFICATES TABLE SCHEMA ─────────────────
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- 

-- 1. Create dedicated certificates table with completion_date attribute
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL UNIQUE,
    course_name TEXT DEFAULT 'TH3ORY Masterclass of Influencing',
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create performance indexes for instant certificate verification and email lookups
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates (certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_email ON public.certificates (student_email);
CREATE INDEX IF NOT EXISTS idx_certificates_completion_date ON public.certificates (completion_date);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Allow public read access for certificate verification
CREATE POLICY "Allow public read for certificate verification"
    ON public.certificates FOR SELECT
    USING (true);

-- 5. RLS Policy: Allow public insertion for certificate generation on course completion
CREATE POLICY "Allow public insert for unique certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (true);

-- 6. RLS Policy: Allow public update for certificate metadata
CREATE POLICY "Allow public update for certificates"
    ON public.certificates FOR UPDATE
    USING (true);
