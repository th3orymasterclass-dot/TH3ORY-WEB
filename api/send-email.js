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

  const receipt = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  if (!receipt || (!receipt.email && !receipt.to)) {
    return res.status(400).json({ success: false, error: 'Missing receipt email or recipient in request payload' });
  }

  try {
    const resend = new Resend(apiKey);

    // 0. Handle Central Sub-Portal Broadcast & Targeted Email Dispatch
    if (receipt.type === 'BROADCAST_EMAIL' || receipt.type === 'PORTAL_DISPATCH') {
      const recipients = Array.isArray(receipt.to) ? receipt.to : [receipt.email || receipt.to];
      const targetList = recipients.filter(Boolean);
      if (targetList.length === 0) targetList.push('th3orymasterclass@gmail.com');

      const portalUrl = receipt.redirectPortal || 'https://th3ory.online/#/student';
      const subjectLine = receipt.subject || '📢 Official Notification from TH3ORY Administration';
      const bodyContent = receipt.messageBody || receipt.message || 'No content specified.';

      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: targetList,
        subject: subjectLine,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              
              <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
                <h1 style="color: #f59e0b; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Executive Administration &amp; Portal Communications</p>
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
                <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('[Vercel API] Resend Broadcast Email Error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // 0.5. Handle Ambassador Selection Interview Invite Email
    if (receipt.type === 'AMBASSADOR_INTERVIEW_INVITE') {
      const recipientEmail = receipt.email || 'th3orymasterclass@gmail.com';
      const bookingLink = `${receipt.calendlyUrl || 'https://calendly.com/th3orymasterclass/30min'}?name=${encodeURIComponent(receipt.name || '')}&email=${encodeURIComponent(recipientEmail)}`;
      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: [receipt.email, 'th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'],
        subject: `📅 Campus Ambassador Selection Interview Invitation — TH3ORY Masterclass`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Campus Ambassador Selection Desk</p>
              </div>

              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Hello, ${receipt.name}! 👋</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">We reviewed your application to represent <strong>${receipt.collegeName || 'your campus'}</strong> as a TH3ORY Campus Ambassador. You have been shortlisted for a 1-on-1 Selection Interview!</p>
              </div>

              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">📅 Schedule Your 15-Min Interview Call via Calendly</h3>
                <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">
                  ${receipt.scheduledSlot ? `<strong>Proposed Schedule:</strong> ${receipt.scheduledSlot}<br/><br/>` : ''}
                  Please pick a convenient date & time slot for your 15-minute live video/phone selection interview using our direct Calendly scheduling program:
                </p>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="${bookingLink}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    Select Interview Time Slot on Calendly &rarr;
                  </a>
                </div>
              </div>

              ${receipt.teamNotes ? `
              <div style="background-color: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 25px; color: #94a3b8; font-size: 12px;">
                <strong style="color: #f59e0b;">Note from TH3ORY Interview Team:</strong><br/>
                "${receipt.teamNotes}"
              </div>
              ` : ''}

              <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('[Vercel API] Resend Interview Invite Email Error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // 1. Handle Ambassador Selection Approval Email
    if (receipt.type === 'AMBASSADOR_APPROVAL') {
      const portalUrl = 'https://th3ory.online/#/ambassador-portal';
      const { data, error } = await resend.emails.send({
        from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: [receipt.email, 'th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'],
        subject: `🌟 Welcome to TH3ORY Campus Ambassador Program - Selection Approved!`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Campus Ambassador Network</p>
              </div>

              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Congratulations, ${receipt.name}! 🎉</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Following your team interview evaluation, your selection as the official <strong>TH3ORY Campus Ambassador</strong> representing <strong>${receipt.collegeName || 'your university'}</strong> has been officially approved by administration.</p>
              </div>

              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">🔑 Your Ambassador Portal Credentials</h3>
                <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">Log in to your private Ambassador Portal to view your unique referral link, track driven enrollments, earn ₹1,000/enrollment commissions, and download promotional assets.</p>
                
                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                  <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Unique Referral Code</div>
                  <div style="font-family: monospace; color: #f59e0b; font-weight: 800; font-size: 18px; letter-spacing: 1px;">${receipt.ambassadorCode || receipt.code}</div>
                </div>

                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                  <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Default Portal Password</div>
                  <div style="font-family: monospace; color: #ffffff; font-weight: 700; font-size: 15px;">${receipt.password || 'TH3ORY-AMB-2026'}</div>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    Access Ambassador Portal &rarr;
                  </a>
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
        console.error('[Vercel API] Resend Ambassador Email Error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // 2. Handle Default Student Enrollment Email
    const portalUrl = 'https://th3ory.online/#/student';

    const { data, error } = await resend.emails.send({
      from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
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
              <h3 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">🔑 Your Private Student Login Credentials</h3>
              <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">Keep this email safe. Use these unique credentials to access all 50 video modules, workbooks, and resources in your Student Portal.</p>
              
              <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Student Login Email</div>
                <div style="color: #ffffff; font-weight: 700; font-size: 15px;">${receipt.email || receipt.studentEmail}</div>
              </div>

              <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Unique 8-Character Enrollment Code (Name + DOB)</div>
                <div style="font-family: monospace; color: #f59e0b; font-weight: 800; font-size: 18px; letter-spacing: 1px;">${receipt.code || receipt.enrollmentCode || 'TH3ORY26'}</div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                  Log In To Student Portal &rarr;
                </a>
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
