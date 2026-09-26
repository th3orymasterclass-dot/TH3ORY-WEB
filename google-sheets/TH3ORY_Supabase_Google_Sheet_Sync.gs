/**
 * ============================================================================
 * TH3ORY MASTERCLASS — SUPABASE TO GOOGLE SHEETS LIVE SYNC ENGINE
 * ============================================================================
 * Target Account: th3orymasterclass@gmail.com
 * Supabase Project: qngzfcpnjpabaornddau (th3orymasterclass@gmail.com's Project)
 * Region: ap-southeast-1
 * 
 * FEATURES:
 * 1. 🔄 On-Demand Full Sync: Pulls all subscribers from Supabase REST API in 1 click.
 * 2. ⚡ Real-Time Webhook (doPost): Instantly appends new subscribers as they sign up.
 * 3. ⏱️ Automated Hourly Auto-Sync: Runs in background via Google Apps Script Triggers.
 * 4. 🎨 Executive Aesthetics: Dark themed header, status badges, IST timestamps.
 * 5. 📊 Built-in Analytics: Instant subscriber counts & source breakdown.
 * ============================================================================
 */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const TH3ORY_CONFIG = {
  SUPABASE_URL: 'https://qngzfcpnjpabaornddau.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY',
  TIMEZONE: 'Asia/Kolkata', // Indian Standard Time (IST)
  MAIN_SHEET_NAME: 'Cognitive Dispatch Newsletter',
  TAROT_SHEET_NAME: 'Tarot Subscribers',
  ACCOUNT: 'th3orymasterclass@gmail.com'
};

// ─── GOOGLE SHEETS CUSTOM MENU ──────────────────────────────────────────────
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 TH3ORY Masterclass')
    .addItem('🔄 Sync All from Supabase Now', 'syncFromSupabase')
    .addSeparator()
    .addItem('⏱️ Enable Automatic Hourly Sync', 'setupAutoSync')
    .addItem('⏹️ Disable Auto-Sync', 'disableAutoSync')
    .addSeparator()
    .addItem('📊 View Subscriber Analytics', 'showSubscriberAnalytics')
    .addItem('ℹ️ Webhook & Connection Info', 'showWebhookInfo')
    .addToUi();
}

// ─── CORE SYNC: PULL FROM SUPABASE REST API ─────────────────────────────────
function syncFromSupabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sync Main Newsletter Table (public.newsletter_subscribers)
  const mainCount = syncTableToSheet(
    ss,
    'newsletter_subscribers',
    TH3ORY_CONFIG.MAIN_SHEET_NAME,
    'TH3ORY Cognitive Dispatch'
  );

  // 2. Sync Tarot Newsletter Table (public.tarot_newsletter)
  const tarotCount = syncTableToSheet(
    ss,
    'tarot_newsletter',
    TH3ORY_CONFIG.TAROT_SHEET_NAME,
    'Tarot Booking Flow'
  );

  const total = mainCount + tarotCount;
  ss.toast(`Successfully synced ${total} subscribers (${mainCount} Cognitive Dispatch, ${tarotCount} Tarot) from Supabase!`, '✅ Sync Complete', 5);
}

/**
 * Syncs a specific Supabase table into a designated tab
 */
