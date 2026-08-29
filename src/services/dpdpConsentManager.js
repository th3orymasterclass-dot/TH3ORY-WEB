/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 CENTRALIZED CONSENT MANAGEMENT MODULE
 * Explicit Affirmative Consent Capture, Purpose Unbundling & Immediate Cessation Engine
 */

import { supabase } from '../lib/supabase.js';
import { logPrivacyAuditEvent } from './dpdpAuditService.js';

export const CONSENT_PURPOSES = {
  ACCOUNT_CREATION: {
    id: 'account_creation',
    title: 'Account Creation & Course Delivery (Mandatory for Learning)',
    description: 'Processing name, email, and authentication state to deliver the 30-Day Masterclass video lessons and modules.',
    lawfulBasis: 'Contractual Obligation / Consent (S.4(1)(a))',
    mandatory: true
  },
  MARKETING_COMMUNICATIONS: {
    id: 'marketing_communications',
    title: 'Product Announcements & Cohort Updates (Optional)',
    description: 'Receiving announcements regarding upcoming masterclasses, guest speaker webinars, and special discount privileges.',
    lawfulBasis: 'Explicit Consent (S.6)',
    mandatory: false
  },
  ANALYTICS_COOKIES: {
    id: 'analytics_cookies',
    title: 'Platform Analytics & Performance Telemetry (Optional)',
    description: 'Anonymous usage telemetry to diagnose video streaming latency and improve curriculum usability.',
    lawfulBasis: 'Explicit Consent (S.6)',
    mandatory: false
  },
  RECOMMENDATIONS_PERSONALIZATION: {
    id: 'recommendations_personalization',
    title: 'AI Behavioral Feedback & Lesson Personalization (Optional)',
    description: 'Tailoring customized daily reflection exercises and executive speech practice modules.',
    lawfulBasis: 'Explicit Consent (S.6)',
    mandatory: false
  },
  SUBPROCESSOR_TRANSFERS: {
    id: 'subprocessor_transfers',
    title: 'Third-Party Delivery Infrastructure (Mandatory for Service)',
    description: 'Authorized encrypted transfer to Supabase (Database), Razorpay (Payment Processing), and Resend (Email Delivery).',
    lawfulBasis: 'Contractual Obligation / Legitimate Use',
    mandatory: true
  }
};

const CONSENT_POLICY_VERSION = '2026.1';

/**
 * Records explicit affirmative consent for a specific Data Principal
 */
export async function recordDPDPConsent({
  email,
  userId = null,
  consents = {}, // { account_creation: true, marketing_communications: false, ... }
  source = 'checkout',
  language = 'en',
  metadata = {}
}) {
  if (!email) throw new Error('Email is required to record DPDP consent.');

  const consentRecords = [];
  const timestamp = new Date().toISOString();

  for (const [purposeKey, isGranted] of Object.entries(consents)) {
    const purposeMeta = Object.values(CONSENT_PURPOSES).find(p => p.id === purposeKey);
    const purposeTitle = purposeMeta ? purposeMeta.title : purposeKey;

    consentRecords.push({
      email: email.trim().toLowerCase(),
      user_id: userId,
      consent_type: purposeKey,
      status: isGranted ? 'granted' : 'declined',
      version: '1.0',
      privacy_policy_version: CONSENT_POLICY_VERSION,
      language: language,
      source: source,
      purpose: purposeTitle,
      metadata: { ...metadata, userTimestamp: timestamp },
      granted_at: isGranted ? timestamp : null,
      withdrawn_at: isGranted ? null : timestamp
    });
  }

  // Save to Supabase
  try {
    const { data, error } = await supabase
      .from('dpdp_consent_records')
      .insert(consentRecords);

    // Save to LocalStorage for instant client synchronization
    saveLocalConsents(email, consents);

    // Immutable Audit Log Entry
    await logPrivacyAuditEvent({
      eventType: 'consent_granted',
      actorEmail: email,
      resourceType: 'dpdp_consent_records',
      action: 'RECORD_CONSENT',
      details: { source, purposes: Object.keys(consents), version: CONSENT_POLICY_VERSION }
    });

    return { success: true, count: consentRecords.length };
  } catch (err) {
    console.warn('Consent logged locally:', err);
    saveLocalConsents(email, consents);
    return { success: true, count: consentRecords.length, fallback: true };
  }
}

/**
 * Withdraws a specific consent purpose immediately (Section 6(4))
 */
export async function withdrawDPDPConsent({ email, consentType, reason = 'User requested withdrawal' }) {
  if (!email || !consentType) throw new Error('Email and consentType are required for withdrawal.');

  const timestamp = new Date().toISOString();

  // Create an explicit withdrawal record
  const withdrawalRecord = {
    email: email.trim().toLowerCase(),
    consent_type: consentType,
    status: 'withdrawn',
    version: '1.0',
    privacy_policy_version: CONSENT_POLICY_VERSION,
    language: 'en',
    source: 'privacy_dashboard',
    purpose: `Consent revoked for: ${consentType}`,
    metadata: { reason, withdrawnAt: timestamp },
    withdrawn_at: timestamp
  };

  try {
    await supabase
      .from('dpdp_consent_records')
      .insert([withdrawalRecord]);

    // Update local state
    updateLocalConsent(email, consentType, false);

    // Audit log
    await logPrivacyAuditEvent({
      eventType: 'consent_withdrawn',
      actorEmail: email,
      resourceType: 'dpdp_consent_records',
      action: 'WITHDRAW_CONSENT',
      details: { consentType, reason }
    });

    return { success: true, message: `Consent for ${consentType} successfully withdrawn.` };
  } catch (err) {
    updateLocalConsent(email, consentType, false);
    return { success: true, message: `Consent for ${consentType} withdrawn locally.` };
  }
}

/**
 * Fetches all active consent statuses for a Data Principal
 */
export async function getDPDPConsentStatus(email) {
  if (!email) return getDefaultConsents();

  try {
    const { data, error } = await supabase
      .from('dpdp_consent_records')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalConsents(email);
    }

    // Determine latest state for each consent type
    const latestConsents = {};
    Object.keys(CONSENT_PURPOSES).forEach(k => {
      const purposeId = CONSENT_PURPOSES[k].id;
      const match = data.find(r => r.consent_type === purposeId);
      latestConsents[purposeId] = match ? match.status === 'granted' : CONSENT_PURPOSES[k].mandatory;
    });

    return latestConsents;
  } catch {
    return getLocalConsents(email);
  }
}

function saveLocalConsents(email, consents) {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('th3ory_dpdp_user_consents') || '{}');
      stored[email.toLowerCase()] = {
        consents,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('th3ory_dpdp_user_consents', JSON.stringify(stored));
    }
  } catch {}
}

function updateLocalConsent(email, consentType, isGranted) {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('th3ory_dpdp_user_consents') || '{}');
      const current = stored[email.toLowerCase()]?.consents || getDefaultConsents();
      current[consentType] = isGranted;
      stored[email.toLowerCase()] = {
        consents: current,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('th3ory_dpdp_user_consents', JSON.stringify(stored));
    }
  } catch {}
}

function getLocalConsents(email) {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('th3ory_dpdp_user_consents') || '{}');
      if (stored[email?.toLowerCase()]?.consents) {
        return stored[email.toLowerCase()].consents;
      }
    }
  } catch {}
  return getDefaultConsents();
}

export function getDefaultConsents() {
  return {
    account_creation: true,
    subprocessor_transfers: true,
    marketing_communications: false,
    analytics_cookies: false,
    recommendations_personalization: false
  };
}
