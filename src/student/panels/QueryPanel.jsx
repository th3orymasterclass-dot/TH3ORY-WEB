import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock, CheckCircle2, AlertCircle, Plus, X, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { getQueries, addQuery, updateQuery } from '../studentData';
import { getCourseDetails } from '../../data/adminData';
import { saveQueryToSupabase } from '../../services/supabaseService';

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

function QueryCard({ query, profile }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_CONFIG[query.status] || STATUS_CONFIG.open;
  const date = new Date(query.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className={`bg-slate-900 border ${query.reply ? 'border-green-500/20' : 'border-slate-800'} rounded-2xl overflow-hidden transition-all`}>
      <button className="w-full flex items-start gap-4 p-5 text-left" onClick={() => setOpen(v => !v)}>
        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} mt-1.5 shrink-0`}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-white font-bold text-sm">{query.subject}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sc.bg} ${sc.border} ${sc.color}`}>{sc.label}</span>
            {query.reply && !open && <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">💬 Reply received</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-500 text-xs">{query.type}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">{date}</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 mt-1 shrink-0"/> : <ChevronDown className="w-4 h-4 text-slate-500 mt-1 shrink-0"/>}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Thread */}
          <div className="space-y-3">
            {/* Student message */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-xs font-black text-amber-400">
                {profile.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-xs font-bold">{profile.name}</p>
                  <p className="text-slate-600 text-xs">{date}</p>
                </div>
                <div className="bg-slate-950 rounded-xl px-4 py-3 text-slate-300 text-sm leading-relaxed">{query.message}</div>
              </div>
            </div>

            {/* Instructor reply */}
            {query.reply ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 text-xs font-black text-slate-950">T</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-amber-400 text-xs font-bold">TH3ORY Instructor</p>
                    <p className="text-slate-600 text-xs">{new Date(query.repliedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-slate-200 text-sm leading-relaxed">{query.reply}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-3 px-4 bg-slate-950/60 rounded-xl">
                <Clock className="w-4 h-4 text-slate-500"/>
                <p className="text-slate-500 text-sm">Awaiting instructor response. Typical reply time: 24–48 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueryPanel({ profile }) {
  const [queries, setQueries]   = useState(getQueries());
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab]           = useState('all');
  const [form, setForm]         = useState({ subject: '', type: 'General Question', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const formRef = useRef();

  useEffect(() => {
    const h = () => setQueries(getQueries());
    window.addEventListener('th3ory_student_change', h);
    return () => window.removeEventListener('th3ory_student_change', h);
  }, []);

  const up = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setLoading(true);

    const queryPayload = { ...form, studentName: profile.name, studentEmail: profile.email, studentPlan: profile.plan };
    addQuery(queryPayload);
    await saveQueryToSupabase(queryPayload);

    setQueries(getQueries());
    setForm({ subject: '', type: 'General Question', message: '' });
    setLoading(false);
    setSuccess(true);
    setShowForm(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  const details = getCourseDetails();

  const filtered = queries.filter(q =>
    tab === 'all' ? true :
    tab === 'open' ? (q.status === 'open' || q.status === 'inprogress') :
    tab === 'answered' ? q.status === 'answered' : true
  );

  const openCount     = queries.filter(q => q.status === 'open' || q.status === 'inprogress').length;
  const answeredCount = queries.filter(q => q.status === 'answered').length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Query Sessions</h2>
          <p className="text-slate-500 text-sm mt-1">Ask questions and get responses from the TH3ORY instructor team</p>
        </div>
        <button onClick={() => { setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth' }), 100); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shrink-0">
          <Plus className="w-4 h-4"/> New Query
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 bg-green-950/40 border border-green-500/30 rounded-xl px-5 py-3 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0"/>
          Query submitted successfully! You'll receive a response within 24–48 hours.
        </div>
      )}

      {/* Info card */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Queries', value: queries.length, color: 'text-white' },
          { label: 'Awaiting Reply', value: openCount, color: 'text-amber-400' },
          { label: 'Answered', value: answeredCount, color: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SLA note */}
      <div className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3.5">
        <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0"/>
        <div className="text-sm text-slate-400">
          <strong className="text-white">Response time:</strong> We aim to reply within <strong>24–48 hours</strong> on weekdays.
          For urgent issues, {profile.plan?.includes('VIP') ? 'use your WhatsApp direct line.' : 'please upgrade to VIP Mentorship for priority WhatsApp access.'}
        </div>
      </div>

      {/* Tab filter */}
      {queries.length > 0 && (
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          {[{ id:'all', label:`All (${queries.length})` }, { id:'open', label:`Open (${openCount})` }, { id:'answered', label:`Answered (${answeredCount})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Query list */}
      {queries.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
          <MessageCircle className="w-14 h-14 text-slate-700 mx-auto mb-4"/>
          <p className="text-white font-bold text-lg mb-1">No queries yet</p>
          <p className="text-slate-500 text-sm mb-6">Have a question? Submit it and our team will respond within 48 hours.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Plus className="w-4 h-4"/> Submit First Query
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => <QueryCard key={q.id} query={q} profile={profile}/>)}
          {filtered.length === 0 && <p className="text-center text-slate-500 py-8">No queries in this category.</p>}
        </div>
      )}

      {/* New query form */}
      {showForm && (
        <div ref={formRef} className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">New Query</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject *</label>
                <input required value={form.subject} onChange={e => up('subject', e.target.value)}
                  placeholder="Brief description of your query"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Query Type</label>
                <select value={form.type} onChange={e => up('type', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60">
                  {QUERY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Message *</label>
              <textarea required rows={5} value={form.message} onChange={e => up('message', e.target.value)}
                placeholder="Describe your question in detail. Include the lesson name or day number if relevant."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/60 resize-none placeholder-slate-600"/>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading || !form.subject || !form.message}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
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
