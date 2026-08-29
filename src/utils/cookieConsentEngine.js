/**
 * TH3ORY MASTERCLASS - DPDP ACT 2023 COOKIE & TRACKER CONSENT ENGINE
 * Granular Category Opt-in & Third-Party Script Execution Gatekeeper
 */

export const COOKIE_CATEGORIES = {
  STRICTLY_NECESSARY: {
    id: 'necessary',
    name: 'Strictly Necessary (Always Active)',
    description: 'Essential for cryptographic auth tokens, CSRF protection, and session checkout continuity. These cannot be disabled.',
    mandatory: true,
    cookies: ['__th3ory_session', '__th3ory_auth', '__th3ory_csrf']
  },
  PERFORMANCE_ANALYTICS: {
    id: 'analytics',
    name: 'Performance & Latency Telemetry (Optional)',
    description: 'Measures video streaming CDN latency and page load speeds without storing personal identifiers.',
    mandatory: false,
    cookies: ['_vercel_speed_insights', '_th3ory_video_latency']
  },
  MARKETING_CAMPAIGNS: {
    id: 'marketing',
    name: 'Marketing & Discount Attribution (Optional)',
    description: 'Tracks campaign attribution for Campus Ambassador referral discounts and special seasonal scholarships.',
    mandatory: false,
    cookies: ['_ambassador_ref', '_promo_attribution']
  },
  PREFERENCES_PERSONALIZATION: {
    id: 'preferences',
    name: 'Learning Experience Preferences (Optional)',
    description: 'Remembers volume levels, theme choices, and preferred audio language for the 30-Day Masterclass video player.',
    mandatory: false,
    cookies: ['_th3ory_player_volume', '_th3ory_theme_pref']
  }
};

const STORAGE_KEY = 'th3ory_cookie_consent_preferences';

export function getStoredCookiePreferences() {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    }
  } catch {}
  return null; // Null indicates banner has never been answered
}

export function saveCookiePreferences(preferences) {
  const payload = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    preferences: Boolean(preferences.preferences),
    timestamp: new Date().toISOString(),
    version: '2026.1'
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {}

  // Apply script gating
  applyScriptGating(payload);
  return payload;
}

export function acceptAllCookies() {
  return saveCookiePreferences({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true
  });
}

export function rejectNonEssentialCookies() {
  return saveCookiePreferences({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });
}

export function applyScriptGating(preferences) {
  if (typeof window === 'undefined') return;

  // Window event dispatcher for custom trackers
  window.dispatchEvent(new CustomEvent('th3ory_cookie_consent_updated', {
    detail: preferences
  }));

  // Gating example: if analytics rejected, mute speed insights or telemetry
  if (!preferences.analytics) {
    window.__disable_th3ory_analytics = true;
  } else {
    window.__disable_th3ory_analytics = false;
  }
}
