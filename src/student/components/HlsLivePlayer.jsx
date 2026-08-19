import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Radio, ShieldCheck, RefreshCw } from 'lucide-react';

export default function HlsLivePlayer({ streamUrl, profile, isLight }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Floating Watermark Position (Anti-Piracy)
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '15%' });

  // Animate Floating Email Watermark every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 65 + 15) + '%';
      const left = Math.floor(Math.random() * 65 + 15) + '%';
      setWatermarkPos({ top, left });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Initialize HLS.js Stream Engine
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setHasError(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        maxBufferLength: 10,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLive(true);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setHasError(true);
              setErrorMessage('Live stream connection offline or waiting for broadcast to start.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Mobile Safari Native HLS Support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  const reloadStream = () => {
    setHasError(false);
    if (hlsRef.current && streamUrl) {
      hlsRef.current.loadSource(streamUrl);
      if (videoRef.current) videoRef.current.play();
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-2xl group select-none">
      
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Floating Student Email Watermark (Anti-Piracy Guard) */}
      <div
        className="absolute pointer-events-none z-20 px-3 py-1 rounded-full bg-slate-950/70 border border-amber-500/30 text-amber-300/60 text-[10px] font-mono font-bold backdrop-blur-xs transition-all duration-1000 shadow-lg"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-amber-400/80" />
          {profile?.email || 'student@th3ory.online'} • TH3ORY LIVE
        </span>
      </div>

      {/* Live Badge Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-red-400/40 animate-pulse">
        <Radio className="w-4 h-4 animate-spin" />
        <span>🔴 LIVE BROADCAST</span>
      </div>

      {/* Stream Error / Offline Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-white font-extrabold text-lg">Broadcast Waiting or Reconnecting</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">{errorMessage}</p>
          </div>
          <button
            onClick={reloadStream}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reconnect Live Stream
          </button>
        </div>
      )}

      {/* Bottom Glassmorphism Control Bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-4">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-amber-300" />}
        </button>

        {/* Volume & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
}
