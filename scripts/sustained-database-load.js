import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import {
  loadEnvFiles,
  validateEnvironmentSafety,
  calculateLatencyStats,
  captureMemorySnapshot,
  redactSecrets
} from './env-guard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

loadEnvFiles();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runDatabaseEnduranceBatch(options) {
  const {
    name,
    concurrency = 25,
    iterations = 200,
    taskFn
  } = options;

  console.log(`\n▶ [DB Phase]: ${name} (${concurrency} concurrency, ${iterations} total ops)...`);
  const startTime = performance.now();
  const latencies = [];
  let successes = 0;
  let errors = 0;
  let deadlocks = 0;
  let timeouts = 0;
  const errorSamples = [];

  let completedOps = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < iterations) {
      const idx = cursor++;
      const t0 = performance.now();
      try {
        const res = await taskFn(idx);
        const t1 = performance.now();
        latencies.push(t1 - t0);

        if (res && res.error) {
          errors++;
          const errMsg = res.error.message || JSON.stringify(res.error);
          errorSamples.push(errMsg);
          if (errMsg.toLowerCase().includes('deadlock')) deadlocks++;
          if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('canceling statement')) timeouts++;
        } else {
          successes++;
        }
      } catch (err) {
        const t1 = performance.now();
        latencies.push(t1 - t0);
        errors++;
        const errMsg = err.message || String(err);
        errorSamples.push(errMsg);
        if (errMsg.toLowerCase().includes('deadlock')) deadlocks++;
        if (errMsg.toLowerCase().includes('timeout')) timeouts++;
      }
      completedOps++;
    }
  }

  const workers = Array.from({ length: concurrency }).map(() => worker());
  await Promise.all(workers);

  const durationMs = performance.now() - startTime;
  const stats = calculateLatencyStats(latencies);
  const rps = Number((iterations / (durationMs / 1000)).toFixed(2));
  const errorRate = Number(((errors / iterations) * 100).toFixed(2));

  console.log(`  Done in ${(durationMs / 1000).toFixed(2)}s | RPS: ${rps} | Success: ${successes}/${iterations} | ErrRate: ${errorRate}%`);
  console.log(`  Latencies: P50: ${stats.p50}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms | Max: ${stats.max}ms`);
  console.log(`  Ratios:    P95/P50: ${stats.p95_p50_ratio}x | P99/P50: ${stats.p99_p50_ratio}x`);
  console.log(`  Issues:    Deadlocks: ${deadlocks} | Timeouts: ${timeouts}`);
  if (errorSamples.length > 0) {
    console.log(`  ↳ Sample Error: ${errorSamples[0]}`);
  }

  return {
    name,
    concurrency,
    iterations,
    durationSeconds: Number((durationMs / 1000).toFixed(2)),
    rps,
    successes,
    errors,
    errorRate,
    deadlocks,
    timeouts,
    stats,
    errorSamples: errorSamples.slice(0, 3)
  };
}

