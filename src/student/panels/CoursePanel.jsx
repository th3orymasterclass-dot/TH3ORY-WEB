import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, Lock, ChevronDown, ChevronUp,
  BookOpen, Clock, FileText, Bookmark, BookmarkCheck,
  X, ExternalLink, Download, NotebookPen, HardDrive, Eye
} from 'lucide-react';
import { getLevels, getContent, useTh3oryLive } from '../../data/adminData';
import { getProgress, markLesson, getNotes, saveNote, getBookmarks, toggleBookmark } from '../studentData';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';
import PdfViewerModal from '../../components/PdfViewerModal';

import {
  saveStudentProgressToSupabase,
  fetchStudentProgressFromSupabase,
  fetchStudentDataFromSupabase,
  subscribeToStudentProgress
} from '../../services/supabaseService';
import DayTasksTracker from '../components/DayTasksTracker';
import VSCodeModule from '../components/VSCodeModule';

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

import StudentVideoModal from '../components/StudentVideoModal';
const VideoModal = StudentVideoModal;

function ResourceCard({ item, onStreamResource, onOpenPdf, isLight }) {
  const typeColors = { video:'text-blue-500', pdf:'text-red-500', worksheet:'text-green-500', quiz:'text-purple-500', audio:'text-pink-500', resource:'text-amber-500', image:'text-cyan-500', archive:'text-slate-500' };
  const isPdf = item.type === 'pdf' || item.type === 'worksheet' || (item.url || '').toLowerCase().includes('.pdf');

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group select-none ${
      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950'
    }`}>
      <FileText className={`w-4 h-4 shrink-0 ${typeColors[item.type] || 'text-slate-400'}`}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</p>
        </div>
        {item.duration && <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{item.duration}</p>}
      </div>
      <div className="flex items-center gap-2">
        {isPdf ? (
          <button
            type="button"
            onClick={() => onOpenPdf ? onOpenPdf(item) : onStreamResource(item)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 font-bold bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300"/> Read PDF
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStreamResource(item)}
            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5"/> Stream In-App
          </button>
        )}
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
  const [pdfModal, setPdfModal]       = useState(null);
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
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 ${
        isLight 
          ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/20 border-slate-200/80 shadow-md text-slate-900' 
          : 'glass-card-luxury border-white/10 shadow-2xl shadow-black/50 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FFC857] animate-pulse" />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-[#FFC857]'}`}>
                Curriculum Workspaces
              </span>
            </div>
            <h2 className={`font-black text-2xl tracking-tight font-serif ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
              My Course Workspaces
            </h2>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
              Select a tier level to navigate your 30-day executive modules, stream lessons, and complete hands-on labs
            </p>
          </div>
          <div className="w-full sm:w-72 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className={isLight ? 'text-slate-600' : 'text-[#8F94A3]'}>Overall Completion</span>
              <span className="text-[#FFC857] font-black font-sans">{completedCount}/{totalLessons} ({overallPct}%)</span>
            </div>
            <div className={`h-2.5 rounded-full border overflow-hidden ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/60 border-white/10'}`}>
              <div
                className="h-full bg-gradient-to-r from-[#FFC857] via-amber-400 to-[#FFAA00] rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated In-Window Level Tabs Navigation */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin border-b border-white/5">
        {levels.map((lvl, li) => {
          const lc = LEVEL_ACCENT[li % LEVEL_ACCENT.length];
          const isSelected = lvl.id === (currentLevelObj?.id || activeLevelId);
          const doneInLevel = lvl.lessons.filter(ls => progress[ls.id]).length;

          return (
            <button
              key={lvl.id}
              onClick={() => setActiveLevelId(lvl.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-extrabold transition-all duration-300 shrink-0 select-none cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'bg-amber-500/15 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                    : 'glass-card-gold border-[#FFC857] text-[#FFC857] shadow-xl shadow-[#FFC857]/10 ring-2 ring-[#FFC857]/30 scale-[1.02]'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'glass-card border-white/10 text-[#8F94A3] hover:text-[#FAFAF7] hover:border-white/20'
              }`}
            >
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${
                isSelected 
                  ? 'bg-[#FFC857] text-slate-950 font-black' 
                  : isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white/70'
              }`}>
                {lvl.levelNumber || `L${li + 1}`}
              </span>
              <span className="truncate max-w-[160px] sm:max-w-[200px]">{lvl.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                isSelected 
                  ? 'bg-white/10 border-white/20 text-[#FAFAF7]' 
                  : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-black/40 border-white/10 text-[#8F94A3]'
              }`}>
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
          <div className={`w-full lg:w-56 shrink-0 rounded-3xl p-4 flex flex-col gap-2 max-h-[35vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto border transition-all ${
            isLight 
              ? 'bg-white border-slate-200/80 shadow-md' 
              : 'glass-card-luxury border-white/10'
          }`}>
            <div className={`px-2 py-1 flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC857]" />
                <span className={`text-[11px] font-black uppercase tracking-widest ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                  Day Modules
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-[#8F94A3]'}`}>
                {currentLevelObj.lessons.length} Days
              </span>
            </div>

            <div className="space-y-1.5 mt-2">
              {currentLevelObj.lessons.map((ls, lsi) => {
                const done = !!progress[ls.id];
                const isActive = activeLesson?.lesson?.id === ls.id;
                const isBookmarked = bookmarks.includes(ls.id);
                const dayLabel = `Day ${String(lsi + 1).padStart(2, '0')}`;

                return (
                  <button
                    key={ls.id}
                    onClick={() => setActive({ level: currentLevelObj, lesson: ls })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-semibold select-none group cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-amber-500/20 border border-amber-500 text-amber-950 font-black shadow-sm'
                          : 'bg-gradient-to-r from-[#FFC857]/20 to-amber-500/10 border border-[#FFC857]/50 text-[#FFC857] font-black shadow-lg shadow-[#FFC857]/10'
                        : done
                        ? isLight
                          ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/[0.02] border border-white/5 text-[#8F94A3] hover:bg-white/[0.06] hover:text-[#FAFAF7]'
                        : isLight
                        ? 'bg-slate-100/70 border border-slate-200 text-slate-900 hover:bg-slate-200'
                        : 'bg-black/30 border border-white/5 text-[#C4C8D4] hover:bg-white/[0.05] hover:text-[#FAFAF7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors ${
                          isActive 
                            ? 'border-[#FFC857] bg-[#FFC857]/20' 
                            : isLight ? 'border-slate-400' : 'border-white/20 group-hover:border-white/40'
                        }`} />
                      )}
                      <span className="truncate">{dayLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isBookmarked && (
                        <Bookmark className="w-3.5 h-3.5 text-[#FFC857] fill-[#FFC857] shrink-0" />
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
            <div className={`border rounded-3xl flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[380px] h-full transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-md' : 'glass-card-luxury border-white/10'
            }`}>
              <div className="w-20 h-20 rounded-3xl bg-[#FFC857]/15 border border-[#FFC857]/30 flex items-center justify-center mb-5 text-[#FFC857] shadow-xl shadow-[#FFC857]/10">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className={`font-black text-2xl mb-2 font-serif tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                Select a Day module to begin
              </h3>
              <p className={`text-sm max-w-md leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                Choose any day module from the list on the left to stream masterclass video lessons, download proprietary resources, and access your interactive VS Code lab.
              </p>
            </div>
          ) : (
            <div className="space-y-6" key={activeLesson.lesson.id}>
              {/* Lesson Header */}
              <div className={`border rounded-3xl p-6 sm:p-7 transition-all ${
                isLight ? 'bg-white border-slate-200/80 shadow-md' : 'glass-card-luxury border-white/10'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FFC857]/20 text-[#FFC857] border border-[#FFC857]/30">
                        {activeLesson.level.levelNumber}
                      </span>
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-[#8F94A3]'}`}>
                        {activeLesson.level.name}
                      </span>
                    </div>
                    <h3 className={`font-black text-2xl sm:text-3xl leading-tight font-serif tracking-tight ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>
                      {activeLesson.lesson.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2.5">
                      <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-[#8F94A3]'}`}>
                        <Clock className="w-3.5 h-3.5 text-[#FFC857]" />
                        {activeLesson.lesson.duration}
                      </span>
                      <span className="text-xs text-white/20">•</span>
                      <span className={`text-xs font-semibold flex items-center gap-1.5 ${progress[activeLesson.lesson.id] ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {progress[activeLesson.lesson.id] ? 'Completed ✓' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
                    <button
                      onClick={() => handleBookmark(activeLesson.lesson.id)}
                      className={`p-3 rounded-xl border transition-all ${
                        bookmarks.includes(activeLesson.lesson.id)
                          ? 'bg-[#FFC857]/20 border-[#FFC857]/40 text-[#FFC857] font-bold shadow-md'
                          : isLight ? 'border-slate-300 text-slate-600 hover:text-amber-600' : 'border-white/10 text-[#8F94A3] hover:text-[#FFC857] hover:border-white/20'
                      }`}
                      title="Bookmark module"
                    >
                      {bookmarks.includes(activeLesson.lesson.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleDone(activeLesson.lesson.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                        progress[activeLesson.lesson.id]
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10'
                          : isLight ? 'border-slate-300 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-600' : 'border-white/10 text-[#C4C8D4] hover:border-emerald-500/40 hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {progress[activeLesson.lesson.id] ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>

                {/* Video Trigger Button */}
                {(() => {
                  const videoUrl = getVideoForLesson(activeLesson.lesson.id);
                  if (videoUrl === '__LOCKED__') {
                    return (
                      <div className="w-full aspect-video max-h-56 bg-black/80 rounded-2xl flex flex-col items-center justify-center border border-purple-500/30 relative overflow-hidden select-none shadow-xl">
                        <div className="w-14 h-14 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3">
                          <Lock className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-[#FAFAF7] font-black font-serif text-sm sm:text-base">VIP Exclusive Masterclass Stream</p>
                        <p className="text-[#8F94A3] text-xs mt-1">Upgrade your tier to unlock executive masterclass streaming</p>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => setVideoModal({ url: videoUrl, title: activeLesson.lesson.title })}
                      className="w-full aspect-video max-h-64 bg-gradient-to-b from-black/80 to-[#070A11] rounded-2xl flex flex-col items-center justify-center border border-white/10 hover:border-[#FFC857]/50 group transition-all duration-300 relative overflow-hidden shadow-2xl shadow-black/80 cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFC]/10 via-transparent to-[#FFC857]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFC857] group-hover:border-[#FFC857] transition-all duration-300 mb-3 z-10 shadow-2xl shadow-black/60">
                        <Play className="w-7 h-7 text-[#FFC857] fill-[#FFC857] group-hover:text-slate-950 group-hover:fill-slate-950 ml-1 transition-all duration-300" />
                      </div>
                      <p className="text-[#FAFAF7] font-black font-serif text-base z-10 group-hover:text-[#FFC857] transition-colors">
                        Launch Encrypted Masterclass Stream
                      </p>
                      <span className="text-[#8F94A3] text-xs mt-1 z-10 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FFC857]" /> {activeLesson.lesson.duration} · 4K Theatre Mode
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Resources for this lesson */}
              {getLessonContent(activeLesson.lesson.id).length > 0 && (
                <div className={`border rounded-3xl p-6 transition-all ${
                  isLight ? 'bg-white border-slate-200/80 shadow-md' : 'glass-card-luxury border-white/10'
                }`}>
                  <h4 className={`font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2.5 ${
                    isLight ? 'text-slate-900' : 'text-[#FAFAF7]'
                  }`}>
                    <FileText className="w-4 h-4 text-[#FFC857]" /> Lesson Resources &amp; Downloads
                  </h4>
                  <div className="space-y-2.5">
                    {getLessonContent(activeLesson.lesson.id).map(item => (
                      <ResourceCard
                        key={item.id}
                        item={item}
                        isLight={isLight}
                        onStreamResource={res => setVideoModal({ url: res.url, title: res.title })}
                        onOpenPdf={res => setPdfModal(res)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked resources (upgrade prompt) */}
              {getLockedContent(activeLesson.lesson.id).length > 0 && (
                <div className={`border border-purple-500/30 rounded-3xl p-6 ${
                  isLight ? 'bg-purple-50/60' : 'glass-card border-purple-500/30'
                }`}>
                  <h4 className="text-purple-400 font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Locked Resources — Upgrade to Unlock
                  </h4>
                  <div className="space-y-2.5">
                    {getLockedContent(activeLesson.lesson.id).map(item => {
                      const accessKey = item.access || item.accessLevel || 'enrolled';
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-3 bg-purple-950/20 rounded-xl border border-purple-500/20 select-none opacity-80"
                        >
                          <Lock className="w-4 h-4 shrink-0 text-purple-400" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-[#FAFAF7]'}`}>{item.title}</p>
                            <p className="text-purple-400 text-xs font-bold mt-0.5 capitalize">
                              {accessKey === 'vip' ? 'VIP Only' : 'Enrolled Only'}
                            </p>
                          </div>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold shrink-0">
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

              {/* Visual Studio Code Interactive Module Lab */}
              <VSCodeModule
                lessonId={activeLesson.lesson.id}
                lessonTitle={activeLesson.lesson.title}
                isLight={isLight}
              />

              {/* Notes */}
              <div className={`border rounded-3xl p-6 transition-all ${
                isLight ? 'bg-white border-slate-200/80 shadow-md' : 'glass-card-luxury border-white/10'
              }`}>
                <button
                  onClick={() => setShowNote(v => !v)}
                  className={`w-full flex items-center justify-between text-sm font-black tracking-wide ${
                    isLight ? 'text-slate-900' : 'text-[#FAFAF7]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <NotebookPen className="w-4 h-4 text-[#FFC857]" /> Executive Notes &amp; Reflections
                  </span>
                  {showNote ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {showNote && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      rows={4}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add your executive takeaways, tactical frameworks, and reflections for this module…"
                      className={`w-full border rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#FFC857]/50 resize-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                          : 'bg-black/60 border-white/10 text-white placeholder-[#555A66] focus:bg-black/80'
                      }`}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC857] to-[#FFAA00] text-slate-950 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FFC857]/20"
                      >
                        Save Notes ✍️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {videoModal && <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)} />}
      {pdfModal && (
        <PdfViewerModal
          isOpen={Boolean(pdfModal)}
          onClose={() => setPdfModal(null)}
          pdfUrl={pdfModal.url}
          title={pdfModal.title}
          description={pdfModal.description}
          levelId={pdfModal.levelId}
          fileSize={pdfModal.fileSize}
          themeMode={themeMode}
        />
      )}
    </div>
  );
}
