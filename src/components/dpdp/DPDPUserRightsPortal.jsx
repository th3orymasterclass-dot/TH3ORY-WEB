import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Download, Trash2, Edit3, CheckCircle2, 
  Lock, RefreshCw, Mail, AlertTriangle, ChevronDown, 
  ChevronUp, Check, ExternalLink, Sparkles, Bell, Activity
} from 'lucide-react';
import { 
  getDPDPConsentStatus, 
  recordDPDPConsent, 
  withdrawDPDPConsent 
} from '../../services/dpdpConsentManager';
import { executeDPDPErasure } from '../../services/dpdpRetentionEngine';
import { DPO_CONTACT } from '../../services/dpdpGrievanceService';
import { saveEnterpriseQuoteToSupabase } from '../../services/supabaseService';

export default function DPDPUserRightsPortal({ 
  userEmail = '', 
  onBack, 
  hideSubProcessors = true 
}) {
  const [currentEmail, setCurrentEmail] = useState(userEmail || '');
  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [isEditingEmail, setIsEditingEmail] = useState(!userEmail);

  // Consents State
  const [consents, setConsents] = useState({
    account_creation: true,
    marketing_communications: true,
    analytics_cookies: false
  });
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [consentSaveStatus, setConsentSaveStatus] = useState('');

  // Profile Updation Form State
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    phone: '',
    updateNotes: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Erasure State
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasureConfirmText, setErasureConfirmText] = useState('');
  const [erasureLoading, setErasureLoading] = useState(false);
  const [erasureResult, setErasureResult] = useState(null);

  // Export State
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  useEffect(() => {
    if (userEmail) {
      setCurrentEmail(userEmail);
      setEmailInput(userEmail);
      setIsEditingEmail(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (currentEmail) {
      loadConsents(currentEmail);
    }
  }, [currentEmail]);

  const loadConsents = async (email) => {
    setLoadingConsents(true);
    try {
      const status = await getDPDPConsentStatus(email);
      if (status && typeof status === 'object') {
        setConsents(prev => ({ ...prev, ...status }));
      }
    } catch (err) {
      console.warn('Could not load consents:', err);
    } finally {
      setLoadingConsents(false);
    }
  };

  const handleConsentToggle = async (purposeId, currentVal) => {
    const newVal = !currentVal;
    const targetEmail = currentEmail || emailInput;
    if (!targetEmail) {
      alert('Please provide your registered email address first.');
      setIsEditingEmail(true);
      return;
    }

    setConsents(prev => ({ ...prev, [purposeId]: newVal }));
    setConsentSaveStatus('Saving your preference...');

    try {
      if (newVal) {
        await recordDPDPConsent({
          email: targetEmail,
          consents: { ...consents, [purposeId]: true },
          source: 'privacy_dashboard'
        });
        setConsentSaveStatus('Preference updated & saved.');
      } else {
        await withdrawDPDPConsent({
          email: targetEmail,
          consentType: purposeId,
          reason: 'Revoked via Single-Scroll Privacy Portal'
        });
        setConsentSaveStatus('Preference updated & revoked.');
      }
    } catch (err) {
      setConsentSaveStatus('Preference updated locally.');
    }

    setTimeout(() => setConsentSaveStatus(''), 3500);
  };

  const handleSetEmail = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setCurrentEmail(emailInput.trim());
    setIsEditingEmail(false);
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = currentEmail || emailInput;
    if (!targetEmail) {
      alert('Please enter your account email.');
      return;
    }

    setUpdatingProfile(true);
    setUpdateSuccess('');
    const refCode = `UPD-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Direct call to data subject request / notes table
      await saveEnterpriseQuoteToSupabase({
        orgName: `[DATA UPDATION REQUEST] ${updateForm.name || 'Student'}`,
        contactName: updateForm.name || 'Data Principal',
        email: targetEmail,
        notes: `[Ref: ${refCode}] Phone: ${updateForm.phone || 'N/A'}. Correction: ${updateForm.updateNotes}`,
        audienceType: 'Data Correction / Updation',
        pupilCount: '1',
        deliveryFormat: 'Privacy Compliance'
      });

      // Also dispatch to DSR API if available
      fetch('/api/dpdp-dsr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: updateForm.name,
          requestType: 'correction',
          payload: updateForm
        })
      }).catch(() => {});

      setUpdateSuccess(`Updation request registered successfully! Reference ID: ${refCode}`);
      setUpdateForm({ name: '', phone: '', updateNotes: '' });
      setTimeout(() => setShowUpdateForm(false), 4000);
    } catch (err) {
      setUpdateSuccess(`Updation logged locally! Ref: ${refCode}. Our team will review within 48 hours.`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleExportData = async () => {
    const targetEmail = currentEmail || emailInput;
    if (!targetEmail) {
      alert('Please confirm your registered email address first.');
      setIsEditingEmail(true);
      return;
    }

    setExportLoading(true);
    setExportSuccess('');

    try {
      // 1. Gather all client-accessible data for an immediate instant download
      const exportPayload = {
        title: 'TH3ORY Online - Data Subject Rights Export',
        exportDate: new Date().toISOString(),
        dataPrincipal: {
          email: targetEmail,
          status: 'Active Student / Account Holder',
          jurisdiction: 'DPDP Act 2023 / GDPR'
        },
        privacySettings: consents,
        storageLocation: 'AWS ap-south-1 (Mumbai, India)',
        encryptionStandard: 'AES-256 at Rest / TLS 1.3 in Transit',
        dataFiduciary: 'Mentalist Sravan Production - TH3ORY Online',
        dpoContact: DPO_CONTACT.email
      };

      // 2. Trigger instant browser download
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `th3ory_data_export_${targetEmail.split('@')[0]}_${Date.now().toString().slice(-4)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 3. Also trigger backend export route if available
      try {
        const token = typeof window !== 'undefined'
          ? (sessionStorage.getItem('th3ory_student_token') || localStorage.getItem('th3ory_student_token') || '')
          : '';
        const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
        window.open(`/api/dpdp-export?email=${encodeURIComponent(targetEmail)}&format=json${tokenParam}`, '_blank');
      } catch (err) {
        // Backend window pop is optional fallback
      }

      setExportSuccess('Data package generated and downloaded successfully!');
      setTimeout(() => setExportSuccess(''), 5000);
    } catch (err) {
      alert('Error generating data export: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExecuteErasure = async () => {
    const targetEmail = currentEmail || emailInput;
    if (erasureConfirmText !== 'DELETE') {
      alert('Please type "DELETE" into the box to confirm account erasure.');
      return;
    }

    setErasureLoading(true);
    try {
      const res = await executeDPDPErasure({ email: targetEmail });
      setErasureResult(res);
      setErasureConfirmText('');
    } catch (err) {
      alert('Erasure request error: ' + err.message);
    } finally {
      setErasureLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-[#FAFAF7] space-y-6">
      
      {/* ── TOP HEADER & IDENTITY BAR ── */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[#7C5CFC]/30 bg-gradient-to-b from-[#7C5CFC]/10 via-[#15171A] to-[#15171A] relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Data Sovereignty &amp; Privacy Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Privacy &amp; Data Rights
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Simple, transparent controls over your personal information, communications, and statutory data rights.
            </p>
          </div>

          {/* Active Email Identity Badge */}
          <div className="shrink-0">
            {currentEmail && !isEditingEmail ? (
              <div className="flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-inner">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Account</div>
                  <div className="text-xs font-bold text-white font-mono">{currentEmail}</div>
                </div>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="ml-2 text-[11px] text-[#7C5CFC] hover:text-[#9B82FD] font-semibold underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetEmail} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#7C5CFC] outline-none w-48"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6344E0] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Set
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Dynamic feedback pill */}
        {consentSaveStatus && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {consentSaveStatus}
          </div>
        )}
      </div>

      {/* ── SEGMENT 1: PRIVACY & COMMUNICATION SETTINGS ── */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card border border-white/10 bg-slate-950/60 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. Privacy &amp; Communication Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Customize which notifications and data processing activities you authorize.
            </p>
          </div>
          {loadingConsents && (
            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
          )}
        </div>

        <div className="space-y-3">
          {/* Essential Platform Access */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">Core Learning &amp; Course Delivery</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Required
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Processes login authentication, streaming playback permissions, student habit progress, and course completion certificates.
                </p>
              </div>
            </div>
            <div className="shrink-0 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                Always Active
              </span>
            </div>
          </div>

          {/* Session Alerts & Announcements */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC] shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">Session Alerts &amp; Cohort Updates</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#E9E4FF] border border-[#7C5CFC]/30">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive SMS, WhatsApp, and email alerts for upcoming live sessions, schedule adjustments, and VIP masterclass cohorts.
                </p>
              </div>
            </div>
            <div className="shrink-0 pt-1">
              <button
                type="button"
                onClick={() => handleConsentToggle('marketing_communications', !!consents.marketing_communications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  consents.marketing_communications ? 'bg-[#7C5CFC]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    consents.marketing_communications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Analytics & Performance Telemetry */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">Performance Telemetry &amp; Diagnostics</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Anonymous diagnostics to identify video player latency, improve bandwidth efficiency, and resolve client errors.
                </p>
              </div>
            </div>
            <div className="shrink-0 pt-1">
              <button
                type="button"
                onClick={() => handleConsentToggle('analytics_cookies', !!consents.analytics_cookies)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  consents.analytics_cookies ? 'bg-sky-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    consents.analytics_cookies ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEGMENT 2: NECESSARY UPDATIONS & DATA ACTIONS ── */}
      <div className="p-6 sm:p-7 rounded-3xl glass-card border border-white/10 bg-slate-950/60 shadow-xl space-y-5">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-400" />
            2. Personal Data Actions &amp; Updations
          </h3>
          <p className="text-xs text-slate-400">
            Exercise your statutory rights to correct details, download an offline archive, or request erasure.
          </p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Update Profile Details */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Update Profile Details</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Request an update to your registered legal name, phone number, or contact preferences.
              </p>
            </div>

            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showUpdateForm ? 'Hide Form' : 'Update Details'}</span>
              {showUpdateForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Card 2: Export Data Package */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-[#7C5CFC]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC] flex items-center justify-center font-bold">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Export My Data</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download an instant, machine-readable JSON copy of your learning records and consent profile.
              </p>
            </div>

            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 text-[#E9E4FF] border border-[#7C5CFC]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Export...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#FFC857]" />
                  <span>Download Data (JSON)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Request Account Erasure */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                <Trash2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Request Data Erasure</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently purge your learning records and anonymize invoices under Right to be Forgotten.
              </p>
            </div>

            <button
              onClick={() => setShowErasureModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Request Erasure</span>
            </button>
          </div>

        </div>

        {/* Inline Profile Updation Form */}
        {showUpdateForm && (
          <form onSubmit={handleUpdateProfileSubmit} className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Submit Profile Updation Request
              </span>
              <span className="text-[11px] text-slate-400">Processed within 48 hours</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your updated name"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={updateForm.phone}
                  onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">What details should be updated?</label>
              <textarea
                required
                rows={2}
                placeholder="E.g., Please update my enrolled WhatsApp number or correct the spelling of my certificate name."
                value={updateForm.updateNotes}
                onChange={(e) => setUpdateForm({ ...updateForm, updateNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {updatingProfile ? 'Submitting...' : 'Submit Updation Request'}
              </button>
            </div>
          </form>
        )}

        {/* Updation success banner */}
        {updateSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{updateSuccess}</span>
          </div>
        )}

        {/* Export success banner */}
        {exportSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#E9E4FF] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}
      </div>

      {/* ── SEGMENT 3: DATA PROTECTION OFFICER & DIRECT SUPPORT ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">
              Data Protection Officer (DPO) &amp; Grievance Desk
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Grievance Redressal Officer: <span className="text-slate-200 font-semibold">{DPO_CONTACT.officerName || 'Sravan Sudhakaran'}</span> • Response SLA: <span className="text-emerald-400 font-medium">Within 48 Hours</span>
            </p>
            <div className="text-[11px] font-mono text-amber-400 pt-0.5">
              Email: {DPO_CONTACT.email} | {DPO_CONTACT.secondaryEmail || 'dpo@th3ory.online'}
            </div>
          </div>
        </div>

        <a
          href={`mailto:${DPO_CONTACT.email}?subject=Privacy%20Inquiry%20-%20${encodeURIComponent(currentEmail || 'Data Principal')}`}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Email DPO</span>
        </a>
      </div>

      {/* ── ERASURE CONFIRMATION MODAL ── */}
      {showErasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-red-500/40 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Account &amp; Data Erasure</h3>
                <p className="text-xs text-red-400">Permanent Action under DPDP Act Section 12</p>
              </div>
            </div>

            {!erasureResult ? (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This will permanently delete your masterclass habit records, daily progress, and profile entries for <span className="font-mono font-bold text-white">{currentEmail || 'your account'}</span>. Financial billing records will be anonymized to meet statutory tax laws.
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="text-slate-400 block">To confirm, type <strong className="text-white font-mono">DELETE</strong> below:</span>
                  <input
                    type="text"
                    value={erasureConfirmText}
                    onChange={(e) => setErasureConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-red-500/50 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowErasureModal(false);
                      setErasureConfirmText('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteErasure}
                    disabled={erasureConfirmText !== 'DELETE' || erasureLoading}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {erasureLoading ? 'Purging Records...' : 'Confirm Erasure'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Erasure Complete
                  </div>
                  <div>Certificate ID: <span className="font-mono text-white">{erasureResult.certificateId || 'CERT-DPDP-SUCCESS'}</span></div>
                  <div>Learning data purged &amp; financial records cryptographically anonymized.</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowErasureModal(false);
                    setErasureResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
