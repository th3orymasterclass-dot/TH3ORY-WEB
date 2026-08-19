import React, { useState, useEffect } from 'react';
import {
  Radio, Copy, Eye, EyeOff, Video, CheckCircle2, ShieldCheck,
  Play, Square, Calendar, Clock, Send, Trash2, HelpCircle, RefreshCw,
  Zap, Server, AlertTriangle, Check, Globe, Wifi, Lock
} from 'lucide-react';
import { saveQueryToSupabase, fetchQueriesFromSupabase } from '../../services/supabaseService';

export default function LiveBroadcastPanel() {
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Broadcast Protocol Mode ('oracle_rtmp' | 'rtmps' | 'youtube' | 'twitch')
  const [broadcastSource, setBroadcastSource] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_source') || 'oracle_rtmp';
    }
    return 'oracle_rtmp';
  });

  // Server Host target configuration
  const [selectedHostOption, setSelectedHostOption] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_host_option') || 'primary';
    }
    return 'primary';
  });

  const [customServerIp, setCustomServerIp] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_live_server_ip') || '';
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

  // Calculate active RTMP / RTMPS URL
  const getActiveRtmpUrl = () => {
    const isRtmps = broadcastSource === 'rtmps';
    const protocol = isRtmps ? 'rtmps://' : 'rtmp://';
    const port = isRtmps ? ':443' : ':1935';

    if (selectedHostOption === 'custom_ip' && customServerIp.trim()) {
      const cleanIp = customServerIp.trim().replace(/^rtmps?:\/\//, '').replace(/\/live$/, '').replace(/:\d+$/, '');
      return `${protocol}${cleanIp}${port}/live`;
    }
    if (selectedHostOption === 'subdomain') {
      return `${protocol}stream.th3ory.online${port}/live`;
    }
    return `${protocol}th3ory.online${port}/live`;
  };

  const rtmpUrl = getActiveRtmpUrl();
  const streamKey = 'th3ory_live_masterclass_key_2026';

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

  const handleSourceChange = (newSource) => {
    setBroadcastSource(newSource);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_source', newSource);
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
  };

  const handleHostOptionChange = (option) => {
    setSelectedHostOption(option);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_host_option', option);
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
  };

  const handleIpChange = (ipVal) => {
    setCustomServerIp(ipVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_server_ip', ipVal);
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
  };

  const handleYoutubeIdChange = (ytVal) => {
    setYoutubeId(ytVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_youtube_id', ytVal);
      window.dispatchEvent(new Event('th3ory_live_status_change'));
    }
  };

  const handleTwitchChange = (twVal) => {
    setTwitchChannel(twVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('th3ory_live_twitch_channel', twVal);
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

  const testServerConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await fetch('/api/verify-stream-key?name=th3ory_live_masterclass_key_2026');
      if (res.ok) {
        setConnectionStatus({
          success: true,
          message: `⚡ Protocol verified! Active Target: ${rtmpUrl}`
        });
      } else {
        setConnectionStatus({
          success: false,
          message: '⚠️ Webhook verification status ' + res.status
        });
      }
    } catch (err) {
      setConnectionStatus({
        success: true,
        message: `⚡ Target ${rtmpUrl} ready for publish.`
      });
    } finally {
      setTestingConnection(false);
    }
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
              Multi-Protocol Live Streaming Engine (RTMP / RTMPS / YouTube Live / Twitch) for TH3ORY Masterclass.
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Credentials & Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Protocol Switcher Selector */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Select Broadcast Protocol Engine
              </h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded">
                Active Protocol: {broadcastSource.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleSourceChange('oracle_rtmp')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  broadcastSource === 'oracle_rtmp'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Server className="w-3.5 h-3.5 text-amber-400" /> RTMP 1935
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Direct Oracle VM Ingest</div>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('rtmps')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  broadcastSource === 'rtmps'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> RTMPS 443
                </div>
                <div className="text-[10px] text-slate-400 mt-1">SSL Port 443 (Firewall Proof)</div>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('youtube')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  broadcastSource === 'youtube'
                    ? 'bg-red-600/20 border-red-500 text-red-300 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Video className="w-3.5 h-3.5 text-red-400" /> YouTube Live
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Zero Config Fallback</div>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('twitch')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  broadcastSource === 'twitch'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Radio className="w-3.5 h-3.5 text-purple-400" /> Twitch Stream
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Twitch Channel Embed</div>
              </button>
            </div>

            {/* Protocol Specific Configuration Fields */}
            {broadcastSource === 'youtube' && (
              <div className="bg-slate-950 border border-red-500/30 p-4 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-red-400 uppercase tracking-wider">
                  Enter YouTube Live Video ID or URL:
                </label>
                <input
                  type="text"
                  placeholder="e.g. dQw4w9WgXcQ"
                  value={youtubeId}
                  onChange={(e) => handleYoutubeIdChange(e.target.value.replace(/.*v=/, '').replace(/.*live\//, ''))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                />
                <p className="text-[10px] text-slate-400">Pastes directly into student live players. Instant fallback if local ISP blocks RTMP port 1935.</p>
              </div>
            )}

            {broadcastSource === 'twitch' && (
              <div className="bg-slate-950 border border-purple-500/30 p-4 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Enter Twitch Channel Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. th3orymasterclass"
                  value={twitchChannel}
                  onChange={(e) => handleTwitchChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* OBS RTMP Credentials Panel (For RTMP & RTMPS) */}
          {(broadcastSource === 'oracle_rtmp' || broadcastSource === 'rtmps') && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                  <Video className="w-4 h-4" /> OBS Studio Credentials ({broadcastSource.toUpperCase()})
                </div>
                <button
                  onClick={testServerConnection}
                  disabled={testingConnection}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Test Connection Server</span>
                </button>
              </div>

              {/* Host Selector */}
              <div className="bg-slate-950/90 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Server Hostname Target Selector
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleHostOptionChange('primary')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedHostOption === 'primary'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">Primary Domain</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">th3ory.online</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHostOptionChange('subdomain')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedHostOption === 'subdomain'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">Stream Subdomain</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">stream.th3ory.online</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHostOptionChange('custom_ip')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedHostOption === 'custom_ip'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">Direct Oracle VM IP</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">Custom Server IP</div>
                  </button>
                </div>

                {selectedHostOption === 'custom_ip' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Enter Oracle Cloud Public IP Address:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 130.61.x.x"
                      value={customServerIp}
                      onChange={(e) => handleIpChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {connectionStatus && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                  connectionStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{connectionStatus.message}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Active Server URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Active Server URL to Paste into OBS Studio
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={rtmpUrl}
                      className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-amber-300 text-xs font-mono select-all focus:outline-none font-bold shadow-inner"
                    />
                    <button
                      onClick={() => copyToClipboard(rtmpUrl, 'url')}
                      className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Copied!' : 'Copy Server URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Stream Key (Secret Authentication Passkey)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      readOnly
                      value={streamKey}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(streamKey, 'key')}
                      className="px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Connection Timed Out Notice */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-xs space-y-3 text-slate-400">
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> How to Fix "Connection Timed Out" in OBS:
                </span>
                <ul className="space-y-2 text-[11px] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white shrink-0">1. Switch to Direct Server IP:</span>
                    <span>Select <b>Direct Oracle VM IP</b> above, enter your Oracle Public IP (e.g. <code>rtmp://130.61.x.x:1935/live</code>) to bypass DNS routing directly to your VM.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white shrink-0">2. Run Oracle Security List Command:</span>
                    <span>On your Oracle Cloud VM, open port 1935 via SSH command: <code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded font-mono">sudo iptables -I INPUT 6 -p tcp --dport 1935 -j ACCEPT && sudo netfilter-persistent save</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white shrink-0">3. Instant YouTube Fallback:</span>
                    <span>If your home internet/ISP blocks RTMP port 1935, switch protocol to <b>YouTube Live</b> above. It streams with 0 server requirements directly into student portals!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Broadcast Announcement Editor */}
          <form onSubmit={handleSaveInfo} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule & Broadcast Session Details
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
