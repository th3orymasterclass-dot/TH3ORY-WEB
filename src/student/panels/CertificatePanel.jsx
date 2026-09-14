import React, { useState, useEffect } from 'react';
import { Award, Sparkles, CheckCircle2, Lock, Eye, Download, Share2, Linkedin } from 'lucide-react';
import CertificateViewer from '../components/CertificateViewer';
import { getOrCreateCertificateInSupabase, generateUniqueCertificateId, subscribeToStudentCertificate } from '../../services/supabaseService.js';

export default function CertificatePanel({
  profile,
  themeMode = 'dark',
  completedCount = 0,
  totalLessons = 30,
  onNavigate
}) {
  const isLight = themeMode === 'light';
  const isCourseCompleted = totalLessons > 0 && completedCount >= totalLessons;

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const studentName = profile?.name || 'Valued Graduate';
  const email = profile?.email || '';

  const initialCertId = profile?.certificateId || profile?.certificate_id || generateUniqueCertificateId(email, studentName);
  const initialDate = profile?.completionDate || profile?.completedAt 
    ? new Date(profile.completionDate || profile.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const [dbCertId, setDbCertId] = useState(initialCertId);
  const [dbIssueDate, setDbIssueDate] = useState(initialDate);

  useEffect(() => {
    let isMounted = true;
    async function syncCert() {
      if (!email) return;
      const rawCompDate = profile?.completionDate || profile?.completedAt || new Date().toISOString();
      const res = await getOrCreateCertificateInSupabase({ 
        studentName, 
        email, 
        completionDate: rawCompDate 
      });
      if (isMounted && res && res.certId) {
        setDbCertId(res.certId);
        if (res.completionDate || res.issueDate) setDbIssueDate(res.completionDate || res.issueDate);
      }
    }
    syncCert();

    const unsubscribe = subscribeToStudentCertificate(email, (updatedCert) => {
      if (isMounted && updatedCert && updatedCert.certId) {
        setDbCertId(updatedCert.certId);
        if (updatedCert.completionDate) setDbIssueDate(updatedCert.completionDate);
      }
    });

    return () => { 
      isMounted = false; 
      if (unsubscribe) unsubscribe();
    };
  }, [email, studentName, profile?.completionDate, profile?.completedAt]);

  const certId = dbCertId;
  const issueDate = dbIssueDate;

  const openCertificate = (preview = false) => {
    setIsPreviewMode(preview);
    setShowCertificateModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 space-y-5 border transition-all duration-300 ${
        isLight 
          ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/30 border-slate-200/80 shadow-lg' 
          : 'glass-card-luxury border-white/10 shadow-2xl shadow-black/50'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FFC857]/15 to-transparent blur-3xl pointer-events-none rounded-full -mr-20 -mt-20" />

        <div className="relative z-10 flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC857] to-[#FFAA00] flex items-center justify-center text-slate-950 font-black shadow-xl shadow-[#FFC857]/20 shrink-0 ring-4 ring-[#FFC857]/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-[#FFC857]/20 border border-[#FFC857]/40 text-[#FFC857] font-black text-[10px] uppercase tracking-widest">
                Official Credential
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
                Blockchain-Hash Verifiable
              </span>
            </div>
            <h2 className={`font-black text-2xl sm:text-3xl tracking-tight font-serif ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
              Certificate of Mastery &amp; Executive Embodiment
            </h2>
          </div>
        </div>

        <p className={`relative z-10 text-xs sm:text-sm leading-relaxed max-w-3xl ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
          Issued by TH3ORY Executive Faculty. Complete all 30 foundational modules to unlock and mint your official high-resolution, gold-embossed Certificate of Mastery, complete with verified unique Credential ID and permanent digital archival.
        </p>

        {/* Course Completion Status Card */}
        <div className={`relative z-10 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all duration-300 ${
          isCourseCompleted
            ? isLight 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 shadow-sm' 
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-xl shadow-emerald-950/20'
            : isLight 
              ? 'bg-amber-500/10 border-amber-500/30 text-slate-900' 
              : 'glass-card-gold border-[#FFC857]/30 text-[#FFC857]'
        }`}>
          <div className="flex items-center gap-4">
            {isCourseCompleted ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#FFC857]/20 border border-[#FFC857]/40 flex items-center justify-center text-[#FFC857] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-black text-sm sm:text-base block font-serif tracking-tight">
                {isCourseCompleted
                  ? 'Distinction Achieved: Credential Ready for Download'
                  : 'Credential Locked — Complete All 30 Modules'}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                Current Milestone: {completedCount} of {totalLessons} Modules Completed ({totalLessons ? Math.round((completedCount/totalLessons)*100) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
            {isCourseCompleted ? (
              <button
                onClick={() => openCertificate(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#FFC857]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>View &amp; Print Credential</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => openCertificate(true)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isLight 
                      ? 'border-amber-400 text-amber-900 hover:bg-amber-100' 
                      : 'border-[#FFC857]/40 text-[#FFC857] hover:bg-[#FFC857]/15'
                  }`}
                >
                  <Eye className="w-4 h-4 text-[#FFC857]" />
                  <span>Preview Template</span>
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('course')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FFC857]/20"
                  >
                    Continue Course
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Certificate Template Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-black text-xl tracking-tight font-serif ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
              Digital Credential Foil Rendering
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
              Dynamic high-resolution template rendered with personalized cryptographic student ID
            </p>
          </div>
          <button
            onClick={() => openCertificate(true)}
            className="text-xs font-bold text-[#FFC857] hover:underline flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4" /> <span>Fullscreen Inspection</span>
          </button>
        </div>

        {/* Embedded Certificate Template Preview Card */}
        <div className="relative w-full aspect-[1024/723] max-w-3xl mx-auto rounded-3xl overflow-hidden border border-[#FFC857]/40 shadow-2xl shadow-black/80 group cursor-pointer transition-transform duration-300 hover:scale-[1.01]" onClick={() => openCertificate(true)}>
          <img
            src="/certificate_template.png"
            alt="TH3ORY Masterclass Certificate Template Preview"
            className="w-full h-full object-cover block"
          />

          {/* DYNAMIC OVERLAY 1: STUDENT NAME PREVIEW */}
          <div 
            className="absolute left-1/2 w-[80%] text-center pointer-events-none"
            style={{ top: '51.59%', transform: 'translate(-50%, -50%)' }}
          >
            <h2 className="text-[2.6vw] sm:text-[24px] font-serif font-extrabold uppercase tracking-wide text-white drop-shadow-[0_2px_8px_rgba(212,175,55,0.9)] leading-none truncate">
              {studentName}
            </h2>
          </div>

          {/* DYNAMIC OVERLAY 2: DATE OF COMPLETION PREVIEW */}
          <div 
            className="absolute pointer-events-none"
            style={{ left: '12.89%', top: '83.54%', transform: 'translateY(-50%)' }}
          >
            <span className="text-[1.1vw] sm:text-[11px] font-sans font-bold text-[#E5C158] tracking-wide leading-none">
              {issueDate}
            </span>
          </div>

          {/* DYNAMIC OVERLAY 3: CERTIFICATE ID PREVIEW */}
          <div 
            className="absolute pointer-events-none"
            style={{ left: '20.50%', top: '86.10%', transform: 'translateY(-50%)' }}
          >
            <span className="text-[1.1vw] sm:text-[11px] font-mono font-bold text-[#E5C158] tracking-wide leading-none">
              {certId}
            </span>
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex items-center justify-center transition-all duration-300">
            <span className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl">
              <Eye className="w-4 h-4" /> Click to Inspect &amp; Download High-Res PDF
            </span>
          </div>
        </div>
      </div>

      {/* Modal Popup Viewer */}
      {showCertificateModal && (
        <CertificateViewer
          profile={profile}
          completedCount={completedCount}
          totalLessons={totalLessons}
          isPreview={isPreviewMode}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
}
