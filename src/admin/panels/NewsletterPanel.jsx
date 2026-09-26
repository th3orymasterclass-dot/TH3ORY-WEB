import React, { useState, useEffect } from 'react';
import { Mail, Send, Download, Trash2, CheckCircle, RefreshCw, Search, Sparkles, Settings, Users, ShieldCheck, Copy, Check, Paperclip, FileText, History, ExternalLink, Edit3, UserCheck, UserX, FileSpreadsheet, Play, Code } from 'lucide-react';
import ActionDropdown from '../../components/ActionDropdown';
import { sendEnrollmentEmail } from '../../services/emailService';

export default function NewsletterPanel({
  subscribers = [],
  broadcasts = [],
  saveBroadcast,
  updateSubscriberStatus,
  deleteSubscriber,
  updateSubscriber,
  save,
  data,
  themeMode = 'dark'
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'unsubscribed'
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [editSubForm, setEditSubForm] = useState({ email: '', source: '', status: 'active' });

  const isDark = themeMode === 'dark';

  // Dispatch Broadcast Modal State
  const [showComposer, setShowComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('TH3ORY Cognitive Dispatch: Micro-Expressions & Executive Tonality');
  const [emailBody, setEmailBody] = useState(`Hello Cognitive Leader,\n\nIn this week's edition of the TH3ORY Cognitive Dispatch, Mentalist Sravan Sudhakaran decodes non-verbal behavioral cues in high-stakes negotiations.\n\nAttached is your exclusive Cognitive Influence Worksheet PDF.\n\nKey Takeaways:\n1. Asymmetric Micro-Expressions\n2. Pitch Modulation under Pressure\n3. De-escalation Techniques\n\nStay Sharp,\nTH3ORY Masterclass Team`);
  
  // Attachment File State
  const [attachedFile, setAttachedFile] = useState(null); // { name: '', url: '', size: '' }
  const [uploadingFile, setUploadingFile] = useState(false);

  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');

  // Newsletter Config Settings State (stored in site_settings)
  const savedConfig = data?.newsletterConfig || {
    title: 'TH3ORY Cognitive Dispatch',
    subtitle: 'Weekly Behavioral Insights, Micro-Expressions & Influence Cues',
    frequency: 'Weekly',
    autoWelcome: true
  };
  const [config, setConfig] = useState(savedConfig);
  const [configSavedMsg, setConfigSavedMsg] = useState('');

  // Google Sheets Integration State (Target: th3orymasterclass@gmail.com)
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState('');
  const [sheetConfig, setSheetConfig] = useState({
    sheet_url: '',
    url: '',
    account: 'th3orymasterclass@gmail.com',
    sync_enabled: true,
    last_synced_at: null
  });
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    fetch('/api/sync-newsletter-sheets')
      .then(r => r.json())
      .then(d => {
        if (d?.config) {
          setSheetConfig(prev => ({ ...prev, ...d.config }));
        }
      })
      .catch(() => {});
  }, []);

  const handleTriggerSheetsSync = async () => {
    setSheetsSyncing(true);
    setSheetsSyncMsg('Synchronizing all subscribers to Google Sheets...');
    try {
      const res = await fetch('/api/sync-newsletter-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' })
      });
      const data = await res.json();
      setSheetsSyncing(false);
      if (data.success) {
        setSheetsSyncMsg(`✓ Successfully synchronized ${data.count || subscribers.length} subscribers to Google Sheet!`);
        setSheetConfig(prev => ({ ...prev, last_synced_at: new Date().toISOString() }));
      } else {
        setSheetsSyncMsg(`⚠️ ${data.message || 'Please configure the Apps Script Webhook URL.'}`);
      }
    } catch (e) {
      setSheetsSyncing(false);
      setSheetsSyncMsg(`Error: ${e.message}`);
    }
    setTimeout(() => setSheetsSyncMsg(''), 5000);
  };

  const handleSaveSheetConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sync-newsletter-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          sheet_url: sheetConfig.sheet_url,
          webhook_url: sheetConfig.url,
          sync_enabled: sheetConfig.sync_enabled
        })
      });
      const data = await res.json();
      if (data.success) {
        setSheetsSyncMsg('✓ Google Sheets configuration saved!');
        setShowSheetsModal(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
    setTimeout(() => setSheetsSyncMsg(''), 4000);
  };

  // Filtered subscribers
  const filteredSubscribers = (subscribers || []).filter(sub => {
    const matchesSearch = !search || sub.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = (subscribers || []).filter(s => s.status !== 'unsubscribed').length;
  const unsubscribedCount = (subscribers || []).length - activeCount;

  const handleCopyAllEmails = () => {
    const activeEmails = subscribers.filter(s => s.status !== 'unsubscribed').map(s => s.email).join(', ');
    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    setTimeout(() => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file)
      });
      setUploadingFile(false);
    }, 800);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setDispatchLoading(true);

    const activeList = subscribers.filter(s => s.status !== 'unsubscribed');
    let sentCount = 0;

    for (const sub of activeList) {
      await sendEnrollmentEmail({
        email: sub.email,
        name: 'Subscriber',
        orderId: `DISPATCH-${Date.now().toString().slice(-4)}`,
        gateway: 'NEWSLETTER',
        amountPaid: 0,
        currency: 'USD',
        enrolledAt: new Date().toISOString()
      }, {
        customSubject: emailSubject,
        customBody: emailBody,
        attachmentName: attachedFile?.name || null
      });
      sentCount++;
    }

    if (saveBroadcast) {
      await saveBroadcast({
        id: `bc_${Date.now()}`,
        subject: emailSubject,
        recipientCount: sentCount,
        sentAt: new Date().toISOString(),
        attachmentName: attachedFile?.name || null
      });
    }

    setDispatchLoading(false);
    setDispatchSuccess(true);
    setDispatchMsg(`Successfully dispatched email broadcast to ${sentCount} active subscribers!`);
    setTimeout(() => {
      setDispatchSuccess(false);
      setShowComposer(false);
      setAttachedFile(null);
    }, 2500);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (save) {
      save('newsletterConfig', config);
    }
    setConfigSavedMsg('✓ Newsletter configuration broadcasted to landing page live!');
    setTimeout(() => setConfigSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Newsletter & Email Dispatches</h2>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
              isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> LIVE SUBSCRIBER ENGINE
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage public newsletter leads, dispatch weekly cognitive worksheets, and configure lead magnet forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllEmails}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAll ? 'Emails Copied!' : 'Copy All Emails'}</span>
          </button>

          <button
            onClick={() => setShowComposer(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Compose Dispatch Broadcast</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Newsletter Subscribers</p>
          <p className="text-3xl font-black font-mono mt-1 text-emerald-500">{activeCount}</p>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Broadcasts Dispatched</p>
          <p className={`text-3xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{broadcasts.length}</p>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unsubscribed / Bounced</p>
          <p className="text-3xl font-black font-mono mt-1 text-rose-500">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Google Sheets Live Sync Banner (th3orymasterclass@gmail.com) */}
      <div className={`border rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs ${
        isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Sheets Live Sync Engine</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                th3orymasterclass@gmail.com
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Synchronized with Supabase <code className="font-mono text-emerald-400 font-bold">newsletter_subscribers</code> table.
              {sheetConfig.last_synced_at && (
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  (Last Synced: {new Date(sheetConfig.last_synced_at).toLocaleTimeString()})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sheetConfig.sheet_url ? (
            <a
              href={sheetConfig.sheet_url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Open Google Sheet</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          ) : (
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>Create Sheet (sheets.new)</span>
            </a>
          )}

          <button
            onClick={handleTriggerSheetsSync}
            disabled={sheetsSyncing}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${sheetsSyncing ? 'animate-spin' : ''}`} />
            <span>{sheetsSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => setShowSheetsModal(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Configure Google Sheet Link and Apps Script Webhook"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Setup & Config</span>
          </button>
        </div>
      </div>

      {sheetsSyncMsg && (
        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
          sheetsSyncMsg.startsWith('✓')
            ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
            : (isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800')
        }`}>
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{sheetsSyncMsg}</span>
        </div>
      )}

      {/* Subscribers Table */}
      <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-4 h-4 text-indigo-500" />
            Subscribers List ({filteredSubscribers.length})
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subscriber email..."
                className={`border rounded-xl pl-8 pr-3 py-1.5 text-xs transition-all ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`border rounded-xl px-2.5 py-1.5 text-xs transition-all ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase font-mono text-[10px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <th className="p-3">Subscriber Email</th>
                <th className="p-3">Source Channel</th>
                <th className="p-3">Subscribed Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 text-xs font-mono">
                    No subscribers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id || sub.email} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    <td className={`p-3 font-mono font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{sub.email}</td>
                    <td className="p-3 font-mono text-slate-500">{sub.source || 'Landing Page Footer'}</td>
                    <td className="p-3 font-mono text-slate-500">{new Date(sub.subscribed_at || sub.created_at || Date.now()).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        sub.status === 'unsubscribed'
                          ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                      }`}>
                        {sub.status || 'active'}
                      </span>
                    </td>
                    {/* Actions Dropdown */}
                    <td className="p-3 text-right">
                      <ActionDropdown
                        isDark={isDark}
                        label="Actions"
                        items={[
                          {
                            label: 'Edit Subscriber',
                            icon: Edit3,
                            onClick: () => {
                              setEditingSub(sub);
                              setEditSubForm({ email: sub.email || '', source: sub.source || '', status: sub.status || 'active' });
                            },
                            variant: 'primary'
                          },
                          {
                            label: 'Copy Email',
                            icon: Copy,
                            onClick: () => navigator.clipboard.writeText(sub.email),
                            variant: 'default'
                          },
                          {
                            label: sub.status === 'unsubscribed' ? 'Reactivate Subscriber' : 'Mark Unsubscribed',
                            icon: sub.status === 'unsubscribed' ? UserCheck : UserX,
                            onClick: () => updateSubscriberStatus && updateSubscriberStatus(sub.id || sub.email, sub.status === 'unsubscribed' ? 'active' : 'unsubscribed'),
                            variant: sub.status === 'unsubscribed' ? 'success' : 'warning'
                          },
                          ...(deleteSubscriber ? [
                            { divider: true },
                            {
                              label: 'Delete Subscriber',
                              icon: Trash2,
                              onClick: () => deleteSubscriber(sub.id || sub.email),
                              variant: 'danger'
                            }
                          ] : [])
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Send className="w-4 h-4 text-indigo-500" />
              Compose Newsletter Broadcast Email
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Email Subject Header</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Email Dispatch Body Text</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={6}
                  required
                  className={`w-full border rounded-xl p-3 text-xs font-mono leading-relaxed ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Attachment option */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Attach PDF Worksheet / Resource</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="broadcast-file-input"
                  />
                  <label
                    htmlFor="broadcast-file-input"
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{attachedFile ? 'Change Attachment' : 'Upload PDF Attachment'}</span>
                  </label>
                  {attachedFile && (
                    <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {attachedFile.name} ({attachedFile.size})
                    </span>
                  )}
                </div>
              </div>

              {dispatchSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{dispatchMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className={`px-3.5 py-2 font-bold text-xs rounded-xl ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {dispatchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{dispatchLoading ? 'Dispatching...' : `Broadcast to ${activeCount} Subscribers`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Subscriber Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Edit3 className="w-4 h-4 text-indigo-500" />
              Edit Subscriber Details
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (updateSubscriber) {
                  updateSubscriber(editingSub.id || editingSub.email, editSubForm);
                } else if (updateSubscriberStatus) {
                  updateSubscriberStatus(editingSub.id || editingSub.email, editSubForm.status);
                }
                setEditingSub(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Subscriber Email Address</label>
                <input
                  type="email"
                  required
                  value={editSubForm.email}
                  onChange={e => setEditSubForm({ ...editSubForm, email: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Source Channel</label>
                  <input
                    type="text"
                    value={editSubForm.source}
                    onChange={e => setEditSubForm({ ...editSubForm, source: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Status</label>
                  <select
                    value={editSubForm.status}
                    onChange={e => setEditSubForm({ ...editSubForm, status: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className={`px-3 py-1.5 font-bold text-xs rounded-xl ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Subscriber Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Config & Setup Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl ${
            isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Google Sheets Sync Configuration
                  </h4>
                  <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Google Account: <span className="text-emerald-400 font-bold">th3orymasterclass@gmail.com</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetsModal(false)}
                className={`p-1.5 rounded-lg text-xs font-bold ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSheetConfig} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Google Sheet URL (Spreadsheet Link)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sheetConfig.sheet_url || ''}
                    onChange={e => setSheetConfig({ ...sheetConfig, sheet_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Create a new sheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline">sheets.new</a> under th3orymasterclass@gmail.com and paste its link here.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Google Apps Script Webhook URL (For Real-Time Push)
                </label>
                <input
                  type="url"
                  value={sheetConfig.url || ''}
                  onChange={e => setSheetConfig({ ...sheetConfig, url: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Obtained by deploying the Apps Script as a Web App (Execute as: Me, Access: Anyone).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" /> Google Apps Script (Code.gs)
                  </span>
                  <a
                    href="/google-sheets/GOOGLE_SHEETS_SETUP_GUIDE.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View 2-Min Setup Guide <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The script file <code className="text-emerald-400 font-mono">google-sheets/TH3ORY_Supabase_Google_Sheet_Sync.gs</code> is ready in the repository. Paste it into <strong>Extensions &gt; Apps Script</strong> of your spreadsheet.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {sheetConfig.url && (
                    <button
                      type="button"
                      onClick={async () => {
                        setSheetsSyncMsg('Sending test webhook ping...');
                        const res = await fetch('/api/sync-newsletter-sheets?action=test_webhook');
                        const data = await res.json();
                        if (data.success) {
                          alert('✅ Test webhook signal successfully delivered to Google Apps Script!');
                        } else {
                          alert('❌ Webhook test failed: ' + (data.error || data.message));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      Test Webhook Signal
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSheetsModal(false)}
                    className={`px-3.5 py-1.5 font-bold text-xs rounded-xl ${
                      isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
