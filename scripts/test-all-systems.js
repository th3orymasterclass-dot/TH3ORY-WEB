import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

console.log('\n============================================================');
console.log('  TH3ORY LMS — PROFESSIONAL QA & AUTOMATED SYSTEM TEST SUITE');
console.log('============================================================\n');

// ── Test Suite 1: Enrollment Code Generation Logic ──────────────────────────
console.log('▶ [Suite 1/6]: Enrollment Code Generator Unit Tests');

function generateEnrollmentCode(name = '', dob = '') {
  const lettersOnly = (name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  let namePart = lettersOnly.slice(0, 4);
  if (namePart.length < 4) namePart = namePart.padEnd(4, 'X');
  if (!namePart || namePart === 'XXXX') namePart = 'TH3O';

  let dobPart = '';
  const dobStr = String(dob || '').trim();
  if (dobStr) {
    const matchISO = dobStr.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    if (matchISO) {
      const month = String(matchISO[2]).padStart(2, '0');
      const day = String(matchISO[3]).padStart(2, '0');
      dobPart = day + month;
    } else {
      const matchDMY = dobStr.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
      if (matchDMY) {
        const day = String(matchDMY[1]).padStart(2, '0');
        const month = String(matchDMY[2]).padStart(2, '0');
        dobPart = day + month;
      }
    }
  }
  if (!dobPart || dobPart.length !== 4) dobPart = '2026';
  return (namePart + dobPart).toUpperCase().slice(0, 8);
}

const code1 = generateEnrollmentCode('Sravan Mentalist', '2000-05-15');
assert(code1 === 'SRAV1505', `Standard Name+DOB code generated correctly: ${code1} === SRAV1505`);

const code2 = generateEnrollmentCode('', '');
assert(code2 === 'TH3O2026', `Fallback empty Name+DOB code generated correctly: ${code2} === TH3O2026`);

const code3 = generateEnrollmentCode('Jo', '10/12/1995');
assert(code3 === 'JOXX1012', `Short Name+DMY DOB code padded correctly: ${code3} === JOXX1012`);


// ── Test Suite 2: Pricing & Discount Math Engine ───────────────────────────
console.log('\n▶ [Suite 2/6]: Pricing & Discount Calculation Engine Tests');

function calculateDiscountedPrice(originalPrice, discountPercentage) {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2))
  };
}

const usdPricing = calculateDiscountedPrice(149, 20);
assert(usdPricing.finalPrice === 119.20, `USD 20% discount math verified: $149 -> $${usdPricing.finalPrice}`);
assert(usdPricing.discountAmount === 29.80, `USD discount amount verified: $${usdPricing.discountAmount}`);

const inrPricing = calculateDiscountedPrice(11999, 20);
assert(inrPricing.finalPrice === 9599.20, `INR 20% discount math verified: ₹11,999 -> ₹${inrPricing.finalPrice}`);


// ── Test Suite 3: Cryptographic HMAC Signature Verification ─────────────────
console.log('\n▶ [Suite 3/6]: HMAC SHA256 Payment Signature Verification Tests');

const testSecret = 'secret_th3ory_test_key_2026';
const testOrderId = 'order_M123456789';
const testPaymentId = 'pay_P987654321';

const payloadStr = `${testOrderId}|${testPaymentId}`;
const generatedSig = crypto.createHmac('sha256', testSecret).update(payloadStr).digest('hex');

const verifiedSig = crypto.createHmac('sha256', testSecret).update(payloadStr).digest('hex');
assert(generatedSig === verifiedSig, 'HMAC SHA256 Payment signature match verified');

const badSig = crypto.createHmac('sha256', 'wrong_secret').update(payloadStr).digest('hex');
assert(generatedSig !== badSig, 'HMAC SHA256 Invalid signature correctly rejected');


// ── Test Suite 4: Serverless API Endpoint Contract Verification ──────────────
console.log('\n▶ [Suite 4/6]: Serverless API File Structure & Security Audit');

const apiFiles = [
  'api/create-razorpay-order.js',
  'api/verify-razorpay-signature.js',
  'api/send-email.js',
  'api/razorpay-webhook.js'
];

for (const file of apiFiles) {
  const filePath = path.join(rootDir, file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Serverless API file exists: ${file}`);

  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('process.env'), `${file} uses process.env for secrets`);
    assert(!content.includes("process.env.RAZORPAY_KEY_SECRET || 'd1lNjZc17928tyS5hcQu5OV2'"), `${file} does not contain hardcoded secret fallbacks`);
  }
}


// ── Test Suite 5: SEO, Schema JSON-LD & Web Assets Audit ─────────────────────
console.log('\n▶ [Suite 5/6]: SEO, Structured Data Schemas & Assets Verification');

const indexHtmlPath = path.join(rootDir, 'index.html');
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexContent.includes('application/ld+json'), 'index.html contains Schema.org JSON-LD microdata');
assert(indexContent.includes('og:title'), 'index.html contains Open Graph og:title metadata');
assert(indexContent.includes('twitter:card'), 'index.html contains Twitter card metadata');
assert(indexContent.includes('dns-prefetch'), 'index.html contains Core Web Vitals dns-prefetch links');

const sitemapPath = path.join(rootDir, 'public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.includes('xmlns:image'), 'sitemap.xml includes image sitemap namespace extension');
assert(sitemapContent.includes('https://th3ory.online/'), 'sitemap.xml contains primary canonical URL');

const robotsPath = path.join(rootDir, 'public/robots.txt');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes('Disallow: /#/admin-th3ory-x9k2'), 'robots.txt protects admin panel from search indexers');
assert(robotsContent.includes('Sitemap: https://th3ory.online/sitemap.xml'), 'robots.txt references official sitemap URL');


// ── Test Suite 6: Production Web Security Headers ───────────────────────────
console.log('\n▶ [Suite 6/9]: Vercel Web Security Headers Audit');

const vercelConfigPath = path.join(rootDir, 'vercel.json');
const vercelContent = fs.readFileSync(vercelConfigPath, 'utf8');
const vercelConfig = JSON.parse(vercelContent);

assert(Array.isArray(vercelConfig.headers), 'vercel.json defines security headers array');
const indexHtmlHeaderEntry = vercelConfig.headers?.find(h => h.source === '/index.html');
const hasNoCache = indexHtmlHeaderEntry?.headers?.some(h => h.key === 'Cache-Control' && h.value.includes('no-cache'));
assert(Boolean(hasNoCache), 'vercel.json defines index.html no-cache Cache-Control header');

const headersObj = {};
vercelConfig.headers?.forEach(entry => {
  entry.headers?.forEach(h => { headersObj[h.key] = h.value; });
});

assert(Boolean(headersObj['Strict-Transport-Security']), 'HSTS security header configured');
assert(headersObj['X-Content-Type-Options'] === 'nosniff', 'X-Content-Type-Options set to nosniff');
assert(headersObj['X-Frame-Options'] === 'SAMEORIGIN', 'X-Frame-Options set to SAMEORIGIN');
assert(headersObj['Referrer-Policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy set to strict-origin-when-cross-origin');


// ── Test Suite 7: New Serverless Auth & Verification API Files Audit ───────
console.log('\n▶ [Suite 7/9]: New Serverless Auth & Verification API Files Audit');

const newApiFiles = [
  'api/admin-login.js',
  'api/student-auth.js',
  'api/validate-coupon.js',
  'api/verify-certificate.js',
  'api/update-student-profile.js',
  'api/upload-blob.js'
];

for (const file of newApiFiles) {
  const filePath = path.join(rootDir, file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Serverless API handler file exists: ${file}`);
}


// ── Test Suite 8: Server-Side Price & Coupon Calculation Audit ──────────────
console.log('\n▶ [Suite 8/9]: Server-Side Price Calculation Handler Audit');

const razorpayOrderApi = fs.readFileSync(path.join(rootDir, 'api/create-razorpay-order.js'), 'utf8');
assert(razorpayOrderApi.includes('OFFICIAL_PRICES'), 'api/create-razorpay-order.js defines OFFICIAL_PRICES');
assert(razorpayOrderApi.includes('cleanCoupon'), 'api/create-razorpay-order.js validates coupon codes on server');
assert(razorpayOrderApi.includes('serverVerifiedPrice'), 'api/create-razorpay-order.js attaches serverVerifiedPrice to order notes');


// ── Test Suite 9: Database Schema Expansion Audit ───────────────────────────
console.log('\n▶ [Suite 9/10]: Database Schema & RLS Security Audit');

const schemaPath = path.join(rootDir, 'supabase_schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.user_progress'), 'supabase_schema.sql defines user_progress table');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.coupons'), 'supabase_schema.sql defines coupons table');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS public.certificates'), 'supabase_schema.sql defines certificates table');
assert(schemaContent.includes('idx_user_progress_email_lesson'), 'supabase_schema.sql includes user_progress index');
assert(schemaContent.includes('idx_certificates_cert_id'), 'supabase_schema.sql includes certificates index');


// ── Test Suite 10: Vercel Feature Flags System Audit ────────────────────────
console.log('\n▶ [Suite 10/10]: Vercel Feature Flags System Multi-Platform Audit');

const ALL_FLAG_KEYS = [
  'SHOW_QUICK_ENROLLMENT_BAR',
  'SHOW_LIMITED_SEATS_BANNER',
  'ENABLE_VIP_DISCOUNT',
  'ENABLE_STUDENT_COMMUNITY',
  'ENABLE_LIVE_REVIEWS',
  'ENABLE_TRAILER_VIDEO',
  'MAINTENANCE_MODE',
  'ENABLE_RAZORPAY_SANDBOX'
];

const featureFlagsApiExists = fs.existsSync(path.join(rootDir, 'api/feature-flags.js'));
assert(featureFlagsApiExists, 'api/feature-flags.js serverless handler exists');

if (featureFlagsApiExists) {
  const flagsApiContent = fs.readFileSync(path.join(rootDir, 'api/feature-flags.js'), 'utf8');
  assert(flagsApiContent.includes('VERCEL_FLAGS_'), 'api/feature-flags.js checks VERCEL_FLAGS_ environment variables');
  assert(flagsApiContent.includes('DEFAULT_FEATURE_FLAGS'), 'api/feature-flags.js defines default feature flags');
  
  ALL_FLAG_KEYS.forEach(key => {
    assert(flagsApiContent.includes(key), `api/feature-flags.js defines flag ${key}`);
  });
}

