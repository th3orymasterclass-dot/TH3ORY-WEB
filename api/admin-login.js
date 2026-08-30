import crypto from 'crypto';
import { signJwt } from './_lib/auth.js';
import { safeCompare, setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

// Default expected SHA-256 hash of "TH3ORY@admin2026"
const DEFAULT_ADMIN_HASH = 'f6466f320754b3cd62e30929cc18e7a14be8fcf8da8667a3e4f50922c788329b';
// SHA-256 of "240824"
const PIN_ADMIN_HASH = '46a365f573adfa720e36ad181f5c6e9be1c54efda6dfbfd5be517172828b6d88';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`admin_login_${clientIp}`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Admin credentials required' });
    }

    const expectedHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
    
    // Compute SHA-256 hash of submitted password
    const submittedHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Check against configured hash or numeric admin PIN hash using timing-safe comparison
    const isValid = safeCompare(submittedHash, expectedHash) || safeCompare(submittedHash, PIN_ADMIN_HASH);

    if (isValid) {
      // Issue cryptographically signed Admin JWT valid for 24 hours
      const sessionToken = signJwt({
        role: 'admin',
        sub: 'superadmin',
        scope: ['read:all', 'write:all', 'admin:access'],
        ip: clientIp
      }, 24 * 3600);

      return res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        token: sessionToken,
        expiresIn: 86400 // 24 hours
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Incorrect admin password. Access denied.'
      });
    }
  } catch (error) {
    console.error('[Admin Login API Exception]:', error.message);
    return res.status(500).json({ success: false, error: 'Authentication service temporarily unavailable' });
  }
}
