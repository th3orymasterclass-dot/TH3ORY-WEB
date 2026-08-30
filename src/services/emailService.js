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
      })
    });

    const data = await directRes.json();
    return { success: directRes.ok, data };
  } catch (err) {
    console.error('[Resend API] Exception sending enrollment email:', err);
    return { success: false, error: err };
  }
}

/**
 * Send Automated Campus Ambassador Approval Email with Credentials & Dashboard Access
 */
export async function sendAmbassadorApprovalEmail(ambassadorData) {
  try {
    const adminToken = typeof window !== 'undefined' ? (sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token')) : '';
    // 1. Try Vercel Serverless API endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify({
        type: 'AMBASSADOR_APPROVAL',
        name: ambassadorData.name,
        email: ambassadorData.email,
        collegeName: ambassadorData.collegeName,
        ambassadorCode: ambassadorData.ambassadorCode,
        password: ambassadorData.password
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Resend Serverless API] Ambassador approval email sent successfully:', data);
      return { success: true, data };
    }

    // 2. Client-side fallback if VITE_RESEND_API_KEY is present
    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/#/ambassador-portal` : 'https://th3ory.online/#/ambassador-portal';
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('[Ambassador Email] No client VITE_RESEND_API_KEY. Email simulation logged for:', ambassadorData.email);
      return { success: true, simulated: true };
    }

    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TH3ORY Ambassador Desk <ambassador@th3ory.online>',
        to: [ambassadorData.email, 'th3orymasterclass@gmail.com'],
        subject: `🌟 Welcome to TH3ORY Campus Ambassador Program - Selection Approved!`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Campus Ambassador Network</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Congratulations, ${ambassadorData.name}! 🎉</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Following your team interview evaluation, your selection as the official <strong>TH3ORY Campus Ambassador</strong> representing <strong>${ambassadorData.collegeName || 'your university'}</strong> has been officially approved by administration.</p>
              </div>
              
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">🔑 Your Ambassador Portal Credentials</h3>
                <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">Log in to your private Ambassador Dashboard to view your referral code, track student leads, claim rewards, and download marketing kits.</p>
                
                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                  <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Unique Ambassador Code</div>
                  <div style="font-family: monospace; color: #f59e0b; font-weight: 800; font-size: 18px; letter-spacing: 1px;">${ambassadorData.ambassadorCode}</div>
                </div>

                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                  <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Default Portal Password</div>
                  <div style="font-family: monospace; color: #ffffff; font-weight: 700; font-size: 15px;">${ambassadorData.password || 'TH3ORY-AMB-2026'}</div>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="${portalUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    Access Ambassador Dashboard &rarr;
                  </a>
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
    console.error('[Ambassador Email Exception]:', err);
    return { success: false, error: err };
  }
}

/**
 * Send Automated Campus Ambassador Selection Interview Invitation Email via Resend
 */
