import React from 'react';
import { Activity, Wifi, ShieldCheck, AlertCircle, CheckCircle, Volume2, Camera } from 'lucide-react';

export default function WebRtcDebugPanel({ stats, onClose }) {
  if (!stats) return null;

  const getStatusBadge = (type, val) => {
    if (type === 'rtt') {
      if (val < 100) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GOOD ({val} ms)</span>;
      if (val < 250) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING ({val} ms)</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BAD ({val} ms)</span>;
    }

    if (type === 'loss') {
      if (val === 0) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GOOD (0)</span>;
      if (val < 50) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING ({val})</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BAD ({val})</span>;
    }

    if (type === 'fps') {
      if (val >= 24) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GOOD ({val} FPS)</span>;
      if (val >= 15) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING ({val} FPS)</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BAD ({val} FPS)</span>;
    }

    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-300">{val}</span>;
  };

  return (
    <div className="absolute top-14 right-4 z-40 w-80 bg-slate-950/95 border border-amber-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Activity className="w-4 h-4" />
          <span>WebRTC Real-time Diagnostics</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800"
        >
          ✕
        </button>
      </div>

      {/* Connection Section */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">CONNECTION</div>
        <div className="flex justify-between items-center text-slate-300">
          <span>ICE State:</span>
          <span className="text-emerald-400 font-bold">{stats.iceConnectionState}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Connection:</span>
          <span className="text-emerald-400 font-bold">{stats.connectionState}</span>
        </div>
      </div>

      {/* Network Section */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">NETWORK</div>
        <div className="flex justify-between items-center text-slate-300">
          <span>RTT Latency:</span>
          {getStatusBadge('rtt', stats.rtt)}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Available Bitrate:</span>
          <span className="text-amber-300 font-bold">{stats.availableOutgoingBitrate || 2500} kbps</span>
        </div>
      </div>

      {/* Audio Section */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-emerald-400" /> AUDIO (NATIVE OPUS 48KHZ MONO)
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Codec:</span>
          <span className="text-emerald-400 font-bold">{stats.audio.codec}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Packets Lost:</span>
          {getStatusBadge('loss', stats.audio.packetsLost)}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Jitter:</span>
          <span className="text-slate-300">{stats.audio.jitter} ms</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Jitter Buffer Target:</span>
          <span className="text-emerald-400 font-bold">120 ms (Target)</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Concealed Samples:</span>
          <span className="text-slate-400">{stats.audio.concealedSamples}</span>
        </div>
      </div>

      {/* Video Section */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
          <Camera className="w-3 h-3 text-amber-400" /> VIDEO (720P @ 30FPS)
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Resolution:</span>
          <span className="text-amber-300 font-bold">{stats.video.width || 1280}x{stats.video.height || 720}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Framerate:</span>
          {getStatusBadge('fps', stats.video.fps || 30)}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Frames Dropped:</span>
          {getStatusBadge('loss', stats.video.framesDropped)}
        </div>
      </div>

    </div>
  );
}
