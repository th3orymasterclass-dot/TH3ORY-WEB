import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, Users, Award, Shield, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Sparkles, Layout, Eye, FileText, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';
import { sendPortalBroadcastEmail } from '../../services/emailService';

const PRESET_TEMPLATES = [
  {
    id: 'student_module',
    label: '🎓 Student Portal: New Course Module Unlocked',
    target: 'ALL_STUDENTS',
    redirect: 'https://th3ory.online/#/student',
    subject: '🎓 New Video Module Unlocked in Your Student Portal!',
    sender: 'TH3ORY MASTERCLASS <team@th3ory.online>',
    body: `Hello Masterclass Student,\n\nA brand new advanced video module and accompanying workbook exercise has just been unlocked in your TH3ORY Student Portal.\n\nLog in now to access your new curriculum content, practice psychological influence drills, and update your weekly habit tracker.`
  },
  {
    id: 'ambassador_quest',
    label: '🌟 Ambassador Portal: Weekly Quest & Bonus Alert',
    target: 'CAMPUS_AMBASSADORS',
    redirect: 'https://th3ory.online/#/ambassador-portal',
    subject: '🌟 Friday Ambassador Quest Alert: Earn +100 Bonus Points!',
    sender: 'TH3ORY MASTERCLASS <team@th3ory.online>',
    body: `Attention TH3ORY Campus Ambassador,\n\nA new campus outreach quest is now active in your Ambassador Portal! Complete your Friday activity report by midnight to claim +100 bonus leaderboard points and clear your ₹1,000/enrollment commission payout balance.`
  },
  {
    id: 'enterprise_quote',
    label: '💼 Enterprise Portal: B2B Consultation Proposal Ready',
    target: 'ENTERPRISE_LEADS',
    redirect: 'https://th3ory.online/#/enterprise',
    subject: '💼 Your TH3ORY Corporate Influence & Negotiation Proposal is Ready',
    sender: 'TH3ORY MASTERCLASS <team@th3ory.online>',
    body: `Dear Executive Leader,\n\nFollowing your enterprise consultation request, our senior team has prepared a tailored corporate influence and negotiation masterclass proposal for your organization.\n\nPlease open the Enterprise Portal to review executive package details, team seat tiers, and workshop schedules.`
  },
  {
    id: 'cert_issued',
    label: '📜 Certificate Portal: Masterclass Certification Issued',
    target: 'CERTIFICATE_CANDIDATES',
    redirect: 'https://th3ory.online/#/verify',
    subject: '📜 Congratulations! Your Official TH3ORY Masterclass Certificate is Verified',
    sender: 'TH3ORY MASTERCLASS <team@th3ory.online>',
    body: `Congratulations!\n\nYour 100% completion of the TH3ORY Masterclass of Influencing has been officially verified by administration. Your cryptographic digital certificate is now public and ready to display on LinkedIn.`
  },
  {
    id: 'system_notice',
    label: '📢 All Portals: System Maintenance & Security Update',
    target: 'ALL_STUDENTS',
    redirect: 'https://th3ory.online/#/student',
    subject: '📢 Important Platform Update & Security Enhancement',
    sender: 'TH3ORY MASTERCLASS <team@th3ory.online>',
    body: `Dear Member,\n\nWe have deployed important platform enhancements and security optimizations across all TH3ORY portals. Your account session security, progress sync, and certificate verification are fully updated.`
  }
];

