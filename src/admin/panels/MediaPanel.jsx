import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Youtube, HardDrive, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../../utils/gdriveHelper';

export default function MediaPanel({ data, save, reset }) {
  const [video, setVideo] = useState(data.video);
  useEffect(() => setVideo(data.video), [data.video]);

  const update = (key, val) => setVideo(prev => ({ ...prev, [key]: val }));
  const handleSave = () => save('video', video);
  const handleReset = () => { if (window.confirm('Reset video settings?')) reset('video'); };

  // Parse video URL for YouTube vs Google Drive
  const rawUrl = video?.videoUrl ?? '';
  const gdrive = parseGoogleDriveUrl(rawUrl);

  const getYTId = (url) => {
    const m = (url ?? '').match(/embed\/([^?]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYTId(rawUrl);

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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Video &amp; Media <span className="text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><HardDrive className="w-3 h-3"/> Google Drive Ready</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage course trailer video and thumbnails using Google Drive or YouTube storage</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-w-xl bg-black shadow-xl">
        {video?.videoUrl ? (
          <iframe
            src={getEmbeddableMediaUrl(video.videoUrl)}
            title={video.title || 'Course Preview'}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <HardDrive className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No video URL configured</p>
          </div>
        )}
        {video?.duration && (
          <div className="absolute bottom-3 left-3 bg-slate-950/80 rounded-lg px-3 py-1 text-white text-xs font-bold">
            {video.duration}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {[
          { label: 'Video Title', key: 'title' },
          { label: 'Duration (e.g. 4:15)', key: 'duration' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
            <input value={video?.[f.key] ?? ''} onChange={e => update(f.key, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60" />
          </div>
        ))}

        {/* Video Storage Link Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              Video Source URL (Google Drive Shareable Link or YouTube Embed)
            </label>
            {gdrive.isGDrive && (
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <HardDrive className="w-3 h-3"/> Google Drive ID: {gdrive.fileId}
              </span>
            )}
          </div>
          <input
            value={video?.videoUrl ?? ''}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="Paste Google Drive shareable link (e.g. https://drive.google.com/file/d/.../view) or YouTube link"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono"
          />
        </div>

        {/* Thumbnail Image URL */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail Image URL</label>
          <input value={video?.thumbnail ?? ''} onChange={e => update('thumbnail', e.target.value)}
            placeholder="https://... (optional image preview)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
        </div>

        {/* Google Drive Storage Helper Card */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <HardDrive className="w-4 h-4" /> Google Drive Digital Storage Integration Guide
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            You can host all course trailers, video lessons, PDFs, and digital workbooks directly on <strong>Google Drive</strong>:
          </p>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
            <li>Upload your video file or PDF to Google Drive.</li>
            <li>Right-click the file → click <strong>Share</strong> → set permissions to <em>"Anyone with the link can view"</em>.</li>
            <li>Copy the shareable link and paste it directly into the URL box above.</li>
            <li>TH3ORY automatically converts your Google Drive link into an embeddable stream preview and direct download stream!</li>
          </ol>
          {gdrive.isGDrive && (
            <div className="mt-3 p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Active Google Drive Link Detected!
              </div>
              <p className="text-slate-300"><strong>Embed Stream URL:</strong> <code className="text-blue-300 font-mono">{gdrive.embedUrl}</code></p>
              <p className="text-slate-300"><strong>Direct Stream / Download:</strong> <a href={gdrive.downloadUrl} target="_blank" rel="noreferrer" className="text-amber-400 underline font-mono">Test Direct Link</a></p>
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Media & Video Settings
      </button>
    </div>
  );
}
