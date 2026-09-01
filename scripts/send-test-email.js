/**
 * TH3ORY Masterclass - Live Test Email Dispatch Script
 * Dispatches an official test email with the new BIMI logo profile picture and verified sender badge.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Read .env file directly without external dependencies
let apiKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('RESEND_API_KEY=') || trimmed.startsWith('VITE_RESEND_API_KEY=')) {
      apiKey = trimmed.split('=')[1]?.trim() || '';
      if (apiKey) break;
    }
  }
}

if (!apiKey) {
  apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
}

async function sendTestEmail() {
  const recipients = ['th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'];
  console.log(`🚀 Dispatching Live Test Email via Resend API to: ${recipients.join(', ')}...`);

  // Read logo-transparent.png as Base64 for inline CID attachment
  const logoPath = path.resolve(__dirname, '../public/logo-transparent.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    logoBase64 = fs.readFileSync(logoPath).toString('base64');
  }

  try {
    const payload = {
      from: 'TH3ORY MASTERCLASS <team@th3ory.online>',
      to: recipients,
      subject: `🎯 TH3ORY Masterclass: Verified BIMI Logo & Official Sender Avatar Test`,
      headers: {
        'Bimi-Selector': 'v=BIMI1; s=default',
        'Bimi-Indicator': 'https://th3ory.online/bimi-logo.svg',
        'Bimi-Location': 'https://th3ory.online/bimi-logo.svg; a=https://th3ory.online/bimi-vmc.pem',
        'X-Entity-Ref-ID': `th3ory-verified-${Date.now()}`,
        'List-Unsubscribe': '<mailto:team@th3ory.online?subject=unsubscribe>'
      },
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TH3ORY Masterclass Official Communication</title>
          <!-- Schema.org Microdata for Google / Gmail Sender Avatar & Branding -->
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
            <div style="max-width: 580px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 24px; padding: 36px 32px; text-align: left; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);">
              
              <!-- Official TH3ORY Profile Picture / Brand Avatar (Inline CID + Direct CDN Fallback) -->
              <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid #1e293b; padding-bottom: 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px auto;">
                  <tr>
                    <td style="vertical-align: middle; text-align: center;">
                      <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background: #05080f; border: 2.5px solid #f59e0b; padding: 6px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);">
                        <img 
                          src="${logoBase64 ? 'cid:th3ory_logo_avatar' : 'https://th3ory.online/logo-transparent.png'}" 
                          alt="TH3ORY Logo" 
                          width="68" 
                          height="68" 
                          style="width: 68px; height: 68px; object-fit: contain; display: block; border-radius: 50%; background-color: #05080f;" 
                        />
                      </div>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #f59e0b; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TH3ORY</h1>
                <div style="display: inline-block; margin-top: 6px; padding: 4px 14px; border-radius: 20px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4);">
                  <span style="color: #f59e0b; font-size: 11px; font-weight: 800; letter-spacing: 1px;">✓ VERIFIED OFFICIAL SENDER • BIMI / VMC ENABLED</span>
                </div>
                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; letter-spacing: 1.5px;">Executive Administration &amp; Portal Communications</p>
              </div>

              <!-- Main Message Box -->
              <div style="background-color: #1e293b33; border: 1px solid #f59e0b40; border-radius: 16px; padding: 24px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">✅ Official Brand Avatar &amp; BIMI Logo Verification</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
                  This email confirms that your outgoing communications now embed the <strong>official TH3ORY logo profile picture</strong> via direct MIME CID inline embedding, Schema.org Organization metadata, and Verified Mark Certificate (VMC) BIMI protocol headers.
                </p>
                <div style="background: #0f172a; border-radius: 12px; padding: 14px 18px; border: 1px solid #334155; font-family: monospace; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                  <div><strong style="color: #f59e0b;">Verified Sender:</strong> TH3ORY MASTERCLASS &lt;team@th3ory.online&gt;</div>
                  <div><strong style="color: #f59e0b;">Embedded Avatar:</strong> cid:th3ory_logo_avatar (Inline Lossless PNG)</div>
                  <div><strong style="color: #f59e0b;">BIMI Selector:</strong> default._bimi.th3ory.online</div>
                  <div><strong style="color: #f59e0b;">BIMI SVG Vector:</strong> https://th3ory.online/bimi-logo.svg</div>
                  <div><strong style="color: #f59e0b;">VMC Certificate:</strong> https://th3ory.online/bimi-vmc.pem</div>
                  <div><strong style="color: #f59e0b;">Timestamp:</strong> ${new Date().toISOString()}</div>
                </div>
              </div>

              <!-- Action Button -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 25px;">
                <p style="color: #94a3b8; font-size: 12px; margin-top: 0; margin-bottom: 16px;">Click below to access your portal command dashboard:</p>
                <a href="https://th3ory.online/#/admin" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #05080f; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                  Open TH3ORY Admin Portal &rarr;
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="color: #64748b; font-size: 11px; margin: 0;">Mentalist Sravan Production &copy; 2026. All rights reserved. • Sending Domain: th3ory.online</p>
              </div>

            </div>
          </div>
        </body>
        </html>
      `,
      ...(logoBase64 ? {
        attachments: [
          {
            filename: 'logo-transparent.png',
            content: logoBase64,
            content_id: 'th3ory_logo_avatar',
            disposition: 'inline'
          }
        ]
      } : {})
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('❌ Resend API Error Response:', data);
      process.exit(1);
    }

    console.log('✅ Success! Test email dispatched through Resend.');
    console.log('📧 Message ID:', data.id);
  } catch (err) {
    console.error('❌ Exception sending test email:', err);
    process.exit(1);
  }
}

sendTestEmail();
