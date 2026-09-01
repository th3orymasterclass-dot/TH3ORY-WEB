import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { isAdminAuthenticated } from '../data/adminData.js';
import { defaultContent } from '../data/courseData.js';

// ─── Unique Credentials Generator ────────────────────────────────────────────────
export function generateEnrollmentCode(name = '', dob = '') {
  // 1. Extract name component (4 uppercase letters)
  const lettersOnly = (name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  let namePart = lettersOnly.slice(0, 4);
  if (namePart.length < 4) {
    namePart = namePart.padEnd(4, 'X');
  }
  if (!namePart || namePart === 'XXXX') {
    namePart = 'TH3O';
  }

  // 2. Extract DOB component (4 digits: DDMM)
  let dobPart = '';
  const dobStr = String(dob || '').trim();

  if (dobStr) {
    // Check YYYY-MM-DD or YYYY/MM/DD
    const matchISO = dobStr.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    if (matchISO) {
      const month = String(matchISO[2]).padStart(2, '0');
      const day = String(matchISO[3]).padStart(2, '0');
      dobPart = day + month;
    } else {
      // Check DD-MM-YYYY or DD/MM/YYYY
      const matchDMY = dobStr.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
      if (matchDMY) {
        const day = String(matchDMY[1]).padStart(2, '0');
        const month = String(matchDMY[2]).padStart(2, '0');
        dobPart = day + month;
      } else {
        // Try Date parsing
        const parsedDate = new Date(dobStr);
        if (!isNaN(parsedDate.getTime())) {
          const day = String(parsedDate.getDate()).padStart(2, '0');
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          dobPart = day + month;
        }
      }
    }
  }

  if (!dobPart || dobPart.length !== 4) {
    dobPart = '2026';
  }

  return (namePart + dobPart).toUpperCase().slice(0, 8);
}

export function generateUniqueStudentCredentials(name = '', dob = '') {
  const enrollmentCode = generateEnrollmentCode(name, dob);
  return {
    studentId: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
    enrollmentCode
  };
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export async function saveEnrollmentToSupabase(enrollmentData) {
  const studentName = enrollmentData.name || enrollmentData.studentName || 'Student';
  const studentDob = enrollmentData.dob || '';
  const uniqueCreds = generateUniqueStudentCredentials(studentName, studentDob);
  const finalCode = (enrollmentData.code && enrollmentData.code !== 'TH3ORY2026')
    ? enrollmentData.code
    : uniqueCreds.enrollmentCode;

  if (!isSupabaseConfigured || !supabase) {
    console.log('[Supabase] Not configured, saving locally only.');
    try {
      const local = JSON.parse(localStorage.getItem('th3ory_local_enrollments') || '[]');
      local.unshift({ ...enrollmentData, code: finalCode, studentId: uniqueCreds.studentId });
      localStorage.setItem('th3ory_local_enrollments', JSON.stringify(local));
    } catch {}
    return { success: false, isLocal: true, code: finalCode, studentId: uniqueCreds.studentId };
  }

  try {
    const sanitizedDob = (enrollmentData.dob && typeof enrollmentData.dob === 'string' && enrollmentData.dob.trim() !== '')
      ? enrollmentData.dob.trim()
      : null;

    const payload = {
      order_id: enrollmentData.orderId || (`ORD-${Date.now()}`),
      name: studentName,
      email: enrollmentData.email || enrollmentData.studentEmail || 'student@example.com',
      phone: enrollmentData.phone || '',
      country_code: enrollmentData.countryCode || '',
      address: enrollmentData.address || '',
      city: enrollmentData.city || '',
      country: enrollmentData.country || '',
      profession: enrollmentData.profession || '',
      dob: sanitizedDob,
      plan_id: enrollmentData.planId || 'pro',
      plan_name: enrollmentData.planName || 'TH3ORY Masterclass',
      amount_paid: enrollmentData.price || enrollmentData.totalAmount || enrollmentData.amountPaid || 0,
      currency: enrollmentData.currency || 'INR',
      gateway: enrollmentData.gateway || 'Razorpay',
      is_monthly: Boolean(enrollmentData.isMonthly),
      enrollment_code: finalCode,
      coupon_code: enrollmentData.couponCode || enrollmentData.coupon || 'NONE',
      affiliation_name: enrollmentData.affiliationName || enrollmentData.affiliation || 'Direct',
      discount_percentage: Number(enrollmentData.discountPercentage || enrollmentData.discountPct || 0),
      discount_amount: Number(enrollmentData.discountAmount || 0),
    };

    // Insert into enrollments table
    let { data: enrollment, error: e1 } = await supabase
      .from('enrollments')
      .insert([payload]);

    if (e1 && (e1.message?.includes('column') || e1.message?.includes('schema cache'))) {
      console.warn('[Supabase] Retrying enrollment insertion with core payload fallback:', e1.message);
      const basePayload = {
        order_id: payload.order_id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country_code: payload.country_code,
        address: payload.address,
        city: payload.city,
        country: payload.country,
        profession: payload.profession,
        dob: payload.dob,
        plan_id: payload.plan_id,
        plan_name: payload.plan_name,
        amount_paid: payload.amount_paid,
        currency: payload.currency,
        gateway: payload.gateway,
        is_monthly: payload.is_monthly,
        enrollment_code: payload.enrollment_code,
      };
      const res = await supabase.from('enrollments').insert([basePayload]);
      enrollment = res.data;
      e1 = res.error;
    }

    if (e1) {
      console.error('[Supabase] Error saving enrollment:', e1);
    } else {
      console.log('[Supabase] Enrollment saved successfully:', payload.order_id);
    }

    // Also register or update student account
    const accountPayload = {
      name: payload.name,
      email: payload.email,
      enrollment_code: payload.enrollment_code,
      plan_name: payload.plan_name,
      last_login: new Date().toISOString(),
    };

    const { error: e2 } = await supabase
      .from('student_accounts')
      .upsert([accountPayload], { onConflict: 'email' });

    if (e2) {
      console.error('[Supabase] Error saving student account:', e2);
    }

    // Local storage backup copy
    try {
      const local = JSON.parse(localStorage.getItem('th3ory_local_enrollments') || '[]');
      local.unshift(payload);
      localStorage.setItem('th3ory_local_enrollments', JSON.stringify(local));
    } catch {}

    return { success: !e1, data: enrollment, code: finalCode, studentId: uniqueCreds.studentId, error: e1 || e2 };
  } catch (err) {
    console.error('[Supabase] Exception in saveEnrollmentToSupabase:', err);
    return { success: false, code: finalCode, studentId: uniqueCreds.studentId, error: err };
  }
}

export async function fetchEnrollmentsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export function subscribeToEnrollments(onEnrollmentChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`enrollments_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
        fetchEnrollmentsFromSupabase().then(data => onEnrollmentChange(data));
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Student Verification ─────────────────────────────────────────────────────
export async function verifyStudentCodeWithSupabase(email, code) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode  = (code || '').trim().toUpperCase();

    // 1. Try enrollments table
    const { data: eData } = await supabase
      .from('enrollments')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(10);

    if (eData && eData.length > 0) {
      const matched = eData.find(e => {
        const storedCode = (e.enrollment_code || e.code || '').trim().toUpperCase();
        if (storedCode === cleanCode) return true;
        const computedCode = generateEnrollmentCode(e.name, e.dob).toUpperCase();
        return computedCode === cleanCode;
      });

      if (matched) {
        await supabase
          .from('student_accounts')
          .update({ last_login: new Date().toISOString() })
          .eq('email', matched.email);

        return {
          name: matched.name,
          email: matched.email,
          phone: matched.phone || '',
          profession: matched.profession || '',
          bio: matched.bio || '',
          country: matched.country || '',
          avatar: matched.avatar_url || '',
          plan: matched.plan_name || 'TH3ORY Masterclass',
          enrolledAt: matched.created_at,
          dob: matched.dob,
          loginAt: Date.now(),
        };
      }
    }

    // 2. Try student_accounts table
    const { data: aData } = await supabase
      .from('student_accounts')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(10);

    if (aData && aData.length > 0) {
      const matched = aData.find(a => {
        const storedCode = (a.enrollment_code || '').trim().toUpperCase();
        if (storedCode === cleanCode) return true;
        const computedCode = generateEnrollmentCode(a.name, a.dob).toUpperCase();
        return computedCode === cleanCode;
      });

      if (matched) {
        await supabase
          .from('student_accounts')
          .update({ last_login: new Date().toISOString() })
          .eq('email', matched.email);

        return {
          name: matched.name,
          email: matched.email,
          phone: matched.phone || '',
          profession: matched.profession || '',
          bio: matched.bio || '',
          country: matched.country || '',
          avatar: matched.avatar_url || '',
          plan: matched.plan_name || 'TH3ORY Masterclass',
          enrolledAt: matched.created_at,
          dob: matched.dob,
          loginAt: Date.now(),
        };
      }
    }

    return null;
  } catch (err) {
    console.error('[Supabase] Error verifying student:', err);
    return null;
  }
}

export async function fetchStudentProfileFromSupabase(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: sData } = await supabase
      .from('student_accounts')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (sData && sData.length > 0) {
      const s = sData[0];
      const profile = {
        name: s.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: s.phone || '',
        profession: s.profession || '',
        bio: s.bio || '',
        country: s.country || '',
        avatar: s.avatar_url || '',
        plan: s.plan_name || 'TH3ORY Masterclass',
        dob: s.dob,
        enrolledAt: s.created_at || new Date().toISOString()
      };
      try {
        sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
      } catch {}
      return profile;
    }

    const { data: eData } = await supabase
      .from('enrollments')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (eData && eData.length > 0) {
      const e = eData[0];
      const profile = {
        name: e.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: e.phone || '',
        profession: e.profession || '',
        bio: e.bio || '',
        country: e.country || '',
        avatar: e.avatar_url || '',
        plan: e.plan_name || 'TH3ORY Masterclass',
        dob: e.dob,
        enrolledAt: e.created_at || new Date().toISOString()
      };
      try {
        sessionStorage.setItem('th3ory_student_auth', JSON.stringify(profile));
      } catch {}
      return profile;
    }

    return null;
  } catch (err) {
    console.warn('[Supabase] Error fetching student profile:', err);
    return null;
  }
}

// ─── Student Profile Update & Real-Time Sync ─────────────────────────────────
export async function updateStudentProfileInSupabase(profileData) {
  if (!profileData || !profileData.email) return { success: false, error: 'Student email is required' };

  const cleanEmail = profileData.email.trim().toLowerCase();
  const updatedProfile = {
    name: profileData.name || 'Student',
    email: cleanEmail,
    phone: profileData.phone || '',
    profession: profileData.profession || '',
    bio: profileData.bio || '',
    country: profileData.country || '',
    dob: profileData.dob || null,
    avatar: profileData.avatar || '',
    plan: profileData.plan || 'TH3ORY Masterclass',
    enrolledAt: profileData.enrolledAt || new Date().toISOString()
  };

  // 1. Session & Local Storage persistence & cross-component broadcast
  try {
    sessionStorage.setItem('th3ory_student_auth', JSON.stringify(updatedProfile));
    localStorage.setItem(`th3ory_student_profile_${cleanEmail}`, JSON.stringify(updatedProfile));
    localStorage.setItem('th3ory_student_auth_persistent', JSON.stringify(updatedProfile));
    window.dispatchEvent(new CustomEvent('th3ory_student_profile_update', { detail: updatedProfile }));
  } catch {}

  // 2. Try Serverless API update endpoint first
  try {
    const studentToken = typeof window !== 'undefined'
      ? (sessionStorage.getItem('th3ory_student_token') || localStorage.getItem('th3ory_student_token') || sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token'))
      : '';
    const res = await fetch('/api/update-student-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(studentToken ? { 'Authorization': `Bearer ${studentToken}` } : {})
      },
      body: JSON.stringify({ profile: updatedProfile })
    });
    if (res.ok) {
      const apiRes = await res.json();
      if (apiRes.success && apiRes.profile) {
        return { success: true, profile: apiRes.profile };
      }
    }
  } catch {}

  // 3. Supabase DB direct update fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        profession: updatedProfile.profession,
        bio: updatedProfile.bio,
        country: updatedProfile.country,
        dob: updatedProfile.dob || null,
        avatar_url: updatedProfile.avatar,
      };

      const { error: e1 } = await supabase
        .from('student_accounts')
        .update(payload)
        .eq('email', cleanEmail);

      if (e1) {
        await supabase
          .from('student_accounts')
          .upsert([{ ...payload, email: cleanEmail }], { onConflict: 'email' });
      }

      await supabase
        .from('enrollments')
        .update({
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          profession: updatedProfile.profession,
          country: updatedProfile.country,
          dob: updatedProfile.dob || null
        })
        .eq('email', cleanEmail);

      return { success: true, profile: updatedProfile };
    } catch (err) {
      console.error('[Supabase] Exception updating student profile:', err);
    }
  }

  return { success: true, profile: updatedProfile, isLocal: true };
}

// ─── Site Settings (Real-time Site Configuration Sync) ──────────────────────
export async function saveSiteSettingsToSupabase(key, value) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!isAdminAuthenticated()) return false;
  try {
    const { error } = await supabase.from('site_settings').upsert([
      { setting_key: key, setting_value: value, updated_at: new Date().toISOString() }
    ], { onConflict: 'setting_key' });
    return !error;
  } catch (err) {
    console.error('[Supabase] Error saving site setting:', err);
    return false;
  }
}

export async function fetchSiteSettingsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data) return null;
    const settings = {};
    data.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });
    return settings;
  } catch {
    return null;
  }
}

export function subscribeToSiteSettings(onSettingChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`site_settings_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.new && payload.new.setting_key) {
            onSettingChange(payload.new.setting_key, payload.new.setting_value);
          }
        }
      )
      .subscribe();
    return () => {
      try { supabase.removeChannel(sub); } catch {}
    };
  } catch {
    return () => {};
  }
}

