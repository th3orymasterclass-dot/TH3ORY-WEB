import React, { useState } from 'react';
import { HelpCircle, Building2, Mail, CheckCircle2, Clock, MessageSquare, Search, Send, User, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { saveEnterpriseQuoteToSupabase } from '../../services/supabaseService';

export default function QueriesQuotesPanel({
  queries = [],
  enterpriseQuotes = [],
  contactInquiries = [],
  updateQueryStatus,
  updateQuoteStatus,
  updateInquiryStatus,
  deleteQuery,
  themeMode = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('queries'); // 'queries' | 'quotes' | 'contact'
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState({});
  const [actionStatus, setActionStatus] = useState({});
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isDark = themeMode === 'dark';

  const handleAddSampleQuote = async () => {
    setIsSubmittingSample(true);
    const sampleQuote = {
      orgName: `Aura Tech Global #${Math.floor(100 + Math.random() * 900)}`,
      contactName: 'Sarah Jenkins',
      email: 'sarah.jenkins@auratech.io',
      phone: '+1 (555) 432-8901',
      audienceType: 'Executive Leaders & Managers',
      pupilCount: '100-250',
      notes: 'Sample Enterprise License Quote generated for testing database connection.'
    };
    await saveEnterpriseQuoteToSupabase(sampleQuote);
    setIsSubmittingSample(false);
  };

  const handleSendQueryResponse = async (qItem, status = 'answered') => {
    const qId = typeof qItem === 'object' ? qItem.id : qItem;
    const subject = typeof qItem === 'object' ? qItem.subject : null;
    const email = typeof qItem === 'object' ? qItem.studentEmail : null;
    const existingReply = typeof qItem === 'object' ? qItem.reply : '';

    const text = replyText[qId] !== undefined ? replyText[qId] : (existingReply || '');
    if (status === 'answered' && !text.trim()) {
      setActionStatus(prev => ({ ...prev, [qId]: { msg: '⚠️ Type a response first', err: true } }));
      setTimeout(() => setActionStatus(prev => ({ ...prev, [qId]: null })), 3000);
      return;
    }
    await updateQueryStatus(qId, status, text, subject, email);
    setActionStatus(prev => ({ ...prev, [qId]: { msg: `✓ Saved & Streamed (${status.toUpperCase()})`, err: false } }));
    setTimeout(() => setActionStatus(prev => ({ ...prev, [qId]: null })), 3000);
  };

  const handleDeleteQuery = async (qId) => {
    if (!deleteQuery) return;
    setConfirmDeleteId(null);
    await deleteQuery(qId);
  };

  const handleToggleQuoteStatus = async (qId, currentStatus) => {
    const nextStatus = currentStatus === 'contacted' ? 'pending' : 'contacted';
    await updateQuoteStatus(qId, nextStatus);
  };

  const handleToggleInquiryStatus = async (inqId, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'new' : 'resolved';
    await updateInquiryStatus(inqId, nextStatus);
  };

  // Filter lists
  const filteredQueries = queries.filter(q =>
    (q.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.question || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.studentName || q.studentEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuotes = enterpriseQuotes.filter(q =>
    (q.org_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.contact_name || q.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredInquiries = contactInquiries.filter(c =>
    (c.name || c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || c.message || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Form Submissions & Student Communications</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage student query tickets, B2B enterprise license requests, and public contact form messages.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all submissions..."
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs transition-all ${
              isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 p-1.5 border rounded-2xl ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'queries'
              ? isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-900 shadow-sm border border-slate-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Student Queries ({queries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'quotes'
              ? isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-900 shadow-sm border border-slate-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Enterprise Quotes ({enterpriseQuotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'contact'
              ? isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-900 shadow-sm border border-slate-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact Us ({contactInquiries.length})</span>
        </button>
      </div>

      {/* ── TAB 1: STUDENT QUERIES ────────────────────────────────────────── */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          {filteredQueries.length === 0 ? (
            <div className={`p-8 text-center border rounded-2xl text-xs font-mono ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              No student query submissions found matching search filter.
            </div>
          ) : (
            filteredQueries.map(q => (
              <div key={q.id} className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        q.status === 'answered' || q.status === 'resolved'
                          ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {q.status || 'pending'}
                      </span>
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(q.created_at || Date.now()).toLocaleString()}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.subject || 'Student Query Ticket'}</h3>
                    <p className={`text-xs font-mono ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      From: <strong>{q.studentName || 'Student'}</strong> ({q.studentEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmDeleteId === q.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteQuery(q.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(q.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question text box */}
                <div className={`p-3.5 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Question / Ticket Payload:</p>
                  <p className="leading-relaxed">{q.question}</p>
                </div>

                {/* Reply Form / Response Area */}
                <div className="space-y-2 pt-1">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Instructor Answer / Response</label>
                  <textarea
                    value={replyText[q.id] !== undefined ? replyText[q.id] : (q.reply || '')}
                    onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                    rows={3}
                    placeholder="Type instructor response to stream to student portal..."
                    className={`w-full border rounded-xl p-3 text-xs transition-all ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
                    }`}
                  />

                  <div className="flex items-center justify-between gap-4 pt-1">
                    {actionStatus[q.id] ? (
                      <span className={`text-xs font-mono font-bold ${actionStatus[q.id].err ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {actionStatus[q.id].msg}
                      </span>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendQueryResponse(q, 'resolved')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Mark Resolved
                      </button>

                      <button
                        onClick={() => handleSendQueryResponse(q, 'answered')}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply & Mark Answered</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: ENTERPRISE QUOTES ─────────────────────────────────────── */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddSampleQuote}
              disabled={isSubmittingSample}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmittingSample ? 'Generating...' : '+ Generate Sample Lead'}</span>
            </button>
          </div>

          <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">
                No enterprise quote submissions found matching search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b uppercase font-mono text-[10px] ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Contact Person</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className={`p-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.org_name}</td>
                        <td className="p-3">{q.contact_name || 'N/A'}</td>
                        <td className="p-3 font-mono text-indigo-600 font-semibold">{q.email}</td>
                        <td className="p-3 font-mono">{q.phone || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            q.status === 'contacted'
                              ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                          }`}>
                            {q.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleQuoteStatus(q.id, q.status)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            {q.status === 'contacted' ? 'Mark Pending' : 'Mark Contacted'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: CONTACT INQUIRIES ──────────────────────────────────────── */}
      {activeTab === 'contact' && (
        <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-mono">
              No public contact inquiries found matching search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b uppercase font-mono text-[10px] ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <th className="p-3">Sender Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Subject Header</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className={`p-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inq.name}</td>
                      <td className="p-3 font-mono text-indigo-600 font-semibold">{inq.email}</td>
                      <td className="p-3 font-semibold">{inq.subject || 'General Inquiry'}</td>
                      <td className="p-3 truncate max-w-xs">{inq.message}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          inq.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                        }`}>
                          {inq.status || 'new'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleInquiryStatus(inq.id, inq.status)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          {inq.status === 'resolved' ? 'Mark New' : 'Mark Resolved'}
                        </button>
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
