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
  defaultContent,
} from './courseData.js';

const LS_PREFIX = 'th3ory_admin_';

/**
 * Access Control Helper: Check if session has active Admin Authorization
 */
export function isAdminAuthenticated() {
  try {
    return (
      (typeof sessionStorage !== 'undefined' && (sessionStorage.getItem('th3ory_admin_auth') === '1' || sessionStorage.getItem('th3ory_team_auth') === '1')) ||
      (typeof localStorage !== 'undefined' && (localStorage.getItem('th3ory_admin_auth') === '1' || localStorage.getItem('th3ory_team_auth') === '1'))
    );
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

import { useState, useEffect } from 'react';
import {
  fetchSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
  subscribeToSiteSettings,
  fetchReviewsFromSupabase,
  subscribeToReviews,
  fetchCourseContentsFromSupabase,
  subscribeToCourseContents,
} from '../services/supabaseService.js';

export const defaultCoupons = [
  {
    id: 'c_th3ory20',
    code: 'TH3ORY20',
    affiliation: 'General Promotion',
    discountType: 'percentage',
    discountValue: 20,
    partnerContact: 'support@th3ory.online',
    description: 'Standard 20% discount across all TH3ORY Masterclass plans',
    validUntil: '2027-12-31',
    maxUses: 1000,
    usedCount: 14,
    isActive: true,
    targetPlan: 'all',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'c_th3ory0',
    code: 'TH3ORY0',
    affiliation: 'Internal QA & Live Test',
    discountType: 'percentage',
    discountValue: 99.9,
    partnerContact: 'qa@th3ory.online',
    description: 'Private 99.9% test coupon (reduces ₹11,999 to ₹12 INR for live gateway testing)',
    validUntil: '2028-12-31',
    maxUses: 500,
    usedCount: 5,
    isActive: true,
    targetPlan: 'all',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'c_harvard30',
    code: 'HARVARD30',
    affiliation: 'Harvard Alumni Network',
    discountType: 'percentage',
    discountValue: 30,
    partnerContact: 'alumni@harvard.edu',
    description: 'Exclusive 30% discount for Harvard Alumni cohort',
    validUntil: '2027-06-30',
    maxUses: 200,
    usedCount: 28,
    isActive: true,
    targetPlan: 'all',
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'c_techlead5000',
    code: 'TECHLEAD5000',
    affiliation: 'Tech Leadership Forum',
    discountType: 'fixed',
    discountValue: 5000,
    partnerContact: 'events@techlead.org',
    description: 'Special ₹5,000 discount for Tech Leadership Forum members',
    validUntil: '2026-12-31',
    maxUses: 50,
    usedCount: 12,
    isActive: true,
    targetPlan: 'all',
    createdAt: '2026-03-01T00:00:00.000Z'
  }
];

// ─── Live getters used by public components ────────────────────────────────────
export const getCourseDetails = () => lsGet('courseDetails', defaultCourseDetails);
export const getVideo         = () => lsGet('video', defaultVideo);
export const getLevels        = () => lsGet('levels', defaultLevels);
export const getPlans         = () => lsGet('plans', defaultPlans);
export const getAddons        = () => lsGet('addons', defaultAddons);
export const getReviews       = () => lsGet('reviews', defaultReviews);
export const getFaqs          = () => lsGet('faqs', defaultFaqs);
export const getContent       = () => lsGet('content', defaultContent);
export const getCoupons        = () => lsGet('coupons', defaultCoupons);
export const saveCoupons       = (coupons) => lsSet('coupons', coupons);

/**
 * Validate a custom offer coupon code live against current admin configuration.
 * Returns percentage discount, exact currency savings, final prices, and affiliation details.
 */
export function validateCoupon(inputCode, planId = 'pro', basePriceUSD = 149, basePriceINR = 11999) {
  const code = (inputCode || '').trim().toUpperCase();
  if (!code) {
    return { isValid: false, message: 'Please enter a coupon code.' };
  }

  const coupons = getCoupons();
  const coupon = coupons.find(c => (c.code || '').trim().toUpperCase() === code);

  if (!coupon) {
    return { isValid: false, message: `Coupon code '${code}' is invalid.` };
  }

  if (!coupon.isActive) {
    return { isValid: false, message: `Coupon code '${code}' is currently inactive.` };
  }

  if (coupon.validUntil) {
    const expiry = new Date(coupon.validUntil);
    if (!isNaN(expiry.getTime()) && expiry < new Date()) {
      return { isValid: false, message: `Coupon code '${code}' expired on ${expiry.toLocaleDateString()}.` };
    }
  }

  if (coupon.maxUses && Number(coupon.usedCount || 0) >= Number(coupon.maxUses)) {
    return { isValid: false, message: `Coupon code '${code}' has reached its maximum usage limit.` };
  }

  if (coupon.targetPlan && coupon.targetPlan !== 'all' && planId && coupon.targetPlan !== planId) {
    return { isValid: false, message: `Coupon code '${code}' is only valid for ${coupon.targetPlan.toUpperCase()} plan.` };
  }

  // Calculate discount and percentage
  let discountPercentage = 0;
  let discountAmountUSD = 0;
  let discountAmountINR = 0;

  if (coupon.discountType === 'percentage') {
    discountPercentage = Number(coupon.discountValue || 0);
    discountAmountUSD = Math.round(basePriceUSD * (discountPercentage / 100));
    discountAmountINR = Math.round(basePriceINR * (discountPercentage / 100));
  } else if (coupon.discountType === 'fixed') {
    discountAmountINR = Number(coupon.discountValue || 0);
    discountAmountUSD = Math.round(discountAmountINR / 80); // ~80 INR per USD
    discountPercentage = Math.min(100, Math.round((discountAmountINR / basePriceINR) * 100));
  }

  // Minimum thresholds (₹12 for TH3ORY0, $1 USD min)
  const finalPriceUSD = Math.max(1, basePriceUSD - discountAmountUSD);
  const finalPriceINR = code === 'TH3ORY0' ? 12 : Math.max(12, basePriceINR - discountAmountINR);

  return {
    isValid: true,
    code: coupon.code,
    affiliation: coupon.affiliation || 'General',
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountPercentage,
    discountAmountUSD,
    discountAmountINR,
    finalPriceUSD,
    finalPriceINR,
    coupon,
    message: `✓ ${coupon.affiliation} discount applied! (${discountPercentage}% OFF)`
  };
}

/**
 * Increment usage count for an applied coupon code
 */
export function incrementCouponUsage(inputCode) {
  const code = (inputCode || '').trim().toUpperCase();
  if (!code) return;
  try {
    const coupons = getCoupons();
    const updated = coupons.map(c => {
      if ((c.code || '').trim().toUpperCase() === code) {
        return { ...c, usedCount: (c.usedCount || 0) + 1 };
      }
      return c;
    });
    localStorage.setItem(LS_PREFIX + 'coupons', JSON.stringify(updated));
    // Persist to Supabase site_settings if admin authenticated or via public sync
    fetchSiteSettingsFromSupabase().then(currentSettings => {
      const payload = { ...(currentSettings || {}), coupons: updated };
      saveSiteSettingsToSupabase('coupons', updated).catch(() => {});
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent('th3ory_data_change', { detail: { key: 'coupons' } }));
  } catch (err) {
    console.warn('[Coupons] Error incrementing usage count:', err);
  }
}

/**
 * Custom React Hook for Realtime Component Reactivity across Admin and Public site
 */
export function useTh3oryLive() {
  const [data, setData] = useState(() => ({
    courseDetails: getCourseDetails(),
    video: getVideo(),
    levels: getLevels(),
    plans: getPlans(),
    addons: getAddons(),
    reviews: getReviews(),
    faqs: getFaqs(),
    content: getContent(),
    coupons: getCoupons(),
  }));

  useEffect(() => {
    const handler = () => {
      setData({
        courseDetails: getCourseDetails(),
        video: getVideo(),
        levels: getLevels(),
        plans: getPlans(),
        addons: getAddons(),
        reviews: getReviews(),
        faqs: getFaqs(),
        content: getContent(),
        coupons: getCoupons(),
      });
    };

    window.addEventListener('th3ory_data_change', handler);

    // Initial Hydration from Supabase
    fetchSiteSettingsFromSupabase().then(settings => {
      if (settings) {
        Object.keys(settings).forEach(key => {
          try { localStorage.setItem(`th3ory_admin_${key}`, JSON.stringify(settings[key])); } catch {}
        });
        handler();
      }
    });

    fetchReviewsFromSupabase().then(sbReviews => {
      if (sbReviews && sbReviews.length > 0) {
        try { localStorage.setItem('th3ory_admin_reviews', JSON.stringify(sbReviews)); } catch {}
        handler();
      }
    });

    fetchCourseContentsFromSupabase().then(sbContent => {
      if (sbContent && sbContent.length > 0) {
        try { localStorage.setItem('th3ory_admin_content', JSON.stringify(sbContent)); } catch {}
        handler();
      }
    });

    // Supabase Realtime Subscriptions for Public visitors & Admin
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

  return data;
}

export const defaultGDriveConfig = {
  account: 'th3orymasterclass@gmail.com',
  folderUrl: 'https://drive.google.com/drive/folders/1TH3ORY_Masterclass_Course_Content_Master_Folder',
  folderName: 'TH3ORY Masterclass Official Course Storage',
  subfolders: [
    { title: '01 - Video Teasers & Trailers', path: '/Videos/Trailers' },
    { title: '02 - Core Curriculum Video Lessons', path: '/Videos/Lessons' },
    { title: '03 - Workbooks, PDFs & Cheatsheets', path: '/Documents/Workbooks' },
    { title: '04 - Audio Stems & Practice Files', path: '/Audio/Soundpacks' },
  ]
};

// ─── Defaults (used by admin to reset) ────────────────────────────────────────
export const defaults = {
  courseDetails: defaultCourseDetails,
  video: defaultVideo,
  levels: defaultLevels,
  plans: defaultPlans,
  addons: defaultAddons,
  reviews: defaultReviews,
  faqs: defaultFaqs,
  content: defaultContent,
  coupons: defaultCoupons,
  gdriveConfig: defaultGDriveConfig,
};

