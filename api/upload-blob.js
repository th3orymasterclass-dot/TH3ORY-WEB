import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // CORS headers
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

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { filename, content, contentType = 'image/jpeg', pathname } = body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Image file content is required' });
    }

    const targetFilename = pathname || filename || `avatars/avatar_${Date.now()}.jpg`;

    let fileBuffer;
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64Data = content.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (typeof content === 'string') {
      fileBuffer = Buffer.from(content, 'base64');
    } else {
      fileBuffer = Buffer.from(content);
    }

    // Enforce 256 KB max file size (262,144 bytes)
    const MAX_SIZE = 256 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds 256 KB limit. (Uploaded image: ${(fileBuffer.length / 1024).toFixed(1)} KB)`
      });
    }

    if (!token) {
      // Base64 data URL fallback when Vercel Blob token is not configured
      const dataUrl = typeof content === 'string' && content.startsWith('data:')
        ? content
        : `data:${contentType};base64,${fileBuffer.toString('base64')}`;

      return res.status(200).json({
        success: true,
        isFallback: true,
        url: dataUrl,
        downloadUrl: dataUrl,
        pathname: targetFilename,
        contentType,
        contentLength: fileBuffer.length,
        message: 'Avatar uploaded locally. Add BLOB_READ_WRITE_TOKEN in Vercel for production Vercel Blob storage.'
      });
    }

    // Upload to Vercel Blob Storage using official put() method
    const blob = await put(targetFilename, fileBuffer, {
      access: 'public',
      contentType,
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
    console.error('[Vercel Blob Upload Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload avatar to Vercel Blob storage'
    });
  }
}
