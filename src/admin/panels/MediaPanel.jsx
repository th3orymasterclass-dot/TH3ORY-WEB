import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Youtube, HardDrive, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

export default function MediaPanel({ data, save, reset, themeMode = 'dark' }) {
  const [video, setVideo] = useState(data.video);
  const isDark = themeMode === 'dark';

  useEffect(() => setVideo(data.video), [data.video]);

  const update = (key, val) => setVideo(prev => ({ ...prev, [key]: val }));
  const handleSave = () => save('video', video);
  const handleReset = () => { if (window.confirm('Reset video settings?')) reset('video'); };

  // Parse video URL for YouTube vs Google Drive
  const rawUrl = video?.videoUrl ?? '';
  const gdrive = parseGoogleDriveUrl(rawUrl);

  const handleUrlChange = (newUrl) => {
    const parsedDrive = parseGoogleDriveUrl(newUrl);
    if (parsedDrive.isGDrive) {
      setVideo(prev => ({
        ...prev,
        videoUrl: parsedDrive.embedUrl,
        thumbnail: prev.thumbnail || parsedDrive.thumbnailUrl,
        storageType: 'gdrive',
        gdriveFileId: parsedDrive.fileId,
      }));
    } else {
      setVideo(prev => ({ ...prev, videoUrl: newUrl }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Video &amp; Media <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}><HardDrive className="w-3 h-3 text-blue-500"/> Google Drive Ready</span>
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage course trailer video and thumbnails using Google Drive or YouTube storage</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer ${
              isDark ? 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40' : 'border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 bg-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-w-xl bg-black">
        {video?.videoUrl ? (
          <iframe
            src={getEmbeddableMediaUrl(video.videoUrl)}
            title="Course Video Preview"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600 text-xs font-mono">
            No video URL provided
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Video URL (Google Drive / YouTube)</label>
          <input
            value={video?.videoUrl ?? ''}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="Paste Google Drive share link or YouTube embed link..."
            className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
            }`}
          />
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Thumbnail Image URL</label>
          <input
            value={video?.thumbnail ?? ''}
            onChange={e => update('thumbnail', e.target.value)}
            placeholder="Thumbnail image URL"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
