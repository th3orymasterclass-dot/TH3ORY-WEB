import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Clock, AlertCircle, FileText, RefreshCw, Send, CheckCircle2, PlusCircle, Calendar } from 'lucide-react';
import {
  fetchPendingTeamApprovalsFromSupabase,
  processTeamApprovalRequestInSupabase,
  subscribeToTeamApprovals
} from '../../services/supabaseService';
import CalendlyModal from '../../components/CalendlyModal';

export default function TeamApprovalsPanel({ themeMode = 'dark' }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const isDark = themeMode === 'dark';

  useEffect(() => {
    let isMounted = true;
    async function loadRequests() {
      setLoading(true);
      const data = await fetchPendingTeamApprovalsFromSupabase();
      if (isMounted) {
        setRequests(data || []);
        setLoading(false);
      }
    }
    loadRequests();

    const unsubscribe = subscribeToTeamApprovals((updatedList) => {
      if (isMounted) setRequests(updatedList || []);
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleProcess = async (requestId, status) => {
    setProcessingId(requestId);
    await processTeamApprovalRequestInSupabase(requestId, status, adminNotes);
    const updated = await fetchPendingTeamApprovalsFromSupabase();
    setRequests(updated || []);
    setProcessingId(null);
    setAdminNotes('');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  const isCreationAction = (actionType) => {
    return actionType && (actionType.startsWith('create_') || actionType.includes('new'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Team Member Action Approvals
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review, approve, or reject operational modifications and NEW DATA entries submitted by Team Portal members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCalendlyOpen(true)}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Schedule Team Meeting</span>
          </button>
          <span className={`px-3 py-1 font-bold text-xs rounded-full border ${
            isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {pendingRequests.length} Pending
          </span>
        </div>
      </div>

      {/* Pending Requests Queue Container */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Approvals Queue ({pendingRequests.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Loading pending team requests...</span>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className={`py-10 text-center text-xs font-mono border border-dashed rounded-xl p-4 ${
            isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-300'
          }`}>
            No pending team requests. All submitted team actions have been processed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const isCreate = isCreationAction(req.action_type);

              return (
                <div key={req.id} className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isCreate
                    ? isDark ? 'bg-slate-950 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300'
                    : isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {isCreate && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase flex items-center gap-1 border ${
                            isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            <PlusCircle className="w-3 h-3" /> NEW DATA ENTRY
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}>
                          {req.module_type}
                        </span>
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.action_type}</span>
                      </div>
                      <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Submitted by <strong>{req.team_member_name}</strong> ({req.team_member_email}) on {new Date(req.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleProcess(req.id, 'approved')}
                        disabled={processingId === req.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Live
                      </button>
                      <button
                        onClick={() => handleProcess(req.id, 'rejected')}
                        disabled={processingId === req.id}
                        className={`px-3.5 py-1.5 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                          isDark ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/30' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Proposed Changes JSON / Details */}
                  <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      {isCreate ? 'Proposed New Record Payload:' : 'Proposed Status Modification:'}
                    </p>
                    <pre className={`text-[11px] overflow-x-auto ${isDark ? 'text-cyan-300' : 'text-indigo-700'}`}>
                      {JSON.stringify(req.proposed_changes, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Log */}
      {historyRequests.length > 0 && (
        <div className={`border rounded-2xl p-5 space-y-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Approval History Log ({historyRequests.length})</h3>
          <div className="space-y-2">
            {historyRequests.map((req) => (
              <div key={req.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${req.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{req.action_type} ({req.module_type}) by {req.team_member_name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                  req.status === 'approved'
                    ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isDark ? 'bg-rose-950 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendly Team Strategy Meeting Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        title="Schedule Team Operational Strategy Meeting"
        subtitle="1-on-1 Admin Sync for Team Member Data Proposals & Approvals"
      />
    </div>
  );
}
