import { Resend } from 'resend';
import { requireAdminAuth } from './_lib/auth.js';
import { setStrictCorsHeaders, escapeHtml, checkRateLimit, getClientIp } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`send_email_${clientIp}`, 20, 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Email dispatch rate limit exceeded. Please wait.' });
  }

  const receipt = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  if (!receipt || (!receipt.email && !receipt.to)) {
    return res.status(400).json({ success: false, error: 'Missing recipient email in request payload' });
  }

  // Enforce Admin Auth for privileged broadcast & ambassador emails before checking provider keys
  if (receipt.type === 'BROADCAST_EMAIL' || receipt.type === 'PORTAL_DISPATCH' || receipt.type === 'AMBASSADOR_APPROVAL' || receipt.type === 'AMBASSADOR_INTERVIEW_INVITE') {
    const adminUser = requireAdminAuth(req, res);
    if (!adminUser) return; // 401/403 sent
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Vercel API] RESEND_API_KEY environment variable is not configured.');
    return res.status(400).json({ success: false, error: 'Email service key missing on server' });
  }

  try {
    const resend = new Resend(apiKey);

    // 0. Central Sub-Portal Broadcast & Targeted Email Dispatch (Requires Admin Auth)
    if (receipt.type === 'BROADCAST_EMAIL' || receipt.type === 'PORTAL_DISPATCH') {

      const rawRecipients = Array.isArray(receipt.to) ? receipt.to : [receipt.email || receipt.to];
      const targetList = rawRecipients.map(e => String(e).trim()).filter(e => e.includes('@')).slice(0, 100);
      if (targetList.length === 0) targetList.push('th3orymasterclass@gmail.com');

      const redirectPortal = receipt.redirectPortal;
      const portalUrl = redirectPortal ? `https://th3ory.online/#/${redirectPortal}` : 'https://th3ory.online/#/student';
      const subjectLine = escapeHtml(String(receipt.subject || '📢 Official Notification from TH3ORY Administration').slice(0, 150));
      const bodyContent = escapeHtml(String(receipt.messageBody || receipt.message || 'No content specified.').slice(0, 5000));

      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: targetList,
        subject: subjectLine,
        headers: {
          'Bimi-Selector': 'v=BIMI1; s=default',
          'Bimi-Indicator': 'https://th3ory.online/bimi-logo.svg',
          'Bimi-Location': 'https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem',
          'X-Entity-Ref-ID': `th3ory-broadcast-${Date.now()}`
        },
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "Organization",
              "name": "TH3ORY MASTERCLASS",
              "legalName": "Mentalist Sravan Production",
              "url": "https://th3ory.online",
              "logo": "https://th3ory.online/logo-transparent.png",
              "image": "https://th3ory.online/bimi-logo.svg",
              "email": "team@th3ory.online"
            }
            </script>
          </head>
          <body style="margin: 0; padding: 0; background-color: #05080f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <div style="background-color: #05080f; padding: 40px 20px; text-align: center;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              
              <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                  <tr>
                    <td style="vertical-align: middle; text-align: center;">
                      <div style="display: inline-block; width: 68px; height: 68px; border-radius: 50%; background: #05080f; border: 2px solid #f59e0b; padding: 4px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);">
                        <img src="https://th3ory.online/logo-transparent.png" alt="TH3ORY Logo" width="56" height="56" style="width: 56px; height: 56px; object-fit: contain; display: block; border-radius: 50%;" />
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #f59e0b; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TH3ORY</h1>
                <div style="display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                  <span style="color: #f59e0b; font-size: 10px; font-weight: 800; letter-spacing: 1px;">✓ VERIFIED OFFICIAL SENDER</span>
                </div>
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 1.5px;">Executive Administration &amp; Portal Communications</p>
              </div>

              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 10px;">${subjectLine}</h2>
                <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${bodyContent}</div>
              </div>

              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <p style="color: #94a3b8; font-size: 12px; margin-top: 0; margin-bottom: 16px;">Click below to log in directly to your designated sub-portal dashboard:</p>
                <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                  Open Designated Sub-Portal &rarr;
                </a>
              </div>

              <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved. • BIMI Verified Domain: th3ory.online</p>
              </div>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('[Vercel API] Resend Broadcast Email Error:', error.message);
        return res.status(400).json({ success: false, error: 'Failed to send broadcast email' });
      }

      return res.status(200).json({ success: true, data });
    }

    // 0.5. Campus Ambassador Selection Interview Invite Email (Requires Admin Auth)
    if (receipt.type === 'AMBASSADOR_INTERVIEW_INVITE') {
      const adminUser = requireAdminAuth(req, res);
      if (!adminUser) return;

      const recipientEmail = String(receipt.email || '').trim().toLowerCase();
      const safeName = escapeHtml(String(receipt.name || 'Candidate').slice(0, 80));
      const safeCollege = escapeHtml(String(receipt.collegeName || 'your campus').slice(0, 100));
      const bookingLink = `https://calendly.com/th3orymasterclass/30min?name=${encodeURIComponent(safeName)}&email=${encodeURIComponent(recipientEmail)}`;

      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: [recipientEmail],
        subject: `📅 Campus Ambassador Selection Interview Invitation — TH3ORY Masterclass`,
        headers: {
          'Bimi-Selector': 'v=BIMI1; s=default',
          'Bimi-Indicator': 'https://th3ory.online/bimi-logo.svg',
          'Bimi-Location': 'https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem',
          'X-Entity-Ref-ID': `th3ory-interview-${Date.now()}`
        },
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "Organization",
              "name": "TH3ORY MASTERCLASS",
              "legalName": "Mentalist Sravan Production",
              "url": "https://th3ory.online",
              "logo": "https://th3ory.online/logo-transparent.png",
              "image": "https://th3ory.online/bimi-logo.svg",
              "email": "team@th3ory.online"
            }
            </script>
          </head>
          <body style="margin: 0; padding: 0; background-color: #05080f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <div style="background-color: #05080f; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                  <tr>
                    <td style="vertical-align: middle; text-align: center;">
                      <div style="display: inline-block; width: 68px; height: 68px; border-radius: 50%; background: #05080f; border: 2px solid #f59e0b; padding: 4px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);">
                        <img src="https://th3ory.online/logo-transparent.png" alt="TH3ORY Logo" width="56" height="56" style="width: 56px; height: 56px; object-fit: contain; display: block; border-radius: 50%;" />
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TH3ORY</h1>
                <div style="display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                  <span style="color: #f59e0b; font-size: 10px; font-weight: 800; letter-spacing: 1px;">✓ VERIFIED OFFICIAL SENDER</span>
                </div>
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 1.5px;">Campus Ambassador Selection Desk</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Hello, ${safeName}! 👋</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">We reviewed your application to represent <strong>${safeCollege}</strong> as a TH3ORY Campus Ambassador. You have been shortlisted for a 1-on-1 Selection Interview!</p>
              </div>
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <a href="${bookingLink}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                  Select Interview Time Slot on Calendly &rarr;
                </a>
              </div>
              <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved. • BIMI Verified Domain: th3ory.online</p>
              </div>
            </div>
          </div>
          </body>
          </html>
        `
      });

      if (error) {
        return res.status(400).json({ success: false, error: 'Failed to send interview invitation email' });
      }
      return res.status(200).json({ success: true, data });
    }

    // 1. Campus Ambassador Selection Approval Email (Requires Admin Auth)
    if (receipt.type === 'AMBASSADOR_APPROVAL') {
      const adminUser = requireAdminAuth(req, res);
      if (!adminUser) return;

      const recipientEmail = String(receipt.email || '').trim().toLowerCase();
      const safeName = escapeHtml(String(receipt.name || 'Ambassador').slice(0, 80));
      const safeCollege = escapeHtml(String(receipt.collegeName || 'your university').slice(0, 100));
      const safeCode = escapeHtml(String(receipt.ambassadorCode || receipt.code || 'TH3ORY-AMB').slice(0, 30));
      const portalUrl = 'https://th3ory.online/#/ambassador-portal';

      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: [recipientEmail],
        subject: `🌟 Welcome to TH3ORY Campus Ambassador Program - Selection Approved!`,
        headers: {
          'Bimi-Selector': 'v=BIMI1; s=default',
          'Bimi-Indicator': 'https://th3ory.online/bimi-logo.svg',
          'Bimi-Location': 'https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem',
          'X-Entity-Ref-ID': `th3ory-approval-${Date.now()}`
        },
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <script type="application/ld+json">
            {
              "@context": "http://schema.org",
              "@type": "Organization",
              "name": "TH3ORY MASTERCLASS",
              "legalName": "Mentalist Sravan Production",
              "url": "https://th3ory.online",
              "logo": "https://th3ory.online/logo-transparent.png",
              "image": "https://th3ory.online/bimi-logo.svg",
              "email": "team@th3ory.online"
            }
            </script>
          </head>
          <body style="margin: 0; padding: 0; background-color: #05080f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <div style="background-color: #05080f; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                  <tr>
                    <td style="vertical-align: middle; text-align: center;">
                      <div style="display: inline-block; width: 68px; height: 68px; border-radius: 50%; background: #05080f; border: 2px solid #f59e0b; padding: 4px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);">
                        <img src="https://th3ory.online/logo-transparent.png" alt="TH3ORY Logo" width="56" height="56" style="width: 56px; height: 56px; object-fit: contain; display: block; border-radius: 50%;" />
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TH3ORY</h1>
                <div style="display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                  <span style="color: #f59e0b; font-size: 10px; font-weight: 800; letter-spacing: 1px;">✓ VERIFIED OFFICIAL SENDER</span>
                </div>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 1.5px;">Campus Ambassador Network</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Congratulations, ${safeName}! 🎉</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Your selection as official <strong>TH3ORY Campus Ambassador</strong> for <strong>${safeCollege}</strong> is approved.</p>
              </div>
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Unique Referral Code</div>
                <div style="font-family: monospace; color: #f59e0b; font-weight: 800; font-size: 18px;">${safeCode}</div>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; text-transform: uppercase;">
                    Access Ambassador Portal &rarr;
                  </a>
                </div>
              </div>
              <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved. • BIMI Verified Domain: th3ory.online</p>
              </div>
            </div>
          </div>
          </body>
          </html>
        `
      });

      if (error) {
        return res.status(400).json({ success: false, error: 'Failed to send approval email' });
      }
      return res.status(200).json({ success: true, data });
    }

    // 2. Default Student Enrollment Confirmation Email (Public / Webhook Transactional)
    const recipientEmail = String(receipt.email || receipt.studentEmail || '').trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email required' });
    }

    const safeName = escapeHtml(String(receipt.name || receipt.studentName || 'Student').slice(0, 80));
    const safePlan = escapeHtml(String(receipt.planName || 'TH3ORY Masterclass').slice(0, 80));
    const safeOrderId = escapeHtml(String(receipt.orderId || 'CONFIRMED').slice(0, 40));
    const safeCode = escapeHtml(String(receipt.code || receipt.enrollmentCode || 'TH3ORY-PASS').slice(0, 30));
    const portalUrl = 'https://th3ory.online/#/student';

    const { data, error } = await resend.emails.send({
      from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
      to: [recipientEmail],
      subject: `🎓 TH3ORY Masterclass Enrollment Confirmed - Order #${safeOrderId}`,
      headers: {
        'Bimi-Selector': 'v=BIMI1; s=default',
        'Bimi-Indicator': 'https://th3ory.online/bimi-logo.svg',
        'Bimi-Location': 'https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem',
        'X-Entity-Ref-ID': `th3ory-enroll-${Date.now()}`
      },
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <script type="application/ld+json">
          {
            "@context": "http://schema.org",
            "@type": "Organization",
            "name": "TH3ORY MASTERCLASS",
            "legalName": "Mentalist Sravan Production",
            "url": "https://th3ory.online",
            "logo": "https://th3ory.online/logo-transparent.png",
            "image": "https://th3ory.online/bimi-logo.svg",
            "email": "team@th3ory.online"
          }
          </script>
        </head>
        <body style="margin: 0; padding: 0; background-color: #05080f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
        <div style="background-color: #05080f; padding: 40px 20px; text-align: center;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px auto;">
                <tr>
                  <td style="vertical-align: middle; text-align: center;">
                    <div style="display: inline-block; width: 68px; height: 68px; border-radius: 50%; background: #05080f; border: 2px solid #f59e0b; padding: 4px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);">
                      <img src="https://th3ory.online/logo-transparent.png" alt="TH3ORY Logo" width="56" height="56" style="width: 56px; height: 56px; object-fit: contain; display: block; border-radius: 50%;" />
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TH3ORY</h1>
              <div style="display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 800; letter-spacing: 1px;">✓ VERIFIED OFFICIAL SENDER</span>
              </div>
              <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 1.5px;">Masterclass of Influencing</p>
            </div>
            <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Enrollment Confirmed! 🎉</h2>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Welcome, <strong>${safeName}</strong>! Your spot in <strong>${safePlan}</strong> is fully confirmed.</p>
            </div>
            <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Order ID</div>
              <div style="color: #ffffff; font-weight: 700; font-size: 14px; margin-bottom: 12px;">#${safeOrderId}</div>
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Unique Enrollment Code</div>
              <div style="font-family: monospace; color: #f59e0b; font-weight: 800; font-size: 18px; letter-spacing: 1px;">${safeCode}</div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; text-transform: uppercase;">
                  Log In To Student Portal &rarr;
                </a>
              </div>
            </div>
            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved. • BIMI Verified Domain: th3ory.online</p>
            </div>
          </div>
        </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[Vercel API] Error from Resend:', error.message);
      return res.status(400).json({ success: false, error: 'Failed to send confirmation email' });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Vercel API] Exception sending email:', err.message);
    return res.status(500).json({ success: false, error: 'Email service error' });
  }
}

