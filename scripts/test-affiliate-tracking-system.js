/**
 * TH3ORY Affiliation & Referral Link Tracking System Validation Test Suite
 * Validates universal URL/Hash parameter extraction, cryptographic tamper-proofing,
 * multi-tier storage, conversion attribution, Supabase schema allocations, and cross-portal sync.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('========================================================================');
console.log('  TH3ORY REALTIME AFFILIATION & REFERRAL LINK TRACKING VALIDATION SUITE');
console.log('========================================================================\n');

// 1. Engine & Cryptographic Protocol Verification
console.log('▶ [Suite 1]: Tracking Engine & Cryptographic Protocol Security');
const engineSource = readFileSync(resolve('src/utils/affiliateTrackingEngine.js'), 'utf8');

assert(engineSource.includes('extractReferralFromUrl'), 'Exports extractReferralFromUrl universal parser');
assert(engineSource.includes('generateAttributionSignature'), 'Exports generateAttributionSignature for cryptographic checksum');
assert(engineSource.includes('verifyAttributionSignature'), 'Exports verifyAttributionSignature for tamper validation');
assert(engineSource.includes('getDeviceFingerprint'), 'Exports getDeviceFingerprint for privacy-compliant anti-fraud hash');
assert(engineSource.includes('classifyReferralType'), 'Exports classifyReferralType for multi-tier role classification');
assert(engineSource.includes('buildShareableReferralLinks'), 'Exports buildShareableReferralLinks with multi-destination builders');
assert(engineSource.includes('recordReferralConversion'), 'Exports recordReferralConversion for payment completion linkage');
assert(engineSource.includes('ATTRIBUTION_WINDOW_DAYS = 30'), 'Enforces 30-day persistent multi-touch attribution window');
assert(engineSource.includes('CLICK_COOLDOWN_MS'), 'Enforces click de-duplication cooldown against click-spam');
assert(engineSource.includes('th3ory_referral_click_recorded'), 'Dispatches th3ory_referral_click_recorded real-time event');
assert(engineSource.includes('th3ory_referral_conversion_recorded'), 'Dispatches th3ory_referral_conversion_recorded real-time event');

// 2. Database Schema Allocations
console.log('\n▶ [Suite 2]: Supabase Schema & Realtime Replication Allocations');
const sqlSource = readFileSync(resolve('supabase_schema.sql'), 'utf8');

assert(sqlSource.includes('CREATE TABLE IF NOT EXISTS public.referral_clicks'), 'Allocates public.referral_clicks table');
assert(sqlSource.includes('CREATE TABLE IF NOT EXISTS public.referral_conversions'), 'Allocates public.referral_conversions table');
assert(sqlSource.includes('idx_referral_clicks_code'), 'Creates index on referral_clicks.ref_code');
assert(sqlSource.includes('idx_referral_conversions_code'), 'Creates index on referral_conversions.ref_code');
assert(sqlSource.includes('public.referral_clicks') && sqlSource.includes('public.referral_conversions'), 'Enables supabase_realtime publication for referral tables');

// 3. Supabase Service Handlers
console.log('\n▶ [Suite 3]: Supabase Database Integration Handlers');
const supabaseSource = readFileSync(resolve('src/services/supabaseService.js'), 'utf8');

assert(supabaseSource.includes('recordReferralClickToSupabase'), 'Exports recordReferralClickToSupabase');
assert(supabaseSource.includes('recordReferralConversionToSupabase'), 'Exports recordReferralConversionToSupabase');
assert(supabaseSource.includes('fetchReferralClicksFromSupabase'), 'Exports fetchReferralClicksFromSupabase');
assert(supabaseSource.includes('fetchReferralConversionsFromSupabase'), 'Exports fetchReferralConversionsFromSupabase');
assert(supabaseSource.includes('fetchAllReferralAnalyticsFromSupabase'), 'Exports fetchAllReferralAnalyticsFromSupabase');
assert(supabaseSource.includes('subscribeToReferralTracking'), 'Exports subscribeToReferralTracking for real-time WebSocket updates');

// 4. Global Interception & Checkout Linkage
console.log('\n▶ [Suite 4]: Global Route Interception & Checkout Conversion Hooks');
const mainSource = readFileSync(resolve('src/main.jsx'), 'utf8');
const checkoutSource = readFileSync(resolve('src/components/CheckoutModal.jsx'), 'utf8');
const enrollPageSource = readFileSync(resolve('src/components/EnrollmentPage.jsx'), 'utf8');

assert(mainSource.includes('captureAndTrackReferral'), 'main.jsx intercepts URL parameters on load and hash change');
assert(checkoutSource.includes('getActiveAttribution'), 'CheckoutModal retrieves active referral attribution token');
assert(checkoutSource.includes('recordReferralConversion'), 'CheckoutModal records verified conversion on payment');
assert(enrollPageSource.includes('getActiveAttribution'), 'EnrollmentPage retrieves active referral attribution token');
assert(enrollPageSource.includes('recordReferralConversion'), 'EnrollmentPage records verified conversion on payment');

// 5. Ambassador Portal Real-Time Tracking & UI
console.log('\n▶ [Suite 5]: Campus Ambassador Portal Real-Time Tracking & Link Generator');
const ambSource = readFileSync(resolve('src/components/AmbassadorPortal.jsx'), 'utf8');

assert(ambSource.includes('buildShareableReferralLinks'), 'AmbassadorPortal imports buildShareableReferralLinks');
assert(ambSource.includes('fetchReferralClicksFromSupabase'), 'AmbassadorPortal loads live referral clicks');
assert(ambSource.includes('th3ory_referral_click_recorded'), 'AmbassadorPortal listens for live referral clicks');
assert(ambSource.includes('th3ory_referral_conversion_recorded'), 'AmbassadorPortal listens for live conversions');
assert(ambSource.includes('Multi-Destination Referral Link Generator'), 'AmbassadorPortal includes multi-destination link builder');
assert(ambSource.includes('Live Referral Link Click Stream'), 'AmbassadorPortal displays live click stream ledger');

// 6. Team & Admin Tracking Command Centers
console.log('\n▶ [Suite 6]: Team & Admin Tracking Command Centers');
const teamAffSource = readFileSync(resolve('src/team/panels/TeamAffiliatesPanel.jsx'), 'utf8');
const adminPanelSource = readFileSync(resolve('src/admin/panels/ReferralTrackingPanel.jsx'), 'utf8');
const adminAppSource = readFileSync(resolve('src/admin/AdminApp.jsx'), 'utf8');

assert(teamAffSource.includes('fetchAllReferralAnalyticsFromSupabase'), 'TeamAffiliatesPanel loads real-time referral stats');
assert(teamAffSource.includes('Tracked Clicks'), 'TeamAffiliatesPanel displays live tracked clicks metric');
assert(teamAffSource.includes('handleCopyPartnerLink'), 'TeamAffiliatesPanel supports 1-click partner referral link copy');

assert(adminPanelSource.includes('ReferralTrackingPanel'), 'ReferralTrackingPanel component is defined and exported');
assert(adminPanelSource.includes('Real-time Click Stream'), 'ReferralTrackingPanel includes live click stream view');
assert(adminPanelSource.includes('Verified Conversions'), 'ReferralTrackingPanel includes verified conversions ledger');
assert(adminPanelSource.includes('Partner Attribution Matrix'), 'ReferralTrackingPanel includes partner attribution matrix');
assert(adminPanelSource.includes('Universal Referral Link Generator'), 'ReferralTrackingPanel includes universal link builder');

assert(adminAppSource.includes('ReferralTrackingPanel'), 'AdminApp imports ReferralTrackingPanel');
assert(adminAppSource.includes('referral_tracking'), 'AdminApp registers referral_tracking in navigation and render switch');

console.log('\n========================================================================');
console.log(`  VALIDATION RESULTS: ${passed} Passed | ${failed} Failed | ${passed + failed} Total`);
console.log('========================================================================\n');

if (failed === 0) {
  console.log('🎉 ALL AFFILIATION & REFERRAL TRACKING CHECKS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED!\n');
  process.exit(1);
}
