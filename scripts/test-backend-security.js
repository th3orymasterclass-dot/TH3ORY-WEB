import { signJwt, verifyJwt, requireAdminAuth, requireStudentAuth } from '../api/_lib/auth.js';
import { safeCompare, sanitizeForCsv, escapeHtml, checkRateLimit, checkRecipientRateLimit, setStrictCorsHeaders } from '../api/_lib/security.js';
import adminLoginHandler from '../api/admin-login.js';
import featureFlagsHandler from '../api/feature-flags.js';
import sendEmailHandler from '../api/send-email.js';
import dpdpHandler from '../api/dpdp.js';
import updateProfileHandler from '../api/update-student-profile.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    failed++;
  }
}

// Mock HTTP Request & Response
function createMockReqRes({ method = 'GET', headers = {}, query = {}, body = {} } = {}) {
  let statusCode = 200;
  let responseData = null;
  let headersSent = {};

  const req = {
    method,
    headers: { 'user-agent': 'SecurityTest/1.0', ...headers },
    query,
    body,
    socket: { remoteAddress: '127.0.0.1' }
  };

  const res = {
    headersSent,
    setHeader(k, v) { headersSent[k] = v; },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    },
    end() { return this; },
    _getStatusCode: () => statusCode,
    _getData: () => responseData,
  };

  return { req, res };
}

