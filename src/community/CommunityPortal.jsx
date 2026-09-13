import React, { useState, useEffect } from 'react';
import {
  Video, FileText, MessageSquare, Sparkles, Pin, Download, Play, Send,
  ThumbsUp, Heart, Flame, Lightbulb, Brain, Award, Search, Filter, LogOut,
  User, CheckCircle2, Clock, Share2, CornerDownRight, ExternalLink, Shield
} from 'lucide-react';
import {
  fetchCommunityPostsFromSupabase,
  fetchCommunityReactionsFromSupabase,
  toggleCommunityReactionInSupabase,
  fetchCommunityCommentsFromSupabase,
  addCommunityCommentInSupabase,
  subscribeToCommunityFeed
} from '../services/supabaseService';
import { getEmbeddableMediaUrl } from '../utils/gdriveHelper';

const EMOJI_DEFINITIONS = [
  { emoji: '👍', label: 'Insightful', icon: ThumbsUp },
  { emoji: '❤️', label: 'Love', icon: Heart },
  { emoji: '🔥', label: 'Fire', icon: Flame },
  { emoji: '💡', label: 'Breakthrough', icon: Lightbulb },
  { emoji: '🧠', label: 'Deep Mind', icon: Brain },
  { emoji: '👏', label: 'Bravo', icon: Award },
];

export default function CommunityPortal({ member, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'weekly_video', 'file_resource', 'discussion'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New comment input per post: { [postId]: string }
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Active full video stream modal
  const [streamingVideo, setStreamingVideo] = useState(null);

  const currentMember = member || {
    id: 'guest',
    name: 'Community Member',
    email: 'member@th3ory.online'
  };

  const loadFeedData = async () => {
    try {
      const [fetchedPosts, fetchedReactions, fetchedComments] = await Promise.all([
        fetchCommunityPostsFromSupabase(),
        fetchCommunityReactionsFromSupabase(),
        fetchCommunityCommentsFromSupabase()
      ]);
      setPosts(fetchedPosts || []);
      setReactions(fetchedReactions || []);
      setComments(fetchedComments || []);
    } catch (err) {
      console.warn('[CommunityPortal] Error fetching feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedData();
    const unsubscribe = subscribeToCommunityFeed(() => {
      loadFeedData();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleToggleReaction = async (postId, emoji) => {
    const res = await toggleCommunityReactionInSupabase(postId, currentMember.id, currentMember.name, emoji);
    if (res.success) {
      // Reload reactions immediately
      const updated = await fetchCommunityReactionsFromSupabase();
      setReactions(updated || []);
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await addCommunityCommentInSupabase(postId, currentMember.id, currentMember.name, text);
      if (res.success) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        // Ensure comments drawer is open
        setExpandedComments(prev => ({ ...prev, [postId]: true }));
        const updated = await fetchCommunityCommentsFromSupabase();
        setComments(updated || []);
      }
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleCommentsDrawer = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Filter and search posts
  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'pinned' 
        ? post.is_pinned 
        : post.post_type === activeTab;
    const matchesSearch = !searchQuery.trim() 
      || (post.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      || (post.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="#/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#070a11] rounded-[6px] flex items-center justify-center">
                <span className="text-amber-400 font-black text-xs tracking-wider font-brand">T3</span>
              </div>
            </div>
            <span className="text-base font-bold tracking-wider text-white font-brand hidden sm:inline">TH3ORY</span>
          </a>
          <span className="text-slate-600 font-light">|</span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Community Wall</span>
          </div>
        </div>

        {/* Member Profile Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-[11px] flex items-center justify-center">
              {currentMember.name?.slice(0, 1).toUpperCase() || 'M'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">{currentMember.name}</p>
              <p className="text-[10px] text-amber-400 font-medium">Verified Member</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 border border-white/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#101726] to-[#0a0f1d] border border-white/10 p-6 shadow-2xl overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Executive Psychological Mastermind</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome, {currentMember.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                Explore weekly cognitive breakdowns, downloadable tactical frameworks, and collaborative peer discussions. React to insights and share your field observations below.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Updates', icon: Sparkles },
              { id: 'weekly_video', label: 'Weekly Videos', icon: Video },
              { id: 'file_resource', label: 'Tactical Files', icon: FileText },
              { id: 'discussion', label: 'Discussions', icon: MessageSquare },
              { id: 'pinned', label: 'Pinned', icon: Pin },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-[#0c121e] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts or files..."
              className="w-full bg-[#0c121e] border border-white/10 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>
        </div>

        {/* Community Wall Feed */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading community wall updates...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center bg-[#0c121e] border border-white/5 rounded-2xl p-8">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No posts found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? `No updates matched "${searchQuery}". Try clearing your search.` : 'Weekly posts and files published by Administration will appear on this wall.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => {
              const postReactions = reactions.filter(r => r.post_id === post.id);
              const postComments = comments.filter(c => c.post_id === post.id);
              const isCommentsOpen = expandedComments[post.id];
              const embedUrl = post.media_url ? getEmbeddableMediaUrl(post.media_url) : null;

              return (
                <article
                  key={post.id}
                  className="bg-[#0c121e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                        {post.author_name?.slice(0, 1) || 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{post.author_name}</span>
                          {post.author_role && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                              {post.author_role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="capitalize text-slate-400">{post.post_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {post.is_pinned && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full shrink-0">
                        <Pin className="w-3 h-3 fill-amber-400" />
                        <span>Pinned Update</span>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Media Embed (Weekly Video) */}
                  {post.post_type === 'weekly_video' && embedUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-video shadow-2xl">
                      <iframe
                        src={embedUrl}
                        title={post.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                      />
                    </div>
                  )}

                  {/* File / Resource Attachment */}
                  {post.file_name && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{post.file_name}</p>
                          <p className="text-[11px] text-slate-400">{post.file_size || 'Tactical Resource File'}</p>
                        </div>
                      </div>

                      {post.file_url ? (
                        <a
                          href={post.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">Available In Session</span>
                      )}
                    </div>
                  )}

                  {/* Reaction Emojis Bar */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {EMOJI_DEFINITIONS.map(def => {
                        const count = postReactions.filter(r => r.emoji === def.emoji).length;
                        const hasReacted = postReactions.some(
                          r => r.emoji === def.emoji && r.member_id === currentMember.id
                        );

                        return (
                          <button
                            key={def.emoji}
                            type="button"
                            onClick={() => handleToggleReaction(post.id, def.emoji)}
                            className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/10 scale-105'
                                : 'bg-[#070a11] hover:bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                            title={def.label}
                          >
                            <span className="text-sm">{def.emoji}</span>
                            {count > 0 && <span className="font-semibold text-[11px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Toggle Comments Button */}
                    <button
                      type="button"
                      onClick={() => toggleCommentsDrawer(post.id)}
                      className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{postComments.length} {postComments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </button>
                  </div>

                  {/* Comments Thread */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                      {/* Comments list */}
                      {postComments.length > 0 ? (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                          {postComments.map(c => (
                            <div key={c.id} className="p-3 rounded-xl bg-[#070a11] border border-white/5 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-white flex items-center gap-1">
                                  <span>{c.member_name}</span>
                                  {c.member_id === currentMember.id && (
                                    <span className="text-[10px] text-amber-400 font-normal">(You)</span>
                                  )}
                                </span>
                                <span className="text-slate-500">
                                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{c.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-2">No comments yet. Start the discussion!</p>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Add your observation or response..."
                          className="flex-1 bg-[#070a11] border border-white/10 focus:border-amber-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
