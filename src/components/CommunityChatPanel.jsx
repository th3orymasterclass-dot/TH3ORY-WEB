import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Crown, GraduationCap, Hash, Users, Sparkles, RefreshCw, Smile, Heart, ThumbsUp, Search, ShieldCheck, Radio } from 'lucide-react';
import { fetchCommunityMessagesFromSupabase, saveCommunityMessageToSupabase, subscribeToCommunityMessages } from '../services/supabaseService';

const CHANNELS = [
  { id: 'general-lounge', name: 'general-lounge', desc: 'High-Achievers Mastermind Lounge & Casual Chat', icon: '💬' },
  { id: 'level-1-presence', name: 'level-1-presence', desc: 'Tonality, Vocal Pauses & Room Presence Exercises', icon: '👁️' },
  { id: 'level-2-power', name: 'level-2-power', desc: 'Persuasion Laws & High-Stakes Negotiation Feedback', icon: '⚡' },
  { id: 'capstone-showcase', name: 'capstone-showcase', desc: 'Share your 5 Weekly Capstone Video Reflections', icon: '🏆' },
  { id: 'q-and-a-instructor', name: 'q-and-a-instructor', desc: 'Direct Q&A with Mentalist Sravan Production Council', icon: '👑' },
];

const INITIAL_MESSAGES = {
  'general-lounge': [
    {
      id: 'm1',
      senderName: 'Mentalist Sravan Production',
      senderRole: 'admin',
      message: 'Welcome to the TH3ORY Masterclass High-Achievers Network! Post your daily reflections, breakthroughs, and feedback here.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'm2',
      senderName: 'Marcus Vance',
      senderRole: 'student',
      message: 'Day 02 vocal tonality micro-pauses exercise completely changed how I open client pitch calls today!',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    }
  ],
  'level-1-presence': [
    {
      id: 'm3',
      senderName: 'Elena Rostova',
      senderRole: 'student',
      message: 'Recorded my Level 1 Capstone video today. Focusing on steady eye contact without blinking made a huge difference.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    }
  ]
};

export default function CommunityChatPanel({ currentUser, isAdmin = false }) {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState(INITIAL_MESSAGES[CHANNELS[0].id] || []);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Derive sender details
  const senderName = isAdmin ? 'Mentalist Sravan Production' : (currentUser?.name || 'Enrolled Student');
  const senderRole = isAdmin ? 'admin' : 'student';

  // Load messages from Supabase or Fallback
  const loadChannelMessages = async (channelId, isSilent = false) => {
    if (!isSilent) setLoading(true);
    const remote = await fetchCommunityMessagesFromSupabase(channelId);
    if (remote && remote.length > 0) {
      setMessages(prev => {
        // Merge without duplicates
        const existingIds = new Set(prev.map(m => m.id));
        const newRemote = remote.filter(m => !existingIds.has(m.id));
        if (newRemote.length === 0) return prev;
        return [...prev, ...newRemote].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    }
    if (!isSilent) setLoading(false);
  };

  // Real-time subscription & auto-polling heartbeat
  useEffect(() => {
    loadChannelMessages(activeChannel);

    // 1. Subscribe to Supabase Realtime WebSockets
    const unsubscribe = subscribeToCommunityMessages(activeChannel, (incomingMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === incomingMsg.id || (m.message === incomingMsg.message && m.senderName === incomingMsg.senderName && Math.abs(new Date(m.createdAt) - new Date(incomingMsg.createdAt)) < 5000))) {
          return prev;
        }
        return [...prev, incomingMsg];
      });
      setIsLiveConnected(true);
    });

    // 2. Real-time background polling heartbeat every 3.5s
    const pollInterval = setInterval(() => {
      loadChannelMessages(activeChannel, true);
    }, 3500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e, forceAiTrigger = false) => {
    if (e) e.preventDefault();
    const textToSend = inputMsg.trim();
    if (!textToSend && !forceAiTrigger) return;

    const userText = textToSend || (forceAiTrigger ? `@AI Provide guidance for #${activeChannel}` : '');

    const newMsg = {
      id: `msg_${Date.now()}`,
      channel: activeChannel,
      senderName,
      senderRole,
      senderEmail: currentUser?.email || '',
      message: userText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // Save to Supabase DB asynchronously
    await saveCommunityMessageToSupabase(newMsg);

    // Trigger ChatMCP AI Assistant if requested or in Q&A channel or starting with @AI
    const shouldTriggerAi = forceAiTrigger || userText.toLowerCase().includes('@ai') || userText.toLowerCase().includes('@chatmcp') || activeChannel === 'q-and-a-instructor';

    if (shouldTriggerAi) {
      try {
        const response = await fetch('/api/chat-mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: activeChannel,
            userMessage: userText,
            senderName
          })
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            setMessages(prev => {
              if (prev.some(m => m.id === resData.data.id)) return prev;
              return [...prev, resData.data];
            });
          }
        }
      } catch (err) {
        console.warn('[ChatMCP] Could not reach AI serverless endpoint:', err);
      }
    }
  };

  const filteredMessages = messages.filter(m => 
    m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-brand">TH3ORY Community Chat</h2>
              {isAdmin ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
                  <Crown className="w-3 h-3 text-amber-400" /> Instructor Mode
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30 flex items-center gap-1 uppercase tracking-wider">
                  <GraduationCap className="w-3 h-3 text-sky-400" /> Student Network
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Real-time interaction between students, Mentalist Sravan & ChatMCP AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleSendMessage(null, true)}
            className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/10"
            title="Ask ChatMCP AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Ask ChatMCP
          </button>

          <button
            onClick={() => loadChannelMessages(activeChannel)}
            className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
            title="Refresh Messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Chat Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Channels Navigation List */}
        <div className="lg:col-span-4 glass-card p-4 rounded-3xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2">Channels</h3>
          <div className="space-y-1">
            {CHANNELS.map(ch => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <span className="text-base">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="text-xs font-bold font-mono tracking-tight truncate">{ch.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{ch.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="lg:col-span-8 glass-panel rounded-3xl border border-slate-800 flex flex-col h-[580px] overflow-hidden">
          
          {/* Active Channel Topbar */}
          <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold font-mono text-white">
                {CHANNELS.find(c => c.id === activeChannel)?.name}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">— {CHANNELS.find(c => c.id === activeChannel)?.desc}</span>
            </div>
            <div className="text-[11px] font-bold flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE Realtime • ChatMCP</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto" />
                <p className="text-slate-400 text-xs">No messages yet in #{activeChannel}. Be the first to start the discussion!</p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const isAdminRole = msg.senderRole === 'admin';
                const isAiRole    = msg.senderRole === 'ai_bot' || msg.senderName.includes('ChatMCP');
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start gap-3 animate-fade-in ${
                      isAiRole
                        ? 'bg-purple-950/30 border border-purple-500/40 p-4 rounded-2xl shadow-lg shadow-purple-500/5'
                        : isAdminRole
                          ? 'bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl'
                          : 'bg-slate-900/60 border border-slate-800 p-4 rounded-2xl'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isAiRole
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                        : isAdminRole
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {isAiRole ? <Sparkles className="w-5 h-5 fill-purple-300" /> : isAdminRole ? <Crown className="w-5 h-5 fill-slate-950" /> : msg.senderName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{msg.senderName}</span>
                        
                        {isAiRole ? (
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 font-extrabold rounded border border-purple-500/40 uppercase tracking-wider flex items-center gap-1">
                            🤖 ChatMCP AI Assistant
                          </span>
                        ) : isAdminRole ? (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-extrabold rounded border border-amber-500/40 uppercase tracking-wider">
                            👑 Admin / Instructor
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 font-bold rounded border border-slate-700 uppercase tracking-wider">
                            🎓 Student
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 ml-auto">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <input
              type="text"
              placeholder={`Message #${activeChannel} (type @AI to ask ChatMCP)...`}
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
