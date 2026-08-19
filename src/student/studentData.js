import {
  saveStudentProgressToSupabase,
  saveStudentNoteToSupabase,
  saveStudentBookmarkToSupabase,
  saveQueryToSupabase,
  deleteQueryFromSupabase,
  saveReviewToSupabase
} from '../services/supabaseService.js';

function getStudentEmail() {
  try {
    const raw = sessionStorage.getItem('th3ory_student_auth') || localStorage.getItem('th3ory_student_auth_persistent');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed.email.trim().toLowerCase();
    }
  } catch {}
  return 'default';
}

// In-memory runtime state store backed by active student session cache for instant page refresh warmup
const memStore = {};

export function clearAllLocalQueryCaches() {
  Object.keys(memStore).forEach(k => {
    if (k.endsWith('_queries')) delete memStore[k];
  });
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
}

export function spGet(key, fallback = null, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const k = `${cleanEmail}_${key}`;

  // Queries must never be loaded from localStorage — PostgreSQL database is sole authority
  if (key === 'queries') {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(`th3ory_active_${k}`); } catch {}
    }
    return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : fallback;
  }

  if (Object.prototype.hasOwnProperty.call(memStore, k)) {
    return memStore[k];
  }
  try {
    const raw = localStorage.getItem(`th3ory_active_${k}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memStore[k] = parsed;
      return parsed;
    }
  } catch {}
  return fallback;
}

export function spSet(key, val, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const k = `${cleanEmail}_${key}`;

  let processedVal = val;
  if (key === 'queries' && Array.isArray(val)) {
    const uniqueMap = new Map();
    val.forEach(item => {
      if (!item) return;
      const compKey = `${(item.studentEmail || '').trim().toLowerCase()}_${(item.subject || '').trim()}_${(item.message || '').trim()}`;
      if (!uniqueMap.has(compKey)) {
        uniqueMap.set(compKey, item);
      } else {
        const existing = uniqueMap.get(compKey);
        // Prefer item with valid UUID over temp ID or with non-open status
        if (String(item.id || '').length > 20 && String(existing.id || '').startsWith('q_')) {
          uniqueMap.set(compKey, item);
        } else if (item.status && item.status !== 'open' && existing.status === 'open') {
          uniqueMap.set(compKey, item);
        }
      }
    });
    processedVal = Array.from(uniqueMap.values());
  }

  memStore[k] = processedVal;
  try {
    if (key === 'queries') {
      // ELIMINATE all localStorage query saving procedures
      localStorage.removeItem(`th3ory_active_${k}`);
    } else if (Array.isArray(processedVal) && processedVal.length === 0) {
      localStorage.removeItem(`th3ory_active_${k}`);
    } else {
      localStorage.setItem(`th3ory_active_${k}`, JSON.stringify(processedVal));
    }
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('th3ory_student_change', { detail: { key, email: cleanEmail } }));
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function getProgress(email) { return spGet('progress', {}, email); }
export function markLesson(lessonId, done = true, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const p = { ...getProgress(cleanEmail) };
  if (done) p[lessonId] = { done: true, completedAt: new Date().toISOString() };
  else delete p[lessonId];
  spSet('progress', p, cleanEmail);

  if (cleanEmail && cleanEmail !== 'default') {
    saveStudentProgressToSupabase(cleanEmail, lessonId, done);
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────
export function getQueries(email)   { return spGet('queries', [], email); }
export async function addQuery(q, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const payload = {
    studentName: q.studentName || 'Student',
    studentEmail: cleanEmail,
    studentPlan: q.studentPlan || '',
    subject: (q.subject || '').trim(),
    type: q.type || 'General Question',
    message: (q.message || '').trim()
  };

  const saved = await saveQueryToSupabase(payload);
  if (saved && saved.id) {
    const current = getQueries(cleanEmail);
    const filtered = current.filter(item => !(
      (item.studentEmail || '').trim().toLowerCase() === cleanEmail &&
      (item.subject || '').trim() === payload.subject &&
      (item.message || '').trim() === payload.message
    ));
    spSet('queries', [saved, ...filtered], cleanEmail);
  }
  return saved;
}
export function updateQuery(id, patch, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  spSet('queries', getQueries(cleanEmail).map(q => q.id === id ? { ...q, ...patch } : q), cleanEmail);
}
export async function removeQuery(id, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  spSet('queries', getQueries(cleanEmail).filter(q => q.id !== id), cleanEmail);
  if (id && !String(id).startsWith('q_')) {
    await deleteQueryFromSupabase(id);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('th3ory_student_change'));
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export function getMyReview(email)   { return spGet('myReview', null, email); }
export function saveMyReview(r, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const payload = { ...r, submittedAt: new Date().toISOString() };
  spSet('myReview', payload, cleanEmail);
  if (cleanEmail && cleanEmail !== 'default') {
    saveReviewToSupabase(payload);
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export function getNotes(email)        { return spGet('notes', {}, email); }
export function saveNote(id, txt, email = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const n = { ...getNotes(cleanEmail) };
  n[id] = txt;
  spSet('notes', n, cleanEmail);

  if (cleanEmail && cleanEmail !== 'default') {
    saveStudentNoteToSupabase(cleanEmail, id, txt);
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export function getBookmarks(email)      { return spGet('bookmarks', [], email); }
export function toggleBookmark(id, email = null)  {
  const cleanEmail = email ? email.trim().toLowerCase() : getStudentEmail();
  const b = [...getBookmarks(cleanEmail)];
  const isBookmarked = !b.includes(id);
  const updated = isBookmarked ? [...b, id] : b.filter(x => x !== id);
  spSet('bookmarks', updated, cleanEmail);

  if (cleanEmail && cleanEmail !== 'default') {
    saveStudentBookmarkToSupabase(cleanEmail, id, isBookmarked);
  }
}