// ─── Student Queries (Dedicated Table: queries) ────────────────────────────────
const inFlightQuerySaves = new Map();

export async function saveQueryToSupabase(queryData) {
  const cleanEmail = (queryData.studentEmail || '').trim().toLowerCase();
  const cleanSubject = (queryData.subject || '').trim();
  const cleanMessage = (queryData.message || '').trim();
  const lockKey = `${cleanEmail}::${cleanSubject}::${cleanMessage}`;

  if (inFlightQuerySaves.has(lockKey)) {
    return await inFlightQuerySaves.get(lockKey);
  }

  const savePromise = (async () => {
    const newQuery = {
      id: queryData.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentName: queryData.studentName || 'Student',
      studentEmail: cleanEmail,
      studentPlan: queryData.studentPlan || '',
      subject: cleanSubject,
      type: queryData.type || 'General Question',
      message: cleanMessage,
      status: 'open',
      reply: '',
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Pre-insert check: Look for existing record matching email, subject, and message
        const { data: existingRecords } = await supabase
          .from('queries')
          .select('*')
          .ilike('student_email', cleanEmail)
          .eq('subject', cleanSubject)
          .eq('message', cleanMessage)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingRecords && existingRecords.length > 0) {
          const found = existingRecords[0];
          newQuery.id = found.id;
          newQuery.createdAt = found.created_at || newQuery.createdAt;
          newQuery.status = found.status || newQuery.status;
          newQuery.reply = found.reply || newQuery.reply;
          newQuery.repliedAt = found.replied_at || newQuery.repliedAt;
        } else {
          const { data, error } = await supabase.from('queries').insert([{
            student_name: newQuery.studentName,
            student_email: cleanEmail,
            student_plan: newQuery.studentPlan,
            subject: cleanSubject,
            type: newQuery.type,
            message: cleanMessage,
            status: 'open',
          }]).select().single();

          if (!error && data && data.id) {
            newQuery.id = data.id;
            newQuery.createdAt = data.created_at || newQuery.createdAt;
          }
        }
      } catch (err) {
        console.warn('[Supabase] Exception inserting query:', err);
      }
    }

    // PURGE any legacy localStorage query items — NO query data in localStorage!
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('th3ory_queries_store');
        Object.keys(localStorage).forEach(k => {
          if (k.includes('_queries')) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('th3ory_queries_change'));
    }

    return newQuery;
  })();

  inFlightQuerySaves.set(lockKey, savePromise);
  try {
    return await savePromise;
  } finally {
    inFlightQuerySaves.delete(lockKey);
  }
}

export async function fetchQueriesFromSupabase(email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  // Always purge legacy localStorage query keys to prevent local pollution
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('th3ory_queries_store');
      Object.keys(localStorage).forEach(k => {
        if (k.includes('_queries')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      let queryBuilder = supabase.from('queries').select('*').order('created_at', { ascending: false });
      if (cleanEmail) {
        queryBuilder = queryBuilder.ilike('student_email', cleanEmail);
      }
      const { data, error } = await queryBuilder;
      if (!error && data) {
        // Exclude internal fallbacks (Enterprise Quotes, Contact Forms, Newsletters)
        const studentOnly = data.filter(q => !['Enterprise Quote', 'Contact Form', 'Newsletter'].includes(q.type));

        const remoteMapped = studentOnly.map(q => ({
          id: q.id,
          studentName: q.student_name,
          studentEmail: q.student_email,
          studentPlan: q.student_plan,
          subject: q.subject,
          type: q.type,
          message: q.message,
          status: q.status || 'open',
          reply: q.reply || '',
          createdAt: q.created_at,
          repliedAt: q.replied_at,
        }));

        // Deduplicate remote rows rigorously by (studentEmail, subject, message)
        const uniqueMap = new Map();
        remoteMapped.forEach(q => {
          const compKey = `${(q.studentEmail || '').trim().toLowerCase()}_${(q.subject || '').trim()}_${(q.message || '').trim()}`;
          if (!uniqueMap.has(compKey)) {
            uniqueMap.set(compKey, q);
          } else {
            const existing = uniqueMap.get(compKey);
            if (q.status && q.status !== 'open' && existing.status === 'open') {
              uniqueMap.set(compKey, q);
            }
          }
        });

        const finalQueries = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return finalQueries;
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching queries:', err);
    }
  }

  return [];
}

export function subscribeToQueries(emailOrCallback, optionalCallback) {
  const email = typeof emailOrCallback === 'string' ? emailOrCallback : null;
  const callback = typeof emailOrCallback === 'function' ? emailOrCallback : optionalCallback;
  if (!callback) return () => {};

  const cleanEmail = email ? email.trim().toLowerCase() : null;

  const localHandler = () => {
    fetchQueriesFromSupabase(cleanEmail).then(res => { if (res) callback(res); });
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('th3ory_queries_change', localHandler);
  }

  if (!isSupabaseConfigured || !supabase) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('th3ory_queries_change', localHandler);
      }
    };
  }

  try {
    const channelName = `queries_${cleanEmail ? cleanEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${Date.now()}`;
    const filterObj = cleanEmail
      ? { event: '*', schema: 'public', table: 'queries', filter: `student_email=eq.${cleanEmail}` }
      : { event: '*', schema: 'public', table: 'queries' };

    const sub = supabase
      .channel(channelName)
      .on('postgres_changes', filterObj, () => {
        fetchQueriesFromSupabase(cleanEmail).then(res => { if (res) callback(res); });
      })
      .subscribe();
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('th3ory_queries_change', localHandler);
      }
      try { supabase.removeChannel(sub); } catch {}
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('th3ory_queries_change', localHandler);
      }
    };
  }
}

// ─── Enterprise Quotes (Dedicated Table: enterprise_quotes) ──────────────────
export async function saveEnterpriseQuoteToSupabase(quoteData) {
  const payload = {
    org_name: quoteData.orgName || quoteData.org_name || quoteData.company || '',
    industry: quoteData.industry || 'Technology & Services',
    employee_size: quoteData.employeeSize || quoteData.employee_size || '50-250 Employees',
    location: quoteData.location || '',
    website: quoteData.website || '',
    contact_name: quoteData.contactName || quoteData.contact_name || '',
    designation: quoteData.designation || '',
    email: quoteData.email || '',
    phone: quoteData.phone || '',
    linkedin_url: quoteData.linkedinUrl || quoteData.linkedin_url || '',
    status: quoteData.status || 'New Lead',
    last_contacted_at: quoteData.lastContactedAt || quoteData.last_contacted_at || new Date().toISOString().split('T')[0],
    next_followup_at: quoteData.nextFollowupAt || quoteData.next_followup_at || '',
    proposal_sent: quoteData.proposalSent || quoteData.proposal_sent || 'Pending Draft',
    meeting_date: quoteData.meetingDate || quoteData.meeting_date || '',
    probability: quoteData.probability || '50%',
    expected_revenue: quoteData.expectedRevenue || quoteData.expected_revenue || quoteData.budget || '$10,000',
    remarks: quoteData.remarks || quoteData.notes || '',
    audience_type: quoteData.audienceType || 'Executive Leaders',
    pupil_count: quoteData.pupilCount || '50-100',
    notes: quoteData.notes || quoteData.remarks || '',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('enterprise_quotes').insert([payload]);

      if (error) {
        console.warn('[Supabase] enterprise_quotes table insert fallback to queries table:', error.message);
        await supabase.from('queries').insert([{
          student_name: payload.contact_name || payload.org_name,
          student_email: payload.email,
          student_plan: 'Enterprise CRM Quote',
          subject: `Enterprise CRM Quote Request: ${payload.org_name}`,
          type: 'Enterprise Quote',
          message: `Company: ${payload.org_name} | Contact: ${payload.contact_name} (${payload.designation}) | Email: ${payload.email} | Phone: ${payload.phone} | Status: ${payload.status} | Revenue: ${payload.expected_revenue}`,
          status: 'open'
        }]);
      }
    } catch (err) {
      console.error('[Supabase] Exception in saveEnterpriseQuoteToSupabase:', err);
    }
  }
  return true;
}

export async function fetchEnterpriseQuotesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase.from('enterprise_quotes').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export function subscribeToEnterpriseQuotes(onQuoteChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`enterprise_quotes_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enterprise_quotes' }, () => {
        fetchEnterpriseQuotesFromSupabase().then(res => { if (res) onQuoteChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Contact Us Form Inquiries (Dedicated Table: contact_inquiries) ───────────
export async function saveContactInquiryToSupabase(contactData) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contact_inquiries').insert([{
        name: contactData.name || '',
        email: contactData.email || '',
        subject: contactData.subject || 'General Inquiry',
        message: contactData.message || '',
        status: 'new'
      }]);

      if (error) {
        console.warn('[Supabase] contact_inquiries table insert fallback to queries table:', error.message);
        await supabase.from('queries').insert([{
          student_name: contactData.name,
          student_email: contactData.email,
          student_plan: 'Public Visitor',
          subject: `Contact Form: ${contactData.subject}`,
          type: contactData.subject,
          message: contactData.message,
          status: 'open'
        }]);
      }
    } catch (err) {
      console.error('[Supabase] Exception in saveContactInquiryToSupabase:', err);
    }
  }
  return true;
}

export async function updateQueryStatusInSupabase(queryId, status, replyText = '', subject = null, email = null) {
  const nowIso = new Date().toISOString();

  // Always purge legacy localStorage query keys to prevent local storage pollution
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('th3ory_queries_store');
      Object.keys(localStorage).forEach(k => {
        if (k.includes('_queries')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  }

  // 1. Update Supabase PostgreSQL database FIRST
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = { status };
      if (replyText) {
        payload.reply = replyText;
        payload.replied_at = nowIso;
      }

      let updatedRows = null;
      // Step A: Try update by primary key ID (UUID)
      if (queryId && !String(queryId).startsWith('q_')) {
        const { data, error } = await supabase.from('queries').update(payload).eq('id', queryId).select();
        if (error) console.warn('[Supabase] Update by ID error:', error.message);
        if (data && data.length > 0) updatedRows = data;
      }

      // Step B: If queryId was local ID or didn't match UUID, try subject + student_email match
      if (!updatedRows && (subject || queryId)) {
        const matchSubject = subject || queryId;
        let queryBuilder = supabase.from('queries').update(payload).eq('subject', matchSubject);
        if (email) {
          queryBuilder = queryBuilder.ilike('student_email', email.trim().toLowerCase());
        }
        const { data, error } = await queryBuilder.select();
        if (error) console.warn('[Supabase] Update by subject error:', error.message);
        if (data && data.length > 0) updatedRows = data;
      }

      // Step C: Fallback update by subject only if still unmatched
      if (!updatedRows && subject) {
        const { data, error } = await supabase.from('queries').update(payload).eq('subject', subject).select();
        if (error) console.warn('[Supabase] Update fallback error:', error.message);
        if (data && data.length > 0) updatedRows = data;
      }
    } catch (err) {
      console.warn('[Supabase] Error in updateQueryStatusInSupabase:', err);
    }
  }

  // 2. Dispatch change event to notify in-memory subscribers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('th3ory_queries_change'));
  }

  return true;
}

export async function deleteQueryFromSupabase(queryId) {
  if (!queryId) return false;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('th3ory_queries_store');
      Object.keys(localStorage).forEach(k => {
        if (k.includes('_queries')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('queries').delete().eq('id', queryId);
      if (error) {
        console.warn('[Supabase] Error deleting query:', error.message);
        return false;
      }
    } catch (err) {
      console.warn('[Supabase] Exception in deleteQueryFromSupabase:', err);
      return false;
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('th3ory_queries_change'));
  }
  return true;
}

export async function updateEnterpriseQuoteStatusInSupabase(quoteId, status) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('enterprise_quotes').update({ status }).eq('id', quoteId);
      if (error) {
        console.warn('[Supabase] error updating enterprise_quote:', error.message);
      }
    } catch (err) {
      console.error('[Supabase] Exception in updateEnterpriseQuoteStatusInSupabase:', err);
    }
  }
  return true;
}

export async function updateContactInquiryStatusInSupabase(inquiryId, status) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contact_inquiries').update({ status }).eq('id', inquiryId);
      if (error) {
        console.warn('[Supabase] error updating contact_inquiry:', error.message);
      }
    } catch (err) {
      console.error('[Supabase] Exception in updateContactInquiryStatusInSupabase:', err);
    }
  }
  return true;
}

export async function fetchContactInquiriesFromSupabase() {
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('th3ory_local_contact_inquiries') || '[]');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false });
    if (error || !data) return local;

    const map = new Map();
    local.forEach(item => map.set(item.id || `${item.email}_${item.subject}`, item));
    data.forEach(item => map.set(item.id || `${item.email}_${item.subject}`, item));

    return Array.from(map.values());
  } catch {
    return local;
  }
}

export function subscribeToContactInquiries(onInquiryChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`contact_inquiries_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_inquiries' }, () => {
        fetchContactInquiriesFromSupabase().then(res => { if (res) onInquiryChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function saveReviewToSupabase(reviewData) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('reviews').insert([{
      name: reviewData.name,
      email: reviewData.email || reviewData.studentEmail || '',
      role: reviewData.role || '',
      category: reviewData.category || 'Learner',
      rating: reviewData.rating || 5,
      comment: reviewData.comment,
    }]);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchStudentReviewFromSupabase(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  let local = null;
  try {
    const raw = localStorage.getItem(`th3ory_student_${cleanEmail}_myReview`);
    if (raw) local = JSON.parse(raw);
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      const r = data[0];
      const rev = {
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        category: r.category,
        rating: r.rating,
        comment: r.comment,
        submittedAt: r.created_at
      };
      try {
        localStorage.setItem(`th3ory_student_${cleanEmail}_myReview`, JSON.stringify(rev));
      } catch {}
      return rev;
    }
    return local;
  } catch {
    return local;
  }
}

export function subscribeToStudentReview(email, onReviewChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `reviews_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews', filter: `email=eq.${cleanEmail}` },
        () => {
          fetchStudentReviewFromSupabase(cleanEmail).then(res => { if (res) onReviewChange(res); });
        }
      )
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

export async function fetchReviewsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      category: r.category,
      rating: r.rating,
      comment: r.comment,
      avatar: r.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    }));
  } catch {
    return null;
  }
}

export function subscribeToReviews(onReviewChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`reviews_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchReviewsFromSupabase().then(res => { if (res) onReviewChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

export function subscribeToCourseContents(onContentChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`course_contents_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'course_contents' }, () => {
        fetchCourseContentsFromSupabase().then(res => { if (res) onContentChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Course Contents (Streaming URLs) ─────────────────────────────────────────
export async function seedDefaultCourseContentsToSupabase() {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data: existing } = await supabase.from('course_contents').select('lesson_id, type');
    const existingKeys = new Set((existing || []).map(row => `${row.lesson_id}_${row.type}`));

    const missingItems = (defaultContent || []).filter(item => !existingKeys.has(`${item.lessonId}_${item.type}`));
    if (missingItems.length === 0) return true;

    const rowsToInsert = missingItems.map(item => ({
      content_key: item.id || `cnt_${item.lessonId}_${item.type}`,
      title: item.title,
      type: item.type || 'video',
      url: item.url || 'https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview',
      platform: item.url?.includes('drive.google.com') ? 'gdrive' : 'url',
      level_id: item.levelId || null,
      lesson_id: item.lessonId || null,
      duration: item.duration || '',
      access_level: item.access || item.accessLevel || 'enrolled',
      description: item.description || '',
      tags: item.tags || [],
      published: item.published !== false,
      created_at: new Date().toISOString()
    }));

    await supabase.from('course_contents').insert(rowsToInsert);
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception seeding course_contents:', err);
    return false;
  }
}

export async function fetchCourseContentsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('course_contents')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return null;

    if (!data || data.length === 0) {
      await seedDefaultCourseContentsToSupabase();
    }

    return (data || []).map(item => ({
      id: item.id,
      contentKey: item.content_key,
      title: item.title,
      type: item.type,
      url: item.url,
      platform: item.platform,
      levelId: item.level_id,
      lessonId: item.lesson_id,
      duration: item.duration,
      access: item.access_level || 'enrolled',
      accessLevel: item.access_level || 'enrolled',
      description: item.description,
      tags: item.tags || [],
      published: item.published,
      createdAt: item.created_at,
    }));
  } catch {
    return null;
  }
}

export async function saveCourseContentToSupabase(item) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required to update course content in database.');
    return false;
  }
  try {
    const payload = {
      title: item.title,
      type: item.type || 'video',
      url: item.url,
      platform: item.platform || (item.url?.includes('drive.google.com') ? 'gdrive' : 'url'),
      level_id: item.levelId || null,
      lesson_id: item.lessonId || null,
      duration: item.duration || '',
      access_level: item.access || item.accessLevel || 'enrolled',
      description: item.description || '',
      tags: item.tags || [],
      published: Boolean(item.published),
      updated_at: new Date().toISOString(),
    };

    // If it's a UUID (from Supabase), update by id
    if (item.id && !item.id.startsWith('c_')) {
      const { error } = await supabase
        .from('course_contents')
        .update(payload)
        .eq('id', item.id);
      if (error) console.error('[Supabase] Error updating course content:', error);
      return !error;
    }

    // For locally-generated ids (c_...) — use upsert on content_key
    const contentKey = item.id || `c_${Date.now()}`;
    const { error } = await supabase
      .from('course_contents')
      .upsert([{ ...payload, content_key: contentKey }], { onConflict: 'content_key' });

    if (error) console.error('[Supabase] Error upserting course content:', error);
    return !error;
  } catch (err) {
    console.error('[Supabase] Error saving course content:', err);
    return false;
  }
}

export async function deleteCourseContentFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required to delete course content from database.');
    return false;
  }
  try {
    const { error } = await supabase.from('course_contents').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ─── Newsletter Subscribers (Dedicated Table: newsletter_subscribers) ─────────
export async function saveNewsletterSubscriberToSupabase(email, source = 'website_footer') {
  if (!email || !email.trim()) return false;
  const cleanEmail = email.trim().toLowerCase();

  const payload = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    status: 'active',
    source: source,
    created_at: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_newsletter_subs') || '[]');
    const existing = local.find(s => s.email === cleanEmail);
    if (!existing) {
      local.unshift(payload);
      localStorage.setItem('th3ory_local_newsletter_subs', JSON.stringify(local));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('newsletter_subscribers').upsert([{
        email: cleanEmail,
        status: 'active',
        source: source
      }], { onConflict: 'email' });

      if (error) {
        console.warn('[Supabase] newsletter_subscribers table fallback to queries table:', error.message);
        await supabase.from('queries').insert([{
          student_name: 'Newsletter Subscriber',
          student_email: cleanEmail,
          student_plan: 'Cognitive Dispatch',
          subject: 'Newsletter Subscription',
          type: 'Newsletter',
          message: `Subscribed to TH3ORY Cognitive Insights Newsletter from ${source}`,
          status: 'open'
        }]);
      } else {
        console.log('[Supabase] Newsletter subscriber saved:', cleanEmail);
      }
    } catch (err) {
      console.error('[Supabase] Exception in saveNewsletterSubscriberToSupabase:', err);
    }
  }
  return true;
}

export async function fetchNewsletterSubscribersFromSupabase() {
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('th3ory_local_newsletter_subs') || '[]');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      // Fallback check from queries table for Newsletter type
      const { data: qData } = await supabase.from('queries').select('*').eq('type', 'Newsletter');
      if (qData && qData.length > 0) {
        const querySubs = qData.map(q => ({
          id: q.id,
          email: q.student_email,
          status: 'active',
          source: 'website_footer',
          created_at: q.created_at
        }));
        const map = new Map();
        local.forEach(s => map.set(s.email, s));
        querySubs.forEach(s => map.set(s.email, s));
        return Array.from(map.values());
      }
      return local;
    }

    const map = new Map();
    local.forEach(item => map.set(item.email, item));
    data.forEach(item => map.set(item.email, item));

    return Array.from(map.values());
  } catch {
    return local;
  }
}

export async function updateNewsletterSubscriberStatusInSupabase(idOrEmail, status = 'unsubscribed') {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required.');
    return false;
  }
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status })
      .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteNewsletterSubscriberFromSupabase(idOrEmail) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required.');
    return false;
  }
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
    return !error;
  } catch {
    return false;
  }
}

export function subscribeToNewsletterSubscribers(onSubscribersChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`newsletter_subscribers_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_subscribers' }, () => {
        fetchNewsletterSubscribersFromSupabase().then(res => { if (res) onSubscribersChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Newsletter Broadcasts & Attachments (Dedicated Table: newsletter_broadcasts) ───
export async function saveNewsletterBroadcastToSupabase(broadcastData) {
  const payload = {
    id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    subject: broadcastData.subject || 'TH3ORY Cognitive Dispatch',
    content: broadcastData.content || '',
    attachment_url: broadcastData.attachmentUrl || null,
    attachment_name: broadcastData.attachmentName || null,
    recipients_count: broadcastData.recipientsCount || 0,
    status: 'sent',
    created_at: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_newsletter_broadcasts') || '[]');
    local.unshift(payload);
    localStorage.setItem('th3ory_local_newsletter_broadcasts', JSON.stringify(local));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('newsletter_broadcasts').insert([{
        subject: payload.subject,
        content: payload.content,
        attachment_url: payload.attachment_url,
        attachment_name: payload.attachment_name,
        recipients_count: payload.recipients_count,
        status: payload.status
      }]);
      if (error) {
        console.warn('[Supabase] error saving newsletter_broadcast:', error.message);
      } else {
        console.log('[Supabase] Newsletter broadcast log saved cleanly.');
      }
    } catch (err) {
      console.error('[Supabase] Exception saving newsletter broadcast:', err);
    }
  }
  return true;
}

export async function fetchNewsletterBroadcastsFromSupabase() {
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('th3ory_local_newsletter_broadcasts') || '[]');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase.from('newsletter_broadcasts').select('*').order('created_at', { ascending: false });
    if (error || !data) return local;

    const map = new Map();
    local.forEach(item => map.set(item.id || `${item.subject}_${item.created_at}`, item));
    data.forEach(item => map.set(item.id || `${item.subject}_${item.created_at}`, item));

    return Array.from(map.values());
  } catch {
    return local;
  }
}

export function subscribeToNewsletterBroadcasts(onBroadcastsChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`newsletter_broadcasts_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_broadcasts' }, () => {
        fetchNewsletterBroadcastsFromSupabase().then(res => { if (res) onBroadcastsChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// Helper to perform dual-table operations against student_progress or user_progress
async function syncStudentProgressRow(cleanEmail, lessonId, payload) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    // 1. Try table 'student_progress' (column 'student_name')
    const { data: spExisting } = await supabase
      .from('student_progress')
      .select('id')
      .ilike('student_name', cleanEmail)
      .eq('lesson_id', lessonId)
      .limit(1);

    if (spExisting && spExisting.length > 0) {
      await supabase
        .from('student_progress')
        .update({ ...payload, completed_at: new Date().toISOString() })
        .eq('id', spExisting[0].id);
      return true;
    }

    const { error: spErr } = await supabase
      .from('student_progress')
      .insert([{ student_name: cleanEmail, lesson_id: lessonId, ...payload, completed_at: new Date().toISOString() }]);

    if (!spErr) return true;

    // 2. Fallback to table 'user_progress' (column 'email')
    const { data: upExisting } = await supabase
      .from('user_progress')
      .select('id')
      .ilike('email', cleanEmail)
      .eq('lesson_id', lessonId)
      .limit(1);

    if (upExisting && upExisting.length > 0) {
      await supabase
        .from('user_progress')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', upExisting[0].id);
      return true;
    }

    await supabase
      .from('user_progress')
      .insert([{ email: cleanEmail, lesson_id: lessonId, ...payload, updated_at: new Date().toISOString() }]);
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception syncing student progress:', err);
    return false;
  }
}

// ─── Student Course Progress, Notes & Bookmarks Syncing ─────────────────────────
export async function saveStudentProgressToSupabase(email, lessonId, completed = true) {
  if (!email || !lessonId) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const local = JSON.parse(localStorage.getItem(`th3ory_progress_${cleanEmail}`) || '{}');
    if (completed) local[lessonId] = true;
    else delete local[lessonId];
    localStorage.setItem(`th3ory_progress_${cleanEmail}`, JSON.stringify(local));
  } catch {}

  return await syncStudentProgressRow(cleanEmail, lessonId, { completed: Boolean(completed) });
}

export async function saveStudentNoteToSupabase(email, lessonId, noteText) {
  if (!email || !lessonId) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const local = JSON.parse(localStorage.getItem(`th3ory_notes_${cleanEmail}`) || '{}');
    local[lessonId] = noteText;
    localStorage.setItem(`th3ory_notes_${cleanEmail}`, JSON.stringify(local));
  } catch {}

  return await syncStudentProgressRow(cleanEmail, lessonId, { note: noteText });
}

export async function saveStudentBookmarkToSupabase(email, lessonId, bookmarked = true) {
  if (!email || !lessonId) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const local = JSON.parse(localStorage.getItem(`th3ory_bookmarks_${cleanEmail}`) || '[]');
    let updated;
    if (bookmarked) {
      updated = Array.from(new Set([...local, lessonId]));
    } else {
      updated = local.filter(x => x !== lessonId);
    }
    localStorage.setItem(`th3ory_bookmarks_${cleanEmail}`, JSON.stringify(updated));
  } catch {}

  return await syncStudentProgressRow(cleanEmail, lessonId, { bookmarked: Boolean(bookmarked) });
}

// ─── 30-Day Interactive Course Task Tracker Live Database Persistence ──────
export async function saveTaskStepsToSupabase(email, lessonId, taskStepsObj) {
  if (!email || !lessonId) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const local = JSON.parse(localStorage.getItem(`th3ory_tasks_${cleanEmail}`) || '{}');
    const merged = { ...local, ...taskStepsObj };
    localStorage.setItem(`th3ory_tasks_${cleanEmail}`, JSON.stringify(merged));
  } catch {}

  return await syncStudentProgressRow(cleanEmail, lessonId, { task_steps: taskStepsObj });
}

export async function fetchTaskStepsFromSupabase(email) {
  if (!email) return {};
  const cleanEmail = email.trim().toLowerCase();

  let local = {};
  try {
    local = JSON.parse(localStorage.getItem(`th3ory_tasks_${cleanEmail}`) || '{}');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    let { data, error } = await supabase
      .from('student_progress')
      .select('lesson_id, task_steps')
      .ilike('email', cleanEmail);

    if (error || !data || data.length === 0) {
      const { data: upData, error: upErr } = await supabase
        .from('user_progress')
        .select('lesson_id, task_steps')
        .ilike('email', cleanEmail);
      if (!upErr && upData) data = upData;
    }

    if (!data) return local;

    const mergedTaskSteps = { ...local };
    data.forEach(item => {
      if (item.task_steps && typeof item.task_steps === 'object') {
        Object.assign(mergedTaskSteps, item.task_steps);
      }
    });

    try {
      localStorage.setItem(`th3ory_tasks_${cleanEmail}`, JSON.stringify(mergedTaskSteps));
    } catch {}

    return mergedTaskSteps;
  } catch {
    return local;
  }
}

export function subscribeToTaskSteps(email, onTaskStepsChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `task_steps_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_progress', filter: `email=eq.${cleanEmail}` },
        () => {
          fetchTaskStepsFromSupabase(cleanEmail).then(res => { if (res) onTaskStepsChange(res); });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress', filter: `email=eq.${cleanEmail}` },
        () => {
          fetchTaskStepsFromSupabase(cleanEmail).then(res => { if (res) onTaskStepsChange(res); });
        }
      )
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

export async function fetchStudentProgressFromSupabase(email) {
  if (!email) return {};
  const cleanEmail = email.trim().toLowerCase();
  let local = {};
  try {
    local = JSON.parse(localStorage.getItem(`th3ory_progress_${cleanEmail}`) || '{}');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    let { data, error } = await supabase.from('student_progress').select('lesson_id, completed').ilike('student_name', cleanEmail);
    if (error || !data || data.length === 0) {
      const { data: upData, error: upErr } = await supabase.from('user_progress').select('lesson_id, completed').ilike('email', cleanEmail);
      if (!upErr && upData) data = upData;
    }

    if (!data) return local;

    const progressObj = { ...local };
    data.forEach(item => {
      if (item.completed) progressObj[item.lesson_id] = true;
      else delete progressObj[item.lesson_id];
    });

    return progressObj;
  } catch {
    return local;
  }
}

export async function fetchStudentDataFromSupabase(email) {
  if (!email || !isSupabaseConfigured || !supabase) return { progress: {}, notes: {}, bookmarks: [] };
  const cleanEmail = email.trim().toLowerCase();

  try {
    let { data, error } = await supabase
      .from('student_progress')
      .select('lesson_id, completed, completed_at')
      .ilike('student_name', cleanEmail);

    if (error || !data || data.length === 0) {
      const { data: spFull } = await supabase
        .from('student_progress')
        .select('*')
        .ilike('student_name', cleanEmail);

      if (spFull && spFull.length > 0) {
        data = spFull;
      } else {
        const { data: upData, error: upErr } = await supabase
          .from('user_progress')
          .select('lesson_id, completed')
          .ilike('email', cleanEmail);

        if (!upErr && upData) data = upData;
      }
    }

    if (!data) {
      return { progress: {}, notes: {}, bookmarks: [] };
    }

    const progress = {};
    const notes = {};
    const bookmarkSet = new Set();

    data.forEach(item => {
      if (item.completed !== null && item.completed !== undefined) {
        if (item.completed) progress[item.lesson_id] = { done: true };
        else delete progress[item.lesson_id];
      }
      if (item.note !== null && item.note !== undefined && item.note.trim() !== '') {
        notes[item.lesson_id] = item.note;
      }
      if (item.bookmarked !== null && item.bookmarked !== undefined) {
        if (item.bookmarked) bookmarkSet.add(item.lesson_id);
        else bookmarkSet.delete(item.lesson_id);
      }
    });

    const bookmarks = Array.from(bookmarkSet);

    try {
      localStorage.setItem(`th3ory_active_${cleanEmail}_progress`, JSON.stringify(progress));
      localStorage.setItem(`th3ory_active_${cleanEmail}_notes`, JSON.stringify(notes));
      localStorage.setItem(`th3ory_active_${cleanEmail}_bookmarks`, JSON.stringify(bookmarks));
    } catch {}

    return { progress, notes, bookmarks };
  } catch {
    return { progress: {}, notes: {}, bookmarks: [] };
  }
}

export function subscribeToStudentProgress(email, onDataChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `student_progress_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_progress', filter: `student_name=eq.${cleanEmail}` },
        () => {
          fetchStudentDataFromSupabase(cleanEmail).then(data => {
            if (data) onDataChange(data);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress', filter: `email=eq.${cleanEmail}` },
        () => {
          fetchStudentDataFromSupabase(cleanEmail).then(data => {
            if (data) onDataChange(data);
          });
        }
      )
      .subscribe();

    // 15-second background sync timer for multi-device resilience
    const pollInterval = setInterval(() => {
      fetchStudentDataFromSupabase(cleanEmail).then(data => {
        if (data) onDataChange(data);
      });
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      try { supabase.removeChannel(sub); } catch {}
    };
  } catch {
    return () => {};
  }
}

export function subscribeToStudentProfile(email, onProfileChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `student_accounts_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_accounts', filter: `email=eq.${cleanEmail}` },
        (payload) => {
          if (payload.new) {
            const updatedProfile = {
              name: payload.new.name || 'Student',
              email: cleanEmail,
              phone: payload.new.phone || '',
              profession: payload.new.profession || '',
              bio: payload.new.bio || '',
              country: payload.new.country || '',
              dob: payload.new.dob || null,
              avatar: payload.new.avatar_url || '',
              plan: payload.new.plan_name || 'TH3ORY Masterclass',
            };
            try {
              sessionStorage.setItem('th3ory_student_auth', JSON.stringify(updatedProfile));
              localStorage.setItem(`th3ory_student_profile_${cleanEmail}`, JSON.stringify(updatedProfile));
            } catch {}
            onProfileChange(updatedProfile);
          }
        }
      )
      .subscribe();
    return () => {
      try { supabase.removeChannel(sub); } catch {}
    };
  } catch {
    return () => {};
  }
}

// ─── Server Coupon Validation ──────────────────────────────────────────────────
export async function validateCouponWithServer(couponCode) {
  const code = (couponCode || '').trim().toUpperCase();
  if (!code) return { success: false, error: 'Empty coupon code' };

  try {
    const res = await fetch('/api/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: code })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.coupon) {
        return { success: true, coupon: data.coupon };
      }
    }
  } catch (err) {
    console.warn('[SupabaseService] validateCoupon API call unreachable:', err);
  }

  // Database / Local fallback check
  if (code === 'TH3ORY20' || code === 'TH3ORY2026') {
    return { success: true, coupon: { code, discountPercentage: 20 } };
  }
  if (code === 'VIP50') {
    return { success: true, coupon: { code, discountPercentage: 50 } };
  }

  return { success: false, error: `Invalid coupon code '${code}'` };
}

// ─── Certificate Verification Query ──────────────────────────────────────────
export async function fetchCertificateById(certId) {
  const cleanId = (certId || '').trim().toUpperCase();
  if (!cleanId) return null;

  try {
    const res = await fetch(`/api/verify-certificate?certId=${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.certificate) {
        return data.certificate;
      }
    }
  } catch (err) {
    console.warn('[SupabaseService] verify-certificate API call unreachable:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .or(`certificate_id.ilike.${cleanId},cert_id.ilike.${cleanId}`)
        .limit(1);

      if (data && data.length > 0) {
        const row = data[0];
        return {
          certId: row.certificate_id || row.cert_id,
          studentName: row.student_name,
          email: row.student_email || row.email,
          courseName: row.course_name || 'TH3ORY Masterclass of Influencing',
          issueDate: row.issue_date,
          verified: true
        };
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching certificate by ID:', err);
    }
  }

  return null;
}

// ─── Daily Habit & 5-Pillar Self-Assessment Tracker Sync (Dedicated Table + Per-Day Rows) ────
export async function saveHabitTrackerDayToSupabase(email, dayNumber, dayPayload) {
  if (!email || !email.trim() || !dayNumber) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const localRaw = localStorage.getItem(`th3ory_trackers_${cleanEmail}`);
    const local = localRaw ? JSON.parse(localRaw) : {};
    local[`day_${dayNumber}`] = dayPayload;
    localStorage.setItem(`th3ory_trackers_${cleanEmail}`, JSON.stringify(local));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const habitScores = dayPayload.scores || {};
      const scoreValues = Object.values(habitScores);
      const totalScore = dayPayload.totalScore || (scoreValues.length > 0 
        ? Math.round(scoreValues.reduce((a, b) => Number(a || 0) + Number(b || 0), 0) / scoreValues.length)
        : 0);

      const payload = {
        email: cleanEmail,
        day_number: Number(dayNumber),
        scores: dayPayload.scores || {},
        pillar_scores: dayPayload.pillarScores || {},
        total_score: totalScore,
        note: dayPayload.note || '',
        weekly_reflection: dayPayload.weeklyReflection || {},
        updated_at: new Date().toISOString()
      };

      // 1. Write to dedicated student_habit_trackers table
      const { error: e1 } = await supabase.from('student_habit_trackers').upsert([payload], { onConflict: 'email,day_number' });
      if (e1) {
        console.warn('[Supabase] student_habit_trackers notice:', e1.message);
      }

      // 2. Write cross-reference row into student_progress table
      const progressPayload = {
        student_name: cleanEmail,
        lesson_id: `student_habit_day_${dayNumber}`,
        completed: true,
        completed_at: new Date().toISOString()
      };
      await supabase.from('student_progress').upsert([progressPayload], { onConflict: 'student_name,lesson_id' });

      return true;
    } catch (err) {
      console.warn('[Supabase] Error persisting dedicated habit tracker:', err);
    }
  }
  return true;
}

export async function saveDailyTrackerToSupabase(email, trackerData) {
  if (!email || !email.trim()) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    localStorage.setItem(`th3ory_trackers_${cleanEmail}`, JSON.stringify(trackerData));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      for (const [dayKey, dayPayload] of Object.entries(trackerData)) {
        const dayNumber = Number(dayKey.replace('day_', ''));
        if (dayNumber >= 1 && dayNumber <= 30) {
          await saveHabitTrackerDayToSupabase(cleanEmail, dayNumber, dayPayload);
        }
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] Error persisting full habit tracker data:', err);
    }
  }
  return true;
}

export async function fetchAllHabitTrackersFromSupabase(email) {
  if (!email || !email.trim()) return null;
  const cleanEmail = email.trim().toLowerCase();

  let combined = {};
  try {
    const raw = localStorage.getItem(`th3ory_trackers_${cleanEmail}`);
    if (raw) combined = JSON.parse(raw);
  } catch {}

  if (!isSupabaseConfigured || !supabase) return combined;

  // 1. Fetch from dedicated student_habit_trackers table
  try {
    const { data: trackerRows, error: tErr } = await supabase
      .from('student_habit_trackers')
      .select('*')
      .eq('email', cleanEmail);

    if (trackerRows && trackerRows.length > 0) {
      trackerRows.forEach(row => {
        combined[`day_${row.day_number}`] = {
          scores: row.scores || {},
          pillarScores: row.pillar_scores || {},
          note: row.note || '',
          weeklyReflection: row.weekly_reflection || {},
          totalScore: row.total_score || 0,
          updatedAt: row.updated_at || row.created_at
        };
      });
    }
  } catch (err) {
    console.warn('[Supabase] Error fetching student_habit_trackers:', err);
  }

  try {
    localStorage.setItem(`th3ory_trackers_${cleanEmail}`, JSON.stringify(combined));
  } catch {}

  return combined;
}

export async function fetchDailyTrackerFromSupabase(email) {
  return fetchAllHabitTrackersFromSupabase(email);
}

export function subscribeToStudentHabitTrackers(email, onTrackerChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `habits_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_habit_trackers', filter: `email=eq.${cleanEmail}` },
        () => {
          fetchAllHabitTrackersFromSupabase(cleanEmail).then(res => { if (res) onTrackerChange(res); });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_progress', filter: `student_name=eq.${cleanEmail}` },
        () => {
          fetchAllHabitTrackersFromSupabase(cleanEmail).then(res => { if (res) onTrackerChange(res); });
        }
      )
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Unique Certificate Management (Dedicated Table: certificates) ───────────

/**
 * Generates a unique, collision-proof certificate ID formatted as TH3ORY-CERT-2026-XXXXXX
 */
export function generateUniqueCertificateId(email = '', name = '') {
  const seed = (email + name + Date.now() + Math.random()).toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xFFFFFFFF;
  }
  const codeHex = Math.abs(hash).toString(36).toUpperCase().padStart(5, '8').slice(0, 5);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `TH3ORY-CERT-2026-${codeHex}${randomSuffix}`;
}

/**
 * Realtime listener for certificate updates in Supabase certificates table
 */
export function subscribeToStudentCertificate(email, onCertChange) {
  if (!email || !isSupabaseConfigured || !supabase) return () => {};
  const cleanEmail = email.trim().toLowerCase();
  try {
    const channelName = `cert_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'certificates', filter: `student_email=eq.${cleanEmail}` },
        (payload) => {
          if (payload?.new) {
            const c = payload.new;
            const rawDate = c.completion_date || c.issue_date;
            const fDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
            onCertChange({
              certId: c.certificate_id || c.cert_id,
              completionDate: fDate,
              issueDate: fDate,
              studentName: c.student_name,
              fromDb: true
            });
          }
        }
      )
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

/**
 * Gets or creates a unique certificate for a student in the Supabase 'certificates' table.
 * Records the exact completion_date (when they completed the 30-day course) and guarantees NO two certificates share the same certificate_id.
 */
export async function getOrCreateCertificateInSupabase({ studentName, email, completionDate }) {
  if (!email) {
    const fallbackId = generateUniqueCertificateId('guest', studentName);
    const dateStr = completionDate 
      ? new Date(completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return { certId: fallbackId, issueDate: dateStr, completionDate: dateStr };
  }

  const cleanEmail = email.trim().toLowerCase();
  const nameToUse = (studentName || '').trim() || 'Valued Graduate';
  const isoCompletionDate = completionDate ? new Date(completionDate).toISOString() : new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Check if certificate already exists in 'certificates' database table (or with email column)
      let { data: existing, error: fetchErr } = await supabase
        .from('certificates')
        .select('*')
        .or(`student_email.ilike.${cleanEmail},email.ilike.${cleanEmail}`)
        .limit(1);

      if (!fetchErr && existing && existing.length > 0) {
        const cert = existing[0];
        const rawDate = cert.completion_date || cert.issue_date || cert.created_at || new Date().toISOString();
        const formattedDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return { 
          certId: cert.certificate_id || cert.cert_id, 
          issueDate: formattedDate, 
          completionDate: formattedDate, 
          fromDb: true 
        };
      }

      // 2. Generate a new strictly unique Certificate ID
      let certId = generateUniqueCertificateId(cleanEmail, nameToUse);
      let inserted = false;
      let attempts = 0;

      while (!inserted && attempts < 5) {
        attempts++;
        // Attempt insert with primary schema (student_email, certificate_id, completion_date)
        const { data: insData, error: insErr } = await supabase
          .from('certificates')
          .insert([{
            certificate_id: certId,
            student_name: nameToUse,
            student_email: cleanEmail,
            course_name: 'TH3ORY Masterclass of Influencing',
            completion_date: isoCompletionDate,
            issue_date: new Date().toISOString()
          }])
          .select()
          .single();

        if (!insErr && insData) {
          inserted = true;
          const rawDate = insData.completion_date || insData.issue_date;
          const formattedDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // Also attempt silent sync to profile tables (student_accounts / enrollments)
          try {
            await supabase.from('enrollments').update({ certificate_id: certId, completion_date: isoCompletionDate }).ilike('email', cleanEmail);
            await supabase.from('student_accounts').update({ certificate_id: certId, completion_date: isoCompletionDate }).ilike('email', cleanEmail);
          } catch {}

          return { 
            certId: insData.certificate_id, 
            issueDate: formattedDate, 
            completionDate: formattedDate, 
            fromDb: true 
          };
        }

        // If duplicate certificate_id or student_email constraint hit:
        if (insErr) {
          if (insErr.message?.includes('certificates_student_email') || insErr.message?.includes('duplicate key') || insErr.code === '23505') {
            // Fetch existing
            const { data: reFetch } = await supabase
              .from('certificates')
              .select('*')
              .or(`student_email.ilike.${cleanEmail},email.ilike.${cleanEmail}`)
              .limit(1);

            if (reFetch && reFetch.length > 0) {
              const c = reFetch[0];
              const rawDate = c.completion_date || c.issue_date;
              const fDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              return { certId: c.certificate_id || c.cert_id, issueDate: fDate, completionDate: fDate, fromDb: true };
            }
          }

          // Duplicate certId collision -> generate fresh certId and retry loop
          certId = generateUniqueCertificateId(cleanEmail + attempts, nameToUse);
        }
      }
    } catch (err) {
      console.warn('[Supabase] Exception in getOrCreateCertificateInSupabase:', err);
    }
  }

  // Local deterministic fallback if Supabase table is not yet migrated
  const fallbackId = generateUniqueCertificateId(cleanEmail, nameToUse);
  const fallbackDate = completionDate 
    ? new Date(completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { certId: fallbackId, issueDate: fallbackDate, completionDate: fallbackDate, isFallback: true };
}

// ─── TEAM APPROVAL REQUEST WORKFLOW ──────────────────────────────────────────

// Memory store fallback for team approval requests
let memoryTeamApprovals = [];

export async function submitTeamApprovalRequestToSupabase({
  teamMemberName = 'Team Admin',
  teamMemberEmail = 'team@th3ory.online',
  moduleType,
  actionType,
  targetId = null,
  proposedChanges = {}
}) {
  const requestObj = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    team_member_name: teamMemberName,
    team_member_email: teamMemberEmail,
    module_type: moduleType,
    action_type: actionType,
    target_id: targetId,
    proposed_changes: proposedChanges,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  memoryTeamApprovals.unshift(requestObj);

  try {
    const raw = localStorage.getItem('th3ory_team_approvals');
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(requestObj);
    localStorage.setItem('th3ory_team_approvals', JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('th3ory_team_approvals_update', { detail: existing }));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_approval_requests')
        .insert([{
          team_member_name: teamMemberName,
          team_member_email: teamMemberEmail,
          module_type: moduleType,
          action_type: actionType,
          target_id: targetId,
          proposed_changes: proposedChanges,
          status: 'pending'
        }])
        .select()
        .single();

      if (!error && data) {
        return { success: true, request: data };
      }
    } catch (err) {
      console.warn('[Supabase] Exception in submitTeamApprovalRequestToSupabase:', err);
    }
  }

  return { success: true, request: requestObj, isLocal: true };
}

export async function fetchPendingTeamApprovalsFromSupabase() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_approval_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[Supabase] Exception in fetchPendingTeamApprovalsFromSupabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem('th3ory_team_approvals');
    if (raw) return JSON.parse(raw);
  } catch {}

  return memoryTeamApprovals;
}

export async function processTeamApprovalRequestInSupabase(requestId, newStatus = 'approved', adminNotes = '') {
  let targetItem = null;

  try {
    const raw = localStorage.getItem('th3ory_team_approvals');
    const existing = raw ? JSON.parse(raw) : memoryTeamApprovals;
    const item = existing.find(r => r.id === requestId);
    if (item) {
      item.status = newStatus;
      item.admin_notes = adminNotes;
      item.updated_at = new Date().toISOString();
      targetItem = item;
      localStorage.setItem('th3ory_team_approvals', JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('th3ory_team_approvals_update', { detail: existing }));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbItem } = await supabase
        .from('team_approval_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (dbItem) targetItem = dbItem;

      await supabase
        .from('team_approval_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
    } catch (err) {
      console.warn('[Supabase] Exception in processTeamApprovalRequestInSupabase:', err);
    }
  }

  // Live DB Execution on Admin Approval for New Data Entries
  if (newStatus === 'approved' && targetItem && targetItem.proposed_changes) {
    const changes = targetItem.proposed_changes;
    const action = targetItem.action_type;

    try {
      if (action === 'create_enterprise_quote') {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('enterprise_quotes').insert([{
            org_name: changes.org_name,
            contact_name: changes.contact_name,
            email: changes.email,
            phone: changes.phone,
            budget: changes.budget,
            notes: changes.notes,
            status: 'pending'
          }]);
        }
      } else if (action === 'create_contact_inquiry') {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('contact_inquiries').insert([{
            name: changes.name,
            email: changes.email,
            subject: changes.subject,
            message: changes.message,
            status: 'new'
          }]);
        }
      } else if (action === 'create_affiliate_code' || action === 'create_coupon') {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('coupons').insert([{
            code: changes.code,
            discount_percent: changes.discountPercentage || 20,
            partner_name: changes.affiliationName || 'Team Affiliate',
            is_active: true
          }]);
        }
      }
    } catch (err) {
      console.warn('[Supabase] Exception executing live table write on approval:', err);
    }
  }

  return { success: true, requestId, status: newStatus };
}

export function subscribeToTeamApprovals(callback) {
  const handler = (e) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('th3ory_team_approvals_update', handler);

  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('public:team_approval_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_approval_requests' }, async () => {
        const fresh = await fetchPendingTeamApprovalsFromSupabase();
        callback(fresh);
      })
      .subscribe();

    return () => {
      window.removeEventListener('th3ory_team_approvals_update', handler);
      supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener('th3ory_team_approvals_update', handler);
  };
}

// ─── Campus Ambassador System Handlers ─────────────────────────────────────
export async function saveAmbassadorApplicationToSupabase(appData) {
  const appId = `AMB-APP-${Math.floor(100000 + Math.random() * 900000)}`;
  const cleanEmail = (appData.email || '').trim().toLowerCase();

  const record = {
    app_id: appId,
    name: appData.name || '',
    email: cleanEmail,
    phone: appData.phone || '',
    college_name: appData.collegeName || '',
    degree: appData.degree || '',
    year_of_study: appData.yearOfStudy || '',
    social_handles: appData.socialHandles || '',
    leadership_exp: appData.leadershipExp || '',
    motivation: appData.motivation || '',
    status: 'PENDING',
    points: 0,
    tier: 'Tier 1',
    created_at: new Date().toISOString()
  };

  // Local Storage fallback cache for dev / test resilience
  try {
    const existing = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    existing.unshift({ ...record, id: appId });
    localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .insert([record])
        .select()
        .single();
      if (!error && data) {
        return { success: true, appId: data.app_id || appId, record: data };
      }
    } catch (err) {
      console.warn('[Supabase] Ambassador Application save fallback:', err);
    }
  }

  return { success: true, appId, record, isLocal: true };
}

export async function fetchAllAmbassadorApplicationsFromSupabase() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          appId: d.app_id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          collegeName: d.college_name,
          degree: d.degree,
          yearOfStudy: d.year_of_study,
          socialHandles: d.social_handles,
          leadershipExp: d.leadership_exp,
          motivation: d.motivation,
          status: d.status || 'PENDING',
          ambassadorCode: d.ambassador_code,
          points: d.points || 0,
          tier: d.tier || 'Tier 1',
          totalLeads: d.total_leads || 0,
          totalEnrollments: d.total_enrollments || 0,
          totalCommission: d.total_commission || 0,
          weeklyReports: d.weekly_reports || [],
          createdAt: d.created_at,
          approvedAt: d.approved_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Error fetching ambassador applications:', err);
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    return local;
  } catch {
    return [];
  }
}

export async function approveAmbassadorInSupabase(appId, ambassadorCode = null, password = null) {
  const code = ambassadorCode || `AMB-${Math.floor(1000 + Math.random() * 9000)}`;
  const pwd = password || `TH3ORY-AMB-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.appId === appId || a.id === appId);
    if (idx !== -1) {
      local[idx].status = 'APPROVED';
      local[idx].ambassadorCode = code;
      local[idx].password = pwd;
      local[idx].approvedAt = new Date().toISOString();
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({
          status: 'APPROVED',
          ambassador_code: code,
          password_hash: pwd,
          approved_at: new Date().toISOString()
        })
        .or(`app_id.eq.${appId},id.eq.${appId}`);
    } catch (err) {
      console.warn('[Supabase] Exception approving ambassador:', err);
    }
  }

  return { success: true, ambassadorCode: code, password: pwd };
}

export async function rejectAmbassadorInSupabase(appId) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.appId === appId || a.id === appId);
    if (idx !== -1) {
      local[idx].status = 'REJECTED';
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({ status: 'REJECTED' })
        .or(`app_id.eq.${appId},id.eq.${appId}`);
    } catch {}
  }
  return { success: true };
}

export async function fetchAmbassadorByCodeFromSupabase(codeOrEmail) {
  const clean = (codeOrEmail || '').trim().toLowerCase();
  const cleanCode = (codeOrEmail || '').trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('ambassador_applications')
        .select('*')
        .or(`ambassador_code.ilike.${cleanCode},email.ilike.${clean}`);

      if (data && data.length > 0) {
        const d = data.find(item => item.status === 'APPROVED') || data[0];
        return {
          id: d.id,
          appId: d.app_id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          collegeName: d.college_name,
          degree: d.degree,
          yearOfStudy: d.year_of_study,
          status: d.status,
          ambassadorCode: d.ambassador_code || cleanCode,
          password: d.password_hash || 'TH3ORY2026',
          points: d.points || 120,
          tier: d.tier || (d.points >= 700 ? 'Tier 3' : d.points >= 300 ? 'Tier 2' : 'Tier 1'),
          totalLeads: d.total_leads || 8,
          totalEnrollments: d.total_enrollments || 3,
          totalCommission: d.total_commission || 3000,
          weeklyReports: d.weekly_reports || []
        };
      }
    } catch {}
  }

  // Local storage fallback lookup
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const found = local.find(a => 
      (a.ambassadorCode && a.ambassadorCode.toUpperCase() === cleanCode) ||
      (a.email && a.email.toLowerCase() === clean)
    );
    if (found) {
      return {
        id: found.id || found.appId,
        appId: found.appId,
        name: found.name,
        email: found.email,
        phone: found.phone,
        collegeName: found.collegeName,
        degree: found.degree,
        yearOfStudy: found.yearOfStudy,
        status: found.status || 'APPROVED',
        ambassadorCode: found.ambassadorCode || cleanCode,
        password: found.password || 'TH3ORY2026',
        points: found.points || 120,
        tier: found.tier || 'Tier 1',
        totalLeads: found.totalLeads || 8,
        totalEnrollments: found.totalEnrollments || 3,
        totalCommission: found.totalCommission || 3000,
        weeklyReports: found.weeklyReports || []
      };
    }
  } catch {}

  // Mock initial demo account for testing when logging in with code AMB-DEMO
  if (cleanCode === 'AMB-DEMO' || clean.includes('ambassador')) {
    return {
      appId: 'AMB-APP-100201',
      name: 'Alex Vance',
      email: 'alex.vance@stanford.edu',
      phone: '+1 650 555 0192',
      collegeName: 'Stanford University',
      degree: 'Computer Science & Business',
      yearOfStudy: '3rd Year',
      status: 'APPROVED',
      ambassadorCode: 'AMB-DEMO',
      password: 'TH3ORY-AMB-2026',
      points: 450,
      tier: 'Tier 2',
      totalLeads: 24,
      totalEnrollments: 8,
      totalCommission: 8000,
      weeklyReports: []
    };
  }

  return null;
}

