import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Search, Filter, Bookmark, Star, Download,
  Eye, ExternalLink, Sparkles, FolderOpen, Layers,
  CheckCircle2, Lock, Unlock, Grid, List, RefreshCw,
  BookOpen, Clock, Tag, ChevronRight, ShieldCheck, Zap
} from 'lucide-react';
import { useTh3oryLive } from '../../data/adminData';
import { getBookmarks, toggleBookmark } from '../studentData';
import PdfViewerModal from '../../components/PdfViewerModal';
import { parseGoogleDriveUrl } from '../../utils/gdriveHelper';

// Plan access hierarchy: vip > enrolled > free
function getStudentPlanRank(planStr = '') {
  const p = (planStr || '').toLowerCase();
  if (p.includes('vip') || p.includes('enterprise')) return 2;
  if (p.includes('free')) return 0;
  return 1; // default: enrolled
}

const CATEGORIES = [
  { id: 'all',         label: 'All Documents',    icon: FolderOpen },
  { id: 'workbooks',   label: 'Workbooks',        icon: BookOpen },
  { id: 'frameworks',  label: 'Frameworks',       icon: Layers },
  { id: 'cheatsheets', label: 'Cheatsheets',      icon: Zap },
  { id: 'blueprints',  label: 'Blueprints',       icon: ShieldCheck },
  { id: 'bookmarked',  label: 'Saved & Starred',  icon: Bookmark },
];

const LEVEL_LABELS = {
  l1: 'Level 1: Presence',
  l2: 'Level 2: Power',
  l3: 'Level 3: Warmth',
  l4: 'Level 4: Connection',
  l5: 'Level 5: Legacy'
};

export default function ResourcesPanel({ profile, themeMode = 'dark', onNavigate }) {
  const isLight = themeMode === 'light';
  const liveData = useTh3oryLive();
  const rawContent = liveData?.content || [];

  // Filter and search states
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState(() => getBookmarks(profile?.email));
  const [selectedPdf, setSelectedPdf] = useState(null);

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

  // Student plan access rank (0: free, 1: essential, 2: pro, 3: enterprise/vip)
  const studentRank = getStudentPlanRank(profile?.plan);

  // Filter content to only include PDF documents or worksheets
  const pdfResources = useMemo(() => {
    return rawContent.filter(item => {
      if (item.published === false) return false;
      const isPdfType = item.type === 'pdf' || item.type === 'worksheet';
      const isPdfUrl = (item.url || '').toLowerCase().includes('.pdf');
      const isDocumentName = (item.fileName || '').toLowerCase().endsWith('.pdf') || (item.title || '').toLowerCase().includes('pdf');
      return isPdfType || isPdfUrl || isDocumentName;
    });
  }, [rawContent]);

  // Apply search, category, and level filters
  const filteredResources = useMemo(() => {
    return pdfResources.filter(item => {
      // Level filter
      if (selectedLevel !== 'all' && item.levelId !== selectedLevel) {
        return false;
      }

      // Bookmark filter
      if (selectedCategory === 'bookmarked') {
        if (!bookmarks.includes(item.id)) return false;
      }

      // Category semantic filter
      if (selectedCategory !== 'all' && selectedCategory !== 'bookmarked') {
        const text = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
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
  }, [pdfResources, selectedLevel, selectedCategory, search, bookmarks]);

  // Access check for individual document
  const isAccessible = (item) => {
    const access = item.access || item.accessLevel || 'enrolled';
    if (access === 'free') return true;
    if (access === 'enrolled' && studentRank >= 1) return true;
    if (access === 'vip' && studentRank >= 3) return true;
    // Default enrolled access
    return studentRank >= 1;
  };

  const totalCount = pdfResources.length;
  const bookmarkedCount = bookmarks.filter(bId => pdfResources.some(p => p.id === bId)).length;
  const unlockedCount = pdfResources.filter(isAccessible).length;

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>Executive Resource Vault</span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}
            >
              Masterclass Workbooks &amp; PDF Library
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Access official mentalism frameworks, tactical workbooks, executive scripts, and printable cheatsheets uploaded directly by Mentalist Sravan and the admin team.
            </p>
          </div>

          {/* Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div
              className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                isLight
                  ? 'bg-white border-purple-100 shadow-sm'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Documents
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-[#7C5CFC]">
                  {totalCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">PDFs</span>
              </div>
            </div>

            <div
              className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                isLight
                  ? 'bg-white border-amber-100 shadow-sm'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Unlocked For You
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-[#FFC857]">
                  {unlockedCount}
                </span>
                <span className="text-xs font-semibold text-emerald-400">Active</span>
              </div>
            </div>

            <div
              className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                isLight
                  ? 'bg-white border-amber-100 shadow-sm'
                  : 'bg-[#0B0F19]/80 border-[#E9E4FF]/12'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Saved &amp; Starred
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {bookmarkedCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Admin Sync Pulse Notice */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Live Synchronized:</span>
            <span>All uploads from the Admin Content Portal reflect here in real-time.</span>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Interactive in-app viewer with zoom, rotation &amp; night reading mode
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
                onClick={() => setSelectedCategory(cat.id)}
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
                {cat.id === 'bookmarked' && bookmarkedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                    {bookmarkedCount}
                  </span>
                )}
              </button>
            );
          })}
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
              placeholder="Search workbooks, cheatsheets, frameworks, tags…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 ${
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
              className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 cursor-pointer ${
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
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            No PDF Resources Found
          </h3>
          <p className="text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {search || selectedLevel !== 'all' || selectedCategory !== 'all'
              ? 'Try resetting your search query or filters to discover other available workbooks and frameworks.'
              : 'Admin has not published any PDF documents yet. Check back soon!'}
          </p>
          {(search || selectedLevel !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedLevel('all');
                setSelectedCategory('all');
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
            const accessible = isAccessible(item);
            const isBookmarked = bookmarks.includes(item.id);
            const levelLabel = LEVEL_LABELS[item.levelId] || (item.levelId ? `Level: ${item.levelId.toUpperCase()}` : null);

            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-2xl border transition-all duration-300 hover:scale-[1.01] group ${
                  isLight
                    ? 'bg-white border-slate-200/80 hover:border-purple-300 hover:shadow-xl'
                    : 'glass-card-luxury border-[#E9E4FF]/12 hover:border-[#7C5CFC]/40 hover:shadow-2xl'
                }`}
              >
                {/* Card Header & Badges */}
                <div className="p-5 pb-3 flex-1 flex flex-col justify-between">
                  <div>
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

                    {/* Title */}
                    <h3
                      className={`font-bold text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#7C5CFC] transition-colors ${
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
                      {item.duration && item.duration !== 'PDF Document' && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {item.duration}
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
                  <button
                    onClick={() => setSelectedPdf(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6344E0] hover:to-[#5233c7] text-white text-xs font-black transition-all shadow-md shadow-purple-900/20 active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open in PDF Viewer</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border transition-all ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        : 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Open In New Window"
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
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`font-bold text-sm truncate ${
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

                {item.fileSize && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {item.fileSize}
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
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark PDF'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setSelectedPdf(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6344E0] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Open in Viewer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
