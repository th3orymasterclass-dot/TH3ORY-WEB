import React, { useEffect } from 'react';
import { Play, X, Clock, Shield, Sparkles, BookOpen, ExternalLink, RotateCcw } from 'lucide-react';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

export default function StudentVideoModal({
  isOpen = true,
  onClose,
  url,
  title,
  duration,
  levelLabel,
  description,
  onNavigateToLesson
}) {
  const embedUrl = getEmbeddableMediaUrl(url);

  // Keyboard shortcut listener: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 selection:bg-none select-none animate-in fade-in duration-200"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Video Player'}
    >
      <div
        className="w-full max-w-5xl flex flex-col gap-2.5 max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-1 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 text-[#FFC857] fill-[#FFC857]" />
            </div>

            <h3 className="text-white/95 font-bold text-xs sm:text-base truncate tracking-tight">
              {title || 'Masterclass Stream'}
            </h3>

            {levelLabel && (
              <span className="hidden sm:inline-flex text-[10px] font-bold text-[#7C5CFC] bg-[#7C5CFC]/15 px-2 py-0.5 rounded-md border border-[#7C5CFC]/30">
                {levelLabel}
              </span>
            )}

            {duration && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                <Clock className="w-2.5 h-2.5 text-[#FFC857]" /> {duration}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onNavigateToLesson && (
              <button
                type="button"
                onClick={onNavigateToLesson}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#E9E4FF] bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                title="Go to lesson workspace"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Open in Course</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-1 shrink-0 cursor-pointer"
              title="Close Stream (Esc)"
              aria-label="Close Stream"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div
          className="w-full relative min-h-[260px] sm:min-h-0 sm:aspect-video h-[45vh] max-h-[440px] sm:h-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/20 selection:bg-none select-none group"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Desktop Top-Right Shield Overlay: Prevents pop-out on desktop without obscuring mobile touch controls */}
          <div
            className="hidden sm:block absolute top-0 right-0 w-28 h-16 z-30 bg-transparent cursor-default pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => e.preventDefault()}
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
              <Play className="w-10 h-10 opacity-20" />
              <p className="text-sm font-light text-slate-400">No stream URL configured for this resource yet.</p>
            </div>
          )}
        </div>

        {/* Minimal Footer & Player Controls Info */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 px-1 pt-0.5 flex-wrap gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              In-App Encrypted Stream
            </span>

            {description && (
              <span className="text-slate-400 hidden lg:inline max-w-md truncate border-l border-white/10 pl-2">
                {description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-400/90 font-light text-[10px]">
              📱 Rotate phone to landscape for theatre controls
            </span>
            <span className="text-slate-400 font-light flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" /> Protected View
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
