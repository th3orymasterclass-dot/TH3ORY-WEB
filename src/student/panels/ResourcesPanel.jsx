import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Search, Filter, Bookmark, Star, Download,
  Eye, ExternalLink, Sparkles, FolderOpen, Layers,
  CheckCircle2, Lock, Unlock, Grid, List, RefreshCw,
  BookOpen, Clock, Tag, ChevronRight, ShieldCheck, Zap,
  Play, Video, X, ShieldAlert, MonitorPlay, Tv
} from 'lucide-react';
import { useTh3oryLive } from '../../data/adminData';
import { getBookmarks, toggleBookmark } from '../studentData';
import PdfViewerModal from '../../components/PdfViewerModal';
import StudentVideoModal from '../components/StudentVideoModal';
import { parseGoogleDriveUrl } from '../../utils/gdriveHelper';

// Plan access hierarchy: vip > enrolled > free
function getStudentPlanRank(planStr = '') {
  const p = (planStr || '').toLowerCase();
  if (p.includes('vip') || p.includes('enterprise')) return 2;
  if (p.includes('free')) return 0;
  return 1; // default: enrolled
}

const CATEGORIES = [
  { id: 'all',         label: 'All Resources',       icon: FolderOpen },
  { id: 'videos',      label: 'Video Masterclasses', icon: Play },
  { id: 'workbooks',   label: 'Workbooks',           icon: BookOpen },
  { id: 'frameworks',  label: 'Frameworks',          icon: Layers },
  { id: 'cheatsheets', label: 'Cheatsheets',         icon: Zap },
  { id: 'blueprints',  label: 'Blueprints',          icon: ShieldCheck },
  { id: 'bookmarked',  label: 'Saved & Starred',     icon: Bookmark },
];

const LEVEL_LABELS = {
  l1: 'Level 1: Presence',
  l2: 'Level 2: Power',
  l3: 'Level 3: Warmth',
  l4: 'Level 4: Connection',
  l5: 'Level 5: Legacy'
};

function isVideoResource(item) {
  if (!item) return false;
  if (item.type === 'video' || item.type === 'stream') return true;
  const url = (item.url || '').toLowerCase();
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return true;
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mkv')) return true;
  if (item.isCurriculumStream) return true;
  if (url.includes('drive.google.com') && !url.includes('.pdf') && (item.duration || '').includes('min')) return true;
  return false;
}

function isPdfResource(item) {
  if (!item) return false;
  if (item.type === 'pdf' || item.type === 'worksheet') return true;
  const url = (item.url || '').toLowerCase();
  if (url.includes('.pdf')) return true;
  const name = (item.fileName || '').toLowerCase();
  if (name.endsWith('.pdf')) return true;
  return false;
}

