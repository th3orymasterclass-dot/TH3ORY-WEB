import { useState, useEffect, useCallback } from 'react';
import {
  lsSet, lsReset, resetAllData, defaults, isAdminAuthenticated,
  getCourseDetails, getVideo, getLevels,
  getPlans, getAddons, getReviews, getFaqs, getContent,
} from '../data/adminData';
import {
  fetchCourseContentsFromSupabase,
  fetchSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
  subscribeToSiteSettings,
  subscribeToReviews,
  fetchReviewsFromSupabase,
  subscribeToCourseContents,
} from '../services/supabaseService';

export default function useAdminData() {
  const [data, setData] = useState(() => ({
    courseDetails: getCourseDetails(),
    video:         getVideo(),
    levels:        getLevels(),
    plans:         getPlans(),
    addons:        getAddons(),
    reviews:       getReviews(),
    faqs:          getFaqs(),
    content:       getContent(),
  }));

  const [lastSaved, setLastSaved] = useState(null);

  // Re-read after any save & hydrate from Supabase Realtime
  useEffect(() => {
    const handler = () => {
      setData({
        courseDetails: getCourseDetails(),
        video:         getVideo(),
        levels:        getLevels(),
        plans:         getPlans(),
        addons:        getAddons(),
        reviews:       getReviews(),
        faqs:          getFaqs(),
        content:       getContent(),
      });
    };
    window.addEventListener('th3ory_data_change', handler);

    // Initial hydration from Supabase database
    fetchSiteSettingsFromSupabase().then(settings => {
      if (settings) {
        Object.keys(settings).forEach(key => {
          try {
            localStorage.setItem(`th3ory_admin_${key}`, JSON.stringify(settings[key]));
          } catch {}
        });
        window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'all' } }));
      }
    });

    fetchCourseContentsFromSupabase().then(sbContent => {
      if (sbContent && sbContent.length > 0) {
        try {
          localStorage.setItem('th3ory_admin_content', JSON.stringify(sbContent));
          window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'content' } }));
        } catch {}
      }
    });

    fetchReviewsFromSupabase().then(sbReviews => {
      if (sbReviews && sbReviews.length > 0) {
        try {
          localStorage.setItem('th3ory_admin_reviews', JSON.stringify(sbReviews));
          window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'reviews' } }));
        } catch {}
      }
    });

    // Supabase Realtime Subscriptions
    const unsubSettings = subscribeToSiteSettings((key, val) => {
      try {
        localStorage.setItem(`th3ory_admin_${key}`, JSON.stringify(val));
        window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key } }));
      } catch {}
    });

    const unsubReviews = subscribeToReviews((reviewsList) => {
      try {
        localStorage.setItem('th3ory_admin_reviews', JSON.stringify(reviewsList));
        window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'reviews' } }));
      } catch {}
    });

    const unsubContents = subscribeToCourseContents((contentsList) => {
      try {
        localStorage.setItem('th3ory_admin_content', JSON.stringify(contentsList));
        window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'content' } }));
      } catch {}
    });

    return () => {
      window.removeEventListener('th3ory_data_change', handler);
      unsubSettings();
      unsubReviews();
      unsubContents();
    };
  }, []);

  const save = useCallback((key, value) => {
    if (!isAdminAuthenticated()) {
      alert('Access Control Denied: You must be logged in as Admin to save updates.');
      return false;
    }
    try {
      lsSet(key, value);
      saveSiteSettingsToSupabase(key, value).catch(() => {});
      setLastSaved(new Date());
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, []);

  const reset = useCallback((key) => {
    if (!isAdminAuthenticated()) {
      alert('Access Control Denied: You must be logged in as Admin to reset data.');
      return false;
    }
    try {
      if (key === 'all') {
        resetAllData();
      } else {
        lsReset(key);
      }
      setLastSaved(new Date());
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, []);

  return { data, save, reset, defaults, lastSaved, isAdmin: isAdminAuthenticated() };
}
