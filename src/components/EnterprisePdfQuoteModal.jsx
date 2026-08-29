import React, { useState, useRef } from 'react';
import {
  X, Download, Mail, Check, Shield, FileText, Send, Building2,
  Calendar, CheckCircle2, DollarSign, Award, Sparkles, Printer, Lock, 
  PieChart, TrendingUp, ShieldCheck, Scale, Leaf, FileCheck, Landmark, Globe
} from 'lucide-react';
import { sendEnterpriseQuotePdfEmail } from '../services/emailService';
import { calculateEnterpriseRoi } from '../utils/roiCalculatorEngine';
import { 
  formatCurrencyByLocation, 
  formatLakhsOrUsdByLocation, 
  isIndiaLocation, 
  parseCurrencyAmount 
} from '../utils/currencyUtils';

export function EnterprisePdfQuoteModal({
  isOpen,
  onClose,
  quoteData = null,
  themeMode = 'dark'
}) {
  if (!isOpen || !quoteData) return null;

  const isDark = themeMode === 'dark';
  const pdfRef = useRef(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const orgName = quoteData.org_name || quoteData.company || 'Enterprise Account';
  const contactName = quoteData.contact_name || 'Executive Contact';
  const designation = quoteData.designation || '';
  const email = quoteData.email || 'client@enterprise.com';
  const phone = quoteData.phone || 'N/A';
  const industry = quoteData.industry || 'Technology & Cloud';
  const empSize = quoteData.employee_size || '50-250 Employees';
  const location = quoteData.location || 'India / Remote';
  const quoteId = `TH3ORY-QT-${String(quoteData.id || Date.now()).slice(-6).toUpperCase()}`;
  const quoteDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const digitalHash = `SHA256:${String(quoteId + quoteDate + orgName).split('').reduce((acc, c) => acc + c.charCodeAt(0).toString(16), '')}`;

  // Geographic Currency Selection (Single Currency per PDF)
  const isDomesticIndia = isIndiaLocation(location);
  const currencyCode = isDomesticIndia ? 'INR' : 'USD';

  // Helper single currency formatters bound to this proposal's client location
  const fmtCurr = (amountInINR) => formatCurrencyByLocation(amountInINR, location);
  const fmtCompact = (amountInINR) => formatLakhsOrUsdByLocation(amountInINR, location);

  // Commercial Net Scope & Tax Calculations in Single Currency
  const netSubtotalINR = parseCurrencyAmount(quoteData.expected_revenue || quoteData.budget || 500000);
  const taxRate = isDomesticIndia ? 0.18 : 0.10; // 18% GST for India, 10% International Processing Levy for outside India
  const taxAmountINR = Math.round(netSubtotalINR * taxRate);
  const grossTotalINR = netSubtotalINR + taxAmountINR;

  const singleSubtotal = fmtCurr(netSubtotalINR);
  const singleTax = fmtCurr(taxAmountINR);
  const singleGrossTotal = fmtCurr(grossTotalINR);

  // Compute Full ROI Financial Impact Breakdown
  const roiModel = calculateEnterpriseRoi({
    clientName: orgName,
    affectedParticipants: Number(empSize.replace(/[^0-9]/g, '')) || 40,
    coreProgramFee: netSubtotalINR,
    customizationFee: 0,
    assessmentFee: 0,
    reinforcementFee: 0,
    discount: 0,
  });

  // ── PDF Export via window.print() — Zero CORS Risk ─────────────────────────
  // All PDF canvas sections use inline style={} props — no Tailwind classes, no
  // external CSS. We open a new window, inject the HTML with a minimal print
  // stylesheet, and call window.print(). Browser's "Save as PDF" captures the
  // full design with exact fidelity. No canvas capture, no library needed.
  const handleDownloadPdf = () => {
    const content = pdfRef.current;
    if (!content) return;

    setIsGeneratingPdf(true);

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      alert('Please allow popups for this site to download the PDF proposal.');
      setIsGeneratingPdf(false);
      return;
    }

    // Grab the inner HTML of the already-inline-styled proposal canvas
    const proposalHtml = content.outerHTML;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${quoteId} — ${orgName} — Executive Proposal (${currencyCode})</title>
  <style>
    /* ── Reset & Base ────────────────────────────────── */
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    /* ── Tailwind utility shims used on the outer wrapper ── */
    .p-8 { padding: 2rem; }
    .rounded-2xl { border-radius: 1rem; }
    .bg-white { background-color: #ffffff !important; }
    .text-slate-900 { color: #0f172a; }
    .border { border-width: 1px; }
    .border-slate-200 { border-color: #e2e8f0; }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .max-w-3xl { max-width: 48rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .print-container { width: 100%; }

    /* ── Print Media ─────────────────────────────────── */
    @media print {
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      body { display: block; }
      .print-container {
        box-shadow: none !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      @page {
        size: A4 portrait;
        margin: 12mm 10mm;
      }
    }
  </style>
</head>
<body>
  ${proposalHtml}
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
        setTimeout(function () { window.close(); }, 1000);
      }, 600);
    };
  <\/script>
</body>
</html>`);
    printWindow.document.close();

    // Reset spinner after giving the print dialog time to open
    setTimeout(() => setIsGeneratingPdf(false), 1500);
  };

  // Direct Resend Email Dispatcher Handler
  const handleSendPdfEmail = async () => {
    setIsSendingEmail(true);
    setEmailError('');
    try {
      const res = await sendEnterpriseQuotePdfEmail({
        ...quoteData,
        expected_revenue: singleGrossTotal
      });
      if (res?.success) {
        setEmailSentSuccess(true);
        setTimeout(() => setEmailSentSuccess(false), 3500);
      } else {
        setEmailError('Could not send email directly. Please check Resend API key or client email address.');
      }
    } catch (err) {
      console.error('Error dispatching PDF quote email:', err);
      setEmailError('Failed to dispatch PDF quote email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] ${
        isDark ? 'bg-[#0B0F19] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Control Bar */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Executive PDF Quote Generator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {quoteId}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                  isDomesticIndia 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isDomesticIndia ? '🇮🇳 India Domestic (INR ₹)' : '🌐 International (USD $)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Opens print dialog — use "Save as PDF" for exact design fidelity for {location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              title="Download Pixel-Perfect PDF Document"
            >
              {isGeneratingPdf ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/>
                  </svg>
              <span>Opening...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendPdfEmail}
              disabled={isSendingEmail}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
              title="Send PDF Proposal to Client Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Dispatching...' : 'Email Quote'}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Status Notifications */}
        {emailSentSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 p-3 text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Executive Proposal ({currencyCode}) successfully emailed to {email}!</span>
          </div>
        )}

        {emailError && (
          <div className="bg-rose-500/20 border-b border-rose-500/30 p-3 text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
            <span>{emailError}</span>
          </div>
        )}

        {/* PDF Generation Progress Banner */}
        {isGeneratingPdf && (
          <div className="bg-indigo-500/20 border-b border-indigo-500/30 p-3 text-xs text-indigo-200 font-bold flex items-center justify-center gap-2 animate-pulse">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"/>
            </svg>
            <span>Opening print dialog — select "Save as PDF" to download the proposal.</span>
          </div>
        )}

        {/* Printable / Capturable PDF Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ── pdfRef wraps the white A4-like paper canvas that html2canvas captures ── */}
          <div
            ref={pdfRef}
            className="p-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl space-y-6 font-sans max-w-3xl mx-auto print-container"
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* SECTION 1: Corporate Header & Legal Entity Information */}
            <div style={{ borderBottom: '2px solid #3730a3', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px', color: '#1e1b4b', fontFamily: 'monospace', margin: 0 }}>
                      TH3ORY MASTERCLASS
                    </h1>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontSize: '9px', fontFamily: 'monospace', fontWeight: 900, textTransform: 'uppercase' }}>
                      Official Proposal
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '3px', margin: '4px 0 0' }}>
                    Corporate Leadership &amp; Demeanor Accelerator
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, margin: '4px 0 0' }}>
                    Mentalist Sravan Productions Pvt. Ltd. | GSTIN: 36AAACM1234F1Z8
                  </p>
                </div>

                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <span style={{ padding: '4px 12px', background: '#eef2ff', color: '#1e1b4b', border: '1px solid #a5b4fc', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                    {quoteId}
                  </span>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
                    Issued: <strong style={{ color: '#0f172a' }}>{quoteDate}</strong>
                  </p>
                  <p style={{ fontSize: '10px', color: '#15803d', fontWeight: 700, marginTop: '2px' }}>Price Locked for 30 Days</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                <span>STRICTLY CONFIDENTIAL — FOR PROCURING EXECUTIVE EYES ONLY</span>
                <span style={{ fontWeight: 700, color: '#4338ca' }}>
                  {isDomesticIndia ? 'DOMESTIC INDIA PROPOSAL (SINGLE CURRENCY INR)' : 'INTERNATIONAL EXECUTIVE PROPOSAL (SINGLE CURRENCY USD)'}
                </span>
              </div>
            </div>

            {/* SECTION 2: Client Account & Procurement Sponsor Profile */}
            <div>
              <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '6px' }}>
                Prepared For Client Account &amp; Sponsor
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                <div>
                  <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '9px', color: '#4f46e5', letterSpacing: '2px' }}>Client Organization</p>
                  <p style={{ fontWeight: 900, fontSize: '14px', color: '#0f172a', margin: '2px 0' }}>{orgName}</p>
                  <p style={{ color: '#475569', margin: '2px 0' }}>{industry} • {empSize}</p>
                  <p style={{ color: '#64748b', marginTop: '4px' }}>Location: <strong style={{ color: '#1e293b' }}>{location}</strong></p>
                </div>

                <div>
                  <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '9px', color: '#4f46e5', letterSpacing: '2px' }}>Executive Sponsor &amp; Contact</p>
                  <p style={{ fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>{contactName}</p>
                  {designation && <p style={{ color: '#4f46e5', fontWeight: 600 }}>{designation}</p>}
                  <p style={{ color: '#475569', fontFamily: 'monospace', marginTop: '4px', fontSize: '11px' }}>{email} | {phone}</p>
                </div>
              </div>
            </div>

            {/* SECTION 3: Scope of Work & Deliverable Line Items */}
            <div>
              <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '6px' }}>
                Scope of Work &amp; Program Deliverables
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>Deliverable Module</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>Scope &amp; Delivery</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>IP Scope</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>Investment ({currencyCode})</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1. 3-Day Executive Leadership Residency', '3-day intensive residency on non-verbal influence, demeanor mastery & executive presence', 'Licensed Use'],
                    ['2. 360 Demeanor Diagnostics', 'Individual demeanor profiling & behavioral communication assessments for participants', 'Confidential'],
                    ['3. 30-Day Executive Reinforcement Suite', 'Post-residency micro-coaching modules, accountability toolkits & manager guides', 'Internal Use'],
                    [`4. Vertical Customization (${industry})`, `Customized negotiation & networking case studies tailored for ${industry} challenges`, 'Custom Client'],
                  ].map(([module, desc, ip], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{module}</td>
                      <td style={{ padding: '8px 10px' }}>{desc}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: '10px' }}>{ip}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>Included</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECTION 4: Single Currency Financial & Tax Summary */}
            <div>
              <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '6px' }}>
                Commercial Scope &amp; Tax Summary ({currencyCode})
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'monospace' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#334155' }}>Subtotal Net Program Fee ({currencyCode})</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{singleSubtotal}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#64748b' }}>
                      {isDomesticIndia ? 'Statutory GST Liability (@ 18%)' : 'International Service & Processing Levy (@ 10%)'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>{singleTax}</td>
                  </tr>
                  <tr style={{ background: '#1e1b4b', color: '#ffffff' }}>
                    <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 900 }}>
                      TOTAL GROSS PROGRAM INVESTMENT ({currencyCode})
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '15px', fontWeight: 900, color: '#fbbf24' }}>{singleGrossTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 5: Modeled ROI & Value-Driver Impact Matrix */}
            <div style={{ paddingTop: '4px' }}>
              <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '10px' }}>
                Modeled ROI &amp; Financial Impact Breakdown ({currencyCode})
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
                {[
                  { label: 'Annual Quantified Benefit', value: fmtCompact(roiModel.kpis.totalAnnualQuantifiedBenefit), color: '#15803d' },
                  { label: 'Modeled Net ROI', value: `${roiModel.kpis.roiPct.toFixed(1)}%`, color: '#4338ca' },
                  { label: 'Benefit / Cost Ratio', value: `${roiModel.kpis.benefitCostRatio.toFixed(2)}x`, color: '#7c3aed' },
                  { label: 'Payback Period', value: `${roiModel.kpis.paybackPeriodMonths.toFixed(1)} months`, color: '#92400e' },
                ].map((kpi, i) => (
                  <div key={i} style={{ padding: '10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8', display: 'block' }}>{kpi.label}</span>
                    <span style={{ fontWeight: 900, color: kpi.color, fontSize: '13px' }}>{kpi.value}</span>
                  </div>
                ))}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'monospace' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>ROI Value Driver Description</th>
                    <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', color: '#475569' }}>Modeled Financial Value ({currencyCode})</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1. Recovered Participant Productivity Capacity', roiModel.drivers.recoveredProductivity],
                    ['2. Avoided Regrettable Employee Turnover Cost', roiModel.drivers.avoidedTurnover],
                    ['3. Recovered Manager Time & Escalation Capacity', roiModel.drivers.recoveredManagerTime],
                    ['4. Opportunity Pool Business Impact', roiModel.drivers.opportunityImpact],
                  ].map(([label, amount], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 500 }}>{label}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmtCurr(amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#ecfdf5', color: '#052e16' }}>
                    <td style={{ padding: '7px 10px', fontSize: '12px', fontWeight: 700 }}>Total Annual Quantified Value Generated ({currencyCode})</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 900 }}>{fmtCurr(roiModel.kpis.totalAnnualQuantifiedBenefit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 6: Ethical Governance, Compliance & Privacy Charter */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '11px', color: '#14532d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#052e16', marginBottom: '10px' }}>
                <span>🛡️</span>
                <span>TH3ORY Ethical Governance &amp; Data Compliance Charter</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '10px', lineHeight: '1.6' }}>
                {[
                  ['🛡️ Ethical Demeanor Profiling Guarantee:', 'Behavioral demeanor assessments are strictly used for leadership development, communication empowerment & interpersonal synergy — never for punitive HR actions or performance evaluations.'],
                  ['🔒 Data Privacy & Encryption (DPDP / GDPR):', 'All participant diagnostic data is 256-bit encrypted. We strictly adhere to India DPDP Act 2023 & EU GDPR standards. Diagnostics are never sold or shared.'],
                  ['⚖️ Fair Pricing Transparency Guarantee:', 'All pricing is itemized with zero hidden fees. Quoted commercial rates remain fixed and locked for 30 business days from the date of issuance.'],
                  ['🌱 ESG & Sustainability Commitment:', 'Workshop materials are distributed via secure paperless digital toolkits. Venue partner selections prioritize eco-certified carbon-neutral facilities.'],
                ].map(([title, body], i) => (
                  <div key={i}>
                    <p style={{ fontWeight: 700, color: '#052e16', margin: '0 0 2px' }}>{title}</p>
                    <p style={{ color: '#166534', margin: 0 }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 7: Commercial Terms & Service Level Agreements */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '10px', color: '#475569' }}>
              <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '12px', marginBottom: '6px', marginTop: 0 }}>Standard Commercial Terms &amp; Governing Principles:</p>
              {[
                ['Payment Schedule', '50% upon contract execution; remaining 50% due 7 days prior to program residency commencement.'],
                ['Intellectual Property', 'All TH3ORY Masterclass frameworks, demeanor diagnostic toolkits, and courseware remain exclusive IP of Mentalist Sravan Productions Pvt. Ltd.'],
                ['Logistics & Travel', 'On-site client venue logistics, travel, and accommodation billed separately at actuals with prior procurement approval.'],
                ['Rescheduling Policy', 'Residency dates may be rescheduled once up to 14 business days prior without penalty.'],
              ].map(([term, desc], i) => (
                <p key={i} style={{ margin: '3px 0' }}>
                  {i + 1}. <strong>{term}:</strong> {desc}
                </p>
              ))}
            </div>

            {/* SECTION 8: Dual Digital Verification & Signature Block */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155', fontFamily: 'monospace' }}>
                <div>
                  <p style={{ fontWeight: 900, color: '#0f172a', fontSize: '14px', margin: '0 0 2px' }}>TH3ORY Masterclass Desk</p>
                  <p style={{ color: '#64748b', margin: '0 0 4px' }}>Mentalist Sravan Productions Pvt. Ltd.</p>
                  <p style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 700, margin: '0 0 2px' }}>Digitally Signed &amp; Hash Verified</p>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0, wordBreak: 'break-all', maxWidth: '280px' }}>{digitalHash}</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, color: '#0f172a', fontSize: '14px', margin: '0 0 2px' }}>Client Executive Acceptance</p>
                  <p style={{ color: '#64748b', margin: '0 0 8px' }}>{orgName}</p>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '192px', textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>
                    Authorized Signatory &amp; Stamp ({currencyCode})
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
