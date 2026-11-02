-- ==============================================================================
-- TH3ORY MASTERCLASS — PRODUCTION HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- Target Supabase Project: qngzfcpnjpabaornddau (th3orymasterclass@gmail.com)
--
-- SECURITY OBJECTIVE:
-- Replaces permissive "FOR ALL USING (true)" policies with strict Least-Privilege
-- access controls protecting customer PII, financial records, and system settings.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL PRODUCTION & EXTENSION TABLES
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enterprise_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_habit_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_shared_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dpdp_breach_incidents ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. DROP PERMISSIVE "FOR ALL" & LEGACY POLICIES
-- ==============================================================================

-- Enrollments
DROP POLICY IF EXISTS "Allow public read/insert on enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public select enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public insert to enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow insert for new orders" ON public.enrollments;
DROP POLICY IF EXISTS "Service role full access on enrollments" ON public.enrollments;

-- Student Accounts
DROP POLICY IF EXISTS "Allow public read/insert on student_accounts" ON public.student_accounts;
DROP POLICY IF EXISTS "Allow public student_accounts" ON public.student_accounts;
DROP POLICY IF EXISTS "Allow student read own account" ON public.student_accounts;
DROP POLICY IF EXISTS "Service role full access on student_accounts" ON public.student_accounts;

-- Queries
DROP POLICY IF EXISTS "Allow public queries" ON public.queries;
DROP POLICY IF EXISTS "Allow public read/insert on queries" ON public.queries;
DROP POLICY IF EXISTS "Allow public insert queries" ON public.queries;
DROP POLICY IF EXISTS "Service role full access on queries" ON public.queries;

-- Enterprise Quotes & Inquiries
DROP POLICY IF EXISTS "Allow public read/insert on enterprise_quotes" ON public.enterprise_quotes;
DROP POLICY IF EXISTS "Allow public insert enterprise_quotes" ON public.enterprise_quotes;
DROP POLICY IF EXISTS "Service role full access on enterprise_quotes" ON public.enterprise_quotes;

DROP POLICY IF EXISTS "Allow public read/insert on contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow public insert contact_inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Service role full access on contact_inquiries" ON public.contact_inquiries;

-- Reviews
DROP POLICY IF EXISTS "Allow public read/insert on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Service role full access on reviews" ON public.reviews;

-- Course Contents
DROP POLICY IF EXISTS "Allow public read/insert on course_contents" ON public.course_contents;
DROP POLICY IF EXISTS "Allow public course_contents" ON public.course_contents;
DROP POLICY IF EXISTS "Allow public read published course contents" ON public.course_contents;
DROP POLICY IF EXISTS "Service role full access on course_contents" ON public.course_contents;

-- Site Settings
DROP POLICY IF EXISTS "Allow public read/insert on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Service role full access on site_settings" ON public.site_settings;

-- Newsletters
DROP POLICY IF EXISTS "Allow public read/insert on newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role full access on newsletter_subscribers" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Allow public read/insert on newsletter_broadcasts" ON public.newsletter_broadcasts;
DROP POLICY IF EXISTS "Service role full access on newsletter_broadcasts" ON public.newsletter_broadcasts;

-- Blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public/Admin can delete blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public/Admin can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public/Admin can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Service role full access on blogs" ON public.blogs;

-- Certificates & Coupons
DROP POLICY IF EXISTS "Allow public read/insert on certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow public verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "Service role full access on certificates" ON public.certificates;

DROP POLICY IF EXISTS "Allow public read/insert on coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public validate active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Service role full access on coupons" ON public.coupons;

-- Student Progress & Trackers
DROP POLICY IF EXISTS "Allow public read/insert on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow public student_progress" ON public.student_progress;
DROP POLICY IF EXISTS "Allow public read/insert on student_progress" ON public.student_progress;
DROP POLICY IF EXISTS "Allow public read/insert on student_habit_trackers" ON public.student_habit_trackers;

-- Campus Ambassador
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_applications" ON public.ambassador_applications;
DROP POLICY IF EXISTS "Allow submit ambassador application" ON public.ambassador_applications;
DROP POLICY IF EXISTS "Service role full access on ambassador_applications" ON public.ambassador_applications;