async function runSecuritySuite() {
  console.log('\n🔒 RUNNING COMPREHENSIVE BACKEND SECURITY VERIFICATION SUITE\n');

  // TEST SUITE 1: JWT & Auth Module
  console.log('--- TEST SUITE 1: JWT Cryptographic Engine & Security Helpers ---');
  const token = signJwt({ role: 'admin', sub: 'tester' }, 3600);
  assert(Boolean(token && token.split('.').length === 3), 'signJwt produces standard 3-part HS256 JWT');

  const decoded = verifyJwt(token);
  assert(decoded && decoded.role === 'admin' && decoded.sub === 'tester', 'verifyJwt decodes valid signed payload');

  const tamperedToken = token.slice(0, -5) + 'AAAAA';
  assert(verifyJwt(tamperedToken) === null, 'verifyJwt rejects tampered signature');

  const expiredToken = signJwt({ role: 'student', email: 'expired@th3ory.online' }, -10);
  assert(verifyJwt(expiredToken) === null, 'verifyJwt rejects expired tokens');

  assert(safeCompare('secret_hash_123', 'secret_hash_123') === true, 'safeCompare matches identical strings');
  assert(safeCompare('secret_hash_123', 'secret_hash_456') === false, 'safeCompare rejects non-matching strings');

  // TEST SUITE 2: CSV & HTML Sanitization
  console.log('\n--- TEST SUITE 2: Injection Defenses (CSV DDE & HTML XSS) ---');
  assert(sanitizeForCsv('=SUM(A1:A10)') === "'=SUM(A1:A10)", 'CSV sanitizer prepends single quote to formula =');
  assert(sanitizeForCsv('+cmd|') === "'+cmd|", 'CSV sanitizer prepends single quote to +cmd');
  assert(sanitizeForCsv('@DDE') === "'@DDE", 'CSV sanitizer neutralizes @ prefix');
  assert(sanitizeForCsv('Standard Name') === 'Standard Name', 'CSV sanitizer preserves regular strings');

  const escaped = escapeHtml('<script>alert("XSS")</script>');
  assert(!escaped.includes('<script>') && escaped.includes('&lt;script&gt;'), 'escapeHtml neutralizes script tags');

  // TEST SUITE 3: Unauthenticated Feature Flag Protection
  console.log('\n--- TEST SUITE 3: Feature Flag Mutation Authorization ---');
  const mockFFUnauthorized = createMockReqRes({
    method: 'POST',
    body: { flags: { MAINTENANCE_MODE: { enabled: true } } }
  });
  await featureFlagsHandler(mockFFUnauthorized.req, mockFFUnauthorized.res);
  assert(mockFFUnauthorized.res._getStatusCode() === 401, 'POST /api/feature-flags blocks unauthenticated callers (401)');

  const mockFFAdmin = createMockReqRes({
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: { flags: { SHOW_QUICK_ENROLLMENT_BAR: { enabled: true } } }
  });
  await featureFlagsHandler(mockFFAdmin.req, mockFFAdmin.res);
  assert(mockFFAdmin.res._getStatusCode() === 200, 'POST /api/feature-flags accepts verified Admin JWT (200)');

  // TEST SUITE 4: Open Mail Relay & Broadcast Email Defense
  console.log('\n--- TEST SUITE 4: Email Dispatcher Authorization ---');
  const mockEmailUnauthorized = createMockReqRes({
    method: 'POST',
    body: {
      type: 'BROADCAST_EMAIL',
      to: 'victim@example.com',
      subject: 'Phishing Attempt',
      messageBody: 'Click here'
    }
  });
  await sendEmailHandler(mockEmailUnauthorized.req, mockEmailUnauthorized.res);
  assert(mockEmailUnauthorized.res._getStatusCode() === 401, 'POST /api/send-email blocks unauthorized broadcast relay (401)');

  // TEST SUITE 5: DPDP Export BOLA Protection
  console.log('\n--- TEST SUITE 5: DPDP Personal Data Export Authorization (BOLA Defense) ---');
  const mockExportUnauthorized = createMockReqRes({
    method: 'GET',
    query: { action: 'export', email: 'victim@th3ory.online', format: 'json' }
  });
  await dpdpHandler(mockExportUnauthorized.req, mockExportUnauthorized.res);
  assert(mockExportUnauthorized.res._getStatusCode() === 401, 'GET /api/dpdp?action=export blocks unauthenticated data dump (401)');

  const studentToken = signJwt({ role: 'student', email: 'alice@th3ory.online' }, 3600);
  const mockExportCrossUser = createMockReqRes({
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` },
    query: { action: 'export', email: 'bob@th3ory.online', format: 'json' }
  });
  await dpdpHandler(mockExportCrossUser.req, mockExportCrossUser.res);
  assert(mockExportCrossUser.res._getStatusCode() === 403, 'GET /api/dpdp?action=export prevents accessing another student\'s data (403 BOLA)');

  // TEST SUITE 6: Student Profile BOLA Protection
  console.log('\n--- TEST SUITE 6: Student Profile Update BOLA Defense ---');
  const mockProfileCrossUser = createMockReqRes({
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` },
    body: { profile: { email: 'bob@th3ory.online', name: 'Hacked Name' } }
  });
  await updateProfileHandler(mockProfileCrossUser.req, mockProfileCrossUser.res);
  assert(mockProfileCrossUser.res._getStatusCode() === 403, 'POST /api/update-student-profile rejects cross-user profile overwrite (403)');

  // TEST SUITE 7: Admin Login Rate Limiting
  console.log('\n--- TEST SUITE 7: Rate Limiter Engine ---');
  const rateLimitKey = 'test_ip_rate_check_' + Date.now();
  for (let i = 0; i < 5; i++) {
    checkRateLimit(rateLimitKey, 5, 60000);
  }
  const blockedCheck = checkRateLimit(rateLimitKey, 5, 60000);
  assert(blockedCheck.allowed === false, 'Rate limiter correctly blocks requests exceeding threshold');

  // TEST SUITE 8: Content Security Policy & Strict Security Headers
  console.log('\n--- TEST SUITE 8: CSP & Security Header Defenses ---');
  const mockCorsReqRes = createMockReqRes({ method: 'GET', headers: { origin: 'https://th3ory.online' } });
  setStrictCorsHeaders(mockCorsReqRes.req, mockCorsReqRes.res);
  const sentHeaders = mockCorsReqRes.res.headersSent || {};
  assert(Boolean(sentHeaders['Content-Security-Policy']), 'setStrictCorsHeaders attaches Content-Security-Policy header');
  assert(Boolean(sentHeaders['Permissions-Policy']), 'setStrictCorsHeaders attaches Permissions-Policy header');
  assert(sentHeaders['X-Frame-Options'] === 'SAMEORIGIN', 'setStrictCorsHeaders enforces X-Frame-Options: SAMEORIGIN');
  assert(sentHeaders['X-Content-Type-Options'] === 'nosniff', 'setStrictCorsHeaders enforces nosniff');

  // TEST SUITE 9: Recipient Email Rate Limiting (Inbox Bomb Defense)
  console.log('\n--- TEST SUITE 9: Recipient Rate Limiting (Spam Relay Defense) ---');
  const testRecipient = `victim_${Date.now()}@example.com`;
  assert(checkRecipientRateLimit(testRecipient, 2, 60000).allowed === true, 'First email to recipient is permitted');
  assert(checkRecipientRateLimit(testRecipient, 2, 60000).allowed === true, 'Second email to recipient is permitted');
  assert(checkRecipientRateLimit(testRecipient, 2, 60000).allowed === false, 'Third email to recipient is blocked by rate limit');

  // TEST SUITE 10: DPDP Consent PII Leakage Defense
  console.log('\n--- TEST SUITE 10: DPDP Unauthenticated Consent Query Protection ---');
  const mockConsentNoAuth = createMockReqRes({
    method: 'GET',
    query: { action: 'consent', email: 'alice@th3ory.online' }
  });
  await dpdpHandler(mockConsentNoAuth.req, mockConsentNoAuth.res);
  assert(mockConsentNoAuth.res._getStatusCode() === 401, 'GET /api/dpdp?action=consent blocks unauthenticated requests (401)');

  // TEST SUITE 11: Admin Login Bad Password Rejection
  console.log('\n--- TEST SUITE 11: Admin Login Rejection of Invalid Passwords ---');
  const mockLoginBad = createMockReqRes({
    method: 'POST',
    body: { password: 'wrong_password_attempt' }
  });
  await adminLoginHandler(mockLoginBad.req, mockLoginBad.res);
  assert(mockLoginBad.res._getStatusCode() === 401, 'POST /api/admin-login rejects wrong password with 401');

  console.log(`\n======================================================`);
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecuritySuite().catch(err => {
  console.error('Test Suite Failed With Exception:', err);
  process.exit(1);
});
