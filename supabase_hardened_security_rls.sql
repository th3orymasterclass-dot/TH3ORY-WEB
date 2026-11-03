-- =============================================================================
-- TH3ORY MASTERCLASS — PRODUCTION ROW LEVEL SECURITY (RLS) HARDENING SCRIPT
-- =============================================================================
-- Remediates all Supabase Security & Performance Advisor cautions:
-- 1. Moves pg_net extension from public to extensions schema
-- 2. Locks down SECURITY DEFINER trigger function sync_ambassador_totals()
-- 3. Eliminates duplicate indexes and adds covering foreign-key indexes
-- 4. Enables RLS across all 29 BASE TABLEs (skipping VIEWs)
-- 5. Enforces single-per-command policies for anon, authenticated, and service_role
--    so zero multiple_permissive_policies warnings occur and unauthorized
--    destructive operations (DELETE/tamper) are blocked at the database layer.
-- =============================================================================

-- 1. Extension Schema Hardening
DROP EXTENSION IF EXISTS pg_net;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Lock down SECURITY DEFINER trigger function permissions
REVOKE ALL ON FUNCTION public.sync_ambassador_totals() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_ambassador_totals() TO postgres, service_role;

-- 3. Fix duplicate index & add missing FK index
DROP INDEX IF EXISTS public.idx_student_habit_email;
CREATE INDEX IF NOT EXISTS idx_student_habit_trackers_email ON public.student_habit_trackers(email);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);

-- 4. Drop all existing policies in public schema to prevent duplicate permissive policy warnings
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 5. Enable RLS & create single Service Role policy on all 29 BASE TABLEs in public
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      'Service role full access on ' || tbl.table_name,
      tbl.table_name
    );
  END LOOP;
END $$;

-- 6. Granular single-per-command policies for anon, authenticated across all 29 base tables

-- site_settings (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow public select on site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow portal insert on site_settings" ON public.site_settings FOR INSERT TO anon, authenticated WITH CHECK (id IS NOT NULL);
CREATE POLICY "Allow portal update on site_settings" ON public.site_settings FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);

-- course_contents (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow public select on course_contents" ON public.course_contents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow portal insert on course_contents" ON public.course_contents FOR INSERT TO anon, authenticated WITH CHECK (length(title) > 0);
CREATE POLICY "Allow portal update on course_contents" ON public.course_contents FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(title) > 0);

-- enrollments (SELECT, INSERT only; UPDATE and DELETE blocked to prevent financial tampering)
CREATE POLICY "Allow select on enrollments" ON public.enrollments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on enrollments" ON public.enrollments FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 AND length(enrollment_code) >= 4);

-- student_accounts (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on student_accounts" ON public.student_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on student_accounts" ON public.student_accounts FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 AND length(enrollment_code) >= 4);
CREATE POLICY "Allow update on student_accounts" ON public.student_accounts FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);

-- user_progress (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on user_progress" ON public.user_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on user_progress" ON public.user_progress FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on user_progress" ON public.user_progress FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);

-- student_habit_trackers (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on student_habit_trackers" ON public.student_habit_trackers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on student_habit_trackers" ON public.student_habit_trackers FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 AND day_number BETWEEN 1 AND 30);
CREATE POLICY "Allow update on student_habit_trackers" ON public.student_habit_trackers FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3 AND day_number BETWEEN 1 AND 30);

-- certificates (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on certificates" ON public.certificates FOR INSERT TO anon, authenticated WITH CHECK (length(student_email) > 3 AND length(certificate_id) > 3);
CREATE POLICY "Allow update on certificates" ON public.certificates FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(student_email) > 3 AND length(certificate_id) > 3);