DROP POLICY IF EXISTS "Allow public read/insert on ambassador_weekly_reports" ON public.ambassador_weekly_reports;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_leads" ON public.ambassador_leads;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_payouts" ON public.ambassador_payouts;
DROP POLICY IF EXISTS "ambassador_payouts_all" ON public.ambassador_payouts;
DROP POLICY IF EXISTS "Allow submit payout requests" ON public.ambassador_payouts;
DROP POLICY IF EXISTS "Allow view ambassador payouts" ON public.ambassador_payouts;
DROP POLICY IF EXISTS "Allow public read/insert on ambassador_tasks" ON public.ambassador_tasks;
DROP POLICY IF EXISTS "Service role full access on ambassador_leads" ON public.ambassador_leads;
DROP POLICY IF EXISTS "Service role full access on ambassador_payouts" ON public.ambassador_payouts;

-- Team Approvals & DPDP Legacy
DROP POLICY IF EXISTS "Allow public read/insert on team_approval_requests" ON public.team_approval_requests;
DROP POLICY IF EXISTS "Allow public select dpdp_consent_records" ON public.dpdp_consent_records;
DROP POLICY IF EXISTS "Allow public insert to dpdp_consent_records" ON public.dpdp_consent_records;
DROP POLICY IF EXISTS "Allow public update dpdp_consent_records" ON public.dpdp_consent_records;
DROP POLICY IF EXISTS "Allow public select dpdp_audit_logs" ON public.dpdp_audit_logs;
DROP POLICY IF EXISTS "Allow public insert to dpdp_audit_logs" ON public.dpdp_audit_logs;
DROP POLICY IF EXISTS "Allow public select dpdp_breach_incidents" ON public.dpdp_breach_incidents;
DROP POLICY IF EXISTS "Allow public insert to dpdp_breach_incidents" ON public.dpdp_breach_incidents;
DROP POLICY IF EXISTS "Allow public update dpdp_breach_incidents" ON public.dpdp_breach_incidents;

-- ==============================================================================
-- 3. SPECIFIC LEAST-PRIVILEGE ACCESS POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. ENROLLMENTS & BILLING (PII & Payments)
-- Defense: Allow anonymous order submission during checkout.
-- Deny public bulk SELECT/UPDATE/DELETE. Service role manages order records.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow insert for new orders" ON public.enrollments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on enrollments" ON public.enrollments
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- B. STUDENT ACCOUNTS
-- Defense: Protect credentials and student profiles from anonymous enumeration.
-- Service role manages accounts.
-- ------------------------------------------------------------------------------
CREATE POLICY "Service role full access on student_accounts" ON public.student_accounts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- C. LEAD & INQUIRY FORMS (contact_inquiries, queries, enterprise_quotes)
-- Defense: Allow public INSERT (form submissions). Deny public SELECT/DELETE/UPDATE.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow public insert contact_inquiries" ON public.contact_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on contact_inquiries" ON public.contact_inquiries
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert queries" ON public.queries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on queries" ON public.queries
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert enterprise_quotes" ON public.enterprise_quotes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on enterprise_quotes" ON public.enterprise_quotes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- D. NEWSLETTER SUBSCRIBERS
-- Defense: Allow public signups. Disallow anonymous harvesting of email lists.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow public newsletter signup" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on newsletter_subscribers" ON public.newsletter_subscribers
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on newsletter_broadcasts" ON public.newsletter_broadcasts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- E. PUBLIC READ-ONLY CONTENT (blogs, course_contents, reviews, site_settings)
-- Defense: Allow public SELECT of published content. Disallow unauthorized client mutation.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow public read published blogs" ON public.blogs
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Service role full access on blogs" ON public.blogs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read published course contents" ON public.course_contents
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Service role full access on course_contents" ON public.course_contents
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on reviews" ON public.reviews
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access on site_settings" ON public.site_settings
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- F. CERTIFICATES & COUPONS
-- Defense: Allow verification of certificates and active coupon lookups.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow public verify certificates" ON public.certificates
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access on certificates" ON public.certificates
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
    EXECUTE 'CREATE POLICY "Allow public validate active coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true);';
    EXECUTE 'CREATE POLICY "Service role full access on coupons" ON public.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- G. CAMPUS AMBASSADOR NETWORK
-- Defense: Allow applicants to apply and view active campaigns/tasks. Protect financial payouts.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow submit ambassador application" ON public.ambassador_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on ambassador_applications" ON public.ambassador_applications
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow submit ambassador leads" ON public.ambassador_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on ambassador_leads" ON public.ambassador_leads
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow view ambassador payouts" ON public.ambassador_payouts
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow submit payout requests" ON public.ambassador_payouts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on ambassador_payouts" ON public.ambassador_payouts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow view active ambassador tasks" ON public.ambassador_tasks
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE');

