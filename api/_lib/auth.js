import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || process.env.RAZORPAY_KEY_SECRET || 'th3ory_jwt_production_master_secret_2026';

/**
 * Sign an HMAC SHA-256 JWT
 * @param {object} payload
 * @param {number} expiresInSeconds default 86400 (24h)
 * @returns {string} token
 */
export function signJwt(payload, expiresInSeconds = 86400) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode an HMAC SHA-256 JWT
 * @param {string} token
 * @returns {object|null} payload or null if invalid/expired
 */
export function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;

  try {
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64url');

    // Timing-safe comparison of signatures
    const sigBuf = Buffer.from(sigB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract Bearer token from request Authorization header or body/query fallback
 * @param {object} req
 * @returns {string|null}
 */
export function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.headers['x-admin-token']) {
    return String(req.headers['x-admin-token']).trim();
  }
  if (req.headers['x-student-token']) {
    return String(req.headers['x-student-token']).trim();
  }
  if (req.query?.token) {
    return String(req.query.token).trim();
  }
  if (req.body?.token) {
    return String(req.body.token).trim();
  }
  return null;
}

/**
 * Require valid Admin JWT
 * @param {object} req
 * @param {object} res
 * @returns {object|null} user payload if valid, or null after sending 401/403
 */
export function requireAdminAuth(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication token required' });
    return null;
  }

  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Forbidden: Valid administrator credentials required' });
    return null;
  }

  return payload;
}

/**
 * Require valid Student or Admin JWT
 * @param {object} req
 * @param {object} res
 * @param {string} [targetEmail] optional email to check ownership against
 * @returns {object|null} user payload if valid, or null after sending 401/403
 */
export function requireStudentAuth(req, res, targetEmail = null) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: Student authentication token required' });
    return null;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session token' });
    return null;
  }

  // Admins can manage any student
  if (payload.role === 'admin') {
    return payload;
  }

  // Verify student role
  if (payload.role !== 'student') {
    res.status(403).json({ success: false, error: 'Forbidden: Access denied' });
    return null;
  }

  // Verify ownership of the target resource email
  if (targetEmail) {
    const cleanTarget = String(targetEmail).trim().toLowerCase();
    const cleanUser = String(payload.email || '').trim().toLowerCase();
    if (cleanTarget !== cleanUser) {
      res.status(403).json({ success: false, error: 'Forbidden: Cannot access another user\'s personal data' });
      return null;
    }
  }

  return payload;
}