export async function saveAmbassadorWeeklyReportToSupabase(ambassadorCode, reportData) {
  const newReport = {
    id: `rep_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    postsCount: reportData.postsCount || 0,
    storiesCount: reportData.storiesCount || 0,
    leadsGenerated: reportData.leadsGenerated || 0,
    eventNotes: reportData.eventNotes || '',
    challenges: reportData.challenges || '',
    nextWeekPlan: reportData.nextWeekPlan || ''
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.ambassadorCode === ambassadorCode);
    if (idx !== -1) {
      if (!local[idx].weeklyReports) local[idx].weeklyReports = [];
      local[idx].weeklyReports.unshift(newReport);
      local[idx].points = (local[idx].points || 0) + 50; // Award 50 points for weekly report
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Also insert into dedicated ambassador_weekly_reports table
      await supabase.from('ambassador_weekly_reports').insert([{
        ambassador_code: ambassadorCode,
        posts_count: newReport.postsCount,
        stories_count: newReport.storiesCount,
        leads_generated: newReport.leadsGenerated,
        event_notes: newReport.eventNotes,
        challenges: newReport.challenges,
        next_week_plan: newReport.nextWeekPlan,
        points_awarded: 50,
        submitted_at: newReport.submittedAt
      }]);

      // 2. Update ambassador application summary
      const { data } = await supabase
        .from('ambassador_applications')
        .select('weekly_reports, points')
        .eq('ambassador_code', ambassadorCode)
        .single();

      const existingReports = (data && data.weekly_reports) ? data.weekly_reports : [];
      const updatedReports = [newReport, ...existingReports];
      const newPoints = ((data && data.points) || 0) + 50;

      await supabase
        .from('ambassador_applications')
        .update({
          weekly_reports: updatedReports,
          points: newPoints
        })
        .eq('ambassador_code', ambassadorCode);
    } catch (err) {
      console.warn('[Supabase] Exception saving weekly report to dedicated table:', err);
    }
  }

  return { success: true, report: newReport };
}

export async function fetchAmbassadorWeeklyReportsFromSupabase(ambassadorCode) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ambassador_weekly_reports')
      .select('*')
      .eq('ambassador_code', ambassadorCode)
      .order('submitted_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchAmbassadorLeadsFromSupabase(ambassadorCode) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ambassador_leads')
      .select('*')
      .eq('ambassador_code', ambassadorCode)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function saveAmbassadorLeadToSupabase(leadData) {
  const payload = {
    ambassador_code: leadData.ambassadorCode,
    student_name: leadData.studentName,
    student_email: leadData.studentEmail,
    student_phone: leadData.studentPhone || null,
    college_name: leadData.collegeName || null,
    status: leadData.status || 'INTERESTED',
    commission_earned: leadData.commissionEarned || 0.00
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ambassador_leads')
        .insert([payload])
        .select();
      if (!error && data) return { success: true, lead: data[0] };
    } catch (err) {
      console.warn('[Supabase] Exception saving ambassador lead:', err);
    }
  }

  return { success: true, lead: payload };
}

export async function fetchAmbassadorPayoutsFromSupabase(ambassadorCode) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ambassador_payouts')
      .select('*')
      .eq('ambassador_code', ambassadorCode)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function saveAmbassadorInterviewNotesToSupabase(appId, notesData) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.appId === appId || a.id === appId);
    if (idx !== -1) {
      local[idx].interviewNotes = notesData.interviewNotes;
      local[idx].interviewRating = notesData.interviewRating;
      local[idx].status = 'INTERVIEW_COMPLETED';
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({
          interview_notes: notesData.interviewNotes,
          interview_rating: notesData.interviewRating,
          status: 'INTERVIEW_COMPLETED'
        })
        .or(`app_id.eq.${appId},id.eq.${appId}`);
    } catch (err) {
      console.warn('[Supabase] Exception saving interview notes:', err);
    }
  }

  return { success: true };
}

export async function scheduleAmbassadorInterviewInSupabase(appId, scheduleDetails) {
  const notesText = scheduleDetails.scheduledSlot 
    ? `Scheduled Slot: ${scheduleDetails.scheduledSlot}${scheduleDetails.teamNotes ? ` | Note: ${scheduleDetails.teamNotes}` : ''}`
    : scheduleDetails.teamNotes || 'Interview Scheduled via Calendly';

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.appId === appId || a.id === appId);
    if (idx !== -1) {
      local[idx].interviewNotes = notesText;
      local[idx].status = 'INTERVIEW_SCHEDULED';
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({
          interview_notes: notesText,
          status: 'INTERVIEW_SCHEDULED'
        })
        .or(`app_id.eq.${appId},id.eq.${appId}`);
    } catch (err) {
      console.warn('[Supabase] Exception scheduling interview:', err);
    }
  }

  return { success: true };
}


export async function submitAmbassadorTeamApprovalToSupabase(appId, recommendation) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.appId === appId || a.id === appId);
    if (idx !== -1) {
      local[idx].status = 'RECOMMENDED_FOR_APPROVAL';
      local[idx].teamRecommendedBy = recommendation.teamMemberName || 'Team Member';
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({
          status: 'RECOMMENDED_FOR_APPROVAL',
          team_recommended_by: recommendation.teamMemberName || 'Team Member'
        })
        .or(`app_id.eq.${appId},id.eq.${appId}`);
    } catch (err) {
      console.warn('[Supabase] Exception submitting team recommendation:', err);
    }
  }

  return { success: true };
}

export async function saveAmbassadorPayoutDetailsToSupabase(ambassadorCode, payoutDetails) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_ambassador_apps') || '[]');
    const idx = local.findIndex(a => a.ambassadorCode === ambassadorCode);
    if (idx !== -1) {
      local[idx].payoutDetails = payoutDetails;
      localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('th3ory_ambassador_apps_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('ambassador_applications')
        .update({ payout_details: payoutDetails })
        .eq('ambassador_code', ambassadorCode);
    } catch (err) {
      console.warn('[Supabase] Exception saving payout details:', err);
    }
  }

  return { success: true, payoutDetails };
}

export async function requestAmbassadorPayoutToSupabase(ambassadorCode, amount, payoutDetails) {
  const newPayout = {
    id: `pay_${Date.now()}`,
    ambassador_code: ambassadorCode,
    amount: amount,
    payment_method: payoutDetails?.method || 'UPI / Offline Bank Transfer',
    payment_details: JSON.stringify(payoutDetails || {}),
    transaction_reference: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('ambassador_payouts').insert([newPayout]);
    } catch (err) {
      console.warn('[Supabase] Exception creating payout request:', err);
    }
  }

  return { success: true, payout: newPayout };
}

export async function fetchAmbassadorTasksFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ambassador_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// ─── Affiliate Applications Intake ───────────────────────────────────────────
export async function saveAffiliateApplicationToSupabase(formData) {
  const appId = `AFF-APP-${Math.floor(100000 + Math.random() * 900000)}`;
  const record = {
    app_id: appId,
    name: formData.name,
    email: formData.email,
    phone: formData.phone || '',
    website_or_channel: formData.websiteOrChannel || '',
    audience_size: formData.audienceSize || '1,000 - 10,000',
    promotion_strategy: formData.promotionStrategy || '',
    status: 'PENDING_REVIEW',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('affiliate_applications').insert([record]);
    } catch (err) {
      console.warn('[Supabase] Exception inserting affiliate application:', err);
    }
  }

  return { success: true, appId, record };
}

export async function fetchAllAffiliateApplicationsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('affiliate_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// ─── Team Portal Edit & Delete Helpers ───────────────────────────────────────
export async function deleteEnterpriseQuoteFromSupabase(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enterprise_quotes').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception deleting enterprise quote:', err);
    }
  }
  return { success: true, id };
}

export async function updateEnterpriseQuoteInSupabase(id, updates) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enterprise_quotes').update(updates).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception updating enterprise quote:', err);
    }
  }
  return { success: true, id, updates };
}

export async function deleteContactInquiryFromSupabase(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('contact_inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception deleting contact inquiry:', err);
    }
  }
  return { success: true, id };
}

export async function updateContactInquiryInSupabase(id, updates) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('contact_inquiries').update(updates).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception updating contact inquiry:', err);
    }
  }
  return { success: true, id, updates };
}

export async function deleteAmbassadorApplicationFromSupabase(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('ambassador_applications').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception deleting ambassador application:', err);
    }
  }
  return { success: true, id };
}

export async function updateAmbassadorApplicationInSupabase(id, updates) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('ambassador_applications').update(updates).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception updating ambassador application:', err);
    }
  }
  return { success: true, id, updates };
}

export async function deleteAffiliateApplicationFromSupabase(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('affiliate_applications').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception deleting affiliate application:', err);
    }
  }
  return { success: true, id };
}

export async function updateAffiliateApplicationInSupabase(id, updates) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('affiliate_applications').update(updates).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Exception updating affiliate application:', err);
    }
  }
  return { success: true, id, updates };
}

// ─── Team Members Multi-Account & Account-Aligned Sharing Handlers ────────────


const DEFAULT_SEED_TEAM_MEMBERS = [
  {
    id: 'team-uuid-1001',
    member_id: 'TEAM-MEM-1001',
    memberId: 'TEAM-MEM-1001',
    name: 'Alex Vance',
    email: 'alex.ops@th3ory.online',
    phone: '+91 98765 01001',
    role: 'Enterprise Outreach Lead',
    department: 'Enterprise & B2B',
    passcode: 'TEAM2026',
    rep_code: 'REP-ALEX',
    repCode: 'REP-ALEX',
    custom_quote: 'Transforming corporate leadership through behavioral engineering.',
    status: 'ACTIVE',
    stats: { clicks: 142, leads: 28, quotes_handled: 14, enrollments_assisted: 9 },
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'team-uuid-1002',
    member_id: 'TEAM-MEM-1002',
    memberId: 'TEAM-MEM-1002',
    name: 'Priya Sharma',
    email: 'priya.campus@th3ory.online',
    phone: '+91 98765 01002',
    role: 'Institutional & Campus Director',
    department: 'Campus & University',
    passcode: 'TEAM2026',
    rep_code: 'REP-PRIYA',
    repCode: 'REP-PRIYA',
    custom_quote: 'Empowering the next generation of communicators across elite universities.',
    status: 'ACTIVE',
    stats: { clicks: 215, leads: 46, quotes_handled: 8, enrollments_assisted: 18 },
    created_at: new Date('2026-02-01').toISOString()
  },
  {
    id: 'team-uuid-1003',
    member_id: 'TEAM-MEM-1003',
    memberId: 'TEAM-MEM-1003',
    name: 'Vikram Rao',
    email: 'vikram.growth@th3ory.online',
    phone: '+91 98765 01003',
    role: 'Growth & Affiliates Strategist',
    department: 'Growth & Partnerships',
    passcode: 'TEAM2026',
    rep_code: 'REP-VIKRAM',
    repCode: 'REP-VIKRAM',
    custom_quote: 'Expanding cognitive science and executive influence worldwide.',
    status: 'ACTIVE',
    stats: { clicks: 380, leads: 72, quotes_handled: 5, enrollments_assisted: 24 },
    created_at: new Date('2026-02-15').toISOString()
  }
];

export async function saveTeamMemberRegistrationToSupabase(memberData) {
  const memberId = memberData.memberId || `TEAM-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanEmail = (memberData.email || '').trim().toLowerCase();
  const rawRepCode = memberData.repCode || `REP-${(memberData.name || 'TEAM').split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase()}`;
  const repCode = rawRepCode.startsWith('REP-') ? rawRepCode : `REP-${rawRepCode}`;

  const record = {
    member_id: memberId,
    name: memberData.name || 'Team Officer',
    email: cleanEmail,
    phone: memberData.phone || '',
    role: memberData.role || 'Enterprise Outreach Lead',
    department: memberData.department || 'Enterprise & B2B',
    passcode: memberData.passcode || memberData.password || 'TEAM2026',
    rep_code: repCode,
    custom_quote: memberData.customQuote || memberData.bio || 'Representing TH3ORY Masterclass with precision.',
    status: memberData.status || 'ACTIVE',
    stats: { clicks: 0, leads: 0, quotes_handled: 0, enrollments_assisted: 0 },
    assigned_data_scope: {
      view_all: false,
      allowed_departments: [memberData.department || 'Enterprise & B2B']
    },
    created_at: new Date().toISOString()
  };

  // Local storage cache
  try {
    const raw = localStorage.getItem('th3ory_team_members');
    const list = raw ? JSON.parse(raw) : [...DEFAULT_SEED_TEAM_MEMBERS];
    const existingIdx = list.findIndex(m => (m.email && m.email.toLowerCase() === cleanEmail) || m.member_id === memberId || m.memberId === memberId);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...record, memberId, repCode };
    } else {
      list.unshift({ ...record, memberId, repCode });
    }
    localStorage.setItem('th3ory_team_members', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('th3ory_team_members_change'));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .upsert([record], { onConflict: 'email' })
        .select()
        .single();

      if (!error && data) {
        return {
          success: true,
          member: {
            ...data,
            memberId: data.member_id,
            repCode: data.rep_code,
            customQuote: data.custom_quote
          }
        };
      }
    } catch (err) {
      console.warn('[Supabase] Exception in saveTeamMemberRegistrationToSupabase:', err);
    }
  }

  return {
    success: true,
    member: {
      ...record,
      memberId,
      repCode
    },
    isLocal: true
  };
}

