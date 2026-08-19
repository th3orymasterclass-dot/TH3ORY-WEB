import React, { useState } from 'react';
import { Award, Sparkles, Printer, Share2, Linkedin, Check, X, ShieldCheck } from 'lucide-react';

export default function CertificateViewer({
  profile,
  completedCount = 0,
  totalLessons = 30,
  isPreview = false,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const studentName = profile?.name || 'Valued Graduate';
  const email = profile?.email || '';

  // Deterministic Certificate ID
  const certHash = (email + studentName).split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 8999 + 1000, 1000);
  const certId = `TH3ORY-CERT-2026-${certHash}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const verifyLink = `${window.location.origin}/verify-certificate?certId=${certId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    const title = encodeURIComponent(`I officially completed the TH3ORY Masterclass of Influencing!`);
    const summary = encodeURIComponent(`Proud to earn my Official Certificate of Mastery (ID: ${certId}) issued by Director Sravan Sudhakaran.`);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyLink)}&title=${title}&summary=${summary}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
  };

  const handleShareOthers = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TH3ORY Masterclass Certificate of Mastery',
          text: `Check out my official Certificate of Mastery from TH3ORY Masterclass (ID: ${certId})`,
          url: verifyLink
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(verifyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl space-y-4 print:space-y-0 print:w-full">
        {/* Top Action Controls Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base leading-tight">Official Certificate of Mastery</h3>
              <p className="text-xs text-slate-400">Issued by Director Sravan Sudhakaran (ID: {certId})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleShareLinkedIn}
              className="px-3.5 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Linkedin className="w-4 h-4" />
              <span>Share to LinkedIn</span>
            </button>

            <button
              onClick={handleShareOthers}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share / Copy'}</span>
            </button>

            {onClose && (
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Template Preview Notice Banner */}
        {isPreview && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Royal Certificate Preview</strong>: Demonstrating your official certificate upon 100% course completion.</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/20 font-bold text-[10px] uppercase text-amber-400">
              Progress: {completedCount}/{totalLessons}
            </span>
          </div>
        )}

        {/* ── ROYAL LIGHT-THEMED CERTIFICATE CANVAS ───────────────────────────── */}
        <div className="relative bg-[#FAF8F3] text-slate-950 border-[10px] border-double border-amber-700 rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden print:border-8 print:border-amber-800 print:bg-white print:rounded-none print:shadow-none print:p-10">
          {/* Inner Royal Gold & Navy Border Accents */}
          <div className="absolute inset-0 border-2 border-slate-900/80 rounded-2xl m-3 pointer-events-none" />
          <div className="absolute inset-0 border border-amber-600/40 rounded-xl m-5 pointer-events-none" />

          {/* Corner Flourish Accents */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-700 pointer-events-none" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-700 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-700 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-700 pointer-events-none" />

          <div className="relative z-10 text-center space-y-5">
            {/* Header: Official Course Logo Emblem */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <img
                src="/logo-transparent.png"
                alt="TH3ORY Masterclass Logo"
                className="h-14 sm:h-16 w-auto object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-800 font-sans mt-1">
                Executive Leadership Credential
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-serif">
                Certificate of Mastery
              </h1>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest text-amber-800 mt-1">
                TH3ORY Masterclass of Influencing
              </h3>
            </div>

            {/* Recipient Presentation */}
            <div className="py-4 space-y-3 border-y border-amber-600/30 my-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                This is proudly presented to
              </p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 capitalize font-serif py-1">
                {studentName}
              </h2>
              <p className="text-xs sm:text-sm max-w-2xl mx-auto text-slate-800 leading-relaxed font-sans font-medium">
                For successfully completing the <strong>30-Day Executive Mastery Program</strong> in <strong>Presence, Power, Warmth, Connection, and Legacy Embodiment</strong>.
              </p>
            </div>

            {/* Bottom Metadata & Director Signature */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-left">
              {/* Left Column: Issued Date & Cert ID */}
              <div className="space-y-1.5 text-xs font-sans">
                <div>
                  <span className="text-slate-500 font-extrabold uppercase text-[10px] block tracking-wider">Issued On:</span>
                  <span className="font-bold text-slate-900">{issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-extrabold uppercase text-[10px] block tracking-wider">Certificate ID:</span>
                  <span className="font-mono font-bold text-amber-900">{certId}</span>
                </div>
              </div>

              {/* Center Column: Royal Gold Crest Seal Badge */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-0.5 shadow-lg flex items-center justify-center border-2 border-amber-300">
                  <div className="w-full h-full rounded-full border border-dashed border-amber-200 flex items-center justify-center">
                    <Award className="w-8 h-8 text-slate-950" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-900 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Official Verified Graduate</span>
                </div>
              </div>

              {/* Right Column: Masterclass Director Signature */}
              <div className="text-right space-y-1 font-sans">
                <div className="inline-block border-b-2 border-amber-700/80 pb-1 px-4">
                  <span className="font-serif italic font-bold text-xl sm:text-2xl text-slate-900 block tracking-tight">
                    Sravan Sudhakaran
                  </span>
                </div>
                <span className="text-slate-600 font-extrabold uppercase text-[10px] block tracking-wider">
                  Founder &amp; Masterclass Director
                </span>
                <span className="text-[9px] text-amber-800 font-bold block">
                  TH3ORY Executive Leadership
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
