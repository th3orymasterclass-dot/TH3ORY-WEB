import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateEnvironmentSafety,
  calculateLatencyStats,
  captureMemorySnapshot,
  redactSecrets
} from './env-guard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_TARGET = process.env.LOAD_TEST_HOST || 'https://th3ory.online';

/**
 * Worker Pool with Controlled Concurrency and Backpressure
 */
async function runSustainedPhase(options) {
  const {
    name,
    targetUrl,
    method = 'GET',
    headers = {},
    body = null,
    concurrency = 10,
    durationSeconds = 60,
    timeoutMs = 15000,
    maxRequests = 50000,
    maxErrorPercentage = 5.0,
    onProgress
  } = options;

  console.log(`\n============================================================`);
  console.log(`  RUNNING PHASE: ${name}`);
  console.log(`  Target:       ${redactSecrets(targetUrl)}`);
  console.log(`  Concurrency:  ${concurrency} active workers`);
  console.log(`  Duration:     ${durationSeconds}s`);
  console.log(`  Max Requests: ${maxRequests}`);
  console.log(`============================================================`);

  const startTime = performance.now();
  const endTime = startTime + (durationSeconds * 1000);
  const latencies = [];
  const statusCodes = {};
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  let shouldAbort = false;
  let abortReason = null;

  // Memory Tracking
  const memorySnapshots = {
    start: captureMemorySnapshot(`${name}_START`),
    midpoint: null,
    end: null,
    postLoad: null
  };

  let activeWorkers = 0;
  const midpointTime = startTime + ((durationSeconds * 1000) / 2);
  let midpointCaptured = false;

  async function worker() {
    while (performance.now() < endTime && totalRequests < maxRequests && !shouldAbort) {
      totalRequests++;
      const reqId = totalRequests;
      const t0 = performance.now();

      // Check midpoint memory
      if (!midpointCaptured && t0 >= midpointTime) {
        midpointCaptured = true;
        memorySnapshots.midpoint = captureMemorySnapshot(`${name}_MIDPOINT`);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const fetchOpts = {
          method,
          headers: {
            'User-Agent': 'TH3ORY-SRE-SustainedLoadEngine/2.0',
            'Accept': 'application/json, text/html, */*',
            ...headers
          },
          signal: controller.signal
        };
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          fetchOpts.body = typeof body === 'object' ? JSON.stringify(body) : body;
        }

        const res = await fetch(targetUrl, fetchOpts);
        clearTimeout(timeoutId);
        const t1 = performance.now();
        const elapsed = t1 - t0;
        latencies.push(elapsed);

        const code = String(res.status);
        statusCodes[code] = (statusCodes[code] || 0) + 1;

        if (res.status >= 200 && res.status < 400) {
          successfulRequests++;
        } else {
          failedRequests++;
        }
      } catch (err) {
        const t1 = performance.now();
        latencies.push(t1 - t0);
        const errCode = err.name === 'AbortError' ? 'TIMEOUT' : (err.code || 'NETWORK_ERROR');
        statusCodes[errCode] = (statusCodes[errCode] || 0) + 1;
        failedRequests++;
      }

      // Check error threshold circuit breaker
      if (totalRequests >= 50) {
        const currentErrorRate = (failedRequests / totalRequests) * 100;
        if (currentErrorRate > maxErrorPercentage) {
          shouldAbort = true;
          abortReason = `CIRCUIT BREAKER: Error rate (${currentErrorRate.toFixed(1)}%) exceeded max threshold (${maxErrorPercentage}%)`;
          console.error(`\n🚨 ${abortReason}`);
          break;
        }
      }

      if (onProgress && reqId % 25 === 0) {
        onProgress({ totalRequests, successfulRequests, failedRequests, latencies });
      }
    }
  }

  // Launch initial concurrent worker pool
  const workerPromises = [];
  for (let i = 0; i < concurrency; i++) {
    activeWorkers++;
    workerPromises.push(worker());
  }

  await Promise.all(workerPromises);

  const totalDurationMs = performance.now() - startTime;
  memorySnapshots.end = captureMemorySnapshot(`${name}_END`);

  // Allow 1s settling for garbage collection / post-load stabilization
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (global.gc) {
    try { global.gc(); } catch (e) {}
  }
  memorySnapshots.postLoad = captureMemorySnapshot(`${name}_POST_LOAD`);

  const stats = calculateLatencyStats(latencies);
  const rps = Number((totalRequests / (totalDurationMs / 1000)).toFixed(2));
  const errorRate = totalRequests > 0 ? Number(((failedRequests / totalRequests) * 100).toFixed(2)) : 0;

  // Memory Delta Calculation
  const memoryGrowthMB = Number((memorySnapshots.end.heapUsedMB - memorySnapshots.start.heapUsedMB).toFixed(2));
  const postLoadResidualGrowthMB = Number((memorySnapshots.postLoad.heapUsedMB - memorySnapshots.start.heapUsedMB).toFixed(2));

  console.log(`\n------------------------------------------------------------`);
  console.log(`  Phase [${name}] Results:`);
  console.log(`  Duration:         ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log(`  Total Requests:   ${totalRequests}`);
  console.log(`  Success / Fail:   ${successfulRequests} / ${failedRequests}`);
  console.log(`  Effective RPS:    ${rps}`);
  console.log(`  Error Rate:       ${errorRate}%`);
  console.log(`  Latencies:        P50: ${stats.p50}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms | Max: ${stats.max}ms`);
  console.log(`  Long-Tail Ratios: P95/P50: ${stats.p95_p50_ratio}x | P99/P50: ${stats.p99_p50_ratio}x`);
  console.log(`  Memory (Heap):    Start: ${memorySnapshots.start.heapUsedMB}MB -> End: ${memorySnapshots.end.heapUsedMB}MB (Growth: ${memoryGrowthMB}MB, Residual: ${postLoadResidualGrowthMB}MB)`);
  console.log(`  Status Codes:     ${JSON.stringify(statusCodes)}`);
  if (abortReason) {
    console.log(`  Status:           ABORTED (${abortReason})`);
  } else {
    console.log(`  Status:           COMPLETED`);
  }
  console.log(`------------------------------------------------------------\n`);

  return {
    name,
    concurrency,
    durationSeconds: Number((totalDurationMs / 1000).toFixed(2)),
    totalRequests,
    successfulRequests,
    failedRequests,
    rps,
    errorRate,
    stats,
    statusCodes,
    memorySnapshots,
    memoryGrowthMB,
    postLoadResidualGrowthMB,
    aborted: shouldAbort,
    abortReason
  };
}

/**
 * Master Sustained-Load & Recovery Test Orchestrator
 */
export async function runSustainedLoadSuite(customConfig = {}) {
  const safety = validateEnvironmentSafety({
    isDestructive: false,
    target: customConfig.targetUrl || DEFAULT_TARGET,
    maxConcurrency: customConfig.maxConcurrency || 250,
    maxDurationSeconds: 1800,
    maxRequests: 100000
  });

  if (!safety.allowed) {
    throw new Error(safety.error || 'Environment safety check failed');
  }

  const targetUrl = customConfig.targetUrl || `${DEFAULT_TARGET}/`;
  const scale = Number(process.env.SUSTAINED_DURATION_SCALE || customConfig.scale || 1.0);
  
  // Phase duration scale (allows standard full endurance or accelerated calibration runs)
  const baseDur = Math.max(10, Math.round(60 * scale));       // Baseline
  const normalDur = Math.max(15, Math.round(90 * scale));     // 50 concurr
  const heavyDur = Math.max(15, Math.round(90 * scale));      // 100 concurr
  const stressDur = Math.max(15, Math.round(90 * scale));     // 250 concurr
  const recoveryDur = Math.max(10, Math.round(45 * scale));   // Recovery check

  console.log(`▶ Initializing Sustained-Load Profile (Scale: ${scale}x)`);
  console.log(`  Phase 0 (Baseline):   10 concurrency, ${baseDur}s`);
  console.log(`  Phase 1 (Normal):     50 concurrency, ${normalDur}s`);
  console.log(`  Phase 2 (Heavy):     100 concurrency, ${heavyDur}s`);
  console.log(`  Phase 3 (Stress):    250 concurrency, ${stressDur}s`);
  console.log(`  Recovery Check:       10 concurrency, ${recoveryDur}s`);

  const suiteResults = {
    targetUrl,
    timestamp: new Date().toISOString(),
    phases: [],
    recoveryAnalysis: null,
    overallVerdict: 'PASS'
  };

  // Phase 0: Baseline
  const p0 = await runSustainedPhase({
    name: 'Phase_0_Baseline',
    targetUrl,
    concurrency: 10,
    durationSeconds: baseDur,
    maxErrorPercentage: 2.0
  });
  suiteResults.phases.push(p0);

  // Phase 1: Normal Sustained (50 Concurrent)
  const p1 = await runSustainedPhase({
    name: 'Phase_1_Normal_Sustained',
    targetUrl,
    concurrency: 50,
    durationSeconds: normalDur,
    maxErrorPercentage: 2.0
  });
  suiteResults.phases.push(p1);

  // Phase 2: Heavy Sustained (100 Concurrent)
  const p2 = await runSustainedPhase({
    name: 'Phase_2_Heavy_Sustained',
    targetUrl,
    concurrency: 100,
    durationSeconds: heavyDur,
    maxErrorPercentage: 3.0
  });
  suiteResults.phases.push(p2);

  // Phase 3: Stress Endurance (250 Concurrent)
  const p3 = await runSustainedPhase({
    name: 'Phase_3_Stress_Endurance',
    targetUrl,
    concurrency: 250,
    durationSeconds: stressDur,
    maxErrorPercentage: 5.0
  });
  suiteResults.phases.push(p3);

  // Phase 4: Recovery After Load (Drop Concurrency to 10)
  console.log('\n▶ Dropping Concurrency to 10 for Recovery Evaluation...');
  const pRecovery = await runSustainedPhase({
    name: 'Phase_4_Recovery_Evaluation',
    targetUrl,
    concurrency: 10,
    durationSeconds: recoveryDur,
    maxErrorPercentage: 2.0
  });
  suiteResults.phases.push(pRecovery);

  // Calculate Recovery Deltas against Phase 0 Baseline
  const baselineP50 = p0.stats.p50;
  const baselineRPS = p0.rps;
  const baselineErr = p0.errorRate;

  const recoveryP50 = pRecovery.stats.p50;
  const recoveryRPS = pRecovery.rps;
  const recoveryErr = pRecovery.errorRate;

  const latencyDeltaPct = baselineP50 > 0 ? Number((((recoveryP50 - baselineP50) / baselineP50) * 100).toFixed(2)) : 0;
  const throughputDeltaPct = baselineRPS > 0 ? Number((((recoveryRPS - baselineRPS) / baselineRPS) * 100).toFixed(2)) : 0;
  const errorDelta = Number((recoveryErr - baselineErr).toFixed(2));

  let recoveryVerdict = 'PASS';
  let recoveryNotes = 'System returned to healthy baseline performance within 20% tolerance.';

  if (Math.abs(latencyDeltaPct) > 20 || Math.abs(throughputDeltaPct) > 25) {
    recoveryVerdict = 'WARN';
    recoveryNotes = `System recovered but shows variance (>20%): Latency delta: ${latencyDeltaPct}%, Throughput delta: ${throughputDeltaPct}%`;
  }
  if (recoveryErr > 2.0 || pRecovery.aborted) {
    recoveryVerdict = 'FAIL';
    recoveryNotes = `System failed to recover: Elevated error rate (${recoveryErr}%) post-load.`;
  }

  suiteResults.recoveryAnalysis = {
    baselineP50,
    recoveryP50,
    latencyDeltaPct,
    baselineRPS,
    recoveryRPS,
    throughputDeltaPct,
    baselineErrorRate: baselineErr,
    recoveryErrorRate: recoveryErr,
    errorDelta,
    verdict: recoveryVerdict,
    notes: recoveryNotes
  };

  console.log(`\n============================================================`);
  console.log(`  RECOVERY-AFTER-LOAD ANALYSIS`);
  console.log(`  Baseline P50:         ${baselineP50}ms -> Post-Load P50: ${recoveryP50}ms (Delta: ${latencyDeltaPct}%)`);
  console.log(`  Baseline RPS:         ${baselineRPS} -> Post-Load RPS: ${recoveryRPS} (Delta: ${throughputDeltaPct}%)`);
  console.log(`  Baseline Error Rate:  ${baselineErr}% -> Post-Load Error Rate: ${recoveryErr}%`);
  console.log(`  Recovery Verdict:     ${recoveryVerdict} (${recoveryNotes})`);
  console.log(`============================================================\n`);

  // Overall Suite Verdict
  if (p0.errorRate > 1 || p1.errorRate > 2 || p2.errorRate > 3 || p3.errorRate > 5 || recoveryVerdict === 'FAIL') {
    suiteResults.overallVerdict = 'FAIL';
  } else if (recoveryVerdict === 'WARN' || p3.errorRate > 2) {
    suiteResults.overallVerdict = 'WARN';
  } else {
    suiteResults.overallVerdict = 'PASS';
  }

  // Save JSON report
  const scratchDir = path.join(rootDir, 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(
    path.join(scratchDir, 'sustained_load_results.json'),
    JSON.stringify(suiteResults, null, 2),
    'utf8'
  );

  return suiteResults;
}

// Standalone CLI execution
if (process.argv[1] && process.argv[1].endsWith('sustained-load-test.js')) {
  runSustainedLoadSuite()
    .then(res => {
      console.log(`Sustained Load Suite Finished. Overall Verdict: ${res.overallVerdict}`);
      process.exit(res.overallVerdict === 'FAIL' ? 2 : (res.overallVerdict === 'WARN' ? 1 : 0));
    })
    .catch(err => {
      console.error('Fatal Sustained Load Runner Error:', err);
      process.exit(3);
    });
}
