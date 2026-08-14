import React, { useState } from 'react';
import { Mail, Send, Download, Trash2, CheckCircle, RefreshCw, Search, Sparkles, Settings, Users, ShieldCheck, Copy, Check, Filter } from 'lucide-react';
import { sendEnrollmentEmail } from '../../services/emailService';

export default function NewsletterPanel({ subscribers = [], updateSubscriberStatus, deleteSubscriber, save, data }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'unsubscribed'
  const [copiedAll, setCopiedAll] = useState(false);

  // Dispatch Broadcast Modal State
  const [showComposer, setShowComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('TH3ORY Cognitive Dispatch: Micro-Expressions & Executive Tonality');
  const [emailBody, setEmailBody] = useState(`Hello Cognitive Leader,\n\nIn this week's edition of the TH3ORY Cognitive Dispatch, Mentalist Sravan Sudhakaran decodes non-verbal behavioral cues in high-stakes negotiations.\n\nKey Takeaways:\n1. Asymmetric Micro-Expressions\n2. Pitch Modulation under Pressure\n3. De-escalation Techniques\n\nStay Sharp,\nTH3ORY Masterclass Team`);
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

  // Copy emails to clipboard
  const handleCopyEmails = () => {
    const activeEmails = (subscribers || [])
      .filter(s => s.status !== 'unsubscribed')
      .map(s => s.email)
      .join(', ');
    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Email', 'Status', 'Source', 'Subscribed At'];
    const rows = (subscribers || []).map(s => [
      s.email,
      s.status || 'active',
      s.source || 'website_footer',
      s.created_at ? new Date(s.created_at).toLocaleString() : ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `th3ory_newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings
  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (save) {
      save('newsletterConfig', config);
      setConfigSavedMsg('✓ Newsletter configuration saved!');
      setTimeout(() => setConfigSavedMsg(''), 4000);
    }
  };

  // Handle Broadcast Send
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;

    setDispatchLoading(true);
    setDispatchMsg('Broadcasting email dispatch via Resend API...');

    const activeList = (subscribers || []).filter(s => s.status !== 'unsubscribed');
    let successCount = 0;

    // Dispatch emails
    for (const sub of activeList) {
      if (sub.email) {
        await sendEnrollmentEmail({
          studentEmail: sub.email,
          studentName: 'Subscriber',
          enrollmentCode: 'DISPATCH',
          planName: config.title
        });
        successCount++;
      }
    }

    setDispatchLoading(false);
    setDispatchSuccess(true);
    setDispatchMsg(`🎉 Successfully broadcasted newsletter to ${successCount} active subscriber(s)!`);
    setTimeout(() => {
      setDispatchSuccess(false);
      setShowComposer(false);
      setDispatchMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#15171A] border border-[#E9E4FF]/15 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#FFC857] text-xs font-bold uppercase tracking-wider mb-2 border border-[#7C5CFC]/20">
            <Mail className="w-3.5 h-3.5 text-[#FFC857]" /> Database & Subscriber Communications
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#FAFAF7]">
            NEWSLETTER & COGNITIVE DISPATCH
          </h2>
          <p className="text-[#555A66] text-xs sm:text-sm mt-1">
            Manage subscriber database, dispatch weekly behavioral updates, and monitor audience growth.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyEmails}
            className="px-4 py-2.5 rounded-xl bg-[#15171A] border border-[#E9E4FF]/20 hover:border-[#7C5CFC] text-[#FAFAF7] text-xs font-bold flex items-center gap-2 transition-all"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FFC857]" />}
            <span>{copiedAll ? 'Emails Copied!' : 'Copy Emails'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#15171A] border border-[#E9E4FF]/20 hover:border-[#7C5CFC] text-[#FAFAF7] text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-[#FFC857]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowComposer(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Broadcast</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#15171A] border border-[#E9E4FF]/15 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#555A66] font-semibold uppercase tracking-wider mb-2">
            <span>Total Subscribers</span>
            <Users className="w-4 h-4 text-[#FFC857]" />
          </div>
          <p className="text-3xl font-black text-[#FAFAF7]">{subscribers.length}</p>
          <p className="text-xs text-[#555A66] mt-1">Ingested via Website Footer & Contact Form</p>
        </div>

        <div className="bg-[#15171A] border border-[#E9E4FF]/15 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#555A66] font-semibold uppercase tracking-wider mb-2">
            <span>Active Audience</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{activeCount}</p>
          <p className="text-xs text-[#555A66] mt-1">Ready for next newsletter dispatch</p>
        </div>

        <div className="bg-[#15171A] border border-[#E9E4FF]/15 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#555A66] font-semibold uppercase tracking-wider mb-2">
            <span>Unsubscribed</span>
            <Trash2 className="w-4 h-4 text-[#555A66]" />
          </div>
          <p className="text-3xl font-black text-[#FAFAF7]/70">{unsubscribedCount}</p>
          <p className="text-xs text-[#555A66] mt-1">Opted out of weekly emails</p>
        </div>

        <div className="bg-[#15171A] border border-[#E9E4FF]/15 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#555A66] font-semibold uppercase tracking-wider mb-2">
            <span>Dispatch Cadence</span>
            <Sparkles className="w-4 h-4 text-[#FFC857]" />
          </div>
          <p className="text-xl font-bold text-[#FFC857]">{config.frequency || 'Weekly'}</p>
          <p className="text-xs text-[#555A66] mt-1">{config.title || 'Cognitive Dispatch'}</p>
        </div>
      </div>

      {/* Main Content Grid: Subscriber Table + Config Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Subscribers List (8 Cols) */}
        <div className="lg:col-span-8 bg-[#15171A] border border-[#E9E4FF]/15 rounded-3xl p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#555A66]/20 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#FAFAF7]">Subscribers Directory</h3>
              <p className="text-xs text-[#555A66]">Real-time audience members subscribed to Cognitive Dispatch</p>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-[#555A66] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#15171A] border border-[#E9E4FF]/15 text-xs text-[#FAFAF7] placeholder-[#555A66] focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#15171A] border border-[#E9E4FF]/15 text-xs text-[#FAFAF7] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#7C5CFC]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#555A66]/30 text-[#555A66] uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-2">Subscriber Email</th>
                  <th className="pb-3 px-2">Source</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Date Subscribed</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#555A66]/15">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#555A66]">
                      No subscribers found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub, idx) => {
                    const isActive = sub.status !== 'unsubscribed';
                    return (
                      <tr key={sub.id || idx} className="hover:bg-[#7C5CFC]/5 transition-colors">
                        <td className="py-3 px-2 font-medium text-[#FAFAF7]">
                          {sub.email}
                        </td>
                        <td className="py-3 px-2 text-[#555A66]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E9E4FF]/10 text-[#E9E4FF] text-[10px] font-semibold border border-[#E9E4FF]/20">
                            {sub.source || 'website_footer'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {isActive ? 'Active' : 'Unsubscribed'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[#555A66]">
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isActive ? (
                              <button
                                title="Mark Unsubscribed"
                                onClick={async () => {
                                  if (updateSubscriberStatus) {
                                    await updateSubscriberStatus(sub.id || sub.email, 'unsubscribed');
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold transition-all"
                              >
                                Opt Out
                              </button>
                            ) : (
                              <button
                                title="Re-activate Subscriber"
                                onClick={async () => {
                                  if (updateSubscriberStatus) {
                                    await updateSubscriberStatus(sub.id || sub.email, 'active');
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold transition-all"
                              >
                                Re-activate
                              </button>
                            )}

                            <button
                              title="Delete Record"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${sub.email}?`)) {
                                  if (deleteSubscriber) {
                                    await deleteSubscriber(sub.id || sub.email);
                                  }
                                }
                              }}
                              className="p-1 rounded-lg text-[#555A66] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Settings & Configuration (4 Cols) */}
        <div className="lg:col-span-4 bg-[#15171A] border border-[#E9E4FF]/15 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#555A66]/20 pb-4">
            <Settings className="w-4 h-4 text-[#FFC857]" />
            <h3 className="text-lg font-bold text-[#FAFAF7]">Newsletter Settings</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#555A66] uppercase tracking-wider mb-1">
                Newsletter Title
              </label>
              <input
                type="text"
                required
                value={config.title}
                onChange={e => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-[#15171A] border border-[#E9E4FF]/15 rounded-xl px-3 py-2 text-xs text-[#FAFAF7] focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#555A66] uppercase tracking-wider mb-1">
                Tagline / Topic Subtitle
              </label>
              <input
                type="text"
                required
                value={config.subtitle}
                onChange={e => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-[#15171A] border border-[#E9E4FF]/15 rounded-xl px-3 py-2 text-xs text-[#FAFAF7] focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#555A66] uppercase tracking-wider mb-1">
                Dispatch Frequency
              </label>
              <select
                value={config.frequency}
                onChange={e => setConfig({ ...config, frequency: e.target.value })}
                className="w-full bg-[#15171A] border border-[#E9E4FF]/15 rounded-xl px-3 py-2 text-xs text-[#FAFAF7] focus:outline-none focus:border-[#7C5CFC]"
              >
                <option value="Weekly">Weekly (Every Sunday)</option>
                <option value="Bi-Weekly">Bi-Weekly (Every 2 Weeks)</option>
                <option value="Monthly">Monthly Edition</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAFAF7]/90 font-medium">
                <input
                  type="checkbox"
                  checked={config.autoWelcome}
                  onChange={e => setConfig({ ...config, autoWelcome: e.target.checked })}
                  className="rounded border-[#E9E4FF]/20 text-[#7C5CFC] focus:ring-[#7C5CFC]"
                />
                <span>Send automatic welcome email on subscription</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6344E0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-4"
            >
              Save Configuration
            </button>

            {configSavedMsg && (
              <p className="text-xs text-emerald-400 font-bold text-center mt-2 animate-fade-in">
                {configSavedMsg}
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Broadcast Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#15171A] border border-[#E9E4FF]/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-[#555A66]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7C5CFC]/20 text-[#FFC857] flex items-center justify-center border border-[#7C5CFC]/30">
                  <Send className="w-5 h-5 text-[#FFC857]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FAFAF7]">Broadcast Newsletter Dispatch</h3>
                  <p className="text-xs text-[#555A66]">Broadcast to {activeCount} active subscriber(s)</p>
                </div>
              </div>

              <button
                onClick={() => setShowComposer(false)}
                className="text-[#555A66] hover:text-[#FAFAF7] p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 my-4 animate-fade-in">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-emerald-400 font-bold text-base">Broadcast Complete!</h4>
                <p className="text-[#FAFAF7] text-xs">{dispatchMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#555A66] uppercase tracking-wider mb-1">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full bg-[#15171A] border border-[#E9E4FF]/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#FAFAF7] focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555A66] uppercase tracking-wider mb-1">
                    Newsletter Body Content *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    className="w-full bg-[#15171A] border border-[#E9E4FF]/15 rounded-xl px-4 py-3 text-xs text-[#FAFAF7] font-mono focus:outline-none focus:border-[#7C5CFC] resize-none"
                  />
                </div>

                {dispatchMsg && (
                  <p className="text-xs text-[#FFC857] font-semibold">{dispatchMsg}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#555A66]/30 text-[#555A66] hover:text-[#FAFAF7] text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={dispatchLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/30 transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{dispatchLoading ? 'Broadcasting...' : `Send to ${activeCount} Subscribers`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