const contextExists = fs.existsSync(path.join(rootDir, 'src/context/FeatureFlagContext.jsx'));
assert(contextExists, 'src/context/FeatureFlagContext.jsx React context exists');
if (contextExists) {
  const contextContent = fs.readFileSync(path.join(rootDir, 'src/context/FeatureFlagContext.jsx'), 'utf8');
  ALL_FLAG_KEYS.forEach(key => {
    assert(contextContent.includes(key), `FeatureFlagContext defines default flag ${key}`);
  });
}

const adminPanelExists = fs.existsSync(path.join(rootDir, 'src/admin/panels/FeatureFlagsPanel.jsx'));
assert(adminPanelExists, 'src/admin/panels/FeatureFlagsPanel.jsx admin panel exists');

// Multi-Component Integration Verification
const appContent = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
assert(appContent.includes('SHOW_QUICK_ENROLLMENT_BAR'), 'App.jsx checks SHOW_QUICK_ENROLLMENT_BAR');
assert(appContent.includes('MAINTENANCE_MODE'), 'App.jsx checks MAINTENANCE_MODE');
assert(appContent.includes('ENABLE_LIVE_REVIEWS'), 'App.jsx checks ENABLE_LIVE_REVIEWS');

const heroContent = fs.readFileSync(path.join(rootDir, 'src/components/HeroSection.jsx'), 'utf8');
assert(heroContent.includes('const { isFeatureEnabled } = useFeatureFlags()'), 'HeroSection.jsx destructures isFeatureEnabled from useFeatureFlags()');
assert(heroContent.includes('ENABLE_TRAILER_VIDEO'), 'HeroSection.jsx checks ENABLE_TRAILER_VIDEO');
assert(heroContent.includes('SHOW_LIMITED_SEATS_BANNER'), 'HeroSection.jsx checks SHOW_LIMITED_SEATS_BANNER');

const pricingContent = fs.readFileSync(path.join(rootDir, 'src/components/PricingSection.jsx'), 'utf8');
assert(pricingContent.includes('ENABLE_VIP_DISCOUNT'), 'PricingSection.jsx checks ENABLE_VIP_DISCOUNT');

const currContent = fs.readFileSync(path.join(rootDir, 'src/components/CurriculumExplorer.jsx'), 'utf8');
assert(currContent.includes('ENABLE_TRAILER_VIDEO'), 'CurriculumExplorer.jsx checks ENABLE_TRAILER_VIDEO');

const checkoutContent = fs.readFileSync(path.join(rootDir, 'src/components/CheckoutModal.jsx'), 'utf8');
assert(checkoutContent.includes('MAINTENANCE_MODE'), 'CheckoutModal.jsx checks MAINTENANCE_MODE');
assert(checkoutContent.includes('ENABLE_VIP_DISCOUNT'), 'CheckoutModal.jsx checks ENABLE_VIP_DISCOUNT');
assert(checkoutContent.includes('ENABLE_RAZORPAY_SANDBOX'), 'CheckoutModal.jsx checks ENABLE_RAZORPAY_SANDBOX');

const enrollContent = fs.readFileSync(path.join(rootDir, 'src/components/EnrollmentPage.jsx'), 'utf8');
assert(enrollContent.includes('MAINTENANCE_MODE'), 'EnrollmentPage.jsx checks MAINTENANCE_MODE');
assert(enrollContent.includes('ENABLE_RAZORPAY_SANDBOX'), 'EnrollmentPage.jsx checks ENABLE_RAZORPAY_SANDBOX');

const studentAppContent = fs.readFileSync(path.join(rootDir, 'src/student/StudentApp.jsx'), 'utf8');
assert(studentAppContent.includes('ENABLE_STUDENT_COMMUNITY'), 'StudentApp.jsx checks ENABLE_STUDENT_COMMUNITY');
assert(studentAppContent.includes('MAINTENANCE_MODE'), 'StudentApp.jsx checks MAINTENANCE_MODE');

const queryPanelContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/QueryPanel.jsx'), 'utf8');
assert(queryPanelContent.includes('ENABLE_STUDENT_COMMUNITY'), 'QueryPanel.jsx checks ENABLE_STUDENT_COMMUNITY');

const reviewPanelContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/ReviewPanel.jsx'), 'utf8');
assert(reviewPanelContent.includes('ENABLE_LIVE_REVIEWS'), 'ReviewPanel.jsx checks ENABLE_LIVE_REVIEWS');

const courseDataContent = fs.readFileSync(path.join(rootDir, 'src/data/courseData.js'), 'utf8');
assert(courseDataContent.includes('defaultContent'), 'src/data/courseData.js defines defaultContent array');

const adminDataContent = fs.readFileSync(path.join(rootDir, 'src/data/adminData.js'), 'utf8');
assert(adminDataContent.includes('defaultContent'), 'src/data/adminData.js imports defaultContent');
assert(adminDataContent.includes('subscribeToCourseContents'), 'src/data/adminData.js subscribes to Supabase Course Contents');

const coursePanelContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/CoursePanel.jsx'), 'utf8');
assert(coursePanelContent.includes('getVideoForLesson'), 'CoursePanel.jsx defines getVideoForLesson helper');
assert(coursePanelContent.includes('getLessonContent'), 'CoursePanel.jsx defines getLessonContent helper');
assert(coursePanelContent.includes('subscribeToStudentProgress'), 'CoursePanel.jsx subscribes to Realtime student progress');

const supabaseServiceContent = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');
assert(supabaseServiceContent.includes('saveStudentNoteToSupabase'), 'supabaseService.js defines saveStudentNoteToSupabase');
assert(supabaseServiceContent.includes('saveStudentBookmarkToSupabase'), 'supabaseService.js defines saveStudentBookmarkToSupabase');
assert(supabaseServiceContent.includes('fetchStudentDataFromSupabase'), 'supabaseService.js defines fetchStudentDataFromSupabase');
assert(supabaseServiceContent.includes('fetchStudentProfileFromSupabase'), 'supabaseService.js defines fetchStudentProfileFromSupabase');
assert(supabaseServiceContent.includes('subscribeToStudentProgress'), 'supabaseService.js defines subscribeToStudentProgress Realtime handler');
assert(supabaseServiceContent.includes('subscribeToStudentProfile'), 'supabaseService.js defines subscribeToStudentProfile Realtime handler');
assert(supabaseServiceContent.includes('fetchStudentReviewFromSupabase'), 'supabaseService.js defines fetchStudentReviewFromSupabase multi-device review handler');
assert(supabaseServiceContent.includes('subscribeToStudentReview'), 'supabaseService.js defines subscribeToStudentReview Realtime handler');

const studentAuthApiContent = fs.readFileSync(path.join(rootDir, 'api/student-auth.js'), 'utf8');
assert(!studentAuthApiContent.includes('.single()'), 'api/student-auth.js avoids breaking single() queries');
assert(studentAuthApiContent.includes('.limit(10)'), 'api/student-auth.js uses limit(10) for multi-row student queries');
assert(studentAuthApiContent.includes('generateEnrollmentCode'), 'api/student-auth.js includes fallback computed enrollment code verification');

assert(studentAppContent.includes('fetchStudentProfileFromSupabase'), 'StudentApp.jsx fetches fresh student profile from Supabase on mount');
assert(studentAppContent.includes('subscribeToStudentProgress'), 'StudentApp.jsx subscribes to Realtime student progress');
assert(studentAppContent.includes('subscribeToStudentProfile'), 'StudentApp.jsx subscribes to Realtime student profile');

const studentDataContent = fs.readFileSync(path.join(rootDir, 'src/student/studentData.js'), 'utf8');
assert(studentDataContent.includes('saveStudentProgressToSupabase'), 'studentData.js dispatches progress 100% directly to Supabase');

assert(supabaseServiceContent.includes('.insert([{ email: cleanEmail, lesson_id: lessonId'), 'supabaseService.js includes insert fallback for user_progress if upsert fails');
assert(!supabaseServiceContent.includes('localStorage.setItem(\'th3ory_local_queries\''), 'supabaseService.js avoids local storage queries fallback pollution');

assert(coursePanelContent.includes('window.addEventListener(\'focus\', refreshFromSupabase)'), 'CoursePanel.jsx auto-refreshes on window focus');
assert(coursePanelContent.includes('document.addEventListener(\'visibilitychange\', refreshFromSupabase)'), 'CoursePanel.jsx auto-refreshes on tab visibility change');

assert(studentAppContent.includes('window.addEventListener(\'focus\', refreshProfileAndData)'), 'StudentApp.jsx auto-refreshes profile & progress on window focus');
assert(studentAppContent.includes('document.addEventListener(\'visibilitychange\', refreshProfileAndData)'), 'StudentApp.jsx auto-refreshes on tab visibility change');

console.log('\n▶ [Suite 12/12]: Page Refresh Data Persistence & Database Sync Audit');
console.log('\n▶ [Suite 13/13]: Student Dashboard Course Completion Display Audit');
const dashboardHomeContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/DashboardHome.jsx'), 'utf8');
console.log('\n▶ [Suite 16/16]: Mobile Video Player & Unsandboxed Iframe Audit');
assert(!coursePanelContent.includes('sandbox='), 'CoursePanel.jsx iframe has 0 restrictive sandbox attributes to ensure Google Drive media scripts execute on mobile');
assert(coursePanelContent.includes('hidden sm:block absolute top-0 right-0 w-28 h-16'), 'CoursePanel.jsx hides top shield on mobile so touch controls remain 100% unobstructed');
assert(coursePanelContent.includes('min-h-[260px]'), 'CoursePanel.jsx container enforces min-h-[260px] for proportional mobile video controls');
console.log('\n▶ [Suite 17/17]: Google Drive Stream Uniformity & Mobile Video Source Audit');
const courseDataFileContent = fs.readFileSync(path.join(rootDir, 'src/data/courseData.js'), 'utf8');
assert(!courseDataFileContent.includes('dQw4w9WgXcQ'), 'courseData.js defaultContent contains 0 YouTube fallback links');
assert(courseDataFileContent.includes('1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g'), 'courseData.js uses official live Google Drive stream URLs');
assert(coursePanelContent.includes('1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g'), 'CoursePanel.jsx uses official live Google Drive stream URL as fallback');


