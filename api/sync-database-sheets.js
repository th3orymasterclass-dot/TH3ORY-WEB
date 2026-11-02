import { createClient } from '@supabase/supabase-js';
import { setStrictCorsHeaders } from './_lib/security.js';

export const TABLE_METADATA = [
  { table: 'enrollments', tabName: '01_Enrollments', label: 'Enrollments & Orders', category: 'Sales & Billing', icon: 'ShoppingBag' },
  { table: 'student_accounts', tabName: '02_Student_Accounts', label: 'Student Accounts', category: 'Students & Access', icon: 'GraduationCap' },
  { table: 'queries', tabName: '03_Student_Queries', label: 'Student Queries & Mentorship', category: 'Support & Mentorship', icon: 'HelpCircle' },
  { table: 'enterprise_quotes', tabName: '04_Enterprise_Quotes', label: 'Enterprise Quotes', category: 'Corporate & B2B', icon: 'Building' },
  { table: 'contact_inquiries', tabName: '05_Contact_Inquiries', label: 'Contact Inquiries', category: 'Communications', icon: 'Mail' },
  { table: 'reviews', tabName: '06_Reviews', label: 'Testimonials & Reviews', category: 'Testimonials', icon: 'Star' },
  { table: 'course_contents', tabName: '07_Course_Contents', label: 'Curriculum & Video Lessons', category: 'Curriculum', icon: 'Video' },
  { table: 'newsletter_subscribers', tabName: '08_Newsletter_Subs', label: 'Newsletter Subscribers', category: 'Marketing', icon: 'Send' },
  { table: 'newsletter_broadcasts', tabName: '09_Broadcasts', label: 'Broadcast History', category: 'Marketing', icon: 'Radio' },
  { table: 'blogs', tabName: '10_Blog_Articles', label: 'Blog & Editorial Articles', category: 'CMS & Editorial', icon: 'FileText' },
  { table: 'ambassador_applications', tabName: '11_Ambassador_Apps', label: 'Ambassador Applications', category: 'Ambassadors', icon: 'Users' },
  { table: 'ambassador_leads', tabName: '12_Ambassador_Leads', label: 'Ambassador Leads', category: 'Ambassadors', icon: 'Target' },
  { table: 'ambassador_payouts', tabName: '13_Ambassador_Payouts', label: 'Ambassador Payouts', category: 'Ambassadors', icon: 'CreditCard' },
  { table: 'ambassador_tasks', tabName: '14_Ambassador_Tasks', label: 'Ambassador Tasks', category: 'Ambassadors', icon: 'CheckSquare' },
  { table: 'ambassador_weekly_reports', tabName: '15_Ambassador_Reports', label: 'Weekly Reports', category: 'Ambassadors', icon: 'Calendar' },
  { table: 'student_progress', tabName: '16_Student_Progress', label: 'Lesson Progress Tracking', category: 'Students & Access', icon: 'TrendingUp' },
  { table: 'certificates', tabName: '17_Certificates', label: 'Issued Certificates', category: 'Graduation', icon: 'Award' },
  { table: 'student_habit_trackers', tabName: '18_Habit_Trackers', label: 'Habit & Mindset Trackers', category: 'Students & Access', icon: 'Activity' },
  { table: 'site_settings', tabName: '19_Site_Settings', label: 'System Configuration', category: 'System & Config', icon: 'Settings' }
];

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Helper to fetch GDrive & Google Sheets Master Database Config
  const getMasterConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'google_sheets_master_database_config')
        .maybeSingle();

      // Fallback check to legacy newsletter webhook setting if master is empty
      let legacyUrl = '';
      if (!data?.setting_value?.webhook_url) {
        const { data: legacyData } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'google_sheet_newsletter_webhook_url')
          .maybeSingle();
        legacyUrl = legacyData?.setting_value?.url || '';
      }

      return data?.setting_value || {
        account: 'th3orymasterclass@gmail.com',
        gdrive_folder_id: '1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM',
        gdrive_folder_url: 'https://drive.google.com/drive/project/1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM?usp=sharing',
        sheet_url: '',
        webhook_url: legacyUrl || '',
        sync_enabled: true,
        last_sync_all_at: null,
        table_sync_timestamps: {}
      };
    } catch {
      return {
        account: 'th3orymasterclass@gmail.com',
        gdrive_folder_id: '1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM',
        sheet_url: '',
        webhook_url: '',
        sync_enabled: true
      };
    }
  };

  // ─── GET: Fetch Table Catalog, Counts, and Sync Health ────────────────────
  if (req.method === 'GET') {
    try {
      const action = req.query?.action;
      const config = await getMasterConfig();

      // Download CSV action
      if (action === 'download_csv') {
        const targetTable = req.query?.table;
        if (!targetTable) {
          return res.status(400).json({ success: false, error: 'Table parameter required' });
        }

        const { data: rows, error } = await supabase
          .from(targetTable)
          .select('*')
          .limit(5000);

        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }

        if (!rows || rows.length === 0) {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${targetTable}.csv"`);
          return res.status(200).send('No data available\n');
        }

        const headers = Object.keys(rows[0]);
        const csvLines = [headers.join(',')];

        for (const row of rows) {
          const line = headers.map(h => {
            let val = row[h];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') val = JSON.stringify(val);
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          });
          csvLines.push(line.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${targetTable}_${new Date().toISOString().split('T')[0]}.csv"`);
        return res.status(200).send(csvLines.join('\n'));
      }

      // Test webhook ping
      if (action === 'test_webhook') {
        if (!config.webhook_url) {
          return res.status(400).json({ success: false, error: 'Webhook URL is not configured' });
        }

        try {
          const testRes = await fetch(config.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'PING',
              table: 'test_table',
              headers: ['Test ID', 'Timestamp', 'Message'],
              rows: [['test_001', new Date().toISOString(), 'TH3ORY Operations System Webhook Verification Signal']]
            })
          });

          const testJson = await testRes.json().catch(() => ({}));
          return res.status(200).json({
            success: true,
            status: testRes.status,
            message: 'Webhook ping signal acknowledged by Google Apps Script',
            response: testJson
          });
        } catch (pingErr) {
          return res.status(502).json({
            success: false,
            error: 'Failed to contact Google Apps Script webhook: ' + pingErr.message
          });
        }
      }

      // Default: Scan table inventory & counts
      const tableCatalog = [];
      let totalRecords = 0;

      for (const meta of TABLE_METADATA) {
        try {
          const { count, error } = await supabase
            .from(meta.table)
            .select('*', { count: 'exact', head: true });

          const rowCount = error ? 0 : (count || 0);
          totalRecords += rowCount;

          tableCatalog.push({
            ...meta,
            count: rowCount,
            accessible: !error,
            lastSyncedAt: config.table_sync_timestamps?.[meta.table] || null,
            status: error ? 'error' : (rowCount > 0 ? 'active' : 'empty'),
            errorMessage: error ? error.message : null
          });
        } catch (tableErr) {
          tableCatalog.push({
            ...meta,
            count: 0,
            accessible: false,
            status: 'error',
            errorMessage: tableErr.message
          });
        }
      }

      const newsCount = tableCatalog.find(t => t.table === 'newsletter_subscribers')?.count || 0;

      // Legacy newsletter response compatibility
      if (action === 'newsletter' || req.query?.legacy === 'newsletter') {
        return res.status(200).json({
          success: true,
          account: 'th3orymasterclass@gmail.com',
          supabase_project: 'qngzfcpnjpabaornddau',
          config: {
            ...config,
            url: config.webhook_url || ''
          },
          subscribers: {
            cognitive_dispatch: newsCount,
            total: newsCount
          }
        });
      }

      return res.status(200).json({
        success: true,
        operations_system: 'TH3ORY Supabase GDrive Sheets Sync Engine',
        account: config.account || 'th3orymasterclass@gmail.com',
        gdrive_folder_id: config.gdrive_folder_id || '1DoY9B2SnUePocY7y4CAf1Z-uWMAcdPSM',
        config: {
          ...config,
          url: config.webhook_url || ''
        },
        subscribers: {
          cognitive_dispatch: newsCount,
          total: newsCount
        },
        stats: {
          total_tables: TABLE_METADATA.length,
          accessible_tables: tableCatalog.filter(t => t.accessible).length,
          total_records: totalRecords
        },
        tables: tableCatalog
      });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ─── POST: Sync Actions (Save Config, Sync Single Table, Sync All, Relay) ──
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const action = body.action || 'sync_table';
      const config = await getMasterConfig();

      // Legacy newsletter single subscriber relay
      if (action === 'relay' || action === 'new_subscriber') {
        const subscriber = body.record || body.subscriber || body;
        const targetUrl = config.webhook_url;

        if (!targetUrl || config.sync_enabled === false) {
          return res.status(200).json({
            success: true,
            relayed: false,
            message: 'Webhook URL not configured or sync disabled'
          });
        }

        try {
          const gRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'INSERT',
              table: body.table || 'newsletter_subscribers',
              record: subscriber
            })
          });
          const gJson = await gRes.json().catch(() => ({}));
          return res.status(200).json({ success: true, relayed: true, response: gJson });
        } catch (relayErr) {
          return res.status(502).json({ success: false, error: relayErr.message });
        }
      }

      // Legacy newsletter settings update
      if (action === 'update_settings') {
        const { sheet_url, webhook_url, sync_enabled } = body;
        const updated = {
          ...config,
          sheet_url: sheet_url !== undefined ? sheet_url.trim() : config.sheet_url,
          webhook_url: webhook_url !== undefined ? webhook_url.trim() : config.webhook_url,
          sync_enabled: sync_enabled !== undefined ? Boolean(sync_enabled) : config.sync_enabled,
          updated_at: new Date().toISOString()
        };

        await supabase.from('site_settings').upsert([
          { setting_key: 'google_sheets_master_database_config', setting_value: updated, updated_at: new Date().toISOString() },
          { setting_key: 'google_sheet_newsletter_webhook_url', setting_value: { url: updated.webhook_url, sheet_url: updated.sheet_url, sync_enabled: updated.sync_enabled }, updated_at: new Date().toISOString() }
        ], { onConflict: 'setting_key' });

        return res.status(200).json({
          success: true,
          message: 'Google Sheets sync configuration saved successfully',
          config: updated
        });
      }

      // 1. Save Configuration
      if (action === 'save_config') {
        const { sheet_url, webhook_url, sync_enabled, gdrive_folder_id } = body;
        const updated = {
          ...config,
          sheet_url: sheet_url !== undefined ? sheet_url.trim() : config.sheet_url,
          webhook_url: webhook_url !== undefined ? webhook_url.trim() : config.webhook_url,
          gdrive_folder_id: gdrive_folder_id !== undefined ? gdrive_folder_id.trim() : config.gdrive_folder_id,
          sync_enabled: sync_enabled !== undefined ? Boolean(sync_enabled) : config.sync_enabled,
          updated_at: new Date().toISOString()
        };

        const { error: upsertErr } = await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'google_sheets_master_database_config',
            setting_value: updated,
            updated_at: new Date().toISOString()
          }], { onConflict: 'setting_key' });

        if (upsertErr) {
          return res.status(500).json({ success: false, error: upsertErr.message });
        }

        return res.status(200).json({
          success: true,
          message: 'Operations System configuration successfully committed to Supabase',
          config: updated
        });
      }

      // 2. Sync Single Table
      if (action === 'sync_table') {
        const targetTable = body.table;
        if (!targetTable) {
          return res.status(400).json({ success: false, error: 'Table parameter required' });
        }

        const meta = TABLE_METADATA.find(t => t.table === targetTable) || {
          table: targetTable,
          tabName: targetTable,
          label: targetTable
        };

        // Query all rows from table
        const { data: rows, error } = await supabase
          .from(targetTable)
          .select('*')
          .limit(10000);

        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }

        const safeRows = rows || [];
        let headers = [];
        let formattedRows = [];

        if (safeRows.length > 0) {
          headers = Object.keys(safeRows[0]);
          formattedRows = safeRows.map(row => {
            return headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return JSON.stringify(val);
              return String(val);
            });
          });
        }

        let relayed = false;
        let webhookResult = null;

        if (config.webhook_url) {
          try {
            const hookRes = await fetch(config.webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'TABLE_SYNC',
                table: meta.table,
                tabName: meta.tabName,
                headers,
                rows: formattedRows,
                timestamp: new Date().toISOString()
              })
            });
            webhookResult = await hookRes.json().catch(() => ({}));
            relayed = hookRes.ok;
          } catch (hookErr) {
            console.error(`Webhook dispatch failed for ${targetTable}:`, hookErr);
          }
        }

        // Update timestamp in config
        const nowIso = new Date().toISOString();
        const updatedTimestamps = {
          ...(config.table_sync_timestamps || {}),
          [targetTable]: nowIso
        };

        await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'google_sheets_master_database_config',
            setting_value: {
              ...config,
              table_sync_timestamps: updatedTimestamps
            },
            updated_at: nowIso
          }], { onConflict: 'setting_key' });

        return res.status(200).json({
          success: true,
          table: targetTable,
          tabName: meta.tabName,
          rowCount: safeRows.length,
          relayed,
          webhookResult,
          syncedAt: nowIso
        });
      }

      // 3. Sync All Tables (Bulk Operations Engine)
      if (action === 'sync_all') {
        const syncResults = [];
        const nowIso = new Date().toISOString();
        const updatedTimestamps = { ...(config.table_sync_timestamps || {}) };

        for (const meta of TABLE_METADATA) {
          try {
            const { data: rows, error } = await supabase
              .from(meta.table)
              .select('*')
              .limit(5000);

            if (error) {
              syncResults.push({ table: meta.table, tabName: meta.tabName, success: false, error: error.message });
              continue;
            }

            const safeRows = rows || [];
            let headers = [];
            let formattedRows = [];

            if (safeRows.length > 0) {
              headers = Object.keys(safeRows[0]);
              formattedRows = safeRows.map(row => {
                return headers.map(h => {
                  const val = row[h];
                  if (val === null || val === undefined) return '';
                  if (typeof val === 'object') return JSON.stringify(val);
                  return String(val);
                });
              });
            }

            let relayed = false;
            if (config.webhook_url) {
              try {
                const hookRes = await fetch(config.webhook_url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    event: 'TABLE_SYNC',
                    table: meta.table,
                    tabName: meta.tabName,
                    headers,
                    rows: formattedRows,
                    timestamp: nowIso
                  })
                });
                relayed = hookRes.ok;
              } catch (hookErr) {
                console.error(`Webhook error for table ${meta.table}:`, hookErr);
              }
            }

            updatedTimestamps[meta.table] = nowIso;
            syncResults.push({
              table: meta.table,
              tabName: meta.tabName,
              success: true,
              rowCount: safeRows.length,
              relayed
            });
          } catch (tErr) {
            syncResults.push({ table: meta.table, tabName: meta.tabName, success: false, error: tErr.message });
          }
        }

        // Commit full sync state to site_settings
        await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'google_sheets_master_database_config',
            setting_value: {
              ...config,
              last_sync_all_at: nowIso,
              table_sync_timestamps: updatedTimestamps
            },
            updated_at: nowIso
          }], { onConflict: 'setting_key' });

        return res.status(200).json({
          success: true,
          message: `Synchronized ${syncResults.filter(r => r.success).length} of ${TABLE_METADATA.length} tables`,
          syncedAt: nowIso,
          results: syncResults
        });
      }

      return res.status(400).json({ success: false, error: 'Unknown action specified' });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
