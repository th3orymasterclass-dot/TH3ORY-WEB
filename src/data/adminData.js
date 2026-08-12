// Admin-aware data layer
// All components should use these getters instead of direct imports
// Admin saves override defaults in localStorage

import {
  courseDetails as defaultCourseDetails,
  videoPreviewData as defaultVideo,
  roadmapLevels as defaultLevels,
  pricingPlans as defaultPlans,
  courseAddons as defaultAddons,
  studentReviews as defaultReviews,
  faqList as defaultFaqs,
} from './courseData';

const LS_PREFIX = 'th3ory_admin_';

/**
 * Access Control Helper: Check if session has active Admin Authorization
 */
export function isAdminAuthenticated() {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('th3ory_admin_auth') === '1';
  } catch {
    return false;
  }
}

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key, value) {
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required to update website data.');
    throw new Error('Access Control Denied: Admin authentication required.');
  }
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  // Notify same-tab listeners
  window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key } }));
}

export function lsReset(key) {
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required to reset website data.');
    throw new Error('Access Control Denied: Admin authentication required.');
  }
  localStorage.removeItem(LS_PREFIX + key);
  window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key } }));
}

export function resetAllData() {
  if (!isAdminAuthenticated()) {
    console.error('[Access Control Denied] Authorised Admin session required to reset website data.');
    throw new Error('Access Control Denied: Admin authentication required.');
  }
  const keys = ['courseDetails','video','levels','plans','addons','reviews','faqs','content'];
  keys.forEach(k => localStorage.removeItem(LS_PREFIX + k));
  window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'all' } }));
}

// ─── Live getters used by public components ────────────────────────────────────
export const getCourseDetails = () => lsGet('courseDetails', defaultCourseDetails);
export const getVideo         = () => lsGet('video', defaultVideo);
export const getLevels        = () => lsGet('levels', defaultLevels);
export const getPlans         = () => lsGet('plans', defaultPlans);
export const getAddons        = () => lsGet('addons', defaultAddons);
export const getReviews       = () => lsGet('reviews', defaultReviews);
export const getFaqs          = () => lsGet('faqs', defaultFaqs);
export const getContent       = () => lsGet('content', []);

// ─── Defaults (used by admin to reset) ────────────────────────────────────────
export const defaults = {
  courseDetails: defaultCourseDetails,
  video: defaultVideo,
  levels: defaultLevels,
  plans: defaultPlans,
  addons: defaultAddons,
  reviews: defaultReviews,
  faqs: defaultFaqs,
  content: [],
};
