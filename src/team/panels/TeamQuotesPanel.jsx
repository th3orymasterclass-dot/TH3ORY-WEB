import React, { useState } from 'react';
import { HelpCircle, Shield, Check, Clock, AlertCircle, Eye, EyeOff, Send, Plus, Building2 } from 'lucide-react';
import { submitTeamApprovalRequestToSupabase } from '../../services/supabaseService';

export default function TeamQuotesPanel({ enterpriseQuotes = [], updateQuoteStatus, themeMode = 'dark' }) {
  const [maskData, setMaskData] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [proposedStatus, setProposedStatus] = useState('contacted');
  const [proposedNotes, setProposedNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const isDark = themeMode === 'dark';

  // New Data Entry State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBudget, setNewBudget] = useState('$5,000 - $10,000');
  const [newNotes, setNewNotes] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const maskEmail = (email) => {
    if (!maskData || !email) return email;
    const parts = email.split('@');
    if (parts.length < 2) return email;
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const maskPhone = (phone) => {
    if (!maskData || !phone) return phone || 'N/A';
    return phone.slice(0, 3) + '*****' + phone.slice(-2);
  };

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
        currentStatus: selectedQuote.status || 'pending',
        proposedStatus: proposedStatus,
        notes: proposedNotes
      }
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedQuote(null);
    }, 2500);
  };

  const handleCreateNewQuoteProposal = async (e) => {
    e.preventDefault();
    if (!newOrgName || !newEmail) return;

    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'enterprise_quotes',
      actionType: 'create_enterprise_quote',
      targetId: null,
      proposedChanges: {
        org_name: newOrgName,
        contact_name: newContactName || 'N/A',
        email: newEmail,
        phone: newPhone || 'N/A',
        budget: newBudget,
        notes: newNotes || 'Added via Team Portal New Lead Entry',
        status: 'pending'
      }
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setShowCreateModal(false);
      setNewOrgName('');
      setNewContactName('');
      setNewEmail('');
      setNewPhone('');
      setNewNotes('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Policy Header Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        isDark ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-5 h-5 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div className="text-xs">
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-indigo-950'}`}>Data Access & Privacy Policy Active</h4>
            <p className={isDark ? 'text-slate-400' : 'text-indigo-700'}>Add new leads or propose status updates. All new data entries require primary Admin Portal approval supervision.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Lead</span>
          </button>

          <button
            onClick={() => setMaskData(m => !m)}
            className={`px-3 py-1.5 border font-bold text-xs rounded-xl flex items-center gap-1.5 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30' : 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200 shadow-xs'
            }`}
          >
            {maskData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{maskData ? 'Masked' : 'Unmasked'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Enterprise Licensing Quotes ({enterpriseQuotes.length})
          </h3>
          <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full uppercase border ${
            isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Team View
          </span>
        </div>

        {enterpriseQuotes.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-mono">
            No enterprise quote submissions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b uppercase font-mono text-[10px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {enterpriseQuotes.map((q) => (
                  <tr key={q.id} className={isDark ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className={`p-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.org_name}</td>
                    <td className="p-3">{q.contact_name || 'N/A'}</td>
                    <td className="p-3 font-mono text-indigo-600 font-semibold">{maskEmail(q.email)}</td>
                    <td className="p-3 font-mono">{maskPhone(q.phone)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        q.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' :
                        q.status === 'contacted' ? 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-600 border-amber-500/30'
                      }`}>
                        {q.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => { setSelectedQuote(q); setProposedStatus(q.status || 'contacted'); setProposedNotes(''); }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Submit Change
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW ENTERPRISE LEAD MODAL (SUPERVISED BY ADMIN APPROVAL) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Building2 className="w-4 h-4 text-emerald-500" />
                Add New Enterprise Lead (Admin Supervised)
              </h4>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 border border-amber-500/30 text-[10px] font-mono font-bold rounded">
                REQUIRES APPROVAL
              </span>
            </div>

            <form onSubmit={handleCreateNewQuoteProposal} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Organization / Enterprise Name *</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  required
                  placeholder="e.g. Stanford Behavioral Health"
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Contact Person</label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    placeholder="e.g. Dr. Aris Thorne"
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estimated Budget</label>
                  <select
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000+">$25,000+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Email Address *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    placeholder="contact@org.com"
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Initial Lead Notes</label>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Details regarding team size, requirements..."
                  className={`w-full border rounded-xl p-3 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Submitted new lead creation to Admin Approval Queue!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-3 py-1.5 font-bold text-xs rounded-xl ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Submit New Data for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Proposal Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Send className="w-4 h-4 text-indigo-500" />
              Propose Quote Update for Admin Approval
            </h4>

            <div className={`p-3 rounded-xl text-xs space-y-1 font-mono ${
              isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'
            }`}>
              <p><strong className="text-slate-500">Org:</strong> {selectedQuote.org_name}</p>
              <p><strong className="text-slate-500">Contact:</strong> {selectedQuote.contact_name} ({maskEmail(selectedQuote.email)})</p>
            </div>

            <form onSubmit={handleRequestApproval} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Proposed Status</label>
                <select
                  value={proposedStatus}
                  onChange={e => setProposedStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="contacted">Mark as Contacted</option>
                  <option value="in_discussion">In Discussion</option>
                  <option value="approved">Approve Quote</option>
                  <option value="declined">Decline Quote</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Team Notes / Rationale</label>
                <textarea
                  value={proposedNotes}
                  onChange={e => setProposedNotes(e.target.value)}
                  rows={3}
                  placeholder="Explain why this status update should be approved by Admin..."
                  className={`w-full border rounded-xl p-3 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {submissionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Submitted to Admin Approval Queue!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
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
                  Submit to Admin Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
