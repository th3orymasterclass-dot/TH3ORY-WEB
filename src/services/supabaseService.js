import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { isAdminAuthenticated } from '../data/adminData.js';

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
          plan: matched.plan_name || 'TH3ORY Masterclass',
          enrolledAt: matched.created_at,
          dob: matched.dob,
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
        return {
          name: matched.name,
          email: matched.email,
          plan: matched.plan_name || 'TH3ORY Masterclass',
          enrolledAt: matched.created_at,
          dob: matched.dob,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('[Supabase] Error verifying student:', err);
    return null;
  }
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
export async function saveQueryToSupabase(queryData) {
  const payload = {
    id: `q_${Date.now()}`,
    student_name: queryData.studentName,
    student_email: queryData.studentEmail || '',
    student_plan: queryData.studentPlan || '',
    subject: queryData.subject,
    type: queryData.type,
    message: queryData.message,
    status: 'open',
    created_at: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_queries') || '[]');
    local.unshift(payload);
    localStorage.setItem('th3ory_local_queries', JSON.stringify(local));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('queries').insert([{
        student_name: queryData.studentName,
        student_email: queryData.studentEmail || '',
        student_plan: queryData.studentPlan || '',
        subject: queryData.subject,
        type: queryData.type,
        message: queryData.message,
        status: 'open',
      }]);
    } catch {}
  }
  return true;
}

export async function fetchQueriesFromSupabase() {
  let local = [];
  try {
    local = (JSON.parse(localStorage.getItem('th3ory_local_queries') || '[]')).map(q => ({
      id: q.id,
      studentName: q.student_name || q.studentName,
      studentEmail: q.student_email || q.studentEmail,
      studentPlan: q.student_plan || q.studentPlan,
      subject: q.subject,
      type: q.type,
      message: q.message,
      status: q.status,
      reply: q.reply,
      createdAt: q.created_at || q.createdAt,
      repliedAt: q.replied_at || q.repliedAt,
    }));
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase.from('queries').select('*').order('created_at', { ascending: false });
    if (error || !data) return local;
    const sbQueries = data.map(q => ({
      id: q.id,
      studentName: q.student_name,
      studentEmail: q.student_email,
      studentPlan: q.student_plan,
      subject: q.subject,
      type: q.type,
      message: q.message,
      status: q.status,
      reply: q.reply,
      createdAt: q.created_at,
      repliedAt: q.replied_at,
    }));

    const map = new Map();
    local.forEach(q => map.set(q.id || `${q.studentName}_${q.subject}`, q));
    sbQueries.forEach(q => map.set(q.id || `${q.studentName}_${q.subject}`, q));

    return Array.from(map.values());
  } catch {
    return local;
  }
}

export function subscribeToQueries(onQueryChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const sub = supabase
      .channel(`queries_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queries' }, () => {
        fetchQueriesFromSupabase().then(res => { if (res) onQueryChange(res); });
      })
      .subscribe();
    return () => { try { supabase.removeChannel(sub); } catch {} };
  } catch {
    return () => {};
  }
}

// ─── Enterprise Quotes (Dedicated Table: enterprise_quotes) ──────────────────
export async function saveEnterpriseQuoteToSupabase(quoteData) {
  const payload = {
    id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    org_name: quoteData.orgName || '',
    contact_name: quoteData.contactName || '',
    email: quoteData.email || '',
    phone: quoteData.phone || '',
    audience_type: quoteData.audienceType || 'Students',
    pupil_count: quoteData.pupilCount || '50-100',
    notes: quoteData.notes || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_quotes') || '[]');
    local.unshift(payload);
    localStorage.setItem('th3ory_local_quotes', JSON.stringify(local));
    window.dispatchEvent(new CustomEvent('th3ory_quote_change', { detail: payload }));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('enterprise_quotes').insert([{
        org_name: payload.org_name,
        contact_name: payload.contact_name,
        email: payload.email,
        phone: payload.phone,
        audience_type: payload.audience_type,
        pupil_count: payload.pupil_count,
        notes: payload.notes,
        status: payload.status
      }]);

      if (error) {
        console.warn('[Supabase] enterprise_quotes table insert fallback to queries table:', error.message);
        await supabase.from('queries').insert([{
          student_name: quoteData.contactName || quoteData.orgName,
          student_email: quoteData.email,
          student_plan: 'Enterprise Quote',
          subject: `Enterprise Quote Request: ${quoteData.orgName}`,
          type: 'Enterprise Quote',
          message: `Org: ${quoteData.orgName} | Audience: ${quoteData.audienceType} | Pupils: ${quoteData.pupilCount} | Phone: ${quoteData.phone} | Notes: ${quoteData.notes}`,
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
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('th3ory_local_quotes') || '[]');
  } catch {}

  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase.from('enterprise_quotes').select('*').order('created_at', { ascending: false });
    if (error || !data) return local;

    const map = new Map();
    local.forEach(item => map.set(item.id || `${item.email}_${item.org_name}`, item));
    data.forEach(item => map.set(item.id || `${item.email}_${item.org_name}`, item));

    return Array.from(map.values());
  } catch {
    return local;
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
  const payload = {
    id: `ci_${Date.now()}`,
    name: contactData.name || '',
    email: contactData.email || '',
    subject: contactData.subject || 'General Inquiry',
    message: contactData.message || '',
    status: 'new',
    created_at: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_inquiries') || '[]');
    local.unshift(payload);
    localStorage.setItem('th3ory_local_inquiries', JSON.stringify(local));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contact_inquiries').insert([{
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        status: payload.status
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

export async function updateQueryStatusInSupabase(queryId, status, replyText = '') {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_queries') || '[]');
    const updatedLocal = local.map(q => q.id === queryId ? { ...q, status, reply: replyText || q.reply } : q);
    localStorage.setItem('th3ory_local_queries', JSON.stringify(updatedLocal));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = { status, updated_at: new Date().toISOString() };
      if (replyText) {
        payload.reply = replyText;
        payload.replied_at = new Date().toISOString();
      }
      await supabase.from('queries').update(payload).eq('id', queryId);
    } catch {}
  }
  return true;
}

export async function updateEnterpriseQuoteStatusInSupabase(quoteId, status) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_quotes') || '[]');
    const updatedLocal = local.map(q => q.id === quoteId ? { ...q, status } : q);
    localStorage.setItem('th3ory_local_quotes', JSON.stringify(updatedLocal));
    window.dispatchEvent(new CustomEvent('th3ory_quote_change', { detail: { quoteId, status } }));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enterprise_quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', quoteId);
    } catch {}
  }
  return true;
}

export async function updateContactInquiryStatusInSupabase(inquiryId, status) {
  try {
    const local = JSON.parse(localStorage.getItem('th3ory_local_inquiries') || '[]');
    const updatedLocal = local.map(i => i.id === inquiryId ? { ...i, status } : i);
    localStorage.setItem('th3ory_local_inquiries', JSON.stringify(updatedLocal));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('contact_inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', inquiryId);
    } catch {}
  }
  return true;
}

export async function fetchContactInquiriesFromSupabase() {
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('th3ory_local_inquiries') || '[]');
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

export async function fetchReviewsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(r => ({
      id: r.id,
      name: r.name,
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
export async function fetchCourseContentsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('course_contents')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return null;
    return data.map(item => ({
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

