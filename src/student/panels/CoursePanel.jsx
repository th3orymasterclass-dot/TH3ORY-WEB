import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, Lock, ChevronDown, ChevronUp,
  BookOpen, Clock, FileText, Bookmark, BookmarkCheck,
  X, ExternalLink, Download, NotebookPen
} from 'lucide-react';
import { getLevels, getContent } from '../../data/adminData';
import { getProgress, markLesson, getNotes, saveNote, getBookmarks, toggleBookmark } from '../studentData';

const LEVEL_ACCENT = [
  { border:'border-amber-500/40', bg:'bg-amber-500/10', text:'text-amber-400', ring:'ring-amber-500/30' },
  { border:'border-purple-500/40', bg:'bg-purple-500/10', text:'text-purple-400', ring:'ring-purple-500/30' },
  { border:'border-rose-500/40', bg:'bg-rose-500/10', text:'text-rose-400', ring:'ring-rose-500/30' },
  { border:'border-sky-500/40', bg:'bg-sky-500/10', text:'text-sky-400', ring:'ring-sky-500/30' },
  { border:'border-yellow-400/40', bg:'bg-yellow-400/10', text:'text-yellow-300', ring:'ring-yellow-400/30' },
];

function VideoModal({ url, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm truncate flex-1">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-3"><X className="w-5 h-5"/></button>
        </div>
        <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden">
          {url ? (
            <iframe src={url} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen"/>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Play className="w-12 h-12 opacity-30"/>
              <p className="text-sm">No video URL assigned to this lesson yet.</p>
              <p className="text-xs text-slate-600">Admin can assign video URLs in the Content Library.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ item }) {
  const typeColors = { video:'text-blue-400', pdf:'text-red-400', worksheet:'text-green-400', quiz:'text-purple-400', audio:'text-pink-400', resource:'text-amber-400', image:'text-cyan-400', archive:'text-slate-400' };
  return (
    <a href={item.url} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 px-4 py-3 bg-slate-950/60 rounded-xl hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group">
      <FileText className={`w-4 h-4 shrink-0 ${typeColors[item.type] || 'text-slate-400'}`}/>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        {item.duration && <p className="text-slate-500 text-xs">{item.duration}</p>}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0"/>
    </a>
  );
}

export default function CoursePanel({ initialLevelId, initialLessonId }) {
  const [progress, setProgress]       = useState(getProgress());
  const [bookmarks, setBookmarks]     = useState(getBookmarks());
  const [notes, setNotes]             = useState(getNotes());
  const [openLevels, setOpenLevels]   = useState({ [initialLevelId || 'l1']: true });
  const [activeLesson, setActive]     = useState(null);
  const [videoModal, setVideoModal]   = useState(null);
  const [noteText, setNoteText]       = useState('');
  const [showNote, setShowNote]       = useState(false);

  const levels  = getLevels();
  const content = getContent();

  useEffect(() => {
    const h = () => { setProgress(getProgress()); setBookmarks(getBookmarks()); };
    window.addEventListener('th3ory_student_change', h);
    return () => window.removeEventListener('th3ory_student_change', h);
  }, []);

  // Auto-open initial lesson
  useEffect(() => {
    if (initialLessonId) {
      for (const lvl of levels) {
        const ls = lvl.lessons.find(l => l.id === initialLessonId);
        if (ls) { setActive({ level: lvl, lesson: ls }); break; }
      }
    }
  }, [initialLessonId]);

  // When active lesson changes, load note
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

  // Get content items assigned to this lesson
  const getLessonContent = (lessonId) => content.filter(c => c.lessonId === lessonId && c.published);
  const getVideoForLesson = (lessonId) => {
    const c = content.find(c => c.lessonId === lessonId && c.type === 'video' && c.published);
    return c?.url || null;
  };

  const totalLessons = levels.reduce((a, l) => a + l.lessons.length, 0);
  const completedCount = Object.keys(progress).length;

  return (
    <div className="flex gap-6 h-full">
      {/* Left: level/lesson list */}
      <div className="w-80 shrink-0 space-y-3 overflow-y-auto pr-1" style={{maxHeight:'calc(100vh - 120px)'}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">My Course</h2>
          <span className="text-slate-500 text-xs">{completedCount}/{totalLessons} done</span>
        </div>

        {/* Progress bar */}
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
              {/* Progress bar for level */}
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
              <button
                onClick={() => setVideoModal({ url: getVideoForLesson(activeLesson.lesson.id), title: activeLesson.lesson.title })}
                className="w-full aspect-video max-h-56 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 hover:border-amber-500/30 group transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-all mb-3">
                  <Play className="w-7 h-7 text-amber-400 fill-amber-400 ml-1"/>
                </div>
                <p className="text-white font-bold text-sm">Watch Lesson</p>
                <p className="text-slate-500 text-xs mt-1">{activeLesson.lesson.duration}</p>
              </button>
            </div>

            {/* Resources for this lesson */}
            {getLessonContent(activeLesson.lesson.id).length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400"/> Lesson Resources
                </h4>
                <div className="space-y-2">
                  {getLessonContent(activeLesson.lesson.id).map(item => (
                    <ResourceCard key={item.id} item={item}/>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <button onClick={() => setShowNote(v => !v)} className="w-full flex items-center justify-between text-sm font-bold text-white">
                <span className="flex items-center gap-2"><NotebookPen className="w-4 h-4 text-amber-400"/> My Notes</span>
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

      {/* Video Modal */}
      {videoModal && <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)}/>}
    </div>
  );
}
