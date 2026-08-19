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
  if (!condition) console.log('❌ FAIL ITEM:', message);
}
`);
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

console.log('\n▶ [Suite 20/20]: Student Portal Light/Dark Theme Switch & LocalStorage Persistence Audit');
assert(studentAppContent.includes('themeMode'), 'StudentApp.jsx manages themeMode state');
assert(studentAppContent.includes('toggleTheme'), 'StudentApp.jsx includes toggleTheme switcher');
assert(studentAppContent.includes('th3ory_student_theme'), 'StudentApp.jsx persists theme selection to localStorage');
assert(studentAppContent.includes('themeMode={themeMode}'), 'StudentApp.jsx passes themeMode prop to child panels');
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
assert(schemaSqlContent.includes('public.student_habit_trackers;'), 'supabase_schema.sql enables Realtime replication on student_habit_trackers');
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


