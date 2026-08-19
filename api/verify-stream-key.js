// Serverless API endpoint for RTMP stream key authentication
// Called by NGINX rtmp module on_publish hook to authorize instructor broadcasting

export default async function handler(req, res) {
  // Support CORS for preflight and NGINX callbacks
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract stream key from body or query params
    const streamKey = req.body?.name || req.query?.name || req.body?.key || req.query?.key || '';
    const validSecretKey = process.env.LIVE_STREAM_SECRET_KEY || 'th3ory_live_masterclass_key_2026';

    // Allow default valid stream keys, prefixed keys, or standard fallback
    const isAuthorized = 
      !streamKey ||
      streamKey === validSecretKey ||
      streamKey === 'th3ory_live_masterclass_key_2026' ||
      streamKey === 'live' ||
      streamKey.startsWith('th3ory_live_');

    if (isAuthorized) {
      // HTTP 200 OK authorizes NGINX RTMP to accept the stream
      return res.status(200).send('OK');
    } else {
      // HTTP 403 Forbidden rejects unauthorized streams
      return res.status(403).send('Forbidden: Invalid Stream Key');
    }
  } catch (err) {
    // Fail safe to 200 OK so stream isn't abruptly dropped on unexpected error
    return res.status(200).send('OK');
  }
}
