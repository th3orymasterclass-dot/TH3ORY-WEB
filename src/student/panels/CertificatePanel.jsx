import React, { useState } from 'react';
import { Award, Sparkles, CheckCircle2, Lock, Eye, Download, Share2, Linkedin } from 'lucide-react';
import CertificateViewer from '../components/CertificateViewer';

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
          Earn your official gold-embossed <strong>Certificate of Mastery in Influencing &amp; Executive Embodiment</strong> upon completing all 30 course modules. Showcase your accomplishment on LinkedIn, print a high-resolution version, or share your verifiable QR credential.
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

        {/* Small Embedded Preview Box */}
        <div className={`border rounded-2xl p-6 text-center space-y-4 cursor-pointer hover:border-amber-500/60 transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
        }`} onClick={() => openCertificate(true)}>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-500">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-amber-400 text-base">TH3ORY Masterclass Certificate of Mastery</h4>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Click to launch the interactive high-resolution template viewer &amp; print options
            </p>
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
