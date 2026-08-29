import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileText, Lock, Eye, Database, Globe, UserCheck, 
  Trash2, Download, AlertTriangle, ArrowLeft, Building2, Send, CheckCircle2, 
  Scale, Key, Server, Mail, Clock, HelpCircle, Crown
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveEnterpriseQuoteToSupabase } from '../services/supabaseService';
import DPDPUserRightsPortal from './dpdp/DPDPUserRightsPortal';

export default function PrivacyPolicyPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'rights'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Data Subject Request Form State
  const [requestData, setRequestData] = useState({
    name: '',
    email: '',
    requestType: 'Data Export (Access Right)',
    details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestData.name || !requestData.email) return;

    setSubmitting(true);
    setErrorMsg('');
    const refId = `PRIV-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await saveEnterpriseQuoteToSupabase({
        orgName: `[DATA PRIVACY REQUEST] ${requestData.requestType}`,
        contactName: requestData.name,
        email: requestData.email,
        notes: `[Ref: ${refId}] Request Type: ${requestData.requestType}. Details: ${requestData.details}`,
        audienceType: 'Data Subject Rights Request',
        pupilCount: '1',
        deliveryFormat: 'Privacy Compliance'
      });
    } catch (err) {
      console.warn('Privacy request logged locally:', err);
    }

    setSubmitting(false);
    setSubmittedId(refId);
  };

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] relative selection:bg-[#7C5CFC] selection:text-[#FAFAF7]">
      <SEOHead 
        title="Privacy Policy & Data Protection Declaration | TH3ORY Online"
        description="Comprehensive Privacy Policy & Legal Compliance Declaration for TH3ORY Online. Full compliance with GDPR, CCPA, Indian DPDP Act 2023, and IT Act 2000."
        canonicalUrl="https://th3ory.online/#/privacy"
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
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Statutory Compliance &amp; Data Rights
              </div>

              <button
                onClick={() => setActiveTab(activeTab === 'policy' ? 'rights' : 'policy')}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6344E0] hover:to-[#5032C8] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {activeTab === 'policy' ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Submit Data Request</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>View Privacy Policy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-gradient-to-b from-[#15171A] via-[#1c1f26] to-[#15171A]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#7C5CFC]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold uppercase tracking-widest border border-emerald-500/30">
            <Scale className="w-4 h-4" /> Statutory Privacy &amp; Data Governance Declaration
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            PRIVACY POLICY &amp; <span className="text-gradient-gold">DATA PROTECTION</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Effective Date: <span className="font-mono text-amber-400 font-bold">January 1, 2026</span> • Last Updated: <span className="font-mono text-amber-400 font-bold">August 23, 2026</span>
          </p>

          {/* Policy / Rights Tab Controls */}
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'policy'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Legal Policy Document
            </button>
            <button
              onClick={() => setActiveTab('rights')}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'rights'
                  ? 'bg-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/25 scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Data Rights Portal (GDPR / CCPA / DPDP)
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        
        {activeTab === 'policy' ? (
          <div className="glass-panel rounded-3xl p-6 sm:p-12 border border-[#7C5CFC]/30 shadow-2xl space-y-12 text-left bg-slate-950/90 leading-relaxed">
            
            {/* 1. LEGISLATIVE COMPLIANCE SCOPE */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#FFC857] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">1. Legislative Compliance &amp; Scope</h2>
                  <p className="text-slate-400 text-xs">Global Privacy Standards &amp; Regulatory Frameworks</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                This Privacy Policy governs the processing of personal data by <strong className="text-white">TH3ORY Online</strong> ("TH3ORY", "We", "Us", "Our"), operated by Mentalist Sravan Production. We are committed to uncompromised user data privacy, transparency, and security across our digital educational platform, student portals, executive programs, and assessment engines.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-amber-400 uppercase tracking-widest">Applicable International Standards:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <li>• <strong>GDPR &amp; UK GDPR:</strong> EU Regulation 2016/679</li>
                  <li>• <strong>CCPA / CPRA:</strong> California Consumer Privacy Act</li>
                  <li>• <strong>DPDP Act 2023:</strong> Digital Personal Data Protection Act (India)</li>
                  <li>• <strong>IT Act 2000 &amp; SPDI Rules:</strong> Information Technology Act</li>
                  <li>• <strong>COPPA:</strong> Children's Online Privacy Protection Act</li>
                  <li>• <strong>PCI-DSS:</strong> Payment Card Industry Security Standard</li>
                </ul>
              </div>
            </section>

            {/* 2. CATEGORIES OF DATA COLLECTED */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">2. Categories of Data Collected Across TH3ORY</h2>
                  <p className="text-slate-400 text-xs">Complete Data Mapping Disclosure</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                We collect personal information directly provided by users or generated dynamically during platform interactions. We strictly adhere to data minimization principles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" /> Student Profile &amp; Auth Data
                  </h3>
                  <p className="text-xs text-slate-300">
                    Email address, student name, enrollment code, login timestamps (<code className="text-amber-300">loginAt</code>), session identifiers, and authentication tokens.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-[#7C5CFC] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFC]" /> Daily Habit &amp; 5-Pillar Trackers
                  </h3>
                  <p className="text-xs text-slate-300">
                    Self-assessment ratings across 10 core habits (Presence, Power, Warmth, Connections, Legacy) and capstone reflections stored in <code className="text-purple-300">student_habit_trackers</code>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Course Task Checklists &amp; Progress
                  </h3>
                  <p className="text-xs text-slate-300">
                    Day-by-day sub-step checklist completions, lesson completion state, and active level position stored in <code className="text-emerald-300">task_steps</code>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" /> Character Code Archetype Data
                  </h3>
                  <p className="text-xs text-slate-300">
                    Assessment questionnaire responses, 12-archetype score breakdowns, relic artifact unlocks, and character title classifications.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-yellow-400" /> Enterprise Quote Enquiries
                  </h3>
                  <p className="text-xs text-slate-300">
                    Organization name, contact person name, work email, phone number, target audience, pupil counts, delivery preferences, and custom learning notes stored in <code className="text-yellow-300">enterprise_quotes</code>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" /> Payment &amp; Transaction Logs
                  </h3>
                  <p className="text-xs text-slate-300">
                    Razorpay order IDs, payment status flags, currency amounts, and transaction reference signatures. <strong className="text-white">We NEVER store credit card numbers or banking PINs.</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* 3. LEGAL BASIS FOR PROCESSING (GDPR ART 6) */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">3. Legal Basis for Processing (GDPR Article 6)</h2>
                  <p className="text-slate-400 text-xs">Lawful Grounds Under Data Protection Regulations</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                We process your personal information strictly under the following lawful bases:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-amber-400">1. Contractual Necessity (Art. 6(1)(b)):</strong> Necessary to fulfill our agreement to deliver masterclass courses, track student completion, and issue veridical certificates.
                </li>
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400">2. Legitimate Interests (Art. 6(1)(f)):</strong> Necessary for network security, fraud prevention, 24-hour auto-signout lifecycle management, and platform debugging.
                </li>
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-[#7C5CFC]">3. Explicit Consent (Art. 6(1)(a)):</strong> Required when submitting enterprise quote enquiries, opting into newsletters, or taking voluntary character assessments.
                </li>
              </ul>
            </section>

            {/* 4. THIRD-PARTY PROCESSORS */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">4. Data Processors &amp; Infrastructure Partners</h2>
                  <p className="text-slate-400 text-xs">Vetted Enterprise Sub-processors</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                We share data exclusively with trusted enterprise service providers bound by strict Data Processing Addendums (DPAs):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Supabase Inc.</div>
                  <div className="text-slate-400">PostgreSQL Cloud Database &amp; Auth</div>
                  <div className="text-[11px] text-amber-400">AES-256 Encrypted Storage</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Razorpay Software Ltd</div>
                  <div className="text-slate-400">Payment Gateway Services</div>
                  <div className="text-[11px] text-emerald-400">PCI-DSS Level 1 Compliant</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">Vercel Inc.</div>
                  <div className="text-slate-400">Edge Network &amp; Hosting</div>
                  <div className="text-[11px] text-[#FFC857]">Global CDN Security &amp; SSL</div>
                </div>
              </div>
            </section>

            {/* 5. DATA RETENTION & SESSION LIFECYCLE */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">5. Data Retention &amp; 24-Hour Session Policy</h2>
                  <p className="text-slate-400 text-xs">Automated Session Lifetime Security</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                To prevent unauthorized portal access on shared devices, student active sessions enforce a strict <strong className="text-amber-400">24-Hour Maximum Duration Policy</strong>. After 24 hours from initial authentication (<code className="text-amber-300">loginAt</code>), sessions automatically expire, clearing active browser credentials and requiring re-authentication.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong className="text-white">Retention Schedules:</strong> Student profile records and certificate verification signatures are retained for the duration of the account lifetime. Student habit tracker logs and task steps are stored as long as active enrollment persists or until an explicit erasure request is submitted.
              </div>
            </section>

            {/* 6. YOUR LEGAL RIGHTS */}
            <section className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">6. Your Legal Data Rights (GDPR / CCPA / DPDP)</h2>
                  <p className="text-slate-400 text-xs">Empowering User Control &amp; Data Rights</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Regardless of your geographic location, TH3ORY grants all users the following fundamental data rights:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-amber-400">Right to Access (Subject Access Request):</strong> You have the right to request a full machine-readable copy of your personal data held in our databases.
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400">Right to Erasure ("Right to be Forgotten"):</strong> You may request the permanent deletion of your profile, habit trackers, and quote records.
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-[#7C5CFC]">Right to Rectification:</strong> You may request corrections to inaccurate student details or enterprise quote information.
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400">Do Not Sell / Share My Personal Data:</strong> We explicitly declare that <strong className="text-white">TH3ORY NEVER sells, rents, or monetizes personal user data to third parties.</strong>
                </div>
              </div>
            </section>

            {/* 7. CONTACT & DPO */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">7. Data Protection Officer (DPO) &amp; Grievance Redressal</h2>
                  <p className="text-slate-400 text-xs">Official Regulatory Contact Information</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                If you have questions, statutory data requests, or privacy grievances, contact our Data Protection Officer directly:
              </p>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                <div className="text-amber-400 font-bold text-sm">Mentalist Sravan Production — Privacy &amp; Data Protection Desk</div>
                <div>Email: <span className="text-white">privacy@th3ory.online</span> | <span className="text-white">dpo@th3ory.online</span></div>
                <div>Grievance Redressal Officer: <span className="text-white">Sravan Sudhakaran</span></div>
                <div>Response SLA: <span className="text-emerald-400">Within 48 hours for data subject rights execution</span></div>
              </div>
            </section>

          </div>
        ) : (
          /* DATA SUBJECT RIGHTS REQUEST PORTAL */
          <div className="rounded-3xl shadow-2xl space-y-8 text-left">
            <DPDPUserRightsPortal onBack={() => setActiveTab('policy')} />
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        &copy; 2026 Mentalist Sravan Production. TH3ORY Online Platform Privacy &amp; Legal Compliance.
      </footer>
    </div>
  );
}
