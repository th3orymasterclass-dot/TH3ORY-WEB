import React, { useState, useEffect } from 'react';
import { Radio, Send, MessageSquare, ShieldCheck, Sparkles, AlertCircle, Video, Users, CheckCircle2 } from 'lucide-react';
import HlsLivePlayer from '../components/HlsLivePlayer';
import { saveQueryToSupabase, fetchQueriesFromSupabase } from '../../services/supabaseService';

export default function LiveSessionPanel({ profile, themeMode }) {
  const isLight = themeMode === 'light';

  // Live Stream HLS URL (Oracle Cloud NGINX Engine)
  const defaultLiveStreamUrl = 'https://stream.th3ory.online/live/live.m3u8';

  // Q&A Chat State
  const [liveQuestions, setLiveQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Load questions
  useEffect(() => {
    fetchQueriesFromSupabase(profile?.email).then(data => {
      if (Array.isArray(data)) {
        setLiveQuestions(data.filter(q => q.is_live_qa || q.category === 'live_session'));
      }
    });
  }, [profile?.email]);

  const handleSendLiveQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    const questionPayload = {
      email: profile?.email || 'student@th3ory.online',
      name: profile?.name || 'TH3ORY Student',
      question: `[LIVE Q&A] ${newQuestion.trim()}`,
      category: 'live_session',
      is_live_qa: true,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await saveQueryToSupabase(questionPayload);
    setLiveQuestions(prev => [questionPayload, ...prev]);
    setNewQuestion('');
    setIsSubmitting(false);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-md' : 'bg-[#1A1D21] border-[#555A66]/30 text-[#FAFAF7]'
      }`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest border border-red-500/30">
            <Radio className="w-3.5 h-3.5 animate-spin" /> TH3ORY Live Broadcast Facility
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading">LIVE MASTERCLASS SESSIONS</h2>
          <p className={`text-xs sm:text-sm max-w-xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Join Mentalist Sravan Sudhakaran live for cognitive experiments, real-time Q&amp;A breakdowns, and interactive non-verbal influence sessions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <Users className="w-4 h-4 text-amber-500" />
            <span>Interactive Live Portal</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Stream + Live Q&A Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: HLS Live Video Player (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <HlsLivePlayer streamUrl={defaultLiveStreamUrl} profile={profile} isLight={isLight} />

          {/* Live Session Notice */}
          <div className={`p-5 rounded-2xl border flex items-center gap-3.5 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
            <p className="text-xs font-medium leading-relaxed">
              <strong className="font-bold">Live Stream Protocol:</strong> Streams auto-adapt quality (1080p/720p/480p) based on your network connection. Pre-recorded course modules remain accessible 24/7 under <strong>My Course</strong>.
            </p>
          </div>
        </div>

        {/* Right: Live Q&A Question Drawer (4 Cols) */}
        <div className={`lg:col-span-4 rounded-3xl p-6 border space-y-5 flex flex-col h-[520px] ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-md' : 'bg-[#1A1D21] border-[#555A66]/30 text-white'
        }`}>
          
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Live Q&amp;A Drawer</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              Direct to Instructor
            </span>
          </div>

          {submittedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Question submitted live! Sravan will respond shortly.</span>
            </div>
          )}

          {/* Question Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {liveQuestions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
                <p className="text-slate-400 text-xs font-bold">No Live Questions Yet</p>
                <p className="text-slate-500 text-[11px]">Be the first student to ask Mentalist Sravan a live question!</p>
              </div>
            ) : (
              liveQuestions.map((q, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-[11px] truncate">{q.name || q.email}</span>
                    <span className="text-[10px] text-slate-500">{new Date(q.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{q.question?.replace('[LIVE Q&A] ', '')}</p>
                  {q.response && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                      <strong>Instructor Answer:</strong> {q.response}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Question Input Form */}
          <form onSubmit={handleSendLiveQuestion} className="space-y-2 pt-2 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ask Mentalist Sravan a question..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className={`w-full pl-4 pr-10 py-3 rounded-2xl text-xs focus:outline-none focus:border-amber-500 ${
                  isLight ? 'bg-slate-100 border border-slate-300 text-slate-900' : 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500'
                }`}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
