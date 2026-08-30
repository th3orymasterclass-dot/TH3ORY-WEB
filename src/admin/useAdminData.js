import { useState, useEffect, useCallback } from 'react';
import {
  lsSet, lsReset, resetAllData, defaults, isAdminAuthenticated,
  getCourseDetails, getVideo, getLevels,
  getPlans, getAddons, getReviews, getFaqs, getContent, getCoupons,
  getOfflineTrainings, getCampaign, getContact, getSectionVisibility
} from '../data/adminData.js';
import {
  fetchCourseContentsFromSupabase,
  fetchSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
  subscribeToSiteSettings,
  subscribeToReviews,
  fetchReviewsFromSupabase,
  subscribeToCourseContents,
  fetchEnrollmentsFromSupabase,
  subscribeToEnrollments,
  fetchQueriesFromSupabase,
  subscribeToQueries,
  fetchEnterpriseQuotesFromSupabase,
  subscribeToEnterpriseQuotes,
  fetchContactInquiriesFromSupabase,
  subscribeToContactInquiries,
  fetchNewsletterSubscribersFromSupabase,
  subscribeToNewsletterSubscribers,
  fetchNewsletterBroadcastsFromSupabase,
  subscribeToNewsletterBroadcasts,
  saveNewsletterBroadcastToSupabase,
  updateQueryStatusInSupabase,
  deleteQueryFromSupabase,
  updateEnterpriseQuoteStatusInSupabase,
  updateContactInquiryStatusInSupabase,
  updateNewsletterSubscriberStatusInSupabase,
  deleteNewsletterSubscriberFromSupabase,
} from '../services/supabaseService.js';

