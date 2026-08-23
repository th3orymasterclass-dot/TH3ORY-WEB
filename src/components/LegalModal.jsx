import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, AlertCircle } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Legal & Compliance Documentation</h2>
              <p className="text-xs text-slate-400">TH3ORY Masterclass • Mentalist Sravan Production</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Terms of Service
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'refund'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> 14-Day Refund Guarantee
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'disclaimer'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" /> Disclaimer
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#FFC857] gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Full Statutory Privacy &amp; Data Rights Declaration</div>
                  <div className="text-xs text-slate-300">Compliant with GDPR Article 6, CCPA, and Indian DPDP Act 2023</div>
                </div>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onClose) onClose();
                    window.location.hash = 'privacy';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                >
                  View Full Policy Page →
                </a>
              </div>

              <h3 className="text-base font-bold text-white">Privacy Policy Overview</h3>
              <p>Last updated: August 2026</p>
              <p>
                At <strong>TH3ORY Masterclass</strong> ("Mentalist Sravan Production"), we prioritize your privacy and data security. This Privacy Policy outlines how we collect, process, and protect your personal information when enrolling in our educational courses or accessing our Student Portal.
              </p>

              <h4 className="text-sm font-bold text-amber-400 pt-2">1. Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Account & Identity Details: Full name, email address, phone number, profession, and date of birth provided during checkout.</li>
                <li>Payment Information: Payment status, transaction ID, currency, and payment gateway details (processed securely via PCI-DSS compliant providers Stripe & Razorpay). We do NOT store credit card or bank account details.</li>
                <li>Learning Progress Data: Module view history, resource downloads, and query communications.</li>
              </ul>

              <h4 className="text-sm font-bold text-amber-400 pt-2">2. How We Use Your Data</h4>
              <p>
                Your data is exclusively used to grant access to course materials, generate student login credentials, process order transactions, send transactional receipts, and deliver course support updates.
              </p>

              <h4 className="text-sm font-bold text-amber-400 pt-2">3. Third-Party Services</h4>
              <p>
                We integrate with trusted service providers: Supabase (encrypted database hosting), Resend (transactional email dispatch), and Stripe / Razorpay (payment processing). None of your information is sold or rented to third-party advertisers.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Terms of Service</h3>
              <p>Last updated: August 2026</p>
              <p>
                By purchasing or accessing the <strong>TH3ORY Masterclass</strong> course materials, you agree to comply with the following Terms of Service:
              </p>

              <h4 className="text-sm font-bold text-amber-400 pt-2">1. Educational Purpose & Intellectual Property</h4>
              <p>
                All video lessons, workbooks, PDFs, frameworks, and masterclass resources are the exclusive intellectual property of Mentalist Sravan Production. Your enrollment grants a non-transferable, single-user license. Redistribution, recording, sharing login credentials, or unauthorized resale of course content is strictly prohibited and subject to legal action.
              </p>

              <h4 className="text-sm font-bold text-amber-400 pt-2">2. Student Portal Access & Account Conduct</h4>
              <p>
                Each student receives a unique Enrollment Code. Sharing your enrollment credentials with multiple users may trigger automated security account lockouts.
              </p>

              <h4 className="text-sm font-bold text-amber-400 pt-2">3. Payment & Pricing Terms</h4>
              <p>
                Course fees are charged at the time of checkout. Prices displayed on our website are inclusive of applicable digital access taxes.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">14-Day 100% Money-Back Guarantee</h3>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <strong>Zero Risk Guarantee:</strong> Test the first 2 modules of TH3ORY Masterclass for up to 14 days. If you feel it does not deliver transformation, submit a support query for a 100% refund.
              </div>

              <h4 className="text-sm font-bold text-amber-400 pt-2">Refund Terms & Eligibility</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Refund requests must be submitted within 14 calendar days from the date of purchase.</li>
                <li>Submit your request directly via the Student Portal support tab or email support at <code>th3orymasterclass@gmail.com</code> with your Order ID.</li>
                <li>Refunds are processed within 3-5 business days back to your original payment method (Stripe / Razorpay / UPI).</li>
              </ul>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Legal & Earnings Disclaimer</h3>
              <p>
                The techniques taught in <strong>TH3ORY Masterclass</strong> regarding cognitive influence, negotiation, and behavioral dynamics are for educational and ethical self-improvement purposes only.
              </p>

              <p className="text-slate-400">
                Individual results, negotiation outcomes, and personal application will vary depending on effort, dedication, and personal context. Mentalist Sravan Production makes no implicit or explicit guarantees regarding financial gains or specific career advancement.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all uppercase tracking-wider"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