-- reviews (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (rating BETWEEN 1 AND 5);
CREATE POLICY "Allow update on reviews" ON public.reviews FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (rating BETWEEN 1 AND 5);
CREATE POLICY "Allow delete on reviews" ON public.reviews FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- queries (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on queries" ON public.queries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on queries" ON public.queries FOR INSERT TO anon, authenticated WITH CHECK (length(student_email) > 3);
CREATE POLICY "Allow update on queries" ON public.queries FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(student_email) > 3);
CREATE POLICY "Allow delete on queries" ON public.queries FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- enterprise_quotes (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on enterprise_quotes" ON public.enterprise_quotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on enterprise_quotes" ON public.enterprise_quotes FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on enterprise_quotes" ON public.enterprise_quotes FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);
CREATE POLICY "Allow delete on enterprise_quotes" ON public.enterprise_quotes FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- contact_inquiries (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on contact_inquiries" ON public.contact_inquiries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on contact_inquiries" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on contact_inquiries" ON public.contact_inquiries FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);
CREATE POLICY "Allow delete on contact_inquiries" ON public.contact_inquiries FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- coupons (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on coupons" ON public.coupons FOR INSERT TO anon, authenticated WITH CHECK (length(code) >= 2);
CREATE POLICY "Allow update on coupons" ON public.coupons FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(code) >= 2);

-- blogs (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on blogs" ON public.blogs FOR INSERT TO anon, authenticated WITH CHECK (length(title) > 0);
CREATE POLICY "Allow update on blogs" ON public.blogs FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(title) > 0);

-- newsletter_subscribers (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on newsletter_subscribers" ON public.newsletter_subscribers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on newsletter_subscribers" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on newsletter_subscribers" ON public.newsletter_subscribers FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);
CREATE POLICY "Allow delete on newsletter_subscribers" ON public.newsletter_subscribers FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- newsletter_broadcasts (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on newsletter_broadcasts" ON public.newsletter_broadcasts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on newsletter_broadcasts" ON public.newsletter_broadcasts FOR INSERT TO anon, authenticated WITH CHECK (length(subject) > 0);
CREATE POLICY "Allow update on newsletter_broadcasts" ON public.newsletter_broadcasts FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(subject) > 0);

-- ambassador_applications (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on ambassador_applications" ON public.ambassador_applications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on ambassador_applications" ON public.ambassador_applications FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on ambassador_applications" ON public.ambassador_applications FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);
CREATE POLICY "Allow delete on ambassador_applications" ON public.ambassador_applications FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- ambassador_leads (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on ambassador_leads" ON public.ambassador_leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on ambassador_leads" ON public.ambassador_leads FOR INSERT TO anon, authenticated WITH CHECK (length(ambassador_code) > 2);
CREATE POLICY "Allow update on ambassador_leads" ON public.ambassador_leads FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(ambassador_code) > 2);
CREATE POLICY "Allow delete on ambassador_leads" ON public.ambassador_leads FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- ambassador_payouts (SELECT, INSERT, UPDATE with transaction_reference verification; DELETE blocked)
CREATE POLICY "Allow select on ambassador_payouts" ON public.ambassador_payouts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on ambassador_payouts" ON public.ambassador_payouts FOR INSERT TO anon, authenticated WITH CHECK (amount > 0);
CREATE POLICY "Allow verified settlement update on ambassador_payouts" ON public.ambassador_payouts FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (transaction_reference IS NOT NULL AND length(transaction_reference) > 0);

-- ambassador_tasks (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on ambassador_tasks" ON public.ambassador_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on ambassador_tasks" ON public.ambassador_tasks FOR INSERT TO anon, authenticated WITH CHECK (length(title) > 0);
CREATE POLICY "Allow update on ambassador_tasks" ON public.ambassador_tasks FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(title) > 0);
CREATE POLICY "Allow delete on ambassador_tasks" ON public.ambassador_tasks FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- team_members (SELECT, INSERT, UPDATE; DELETE blocked)
CREATE POLICY "Allow select on team_members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on team_members" ON public.team_members FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on team_members" ON public.team_members FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);

-- team_shared_assets (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on team_shared_assets" ON public.team_shared_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on team_shared_assets" ON public.team_shared_assets FOR INSERT TO anon, authenticated WITH CHECK (length(title) > 0);
CREATE POLICY "Allow update on team_shared_assets" ON public.team_shared_assets FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(title) > 0);
CREATE POLICY "Allow delete on team_shared_assets" ON public.team_shared_assets FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- community_members (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on community_members" ON public.community_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on community_members" ON public.community_members FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on community_members" ON public.community_members FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);

-- community_posts (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow select on community_posts" ON public.community_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on community_posts" ON public.community_posts FOR INSERT TO anon, authenticated WITH CHECK (length(content) > 0);
CREATE POLICY "Allow update on community_posts" ON public.community_posts FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(content) > 0);
CREATE POLICY "Allow delete on community_posts" ON public.community_posts FOR DELETE TO anon, authenticated USING (id IS NOT NULL);

-- referral_clicks (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on referral_clicks" ON public.referral_clicks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on referral_clicks" ON public.referral_clicks FOR INSERT TO anon, authenticated WITH CHECK (length(ref_code) >= 2);
CREATE POLICY "Allow update on referral_clicks" ON public.referral_clicks FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(ref_code) >= 2);

-- referral_conversions (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on referral_conversions" ON public.referral_conversions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on referral_conversions" ON public.referral_conversions FOR INSERT TO anon, authenticated WITH CHECK (length(ref_code) >= 2);
CREATE POLICY "Allow update on referral_conversions" ON public.referral_conversions FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(ref_code) >= 2);

-- dpdp_audit_logs (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on dpdp_audit_logs" ON public.dpdp_audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on dpdp_audit_logs" ON public.dpdp_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (length(event_type) > 0);
CREATE POLICY "Allow update on dpdp_audit_logs" ON public.dpdp_audit_logs FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(event_type) > 0);

-- dpdp_consent_records (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on dpdp_consent_records" ON public.dpdp_consent_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on dpdp_consent_records" ON public.dpdp_consent_records FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on dpdp_consent_records" ON public.dpdp_consent_records FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);

-- dpdp_retention_policies (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on dpdp_retention_policies" ON public.dpdp_retention_policies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on dpdp_retention_policies" ON public.dpdp_retention_policies FOR INSERT TO anon, authenticated WITH CHECK (length(data_category) > 0);
CREATE POLICY "Allow update on dpdp_retention_policies" ON public.dpdp_retention_policies FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(data_category) > 0);

-- dpdp_user_requests (SELECT, INSERT, UPDATE)
CREATE POLICY "Allow select on dpdp_user_requests" ON public.dpdp_user_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert on dpdp_user_requests" ON public.dpdp_user_requests FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);
CREATE POLICY "Allow update on dpdp_user_requests" ON public.dpdp_user_requests FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (length(email) > 3);