function syncTableToSheet(ss, tableName, sheetName, categoryTitle) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Fetch records from Supabase REST API
  const url = `${TH3ORY_CONFIG.SUPABASE_URL}/rest/v1/${tableName}?select=*&order=created_at.desc`;
  const options = {
    method: 'get',
    headers: {
      'apikey': TH3ORY_CONFIG.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${TH3ORY_CONFIG.SUPABASE_ANON_KEY}`,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();

  if (code !== 200) {
    throw new Error(`Supabase query failed with HTTP ${code}: ${response.getContentText()}`);
  }

  const records = JSON.parse(response.getContentText());

  // Define Standard Column Headers
  const headers = [
    'Subscriber ID',
    'Email Address',
    'Status',
    'Acquisition Source',
    'Subscribed Date (UTC)',
    'Subscribed Date (IST)',
    'Last Synchronized'
  ];

  // Format rows
  const nowStr = Utilities.formatDate(new Date(), TH3ORY_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  const rows = records.map(rec => {
    const rawDate = rec.created_at || rec.subscribed_at;
    let utcDate = '—';
    let istDate = '—';

    if (rawDate) {
      try {
        const d = new Date(rawDate);
        utcDate = Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd HH:mm:ss');
        istDate = Utilities.formatDate(d, TH3ORY_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
      } catch (e) {
        utcDate = String(rawDate);
      }
    }

    return [
      rec.id || '',
      rec.email ? rec.email.toLowerCase().trim() : '',
      rec.status || 'active',
      rec.source || categoryTitle,
      utcDate,
      istDate,
      nowStr
    ];
  });

  // Clear existing sheet content and write headers + rows
  sheet.clearContents();
  sheet.clearFormats();

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Write data if available
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // ─── STYLING & FORMATTING ─────────────────────────────────────────────────
  styleSheetHeaderAndRows(sheet, headers.length, rows.length);

  return rows.length;
}

/**
 * Formats Google Sheet with sleek dark styling, badges and freeze panes
 */
function styleSheetHeaderAndRows(sheet, colCount, rowCount) {
  // Freeze top header row
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 38);

  // Style Header Row (#0F172A = Slate 900)
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange
    .setBackground('#0F172A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Roboto')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');

  // Center align Status, Dates, and Sync columns
  sheet.getRange(1, 3, Math.max(rowCount + 1, 2), 1).setHorizontalAlignment('center');
  sheet.getRange(1, 5, Math.max(rowCount + 1, 2), 3).setHorizontalAlignment('center');

  if (rowCount > 0) {
    const dataRange = sheet.getRange(2, 1, rowCount, colCount);
    dataRange
      .setFontFamily('Roboto')
      .setFontSize(10)
      .setVerticalAlignment('middle');

    // Email column styling (bold Indigo #4338CA)
    sheet.getRange(2, 2, rowCount, 1)
      .setFontWeight('bold')
      .setFontColor('#1E293B');

    // Alternating Row Colors (Zebra)
    for (let i = 2; i <= rowCount + 1; i++) {
      sheet.setRowHeight(i, 28);
      if (i % 2 === 1) {
        sheet.getRange(i, 1, 1, colCount).setBackground('#F8FAFC');
      } else {
        sheet.getRange(i, 1, 1, colCount).setBackground('#FFFFFF');
      }
    }

    // Apply Conditional Formatting for Status column (Active vs Unsubscribed)
    applyStatusColorRules(sheet, rowCount);
  }

  // Auto-resize columns
  for (let c = 1; c <= colCount; c++) {
    sheet.autoResizeColumn(c);
    const currentWidth = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, Math.max(currentWidth + 24, 120));
  }
}

/**
 * Color-codes status values:
 * active / subscribed -> Emerald Green
 * unsubscribed -> Soft Red
 */
function applyStatusColorRules(sheet, rowCount) {
  const statusRange = sheet.getRange(2, 3, rowCount, 1);
  const rules = sheet.getConditionalFormatRules();

  // Rule 1: Active / Subscribed (Emerald)
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextMatches('(active|subscribed)')
    .setBackground('#DCFCE7')
    .setFontColor('#166534')
    .setRanges([statusRange])
    .build();

  // Rule 2: Unsubscribed (Rose/Red)
  const unsubRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextMatches('(unsubscribed|inactive)')
    .setBackground('#FFE4E6')
    .setFontColor('#9F1239')
    .setRanges([statusRange])
    .build();

  rules.push(activeRule);
  rules.push(unsubRule);
  sheet.setConditionalFormatRules(rules);
}

// ─── REAL-TIME WEBHOOK RECEIVER (doPost) ─────────────────────────────────────
/**
 * Handles incoming HTTP POST requests from Supabase Database Webhooks or Web App backend.
 * Appends or updates the subscriber immediately in real-time!
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Supabase trigger payloads contain: { event: 'INSERT', table: '...', record: { ... } }
    // Direct API payloads contain: { email: '...', status: '...', source: '...' }
    const rec = payload.record || payload;
    const email = (rec.email || '').trim().toLowerCase();
    const source = rec.source || payload.source || 'Website Lead';
    const status = rec.status || 'active';
    const id = rec.id || `sub_${Date.now()}`;
    const rawDate = rec.created_at || new Date().toISOString();

    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ignored', message: 'Missing email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = (payload.table === 'tarot_newsletter') 
      ? TH3ORY_CONFIG.TAROT_SHEET_NAME 
      : TH3ORY_CONFIG.MAIN_SHEET_NAME;

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      syncFromSupabase();
      sheet = ss.getSheetByName(sheetName);
    }

    const nowStr = Utilities.formatDate(new Date(), TH3ORY_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    const d = new Date(rawDate);
    const utcDate = Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd HH:mm:ss');
    const istDate = Utilities.formatDate(d, TH3ORY_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    // Check if email already exists in sheet to update, otherwise insert
    const data = sheet.getDataRange().getValues();
    let foundRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && String(data[i][1]).toLowerCase().trim() === email) {
        foundRow = i + 1; // 1-based index
        break;
      }
    }

    if (foundRow > 0) {
      // Update existing record
      sheet.getRange(foundRow, 3).setValue(status);
      sheet.getRange(foundRow, 7).setValue(nowStr);
    } else {
      // Insert new subscriber at row 2 (just under header) so newest is on top
      sheet.insertRowBefore(2);
      const newRow = [id, email, status, source, utcDate, istDate, nowStr];
      sheet.getRange(2, 1, 1, newRow.length).setValues([newRow]);
      sheet.setRowHeight(2, 28);
      sheet.getRange(2, 2).setFontWeight('bold').setFontColor('#1E293B');
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: foundRow > 0 ? 'updated' : 'inserted',
      email: email,
      timestamp: nowStr
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Health check endpoint for testing deployment URL
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    service: 'TH3ORY Supabase Google Sheets Live Engine',
    status: 'online',
    account: TH3ORY_CONFIG.ACCOUNT,
    supabase_project: 'qngzfcpnjpabaornddau',
    timestamp: Utilities.formatDate(new Date(), TH3ORY_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss z')
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── AUTOMATIC HOURLY BACKGROUND SYNC TRIGGER ───────────────────────────────
function setupAutoSync() {
  disableAutoSync(); // Remove existing triggers first to avoid duplicates

  ScriptApp.newTrigger('syncFromSupabase')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert(
    '⏱️ Automatic Sync Enabled',
    'Google Apps Script is now scheduled to automatically synchronize subscriber data from Supabase every hour in the background.\n\nYou do not need to keep this spreadsheet open.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function disableAutoSync() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncFromSupabase') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }

  SpreadsheetApp.getUi().alert(
    '⏹️ Auto-Sync Disabled',
    `Disabled ${count} background sync trigger(s). Manual sync is still available via the menu.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── SUBSCRIBER ANALYTICS & STATS MODAL ──────────────────────────────────────
function showSubscriberAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TH3ORY_CONFIG.MAIN_SHEET_NAME);

  if (!sheet || sheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No subscribers found. Click "Sync from Supabase Now" first.');
    return;
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  let active = 0;
  let unsubscribed = 0;
  const sourceCounts = {};

  data.forEach(row => {
    const status = String(row[2]).toLowerCase();
    const source = String(row[3]) || 'Unknown';
    if (status === 'unsubscribed') {
      unsubscribed++;
    } else {
      active++;
    }
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  let sourceSummary = '';
  for (const [src, cnt] of Object.entries(sourceCounts)) {
    sourceSummary += `  • ${src}: ${cnt}\n`;
  }

  const lastSync = data[0][6] || 'N/A';

  SpreadsheetApp.getUi().alert(
    '📊 TH3ORY Subscriber Analytics Summary',
    `Total Subscribers: ${data.length}\n` +
    `🟢 Active Subscribers: ${active}\n` +
    `🔴 Unsubscribed: ${unsubscribed}\n\n` +
    `Acquisition Sources:\n${sourceSummary}\n` +
    `Last Synchronized (IST): ${lastSync}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function showWebhookInfo() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'ℹ️ Real-Time Webhook Configuration',
    'To receive real-time subscriber signups instantly:\n\n' +
    '1. Click "Deploy" > "New deployment" in Apps Script.\n' +
    '2. Select "Web app".\n' +
    '3. Execute as: "Me" (th3orymasterclass@gmail.com).\n' +
    '4. Who has access: "Anyone".\n' +
    '5. Copy the generated Web App URL and paste it in the TH3ORY Admin Portal > Integrations > Google Sheets.\n\n' +
    'Once set, every new signup in Supabase immediately appears in this sheet!',
    ui.ButtonSet.OK
  );
}
