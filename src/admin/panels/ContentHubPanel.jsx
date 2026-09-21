import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen, Video, FileText, BookOpen, MessageSquare,
  Sliders, HardDrive, Sparkles, Plus, ExternalLink,
  Layers, CheckCircle2, ChevronRight, Eye, Grid, List,
  Calendar, Users, ArrowUpRight, Filter
} from 'lucide-react';
import ContentPanel from './ContentPanel';
import BlogPanel from './BlogPanel';
import CommunityAdminPanel from './CommunityAdminPanel';
import CurriculumPanel from './CurriculumPanel';
import { parseGoogleDriveUrl } from '../../utils/gdriveHelper';

const SECTORS = [
  {
    id: 'videos',
    label: 'Course Videos',
    badgeLabel: 'Masterclasses',
    icon: Video,
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    description: 'Video lessons, Google Drive video streams, YouTube/Vimeo embeds, durations & access tiers.'
  },
  {
    id: 'resources',
    label: 'Resources & PDFs',
    badgeLabel: 'Workbooks',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    description: 'Student action sheets, PDF workbooks, frameworks, cheatsheets & Google Drive folder integration.'
  },
  {
    id: 'blogs',
    label: 'Blog Publications',
    badgeLabel: 'Editorial',
    icon: BookOpen,
    color: 'from-amber-500 to-yellow-600',
    border: 'border-amber-500/30',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    description: 'Full thought leadership articles, behavioral essays, markdown formatting & live blog pages.'
  },
  {
    id: 'community',
    label: 'Community Posts',
    badgeLabel: 'Forum & Wall',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-600',
    border: 'border-purple-500/30',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
    description: 'Student community broadcasts, video updates, discussion feeds & pinned masterclass threads.'
  },
  {
    id: 'curriculum',
    label: 'Curriculum Roadmap',
    badgeLabel: 'Architecture',
    icon: Sliders,
    color: 'from-rose-500 to-orange-600',
    border: 'border-rose-500/30',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    description: '5-Level curriculum structure, Day 1–30 learning roadmap, capstone challenges & module alignment.'
  }
];

export default function ContentHubPanel({
  data,
  save,
  reset,
  themeMode = 'dark',
  initialSector = 'videos',
  onNavigateSector
}) {
  const isDark = themeMode === 'dark';
  const [activeSector, setActiveSector] = useState(initialSector);

  // Sync if initialSector prop changes from sidebar navigation
  useEffect(() => {
    if (initialSector && initialSector !== activeSector) {
      setActiveSector(initialSector);
    }
  }, [initialSector]);

  const contentItems = data?.content || [];
  const levels = data?.levels || [];

  // Metrics across sectors
  const metrics = useMemo(() => {
    const videos = contentItems.filter(c => c.type === 'video' || (c.url || '').includes('youtube') || (c.url || '').includes('vimeo'));
    const resources = contentItems.filter(c => c.type === 'pdf' || c.type === 'worksheet' || c.type === 'resource' || (c.url || '').includes('.pdf'));
    const totalLessons = levels.reduce((acc, lvl) => acc + (lvl.lessons?.length || 0), 0);

    return {
      videosCount: videos.length,
      resourcesCount: resources.length,
      totalContent: contentItems.length,
      curriculumLevels: levels.length,
      totalLessons,
      gdriveUrl: data?.gdriveFolderUrl || 'https://drive.google.com/drive/folders/1TH3ORY_Masterclass_Course_Content_Master_Folder'
    };
  }, [contentItems, levels, data?.gdriveFolderUrl]);

  const activeSectorConfig = SECTORS.find(s => s.id === activeSector) || SECTORS[0];

  const handleSelectSector = (sectorId) => {
    setActiveSector(sectorId);
    if (onNavigateSector) {
      onNavigateSector(sectorId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Sector Overview & Master Hub Banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 border-slate-800' 
          : 'bg-gradient-to-r from-white via-slate-50 to-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>CONTENT & MEDIA PUBLISHING HUB</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Content Library Architecture
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Unified command center to update, organize, and publish course materials across dedicated sectors:
              video lessons, downloadable resources, editorial articles, and community broadcasts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="text-xl font-black text-blue-400">{metrics.videosCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Course Videos</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="text-xl font-black text-emerald-400">{metrics.resourcesCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Resources & PDFs</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="text-xl font-black text-amber-400">{metrics.totalLessons}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Total Lessons</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="text-xl font-black text-purple-400">{metrics.curriculumLevels}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">5 Master Levels</div>
            </div>
          </div>
        </div>

        {/* Storage Health & Synchronization Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Master Cloud Storage Sync:</span>
            <strong className="text-slate-200 font-mono">th3orymasterclass@gmail.com</strong>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={metrics.gdriveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Google Drive Root Folder</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Category Tabs Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          const isActive = activeSector === sector.id;

          return (
            <button
              key={sector.id}
              onClick={() => handleSelectSector(sector.id)}
              className={`group text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? isDark
                    ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                  : isDark
                    ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              {isActive && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sector.color}`} />
              )}
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isActive ? sector.accentBg + ' border ' + sector.border : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? sector.accentText : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? sector.accentBg + ' ' + sector.accentText : 'bg-slate-800 text-slate-500'
                }`}>
                  {sector.badgeLabel}
                </span>
              </div>
              <p className={`text-xs font-bold truncate ${isActive ? (isDark ? 'text-white' : 'text-slate-950') : 'text-slate-400'}`}>
                {sector.label}
              </p>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {sector.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Sector Workspace Header */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeSectorConfig.color} text-white shadow-md`}>
            <activeSectorConfig.icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeSectorConfig.label} Studio
            </h2>
            <p className="text-xs text-slate-500">
              {activeSectorConfig.description}
            </p>
          </div>
        </div>

        {/* Quick jump between sectors */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Switch Sector:</span>
          {SECTORS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectSector(s.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSector === s.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Render Sector Workspace Panel */}
      <div className="transition-all duration-300">
        {activeSector === 'videos' && (
          <ContentPanel
            data={data}
            save={save}
            reset={reset}
            themeMode={themeMode}
            sectorMode="videos"
            initialFilterType="video"
          />
        )}

        {activeSector === 'resources' && (
          <ContentPanel
            data={data}
            save={save}
            reset={reset}
            themeMode={themeMode}
            sectorMode="resources"
            initialFilterType="pdf"
          />
        )}

        {activeSector === 'blogs' && (
          <BlogPanel themeMode={themeMode} />
        )}

        {activeSector === 'community' && (
          <CommunityAdminPanel themeMode={themeMode} />
        )}

        {activeSector === 'curriculum' && (
          <CurriculumPanel
            data={data}
            save={save}
            reset={reset}
            themeMode={themeMode}
          />
        )}
      </div>
    </div>
  );
}
