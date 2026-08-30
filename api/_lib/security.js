import crypto from 'crypto';

// In-memory sliding rate limit store
const rateLimitStore = new Map();

// Periodic cleanup of stale rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Configure strict CORS headers restricting to official platform domains
 * @param {object} req
 * @param {object} res
 * @returns {boolean} true if preflight OPTIONS request was handled
 */
export function setStrictCorsHeaders(req, res) {
  const origin = req.headers['origin'] || '';
  const ALLOWED_ORIGINS = [
    'https://th3ory.online',
    'https://www.th3ory.online',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  // Match production preview deployments (*.vercel.app from our project)
  const isVercelPreview = /^https:\/\/th3ory.*\.vercel\.app$/.test(origin);

  if (ALLOWED_ORIGINS.includes(origin) || isVercelPreview) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Non-browser or server-to-server request
    res.setHeader('Access-Control-Allow-Origin', 'https://th3ory.online');
  } else {
    // Unknown origin - fallback to primary domain
    res.setHeader('Access-Control-Allow-Origin', 'https://th3ory.online');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, Authorization, x-admin-token, x-student-token, x-razorpay-signature'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Sanitize cell values for CSV export to prevent Formula / DDE Injection in Excel
 * @param {any} value
 * @returns {string}
 */
export function sanitizeForCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If string starts with =, +, -, @, \t, \r, prepend a single quote to neutralize formula execution
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }
  return str.replace(/"/g, '""');
}

/**
 * HTML Entity Encoder to prevent stored and reflected XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check and record rate limit for an identifier (e.g., client IP + route)
 * @param {string} key
 * @param {number} maxRequests
 * @param {number} windowMs
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetTime <= now) {
    const record = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: maxRequests - 1, resetTime: record.resetTime };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxRequests - existing.count, resetTime: existing.resetTime };
}

/**
 * Extract client IP address safely
 * @param {object} req
 * @returns {string}
 */
export function getClientIp(req) {
  const xForwarded = req.headers['x-forwarded-for'];
  if (xForwarded && typeof xForwarded === 'string') {
    return xForwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}