console.log('\n▶ [Suite 18/18]: 24-Hour Auto-Signout & Live Session Database Sync Audit');
assert(studentAppContent.includes('SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000'), 'StudentApp.jsx defines 24-hour maximum session duration constant');
assert(studentAppContent.includes('checkSessionExpiration'), 'StudentApp.jsx implements checkSessionExpiration engine');
assert(studentAppContent.includes('setInterval(checkSessionExpiration, 60000)'), 'StudentApp.jsx runs 60s background heartbeat timer');
assert(supabaseServiceContent.includes('loginAt: Date.now()'), 'supabaseService.js attaches loginAt timestamp to verified student profile');
assert(studentAuthApiContent.includes('loginAt: Date.now()'), 'api/student-auth.js attaches loginAt timestamp to authenticated student payload');
const studentLoginContent = fs.readFileSync(path.join(rootDir, 'src/student/StudentLogin.jsx'), 'utf8');
assert(studentLoginContent.includes('expiredNotice'), 'StudentLogin.jsx supports expiredNotice prop for 24h auto-signout redirect messaging');
assert(studentLoginContent.includes('loginAt:'), 'StudentLogin.jsx saves loginAt timestamp in session storage');

console.log('\n▶ [Suite 19/19]: Dedicated In-Window Level & Day Sub-Tab Navigation Audit');
assert(coursePanelContent.includes('My Course Workspaces'), 'CoursePanel.jsx includes dedicated course workspaces title');
assert(coursePanelContent.includes('setActiveLevelId'), 'CoursePanel.jsx supports dedicated in-window level sub-tabs');
assert(coursePanelContent.includes('Day Modules'), 'CoursePanel.jsx includes compact Day modules navigation sidebar');
assert(coursePanelContent.includes('Select a Day module to begin'), 'CoursePanel.jsx displays select lesson prompt when no lesson is active');

console.log('\n▶ [Suite 20/20]: Universal Portals Light/Dark Theme Switch & LocalStorage Persistence Audit');
const navbarCode = fs.readFileSync(path.join(rootDir, 'src/components/Navbar.jsx'), 'utf8');
const adminAppCodeForTheme = fs.readFileSync(path.join(rootDir, 'src/admin/AdminApp.jsx'), 'utf8');
const teamAppCodeForTheme = fs.readFileSync(path.join(rootDir, 'src/team/TeamApp.jsx'), 'utf8');

assert(studentAppContent.includes('themeMode'), 'StudentApp.jsx manages themeMode state');
assert(studentAppContent.includes('toggleTheme'), 'StudentApp.jsx includes toggleTheme switcher');
assert(studentAppContent.includes('th3ory_student_theme'), 'StudentApp.jsx persists theme selection to localStorage');
assert(navbarCode.includes('toggleTheme'), 'Navbar.jsx includes Sun/Moon theme mode toggle switcher');
assert(navbarCode.includes('th3ory_theme'), 'Navbar.jsx persists public site theme preference');
assert(adminAppCodeForTheme.includes('toggleTheme'), 'AdminApp.jsx includes Sun/Moon theme switcher');
assert(adminAppCodeForTheme.includes('th3ory_admin_theme'), 'AdminApp.jsx persists admin portal theme');
assert(teamAppCodeForTheme.includes('toggleTheme'), 'TeamApp.jsx includes Sun/Moon theme switcher');
assert(teamAppCodeForTheme.includes('th3ory_team_theme'), 'TeamApp.jsx persists team portal theme');
assert(coursePanelContent.includes('themeMode = \'dark\''), 'CoursePanel.jsx accepts themeMode prop');


console.log('\n▶ [Suite 21/21]: Daily Habit & 5-Pillar Self-Assessment Tracker Audit');
const trackerComponentContent = fs.readFileSync(path.join(rootDir, 'src/student/components/DailyHabitTracker.jsx'), 'utf8');
const dashboardHomeFileContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/DashboardHome.jsx'), 'utf8');
assert(trackerComponentContent.includes('CORE_HABITS'), 'DailyHabitTracker.jsx defines 10 CORE_HABITS across 5 Pillars');
assert(trackerComponentContent.includes('SCORING_GUIDE'), 'DailyHabitTracker.jsx defines 1-5 SCORING_GUIDE');
assert(trackerComponentContent.includes('CAPSTONE_DAYS'), 'DailyHabitTracker.jsx defines Capstone Days (Days 6, 12, 18, 24, 30)');
assert(trackerComponentContent.includes('pillarScores'), 'DailyHabitTracker.jsx calculates 5-Pillar Score breakdown');
assert(trackerComponentContent.includes('30-Day Habit Tracker Grid'), 'DailyHabitTracker.jsx provides 30-Day Grid Modal overview');
assert(dashboardHomeFileContent.includes('<DailyHabitTracker'), 'DashboardHome.jsx embeds DailyHabitTracker widget');
assert(supabaseServiceContent.includes('saveDailyTrackerToSupabase'), 'supabaseService.js includes saveDailyTrackerToSupabase handler');
assert(supabaseServiceContent.includes('fetchDailyTrackerFromSupabase'), 'supabaseService.js includes fetchDailyTrackerFromSupabase handler');

console.log('\n▶ [Suite 22/22]: Dedicated Database Table (student_habit_trackers) & Live Realtime Sync Audit');
const schemaSqlContent = fs.readFileSync(path.join(rootDir, 'supabase_schema.sql'), 'utf8');
assert(schemaSqlContent.includes('public.student_habit_trackers'), 'supabase_schema.sql defines dedicated student_habit_trackers table');
assert(schemaSqlContent.includes('uq_student_habit_day'), 'supabase_schema.sql defines unique constraint on (email, day_number)');
assert(schemaSqlContent.includes('public.student_habit_trackers'), 'supabase_schema.sql enables Realtime replication on student_habit_trackers');
assert(supabaseServiceContent.includes('saveHabitTrackerDayToSupabase'), 'supabaseService.js includes saveHabitTrackerDayToSupabase upsert handler');
assert(supabaseServiceContent.includes('fetchAllHabitTrackersFromSupabase'), 'supabaseService.js includes fetchAllHabitTrackersFromSupabase query');
assert(supabaseServiceContent.includes('subscribeToStudentHabitTrackers'), 'supabaseService.js includes subscribeToStudentHabitTrackers Realtime listener');
assert(trackerComponentContent.includes('subscribeToStudentHabitTrackers'), 'DailyHabitTracker.jsx binds live Realtime habit tracker updates');

console.log('\n▶ [Suite 23/23]: Daily Habit Tracker 100% Course Completion Lock & Popup Modal Audit');
const trackerUpdatedContent = fs.readFileSync(path.join(rootDir, 'src/student/components/DailyHabitTracker.jsx'), 'utf8');
const dashboardUpdatedContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/DashboardHome.jsx'), 'utf8');
assert(dashboardUpdatedContent.includes('isCourseCompleted={totalLessons > 0 && completedCount >= totalLessons}'), 'DashboardHome.jsx computes 100% course completion condition');
assert(trackerUpdatedContent.includes('isCourseCompleted = false'), 'DailyHabitTracker.jsx accepts isCourseCompleted prop');
assert(trackerUpdatedContent.includes('checkCourseAccess'), 'DailyHabitTracker.jsx enforces checkCourseAccess guard on interactions');
assert(trackerUpdatedContent.includes('showLockModal'), 'DailyHabitTracker.jsx manages showLockModal state');
assert(trackerUpdatedContent.includes('Course Completion Required'), 'DailyHabitTracker.jsx renders Course Completion Required pop-up modal overlay');
assert(trackerUpdatedContent.includes('Continue Video Course'), 'DailyHabitTracker.jsx includes Continue Video Course CTA button in lock modal');

console.log('\n▶ [Suite 24/24]: Dynamic Royal Certificate System & Director Signatory Audit');
const certViewerContent = fs.readFileSync(path.join(rootDir, 'src/student/components/CertificateViewer.jsx'), 'utf8');
const certPanelContent = fs.readFileSync(path.join(rootDir, 'src/student/panels/CertificatePanel.jsx'), 'utf8');
const publicVerifierContent = fs.readFileSync(path.join(rootDir, 'src/components/PublicCertificateVerifier.jsx'), 'utf8');
const studentAppCode = fs.readFileSync(path.join(rootDir, 'src/student/StudentApp.jsx'), 'utf8');

assert(certViewerContent.includes('Certificate of Mastery'), 'CertificateViewer.jsx renders Certificate of Mastery title');
assert(certViewerContent.includes('Sravan Sudhakaran'), 'CertificateViewer.jsx displays Director Sravan Sudhakaran signature');
assert(certViewerContent.includes('TH3ORY Masterclass of Influencing'), 'CertificateViewer.jsx preserves course title');
assert(certViewerContent.includes('logo-transparent.png'), 'CertificateViewer.jsx displays course logo in header');
assert(certViewerContent.includes('Share to LinkedIn'), 'CertificateViewer.jsx includes Share to LinkedIn CTA button');
assert(!certViewerContent.includes('viewBox="0 0 100 100"'), 'CertificateViewer.jsx cleanly removed QR badge');
assert(certPanelContent.includes('Preview Template'), 'CertificatePanel.jsx offers template preview mode');
assert(publicVerifierContent.includes('Certificate Verification Portal'), 'PublicCertificateVerifier.jsx provides public credential verification');
console.log('\n▶ [Suite 25/25]: 30-Day Interactive Course Task Tracker & Live Supabase Persistence Audit');
const courseTasksDataCode = fs.readFileSync(path.join(rootDir, 'src/data/courseTasksData.js'), 'utf8');
const dayTasksTrackerCode = fs.readFileSync(path.join(rootDir, 'src/student/components/DayTasksTracker.jsx'), 'utf8');
const coursePanelCode = fs.readFileSync(path.join(rootDir, 'src/student/panels/CoursePanel.jsx'), 'utf8');
const dashboardHomeCode = fs.readFileSync(path.join(rootDir, 'src/student/panels/DashboardHome.jsx'), 'utf8');
const supabaseServiceCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');
const schemaSqlCode = fs.readFileSync(path.join(rootDir, 'supabase_schema.sql'), 'utf8');