export async function sendAmbassadorInterviewInviteEmail(interviewData) {
  try {
    const adminToken = typeof window !== 'undefined' ? (sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token')) : '';
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify({
        type: 'AMBASSADOR_INTERVIEW_INVITE',
        name: interviewData.name,
        email: interviewData.email,
        collegeName: interviewData.collegeName,
        calendlyUrl: interviewData.calendlyUrl || 'https://calendly.com/th3orymasterclass/30min',
        scheduledSlot: interviewData.scheduledSlot || '',
        teamNotes: interviewData.teamNotes || ''
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Resend Serverless API] Interview invite email sent:', data);
      return { success: true, data };
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('[Interview Email] No client key. Email simulation logged for:', interviewData.email);
      return { success: true, simulated: true };
    }

    const bookingEmail = interviewData.email || 'th3orymasterclass@gmail.com';
    const bookingLink = `${interviewData.calendlyUrl || 'https://calendly.com/th3orymasterclass/30min'}?name=${encodeURIComponent(interviewData.name || '')}&email=${encodeURIComponent(bookingEmail)}`;

    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TH3ORY Team Desk <team@th3ory.online>',
        to: [interviewData.email, 'th3orymasterclass@gmail.com'],
        subject: `📅 Campus Ambassador Selection Interview Invitation — TH3ORY Masterclass`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 30px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #f59e0b; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Campus Ambassador Selection Desk</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">Hello, ${interviewData.name}! 👋</h2>
                <p style="color: #cbd5e1; font-size: 14px; margin: 0;">We reviewed your application to represent <strong>${interviewData.collegeName || 'your campus'}</strong> as a TH3ORY Campus Ambassador. You have been shortlisted for a 1-on-1 Selection Interview!</p>
              </div>
              
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #f59e0b; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">📅 Schedule Your 15-Min Interview Call via Calendly</h3>
                <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">
                  ${interviewData.scheduledSlot ? `<strong>Proposed Schedule:</strong> ${interviewData.scheduledSlot}<br/><br/>` : ''}
                  Please pick a convenient date & time slot for your 15-minute live video/phone selection interview using our direct Calendly scheduling program:
                </p>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="${bookingLink}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    Select Interview Time Slot on Calendly &rarr;
                  </a>
                </div>
              </div>

              ${interviewData.teamNotes ? `
              <div style="background-color: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 25px; color: #94a3b8; font-size: 12px;">
                <strong style="color: #f59e0b;">Note from TH3ORY Interview Team:</strong><br/>
                "${interviewData.teamNotes}"
              </div>
              ` : ''}

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
    console.error('[Ambassador Interview Email Exception]:', err);
    return { success: false, error: err };
  }
}


/**
 * Send Central Sub-Portal Targeted Email Broadcast via Resend API
 */
export async function sendPortalBroadcastEmail(payload) {
  try {
    const adminToken = typeof window !== 'undefined' ? (sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token')) : '';
    // 1. Try Vercel Serverless API endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify({
        type: 'BROADCAST_EMAIL',
        to: payload.recipientEmails || payload.to || payload.email,
        subject: payload.subject,
        messageBody: payload.messageBody || payload.message,
        senderName: payload.senderName || 'TH3ORY MASTERCLASS <team@th3ory.online>',
        redirectPortal: payload.redirectPortal || 'https://th3ory.online/#/student'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Resend Serverless API] Broadcast email dispatched successfully:', data);
      return { success: true, data };
    }

    // 2. Client-side fallback if VITE_RESEND_API_KEY is present
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('[Resend API] Simulated broadcast email logged:', payload);
      return { success: true, simulated: true };
    }

    const recipients = Array.isArray(payload.recipientEmails) ? payload.recipientEmails : [payload.email || payload.to || 'th3orymasterclass@gmail.com'];
    const targetList = recipients.filter(Boolean);

    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: payload.senderName || 'TH3ORY MASTERCLASS <team@th3ory.online>',
        to: targetList,
        subject: payload.subject || '📢 Notification from TH3ORY Administration',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05080f; color: #ffffff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
                <h1 style="color: #f59e0b; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px;">TH3ORY</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">Executive Portal Communications</p>
              </div>
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 10px;">${payload.subject}</h2>
                <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${payload.messageBody || payload.message}</div>
              </div>
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <a href="${payload.redirectPortal || 'https://th3ory.online/#/student'}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                  Open Sub-Portal &rarr;
                </a>
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
    console.error('[Portal Broadcast Email Exception]:', err);
    return { success: false, error: err };
  }
}

/**
 * Send Formal Enterprise PDF Quote & Proposal Email via Resend API
 */
export async function sendEnterpriseQuotePdfEmail(quoteData) {
  try {
    const recipient = quoteData.email;
    const clientOrg = quoteData.org_name || quoteData.company || 'Enterprise Account';
    const contactName = quoteData.contact_name || 'Executive Contact';
    const netInvestment = quoteData.expected_revenue || '$10,000';
    const proposalId = `TH3ORY-QUOTE-${String(quoteData.id || Date.now()).slice(-6)}`;

    return await sendPortalBroadcastEmail({
      recipientEmail: recipient,
      senderIdentity: 'TH3ORY Enterprise Desk <enterprise@th3ory.online>',
      subject: `📜 Formal Enterprise Proposal & Quote — ${clientOrg} [${proposalId}]`,
      messageBody: `Dear ${contactName},\n\nPlease find attached/linked your official TH3ORY Corporate Leadership Accelerator Enterprise Quote & Commercial Proposal (${proposalId}).\n\nOrganization: ${clientOrg}\nNet Investment Scope: ${netInvestment}\nProposal Status: Active Contract Draft\nValidity Period: 30 Business Days\n\nYou can review, download, or digitally sign this quote directly via your enterprise portal link below.`,
      redirectPortal: 'https://th3ory.online/#/enterprise'
    });
  } catch (err) {
    console.error('[Enterprise Quote Email Exception]:', err);
    return { success: false, error: err };
  }
}


