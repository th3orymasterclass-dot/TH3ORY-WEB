-- ==============================================================================
-- TH3ORY MASTERCLASS - DPDP ACT 2023 COMPLIANT PRIVACY & DATA PROTECTION SCHEMA
-- Statutory compliance under India's Digital Personal Data Protection Act, 2023
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONSENT RECORDS TABLE (Section 6 - Consent Lifecycle Ledger)
CREATE TABLE IF NOT EXISTS public.dpdp_consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,                              -- User or Student ID (if authenticated)
    email TEXT NOT NULL,                        -- Data Principal Email
    consent_type TEXT NOT NULL,                 -- account_creation, marketing_communications, analytics_cookies, etc.
    status TEXT NOT NULL DEFAULT 'granted',     -- granted, withdrawn, declined
    version TEXT NOT NULL DEFAULT '1.0',       -- Consent version identifier
    privacy_policy_version TEXT NOT NULL DEFAULT '2026.1',
    language TEXT NOT NULL DEFAULT 'en',        -- en, hi, etc.
    source TEXT NOT NULL,                       -- checkout, registration, cookie_banner, privacy_dashboard, etc.
    purpose TEXT NOT NULL,                      -- Declared purpose of processing
    ip_address TEXT,                            -- Anonymized / Hashed IP where lawful
    user_agent TEXT,                            -- Client User-Agent
    metadata JSONB DEFAULT '{}'::jsonb,        -- Additional granular purpose flags
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid consent verification
CREATE INDEX IF NOT EXISTS idx_dpdp_consent_email ON public.dpdp_consent_records(email);
CREATE INDEX IF NOT EXISTS idx_dpdp_consent_type ON public.dpdp_consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_dpdp_consent_status ON public.dpdp_consent_records(status);
CREATE INDEX IF NOT EXISTS idx_dpdp_consent_email_status ON public.dpdp_consent_records(email, consent_type, status);

-- 2. DATA SUBJECT RIGHTS (DSR) REQUESTS TABLE (Sections 11, 12, 14)
CREATE TABLE IF NOT EXISTS public.dpdp_user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT UNIQUE NOT NULL,            -- e.g. DSR-2026-XXXXXX
    email TEXT NOT NULL,
    data_principal_name TEXT NOT NULL,
    request_type TEXT NOT NULL,                 -- access_summary, data_portability, correction, erasure, nomination
    status TEXT NOT NULL DEFAULT 'received',    -- received, under_verification, in_progress, completed, rejected
    priority TEXT DEFAULT 'normal',             -- normal, urgent, legal_hold
    verification_token TEXT,                    -- Email verification token for identity confirmation
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    request_payload JSONB DEFAULT '{}'::jsonb,  -- Correction values, nominee details, etc.
    admin_notes TEXT,
    resolution_summary TEXT,
    completed_at TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ NOT NULL,          -- Statutory DPDP deadline (default 30 days)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpdp_requests_email ON public.dpdp_user_requests(email);
CREATE INDEX IF NOT EXISTS idx_dpdp_requests_id ON public.dpdp_user_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_dpdp_requests_status ON public.dpdp_user_requests(status);

-- 3. GRIEVANCE REDRESSAL TICKETS TABLE (Section 13)
CREATE TABLE IF NOT EXISTS public.dpdp_grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT UNIQUE NOT NULL,             -- e.g. DPDP-GRV-XXXXXX
    email TEXT NOT NULL,
    data_principal_name TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,                     -- consent_dispute, unauthorized_processing, erasure_delay, security_concern, other
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',        -- open, under_review, escalated, resolved, closed
    priority TEXT DEFAULT 'high',               -- medium, high, critical
    assigned_to TEXT DEFAULT 'Data Protection Officer',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ NOT NULL,          -- Statutory 30-day resolution deadline
    timeline JSONB DEFAULT '[]'::jsonb,        -- Action and communication trail
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpdp_grievances_ticket ON public.dpdp_grievances(ticket_id);
CREATE INDEX IF NOT EXISTS idx_dpdp_grievances_email ON public.dpdp_grievances(email);
CREATE INDEX IF NOT EXISTS idx_dpdp_grievances_status ON public.dpdp_grievances(status);

-- 4. IMMUTABLE SECURITY & PRIVACY AUDIT LOGS TABLE (Section 8)
CREATE TABLE IF NOT EXISTS public.dpdp_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,                   -- auth_login, auth_failed, consent_granted, consent_withdrawn, dsr_created, pii_accessed, pii_exported, pii_erased, admin_action
    actor_id TEXT,                              -- User or Admin ID
    actor_email TEXT,                           -- Actor Email
    actor_role TEXT DEFAULT 'data_principal',   -- data_principal, admin, system, subprocessor
    resource_type TEXT NOT NULL,                -- student_accounts, enrollments, consent, grievance, etc.
    resource_id TEXT,                           -- Primary key or identifier of resource
    action TEXT NOT NULL,                       -- CREATE, READ, UPDATE, DELETE, EXPORT, WITHDRAW
    status TEXT NOT NULL DEFAULT 'success',     -- success, failed, blocked
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,          -- Sanitized details (Zero raw passwords/tokens)
    previous_hash TEXT,                         -- Cryptographic chain hash
    current_hash TEXT,                          -- SHA-256 integrity digest of log entry
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpdp_audit_event ON public.dpdp_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_dpdp_audit_actor ON public.dpdp_audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_dpdp_audit_created ON public.dpdp_audit_logs(created_at);

