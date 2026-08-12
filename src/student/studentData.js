// Student-specific localStorage helpers

const P = 'th3ory_student_';

export function spGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(P + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function spSet(key, val) {
  localStorage.setItem(P + key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent('th3ory_student_change', { detail: { key } }));
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function getProgress() { return spGet('progress', {}); }
export function markLesson(lessonId, done = true) {
  const p = getProgress();
  if (done) p[lessonId] = { done: true, completedAt: new Date().toISOString() };
  else delete p[lessonId];
  spSet('progress', p);
}

// ─── Queries ──────────────────────────────────────────────────────────────────
export function getQueries()   { return spGet('queries', []); }
export function addQuery(q)    { spSet('queries', [...getQueries(), { ...q, id: `q_${Date.now()}`, createdAt: new Date().toISOString(), status: 'open', reply: '' }]); }
export function updateQuery(id, patch) { spSet('queries', getQueries().map(q => q.id === id ? { ...q, ...patch } : q)); }

// ─── Reviews ──────────────────────────────────────────────────────────────────
export function getMyReview()   { return spGet('myReview', null); }
export function saveMyReview(r) { spSet('myReview', { ...r, submittedAt: new Date().toISOString() }); }

// ─── Notes ────────────────────────────────────────────────────────────────────
export function getNotes()        { return spGet('notes', {}); }
export function saveNote(id, txt) { const n = getNotes(); n[id] = txt; spSet('notes', n); }

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export function getBookmarks()      { return spGet('bookmarks', []); }
export function toggleBookmark(id)  {
  const b = getBookmarks();
  spSet('bookmarks', b.includes(id) ? b.filter(x => x !== id) : [...b, id]);
}
