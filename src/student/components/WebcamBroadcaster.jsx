import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Monitor, Radio, Square, Play, ShieldCheck, Volume2, Settings } from 'lucide-react';

export default function WebcamBroadcaster({ isOnAir, onToggleOnAir }) {
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [devicePermissionError, setDevicePermissionError] = useState(null);
  const [streamStarted, setStreamStarted] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setDevicePermissionError(null);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStreamStarted(true);
      setIsScreenSharing(false);
      setCameraActive(true);
      setMicActive(true);
    } catch (err) {
      console.error('Camera Access Error:', err);
      setDevicePermissionError('Camera/Microphone permission denied. Please allow camera access in browser settings.');
    }
  };

  // Start Screen Share Stream
  const startScreenShare = async () => {
    try {
      setDevicePermissionError(null);
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });

      // Keep audio track from microphone if available
      if (mediaStreamRef.current) {
        const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
        if (audioTrack) screenStream.addTrack(audioTrack);
      }

      mediaStreamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);
      setCameraActive(true);

      // Handle screen share stop from browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        startCamera();
      };
    } catch (err) {
      console.error('Screen Share Error:', err);
    }
  };

  // Toggle Video Track
  const toggleCamera = () => {
    if (!mediaStreamRef.current) return;
    const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraActive(videoTrack.enabled);
    }
  };

  // Toggle Audio Track
  const toggleMic = () => {
    if (!mediaStreamRef.current) return;
    const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicActive(audioTrack.enabled);
    }
  };

  // Auto-initialize camera preview on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isOnAir ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-sm tracking-tight">Direct Browser Live WebCam Studio</h3>
            <p className="text-slate-400 text-xs">Broadcast live video & audio directly from your browser with zero server setup.</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isOnAir ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {isOnAir ? '🔴 LIVE WEBCAM ON AIR' : 'PREVIEW READY'}
        </span>
      </div>

      {/* Permission Error Notice */}
      {devicePermissionError && (
        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
          <span>{devicePermissionError}</span>
          <button
            onClick={startCamera}
            className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase"
          >
            Retry Access
          </button>
        </div>
      )}

      {/* Live Video Preview Box */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isScreenSharing ? 'scale-x-[-1]' : ''}`}
        />

        {/* Floating Indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-white text-xs font-bold backdrop-blur-md">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnAir ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{isScreenSharing ? '🖥️ Screen Sharing' : cameraActive ? '📷 Camera Active' : '📷 Camera Off'}</span>
        </div>

        {/* Camera Off Overlay */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 z-10">
            <CameraOff className="w-12 h-12 text-slate-600" />
            <p className="text-slate-400 text-xs font-bold">Camera is turned off</p>
          </div>
        )}

        {/* Live Watermark Preview */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold backdrop-blur-md">
          TH3ORY LIVE STUDIO
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {/* Toggle Camera */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              cameraActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-red-600/20 border-red-500/40 text-red-400'
            }`}
          >
            {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{cameraActive ? 'Camera On' : 'Camera Off'}</span>
          </button>

          {/* Toggle Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              micActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-red-600/20 border-red-500/40 text-red-400'
            }`}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{micActive ? 'Mic On' : 'Muted'}</span>
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={isScreenSharing ? startCamera : startScreenShare}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isScreenSharing
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>
        </div>

        {/* Start / Stop Broadcast Switch */}
        <button
          type="button"
          onClick={() => onToggleOnAir(!isOnAir)}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xl ${
            isOnAir
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
          }`}
        >
          {isOnAir ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950" />}
          <span>{isOnAir ? 'STOP WEBCAM STREAM' : 'START LIVE WEBCAM BROADCAST'}</span>
        </button>
      </div>

    </div>
  );
}
