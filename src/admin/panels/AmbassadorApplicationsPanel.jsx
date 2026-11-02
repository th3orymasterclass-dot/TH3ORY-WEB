import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Check, X, Clock, AlertCircle, FileText, Send, 
  Award, Mail, Phone, GraduationCap, Sparkles, ExternalLink, RefreshCw, CheckCircle2, Lock,
  MessageSquare, Star, UserCheck, ThumbsUp, Calendar, PhoneCall, Copy, Share2, Edit3, Trash2,
  DollarSign, Layers, Search, Plus, CreditCard, TrendingUp, CheckSquare, Filter
} from 'lucide-react';
import { 
  fetchAllAmbassadorApplicationsFromSupabase, 
  approveAmbassadorInSupabase, 
  rejectAmbassadorInSupabase,
  saveAmbassadorInterviewNotesToSupabase,
  submitAmbassadorTeamApprovalToSupabase,
  scheduleAmbassadorInterviewInSupabase,
  deleteAmbassadorApplicationFromSupabase,
  updateAmbassadorApplicationInSupabase,
  fetchAllAmbassadorLeadsFromSupabase,
  saveAmbassadorLeadToSupabase,
  updateAmbassadorLeadStatusInSupabase,
  deleteAmbassadorLeadFromSupabase,
  fetchAllAmbassadorPayoutsFromSupabase,
  updateAmbassadorPayoutStatusInSupabase,
  deleteAmbassadorPayoutFromSupabase,
  fetchAllAmbassadorWeeklyReportsFromSupabase,
  fetchAmbassadorTasksFromSupabase,
  createAmbassadorTaskInSupabase,
  updateAmbassadorTaskInSupabase,
  deleteAmbassadorTaskInSupabase,
  subscribeToAllAmbassadorData
} from '../../services/supabaseService';
import { sendAmbassadorApprovalEmail, sendAmbassadorInterviewInviteEmail } from '../../services/emailService';
import CalendlyModal from '../../components/CalendlyModal';
import ActionDropdown from '../../components/ActionDropdown';
import ProfileAvatar from '../../components/ProfileAvatar';
import { getAmbassadorAvatar } from '../../utils/profileStorageEngine';

const DEFAULT_CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/th3orymasterclass/30min';

