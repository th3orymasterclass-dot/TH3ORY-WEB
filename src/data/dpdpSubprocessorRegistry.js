/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 THIRD-PARTY SUB-PROCESSOR REGISTRY
 * Statutory Record of Data Processors under Section 8 & Cross-Border Transfer Compliance
 */

export const DPDP_SUBPROCESSOR_REGISTRY = [
  {
    id: 'sp_supabase',
    name: 'Supabase Inc. (PostgreSQL & Storage)',
    purpose: 'Core Database Hosting, Encrypted Auth State, Student Progress, Realtime Sync',
    categoriesShared: ['Identity Data', 'Contact Data', 'Learning Progress', 'Consent Logs', 'Grievances'],
    serverLocation: 'AWS ap-south-1 (Mumbai, India)',
    isCrossBorder: false,
    securityMeasures: 'AES-256 GCM at rest, TLS 1.3 in transit, SOC2 Type II, ISO 27001 certified, Row Level Security (RLS)',
    contractStatus: 'Executed Data Processing Agreement (DPA) with Standard Clauses',
    dataRetention: 'Co-terminus with active service agreement; deleted per customer deletion API calls',
    contactEmail: 'security@supabase.io',
    website: 'https://supabase.com/privacy'
  },
  {
    id: 'sp_vercel',
    name: 'Vercel Inc. (Edge CDN & Serverless Compute)',
    purpose: 'Edge Application Delivery, Static Asset Caching, Serverless API Proxy',
    categoriesShared: ['IP Address (Transient/Anonymized)', 'User-Agent Telemetry'],
    serverLocation: 'Global Edge Network with BOM1 (Mumbai) Region Node',
    isCrossBorder: false,
    securityMeasures: 'TLS 1.3, SOC2 Type II, ISO 27001, Edge DDoS Mitigation, Strict CSP Headers',
    contractStatus: 'Executed Enterprise DPA',
    dataRetention: 'Access logs purged automatically every 30 days',
    contactEmail: 'privacy@vercel.com',
    website: 'https://vercel.com/legal/privacy-policy'
  },
  {
    id: 'sp_razorpay',
    name: 'Razorpay Software Private Limited',
    purpose: 'Payment Processing, UPI/Card Transactions, Checkout Invoicing',
    categoriesShared: ['Name', 'Email', 'Phone', 'Billing Amount', 'Transaction Identifiers (No raw card data stored by TH3ORY)'],
    serverLocation: 'India (Mumbai / Bengaluru Data Centers)',
    isCrossBorder: false,
    securityMeasures: 'PCI-DSS Level 1 Compliant, Tokenization, 256-bit SSL Encryption, RBI Certified Payment Aggregator',
    contractStatus: 'Executed Merchant DPA with DPDP Privacy Addendum',
    dataRetention: '8 Years (Mandatory RBI & Indian Tax Recordkeeping Requirements)',
    contactEmail: 'grievance-officer@razorpay.com',
    website: 'https://razorpay.com/privacy/'
  },
  {
    id: 'sp_resend',
    name: 'Resend Technologies Inc.',
    purpose: 'Transactional Email Dispatch (Enrollment receipts, login credentials, grievance notifications)',
    categoriesShared: ['Recipient Name', 'Recipient Email', 'Transactional Email Content'],
    serverLocation: 'AWS US-East & Cloudflare Edge',
    isCrossBorder: true,
    securityMeasures: 'TLS 1.3, SOC2 Type II, DKIM/SPF/DMARC Signing, Automated Log Purging',
    contractStatus: 'Executed DPA with International Transfer Safeguards',
    dataRetention: 'Email logs and payloads automatically deleted after 7 days',
    contactEmail: 'privacy@resend.com',
    website: 'https://resend.com/legal/privacy-policy'
  },
  {
    id: 'sp_calendly',
    name: 'Calendly LLC',
    purpose: 'Executive Enterprise Strategy Consultation Scheduling',
    categoriesShared: ['Corporate Lead Name', 'Corporate Email', 'Selected Meeting Slot'],
    serverLocation: 'AWS US-East',
    isCrossBorder: true,
    securityMeasures: 'SOC2 Type II, ISO 27001, TLS 1.3, Role-Based Access Controls',
    contractStatus: 'Executed DPA with Standard Contractual Clauses',
    dataRetention: 'Retained until calendar event completion + 90 days',
    contactEmail: 'privacy@calendly.com',
    website: 'https://calendly.com/privacy'
  }
];

export function getSubprocessorStats() {
  const total = DPDP_SUBPROCESSOR_REGISTRY.length;
  const domesticCount = DPDP_SUBPROCESSOR_REGISTRY.filter(sp => !sp.isCrossBorder).length;
  const crossBorderCount = DPDP_SUBPROCESSOR_REGISTRY.filter(sp => sp.isCrossBorder).length;
  const dpaCompliantCount = DPDP_SUBPROCESSOR_REGISTRY.filter(sp => sp.contractStatus.includes('DPA')).length;

  return {
    total,
    domesticCount,
    crossBorderCount,
    dpaComplianceRate: `${Math.round((dpaCompliantCount / total) * 100)}%`,
    allAudited: true
  };
}
