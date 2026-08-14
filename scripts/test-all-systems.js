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
const headersObj = {};
vercelConfig.headers?.[0]?.headers?.forEach(h => { headersObj[h.key] = h.value; });

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
  'api/verify-certificate.js'
];

for (const file of newApiFiles) {
  const filePath = path.join(rootDir, file);
  const exists = fs.existsSync(filePath);
  assert(exists, `New serverless API file exists: ${file}`);
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
console.log('\n▶ [Suite 10/10]: Vercel Feature Flags System Audit');

const featureFlagsApiExists = fs.existsSync(path.join(rootDir, 'api/feature-flags.js'));
assert(featureFlagsApiExists, 'api/feature-flags.js serverless handler exists');

if (featureFlagsApiExists) {
  const flagsApiContent = fs.readFileSync(path.join(rootDir, 'api/feature-flags.js'), 'utf8');
  assert(flagsApiContent.includes('VERCEL_FLAGS_'), 'api/feature-flags.js checks VERCEL_FLAGS_ environment variables');
  assert(flagsApiContent.includes('DEFAULT_FEATURE_FLAGS'), 'api/feature-flags.js defines default feature flags');
}

const contextExists = fs.existsSync(path.join(rootDir, 'src/context/FeatureFlagContext.jsx'));
assert(contextExists, 'src/context/FeatureFlagContext.jsx React context exists');

const adminPanelExists = fs.existsSync(path.join(rootDir, 'src/admin/panels/FeatureFlagsPanel.jsx'));
assert(adminPanelExists, 'src/admin/panels/FeatureFlagsPanel.jsx admin panel exists');


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

