import React, { useState, useEffect } from 'react';
import {
  Radio, Copy, Eye, EyeOff, Video, CheckCircle2, ShieldCheck,
  Play, Square, Calendar, Clock, Send, Trash2, HelpCircle, RefreshCw
} from 'lucide-react';
import { saveQueryToSupabase, fetchQueriesFromSupabase } from '../../services/supabaseService';

export default function LiveBroadcastPanel() {
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Broadcast State
  const [isOnAir, setIsOnAir] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_on_air') === 'true';
    }
    return false;
  });

  const [broadcastInfo, setBroadcastInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('th3ory_live_info');
      if (saved) return JSON.parse(saved);
    }
    return {
      title: 'Mentalism & Behavioral Influence Live Experiment',
      scheduledDate: '2026-08-25',
      scheduledTime: '20:00',
      description: 'Live interactive breakdown of non-verbal cues and real-time student Q&A.'
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Q&A State
  const [queries, setQueries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const rtmpUrl = 'rtmp://stream.th3ory.online/live';
  const streamKey = 'th3ory_live_masterclass_key_2026';

  const loadQueries = () => {
    fetchQueriesFromSupabase().then(data => {
      if (Array.isArray(data)) {
        setQueries(data.filter(q => q.is_live_qa || q.category === 'live_session'));
      }
    });
  };

  useEffect(() => {
    loadQueries();
    const interval = setInterval(loadQueries, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnAir = (status) => {
    setIsOnAir(status);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_on_air', status.toString());
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_info', JSON.stringify(broadcastInfo));
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSendReply = async (queryObj) => {
    const text = replyText[queryObj.id || queryObj.created_at];
    if (!text?.trim()) return;

    setSendingId(queryObj.id || queryObj.created_at);
    const updatedPayload = {
      ...queryObj,
      response: text.trim(),
      status: 'answered'
    };

    await saveQueryToSupabase(updatedPayload);
    setReplyText(prev => ({ ...prev, [queryObj.id || queryObj.created_at]: '' }));
    setSendingId(null);
    loadQueries();
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 text-amber-400" /> Self-Hosted Live Broadcast Facility
          </div>
          <h2 className="text-2xl font-black text-white">Live Stream &amp; OBS Broadcast Control</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Manage RTMP ingest credentials, toggle broadcast status, and answer student Q&amp;A live.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleToggleOnAir(!isOnAir)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg cursor-pointer ${
              isOnAir
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isOnAir ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isOnAir ? 'END LIVE BROADCAST' : 'GO LIVE NOW'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Credentials + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: RTMP Credentials & OBS Guide (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* OBS RTMP Credentials Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">OBS Studio Stream Credentials</h3>
                <p className="text-slate-400 text-xs">Self-hosted Oracle Cloud NGINX RTMP Server</p>
              </div>
            </div>

            {/* Server URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                RTMP Server Ingest URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={rtmpUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(rtmpUrl, 'url')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Secret Stream Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Private Secret Stream Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={streamKey}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(streamKey, 'key')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick OBS Guide */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">OBS Studio Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open <strong>OBS Studio</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Stream</strong>.</li>
                <li>Set Service to <strong>Custom...</strong></li>
                <li>Paste Server: <code className="text-amber-400 font-mono">{rtmpUrl}</code></li>
                <li>Paste Stream Key: <code className="text-emerald-400 font-mono">{showKey ? streamKey : '••••••••••••'}</code></li>
                <li>Click <strong>Start Streaming</strong> in OBS!</li>
              </ol>
            </div>

          </div>

        </div>

        {/* Right Column: Announcement Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSaveInfo} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">Live Broadcast Announcement</h3>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Live broadcast announcement updated!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Session Title</label>
              <input
                type="text"
                required
                value={broadcastInfo.title}
                onChange={e => setBroadcastInfo({ ...broadcastInfo, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={broadcastInfo.scheduledDate}
                  onChange={e => setBroadcastInfo({ ...broadcastInfo, scheduledDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={broadcastInfo.scheduledTime}
                  onChange={e => setBroadcastInfo({ ...broadcastInfo, scheduledTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Session Agenda / Description</label>
              <textarea
                rows={3}
                value={broadcastInfo.description}
                onChange={e => setBroadcastInfo({ ...broadcastInfo, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Update Live Broadcast Info
            </button>

          </form>
        </div>

      </div>

      {/* Live Student Q&A Answer Manager */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Live Session Student Q&amp;A Manager</h3>
              <p className="text-slate-400 text-xs">Real-time incoming questions submitted by students during live sessions</p>
            </div>
          </div>
          <button
            onClick={loadQueries}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="space-y-4">
          {queries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No live session questions submitted yet. Questions asked by students in the Live Session tab will appear here in real-time.
            </div>
          ) : (
            queries.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">{q.name || q.email}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'answered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {q.status === 'answered' ? 'ANSWERED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-white">{q.question}</p>
                {q.response && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <strong>Your Response:</strong> {q.response}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Type your live response..."
                    value={replyText[q.id || q.created_at] || ''}
                    onChange={e => setReplyText({ ...replyText, [q.id || q.created_at]: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleSendReply(q)}
                    disabled={sendingId === (q.id || q.created_at)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
