import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Native loader for environment files without external dependencies
export function loadEnvFiles() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
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
}

loadEnvFiles();

/**
 * Secret Redaction Regexes
 */
const SECRET_PATTERNS = [
  /ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, // JWTs
  /rzp_(?:live|test)_[A-Za-z0-9]{14,}/g,                             // Razorpay keys
  /re_[A-Za-z0-9_]{20,}/g,                                          // Resend keys
  /github_pat_[A-Za-z0-9_]{20,}/g,                                  // GitHub PATs
  /d1lNjZ[A-Za-z0-9_-]{10,}/g                                       // Specific secrets
];

export function redactSecrets(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  let redacted = text;
  for (const pat of SECRET_PATTERNS) {
    redacted = redacted.replace(pat, '[REDACTED_SECRET]');
  }
  return redacted;
}

/**
 * Validates Environment Safety Boundaries
 * @param {Object} options
 * @param {boolean} options.isDestructive
 * @param {string} options.target
 * @param {number} options.maxConcurrency
 * @param {number} options.maxDurationSeconds
 * @param {number} options.maxRequests
 * @returns {{ allowed: boolean, env: string, error?: string }}
 */
export function validateEnvironmentSafety(options = {}) {
  const env = (process.env.TEST_ENV || 'production').toLowerCase().trim();
  const isDestructive = Boolean(options.isDestructive);
  const confirmDestructive = (process.env.CONFIRM_DESTRUCTIVE_TEST || '').toLowerCase().trim() === 'true';

  console.log('\n------------------------------------------------------------');
  console.log(`  ENVIRONMENT SAFETY GATE`);
  console.log(`  ENVIRONMENT:          ${env.toUpperCase()}`);
  console.log(`  DESTRUCTIVE TEST:     ${isDestructive ? 'YES (HIGH RISK)' : 'NO (SAFE READ / SYNTHETIC)'}`);
  console.log(`  TARGET:               ${redactSecrets(options.target || 'Default Platform')}`);
  console.log(`  MAX CONCURRENCY:      ${options.maxConcurrency || 'N/A'}`);
  console.log(`  MAX DURATION:         ${options.maxDurationSeconds ? options.maxDurationSeconds + 's' : 'N/A'}`);
  console.log(`  MAX REQUESTS:         ${options.maxRequests || 'N/A'}`);
  console.log('------------------------------------------------------------\n');

  if (!['local', 'staging', 'production'].includes(env)) {
    const msg = `CRITICAL SAFETY ABORT: Unknown TEST_ENV '${env}'. Must be local, staging, or production.`;
    console.error(`❌ ${msg}`);
    return { allowed: false, env, error: msg };
  }

  if (isDestructive && env === 'production') {
    const msg = `CRITICAL SAFETY ABORT: Destructive tests are STRICTLY PROHIBITED in PRODUCTION environment!`;
    console.error(`❌ ${msg}`);
    return { allowed: false, env, error: msg };
  }

  if (isDestructive && env === 'staging' && !confirmDestructive) {
    const msg = `SAFETY ABORT: Destructive test in STAGING requires CONFIRM_DESTRUCTIVE_TEST=true.`;
    console.error(`❌ ${msg}`);
    return { allowed: false, env, error: msg };
  }

  return { allowed: true, env };
}

/**
 * Calculates Standard Latency Percentiles and Long-Tail Ratios
 * @param {number[]} latencies Array of durations in milliseconds
 * @returns {Object}
 */
export function calculateLatencyStats(latencies = []) {
  if (!latencies.length) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      p95_p50_ratio: 0,
      p99_p50_ratio: 0,
      sampleSize: 0
    };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const getP = (p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * (p / 100)))];

  const p50 = getP(50);
  const p95 = getP(95);
  const p99 = getP(99);

  return {
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[sorted.length - 1].toFixed(2)),
    mean: Number((sum / sorted.length).toFixed(2)),
    p50: Number(p50.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    p99: Number(p99.toFixed(2)),
    p95_p50_ratio: p50 > 0 ? Number((p95 / p50).toFixed(2)) : 0,
    p99_p50_ratio: p50 > 0 ? Number((p99 / p50).toFixed(2)) : 0,
    sampleSize: sorted.length
  };
}

/**
 * Snapshot System Memory Usage
 */
export function captureMemorySnapshot(label = 'SNAPSHOT') {
  const mem = process.memoryUsage();
  return {
    label,
    timestamp: new Date().toISOString(),
    rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
    heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
    heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
    externalMB: Number((mem.external / 1024 / 1024).toFixed(2)),
    arrayBuffersMB: Number(((mem.arrayBuffers || 0) / 1024 / 1024).toFixed(2))
  };
}
