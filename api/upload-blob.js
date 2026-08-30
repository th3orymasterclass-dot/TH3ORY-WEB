import { put } from '@vercel/blob';
import path from 'path';
import { requireStudentAuth } from './_lib/auth.js';
import { setStrictCorsHeaders, checkRateLimit, getClientIp } from './_lib/security.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Verify buffer magic bytes for allowed image formats
 * @param {Buffer} buffer
 * @returns {string|null} verified mime type or null
 */
function verifyImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`upload_blob_${clientIp}`, 15, 5 * 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Upload rate limit exceeded. Please wait.' });
  }

  // Require Authenticated Student or Admin Token
  const authUser = requireStudentAuth(req, res);
  if (!authUser) return; // 401/403 sent

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { content, contentType = 'image/jpeg' } = body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Image file content is required' });
    }

    let fileBuffer;
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64Data = content.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (typeof content === 'string') {
      fileBuffer = Buffer.from(content, 'base64');
    } else {
      fileBuffer = Buffer.from(content);
    }

    // Enforce 512 KB max file size
    const MAX_SIZE = 512 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds 512 KB limit. (Uploaded: ${(fileBuffer.length / 1024).toFixed(1)} KB)`
      });
    }

    // Verify magic bytes
    const verifiedMime = verifyImageMagicBytes(fileBuffer);
    if (!verifiedMime || !ALLOWED_MIME_TYPES.includes(verifiedMime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.'
      });
    }

    // Path traversal defense: generate clean, safe filename
    const ext = verifiedMime === 'image/png' ? 'png' : verifiedMime === 'image/webp' ? 'webp' : 'jpg';
    const safeUserPart = String(authUser.email || 'user').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    const targetFilename = `avatars/avatar_${safeUserPart}_${Date.now()}.${ext}`;

    if (!token) {
      // Base64 data URL fallback when Vercel Blob token is not configured
      const dataUrl = `data:${verifiedMime};base64,${fileBuffer.toString('base64')}`;
      return res.status(200).json({
        success: true,
        isFallback: true,
        url: dataUrl,
        downloadUrl: dataUrl,
        pathname: targetFilename,
        contentType: verifiedMime,
        contentLength: fileBuffer.length,
      });
    }

    // Upload to Vercel Blob Storage using verified MIME type
    const blob = await put(targetFilename, fileBuffer, {
      access: 'public',
      contentType: verifiedMime,
      token,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentLength: blob.contentLength,
    });
  } catch (error) {
    console.error('[Vercel Blob Upload Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
}
