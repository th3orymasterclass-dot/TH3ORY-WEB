import React, { useState } from 'react';
import { 
  HelpCircle, Building2, Mail, CheckCircle2, Clock, MessageSquare, 
  Search, Send, User, ChevronRight, PlusCircle, Trash2, Calendar, 
  Globe, Linkedin, Edit3, Eye, Plus, Shield, TrendingUp, DollarSign, Calculator
} from 'lucide-react';
import { 
  saveEnterpriseQuoteToSupabase, 
  deleteEnterpriseQuoteFromSupabase, 
  updateEnterpriseQuoteInSupabase 
} from '../../services/supabaseService';
import CalendlyModal from '../../components/CalendlyModal';
import { EnterpriseRoiCalculatorModal } from '../../components/EnterpriseRoiCalculatorModal';
import { EnterprisePdfQuoteModal } from '../../components/EnterprisePdfQuoteModal';
import { formatDualCurrency, parseCurrencyAmount } from '../../utils/currencyUtils';

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
  const [calendlyTarget, setCalendlyTarget] = useState(null);
  const [roiCalculatorQuote, setRoiCalculatorQuote] = useState(null);
  const [pdfQuoteTarget, setPdfQuoteTarget] = useState(null);

  // CRM Modals State (Admin Portal)
  const [inspectingQuote, setInspectingQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Edit Form State (All 18 Fields)
  const [editForm, setEditForm] = useState({
    org_name: '',
    industry: '',
    employee_size: '',
    location: '',
    website: '',
    contact_name: '',
    designation: '',
    email: '',
    phone: '',
    linkedin_url: '',
    status: 'New Lead',
    last_contacted_at: '',
    next_followup_at: '',
    proposal_sent: 'Pending Draft',
    meeting_date: '',
    probability: '50%',
    expected_revenue: '',
    remarks: ''
  });

  // Create Form State (All 18 Fields)
  const [createForm, setCreateForm] = useState({
    org_name: '',
    industry: 'Technology & Cloud',
    employee_size: '50-250 Employees',
    location: '',
    website: '',
    contact_name: '',
    designation: '',
    email: '',
    phone: '',
    linkedin_url: '',
    status: 'New Lead',
    last_contacted_at: new Date().toISOString().split('T')[0],
    next_followup_at: '',
    proposal_sent: 'Pending Draft',
    meeting_date: '',
    probability: '50%',
    expected_revenue: '$15,000',
    remarks: ''
  });
  const [createSuccess, setCreateSuccess] = useState(false);

  const isDark = themeMode === 'dark';

  const handleAddSampleQuote = async () => {
    setIsSubmittingSample(true);
    const sampleQuote = {
      orgName: `Aura Global Corp #${Math.floor(100 + Math.random() * 900)}`,
      industry: 'SaaS & Enterprise Technology',
      employeeSize: '250-1,000 Employees',
      location: 'New York, USA',
      website: 'https://auraglobal.io',
      contactName: 'Sarah Jenkins',
      designation: 'VP of Talent & Leadership Development',
      email: `sarah.j.${Math.floor(100 + Math.random() * 900)}@auraglobal.io`,
      phone: '+1 (555) 432-8901',
      linkedinUrl: 'https://linkedin.com/in/sarahjenkins',
      status: 'New Lead',
      lastContactedAt: new Date().toISOString().split('T')[0],
      nextFollowupAt: '',
      proposalSent: 'Pending Draft',
      meetingDate: '',
      probability: '50%',
      expectedRevenue: '$25,000',
      remarks: 'Interested in executive leadership coaching for 250 senior product managers.'
    };
    await saveEnterpriseQuoteToSupabase(sampleQuote);
    setIsSubmittingSample(false);
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Enterprise CRM Record?')) return;
    setDeletingId(id);
    await deleteEnterpriseQuoteFromSupabase(id);
    if (updateQuoteStatus) updateQuoteStatus(id, 'DELETED');
    setDeletingId(null);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuote(q);
    setEditForm({
      org_name: q.org_name || q.company || '',
      industry: q.industry || 'Technology & Services',
      employee_size: q.employee_size || '50-250 Employees',
      location: q.location || '',
      website: q.website || '',
      contact_name: q.contact_name || '',
      designation: q.designation || '',
      email: q.email || '',
      phone: q.phone || '',
      linkedin_url: q.linkedin_url || '',
      status: q.status || 'New Lead',
      last_contacted_at: q.last_contacted_at || new Date().toISOString().split('T')[0],
      next_followup_at: q.next_followup_at || '',
      proposal_sent: q.proposal_sent || 'Pending Draft',
      meeting_date: q.meeting_date || '',
      probability: q.probability || '50%',
      expected_revenue: q.expected_revenue || q.budget || '$10,000',
      remarks: q.remarks || q.notes || ''
    });
  };

  const handleSaveEditQuote = async (e) => {
    e.preventDefault();
    if (!editingQuote) return;
    await updateEnterpriseQuoteInSupabase(editingQuote.id, editForm);
    if (updateQuoteStatus) updateQuoteStatus(editingQuote.id, editForm.status);
    setEditingQuote(null);
  };

  const handleCreateNewQuote = async (e) => {
    e.preventDefault();
    if (!createForm.org_name || !createForm.email) return;
    await saveEnterpriseQuoteToSupabase(createForm);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setShowCreateModal(false);
      setCreateForm({
        org_name: '',
        industry: 'Technology & Cloud',
        employee_size: '50-250 Employees',
        location: '',
        website: '',
        contact_name: '',
        designation: '',
        email: '',
        phone: '',
        linkedin_url: '',
        status: 'New Lead',
        last_contacted_at: new Date().toISOString().split('T')[0],
        next_followup_at: '',
        proposal_sent: 'Pending Draft',
        meeting_date: '',
        probability: '50%',
        expected_revenue: '$15,000',
        remarks: ''
      });
    }, 1500);
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
    (q.question || q.message || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.studentName || q.studentEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuotes = enterpriseQuotes.filter(q =>
    (q.org_name || q.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (q.designation || '').toLowerCase().includes(search.toLowerCase())
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
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enterprise CRM &amp; Student Inquiries</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Executive management suite for student queries, public contact messages, and 18-field B2B Enterprise CRM quotes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all records..."
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
          <span>Enterprise Quotes CRM ({enterpriseQuotes.length})</span>
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
                  <p className="leading-relaxed">{q.question || q.message}</p>
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
                        onClick={() => setCalendlyTarget({ name: q.studentName, email: q.studentEmail, title: `Mentorship Call with ${q.studentName || 'Student'}` })}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        title="Initiate Calendly Call with Student"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Schedule Call</span>
                      </button>

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
                        <span>Send Reply &amp; Mark Answered</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: ENTERPRISE QUOTES CRM (ADMIN PORTAL) ─────────────────────── */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Enterprise Quote CRM — All 18 Fields Configured</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSampleQuote}
                disabled={isSubmittingSample}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmittingSample ? 'Generating...' : '+ Add Sample Deal'}</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Enterprise Deal</span>
              </button>
            </div>
          </div>

          <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                No enterprise quote submissions found matching search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b uppercase font-mono text-[10px] ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <th className="p-3">Company &amp; Industry</th>
                      <th className="p-3">Contact &amp; Role</th>
                      <th className="p-3">Email &amp; Phone</th>
                      <th className="p-3">Status of Proposal</th>
                      <th className="p-3">Win Prob / Revenue</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        
                        {/* Company & Industry */}
                        <td className="p-3">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{q.org_name || q.company || 'Enterprise Lead'}</span>
                            {q.website && (
                              <a href={q.website.startsWith('http') ? q.website : `https://${q.website}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                <Globe className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{q.industry || 'Tech & Services'}</span>
                            {q.employee_size && <span>• {q.employee_size}</span>}
                            {q.location && <span>• 📍 {q.location}</span>}
                          </div>
                        </td>

                        {/* Contact Person & Designation */}
                        <td className="p-3">
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>{q.contact_name || 'Executive Contact'}</span>
                            {q.linkedin_url && (
                              <a href={q.linkedin_url.startsWith('http') ? q.linkedin_url : `https://${q.linkedin_url}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{q.designation || 'Decision Maker'}</div>
                        </td>

                        {/* Email & Phone */}
                        <td className="p-3 font-mono text-[11px]">
                          <div className="text-indigo-400 font-bold">{q.email}</div>
                          <div className="text-slate-400 text-[10px]">{q.phone || 'N/A'}</div>
                        </td>

                        {/* Status of Proposal */}
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            (q.status || '').toLowerCase().includes('won') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                            (q.status || '').toLowerCase().includes('proposal') ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                            (q.status || '').toLowerCase().includes('meeting') ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {q.status || 'New Lead'}
                          </span>
                          {q.next_followup_at && (
                            <div className="text-[9px] text-amber-400 font-mono mt-1">Next: {q.next_followup_at}</div>
                          )}
                        </td>

                        {/* Win Probability & Expected Revenue */}
                        <td className="p-3">
                          <div className="font-extrabold text-emerald-400 text-xs font-mono">{formatDualCurrency(parseCurrencyAmount(q.expected_revenue || q.budget || 500000))}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Win Prob: <span className="text-amber-400 font-bold">{q.probability || '50%'}</span></div>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Inspect */}
                            <button
                              onClick={() => setInspectingQuote(q)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Inspect All CRM Fields"
                            >
                              <Eye className="w-3 h-3 text-indigo-400" />
                              <span>Inspect</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(q)}
                              className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit All CRM Fields"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-400" />
                              <span>Edit</span>
                            </button>

                            {/* Calculate Enterprise ROI */}
                            <button
                              onClick={() => setRoiCalculatorQuote(q)}
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Calculate Enterprise ROI & Quote"
                            >
                              <Calculator className="w-3 h-3 text-emerald-400" />
                              <span>ROI Calc</span>
                            </button>

                            {/* PDF Quote Generator & Email Dispatch */}
                            <button
                              onClick={() => setPdfQuoteTarget(q)}
                              className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Generate & Email Downloadable PDF Quote"
                            >
                              <FileText className="w-3 h-3 text-purple-400" />
                              <span>PDF Quote</span>
                            </button>

                            {/* Schedule Call */}
                            <button
                              onClick={() => setCalendlyTarget({ name: q.contact_name, email: q.email, title: `Enterprise Meeting with ${q.org_name}` })}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Schedule Call"
                            >
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>Call</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQuote(q.id)}
                              disabled={deletingId === q.id}
                              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400" />
                              <span>{deletingId === q.id ? '...' : 'Del'}</span>
                            </button>

                          </div>
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

      {/* INSPECT ALL CRM FIELDS MODAL (ADMIN PORTAL) */}
      {inspectingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl p-6 max-w-3xl w-full space-y-6 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{inspectingQuote.org_name || inspectingQuote.company || 'Enterprise Account'}</h3>
                  <p className="text-xs text-indigo-400 font-mono">Executive CRM Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingQuote(null)}
                className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px]">Company Profile</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Company:</span> <strong className="text-white">{inspectingQuote.org_name || 'N/A'}</strong></p>
                  <p><span className="text-slate-500">Industry Field:</span> {inspectingQuote.industry || 'Technology & Services'}</p>
                  <p><span className="text-slate-500">Employee Size:</span> {inspectingQuote.employee_size || '50-250 Employees'}</p>
                  <p><span className="text-slate-500">Location:</span> {inspectingQuote.location || 'N/A'}</p>
                  <p><span className="text-slate-500">Website:</span> {inspectingQuote.website ? <a href={inspectingQuote.website} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{inspectingQuote.website}</a> : 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px]">Key Contact Person</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Contact Person:</span> <strong className="text-white">{inspectingQuote.contact_name || 'N/A'}</strong></p>
                  <p><span className="text-slate-500">Designation:</span> {inspectingQuote.designation || 'Decision Maker'}</p>
                  <p><span className="text-slate-500">Email:</span> <span className="text-indigo-300">{inspectingQuote.email}</span></p>
                  <p><span className="text-slate-500">Phone:</span> {inspectingQuote.phone || 'N/A'}</p>
                  <p><span className="text-slate-500">LinkedIn:</span> {inspectingQuote.linkedin_url ? <a href={inspectingQuote.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 underline">Profile Link</a> : 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">Proposal &amp; Deal Financials</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Status of Proposal:</span> <strong className="text-amber-400">{inspectingQuote.status || 'New Lead'}</strong></p>
                  <p><span className="text-slate-500">Proposal Sent:</span> {inspectingQuote.proposal_sent || 'Pending Draft'}</p>
                  <p><span className="text-slate-500">Win Probability:</span> <span className="text-amber-300">{inspectingQuote.probability || '50%'}</span></p>
                  <p><span className="text-slate-500">Expected Revenue:</span> <strong className="text-emerald-400">{inspectingQuote.expected_revenue || inspectingQuote.budget || '$10,000'}</strong></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">Followup Timeline &amp; Remarks</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Last Contacted:</span> {inspectingQuote.last_contacted_at || 'N/A'}</p>
                  <p><span className="text-slate-500">Next Followup:</span> {inspectingQuote.next_followup_at || 'N/A'}</p>
                  <p><span className="text-slate-500">Meeting Date:</span> {inspectingQuote.meeting_date || 'Not Scheduled'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
              <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">Internal Remarks &amp; Notes</h4>
              <p className="text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-wrap">{inspectingQuote.remarks || inspectingQuote.notes || 'No remarks recorded yet.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ALL CRM FIELDS MODAL (ADMIN PORTAL) */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8 ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Edit Enterprise CRM Quote Record (Admin Executive Mode)
            </h4>

            <form onSubmit={handleSaveEditQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={editForm.org_name}
                    onChange={e => setEditForm({ ...editForm, org_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Industry Field</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Employee Size</label>
                  <input
                    type="text"
                    value={editForm.employee_size}
                    onChange={e => setEditForm({ ...editForm, employee_size: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={editForm.linkedin_url}
                    onChange={e => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editForm.contact_name}
                    onChange={e => setEditForm({ ...editForm, contact_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={e => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status of Proposal</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="In Contact">In Contact</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Probability</label>
                  <select
                    value={editForm.probability}
                    onChange={e => setEditForm({ ...editForm, probability: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="10%">10% (Cold)</option>
                    <option value="25%">25% (Qualified)</option>
                    <option value="50%">50% (Proposal)</option>
                    <option value="75%">75% (Negotiation)</option>
                    <option value="90%">90% (Verbal Committed)</option>
                    <option value="100%">100% (Closed Won)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Expected Revenue</label>
                  <input
                    type="text"
                    value={editForm.expected_revenue}
                    onChange={e => setEditForm({ ...editForm, expected_revenue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Proposal Sent</label>
                  <input
                    type="text"
                    value={editForm.proposal_sent}
                    onChange={e => setEditForm({ ...editForm, proposal_sent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Last Contacted</label>
                  <input
                    type="date"
                    value={editForm.last_contacted_at}
                    onChange={e => setEditForm({ ...editForm, last_contacted_at: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Next Followup</label>
                  <input
                    type="date"
                    value={editForm.next_followup_at}
                    onChange={e => setEditForm({ ...editForm, next_followup_at: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meeting Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.meeting_date}
                    onChange={e => setEditForm({ ...editForm, meeting_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Remarks &amp; Notes</label>
                <textarea
                  value={editForm.remarks}
                  onChange={e => setEditForm({ ...editForm, remarks: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Save Enterprise Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW DEAL MODAL (ADMIN PORTAL) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8 ${
            isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-200'
          }`}>
            <h4 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-5 h-5 text-emerald-400" />
              Create New Enterprise CRM Deal
            </h4>

            <form onSubmit={handleCreateNewQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={createForm.org_name}
                    onChange={e => setCreateForm({ ...createForm, org_name: e.target.value })}
                    placeholder="Company Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Industry Field</label>
                  <input
                    type="text"
                    value={createForm.industry}
                    onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}
                    placeholder="Industry"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Employee Size</label>
                  <input
                    type="text"
                    value={createForm.employee_size}
                    onChange={e => setCreateForm({ ...createForm, employee_size: e.target.value })}
                    placeholder="Employee Size"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="City / Country"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Website</label>
                  <input
                    type="text"
                    value={createForm.website}
                    onChange={e => setCreateForm({ ...createForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={createForm.linkedin_url}
                    onChange={e => setCreateForm({ ...createForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={createForm.contact_name}
                    onChange={e => setCreateForm({ ...createForm, contact_name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={createForm.designation}
                    onChange={e => setCreateForm({ ...createForm, designation: e.target.value })}
                    placeholder="Job Title"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status of Proposal</label>
                  <select
                    value={createForm.status}
                    onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="In Contact">In Contact</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Probability</label>
                  <select
                    value={createForm.probability}
                    onChange={e => setCreateForm({ ...createForm, probability: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="10%">10% (Cold)</option>
                    <option value="25%">25% (Qualified)</option>
                    <option value="50%">50% (Proposal)</option>
                    <option value="75%">75% (Negotiation)</option>
                    <option value="90%">90% (Verbal Committed)</option>
                    <option value="100%">100% (Closed Won)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Expected Revenue</label>
                  <input
                    type="text"
                    value={createForm.expected_revenue}
                    onChange={e => setCreateForm({ ...createForm, expected_revenue: e.target.value })}
                    placeholder="$25,000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Proposal Sent</label>
                  <input
                    type="text"
                    value={createForm.proposal_sent}
                    onChange={e => setCreateForm({ ...createForm, proposal_sent: e.target.value })}
                    placeholder="Pending Draft"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Last Contacted</label>
                  <input
                    type="date"
                    value={createForm.last_contacted_at}
                    onChange={e => setCreateForm({ ...createForm, last_contacted_at: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Next Followup</label>
                  <input
                    type="date"
                    value={createForm.next_followup_at}
                    onChange={e => setCreateForm({ ...createForm, next_followup_at: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meeting Date</label>
                  <input
                    type="datetime-local"
                    value={createForm.meeting_date}
                    onChange={e => setCreateForm({ ...createForm, meeting_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Remarks &amp; Deal Takeaways</label>
                <textarea
                  value={createForm.remarks}
                  onChange={e => setCreateForm({ ...createForm, remarks: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise Deal inserted into CRM Database!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Save &amp; Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendly Initiated Meeting Modal */}
      <CalendlyModal
        isOpen={Boolean(calendlyTarget)}
        onClose={() => setCalendlyTarget(null)}
        name={calendlyTarget?.name || ''}
        email={calendlyTarget?.email || ''}
        title={calendlyTarget?.title || 'Initiate Live Meeting'}
        subtitle="1-on-1 Calendly Consultation"
      />

      {/* Enterprise ROI Calculator & Financial Modeling System */}
      <EnterpriseRoiCalculatorModal
        isOpen={Boolean(roiCalculatorQuote)}
        onClose={() => setRoiCalculatorQuote(null)}
        initialQuoteData={roiCalculatorQuote}
        onSaveToDeal={async (updatedDeal) => {
          await updateEnterpriseQuoteInSupabase(updatedDeal.id, updatedDeal);
          if (updateQuoteStatus) updateQuoteStatus(updatedDeal.id, updatedDeal.status);
        }}
        themeMode={themeMode}
      />

      {/* Enterprise Downloadable & Email Linked PDF Quote Modal */}
      <EnterprisePdfQuoteModal
        isOpen={Boolean(pdfQuoteTarget)}
        onClose={() => setPdfQuoteTarget(null)}
        quoteData={pdfQuoteTarget}
        themeMode={themeMode}
      />
    </div>
  );
}
