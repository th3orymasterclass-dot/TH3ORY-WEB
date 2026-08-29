import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, ChevronRight, Lock, ExternalLink } from 'lucide-react';
import { 
  COOKIE_CATEGORIES, 
  getStoredCookiePreferences, 
  acceptAllCookies, 
  rejectNonEssentialCookies, 
  saveCookiePreferences 
} from '../../utils/cookieConsentEngine';

export default function DPCookieConsentBanner({ onOpenPrivacyPolicy }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [customPrefs, setCustomPrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Only show if user has never set preferences
    const existing = getStoredCookiePreferences();
    if (!existing) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleRejectNonEssential = () => {
    rejectNonEssentialCookies();
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences(customPrefs);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  if (!isVisible && !showPreferencesModal) return null;

  return (
    <>
      {/* Floating Bottom Glass Banner */}
      {isVisible && !showPreferencesModal && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-8 lg:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-6 rounded-2xl glass-panel border border-[#7C5CFC]/30 bg-[#15171A]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center shrink-0 border border-[#7C5CFC]/30">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#FAFAF7] uppercase tracking-wider">
                    Privacy &amp; Cookie Consent
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFC]/20 text-[#E9E4FF] font-semibold border border-[#7C5CFC]/30">
                    DPDP Act 2023
                  </span>
                </div>
                <p className="text-xs text-[#FAFAF7]/75 leading-relaxed">
                  We use cookies and telemetry strictly with your affirmative consent to ensure video streaming stability, secure authentication, and personalized learning. We never sell your personal data.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5C3BDE] hover:from-[#8E71FD] hover:to-[#6C4BE8] text-[#FAFAF7] text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 transition-all cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-3.5 py-2 rounded-xl glass-card hover:bg-[#1f2227] text-[#FAFAF7]/90 text-xs font-semibold border border-[#555A66]/50 transition-all cursor-pointer"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setShowPreferencesModal(true)}
                    className="px-3 py-2 text-xs font-medium text-[#E9E4FF] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Granular Preference Customization Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#15171A] border border-[#7C5CFC]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(124,92,252,0.25)] space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#555A66]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center border border-[#7C5CFC]/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FAFAF7]">Cookie &amp; Tracking Preferences</h3>
                  <p className="text-xs text-[#555A66]">India DPDP Act 2023 &bull; Privacy by Default</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreferencesModal(false)}
                className="text-[#555A66] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Cards */}
            <div className="space-y-4">
              {Object.values(COOKIE_CATEGORIES).map((cat) => {
                const isMandatory = cat.mandatory;
                const isChecked = isMandatory ? true : customPrefs[cat.id];

                return (
                  <div key={cat.id} className="p-4 rounded-2xl glass-card border border-[#E9E4FF]/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#FAFAF7]">{cat.name}</span>
                        {isMandatory && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFC857]/10 text-[#FFC857] border border-[#FFC857]/30 font-bold">
                            Always Active
                          </span>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isMandatory}
                          checked={isChecked}
                          onChange={(e) => {
                            if (isMandatory) return;
                            setCustomPrefs(prev => ({ ...prev, [cat.id]: e.target.checked }));
                          }}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          isChecked ? 'bg-[#7C5CFC]' : 'bg-[#555A66]/40'
                        } ${isMandatory ? 'opacity-70 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                    <p className="text-xs text-[#FAFAF7]/70 leading-relaxed">{cat.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.cookies.map(c => (
                        <code key={c} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[#E9E4FF] font-mono">
                          {c}
                        </code>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#555A66]/30">
              <a
                href="#/privacy"
                onClick={(e) => {
                  if (onOpenPrivacyPolicy) {
                    e.preventDefault();
                    onOpenPrivacyPolicy();
                    setShowPreferencesModal(false);
                  }
                }}
                className="text-xs text-[#7C5CFC] hover:underline flex items-center gap-1 font-semibold"
              >
                Read Full DPDP Privacy Policy <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-[#FAFAF7]/80 hover:bg-[#1f2227] transition-all cursor-pointer"
                >
                  Reject All
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5C3BDE] hover:from-[#8E71FD] text-white text-xs font-bold transition-all shadow-lg shadow-[#7C5CFC]/20 cursor-pointer"
                >
                  Save My Choices
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
