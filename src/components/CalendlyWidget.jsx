import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ExternalLink, ShieldCheck, Mail, LogIn, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/th3orymasterclass/30min';
const INHERENT_GMAIL = 'th3orymasterclass@gmail.com';

export default function CalendlyWidget({
  calendlyUrl = DEFAULT_CALENDLY_URL,
  name = '',
  email = INHERENT_GMAIL,
  height = '680px',
  title = 'Schedule Your Private 1-on-1 Consultation'
}) {
  const containerRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const activeEmail = email || INHERENT_GMAIL;

  const queryParams = new URLSearchParams();
  if (name) queryParams.set('name', name);
  queryParams.set('email', activeEmail);
  queryParams.set('hide_gdpr_banner', '1');
  queryParams.set('background_color', '0f172a');
  queryParams.set('text_color', 'ffffff');
  queryParams.set('primary_color', 'f59e0b');

  const finalUrl = `${calendlyUrl}?${queryParams.toString()}`;

  useEffect(() => {
    // 1. Load Calendly CSS if missing
    if (!document.getElementById('calendly-css')) {
      const link = document.createElement('link');
      link.id = 'calendly-css';
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    }

    // 2. Initialize Inline Widget via Calendly SDK
    const initWidget = () => {
      if (window.Calendly && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          window.Calendly.initInlineWidget({
            url: finalUrl,
            parentElement: containerRef.current,
            prefill: {
              name: name || '',
              email: activeEmail,
            },
            utm: {}
          });
          setSdkLoaded(true);
        } catch (err) {
          console.warn('[Calendly SDK Init Exception]:', err);
          setLoadError(true);
        }
      }
    };

    if (window.Calendly) {
      initWidget();
    } else {
      let script = document.getElementById('calendly-js');
      if (!script) {
        script = document.createElement('script');
        script.id = 'calendly-js';
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', initWidget);
      return () => script.removeEventListener('load', initWidget);
    }
  }, [finalUrl, activeEmail, name]);

  return (
    <div className="w-full glass-panel border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* HEADER BAR */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-heading">{title}</h4>
            <p className="text-[11px] text-slate-400">Select a time slot on the official calendar below</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Launch direct scheduling in Google/Calendly window"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Open Direct Window &rarr;</span>
          </a>
        </div>
      </div>

      {/* GOOGLE INHERENT LOGIN BANNER */}
      <div className="px-6 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Inherent Account:</span>
          <span className="font-mono text-amber-400 font-semibold">{activeEmail}</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Automatic instant Google Meet dispatch enabled
        </span>
      </div>

      {/* CALENDLY SDK CONTAINER & FALLBACK IFRAME */}
      <div className="w-full bg-slate-950 relative min-h-[600px]" style={{ height }}>
        {/* SDK Container */}
        <div 
          ref={containerRef} 
          className="w-full h-full min-h-[600px]"
        />

        {/* Fallback iFrame if SDK fails or while loading */}
        {!sdkLoaded && (
          <iframe
            src={finalUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Calendly Live Scheduling"
            allow="camera; microphone; autoplay; payment"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation allow-modals"
            className="w-full h-full min-h-[600px] border-none absolute inset-0 z-0"
          ></iframe>
        )}

        {/* Connection Notice overlay if blocked */}
        {loadError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
            <AlertCircle className="w-12 h-12 text-amber-400 animate-bounce" />
            <h4 className="text-lg font-bold text-white">Browser Security Blocking Embed Frame</h4>
            <p className="text-slate-400 text-xs max-w-md">
              Your browser or adblocker is preventing embedded iframe connection. Click below to schedule directly in a full secure tab.
            </p>
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg"
            >
              Open Direct Scheduling Window &rarr;
            </a>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Instant Google Meet / Zoom link dispatched to <strong className="text-slate-200">{activeEmail}</strong></span>
        </div>
      </div>
    </div>
  );
}

