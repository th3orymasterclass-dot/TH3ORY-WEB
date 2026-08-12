import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Youtube } from 'lucide-react';

export default function MediaPanel({ data, save, reset }) {
  const [video, setVideo] = useState(data.video);
  useEffect(() => setVideo(data.video), [data.video]);

  const update = (key, val) => setVideo(prev => ({ ...prev, [key]: val }));
  const handleSave = () => save('video', video);
  const handleReset = () => { if (window.confirm('Reset video settings?')) reset('video'); };

  // Extract YouTube video ID for preview
  const getYTId = (url) => {
    const m = (url ?? '').match(/embed\/([^?]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYTId(video?.videoUrl);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Video &amp; Media</h2>
          <p className="text-slate-500 text-sm mt-1">Manage the course trailer video and thumbnail</p>
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

      {/* Thumbnail preview */}
      {video?.thumbnail && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-w-lg">
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-slate-950/80 flex items-center justify-center border border-slate-700">
              <Youtube className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-slate-950/80 rounded-lg px-3 py-1 text-white text-xs font-bold">
            {video.duration}
          </div>
        </div>
      )}

      <div className="space-y-4">
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

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            YouTube Embed URL
          </label>
          <p className="text-slate-600 text-xs mb-2">Format: https://www.youtube.com/embed/VIDEO_ID?autoplay=1</p>
          <input value={video?.videoUrl ?? ''} onChange={e => update('videoUrl', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail Image URL</label>
          <input value={video?.thumbnail ?? ''} onChange={e => update('thumbnail', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
        </div>

        {/* Helper */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-400">How to get a YouTube embed URL:</p>
          <p>1. Go to your YouTube video</p>
          <p>2. Click Share → Embed → copy the src= URL</p>
          <p>3. Add <span className="text-amber-400 font-mono">?autoplay=1</span> to the end</p>
          {ytId && <p className="text-green-400 font-medium">✓ Current video ID detected: <span className="font-mono">{ytId}</span></p>}
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Video Settings
      </button>
    </div>
  );
}
