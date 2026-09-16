import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load env files natively
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key not found in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

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

async function runBatch(label, concurrency, taskFn) {
  process.stdout.write(`  Testing Concurrency: ${concurrency} parallel requests... `);
  const startTime = performance.now();
  const latencies = [];
  let successes = 0;
  let errors = 0;
  const errorDetails = [];

  const promises = Array.from({ length: concurrency }).map(async (_, idx) => {
    const t0 = performance.now();
    try {
      const res = await taskFn(idx);
      const t1 = performance.now();
      latencies.push(t1 - t0);
      if (res.error) {
        errors++;
        errorDetails.push(res.error.message || JSON.stringify(res.error));
      } else {
        successes++;
      }
    } catch (err) {
      const t1 = performance.now();
      latencies.push(t1 - t0);
      errors++;
      errorDetails.push(err.message);
    }
  });

  await Promise.all(promises);
  const totalElapsed = performance.now() - startTime;
  const rps = (concurrency / (totalElapsed / 1000)).toFixed(1);
  const p = calculatePercentiles(latencies);

  console.log(`Done in ${totalElapsed.toFixed(0)}ms | RPS: ${rps} | Success: ${successes}/${concurrency} | P50: ${p.p50}ms | P95: ${p.p95}ms | P99: ${p.p99}ms`);
  if (errorDetails.length > 0) {
    console.log(`    ↳ Sample Error: ${errorDetails[0]}`);
  }
  
  return {
    concurrency,
    totalElapsed: Number(totalElapsed.toFixed(2)),
    rps: Number(rps),
    successRate: Number(((successes / concurrency) * 100).toFixed(1)),
    successes,
    errors,
    percentiles: p,
    errorSample: errorDetails.slice(0, 3)
  };
}

async function main() {
  console.log('\n========================================================================');
  console.log('  TH3ORY — SUPABASE POSTGRESQL CONCURRENCY & CONNECTION POOL STRESS TEST');
  console.log(`  Target Instance: ${supabaseUrl}`);
  console.log('========================================================================\n');

  const results = {
    readStress: [],
    writeProgressStress: [],
    writeInquiryStress: []
  };

  // ── Phase 1: High-Concurrency Read Stress on site_settings & coupons ──────────
  console.log('▶ [Phase 1/3]: Read Concurrency Limits (site_settings & coupons table)');
  const readTiers = [10, 25, 50, 75, 100];

  for (const tier of readTiers) {
    const res = await runBatch('Read-site_settings', tier, async () => {
      return await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .limit(5);
    });
    results.readStress.push(res);
  }

  // ── Phase 2: High-Concurrency Upsert Stress (student_accounts simulated active learners) ──
  console.log('\n▶ [Phase 2/3]: Write / Upsert Concurrency Limits (student_accounts table)');
  const writeTiers = [5, 15, 30, 50];
  const testStudentBase = `loadtest_${Date.now()}`;

  for (const tier of writeTiers) {
    const res = await runBatch('Upsert-student_accounts', tier, async (idx) => {
      const email = `${testStudentBase}_user${idx}@th3ory.online`;
      return await supabase
        .from('student_accounts')
        .upsert({
          email: email,
          name: `Load Test Student ${idx}`,
          enrollment_code: `TEST${String(idx).padStart(4, '0')}`,
          plan_name: 'TH3ORY Masterclass Flagship Pass',
          last_login: new Date().toISOString()
        }, { onConflict: 'email' });
    });
    results.writeProgressStress.push(res);
  }

  // ── Phase 3: High-Concurrency Ingestion Stress (contact_inquiries table) 
  console.log('\n▶ [Phase 3/3]: Ingestion Concurrency Limits (contact_inquiries table)');
  const insertTiers = [10, 25, 50];

  for (const tier of insertTiers) {
    const res = await runBatch('Insert-contact_inquiries', tier, async (idx) => {
      return await supabase
        .from('contact_inquiries')
        .insert({
          name: `Load Tester ${idx}`,
          email: `${testStudentBase}_inquiry${idx}@th3ory.online`,
          subject: 'Load & Stress Concurrency Test',
          message: `Synthetic payload benchmark inquiry generated at ${Date.now()}`,
          status: 'new'
        });
    });
    results.writeInquiryStress.push(res);
  }

  // ── Cleanup: Purge Synthetic Test Records ─────────────────────────────────────
  console.log('\n▶ Cleaning up synthetic load test records...');
  try {
    const { count: delStudents } = await supabase
      .from('student_accounts')
      .delete({ count: 'exact' })
      .like('email', 'loadtest_%');
    console.log(`  ✓ Purged synthetic student_accounts records (${delStudents ?? 0} rows)`);

    const { count: delInquiries } = await supabase
      .from('contact_inquiries')
      .delete({ count: 'exact' })
      .like('email', 'loadtest_%');
    console.log(`  ✓ Purged synthetic contact_inquiries records (${delInquiries ?? 0} rows)`);
  } catch (cleanErr) {
    console.warn('  ⚠️ Cleanup notice:', cleanErr.message);
  }

  console.log('\n========================================================================');
  console.log('  SUPABASE CONCURRENCY STRESS TEST COMPLETE');
  console.log('========================================================================\n');

  return results;
}

main().catch(err => {
  console.error('Fatal stress test runner error:', err);
  process.exit(1);
});
