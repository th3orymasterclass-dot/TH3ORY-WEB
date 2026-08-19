import React, { useState, useEffect } from 'react';
import {
  Radio, Copy, Eye, EyeOff, Video, CheckCircle2, ShieldCheck,
  Play, Square, Calendar, Clock, Send, Trash2, HelpCircle, RefreshCw,
  Zap, Server, AlertTriangle, Check, Globe, Wifi, Lock, Camera, ExternalLink, Link as LinkIcon
} from 'lucide-react';
import { saveQueryToSupabase, fetchQueriesFromSupabase, saveLiveBroadcastStateToSupabase } from '../../services/supabaseService';
import WebcamBroadcaster from '../../student/components/WebcamBroadcaster';

export default function LiveBroadcastPanel() {
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Broadcast Protocol Engine ('webcam' | 'zoom' | 'youtube' | 'twitch' | 'obs_rtmp')
  const [broadcastSource, setBroadcastSource] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_source') || 'webcam';
    }
    return 'webcam';
  });

  // Zoom / Google Meet Link
  const [zoomUrl, setZoomUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_zoom_url') || '';
    }
    return '';
  });

  // YouTube / Twitch Fallback Ids
  const [youtubeId, setYoutubeId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_youtube_id') || '';
    }
    return '';
  });

  const [twitchChannel, setTwitchChannel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_twitch_channel') || '';
    }
    return '';
  });

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

  const syncLiveState = (overrides = {}) => {
    const state = {
      isOnAir: overrides.isOnAir !== undefined ? overrides.isOnAir : isOnAir,
      source: overrides.source || broadcastSource,
      zoomUrl: overrides.zoomUrl !== undefined ? overrides.zoomUrl : zoomUrl,
      youtubeId: overrides.youtubeId !== undefined ? overrides.youtubeId : youtubeId,
      info: overrides.info || broadcastInfo
    };
    saveLiveBroadcastStateToSupabase(state);
  };

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
    syncLiveState({ isOnAir: status });
  };

  const handleSourceChange = (newSource) => {
    setBroadcastSource(newSource);
    syncLiveState({ source: newSource });
  };

  const handleZoomUrlChange = (val) => {
    setZoomUrl(val);
    syncLiveState({ zoomUrl: val });
  };

  const handleYoutubeIdChange = (ytVal) => {
    setYoutubeId(ytVal);
    syncLiveState({ youtubeId: ytVal });
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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
            isOnAir 
              ? 'bg-red-600/20 border-red-500/50 text-red-400 animate-pulse'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Live Stream & Masterclass Studio</h1>
              {isOnAir ? (
                <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-widest animate-pulse shadow-md">
                  🔴 ON AIR NOW
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-slate-700">
                  OFFLINE
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Browser WebCam Studio & Zoom Video Call Live Broadcasting System for TH3ORY Masterclass.
            </p>
          </div>
        </div>

        {/* Master Control Switcher */}
        <div className="flex items-center gap-3">
          {isOnAir ? (
            <button
              onClick={() => handleToggleOnAir(false)}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" /> END BROADCAST
            </button>
          ) : (
            <button
              onClick={() => handleToggleOnAir(true)}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" /> GO LIVE NOW
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Mode Selector Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
            <Wifi className="w-4 h-4" /> Select Broadcast Method
          </h3>
          <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded">
            ACTIVE MODE: {broadcastSource.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Mode 1: Direct WebCam (Default) */}
          <button
            type="button"
            onClick={() => handleSourceChange('webcam')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              broadcastSource === 'webcam'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs uppercase">
              <Camera className="w-4 h-4 text-amber-400" /> Direct Browser Camera
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Zero Server / No OBS Needed</div>
          </button>

          {/* Mode 2: Zoom / Google Meet Link */}
          <button
            type="button"
            onClick={() => handleSourceChange('zoom')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              broadcastSource === 'zoom'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs uppercase">
              <Video className="w-4 h-4 text-blue-400" /> Zoom / Meet Call
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Interactive Video Meeting</div>
          </button>

          {/* Mode 3: YouTube Live */}
          <button
            type="button"
            onClick={() => handleSourceChange('youtube')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              broadcastSource === 'youtube'
                ? 'bg-red-600/20 border-red-500 text-red-300 font-bold shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs uppercase">
              <Radio className="w-4 h-4 text-red-400" /> YouTube Live
            </div>
            <div className="text-[10px] text-slate-400 mt-1">YouTube Live Stream Embed</div>
          </button>

          {/* Mode 4: OBS RTMP */}
          <button
            type="button"
            onClick={() => handleSourceChange('obs_rtmp')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              broadcastSource === 'obs_rtmp'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-xs uppercase">
              <Server className="w-4 h-4 text-purple-400" /> OBS Studio RTMP
            </div>
            <div className="text-[10px] text-slate-400 mt-1">External OBS Server</div>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mode 1: Direct Browser WebCam Studio */}
          {broadcastSource === 'webcam' && (
            <WebcamBroadcaster isOnAir={isOnAir} onToggleOnAir={handleToggleOnAir} />
          )}

          {/* Mode 2: Zoom / Google Meet Call */}
          {broadcastSource === 'zoom' && (
            <div className="bg-slate-900/90 border border-blue-500/40 p-6 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Video className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Zoom / Google Meet Live Call Link</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Students can join your live Zoom or Google Meet call directly from their dashboard.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Paste Zoom Meeting or Google Meet URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://us02web.zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                      value={zoomUrl}
                      onChange={(e) => handleZoomUrlChange(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                    {zoomUrl && (
                      <a
                        href={zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Open
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                  <span className="font-extrabold text-blue-400 uppercase tracking-wider">💡 How it works:</span>
                  <p className="text-slate-400 text-[11px]">When you click <b>GO LIVE NOW</b> above, all enrolled students will see a prominent <b>JOIN LIVE ZOOM MASTERCLASS</b> button right on their dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: YouTube Live */}
          {broadcastSource === 'youtube' && (
            <div className="bg-slate-900/90 border border-red-500/40 p-6 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Radio className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">YouTube Live Stream ID</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Embed your YouTube Live stream directly inside student dashboards.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  Enter YouTube Live Video ID or URL:
                </label>
                <input
                  type="text"
                  placeholder="e.g. dQw4w9WgXcQ"
                  value={youtubeId}
                  onChange={(e) => handleYoutubeIdChange(e.target.value.replace(/.*v=/, '').replace(/.*live\//, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Broadcast Announcement Editor */}
          <form onSubmit={handleSaveInfo} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule & Session Announcement Details
              </h3>
              {savedSuccess && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Synced to Student Dashboards!
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={broadcastInfo.title}
                  onChange={(e) => setBroadcastInfo({ ...broadcastInfo, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g. Masterclass Live Session #4 - Behavioral Profiling"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={broadcastInfo.scheduledDate}
                    onChange={(e) => setBroadcastInfo({ ...broadcastInfo, scheduledDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Scheduled Time (IST)
                  </label>
                  <input
                    type="time"
                    value={broadcastInfo.scheduledTime}
                    onChange={(e) => setBroadcastInfo({ ...broadcastInfo, scheduledTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Session Agenda / Overview
                </label>
                <textarea
                  rows={3}
                  value={broadcastInfo.description}
                  onChange={(e) => setBroadcastInfo({ ...broadcastInfo, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  placeholder="Briefly explain what will be taught in this live session..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Update Broadcast Announcement
              </button>
            </div>
          </form>

        </div>

        {/* Right Col: Real-time Live Q&A Manager */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col h-full min-h-[500px]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Live Q&A Room Questions ({queries.length})
              </h3>
              <button
                onClick={loadQueries}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh Live Questions"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[600px]">
              {queries.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-700 opacity-50" />
                  <p>No live questions submitted yet.</p>
                  <p className="text-[10px] text-slate-600">Student questions submitted in the Live Room will appear here in real-time.</p>
                </div>
              ) : (
                queries.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">{q.student_name || 'Student'}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{q.created_at ? new Date(q.created_at).toLocaleTimeString() : 'Just now'}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.question}</p>

                    {q.response ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1">
                        <span className="font-extrabold text-amber-400 text-[10px] uppercase tracking-wider">Your Answer:</span>
                        <p className="text-slate-300 text-xs">{q.response}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <textarea
                          rows={2}
                          placeholder="Type answer to broadcast to student..."
                          value={replyText[q.id || q.created_at] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [q.id || q.created_at]: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/40"
                        />
                        <button
                          onClick={() => handleSendReply(q)}
                          disabled={sendingId === (q.id || q.created_at)}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Answer Question
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
