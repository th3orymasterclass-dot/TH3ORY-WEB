import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Search, Clock, Calendar, BookOpen, Share2,
  Check, Copy, ChevronRight, Star, Tag, Eye, Sparkles,
  ExternalLink, ArrowUpRight, MessageCircle, Twitter, Linkedin,
  Bookmark, User, ShieldCheck, Flame, Compass
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import Footer from './Footer';
import { BLOG_CATEGORIES, defaultBlogs } from '../data/blogData';
import { fetchBlogsFromSupabase, subscribeToBlogs } from '../services/supabaseService';

export default function BlogPage({ onBack, onOpenCheckout }) {
  const [blogs, setBlogs] = useState(defaultBlogs);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState(() => {
    const h = window.location.hash || '';
    if (h.startsWith('#blog/')) {
      return decodeURIComponent(h.replace('#blog/', '').trim());
    }
    return null;
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load published blogs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchBlogsFromSupabase(false);
        if (mounted && data && data.length > 0) {
          setBlogs(data);
        }
      } catch (err) {
        console.warn('[BlogPage] Could not load blogs from Supabase, using defaults:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const unsubscribe = subscribeToBlogs(() => {
      load();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Listen to hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash || '';
      if (h.startsWith('#blog/')) {
        const slug = decodeURIComponent(h.replace('#blog/', '').trim());
        setActiveSlug(slug || null);
      } else if (h === '#blog' || h === '#/blog') {
        setActiveSlug(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSlug]);

  // Current active article if viewing reader mode
  const currentArticle = useMemo(() => {
    if (!activeSlug) return null;
    return blogs.find(b => b.slug === activeSlug || b.id === activeSlug) || null;
  }, [blogs, activeSlug]);

  // Featured article for spotlight
  const featuredArticle = useMemo(() => {
    return blogs.find(b => b.featured) || blogs[0] || null;
  }, [blogs]);

  // Filtered articles for catalog
  const filteredArticles = useMemo(() => {
    return blogs.filter(b => {
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesSearch =
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Related articles for single article view
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    return blogs
      .filter(b => b.id !== currentArticle.id && (b.category === currentArticle.category || b.featured))
      .slice(0, 3);
  }, [blogs, currentArticle]);

  // Handle navigate to single article
  const navigateToArticle = (slug) => {
    window.location.hash = `#blog/${slug}`;
    setActiveSlug(slug);
  };

  // Handle back to catalog or main site
  const handleBackNavigation = () => {
    if (activeSlug) {
      window.location.hash = '#blog';
      setActiveSlug(null);
    } else {
      if (onBack) {
        onBack();
      } else {
        window.location.hash = '';
        window.dispatchEvent(new Event('hashchange'));
      }
    }
  };

  // Share handlers
  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://th3ory.online/#blog';
    const title = currentArticle ? currentArticle.title : 'TH3ORY Cognitive Field Notes';

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      return;
    }

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
      return;
    }

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=th3orymasterclass`, '_blank');
      return;
    }

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      return;
    }

    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#FAFAF7] relative selection:bg-[#F59E0B] selection:text-black">
      <SEOHead
        title={
          currentArticle
            ? `${currentArticle.title} | TH3ORY Field Notes`
            : "Cognitive Field Notes & Executive Writeups | TH3ORY Masterclass"
        }
        description={
          currentArticle
            ? currentArticle.subtitle || currentArticle.excerpt
            : "Tactical writeups, psychological deconstructions, and non-verbal influence blueprints authored by Sravan Sudhakaran and TH3ORY faculty."
        }
        canonicalUrl={
          currentArticle
            ? `https://th3ory.online/#blog/${currentArticle.slug}`
            : "https://th3ory.online/#blog"
        }
      />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#15171A]/90 backdrop-blur-md py-3.5 shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleBackNavigation}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">
                  {activeSlug ? 'All Articles' : 'Main Site'}
                </span>
              </button>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onBack) onBack();
                  else {
                    window.location.hash = '';
                    window.dispatchEvent(new Event('hashchange'));
                  }
                }}
                className="flex items-center gap-2"
              >
                <Logo className="h-7 sm:h-8" />
              </a>

              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Field Notes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onOpenCheckout) onOpenCheckout();
                  else {
                    window.location.hash = 'enroll';
                    window.dispatchEvent(new Event('hashchange'));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Join Masterclass (₹499)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentArticle ? (
          /* ──────────────────────────────────────────────────────────────────────────
             SINGLE ARTICLE READER VIEW
             ────────────────────────────────────────────────────────────────────────── */
          <article className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
              <button
                onClick={() => {
                  window.location.hash = '#blog';
                  setActiveSlug(null);
                }}
                className="hover:text-amber-300 transition-colors"
              >
                Cognitive Field Notes
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-medium">{currentArticle.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-500 truncate max-w-xs">{currentArticle.title}</span>
            </div>

            {/* Article Header Meta */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentArticle.category}
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {currentArticle.readTime || '5 min read'}
                </span>

                <span className="text-slate-600">•</span>

                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(currentArticle.publishedAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Title & Deck */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                {currentArticle.title}
              </h1>

              {currentArticle.subtitle && (
                <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1 italic">
                  {currentArticle.subtitle}
                </p>
              )}

              {/* Author Attribution & Share Bar */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentArticle.author?.avatar || '/instructor.png'}
                    alt={currentArticle.author?.name || 'Sravan Sudhakaran'}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40 shadow"
                    onError={e => {
                      e.target.src = '/instructor.png';
                    }}
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{currentArticle.author?.name || 'Sravan Sudhakaran'}</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400">
                      {currentArticle.author?.role || 'Cognitive Strategist & Founder, TH3ORY'}
                    </span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
                    title="Copy Article Link"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                    title="Share to WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                    title="Share to X (Twitter)"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                    title="Share to LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {currentArticle.coverImage && (
              <div className="relative rounded-2xl overflow-hidden mb-10 border border-white/10 shadow-2xl max-h-[460px] bg-slate-900">
                <img
                  src={currentArticle.coverImage}
                  alt={currentArticle.title}
                  className="w-full h-full object-cover"
                  onError={e => (e.target.style.display = 'none')}
                />
              </div>
            )}

            {/* Markdown Content Body */}
            <div className="bg-[#15171A] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl mb-12">
              <ArticleMarkdownRenderer content={currentArticle.content} />

              {/* Tags */}
              {currentArticle.tags && currentArticle.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                    Index Tags:
                  </span>
                  {currentArticle.tags.map(t => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Conversion Banner for Masterclass */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-black border border-amber-500/30 text-center relative overflow-hidden shadow-2xl mb-14">
              <div className="relative z-10 max-w-xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-current" /> Launch Batch Enrolling
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Translate Cognitive Theory Into Instinctive Mastery
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Join 30 days of high-intensity behavioral drills, non-verbal micro-expression analysis, vocal modulation frameworks, and personal feedback directly from Sravan Sudhakaran.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      if (onOpenCheckout) onOpenCheckout();
                      else {
                        window.location.hash = 'enroll';
                        window.dispatchEvent(new Event('hashchange'));
                      }
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Secure Your Spot for ₹499 (Subject to Terms)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Related Articles Carousel / Grid */}
            {relatedArticles.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Recommended Field Notes</span>
                  </h3>
                  <button
                    onClick={() => {
                      window.location.hash = '#blog';
                      setActiveSlug(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    View All Articles →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedArticles.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => navigateToArticle(rel.slug)}
                      className="group p-4 rounded-xl bg-[#15171A] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="h-32 rounded-lg overflow-hidden bg-slate-800 border border-white/5">
                          {rel.coverImage && (
                            <img
                              src={rel.coverImage}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => (e.target.style.display = 'none')}
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {rel.category}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 line-clamp-2 transition-colors">
                          {rel.title}
                        </h4>
                      </div>
                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{rel.readTime || '5 min read'}</span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Read <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ) : (
          /* ──────────────────────────────────────────────────────────────────────────
             CATALOG DIRECTORY VIEW
             ────────────────────────────────────────────────────────────────────────── */
          <div className="space-y-12">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Dispatches &amp; Cognitive Science</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                The Playbook of Human Behavior &amp; Authority
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Deconstructing subtle body language, high-stakes negotiation psychology, vocal presence, and subconscious leverage. Written by Sravan Sudhakaran and the TH3ORY faculty.
              </p>
            </div>

            {/* Featured Spotlight Card */}
            {featuredArticle && !searchQuery && selectedCategory === 'All' && (
              <div
                onClick={() => navigateToArticle(featuredArticle.slug)}
                className="group relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#1B1D22] via-[#15171A] to-black p-6 sm:p-10 shadow-2xl hover:border-amber-500/60 transition-all cursor-pointer"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-black shadow">
                        <Star className="w-3 h-3 fill-current" /> Spotlight Article
                      </span>
                      <span className="text-xs text-amber-400 font-semibold">
                        {featuredArticle.category}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {featuredArticle.readTime || '6 min read'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                      {featuredArticle.subtitle || featuredArticle.excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={featuredArticle.author?.avatar || '/instructor.png'}
                          alt="Author"
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                          onError={e => {
                            e.target.src = '/instructor.png';
                          }}
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {featuredArticle.author?.name || 'Sravan Sudhakaran'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Founder &amp; Cognitive Strategist
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                        <span>Read Full Breakdown</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => (e.target.style.display = 'none')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search writeups, body language cues, or strategy..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#15171A] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-400">
                  Showing <strong className="text-white">{filteredArticles.length}</strong> of{' '}
                  <strong className="text-white">{blogs.length}</strong> writeups
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {BLOG_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-[#15171A] text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-[#15171A] border border-white/10 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No field notes found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any articles matching your search criteria. Try switching categories or clearing search filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(blog => (
                  <div
                    key={blog.id}
                    onClick={() => navigateToArticle(blog.slug)}
                    className="group flex flex-col justify-between rounded-2xl bg-[#15171A] border border-white/10 hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer hover:-translate-y-1"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-48 overflow-hidden bg-slate-900 border-b border-white/5">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-amber-300">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}

                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                            {blog.category}
                          </span>
                        </div>

                        {blog.featured && (
                          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-500 text-black shadow">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {blog.readTime || '5 min read'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>
                            {new Date(blog.publishedAt || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {blog.subtitle || blog.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3.5 border-t border-white/5 bg-black/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={blog.author?.avatar || '/instructor.png'}
                          alt={blog.author?.name || 'Sravan Sudhakaran'}
                          className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
                          onError={e => {
                            e.target.src = '/instructor.png';
                          }}
                        />
                        <span className="text-[11px] text-slate-300 font-medium">
                          {blog.author?.name || 'Sravan Sudhakaran'}
                        </span>
                      </div>

                      <span className="text-amber-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Newsletter Dispatch Box */}
            <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-white/10 text-center max-w-3xl mx-auto space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-amber-300 border border-white/10">
                Cognitive Intelligence Wire
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Never Miss a Tactical Field Note
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Join 2,400+ founders, executives, and high-stakes negotiators receiving our private breakdowns directly in their inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  placeholder="Enter your executive email..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#121316] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => alert('Thank you for subscribing to TH3ORY Field Notes!')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer onOpenCheckout={onOpenCheckout} />
    </div>
  );
}

// ─── Simple Helper Component: ArrowRight ─────────────────────────────────────
function ArrowRight(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// ─── Article Markdown Renderer Component ─────────────────────────────────────
function ArticleMarkdownRenderer({ content }) {
  if (!content) return null;

  // Split content by paragraphs/blocks
  const blocks = content.split('\n\n');

  return (
    <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-2xl sm:text-3xl font-black text-white mt-8 mb-4">
              {trimmed.replace('# ', '')}
            </h1>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="text-xl sm:text-2xl font-extrabold text-white mt-8 mb-4 border-b border-white/10 pb-2 flex items-center gap-2"
            >
              <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block" />
              {trimmed.replace('## ', '')}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg sm:text-xl font-bold text-amber-300 mt-6 mb-2">
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-amber-500 pl-4 py-2 italic text-amber-100 bg-amber-500/5 rounded-r-xl my-4 text-sm"
            >
              {renderFormattedInline(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={i} className="my-8 border-white/10" />;
        }

        // Unordered List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={i} className="space-y-2 my-4 pl-5 list-disc text-slate-300">
              {lines.map((line, liIdx) => (
                <li key={liIdx} className="leading-relaxed">
                  {renderFormattedInline(line.replace(/^[-*]\s*/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered List
        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <ol key={i} className="space-y-2 my-4 pl-5 list-decimal text-slate-300">
              {lines.map((line, liIdx) => (
                <li key={liIdx} className="leading-relaxed">
                  {renderFormattedInline(line.replace(/^\d+\.\s*/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={i} className="text-slate-300 leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// ─── Inline Formatter Helper ──────────────────────────────────────────────────
function renderFormattedInline(text) {
  // Convert markdown bold (**bold**) and italics (*italic*)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="text-amber-300/90 font-medium">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
