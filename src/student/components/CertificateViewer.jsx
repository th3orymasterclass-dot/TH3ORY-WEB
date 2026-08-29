import React, { useState, useEffect, useRef } from 'react';
import { Award, Sparkles, Printer, Download, Share2, Linkedin, Check, X, ShieldCheck, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getOrCreateCertificateInSupabase, generateUniqueCertificateId, subscribeToStudentCertificate } from '../../services/supabaseService.js';

// Certificate Metadata: Director Sravan Sudhakaran • TH3ORY Masterclass of Influencing • logo-transparent.png • Share to LinkedIn
export default function CertificateViewer({
  profile,
  completedCount = 0,
  totalLessons = 30,
  isPreview = false,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const certCardRef = useRef(null);

  const studentName = profile?.name || 'Valued Graduate';
  const email = profile?.email || '';

  // Initial fallback certificate ID
  const initialCertId = profile?.certificateId || profile?.certificate_id || generateUniqueCertificateId(email, studentName);
  const initialDate = profile?.completionDate || profile?.completedAt 
    ? new Date(profile.completionDate || profile.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const [dbCertId, setDbCertId] = useState(initialCertId);
  const [dbIssueDate, setDbIssueDate] = useState(initialDate);

  useEffect(() => {
    let isMounted = true;
    async function syncUniqueCert() {
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
    syncUniqueCert();

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

  const verifyLink = `${window.location.origin}/verify-certificate?certId=${certId}`;

  // Print dialog for PDF saving
  const handlePrint = () => {
    window.print();
  };

  // Helper to generate 100% matching PNG data URL using html-to-image with Canvas fallback
  const generateCertificateImageDataUrl = async () => {
    if (certCardRef.current) {
      try {
        // High pixelRatio (3x) for ultra crisp text and graphics
        const dataUrl = await toPng(certCardRef.current, {
          quality: 1.0,
          pixelRatio: 3,
          cacheBust: true,
          filter: (node) => {
            // Exclude action overlays if any
            return !node.classList?.contains('exclude-from-export');
          }
        });
        return dataUrl;
      } catch (err) {
        console.warn('html-to-image failed, falling back to 2D Canvas rendering:', err);
      }
    }

    // ── FALLBACK: HTML5 2D CANVAS GENERATOR (2048 x 1446) ──────────────────
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/certificate_template.png';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1446;
    const ctx = canvas.getContext('2d');

    // 1. Draw Background Template
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Draw Student Name (Centered between AWARDED TO [Y~320px] and GOLD LINE [Y~450px] -> Y = 373px in 1024x723, scaled to 2048x1446 -> Y = 746px)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 76px "Cinzel", "Playfair Display", "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
    ctx.shadowBlur = 14;
    ctx.fillText(studentName.toUpperCase(), 1024, 746);

    // Reset shadow for metadata
    ctx.shadowBlur = 0;

    // 3. Draw Issue Date (Bottom-Left after "DATE :" at x=12.89% [264px], y=83.54% [1208px])
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 26px "Plus Jakarta Sans", "Inter", "Arial", sans-serif';
    ctx.fillStyle = '#E5C158';
    ctx.fillText(issueDate, 264, 1208);

    // 4. Draw Certificate ID (Bottom-Left after "CERTIFICATE ID :" at x=20.50% [420px], y=86.10% [1245px])
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillStyle = '#E5C158';
    ctx.fillText(certId, 420, 1245);

    return canvas.toDataURL('image/png', 1.0);
  };

  // High-Resolution PNG Image Download
  const handleDownloadPNG = async () => {
    setIsGeneratingPng(true);
    try {
      const dataUrl = await generateCertificateImageDataUrl();
      const link = document.createElement('a');
      const cleanFileName = `TH3ORY_Certificate_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.download = cleanFileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating certificate PNG:', err);
      window.print();
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // High-Resolution PDF Download using jsPDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const dataUrl = await generateCertificateImageDataUrl();
      
      // Create landscape A4 / US Letter PDF matching aspect ratio (1024x723)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1024, 723]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 1024, 723);
      const cleanFileName = `TH3ORY_Certificate_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(cleanFileName);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl space-y-4 print:space-y-0 print:w-full">
        {/* Top Action Controls Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base leading-tight">Official Certificate of Mastery</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {certId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf || isGeneratingPng}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isGeneratingPdf || isGeneratingPng}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{isGeneratingPng ? 'Generating PNG...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>

            {onClose && (
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>



        {/* ── CERTIFICATE CANVAS CONTAINER ─────────────────────────────────── */}
        <div 
          ref={certCardRef}
          className="relative w-full aspect-[1024/723] rounded-2xl overflow-hidden shadow-2xl bg-black border border-amber-500/30 select-none print:w-full print:rounded-none print:shadow-none print:border-none"
        >
          {/* Certificate Background Image Template */}
          <img
            src="/certificate_template.png"
            alt="TH3ORY Masterclass Certificate of Mastery"
            className="w-full h-full object-cover block"
          />

          {/* DYNAMIC OVERLAY 1: STUDENT NAME */}
          <div 
            className="absolute left-1/2 w-[80%] text-center pointer-events-none"
            style={{ top: '51.59%', transform: 'translate(-50%, -50%)' }}
          >
            <h2 className="text-[3.2vw] sm:text-[34px] md:text-[40px] font-serif font-extrabold uppercase tracking-wide text-white drop-shadow-[0_4px_12px_rgba(212,175,55,0.9)] leading-none truncate">
              {studentName}
            </h2>
          </div>

          {/* DYNAMIC OVERLAY 2: DATE OF COURSE COMPLETION */}
          <div 
            className="absolute pointer-events-none"
            style={{ left: '12.89%', top: '83.54%', transform: 'translateY(-50%)' }}
          >
            <span className="text-[1.3vw] sm:text-[13px] md:text-[15px] font-sans font-bold text-[#E5C158] tracking-wide leading-none">
              {issueDate}
            </span>
          </div>

          {/* DYNAMIC OVERLAY 3: DYNAMIC CERTIFICATE ID */}
          <div 
            className="absolute pointer-events-none"
            style={{ left: '20.50%', top: '86.10%', transform: 'translateY(-50%)' }}
          >
            <span className="text-[1.3vw] sm:text-[13px] md:text-[15px] font-mono font-bold text-[#E5C158] tracking-wide leading-none">
              {certId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