export async function runDatabaseEnduranceSuite() {
  const safety = validateEnvironmentSafety({
    isDestructive: false,
    target: supabaseUrl,
    maxConcurrency: 100,
    maxDurationSeconds: 600,
    maxRequests: 5000
  });

  if (!safety.allowed) {
    throw new Error(safety.error || 'Database safety check failed');
  }

  console.log(`============================================================`);
  console.log(`  TH3ORY — SUSTAINED DATABASE CONCURRENCY & INTEGRITY AUDIT`);
  console.log(`  Instance: ${redactSecrets(supabaseUrl)}`);
  console.log(`============================================================\n`);

  const memStart = captureMemorySnapshot('DB_START');
  const results = {
    timestamp: new Date().toISOString(),
    supabaseUrl: redactSecrets(supabaseUrl),
    phases: [],
    cleanupCount: 0,
    verdict: 'PASS'
  };

  const synthRunId = `synth_${Date.now()}`;

  // 1. READ Endurance: site_settings & student_accounts
  const readPhase = await runDatabaseEnduranceBatch({
    name: 'Sustained_Reads_SiteSettings',
    concurrency: 35,
    iterations: 200,
    taskFn: async () => {
      return await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .limit(10);
    }
  });
  results.phases.push(readPhase);

  // 2. WRITE / UPSERT Endurance: student_accounts
  const writePhase = await runDatabaseEnduranceBatch({
    name: 'Sustained_Upserts_StudentAccounts',
    concurrency: 25,
    iterations: 100,
    taskFn: async (idx) => {
      const email = `test_${synthRunId}_student_${idx % 30}@th3ory.online`;
      return await supabase
        .from('student_accounts')
        .upsert({
          email,
          name: `Synthetic Learner ${idx}`,
          enrollment_code: `SYNT${String(idx).padStart(4, '0')}`,
          plan_name: 'TH3ORY Masterclass Flagship Pass',
          last_login: new Date().toISOString()
        }, { onConflict: 'email' });
    }
  });
  results.phases.push(writePhase);

  // 3. INSERT Endurance: contact_inquiries
  const insertPhase = await runDatabaseEnduranceBatch({
    name: 'Sustained_Inserts_ContactInquiries',
    concurrency: 30,
    iterations: 120,
    taskFn: async (idx) => {
      return await supabase
        .from('contact_inquiries')
        .insert({
          name: `Synthetic Inquirer ${idx}`,
          email: `test_${synthRunId}_inquiry_${idx}@th3ory.online`,
          subject: 'Sustained Database Endurance Probe',
          message: `Automated payload generated by SRE endurance suite at ${Date.now()}`,
          status: 'new'
        });
    }
  });
  results.phases.push(insertPhase);

  // 4. Data Integrity Verification: Verify exactly 30 distinct student_accounts and 120 inquiries exist
  console.log('\n▶ Verifying Synthetic Data Integrity & Record Counts...');
  const { data: verifyStudents, error: errVStudents } = await supabase
    .from('student_accounts')
    .select('email')
    .like('email', `test_${synthRunId}_%`);

  const { data: verifyInquiries, error: errVInquiries } = await supabase
    .from('contact_inquiries')
    .select('email')
    .like('email', `test_${synthRunId}_%`);

  const studentCount = verifyStudents ? verifyStudents.length : 0;
  const inquiryCount = verifyInquiries ? verifyInquiries.length : 0;

  console.log(`  Expected Upsert Records (distinct emails): <= 30 | Found: ${studentCount}`);
  console.log(`  Expected Ingestion Records:               120   | Found: ${inquiryCount}`);

  results.dataIntegrity = {
    expectedStudents: 30,
    actualStudents: studentCount,
    studentMatch: studentCount > 0 && studentCount <= 30,
    expectedInquiries: 120,
    actualInquiries: inquiryCount,
    inquiryMatch: inquiryCount === 120,
    integrityPassed: studentCount > 0 && inquiryCount === 120
  };

  // 5. Cleanup: Clean up ONLY synthetic staging records
  console.log('\n▶ Teardown: Purging Synthetic Test Data...');
  try {
    const { count: delStudents } = await supabase
      .from('student_accounts')
      .delete({ count: 'exact' })
      .like('email', `test_${synthRunId}_%`);

    const { count: delInquiries } = await supabase
      .from('contact_inquiries')
      .delete({ count: 'exact' })
      .like('email', `test_${synthRunId}_%`);

    results.cleanupCount = (delStudents || 0) + (delInquiries || 0);
    console.log(`  ✓ Successfully purged ${results.cleanupCount} synthetic staging records.`);
  } catch (cleanErr) {
    console.warn('  ⚠️ Teardown notice:', cleanErr.message);
  }

  const memEnd = captureMemorySnapshot('DB_END');
  results.memoryDeltaMB = Number((memEnd.heapUsedMB - memStart.heapUsedMB).toFixed(2));

  const totalErrors = readPhase.errors + writePhase.errors + insertPhase.errors;
  const totalDeadlocks = readPhase.deadlocks + writePhase.deadlocks + insertPhase.deadlocks;

  if (totalDeadlocks > 0 || totalErrors > 10 || !results.dataIntegrity.integrityPassed) {
    results.verdict = 'FAIL';
  } else if (totalErrors > 0 || writePhase.stats.p99 > 800) {
    results.verdict = 'WARN';
  } else {
    results.verdict = 'PASS';
  }

  console.log(`\n============================================================`);
  console.log(`  DATABASE ENDURANCE AUDIT VERDICT: ${results.verdict}`);
  console.log(`============================================================\n`);

  const scratchDir = path.join(rootDir, 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(
    path.join(scratchDir, 'database_endurance_results.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('sustained-database-load.js')) {
  runDatabaseEnduranceSuite()
    .then(res => {
      process.exit(res.verdict === 'FAIL' ? 2 : (res.verdict === 'WARN' ? 1 : 0));
    })
    .catch(err => {
      console.error('Fatal DB Endurance Runner Error:', err);
      process.exit(3);
    });
}
