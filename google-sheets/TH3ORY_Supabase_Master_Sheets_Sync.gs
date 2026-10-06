/**
 * ============================================================================
 * TH3ORY MASTERCLASS — MASTER DATABASE TO GOOGLE SHEETS SYNC ENGINE
 * ============================================================================
 * Target Google Account: th3orymasterclass@gmail.com
 * Google Drive Master Folder ID: 1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM
 * Supabase Project Ref: qngzfcpnjpabaornddau (ap-southeast-1)
 * 
 * CAPABILITIES:
 * 1. 🔄 Multi-Table Full Sync: Pulls ALL Supabase production tables into individual tabs.
 * 2. ⚡ Real-Time Webhook (doPost): Instant single-row & bulk sync from Vercel Edge / Supabase.
 * 3. 📊 Executive Overview Dashboard: Live KPI cards, row counts, and synchronization health.
 * 4. ⏱️ 24/7 Autonomous Background Sync: Hourly cron trigger keeping Google Drive up-to-date.
 * 5. 🎨 Dark Executive Aesthetics: #0F172A slate headers, zebra stripes, status badges & IST dates.
 * ============================================================================
 */

// ─── MASTER CONFIGURATION ───────────────────────────────────────────────────
const TH3ORY_MASTER_CONFIG = {
  SUPABASE_URL: 'https://qngzfcpnjpabaornddau.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY',
  TIMEZONE: 'Asia/Kolkata', // Indian Standard Time (IST)
  ACCOUNT: 'th3orymasterclass@gmail.com',
  GDRIVE_FOLDER_ID: '1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM',
  OVERVIEW_SHEET_NAME: '📊 00_System_Overview'
};

// ─── TABLE REGISTRY & SHEET TAB MAPPINGS ────────────────────────────────────
const TABLES_TO_SYNC = [
  { table: 'enrollments', tabName: '💳 Enrollments', label: 'Enrollments & Sales Orders' },
  { table: 'student_accounts', tabName: '🎓 Student Accounts', label: 'Student Login Accounts' },
  { table: 'queries', tabName: '❓ Student Queries', label: 'Student Questions & Mentorship' },
  { table: 'enterprise_quotes', tabName: '🏢 Enterprise Quotes', label: 'Corporate & Institutional Quotes' },
  { table: 'contact_inquiries', tabName: '📬 Contact Inquiries', label: 'Press & Public Inquiries' },
  { table: 'reviews', tabName: '⭐ Reviews', label: 'Student Testimonials & Ratings' },
  { table: 'course_contents', tabName: '🎬 Course Contents', label: 'Video Lessons & Curriculum' },
  { table: 'newsletter_subscribers', tabName: '📰 Newsletter Subs', label: 'Cognitive Dispatch Newsletter' },
  { table: 'newsletter_broadcasts', tabName: '📢 Broadcasts', label: 'Newsletter Broadcasts Archive' },
  { table: 'tarot_newsletter', tabName: '🔮 Tarot Subscribers', label: 'Tarot Subscribers' },
  { table: 'blogs', tabName: '📝 Blog Articles', label: 'Editorial Articles & Posts' },
  { table: 'ambassador_applications', tabName: '🤝 Ambassador Apps', label: 'Ambassador Applications' },
  { table: 'ambassador_leads', tabName: '🎯 Ambassador Leads', label: 'Ambassador Submitted Leads' },
  { table: 'ambassador_payouts', tabName: '💰 Ambassador Payouts', label: 'Commission Payout Ledger' },
  { table: 'ambassador_tasks', tabName: '📋 Ambassador Tasks', label: 'Ambassador Bounties & Tasks' },
  { table: 'ambassador_weekly_reports', tabName: '📈 Weekly Reports', label: 'Ambassador Activity Reports' },
  { table: 'student_progress', tabName: '📉 Student Progress', label: 'Lesson Completion Matrix' },
  { table: 'certificates', tabName: '📜 Certificates', label: 'Issued Credentials' },
  { table: 'student_habit_trackers', tabName: '🧘 Habit Trackers', label: 'Behavioral Habit Logs' },
  { table: 'site_settings', tabName: '⚙️ Site Settings', label: 'Platform Settings & Config' }
];

// ─── GOOGLE SHEETS CUSTOM MENU ──────────────────────────────────────────────
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 TH3ORY Operations System')
    .addItem('🔄 Sync All Database Tables Now', 'syncAllTablesFromSupabase')
    .addItem('⚡ Sync Current Active Tab', 'syncCurrentActiveTable')
    .addSeparator()
    .addItem('📊 Refresh Executive Overview Dashboard', 'generateExecutiveOverviewSheet')
    .addSeparator()
    .addItem('⏱️ Enable Automatic Hourly Background Sync', 'setupAutoHourlySync')
    .addItem('⏹️ Disable Auto-Sync', 'disableAutoHourlySync')
    .addSeparator()
    .addItem('⚙️ View Webhook & Deployment Diagnostics', 'showDiagnostics')
    .addToUi();
}

