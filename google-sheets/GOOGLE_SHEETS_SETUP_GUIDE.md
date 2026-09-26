# TH3ORY Masterclass — Supabase Newsletter to Google Sheets Integration

> **Target Google Account**: `th3orymasterclass@gmail.com`  
> **Supabase Project**: `qngzfcpnjpabaornddau` (`th3orymasterclass@gmail.com's Project`)  
> **Primary Table**: `public.newsletter_subscribers`  
> **Secondary Table**: `public.tarot_newsletter`  
> **Last Updated**: September 26, 2026  

---

## 1. Architecture Overview

This integration provides a seamless, robust bridge between your Supabase database and Google Sheets under `th3orymasterclass@gmail.com`:

```
┌─────────────────────────────────┐
│     TH3ORY Masterclass Web      │
│  (Landing Page / Tarot Booking) │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐       PostgreSQL Trigger (pg_net)
│        Supabase Database        │──────────────────────────────────────────┐
│   (newsletter_subscribers)      │                                          │
└────────────────┬────────────────┘                                          │
                 │                                                           │
                 │ REST API (Secure Anon Key)                                │
                 ▼                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│             Google Sheet (th3orymasterclass@gmail.com)                      │
│             Powered by Google Apps Script                                    │
│  • 🔄 On-Demand Pull via Custom Menu ("Sync All from Supabase Now")          │
│  • ⚡ Real-Time Instant Row Insert via Webhook (doPost)                      │
│  • ⏱️ Hands-Free Hourly Auto-Sync Trigger (runs automatically 24/7)          │
│  • 🎨 Dark Executive Theme, Frozen Header, Status Badges & IST Timestamps    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quick 3-Minute Setup Walkthrough

### Step 1: Create the Google Sheet
1. Log in to Google with **`th3orymasterclass@gmail.com`**.
2. Visit **[sheets.new](https://sheets.new)** to create a new Google Sheet.
3. Rename the sheet in the top left to:  
   **`TH3ORY Masterclass — Newsletter Subscribers`**
4. Copy your Google Sheet URL from the browser address bar (you can paste it in the TH3ORY Admin Portal).

---

### Step 2: Add the Google Apps Script
1. In the Google Sheet top menu, click **Extensions** > **Apps Script**.
2. Clear any default code in `Code.gs`.
3. Open the file [`google-sheets/TH3ORY_Supabase_Google_Sheet_Sync.gs`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/google-sheets/TH3ORY_Supabase_Google_Sheet_Sync.gs) in this repository and copy the entire code.
4. Paste the code into the Apps Script editor.
5. Click the **Save** (floppy disk) icon or press `Ctrl + S`.
6. Rename the Apps Script project (top left) to:  
   `TH3ORY Supabase Sync Engine`

---

### Step 3: Run Initial Sync & Authorize
1. In the function dropdown at the top, select **`syncFromSupabase`**.
2. Click **▷ Run**.
3. Google will show an authorization prompt:
   - Click **Review permissions**.
   - Select your account **`th3orymasterclass@gmail.com`**.
   - Click **Advanced** > **Go to TH3ORY Supabase Sync Engine (unsafe)**.
   - Click **Allow**.
4. Switch back to your Google Sheet tab — you will instantly see all current newsletter subscribers populated with:
   - Charcoal dark headers (`#0F172A`)
   - Subscriber ID, Email Address, Status, Acquisition Source
   - UTC Date & Indian Standard Time (IST) Date
   - Live formatted status tags (Active in green, Unsubscribed in soft red)
   - Auto-resized columns and frozen header!

---

### Step 4: Enable Automatic Hourly Background Sync (Hands-Free)
1. Refresh your Google Sheet tab.
2. In the top toolbar, you will see a new menu: **🚀 TH3ORY Masterclass**.
3. Click **🚀 TH3ORY Masterclass** > **⏱️ Enable Automatic Hourly Sync**.
4. That's it! Google Sheets will automatically refresh subscriber data in the background every hour, even when the spreadsheet is closed.

---

### Step 5 (Optional): Enable Real-Time Instant Webhook Push
If you want new subscribers to appear on your Google Sheet the exact second they subscribe:
1. In the Apps Script editor, click **Deploy** (top right blue button) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `TH3ORY Newsletter Realtime Webhook`
   - **Execute as**: `Me (th3orymasterclass@gmail.com)`
   - **Who has access**: `Anyone` *(required for Supabase/Vercel to post)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (format: `https://script.google.com/macros/s/.../exec`).
6. Paste this URL into the **TH3ORY Admin Portal** under **Newsletter Subscribers** > **Google Sheets Sync Settings**, or execute this SQL command in Supabase:
   ```sql
   UPDATE public.site_settings
   SET setting_value = jsonb_set(setting_value, '{url}', '"YOUR_WEB_APP_URL_HERE"')
   WHERE setting_key = 'google_sheet_newsletter_webhook_url';
   ```

---

## 3. Data Structure in Google Sheet

| Column | Name | Format / Description | Example |
| :---: | :--- | :--- | :--- |
| **A** | `Subscriber ID` | UUID / String | `4e651c15-9436-4863-b337-5cdb9fe9988f` |
| **B** | `Email Address` | Lowercase bold text | `subscriber@example.com` |
| **C** | `Status` | Pill tag (Active / Unsubscribed) | `active` |
| **D** | `Acquisition Source` | Channel origin | `website_footer` / `booking_flow` |
| **E** | `Subscribed Date (UTC)` | YYYY-MM-DD HH:MM:SS | `2026-09-26 12:30:00` |
| **F** | `Subscribed Date (IST)` | Indian Standard Time | `2026-09-26 18:00:00` |
| **G** | `Last Synchronized` | IST Sync Timestamp | `2026-09-26 18:05:00` |

---

## 4. Supabase Database Triggers & Verification

The database trigger is pre-installed on your live Supabase project:
- **Trigger**: `trg_newsletter_google_sheet_sync` on `public.newsletter_subscribers`
- **Trigger**: `trg_tarot_newsletter_google_sheet_sync` on `public.tarot_newsletter`
- **Function**: `public.handle_newsletter_google_sheet_sync()`
- **Extension**: `pg_net` (PostgreSQL Network Async Client)

Whenever a new record is added or updated in either table, Supabase fires an asynchronous HTTP POST to your Apps Script Web App without adding any latency to the user signup.

---

## 5. Maintenance & Support

- **Trigger removal**: Run `🚀 TH3ORY Masterclass` > `⏹️ Disable Auto-Sync` inside Google Sheets anytime.
- **Analytics snapshot**: Run `🚀 TH3ORY Masterclass` > `📊 View Subscriber Analytics` to see immediate counts of active vs unsubscribed leads.
- **API Endpoint**: Serverless status and diagnostics are available at `/api/sync-newsletter-sheets`.
