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
  deleteQuery
}) {
  const [activeTab, setActiveTab] = useState('queries'); // 'queries' | 'quotes' | 'contact'
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState({});
  const [actionStatus, setActionStatus] = useState({});
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const handleToggleInquiryStatus = async (iId, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'new' : 'resolved';
    await updateInquiryStatus(iId, nextStatus);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Database Forms, Queries &amp; Quotes</h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> REALTIME SYNC
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage incoming student queries, enterprise quotes, and contact inquiries from dedicated Supabase tables</p>
        </div>

        <button
          onClick={handleAddSampleQuote}
          disabled={isSubmittingSample}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isSubmittingSample ? 'Submitting...' : 'Generate Test Quote'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queries'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Student Queries ({queries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quotes'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Enterprise Quotes ({enterpriseQuotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contact'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact Us Inquiries ({contactInquiries.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by student name, email, subject, or organization..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* TAB 1: Student Queries */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          {queries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
              No student queries found in database.
            </div>
          ) : (
            queries
              .filter(q => (q.studentName || '').toLowerCase().includes(search.toLowerCase()) || (q.subject || '').toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-base">{item.studentName}</span>
                        <span className="text-xs text-slate-400 font-mono">({item.studentEmail || 'student@th3ory.online'})</span>
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold px-2 py-0.5 rounded-full font-mono">
                          {item.studentPlan || 'Enrolled Student'}
                        </span>
                      </div>
                      <p className="text-amber-400 font-semibold text-xs mt-1">Subject: {item.subject}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase shrink-0 ${
                      item.status === 'answered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      item.status === 'inprogress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      item.status === 'resolved' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.status || 'OPEN'}
                    </span>
                  </div>

                  {/* Student Question Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Student Message:</span>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">
                      "{item.message}"
                    </p>
                  </div>

                  {/* Admin Reply Workspace */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Instructor Response / Answer:</span>
                      </span>
                      {item.repliedAt && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Last answered: {new Date(item.repliedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={replyText[item.id] !== undefined ? replyText[item.id] : (item.reply || '')}
                      onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                      placeholder="Type instructor response / solution for student query here..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                    />

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                        </span>
                        {actionStatus[item.id] && (
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border animate-pulse ${
                            actionStatus[item.id].err
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {actionStatus[item.id].msg}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendQueryResponse(item, 'inprogress')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </button>

                        <button
                          onClick={() => handleSendQueryResponse(item, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>

                        <button
                          onClick={() => handleSendQueryResponse(item, 'answered')}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply &amp; Mark Answered</span>
                        </button>

                        {deleteQuery && (
                          confirmDeleteId === item.id ? (
                            <div className="flex items-center gap-1.5 ml-1">
                              <span className="text-[11px] text-slate-400">Delete?</span>
                              <button
                                onClick={() => handleDeleteQuery(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all"
                              >Yes</button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all"
                              >No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                              title="Delete query"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB 2: Enterprise Quotes */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {enterpriseQuotes.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
              No enterprise quotes found in database.
            </div>
          ) : (
            enterpriseQuotes
              .filter(q => (q.org_name || '').toLowerCase().includes(search.toLowerCase()) || (q.contact_name || '').toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-white font-bold text-base">{item.org_name}</h4>
                      <p className="text-xs text-slate-400">Contact: <strong>{item.contact_name}</strong> ({item.email} • {item.phone})</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                      item.status === 'contacted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {item.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300">
                    <div><span className="text-slate-500">Audience:</span> {item.audience_type}</div>
                    <div><span className="text-slate-500">Pupils:</span> {item.pupil_count}</div>
                  </div>

                  {item.notes && (
                    <p className="text-slate-400 text-xs italic">
                      Notes: "{item.notes}"
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Requested: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                    </span>

                    <button
                      onClick={() => handleToggleQuoteStatus(item.id, item.status)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600/30 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as {item.status === 'contacted' ? 'Pending' : 'Contacted'}</span>
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB 3: Contact Us Inquiries */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          {contactInquiries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
              No contact inquiries found in database.
            </div>
          ) : (
            contactInquiries
              .filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.subject || '').toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-white font-bold text-base">{item.name}</h4>
                      <p className="text-xs text-slate-400">{item.email}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                      item.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {item.status || 'NEW'}
                    </span>
                  </div>

                  <div className="text-xs text-amber-400 font-bold">Subject: {item.subject}</div>
                  <p className="text-slate-300 text-xs bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 leading-relaxed">
                    "{item.message}"
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Received: {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                    </span>

                    <button
                      onClick={() => handleToggleInquiryStatus(item.id, item.status)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/30 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as {item.status === 'resolved' ? 'New' : 'Resolved'}</span>
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
