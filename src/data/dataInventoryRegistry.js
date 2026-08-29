/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 DATA INVENTORY & CLASSIFICATION REGISTRY
 * Statutory Data Mapping under Section 4 & Privacy by Design Principles
 */

export const DPDP_DATA_INVENTORY = [
  {
    table: 'enrollments',
    dataDomain: 'Student Commerce & Transactions',
    dataOwner: 'Head of Finance & Operations',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'name',
        category: 'Personal Data (Direct Identifier)',
        purpose: 'Order fulfillment, student identification, certificate issuance',
        lawfulBasis: 'Contractual Obligation / Consent (S.4(1)(a))',
        consentRequired: true,
        retentionPeriod: '8 Years (Statutory Tax & Accounting Compliance)',
        accessRoles: ['Admin', 'Finance Lead', 'Student']
      },
      {
        field: 'email',
        category: 'Personal Data (Direct Identifier & Auth)',
        purpose: 'Course delivery, authentication, communication, receipts',
        lawfulBasis: 'Contractual Obligation / Consent (S.4(1)(a))',
        consentRequired: true,
        retentionPeriod: '8 Years (Statutory Compliance)',
        accessRoles: ['Admin', 'Support', 'Student']
      },
      {
        field: 'phone',
        category: 'Personal Data (Contact Telemetry)',
        purpose: 'Urgent cohort notifications, WhatsApp learning dispatch (optional)',
        lawfulBasis: 'Explicit Consent (S.6)',
        consentRequired: true,
        retentionPeriod: '5 Years post-completion',
        accessRoles: ['Admin', 'Support', 'Student']
      },
      {
        field: 'dob',
        category: 'Personal Data (Age Verification)',
        purpose: 'Section 9 verification of majority (>18) / parental consent requirement',
        lawfulBasis: 'Legal Compliance (DPDP S.9)',
        consentRequired: true,
        retentionPeriod: 'Duration of account activity',
        accessRoles: ['Admin', 'Compliance Officer', 'Student']
      },
      {
        field: 'amount_paid, currency, order_id',
        category: 'Financial Information',
        purpose: 'Transaction reconciliation, GST audit, Razorpay verification',
        lawfulBasis: 'Legal Obligation (Indian Income Tax & Companies Act)',
        consentRequired: false,
        retentionPeriod: '8 Years (Statutory Tax Compliance)',
        accessRoles: ['Admin', 'Finance Lead']
      },
      {
        field: 'address, city, country',
        category: 'Personal Data (Geographic Telemetry)',
        purpose: 'Tax calculation, physical welcome kit shipment, geo-compliance',
        lawfulBasis: 'Contractual Obligation / Consent',
        consentRequired: true,
        retentionPeriod: '8 Years (Statutory Tax Compliance)',
        accessRoles: ['Admin', 'Operations']
      }
    ]
  },
  {
    table: 'student_accounts',
    dataDomain: 'Student Learning & Identity',
    dataOwner: 'Head of Learning Experience',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'email, name',
        category: 'Personal Data (Authentication)',
        purpose: 'Portal access, identity management, personalized study arc',
        lawfulBasis: 'Contractual Fulfillment (S.4(1)(a))',
        consentRequired: true,
        retentionPeriod: 'Lifetime of account or until verified erasure request',
        accessRoles: ['Student', 'Admin']
      },
      {
        field: 'bio, profession, avatar_url',
        category: 'Optional Profile Data',
        purpose: 'Student dashboard personalization, community networking',
        lawfulBasis: 'Explicit Consent (S.6)',
        consentRequired: true,
        retentionPeriod: 'Until deleted or modified by student',
        accessRoles: ['Student', 'Admin']
      },
      {
        field: 'last_login',
        category: 'Security & Access Telemetry',
        purpose: 'Session security, dormant account evaluation, breach detection',
        lawfulBasis: 'Security by Design (S.8)',
        consentRequired: false,
        retentionPeriod: '90 Days',
        accessRoles: ['System', 'Admin']
      }
    ]
  },
  {
    table: 'ambassador_applications',
    dataDomain: 'Campus Ambassador Network',
    dataOwner: 'Campus Growth Lead',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'name, email, phone, college_name',
        category: 'Personal Data (Ambassador Candidate)',
        purpose: 'Recruitment screening, onboarding, commission dispatch',
        lawfulBasis: 'Explicit Consent (S.6)',
        consentRequired: true,
        retentionPeriod: '1 Year for rejected applicants; 3 Years for active ambassadors',
        accessRoles: ['Team', 'Admin', 'Ambassador']
      },
      {
        field: 'social_handles, leadership_exp, motivation',
        category: 'Candidate Evaluation Data',
        purpose: 'Application evaluation and suitability assessment',
        lawfulBasis: 'Explicit Consent (S.6)',
        consentRequired: true,
        retentionPeriod: 'Duration of recruitment cycle + 180 days',
        accessRoles: ['Team', 'Admin']
      },
      {
        field: 'payout_details (UPI / Bank)',
        category: 'Financial Information (Commission Payouts)',
        purpose: 'Disbursement of referral commissions and performance bonuses',
        lawfulBasis: 'Contractual Agreement & Tax Obligation',
        consentRequired: true,
        retentionPeriod: '8 Years (Statutory Tax Compliance)',
        accessRoles: ['Finance Lead', 'Admin', 'Ambassador']
      }
    ]
  },
  {
    table: 'enterprise_quotes',
    dataDomain: 'B2B Enterprise & Corporate Quotes',
    dataOwner: 'Head of Enterprise Sales',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'contact_name, email, phone, designation',
        category: 'Business Contact Personal Data',
        purpose: 'Executive consultation, corporate quote generation, proposal dispatch',
        lawfulBasis: 'Legitimate Use / Inquired Consent (S.4(1)(b))',
        consentRequired: true,
        retentionPeriod: '2 Years post-inquiry or until erasure request',
        accessRoles: ['Sales Team', 'Admin']
      },
      {
        field: 'org_name, industry, employee_size',
        category: 'Sensitive Business Information',
        purpose: 'Tailoring customized corporate training architecture',
        lawfulBasis: 'Pre-contractual Negotiation',
        consentRequired: false,
        retentionPeriod: '3 Years',
        accessRoles: ['Sales Team', 'Admin']
      }
    ]
  },
  {
    table: 'dpdp_consent_records',
    dataDomain: 'Statutory DPDP Compliance Proof',
    dataOwner: 'Data Protection Officer (DPO)',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'email, consent_type, status, version, ip_address, user_agent, timestamp',
        category: 'Statutory Compliance Audit Evidence',
        purpose: 'Proof of explicit affirmative consent and revocations under DPDP Act S.6',
        lawfulBasis: 'Legal Compliance (DPDP Act 2023)',
        consentRequired: false,
        retentionPeriod: '5 Years (Statutory Compliance Defense)',
        accessRoles: ['DPO', 'Compliance Auditor', 'Data Principal (View Own)']
      }
    ]
  },
  {
    table: 'dpdp_grievances',
    dataDomain: 'Grievance Redressal Mechanism',
    dataOwner: 'Data Protection Officer (DPO)',
    storageLocation: 'Supabase PostgreSQL (AWS Mumbai Region)',
    encryptionAtRest: 'AES-256 GCM',
    encryptionInTransit: 'TLS 1.3',
    fields: [
      {
        field: 'ticket_id, email, subject, description, resolution_notes, sla_deadline',
        category: 'Statutory Grievance Ledger',
        purpose: 'Redressal of Data Principal complaints under Section 13 within 30-day SLA',
        lawfulBasis: 'Legal Compliance (DPDP Act 2023 S.13)',
        consentRequired: false,
        retentionPeriod: '5 Years from resolution date',
        accessRoles: ['DPO', 'Data Principal', 'Admin']
      }
    ]
  }
];

export function getCompleteDataInventorySummary() {
  const totalTables = DPDP_DATA_INVENTORY.length;
  let totalFields = 0;
  const categoriesCount = {};

  DPDP_DATA_INVENTORY.forEach(tbl => {
    tbl.fields.forEach(f => {
      totalFields++;
      const cat = f.category.split('(')[0].trim();
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });
  });

  return {
    totalTables,
    totalFields,
    categoriesCount,
    complianceStandard: "DPDP Act, 2023 (India) & ISO/IEC 27701",
    lastAudited: "2026-08-29"
  };
}
