import crypto from 'crypto';

// Default expected hash of "TH3ORY@admin2026"
const DEFAULT_ADMIN_HASH = 'f6466f320754b3cd62e30929cc18e7a14be8fcf8da8667a3e4f50922c788329b';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Admin password is required' });
    }

    const expectedHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
    
    // Compute SHA-256 hash of submitted password
    const submittedHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel timing attacks
    const hashBuf = Buffer.from(submittedHash, 'utf8');
    const expectedBuf = Buffer.from(expectedHash, 'utf8');

    let isValid = false;
    if (hashBuf.length === expectedBuf.length) {
      isValid = crypto.timingSafeEqual(hashBuf, expectedBuf);
    }

    if (isValid) {
      // Create a time-limited signed session token
      const sessionToken = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'th3ory_secret_key_2026')
        .update(`admin_auth_${Date.now()}`)
        .digest('hex');

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
    console.error('[Admin Login API Exception]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Authentication failed' });
  }
}
