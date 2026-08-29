/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 PERSONAL DATA BREACH RESPONSE SERVICE
 * Section 8(6) Incident Triage, Containment, Severity Grading & DPBI Notification Engine
 */

import { supabase } from '../lib/supabase.js';
import { logPrivacyAuditEvent } from './dpdpAuditService.js';

export const BREACH_SEVERITIES = {
  LOW: {
    level: 'low',
    label: 'Low Severity (Internal / Non-Sensitive)',
    description: 'Transient service disruption without unencrypted PII exposure.',
    requiresDpbiNotification: false,
    slaHours: 72
  },
  MEDIUM: {
    level: 'medium',
    label: 'Medium Severity (Limited Direct PII)',
    description: 'Exposure of non-sensitive contact identifiers without financial/auth tokens.',
    requiresDpbiNotification: true,
    slaHours: 48
  },
  HIGH: {
    level: 'high',
    label: 'High Severity (Auth / Contact Data Exfiltration)',
    description: 'Potential unauthorized access to student database or authentication tokens.',
    requiresDpbiNotification: true,
    slaHours: 24
  },
  CRITICAL: {
    level: 'critical',
    label: 'Critical Severity (Widespread PII / Financial Compromise)',
    description: 'Confirmed breach impacting sensitive credentials or widespread Data Principals.',
    requiresDpbiNotification: true,
    slaHours: 6
  }
};

/**
 * Registers and initiates a Breach Incident Workflow
 */
export async function logBreachIncident({
  title,
  severity = 'low',
  categoriesInvolved = [],
  affectedPrincipalsCount = 0,
  description,
  containmentMeasures = ''
}) {
  const incidentId = `BREACH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const breachRecord = {
    incident_id: incidentId,
    title,
    severity,
    status: 'detected',
    detected_at: now,
    affected_principals_count: Number(affectedPrincipalsCount) || 0,
    categories_involved: categoriesInvolved,
    description,
    containment_measures: containmentMeasures,
    dpbi_notified: false,
    principals_notified: false,
    created_at: now
  };

  try {
    const { data, error } = await supabase
      .from('dpdp_breach_incidents')
      .insert([breachRecord])
      .select();

    await logPrivacyAuditEvent({
      eventType: 'breach_incident_logged',
      actorRole: 'compliance_officer',
      resourceType: 'dpdp_breach_incidents',
      resourceId: incidentId,
      action: 'INITIATE_BREACH_PROTOCOL',
      details: { severity, categoriesInvolved, affectedCount: affectedPrincipalsCount }
    });

    saveLocalBreach(breachRecord);
    return { success: true, incidentId, data: data?.[0] || breachRecord };
  } catch (err) {
    saveLocalBreach(breachRecord);
    return { success: true, incidentId, data: breachRecord, fallback: true };
  }
}

/**
 * Generates Statutory DPBI (Data Protection Board of India) Notification Template
 */
export function generateDpbiNotificationPayload(incident) {
  return {
    notificationTarget: "Data Protection Board of India (DPBI)",
    statutoryBasis: "Section 8(6) of Digital Personal Data Protection Act, 2023",
    incidentReference: incident.incident_id,
    dateAndTimeOfDetection: incident.detected_at,
    severityClassification: incident.severity?.toUpperCase(),
    affectedDataPrincipalsEstimate: incident.affected_principals_count,
    categoriesOfPersonalDataCompromised: incident.categories_involved,
    natureAndCauseOfBreach: incident.description,
    containmentAndMitigationMeasuresTaken: incident.containment_measures || "System isolation, API key revocation, forced session invalidation",
    dataProtectionOfficerContact: {
      name: "Data Protection Officer",
      email: "privacy@th3ory.online",
      phone: "+91 (080) 4568-9900"
    }
  };
}

function saveLocalBreach(record) {
  try {
    if (typeof localStorage !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('th3ory_dpdp_breach_logs') || '[]');
      list.unshift(record);
      localStorage.setItem('th3ory_dpdp_breach_logs', JSON.stringify(list));
    }
  } catch {}
}

export async function fetchBreachIncidents() {
  try {
    const { data, error } = await supabase
      .from('dpdp_breach_incidents')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem('th3ory_dpdp_breach_logs') || '[]');
      }
      return [];
    }
    return data;
  } catch {
    return [];
  }
}
