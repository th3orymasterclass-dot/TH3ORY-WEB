import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2,
  Download, Printer, ExternalLink, RefreshCw, Eye,
  FileText, ShieldCheck, Sun, Moon, AlertCircle, X,
  Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { parseGoogleDriveUrl } from '../utils/gdriveHelper';

/**
 * Universal PDF Viewer Engine for TH3ORY Masterclass
 * 
 * Supports:
 * - Google Drive PDF preview streams
 * - Standard web URLs (.pdf, Supabase storage, Cloudflare, S3)
 * - Blob / object URLs
 * - Google Docs Viewer fallback for cross-origin PDFs
 * - Zoom, rotate, night/light reading filter, fullscreen, print, download
 */
export default function PdfViewer({
  url,
  title = 'Masterclass Document',
  description = '',
  levelId = null,
  fileSize = null,
  duration = null,
  tags = [],
  allowDownload = true,
  themeMode = 'dark',
  onClose = null,
  showCloseButton = false,
  className = ''
}) {
  const isDark = themeMode === 'dark';
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Viewer state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [nightReader, setNightReader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [engine, setEngine] = useState('auto'); // 'auto' | 'gdrive' | 'native' | 'gdocs'

  // URL Parsing & Engine Detection
  const gdrive = parseGoogleDriveUrl(url || '');
  const isGDrive = gdrive.isGDrive;
  const isBlobOrData = url?.startsWith('blob:') || url?.startsWith('data:');

  // Compute resolved stream URL based on selected engine
  const resolvedUrl = React.useMemo(() => {
    if (!url) return '';
    const cleanUrl = url.trim();

    if (engine === 'gdocs') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
    }

    if (isGDrive || engine === 'gdrive') {
      return gdrive.embedUrl || cleanUrl;
    }

    // Direct PDF or standard URL with embedded viewer parameters
    if (cleanUrl.toLowerCase().includes('.pdf') || isBlobOrData || engine === 'native') {
      if (cleanUrl.includes('#')) return cleanUrl;
      return `${cleanUrl}#toolbar=1&navpanes=0&scrollbar=1`;
    }

    return cleanUrl;
  }, [url, engine, isGDrive, isBlobOrData, gdrive.embedUrl]);

  // Reset loading state on URL change
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    setZoom(100);
    setRotation(0);
  }, [url, engine]);

  // Handle Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('[PdfViewer] Fullscreen API error:', err);
    }
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 20, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 20, 60));
  const handleResetZoom = () => setZoom(100);

  // Rotation control
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  // Print handler
  const handlePrint = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.open(url, '_blank')?.print();
      }
    } catch {
      window.open(url, '_blank');
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!url) return;
    if (isGDrive && gdrive.fileId) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${gdrive.fileId}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = `${title || 'TH3ORY_Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `${title || 'TH3ORY_Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && onClose && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-2xl overflow-hidden border transition-all select-none ${
        isDark
          ? 'bg-[#0B0F19] border-[#E9E4FF]/12 text-[#FAFAF7] shadow-2xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'w-full h-full min-h-[550px]'} ${className}`}
    >
      {/* ─── Top Control Toolbar ─── */}
      <header
        className={`flex items-center justify-between px-3 sm:px-4 py-2.5 border-b shrink-0 flex-wrap gap-2 ${
          isDark
            ? 'bg-[#15171A]/95 border-[#E9E4FF]/10 backdrop-blur-md'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Left: Document Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-xs sm:text-sm truncate max-w-[240px] sm:max-w-md">
                {title}
              </h3>
              {levelId && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] border border-[#7C5CFC]/30">
                  {levelId.toUpperCase()}
                </span>
              )}
              {fileSize && (
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  {fileSize}
                </span>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-slate-400 truncate hidden sm:block max-w-lg">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Interactive Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center bg-black/20 dark:bg-black/40 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 60}
              className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold hover:text-[#FFC857] transition-all cursor-pointer"
              title="Reset Zoom (0)"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate Control */}
          <button
            onClick={handleRotate}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              rotation !== 0
                ? 'bg-amber-500/20 border-amber-500/40 text-[#FFC857]'
                : 'border-white/10 hover:bg-white/10 text-slate-300'
            }`}
            title={`Rotate 90° Clockwise (${rotation}°) [Key: R]`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Night Reader Invert Mode */}
          <button
            onClick={() => setNightReader(v => !v)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              nightReader
                ? 'bg-purple-500/20 border-purple-500/40 text-[#9277FF]'
                : 'border-white/10 hover:bg-white/10 text-slate-300'
            }`}
            title={nightReader ? 'Disable Night Invert Filter' : 'Enable High-Comfort Night Reading Mode'}
          >
            {nightReader ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Engine Switcher (Fallback for problematic PDFs) */}
          <button
            onClick={() => setEngine(curr => (curr === 'gdocs' ? 'auto' : 'gdocs'))}
            className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              engine === 'gdocs'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'border-white/10 hover:bg-white/10 text-slate-400'
            }`}
            title="Switch Between Direct Renderer and Google Cloud Reader Engine"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="text-[10px]">{engine === 'gdocs' ? 'Docs Engine' : 'Direct'}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="hidden md:flex p-2 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Download */}
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg border border-white/10 hover:bg-[#FFC857]/10 hover:border-[#FFC857]/40 hover:text-[#FFC857] text-slate-300 transition-all cursor-pointer"
              title="Download PDF Document"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* External Tab Popout */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 transition-all"
            title="Open In Secure External Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Mode (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Optional Close Button */}
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all ml-1 cursor-pointer"
              title="Close PDF Viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ─── PDF Canvas / Frame Stage ─── */}
      <div className="flex-1 relative overflow-auto bg-[#070A11] flex items-center justify-center min-h-[420px]">
        {/* Loading Shimmer */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070A11]/90 backdrop-blur-xs gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#FFC857] p-0.5 animate-spin">
              <div className="w-full h-full bg-[#070A11] rounded-2xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#FFC857]" />
              </div>
            </div>
            <p className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Loading Secure Document…
            </p>
            <span className="text-[10px] text-slate-500">
              Synchronizing with TH3ORY Content Network
            </span>
          </div>
        )}

        {/* Load Failure Fallback */}
        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070A11] gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <div className="max-w-md">
              <h4 className="text-white font-bold text-base mb-1">
                Unable to Stream Document In-App
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                This document's host or browser privacy settings restricted direct frame embedding. You can view it via our alternative cloud engine or open it securely in a new tab.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  setLoadError(false);
                  setEngine(engine === 'gdocs' ? 'auto' : 'gdocs');
                }}
                className="px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6344E0] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Try Cloud Reader Engine
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open In New Tab
              </a>
            </div>
          </div>
        )}

        {/* Transformed Frame Wrapper */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200 origin-center"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            filter: nightReader ? 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.15)' : 'none',
          }}
        >
          {resolvedUrl ? (
            <iframe
              ref={iframeRef}
              src={resolvedUrl}
              title={title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setLoadError(true);
              }}
              className="w-full h-full border-0 bg-[#070A11]"
              allow="autoplay; fullscreen; clipboard-read; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
            />
          ) : (
            <div className="text-center p-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No valid PDF document specified.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Status Bar ─── */}
      <footer
        className={`px-4 py-1.5 border-t text-[11px] flex items-center justify-between flex-wrap gap-2 shrink-0 ${
          isDark
            ? 'bg-[#15171A] border-[#E9E4FF]/10 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TH3ORY Official Verified Material</span>
          {tags && tags.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1">
              • {tags.slice(0, 3).map(t => (
                <span key={t} className="text-[10px] bg-white/5 px-1.5 py-0.2 rounded text-slate-300">
                  #{t}
                </span>
              ))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>Shortcuts: [+/-] Zoom, [R] Rotate, [F] Fullscreen</span>
          {rotation !== 0 && <span className="text-[#FFC857] font-semibold">{rotation}°</span>}
        </div>
      </footer>
    </div>
  );
}
