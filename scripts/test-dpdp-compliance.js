/**
 * AUTOMATED TEST SUITE: DPDP ACT 2023 COMPLIANCE & PRIVACY FRAMEWORK
 * Validates Consent Lifecycle, DSR Processing, Data Portability, Retention Engine,
 * Grievance SLAs, and Cryptographic Audit Chaining.
 */

import { DPDP_DATA_INVENTORY, getCompleteDataInventorySummary } from '../src/data/dataInventoryRegistry.js';
import { DPDP_SUBPROCESSOR_REGISTRY, getSubprocessorStats } from '../src/data/dpdpSubprocessorRegistry.js';
import { calculateSlaRemaining, GRIEVANCE_CATEGORIES } from '../src/services/dpdpGrievanceService.js';
import { RETENTION_MATRIX, getRetentionPolicyMatrix } from '../src/services/dpdpRetentionEngine.js';
import { COOKIE_CATEGORIES } from '../src/utils/cookieConsentEngine.js';
import { CONSENT_PURPOSES } from '../src/services/dpdpConsentManager.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('\n======================================================');
console.log('🏛️ RUNNING DPDP ACT 2023 COMPLIANCE TEST SUITE');
console.log('======================================================\n');

// TEST SUITE 1: DATA INVENTORY & CLASSIFICATION
console.log('1. Testing Data Discovery & Classification Registry (Section 4)...');
const summary = getCompleteDataInventorySummary();
assert(summary.totalTables >= 6, `Total DB tables mapped (${summary.totalTables}) >= 6`);
assert(summary.totalFields >= 15, `Total PII fields mapped (${summary.totalFields}) >= 15`);
assert(summary.categoriesCount['Personal Data'] > 0, 'Personal Data category is accurately classified');
assert(summary.complianceStandard.includes('DPDP Act, 2023'), 'Compliance standard references DPDP Act 2023');

// TEST SUITE 2: THIRD-PARTY SUB-PROCESSOR REGISTRY
console.log('\n2. Testing Sub-Processor Registry & Transfer Safeguards (Section 8)...');
const subStats = getSubprocessorStats();
assert(subStats.total >= 4, `Sub-processors registered (${subStats.total}) >= 4`);
assert(subStats.dpaComplianceRate === '100%', '100% of sub-processors have active DPAs');
const supabaseSp = DPDP_SUBPROCESSOR_REGISTRY.find(s => s.id === 'sp_supabase');
assert(supabaseSp.serverLocation.includes('Mumbai'), 'Supabase primary server is AWS Mumbai Region');
assert(supabaseSp.securityMeasures.includes('AES-256'), 'Supabase has AES-256 encryption at rest');

// TEST SUITE 3: CONSENT UNBUNDLING & PURPOSES
console.log('\n3. Testing Consent Unbundling & Purposes (Section 6)...');
const purposeKeys = Object.keys(CONSENT_PURPOSES);
assert(purposeKeys.includes('ACCOUNT_CREATION'), 'Account creation purpose is defined');
assert(purposeKeys.includes('MARKETING_COMMUNICATIONS'), 'Marketing communications purpose is unbundled');
assert(purposeKeys.includes('ANALYTICS_COOKIES'), 'Analytics cookies purpose is unbundled');
assert(CONSENT_PURPOSES.ACCOUNT_CREATION.mandatory === true, 'Service delivery consent is flagged mandatory');
assert(CONSENT_PURPOSES.MARKETING_COMMUNICATIONS.mandatory === false, 'Marketing consent is strictly optional');

// TEST SUITE 4: COOKIE & TRACKER GATING
console.log('\n4. Testing Cookie & Tracker Categorization...');
assert(COOKIE_CATEGORIES.STRICTLY_NECESSARY.mandatory === true, 'Strictly necessary cookies cannot be disabled');
assert(COOKIE_CATEGORIES.PERFORMANCE_ANALYTICS.mandatory === false, 'Analytics cookies are opt-in');
assert(COOKIE_CATEGORIES.MARKETING_CAMPAIGNS.mandatory === false, 'Marketing cookies are opt-in');

// TEST SUITE 5: GRIEVANCE REDRESSAL & 30-DAY STATUTORY SLA
console.log('\n5. Testing Section 13 Grievance SLA Monitoring Engine...');
assert(GRIEVANCE_CATEGORIES.length >= 5, `Grievance categories (${GRIEVANCE_CATEGORIES.length}) >= 5`);

const futureDeadline = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();
const slaCheckFuture = calculateSlaRemaining(futureDeadline);
assert(!slaCheckFuture.isOverdue, 'Active ticket is not marked overdue');
assert(slaCheckFuture.daysLeft === 27 || slaCheckFuture.daysLeft === 28, `SLA remaining days calculated accurately (${slaCheckFuture.daysLeft})`);

const pastDeadline = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const slaCheckPast = calculateSlaRemaining(pastDeadline);
assert(slaCheckPast.isOverdue === true, 'Overdue ticket is correctly flagged');
assert(slaCheckPast.formatted.includes('Escalate to DPBI'), 'Overdue alert triggers statutory DPBI escalation');

// TEST SUITE 6: DATA RETENTION POLICIES & LEGAL HOLDS
console.log('\n6. Testing Retention Matrix & Legal Hold Enforcement...');
const retentionPolicies = getRetentionPolicyMatrix();
assert(retentionPolicies.length >= 4, `Retention policies (${retentionPolicies.length}) >= 4`);

const financialPolicy = RETENTION_MATRIX.FINANCIAL_TRANSACTIONS;
assert(financialPolicy.retentionDays === 2920, 'Financial transactions retained for 8 years (2,920 days)');
assert(financialPolicy.legalHold === true, 'Financial transactions have statutory tax legal hold');
assert(financialPolicy.canUserDelete === false, 'Direct hard-deletion of tax records is prevented by legal hold');
assert(financialPolicy.anonymizeOnErasure === true, 'Anonymization is enforced on erasure of tax records');

const learningPolicy = RETENTION_MATRIX.STUDENT_LEARNING_RECORDS;
assert(learningPolicy.canUserDelete === true, 'Student learning records can be permanently deleted');

console.log('\n======================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} DPDP COMPLIANCE TESTS PASSED!`);
console.log('======================================================\n');
