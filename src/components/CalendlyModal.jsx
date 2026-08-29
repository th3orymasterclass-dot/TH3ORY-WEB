import React, { useEffect, useRef, useState } from 'react';
import { Calendar, X, ExternalLink, Sparkles, Clock, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

const DEFAULT_CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/th3orymasterclass/30min';
const INHERENT_GMAIL = 'th3orymasterclass@gmail.com';

export default function CalendlyModal({
  isOpen,
  onClose,
  calendlyUrl = DEFAULT_CALENDLY_URL,
  name = '',
  email = INHERENT_GMAIL,
  title = 'Schedule 1-on-1 Strategy & Mentorship Session',
  subtitle = 'Book a private 15-30 min consultation with TH3ORY Masterclass team'
}) {
  const containerRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const activeEmail = email || INHERENT_GMAIL;

  // Build URL with pre-fill query params - High Contrast Light Mode for 100% Form Text Visibility
  const queryParams = new URLSearchParams();
  if (name) queryParams.set('name', name);
  queryParams.set('email', activeEmail);
  queryParams.set('hide_gdpr_banner', '1');
  queryParams.set('background_color', 'ffffff');
  queryParams.set('text_color', '0f172a');
  queryParams.set('primary_color', '7c5cfc');

  const finalUrl = `${calendlyUrl}?${queryParams.toString()}`;

  useEffect(() => {
    if (!isOpen) return;

    // Load Calendly CSS if missing
    if (!document.getElementById('calendly-css')) {
      const link = document.createElement('link');
      link.id = 'calendly-css';
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    }

    // Initialize Inline Widget via Calendly SDK
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
          console.warn('[Calendly Modal SDK Init Exception]:', err);
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
    }
  }, [isOpen, finalUrl, activeEmail, name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[92vh] h-[800px] sm:h-[840px]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-heading flex items-center gap-2">
                {title}
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 hidden sm:inline">
                  LIVE CALENDLY
                </span>
              </h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
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
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GOOGLE INHERENT LOGIN STATUS BAR */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Inherent Account:</span>
            <span className="font-mono text-amber-400 font-semibold">{activeEmail}</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Automatic instant Google Meet dispatch enabled
          </span>
        </div>

        {/* CALENDLY EMBED IFRAME / WIDGET BODY */}
        <div className="flex-1 w-full bg-white relative min-h-[660px] sm:min-h-[700px] h-full overflow-y-auto">
          {/* SDK Container */}
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[660px] sm:min-h-[700px] bg-white"
          />

          {/* Fallback iFrame if SDK is loading */}
          {!sdkLoaded && (
            <iframe
              src={finalUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Calendly Scheduling"
              allow="camera; microphone; autoplay; payment; clipboard-write; display-capture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation allow-modals"
              className="w-full h-full min-h-[660px] sm:min-h-[700px] border-none absolute inset-0 z-0"
            ></iframe>
          )}

          {/* Connection Notice overlay if blocked */}
          {loadError && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
              <AlertCircle className="w-12 h-12 text-amber-400 animate-bounce" />
              <h4 className="text-lg font-bold text-white">Embedded Frame Connection Blocked</h4>
              <p className="text-slate-400 text-xs max-w-md">
                Your browser privacy settings are preventing frame load. Click below to launch direct scheduling.
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
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Google Meet / Zoom invite dispatched to <strong className="text-slate-200">{activeEmail}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

