import React, { useState } from 'react';
import { Tag, Shield, Check, Plus, Send } from 'lucide-react';
import { submitTeamApprovalRequestToSupabase } from '../../services/supabaseService';

export default function TeamAffiliatesPanel({ save, themeMode = 'dark' }) {
  const [newCode, setNewCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [affiliateName, setAffiliateName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const isDark = themeMode === 'dark';

  // Sample default affiliates & discount codes for Team Portal
  const [affiliates] = useState([
    { id: 1, code: 'TH3ORY20', discount: '20%', affiliation: 'Direct Growth Partner', uses: 142, status: 'Active' },
    { id: 2, code: 'VIP50', discount: '50%', affiliation: 'VIP Ambassador Network', uses: 68, status: 'Active' },
    { id: 3, code: 'BEHAVIOR25', discount: '25%', affiliation: 'Cognitive Science Institute', uses: 34, status: 'Active' },
    { id: 4, code: 'OXFORD15', discount: '15%', affiliation: 'Academic Research Guild', uses: 19, status: 'Active' },
  ]);

  const handleProposeAffiliateCode = async (e) => {
    e.preventDefault();
    if (!newCode || !affiliateName) return;

    await submitTeamApprovalRequestToSupabase({
      teamMemberName: 'Team Officer',
      teamMemberEmail: 'team@th3ory.online',
      moduleType: 'affiliate_program',
      actionType: 'create_affiliate_code',
      targetId: newCode.toUpperCase(),
      proposedChanges: {
        code: newCode.toUpperCase(),
        discountPercentage: discountPercent,
        affiliationName: affiliateName,
        status: 'Active'
      }
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowCreateModal(false);
      setNewCode('');
      setAffiliateName('');
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
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-indigo-950'}`}>Affiliate Program Data Policy Active</h4>
            <p className={isDark ? 'text-slate-400' : 'text-indigo-700'}>Team members can view affiliate codes and propose new commission codes. All new codes require Admin approval.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Propose New Code</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Tag className="w-5 h-5 text-indigo-500" />
            Active Affiliate Codes ({affiliates.length})
          </h3>
          <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full uppercase border ${
            isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Team View
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase font-mono text-[10px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <th className="p-3">Coupon Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Affiliation / Partner</th>
                <th className="p-3">Redemptions</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
              {affiliates.map((a) => (
                <tr key={a.id} className={isDark ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                  <td className="p-3 font-mono font-bold text-amber-500">{a.code}</td>
                  <td className="p-3 font-bold text-emerald-600">{a.discount}</td>
                  <td className={`p-3 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.affiliation}</td>
                  <td className="p-3 font-mono text-indigo-600">{a.uses} redemptions</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose New Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Send className="w-4 h-4 text-indigo-500" />
              Propose New Affiliate Code for Admin Approval
            </h4>

            <form onSubmit={handleProposeAffiliateCode} className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Coupon Code Name</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  required
                  placeholder="e.g. PARTNER25"
                  className={`w-full border rounded-xl px-3 py-2 text-xs uppercase font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Discount Percentage (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  min={5}
                  max={90}
                  required
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Affiliate Partner Name</label>
                <input
                  type="text"
                  value={affiliateName}
                  onChange={e => setAffiliateName(e.target.value)}
                  required
                  placeholder="e.g. Cognitive Behavioral Org"
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {submissionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Submitted affiliate proposal to Admin Approval Queue!</span>
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
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Submit Code for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
