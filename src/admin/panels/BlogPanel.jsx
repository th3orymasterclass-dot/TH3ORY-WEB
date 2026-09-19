import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, Edit3, Trash2, Eye, EyeOff,
  ExternalLink, Sparkles, Star, Calendar, Clock, User, CheckCircle2,
  AlertCircle, RefreshCw, X, Save, Image, Tag, ArrowUpRight, BookOpen,
  HelpCircle, Heading, Bold, Italic, List, Quote, Minus
} from 'lucide-react';
import { BLOG_CATEGORIES, defaultBlogs } from '../../data/blogData';
import {
  fetchBlogsFromSupabase,
  saveBlogToSupabase,
  deleteBlogFromSupabase
} from '../../services/supabaseService';

export default function BlogPanel({ themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editorTab, setEditorTab] = useState('write'); // 'write' | 'preview'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await fetchBlogsFromSupabase(true);
      setBlogs(data && data.length > 0 ? data : defaultBlogs);
    } catch (err) {
      console.error('[BlogPanel] Load error:', err);
      setBlogs(defaultBlogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter(b => b.published).length;
    const drafts = total - published;
    const totalViews = blogs.reduce((acc, b) => acc + (Number(b.views) || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch =
        (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' || blog.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
          ? blog.published
          : !blog.published;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategory, statusFilter]);

  // Open editor for new or existing
  const handleOpenEditor = (blog = null) => {
    if (blog) {
      setEditingBlog({
        ...blog,
        tagsString: (blog.tags || []).join(', ')
      });
    } else {
      setEditingBlog({
        id: `blog_${Date.now()}`,
        slug: '',
        title: '',
        subtitle: '',
        category: 'Cognitive Science',
        tags: ['Cognitive Science', 'Influence'],
        tagsString: 'Cognitive Science, Influence',
        author: {
          name: 'Sravan Sudhakaran',
          role: 'Cognitive Strategist & Founder',
          avatar: '/instructor.png'
        },
        publishedAt: new Date().toISOString(),
        readTime: '5 min read',
        coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80',
        featured: false,
        published: true,
        views: 0,
        excerpt: '',
        content: `## Executive Summary\n\nOutline the core cognitive premise or strategic breakdown here.\n\n### The Subconscious Mechanism\nExplain how this phenomenon impacts human decisions and perception.\n\n- Observation 1\n- Observation 2\n\n### Practical Implementation Protocol\nProvide step-by-step masterclass application.`
      });
    }
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Quick toggle published status
  const handleTogglePublish = async (blog, e) => {
    e?.stopPropagation();
    const updated = { ...blog, published: !blog.published };
    setBlogs(prev => prev.map(b => (b.id === blog.id ? updated : b)));
    try {
      await saveBlogToSupabase(updated);
      showToast(updated.published ? 'Article published to live website.' : 'Article converted to draft.');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  // Quick toggle featured status
  const handleToggleFeatured = async (blog, e) => {
    e?.stopPropagation();
    const updated = { ...blog, featured: !blog.featured };
    setBlogs(prev => prev.map(b => (b.id === blog.id ? updated : b)));
    try {
      await saveBlogToSupabase(updated);
      showToast(updated.featured ? 'Marked as spotlight article' : 'Spotlight removed');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete article
  const handleDeleteBlog = async (blogId) => {
    try {
      await deleteBlogFromSupabase(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      setDeleteConfirmId(null);
      showToast('Article deleted successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete article', 'error');
    }
  };

  // Save Blog from Modal
  const handleSaveBlog = async () => {
    if (!editingBlog.title?.trim()) {
      showToast('Please enter an article title', 'error');
      return;
    }

    setSaving(true);
    try {
      // Auto-generate slug if blank
      let slug = editingBlog.slug?.trim();
      if (!slug) {
        slug = editingBlog.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      // Parse tags
      const tags = (editingBlog.tagsString || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const blogToSave = {
        ...editingBlog,
        slug,
        tags,
        updatedAt: new Date().toISOString()
      };

      const res = await saveBlogToSupabase(blogToSave);
      if (res.success) {
        setBlogs(prev => {
          const idx = prev.findIndex(b => b.id === blogToSave.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.blog || blogToSave;
            return next;
          }
          return [res.blog || blogToSave, ...prev];
        });
        setIsEditorOpen(false);
        showToast(blogToSave.published ? 'Article published to live blog!' : 'Draft saved successfully');
      } else {
        showToast(res.error || 'Failed to save', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving article', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper to insert markdown tags at cursor/end of content
  const insertMarkdown = (syntaxBefore, syntaxAfter = '') => {
    setEditingBlog(prev => {
      const content = prev.content || '';
      return {
        ...prev,
        content: `${content}\n${syntaxBefore}Text here${syntaxAfter}\n`
      };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800/60'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/60'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Editorial Studio
            </span>
            <span className="text-xs text-slate-400">Live on th3ory.online/#blog</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Articles & Cognitive Field Notes
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Author and publish executive writeups, behavioural breakdowns, and masterclass field notes directly to the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            <span>View Public Blog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={loadBlogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Refresh articles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenEditor(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#181A1F] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Articles</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181A1F] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Published Live</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{stats.published}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181A1F] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Drafts</span>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 mt-2">{stats.drafts}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181A1F] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cumulative Reads</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">{stats.totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#181A1F] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search writeups by title, concept, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All ({blogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-slate-400 text-black'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Drafts ({stats.drafts})
            </button>
          </div>
        </div>

        {/* Categories scroll row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-sm">Retrieving Masterclass field notes...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#181A1F] border border-white/10 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No articles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try modifying your search filter or category selection.'
              : 'Draft your first high-impact field note to publish on the site.'}
          </p>
          <button
            onClick={() => handleOpenEditor(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Article</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBlogs.map(blog => (
            <div
              key={blog.id}
              className={`group p-4 rounded-xl bg-[#181A1F] border transition-all duration-200 hover:border-amber-500/40 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
                blog.published ? 'border-white/10' : 'border-dashed border-white/20 opacity-80'
              }`}
            >
              {/* Left Column: Image & Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-amber-300">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}

                  {blog.featured && (
                    <div className="absolute top-1 right-1 p-1 rounded-full bg-amber-500 text-black shadow">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {blog.category}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {blog.readTime || '5 min read'}
                    </span>

                    <span className="text-[11px] text-slate-500">•</span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(blog.publishedAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>

                    {!blog.published && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        Draft
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {blog.subtitle || blog.excerpt}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-500">
                      By {blog.author?.name || 'Sravan Sudhakaran'}
                    </span>
                    <span className="text-[11px] text-slate-600">/</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      #{blog.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                {/* Spotlight Button */}
                <button
                  onClick={e => handleToggleFeatured(blog, e)}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    blog.featured
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                  title={blog.featured ? 'Featured Spotlight (Active)' : 'Mark as Featured'}
                >
                  <Star className={`w-4 h-4 ${blog.featured ? 'fill-current' : ''}`} />
                </button>

                {/* Publish Switch */}
                <button
                  onClick={e => handleTogglePublish(blog, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    blog.published
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {blog.published ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                {/* Preview on Public Blog */}
                <a
                  href={`#blog/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  title="Preview on Public Page"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEditor(blog)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                {deleteConfirmId === blog.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(blog.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#15171A] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181A1F]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingBlog.id?.startsWith('blog_') && !blogs.some(b => b.id === editingBlog.id)
                      ? 'Draft New Article'
                      : 'Edit Article & Writeup'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live Markdown formatting, author attribution, and SEO slug.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={editingBlog.title}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '');
                      setEditingBlog(prev => ({
                        ...prev,
                        title,
                        slug: prev.slug === '' || prev.slug === editingBlog.slug ? slug : prev.slug
                      }));
                    }}
                    placeholder="e.g. The Anatomy of Cognitive Presence..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-white font-medium text-base focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      URL Slug (Permanent Link)
                    </label>
                    <div className="flex items-center rounded-xl bg-[#121316] border border-white/10 px-3">
                      <span className="text-xs text-slate-500 font-mono">#blog/</span>
                      <input
                        type="text"
                        value={editingBlog.slug}
                        onChange={e =>
                          setEditingBlog(prev => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')
                          }))
                        }
                        placeholder="anatomy-of-cognitive-presence"
                        className="w-full py-2 px-2 bg-transparent text-amber-300 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={editingBlog.category}
                      onChange={e =>
                        setEditingBlog(prev => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                    >
                      {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c} className="bg-[#15171A]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Subtitle / Excerpt */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Subtitle / Deck
                  </label>
                  <input
                    type="text"
                    value={editingBlog.subtitle}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="Short one-line hook displayed under the headline..."
                    className="w-full px-4 py-2 rounded-xl bg-[#121316] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Search Excerpt & Social Teaser
                  </label>
                  <textarea
                    rows={2}
                    value={editingBlog.excerpt}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Brief 2-line executive summary displayed on card previews..."
                    className="w-full px-4 py-2 rounded-xl bg-[#121316] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Meta Grid: Read Time, Tags, Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Read Duration
                  </label>
                  <input
                    type="text"
                    value={editingBlog.readTime}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, readTime: e.target.value }))
                    }
                    placeholder="6 min read"
                    className="w-full px-3 py-2 rounded-xl bg-[#121316] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={editingBlog.tagsString}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, tagsString: e.target.value }))
                    }
                    placeholder="Presence, Body Language, Strategy"
                    className="w-full px-3 py-2 rounded-xl bg-[#121316] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={editingBlog.coverImage}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, coverImage: e.target.value }))
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121316] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Preview */}
              {editingBlog.coverImage && (
                <div className="relative h-32 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={editingBlog.coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                    onError={e => (e.target.style.display = 'none')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] text-slate-300">Cover Preview</span>
                  </div>
                </div>
              )}

              {/* Author & Visibility Controls */}
              <div className="p-4 rounded-xl bg-[#181A1F] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={editingBlog.author?.avatar || '/instructor.png'}
                    alt="Author"
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                    onError={e => {
                      e.target.src = '/instructor.png';
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {editingBlog.author?.name || 'Sravan Sudhakaran'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {editingBlog.author?.role || 'Founder & Cognitive Strategist'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBlog.featured}
                      onChange={e =>
                        setEditingBlog(prev => ({ ...prev, featured: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      Spotlight on Hero
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBlog.published}
                      onChange={e =>
                        setEditingBlog(prev => ({ ...prev, published: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Publish Live
                    </span>
                  </label>
                </div>
              </div>

              {/* Main Content Area: Write vs Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-[#121316] p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        editorTab === 'write'
                          ? 'bg-amber-500 text-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Write Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        editorTab === 'preview'
                          ? 'bg-amber-500 text-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>

                  {editorTab === 'write' && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Heading 2"
                      >
                        <Heading className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('> ')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Blockquote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('- ')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n---\n')}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                        title="Divider"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {editorTab === 'write' ? (
                  <textarea
                    rows={15}
                    value={editingBlog.content}
                    onChange={e =>
                      setEditingBlog(prev => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Write the full masterclass breakdown using standard markdown..."
                    className="w-full p-4 rounded-xl bg-[#121316] border border-white/10 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <div className="p-6 rounded-xl bg-[#121316] border border-white/10 min-h-[350px] max-h-[500px] overflow-y-auto prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                    {/* Basic Markdown Parser for Preview */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdownToHtml(editingBlog.content)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#181A1F]">
              <div className="text-xs text-slate-400">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    editingBlog.published ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {editingBlog.published ? 'Live on Site' : 'Private Draft'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveBlog}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Update'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Simple Client Markdown Parser for Admin Preview ─────────────────────────
function formatMarkdownToHtml(md = '') {
  if (!md) return '<p class="text-slate-500 italic">No content written yet...</p>';

  let html = md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-amber-300 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-white mt-8 mb-4">$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-amber-500 pl-4 py-1 italic text-slate-300 my-3">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-amber-200/90">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
    .replace(/^---$/gim, '<hr class="my-6 border-white/10" />')
    .replace(/\n\n/gim, '</p><p class="my-3">');

  return `<p class="my-3">${html}</p>`;
}
