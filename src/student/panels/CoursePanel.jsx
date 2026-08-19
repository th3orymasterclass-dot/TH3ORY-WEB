import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, Lock, ChevronDown, ChevronUp,
  BookOpen, Clock, FileText, Bookmark, BookmarkCheck,
  X, ExternalLink, Download, NotebookPen, HardDrive
} from 'lucide-react';
import { getLevels, getContent, useTh3oryLive } from '../../data/adminData';
import { getProgress, markLesson, getNotes, saveNote, getBookmarks, toggleBookmark } from '../studentData';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

import {
  saveStudentProgressToSupabase,
  fetchStudentProgressFromSupabase,
  fetchStudentDataFromSupabase,
  subscribeToStudentProgress
} from '../../services/supabaseService';
import DayTasksTracker from '../components/DayTasksTracker';

// Plan access hierarchy: vip > enrolled > free
const PLAN_RANK = { free: 0, enrolled: 1, vip: 2 };
function getStudentPlanRank(planStr = '') {
  const p = (planStr || '').toLowerCase();
  if (p.includes('vip') || p.includes('enterprise')) return 2;
  if (p.includes('free')) return 0;
  return 1; // default: enrolled
}

const LEVEL_ACCENT = [
  { border:'border-amber-500/40', bg:'bg-amber-500/10', text:'text-amber-400', ring:'ring-amber-500/30' },
  { border:'border-purple-500/40', bg:'bg-purple-500/10', text:'text-purple-400', ring:'ring-purple-500/30' },
  { border:'border-rose-500/40', bg:'bg-rose-500/10', text:'text-rose-400', ring:'ring-rose-500/30' },
  { border:'border-sky-500/40', bg:'bg-sky-500/10', text:'text-sky-400', ring:'ring-sky-500/30' },
  { border:'border-yellow-400/40', bg:'bg-yellow-400/10', text:'text-yellow-300', ring:'ring-yellow-400/30' },
];

function VideoModal({ url, title, onClose }) {
  const embedUrl = getEmbeddableMediaUrl(url);
  const gdrive = parseGoogleDriveUrl(url);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 selection:bg-none select-none" onClick={onClose} onContextMenu={e => e.preventDefault()}>
      <div className="w-full max-w-5xl flex flex-col gap-2.5 max-h-[96vh]" onClick={e => e.stopPropagation()}>
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="text-white/90 font-medium text-xs sm:text-base truncate tracking-tight">{title}</h3>
            {gdrive.isGDrive && (
              <span className="text-[10px] text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shrink-0">
                <HardDrive className="w-2.5 h-2.5" /> GDrive Protected
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-2 shrink-0"
            title="Close Stream"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Video Container */}
        <div className="w-full relative min-h-[260px] sm:min-h-0 sm:aspect-video h-[45vh] max-h-[420px] sm:h-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/20 selection:bg-none select-none group" onContextMenu={e => e.preventDefault()}>
          {/* Desktop Top-Right Shield Overlay: Prevents pop-out on desktop without obscuring mobile touch controls */}
          <div
            className="hidden sm:block absolute top-0 right-0 w-28 h-16 z-30 bg-transparent cursor-default pointer-events-auto"
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            onContextMenu={e => e.preventDefault()}
            title="External tab exit disabled for security"
          />

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 pointer-events-auto"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Play className="w-10 h-10 opacity-20"/>
              <p className="text-sm font-light text-slate-400">No stream URL configured for this lesson yet.</p>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 px-1 pt-0.5 flex-wrap gap-1">
          <span className="flex items-center gap-1.5 text-slate-400 font-light">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            In-App Encrypted Stream
          </span>
          <span className="text-amber-400/80 font-light text-[10px]">
            📱 Rotate phone to landscape for full controls
          </span>
          <span className="text-slate-500 font-light">
            🔒 Protected View
          </span>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ item, onStreamResource, isLight }) {
  const typeColors = { video:'text-blue-500', pdf:'text-red-500', worksheet:'text-green-500', quiz:'text-purple-500', audio:'text-pink-500', resource:'text-amber-500', image:'text-cyan-500', archive:'text-slate-500' };
  const gdrive = parseGoogleDriveUrl(item.url);
  const accessKey = item.access || item.accessLevel || 'enrolled';
  const accessBadges = {
    free: { label: 'Free Preview', color: 'bg-green-500/15 text-green-700 border-green-500/30' },
    enrolled: { label: 'Enrolled Only', color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
    vip: { label: 'VIP Only', color: 'bg-purple-500/15 text-purple-700 border-purple-500/30' },
  };
  const badge = accessBadges[accessKey] || accessBadges.enrolled;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group select-none ${
      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950'
    }`}>
      <FileText className={`w-4 h-4 shrink-0 ${typeColors[item.type] || 'text-slate-400'}`}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color} shrink-0`}>
            {badge.label}
          </span>
          {gdrive.isGDrive && (
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-600 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
              <HardDrive className="w-2.5 h-2.5" /> GDrive Stream
            </span>
          )}
        </div>
        {item.duration && <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{item.duration}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStreamResource(item)}
          className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
        >
          <Play className="w-3.5 h-3.5"/> Stream In-App
        </button>
      </div>
    </div>
  );
}

