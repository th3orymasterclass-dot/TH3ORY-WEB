import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock, CheckCircle2, AlertCircle, Plus, X, ChevronDown, ChevronUp, Paperclip, Trash2 } from 'lucide-react';
import { getQueries, addQuery, updateQuery, spSet, removeQuery } from '../studentData';
import { getCourseDetails } from '../../data/adminData';
import { saveQueryToSupabase, fetchQueriesFromSupabase, subscribeToQueries } from '../../services/supabaseService';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

const QUERY_TYPES = [
  'General Question',
  'Technical Issue',
  'Content / Lesson Query',
  'Scheduling / Cohort',
  'Payment / Billing',
  'Capstone Feedback',
  'Other',
];

const STATUS_CONFIG = {
  open:        { label: 'Open', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  inprogress:  { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  answered:    { label: 'Answered', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  closed:      { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', dot: 'bg-slate-500' },
};

function QueryCard({ query, profile, isLight, onDelete }) {
  const [open, setOpen] = useState(!!query.reply);
  const [confirmDel, setConfirmDel] = useState(false);
  const sc = STATUS_CONFIG[query.status] || STATUS_CONFIG.open;
  const date = new Date(query.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  const canDelete = true; // Students can delete any of their queries

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      isLight
        ? query.reply ? 'bg-white border-green-500/40 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
        : query.reply ? 'bg-slate-900 border-green-500/20' : 'bg-slate-900 border-slate-800'
    }`}>
      <button className="w-full flex items-start gap-4 p-5 text-left" onClick={() => setOpen(v => !v)}>
        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} mt-1.5 shrink-0`}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{query.subject}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sc.bg} ${sc.border} ${sc.color}`}>{sc.label}</span>
            {query.reply && !open && <span className="text-[10px] text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">💬 Reply received</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{query.type}</span>
            <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>·</span>
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{date}</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 mt-1 shrink-0"/> : <ChevronDown className="w-4 h-4 text-slate-500 mt-1 shrink-0"/>}
      </button>

      {/* Delete Controls — outside the toggle button */}
      {canDelete && (
        <div className="px-5 pb-3 flex justify-end">
          {confirmDel ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Delete this query?</span>
              <button
                onClick={() => { setConfirmDel(false); onDelete(query.id); }}
                className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all"
              >Yes, delete</button>
              <button
                onClick={() => setConfirmDel(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isLight
                  ? 'text-red-500 hover:bg-red-50 border border-red-200'
                  : 'text-red-400 hover:bg-red-500/10 border border-red-500/20'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      )}

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Thread */}
          <div className="space-y-3">
            {/* Student message */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-xs font-black text-amber-600">
                {profile.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.name}</p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>{date}</p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  isLight ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-slate-950 text-slate-300'
                }`}>{query.message}</div>
              </div>
            </div>

            {/* Instructor reply */}
            {query.reply ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 text-xs font-black text-slate-950">T</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-amber-600 text-xs font-extrabold">TH3ORY Instructor</p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>{new Date(query.repliedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    isLight ? 'bg-amber-50 border border-amber-200 text-slate-900 font-medium' : 'bg-amber-500/10 border border-amber-500/20 text-slate-200'
                  }`}>{query.reply}</div>
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-3 py-3 px-4 rounded-xl ${
                isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950/60'
              }`}>
                <Clock className="w-4 h-4 text-slate-500"/>
                <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-500'}`}>Awaiting instructor response. Typical reply time: 24–48 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueryPanel({ profile, themeMode = 'dark' }) {
  const isLight = themeMode === 'light';
  const { isFeatureEnabled } = useFeatureFlags();
  const isCommunityEnabled = isFeatureEnabled('ENABLE_STUDENT_COMMUNITY', true);

  const [queries, setQueries]   = useState(() => getQueries(profile?.email));
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab]           = useState('all');
  const [form, setForm]         = useState({ subject: '', type: 'General Question', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const formRef = useRef();

  useEffect(() => {
    const email = profile?.email;
    const h = () => setQueries(getQueries(email));
    window.addEventListener('th3ory_student_change', h);

    const refreshQueries = () => {
      if (email) {
        fetchQueriesFromSupabase(email).then(sbQueries => {
          if (sbQueries) {
            spSet('queries', sbQueries, email);
            setQueries(sbQueries);
          }
        });
      }
    };

    window.addEventListener('focus', refreshQueries);
    document.addEventListener('visibilitychange', refreshQueries);

    refreshQueries();

    const unsub = subscribeToQueries(email, (updatedQueries) => {
      if (updatedQueries) {
        spSet('queries', updatedQueries, email);
        setQueries(updatedQueries);
      }
    });

    return () => {
      window.removeEventListener('th3ory_student_change', h);
      window.removeEventListener('focus', refreshQueries);
      document.removeEventListener('visibilitychange', refreshQueries);
      unsub();
    };
  }, [profile?.email]);

  const up = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !isCommunityEnabled) return;
    if (!form.subject.trim() || !form.message.trim()) return;
    setLoading(true);

    const queryPayload = { ...form, studentName: profile.name, studentEmail: profile.email, studentPlan: profile.plan };
    await addQuery(queryPayload, profile?.email);

    if (profile?.email) {
      const freshQueries = await fetchQueriesFromSupabase(profile.email);
      if (freshQueries) {
        spSet('queries', freshQueries, profile.email);
        setQueries(freshQueries);
      }
    } else {
      setQueries(getQueries(profile?.email));
    }

    setForm({ subject: '', type: 'General Question', message: '' });
    setLoading(false);
    setSuccess(true);
    setShowForm(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleDeleteQuery = async (id) => {
    await removeQuery(id, profile?.email);
    setQueries(getQueries(profile?.email));
  };

  // Enforce strict unique composite key rendering in UI
  const uniqueQueryMap = new Map();
  queries.forEach(q => {
    if (!q) return;
    const compKey = `${(q.studentEmail || '').trim().toLowerCase()}_${(q.subject || '').trim()}_${(q.message || '').trim()}`;
    if (!uniqueQueryMap.has(compKey)) {
      uniqueQueryMap.set(compKey, q);
    } else {
      const existing = uniqueQueryMap.get(compKey);
      if (String(q.id || '').length > 20 && String(existing.id || '').startsWith('q_')) {
        uniqueQueryMap.set(compKey, q);
      } else if (q.status && q.status !== 'open' && existing.status === 'open') {
        uniqueQueryMap.set(compKey, q);
      }
    }
  });
  const displayQueries = Array.from(uniqueQueryMap.values());

  const filtered = displayQueries.filter(q =>
    tab === 'all' ? true :
    tab === 'open' ? (q.status === 'open' || q.status === 'inprogress') :
    tab === 'answered' ? q.status === 'answered' : true
  );

  const openCount     = displayQueries.filter(q => q.status === 'open' || q.status === 'inprogress').length;
  const answeredCount = displayQueries.filter(q => q.status === 'answered').length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Disabled Banner */}
      {!isCommunityEnabled && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-600 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Student Query &amp; Support Sessions are currently disabled by system administration. Submissions are temporarily paused.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Query Sessions</h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Ask questions and get responses from the TH3ORY instructor team</p>
        </div>
        {isCommunityEnabled && (
          <button onClick={() => setShowForm(v => !v)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shrink-0">
            {showForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
            {showForm ? 'Cancel' : 'Ask Question'}
          </button>
        )}
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 text-green-600 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0"/>
          Query submitted successfully! You'll receive a response within 24–48 hours.
        </div>
      )}

      {/* Info card */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Queries', value: displayQueries.length, color: isLight ? 'text-slate-900' : 'text-white' },
          { label: 'Awaiting Reply', value: openCount, color: 'text-amber-500' },
          { label: 'Answered', value: answeredCount, color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className={`border rounded-xl p-4 text-center ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className={`text-xs mt-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SLA note */}
      <div className={`flex items-start gap-2.5 border rounded-xl px-5 py-3.5 ${
        isLight ? 'bg-white border-slate-200 shadow-sm text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0"/>
        <div className="text-sm">
          <strong className={isLight ? 'text-slate-900' : 'text-white'}>Response time:</strong> We aim to reply within <strong>24–48 hours</strong> on weekdays.
          For urgent issues, {profile.plan?.includes('VIP') ? 'use your WhatsApp direct line.' : 'please upgrade to VIP Mentorship for priority WhatsApp access.'}
        </div>
      </div>

      {/* Tab filter */}
      {displayQueries.length > 0 && (
        <div className={`flex gap-1 p-1 border rounded-xl w-full sm:w-fit overflow-x-auto ${
          isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
        }`}>
          {[{ id:'all', label:`All (${displayQueries.length})` }, { id:'open', label:`Open (${openCount})` }, { id:'answered', label:`Answered (${answeredCount})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                tab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Query list */}
      {displayQueries.length === 0 ? (
        <div className={`text-center py-16 border-2 border-dashed rounded-2xl ${
          isLight ? 'bg-white border-slate-300 shadow-sm' : 'border-slate-800'
        }`}>
          <MessageCircle className={`w-14 h-14 mx-auto mb-4 ${isLight ? 'text-slate-400' : 'text-slate-700'}`}/>
          <p className={`font-bold text-lg mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>No queries yet</p>
          <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Have a question? Submit it and our team will respond within 48 hours.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md">
            <Plus className="w-4 h-4"/> Submit First Query
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => <QueryCard key={q.id} query={q} profile={profile} isLight={isLight} onDelete={handleDeleteQuery}/>)}
          {filtered.length === 0 && <p className={`text-center py-8 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>No queries in this category.</p>}
        </div>
      )}

      {/* New query form */}
      {showForm && (
        <div ref={formRef} className={`border rounded-2xl p-6 space-y-5 ${
          isLight ? 'bg-white border-slate-300 shadow-lg' : 'bg-slate-900 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>New Query</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-500 hover:text-slate-900"/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Subject *</label>
                <input required value={form.subject} onChange={e => up('subject', e.target.value)}
                  placeholder="Brief description of your query"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                  }`}/>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Query Type</label>
                <select value={form.type} onChange={e => up('type', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}>
                  {QUERY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Your Message *</label>
              <textarea required rows={5} value={form.message} onChange={e => up('message', e.target.value)}
                placeholder="Describe your question in detail. Include the lesson name or day number if relevant."
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 resize-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                }`}/>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:text-white'
                }`}>
                Cancel
              </button>
              <button type="submit" disabled={loading || !form.subject || !form.message}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md">
                {loading
                  ? <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"/>
                  : <Send className="w-4 h-4"/>}
                {loading ? 'Submitting…' : 'Submit Query'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
