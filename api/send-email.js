import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS headers for preflight and standard requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Vercel API] RESEND_API_KEY environment variable is not configured.');
    return res.status(400).json({ success: false, error: 'RESEND_API_KEY missing on Vercel backend' });
  }

  const receipt = req.body;
  if (!receipt || !receipt.email) {
    return res.status(400).json({ success: false, error: 'Missing receipt email in request payload' });
  }

  try {
    const resend = new Resend(apiKey);
    const portalUrl = 'https://th3ory.online/#/student';

    const { data, error } = await resend.emails.send({
      from: 'TH3ORY Team <team@th3ory.online>',
      to: [receipt.email, 'th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'],
      subject: `🎓 TH3ORY Masterclass Enrollment Confirmed - Order #${receipt.orderId || 'NEW'}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
            
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
              <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Masterclass of Influencing</p>
            </div>

            <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Enrollment Confirmed! 🎉</h2>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Welcome, <strong>${receipt.name || receipt.studentName}</strong>! Your spot in <strong>${receipt.planName || 'TH3ORY Masterclass'}</strong> is fully confirmed.</p>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #64748b;">Order ID</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right;">#${receipt.orderId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #64748b;">Plan</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right;">${receipt.planName || 'TH3ORY Masterclass'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 8px 0; color: #64748b;">Amount Paid</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: 800; text-align: right;">$${receipt.price || receipt.totalAmount} USD</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Payment Method</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right; text-transform: uppercase;">${receipt.gateway || receipt.paymentMethod || 'Stripe'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #f59e0b; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 10px;">🔑 How to Access Your Student Portal</h3>
              <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 12px;">Log in to access all 50 video lessons, workbooks, capstone assignments, and resources.</p>
              
              <div style="margin-bottom: 10px;">
                <span style="color: #64748b; font-size: 12px;">Portal URL:</span><br/>
                <a href="${portalUrl}" style="color: #f59e0b; font-weight: 700; font-size: 14px; text-decoration: none;">${portalUrl}</a>
              </div>

              <div>
                <span style="color: #64748b; font-size: 12px;">Enrollment Access Code:</span><br/>
                <span style="font-family: monospace; background: #1e293b; color: #f59e0b; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 15px; display: inline-block; margin-top: 4px;">${receipt.code || 'TH3ORY2026'}</span>
              </div>
            </div>

            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[Vercel API] Error from Resend:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Vercel API] Exception sending email:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
