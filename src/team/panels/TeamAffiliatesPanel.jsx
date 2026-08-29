import React, { useState, useEffect } from 'react';
import { Tag, Shield, Check, Plus, Send, Calendar, Users, Eye, Mail, Phone, ExternalLink, Sparkles, Edit3, Trash2 } from 'lucide-react';
import { submitTeamApprovalRequestToSupabase, fetchAllAffiliateApplicationsFromSupabase, deleteAffiliateApplicationFromSupabase, updateAffiliateApplicationInSupabase } from '../../services/supabaseService';
import CalendlyModal from '../../components/CalendlyModal';

export default function TeamAffiliatesPanel({ save, themeMode = 'dark' }) {
  const [newCode, setNewCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [affiliateName, setAffiliateName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  // Affiliate Partner Applications State
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', website_or_channel: '', audience_size: '', promotion_strategy: '' });
  const [deletingId, setDeletingId] = useState(null);

  const isDark = themeMode === 'dark';

  const handleDeleteAffiliateApp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this affiliate application record?')) return;
    setDeletingId(id);
    await deleteAffiliateApplicationFromSupabase(id);
    setApplications(prev => prev.filter(a => (a.id || a.app_id) !== id));
    setDeletingId(null);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setEditForm({
      name: app.name || '',
      email: app.email || '',
      phone: app.phone || '',
      website_or_channel: app.website_or_channel || '',
      audience_size: app.audience_size || '5,000 - 25,000',
      promotion_strategy: app.promotion_strategy || ''
    });
  };

  const handleSaveEditApp = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    const appId = editingApp.id || editingApp.app_id;
    await updateAffiliateApplicationInSupabase(appId, editForm);
    setApplications(prev => prev.map(a => ((a.id || a.app_id) === appId ? { ...a, ...editForm } : a)));
    setEditingApp(null);
  };

  // Sample default active discount codes
  const [affiliates] = useState([
    { id: 1, code: 'TH3ORY20', discount: '20%', affiliation: 'Direct Growth Partner', uses: 142, status: 'Active' },
    { id: 2, code: 'VIP50', discount: '50%', affiliation: 'VIP Ambassador Network', uses: 68, status: 'Active' },
    { id: 3, code: 'BEHAVIOR25', discount: '25%', affiliation: 'Cognitive Science Institute', uses: 34, status: 'Active' },
    { id: 4, code: 'OXFORD15', discount: '15%', affiliation: 'Academic Research Guild', uses: 19, status: 'Active' },
  ]);

  const loadAffiliateApplications = async () => {
    setLoadingApps(true);
    try {
      const data = await fetchAllAffiliateApplicationsFromSupabase();
      setApplications(data || []);
    } catch (err) {
      console.warn('Error fetching affiliate applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadAffiliateApplications();
  }, []);

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
      {/* Top Action Bar */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsCalendlyOpen(true)}
          className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Schedule Partner Call</span>
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Propose New Code</span>
        </button>
      </div>

      {/* SECTION 1: AFFILIATE PARTNER FORM APPLICATIONS INTAKE */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-5 h-5 text-emerald-500" />
              Affiliate Partner Form Applications ({applications.length})
            </h3>
            <p className="text-xs text-slate-400">All inbound partner recruitment form submissions with full applicant details.</p>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full uppercase border ${
            isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Form Details Live Access
          </span>
        </div>

        {loadingApps ? (
          <div className="text-center py-6 text-xs text-slate-400">Loading affiliate application form submissions...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 space-y-1">
            <p>No affiliate applications submitted yet.</p>
            <p className="text-[11px] text-slate-500">Inbound applications from #affiliate will appear here with full contact details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b uppercase font-mono text-[10px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="p-3">App ID</th>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Contact Details</th>
                  <th className="p-3">Channel / Website</th>
                  <th className="p-3">Audience</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {applications.map((app) => (
                  <tr key={app.id || app.app_id} className={`hover:bg-slate-800/30 transition-colors ${
                    isDark ? '' : 'hover:bg-slate-50'
                  }`}>
                    <td className="p-3 font-mono font-bold text-amber-400">{app.app_id || app.id}</td>
                    <td className="p-3 font-bold text-white">{app.name}</td>
                    <td className="p-3 text-slate-300">
                      <div>{app.email}</div>
                      <div className="text-[11px] text-slate-400">{app.phone || 'No phone'}</div>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                      {app.website_or_channel ? (
                        <a href={app.website_or_channel} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                          <span>{app.website_or_channel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="p-3 font-mono text-[#FFC857]">{app.audience_size || 'N/A'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(app)}
                          className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAffiliateApp(app.id || app.app_id)}
                          disabled={deletingId === (app.id || app.app_id)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{deletingId === (app.id || app.app_id) ? '...' : 'Delete'}</span>
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

      {/* SECTION 2: ACTIVE DISCOUNT CODES TABLE */}
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
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {affiliates.map(a => (
                <tr key={a.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                  <td className="p-3 font-mono font-bold text-amber-400">{a.code}</td>
                  <td className="p-3 font-bold">{a.discount}</td>
                  <td className="p-3 text-slate-300">{a.affiliation}</td>
                  <td className="p-3 font-mono text-slate-400">{a.uses} redeemed</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL FORM DETAILS MODAL FOR AFFILIATE APPLICANT */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">{selectedApp.app_id}</span>
                <h3 className="text-xl font-bold font-heading">Affiliate Form Details</h3>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Applicant Name</span>
                  <strong className="text-sm text-white">{selectedApp.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Audience Size</span>
                  <strong className="text-sm text-amber-400 font-mono">{selectedApp.audience_size || 'N/A'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Email Address</span>
                  <strong className="text-xs text-slate-200 select-all">{selectedApp.email}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Phone / WhatsApp</span>
                  <strong className="text-xs text-slate-200 select-all">{selectedApp.phone || 'N/A'}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Channel / Website URL</span>
                <a href={selectedApp.website_or_channel} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-xs break-all mt-0.5">
                  <span>{selectedApp.website_or_channel || 'N/A'}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Promotion Strategy / Notes</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed mt-1">
                  {selectedApp.promotion_strategy || 'No notes provided.'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Submission Timestamp</span>
                <span className="text-slate-400 font-mono text-[11px]">{new Date(selectedApp.created_at || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setIsCalendlyOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Partner Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSE NEW CODE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold font-heading">Propose New Affiliate Code</h3>
            
            {submissionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
                ✓ Proposal submitted to primary admins for approval!
              </div>
            ) : (
              <form onSubmit={handleProposeAffiliateCode} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Affiliate / Partner Name</label>
                  <input 
                    type="text" 
                    required 
                    value={affiliateName} 
                    onChange={e => setAffiliateName(e.target.value)} 
                    placeholder="E.g. Oxford Psychology Club" 
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Coupon Code</label>
                  <input 
                    type="text" 
                    required 
                    value={newCode} 
                    onChange={e => setNewCode(e.target.value.toUpperCase())} 
                    placeholder="OXFORD15" 
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="50" 
                    value={discountPercent} 
                    onChange={e => setDiscountPercent(Number(e.target.value))} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT AFFILIATE APPLICATION MODAL */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              Edit Affiliate Applicant Record
            </h3>

            <form onSubmit={handleSaveEditApp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Applicant Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Audience Size</label>
                  <select
                    value={editForm.audience_size}
                    onChange={e => setEditForm({ ...editForm, audience_size: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1,000 - 5,000">1,000 - 5,000</option>
                    <option value="5,000 - 25,000">5,000 - 25,000</option>
                    <option value="25,000 - 100,000">25,000 - 100,000</option>
                    <option value="100,000+">100,000+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase">Website / Channel URL</label>
                <input
                  type="url"
                  value={editForm.website_or_channel}
                  onChange={e => setEditForm({ ...editForm, website_or_channel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase">Promotion Strategy / Notes</label>
                <textarea
                  value={editForm.promotion_strategy}
                  onChange={e => setEditForm({ ...editForm, promotion_strategy: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Save Record Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCalendlyOpen && <CalendlyModal isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />}
    </div>
  );
}
