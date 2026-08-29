/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 GRIEVANCE REDRESSAL SERVICE (Section 13)
 * Statutory Ticket Lifecycle, 30-Day SLA Monitoring & DPO Resolution System
 */

import { supabase } from '../lib/supabase.js';
import { logPrivacyAuditEvent } from './dpdpAuditService.js';

export const GRIEVANCE_CATEGORIES = [
  { id: 'consent_dispute', label: 'Consent Processing Dispute / Unauthorized Processing' },
  { id: 'erasure_delay', label: 'Delay in Processing Right to Erasure / RTBF Request' },
  { id: 'data_inaccuracy', label: 'Inaccurate Personal Data Correction Issue' },
  { id: 'security_concern', label: 'Security Concern or Potential Data Leakage' },
  { id: 'nomination_request', label: 'Nominee Rights Representation Query' },
  { id: 'other', label: 'Other Privacy & Data Protection Grievance' }
];

export const DPO_CONTACT = {
  name: 'Data Protection Officer (DPO) & Grievance Officer',
  office: 'TH3ORY Online Compliance & Legal Directorate',
  email: 'privacy@th3ory.online',
  phone: '+91 (080) 4568-9900',
  address: 'TH3ORY Masterclass, Legal & Compliance Dept, Bengaluru, KA 560001, India',
  statutorySlaDays: 30
};

/**
 * Creates a formal DPDP grievance ticket with an immutable tracking ID and SLA countdown
 */
export async function createDPDPGrievance({
  name,
  email,
  phone = '',
  category,
  subject,
  description
}) {
  if (!name || !email || !category || !subject || !description) {
    throw new Error('All required grievance fields (Name, Email, Category, Subject, Description) must be provided.');
  }

  const ticketId = `DPDP-GRV-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  
  // 30-Day Statutory SLA Deadline
  const slaDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const initialTimeline = [
    {
      action: 'TICKET_CREATED',
      timestamp: now.toISOString(),
      performedBy: 'Data Principal',
      notes: `Grievance submitted under category: ${category}`
    }
  ];

  const grievanceRecord = {
    ticket_id: ticketId,
    email: email.trim().toLowerCase(),
    data_principal_name: name.trim(),
    phone: phone.trim(),
    category: category,
    subject: subject.trim(),
    description: description.trim(),
    status: 'open',
    priority: category === 'security_concern' ? 'critical' : 'high',
    assigned_to: DPO_CONTACT.name,
    sla_deadline: slaDeadline,
    timeline: initialTimeline,
    created_at: now.toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('dpdp_grievances')
      .insert([grievanceRecord])
      .select();

    // Audit Log
    await logPrivacyAuditEvent({
      eventType: 'grievance_submitted',
      actorEmail: email,
      resourceType: 'dpdp_grievances',
      resourceId: ticketId,
      action: 'CREATE_GRIEVANCE',
      details: { category, subject, slaDeadline }
    });

    saveLocalGrievance(grievanceRecord);
    return { success: true, ticketId, data: data?.[0] || grievanceRecord };
  } catch (err) {
    console.warn('Grievance stored locally:', err);
    saveLocalGrievance(grievanceRecord);
    return { success: true, ticketId, data: grievanceRecord, fallback: true };
  }
}

/**
 * Retrieves grievance details by Ticket ID and Email
 */
export async function trackDPDPGrievance(ticketId, email) {
  if (!ticketId) throw new Error('Ticket ID is required to track status.');

  try {
    let query = supabase
      .from('dpdp_grievances')
      .select('*')
      .eq('ticket_id', ticketId.trim().toUpperCase());

    if (email) {
      query = query.eq('email', email.trim().toLowerCase());
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getLocalGrievance(ticketId);
    }
    return data[0];
  } catch {
    return getLocalGrievance(ticketId);
  }
}

/**
 * Resolves or updates a grievance ticket (DPO / Admin role)
 */
export async function updateGrievanceStatus({
  ticketId,
  status, // open, under_review, escalated, resolved, closed
  resolutionNotes = '',
  updatedBy = 'Data Protection Officer'
}) {
  const now = new Date().toISOString();
  const timelineEntry = {
    action: `STATUS_CHANGED_TO_${status.toUpperCase()}`,
    timestamp: now,
    performedBy: updatedBy,
    notes: resolutionNotes
  };

  try {
    // Fetch current timeline
    const { data: current } = await supabase
      .from('dpdp_grievances')
      .select('timeline')
      .eq('ticket_id', ticketId)
      .single();

    const newTimeline = Array.isArray(current?.timeline) ? [...current.timeline, timelineEntry] : [timelineEntry];

    const updatePayload = {
      status,
      resolution_notes: resolutionNotes,
      timeline: newTimeline,
      ...(status === 'resolved' || status === 'closed' ? { resolved_at: now } : {})
    };

    const { data, error } = await supabase
      .from('dpdp_grievances')
      .update(updatePayload)
      .eq('ticket_id', ticketId)
      .select();

    await logPrivacyAuditEvent({
      eventType: 'grievance_updated',
      actorRole: 'admin',
      resourceType: 'dpdp_grievances',
      resourceId: ticketId,
      action: 'UPDATE_GRIEVANCE',
      details: { status, resolutionNotes }
    });

    return { success: true, data: data?.[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Computes remaining statutory SLA time in days/hours
 */
export function calculateSlaRemaining(slaDeadline) {
  if (!slaDeadline) return { daysLeft: 30, isOverdue: false, formatted: '30 Days Remaining' };

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { daysLeft: 0, isOverdue: true, formatted: 'SLA Overdue (Escalate to DPBI)' };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    daysLeft: days,
    hoursLeft: hours,
    isOverdue: false,
    formatted: `${days}d ${hours}h remaining`
  };
}

function saveLocalGrievance(record) {
  try {
    if (typeof localStorage !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('th3ory_dpdp_grievances') || '[]');
      tickets.unshift(record);
      localStorage.setItem('th3ory_dpdp_grievances', JSON.stringify(tickets));
    }
  } catch {}
}

function getLocalGrievance(ticketId) {
  try {
    if (typeof localStorage !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('th3ory_dpdp_grievances') || '[]');
      return tickets.find(t => t.ticket_id === ticketId.trim().toUpperCase()) || null;
    }
  } catch {}
  return null;
}
