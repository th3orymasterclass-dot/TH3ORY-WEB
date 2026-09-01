import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, KeyRound, Plus, Edit3, Trash2, CheckCircle2, 
  XCircle, RefreshCw, Mail, Phone, Building2, Award, Copy, Check,
  Search, Filter, ExternalLink, Sparkles
} from 'lucide-react';
import { 
  fetchAllTeamMembersFromSupabase, 
  saveTeamMemberRegistrationToSupabase, 
  updateTeamMemberInSupabase, 
  deleteTeamMemberFromSupabase 
} from '../../services/supabaseService';
import ActionDropdown from '../../components/ActionDropdown';
import ProfileAvatar from '../../components/ProfileAvatar';
import { getTeamMemberAvatar } from '../../utils/profileStorageEngine';

export default function TeamManagementPanel({ themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Enterprise Outreach Lead',
    department: 'Enterprise & B2B',
    passcode: 'TEAM2026',
    repCode: '',
    customQuote: '',
    status: 'ACTIVE'
  });

  const loadMembers = async () => {
    setLoading(true);
    const data = await fetchAllTeamMembersFromSupabase();
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
    const handleUpdate = () => loadMembers();
    window.addEventListener('th3ory_team_members_change', handleUpdate);
    return () => window.removeEventListener('th3ory_team_members_change', handleUpdate);
  }, []);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const memberId = member.memberId || member.member_id;
    await updateTeamMemberInSupabase(memberId, { status: nextStatus });
    setMembers(prev => prev.map(m => (m.memberId === memberId || m.member_id === memberId ? { ...m, status: nextStatus } : m)));
  };

  const handleDelete = async (member) => {
    const memberId = member.memberId || member.member_id;
    if (!window.confirm(`Are you sure you want to remove team member ${member.name} (${memberId})?`)) return;
    await deleteTeamMemberFromSupabase(memberId);
    setMembers(prev => prev.filter(m => m.memberId !== memberId && m.member_id !== memberId));
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    await saveTeamMemberRegistrationToSupabase(form);
    setShowAddModal(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'Enterprise Outreach Lead',
      department: 'Enterprise & B2B',
      passcode: 'TEAM2026',
      repCode: '',
      customQuote: '',
      status: 'ACTIVE'
    });
    loadMembers();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    const memberId = editingMember.memberId || editingMember.member_id;
    await updateTeamMemberInSupabase(memberId, form);
    setEditingMember(null);
    loadMembers();
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setForm({
      name: m.name || '',
      email: m.email || '',
      phone: m.phone || '',
      role: m.role || '',
      department: m.department || 'Enterprise & B2B',
      passcode: m.passcode || 'TEAM2026',
      repCode: m.repCode || m.rep_code || '',
      customQuote: m.customQuote || m.custom_quote || '',
      status: m.status || 'ACTIVE'
    });
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.memberId || m.member_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.repCode || m.rep_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || m.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-indigo-500" />
            Team Accounts &amp; Operational Roster
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage registered team persons, assigned departments, individual tracking codes, and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setForm({
                name: '',
                email: '',
                phone: '',
                role: 'Enterprise Outreach Lead',
                department: 'Enterprise & B2B',
                passcode: 'TEAM2026',
                repCode: '',
                customQuote: '',
                status: 'ACTIVE'
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Allocate Team Member</span>
          </button>

          <button
            onClick={loadMembers}
            className={`p-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, Email, Member ID, Rep Code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border font-bold ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">All Departments</option>
            <option value="Enterprise & B2B">Enterprise &amp; B2B</option>
            <option value="Campus & University">Campus &amp; University</option>
            <option value="Growth & Partnerships">Growth &amp; Partnerships</option>
            <option value="Customer Operations">Customer Operations</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Total Registered: <strong className="text-indigo-400">{members.length}</strong>
        </div>
      </div>

      {/* Main Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs font-mono">
            No team member accounts found matching your query.
          </div>
        ) : (
          filteredMembers.map(m => {
            const memberId = m.memberId || m.member_id;
            const repCode = m.repCode || m.rep_code;
            const isSuspended = m.status === 'SUSPENDED';

            return (
              <div
                key={memberId}
                className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                  isDark ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={getTeamMemberAvatar(memberId || repCode || m.email) || m.avatar_url || m.avatar || ''}
                      name={m.name || 'Team Officer'}
                      role="team"
                      size="lg"
                    />
                    <div>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.name}</h4>
                      <p className="text-[11px] text-indigo-400 font-medium truncate max-w-[170px]">{m.role}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                    isSuspended 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {m.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Member ID:</span>
                    <span className="font-bold text-slate-300">{memberId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Rep Tag:</span>
                    <span className="font-bold text-purple-400">{repCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{m.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{m.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Passcode:</span>
                    <span className="text-amber-400 font-bold">{m.passcode}</span>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(memberId, `Team Account: ${m.name} | ID: ${memberId} | Rep: ${repCode} | Email: ${m.email} | Passcode: ${m.passcode}`)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === memberId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === memberId ? 'Copied' : 'Copy Creds'}</span>
                  </button>

                  <ActionDropdown
                    isDark={isDark}
                    label="Actions"
                    items={[
                      {
                        label: 'Edit Member Profile',
                        icon: Edit3,
                        onClick: () => handleOpenEdit(m),
                        variant: 'primary'
                      },
                      {
                        label: isSuspended ? 'Reactivate Account' : 'Suspend Account',
                        icon: isSuspended ? CheckCircle2 : XCircle,
                        onClick: () => handleToggleStatus(m),
                        variant: isSuspended ? 'success' : 'warning'
                      },
                      { divider: true },
                      {
                        label: 'Delete Team Account',
                        icon: Trash2,
                        onClick: () => handleDelete(m),
                        variant: 'danger'
                      }
                    ]}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white">
              {editingMember ? `Edit Team Member: ${editingMember.name}` : 'Allocate New Team Member'}
            </h3>

            <form onSubmit={editingMember ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@th3ory.online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 01001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                  >
                    <option value="Enterprise & B2B">Enterprise &amp; B2B</option>
                    <option value="Campus & University">Campus &amp; University</option>
                    <option value="Growth & Partnerships">Growth &amp; Partnerships</option>
                    <option value="Customer Operations">Customer Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    placeholder="Outreach Lead"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rep Tag / Code</label>
                  <input
                    type="text"
                    value={form.repCode}
                    onChange={e => setForm({ ...form, repCode: e.target.value.toUpperCase() })}
                    placeholder="REP-ALEX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Security Passcode</label>
                  <input
                    type="text"
                    required
                    value={form.passcode}
                    onChange={e => setForm({ ...form, passcode: e.target.value })}
                    placeholder="TEAM2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingMember(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold cursor-pointer"
                >
                  {editingMember ? 'Save Modifications' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