export default function CoursePanel({ profile, initialLevelId, initialLessonId, themeMode = 'dark' }) {
  const isLight = themeMode === 'light';
  const liveData = useTh3oryLive();
  const levels  = liveData.levels;
  const content = liveData.content;

  const [progress, setProgress]       = useState(getProgress());
  const [bookmarks, setBookmarks]     = useState(getBookmarks());
  const [notes, setNotes]             = useState(getNotes());
  const [activeLevelId, setActiveLevelId] = useState(initialLevelId || levels[0]?.id || 'l1');
  const [activeLesson, setActive]     = useState(null);
  const [videoModal, setVideoModal]   = useState(null);
  const [noteText, setNoteText]       = useState('');
  const [showNote, setShowNote]       = useState(false);

  const studentPlanRank = getStudentPlanRank(profile?.plan);

  useEffect(() => {
    const email = profile?.email;
    const h = () => {
      setProgress(getProgress(email));
      setBookmarks(getBookmarks(email));
      setNotes(getNotes(email));
    };
    window.addEventListener('th3ory_student_change', h);

    const refreshFromSupabase = () => {
      if (email) {
        fetchStudentDataFromSupabase(email).then(data => {
          if (data) {
            if (data.progress) setProgress(data.progress);
            if (data.notes) setNotes(data.notes);
            if (data.bookmarks) setBookmarks(data.bookmarks);
          }
        });
      }
    };

    // Auto-refresh when device window gains focus or tab becomes visible
    window.addEventListener('focus', refreshFromSupabase);
    document.addEventListener('visibilitychange', refreshFromSupabase);

    // Initial fetch from Supabase
    refreshFromSupabase();

    // Subscribe to real-time updates for progress, notes & bookmarks across devices
    const unsub = subscribeToStudentProgress(email, (data) => {
      if (data) {
        if (data.progress) setProgress(data.progress);
        if (data.notes) setNotes(data.notes);
        if (data.bookmarks) setBookmarks(data.bookmarks);
      }
    });

    return () => {
      window.removeEventListener('th3ory_student_change', h);
      window.removeEventListener('focus', refreshFromSupabase);
      document.removeEventListener('visibilitychange', refreshFromSupabase);
      unsub();
    };
  }, [profile?.email]);

  useEffect(() => {
    if (initialLessonId) {
      for (const lvl of levels) {
        const ls = lvl.lessons.find(l => l.id === initialLessonId);
        if (ls) {
          setActiveLevelId(lvl.id);
          setActive({ level: lvl, lesson: ls });
          break;
        }
      }
    }
  }, [initialLessonId, levels]);

  useEffect(() => {
    if (activeLesson) setNoteText(notes[activeLesson.lesson.id] || '');
  }, [activeLesson?.lesson?.id, notes]);

  const handleToggleDone = (lessonId) => {
    const isDone = Boolean(progress[lessonId]?.done || progress[lessonId] === true);
    const done = !isDone;
    markLesson(lessonId, done, profile?.email);
    setProgress(getProgress(profile?.email));
  };

  const handleBookmark = (lessonId) => {
    toggleBookmark(lessonId, profile?.email);
    setBookmarks(getBookmarks(profile?.email));
  };

  const handleSaveNote = () => {
    if (activeLesson) {
      saveNote(activeLesson.lesson.id, noteText, profile?.email);
      setNotes(getNotes(profile?.email));
    }
  };

  const canAccessItem = (item) => {
    const accessKey = item.access || item.accessLevel || 'enrolled';
    const itemRank = PLAN_RANK[accessKey] ?? 1;
    return studentPlanRank >= itemRank;
  };

  const getLessonContent = (lessonId) =>
    content.filter(c => c.lessonId === lessonId && c.published !== false && canAccessItem(c));

  const getLockedContent = (lessonId) =>
    content.filter(c => c.lessonId === lessonId && c.published !== false && !canAccessItem(c));

  const getVideoForLesson = (lessonId) => {
    // 1) Search in published content items created in Content Library
    const c = content.find(c => c.lessonId === lessonId && c.type === 'video' && c.published !== false);
    if (c) {
      if (!canAccessItem(c)) return '__LOCKED__';
      return c?.url || null;
    }

    // 2) Fallback to videoUrl / url on the active lesson object from Curriculum
    const lessonObj = activeLesson?.lesson;
    if (lessonObj && (lessonObj.videoUrl || lessonObj.url)) {
      const u = lessonObj.videoUrl || lessonObj.url;
      if (!lessonObj.preview && studentPlanRank < 1) return '__LOCKED__';
      return u;
    }

    // 3) Default fallback stream so no lesson is ever without a video
    return 'https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview';
  };

  const totalLessons = levels.reduce((a, l) => a + l.lessons.length, 0);
  const completedCount = Object.keys(progress).length;
  const overallPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentLevelObj = levels.find(l => l.id === activeLevelId) || levels[0];
  const activeLevelIdx = levels.findIndex(l => l.id === (currentLevelObj?.id || activeLevelId));

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Header & Course Overall Progress */}
      <div className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <div>
          <h2 className={`font-black text-xl tracking-tight font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>My Course Workspaces</h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Select a level tab and choose any day module to begin your training</p>
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Overall Progress</span>
            <span className="text-amber-500 font-extrabold">{completedCount}/{totalLessons} ({overallPct}%)</span>
          </div>
          <div className={`h-2 rounded-full border overflow-hidden ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dedicated In-Window Level Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin border-b border-slate-800/80">
        {levels.map((lvl, li) => {
          const lc = LEVEL_ACCENT[li % LEVEL_ACCENT.length];
          const isSelected = lvl.id === (currentLevelObj?.id || activeLevelId);
          const doneInLevel = lvl.lessons.filter(ls => progress[ls.id]).length;

          return (
            <button
              key={lvl.id}
              onClick={() => setActiveLevelId(lvl.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 select-none ${
                isSelected
                  ? `${lc.bg} ${lc.border} ${lc.text} shadow-lg shadow-black/40 ring-1 ${lc.ring}`
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {lvl.levelNumber || `L${li + 1}`}
              </span>
              <span className="truncate max-w-[160px] sm:max-w-[200px]">{lvl.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${isSelected ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                {doneInLevel}/{lvl.lessons.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Body: Compact Day Navigation Column + Dedicated Large Lesson Area */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Compact Day Navigation Column */}
        {currentLevelObj && (
          <div className={`w-full lg:w-52 shrink-0 rounded-2xl p-3 flex flex-col gap-2 max-h-[35vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto ${
            isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-900/70 border border-slate-800'
          }`}>
            <div className={`px-2 py-1 flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
              <span className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Day Modules</span>
              <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{currentLevelObj.lessons.length} Modules</span>
            </div>

            <div className="space-y-1 mt-1">
              {currentLevelObj.lessons.map((ls, lsi) => {
                const done = !!progress[ls.id];
                const isActive = activeLesson?.lesson?.id === ls.id;
                const isBookmarked = bookmarks.includes(ls.id);
                const dayLabel = `Day ${String(lsi + 1).padStart(2, '0')}`;

                return (
                  <button
                    key={ls.id}
                    onClick={() => setActive({ level: currentLevelObj, lesson: ls })}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs font-semibold select-none group ${
                      isActive
                        ? isLight
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-900 font-bold shadow-sm'
                          : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md'
                        : done
                        ? isLight
                          ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-950/40 border border-slate-800/40 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                        : isLight
                        ? 'bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-200 font-bold'
                        : 'bg-slate-950/70 border border-slate-800/70 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${isActive ? 'border-amber-500' : isLight ? 'border-slate-400' : 'border-slate-700'}`} />
                      )}
                      <span className="truncate">{dayLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ls.preview && (
                        <span className="text-[9px] bg-green-500/15 text-green-600 px-1 py-0.2 rounded font-bold">FREE</span>
                      )}
                      {isBookmarked && (
                        <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Dedicated Large Lesson Workspace */}
        <div className="flex-1 min-w-0">
          {!activeLesson ? (
            <div className={`border rounded-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[360px] h-full ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500 shadow-xl shadow-amber-950/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className={`font-black text-xl mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Select a Day module to begin</h3>
              <p className={`text-sm max-w-md ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Choose any day module from the list on the left to stream lesson videos, download resources, and take personal notes.
              </p>
            </div>
          ) : (
            <div className="space-y-5" key={activeLesson.lesson.id}>
              {/* Lesson Header */}
              <div className={`border rounded-2xl p-5 sm:p-6 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-500 text-xs font-extrabold uppercase tracking-wider mb-1">
                      {activeLesson.level.levelNumber}: {activeLesson.level.name}
                    </p>
                    <h3 className={`font-black text-xl leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeLesson.lesson.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-sm flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {activeLesson.lesson.duration}
                      </span>
                      {activeLesson.lesson.preview && (
                        <span className="text-green-600 text-xs bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                          Free Preview
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <button
                      onClick={() => handleBookmark(activeLesson.lesson.id)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        bookmarks.includes(activeLesson.lesson.id)
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 font-bold'
                          : isLight ? 'border-slate-300 text-slate-600 hover:text-amber-600' : 'border-slate-700 text-slate-500 hover:text-amber-400'
                      }`}
                    >
                      {bookmarks.includes(activeLesson.lesson.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleDone(activeLesson.lesson.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                        progress[activeLesson.lesson.id]
                          ? 'bg-green-500/20 border-green-500/40 text-green-600 font-bold'
                          : isLight ? 'border-slate-300 text-slate-700 hover:border-green-500/40 hover:text-green-600' : 'border-slate-700 text-slate-400 hover:border-green-500/40 hover:text-green-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {progress[activeLesson.lesson.id] ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>

                {/* Video Trigger Button */}
                {(() => {
                  const videoUrl = getVideoForLesson(activeLesson.lesson.id);
                  if (videoUrl === '__LOCKED__') {
                    return (
                      <div className="w-full aspect-video max-h-56 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center border border-purple-500/20 relative overflow-hidden select-none">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-2.5">
                          <Lock className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-white/90 font-medium text-xs sm:text-sm">VIP Exclusive Content</p>
                        <p className="text-slate-500 text-xs mt-0.5">Upgrade your plan to unlock this lesson</p>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => setVideoModal({ url: videoUrl, title: activeLesson.lesson.title })}
                      className="w-full aspect-video max-h-60 bg-gradient-to-b from-slate-950 to-[#0A0D14] rounded-2xl flex flex-col items-center justify-center border border-white/10 hover:border-amber-500/30 group transition-all duration-300 relative overflow-hidden shadow-lg shadow-black/40"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/15 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300 mb-3 z-10 shadow-xl">
                        <Play className="w-6 h-6 text-amber-400 fill-amber-400 group-hover:text-black group-hover:fill-black ml-0.5 transition-all duration-300" />
                      </div>
                      <p className="text-white/90 font-medium text-sm z-10 group-hover:text-white transition-colors">
                        Stream Lesson Video
                      </p>
                      <span className="text-slate-400 text-xs mt-1 z-10 font-light flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {activeLesson.lesson.duration}
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Resources for this lesson */}
              {getLessonContent(activeLesson.lesson.id).length > 0 && (
                <div className={`border rounded-2xl p-5 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <h4 className={`font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <FileText className="w-4 h-4 text-amber-500" /> Lesson Resources &amp; Downloads
                  </h4>
                  <div className="space-y-2">
                    {getLessonContent(activeLesson.lesson.id).map(item => (
                      <ResourceCard
                        key={item.id}
                        item={item}
                        isLight={isLight}
                        onStreamResource={res => setVideoModal({ url: res.url, title: res.title })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked resources (upgrade prompt) */}
              {getLockedContent(activeLesson.lesson.id).length > 0 && (
                <div className={`border border-purple-500/30 rounded-2xl p-5 ${
                  isLight ? 'bg-purple-50/50' : 'bg-slate-900'
                }`}>
                  <h4 className="text-purple-600 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Locked Resources — Upgrade to Unlock
                  </h4>
                  <div className="space-y-2">
                    {getLockedContent(activeLesson.lesson.id).map(item => {
                      const accessKey = item.access || item.accessLevel || 'enrolled';
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-3 bg-purple-950/20 rounded-xl border border-purple-500/20 select-none opacity-70"
                        >
                          <Lock className="w-4 h-4 shrink-0 text-purple-500" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>{item.title}</p>
                            <p className="text-purple-600 text-xs font-bold mt-0.5 capitalize">
                              {accessKey === 'vip' ? 'VIP Only' : 'Enrolled Only'}
                            </p>
                          </div>
                          <span className="text-[10px] bg-purple-500/20 text-purple-600 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                            Locked
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive 30-Day Course Task Tracker for Active Day */}
              {(() => {
                const dayNum = parseInt((activeLesson.lesson.id || 'd1').replace('d', ''), 10) || 1;
                return (
                  <DayTasksTracker
                    dayNumber={dayNum}
                    profile={profile}
                    themeMode={themeMode}
                    onProgressUpdate={() => setProgress(getProgress(profile?.email))}
                  />
                );
              })()}

              {/* Notes */}
              <div className={`border rounded-2xl p-5 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <button
                  onClick={() => setShowNote(v => !v)}
                  className={`w-full flex items-center justify-between text-sm font-bold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <NotebookPen className="w-4 h-4 text-amber-500" /> My Personal Notes
                  </span>
                  {showNote ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {showNote && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={4}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add your personal notes for this lesson…"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 resize-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                          : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                      }`}
                    />
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 hover:bg-amber-500/30 text-sm font-bold transition-all"
                    >
                      Save Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {videoModal && <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)} />}
    </div>
  );
}