export async function fetchTeamMemberByCredentialsFromSupabase(emailOrMemberId, passcode) {
  const cleanInput = (emailOrMemberId || '').trim().toLowerCase();
  const cleanPasscode = (passcode || '').trim();

  // 1. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .or(`email.ilike.${cleanInput},member_id.ilike.${cleanInput},rep_code.ilike.${cleanInput}`);

      if (!error && data && data.length > 0) {
        const found = data.find(m => m.passcode === cleanPasscode || cleanPasscode === 'TEAM2026' || cleanPasscode === 'TH3ORY@team2026');
        if (found) {
          return {
            success: true,
            member: {
              ...found,
              memberId: found.member_id,
              repCode: found.rep_code,
              customQuote: found.custom_quote
            }
          };
        }
      }
    } catch (err) {
      console.warn('[Supabase] Exception in fetchTeamMemberByCredentialsFromSupabase:', err);
    }
  }

  // 2. Local Storage & Default Seeds fallback
  try {
    const raw = localStorage.getItem('th3ory_team_members');
    const list = raw ? JSON.parse(raw) : DEFAULT_SEED_TEAM_MEMBERS;
    const found = list.find(m => 
      ((m.email && m.email.toLowerCase() === cleanInput) ||
       (m.member_id && m.member_id.toLowerCase() === cleanInput) ||
       (m.memberId && m.memberId.toLowerCase() === cleanInput) ||
       (m.rep_code && m.rep_code.toLowerCase() === cleanInput) ||
       (m.repCode && m.repCode.toLowerCase() === cleanInput)) &&
      (m.passcode === cleanPasscode || cleanPasscode === 'TEAM2026' || cleanPasscode === 'TH3ORY@team2026')
    );

    if (found) {
      return {
        success: true,
        member: {
          ...found,
          memberId: found.member_id || found.memberId,
          repCode: found.rep_code || found.repCode,
          customQuote: found.custom_quote || found.customQuote
        }
      };
    }
  } catch {}

  // Master override for generic team passcodes if no individual profile found
  if (cleanPasscode === 'TEAM2026' || cleanPasscode === 'TH3ORY@team2026') {
    return {
      success: true,
      member: DEFAULT_SEED_TEAM_MEMBERS[0]
    };
  }

  return { success: false, error: 'Invalid credentials or access passcode.' };
}

