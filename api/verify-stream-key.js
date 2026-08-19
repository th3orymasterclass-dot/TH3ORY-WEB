// Serverless API endpoint for RTMP stream key authentication
// Called by NGINX rtmp module on_publish hook to authorize instructor broadcasting

export default async function handler(req, res) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const streamKey = req.body?.name || req.query?.name || req.body?.key;
    const validSecretKey = process.env.LIVE_STREAM_SECRET_KEY || 'th3ory_live_masterclass_key_2026';

    if (streamKey === validSecretKey) {
      // 200 OK tells NGINX RTMP to accept the stream
      return res.status(200).json({ status: 'authorized', message: 'Live stream authorized.' });
    } else {
      // 403 Forbidden tells NGINX RTMP to reject the stream
      return res.status(403).json({ status: 'unauthorized', message: 'Invalid stream key.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