export default function useAdminData() {
  const [data, setData] = useState(() => ({
    courseDetails:    getCourseDetails(),
    video:            getVideo(),
    levels:           getLevels(),
    plans:            getPlans(),
    addons:           getAddons(),
    reviews:          getReviews(),
    faqs:             getFaqs(),
    content:          getContent(),
    coupons:          getCoupons(),
    offlineTrainings: getOfflineTrainings(),
    campaign:         getCampaign(),
    contact:          getContact(),
    sectionVisibility: getSectionVisibility(),
  }));

  const [enrollments, setEnrollments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [enterpriseQuotes, setEnterpriseQuotes] = useState([]);
  const [contactInquiries, setContactInquiries] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [newsletterBroadcasts, setNewsletterBroadcasts] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);

  // Re-read after any save & hydrate from Supabase Realtime
  useEffect(() => {
    const handler = () => {
      setData({
        courseDetails:    getCourseDetails(),
        video:            getVideo(),
        levels:           getLevels(),
        plans:            getPlans(),
        addons:           getAddons(),
        reviews:          getReviews(),
        faqs:             getFaqs(),
        content:          getContent(),
        coupons:          getCoupons(),
        offlineTrainings: getOfflineTrainings(),
        campaign:         getCampaign(),
        contact:          getContact(),
        sectionVisibility: getSectionVisibility(),
      });
    };
    window.addEventListener('th3ory_data_change', handler);

    // 1. Initial hydration from Supabase database
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

    const setDeduplicatedQueries = (rawList) => {
      if (!Array.isArray(rawList)) {
        setQueries([]);
        return;
      }
      const uniqueMap = new Map();
      rawList.forEach(q => {
        if (!q) return;
        const compKey = `${(q.studentEmail || '').trim().toLowerCase()}_${(q.subject || '').trim()}_${(q.message || '').trim()}`;
        if (!uniqueMap.has(compKey)) {
          uniqueMap.set(compKey, q);
        } else {
          const existing = uniqueMap.get(compKey);
          if (q.status && q.status !== 'open' && existing.status === 'open') {
            uniqueMap.set(compKey, q);
          }
        }
      });
      setQueries(Array.from(uniqueMap.values()));
    };

    // 2. Fetch Enrollments, Queries, Quotes, Inquiries, Subscribers & Broadcasts
    fetchEnrollmentsFromSupabase().then(res => setEnrollments(res));
    fetchQueriesFromSupabase().then(res => { if (res) setDeduplicatedQueries(res); });
    fetchEnterpriseQuotesFromSupabase().then(res => { if (res) setEnterpriseQuotes(res); });
    fetchContactInquiriesFromSupabase().then(res => { if (res) setContactInquiries(res); });
    fetchNewsletterSubscribersFromSupabase().then(res => { if (res) setNewsletterSubscribers(res); });
    fetchNewsletterBroadcastsFromSupabase().then(res => { if (res) setNewsletterBroadcasts(res); });

    // 3. Supabase Realtime Subscriptions
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

    const unsubEnrollments = subscribeToEnrollments((enrollmentsList) => {
      setEnrollments(enrollmentsList);
    });

    const unsubQueries = subscribeToQueries((queriesList) => {
      setDeduplicatedQueries(queriesList);
    });

    const unsubQuotes = subscribeToEnterpriseQuotes((quotesList) => {
      setEnterpriseQuotes(quotesList);
    });

    const unsubInquiries = subscribeToContactInquiries((inquiriesList) => {
      setContactInquiries(inquiriesList);
    });

    const unsubSubscribers = subscribeToNewsletterSubscribers((subsList) => {
      setNewsletterSubscribers(subsList);
    });

    const unsubBroadcasts = subscribeToNewsletterBroadcasts((broadcastsList) => {
      setNewsletterBroadcasts(broadcastsList);
    });

    return () => {
      window.removeEventListener('th3ory_data_change', handler);
      unsubSettings();
      unsubReviews();
      unsubContents();
      unsubEnrollments();
      unsubQueries();
      unsubQuotes();
      unsubInquiries();
      unsubSubscribers();
      unsubBroadcasts();
    };
  }, []);

  const save = useCallback((key, value) => {
    if (!isAdminAuthenticated()) {
      console.warn('[Access Control Denied] You must be logged in as Admin to save updates.');
      return false;
    }
    try {
      lsSet(key, value);
      saveSiteSettingsToSupabase(key, value).catch(() => {});
      setLastSaved(new Date());
      return true;
    } catch (err) {
      console.error('[Admin Save Error]:', err.message);
      return false;
    }
  }, []);

  const reset = useCallback((key) => {
    if (!isAdminAuthenticated()) {
      console.warn('[Access Control Denied] You must be logged in as Admin to reset data.');
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
      console.error('[Admin Reset Error]:', err.message);
      return false;
    }
  }, []);

  const updateQueryStatus = useCallback(async (queryId, status, replyText = '', subject = null, email = null) => {
    setQueries(prev => prev.map(q => {
      if (
        q.id === queryId ||
        q.subject === queryId ||
        (subject && q.subject === subject && (!email || (q.studentEmail || '').toLowerCase() === (email || '').toLowerCase()))
      ) {
        return {
          ...q,
          status,
          reply: replyText !== undefined && replyText !== '' ? replyText : q.reply,
          repliedAt: replyText ? new Date().toISOString() : q.repliedAt
        };
      }
      return q;
    }));

    await updateQueryStatusInSupabase(queryId, status, replyText, subject, email);
    setLastSaved(new Date());
    return true;
  }, []);

  const deleteQuery = useCallback(async (queryId) => {
    setQueries(prev => prev.filter(q => q.id !== queryId));
    await deleteQueryFromSupabase(queryId);
    setLastSaved(new Date());
  }, []);

  return {
    data,
    save,
    reset,
    defaults,
    lastSaved,
    enrollments,
    queries,
    enterpriseQuotes,
    contactInquiries,
    newsletterSubscribers,
    newsletterBroadcasts,
    saveBroadcast: saveNewsletterBroadcastToSupabase,
    updateQueryStatus,
    deleteQuery,
    updateQuoteStatus: updateEnterpriseQuoteStatusInSupabase,
    updateInquiryStatus: updateContactInquiryStatusInSupabase,
    updateSubscriberStatus: updateNewsletterSubscriberStatusInSupabase,
    deleteSubscriber: deleteNewsletterSubscriberFromSupabase,
    isAdmin: isAdminAuthenticated()
  };
}
