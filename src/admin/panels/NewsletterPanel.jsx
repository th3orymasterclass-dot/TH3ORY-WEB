import React, { useState } from 'react';
import { Mail, Send, Download, Trash2, CheckCircle, RefreshCw, Search, Sparkles, Settings, Users, ShieldCheck, Copy, Check, Paperclip, FileText, History, ExternalLink } from 'lucide-react';
import { sendEnrollmentEmail } from '../../services/emailService';

export default function NewsletterPanel({
  subscribers = [],
  broadcasts = [],
  saveBroadcast,
  updateSubscriberStatus,
  deleteSubscriber,
  save,
  data,
  themeMode = 'dark'
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'unsubscribed'
  const [copiedAll, setCopiedAll] = useState(false);

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
                    <td className="p-3 text-right">
                      {deleteSubscriber && (
                        <button
                          onClick={() => deleteSubscriber(sub.id || sub.email)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Remove Subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
    </div>
  );
}