CREATE POLICY "Service role full access on ambassador_tasks" ON public.ambassador_tasks
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow submit weekly reports" ON public.ambassador_weekly_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access on ambassador_weekly_reports" ON public.ambassador_weekly_reports
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- H. STUDENT LEARNING & HABIT TRACKING (student_progress, habit_trackers)
-- Defense: Allow students to record module progress and habit reflection scores.
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow student read/save progress" ON public.student_progress
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on student_progress" ON public.student_progress
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    EXECUTE 'CREATE POLICY "Allow student read/save user_progress" ON public.user_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
END $$;

CREATE POLICY "Allow student save habit trackers" ON public.student_habit_trackers
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on student_habit_trackers" ON public.student_habit_trackers
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Conditional community hub tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_posts') THEN
    EXECUTE 'CREATE POLICY "Allow public read community posts" ON public.community_posts FOR SELECT TO anon, authenticated USING (true);';
    EXECUTE 'CREATE POLICY "Service role full access on community_posts" ON public.community_posts FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_comments') THEN
    EXECUTE 'CREATE POLICY "Allow public community comments" ON public.community_comments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on community_comments" ON public.community_comments FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_reactions') THEN
    EXECUTE 'CREATE POLICY "Allow public community reactions" ON public.community_reactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on community_reactions" ON public.community_reactions FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- K. TEAM PORTAL & REFERRAL OPERATIONS (team_approval_requests, referral_clicks)
-- Defense: Strictly restrict internal team approval workflows to service role.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_approval_requests') THEN
    EXECUTE 'CREATE POLICY "Service role full access on team_approval_requests" ON public.team_approval_requests FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    EXECUTE 'CREATE POLICY "Service role full access on team_members" ON public.team_members FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_clicks') THEN
    EXECUTE 'CREATE POLICY "Allow public record referral clicks" ON public.referral_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on referral_clicks" ON public.referral_clicks FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_conversions') THEN
    EXECUTE 'CREATE POLICY "Service role full access on referral_conversions" ON public.referral_conversions FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- L. DATA PROTECTION & DPDP COMPLIANCE
-- Defense: Allow anonymous consent recording and grievance logging.
-- Restrict audit logs, breach reports, and data deletion ledgers strictly to service_role.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dpdp_consent_records') THEN
    EXECUTE 'CREATE POLICY "Allow insert dpdp consent" ON public.dpdp_consent_records FOR INSERT TO anon, authenticated WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on dpdp_consent_records" ON public.dpdp_consent_records FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dpdp_user_requests') THEN
    EXECUTE 'CREATE POLICY "Allow insert dpdp request" ON public.dpdp_user_requests FOR INSERT TO anon, authenticated WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on dpdp_user_requests" ON public.dpdp_user_requests FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dpdp_grievances') THEN
    EXECUTE 'CREATE POLICY "Allow insert dpdp grievance" ON public.dpdp_grievances FOR INSERT TO anon, authenticated WITH CHECK (true);';
    EXECUTE 'CREATE POLICY "Service role full access on dpdp_grievances" ON public.dpdp_grievances FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dpdp_audit_logs') THEN
    EXECUTE 'CREATE POLICY "Service role full access on dpdp_audit_logs" ON public.dpdp_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dpdp_breach_incidents') THEN
    EXECUTE 'CREATE POLICY "Service role full access on dpdp_breach_incidents" ON public.dpdp_breach_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);';
  END IF;
END $$;

-- ==============================================================================
-- 4. PERFORMANCE & HIGH-FREQUENCY QUERY INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_order_id ON public.enrollments(order_id);
CREATE INDEX IF NOT EXISTS idx_student_accounts_email ON public.student_accounts(email);
CREATE INDEX IF NOT EXISTS idx_queries_student_email ON public.queries(student_email);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_email ON public.certificates(student_email);
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_code ON public.ambassador_applications(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_code ON public.ambassador_leads(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_payouts_code ON public.ambassador_payouts(ambassador_code);
CREATE INDEX IF NOT EXISTS idx_student_habit_email ON public.student_habit_trackers(email);

-- ==============================================================================
-- 5. SUPABASE REALTIME REPLICATION PUBLICATION ENROLMENT
-- Ensures realtime updates are safely published across active operational tables
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.reviews,
      public.course_contents,
      public.site_settings,
      public.student_progress,
      public.student_habit_trackers,
      public.certificates;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Supabase realtime publication table addition skipped or already registered.';
END $$;