export default function AmbassadorApplicationsPanel({ themeMode = 'dark' }) {
  // Navigation Sections
  const [activeSection, setActiveSection] = useState('pipeline'); // 'pipeline' | 'combined' | 'leads' | 'reports' | 'payouts' | 'tasks'

  // Supabase Data Collections
  const [applications, setApplications] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notifications & Modals
  const [processingId, setProcessingId] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [filter, setFilter] = useState('ALL'); // For pipeline: 'ALL' | 'PENDING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED'
  const [leadAmbFilter, setLeadAmbFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendlyApp, setCalendlyApp] = useState(null);
  const [copiedAppId, setCopiedAppId] = useState(null);

  // Send Email Invite Modal State
  const [inviteModalApp, setInviteModalApp] = useState(null);
  const [inviteForm, setInviteForm] = useState({ scheduledSlot: '', teamNotes: '' });
  const [sendingInvite, setSendingInvite] = useState(false);

  // Interview & Evaluation Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewNotes: '',
    interviewRating: '5 Stars - Highly Recommended',
    evaluatorName: 'Team Desk'
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // Edit & Delete Ambassador Application State
  const [editingAmbApp, setEditingAmbApp] = useState(null);
  const [editAmbForm, setEditAmbForm] = useState({
    name: '', email: '', phone: '', collegeName: '', degree: '', 
    yearOfStudy: '', socialHandles: '', leadershipExp: '', motivation: '',
    points: 0, tier: 'Tier 1'
  });
  const [deletingAmbId, setDeletingAmbId] = useState(null);

  // Payout Settlement Modal State
  const [settlingPayout, setSettlingPayout] = useState(null);
  const [payoutSettleForm, setPayoutSettleForm] = useState({ txRef: '', notes: '' });
  const [savingSettlement, setSavingSettlement] = useState(false);

  // Campaign Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', rewardPoints: 100, rewardBonus: 500, deadline: 'Ongoing', status: 'ACTIVE'
  });
  const [savingTask, setSavingTask] = useState(false);

  // New Lead Modal State
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    ambassadorCode: '', studentName: '', studentEmail: '', studentPhone: '', collegeName: '', status: 'ENROLLED', commissionEarned: 1000
  });
  const [savingLead, setSavingLead] = useState(false);

  const isDark = themeMode === 'dark';

  // ─── LOAD ALL TABLES DIRECTLY FROM SUPABASE ───────────────────────────────
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appsData, leadsData, payoutsData, reportsData, tasksData] = await Promise.all([
        fetchAllAmbassadorApplicationsFromSupabase(),
        fetchAllAmbassadorLeadsFromSupabase(),
        fetchAllAmbassadorPayoutsFromSupabase(),
        fetchAllAmbassadorWeeklyReportsFromSupabase(),
        fetchAmbassadorTasksFromSupabase()
      ]);

      setApplications(appsData || []);
      setLeadsList(leadsData || []);
      setPayoutsList(payoutsData || []);
      setReportsList(reportsData || []);
      setTasksList(tasksData || []);
    } catch (err) {
      console.warn('Error loading ambassador tables:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── REALTIME DATABASE SUBSCRIPTION ───────────────────────────────────────
  useEffect(() => {
    loadAllData();

    // Subscribe to all 5 tables for instant realtime reactivity
    const unsubscribeRealtime = subscribeToAllAmbassadorData({
      onAll: () => {
        loadAllData();
      }
    });

    const handler = () => loadAllData();
    window.addEventListener('th3ory_ambassador_apps_change', handler);

    return () => {
      unsubscribeRealtime();
      window.removeEventListener('th3ory_ambassador_apps_change', handler);
    };
  }, []);

  // ─── AMBASSADOR APPLICATION ACTIONS ───────────────────────────────────────
  const handleDeleteAmbassadorApp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus ambassador application record from Supabase?')) return;
    setDeletingAmbId(id);
    await deleteAmbassadorApplicationFromSupabase(id);
    setApplications(prev => prev.filter(a => (a.id || a.appId) !== id));
    setDeletingAmbId(null);
    setSuccessNotice('Ambassador record deleted successfully from Supabase.');
  };

  const handleOpenEditAmbModal = (app) => {
    setEditingAmbApp(app);
    setEditAmbForm({
      name: app.name || '',
      email: app.email || '',
      phone: app.phone || '',
      collegeName: app.collegeName || app.college_name || '',
      degree: app.degree || '',
      yearOfStudy: app.yearOfStudy || app.year_of_study || '',
      socialHandles: app.socialHandles || app.social_handles || '',
      leadershipExp: app.leadershipExp || app.leadership_exp || '',
      motivation: app.motivation || '',
      points: app.points || 0,
      tier: app.tier || 'Tier 1'
    });
  };

  const handleSaveEditAmbApp = async (e) => {
    e.preventDefault();
    if (!editingAmbApp) return;
    const appId = editingAmbApp.id || editingAmbApp.appId;
    await updateAmbassadorApplicationInSupabase(appId, editAmbForm);
    setApplications(prev => prev.map(a => ((a.id || a.appId) === appId ? { ...a, ...editAmbForm } : a)));
    setEditingAmbApp(null);
    setSuccessNotice('Ambassador details updated directly in Supabase.');
  };

  const handleOpenDirectCalendlyCall = async (app) => {
    setCalendlyApp(app);
    if (app.status === 'PENDING') {
      const appId = app.appId || app.id;
      await scheduleAmbassadorInterviewInSupabase(appId, {
        teamNotes: 'Interactive Calendly session initiated by team representative'
      });
      await loadAllData();
    }
  };

  const handleOpenInviteModal = (app) => {
    setInviteModalApp(app);
    setInviteForm({
      scheduledSlot: '',
      teamNotes: 'Please choose your preferred 15-minute slot for the campus ambassador selection interview.'
    });
  };

  const handleDispatchInterviewInvite = async (e) => {
    e.preventDefault();
    if (!inviteModalApp) return;

    setSendingInvite(true);
    const appId = inviteModalApp.appId || inviteModalApp.id;

    try {
      await scheduleAmbassadorInterviewInSupabase(appId, {
        scheduledSlot: inviteForm.scheduledSlot,
        teamNotes: inviteForm.teamNotes
      });

      await sendAmbassadorInterviewInviteEmail({
        name: inviteModalApp.name,
        email: inviteModalApp.email,
        collegeName: inviteModalApp.collegeName,
        calendlyUrl: DEFAULT_CALENDLY_URL,
        scheduledSlot: inviteForm.scheduledSlot,
        teamNotes: inviteForm.teamNotes
      });

      setSuccessNotice(`📅 Calendly interview invitation dispatched to ${inviteModalApp.name} (${inviteModalApp.email})! Status updated in database.`);
      setInviteModalApp(null);
      await loadAllData();
    } catch (err) {
      console.error('Error dispatching interview invite:', err);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyCalendlyLink = (app) => {
    const link = `${DEFAULT_CALENDLY_URL}?name=${encodeURIComponent(app.name || '')}&email=${encodeURIComponent(app.email || '')}`;
    navigator.clipboard.writeText(link);
    const appId = app.appId || app.id;
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 2500);
  };

  const handleOpenInterviewModal = (app) => {
    setSelectedApp(app);
    setInterviewForm({
      interviewNotes: app.interviewNotes || app.interview_notes || '',
      interviewRating: app.interviewRating || app.interview_rating || '5 Stars - Highly Recommended',
      evaluatorName: app.teamRecommendedBy || app.team_recommended_by || 'Team Evaluator'
    });
  };

  const handleSaveInterviewAndRecommend = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmittingEval(true);
    try {
      const appId = selectedApp.appId || selectedApp.id;
      await saveAmbassadorInterviewNotesToSupabase(appId, {
        interviewNotes: interviewForm.interviewNotes,
        interviewRating: interviewForm.interviewRating
      });
      await submitAmbassadorTeamApprovalToSupabase(appId, {
        teamMemberName: interviewForm.evaluatorName
      });

      setSuccessNotice(`✅ Interview logged & approval recommendation submitted for ${selectedApp.name}!`);
      setSelectedApp(null);
      await loadAllData();
    } catch (err) {
      console.error('Error saving interview notes:', err);
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleApprove = async (app) => {
    setProcessingId(app.appId || app.id);
    setSuccessNotice('');

    try {
      const code = `AMB-${(app.collegeName || 'CAMPUS').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const pwd = `TH3ORY-AMB-${Math.floor(100 + Math.random() * 900)}`;

      const res = await approveAmbassadorInSupabase(app.appId || app.id, code, pwd);

      await sendAmbassadorApprovalEmail({
        name: app.name,
        email: app.email,
        collegeName: app.collegeName,
        ambassadorCode: res.ambassadorCode || code,
        password: res.password || pwd
      });

      setSuccessNotice(`🎉 Approved ${app.name}! Unique Ambassador Code (${res.ambassadorCode || code}) created & dispatched.`);
      await loadAllData();
    } catch (err) {
      console.error('Error approving ambassador:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appId) => {
    setProcessingId(appId);
    try {
      await rejectAmbassadorInSupabase(appId);
      await loadAllData();
      setSuccessNotice('Candidate marked as REJECTED in database.');
    } catch (err) {
      console.error('Error rejecting ambassador:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // ─── LEADS CRUD ACTIONS ───────────────────────────────────────────────────
  const handleToggleLeadStatus = async (lead) => {
    const nextStatus = lead.status === 'ENROLLED' ? 'INTERESTED' : 'ENROLLED';
    const commission = nextStatus === 'ENROLLED' ? 1000.00 : 0.00;
    await updateAmbassadorLeadStatusInSupabase(lead.id, nextStatus, commission);
    setLeadsList(prev => prev.map(l => l.id === lead.id ? { ...l, status: nextStatus, commission_earned: commission } : l));
    setSuccessNotice(`Lead status updated to ${nextStatus}. Database totals recalculated in real time.`);
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this referral lead from Supabase?')) return;
    await deleteAmbassadorLeadFromSupabase(leadId);
    setLeadsList(prev => prev.filter(l => l.id !== leadId));
    setSuccessNotice('Referral lead deleted.');
  };

  const handleCreateLeadSubmit = async (e) => {
    e.preventDefault();
    setSavingLead(true);
    try {
      const res = await saveAmbassadorLeadToSupabase(newLeadForm);
      if (res && res.lead) {
        setLeadsList(prev => [res.lead, ...prev]);
        setShowNewLeadModal(false);
        setNewLeadForm({
          ambassadorCode: '', studentName: '', studentEmail: '', studentPhone: '', collegeName: '', status: 'ENROLLED', commissionEarned: 1000
        });
        setSuccessNotice('New referral lead logged into Supabase.');
      }
    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setSavingLead(false);
    }
  };

  // ─── PAYOUTS CRUD ACTIONS ─────────────────────────────────────────────────
  const handleOpenSettlePayout = (payout) => {
    setSettlingPayout(payout);
    setPayoutSettleForm({
      txRef: payout.transaction_reference || `UPI-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Cleared via UPI / Netbanking transfer'
    });
  };

  const handleConfirmSettlement = async (e) => {
    e.preventDefault();
    if (!settlingPayout) return;
    setSavingSettlement(true);
    try {
      await updateAmbassadorPayoutStatusInSupabase(settlingPayout.id, 'PAID', payoutSettleForm.notes, payoutSettleForm.txRef);
      setPayoutsList(prev => prev.map(p => p.id === settlingPayout.id ? {
        ...p, status: 'PAID', transaction_reference: payoutSettleForm.txRef, notes: payoutSettleForm.notes
      } : p));
      setSuccessNotice(`Payout #${settlingPayout.id} marked as PAID. Reference ${payoutSettleForm.txRef} saved in Supabase.`);
      setSettlingPayout(null);
    } catch (err) {
      console.error('Error settling payout:', err);
    } finally {
      setSavingSettlement(false);
    }
  };

  const handleDeletePayout = async (payoutId) => {
    if (!window.confirm('Delete this payout record from Supabase?')) return;
    await deleteAmbassadorPayoutFromSupabase(payoutId);
    setPayoutsList(prev => prev.filter(p => p.id !== payoutId));
    setSuccessNotice('Payout record deleted.');
  };

  // ─── CAMPAIGN TASKS CRUD ACTIONS ──────────────────────────────────────────
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '', description: '', rewardPoints: 100, rewardBonus: 500, deadline: 'Ongoing', status: 'ACTIVE'
    });
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      rewardPoints: task.reward_points || 100,
      rewardBonus: task.reward_bonus || 0,
      deadline: task.deadline || 'Ongoing',
      status: task.status || 'ACTIVE'
    });
    setShowTaskModal(true);
  };

  const handleSaveTaskSubmit = async (e) => {
    e.preventDefault();
    setSavingTask(true);
    try {
      if (editingTask) {
        await updateAmbassadorTaskInSupabase(editingTask.id, taskForm);
        setTasksList(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
        setSuccessNotice('Campaign mission updated directly in Supabase.');
      } else {
        const res = await createAmbassadorTaskInSupabase(taskForm);
        if (res && res.task) {
          setTasksList(prev => [res.task, ...prev]);
          setSuccessNotice('New campaign mission added into Supabase.');
        }
      }
      setShowTaskModal(false);
    } catch (err) {
      console.error('Error saving campaign task:', err);
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this campaign mission from Supabase?')) return;
    await deleteAmbassadorTaskInSupabase(taskId);
    setTasksList(prev => prev.filter(t => t.id !== taskId));
    setSuccessNotice('Campaign task deleted.');
  };

  // ─── FILTERED VIEWS ───────────────────────────────────────────────────────
  const approvedAmbassadors = applications.filter(a => a.status === 'APPROVED');
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const interviewCount = applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'RECOMMENDED_FOR_APPROVAL'].includes(a.status)).length;
  const approvedCount = approvedAmbassadors.length;

  const filteredPipelineList = applications.filter(app => {
    if (filter === 'PENDING') return app.status === 'PENDING';
    if (filter === 'INTERVIEW') return ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'RECOMMENDED_FOR_APPROVAL'].includes(app.status);
    if (filter === 'APPROVED') return app.status === 'APPROVED';
    if (filter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const filteredLeads = leadsList.filter(l => {
    const matchesCode = leadAmbFilter === 'ALL' || (l.ambassador_code || '').toUpperCase() === leadAmbFilter.toUpperCase();
    const matchesSearch = !searchQuery || 
      (l.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.student_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.college_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCode && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black font-heading tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFC857] to-[#FFAE19] flex items-center justify-center text-slate-950 font-black shadow-lg shadow-[#FFC857]/20">
              <Users className="w-5 h-5" />
            </div>
            Campus Ambassador Command Center
          </h2>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Realtime Supabase Database Sync • Applications, Leads, Payouts, Weekly Friday Reports &amp; Campaign Tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TOP SECTION NAVIGATION PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'pipeline', label: `Recruitment Pipeline (${applications.length})`, icon: Users },
          { id: 'combined', label: `Ambassadors Ledger (${approvedCount})`, icon: Layers },
          { id: 'leads', label: `Referred Leads (${leadsList.length})`, icon: TrendingUp },
          { id: 'reports', label: `Weekly Reports (${reportsList.length})`, icon: Send },
          { id: 'payouts', label: `Payout Settlements (${payoutsList.length})`, icon: DollarSign },
          { id: 'tasks', label: `Campaign Tasks (${tasksList.length})`, icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FFC857] via-[#FFAE19] to-[#FFC857] text-[#070A11] shadow-lg shadow-[#FFC857]/20 scale-102'
                  : isDark
                  ? 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. RECRUITMENT PIPELINE SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'pipeline' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sub-Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              All Applications ({applications.length})
            </button>

            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              Step 1: Submitted ({pendingCount})
            </button>

            <button
              onClick={() => setFilter('INTERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'INTERVIEW'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              Step 2: Team Interview ({interviewCount})
            </button>

            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'APPROVED'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              Step 3: Approved ({approvedCount})
            </button>

            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'REJECTED'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              Rejected
            </button>
          </div>

          {loading ? (
            <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              Loading Campus Ambassador Applications from Supabase...
            </div>
          ) : filteredPipelineList.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              No applications match filter <strong className="text-amber-400">{filter}</strong>.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPipelineList.map((app) => {
                const isPending = app.status === 'PENDING';
                const isScheduled = app.status === 'INTERVIEW_SCHEDULED';
                const isInterviewed = app.status === 'INTERVIEW_COMPLETED' || app.status === 'RECOMMENDED_FOR_APPROVAL';
                const isApproved = app.status === 'APPROVED';
                const isProcessing = processingId === (app.appId || app.id);
                const appId = app.appId || app.id;

                return (
                  <div
                    key={app.id || app.appId}
                    className={`p-6 rounded-2xl border transition-all space-y-4 ${
                      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {/* Candidate Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={getAmbassadorAvatar(app.ambassadorCode || app.email) || app.avatarUrl || app.avatar_url || ''}
                          name={app.name || 'Ambassador'}
                          role="ambassador"
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{app.name}</h3>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">
                              {appId}
                            </span>
                          </div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            🎓 <strong>{app.collegeName}</strong> • {app.degree || 'Undergrad'} ({app.yearOfStudy || '2nd Year'})
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          isInterviewed ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          isScheduled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-950/50 text-red-400 border border-red-500/30'
                        }`}>
                          {app.status === 'RECOMMENDED_FOR_APPROVAL' ? '★ Recommended For Approval' :
                           app.status === 'INTERVIEW_SCHEDULED' ? '📅 Calendly Scheduled' : app.status}
                        </span>

                        {isApproved && app.ambassadorCode && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                            CODE: {app.ambassadorCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Contact Email &amp; Phone</span>
                        <div className="text-white font-bold truncate"><Mail className="w-3 h-3 inline mr-1 text-amber-400" />{app.email}</div>
                        <div className="text-slate-400"><Phone className="w-3 h-3 inline mr-1 text-slate-500" />{app.phone || 'N/A'}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
                        <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Social Media Handles</span>
                        <div className="text-slate-300 truncate">{app.socialHandles || 'Not provided'}</div>
                      </div>
                    </div>

                    {/* Interview Notes */}
                    {(app.interviewNotes || app.interview_notes) && (
                      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-indigo-400" /> Team Interview &amp; Calendly Notes
                          </span>
                          <span className="text-amber-400 font-bold font-mono">
                            {app.interviewRating || app.interview_rating || (isScheduled ? 'Scheduled' : '5 Stars')}
                          </span>
                        </div>
                        <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                          "{app.interviewNotes || app.interview_notes}"
                        </p>
                        {(app.teamRecommendedBy || app.team_recommended_by) && (
                          <p className="text-[10px] text-indigo-400 font-mono">
                            Evaluated &amp; Recommended by: {app.teamRecommendedBy || app.team_recommended_by}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions Workflow */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ActionDropdown
                          isDark={isDark}
                          label="Actions"
                          items={[
                            {
                              label: 'Call / Schedule via Calendly',
                              icon: Calendar,
                              onClick: () => handleOpenDirectCalendlyCall(app),
                              variant: 'warning'
                            },
                            {
                              label: 'Send Invite Email',
                              icon: Send,
                              onClick: () => handleOpenInviteModal(app),
                              variant: 'primary'
                            },
                            {
                              label: copiedAppId === appId ? 'Link Copied!' : 'Copy Calendly Link',
                              icon: copiedAppId === appId ? Check : Copy,
                              onClick: () => handleCopyCalendlyLink(app),
                              variant: 'default'
                            },
                            {
                              label: (app.interviewNotes || app.interview_notes) ? 'Edit Evaluation Notes' : 'Conduct Team Interview & Log Evaluation',
                              icon: UserCheck,
                              onClick: () => handleOpenInterviewModal(app),
                              variant: 'purple'
                            },
                            {
                              label: 'Edit Application Details',
                              icon: Edit3,
                              onClick: () => handleOpenEditAmbModal(app),
                              variant: 'default'
                            },
                            { divider: true },
                            {
                              label: deletingAmbId === appId ? 'Deleting...' : 'Delete Application',
                              icon: Trash2,
                              onClick: () => handleDeleteAmbassadorApp(appId),
                              disabled: deletingAmbId === appId,
                              variant: 'danger'
                            }
                          ]}
                        />
                      </div>

                      {!isApproved && app.status !== 'REJECTED' && (
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                          <button
                            onClick={() => handleReject(appId)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>

                          <button
                            onClick={() => handleApprove(app)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                          >
                            {isProcessing ? 'Issuing Credentials...' : 'Approve & Dispatch Credentials'}
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. AMBASSADORS COMBINED LEDGER SECTION (Powered by ambassadors_combined_view) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'combined' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Approved Ambassadors &amp; Unified Aggregates Ledger
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Combined view uniting Ambassador Profiles with live aggregate metrics from Leads, Enrollments, Commissions, Payouts, and Reports.
            </p>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <th className="py-4 px-5">Ambassador</th>
                    <th className="py-4 px-5">College &amp; Code</th>
                    <th className="py-4 px-5">Tier &amp; Points</th>
                    <th className="py-4 px-5">Leads Driven</th>
                    <th className="py-4 px-5">Enrollments</th>
                    <th className="py-4 px-5">Total Earned</th>
                    <th className="py-4 px-5">Paid Out</th>
                    <th className="py-4 px-5">Pending Payout</th>
                    <th className="py-4 px-5">Reports</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 dark:divide-slate-800/60 font-mono">
                  {approvedAmbassadors.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 text-xs font-sans">
                        No approved ambassadors found in database. Approve candidates in the Recruitment Pipeline tab.
                      </td>
                    </tr>
                  ) : (
                    approvedAmbassadors.map((amb) => (
                      <tr key={amb.id || amb.appId} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50'}>
                        <td className="py-4 px-5 font-sans font-bold">
                          <div className="flex items-center gap-2.5">
                            <ProfileAvatar
                              src={getAmbassadorAvatar(amb.ambassadorCode || amb.email) || amb.avatarUrl || ''}
                              name={amb.name || 'Ambassador'}
                              role="ambassador"
                              size="sm"
                            />
                            <div>
                              <div className="text-white font-bold">{amb.name}</div>
                              <div className="text-[11px] text-slate-400 font-normal">{amb.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="text-[#FFC857] font-bold">{amb.ambassadorCode || 'N/A'}</div>
                          <div className="text-slate-400 font-sans text-[11px]">{amb.collegeName}</div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-[#FFC857] border border-amber-500/30">
                            {amb.tier || 'Tier 1'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{amb.points || 0} pts</div>
                        </td>

                        <td className="py-4 px-5 text-slate-300 font-bold">
                          {amb.totalLeads ?? 0}
                        </td>

                        <td className="py-4 px-5 text-emerald-400 font-bold">
                          {amb.totalEnrollments ?? 0}
                        </td>

                        <td className="py-4 px-5 text-[#FFC857] font-bold">
                          ₹{Number(amb.totalCommission || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-5 text-emerald-400">
                          ₹{Number(amb.totalPaidOut || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-5 text-indigo-400">
                          ₹{Number(amb.totalPendingPayout || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-5 text-slate-300">
                          {amb.weeklyReportsCount ?? (amb.weeklyReports?.length || 0)}
                        </td>

                        <td className="py-4 px-5 text-right font-sans">
                          <button
                            onClick={() => handleOpenEditAmbModal(amb)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. REFERRED STUDENT LEADS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'leads' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Referred Student Leads Ledger (Supabase `ambassador_leads`)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Live tracking of students who registered or converted with an ambassador code. Toggling status immediately updates commission and parent aggregates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewLeadModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Add Lead
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by student name, email, or college..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-amber-400/50' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <select
              value={leadAmbFilter}
              onChange={e => setLeadAmbFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="ALL">All Ambassador Codes ({leadsList.length})</option>
              {Array.from(new Set(leadsList.map(l => (l.ambassador_code || '').toUpperCase()).filter(Boolean))).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          {/* Leads Table */}
          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <th className="py-4 px-5">Student Name</th>
                    <th className="py-4 px-5">Email &amp; Phone</th>
                    <th className="py-4 px-5">College / Univ</th>
                    <th className="py-4 px-5">Ambassador Code</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Commission</th>
                    <th className="py-4 px-5 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 dark:divide-slate-800/60">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                        No student leads match search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50'}>
                        <td className="py-4 px-5 font-sans font-bold text-white">
                          {lead.student_name}
                        </td>
                        <td className="py-4 px-5 text-slate-400">
                          <div>{lead.student_email}</div>
                          {lead.student_phone && <div className="text-[10px] text-slate-500">{lead.student_phone}</div>}
                        </td>
                        <td className="py-4 px-5 text-slate-400 font-sans">
                          {lead.college_name || 'N/A'}
                        </td>
                        <td className="py-4 px-5 text-[#FFC857] font-bold">
                          {lead.ambassador_code || 'UNASSIGNED'}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleLeadStatus(lead)}
                            title="Click to toggle status between INTERESTED and ENROLLED"
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                              lead.status === 'ENROLLED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-[#FFC857] border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                          >
                            {lead.status === 'ENROLLED' ? '✓ ENROLLED' : '⏳ INTERESTED'}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-[#FFC857] font-bold">
                          ₹{Number(lead.commission_earned || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-5 text-right font-sans">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. FRIDAY WEEKLY REPORTS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'reports' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Friday Activity Reports Stream (Supabase `ambassador_weekly_reports`)
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Weekly promotional metrics, posts, stories, generated leads, challenges, and action plans submitted by active campus ambassadors.
            </p>
          </div>

          <div className="space-y-4">
            {reportsList.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                No weekly reports submitted yet by ambassadors.
              </div>
            ) : (
              reportsList.map((rep, idx) => (
                <div
                  key={rep.id || idx}
                  className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-[#FFC857] border border-amber-500/30 text-xs font-mono font-bold">
                        AMBASSADOR: {rep.ambassador_code || 'CODE'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {rep.submitted_at ? new Date(rep.submitted_at).toLocaleDateString() : 'Recent Submission'}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                      +{rep.points_awarded || 50} Points Credited
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Posts Count</span>
                      <span className="text-lg font-bold text-white">{rep.posts_count ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Stories Count</span>
                      <span className="text-lg font-bold text-white">{rep.stories_count ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Leads Generated</span>
                      <span className="text-lg font-bold text-[#FFC857]">{rep.leads_generated ?? 0}</span>
                    </div>
                  </div>

                  {(rep.event_notes || rep.challenges || rep.next_week_plan) && (
                    <div className="space-y-2 text-xs pt-1">
                      {rep.event_notes && (
                        <p className="text-slate-300">
                          <strong className="text-slate-400">Campus Events &amp; Highlights:</strong> {rep.event_notes}
                        </p>
                      )}
                      {rep.challenges && (
                        <p className="text-amber-300">
                          <strong className="text-amber-400">Challenges / Blockers:</strong> {rep.challenges}
                        </p>
                      )}
                      {rep.next_week_plan && (
                        <p className="text-indigo-300">
                          <strong className="text-indigo-400">Next Week Execution Plan:</strong> {rep.next_week_plan}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. PAYOUT SETTLEMENTS & CASH LEDGER SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'payouts' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Offline Commission Settlements Ledger (Supabase `ambassador_payouts`)
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage direct UPI / Netbanking commission payout requests. Approving a payout updates the balance and marks the transaction as PAID in Supabase.
            </p>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <th className="py-4 px-5">Payout ID</th>
                    <th className="py-4 px-5">Ambassador</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Payment Method / Destination</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Reference</th>
                    <th className="py-4 px-5 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 dark:divide-slate-800/60">
                  {payoutsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                        No payout withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    payoutsList.map((payout) => (
                      <tr key={payout.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50'}>
                        <td className="py-4 px-5 text-amber-400 font-bold">
                          {payout.id}
                        </td>
                        <td className="py-4 px-5 text-white font-bold font-sans">
                          {payout.ambassador_code}
                        </td>
                        <td className="py-4 px-5 text-emerald-400 font-bold text-sm">
                          ₹{Number(payout.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-sans">
                          <div>{payout.payment_method || 'UPI / Bank Transfer'}</div>
                          {payout.payment_details && (
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{payout.payment_details}</div>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            payout.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {payout.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-400 text-[11px]">
                          {payout.transaction_reference || 'Pending Transfer'}
                        </td>
                        <td className="py-4 px-5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            {payout.status !== 'PAID' && (
                              <button
                                onClick={() => handleOpenSettlePayout(payout)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePayout(payout.id)}
                              className="p-1.5 rounded-lg bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-900/50 cursor-pointer"
                              title="Delete Payout Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. CAMPAIGN TASKS MANAGER SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSection === 'tasks' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ambassador Campaign Tasks Manager (Supabase `ambassador_tasks`)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Define promotional campaigns, campus quests, point rewards, and cash incentives for the ambassador student network.
              </p>
            </div>

            <button
              onClick={handleOpenCreateTask}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Create Campaign Mission
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasksList.length === 0 ? (
              <div className={`col-span-full p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                No custom tasks added yet. Click "Create Campaign Mission" to publish quests to the ambassador portal.
              </div>
            ) : (
              tasksList.map((task) => (
                <div
                  key={task.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                    isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {task.status || 'ACTIVE'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {task.deadline || 'Ongoing'}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#FFC857] font-bold">+{task.reward_points || 100} Points</span>
                      {Number(task.reward_bonus) > 0 && (
                        <span className="text-emerald-400 font-bold">+₹{Number(task.reward_bonus).toLocaleString('en-IN')} Cash</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODALS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* DISPATCH CALENDLY INTERVIEW INVITATION EMAIL MODAL */}
      {inviteModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Dispatch Calendly Interview Invitation
                </h3>
                <p className="text-xs text-slate-400">Recipient: <strong className="text-white">{inviteModalApp.name}</strong> ({inviteModalApp.email})</p>
              </div>
              <button
                onClick={() => setInviteModalApp(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchInterviewInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Proposed Schedule / Time Slot (Optional)
                </label>
                <input
                  type="text"
                  value={inviteForm.scheduledSlot}
                  onChange={e => setInviteForm({ ...inviteForm, scheduledSlot: e.target.value })}
                  placeholder="e.g. Wednesday 4:00 PM IST or leave blank to let candidate select"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Team Note / Custom Instructions for Candidate
                </label>
                <textarea
                  rows={3}
                  value={inviteForm.teamNotes}
                  onChange={e => setInviteForm({ ...inviteForm, teamNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingInvite}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {sendingInvite ? 'Sending Resend Email...' : 'Dispatch Invitation Email & Update Status'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TEAM INTERVIEW EVALUATION MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Team Manual Interview Evaluation</h3>
                <p className="text-xs text-slate-400">Candidate: <strong className="text-amber-400">{selectedApp.name}</strong> ({selectedApp.collegeName})</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInterviewAndRecommend} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Evaluator / Team Member Name *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.evaluatorName}
                  onChange={e => setInterviewForm({ ...interviewForm, evaluatorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Interview Rating / Assessment Grade</label>
                <select
                  value={interviewForm.interviewRating}
                  onChange={e => setInterviewForm({ ...interviewForm, interviewRating: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                >
                  <option value="5 Stars - Highly Recommended">5 Stars - Highly Recommended (Top Candidate)</option>
                  <option value="4 Stars - Good Candidate">4 Stars - Good Candidate (Strong Fit)</option>
                  <option value="3 Stars - Acceptable">3 Stars - Acceptable (Needs Training)</option>
                  <option value="2 Stars - Borderline">2 Stars - Borderline</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Manual Interview Notes &amp; Assessment *</label>
                <textarea
                  rows={4}
                  required
                  value={interviewForm.interviewNotes}
                  onChange={e => setInterviewForm({ ...interviewForm, interviewNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEval}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingEval ? 'Saving Evaluation...' : 'Save Interview Notes & Submit Recommendation to Admin'}
                <ThumbsUp className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CALENDLY SCHEDULING MODAL */}
      <CalendlyModal
        isOpen={Boolean(calendlyApp)}
        onClose={() => setCalendlyApp(null)}
        name={calendlyApp?.name || ''}
        email={calendlyApp?.email || ''}
        title={`Campus Ambassador Selection Interview — ${calendlyApp?.name || 'Candidate'}`}
        subtitle={`15-Min Live Selection Interview (${calendlyApp?.collegeName || 'Campus Ambassador'})`}
      />

      {/* EDIT AMBASSADOR FORM RECORD MODAL */}
      {editingAmbApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Campus Ambassador Form Record
              </h3>
              <button onClick={() => setEditingAmbApp(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditAmbApp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editAmbForm.name}
                    onChange={e => setEditAmbForm({ ...editAmbForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editAmbForm.email}
                    onChange={e => setEditAmbForm({ ...editAmbForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editAmbForm.phone}
                    onChange={e => setEditAmbForm({ ...editAmbForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">College / University</label>
                  <input
                    type="text"
                    required
                    value={editAmbForm.collegeName}
                    onChange={e => setEditAmbForm({ ...editAmbForm, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Tier</label>
                  <select
                    value={editAmbForm.tier}
                    onChange={e => setEditAmbForm({ ...editAmbForm, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Points</label>
                  <input
                    type="number"
                    value={editAmbForm.points}
                    onChange={e => setEditAmbForm({ ...editAmbForm, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAmbApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Record Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE PAYOUT MODAL */}
      {settlingPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Clear Offline Payout Transfer
              </h3>
              <button onClick={() => setSettlingPayout(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400">Ambassador Code: <strong className="text-white">{settlingPayout.ambassador_code}</strong></div>
                <div className="text-slate-400">Amount: <strong className="text-emerald-400 text-sm">₹{Number(settlingPayout.amount || 0).toLocaleString('en-IN')}</strong></div>
                <div className="text-slate-400">Details: <span className="text-white">{settlingPayout.payment_details || settlingPayout.payment_method}</span></div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Transaction Ref / UTR *</label>
                <input
                  type="text"
                  required
                  value={payoutSettleForm.txRef}
                  onChange={e => setPayoutSettleForm({ ...payoutSettleForm, txRef: e.target.value })}
                  placeholder="e.g. UPI-TXN-1092841"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Notes</label>
                <input
                  type="text"
                  value={payoutSettleForm.notes}
                  onChange={e => setPayoutSettleForm({ ...payoutSettleForm, notes: e.target.value })}
                  placeholder="Transfer notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingPayout(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettlement}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  {savingSettlement ? 'Saving...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CAMPAIGN TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                {editingTask ? 'Edit Campaign Mission' : 'Create New Campaign Mission'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Mission Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Campus Tech Club Workshop Presentation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Description / Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Outline the steps required for ambassadors to complete this quest..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Reward Points</label>
                  <input
                    type="number"
                    value={taskForm.rewardPoints}
                    onChange={e => setTaskForm({ ...taskForm, rewardPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Cash Incentive Bonus (₹)</label>
                  <input
                    type="number"
                    value={taskForm.rewardBonus}
                    onChange={e => setTaskForm({ ...taskForm, rewardBonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Deadline / Frequency</label>
                  <input
                    type="text"
                    value={taskForm.deadline}
                    onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    placeholder="e.g. Every Friday / Ongoing"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  {savingTask ? 'Saving Quest...' : 'Save Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW REFERRAL LEAD MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Manually Add Referred Student Lead
              </h3>
              <button onClick={() => setShowNewLeadModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Ambassador Referral Code *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.ambassadorCode}
                  onChange={e => setNewLeadForm({ ...newLeadForm, ambassadorCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. AMB-STAN-101"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.studentName}
                  onChange={e => setNewLeadForm({ ...newLeadForm, studentName: e.target.value })}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newLeadForm.studentEmail}
                    onChange={e => setNewLeadForm({ ...newLeadForm, studentEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={newLeadForm.studentPhone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, studentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={e => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ENROLLED">ENROLLED (₹1,000 Comm)</option>
                    <option value="INTERESTED">INTERESTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">College / Univ</label>
                  <input
                    type="text"
                    value={newLeadForm.collegeName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  {savingLead ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
