import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, Lock, ChevronDown, ChevronUp,
  BookOpen, Clock, FileText, Bookmark, BookmarkCheck,
  X, ExternalLink, Download, NotebookPen, HardDrive
} from 'lucide-react';
import { getLevels, getContent, useTh3oryLive } from '../../data/adminData';
import { getProgress, markLesson, getNotes, saveNote, getBookmarks, toggleBookmark } from '../studentData';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-none select-none" onClick={onClose} onContextMenu={e => e.preventDefault()}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-white font-bold text-sm truncate flex-1">{title}</h3>
            {gdrive.isGDrive && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shrink-0">
                <HardDrive className="w-3 h-3" /> Protected GDrive Stream
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-3"><X className="w-5 h-5"/></button>
        </div>
        <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative selection:bg-none select-none" onContextMenu={e => e.preventDefault()}>
          {/* Top-Right Shield Overlay: Prevents Google Drive pop-out & YouTube title pop-out clicks */}
          <div
            className="absolute top-0 right-0 w-28 h-16 z-30 bg-transparent cursor-default pointer-events-auto"
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
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Play className="w-12 h-12 opacity-30"/>
              <p className="text-sm">No video URL assigned to this lesson yet.</p>
              <p className="text-xs text-slate-600">Admin can assign video URLs in the Content Library.</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-400"><HardDrive className="w-3.5 h-3.5 text-blue-400"/> Protected In-App Player</span>
          <span className="text-amber-400/90 font-medium flex items-center gap-1 bg-amber-950/40 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px]">
            🔒 Stream Only • Pop-out &amp; External Tabs Disabled
          </span>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ item, onStreamResource }) {
  const typeColors = { video:'text-blue-400', pdf:'text-red-400', worksheet:'text-green-400', quiz:'text-purple-400', audio:'text-pink-400', resource:'text-amber-400', image:'text-cyan-400', archive:'text-slate-400' };
  const gdrive = parseGoogleDriveUrl(item.url);
  const accessKey = item.access || item.accessLevel || 'enrolled';
  const accessBadges = {
    free: { label: 'Free Preview', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    enrolled: { label: 'Enrolled Only', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    vip: { label: 'VIP Only', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  };
  const badge = accessBadges[accessKey] || accessBadges.enrolled;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/60 rounded-xl hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group select-none">
      <FileText className={`w-4 h-4 shrink-0 ${typeColors[item.type] || 'text-slate-400'}`}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-medium truncate">{item.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color} shrink-0`}>
            {badge.label}
          </span>
          {gdrive.isGDrive && (
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
              <HardDrive className="w-2.5 h-2.5" /> GDrive Stream
            </span>
          )}
        </div>
        {item.duration && <p className="text-slate-500 text-xs">{item.duration}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStreamResource(item)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
        >
          <Play className="w-3.5 h-3.5"/> Stream In-App
        </button>
      </div>
    </div>
  );
}

export default function CoursePanel({ profile, initialLevelId, initialLessonId }) {
  const liveData = useTh3oryLive();
  const levels  = liveData.levels;
  const content = liveData.content;

  const [progress, setProgress]       = useState(getProgress());
  const [bookmarks, setBookmarks]     = useState(getBookmarks());
  const [notes, setNotes]             = useState(getNotes());
  const [openLevels, setOpenLevels]   = useState({ [initialLevelId || 'l1']: true });
  const [activeLesson, setActive]     = useState(null);
  const [videoModal, setVideoModal]   = useState(null);
  const [noteText, setNoteText]       = useState('');
  const [showNote, setShowNote]       = useState(false);

  const studentPlanRank = getStudentPlanRank(profile?.plan);

  useEffect(() => {
    const h = () => { setProgress(getProgress()); setBookmarks(getBookmarks()); };
    window.addEventListener('th3ory_student_change', h);
    return () => window.removeEventListener('th3ory_student_change', h);
  }, []);

  useEffect(() => {
    if (initialLessonId) {
      for (const lvl of levels) {
        const ls = lvl.lessons.find(l => l.id === initialLessonId);
        if (ls) { setActive({ level: lvl, lesson: ls }); break; }
      }
    }
  }, [initialLessonId]);

  useEffect(() => {
    if (activeLesson) setNoteText(notes[activeLesson.lesson.id] || '');
  }, [activeLesson?.lesson?.id]);

  const handleToggleDone = (lessonId) => {
    const done = !progress[lessonId];
    markLesson(lessonId, done);
    setProgress(getProgress());
  };

  const handleBookmark = (lessonId) => {
    toggleBookmark(lessonId);
    setBookmarks(getBookmarks());
  };

  const handleSaveNote = () => {
    if (activeLesson) { saveNote(activeLesson.lesson.id, noteText); setNotes(getNotes()); }
  };

  const canAccessItem = (item) => {
    const accessKey = item.access || item.accessLevel || 'enrolled';
    const itemRank = PLAN_RANK[accessKey] ?? 1;
    return studentPlanRank >= itemRank;
  };

  const getLessonContent = (lessonId) =>
    content.filter(c => c.lessonId === lessonId && c.published && canAccessItem(c));

  const getLockedContent = (lessonId) =>
    content.filter(c => c.lessonId === lessonId && c.published && !canAccessItem(c));

  const getVideoForLesson = (lessonId) => {
    const c = content.find(c => c.lessonId === lessonId && c.type === 'video' && c.published);
    if (!c) return null;
    if (!canAccessItem(c)) return '__LOCKED__';
    return c?.url || null;
  };

  const totalLessons = levels.reduce((a, l) => a + l.lessons.length, 0);
  const completedCount = Object.keys(progress).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: level/lesson list */}
      <div className="w-full lg:w-80 shrink-0 space-y-3 overflow-y-auto pr-1 max-h-[40vh] lg:max-h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">My Course</h2>
          <span className="text-slate-500 text-xs">{completedCount}/{totalLessons} done</span>
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full mb-5">
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
            style={{width:`${totalLessons ? (completedCount/totalLessons)*100 : 0}%`}}/>
        </div>

        {levels.map((lvl, li) => {
          const lc = LEVEL_ACCENT[li % LEVEL_ACCENT.length];
          const done = lvl.lessons.filter(ls => progress[ls.id]).length;
          const isOpen = !!openLevels[lvl.id];
          const pct = Math.round((done / lvl.lessons.length) * 100);

          return (
            <div key={lvl.id} className={`border ${lc.border} rounded-2xl overflow-hidden`}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3.5 ${lc.bg} hover:brightness-110 transition-all`}
                onClick={() => setOpenLevels(prev => ({ ...prev, [lvl.id]: !prev[lvl.id] }))}
              >
                <div className="flex-1 text-left">
                  <p className={`text-xs font-black uppercase tracking-wider ${lc.text}`}>{lvl.levelNumber}</p>
                  <p className="text-white font-bold text-sm">{lvl.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-xs">{done}/{lvl.lessons.length}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500"/> : <ChevronDown className="w-4 h-4 text-slate-500"/>}
                </div>
              </button>
              <div className="h-0.5 bg-slate-900">
                <div className={`h-full ${lc.text.replace('text-','bg-').replace('-400','-500')} transition-all`} style={{width:`${pct}%`}}/>
              </div>

              {isOpen && (
                <div className="bg-slate-950/50 divide-y divide-slate-800/50">
                  {lvl.lessons.map((ls, lsi) => {
                    const done = !!progress[ls.id];
                    const isActive = activeLesson?.lesson?.id === ls.id;
                    const isBookmarked = bookmarks.includes(ls.id);
                    return (
                      <button key={ls.id}
                        onClick={() => setActive({ level: lvl, lesson: ls })}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group ${isActive ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'hover:bg-slate-900/60 border-l-2 border-transparent'}`}>
                        <div className="shrink-0 mt-0.5">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400"/>
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 ${lc.border.replace('/40','/60')}`}/>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate leading-snug ${isActive ? 'text-white' : done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                            {ls.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-600 text-xs flex items-center gap-0.5"><Clock className="w-2.5 h-2.5"/>{ls.duration}</span>
                            {ls.preview && <span className="text-[9px] bg-green-500/15 text-green-400 px-1.5 rounded">FREE</span>}
                            {isBookmarked && <Bookmark className="w-2.5 h-2.5 text-amber-400 fill-amber-400"/>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: lesson viewer */}
      <div className="flex-1 min-w-0">
        {!activeLesson ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <BookOpen className="w-16 h-16 text-slate-700 mb-4"/>
            <p className="text-white font-bold text-lg mb-2">Select a lesson to begin</p>
            <p className="text-slate-500 text-sm">Pick any lesson from the panel on the left</p>
          </div>
        ) : (
          <div className="space-y-5" key={activeLesson.lesson.id}>
            {/* Lesson header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                    {activeLesson.level.levelNumber}: {activeLesson.level.name}
                  </p>
                  <h3 className="text-white font-black text-xl leading-tight">{activeLesson.lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-slate-500 text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>{activeLesson.lesson.duration}</span>
                    {activeLesson.lesson.preview && <span className="text-green-400 text-xs bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">Free Preview</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleBookmark(activeLesson.lesson.id)}
                    className={`p-2 rounded-xl border transition-all ${bookmarks.includes(activeLesson.lesson.id) ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-500 hover:text-amber-400'}`}>
                    {bookmarks.includes(activeLesson.lesson.id) ? <BookmarkCheck className="w-4 h-4"/> : <Bookmark className="w-4 h-4"/>}
                  </button>
                  <button onClick={() => handleToggleDone(activeLesson.lesson.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${progress[activeLesson.lesson.id] ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-slate-700 text-slate-400 hover:border-green-500/40 hover:text-green-400'}`}>
                    <CheckCircle2 className="w-4 h-4"/>
                    {progress[activeLesson.lesson.id] ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>

              {/* Video button */}
              {(() => {
                const videoUrl = getVideoForLesson(activeLesson.lesson.id);
                if (videoUrl === '__LOCKED__') {
                  return (
                    <div className="w-full aspect-video max-h-56 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-purple-500/30 relative overflow-hidden select-none">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center mb-3">
                        <Lock className="w-7 h-7 text-purple-400"/>
                      </div>
                      <p className="text-white font-bold text-sm">VIP Only Video</p>
                      <p className="text-slate-500 text-xs mt-1">Upgrade your plan to unlock this lesson</p>
                      <span className="mt-3 text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-bold">Upgrade Required</span>
                    </div>
                  );
                }
                return (
                  <button
                    onClick={() => setVideoModal({ url: videoUrl, title: activeLesson.lesson.title })}
                    className="w-full aspect-video max-h-56 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 hover:border-amber-500/30 group transition-all relative overflow-hidden"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-all mb-3 z-10">
                      <Play className="w-7 h-7 text-amber-400 fill-amber-400 ml-1"/>
                    </div>
                    <p className="text-white font-bold text-sm z-10">Watch Lesson Video</p>
                    <p className="text-slate-500 text-xs mt-1 z-10">{activeLesson.lesson.duration}</p>
                  </button>
                );
              })()}
            </div>

            {/* Resources for this lesson */}
            {getLessonContent(activeLesson.lesson.id).length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400"/> Lesson Resources &amp; Downloads
                </h4>
                <div className="space-y-2">
                  {getLessonContent(activeLesson.lesson.id).map(item => (
                    <ResourceCard key={item.id} item={item} onStreamResource={res => setVideoModal({ url: res.url, title: res.title })}/>
                  ))}
                </div>
              </div>
            )}

            {/* Locked resources (upgrade prompt) */}
            {getLockedContent(activeLesson.lesson.id).length > 0 && (
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5">
                <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4"/> Locked Resources — Upgrade to Unlock
                </h4>
                <div className="space-y-2">
                  {getLockedContent(activeLesson.lesson.id).map(item => {
                    const accessKey = item.access || item.accessLevel || 'enrolled';
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-purple-950/20 rounded-xl border border-purple-500/20 select-none opacity-70">
                        <Lock className="w-4 h-4 shrink-0 text-purple-400"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-400 text-sm font-medium truncate">{item.title}</p>
                          <p className="text-purple-400 text-xs font-bold mt-0.5 capitalize">{accessKey === 'vip' ? 'VIP Only' : 'Enrolled Only'}</p>
                        </div>
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">Locked</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <button onClick={() => setShowNote(v => !v)} className="w-full flex items-center justify-between text-sm font-bold text-white">
                <span className="flex items-center gap-2"><NotebookPen className="w-4 h-4 text-amber-400"/> My Personal Notes</span>
                {showNote ? <ChevronUp className="w-4 h-4 text-slate-500"/> : <ChevronDown className="w-4 h-4 text-slate-500"/>}
              </button>
              {showNote && (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Add your personal notes for this lesson…"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none placeholder-slate-600"
                  />
                  <button onClick={handleSaveNote}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-sm font-bold transition-all">
                    Save Note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {videoModal && <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)}/>}
    </div>
  );
}
