import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_FLAGS = {
  SHOW_QUICK_ENROLLMENT_BAR: { enabled: true, name: 'Quick Enrollment Bar', description: 'Displays sticky bottom bar on landing page.', category: 'Conversion & Urgency' },
  SHOW_LIMITED_SEATS_BANNER: { enabled: true, name: 'Limited Seats Urgency Badge', description: 'Shows live seat availability urgency counters.', category: 'Conversion & Urgency' },
  ENABLE_VIP_DISCOUNT: { enabled: true, name: 'VIP 50% Discount Coupons', description: 'Enables high-tier VIP discount codes on checkout.', category: 'Promotions & Pricing' },
  ENABLE_STUDENT_COMMUNITY: { enabled: true, name: 'Student Query & Support Sessions', description: 'Enables direct student query threads in Student Portal.', category: 'LMS Portal' },
  ENABLE_LIVE_REVIEWS: { enabled: true, name: 'Graduate Testimonials Wall', description: 'Renders the public graduate Wall of Love reviews section.', category: 'Social Proof' },
  ENABLE_TRAILER_VIDEO: { enabled: false, name: 'Watch Trailer Video Button', description: 'Controls the display of the Watch Trailer button on homepage.', category: 'Landing Page & Media' },
  MAINTENANCE_MODE: { enabled: false, name: 'Platform Maintenance Mode', description: 'Puts checkout and portal in maintenance mode.', category: 'System Operations' },
  ENABLE_RAZORPAY_SANDBOX: { enabled: false, name: 'Payment Sandbox Mode', description: 'Forces Razorpay gateway to operate in test environment.', category: 'System Operations' }
};

const FeatureFlagContext = createContext({
  flags: DEFAULT_FLAGS,
  loading: true,
  isFeatureEnabled: (flagKey, defaultVal = true) => defaultVal,
  toggleFlag: async () => {},
  saveFlags: async () => {},
  refreshFlags: async () => {}
});

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('th3ory_feature_flags');
      return saved ? JSON.parse(saved) : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch('/api/feature-flags');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.flags) {
          setFlags(data.flags);
          try {
            localStorage.setItem('th3ory_feature_flags', JSON.stringify(data.flags));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[FeatureFlagContext] Serverless API unreachable, using cached/default flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const isFeatureEnabled = useCallback((flagKey, defaultVal = true) => {
    if (flags[flagKey] !== undefined) {
      return Boolean(flags[flagKey].enabled);
    }
    return defaultVal;
  }, [flags]);

  const toggleFlag = useCallback(async (flagKey, newEnabledState) => {
    setFlags(prev => {
      const updated = {
        ...prev,
        [flagKey]: {
          ...(prev[flagKey] || { name: flagKey, category: 'Custom' }),
          enabled: newEnabledState
        }
      };
      try {
        localStorage.setItem('th3ory_feature_flags', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const saveFlags = useCallback(async (newFlagsObj) => {
    const targetFlags = newFlagsObj || flags;
    setFlags(targetFlags);
    try {
      localStorage.setItem('th3ory_feature_flags', JSON.stringify(targetFlags));
    } catch {}

    try {
      const adminToken = typeof window !== 'undefined' ? (sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token')) : '';
      const res = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ flags: targetFlags })
      });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
    } catch (err) {
      console.warn('[FeatureFlagContext] Failed to sync flags to serverless endpoint:', err);
    }
    return true;
  }, [flags]);

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        loading,
        isFeatureEnabled,
        toggleFlag,
        saveFlags,
        refreshFlags: fetchFlags
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
