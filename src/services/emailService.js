/**
 * Safely retrieve Resend API key at runtime
 */
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RESEND_API_KEY) {
    return import.meta.env.VITE_RESEND_API_KEY;
  }
  if (typeof window !== 'undefined' && window.VITE_RESEND_API_KEY) {
    return window.VITE_RESEND_API_KEY;
  }
  return '';
};

/**
 * Send Automated Enrollment Confirmation Email via Vercel Serverless API (/api/send-email)
 * with client-side fallback.
 */
export async function sendEnrollmentEmail(receipt) {
  try {
    // 1. Try Vercel Serverless API endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receipt)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Resend Serverless API] Email sent successfully:', data);
      return { success: true, data };
    }

    // If API endpoint returns an error, log it
    const errText = await response.text();
    console.warn('[Resend Serverless API] Endpoint error:', response.status, errText);

    // 2. Client-side fallback if VITE_RESEND_API_KEY is defined
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('[Resend API] No client-side VITE_RESEND_API_KEY. Email notification skipped.');
      return { success: false, message: 'Serverless API failed & no client key present' };
    }

    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/#/student` : 'https://th3ory.online/#/student';

    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TH3ORY Team <team@th3ory.online>',
        to: [receipt.email, 'th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'],
        subject: `🎓 TH3ORY Masterclass Enrollment Confirmed - Order #${receipt.orderId}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Masterclass of Influencing</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Enrollment Confirmed! 🎉</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Welcome, <strong>${receipt.name}</strong>! Your spot in <strong>${receipt.planName || 'TH3ORY Masterclass'}</strong> is fully confirmed.</p>
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
                    <td style="padding: 8px 0; color: #f59e0b; font-weight: 800; text-align: right;">$${receipt.price} USD</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Payment Method</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: 600; text-align: right; text-transform: uppercase;">${receipt.gateway || 'Stripe'}</td>
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
      })
    });

    const data = await directRes.json();
    return { success: directRes.ok, data };
  } catch (err) {
    console.error('[Resend API] Exception sending enrollment email:', err);
    return { success: false, error: err };
  }
}