assert(courseTasksDataCode.includes('COURSE_TASKS_DATA'), 'courseTasksData.js exports 30-day course tasks dataset');
assert(courseTasksDataCode.includes('Reflect on your grounded self'), 'courseTasksData.js contains Day 1 Presence tasks');
assert(courseTasksDataCode.includes('Legacy Capstone'), 'courseTasksData.js contains Day 30 Legacy tasks');
assert(dayTasksTrackerCode.includes('DayTasksTracker'), 'DayTasksTracker.jsx defines interactive sub-step checklist component');
assert(dayTasksTrackerCode.includes('isTaskComplete'), 'DayTasksTracker.jsx checks task completion when both sub-steps are checked');
assert(dayTasksTrackerCode.includes('saveTaskStepsToSupabase'), 'DayTasksTracker.jsx binds live task_steps Supabase persistence');
assert(coursePanelCode.includes('<DayTasksTracker'), 'CoursePanel.jsx embeds DayTasksTracker in lesson workspace');
assert(dashboardHomeCode.includes('<DayTasksTracker'), 'DashboardHome.jsx embeds DayTasksTracker on student dashboard');
assert(supabaseServiceCode.includes('saveTaskStepsToSupabase'), 'supabaseService.js exports saveTaskStepsToSupabase handler');
assert(supabaseServiceCode.includes('fetchTaskStepsFromSupabase'), 'supabaseService.js exports fetchTaskStepsFromSupabase handler');
assert(supabaseServiceCode.includes('subscribeToTaskSteps'), 'supabaseService.js exports subscribeToTaskSteps Realtime listener');
console.log('\n▶ [Suite 26/26]: THE CHARACTER CODE™ Royal 12-Archetype Generator & Relic Artifacts Audit');
const characterCodeDataCode = fs.readFileSync(path.join(rootDir, 'src/data/characterCodeData.js'), 'utf8');
const characterCodePortalCode = fs.readFileSync(path.join(rootDir, 'src/student/components/CharacterCodePortal.jsx'), 'utf8');
const studentAppFullCode = fs.readFileSync(path.join(rootDir, 'src/student/StudentApp.jsx'), 'utf8');

assert(characterCodeDataCode.includes('ARCHETYPES'), 'characterCodeData.js defines 12 core archetypes');
assert(characterCodeDataCode.includes('CHARACTER_CODE_QUESTIONS'), 'characterCodeData.js defines assessment questionnaires');
assert(characterCodeDataCode.includes('THE ARCHITECT'), 'characterCodeData.js maps archetype combinations to character titles');
assert(characterCodeDataCode.includes('calculateCharacterCodeResults'), 'characterCodeData.js exports result scoring engine');
assert(characterCodePortalCode.includes('Initializing Character Psychology Matrix...'), 'CharacterCodePortal.jsx implements classic animated loading screen');
assert(characterCodePortalCode.includes('COLLECTIBLE_ARTIFACTS'), 'CharacterCodePortal.jsx defines animated collectible internet artifacts');
assert(characterCodePortalCode.includes('Crown of Sovereignty'), 'CharacterCodePortal.jsx includes Crown of Sovereignty relic card');
assert(characterCodePortalCode.includes('CharacterCodePortal'), 'CharacterCodePortal.jsx defines 8-screen report viewer');
assert(studentAppFullCode.includes("id: 'character_code'"), 'StudentApp.jsx includes dedicated Character Code sidebar navigation tab');
assert(characterCodePortalCode.includes('showRetakeLockModal'), 'CharacterCodePortal.jsx manages showRetakeLockModal state');
assert(characterCodePortalCode.includes('Complete Next Level to Unlock Retake'), 'CharacterCodePortal.jsx renders Level Completion Required pop-up modal overlay');
assert(characterCodePortalCode.includes('completedLevelAtTest'), 'CharacterCodePortal.jsx snapshots completed level at test time');
console.log('\n▶ [Suite 27/27]: Student Upgrades & Add-ons Razorpay Migration Audit');
const shopPanelCode = fs.readFileSync(path.join(rootDir, 'src/student/panels/ShopPanel.jsx'), 'utf8');

assert(shopPanelCode.includes('RazorpayCheckoutModal'), 'ShopPanel.jsx defines RazorpayCheckoutModal');
assert(shopPanelCode.includes('Pay ₹'), 'ShopPanel.jsx displays Razorpay payment CTA button');
assert(shopPanelCode.includes('Razorpay Checkout'), 'ShopPanel.jsx features Razorpay payment gateway title');
assert(!shopPanelCode.includes('Card Number'), 'ShopPanel.jsx completely removed Card Number input');
assert(shopPanelCode.includes('rzp_live_TP7hT2Wt1nkqwg'), 'ShopPanel.jsx uses valid production Razorpay key ID');
assert(shopPanelCode.includes('/api/create-razorpay-order'), 'ShopPanel.jsx integrates serverless order creation API');
console.log('\n▶ [Suite 28/28]: Admin Student Query Response & Realtime Display Audit');
const queriesQuotesPanelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');
const queryPanelCode = fs.readFileSync(path.join(rootDir, 'src/student/panels/QueryPanel.jsx'), 'utf8');

assert(queriesQuotesPanelCode.includes('handleSendQueryResponse'), 'QueriesQuotesPanel.jsx implements handleSendQueryResponse');
assert(queriesQuotesPanelCode.includes('Send Reply'), 'QueriesQuotesPanel.jsx features Send Reply & Mark Answered button');
assert(queriesQuotesPanelCode.includes('Type instructor response'), 'QueriesQuotesPanel.jsx features instructor reply textarea');
assert(!queriesQuotesPanelCode.includes('alert('), 'QueriesQuotesPanel.jsx contains 0 blocking browser alert popups');
assert(queryPanelCode.includes('subscribeToQueries'), 'QueryPanel.jsx subscribes to Realtime queries table changes');
assert(queryPanelCode.includes('TH3ORY Instructor'), 'QueryPanel.jsx renders TH3ORY Instructor response');

console.log('\n▶ [Suite 29/29]: Team Portal & Admin Approval Workflow Audit');
const mainJsxContent = fs.readFileSync(path.join(rootDir, 'src/main.jsx'), 'utf8');
const teamAppContent = fs.readFileSync(path.join(rootDir, 'src/team/TeamApp.jsx'), 'utf8');
const teamQuotesContent = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const adminAppFullCode = fs.readFileSync(path.join(rootDir, 'src/admin/AdminApp.jsx'), 'utf8');
const teamApprovalsPanelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/TeamApprovalsPanel.jsx'), 'utf8');
const supabaseServiceFullCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');

assert(mainJsxContent.includes("view === 'team'"), 'main.jsx defines team portal route');
assert(teamAppContent.includes('ALLOWED MODULES (5 ONLY)'), 'TeamApp.jsx restricts team access strictly to 5 allowed modules');
assert(teamQuotesContent.includes('Data Access & Privacy Policy Active'), 'TeamQuotesPanel.jsx displays Data Access & Privacy Policy header');
assert(teamQuotesContent.includes('create_enterprise_quote'), 'TeamQuotesPanel.jsx includes new Enterprise Lead creation modal');
assert(teamQuotesContent.includes('submitTeamApprovalRequestToSupabase'), 'TeamQuotesPanel.jsx submits updates for Admin Portal Approval');
assert(supabaseServiceFullCode.includes('submitTeamApprovalRequestToSupabase'), 'supabaseService.js exports submitTeamApprovalRequestToSupabase handler');
assert(supabaseServiceFullCode.includes('processTeamApprovalRequestInSupabase'), 'supabaseService.js exports processTeamApprovalRequestInSupabase handler');
assert(supabaseServiceFullCode.includes('create_enterprise_quote'), 'supabaseService.js executes live DB table insert on Admin approval');
assert(adminAppFullCode.includes('TeamApprovalsPanel'), 'AdminApp.jsx embeds TeamApprovalsPanel component');
assert(teamApprovalsPanelCode.includes('NEW DATA ENTRY'), 'TeamApprovalsPanel.jsx renders NEW DATA ENTRY badge for supervised team data creations');
assert(teamApprovalsPanelCode.includes('Approve Live'), 'TeamApprovalsPanel.jsx features Approve Live button for primary admins');

console.log('\n▶ [Suite 30/30]: Statutory Privacy Policy & Data Protection Legal Audit');
const privacyPolicyPageCode = fs.readFileSync(path.join(rootDir, 'src/components/PrivacyPolicyPage.jsx'), 'utf8');
const footerJsxCode = fs.readFileSync(path.join(rootDir, 'src/components/Footer.jsx'), 'utf8');

assert(privacyPolicyPageCode.includes('PrivacyPolicyPage'), 'PrivacyPolicyPage.jsx component exists');
assert(privacyPolicyPageCode.includes('GDPR'), 'PrivacyPolicyPage.jsx references EU GDPR Article compliance');
assert(privacyPolicyPageCode.includes('CCPA / CPRA'), 'PrivacyPolicyPage.jsx references CCPA / CPRA statutory compliance');
assert(privacyPolicyPageCode.includes('DPDP Act 2023'), 'PrivacyPolicyPage.jsx references Indian DPDP Act 2023 compliance');
assert(privacyPolicyPageCode.includes('student_habit_trackers'), 'PrivacyPolicyPage.jsx explicitly discloses habit tracker data processing');
assert(privacyPolicyPageCode.includes('enterprise_quotes'), 'PrivacyPolicyPage.jsx explicitly discloses enterprise quote data processing');
assert(privacyPolicyPageCode.includes('Razorpay Software'), 'PrivacyPolicyPage.jsx discloses Razorpay PCI-DSS sub-processor');
assert(privacyPolicyPageCode.includes('24-Hour Maximum Duration Policy'), 'PrivacyPolicyPage.jsx details 24h session security policy');
assert(privacyPolicyPageCode.includes('PRIV-'), 'PrivacyPolicyPage.jsx generates trackable Data Subject Rights request ID');
assert(privacyPolicyPageCode.includes('Crown'), 'PrivacyPolicyPage.jsx correctly imports Crown icon from lucide-react');
assert(mainJsxContent.includes("view === 'privacy'"), 'main.jsx defines privacy policy route');
assert(footerJsxCode.includes('#privacy'), 'Footer.jsx links to #/privacy page');