// ─── CORE MULTI-TABLE PULL ENGINE ───────────────────────────────────────────
/**
 * Synchronizes all configured Supabase tables into individual tabs in this spreadsheet
 */
function syncAllTablesFromSupabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let totalRows = 0;
  let successfulTables = 0;
  const syncStats = [];

  for (let i = 0; i < TABLES_TO_SYNC.length; i++) {
    const item = TABLES_TO_SYNC[i];
    try {
      const rowCount = fetchAndPopulateTable(ss, item.table, item.tabName);
      totalRows += rowCount;
      successfulTables++;
      syncStats.push({ table: item.table, tabName: item.tabName, rows: rowCount, status: 'SUCCESS' });
    } catch (err) {
      syncStats.push({ table: item.table, tabName: item.tabName, rows: 0, status: 'ERROR: ' + err.message });
    }
  }

  // Update or generate Overview Dashboard
  generateExecutiveOverviewSheet(syncStats);

  ss.toast(
    `Synced ${successfulTables}/${TABLES_TO_SYNC.length} tables (${totalRows} total records) across Google Sheets!`,
    '✅ Sync Operation Complete',
    8
  );
}

/**
 * Syncs only the table corresponding to currently active sheet tab
 */
function syncCurrentActiveTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const currentSheet = ss.getActiveSheet();
  const currentTabName = currentSheet.getName();

  const match = TABLES_TO_SYNC.find(t => t.tabName === currentTabName || currentTabName.includes(t.table));
  if (!match) {
    SpreadsheetApp.getUi().alert(`The current tab "${currentTabName}" is not linked to a monitored Supabase table. Please select one of the table tabs or run "Sync All Database Tables Now".`);
    return;
  }

  try {
    const rowCount = fetchAndPopulateTable(ss, match.table, match.tabName);
    ss.toast(`Successfully synchronized ${rowCount} records into ${match.tabName}!`, '✅ Tab Synchronized', 5);
  } catch (e) {
    SpreadsheetApp.getUi().alert(`Failed to sync ${match.tabName}: ${e.message}`);
  }
}

/**
 * Fetches rows for a given table from Supabase REST API and renders into sheet
 */