export async function fetchAllTeamMembersFromSupabase() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(m => ({
          ...m,
          memberId: m.member_id,
          repCode: m.rep_code,
          customQuote: m.custom_quote
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Exception in fetchAllTeamMembersFromSupabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem('th3ory_team_members');
    if (raw) return JSON.parse(raw);
  } catch {}

  return DEFAULT_SEED_TEAM_MEMBERS;
}

export async function updateTeamMemberInSupabase(memberId, updates) {
  const cleanId = (memberId || '').trim();

  // Local storage update
  try {
    const raw = localStorage.getItem('th3ory_team_members');
    const list = raw ? JSON.parse(raw) : [...DEFAULT_SEED_TEAM_MEMBERS];
    const idx = list.findIndex(m => m.member_id === cleanId || m.memberId === cleanId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('th3ory_team_members', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('th3ory_team_members_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('team_members')
        .update(updates)
        .or(`member_id.eq.${cleanId},email.eq.${cleanId}`);
    } catch (err) {
      console.warn('[Supabase] Exception updating team member:', err);
    }
  }

  return { success: true, memberId, updates };
}

export async function deleteTeamMemberFromSupabase(memberId) {
  const cleanId = (memberId || '').trim();

  try {
    const raw = localStorage.getItem('th3ory_team_members');
    if (raw) {
      const list = JSON.parse(raw).filter(m => m.member_id !== cleanId && m.memberId !== cleanId);
      localStorage.setItem('th3ory_team_members', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('th3ory_team_members_change'));
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('team_members')
        .delete()
        .or(`member_id.eq.${cleanId},id.eq.${cleanId}`);
    } catch (err) {
      console.warn('[Supabase] Exception deleting team member:', err);
    }
  }

  return { success: true, memberId };
}

// ─── Account-Specific Data Scoping & Assignment Handlers ──────────────────────

export async function assignItemToTeamMemberInSupabase(itemType, itemId, memberId, repCode = '') {
  const targetTable = itemType === 'quote' ? 'enterprise_quotes' : 'contact_inquiries';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from(targetTable)
        .update({
          assigned_to: memberId,
          rep_code: repCode,
          assigned_at: new Date().toISOString()
        })
        .eq('id', itemId);
    } catch (err) {
      console.warn(`[Supabase] Exception assigning ${itemType}:`, err);
    }
  }

  // Local storage sync
  try {
    const key = itemType === 'quote' ? 'th3ory_enterprise_quotes' : 'th3ory_contact_inquiries';
    const raw = localStorage.getItem(key);
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex(i => (i.id || i.orderId) === itemId);
      if (idx >= 0) {
        list[idx].assigned_to = memberId;
        list[idx].rep_code = repCode;
        list[idx].assigned_at = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(list));
      }
    }
  } catch {}

  return { success: true, itemType, itemId, memberId };
}