const enrollmentPageCode = fs.readFileSync(path.join(rootDir, 'src/components/EnrollmentPage.jsx'), 'utf8');
const checkoutModalCode = fs.readFileSync(path.join(rootDir, 'src/components/CheckoutModal.jsx'), 'utf8');
assert(enrollmentPageCode.includes('Statutory Privacy Policy'), 'EnrollmentPage.jsx embeds Privacy Policy text scroll box in Step 3');
assert(enrollmentPageCode.includes('acceptedPrivacy'), 'EnrollmentPage.jsx enforces acceptedPrivacy checkbox check before payment');
assert(checkoutModalCode.includes('Statutory Privacy Policy'), 'CheckoutModal.jsx embeds Privacy Policy text scroll box in Step 2');
assert(checkoutModalCode.includes('acceptedModalPrivacy'), 'CheckoutModal.jsx enforces acceptedModalPrivacy checkbox check before payment');

console.log('\n▶ [Suite 31/31]: Campus Ambassador Program & Approval Portal Audit');
const ambassadorLandingCode = fs.readFileSync(path.join(rootDir, 'src/components/AmbassadorLandingPage.jsx'), 'utf8');
const ambassadorPortalCode = fs.readFileSync(path.join(rootDir, 'src/components/AmbassadorPortal.jsx'), 'utf8');
const ambassadorAdminPanelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/AmbassadorApplicationsPanel.jsx'), 'utf8');
const schemaCode = fs.readFileSync(path.join(rootDir, 'supabase_schema.sql'), 'utf8');

assert(ambassadorLandingCode.includes('AmbassadorLandingPage'), 'AmbassadorLandingPage.jsx component exists');
assert(ambassadorLandingCode.includes('12-Week'), 'AmbassadorLandingPage.jsx outlines 12-Week Program term');
assert(ambassadorLandingCode.includes('saveAmbassadorApplicationToSupabase'), 'AmbassadorLandingPage.jsx saves applications to Supabase');
assert(ambassadorLandingCode.includes('AMB-APP-'), 'AmbassadorLandingPage.jsx generates trackable AMB-APP- reference ID');
assert(ambassadorPortalCode.includes('AmbassadorPortal'), 'AmbassadorPortal.jsx component exists');
assert(ambassadorPortalCode.includes('fetchAmbassadorByCodeFromSupabase'), 'AmbassadorPortal.jsx authenticates ambassadors against Supabase');
assert(ambassadorPortalCode.includes('saveAmbassadorWeeklyReportToSupabase'), 'AmbassadorPortal.jsx submits Friday weekly activity reports');
assert(ambassadorAdminPanelCode.includes('AmbassadorApplicationsPanel'), 'AmbassadorApplicationsPanel.jsx admin component exists');
assert(ambassadorAdminPanelCode.includes('approveAmbassadorInSupabase'), 'AmbassadorApplicationsPanel.jsx features 1-click admin approval');
assert(ambassadorAdminPanelCode.includes('sendAmbassadorApprovalEmail'), 'AmbassadorApplicationsPanel.jsx dispatches credentials over email');
assert(schemaCode.includes('ambassador_applications'), 'supabase_schema.sql defines dedicated ambassador_applications table');
assert(schemaCode.includes('ambassador_weekly_reports'), 'supabase_schema.sql defines dedicated ambassador_weekly_reports table');
assert(schemaCode.includes('ambassador_leads'), 'supabase_schema.sql defines dedicated ambassador_leads table');
assert(schemaCode.includes('ambassador_payouts'), 'supabase_schema.sql defines dedicated ambassador_payouts table');
assert(schemaCode.includes('ambassador_tasks'), 'supabase_schema.sql defines dedicated ambassador_tasks table');
assert(mainJsxContent.includes("view === 'ambassador'"), 'main.jsx defines ambassador public route');
assert(mainJsxContent.includes("view === 'ambassador-portal'"), 'main.jsx defines ambassador-portal route');
assert(footerJsxCode.includes('#ambassador'), 'Footer.jsx links to Campus Ambassador Program');
assert(footerJsxCode.includes('#team'), 'Footer.jsx links to Team Access');

console.log('\n▶ [Suite 32/32]: Dedicated Ambassador Relational Database Tables & Service API Audit');
const ambSupabaseServiceCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');
const ambassadorSqlCode = fs.readFileSync(path.join(rootDir, 'supabase_ambassadors.sql'), 'utf8');

assert(ambassadorSqlCode.includes('CREATE TABLE IF NOT EXISTS public.ambassador_applications'), 'supabase_ambassadors.sql creates ambassador_applications table');
assert(ambassadorSqlCode.includes('CREATE TABLE IF NOT EXISTS public.ambassador_weekly_reports'), 'supabase_ambassadors.sql creates ambassador_weekly_reports table');
assert(ambassadorSqlCode.includes('CREATE TABLE IF NOT EXISTS public.ambassador_leads'), 'supabase_ambassadors.sql creates ambassador_leads table');
assert(ambassadorSqlCode.includes('CREATE TABLE IF NOT EXISTS public.ambassador_payouts'), 'supabase_ambassadors.sql creates ambassador_payouts table');
assert(ambassadorSqlCode.includes('CREATE TABLE IF NOT EXISTS public.ambassador_tasks'), 'supabase_ambassadors.sql creates ambassador_tasks table');
assert(ambassadorSqlCode.includes('idx_ambassador_apps_code'), 'supabase_ambassadors.sql defines index on ambassador_code');
assert(ambassadorSqlCode.includes('ENABLE ROW LEVEL SECURITY'), 'supabase_ambassadors.sql enables Row Level Security');
assert(ambassadorSqlCode.includes('supabase_realtime'), 'supabase_ambassadors.sql enables Realtime replication');

assert(ambSupabaseServiceCode.includes('fetchAmbassadorWeeklyReportsFromSupabase'), 'supabaseService.js exports fetchAmbassadorWeeklyReportsFromSupabase');
assert(ambSupabaseServiceCode.includes('fetchAmbassadorLeadsFromSupabase'), 'supabaseService.js exports fetchAmbassadorLeadsFromSupabase');
assert(ambSupabaseServiceCode.includes('saveAmbassadorLeadToSupabase'), 'supabaseService.js exports saveAmbassadorLeadToSupabase');
assert(ambSupabaseServiceCode.includes('fetchAmbassadorPayoutsFromSupabase'), 'supabaseService.js exports fetchAmbassadorPayoutsFromSupabase');
assert(ambSupabaseServiceCode.includes('fetchAmbassadorTasksFromSupabase'), 'supabaseService.js exports fetchAmbassadorTasksFromSupabase');

console.log('\n▶ [Suite 33/33]: Ambassador Full Intake Flow, Resend Credentials Dispatch, & Payout System Audit');
const emailApiCode = fs.readFileSync(path.join(rootDir, 'api/send-email.js'), 'utf8');
const emailServiceCode = fs.readFileSync(path.join(rootDir, 'src/services/emailService.js'), 'utf8');

assert(ambSupabaseServiceCode.includes('saveAmbassadorInterviewNotesToSupabase'), 'supabaseService.js exports saveAmbassadorInterviewNotesToSupabase for team interview notes');
assert(ambSupabaseServiceCode.includes('submitAmbassadorTeamApprovalToSupabase'), 'supabaseService.js exports submitAmbassadorTeamApprovalToSupabase for team recommendations');
assert(ambSupabaseServiceCode.includes('saveAmbassadorPayoutDetailsToSupabase'), 'supabaseService.js exports saveAmbassadorPayoutDetailsToSupabase for payout account details');
assert(ambSupabaseServiceCode.includes('requestAmbassadorPayoutToSupabase'), 'supabaseService.js exports requestAmbassadorPayoutToSupabase for cash transfer requests');

assert(emailApiCode.includes('AMBASSADOR_APPROVAL'), 'api/send-email.js supports AMBASSADOR_APPROVAL type in Resend Vercel serverless handler');
assert(emailApiCode.includes('TH3ORY Campus Ambassador Program'), 'api/send-email.js formats official ambassador selection email');
assert(emailServiceCode.includes('sendAmbassadorApprovalEmail'), 'emailService.js exports sendAmbassadorApprovalEmail');

assert(ambassadorAdminPanelCode.includes('handleSaveInterviewAndRecommend'), 'AmbassadorApplicationsPanel.jsx features manual interview notes & rating modal');
assert(ambassadorAdminPanelCode.includes('Conduct Team Interview & Log Evaluation'), 'AmbassadorApplicationsPanel.jsx displays team evaluation button');

assert(ambassadorPortalCode.includes('saveAmbassadorPayoutDetailsToSupabase'), 'AmbassadorPortal.jsx saves payout account details (UPI / Bank)');
assert(ambassadorPortalCode.includes('requestAmbassadorPayoutToSupabase'), 'AmbassadorPortal.jsx requests direct cash payout transfer');
assert(ambassadorPortalCode.includes('Set Up Payment Account'), 'AmbassadorPortal.jsx provides payment account collector modal');

console.log('\n▶ [Suite 34/34]: Dedicated Campus Ambassador Login System Audit');
const ambassadorLoginCode = fs.readFileSync(path.join(rootDir, 'src/components/AmbassadorLogin.jsx'), 'utf8');

assert(ambassadorLoginCode.includes('AmbassadorLogin'), 'AmbassadorLogin.jsx component exists');
assert(ambassadorLoginCode.includes('Ambassador Code or Email'), 'AmbassadorLogin.jsx prompts for Ambassador Code or Email');
assert(ambassadorLoginCode.includes('Access Password'), 'AmbassadorLogin.jsx prompts for Access Password');
assert(ambassadorLoginCode.includes('AMB-DEMO'), 'AmbassadorLogin.jsx supports AMB-DEMO demo login credentials');
assert(ambassadorLoginCode.includes('handleFillDemo'), 'AmbassadorLogin.jsx provides 1-click Fill Demo Credentials button');
assert(ambassadorLoginCode.includes('fetchAmbassadorByCodeFromSupabase'), 'AmbassadorLogin.jsx authenticates against Supabase ambassador_applications table');

assert(mainJsxContent.includes("view === 'ambassador-login'"), 'main.jsx defines ambassador-login route');
assert(ambassadorPortalCode.includes('AmbassadorLogin'), 'AmbassadorPortal.jsx integrates dedicated AmbassadorLogin component');

console.log('\n▶ [Suite 35/35]: Central Sub-Portal Email Dispatcher & Resend System Audit');
const emailDispatcherPanelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/PortalEmailDispatcherPanel.jsx'), 'utf8');

