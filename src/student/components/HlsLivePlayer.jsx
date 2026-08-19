import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Radio, ShieldCheck, RefreshCw, AlertCircle, Settings, Camera, Video, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { subscribeToLiveBroadcastState, fetchLiveBroadcastStateFromSupabase } from '../../services/supabaseService';
import { WebRtcSubscriber } from '../../services/webRtcEngine';

// Helper to dynamically load Hls.js script from CDN
const loadHlsScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    if (window.Hls) {
      resolve(window.Hls);
      return;
    }
    const existingScript = document.getElementById('hls-js-cdn-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Hls));
      return;
    }
    const script = document.createElement('script');
    script.id = 'hls-js-cdn-script';
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = () => resolve(window.Hls);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
};

export default function HlsLivePlayer({ streamUrl, profile, isLight }) {
  const videoRef = useRef(null);
  const rtcSubscriberRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStartedUserClick, setHasStartedUserClick] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeUrlIndex, setActiveUrlIndex] = useState(0);

  // Fallback Realtime Canvas Frame State
  const [canvasFrame, setCanvasFrame] = useState(null);

  // Global Realtime Broadcast State
  const [broadcastState, setBroadcastState] = useState({
    isOnAir: false,
    source: 'webcam',
    zoomUrl: '',
    youtubeId: ''
  });

  const [webcamStreamActive, setWebcamStreamActive] = useState(false);

  // Subscribe to live broadcast state updates & Supabase Realtime Canvas Frames
  useEffect(() => {
    fetchLiveBroadcastStateFromSupabase().then(state => {
      if (state) setBroadcastState(prev => ({ ...prev, ...state }));
    });

    const unsubscribe = subscribeToLiveBroadcastState(newState => {
      if (newState) setBroadcastState(prev => ({ ...prev, ...newState }));
    });

    const handleLocalStatus = () => {
      if (typeof window !== 'undefined') {
        const isOnAir = localStorage.getItem('th3ory_live_on_air') === 'true';
        const source = localStorage.getItem('th3ory_live_source') || 'webcam';
        const zoomUrl = localStorage.getItem('th3ory_live_zoom_url') || '';
        const youtubeId = localStorage.getItem('th3ory_live_youtube_id') || '';
        setBroadcastState(prev => ({ ...prev, isOnAir, source, zoomUrl, youtubeId }));
      }
    };
    window.addEventListener('th3ory_live_status_change', handleLocalStatus);

    // Subscribe to Realtime Canvas Frames Fallback
    let frameSub = null;
    if (isSupabaseConfigured && supabase) {
      frameSub = supabase.channel('th3ory_webcam_stream')
        .on('broadcast', { event: 'webcam_frame' }, ({ payload }) => {
          if (payload && payload.frame) {
            setCanvasFrame(payload.frame);
            setIsLive(true);
          }
        })
        .subscribe();
    }

    return () => {
      unsubscribe();
      window.removeEventListener('th3ory_live_status_change', handleLocalStatus);
      if (frameSub && supabase) {
        try { supabase.removeChannel(frameSub); } catch (e) {}
      }
    };
  }, []);

  // Sync mute state to video element without tearing down WebRTC connection
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // STABLE WebRTC Subscriber Engine for Direct HD Video & Audio Streaming
  useEffect(() => {
    if (broadcastState.source !== 'webcam') {
      if (rtcSubscriberRef.current) {
        rtcSubscriberRef.current.destroy();
        rtcSubscriberRef.current = null;
      }
      setWebcamStreamActive(false);
      return;
    }

    const subscriber = new WebRtcSubscriber((remoteStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
        videoRef.current.muted = isMuted;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setWebcamStreamActive(true);
          })
          .catch(() => {
            setIsPlaying(false);
            setWebcamStreamActive(true);
          });
        setIsLive(true);
        setHasError(false);
      }
    });

    rtcSubscriberRef.current = subscriber;

    return () => {
      if (rtcSubscriberRef.current) {
        rtcSubscriberRef.current.destroy();
        rtcSubscriberRef.current = null;
      }
    };
  }, [broadcastState.source]);

  // Candidate HLS URLs for automatic seamless fallback (OBS RTMP)
  const candidateUrls = [
    streamUrl || 'https://stream.th3ory.online/live/th3ory_live_masterclass_key_2026.m3u8',
    'https://stream.th3ory.online/live/live.m3u8',
    'https://stream.th3ory.online/live/stream.m3u8'
  ].filter(Boolean);

  const currentStreamUrl = candidateUrls[activeUrlIndex] || candidateUrls[0];

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

  // Initialize HLS.js Stream Engine dynamically for OBS RTMP Mode
  useEffect(() => {
    if (broadcastState.source !== 'obs_rtmp') return;

    let isMounted = true;
    const video = videoRef.current;
    if (!video || !currentStreamUrl) return;

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    setHasError(false);

    loadHlsScript().then(HlsClass => {
      if (!isMounted) return;

      if (HlsClass && HlsClass.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new HlsClass({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 6,
          maxBufferLength: 10,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3
        });

        hlsRef.current = hls;
        hls.loadSource(currentStreamUrl);
        hls.attachMedia(video);

        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          if (!isMounted) return;
          setIsLive(true);
          setHasError(false);
          video.muted = isMuted;
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });

        hls.on(HlsClass.Events.ERROR, (event, data) => {
          if (!isMounted) return;
          if (data.fatal) {
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                if (activeUrlIndex < candidateUrls.length - 1) {
                  setActiveUrlIndex(prev => prev + 1);
                } else {
                  setHasError(true);
                  setErrorMessage('Broadcast waiting or reconnecting to OBS server...');
                  retryTimerRef.current = setTimeout(() => {
                    if (isMounted) {
                      setActiveUrlIndex(0);
                      hls.loadSource(candidateUrls[0]);
                      hls.startLoad();
                    }
                  }, 5000);
                }
                break;
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setHasError(true);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentStreamUrl;
        video.muted = isMuted;
        video.addEventListener('loadedmetadata', () => {
          if (isMounted) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        });
        video.addEventListener('error', () => {
          if (isMounted && activeUrlIndex < candidateUrls.length - 1) {
            setActiveUrlIndex(prev => prev + 1);
          }
        });
      } else {
        setHasError(true);
        setErrorMessage('HLS Live streaming is not supported on this browser.');
      }
    });

    return () => {
      isMounted = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [currentStreamUrl, activeUrlIndex, broadcastState.source]);

  const handleStartWatchingClick = () => {
    setHasStartedUserClick(true);
    setIsMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

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
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-2xl group select-none">
      
      {/* MODE 1: Direct WebRTC HD WebCam Stream (with Instant Realtime Canvas Fallback) */}
      {broadcastState.source === 'webcam' && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className={`w-full h-full object-cover ${webcamStreamActive ? 'block' : 'hidden'}`}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Fallback Realtime Frame Display */}
          {!webcamStreamActive && canvasFrame && (
            <img
              src={canvasFrame}
              alt="Live Masterclass Feed"
              className="w-full h-full object-cover block"
            />
          )}

          {/* Connecting State */}
          {!webcamStreamActive && !canvasFrame && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-4 p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-extrabold text-lg">WebRTC HD Camera & Audio Stream Connecting...</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  Mentalist Sravan is live in the camera studio. Smooth WebRTC video & microphone audio auto-connects.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODE 2: Zoom / Google Meet Call Card */}
      {broadcastState.source === 'zoom' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest animate-pulse">
              🔴 LIVE ZOOM MASTERCLASS ON AIR
            </span>
            <h3 className="text-white font-black text-xl sm:text-2xl tracking-tight pt-2">
              Interactive Zoom Video Meeting Active
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Mentalist Sravan has launched an interactive Zoom / Google Meet session for real-time cognitive demonstrations and student Q&A.
            </p>
          </div>

          {broadcastState.zoomUrl ? (
            <a
              href={broadcastState.zoomUrl}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> JOIN LIVE ZOOM MASTERCLASS NOW
            </a>
          ) : (
            <div className="text-xs text-blue-400 font-bold bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-xl">
              Zoom Meeting Link Initializing...
            </div>
          )}
        </div>
      )}

      {/* MODE 3: YouTube Live Embed */}
      {broadcastState.source === 'youtube' && broadcastState.youtubeId && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${broadcastState.youtubeId}?autoplay=1&live=1&modestbranding=1&rel=0`}
          title="TH3ORY Live Masterclass Stream"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {/* MODE 4: OBS RTMP HLS Player */}
      {broadcastState.source === 'obs_rtmp' && (
        <video
          ref={videoRef}
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      {/* Tap to Start / Unmute Overlay (Bypasses Browser Autoplay Restrictions) */}
      {!hasStartedUserClick && (broadcastState.source === 'webcam' || broadcastState.source === 'obs_rtmp') && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
          <button
            onClick={handleStartWatchingClick}
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-amber-500/40 flex items-center gap-3 cursor-pointer animate-bounce"
          >
            <Play className="w-5 h-5 fill-slate-950" /> TAP TO UNMUTE & WATCH LIVE STREAM
          </button>
        </div>
      )}

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
        <span>🔴 LIVE BROADCAST ({broadcastState.source.toUpperCase()})</span>
      </div>

      {/* Bottom Glassmorphism Control Bar */}
      {(broadcastState.source === 'webcam' || broadcastState.source === 'obs_rtmp') && (
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-4">
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-amber-300" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
