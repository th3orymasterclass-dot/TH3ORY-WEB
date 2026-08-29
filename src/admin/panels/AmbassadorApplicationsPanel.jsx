import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Check, X, Clock, AlertCircle, FileText, Send, 
  Award, Mail, Phone, GraduationCap, Sparkles, ExternalLink, RefreshCw, CheckCircle2, Lock,
  MessageSquare, Star, UserCheck, ThumbsUp, Calendar, PhoneCall, Copy, Share2, Edit3, Trash2
} from 'lucide-react';
import { 
  fetchAllAmbassadorApplicationsFromSupabase, 
  approveAmbassadorInSupabase, 
  rejectAmbassadorInSupabase,
  saveAmbassadorInterviewNotesToSupabase,
  submitAmbassadorTeamApprovalToSupabase,
  scheduleAmbassadorInterviewInSupabase,
  deleteAmbassadorApplicationFromSupabase,
  updateAmbassadorApplicationInSupabase
} from '../../services/supabaseService';
import { sendAmbassadorApprovalEmail, sendAmbassadorInterviewInviteEmail } from '../../services/emailService';
import CalendlyModal from '../../components/CalendlyModal';

const DEFAULT_CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/th3orymasterclass/30min';

export default function AmbassadorApplicationsPanel({ themeMode = 'dark' }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED'
  const [processingId, setProcessingId] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [calendlyApp, setCalendlyApp] = useState(null);
  const [copiedAppId, setCopiedAppId] = useState(null);

  // Send Email Invite Modal State
  const [inviteModalApp, setInviteModalApp] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    scheduledSlot: '',
    teamNotes: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  // Interview & Evaluation Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewNotes: '',
    interviewRating: '5 Stars - Highly Recommended',
    evaluatorName: 'Team Desk'
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // Edit & Delete State
  const [editingAmbApp, setEditingAmbApp] = useState(null);
  const [editAmbForm, setEditAmbForm] = useState({ name: '', email: '', phone: '', collegeName: '', degree: '', yearOfStudy: '', socialHandles: '', leadershipExp: '', motivation: '' });
  const [deletingAmbId, setDeletingAmbId] = useState(null);

  const isDark = themeMode === 'dark';

  const handleDeleteAmbassadorApp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus ambassador application?')) return;
    setDeletingAmbId(id);
    await deleteAmbassadorApplicationFromSupabase(id);
    setApplications(prev => prev.filter(a => (a.id || a.appId) !== id));
    setDeletingAmbId(null);
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
      motivation: app.motivation || ''
    });
  };

  const handleSaveEditAmbApp = async (e) => {
    e.preventDefault();
    if (!editingAmbApp) return;
    const appId = editingAmbApp.id || editingAmbApp.appId;
    await updateAmbassadorApplicationInSupabase(appId, editAmbForm);
    setApplications(prev => prev.map(a => ((a.id || a.appId) === appId ? { ...a, ...editAmbForm } : a)));
    setEditingAmbApp(null);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAmbassadorApplicationsFromSupabase();
      setApplications(data || []);
    } catch (err) {
      console.warn('Error loading ambassador applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handler = () => loadData();
    window.addEventListener('th3ory_ambassador_apps_change', handler);
    return () => window.removeEventListener('th3ory_ambassador_apps_change', handler);
  }, []);

  const handleOpenDirectCalendlyCall = async (app) => {
    setCalendlyApp(app);
    if (app.status === 'PENDING') {
      const appId = app.appId || app.id;
      await scheduleAmbassadorInterviewInSupabase(appId, {
        teamNotes: 'Interactive Calendly session initiated by team representative'
      });
      await loadData();
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
      // 1. Update candidate status in database
      await scheduleAmbassadorInterviewInSupabase(appId, {
        scheduledSlot: inviteForm.scheduledSlot,
        teamNotes: inviteForm.teamNotes
      });

      // 2. Dispatch email invite with Calendly link over Resend API
      await sendAmbassadorInterviewInviteEmail({
        name: inviteModalApp.name,
        email: inviteModalApp.email,
        collegeName: inviteModalApp.collegeName,
        calendlyUrl: DEFAULT_CALENDLY_URL,
        scheduledSlot: inviteForm.scheduledSlot,
        teamNotes: inviteForm.teamNotes
      });

      setSuccessNotice(`📅 Calendly interview invitation dispatched to ${inviteModalApp.name} (${inviteModalApp.email})! Status updated to INTERVIEW_SCHEDULED.`);
      setInviteModalApp(null);
      await loadData();
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
      await loadData();
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
      
      // Dispatch automated credentials email over Resend API
      await sendAmbassadorApprovalEmail({
        name: app.name,
        email: app.email,
        collegeName: app.collegeName,
        ambassadorCode: res.ambassadorCode || code,
        password: res.password || pwd
      });

      setSuccessNotice(`🎉 Approved ${app.name}! Unique Ambassador Code (${res.ambassadorCode || code}) dispatched via Resend email.`);
      await loadData();
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
      await loadData();
    } catch (err) {
      console.error('Error rejecting ambassador:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredList = applications.filter(app => {
    if (filter === 'PENDING') return app.status === 'PENDING';
    if (filter === 'INTERVIEW') return ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'RECOMMENDED_FOR_APPROVAL'].includes(app.status);
    if (filter === 'APPROVED') return app.status === 'APPROVED';
    if (filter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const interviewCount = applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'RECOMMENDED_FOR_APPROVAL'].includes(a.status)).length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-amber-500" />
            Campus Ambassador Recruitment &amp; Intake Pipeline
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Candidate Intake Flow: Application Submitted &rarr; Calendly Interview Call / Schedule &rarr; Team Evaluation &rarr; Admin Approval &amp; Credentials Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          All Applications ({applications.length})
        </button>

        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          <span>Step 1: Submitted ({pendingCount})</span>
        </button>

        <button
          onClick={() => setFilter('INTERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'INTERVIEW'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          <span>Step 2: Team Interview ({interviewCount})</span>
        </button>

        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'APPROVED'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          <span>Step 3: Approved ({approvedCount})</span>
        </button>

        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'REJECTED'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          Rejected
        </button>
      </div>

      {/* APPLICATIONS QUEUE LIST */}
      {loading ? (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          Loading Campus Ambassador Applications...
        </div>
      ) : filteredList.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          No ambassador applications match filter <strong className="text-amber-400">{filter}</strong>.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((app) => {
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
                {/* CANDIDATE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center font-mono">
                      {app.name ? app.name.substring(0, 2).toUpperCase() : 'AM'}
                    </div>
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

                  {/* STATUS & BADGES */}
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

                {/* CONTACT DETAILS & SOCIALS */}
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

                {/* LEADERSHIP & MOTIVATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Leadership &amp; Club Experience:</span>
                    <p className="text-slate-300 leading-relaxed">{app.leadershipExp || 'No details provided.'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Motivation &amp; Strategy:</span>
                    <p className="text-slate-300 leading-relaxed">{app.motivation || 'No motivation details provided.'}</p>
                  </div>
                </div>

                {/* TEAM INTERVIEW EVALUATION DISPLAY (IF PRESENT) */}
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

                {/* ACTION BUTTONS WORKFLOW */}
                {!isApproved && app.status !== 'REJECTED' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      
                      {/* 1. Direct Embedded Calendly Call Button */}
                      <button
                        onClick={() => handleOpenDirectCalendlyCall(app)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        title="Call or Conduct Live Selection Interview via Calendly"
                      >
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>Call / Schedule via Calendly</span>
                      </button>

                      {/* 2. Dispatch Email Invite Modal Button */}
                      <button
                        onClick={() => handleOpenInviteModal(app)}
                        className="px-3.5 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        title="Send Calendly Email Invite to candidate with custom schedule option"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        <span>Send Invite Email</span>
                      </button>

                      {/* 3. Quick Copy Calendly Link Button */}
                      <button
                        onClick={() => handleCopyCalendlyLink(app)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-slate-700"
                        title="Copy direct pre-filled Calendly link for WhatsApp/Phone outreach"
                      >
                        {copiedAppId === appId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedAppId === appId ? 'Link Copied' : 'Copy Link'}</span>
                      </button>

                      {/* 4. Edit Form Application Record */}
                      <button
                        onClick={() => handleOpenEditAmbModal(app)}
                        className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title="Edit Ambassador Form Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Form</span>
                      </button>

                      {/* 5. Delete Application Record */}
                      <button
                        onClick={() => handleDeleteAmbassadorApp(appId)}
                        disabled={deletingAmbId === appId}
                        className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title="Delete Application Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{deletingAmbId === appId ? '...' : 'Delete'}</span>
                      </button>

                      {/* 6. Log Manual Evaluation Button */}
                      <button
                        onClick={() => handleOpenInterviewModal(app)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{(app.interviewNotes || app.interview_notes) ? 'Edit Evaluation' : 'Conduct Team Interview & Log Evaluation'}</span>
                      </button>
                    </div>

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
                        {isProcessing ? 'Issuing Credentials...' : 'Approve & Dispatch Resend Credentials Email'}
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
                <span className="text-[10px] text-slate-500 mt-1 block">
                  You can specify a proposed time slot or allow candidate to pick directly on Calendly.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Team Note / Custom Instructions for Candidate
                </label>
                <textarea
                  rows={3}
                  value={inviteForm.teamNotes}
                  onChange={e => setInviteForm({ ...inviteForm, teamNotes: e.target.value })}
                  placeholder="Enter custom notes or prep guidelines for the candidate..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Calendly Booking Link Preview</span>
                <p className="text-amber-400 font-mono text-[11px] truncate">
                  {DEFAULT_CALENDLY_URL}?name={encodeURIComponent(inviteModalApp.name || '')}&amp;email={encodeURIComponent(inviteModalApp.email || '')}
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingInvite}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {sendingInvite ? 'Sending Resend Email...' : 'Dispatch Invitation Email & Update Status to INTERVIEW_SCHEDULED'}
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
                  placeholder="e.g. Sravan Mentalist (Team Operations)"
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Manual Interview Notes &amp; Communication Rating *</label>
                <textarea
                  rows={4}
                  required
                  value={interviewForm.interviewNotes}
                  onChange={e => setInterviewForm({ ...interviewForm, interviewNotes: e.target.value })}
                  placeholder="Enter notes from manual phone/video interview (e.g. candidate demonstrated strong peer influence, leads campus psychology club, clear articulation)..."
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

      {/* Calendly Applicant Interview Scheduling Modal */}
      <CalendlyModal
        isOpen={Boolean(calendlyApp)}
        onClose={() => setCalendlyApp(null)}
        name={calendlyApp?.name || ''}
        email={calendlyApp?.email || ''}
        title={`Campus Ambassador Selection Interview — ${calendlyApp?.name || 'Candidate'}`}
        subtitle={`15-Min Live Selection Interview (${calendlyApp?.collegeName || 'Campus Ambassador'})`}
      />
      {/* EDIT AMBASSADOR APPLICATION FORM MODAL */}
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
                  <label className="block text-slate-400 font-bold uppercase mb-1">Degree / Major</label>
                  <input
                    type="text"
                    value={editAmbForm.degree}
                    onChange={e => setEditAmbForm({ ...editAmbForm, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Year of Study</label>
                  <input
                    type="text"
                    value={editAmbForm.yearOfStudy}
                    onChange={e => setEditAmbForm({ ...editAmbForm, yearOfStudy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Social Handles / Profile URLs</label>
                <input
                  type="text"
                  value={editAmbForm.socialHandles}
                  onChange={e => setEditAmbForm({ ...editAmbForm, socialHandles: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Leadership Experience / Campus Roles</label>
                <textarea
                  value={editAmbForm.leadershipExp}
                  onChange={e => setEditAmbForm({ ...editAmbForm, leadershipExp: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
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
    </div>
  );
}
