import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

// ─── Queries ──────────────────────────────────────────────────────────────────
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
  try {
    const { error } = await supabase.from('course_contents').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