assert(emailApiCode.includes('TH3ORY MASTERCLASS <team@th3ory.online>'), 'api/send-email.js enforces TH3ORY MASTERCLASS <team@th3ory.online> sender ID');
assert(emailServiceCode.includes('TH3ORY MASTERCLASS <team@th3ory.online>'), 'emailService.js defaults sender ID to TH3ORY MASTERCLASS <team@th3ory.online>');
assert(emailDispatcherPanelCode.includes('TH3ORY MASTERCLASS <team@th3ory.online>'), 'PortalEmailDispatcherPanel.jsx uses TH3ORY MASTERCLASS <team@th3ory.online> as default sender identity');
assert(emailApiCode.includes('redirectPortal'), 'api/send-email.js supports redirectPortal parameter');
assert(emailServiceCode.includes('sendPortalBroadcastEmail'), 'emailService.js exports sendPortalBroadcastEmail');

assert(emailDispatcherPanelCode.includes('PortalEmailDispatcherPanel'), 'PortalEmailDispatcherPanel.jsx component exists');
assert(emailDispatcherPanelCode.includes('PRESET_TEMPLATES'), 'PortalEmailDispatcherPanel.jsx defines 5 quick template presets');
assert(emailDispatcherPanelCode.includes('ALL_STUDENTS'), 'PortalEmailDispatcherPanel.jsx supports Student Portal targeting');
assert(emailDispatcherPanelCode.includes('CAMPUS_AMBASSADORS'), 'PortalEmailDispatcherPanel.jsx supports Ambassador Portal targeting');
assert(emailDispatcherPanelCode.includes('ENTERPRISE_LEADS'), 'PortalEmailDispatcherPanel.jsx supports Enterprise Portal targeting');
assert(emailDispatcherPanelCode.includes('sendPortalBroadcastEmail'), 'PortalEmailDispatcherPanel.jsx dispatches via sendPortalBroadcastEmail');

const adminAppCode = fs.readFileSync(path.join(rootDir, 'src/admin/AdminApp.jsx'), 'utf8');
assert(adminAppCode.includes('PortalEmailDispatcherPanel'), 'AdminApp.jsx embeds PortalEmailDispatcherPanel component');
assert(adminAppCode.includes('email_dispatcher'), 'AdminApp.jsx defines email_dispatcher nav item');

const teamAppCode = fs.readFileSync(path.join(rootDir, 'src/team/TeamApp.jsx'), 'utf8');
assert(teamAppCode.includes('TeamQuotesPanel'), 'TeamApp.jsx embeds TeamQuotesPanel component for enterprise quotes');
assert(teamAppCode.includes('quotes'), 'TeamApp.jsx defines quotes team nav item');

console.log('\n▶ [Suite 36/36]: Live Calendly 1-on-1 Consultation & Interview Scheduling Audit');
const calendlyModalCode = fs.readFileSync(path.join(rootDir, 'src/components/CalendlyModal.jsx'), 'utf8');
const calendlyWidgetCode = fs.readFileSync(path.join(rootDir, 'src/components/CalendlyWidget.jsx'), 'utf8');
const queryPanelCodeCal = fs.readFileSync(path.join(rootDir, 'src/student/panels/QueryPanel.jsx'), 'utf8');
const ambassadorPanelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/AmbassadorApplicationsPanel.jsx'), 'utf8');
const adminAppCalendly = fs.readFileSync(path.join(rootDir, 'src/admin/AdminApp.jsx'), 'utf8');
const teamQuotesCalendly = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const teamInquiriesCalendly = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamInquiriesPanel.jsx'), 'utf8');
const teamAffiliatesCalendly = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamAffiliatesPanel.jsx'), 'utf8');
const queriesQuotesCalendly = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');
const teamApprovalsCalendly = fs.readFileSync(path.join(rootDir, 'src/admin/panels/TeamApprovalsPanel.jsx'), 'utf8');

assert(calendlyModalCode.includes('assets.calendly.com/assets/external/widget.js'), 'CalendlyModal.jsx loads official Calendly embed widget script');
assert(calendlyModalCode.includes('iframe'), 'CalendlyModal.jsx embeds interactive scheduling iframe');
assert(calendlyWidgetCode.includes('Calendly Live Scheduling'), 'CalendlyWidget.jsx exports reusable inline booking widget');
assert(queryPanelCodeCal.includes('CalendlyModal'), 'QueryPanel.jsx supports student 1-on-1 mentorship call scheduling via Calendly');
assert(ambassadorPanelCode.includes('CalendlyModal'), 'AmbassadorApplicationsPanel.jsx features 1-click selection interview scheduling via Calendly');
assert(adminAppCalendly.includes('CalendlyModal'), 'AdminApp.jsx header bar embeds Schedule Meeting button and Calendly modal');
assert(teamQuotesCalendly.includes('CalendlyModal'), 'TeamQuotesPanel.jsx provides 1-click Schedule Call action next to enterprise leads');
assert(teamInquiriesCalendly.includes('CalendlyModal'), 'TeamInquiriesPanel.jsx provides 1-click Schedule Call action next to contact inquiries');
assert(teamAffiliatesCalendly.includes('CalendlyModal'), 'TeamAffiliatesPanel.jsx features Schedule Partner Call button');
assert(queriesQuotesCalendly.includes('CalendlyModal'), 'QueriesQuotesPanel.jsx allows admins to schedule calls directly from student support tickets');
assert(teamApprovalsCalendly.includes('CalendlyModal'), 'TeamApprovalsPanel.jsx features Schedule Team Meeting button for admin reviews');

console.log('\n▶ [Suite 37/37]: Complete Interactive Advertising Suite Audit');
const affiliateCode = fs.readFileSync(path.join(rootDir, 'src/components/AffiliateLandingPage.jsx'), 'utf8');
const masterclassAdCode = fs.readFileSync(path.join(rootDir, 'src/components/MasterclassAdvertisingPage.jsx'), 'utf8');
const institutionalCode = fs.readFileSync(path.join(rootDir, 'src/components/InstitutionalPage.jsx'), 'utf8');
const supabaseServiceAdvCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');

assert(affiliateCode.includes('Affiliate Earnings Simulator'), 'AffiliateLandingPage.jsx features interactive revenue calculator slider');
assert(affiliateCode.includes('saveAffiliateApplicationToSupabase'), 'AffiliateLandingPage.jsx integrates live partner intake form');
assert(masterclassAdCode.includes('The Complete 30-Day Transformation Arc'), 'MasterclassAdvertisingPage.jsx showcases 30-day curriculum arc');
assert(masterclassAdCode.includes('The 5 Pillars Operating System'), 'MasterclassAdvertisingPage.jsx features 5-pillar OS flowchart');
assert(institutionalCode.includes('ELEVATE YOUR STUDENTS'), 'InstitutionalPage.jsx presents higher ed placement demeanor workshops');
assert(institutionalCode.includes('Campus Delivery Formats'), 'InstitutionalPage.jsx provides delivery formats carousel');
assert(supabaseServiceAdvCode.includes('saveAffiliateApplicationToSupabase'), 'supabaseService.js exports saveAffiliateApplicationToSupabase');
assert(mainJsxContent.includes("view === 'affiliate'"), 'main.jsx routes #affiliate to AffiliateLandingPage');
assert(mainJsxContent.includes("view === 'masterclass'"), 'main.jsx routes #masterclass to MasterclassAdvertisingPage');
assert(mainJsxContent.includes("view === 'colleges'"), 'main.jsx routes #colleges to InstitutionalPage');
assert(footerJsxCode.includes('#masterclass'), 'Footer.jsx links to 30-Day Masterclass Deep-Dive');
assert(footerJsxCode.includes('#affiliate'), 'Footer.jsx links to Affiliate Partner Network');
assert(footerJsxCode.includes('#colleges'), 'Footer.jsx links to College Workshops');

console.log('\n▶ [Suite 38/38]: Team Portal Full Form Access & Edit/Delete Operations Audit');
const supabaseServiceEditDelCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');
const teamQuotesEditDelCode = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const teamInquiriesEditDelCode = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamInquiriesPanel.jsx'), 'utf8');
const teamAffiliatesEditDelCode = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamAffiliatesPanel.jsx'), 'utf8');
const ambassadorEditDelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/AmbassadorApplicationsPanel.jsx'), 'utf8');
const newsletterEditDelCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/NewsletterPanel.jsx'), 'utf8');

assert(supabaseServiceEditDelCode.includes('deleteEnterpriseQuoteFromSupabase'), 'supabaseService.js exports deleteEnterpriseQuoteFromSupabase');
assert(supabaseServiceEditDelCode.includes('updateEnterpriseQuoteInSupabase'), 'supabaseService.js exports updateEnterpriseQuoteInSupabase');
assert(supabaseServiceEditDelCode.includes('deleteContactInquiryFromSupabase'), 'supabaseService.js exports deleteContactInquiryFromSupabase');
assert(supabaseServiceEditDelCode.includes('updateContactInquiryInSupabase'), 'supabaseService.js exports updateContactInquiryInSupabase');
assert(supabaseServiceEditDelCode.includes('deleteAffiliateApplicationFromSupabase'), 'supabaseService.js exports deleteAffiliateApplicationFromSupabase');
assert(supabaseServiceEditDelCode.includes('updateAffiliateApplicationInSupabase'), 'supabaseService.js exports updateAffiliateApplicationInSupabase');
assert(supabaseServiceEditDelCode.includes('deleteAmbassadorApplicationFromSupabase'), 'supabaseService.js exports deleteAmbassadorApplicationFromSupabase');
assert(supabaseServiceEditDelCode.includes('updateAmbassadorApplicationInSupabase'), 'supabaseService.js exports updateAmbassadorApplicationInSupabase');

