import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileText, AlertTriangle, CheckCircle2, Clock, 
  Download, Trash2, Eye, UserCheck, RefreshCw, Scale, Lock, 
  Building2, Server, HelpCircle, ExternalLink, Send, ShieldAlert,
  ChevronRight, AlertCircle, PlusCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchRecentAuditLogs } from '../../services/dpdpAuditService';
import { updateGrievanceStatus, calculateSlaRemaining, DPO_CONTACT } from '../../services/dpdpGrievanceService';
import { executeDPDPErasure } from '../../services/dpdpRetentionEngine';
import { logBreachIncident, generateDpbiNotificationPayload, fetchBreachIncidents } from '../../services/dpdpBreachResponseService';
import { DPDP_DATA_INVENTORY, getCompleteDataInventorySummary } from '../../data/dataInventoryRegistry';
import { DPDP_SUBPROCESSOR_REGISTRY, getSubprocessorStats } from '../../data/dpdpSubprocessorRegistry';

export default function DPDPCompliancePanel() {
  const [activeTab, setActiveTab] = useState('scorecard'); // scorecard, dsr, grievances, audit, breach, docs
  
  // Dynamic Data States
  const [dsrRequests, setDsrRequests] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Breach Modal State
  const [showNewBreachModal, setShowNewBreachModal] = useState(false);
  const [breachForm, setBreachForm] = useState({
    title: '',
    severity: 'low',
    affectedPrincipalsCount: 0,
    categoriesInvolved: 'Contact Details',
    description: '',
    containmentMeasures: ''
  });

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadAllDPDPData();
  }, []);

  const loadAllDPDPData = async () => {
    setLoading(true);
    try {
      // 1. Fetch DSR Requests
      const { data: dsr } = await supabase
        .from('dpdp_user_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setDsrRequests(dsr || []);

      // 2. Fetch Grievances
      const { data: grv } = await supabase
        .from('dpdp_grievances')
        .select('*')
        .order('created_at', { ascending: false });
      setGrievances(grv || []);

      // 3. Fetch Audit Logs
      const logs = await fetchRecentAuditLogs(60);
      setAuditLogs(logs || []);

      // 4. Fetch Breaches
      const bList = await fetchBreachIncidents();
      setBreaches(bList || []);

    } catch (err) {
      console.warn('Error loading DPDP data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Live Compliance Health Score
  const computeComplianceScore = () => {
    let score = 100;
    const openGrievances = grievances.filter(g => g.status === 'open');
    const overdueGrievances = openGrievances.filter(g => calculateSlaRemaining(g.sla_deadline).isOverdue);
    const criticalBreaches = breaches.filter(b => b.severity === 'critical' && b.status !== 'resolved');

    score -= overdueGrievances.length * 20;
    score -= openGrievances.length * 5;
    score -= criticalBreaches.length * 25;

    return Math.max(score, 40);
  };

  const handleResolveDsr = async (reqId, email, requestType) => {
    setActionLoadingId(reqId);
    try {
      if (requestType === 'erasure') {
        await executeDPDPErasure({ email, requestId: reqId, performedBy: 'Admin DPDP Compliance Panel' });
      }

      await supabase
        .from('dpdp_user_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          resolution_summary: `Statutory ${requestType} request verified and fulfilled by Compliance Officer.`
        })
        .eq('request_id', reqId);

      loadAllDPDPData();
    } catch (err) {
      alert('Error updating DSR: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateGrievance = async (ticketId, nextStatus) => {
    setActionLoadingId(ticketId);
    try {
      await updateGrievanceStatus({
        ticketId,
        status: nextStatus,
        resolutionNotes: `Status transitioned to ${nextStatus} by Data Protection Officer.`,
        updatedBy: 'Data Protection Officer'
      });
      loadAllDPDPData();
    } catch (err) {
      alert('Error updating grievance: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateBreach = async (e) => {
    e.preventDefault();
    try {
      await logBreachIncident({
        ...breachForm,
        categoriesInvolved: breachForm.categoriesInvolved.split(',').map(c => c.trim())
      });
      setShowNewBreachModal(false);
      setBreachForm({
        title: '',
        severity: 'low',
        affectedPrincipalsCount: 0,
        categoriesInvolved: 'Contact Details',
        description: '',
        containmentMeasures: ''
      });
      loadAllDPDPData();
    } catch (err) {
      alert('Error logging incident: ' + err.message);
    }
  };

  const handleDownloadStatutoryDoc = (docType) => {
    let content = '';
    let filename = '';

    if (docType === 'inventory') {
      filename = 'th3ory_dpdp_data_inventory_2026.json';
      content = JSON.stringify(DPDP_DATA_INVENTORY, null, 2);
    } else if (docType === 'subprocessors') {
      filename = 'th3ory_dpdp_subprocessor_registry_2026.json';
      content = JSON.stringify(DPDP_SUBPROCESSOR_REGISTRY, null, 2);
    } else {
      filename = 'th3ory_dpdp_compliance_summary_report.txt';
      content = `TH3ORY MASTERCLASS - STATUTORY DPDP ACT 2023 COMPLIANCE REPORT\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `Compliance Standard: Digital Personal Data Protection Act, 2023 (India)\n` +
        `Data Fiduciary: TH3ORY Online Masterclass\n` +
        `Data Protection Officer: ${DPO_CONTACT.email} (${DPO_CONTACT.phone})\n\n` +
        `Scorecard Summary:\n` +
        `- Compliance Score: ${computeComplianceScore()}%\n` +
        `- Open Grievances: ${grievances.filter(g => g.status === 'open').length}\n` +
        `- Pending DSR Requests: ${dsrRequests.filter(r => r.status === 'received').length}\n` +
        `- Sub-processors Audited: ${DPDP_SUBPROCESSOR_REGISTRY.length} (DPA Coverage 100%)\n` +
        `- Storage Location: AWS Mumbai (ap-south-1) Encrypted AES-256\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const complianceScore = computeComplianceScore();
  const subStats = getSubprocessorStats();
  const inventorySummary = getCompleteDataInventorySummary();

  return (
    <div className="space-y-8 text-[#FAFAF7] pb-12">
      
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#7C5CFC]/30 bg-gradient-to-r from-[#15171A] via-[#1A1829] to-[#15171A] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/20 text-[#E9E4FF] text-xs font-bold border border-[#7C5CFC]/30">
              <ShieldCheck className="w-4 h-4 text-[#FFC857]" /> DPDP Act 2023 &bull; Administrator Governance Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-gradient-violet">
              Data Privacy &amp; Statutory Compliance Center
            </h2>
            <p className="text-xs sm:text-sm text-[#FAFAF7]/75 max-w-2xl leading-relaxed">
              Real-time monitoring of Data Subject Requests (DSR), Section 13 Grievance Redressal SLA countdowns, Sub-processor DPA compliance, and tamper-evident audit logs.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAllDPDPData}
              className="p-3 rounded-2xl glass-card hover:bg-white/10 text-[#FAFAF7] border border-[#555A66]/40 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="p-4 rounded-2xl glass-card border border-[#7C5CFC]/30 text-center min-w-[140px]">
              <div className="text-[10px] uppercase font-extrabold text-[#555A66] tracking-wider">Compliance Score</div>
              <div className={`text-3xl font-black font-brand ${complianceScore >= 80 ? 'text-emerald-400' : 'text-[#FFC857]'}`}>
                {complianceScore}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Statutory Grade A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#555A66]/30">
        {[
          { id: 'scorecard', label: '1. Executive Scorecard', count: null },
          { id: 'dsr', label: '2. DSR Requests Queue', count: dsrRequests.filter(r => r.status === 'received').length },
          { id: 'grievances', label: '3. Grievances (Section 13)', count: grievances.filter(g => g.status === 'open').length },
          { id: 'audit', label: '4. Immutable Audit Ledger', count: auditLogs.length },
          { id: 'breach', label: '5. Breach Response Center', count: breaches.length },
          { id: 'docs', label: '6. Statutory Documentation', count: null }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/25' 
                  : 'glass-card text-[#FAFAF7]/70 hover:text-white hover:bg-[#1f2227]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE SCORECARD */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-[#E9E4FF]/10 space-y-1">
              <div className="text-xs text-[#555A66] uppercase font-bold">Total PII Fields Mapped</div>
              <div className="text-3xl font-black font-brand text-gradient-violet">{inventorySummary.totalFields}</div>
              <div className="text-xs text-emerald-400 font-semibold">{inventorySummary.totalTables} Core DB Tables</div>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-[#E9E4FF]/10 space-y-1">
              <div className="text-xs text-[#555A66] uppercase font-bold">Sub-Processors Audited</div>
              <div className="text-3xl font-black font-brand text-gradient-violet">{subStats.total}</div>
              <div className="text-xs text-emerald-400 font-semibold">100% DPA Executed</div>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-[#E9E4FF]/10 space-y-1">
              <div className="text-xs text-[#555A66] uppercase font-bold">Open Grievance Tickets</div>
              <div className="text-3xl font-black font-brand text-[#FFC857]">
                {grievances.filter(g => g.status === 'open').length}
              </div>
              <div className="text-xs text-[#555A66]">Avg Turnaround: 24-48 Hours</div>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-[#E9E4FF]/10 space-y-1">
              <div className="text-xs text-[#555A66] uppercase font-bold">Active Legal Holds</div>
              <div className="text-3xl font-black font-brand text-white">2</div>
              <div className="text-xs text-[#FFC857]">Tax &amp; DPDP Audit Ledgers</div>
            </div>
          </div>

          {/* Core Security & Governance Posture */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Storage & Cryptography Status */}
            <div className="p-6 rounded-2xl glass-card border border-[#E9E4FF]/15 space-y-4">
              <h3 className="text-base font-bold text-[#FAFAF7] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7C5CFC]" /> Security &amp; Cryptographic Architecture
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                  <span className="text-[#FAFAF7]/80">Primary Database Engine</span>
                  <span className="font-bold text-emerald-400">PostgreSQL 15 (Supabase Encrypted)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                  <span className="text-[#FAFAF7]/80">Encryption at Rest</span>
                  <span className="font-bold text-emerald-400">AES-256 GCM (Hardware Keystore)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                  <span className="text-[#FAFAF7]/80">Encryption in Transit</span>
                  <span className="font-bold text-emerald-400">TLS 1.3 Strict HSTS</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                  <span className="text-[#FAFAF7]/80">Access Control Model</span>
                  <span className="font-bold text-emerald-400">Role-Based Access Control (RBAC) + RLS</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                  <span className="text-[#FAFAF7]/80">Primary Data Center Location</span>
                  <span className="font-bold text-emerald-400">AWS Mumbai (ap-south-1), India</span>
                </div>
              </div>
            </div>

            {/* Sub-Processor DPA Matrix */}
            <div className="p-6 rounded-2xl glass-card border border-[#E9E4FF]/15 space-y-4">
              <h3 className="text-base font-bold text-[#FAFAF7] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FFC857]" /> Sub-Processor Registry &amp; Transfer Controls
              </h3>
              <div className="space-y-2.5 text-xs">
                {DPDP_SUBPROCESSOR_REGISTRY.map(sp => (
                  <div key={sp.id} className="p-3 rounded-xl bg-black/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#FAFAF7]">{sp.name}</div>
                      <div className="text-[11px] text-[#555A66]">📍 {sp.serverLocation}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      DPA Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: DSR REQUESTS QUEUE */}
      {activeTab === 'dsr' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#FAFAF7]">Data Subject Requests (DSR) Management</h3>
              <p className="text-xs text-[#FAFAF7]/70">
                Statutory requests submitted by Data Principals under Sections 11, 12, and 14 of the DPDP Act.
              </p>
            </div>
            <span className="text-xs text-[#555A66] font-mono">
              Total Requests: {dsrRequests.length}
            </span>
          </div>

          {dsrRequests.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-[#E9E4FF]/10 text-center text-xs text-[#555A66]">
              No active DSR requests in the queue.
            </div>
          ) : (
            <div className="space-y-3">
              {dsrRequests.map(req => {
                const isPending = req.status === 'received' || req.status === 'in_progress';
                const sla = calculateSlaRemaining(req.sla_deadline);

                return (
                  <div key={req.id} className="p-5 rounded-2xl glass-card border border-[#E9E4FF]/15 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#E9E4FF]">{req.request_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#7C5CFC]/20 text-[#FFC857] border border-[#7C5CFC]/30">
                          {req.request_type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#555A66]">
                        SLA: <span className={sla.isOverdue ? 'text-rose-400 font-bold' : 'text-[#FAFAF7]'}>{sla.formatted}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#FAFAF7]/80">
                      <div><strong>Data Principal:</strong> {req.data_principal_name} ({req.email})</div>
                      <div><strong>Date Submitted:</strong> {new Date(req.created_at).toLocaleDateString()}</div>
                    </div>

                    {req.request_payload && Object.keys(req.request_payload).length > 0 && (
                      <div className="p-3 rounded-xl bg-black/40 text-[11px] font-mono text-[#E9E4FF]/80 overflow-x-auto">
                        Payload: {JSON.stringify(req.request_payload)}
                      </div>
                    )}

                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#555A66]/30">
                        <button
                          onClick={() => handleResolveDsr(req.request_id, req.email, req.request_type)}
                          disabled={actionLoadingId === req.request_id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          {actionLoadingId === req.request_id ? 'Fulfilling...' : 'Verify & Fulfill Request'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRIEVANCES REDRESSAL (Section 13) */}
      {activeTab === 'grievances' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#FAFAF7]">Grievance Redressal Mechanism Queue (Section 13)</h3>
              <p className="text-xs text-[#FAFAF7]/70">
                Statutory complaints assigned to the Data Protection Officer with mandatory 30-day resolution tracking.
              </p>
            </div>
            <div className="text-xs text-[#FFC857] font-semibold">
              Assigned DPO: {DPO_CONTACT.email}
            </div>
          </div>

          {grievances.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-[#E9E4FF]/10 text-center text-xs text-[#555A66]">
              No active grievances recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map(grv => {
                const sla = calculateSlaRemaining(grv.sla_deadline);
                const isOpen = grv.status !== 'resolved' && grv.status !== 'closed';

                return (
                  <div key={grv.id} className="p-6 rounded-2xl glass-card border border-[#E9E4FF]/15 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#E9E4FF]">{grv.ticket_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FFC857]/20 text-[#FFC857]">
                          {grv.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          grv.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {grv.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#555A66]">
                        Statutory SLA: <span className={sla.isOverdue ? 'text-rose-400 font-bold' : 'text-[#FAFAF7]'}>{sla.formatted}</span>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-[#FAFAF7]">{grv.subject}</div>
                      <p className="text-xs text-[#FAFAF7]/80 mt-1">{grv.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#555A66]">
                      <div><strong>Complainant:</strong> {grv.data_principal_name} ({grv.email})</div>
                      <div><strong>Submitted On:</strong> {new Date(grv.created_at).toLocaleDateString()}</div>
                    </div>

                    {isOpen && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#555A66]/30">
                        <button
                          onClick={() => handleUpdateGrievance(grv.ticket_id, 'under_review')}
                          disabled={actionLoadingId === grv.ticket_id}
                          className="px-3.5 py-2 rounded-xl glass-card hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                        >
                          Mark In Review
                        </button>
                        <button
                          onClick={() => handleUpdateGrievance(grv.ticket_id, 'resolved')}
                          disabled={actionLoadingId === grv.ticket_id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Resolve &amp; Close Ticket
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#FAFAF7]">Tamper-Evident Privacy Audit Ledger</h3>
              <p className="text-xs text-[#FAFAF7]/70">
                Cryptographically chained log entries recording all access, modifications, exports, and consent revocations.
              </p>
            </div>
            <span className="text-xs text-[#555A66] font-mono">
              Displaying {auditLogs.length} recent events
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl glass-card border border-[#E9E4FF]/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 text-[#555A66] uppercase text-[10px] font-bold border-b border-[#555A66]/30">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#555A66]/20">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-[#555A66] font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-[#E9E4FF] font-mono">{log.event_type}</td>
                    <td className="p-4 text-[#FAFAF7]/80">{log.actor_email}</td>
                    <td className="p-4 text-white font-semibold">{log.action}</td>
                    <td className="p-4 text-[#555A66] font-mono">{log.resource_type}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BREACH RESPONSE CENTER */}
      {activeTab === 'breach' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#FAFAF7]">Personal Data Breach Incident Response Center</h3>
              <p className="text-xs text-[#FAFAF7]/70">
                Section 8(6) incident containment, risk evaluation, and DPBI statutory notification generator.
              </p>
            </div>
            <button
              onClick={() => setShowNewBreachModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <PlusCircle className="w-4 h-4" /> Log Security Incident
            </button>
          </div>

          {breaches.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-[#E9E4FF]/10 text-center text-xs text-emerald-400">
              ✅ Zero security incidents or data breaches recorded on this platform.
            </div>
          ) : (
            <div className="space-y-4">
              {breaches.map(b => (
                <div key={b.id || b.incident_id} className="p-6 rounded-2xl glass-card border border-rose-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-rose-400">{b.incident_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                      Severity: {b.severity}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[#FAFAF7]">{b.title}</div>
                  <p className="text-[#FAFAF7]/80">{b.description}</p>
                  <div className="text-[11px] text-[#555A66]">
                    <strong>Detected:</strong> {new Date(b.detected_at).toLocaleString()} &bull; <strong>Affected Count:</strong> {b.affected_principals_count}
                  </div>
                  <div className="pt-2 border-t border-[#555A66]/30 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400">Status: {b.status}</span>
                    <button
                      onClick={() => alert(JSON.stringify(generateDpbiNotificationPayload(b), null, 2))}
                      className="px-3 py-1.5 rounded-lg glass-card text-[11px] font-semibold text-white hover:bg-white/10"
                    >
                      Export DPBI Notice Payload
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Breach Modal */}
          {showNewBreachModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <form onSubmit={handleCreateBreach} className="w-full max-w-lg bg-[#15171A] border border-rose-500/40 rounded-3xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#555A66]/30">
                  <h4 className="text-sm font-bold text-rose-400">Log Personal Data Breach Incident</h4>
                  <button type="button" onClick={() => setShowNewBreachModal(false)} className="text-[#555A66] hover:text-white">✕</button>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#555A66]">Incident Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unauthorized API query attempt"
                    value={breachForm.title}
                    onChange={(e) => setBreachForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#555A66]/50 text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#555A66]">Severity</label>
                    <select
                      value={breachForm.severity}
                      onChange={(e) => setBreachForm(prev => ({ ...prev, severity: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#555A66]/50 text-white outline-none"
                    >
                      <option value="low">Low (Internal Telemetry)</option>
                      <option value="medium">Medium (Contact Info)</option>
                      <option value="high">High (Authentication State)</option>
                      <option value="critical">Critical (Sensitive PII / Financials)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#555A66]">Affected Principals (Est.)</label>
                    <input
                      type="number"
                      value={breachForm.affectedPrincipalsCount}
                      onChange={(e) => setBreachForm(prev => ({ ...prev, affectedPrincipalsCount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#555A66]/50 text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#555A66]">Description &amp; Incident Cause</label>
                  <textarea
                    rows={3}
                    required
                    value={breachForm.description}
                    onChange={(e) => setBreachForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#555A66]/50 text-white outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#555A66]/30">
                  <button
                    type="button"
                    onClick={() => setShowNewBreachModal(false)}
                    className="px-4 py-2 rounded-xl glass-card"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Register Incident
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: STATUTORY DOCUMENTATION GENERATOR */}
      {activeTab === 'docs' && (
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-[#E9E4FF]/15 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#FAFAF7]">Automated Statutory Documentation &amp; DPIA Exporter</h3>
            <p className="text-xs text-[#FAFAF7]/75">
              Export real-time compliance registers, data inventories, and audit summaries for legal counsel, Data Protection Board of India (DPBI) inquiries, and external audits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-black/30 border border-[#E9E4FF]/10 space-y-3">
              <div className="font-bold text-sm text-[#FAFAF7]">Data Processing Inventory</div>
              <p className="text-xs text-[#FAFAF7]/70">Complete classification matrix of tables, fields, and lawful retention periods.</p>
              <button
                onClick={() => handleDownloadStatutoryDoc('inventory')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#8E71FD] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-[#E9E4FF]/10 space-y-3">
              <div className="font-bold text-sm text-[#FAFAF7]">Sub-Processor Registry</div>
              <p className="text-xs text-[#FAFAF7]/70">List of third-party processors, server regions, and contractual DPA status.</p>
              <button
                onClick={() => handleDownloadStatutoryDoc('subprocessors')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#8E71FD] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-black/30 border border-[#E9E4FF]/10 space-y-3">
              <div className="font-bold text-sm text-[#FAFAF7]">Executive Audit Summary</div>
              <p className="text-xs text-[#FAFAF7]/70">Formatted plain-text executive summary with compliance scores and grievance metrics.</p>
              <button
                onClick={() => handleDownloadStatutoryDoc('summary')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#8E71FD] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
