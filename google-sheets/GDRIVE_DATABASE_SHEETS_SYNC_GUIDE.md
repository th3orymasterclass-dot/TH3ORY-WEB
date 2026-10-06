# TH3ORY Masterclass — GDrive & Sheets Operations System Guide

> **Master Google Account**: `th3orymasterclass@gmail.com`  
> **Master Google Drive Folder ID**: `1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM`  
> **Master Google Drive Folder URL**: [Google Drive Master Course Storage](https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing)  
> **Supabase Live Project**: `qngzfcpnjpabaornddau.supabase.co` (`ap-southeast-1`)  
> **Spreadsheet Code**: [`google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs)  
> **CLI Tool**: [`scripts/sync-supabase-to-gdrive-sheets.js`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/scripts/sync-supabase-to-gdrive-sheets.js)  
> **Serverless API**: [`api/sync-database-sheets.js`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/api/sync-database-sheets.js)  
> **Admin Console**: `Admin Portal > Communications & Operations > GDrive Database Sheets Sync`  

---

## 1. System Architecture Overview

The **GDrive & Sheets Operations System** provides complete, bi-directional database synchronization between your Supabase production PostgreSQL database and Google Drive spreadsheets under `th3orymasterclass@gmail.com`.

```
┌────────────────────────────────────────────────────────┐
│                   Supabase Database                    │
│             (qngzfcpnjpabaornddau.supabase.co)         │
│  20 Monitored Production Tables (Enrollments, Leads,   │
│   Quotes, Reviews, Mentorship, Ambassadors, etc.)      │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Serverless API        │   │    CLI Operations Engine  │
│ /api/sync-database-sheets │   │     npm run sync:gdrive   │
│  (Vercel Edge / Admin UI) │   │ (Terminal, Cron, CI/CD)   │
└─────────────┬─────────────┘   └─────────────┬─────────────┘
              │                               │
              └─────────────┬─────────────────┘
                            │ HTTPS Webhook / REST
                            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Google Drive Master Spreadsheet File                     │
│                Folder: 1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM                     │
│                  Account: th3orymasterclass@gmail.com                        │
│                                                                              │
│  • 📊 00_System_Overview (Live KPI Cards, Row Counts & IST Health Audit)     │
│  • 💳 01_Enrollments                                                         │
│  • 🎓 02_Student_Accounts                                                    │
│  • ❓ 03_Student_Queries                                                     │
│  • 🏢 04_Enterprise_Quotes                                                   │
│  • 📬 05_Contact_Inquiries                                                   │
│  • ⭐ 06_Reviews                                                             │
│  • 🎬 07_Course_Contents                                                     │
│  • 📰 08_Newsletter_Subs                                                     │
│  • 📢 09_Broadcasts                                                          │
│  • 🔮 10_Tarot_Subs                                                          │
│  • 📝 11_Blog_Articles                                                       │
│  • 🤝 12_Ambassador_Apps                                                     │
│  • 🎯 13_Ambassador_Leads                                                    │
│  • 💰 14_Ambassador_Payouts                                                  │
│  • 📋 15_Ambassador_Tasks                                                    │
│  • 📈 16_Ambassador_Reports                                                  │
│  • 📉 17_Student_Progress                                                    │
│  • 📜 18_Certificates                                                        │
│  • 🧘 19_Habit_Trackers                                                      │
│  • ⚙️ 20_Site_Settings                                                       │
│                                                                              │
│  🎨 Executive Slate Theme (#0F172A), Frozen Panes, Zebra Stripes, IST Dates  │
│  ⏱️ 24/7 Autonomous Background Hourly Sync (Runs when closed)                │
│  ⚡ Real-Time Webhook Support (Zero-latency instant row inserts)              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Table-to-Sheet Tab Directory

All 20 Supabase tables are automatically partitioned into clean, dedicated tabs with optimized column titles, IST timestamps, and executive styling:

| Tab Name | Supabase Table | Category | Purpose |
| :--- | :--- | :--- | :--- |
| `📊 00_System_Overview` | *Generated* | Executive KPI | Aggregate row counts, sync health & audit dates |
| `💳 01_Enrollments` | `enrollments` | Sales & Billing | Student orders, pass checkouts & payment details |
| `🎓 02_Student_Accounts` | `student_accounts` | Students | Student portal accounts, last login, and codes |
| `❓ 03_Student_Queries` | `queries` | Support & Mentorship | Student curriculum questions & mentorship tickets |
| `🏢 04_Enterprise_Quotes` | `enterprise_quotes` | Corporate B2B | Institutional, enterprise, and corporate training leads |
| `📬 05_Contact_Inquiries` | `contact_inquiries` | Communications | Press, media, and general public contact requests |
| `⭐ 06_Reviews` | `reviews` | Testimonials | Verified student feedback and 5-star ratings |
| `🎬 07_Course_Contents` | `course_contents` | Curriculum | Video modules, lesson metadata & duration |
| `📰 08_Newsletter_Subs` | `newsletter_subscribers` | Marketing | Cognitive Dispatch newsletter subscriber list |
| `📢 09_Broadcasts` | `newsletter_broadcasts` | Marketing | Sent newsletter broadcasts & recipient logs |
| `🔮 10_Tarot_Subs` | `tarot_newsletter` | Marketing | Tarot booking flow subscribers |
| `📝 11_Blog_Articles` | `blogs` | CMS & Editorial | Masterclass articles, reading times & view metrics |
| `🤝 12_Ambassador_Apps` | `ambassador_applications` | Ambassadors | Campus & influencer ambassador applications |
| `🎯 13_Ambassador_Leads` | `ambassador_leads` | Ambassadors | Student leads submitted by ambassadors |
| `💰 14_Ambassador_Payouts` | `ambassador_payouts` | Ambassadors | Commission payout ledger & transaction references |
| `📋 15_Ambassador_Tasks` | `ambassador_tasks` | Ambassadors | Ambassador bounties, tasks, and point rewards |
| `📈 16_Ambassador_Reports` | `ambassador_weekly_reports` | Ambassadors | Weekly proof-of-work submissions from ambassadors |
| `📉 17_Student_Progress` | `student_progress` | Students | Lesson completion timestamps by student |
| `📜 18_Certificates` | `certificates` | Graduation | Issued certification credentials & verification hashes |
| `🧘 19_Habit_Trackers` | `student_habit_trackers` | Students | Habit tracking logs and behavioral streak counts |
| `⚙️ 20_Site_Settings` | `site_settings` | System & Config | Platform configurations, feature flags & parameters |

---

## 3. Step-by-Step Setup Walkthrough

### Step 1: Create the Google Sheet in your Master Google Drive Folder
1. Log in with **`th3orymasterclass@gmail.com`**.
2. Open your Master Google Drive Folder:  
   👉 [https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM](https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing)
3. Click **+ New** > **Google Sheets** > **Blank spreadsheet**.
4. Rename the spreadsheet (top left):  
   `TH3ORY Masterclass — Database Master (GDrive)`
5. Copy the spreadsheet URL from your browser address bar.

---

### Step 2: Paste the Google Apps Script
1. Inside your new Google Sheet, click **Extensions** > **Apps Script** in the top navigation bar.
2. Delete any existing code in `Code.gs`.
3. Open [`google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs`](file:///c:/Users/menta/OneDrive/Documents/Th3ory/google-sheets/TH3ORY_Supabase_Master_Sheets_Sync.gs) in this repository and copy the entire code.
4. Paste it into the Apps Script editor.
5. Rename the Apps Script project (top left) to:  
   `TH3ORY Database Master Sync Engine`
6. Press `Ctrl + S` (or click the Save floppy icon).

---

### Step 3: Run Initial Sync & Authorize
1. In the function dropdown at the top, select **`syncAllTablesFromSupabase`**.
2. Click **▷ Run**.
3. Google will show an authorization prompt:
   - Click **Review permissions**.
   - Select your Google account **`th3orymasterclass@gmail.com`**.
   - Click **Advanced** > **Go to TH3ORY Database Master Sync Engine (unsafe)**.
   - Click **Allow**.
4. Switch back to your Google Sheet tab — you will see all 20 tables immediately generated with:
   - Charcoal dark headers (`#0F172A`)
   - White bold title text in Roboto font
   - Indian Standard Time (IST) converted timestamps
   - Auto-resized columns and frozen header rows!
   - The `📊 00_System_Overview` tab showing live counts for every table.

---

### Step 4: Enable Autonomous 24/7 Hourly Background Sync
1. Refresh your Google Sheet tab.
2. You will see a custom menu appear in the top toolbar: **🚀 TH3ORY Operations System**.
3. Click **🚀 TH3ORY Operations System** > **⏱️ Enable Automatic Hourly Background Sync**.
4. Done! Google Apps Script will now pull fresh data from Supabase every hour in the background, even when the spreadsheet is closed.

---

### Step 5: Deploy Real-Time Webhook (Optional for Live Instant Sync)
To allow the TH3ORY Admin Portal or Supabase to push updates immediately into the sheet:
1. In the Apps Script editor, click **Deploy** (top right blue button) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment:
   - **Description**: `TH3ORY Master Database Webhook`
   - **Execute as**: `Me (th3orymasterclass@gmail.com)`
   - **Who has access**: `Anyone` *(Required for serverless dispatch)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).
6. Open the **TH3ORY Admin Portal**:
   - Go to **Communications & Operations** > **GDrive Database Sheets Sync**.
   - Click **Configure Engine**.
   - Paste your **Google Spreadsheet URL** and **Webhook URL**.
   - Click **Test Ping** (verifies connection) and **Save Configuration**.

---

## 4. Operating via the TH3ORY Admin Portal

Navigate to **Communications & Operations** > **GDrive Database Sheets Sync**:
- **Sync All Tables**: One-click full synchronization across all 20 tables with live progress bar.
- **Single Table Quick-Sync**: Click "Sync to Sheet" on any individual table card for immediate single-table replication.
- **CSV Data Export**: Instant raw CSV download for manual offline backups or secondary imports.
- **Live Replication Terminal**: Real-time operations console logging every HTTP request, rows queried, and sync responses.

---

## 5. Operating via Terminal CLI

You can also trigger sync operations directly from your terminal:

```bash
# 1. Audit tables and row counts without hitting webhook (Dry Run)
npm run sync:gdrive -- --dry-run

# 2. Synchronize all tables to Google Drive
npm run sync:gdrive -- --all

# 3. Synchronize a specific table
npm run sync:gdrive -- --table=enrollments

# 4. Save local JSON backup snapshots in scratch/gdrive-exports/
npm run sync:gdrive -- --export
```

---

## 6. Maintenance & Support

- **Disable Background Sync**: Inside the Google Sheet, click `🚀 TH3ORY Operations System` > `⏹️ Disable Auto-Sync`.
- **Manual Tab Refresh**: Inside the Google Sheet, select any tab and click `🚀 TH3ORY Operations System` > `⚡ Sync Current Active Tab`.
- **Overview Dashboard Refresh**: Inside the Google Sheet, click `🚀 TH3ORY Operations System` > `📊 Refresh Executive Overview Dashboard`.