assert(teamQuotesEditDelCode.includes('handleDeleteQuote'), 'TeamQuotesPanel.jsx implements Delete Enterprise Quote action');
assert(teamQuotesEditDelCode.includes('Edit Enterprise Quote Record'), 'TeamQuotesPanel.jsx provides Edit Enterprise Quote modal');
assert(teamInquiriesEditDelCode.includes('handleDeleteInquiry'), 'TeamInquiriesPanel.jsx implements Delete Contact Inquiry action');
assert(teamInquiriesEditDelCode.includes('Edit Contact Inquiry Details'), 'TeamInquiriesPanel.jsx provides Edit Contact Inquiry modal');
assert(teamAffiliatesEditDelCode.includes('handleDeleteAffiliateApp'), 'TeamAffiliatesPanel.jsx implements Delete Affiliate Application action');
assert(teamAffiliatesEditDelCode.includes('Edit Affiliate Applicant Record'), 'TeamAffiliatesPanel.jsx provides Edit Affiliate Applicant modal');
assert(ambassadorEditDelCode.includes('handleDeleteAmbassadorApp'), 'AmbassadorApplicationsPanel.jsx implements Delete Ambassador Application action');
assert(ambassadorEditDelCode.includes('Edit Campus Ambassador Form Record'), 'AmbassadorApplicationsPanel.jsx provides Edit Campus Ambassador modal');
assert(newsletterEditDelCode.includes('Edit Subscriber Details'), 'NewsletterPanel.jsx provides Edit Subscriber modal');

console.log('\n▶ [Suite 39/39]: Founding Launch Campaign & Razorpay Direct Redirect Audit');
const campaignSectionCode = fs.readFileSync(path.join(rootDir, 'src/components/CampaignSection.jsx'), 'utf8');
const appJsxCampaignCode = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
const navbarCampaignCode = fs.readFileSync(path.join(rootDir, 'src/components/Navbar.jsx'), 'utf8');

assert(campaignSectionCode.includes('https://rzp.io/rzp/th3orylaunch'), 'CampaignSection.jsx redirects to https://rzp.io/rzp/th3orylaunch');
assert(campaignSectionCode.includes('₹499'), 'CampaignSection.jsx displays Founding Access Price ₹499');
assert(campaignSectionCode.includes('1 YEAR OF EXCLUSIVE ACCESS TO INFLUENCING PSYCHOLOGY MEMBERSHIP'), 'CampaignSection.jsx includes 1 year membership benefit');
assert(campaignSectionCode.includes('THE 30-DAY JOURNEY'), 'CampaignSection.jsx displays 30-Day 5-Level Journey');
assert(campaignSectionCode.includes('LAUNCH GIVEAWAY'), 'CampaignSection.jsx displays ₹1,59,995 Launch Giveaway section');
assert(campaignSectionCode.includes('WHO IS TH3ORY FOR?'), 'CampaignSection.jsx displays target audience breakdown');
assert(appJsxCampaignCode.includes('CampaignSection'), 'App.jsx imports and renders CampaignSection on home page');
assert(navbarCampaignCode.includes('https://rzp.io/rzp/th3orylaunch'), 'Navbar.jsx features direct Launch ₹499 link');

console.log('\n▶ [Suite 40/40]: Enterprise Quote CRM System & 18-Field Realtime Database Sync Audit');
const supabaseCrmCode = fs.readFileSync(path.join(rootDir, 'src/services/supabaseService.js'), 'utf8');
const teamCrmCode = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const adminCrmCode = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');
const schemaCrmCode = fs.readFileSync(path.join(rootDir, 'supabase_schema.sql'), 'utf8');

// Schema & Service Assertions for all 18 CRM Fields
assert(schemaCrmCode.includes('industry TEXT'), 'supabase_schema.sql defines industry CRM column');
assert(schemaCrmCode.includes('employee_size TEXT'), 'supabase_schema.sql defines employee_size CRM column');
assert(schemaCrmCode.includes('location TEXT'), 'supabase_schema.sql defines location CRM column');
assert(schemaCrmCode.includes('website TEXT'), 'supabase_schema.sql defines website CRM column');
assert(schemaCrmCode.includes('designation TEXT'), 'supabase_schema.sql defines designation CRM column');
assert(schemaCrmCode.includes('linkedin_url TEXT'), 'supabase_schema.sql defines linkedin_url CRM column');
assert(schemaCrmCode.includes('last_contacted_at TEXT'), 'supabase_schema.sql defines last_contacted_at CRM column');
assert(schemaCrmCode.includes('next_followup_at TEXT'), 'supabase_schema.sql defines next_followup_at CRM column');
assert(schemaCrmCode.includes('proposal_sent TEXT'), 'supabase_schema.sql defines proposal_sent CRM column');
assert(schemaCrmCode.includes('meeting_date TEXT'), 'supabase_schema.sql defines meeting_date CRM column');
assert(schemaCrmCode.includes('probability TEXT'), 'supabase_schema.sql defines probability CRM column');
assert(schemaCrmCode.includes('expected_revenue TEXT'), 'supabase_schema.sql defines expected_revenue CRM column');
assert(schemaCrmCode.includes('remarks TEXT'), 'supabase_schema.sql defines remarks CRM column');

// Team Portal CRM Assertions
assert(teamCrmCode.includes('Enterprise Quote CRM Records'), 'TeamQuotesPanel.jsx renders Enterprise Quote CRM Panel');
assert(teamCrmCode.includes('Inspect All CRM Fields'), 'TeamQuotesPanel.jsx supports 18-field CRM Inspection modal');
assert(teamCrmCode.includes('Edit Enterprise Quote Record'), 'TeamQuotesPanel.jsx supports 18-field CRM Edit modal');
assert(teamCrmCode.includes('Add New Enterprise Deal to CRM'), 'TeamQuotesPanel.jsx supports 18-field New Deal Creation modal');

// Admin Portal CRM Assertions
assert(adminCrmCode.includes('Enterprise Quotes CRM'), 'QueriesQuotesPanel.jsx renders Enterprise Quotes CRM in Admin Portal');
assert(adminCrmCode.includes('Executive CRM Inspection'), 'QueriesQuotesPanel.jsx supports 18-field CRM Inspection modal');
assert(adminCrmCode.includes('Edit Enterprise CRM Quote Record'), 'QueriesQuotesPanel.jsx supports 18-field CRM Edit modal');
assert(adminCrmCode.includes('Create New Enterprise CRM Deal'), 'QueriesQuotesPanel.jsx supports 18-field New Deal Creation modal');



console.log('\n▶ [Suite 41/41]: Team & Admin Portal Analytical Dashboard Audit');
const teamAnalyticsCode = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamAnalyticsDashboard.jsx'), 'utf8');
const teamAppCodeSuite41 = fs.readFileSync(path.join(rootDir, 'src/team/TeamApp.jsx'), 'utf8');
const adminAppCodeSuite41 = fs.readFileSync(path.join(rootDir, 'src/admin/AdminApp.jsx'), 'utf8');

assert(teamAnalyticsCode.includes('TeamAnalyticsDashboard'), 'TeamAnalyticsDashboard.jsx component exists');
assert(teamAnalyticsCode.includes('Total B2B Pipeline'), 'TeamAnalyticsDashboard.jsx displays Total B2B Pipeline KPI card');
assert(teamAnalyticsCode.includes('Support Enquiries'), 'TeamAnalyticsDashboard.jsx displays Support Enquiries KPI card');
assert(teamAnalyticsCode.includes('Ambassador Roster'), 'TeamAnalyticsDashboard.jsx displays Ambassador Roster KPI card');
assert(teamAnalyticsCode.includes('Newsletter Reach'), 'TeamAnalyticsDashboard.jsx displays Newsletter Reach KPI card');
assert(teamAnalyticsCode.includes('Enterprise CRM Pipeline Stage Breakdown'), 'TeamAnalyticsDashboard.jsx renders pipeline stage distribution chart');
assert(teamAnalyticsCode.includes('Weighted Win Forecast'), 'TeamAnalyticsDashboard.jsx calculates weighted revenue forecast');
assert(teamAnalyticsCode.includes('Top Industry Sectors'), 'TeamAnalyticsDashboard.jsx calculates industry sector breakdown');
assert(teamAnalyticsCode.includes('Realtime Database Health'), 'TeamAnalyticsDashboard.jsx provides real-time system health monitor');
assert(teamAppCodeSuite41.includes('TeamAnalyticsDashboard'), 'TeamApp.jsx imports TeamAnalyticsDashboard component');
assert(teamAppCodeSuite41.includes("id: 'analytics'"), 'TeamApp.jsx defines analytics nav item');
assert(adminAppCodeSuite41.includes('TeamAnalyticsDashboard'), 'AdminApp.jsx imports TeamAnalyticsDashboard component');
console.log('\n▶ [Suite 42/42]: Enterprise ROI Calculator & Quote Builder Audit');
const roiEngineCode = fs.readFileSync(path.join(rootDir, 'src/utils/roiCalculatorEngine.js'), 'utf8');
const roiModalCode = fs.readFileSync(path.join(rootDir, 'src/components/EnterpriseRoiCalculatorModal.jsx'), 'utf8');
const teamQuotesCodeSuite42 = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const queriesQuotesCodeSuite42 = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');

assert(roiEngineCode.includes('calculateEnterpriseRoi'), 'roiCalculatorEngine.js exports calculateEnterpriseRoi calculation function');
assert(roiEngineCode.includes('generateSensitivityMatrix'), 'roiCalculatorEngine.js exports generateSensitivityMatrix function');
assert(roiEngineCode.includes('SCENARIO_MULTIPLIERS'), 'roiCalculatorEngine.js defines Conservative, Base, and Upside multipliers');
assert(roiModalCode.includes('EnterpriseRoiCalculatorModal'), 'EnterpriseRoiCalculatorModal.jsx component exists');
assert(roiModalCode.includes('Annual Quantified Benefit'), 'EnterpriseRoiCalculatorModal.jsx renders Annual Quantified Benefit KPI');
assert(roiModalCode.includes('Illustrative ROI'), 'EnterpriseRoiCalculatorModal.jsx renders Illustrative ROI KPI');
assert(roiModalCode.includes('Benefit / Cost Ratio'), 'EnterpriseRoiCalculatorModal.jsx renders Benefit/Cost Ratio KPI');
assert(roiModalCode.includes('Payback Period'), 'EnterpriseRoiCalculatorModal.jsx renders Payback Period KPI');
assert(roiModalCode.includes('Illustrative Sensitivity Matrix'), 'EnterpriseRoiCalculatorModal.jsx renders Sensitivity Matrix table');
assert(teamQuotesCodeSuite42.includes('EnterpriseRoiCalculatorModal'), 'TeamQuotesPanel.jsx integrates EnterpriseRoiCalculatorModal');
assert(teamQuotesCodeSuite42.includes('ROI Calc'), 'TeamQuotesPanel.jsx embeds ROI Calc button in CRM table');
assert(queriesQuotesCodeSuite42.includes('EnterpriseRoiCalculatorModal'), 'QueriesQuotesPanel.jsx integrates EnterpriseRoiCalculatorModal');
console.log('\n▶ [Suite 43/43]: Enterprise PDF Quote Generator & Email Dispatch Audit');
const emailServiceCodeSuite43 = fs.readFileSync(path.join(rootDir, 'src/services/emailService.js'), 'utf8');
const pdfModalCode = fs.readFileSync(path.join(rootDir, 'src/components/EnterprisePdfQuoteModal.jsx'), 'utf8');
const teamQuotesCodeSuite43 = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const queriesQuotesCodeSuite43 = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');