export default function PortalEmailDispatcherPanel({ themeMode = 'dark', isTeamUser = false }) {
  const [targetAudience, setTargetAudience] = useState('ALL_STUDENTS');
  const [customEmails, setCustomEmails]     = useState('');
  const [senderName, setSenderName]         = useState('TH3ORY MASTERCLASS <team@th3ory.online>');
  const [subject, setSubject]               = useState('📢 Official Notification from TH3ORY Administration');
  const [redirectPortal, setRedirectPortal] = useState('https://th3ory.online/#/student');
  const [messageBody, setMessageBody]       = useState('Hello,\n\nPlease log in to your portal to review important updates from TH3ORY administration.');
  const [activeTab, setActiveTab]           = useState('compose'); // 'compose' | 'preview' | 'history'

  const [dispatching, setDispatching]       = useState(false);
  const [statusNotice, setStatusNotice]     = useState('');
  const [sentHistory, setSentHistory]       = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('th3ory_portal_email_history') || '[]');
    } catch { return []; }
  });

  const isDark = themeMode === 'dark';

  const handleApplyTemplate = (tpl) => {
    setTargetAudience(tpl.target);
    setSubject(tpl.subject);
    setSenderName(tpl.sender);
    setRedirectPortal(tpl.redirect);
    setMessageBody(tpl.body);
    setStatusNotice(`Loaded preset: ${tpl.label}`);
  };

  const handleDispatchEmail = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !messageBody.trim()) {
      return setStatusNotice('⚠️ Subject line and message body cannot be empty.');
    }

    setDispatching(true);
    setStatusNotice('');

    try {
      // Determine recipient list
      let recipientList = [];
      if (targetAudience === 'CUSTOM_RECIPIENTS') {
        recipientList = customEmails.split(/[,;\n]+/).map(e => e.trim()).filter(e => e.includes('@'));
        if (recipientList.length === 0) {
          setDispatching(false);
          return setStatusNotice('⚠️ Please enter at least one valid custom email address.');
        }
      } else {
        // Broadcast recipient placeholders routed through Resend
        recipientList = ['th3orymasterclass@gmail.com', 'mentalistsravan@gmail.com'];
        if (targetAudience === 'ALL_STUDENTS') recipientList.push('student.alert@th3ory.online');
        if (targetAudience === 'CAMPUS_AMBASSADORS') recipientList.push('ambassador.network@th3ory.online');
        if (targetAudience === 'ENTERPRISE_LEADS') recipientList.push('enterprise.lead@th3ory.online');
      }

      const res = await sendPortalBroadcastEmail({
        targetAudience,
        recipientEmails: recipientList,
        subject,
        messageBody,
        senderName,
        redirectPortal
      });

      if (res.success) {
        const logItem = {
          id: `eml_${Date.now()}`,
          targetAudience,
          subject,
          senderName,
          redirectPortal,
          recipientCount: recipientList.length,
          dispatchedBy: isTeamUser ? 'Team Member' : 'Admin Operations',
          dispatchedAt: new Date().toISOString()
        };
        const updatedHistory = [logItem, ...sentHistory];
        setSentHistory(updatedHistory);
        try {
          localStorage.setItem('th3ory_portal_email_history', JSON.stringify(updatedHistory));
        } catch {}

        setStatusNotice(`🎉 Email dispatched successfully via Resend API! Target: ${targetAudience} (${recipientList.length} recipients)`);
      } else {
        setStatusNotice(`⚠️ Resend API returned status code: ${res.error || 'Failed to dispatch'}`);
      }
    } catch (err) {
      console.error('Email dispatch error:', err);
      setStatusNotice(`⚠️ Exception dispatching email: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Send className="w-6 h-6 text-amber-500" />
            Central Portal Email &amp; Resend Dispatching System
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Dispatch targeted announcements &amp; credentials to Student, Ambassador, Enterprise, and Affiliate Sub-Portals redirected through Resend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compose' ? 'bg-amber-500 text-slate-950 shadow-md' : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-700')
            }`}
          >
            ✏️ Compose Email
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview' ? 'bg-amber-500 text-slate-950 shadow-md' : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-700')
            }`}
          >
            👁️ Live Email Preview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-700')
            }`}
          >
            📜 Sent History ({sentHistory.length})
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* QUICK TEMPLATE PRESETS BAR */}
      <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-mono">⚡ Quick Email Template Presets (Click to Load):</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-500'
              }`}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. COMPOSE TAB */}
      {activeTab === 'compose' && (
        <form onSubmit={handleDispatchEmail} className={`p-6 rounded-3xl border space-y-6 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Sub-Portal / Audience *</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold"
              >
                <option value="ALL_STUDENTS">🎓 All Enrolled Students (Student Portal: /#/student)</option>
                <option value="CAMPUS_AMBASSADORS">🌟 Campus Ambassador Network (Ambassador Portal: /#/ambassador-portal)</option>
                <option value="ENTERPRISE_LEADS">💼 Corporate Enterprise Leads (Enterprise Portal: /#/enterprise)</option>
                <option value="CERTIFICATE_CANDIDATES">📜 Certificate Holders (Verify Portal: /#/verify)</option>
                <option value="AFFILIATES_NETWORK">🏷️ Public Affiliates &amp; Outreach Network</option>
                <option value="CUSTOM_RECIPIENTS">✉️ Custom Specific Email Address(es)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sender Display Identity (Resend API) *</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="TH3ORY Executive Desk <team@th3ory.online>"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>
          </div>

          {targetAudience === 'CUSTOM_RECIPIENTS' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-amber-400 mb-1">Custom Recipient Email Address(es) *</label>
              <textarea
                rows={2}
                required
                value={customEmails}
                onChange={e => setCustomEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g. student1@stanford.edu, lead@corporate.com)"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs resize-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. 🎓 Important Update: New Module Unlocked in Student Portal"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sub-Portal Redirection Button CTA *</label>
              <select
                value={redirectPortal}
                onChange={e => setRedirectPortal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
              >
                <option value="https://th3ory.online/#/student">🎓 Student Portal (/#/student)</option>
                <option value="https://th3ory.online/#/ambassador-portal">🌟 Ambassador Portal (/#/ambassador-portal)</option>
                <option value="https://th3ory.online/#/enterprise">💼 Enterprise Portal (/#/enterprise)</option>
                <option value="https://th3ory.online/#/verify">📜 Verify Portal (/#/verify)</option>
                <option value="https://th3ory.online/#/enroll">💳 Enrollment Page (/#/enroll)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Message Content (HTML &amp; Formatting Supported) *</label>
            <textarea
              rows={8}
              required
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              placeholder="Enter message body content..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={dispatching}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {dispatching ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {dispatching ? 'Dispatching via Resend API...' : 'Dispatch Email Broadcast via Resend'}
          </button>
        </form>
      )}

      {/* 2. LIVE PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <div className="text-slate-400 text-xs font-mono flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Live Rendered Email Layout Preview (As Delivered to Inbox)</span>
          </div>

          <div className="max-w-lg mx-auto bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 text-left text-white shadow-2xl space-y-5">
            <div className="text-center border-b border-[#1e293b] pb-4">
              <h1 className="text-amber-500 font-black text-xl tracking-wider m-0">TH3ORY</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Executive Portal Communications</p>
            </div>

            <div className="bg-[#1e293b33] border border-[#f59e0b40] rounded-xl p-4 space-y-2">
              <h2 className="text-white text-base font-bold m-0">{subject}</h2>
              <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{messageBody}</div>
            </div>

            <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-center space-y-3">
              <p className="text-slate-400 text-[11px] m-0">Click below to open your designated portal:</p>
              <a href={redirectPortal} onClick={e => e.preventDefault()} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-lg inline-block uppercase tracking-wider text-decoration-none">
                Open Designated Sub-Portal &rarr;
              </a>
            </div>

            <div className="text-center border-t border-[#1e293b] pt-3 text-slate-500 text-[10px]">
              Mentalist Sravan Production © 2026. All rights reserved.
            </div>
          </div>
        </div>
      )}

      {/* 3. SENT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-4 border-b border-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Dispatched Email Log Ledger</span>
            <span className="text-amber-400 font-mono">{sentHistory.length} Total Dispatches</span>
          </div>

          {sentHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No emails dispatched yet from this portal session. Use "Compose Email" above to dispatch broadcasts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Target Audience</th>
                    <th className="py-3 px-4">Dispatched By</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sentHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{item.subject}</td>
                      <td className="py-3 px-4 text-amber-400">{item.targetAudience}</td>
                      <td className="py-3 px-4 text-slate-400">{item.dispatchedBy}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(item.dispatchedAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          ● Resend Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