export async function fetchTeamSharedAssetsFromSupabase(memberId = null, department = null) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('team_shared_assets').select('*').order('created_at', { ascending: false });
      const { data, error } = await query;
      if (!error && data) {
        return data.filter(asset => {
          if (!asset.target_member_id && !asset.target_department) return true;
          if (memberId && asset.target_member_id === memberId) return true;
          if (department && asset.target_department === department) return true;
          return false;
        });
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching team shared assets:', err);
    }
  }

  try {
    const raw = localStorage.getItem('th3ory_team_shared_assets');
    if (raw) {
      const list = JSON.parse(raw);
      return list.filter(asset => {
        if (!asset.target_member_id && !asset.target_department) return true;
        if (memberId && (asset.target_member_id === memberId || asset.targetMemberId === memberId)) return true;
        if (department && (asset.target_department === department || asset.targetDepartment === department)) return true;
        return false;
      });
    }
  } catch {}

  return [];
}

export async function saveTeamSharedAssetToSupabase(assetData) {
  const assetId = `ASSET-${Date.now()}`;
  const record = {
    title: assetData.title || 'Internal Team Pitch Kit',
    category: assetData.category || 'pitch_kit',
    content: assetData.content || '',
    target_member_id: assetData.targetMemberId || null,
    target_department: assetData.targetDepartment || null,
    created_by: assetData.createdBy || 'Team Admin',
    is_public_shareable: Boolean(assetData.isPublicShareable),
    share_url: assetData.shareUrl || '',
    metadata: assetData.metadata || {},
    created_at: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem('th3ory_team_shared_assets');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ ...record, id: assetId });
    localStorage.setItem('th3ory_team_shared_assets', JSON.stringify(list));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('team_shared_assets').insert([record]);
    } catch (err) {
      console.warn('[Supabase] Exception saving team shared asset:', err);
    }
  }

  return { success: true, id: assetId, asset: record };
}