export default function ResourcesPanel({ profile, themeMode = 'dark', onNavigate }) {
  const isLight = themeMode === 'light';
  const liveData = useTh3oryLive();
  const rawContent = liveData?.content || [];

  // Filter and search states
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all'); // 'all' | 'video' | 'pdf'
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState(() => getBookmarks(profile?.email));

  // Modal states
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lockedModalItem, setLockedModalItem] = useState(null);

  // Sync bookmarks from storage/events
  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(getBookmarks(profile?.email));
    };
    window.addEventListener('th3ory_student_change', handleUpdate);
    return () => window.removeEventListener('th3ory_student_change', handleUpdate);
  }, [profile?.email]);

  const handleToggleBookmark = (id, e) => {
    e?.stopPropagation();
    toggleBookmark(id, profile?.email);
    setBookmarks(getBookmarks(profile?.email));
  };

  // Student plan access rank (0: free, 1: enrolled, 2: vip/enterprise)
  const studentRank = getStudentPlanRank(profile?.plan);

  // Combine admin content with curriculum video streams
  const allResources = useMemo(() => {
    const items = (rawContent || []).filter(item => item.published !== false);

    // Track existing lesson video IDs to prevent duplicates
    const existingKeys = new Set(
      items.filter(i => isVideoResource(i) && i.lessonId).map(i => i.lessonId)
    );

    const curriculumVideos = [];
    (liveData?.levels || []).forEach(lvl => {
      (lvl.lessons || []).forEach(ls => {
        if (!existingKeys.has(ls.id)) {
          curriculumVideos.push({
            id: `curriculum_vid_${ls.id}`,
            title: ls.title,
            type: 'video',
            description: `${lvl.name} Masterclass · Lesson Stream (${lvl.days})`,
            url: ls.videoUrl || ls.url || 'https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview',
            duration: ls.duration || '20 mins',
            access: ls.preview ? 'free' : 'enrolled',
            levelId: lvl.id,
            lessonId: ls.id,
            published: true,
            isCurriculumStream: true,
            tags: [lvl.name, 'Masterclass', 'HD Stream']
          });
        }
      });
    });

    return [...items, ...curriculumVideos];
  }, [rawContent, liveData?.levels]);

  // Access check for individual resource
  const isAccessible = (item) => {
    const access = (item.access || item.accessLevel || 'enrolled').toLowerCase();
    if (access === 'free') return true;
    if (access === 'enrolled' && studentRank >= 1) return true;
    if (access === 'vip' && studentRank >= 2) return true;
    return studentRank >= 1;
  };

  // Metrics counts
  const totalCount = allResources.length;
  const videoCount = allResources.filter(isVideoResource).length;
  const pdfCount = allResources.filter(isPdfResource).length;
  const bookmarkedCount = bookmarks.filter(bId => allResources.some(p => p.id === bId)).length;
  const unlockedCount = allResources.filter(isAccessible).length;

  // Apply search, category, media type, and level filters
  const filteredResources = useMemo(() => {
    return allResources.filter(item => {
      // Level filter
      if (selectedLevel !== 'all' && item.levelId !== selectedLevel) {
        return false;
      }

      // Quick Media Type filter
      if (mediaTypeFilter === 'video' && !isVideoResource(item)) return false;
      if (mediaTypeFilter === 'pdf' && !isPdfResource(item)) return false;

      // Bookmark filter
      if (selectedCategory === 'bookmarked') {
        if (!bookmarks.includes(item.id)) return false;
      }

      // Category semantic filter
      if (selectedCategory === 'videos') {
        if (!isVideoResource(item)) return false;
      } else if (selectedCategory !== 'all' && selectedCategory !== 'bookmarked') {
        const text = `${item.title || ''} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
        if (selectedCategory === 'workbooks' && !text.includes('workbook') && !text.includes('exercise')) return false;
        if (selectedCategory === 'frameworks' && !text.includes('framework') && !text.includes('matrix')) return false;
        if (selectedCategory === 'cheatsheets' && !text.includes('cheatsheet') && !text.includes('script') && !text.includes('cues')) return false;
        if (selectedCategory === 'blueprints' && !text.includes('blueprint') && !text.includes('guide') && !text.includes('playbook')) return false;
      }

      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        const matchesLevel = LEVEL_LABELS[item.levelId]?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesLevel) {
          return false;
        }
      }

      return true;
    });
  }, [allResources, selectedLevel, selectedCategory, mediaTypeFilter, search, bookmarks]);

  // Open resource action handler
  const handleOpenResource = (item) => {
    if (!isAccessible(item)) {
      setLockedModalItem(item);
      return;
    }

    if (isVideoResource(item)) {
      setSelectedVideo(item);
    } else {
      setSelectedPdf(item);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ─── Hero Header & Overview ─── */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all ${
          isLight
            ? 'bg-gradient-to-br from-white via-purple-50/40 to-amber-50/30 border-purple-200/70 shadow-lg'
            : 'glass-card-luxury border-[#E9E4FF]/14 shadow-2xl'
        }`}
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#7C5CFC]/20 to-[#FFC857]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#E9E4FF] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>Masterclass Resource &amp; Media Vault</span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              Executive Videos, Workbooks &amp; Frameworks
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Stream encrypted high-definition masterclass videos in-app and read official psychological frameworks, tactical workbooks, executive scripts, and cheatsheets.
            </p>
          </div>

          {/* Metrics Badges */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 shrink-0">
            {/* Total Videos */}
            <div
              onClick={() => { setMediaTypeFilter('video'); setSelectedCategory('all'); }}
              className={`px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer hover:scale-105 ${
                mediaTypeFilter === 'video'
                  ? 'bg-purple-600/20 border-purple-500 shadow-md'
                  : isLight
                  ? 'bg-white border-purple-100 shadow-xs'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Play className="w-2.5 h-2.5 text-[#FFC857]" /> Video Streams
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-[#7C5CFC]">
                  {videoCount}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Videos</span>
              </div>
            </div>

            {/* Total PDFs */}
            <div
              onClick={() => { setMediaTypeFilter('pdf'); setSelectedCategory('all'); }}
              className={`px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer hover:scale-105 ${
                mediaTypeFilter === 'pdf'
                  ? 'bg-red-500/20 border-red-500 shadow-md'
                  : isLight
                  ? 'bg-white border-red-100 shadow-xs'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <FileText className="w-2.5 h-2.5 text-red-400" /> PDF Vault
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-red-400">
                  {pdfCount}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">PDFs</span>
              </div>
            </div>

            {/* Unlocked */}
            <div
              className={`px-3.5 py-2.5 rounded-2xl border ${
                isLight
                  ? 'bg-white border-amber-100 shadow-xs'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5 text-emerald-400" /> Unlocked
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-[#FFC857]">
                  {unlockedCount}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">Active</span>
              </div>
            </div>

            {/* Saved & Starred */}
            <div
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer hover:scale-105 ${
                selectedCategory === 'bookmarked'
                  ? 'bg-amber-400/20 border-amber-400 shadow-md'
                  : isLight
                  ? 'bg-white border-amber-100 shadow-xs'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Bookmark className="w-2.5 h-2.5 text-amber-400" /> Starred
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                  {bookmarkedCount}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Admin Sync Pulse Notice */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Live Synchronized:</span>
            <span>All masterclass video streams and workbooks are updated in real-time.</span>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline flex items-center gap-1.5">
            <Tv className="w-3 h-3 text-[#FFC857]" /> In-app encrypted 4K streaming player with theatre mode
          </span>
        </div>
      </div>

      {/* ─── Search & Filtering Controls ─── */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id === 'videos') setMediaTypeFilter('video');
                  else if (cat.id === 'all') setMediaTypeFilter('all');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-[#7C5CFC] text-white shadow-md shadow-purple-600/20'
                      : 'bg-[#7C5CFC] text-white shadow-lg shadow-purple-900/30'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#0B0F19] border border-[#E9E4FF]/10 text-slate-400 hover:text-white hover:border-[#E9E4FF]/25'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                {cat.id === 'videos' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-[#E9E4FF] font-mono font-bold">
                    {videoCount}
                  </span>
                )}
                {cat.id === 'bookmarked' && bookmarkedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                    {bookmarkedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Format Filter Buttons: All | Videos | PDFs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F19] border border-white/10 text-xs">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mediaTypeFilter === 'all'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Types ({totalCount})
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mediaTypeFilter === 'video'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3 h-3 text-[#FFC857] fill-[#FFC857]" />
              <span>Videos ({videoCount})</span>
            </button>
            <button
              onClick={() => setMediaTypeFilter('pdf')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mediaTypeFilter === 'pdf'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3 text-red-400" />
              <span>PDFs ({pdfCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Showing <strong className="text-white">{filteredResources.length}</strong> resources
          </div>
        </div>

        {/* Search Bar + Level Select + View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search masterclass videos, workbooks, frameworks, topics…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#7C5CFC]/40 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#0B0F19] border-[#E9E4FF]/12 text-white placeholder:text-slate-500'
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-hidden focus:ring-2 focus:ring-[#7C5CFC]/40 cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#0B0F19] border-[#E9E4FF]/12 text-slate-200'
              }`}
            >
              <option value="all">All Levels (L1 – L5)</option>
              <option value="l1">Level 1: Presence</option>
              <option value="l2">Level 2: Power</option>
              <option value="l3">Level 3: Warmth</option>
              <option value="l4">Level 4: Connection</option>
              <option value="l5">Level 5: Legacy</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div
            className={`flex items-center rounded-xl p-1 border shrink-0 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-[#E9E4FF]/12'
            }`}
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#7C5CFC] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#7C5CFC] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content Listing ─── */}
      {filteredResources.length === 0 ? (
        <div
          className={`text-center py-16 px-4 rounded-3xl border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-600'
              : 'glass-card-luxury border-[#E9E4FF]/10 text-slate-400'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-[#FFC857]" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            No Matching Resources Found
          </h3>
          <p className="text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {search || selectedLevel !== 'all' || selectedCategory !== 'all' || mediaTypeFilter !== 'all'
              ? 'Try resetting your search query or filters to discover available masterclass video streams and workbooks.'
              : 'No masterclass resources available. Check back soon!'}
          </p>
          {(search || selectedLevel !== 'all' || selectedCategory !== 'all' || mediaTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedLevel('all');
                setSelectedCategory('all');
                setMediaTypeFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6344E0] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ─── Grid View ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(item => {
            const isVideo = isVideoResource(item);
            const accessible = isAccessible(item);
            const isBookmarked = bookmarks.includes(item.id);
            const levelLabel = LEVEL_LABELS[item.levelId] || (item.levelId ? `Level: ${item.levelId.toUpperCase()}` : null);

            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-2xl border transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden ${
                  isLight
                    ? 'bg-white border-slate-200/80 hover:border-purple-300 hover:shadow-xl'
                    : 'glass-card-luxury border-[#E9E4FF]/12 hover:border-[#7C5CFC]/40 hover:shadow-2xl'
                }`}
              >
                {/* Visual Video Stage for Video Resources */}
                {isVideo ? (
                  <div
                    onClick={() => handleOpenResource(item)}
                    className="relative aspect-video w-full bg-gradient-to-b from-[#120B24] via-black to-[#07090E] border-b border-white/10 flex items-center justify-center cursor-pointer group/vid overflow-hidden"
                  >
                    {/* Atmospheric Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFC]/20 via-transparent to-[#FFC857]/15 opacity-40 group-hover/vid:opacity-100 transition-opacity duration-500" />

                    {/* Central Play Button */}
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover/vid:scale-110 group-hover/vid:bg-[#FFC857] group-hover/vid:border-[#FFC857] transition-all duration-300 z-10 shadow-2xl shadow-black/80">
                      {accessible ? (
                        <Play className="w-6 h-6 text-[#FFC857] fill-[#FFC857] group-hover/vid:text-slate-950 group-hover/vid:fill-slate-950 ml-1 transition-all duration-300" />
                      ) : (
                        <Lock className="w-5 h-5 text-amber-300" />
                      )}
                    </div>

                    {/* Top Right Bookmark Icon */}
                    <button
                      type="button"
                      onClick={e => handleToggleBookmark(item.id, e)}
                      className={`absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                          : 'bg-black/50 border-white/10 hover:bg-black/70 text-slate-300 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Video'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Top Left Video Badge */}
                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-purple-500/40 text-[10px] font-bold text-[#E9E4FF]">
                      <Video className="w-3 h-3 text-[#FFC857]" />
                      <span>Masterclass Stream</span>
                    </div>

                    {/* Bottom Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-200 font-mono">
                      <Clock className="w-2.5 h-2.5 text-[#FFC857]" />
                      <span>{item.duration || '20 mins'}</span>
                    </div>
                  </div>
                ) : null}

                {/* Card Content Details */}
                <div className="p-5 pb-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header for non-video items */}
                    {!isVideo && (
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Bookmark Button */}
                          <button
                            onClick={e => handleToggleBookmark(item.id, e)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isBookmarked
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                                : 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                            }`}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark PDF'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>

                          {/* Access Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              accessible
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {accessible ? (
                              <>
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Ready</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>{item.access?.toUpperCase() || 'VIP'}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <h3
                      onClick={() => handleOpenResource(item)}
                      className={`font-bold text-sm sm:text-base line-clamp-2 leading-snug cursor-pointer group-hover:text-[#7C5CFC] transition-colors ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Level & Meta Row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {levelLabel && (
                        <span className="text-[10px] font-bold text-[#7C5CFC] bg-[#7C5CFC]/10 px-2 py-0.5 rounded-md border border-[#7C5CFC]/20">
                          {levelLabel}
                        </span>
                      )}
                      {item.fileSize && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.fileSize}
                        </span>
                      )}
                      {!isVideo && item.duration && item.duration !== 'PDF Document' && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {item.duration}
                        </span>
                      )}
                      {isVideo && (
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          In-App Stream
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className={`text-xs mt-2.5 line-clamp-2 leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {item.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                            isLight
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div
                  className={`px-5 py-3.5 border-t flex items-center justify-between gap-2 ${
                    isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-black/20'
                  }`}
                >
                  {isVideo ? (
                    <button
                      onClick={() => handleOpenResource(item)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                        accessible
                          ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233c7] text-white shadow-purple-950/40'
                          : 'bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40'
                      }`}
                    >
                      {accessible ? (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#FFC857] fill-[#FFC857]" />
                          <span>Stream In-App</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Unlock VIP Video</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenResource(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black transition-all shadow-md shadow-red-950/30 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open in PDF Viewer</span>
                    </button>
                  )}

                  {/* Course Lesson Link */}
                  {item.lessonId && onNavigate && (
                    <button
                      onClick={() => onNavigate('course', { levelId: item.levelId, lessonId: item.lessonId })}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isLight
                          ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                          : 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-[#FFC857]'
                      }`}
                      title="Navigate to Lesson Workspace in Course"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* External fallback */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border transition-all ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        : 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Open Source URL in New Window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Compact List View ─── */
        <div
          className={`rounded-2xl border divide-y overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 divide-slate-100 shadow-sm'
              : 'glass-card-luxury border-[#E9E4FF]/12 divide-white/5'
          }`}
        >
          {filteredResources.map(item => {
            const isVideo = isVideoResource(item);
            const accessible = isAccessible(item);
            const isBookmarked = bookmarks.includes(item.id);
            const levelLabel = LEVEL_LABELS[item.levelId] || item.levelId;

            return (
              <div
                key={item.id}
                className={`p-4 flex items-center gap-4 transition-colors ${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                }`}
              >
                {/* Type Icon */}
                <div
                  onClick={() => handleOpenResource(item)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                    isVideo
                      ? 'bg-purple-500/15 border border-purple-500/30 text-[#FFC857]'
                      : 'bg-red-500/10 border border-red-500/25 text-red-500'
                  }`}
                >
                  {isVideo ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      onClick={() => handleOpenResource(item)}
                      className={`font-bold text-sm truncate cursor-pointer hover:text-[#7C5CFC] transition-colors ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {levelLabel && (
                      <span className="text-[10px] font-bold text-[#7C5CFC] bg-[#7C5CFC]/10 px-2 py-0.2 rounded border border-[#7C5CFC]/20">
                        {levelLabel}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isVideo
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'bg-red-500/15 text-red-300'
                      }`}
                    >
                      {isVideo ? 'Video' : 'PDF'}
                    </span>
                  </div>
                  {item.description && (
                    <p
                      className={`text-xs truncate max-w-xl mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                {item.duration && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FFC857]" /> {item.duration}
                  </span>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => handleToggleBookmark(item.id, e)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'border-white/10 hover:bg-white/10 text-slate-400'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Item'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleOpenResource(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isVideo
                        ? 'bg-[#7C5CFC] hover:bg-[#6344E0]'
                        : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {isVideo ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Stream Video</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">Open PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Universal In-App Encrypted Video Stream Modal ─── */}
      <StudentVideoModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        url={selectedVideo?.url}
        title={selectedVideo?.title}
        duration={selectedVideo?.duration}
        levelLabel={LEVEL_LABELS[selectedVideo?.levelId]}
        description={selectedVideo?.description}
        onNavigateToLesson={
          selectedVideo?.lessonId && onNavigate
            ? () => {
                const lId = selectedVideo.lessonId;
                const lvlId = selectedVideo.levelId;
                setSelectedVideo(null);
                onNavigate('course', { levelId: lvlId, lessonId: lId });
              }
            : undefined
        }
      />

      {/* ─── Universal PDF Viewer Modal Instance ─── */}
      <PdfViewerModal
        isOpen={Boolean(selectedPdf)}
        onClose={() => setSelectedPdf(null)}
        pdfUrl={selectedPdf?.url}
        title={selectedPdf?.title}
        description={selectedPdf?.description}
        levelId={selectedPdf?.levelId}
        fileSize={selectedPdf?.fileSize}
        duration={selectedPdf?.duration}
        tags={selectedPdf?.tags}
        allowDownload={true}
        themeMode={themeMode}
      />

      {/* ─── Locked VIP Stream Upgrade Prompt Modal ─── */}
      {lockedModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLockedModalItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#0D111C] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-heading">
                VIP Exclusive Masterclass Resource
              </h3>
              <p className="text-xs text-slate-300">
                <strong className="text-[#FFC857]">{lockedModalItem.title}</strong> is reserved for VIP &amp; Enterprise tier members. Upgrade your plan to stream executive masterclasses and download high-leverage frameworks.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setLockedModalItem(null);
                  if (onNavigate) onNavigate('shop');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#9277FF] hover:from-[#6c4ce0] hover:to-[#7C5CFC] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Upgrade to VIP Tier
              </button>
              <button
                onClick={() => setLockedModalItem(null)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
