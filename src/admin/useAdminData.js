import { useState, useEffect, useCallback } from 'react';
import {
  lsSet, lsReset, resetAllData, defaults,
  getCourseDetails, getVideo, getLevels,
  getPlans, getAddons, getReviews, getFaqs, getContent,
} from '../data/adminData';
import { fetchCourseContentsFromSupabase } from '../services/supabaseService';

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

  // Re-read after any save & hydrate from Supabase
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
    fetchCourseContentsFromSupabase().then(sbContent => {
      if (sbContent && sbContent.length > 0) {
        lsSet('content', sbContent);
      }
    });

    return () => window.removeEventListener('th3ory_data_change', handler);
  }, []);

  const save = useCallback((key, value) => {
    lsSet(key, value);
    setLastSaved(new Date());
  }, []);

  const reset = useCallback((key) => {
    if (key === 'all') {
      resetAllData();
    } else {
      lsReset(key);
    }
    setLastSaved(new Date());
  }, []);

  return { data, save, reset, defaults, lastSaved };
}