function fetchAndPopulateTable(ss, tableName, tabName) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  // Call Supabase REST endpoint
  const url = `${TH3ORY_MASTER_CONFIG.SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=5000`;
  const options = {
    method: 'get',
    headers: {
      'apikey': TH3ORY_MASTER_CONFIG.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${TH3ORY_MASTER_CONFIG.SUPABASE_ANON_KEY}`,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();

  if (code !== 200) {
    throw new Error(`HTTP ${code}: ${response.getContentText().slice(0, 100)}`);
  }

  const records = JSON.parse(response.getContentText());
  writeRecordsToSheet(sheet, records);
  return records.length;
}

/**
 * Writes array of JSON records into sheet with executive formatting
 */
function writeRecordsToSheet(sheet, records) {
  sheet.clearContents();
  sheet.clearFormats();

  if (!records || records.length === 0) {
    sheet.getRange(1, 1).setValue('Table is currently empty in Supabase (0 records)');
    sheet.getRange(1, 1).setFontColor('#64748B').setFontStyle('italic');
    return;
  }

  // Derive column headers dynamically from keys
  const keys = Object.keys(records[0]);
  const headers = keys.map(formatColumnHeader);
  headers.push('Last Synced (IST)');

  const nowIST = Utilities.formatDate(new Date(), TH3ORY_MASTER_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  const rows = records.map(rec => {
    const row = keys.map(k => {
      let val = rec[k];
      if (val === null || val === undefined) return '';

      // Format ISO date strings
      if (typeof val === 'string' && (k.endsWith('_at') || k.endsWith('_date') || k === 'last_login')) {
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return Utilities.formatDate(d, TH3ORY_MASTER_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
          }
        } catch (e) {}
      }

      if (typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });

    row.push(nowIST);
    return row;
  });

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Write data rows
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Apply visual executive theme
  applyExecutiveFormatting(sheet, headers.length, rows.length);
}

/**
 * Transforms snake_case database keys into professional Title Case headers
 */
function formatColumnHeader(key) {
  return key
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Applies Dark Slate styling, freeze rows, zebra striping, and auto-sizing
 */
function applyExecutiveFormatting(sheet, colCount, rowCount) {
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);

  // Header row styling (#0F172A = Slate 900)
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange
    .setBackground('#0F172A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Roboto')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');

  if (rowCount > 0) {
    const dataRange = sheet.getRange(2, 1, rowCount, colCount);
    dataRange
      .setFontFamily('Roboto')
      .setFontSize(10)
      .setVerticalAlignment('middle');

    // Alternating rows
    for (let r = 2; r <= rowCount + 1; r++) {
      sheet.setRowHeight(r, 26);
      if (r % 2 === 1) {
        sheet.getRange(r, 1, 1, colCount).setBackground('#F8FAFC');
      } else {
        sheet.getRange(r, 1, 1, colCount).setBackground('#FFFFFF');
      }
    }
  }

  // Auto-fit column widths with padding
  for (let c = 1; c <= colCount; c++) {
    sheet.autoResizeColumn(c);
    const w = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, Math.max(w + 20, 110));
  }
}

// ─── EXECUTIVE OVERVIEW DASHBOARD GENERATOR ───────────────────────────────────
/**
 * Creates/Refreshes the 📊 00_System_Overview tab with real-time stats
 */
function generateExecutiveOverviewSheet(syncStats = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TH3ORY_MASTER_CONFIG.OVERVIEW_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TH3ORY_MASTER_CONFIG.OVERVIEW_SHEET_NAME, 0);
  }

  sheet.clearContents();
  sheet.clearFormats();

  const nowIST = Utilities.formatDate(new Date(), TH3ORY_MASTER_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  // Title Block
  sheet.getRange('A1:E1').merge()
    .setValue('⚡ TH3ORY MASTERCLASS — DATABASE OPERATIONS DASHBOARD')
    .setBackground('#0F172A')
    .setFontColor('#F8FAFC')
    .setFontWeight('bold')
    .setFontSize(14)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center');
  sheet.setRowHeight(1, 46);

  // Subtitle info
  sheet.getRange('A2:E2').merge()
    .setValue(`Google Account: ${TH3ORY_MASTER_CONFIG.ACCOUNT} | GDrive Folder ID: ${TH3ORY_MASTER_CONFIG.GDRIVE_FOLDER_ID} | Last Audit: ${nowIST} IST`)
    .setBackground('#1E293B')
    .setFontColor('#94A3B8')
    .setFontSize(9)
    .setHorizontalAlignment('center');
  sheet.setRowHeight(2, 24);

  // Headers for table summary
  const headers = ['Table Name', 'Google Sheet Tab', 'Record Count', 'Operational Status', 'Last Synchronized (IST)'];
  sheet.getRange(4, 1, 1, 5).setValues([headers]);
  sheet.getRange(4, 1, 1, 5)
    .setBackground('#334155')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(10)
    .setVerticalAlignment('middle');
  sheet.setRowHeight(4, 30);

  let totalRecords = 0;
  const rows = [];

  for (let i = 0; i < TABLES_TO_SYNC.length; i++) {
    const item = TABLES_TO_SYNC[i];
    const targetSheet = ss.getSheetByName(item.tabName);
    let count = 0;
    let lastSync = 'Never';

    if (targetSheet && targetSheet.getLastRow() > 1) {
      count = targetSheet.getLastRow() - 1;
      const lastRowCol = targetSheet.getLastColumn();
      lastSync = targetSheet.getRange(2, lastRowCol).getValue() || nowIST;
    }

    totalRecords += count;
    rows.push([
      item.table,
      item.tabName,
      count,
      count > 0 ? '🟢 LIVE' : '⚪ EMPTY',
      lastSync
    ]);
  }

  sheet.getRange(5, 1, rows.length, 5).setValues(rows);

  // Formatting rows
  for (let r = 5; r < 5 + rows.length; r++) {
    sheet.setRowHeight(r, 24);
    if (r % 2 === 1) {
      sheet.getRange(r, 1, 1, 5).setBackground('#F8FAFC');
    }
  }

  // Summary Row
  const totalRowIdx = 5 + rows.length;
  sheet.getRange(totalRowIdx, 1).setValue('TOTAL AGGREGATE RECORDS:').setFontWeight('bold');
  sheet.getRange(totalRowIdx, 3).setValue(totalRecords).setFontWeight('bold').setFontColor('#4338CA');
  sheet.getRange(totalRowIdx, 4).setValue('🟢 OPERATIONAL').setFontWeight('bold').setFontColor('#166534');
  sheet.getRange(totalRowIdx, 5).setValue(nowIST);
  sheet.getRange(totalRowIdx, 1, 1, 5).setBackground('#E2E8F0');

  // Auto-fit columns
  for (let c = 1; c <= 5; c++) {
    sheet.autoResizeColumn(c);
    const w = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, Math.max(w + 24, 130));
  }
}

// ─── REAL-TIME WEBHOOK RECEIVER (doPost) ─────────────────────────────────────
/**
 * Receives POST requests from TH3ORY Admin Portal or Vercel Edge Serverless
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload detected' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Bulk Table Sync Payload: { event: 'TABLE_SYNC', table: '...', tabName: '...', headers: [...], rows: [...] }
    if (payload.event === 'TABLE_SYNC' && payload.table) {
      const match = TABLES_TO_SYNC.find(t => t.table === payload.table) || {
        tabName: payload.tabName || payload.table
      };

      let sheet = ss.getSheetByName(match.tabName);
      if (!sheet) {
        sheet = ss.insertSheet(match.tabName);
      }

      sheet.clearContents();
      sheet.clearFormats();

      if (payload.headers && payload.headers.length > 0) {
        const fullHeaders = payload.headers.map(formatColumnHeader);
        fullHeaders.push('Last Synced (IST)');
        sheet.getRange(1, 1, 1, fullHeaders.length).setValues([fullHeaders]);

        if (payload.rows && payload.rows.length > 0) {
          const nowIST = Utilities.formatDate(new Date(), TH3ORY_MASTER_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
          const finalRows = payload.rows.map(r => [...r, nowIST]);
          sheet.getRange(2, 1, finalRows.length, fullHeaders.length).setValues(finalRows);
          applyExecutiveFormatting(sheet, fullHeaders.length, finalRows.length);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'bulk_table_synced',
        table: payload.table,
        tabName: match.tabName,
        rowCount: payload.rows ? payload.rows.length : 0
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Real-time Single Record Insert: { event: 'INSERT', table: '...', record: {...} }
    if (payload.event === 'INSERT' && payload.table && payload.record) {
      const match = TABLES_TO_SYNC.find(t => t.table === payload.table);
      if (match) {
        const sheet = ss.getSheetByName(match.tabName);
        if (sheet && sheet.getLastRow() >= 1) {
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          const newRow = headers.map(h => {
            const cleanKey = h.toLowerCase().replace(/ /g, '_');
            return payload.record[cleanKey] !== undefined ? payload.record[cleanKey] : '';
          });
          sheet.insertRowBefore(2);
          sheet.getRange(2, 1, 1, newRow.length).setValues([newRow]);
          sheet.setRowHeight(2, 26);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        action: 'record_inserted',
        table: payload.table
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'acknowledged', payload_type: payload.event || 'unknown' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Health check endpoint for testing Web App deployment URL
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    service: 'TH3ORY Supabase Master Database GDrive Sheets Engine',
    status: 'online',
    account: TH3ORY_MASTER_CONFIG.ACCOUNT,
    gdrive_folder_id: TH3ORY_MASTER_CONFIG.GDRIVE_FOLDER_ID,
    supabase_project: 'qngzfcpnjpabaornddau',
    total_monitored_tables: TABLES_TO_SYNC.length,
    timestamp: Utilities.formatDate(new Date(), TH3ORY_MASTER_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss z')
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── AUTOMATED HOURLY BACKGROUND SYNC SCHEDULER ──────────────────────────────
function setupAutoHourlySync() {
  disableAutoHourlySync();

  ScriptApp.newTrigger('syncAllTablesFromSupabase')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert(
    '⏱️ 24/7 Background Auto-Sync Enabled',
    'Google Apps Script is now scheduled to automatically synchronize all Supabase tables into this Google Drive spreadsheet every hour in the background.\n\nYou do NOT need to keep this spreadsheet open.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function disableAutoHourlySync() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncAllTablesFromSupabase') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }

  SpreadsheetApp.getUi().alert(
    '⏹️ Auto-Sync Disabled',
    `Disabled ${count} scheduled trigger(s). Manual synchronization is still available at any time via the menu.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function showDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'ℹ️ TH3ORY Operations System Diagnostics',
    `• Target Account: ${TH3ORY_MASTER_CONFIG.ACCOUNT}\n` +
    `• Master GDrive Folder ID: ${TH3ORY_MASTER_CONFIG.GDRIVE_FOLDER_ID}\n` +
    `• Supabase Project: qngzfcpnjpabaornddau.supabase.co\n` +
    `• Total Monitored Tables: ${TABLES_TO_SYNC.length}\n` +
    `• Timezone: ${TH3ORY_MASTER_CONFIG.TIMEZONE} (IST)\n\n` +
    `To link with the TH3ORY Web Admin Portal:\n` +
    `1. Deploy this script as a Web App (Deploy > New Deployment > Web app, Execute as 'Me', Access 'Anyone').\n` +
    `2. Copy the Web App URL into the TH3ORY Admin Portal under "GDrive Sheets Sync Engine".`,
    ui.ButtonSet.OK
  );
}
