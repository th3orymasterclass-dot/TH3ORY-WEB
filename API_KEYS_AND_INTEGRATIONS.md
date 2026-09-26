# TH3ORY Masterclass — API Keys & Production Integrations Matrix

> **Confidential & Operational Reference**  
> **Last Synchronized & Regulated**: September 21, 2026  
> **Target Production URL**: [https://th3ory.online](https://th3ory.online) | [https://www.th3ory.online](https://www.th3ory.online)  
> **GitHub Repository**: [th3orymasterclass-dot/TH3ORY-WEB](https://github.com/th3orymasterclass-dot/TH3ORY-WEB) (`main` branch)

---

## 1. Executive Summary & Integration Health

All core external services, database replication layers, payment gateways, and serverless dispatchers have been regulated, verified, and mapped directly to the production architecture.

| Integration Service | Service Type | Operational Role | Health / Status |
| :--- | :--- | :--- | :--- |
| **Supabase** | Cloud PostgreSQL & Auth | Student profiles, enrollments, course content, realtime feed | 🟢 Connected & Healthy |
| **Razorpay** | Payment Gateway | INR orders, cards/UPI/Netbanking, webhook signature audit | 🟢 Production Live Key |
| **Resend** | Transactional Email | Student credentials, purchase receipts, BIMI-signed dispatch | 🟢 Active Serverless |
| **Calendly** | Executive Scheduling | VIP 1-on-1 mentorship strategy calls with Mentalist Sravan | 🟢 Authorized Token |
| **Google Drive** | Master Cloud Storage | Video streams, action sheets, workbooks (`th3orymasterclass@gmail.com`) | 🟢 Live Embedded Folder |
| **Google Sheets** | Live CRM & Sync Engine | Newsletter subscribers real-time replication (`th3orymasterclass@gmail.com`) | 🟢 Trigger & Script Ready |
| **Vercel** | Edge Hosting & Serverless | Next-gen edge CDN, API routes, security headers, custom domain | 🟢 Automated CI/CD |
| **GitHub** | Version Control | Automated repository pushes triggering Vercel production builds | 🟢 Linked PAT |
| **Obsidian Vault** | Knowledge Base & MCP | Local second brain (`E:\TH3ORY\TH3ORY`), Copilot skills, codebase backup | 🟢 Connected & Synced |

---

## 2. Complete API Keys & Environment Variables Matrix

The table below lists all live credentials and environment variables required for local development, serverless API execution, and Vercel cloud deployment.

> *Note: For security and GitHub Push Protection compliance, private server keys are partially masked below. Unmasked raw values are securely stored locally in your private `.env` and `.env.local` files.*

### A. Database & Realtime (Supabase)
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://qngzfcpnjpabaornddau.supabase.co` | Client + Serverless (`.env`) | `src/lib/supabase.js`, `src/services/supabaseService.js` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...6geY` *(See `.env`)* | Public Client (`.env`, `src/lib/supabase.js`) | Supabase client initialization, RLS data queries |
| `SUPABASE_PROJECT_REF` | `qngzfcpnjpabaornddau` | Server / CLI (`.env`) | Database CLI migrations, MCP connection, edge telemetry |

---

### B. Payment Gateway (Razorpay)
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_TP7hT2Wt1nkqwg` | Public Client (`.env`) | `src/components/PricingSection.jsx`, Razorpay checkout modal |
| `RAZORPAY_KEY_SECRET` | `d1lNjZc17928...[SECURE]` *(See `.env`)* | Serverless Secret (`.env`) | `api/create-razorpay-order.js`, `api/verify-razorpay-signature.js`, `api/razorpay-webhook.js` |

---

### C. Email & Communications (Resend)
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | `re_bFRb6XhQ...[SECURE]` *(See `.env`)* | Serverless Secret (`.env`, `.env.local`) | `api/send-email.js`, `src/services/emailService.js` |
| `VITE_RESEND_API_KEY` | `re_bFRb6XhQ...[SECURE]` *(See `.env`)* | Client Fallback (`.env`) | Client-side email test dispatch in admin portal |

---

### D. VIP Mentorship Scheduling (Calendly)
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `CALENDLY_API_KEY` | `eyJraWQiOiIxY2Ux...[SECURE]` *(See `.env`)* | Serverless / Personal Token (`.env`, `.env.local`) | `src/components/CalendlyModal.jsx`, `api/` VIP bookings |
| `VITE_CALENDLY_API_KEY` | *(Same as above)* | Client (`.env`, `.env.local`) | Pre-fills executive booking slots for VIP Pass students |

---

### E. Security, Session & JWT Authentication
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | `th3ory_jwt_production_master_secret_2026` | Serverless Secret | `api/_lib/auth.js`, signing student & admin session tokens |
| `ADMIN_LOGIN_PASSWORD` | `TH3ORY@admin2026` / `240824` | SHA-256 Verified | `src/admin/AdminLogin.jsx`, `api/admin-login.js` |

---

### F. Repository & Cloud Deployment (GitHub & Vercel)
| Key / Variable Name | Value / Identifier | Scope & Location | Consuming File(s) / Purpose |
| :--- | :--- | :--- | :--- |
| `GITHUB_PERSONAL_ACCESS_TOKEN`| `github_pat_11CLMY...[SECURE]` *(See `.env`)* | Git Remote Config (`.git/config`, `.env`) | Automated Git pushing to `th3orymasterclass-dot/TH3ORY-WEB` |
| `VERCEL_PROJECT_ID` | `prj_xHnB6qFaKtsmIgphJOCSnUKia7hV` | Vercel Project Config (`.vercel/project.json`) | Links local workspace directly to Vercel production project |
| `VERCEL_ORG_ID` | `team_JHMpNEuQBifHnc9Z5MVuqyhc` | Vercel Team Config (`.vercel/project.json`) | Organization: `th3orymasterclass-2557s-projects` |

---

### G. Cloud Asset & Video Repositories (Google Drive)
| Resource Name | URL / Identifier | Linked Identity | Integration Purpose |
| :--- | :--- | :--- | :--- |
| **Master Course Storage Folder** | `https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing` | `th3orymasterclass@gmail.com` | Root directory for all video lessons, workbooks, PDFs, and media |
| **Lesson Video Preview Stream** | `https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview` | Google Drive Embed Stream | Embedded video playback in Course Player and Resource Modal |

---

### H. Google Sheets Newsletter Synchronization
| Resource / Config Name | Value / Identifier | Linked Identity | Consuming Files & Scripts |
| :--- | :--- | :--- | :--- |
| **Google Apps Script** | `google-sheets/TH3ORY_Supabase_Google_Sheet_Sync.gs` | `th3orymasterclass@gmail.com` | Google Sheets custom menu, Apps Script hourly trigger, `doPost` webhook |
| **Supabase pg_net Trigger** | `trg_newsletter_google_sheet_sync` | PostgreSQL Extension `pg_net` | `public.newsletter_subscribers`, `public.tarot_newsletter` |
| **Serverless Relay API** | `/api/sync-newsletter-sheets` | Vercel Edge Serverless | `src/admin/panels/NewsletterPanel.jsx`, `src/admin/panels/IntegrationsPanel.jsx` |
| **Config Setting Key** | `google_sheet_newsletter_webhook_url` | Supabase `site_settings` | Holds live webhook URL, spreadsheet link, and sync timestamps |

---

## 3. Detailed Architecture for Each Integration

### 1. Supabase Database & Realtime Sync
- **Connection Mode**: Initialized via `@supabase/supabase-js` using `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`.
- **Primary Tables**:
  - `student_accounts`: Student login credentials, enrollment codes, last login timestamps.
  - `enrollments`: Order IDs, plan assignments, billing details, payment status.
  - `course_contents`: Video lesson URLs, level and lesson tags, duration, access levels (`free` / `enrolled` / `vip`).
  - `blogs`: Long-form thought leadership articles, reading times, publication status, SEO metadata.
  - `queries`: Student support inquiries and admin responses.
  - `enterprise_quotes`: Inquiries from corporate teams and enterprise leadership clients.
  - `site_settings`: Global configurations for coupons, curriculum levels, course details, and Drive root URL.
- **Data Integrity**: All test data was purged and regulated. Exactly one test student account (`mentalistsravan@gmail.com`, code `TH3-LIVE-2026`) is preserved for continuous verification.

### 2. Razorpay Payment Gateway (Live INR)
- **Workflow**:
  1. Client calls `/api/create-razorpay-order` with `planId`, `amount`, and `currency: "INR"`.
  2. Serverless API computes order with HMAC authentication using `RAZORPAY_KEY_SECRET`.
  3. Client launches `Razorpay({ key: VITE_RAZORPAY_KEY_ID, order_id: order.id, ... }).open()`.
  4. Upon payment completion, signature is verified against `/api/verify-razorpay-signature`.
  5. Webhook listener at `/api/razorpay-webhook` provides secondary verification and idempotent fulfillment.

### 3. Resend Email Dispatcher & BIMI Support
- **Dispatcher Endpoint**: `/api/send-email`
- **Supported Email Triggers**:
  - **Enrollment Welcome Email**: Dispatches 8-character unique enrollment code and login portal URL.
  - **Payment Receipt**: Full order breakdown with invoice reference.
  - **Query Response**: Direct email update to students when an admin replies to their query.
  - **Password / Code Recovery**: Secure lookup and delivery of student credentials.
- **BIMI Brand Compliance**:
  - `bimi-logo.svg` served with strict SVG Tiny P/S XML headers.
  - `bimi-vmc.pem` certificate chain served for certified inbox avatar displays in Gmail/Apple Mail.

### 4. Google Drive Embedded Media Player & PDF Viewer
- Handled by `src/utils/gdriveHelper.js`:
  - Automatically transforms any standard Google Drive share link into high-performance embeddable URLs (`/preview`, `/embed`, or direct stream).
  - Integrates with the custom student video modal (`StudentVideoModal.jsx`) and in-browser PDF viewer (`PdfViewerModal.jsx`).

### 5. Calendly Executive VIP Mentorship
- Handled by `src/components/CalendlyModal.jsx`:
  - Activated for students holding the **TH3ORY VIP Executive Mentorship Pass** or **Founder Executive VIP Pass**.
  - Securely reads availability and embeds the direct booking calendar without requiring manual scheduling links.

### 6. Admin Portal: Content & Publishing Hub
- Located at `/admin` under the new **"Content & Publishing Hub"** segment:
  - **Course Videos & Streams** (`content_videos`)
  - **Resources & Workbooks** (`content_resources`)
  - **Blog Publications** (`blogs`)
  - **Community Posts & Wall** (`community_hub`)
  - **Curriculum Architecture** (`curriculum`)

### 7. Obsidian Knowledge Vault & Antigravity MCP Integration
- **Vault Location**: `E:\TH3ORY\TH3ORY` (`TH3ORY` vault)
- **Active MCP Server**: `@modelcontextprotocol/server-filesystem` registered in `.mcp.json` and `.agents/mcp_config.json`
- **Integrated Skills**:
  - `obsidian-markdown`: Note syntax, wikilinks, callouts, frontmatter management
  - `json-canvas`: Mindmap and workflow visual canvas creation
  - `copilot-read-pdf`: Course textbook and curriculum PDF ingestion
  - `copilot-youtube-transcript`: Video lesson transcript processing
  - `copilot-web-fetch` & `copilot-web-search`: Real-time web retrieval
- **Backup Pipeline**: 1-click automated site backup via `npm run backup:obsidian` (`scripts/sync-obsidian-vault.js`), maintaining a full replica of all source code, API routes, SQL migrations, scripts, and documentation in `E:\TH3ORY\TH3ORY\Backup`.

### 8. Google Sheets Live Newsletter Sync Engine
- **Target Account**: `th3orymasterclass@gmail.com`
- **Tables Connected**: `public.newsletter_subscribers`, `public.tarot_newsletter`
- **Synchronization Layers**:
  1. **PostgreSQL Database Trigger (`pg_net`)**: When a subscriber signs up or updates their status, Supabase executes `handle_newsletter_google_sheet_sync()`, firing an asynchronous HTTP POST via `net.http_post()` directly to the Google Apps Script Web App.
  2. **Google Apps Script (`doPost` Webhook)**: Appends or updates the subscriber record in real-time at Row 2, formatting status chips and calculating UTC and IST timestamps.
  3. **Background Hourly Auto-Sync**: Built-in Google Apps Script time-driven trigger scheduled via `🚀 TH3ORY Masterclass` > `⏱️ Enable Automatic Hourly Sync`.
  4. **Admin Dashboard Controls**: Admins can trigger manual bulk sync, test the webhook signal, or launch the Google Sheet in one click from the Admin Portal.

---

## 4. Vercel Environment Variables Setup

Verify that the following variables are active in **Vercel Dashboard > Project Settings > Environment Variables**:

```bash
# Supabase
VITE_SUPABASE_URL="https://qngzfcpnjpabaornddau.supabase.co"
VITE_SUPABASE_ANON_KEY="[PASTE_FROM_.ENV]"
SUPABASE_PROJECT_REF="qngzfcpnjpabaornddau"

# Razorpay
VITE_RAZORPAY_KEY_ID="rzp_live_TP7hT2Wt1nkqwg"
RAZORPAY_KEY_SECRET="[PASTE_FROM_.ENV]"

# Resend
RESEND_API_KEY="[PASTE_FROM_.ENV]"
VITE_RESEND_API_KEY="[PASTE_FROM_.ENV]"

# Calendly
CALENDLY_API_KEY="[PASTE_FROM_.ENV]"
VITE_CALENDLY_API_KEY="[PASTE_FROM_.ENV]"

# Security & Tokens
JWT_SECRET="th3ory_jwt_production_master_secret_2026"
```

---

## 5. Deployment Verification Checklist

- [x] **Production Build**: Successfully compiled via Vite (`0 errors`, all asset chunks optimized).
- [x] **Git Pipeline**: Committed and pushed to `origin main`.
- [x] **Database Sanitation**: Tested and verified that only the official test student account (`mentalistsravan@gmail.com` / `TH3-LIVE-2026`) is retained.
- [x] **Admin Content Hub**: Integrated sector switcher for Videos, Resources, Blogs, and Community live in the admin portal.
- [x] **Integrations Panel**: Dynamic key detection and live connection verifiers active in Admin > Integrations.
- [x] **SSL & Custom Domain**: Configured via `vercel.json` with HSTS, XSS protection, nosniff, and SAMEORIGIN frame guards.
