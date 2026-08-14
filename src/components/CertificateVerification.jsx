import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ShieldCheck, Download, Search, Sparkles, ExternalLink, GraduationCap, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { fetchCertificateById } from '../services/supabaseService';

export default function CertificateVerification({ initialCertId = 'TH3ORY-CERT-2026-99' }) {
  const [searchQuery, setSearchQuery] = useState(initialCertId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedCert, setVerifiedCert] = useState({
    certId: initialCertId,
    studentName: 'Alexander Vance',
    courseName: 'TH3ORY Masterclass of Influencing',
    issueDate: 'August 15, 2026',
    issuer: 'Mentalist Sravan Production',
    verificationStatus: 'VERIFIED & AUTHENTIC',
    skills: ['Non-Verbal Engineering', 'Cognitive Dynamics', 'Behavioral Calibration', 'High-Stakes Negotiation']
  });

  const performVerification = async (idToSearch) => {
    const cleanId = (idToSearch || '').trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setError('');

    const res = await fetchCertificateById(cleanId);
    if (res && res.verified) {
      setVerifiedCert({
        certId: res.certId || cleanId,
        studentName: res.studentName || 'Verified Graduate',
        courseName: res.courseName || 'TH3ORY Masterclass of Influencing',
        issueDate: res.issueDate ? new Date(res.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'August 15, 2026',
        issuer: 'Mentalist Sravan Production',
        verificationStatus: 'VERIFIED & AUTHENTIC',
        skills: ['Non-Verbal Engineering', 'Behavioral Dynamics', 'Influence Strategy', 'Cognitive Calibration']
      });
    } else {
      setError(`Certificate ID '${cleanId}' was not found in official registry.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialCertId && initialCertId !== 'TH3ORY-CERT-2026-99') {
      performVerification(initialCertId);
    }
  }, [initialCertId]);

  const handleSearch = (e) => {
    e.preventDefault();
    performVerification(searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center relative">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <a href="#" className="inline-block">
            <Logo className="h-10 mx-auto" />
          </a>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Official Certificate Verification Portal</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Verify authentic credentials issued by Mentalist Sravan Production</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Certificate ID (e.g. TH3ORY-CERT-2026-88)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Verify
          </button>
        </form>

        {/* Verified Certificate Card */}
        {verifiedCert && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
            
            {/* Top Verification Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-emerald-400 text-xs font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> {verifiedCert.verificationStatus}
                  </div>
                  <div className="text-slate-400 text-xs font-mono">ID: {verifiedCert.certId}</div>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" /> Print / Save PDF
              </button>
            </div>

            {/* Certificate Presentation Graphic */}
            <div className="border-4 border-double border-amber-500/30 rounded-2xl p-6 sm:p-10 bg-slate-950 text-center space-y-6 relative">
              <div className="text-amber-400 font-extrabold text-xs tracking-widest uppercase">Certificate of Completion</div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">{verifiedCert.studentName}</h2>
              
              <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                has successfully completed all 50 video modules, practical cognitive evaluations, and behavioral engineering assessments for:
              </p>

              <div className="text-lg sm:text-xl font-extrabold text-amber-300 max-w-xl mx-auto leading-snug">
                {verifiedCert.courseName}
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-around gap-6 border-t border-slate-900 text-left text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Issue Date</div>
                  <div className="text-slate-200 font-bold">{verifiedCert.issueDate}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Issued By</div>
                  <div className="text-slate-200 font-bold">{verifiedCert.issuer}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Verification URL</div>
                  <div className="text-amber-400 font-mono text-[11px]">th3ory.online/#/verify</div>
                </div>
              </div>
            </div>

            {/* Validated Skills */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Authenticated Competencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {verifiedCert.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <a href="#" className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
            ← Return to TH3ORY Masterclass Homepage
          </a>
        </div>

      </div>
    </div>
  );
}
