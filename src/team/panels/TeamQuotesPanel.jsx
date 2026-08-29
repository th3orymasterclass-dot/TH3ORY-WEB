import React, { useState } from 'react';
import { 
  Building2, Mail, Phone, Globe, Linkedin, User, Briefcase, 
  MapPin, Calendar, Clock, DollarSign, Percent, FileText, 
  Search, Filter, Plus, Edit3, Trash2, Eye, EyeOff, Send, 
  Check, AlertCircle, Shield, ArrowUpRight, TrendingUp, Layers, Calculator
} from 'lucide-react';
import { 
  submitTeamApprovalRequestToSupabase, 
  deleteEnterpriseQuoteFromSupabase, 
  updateEnterpriseQuoteInSupabase,
  saveEnterpriseQuoteToSupabase
} from '../../services/supabaseService';
import CalendlyModal from '../../components/CalendlyModal';
import { EnterpriseRoiCalculatorModal } from '../../components/EnterpriseRoiCalculatorModal';
import { EnterprisePdfQuoteModal } from '../../components/EnterprisePdfQuoteModal';
import { formatDualCurrency, parseCurrencyAmount } from '../../utils/currencyUtils';

export default function TeamQuotesPanel({ enterpriseQuotes = [], updateQuoteStatus, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  // Privacy Masking Toggle
  const [maskData, setMaskData] = useState(false);

  // Search and Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');

  // Modals & Active Record States
  const [inspectingQuote, setInspectingQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [calendlyQuote, setCalendlyQuote] = useState(null);
  const [roiCalculatorQuote, setRoiCalculatorQuote] = useState(null);
  const [pdfQuoteTarget, setPdfQuoteTarget] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null); // For Admin Proposal Queue
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Propose Status Change State (Team -> Admin Approval Queue)
  const [proposedStatus, setProposedStatus] = useState('In Contact');
  const [proposedNotes, setProposedNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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
    expected_revenue: '$10,000',
    remarks: ''
  });
  const [createSuccess, setCreateSuccess] = useState(false);

  // Masking helpers
  const maskEmail = (email) => {
    if (!maskData || !email) return email || 'N/A';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const maskPhone = (phone) => {
    if (!maskData || !phone) return phone || 'N/A';
    return phone.slice(0, 3) + '*****' + phone.slice(-2);
  };

  // Delete Action
  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Enterprise CRM Record?')) return;
    setDeletingId(id);
    await deleteEnterpriseQuoteFromSupabase(id);
    if (updateQuoteStatus) updateQuoteStatus(id, 'DELETED');
    setDeletingId(null);
  };

  // Open Edit Modal with all 18 fields
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

  // Save Edit Action
  const handleSaveEditQuote = async (e) => {
    e.preventDefault();
    if (!editingQuote) return;
    await updateEnterpriseQuoteInSupabase(editingQuote.id, editForm);
    if (updateQuoteStatus) updateQuoteStatus(editingQuote.id, editForm.status);
    setEditingQuote(null);
  };

  // Submit New Lead Proposal to Admin Queue
  const handleCreateNewQuoteProposal = async (e) => {
    e.preventDefault();
    if (!createForm.org_name || !createForm.email) return;

    // Save directly to Supabase Enterprise CRM and create admin approval request record
    await saveEnterpriseQuoteToSupabase(createForm);
    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'enterprise_quotes',
      actionType: 'create_enterprise_quote',
      targetId: null,
      proposedChanges: createForm
    });

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
        expected_revenue: '$10,000',
        remarks: ''
      });
    }, 2000);
  };

  // Submit Status Change Proposal to Admin Approval Queue
  const handleRequestApproval = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;

    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'enterprise_quotes',
      actionType: 'update_quote_status',
      targetId: selectedQuote.id,
      proposedChanges: {
        quoteId: selectedQuote.id,
        orgName: selectedQuote.org_name,
        contactName: selectedQuote.contact_name,
        currentStatus: selectedQuote.status || 'New Lead',
        proposedStatus: proposedStatus,
        notes: proposedNotes
      }
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedQuote(null);
    }, 2000);
  };

  // Filtered quotes based on Search and Filters
  const filteredQuotes = enterpriseQuotes.filter(q => {
    const matchesSearch = 
      (q.org_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.industry || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || (q.status || 'New Lead').toLowerCase() === statusFilter.toLowerCase();
    const matchesIndustry = industryFilter === 'ALL' || (q.industry || '').toLowerCase().includes(industryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Calculate Pipeline Metrics
  const totalPipelineRevenue = enterpriseQuotes.reduce((acc, q) => {
    const raw = (q.expected_revenue || q.budget || '0').replace(/[^0-9]/g, '');
    return acc + (parseInt(raw, 10) || 0);
  }, 0);

  const activeDealsCount = enterpriseQuotes.filter(q => (q.status || '').toLowerCase() !== 'closed lost').length;

  return (
    <div className="space-y-6">
      
      {/* CRM Overview Banner & KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total CRM Pipeline</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 mt-2">{enterpriseQuotes.length} <span className="text-xs font-normal text-slate-400">Accounts</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Active Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">${totalPipelineRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Active Deals</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{activeDealsCount} <span className="text-xs font-normal text-slate-400">Active</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Interlinked Sync</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs font-mono font-bold text-purple-400 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            Realtime Supabase DB
          </p>
        </div>
      </div>

      {/* Action Bar & Search Filters */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Company, Contact, Email, Industry, Location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border font-bold ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">All Proposal Statuses</option>
            <option value="New Lead">New Lead</option>
            <option value="In Contact">In Contact</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Under Negotiation">Under Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMaskData(m => !m)}
            className={`px-3 py-1.5 border font-bold text-xs rounded-xl flex items-center gap-1.5 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30' : 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {maskData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{maskData ? 'Masked' : 'Unmasked'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Enterprise Deal</span>
          </button>
        </div>
      </div>

      {/* Enterprise CRM Main Data Table */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Enterprise Quote CRM Records ({filteredQuotes.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full uppercase border ${
              isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              Data Access & Privacy Policy Active
            </span>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono">
            No enterprise CRM quote records found matching search filters.
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
                    
                    {/* Company, Industry, Employee Size, Location, Website */}
                    <td className="p-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{q.org_name || q.company || 'Enterprise Account'}</span>
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

                    {/* Contact Person, Designation, LinkedIn */}
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

                    {/* Email, Phone */}
                    <td className="p-3 font-mono text-[11px]">
                      <div className="text-indigo-400 font-bold">{maskEmail(q.email)}</div>
                      <div className="text-slate-400 text-[10px]">{maskPhone(q.phone)}</div>
                    </td>

                    {/* Status of Proposal */}
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                        (q.status || '').toLowerCase().includes('won') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        (q.status || '').toLowerCase().includes('proposal') ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                        (q.status || '').toLowerCase().includes('meeting') ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        (q.status || '').toLowerCase().includes('contact') ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {q.status || 'New Lead'}
                      </span>
                      {q.next_followup_at && (
                        <div className="text-[9px] text-amber-400 font-mono mt-1">Next: {q.next_followup_at}</div>
                      )}
                    </td>

                    {/* Win Probability, Expected Revenue */}
                    <td className="p-3">
                      <div className="font-extrabold text-emerald-400 text-xs font-mono">{formatDualCurrency(parseCurrencyAmount(q.expected_revenue || q.budget || 500000))}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Win Prob: <span className="text-amber-400 font-bold">{q.probability || '50%'}</span></div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Inspect All CRM Fields */}
                        <button
                          onClick={() => setInspectingQuote(q)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Inspect All CRM Fields"
                        >
                          <Eye className="w-3 h-3 text-indigo-400" />
                          <span>Inspect</span>
                        </button>

                        {/* Edit Record Modal */}
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit Full CRM Fields"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>

                        {/* Calculate ROI Button */}
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

                        {/* Schedule Meeting */}
                        <button
                          onClick={() => setCalendlyQuote(q)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Schedule Meeting via Calendly"
                        >
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span>Call</span>
                        </button>

                        {/* Delete Record */}
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          disabled={deletingId === q.id}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Delete CRM Record"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>{deletingId === q.id ? '...' : 'Del'}</span>
                        </button>

                        {/* Propose Change for Admin Approval */}
                        <button
                          onClick={() => { setSelectedQuote(q); setProposedStatus(q.status || 'In Contact'); setProposedNotes(''); }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Propose
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

      {/* ──────────────────────────────────────────────────────────────────────────
          INSPECT FULL CRM FIELDS MODAL
      ────────────────────────────────────────────────────────────────────────── */}
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
                  <h3 className="text-lg font-black text-white">{inspectingQuote.org_name || inspectingQuote.company || 'Enterprise Lead'}</h3>
                  <p className="text-xs text-indigo-400 font-mono">Enterprise Quote CRM Record Details</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingQuote(null)}
                className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* 4 CRM Data Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Card 1: Company Profile */}
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

              {/* Card 2: Contact Person */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px]">Key Contact Person</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Contact Person:</span> <strong className="text-white">{inspectingQuote.contact_name || 'N/A'}</strong></p>
                  <p><span className="text-slate-500">Designation:</span> {inspectingQuote.designation || 'Decision Maker'}</p>
                  <p><span className="text-slate-500">Email:</span> <span className="text-indigo-300">{maskEmail(inspectingQuote.email)}</span></p>
                  <p><span className="text-slate-500">Phone:</span> {maskPhone(inspectingQuote.phone)}</p>
                  <p><span className="text-slate-500">LinkedIn:</span> {inspectingQuote.linkedin_url ? <a href={inspectingQuote.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 underline">Profile Link</a> : 'N/A'}</p>
                </div>
              </div>

              {/* Card 3: Deal Parameters */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">Proposal &amp; Deal Financials</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Status of Proposal:</span> <strong className="text-amber-400">{inspectingQuote.status || 'New Lead'}</strong></p>
                  <p><span className="text-slate-500">Proposal Sent:</span> {inspectingQuote.proposal_sent || 'Pending Draft'}</p>
                  <p><span className="text-slate-500">Win Probability:</span> <span className="text-amber-300">{inspectingQuote.probability || '50%'}</span></p>
                  <p><span className="text-slate-500">Expected Revenue:</span> <strong className="text-emerald-400">{inspectingQuote.expected_revenue || inspectingQuote.budget || '$10,000'}</strong></p>
                </div>
              </div>

              {/* Card 4: Followup Timeline */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">Followup Timeline &amp; Remarks</h4>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Last Contacted:</span> {inspectingQuote.last_contacted_at || 'N/A'}</p>
                  <p><span className="text-slate-500">Next Followup:</span> {inspectingQuote.next_followup_at || 'N/A'}</p>
                  <p><span className="text-slate-500">Meeting Date:</span> {inspectingQuote.meeting_date || 'Not Scheduled'}</p>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
              <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">Internal Remarks &amp; Notes</h4>
              <p className="text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-wrap">{inspectingQuote.remarks || inspectingQuote.notes || 'No remarks recorded yet.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          EDIT FULL CRM FIELDS MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8 ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Edit Enterprise Quote Record
            </h4>

            <form onSubmit={handleSaveEditQuote} className="space-y-4 text-xs">
              
              {/* Row 1: Company & Industry & Employee Size */}
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

              {/* Row 2: Location & Website & Linkedin */}
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

              {/* Row 3: Contact Person & Designation & Email & Phone */}
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

              {/* Row 4: Status of Proposal & Probability & Expected Revenue & Proposal Sent */}
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
                    placeholder="e.g. $25,000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Proposal Sent</label>
                  <input
                    type="text"
                    value={editForm.proposal_sent}
                    onChange={e => setEditForm({ ...editForm, proposal_sent: e.target.value })}
                    placeholder="e.g. Sent on 2026-08-20"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 5: Last Contacted & Next Followup & Meeting Date */}
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

              {/* Row 6: Remarks */}
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
                  Save Enterprise CRM Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD NEW ENTERPRISE DEAL MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8 ${
            isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add New Enterprise Deal to CRM
              </h4>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded">
                REALTIME DB SYNC
              </span>
            </div>

            <form onSubmit={handleCreateNewQuoteProposal} className="space-y-4 text-xs">
              
              {/* Row 1: Company & Industry & Employee Size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={createForm.org_name}
                    onChange={e => setCreateForm({ ...createForm, org_name: e.target.value })}
                    placeholder="e.g. Acme Enterprise Corp"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Industry Field</label>
                  <input
                    type="text"
                    value={createForm.industry}
                    onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}
                    placeholder="e.g. Healthcare & Biotech"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Employee Size</label>
                  <input
                    type="text"
                    value={createForm.employee_size}
                    onChange={e => setCreateForm({ ...createForm, employee_size: e.target.value })}
                    placeholder="e.g. 500-1000 Employees"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 2: Location & Website & Linkedin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Website</label>
                  <input
                    type="text"
                    value={createForm.website}
                    onChange={e => setCreateForm({ ...createForm, website: e.target.value })}
                    placeholder="https://acme.com"
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

              {/* Row 3: Contact Person & Designation & Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={createForm.contact_name}
                    onChange={e => setCreateForm({ ...createForm, contact_name: e.target.value })}
                    placeholder="Dr. Aris Vance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={createForm.designation}
                    onChange={e => setCreateForm({ ...createForm, designation: e.target.value })}
                    placeholder="Chief Learning Officer"
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
                    placeholder="lead@acme.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 4: Status & Probability & Revenue & Proposal Sent */}
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
                    placeholder="$15,000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Proposal Sent</label>
                  <input
                    type="text"
                    value={createForm.proposal_sent}
                    onChange={e => setCreateForm({ ...createForm, proposal_sent: e.target.value })}
                    placeholder="e.g. Pending Draft"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 5: Last Contacted & Next Followup & Meeting Date */}
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

              {/* Row 6: Remarks */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Remarks &amp; Deal Takeaways</label>
                <textarea
                  value={createForm.remarks}
                  onChange={e => setCreateForm({ ...createForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Enterprise requirements, team seat count..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise Deal successfully added to CRM Database!</span>
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
                  Save &amp; Insert to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Change Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Send className="w-4 h-4 text-indigo-500" />
              Propose Deal Status Update for Admin Review
            </h4>

            <div className="p-3 rounded-xl bg-slate-950 text-xs font-mono space-y-1">
              <p><strong className="text-slate-500">Company:</strong> {selectedQuote.org_name}</p>
              <p><strong className="text-slate-500">Contact:</strong> {selectedQuote.contact_name} ({maskEmail(selectedQuote.email)})</p>
            </div>

            <form onSubmit={handleRequestApproval} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Proposed Status</label>
                <select
                  value={proposedStatus}
                  onChange={e => setProposedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="In Contact">In Contact</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Under Negotiation">Under Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Rationale / Notes</label>
                <textarea
                  value={proposedNotes}
                  onChange={e => setProposedNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes for Admin approval..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs"
                />
              </div>

              {submissionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Submitted to Admin Approval Queue!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendly Meeting Scheduler */}
      <CalendlyModal
        isOpen={Boolean(calendlyQuote)}
        onClose={() => setCalendlyQuote(null)}
        name={calendlyQuote?.contact_name || ''}
        email={calendlyQuote?.email || ''}
        title={`Schedule Meeting with ${calendlyQuote?.org_name || 'Enterprise Lead'}`}
        subtitle={`1-on-1 Strategy & Licensing Meeting (${calendlyQuote?.contact_name || 'Contact'})`}
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
