import React, { useState } from 'react';
import { Mail, Shield, Check, Eye, EyeOff, Send, MessageSquare, Plus } from 'lucide-react';
import { submitTeamApprovalRequestToSupabase } from '../../services/supabaseService';

export default function TeamInquiriesPanel({ contactInquiries = [], themeMode = 'dark' }) {
  const [maskData, setMaskData] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [proposedReply, setProposedReply] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const isDark = themeMode === 'dark';

  // New Inbound Inquiry Entry State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const maskEmail = (email) => {
    if (!maskData || !email) return email;
    const parts = email.split('@');
    if (parts.length < 2) return email;
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const handleRequestReplyApproval = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !proposedReply) return;

    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'contact_inquiries',
      actionType: 'reply_inquiry',
      targetId: selectedInquiry.id,
      proposedChanges: {
        inquiryId: selectedInquiry.id,
        senderName: selectedInquiry.name,
        senderEmail: selectedInquiry.email,
        subject: selectedInquiry.subject || 'General Inquiry',
        message: selectedInquiry.message,
        proposedReply: proposedReply
      }
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedInquiry(null);
      setProposedReply('');
    }, 2500);
  };

  const handleCreateInquiryProposal = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newMessage) return;

    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'contact_inquiries',
      actionType: 'create_contact_inquiry',
      targetId: null,
      proposedChanges: {
        name: newName,
        email: newEmail,
        subject: newSubject || 'General Support Inquiry',
        message: newMessage,
        status: 'new'
      }
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewSubject('');
      setNewMessage('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        isDark ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-5 h-5 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <div className="text-xs">
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-indigo-950'}`}>Contact Inquiries Data Policy Active</h4>
            <p className={isDark ? 'text-slate-400' : 'text-indigo-700'}>Record new inbound support tickets or draft replies. All new inquiries require Admin approval supervision.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Inquiry</span>
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
            <Mail className="w-5 h-5 text-indigo-500" />
            Contact Us Submissions ({contactInquiries.length})
          </h3>
          <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full uppercase border ${
            isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Team View
          </span>
        </div>

        {contactInquiries.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-mono">
            No contact inquiries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b uppercase font-mono text-[10px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Message Snippet</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {contactInquiries.map((inq) => (
                  <tr key={inq.id} className={isDark ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className={`p-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inq.name}</td>
                    <td className="p-3 font-mono text-indigo-600 font-semibold">{maskEmail(inq.email)}</td>
                    <td className="p-3 font-semibold">{inq.subject || 'General Inquiry'}</td>
                    <td className="p-3 truncate max-w-xs">{inq.message}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => { setSelectedInquiry(inq); setProposedReply(''); }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Draft Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD NEW INBOUND INQUIRY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Mail className="w-4 h-4 text-emerald-500" />
                Record Inbound Contact Inquiry (Admin Supervised)
              </h4>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 border border-amber-500/30 text-[10px] font-mono font-bold rounded">
                REQUIRES APPROVAL
              </span>
            </div>

            <form onSubmit={handleCreateInquiryProposal} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sender Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Elena Rostova"
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sender Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    placeholder="elena@domain.com"
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Subject Header</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Masterclass Curriculum Inquiry"
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inquiry Message *</label>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe the inquiry or support request message..."
                  className={`w-full border rounded-xl p-3 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Submitted inbound inquiry to Admin Approval Queue!</span>
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
                  Submit Inquiry for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Proposal Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Propose Inquiry Response for Admin Approval
            </h4>

            <div className={`p-3 rounded-xl text-xs space-y-1.5 ${
              isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'
            }`}>
              <p><strong className="text-slate-500">From:</strong> {selectedInquiry.name} ({maskEmail(selectedInquiry.email)})</p>
              <p><strong className="text-slate-500">Subject:</strong> {selectedInquiry.subject || 'General Inquiry'}</p>
              <p className={`italic p-2 rounded border text-xs ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
              }`}>"{selectedInquiry.message}"</p>
            </div>

            <form onSubmit={handleRequestReplyApproval} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Proposed Team Reply Message</label>
                <textarea
                  value={proposedReply}
                  onChange={e => setProposedReply(e.target.value)}
                  rows={4}
                  required
                  placeholder="Type official response to sender..."
                  className={`w-full border rounded-xl p-3 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {submissionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Submitted reply to Admin Approval Queue!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
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
                  Submit Reply to Admin Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
