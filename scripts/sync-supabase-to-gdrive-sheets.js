import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = [
  { table: 'enrollments', tabName: '01_Enrollments', label: 'Enrollments & Orders' },
  { table: 'student_accounts', tabName: '02_Student_Accounts', label: 'Student Accounts' },
  { table: 'queries', tabName: '03_Student_Queries', label: 'Student Queries & Mentorship' },
  { table: 'enterprise_quotes', tabName: '04_Enterprise_Quotes', label: 'Enterprise Quotes' },
  { table: 'contact_inquiries', tabName: '05_Contact_Inquiries', label: 'Contact Inquiries' },
  { table: 'reviews', tabName: '06_Reviews', label: 'Reviews & Feedback' },
  { table: 'course_contents', tabName: '07_Course_Contents', label: 'Course Contents' },
  { table: 'newsletter_subscribers', tabName: '08_Newsletter_Subs', label: 'Newsletter Subscribers' },
  { table: 'newsletter_broadcasts', tabName: '09_Broadcasts', label: 'Newsletter Broadcasts' },
  { table: 'tarot_newsletter', tabName: '10_Tarot_Subs', label: 'Tarot Subscribers' },
  { table: 'blogs', tabName: '11_Blog_Articles', label: 'Blog Articles' },
  { table: 'ambassador_applications', tabName: '12_Ambassador_Apps', label: 'Ambassador Applications' },
  { table: 'ambassador_leads', tabName: '13_Ambassador_Leads', label: 'Ambassador Leads' },
  { table: 'ambassador_payouts', tabName: '14_Ambassador_Payouts', label: 'Ambassador Payouts' },
  { table: 'ambassador_tasks', tabName: '15_Ambassador_Tasks', label: 'Ambassador Tasks' },
  { table: 'ambassador_weekly_reports', tabName: '16_Ambassador_Reports', label: 'Weekly Reports' },
  { table: 'student_progress', tabName: '17_Student_Progress', label: 'Student Progress' },
  { table: 'certificates', tabName: '18_Certificates', label: 'Certificates' },
  { table: 'student_habit_trackers', tabName: '19_Habit_Trackers', label: 'Habit Trackers' },
  { table: 'site_settings', tabName: '20_Site_Settings', label: 'Site Settings' }
];

async function runCli() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isExport = args.includes('--export');
  const targetTableArg = args.find(a => a.startsWith('--table='))?.split('=')[1];

  console.log('===================================================================');
  console.log('⚡ TH3ORY MASTERCLASS — GDRIVE SHEETS OPERATIONS SYSTEM (CLI)');
  console.log('===================================================================');
  console.log(`Target GDrive Account: th3orymasterclass@gmail.com`);
  console.log(`Target Master Folder: 1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Audit Only)' : '⚡ LIVE SYNC EXECUTION'}`);
  if (isExport) console.log(`Export Snapshots: ENABLED (Saving to scratch/gdrive-exports/)`);
  console.log('-------------------------------------------------------------------\n');

  // Fetch Master Config from site_settings
  let webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  try {
    const { data: configRow } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'google_sheets_master_database_config')
      .maybeSingle();

    if (configRow?.setting_value?.webhook_url) {
      webhookUrl = configRow.setting_value.webhook_url;
      console.log(`📡 Discovered Google Apps Script Webhook: ${webhookUrl.slice(0, 35)}...`);
    }
  } catch (e) {
    console.warn('⚠️ Could not load remote config, using defaults.');
  }

  const tablesToProcess = targetTableArg
    ? TABLES.filter(t => t.table.toLowerCase() === targetTableArg.toLowerCase())
    : TABLES;

  if (tablesToProcess.length === 0) {
    console.error(`❌ Table "${targetTableArg}" not found in monitored tables registry.`);
    process.exit(1);
  }

  let totalRecords = 0;
  let successCount = 0;
  let exportDir = null;

  if (isExport) {
    exportDir = path.join(__dirname, '..', 'scratch', 'gdrive-exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
  }

  for (const item of tablesToProcess) {
    process.stdout.write(`  ⏳ Querying ${item.table.padEnd(26)} ... `);
    try {
      const { data: rows, error, count } = await supabase
        .from(item.table)
        .select('*', { count: 'exact' })
        .limit(5000);

      if (error) {
        console.log(`❌ ERROR: ${error.message}`);
        continue;
      }

      const rowList = rows || [];
      const rowCount = count !== null ? count : rowList.length;
      totalRecords += rowCount;
      successCount++;

      console.log(`✅ [${String(rowCount).padStart(3)} rows] Tab -> ${item.tabName}`);

      // Export local file if requested
      if (isExport && exportDir) {
        const filePath = path.join(exportDir, `${item.table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rowList, null, 2));
      }

      // If live sync mode and webhook available, dispatch to Google Apps Script
      if (!isDryRun && webhookUrl && rowList.length > 0) {
        try {
          const headers = Object.keys(rowList[0]);
          const formattedRows = rowList.map(row => {
            return headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return JSON.stringify(val);
              return String(val);
            });
          });

          const hookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'TABLE_SYNC',
              table: item.table,
              tabName: item.tabName,
              headers,
              rows: formattedRows,
              timestamp: new Date().toISOString()
            })
          });

          if (hookRes.ok) {
            process.stdout.write(`     ↳ 📡 Relayed to Google Drive Sheet (${formattedRows.length} rows)\n`);
          } else {
            process.stdout.write(`     ↳ ⚠️ Webhook returned HTTP ${hookRes.status}\n`);
          }
        } catch (postErr) {
          process.stdout.write(`     ↳ ⚠️ Webhook dispatch error: ${postErr.message}\n`);
        }
      }

    } catch (err) {
      console.log(`❌ UNEXPECTED: ${err.message}`);
    }
  }

  console.log('\n===================================================================');
  console.log(`🎉 OPERATIONS SUMMARY:`);
  console.log(`  • Tables Inspected: ${successCount} / ${tablesToProcess.length}`);
  console.log(`  • Total Aggregate Records: ${totalRecords}`);
  if (isExport) console.log(`  • Local Snapshots: Saved in scratch/gdrive-exports/`);
  console.log('===================================================================\n');
}

runCli();
