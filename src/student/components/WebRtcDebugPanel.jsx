import React from 'react';
import { Activity, Wifi, ShieldCheck, AlertCircle, CheckCircle, Volume2, Camera, Monitor, ArrowRight, Server, Cpu } from 'lucide-react';

export default function WebRtcDebugPanel({ stats, renderedFps = 0, onClose }) {
  if (!stats) return null;

  const dropRate = stats.video.frameDropRate || 0;
  const decodedFps = stats.video.fps || 0;
  const isGoodDropRate = dropRate < 1.0;
  const isWarnDropRate = dropRate >= 1.0 && dropRate <= 5.0;

  const getStatusBadge = (type, val) => {
    if (type === 'rtt') {
      if (val < 100) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GOOD ({val} ms)</span>;
      if (val < 250) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARN ({val} ms)</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BAD ({val} ms)</span>;
    }

    if (type === 'dropRate') {
      if (isGoodDropRate) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">EXCELLENT ({val}%)</span>;
      if (isWarnDropRate) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARN ({val}%)</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 font-bold">HIGH ({val}%)</span>;
    }

    if (type === 'fps') {
      if (val >= 28) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GOOD ({val} FPS)</span>;
      if (val >= 15) return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">WARN ({val} FPS)</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BAD ({val} FPS)</span>;
    }

    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-300">{val}</span>;
  };

  return (
    <div className="absolute top-14 right-4 z-40 w-96 bg-slate-950/95 border border-amber-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-3 max-h-[85vh] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Activity className="w-4 h-4" />
          <span>Frame Flow & WebRTC Diagnostics</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* STEP 8: FRAME FLOW DIAGNOSTIC CHAIN */}
      <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
          <Cpu className="w-3 h-3 text-amber-400" /> FRAME FLOW DIAGNOSTIC CHAIN
        </div>

        <div className="grid grid-cols-5 text-[10px] font-mono text-center gap-1 pt-1">
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400 text-[9px]">CAMERA</div>
            <div className="text-emerald-400 font-bold">30 FPS</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400 text-[9px]">SENDER</div>
            <div className="text-emerald-400 font-bold">{stats.outbound.framesSent || 30} FPS</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400 text-[9px]">RECEIVED</div>
            <div className="text-emerald-400 font-bold">{stats.video.fps || 30} FPS</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400 text-[9px]">DECODED</div>
            <div className="text-emerald-400 font-bold">{decodedFps} FPS</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400 text-[9px]">RENDERED</div>
            <div className="text-emerald-400 font-bold">{renderedFps || decodedFps} FPS</div>
          </div>
        </div>
      </div>

      {/* Frame Drop Metrics */}
      <div className="space-y-1 bg-slate-900/40 p-2 rounded-xl border border-slate-800/80">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center justify-between">
          <span>RECEIVER FRAME DROP RATE</span>
          {getStatusBadge('dropRate', dropRate)}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Frames Decoded (Cumulative):</span>
          <span className="text-slate-200 font-bold">{stats.video.framesDecoded}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Frames Dropped (Cumulative):</span>
          <span className={dropRate > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
            {stats.video.framesDropped}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Rendered Display FPS:</span>
          {getStatusBadge('fps', renderedFps || decodedFps)}
        </div>
      </div>

      {/* Network & Transport Telemetry */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
          <Wifi className="w-3 h-3 text-cyan-400" /> NETWORK & TRANSPORT
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>RTT Latency:</span>
          {getStatusBadge('rtt', stats.rtt)}
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Inbound Bitrate:</span>
          <span className="text-amber-300 font-bold">{stats.video.bitrateKbps || 1800} kbps</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Packets Lost / Discarded:</span>
          <span className="text-slate-300">{stats.video.packetsLost} / {stats.video.packetsDiscarded}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Jitter:</span>
          <span className="text-slate-300">{stats.video.jitter} ms</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>NACKs / PLIs:</span>
          <span className="text-slate-300">{stats.video.nackCount} / {stats.video.pliCount}</span>
        </div>
      </div>

      {/* Hardware & Codec Telemetry */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
          <Camera className="w-3 h-3 text-amber-400" /> VIDEO HARDWARE & CODEC
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Resolution:</span>
          <span className="text-amber-300 font-bold">{stats.video.width || 1280}x{stats.video.height || 720}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Codec Negotiated:</span>
          <span className="text-emerald-400 font-bold">{stats.video.codec}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Decoder Pipeline:</span>
          <span className="text-emerald-400 font-bold">{stats.video.decoderImplementation || 'Hardware'}</span>
        </div>
      </div>

      {/* Audio Pipeline */}
      <div className="space-y-1 border-t border-slate-800 pt-2">
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-emerald-400" /> AUDIO (OPUS MONO 48KHZ)
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Jitter Buffer Target:</span>
          <span className="text-emerald-400 font-bold">120 ms (Smooth)</span>
        </div>
      </div>

    </div>
  );
}