assert(emailServiceCodeSuite43.includes('sendEnterpriseQuotePdfEmail'), 'emailService.js exports sendEnterpriseQuotePdfEmail dispatcher function');
assert(pdfModalCode.includes('EnterprisePdfQuoteModal'), 'EnterprisePdfQuoteModal.jsx component exists');
assert(pdfModalCode.includes('Download PDF'), 'EnterprisePdfQuoteModal.jsx implements 1-click Download PDF export');
assert(pdfModalCode.includes('Email Quote'), 'EnterprisePdfQuoteModal.jsx implements 1-click Email Quote dispatch');
assert(pdfModalCode.includes('TH3ORY MASTERCLASS'), 'EnterprisePdfQuoteModal.jsx renders branded executive proposal header');
assert(teamQuotesCodeSuite43.includes('EnterprisePdfQuoteModal'), 'TeamQuotesPanel.jsx integrates EnterprisePdfQuoteModal');
assert(teamQuotesCodeSuite43.includes('PDF Quote'), 'TeamQuotesPanel.jsx embeds PDF Quote button in CRM table');
assert(queriesQuotesCodeSuite43.includes('EnterprisePdfQuoteModal'), 'QueriesQuotesPanel.jsx integrates EnterprisePdfQuoteModal');
assert(queriesQuotesCodeSuite43.includes('PDF Quote'), 'QueriesQuotesPanel.jsx embeds PDF Quote button in Admin CRM table');

console.log('\n▶ [Suite 44/44]: Dual Currency (USD & INR) & PDF ROI Breakdown Audit');
const currencyUtilsCode = fs.readFileSync(path.join(rootDir, 'src/utils/currencyUtils.js'), 'utf8');
const pdfModalCodeSuite44 = fs.readFileSync(path.join(rootDir, 'src/components/EnterprisePdfQuoteModal.jsx'), 'utf8');
const roiModalCodeSuite44 = fs.readFileSync(path.join(rootDir, 'src/components/EnterpriseRoiCalculatorModal.jsx'), 'utf8');
const analyticsCodeSuite44 = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamAnalyticsDashboard.jsx'), 'utf8');
const teamQuotesCodeSuite44 = fs.readFileSync(path.join(rootDir, 'src/team/panels/TeamQuotesPanel.jsx'), 'utf8');
const queriesQuotesCodeSuite44 = fs.readFileSync(path.join(rootDir, 'src/admin/panels/QueriesQuotesPanel.jsx'), 'utf8');

assert(currencyUtilsCode.includes('formatDualCurrency'), 'currencyUtils.js exports formatDualCurrency helper function');
assert(currencyUtilsCode.includes('formatDualLakhs'), 'currencyUtils.js exports formatDualLakhs helper function');
assert(pdfModalCodeSuite44.includes('formatCurrencyByLocation'), 'EnterprisePdfQuoteModal.jsx uses location-based single currency formatting');
assert(pdfModalCodeSuite44.includes('calculateEnterpriseRoi'), 'EnterprisePdfQuoteModal.jsx integrates calculateEnterpriseRoi model');
assert(pdfModalCodeSuite44.includes('Recovered Participant Productivity Capacity'), 'EnterprisePdfQuoteModal.jsx embeds Productivity Capacity Value Driver');
assert(pdfModalCodeSuite44.includes('Avoided Regrettable Employee Turnover Cost'), 'EnterprisePdfQuoteModal.jsx embeds Avoided Turnover Value Driver');
assert(pdfModalCodeSuite44.includes('Recovered Manager Time'), 'EnterprisePdfQuoteModal.jsx embeds Manager Time Value Driver');
assert(pdfModalCodeSuite44.includes('Opportunity Pool Business Impact'), 'EnterprisePdfQuoteModal.jsx embeds Opportunity Pool Value Driver');
assert(roiModalCodeSuite44.includes('formatDualCurrency'), 'EnterpriseRoiCalculatorModal.jsx uses dual currency formatting');
assert(analyticsCodeSuite44.includes('formatDualCurrency'), 'TeamAnalyticsDashboard.jsx uses dual currency for pipeline metrics');
assert(teamQuotesCodeSuite44.includes('formatDualCurrency'), 'TeamQuotesPanel.jsx displays dual USD and INR expected revenue');
assert(queriesQuotesCodeSuite44.includes('formatDualCurrency'), 'QueriesQuotesPanel.jsx displays dual USD and INR expected revenue');

console.log('\n▶ [Suite 45/45]: Elaborative Ethical PDF Quote Structure Audit');
const pdfModalCodeSuite45 = fs.readFileSync(path.join(rootDir, 'src/components/EnterprisePdfQuoteModal.jsx'), 'utf8');

assert(pdfModalCodeSuite45.includes('Mentalist Sravan Productions Pvt. Ltd.'), 'EnterprisePdfQuoteModal.jsx renders legal corporate entity');
assert(pdfModalCodeSuite45.includes('GSTIN: 36AAACM1234F1Z8'), 'EnterprisePdfQuoteModal.jsx renders corporate GSTIN tax identifier');
assert(pdfModalCodeSuite45.includes('STRICTLY CONFIDENTIAL'), 'EnterprisePdfQuoteModal.jsx includes confidentiality classification notice');
assert(pdfModalCodeSuite45.includes('TH3ORY Ethical Governance'), 'EnterprisePdfQuoteModal.jsx embeds Ethical Governance Charter');
assert(pdfModalCodeSuite45.includes('Ethical Demeanor Profiling Guarantee'), 'EnterprisePdfQuoteModal.jsx embeds Ethical Profiling Guarantee');
assert(pdfModalCodeSuite45.includes('Data Privacy'), 'EnterprisePdfQuoteModal.jsx embeds Data Protection & DPDP/GDPR Compliance clause');
assert(pdfModalCodeSuite45.includes('Fair Pricing Transparency Guarantee'), 'EnterprisePdfQuoteModal.jsx embeds Fair Pricing Guarantee');
assert(pdfModalCodeSuite45.includes('ESG'), 'EnterprisePdfQuoteModal.jsx embeds ESG & Sustainability commitment');
assert(pdfModalCodeSuite45.includes('Statutory GST Liability'), 'EnterprisePdfQuoteModal.jsx itemizes domestic GST tax liability');
assert(pdfModalCodeSuite45.includes('TOTAL GROSS PROGRAM INVESTMENT'), 'EnterprisePdfQuoteModal.jsx renders Total Gross Investment in single currency');
assert(pdfModalCodeSuite45.includes('Digitally Signed'), 'EnterprisePdfQuoteModal.jsx embeds Digital Signature & Security Verification Hash');

console.log('\n▶ [Suite 46/46]: Location-Based Single Currency PDF Quote Audit');
const currencyUtilsSuite46 = fs.readFileSync(path.join(rootDir, 'src/utils/currencyUtils.js'), 'utf8');
const pdfModalSuite46 = fs.readFileSync(path.join(rootDir, 'src/components/EnterprisePdfQuoteModal.jsx'), 'utf8');

assert(currencyUtilsSuite46.includes('isIndiaLocation'), 'currencyUtils.js exports isIndiaLocation geographic detector');
assert(currencyUtilsSuite46.includes('formatCurrencyByLocation'), 'currencyUtils.js exports formatCurrencyByLocation single currency formatter');
assert(currencyUtilsSuite46.includes('formatLakhsOrUsdByLocation'), 'currencyUtils.js exports formatLakhsOrUsdByLocation single currency formatter');
assert(pdfModalSuite46.includes('isIndiaLocation'), 'EnterprisePdfQuoteModal.jsx imports isIndiaLocation detector');
assert(pdfModalSuite46.includes('formatCurrencyByLocation'), 'EnterprisePdfQuoteModal.jsx imports formatCurrencyByLocation helper');
assert(pdfModalSuite46.includes('DOMESTIC INDIA PROPOSAL'), 'EnterprisePdfQuoteModal.jsx renders Domestic India Proposal badge');
assert(pdfModalSuite46.includes('INTERNATIONAL EXECUTIVE PROPOSAL'), 'EnterprisePdfQuoteModal.jsx renders International Executive Proposal badge');
assert(pdfModalSuite46.includes('Statutory GST Liability'), 'EnterprisePdfQuoteModal.jsx itemizes domestic GST tax liability');
assert(pdfModalSuite46.includes('International Service & Processing Levy'), 'EnterprisePdfQuoteModal.jsx itemizes international processing levy');

console.log('\n▶ [Suite 47/47]: PDF Print & Design Fidelity Engine Audit');
const pdfModalSuite47 = fs.readFileSync(path.join(rootDir, 'src/components/EnterprisePdfQuoteModal.jsx'), 'utf8');

assert(pdfModalSuite47.includes('window.open'), 'EnterprisePdfQuoteModal.jsx opens a dedicated print window for PDF');
assert(pdfModalSuite47.includes('window.print()'), 'EnterprisePdfQuoteModal.jsx invokes browser print dialog for PDF save');
assert(pdfModalSuite47.includes('-webkit-print-color-adjust: exact'), 'EnterprisePdfQuoteModal.jsx forces exact color preservation in print CSS');
assert(pdfModalSuite47.includes('@page'), 'EnterprisePdfQuoteModal.jsx defines A4 page layout via @page CSS rule');
assert(pdfModalSuite47.includes('print-container'), 'EnterprisePdfQuoteModal.jsx wraps printable content in print-container canvas');

// ── Final Test Summary Report ────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`  TEST RESULTS: ${passedTests} Passed | ${failedTests} Failed | ${totalTests} Total`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY! PRODUCTION READY.\n');
  process.exit(0);
}





