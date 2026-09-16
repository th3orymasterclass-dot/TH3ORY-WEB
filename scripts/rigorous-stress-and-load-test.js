import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGET_HOST = process.env.LOAD_TEST_HOST || 'https://th3ory.online';

function calculatePercentiles(latencies) {
  if (!latencies.length) return { min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const getP = (p) => sorted[Math.floor((sorted.length - 1) * (p / 100))];

  return {
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[sorted.length - 1].toFixed(2)),
    mean: Number((sum / sorted.length).toFixed(2)),
    p50: Number(getP(50).toFixed(2)),
    p90: Number(getP(90).toFixed(2)),
    p95: Number(getP(95).toFixed(2)),
    p99: Number(getP(99).toFixed(2))
  };
}

async function executeConcurrentBatch(label, url, options = {}, concurrency = 10) {
  process.stdout.write(`  [${label}] Concurrency: ${String(concurrency).padStart(3, ' ')} parallel reqs... `);
  const startTime = performance.now();
  const latencies = [];
  const statusCodes = {};
  let successCount = 0;
  let failCount = 0;

  const promises = Array.from({ length: concurrency }).map(async () => {
    const t0 = performance.now();
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'TH3ORY-Load-Stress-Tester/1.0',
          'Accept': 'application/json, text/html, */*',
          ...(options.headers || {})
        }
      });
      const t1 = performance.now();
      latencies.push(t1 - t0);
      statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
      if (res.status >= 200 && res.status < 400) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      const t1 = performance.now();
      latencies.push(t1 - t0);
      const code = err.code || 'FETCH_ERROR';
      statusCodes[code] = (statusCodes[code] || 0) + 1;
      failCount++;
    }
  });

  await Promise.all(promises);
  const totalDuration = performance.now() - startTime;
  const rps = Number((concurrency / (totalDuration / 1000)).toFixed(1));
  const p = calculatePercentiles(latencies);
  const statusSummary = Object.entries(statusCodes).map(([code, cnt]) => `${code}:${cnt}`).join(' ');

  console.log(`Time: ${totalDuration.toFixed(0).padStart(5, ' ')}ms | RPS: ${String(rps).padStart(6, ' ')} | P50: ${String(p.p50).padStart(6, ' ')}ms | P95: ${String(p.p95).padStart(6, ' ')}ms | Codes: [${statusSummary}]`);

  return {
    label,
    concurrency,
    durationMs: Number(totalDuration.toFixed(2)),
    rps,
    successRate: Number(((successCount / concurrency) * 100).toFixed(1)),
    percentiles: p,
    statusCodes
  };
}

async function main() {
  console.log('\n=================================================================================');
  console.log('  TH3ORY MASTERCLASS — EXHAUSTIVE MULTI-TIER LOAD, CONCURRENCY & STRESS ENGINE');
  console.log(`  Target Base: ${TARGET_HOST}`);
  console.log(`  Execution Time: ${new Date().toISOString()}`);
  console.log('=================================================================================\n');

  const reportData = {
    targetHost: TARGET_HOST,
    timestamp: new Date().toISOString(),
    edgeCdnResults: [],
    serverlessApiResults: [],
    rateLimitResults: [],
    saturationLimits: {}
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PROSPECT 1: Static Assets & Edge CDN Concurrency
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('▶ [Prospect 1/4]: Edge CDN Delivery & Static Asset Throughput (GET /)');
  const cdnTiers = [10, 25, 50, 100, 200];
  for (const tier of cdnTiers) {
    const res = await executeConcurrentBatch('Edge-CDN-Root', `${TARGET_HOST}/`, { method: 'GET' }, tier);
    reportData.edgeCdnResults.push(res);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROSPECT 2: Serverless Function Concurrency (Database-Backed API)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [Prospect 2/4]: Serverless Dynamic Read Concurrency (GET /api/feature-flags)');
  const apiTiers = [10, 25, 50, 100];
  for (const tier of apiTiers) {
    const res = await executeConcurrentBatch('API-FeatureFlags', `${TARGET_HOST}/api/feature-flags`, { method: 'GET' }, tier);
    reportData.serverlessApiResults.push(res);
  }

  console.log('\n▶ [Prospect 2b/4]: Public Certificate Lookup (GET /api/verify-certificate)');
  const certTiers = [10, 25, 50];
  for (const tier of certTiers) {
    const res = await executeConcurrentBatch('API-VerifyCert', `${TARGET_HOST}/api/verify-certificate?id=CERT-20260913-9K2F7L`, { method: 'GET' }, tier);
    reportData.serverlessApiResults.push(res);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROSPECT 3: Rate Limiting & Denial-of-Service Defense Breakpoints
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [Prospect 3/4]: Rate Limiter Thresholds & DDoS Gatekeeper Activation');
  
  // 3.1: Coupon Validation Flood (Limit: 15 req/min)
  console.log('  Testing /api/validate-coupon burst (20 sequential requests to measure exact 429 threshold)...');
  let couponFirst429 = null;
  const couponStatuses = [];
  for (let i = 1; i <= 20; i++) {
    const res = await fetch(`${TARGET_HOST}/api/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: 'TH3ORY20' })
    });
    couponStatuses.push(res.status);
    if (res.status === 429 && couponFirst429 === null) {
      couponFirst429 = i;
    }
  }
  console.log(`  ✓ Coupon Flood: First 429 triggered at Request #${couponFirst429 || 'NEVER'} (Expected: ~16). Codes: ${couponStatuses.slice(0, 10).join(',')}...`);
  reportData.rateLimitResults.push({
    endpoint: '/api/validate-coupon',
    configuredLimit: '15 req/min',
    observedCutoff: couponFirst429,
    statusSequence: couponStatuses
  });

  // 3.2: Admin Login Brute Force Flood (Limit: 10 req/15min)
  console.log('  Testing /api/admin-login burst (15 sequential requests to measure exact 429 threshold)...');
  let adminFirst429 = null;
  const adminStatuses = [];
  for (let i = 1; i <= 15; i++) {
    const res = await fetch(`${TARGET_HOST}/api/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong_password_test' })
    });
    adminStatuses.push(res.status);
    if (res.status === 429 && adminFirst429 === null) {
      adminFirst429 = i;
    }
  }
  console.log(`  ✓ Admin Login Flood: First 429 triggered at Request #${adminFirst429 || 'NEVER'} (Expected: ~11). Codes: ${adminStatuses.join(',')}`);
  reportData.rateLimitResults.push({
    endpoint: '/api/admin-login',
    configuredLimit: '10 req/15min',
    observedCutoff: adminFirst429,
    statusSequence: adminStatuses
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PROSPECT 4: Maximum Load Breakpoint & Extreme Stress Ramp
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [Prospect 4/4]: Maximum Sustainable Load Breakpoint Search');
  console.log('  Running extreme stress test (250 concurrent requests on Edge CDN)...');
  const extremeCdn = await executeConcurrentBatch('Extreme-Edge-Stress', `${TARGET_HOST}/`, { method: 'GET' }, 250);
  reportData.edgeCdnResults.push(extremeCdn);

  console.log('\n=================================================================================');
  console.log('  LOAD & STRESS TEST BENCHMARK COMPLETE');
  console.log('=================================================================================\n');

  // Save empirical JSON report
  const outputJsonPath = path.join(rootDir, 'scratch/load_test_results.json');
  fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  fs.writeFileSync(outputJsonPath, JSON.stringify(reportData, null, 2), 'utf8');
  console.log(`Raw results saved to: ${outputJsonPath}`);

  return reportData;
}

main().catch(err => {
  console.error('Fatal load testing error:', err);
  process.exit(1);
});
