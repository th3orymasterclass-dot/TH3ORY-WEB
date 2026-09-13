import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, MessageSquare, Video, FileText, PlusCircle,
  Pin, Trash2, Check, X, Clock, Mail, Send, ExternalLink, AlertCircle,
  Sparkles, ShieldCheck, Heart, ThumbsUp, Flame, Lightbulb, Brain, Award,
  RefreshCw, CheckCircle2, Eye
} from 'lucide-react';
import {
  fetchCommunityMembersFromSupabase,
  approveCommunityMemberInSupabase,
  rejectCommunityMemberInSupabase,
  fetchCommunityPostsFromSupabase,
  createCommunityPostInSupabase,
  deleteCommunityPostInSupabase,
  fetchCommunityReactionsFromSupabase,
  fetchCommunityCommentsFromSupabase,
  deleteCommunityCommentInSupabase
} from '../../services/supabaseService';
import { sendCommunityApprovalEmail } from '../../services/emailService';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

export default function CommunityAdminPanel({ themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'posts', 'comments'
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status notifications
  const [actionNotice, setActionNotice] = useState('');
  const [processingMemberId, setProcessingMemberId] = useState(null);

  // New Post Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    post_type: 'weekly_video',
    media_url: '',
    file_name: '',
    file_url: '',
    file_size: '',
    is_pinned: false,
    author_name: 'Mentalist Sravan',
    author_role: 'Founder & Behavioral Engineer'
  });
  const [creatingPost, setCreatingPost] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p, r, c] = await Promise.all([
        fetchCommunityMembersFromSupabase(),
        fetchCommunityPostsFromSupabase(),
        fetchCommunityReactionsFromSupabase(),
        fetchCommunityCommentsFromSupabase()
      ]);
      setMembers(m || []);
      setPosts(p || []);
      setReactions(r || []);
      setComments(c || []);
    } catch (err) {
      console.warn('[CommunityAdminPanel] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveMember = async (member) => {
    setProcessingMemberId(member.id);
    setActionNotice('');

    try {
      await approveCommunityMemberInSupabase(member.id, 'Super Admin');
      
      // Dispatch official activation & login email
      const emailRes = await sendCommunityApprovalEmail(member);
      
      setActionNotice(`✅ Approved ${member.name}! Official approval email dispatched to ${member.email}.`);
      await loadData();
    } catch (err) {
      setActionNotice(`⚠️ Member approved, but email notice failed: ${err.message}`);
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleRejectMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to reject the application for ${memberName}?`)) return;
    setProcessingMemberId(memberId);
    try {
      await rejectCommunityMemberInSupabase(memberId, 'Application does not meet current criteria');
      setActionNotice(`❌ Application for ${memberName} marked as rejected.`);
      await loadData();
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleResendLoginEmail = async (member) => {
    setProcessingMemberId(member.id);
    try {
      await sendCommunityApprovalEmail(member);
      setActionNotice(`📧 Re-dispatched community login invitation to ${member.email}.`);
    } catch (err) {
      setActionNotice(`❌ Failed to send login email: ${err.message}`);
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      alert('Please provide both a title and post content.');
      return;
    }

    setCreatingPost(true);
    try {
      await createCommunityPostInSupabase(postForm);
      setShowCreateModal(false);
      setPostForm({
        title: '',
        content: '',
        post_type: 'weekly_video',
        media_url: '',
        file_name: '',
        file_url: '',
        file_size: '',
        is_pinned: false,
        author_name: 'Mentalist Sravan',
        author_role: 'Founder & Behavioral Engineer'
      });
      setActionNotice('🎉 New post published to the Community Wall successfully!');
      await loadData();
    } catch (err) {
      alert(`Failed to create post: ${err.message}`);
    } finally {
      setCreatingPost(false);
    }
  };

  const handleDeletePost = async (postId, title) => {
    if (!window.confirm(`Delete post "${title}"? This will also remove its reactions and comments.`)) return;
    await deleteCommunityPostInSupabase(postId);
    setActionNotice('🗑️ Post deleted from the wall.');
    await loadData();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment from discussion thread?')) return;
    await deleteCommunityCommentInSupabase(commentId);
    setActionNotice('🗑️ Comment removed.');
    await loadData();
  };

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-amber-500" />
            Community Hub & Wall Management
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review pending member access requests, publish weekly videos & tactical files, and moderate community reactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Post</span>
          </button>
          <button
            onClick={loadData}
            title="Refresh"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Action Banner */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-amber-400 hover:text-amber-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingMembers.length}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Approved Members</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedMembers.length}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Wall Posts</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-1">{posts.length}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Member Reactions</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">{reactions.length}</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'approvals', label: `Member Approvals (${pendingMembers.length})`, icon: UserCheck },
          { id: 'posts', label: `Wall Posts (${posts.length})`, icon: Video },
          { id: 'comments', label: `Discussion Comments (${comments.length})`, icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'text-slate-400 hover:text-white bg-slate-900/50' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Member Approvals ────────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Applications */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Membership Applications</span>
            </h3>

            {pendingMembers.length === 0 ? (
              <div className={`p-6 text-center rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">All member applications have been reviewed. Zero pending approvals!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map(member => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{member.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{member.email}</p>
                      {member.bio && (
                        <p className="text-xs text-slate-300 italic max-w-xl">"{member.bio}"</p>
                      )}
                      <p className="text-[10px] text-slate-500">
                        Applied on {new Date(member.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveMember(member)}
                        disabled={processingMemberId === member.id}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Email Login</span>
                      </button>
                      <button
                        onClick={() => handleRejectMember(member.id, member.name)}
                        disabled={processingMemberId === member.id}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Members Roster */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Approved Active Community Members ({approvedMembers.length})</span>
            </h3>

            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={isDark ? 'bg-slate-950 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                    <tr>
                      <th className="p-3">Member</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Approved Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {approvedMembers.map(member => (
                      <tr key={member.id} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-white">{member.name}</td>
                        <td className="p-3 text-slate-400 font-mono">{member.email}</td>
                        <td className="p-3 text-slate-400">
                          {member.approved_at ? new Date(member.approved_at).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            Approved
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleResendLoginEmail(member)}
                            disabled={processingMemberId === member.id}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] rounded-md border border-white/10 transition-all cursor-pointer"
                          >
                            Resend Login Link
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Wall Posts Management ──────────────────────────────────── */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">These posts are published to the member community wall feed.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Post</span>
            </button>
          </div>

          <div className="space-y-3">
            {posts.map(post => {
              const postReactions = reactions.filter(r => r.post_id === post.id);
              const postComments = comments.filter(c => c.post_id === post.id);

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                          {post.post_type.replace('_', ' ')}
                        </span>
                        {post.is_pinned && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-purple-400" /> Pinned
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{post.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{post.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Media / File info */}
                  {(post.media_url || post.file_name) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      {post.media_url && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Video className="w-3.5 h-3.5" /> Video Stream Attached
                        </span>
                      )}
                      {post.file_name && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <FileText className="w-3.5 h-3.5" /> {post.file_name} ({post.file_size || 'Resource'})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Engagement Bar */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>🔥 {postReactions.length} Reactions</span>
                      <span>💬 {postComments.length} Comments</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: Comments & Moderation ──────────────────────────────────── */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Review all community discussion comments. You can remove any comment that violates guidelines.</p>

          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No comments recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {comments.map(c => {
                const parentPost = posts.find(p => p.id === c.post_id);
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.member_name}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-300">{c.comment}</p>
                      {parentPost && (
                        <p className="text-[11px] text-amber-400/80">On post: {parentPost.title}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Create New Post Modal ─────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0c121e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>Publish New Post to Community Wall</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              {/* Type */}
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Post Category</label>
                <select
                  value={postForm.post_type}
                  onChange={(e) => setPostForm({ ...postForm, post_type: e.target.value })}
                  className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
                >
                  <option value="weekly_video">Weekly Video Module</option>
                  <option value="file_resource">Tactical File / Download</option>
                  <option value="discussion">Thought Leadership Discussion</option>
                  <option value="announcement">Important Announcement</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Post Title</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Weekly Video: Advanced Micro-Expression Calibration"
                  className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Content / Body */}
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Post Content & Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Provide context, key takeaways, and discussion prompts for members..."
                  className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              {/* Video URL */}
              {postForm.post_type === 'weekly_video' && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Video Stream URL (Google Drive Share Link or Direct)</label>
                  <input
                    type="url"
                    value={postForm.media_url}
                    onChange={(e) => setPostForm({ ...postForm, media_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/.../view or embed link"
                    className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Google Drive URLs are automatically sanitized into protected preview players.</p>
                </div>
              )}

              {/* File Attachment */}
              {(postForm.post_type === 'file_resource' || postForm.post_type === 'weekly_video') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">File Name</label>
                    <input
                      type="text"
                      value={postForm.file_name}
                      onChange={(e) => setPostForm({ ...postForm, file_name: e.target.value })}
                      placeholder="Cognitive_Exercise_Matrix.pdf"
                      className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">File Download URL</label>
                    <input
                      type="text"
                      value={postForm.file_url}
                      onChange={(e) => setPostForm({ ...postForm, file_url: e.target.value })}
                      placeholder="https://... or /assets/..."
                      className="w-full bg-[#070a11] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>
              )}

              {/* Pin toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={postForm.is_pinned}
                  onChange={(e) => setPostForm({ ...postForm, is_pinned: e.target.checked })}
                  className="rounded border-white/20 text-amber-500 focus:ring-0"
                />
                <label htmlFor="pinToggle" className="text-slate-300 cursor-pointer">
                  Pin this post to the top of the Community Wall
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPost}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {creatingPost ? 'Publishing...' : 'Publish to Wall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
