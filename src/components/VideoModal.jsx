import React from 'react';
import { X, Play, Shield, Award, Sparkles } from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';
import { getEmbeddableMediaUrl } from '../utils/gdriveHelper';

export default function VideoModal({ isOpen, onClose, onEnrollClick }) {
  const { video: videoPreviewData } = useTh3oryLive();
  if (!isOpen) return null;

  const embedUrl = getEmbeddableMediaUrl(videoPreviewData?.videoUrl || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-indigo-500/20">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">{videoPreviewData.title}</h3>
              <p className="text-xs text-slate-400">Interactive Video Teaser &amp; Platform Tour • {videoPreviewData.duration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black flex items-center justify-center select-none" onContextMenu={e => e.preventDefault()}>
          {/* Top-Right Shield Overlay: Prevents Google Drive pop-out & YouTube title pop-out clicks */}
          <div
            className="absolute top-0 right-0 w-28 h-16 z-30 bg-transparent cursor-default pointer-events-auto"
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            onContextMenu={e => e.preventDefault()}
            title="External tab exit disabled for security"
          />
          <iframe
            src={embedUrl}
            title={videoPreviewData.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          ></iframe>
        </div>

        {/* Modal Footer & Quick CTA */}
        <div className="p-4 sm:p-5 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px]">
              🔒 Protected Stream Only
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <Award className="w-4 h-4 text-indigo-400" /> Certificate Included
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-colors w-full sm:w-auto text-center"
            >
              Close Trailer
            </button>
            <button
              onClick={() => {
                onClose();
                onEnrollClick();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto text-center"
            >
              Enroll Now ($149 / ₹11,999)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
