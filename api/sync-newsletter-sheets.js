import { createClient } from '@supabase/supabase-js';
import { setStrictCorsHeaders } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ3pmY3BuanBhYmFvcm5kZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzc2MDQsImV4cCI6MjEwMjExMzYwNH0.Uhdbtgi0uJRD2suYX67gIApvxT0o1OvNiy5RD6t6geY';

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Helper to fetch current Google Sheets settings
  const getGoogleSheetsConfig = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'google_sheet_newsletter_webhook_url')
      .single();

    if (error || !data) {
      return {
        url: '',
        sheet_url: '',
        account: 'th3orymasterclass@gmail.com',
        sync_enabled: true,
        last_synced_at: null
      };
    }
    return data.setting_value || {};
  };

  // ─── GET: Fetch Status, Counts & Settings ──────────────────────────────────
  if (req.method === 'GET') {
    try {
      const config = await getGoogleSheetsConfig();

      // Get count of newsletter subscribers
      const { count: mainCount, error: countErr1 } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      // Get count of tarot subscribers
      const { count: tarotCount, error: countErr2 } = await supabase
        .from('tarot_newsletter')
        .select('*', { count: 'exact', head: true });

      const action = req.query?.action;

      // Optional test ping to webhook
      if (action === 'test_webhook' && config.url) {
        try {
          const testRes = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'PING',
              record: {
                id: 'test_ping_' + Date.now(),
                email: 'test.verification@th3ory.online',
                status: 'active',
                source: 'System Webhook Test',
                created_at: new Date().toISOString()
              }
            })
          });

          const testJson = await testRes.json().catch(() => ({}));
          return res.status(200).json({
            success: true,
            message: 'Webhook test signal dispatched to Google Apps Script successfully',
            http_status: testRes.status,
            response: testJson
          });
        } catch (pingErr) {
          return res.status(502).json({
            success: false,
            message: 'Failed to reach Google Apps Script Webhook URL',
            error: pingErr.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        account: 'th3orymasterclass@gmail.com',
        supabase_project: 'qngzfcpnjpabaornddau',
        config: config,
        subscribers: {
          cognitive_dispatch: mainCount || 0,
          tarot_subscribers: tarotCount || 0,
          total: (mainCount || 0) + (tarotCount || 0)
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ─── POST: Actions (Update Config, Relay New Subscriber, Sync All) ─────────
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const action = body.action || 'relay';

      // 1. Update Integration Settings
      if (action === 'update_settings') {
        const { sheet_url, webhook_url, sync_enabled } = body;
        const current = await getGoogleSheetsConfig();
        const updated = {
          ...current,
          sheet_url: sheet_url !== undefined ? sheet_url.trim() : current.sheet_url,
          url: webhook_url !== undefined ? webhook_url.trim() : current.url,
          sync_enabled: sync_enabled !== undefined ? Boolean(sync_enabled) : current.sync_enabled,
          account: 'th3orymasterclass@gmail.com',
          updated_at: new Date().toISOString()
        };

        const { error: upsertErr } = await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'google_sheet_newsletter_webhook_url',
            setting_value: updated,
            updated_at: new Date().toISOString()
          }], { onConflict: 'setting_key' });

        if (upsertErr) {
          return res.status(500).json({ success: false, error: upsertErr.message });
        }

        return res.status(200).json({
          success: true,
          message: 'Google Sheets sync configuration saved successfully',
          config: updated
        });
      }

      // 2. Relay Individual Subscriber to Google Sheet Webhook
      if (action === 'relay' || action === 'new_subscriber') {
        const subscriber = body.record || body.subscriber || body;
        const config = await getGoogleSheetsConfig();

        if (!config.url || config.sync_enabled === false) {
          return res.status(200).json({
            success: true,
            relayed: false,
            message: 'Webhook URL not configured or sync disabled'
          });
        }

        // Fire and forget / await dispatch to Google Apps Script
        const gRes = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'INSERT',
            table: body.table || 'newsletter_subscribers',
            record: subscriber
          })
        });

        const gJson = await gRes.json().catch(() => ({}));
        return res.status(200).json({
          success: true,
          relayed: true,
          response: gJson
        });
      }

      // 3. Trigger Full Sync Relay
      if (action === 'sync_all') {
        const config = await getGoogleSheetsConfig();
        if (!config.url) {
          return res.status(400).json({
            success: false,
            message: 'Google Apps Script Webhook URL must be configured first.'
          });
        }

        // Fetch all newsletter subscribers from Supabase
        const { data: subs, error: subErr } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (subErr) throw subErr;

        let sentCount = 0;
        for (const sub of (subs || [])) {
          try {
            await fetch(config.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'BULK_SYNC',
                table: 'newsletter_subscribers',
                record: sub
              })
            });
            sentCount++;
          } catch (e) {
            console.error('Failed to relay row to sheet:', e);
          }
        }

        // Update last synced timestamp
        const updatedConfig = {
          ...config,
          last_synced_at: new Date().toISOString()
        };
        await supabase
          .from('site_settings')
          .upsert([{
            setting_key: 'google_sheet_newsletter_webhook_url',
            setting_value: updatedConfig,
            updated_at: new Date().toISOString()
          }], { onConflict: 'setting_key' });

        return res.status(200).json({
          success: true,
          message: `Dispatched ${sentCount} subscribers to Google Sheet`,
          count: sentCount
        });
      }

      return res.status(400).json({ success: false, message: 'Invalid action requested' });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