-- 5. DATA RETENTION POLICIES & DELETION LEDGER
CREATE TABLE IF NOT EXISTS public.dpdp_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_category TEXT UNIQUE NOT NULL,         -- financial_transactions, student_learning_records, marketing_leads, session_logs, consent_evidence
    retention_period_days INT NOT NULL,         -- Duration in days
    legal_basis TEXT NOT NULL,                  -- statutory_tax_compliance, contractual_fulfillment, legitimate_use
    legal_hold_active BOOLEAN DEFAULT false,
    legal_hold_reason TEXT,
    auto_purge_enabled BOOLEAN DEFAULT true,
    last_purged_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dpdp_deletion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL,        -- e.g. DEL-CERT-2026-XXXXXX
    data_principal_email TEXT NOT NULL,
    request_id TEXT,                            -- Linked DSR ID
    categories_erased TEXT[] NOT NULL,
    records_erased_count INT DEFAULT 0,
    anonymized_count INT DEFAULT 0,
    legal_hold_retained_categories TEXT[] DEFAULT '{}',
    erasure_method TEXT DEFAULT 'cryptographic_overwrite_and_anonymize',
    performed_by TEXT DEFAULT 'system_automated_purge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VERIFIABLE PARENTAL CONSENTS TABLE (Section 9 - Children's Data Protection)
CREATE TABLE IF NOT EXISTS public.dpdp_parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    minor_name TEXT NOT NULL,
    minor_email TEXT NOT NULL,
    minor_dob DATE NOT NULL,
    guardian_name TEXT NOT NULL,
    guardian_email TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    relationship TEXT NOT NULL,                 -- parent, legal_guardian
    verification_method TEXT NOT NULL,          -- otp_email, id_declaration
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    consent_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',              -- pending, verified, revoked
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DATA BREACH INCIDENT LOGS TABLE (Section 8(6))
CREATE TABLE IF NOT EXISTS public.dpdp_breach_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id TEXT UNIQUE NOT NULL,           -- e.g. BREACH-2026-XXXXXX
    title TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low',       -- low, medium, high, critical
    status TEXT NOT NULL DEFAULT 'detected',    -- detected, contained, investigating, resolved, closed
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contained_at TIMESTAMPTZ,
    affected_principals_count INT DEFAULT 0,
    categories_involved TEXT[] NOT NULL,
    description TEXT NOT NULL,
    root_cause TEXT,
    containment_measures TEXT,
    dpbi_notified BOOLEAN DEFAULT false,
    dpbi_notified_at TIMESTAMPTZ,
    principals_notified BOOLEAN DEFAULT false,
    principals_notified_at TIMESTAMPTZ,
    remedial_actions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default DPDP Retention Policies
INSERT INTO public.dpdp_retention_policies (data_category, retention_period_days, legal_basis, legal_hold_active, auto_purge_enabled)
VALUES 
('financial_transactions', 2920, 'Statutory Tax & GST compliance (8 years)', true, false),
('student_learning_records', 1825, 'Contractual fulfillment & lifetime certificate verification (5 years post-inactivity)', false, true),
('marketing_leads', 180, 'Consent-based recruitment & lead nurturing (6 months)', false, true),
('session_logs', 90, 'Security by design & threat telemetry (90 days)', false, true),
('consent_evidence', 1825, 'Statutory DPDP compliance audit trial (5 years)', true, false)
ON CONFLICT (data_category) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.dpdp_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_breach_incidents ENABLE ROW LEVEL SECURITY;

-- Public read/insert policies for client operations
CREATE POLICY "Allow public insert to dpdp_consent_records" ON public.dpdp_consent_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select dpdp_consent_records" ON public.dpdp_consent_records FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update dpdp_consent_records" ON public.dpdp_consent_records FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public insert to dpdp_user_requests" ON public.dpdp_user_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select dpdp_user_requests" ON public.dpdp_user_requests FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update dpdp_user_requests" ON public.dpdp_user_requests FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public insert to dpdp_grievances" ON public.dpdp_grievances FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select dpdp_grievances" ON public.dpdp_grievances FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update dpdp_grievances" ON public.dpdp_grievances FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public insert to dpdp_audit_logs" ON public.dpdp_audit_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select dpdp_audit_logs" ON public.dpdp_audit_logs FOR SELECT TO public USING (true);

CREATE POLICY "Allow public select dpdp_retention_policies" ON public.dpdp_retention_policies FOR SELECT TO public USING (true);
CREATE POLICY "Allow public select dpdp_deletion_logs" ON public.dpdp_deletion_logs FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to dpdp_deletion_logs" ON public.dpdp_deletion_logs FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public insert to dpdp_parental_consents" ON public.dpdp_parental_consents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select dpdp_parental_consents" ON public.dpdp_parental_consents FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update dpdp_parental_consents" ON public.dpdp_parental_consents FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public select dpdp_breach_incidents" ON public.dpdp_breach_incidents FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to dpdp_breach_incidents" ON public.dpdp_breach_incidents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update dpdp_breach_incidents" ON public.dpdp_breach_incidents FOR UPDATE TO public USING (true);
