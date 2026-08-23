import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Check, X, Clock, AlertCircle, FileText, Send, 
  Award, Mail, Phone, GraduationCap, Sparkles, ExternalLink, RefreshCw, CheckCircle2, Lock
} from 'lucide-react';
import { 
  fetchAllAmbassadorApplicationsFromSupabase, 
  approveAmbassadorInSupabase, 
  rejectAmbassadorInSupabase 
} from '../../services/supabaseService';
import { sendAmbassadorApprovalEmail } from '../../services/emailService';

export default function AmbassadorApplicationsPanel({ themeMode = 'dark' }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [processingId, setProcessingId] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  const isDark = themeMode === 'dark';

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

  const handleApprove = async (app) => {
    setProcessingId(app.appId || app.id);
    setSuccessNotice('');

    try {
      const code = `AMB-${(app.collegeName || 'CAMPUS').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const pwd = `TH3ORY-AMB-${Math.floor(100 + Math.random() * 900)}`;

      const res = await approveAmbassadorInSupabase(app.appId || app.id, code, pwd);
      
      // Dispatch automated credentials email
      await sendAmbassadorApprovalEmail({
        name: app.name,
        email: app.email,
        collegeName: app.collegeName,
        ambassadorCode: res.ambassadorCode || code,
        password: res.password || pwd
      });

      setSuccessNotice(`🎉 Approved ${app.name}! Unique Ambassador Code (${res.ambassadorCode || code}) dispatched via email.`);
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
    if (filter === 'APPROVED') return app.status === 'APPROVED';
    if (filter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-amber-500" />
            Campus Ambassador Recruitment Portal
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review student applications, verify leadership credentials, and 1-click issue login access over email.
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
          <span>Pending Review</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'APPROVED'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600')
          }`}
        >
          <span>Approved Ambassadors</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
            {approvedCount}
          </span>
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
            const isApproved = app.status === 'APPROVED';
            const isProcessing = processingId === (app.appId || app.id);

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
                          {app.appId || app.id}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        🎓 <strong>{app.collegeName}</strong> • {app.degree || 'Undergrad'} ({app.yearOfStudy || '2nd Year'})
                      </p>
                    </div>
                  </div>

                  {/* STATUS & REASON */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
                      isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-950/50 text-red-400 border border-red-500/30'
                    }`}>
                      {app.status}
                    </span>

                    {isApproved && app.ambassadorCode && (
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
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
                    <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Social Media Profiles</span>
                    <div className="text-slate-300 truncate">{app.socialHandles || 'Not provided'}</div>
                  </div>
                </div>

                {/* LEADERSHIP EXPERIENCE & MOTIVATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Leadership &amp; Club Experience:</span>
                    <p className="text-slate-300 leading-relaxed">{app.leadershipExp || 'No details provided.'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Motivation &amp; Campus Outreach Strategy:</span>
                    <p className="text-slate-300 leading-relaxed">{app.motivation || 'No motivation details provided.'}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(app.appId || app.id)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Reject Application
                    </button>

                    <button
                      onClick={() => handleApprove(app)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isProcessing ? 'Issuing Credentials...' : 'Approve & Dispatch Credentials over Email'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
