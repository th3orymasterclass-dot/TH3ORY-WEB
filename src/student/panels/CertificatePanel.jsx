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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`border rounded-2xl p-6 sm:p-8 space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 font-bold shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-wider">
                Official Credential
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Verified Certification
              </span>
            </div>
            <h2 className={`font-black text-2xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              TH3ORY Masterclass Certificate of Mastery
            </h2>
          </div>
        </div>

        <p className={`text-sm leading-relaxed max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Earn your official gold-embossed <strong>Certificate of Mastery in Influencing &amp; Executive Embodiment</strong> upon completing all 30 course modules. Print a high-resolution version or download your official PDF / PNG credential.
        </p>

        {/* Course Completion Status Card */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isCourseCompleted
            ? isLight ? 'bg-green-50 border-green-200 text-green-900' : 'bg-green-950/40 border-green-500/30 text-green-300'
            : isLight ? 'bg-amber-50 border-amber-200 text-slate-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            {isCourseCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <Lock className="w-6 h-6 text-amber-500 shrink-0" />
            )}
            <div>
              <span className="font-extrabold text-sm block">
                {isCourseCompleted
                  ? '🎉 Congratulations! Your Certificate is Ready'
                  : '🔒 Certificate Unlocks at 100% Course Completion'}
              </span>
              <span className="text-xs opacity-90">
                Progress: {completedCount} of {totalLessons} Lessons Completed ({totalLessons ? Math.round((completedCount/totalLessons)*100) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCourseCompleted ? (
              <button
                onClick={() => openCertificate(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
              >
                <Award className="w-4 h-4" />
                <span>View &amp; Print Certificate</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => openCertificate(true)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isLight ? 'border-amber-400 text-amber-900 hover:bg-amber-100' : 'border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>Preview Template</span>
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('course')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`font-black text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Certificate Template Preview
          </h3>
          <button
            onClick={() => openCertificate(true)}
            className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> View Fullscreen
          </button>
        </div>

        {/* Embedded Certificate Template Preview */}
        <div className="relative w-full aspect-[1024/723] max-w-2xl mx-auto rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl group cursor-pointer" onClick={() => openCertificate(true)}>
          <img
            src="/certificate_template.png"
            alt="TH3ORY Masterclass Certificate Template Preview"
            className="w-full h-full object-cover block group-hover:scale-[1.01] transition-transform duration-300"
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

          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex items-center justify-center transition-all duration-300">
            <span className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl">
              <Eye className="w-4 h-4" /> Click to View &amp; Download PDF
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
