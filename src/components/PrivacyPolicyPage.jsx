import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowLeft, Scale, Lock, Eye, Database, 
  Server, Clock, Key, Mail, ChevronDown, ChevronUp, 
  CheckCircle2, FileText, Sparkles
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import DPDPUserRightsPortal from './dpdp/DPDPUserRightsPortal';
import Footer from './Footer';

export default function PrivacyPolicyPage({ onBack }) {
  const [showFullLegalText, setShowFullLegalText] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] relative selection:bg-[#7C5CFC] selection:text-[#FAFAF7]">
      <SEOHead 
        title="Privacy & Data Rights Center | TH3ORY Online"
        description="Manage your privacy settings, communication preferences, data portability, and erasure rights in one place. Full compliance with DPDP Act 2023, GDPR, and IT Act 2000."
        canonicalUrl="https://th3ory.online/privacy"
      />
      <StructuredData />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-panel py-3.5 shadow-2xl border-b border-[#E9E4FF]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack || (() => { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); })}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Back to Main</span>
              </button>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
                className="flex items-center gap-2"
              >
                <Logo className="h-7 sm:h-9" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Statutory Compliance &amp; Data Rights
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-28 pb-10 relative overflow-hidden bg-gradient-to-b from-[#15171A] via-[#1c1f26] to-[#15171A]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[300px] bg-[#7C5CFC]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/30">
            <Scale className="w-4 h-4" /> Sovereign Data Principal Rights &bull; DPDP Act, 2023
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            PRIVACY &amp; <span className="text-gradient-gold">DATA RIGHTS</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Manage your essential privacy settings, notification preferences, and statutory data rights in a single streamlined place.
          </p>
        </div>
      </section>

      {/* MAIN SINGLE-SCROLL CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 space-y-8 text-left">
        
        {/* 1. INTERACTIVE PRIVACY & DATA RIGHTS PORTAL SEGMENT */}
        <DPDPUserRightsPortal onBack={onBack} hideSubProcessors={true} />

        {/* 2. FOUR PILLARS OF PRIVACY & TRUST */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card border border-white/10 bg-slate-950/60 shadow-xl space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Our Core Privacy Commitments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> 256-Bit Cryptographic Security
              </div>
              <p className="text-slate-400 leading-relaxed">
                All account data, progress, and communications are encrypted with AES-256 at rest and TLS 1.3 in transit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Zero Data Commercialization
              </div>
              <p className="text-slate-400 leading-relaxed">
                We never sell, broker, or rent student personal data to advertisers or third-party brokers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-[#7C5CFC]" /> Sovereign Indian Data Storage
              </div>
              <p className="text-slate-400 leading-relaxed">
                Primary student data is hosted securely in AWS Mumbai (ap-south-1) under Indian data sovereignty laws.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" /> 48-Hour Response Commitment
              </div>
              <p className="text-slate-400 leading-relaxed">
                All data subject requests, profile updates, and DPO inquiries are reviewed and resolved within 48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* 3. EXPANDABLE STATUTORY LEGAL POLICY ACCORDION */}
        <div className="rounded-3xl glass-card border border-slate-800 bg-slate-950/50 overflow-hidden shadow-lg">
          <button
            onClick={() => setShowFullLegalText(!showFullLegalText)}
            className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>View Full Statutory Policy Declaration</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Sections 1–7
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Detailed statutory disclosures for GDPR, DPDP Act 2023, CCPA, and IT Act 2000.
                </p>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              {showFullLegalText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showFullLegalText && (
            <div className="p-6 sm:p-8 border-t border-slate-800 bg-slate-950/90 space-y-8 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
              
              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" /> 1. Legislative Compliance &amp; Scope
                </h4>
                <p>
                  This Privacy Policy governs the processing of personal data by <strong className="text-white">TH3ORY Online</strong>, operated by Mentalist Sravan Production. We adhere to global standards including the Digital Personal Data Protection Act 2023 (India), GDPR (EU 2016/679), CCPA/CPRA, and IT Act 2000.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> 2. Categories of Data Processed
                </h4>
                <p>
                  Data processed includes: (a) Student Authentication &amp; Profile details (name, email, enrollment timestamp); (b) Learning Progress &amp; Habit Trackers (module completions, reflection scores); (c) Transaction References via Razorpay (order IDs and signatures — we never store raw card numbers or PINs); and (d) Communication inquiries.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#7C5CFC]" /> 3. Lawful Grounds for Processing
                </h4>
                <p>
                  Processing is conducted strictly under: Contractual Necessity (delivering enrolled masterclass lessons and issuing completion certificates), Legitimate Interests (fraud prevention and session lifecycle security), and Explicit Consent (optional notifications and surveys).
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" /> 4. Infrastructure &amp; Processors
                </h4>
                <p>
                  Infrastructure partners bound by strict Data Processing Agreements: Supabase Inc. (Encrypted Database &amp; Auth), Razorpay Software Ltd (PCI-DSS Compliant Payments), and Vercel Inc. (Edge CDN &amp; SSL).
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> 5. Session Lifetime &amp; Retention
                </h4>
                <p>
                  Student portal sessions expire automatically after 24 hours to safeguard unauthorized access on shared terminals. Account data is retained for active student duration or until an erasure request is executed via this portal.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 6. Statutory User Rights
                </h4>
                <p>
                  You possess the statutory right to access your data, request corrections, withdraw optional consent, export a machine-readable data package, and request account erasure under Section 12 of the DPDP Act 2023.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" /> 7. Data Protection Officer &amp; Grievance Redressal
                </h4>
                <p>
                  Grievance Redressal Officer: <strong className="text-white">Sravan Sudhakaran</strong>. Email: <span className="font-mono text-amber-400">privacy@th3ory.online</span>. Statutory response SLA: within 48 hours.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
