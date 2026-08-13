import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isAdminAuthenticated } from '../data/adminData';

// ─── Enrollments ──────────────────────────────────────────────────────────────
export async function saveEnrollmentToSupabase(enrollmentData) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Supabase] Not configured, saving locally only.');
    return { success: false, isLocal: true };
  }

  try {
    const payload = {
      order_id: enrollmentData.orderId,
      name: enrollmentData.name,
      email: enrollmentData.email,
      phone: enrollmentData.phone || '',
      country_code: enrollmentData.countryCode || '',
      address: enrollmentData.address || '',
      city: enrollmentData.city || '',
      country: enrollmentData.country || '',
      profession: enrollmentData.profession || '',
      dob: enrollmentData.dob || null,
      plan_id: enrollmentData.planId || 'pro',
      plan_name: enrollmentData.planName || 'TH3ORY Masterclass',
      amount_paid: enrollmentData.price || 0,
      currency: enrollmentData.currency || 'USD',
      gateway: enrollmentData.gateway || 'stripe',
      is_monthly: Boolean(enrollmentData.isMonthly),
      enrollment_code: enrollmentData.code || 'TH3ORY2026',
    };

    const { data: enrollment, error: e1 } = await supabase
      .from('enrollments')
      .insert([payload])
      .select()
      .single();

    if (e1) {
      console.error('[Supabase] Error saving enrollment:', e1);
    }

    // Also register student account
    const accountPayload = {
      name: enrollmentData.name,
      email: enrollmentData.email,
      enrollment_code: enrollmentData.code || 'TH3ORY2026',
      plan_name: enrollmentData.planName || 'TH3ORY Masterclass',
      last_login: new Date().toISOString(),
    };

    const { error: e2 } = await supabase
      .from('student_accounts')
      .upsert([accountPayload], { onConflict: 'email' });

    if (e2) {
      console.error('[Supabase] Error saving student account:', e2);
    }

    return { success: !e1, data: enrollment, error: e1 || e2 };
  } catch (err) {
    console.error('[Supabase] Exception in saveEnrollmentToSupabase:', err);
    return { success: false, error: err };
  }
}

// ─── Student Verification ─────────────────────────────────────────────────────
export async function verifyStudentCodeWithSupabase(emailOrName, code) {
  if (!isSupabaseConfigured || !supabase) {
    return null; // fallback to code matching
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .or(`email.ilike.${emailOrName},name.ilike.${emailOrName}`)
      .eq('enrollment_code', code)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Update last login
    await supabase
      .from('student_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('email', data[0].email);

    return {
      name: data[0].name,
      email: data[0].email,
      plan: data[0].plan_name,
      enrolledAt: data[0].created_at,
    };
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
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('queries').insert([{
      student_name: queryData.studentName,
      student_email: queryData.studentEmail || '',
      student_plan: queryData.studentPlan || '',
      subject: queryData.subject,
      type: queryData.type,
      message: queryData.message,
      status: 'open',
    }]);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchQueriesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('queries').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return data.map(q => ({
      id: q.id,
      studentName: q.student_name,
      studentPlan: q.student_plan,
      subject: q.subject,
      type: q.type,
      message: q.message,
      status: q.status,
      reply: q.reply,
      createdAt: q.created_at,
      repliedAt: q.replied_at,
    }));
  } catch {
    return null;
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
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      org_name: quoteData.orgName || '',
      contact_name: quoteData.contactName || '',
      email: quoteData.email || '',
      phone: quoteData.phone || '',
      audience_type: quoteData.audienceType || 'Students',
      pupil_count: quoteData.pupilCount || '50-100',
      notes: quoteData.notes || '',
      status: 'pending',
    };

    // Try dedicated table enterprise_quotes first
    const { error } = await supabase.from('enterprise_quotes').insert([payload]);
    if (error) {
      console.warn('[Supabase] enterprise_quotes table insert fallback to queries table:', error.message);
      // Fallback to queries table if enterprise_quotes schema is not yet created
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
    return true;
  } catch (err) {
    console.error('[Supabase] Exception in saveEnterpriseQuoteToSupabase:', err);
    return false;
  }
}

export async function fetchEnterpriseQuotesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('enterprise_quotes').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return data;
  } catch {
    return null;
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
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      name: contactData.name || '',
      email: contactData.email || '',
      subject: contactData.subject || 'General Inquiry',
      message: contactData.message || '',
      status: 'new',
    };

    // Try dedicated table contact_inquiries first
    const { error } = await supabase.from('contact_inquiries').insert([payload]);
    if (error) {
      console.warn('[Supabase] contact_inquiries table insert fallback to queries table:', error.message);
      // Fallback to queries table if contact_inquiries schema is not yet created
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
    return true;
  } catch (err) {
    console.error('[Supabase] Exception in saveContactInquiryToSupabase:', err);
    return false;
  }
}

export async function fetchContactInquiriesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false });
    if (error) return null;
    return data;
  } catch {
    return null;
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
      accessLevel: item.access_level,
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
      platform: item.platform || 'youtube',
      level_id: item.levelId || null,
      lesson_id: item.lessonId || null,
      duration: item.duration || '20 mins',
      access_level: item.accessLevel || 'enrolled',
      description: item.description || '',
      tags: item.tags || [],
      published: Boolean(item.published),
      updated_at: new Date().toISOString(),
    };

    if (item.id && !item.id.startsWith('c_')) {
      const { error } = await supabase
        .from('course_contents')
        .update(payload)
        .eq('id', item.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('course_contents')
        .insert([{ ...payload, content_key: `c_${Date.now()}` }]);
      return !error;
    }
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
