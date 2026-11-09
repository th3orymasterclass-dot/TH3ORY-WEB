import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { setStrictCorsHeaders, checkRateLimit, getClientIp, getServerConfig } from './_lib/security.js';

export default async function handler(req, res) {
  if (setStrictCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`order_create_${clientIp}`, 20, 5 * 60 * 1000); // max 20 orders per 5 min
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Order creation rate limit exceeded. Please wait a few moments before trying again.'
    });
  }

  // Check Maintenance Mode Feature Flag
  const maintenanceFlag = process.env.VERCEL_FLAGS_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE;
  if (maintenanceFlag === 'true' || maintenanceFlag === '1') {
    return res.status(503).json({
      success: false,
      error: 'Platform is currently undergoing scheduled maintenance. Live checkout is temporarily paused.'
    });
  }

  const runtimeCfg = getServerConfig();
  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || runtimeCfg.razorpayKeyId;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || runtimeCfg.razorpaySecret;

  if (!razorpayKeyId || !razorpaySecret) {
    console.error('[Razorpay API Error]: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables');
    return res.status(500).json({ success: false, error: 'Payment gateway configuration is missing on server' });
  }

  try {
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      amount: clientAmount,
      currency = 'INR',
      receipt,
      notes = {},
      couponCode,
      planId,
      addonId,
      itemType,
      isMonthly = false,
      selectedAddons = []
    } = body;

    // Official authoritative server plan base prices
    const OFFICIAL_PRICES = {
      INR: {
        'launch-special': 499,
        'starter': 3999,
        'pro': 11999,
        'masterclass': 11999,
        'masterclass-monthly': 4399,
        'elite': 24999,
        'default': 11999
      },
      USD: {
        'launch-special': 9,
        'starter': 49,
        'pro': 149,
        'masterclass': 149,
        'masterclass-monthly': 55,
        'elite': 299,
        'default': 149
      }
    };

    // Official authoritative server Add-on prices
    const OFFICIAL_ADDON_PRICES = {
      coaching: {
        INR: 11920,
        USD: 149,
        title: '1-on-1 Executive Presence & Body Language Review (60 Mins)'
      },
      journal: {
        INR: 3920,
        USD: 49,
        title: 'Physical Deluxe Hardcover 100-Day Influence Journal'
      }
    };

    const targetCurrency = String(currency || 'INR').toUpperCase();
    const validCurrency = (targetCurrency === 'USD') ? 'USD' : 'INR';

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || runtimeCfg.supabaseUrl;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || runtimeCfg.supabaseKey;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    // Load dynamic add-ons from site_settings if present
    const dynamicAddonMap = { ...OFFICIAL_ADDON_PRICES };
    if (supabase) {
      try {
        const { data: addonSetting } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'addons')
          .maybeSingle();
        if (addonSetting && Array.isArray(addonSetting.setting_value)) {
          for (const a of addonSetting.setting_value) {
            if (a && a.id) {
              const usdPrice = Number(a.price) || 49;
              const inrPrice = Number(a.priceINR) || Math.round(usdPrice * 80);
              dynamicAddonMap[String(a.id).toLowerCase()] = {
                INR: inrPrice,
                USD: usdPrice,
                title: a.title || a.id
              };
            }
          }
        }
      } catch (_err) {
        // Fallback to OFFICIAL_ADDON_PRICES
      }
    }

    const resolvedPlanKey = String(planId || notes.planId || 'default').toLowerCase().trim();
    const resolvedAddonKey = String(addonId || notes.addonId || '').toLowerCase().trim();
    const isStandaloneAddon =
      String(itemType || notes.itemType || '').toLowerCase() === 'add-on' ||
      Boolean(resolvedAddonKey && dynamicAddonMap[resolvedAddonKey]) ||
      Boolean(!OFFICIAL_PRICES[validCurrency][resolvedPlanKey] && dynamicAddonMap[resolvedPlanKey]);

    // Determine base price based on plan, monthly option, standalone add-on, or launch offer
    let basePrice = OFFICIAL_PRICES[validCurrency]['default'];
    let orderType = 'plan';

    if (isStandaloneAddon) {
      const targetAddonKey = dynamicAddonMap[resolvedAddonKey] ? resolvedAddonKey : resolvedPlanKey;
      const addonPricing = dynamicAddonMap[targetAddonKey] || OFFICIAL_ADDON_PRICES.journal;
      basePrice = addonPricing[validCurrency] || addonPricing.INR;
      orderType = 'addon';
    } else if (
      (isMonthly || notes.isMonthly === 'true' || notes.isMonthly === true) &&
      (resolvedPlanKey === 'masterclass' || resolvedPlanKey === 'pro' || resolvedPlanKey === 'default')
    ) {
      basePrice = OFFICIAL_PRICES[validCurrency]['masterclass-monthly'];
    } else if (resolvedPlanKey && OFFICIAL_PRICES[validCurrency][resolvedPlanKey]) {
      basePrice = OFFICIAL_PRICES[validCurrency][resolvedPlanKey];
    } else if (Number(clientAmount) === 499 && validCurrency === 'INR') {
      basePrice = 499; // Special launch campaign pricing
    } else if (Number(clientAmount) === 9 && validCurrency === 'USD') {
      basePrice = 9;
    }

    // Server-side coupon verification
    let discountPct = 0;
    let discountFixed = 0;
    const cleanCoupon = String(couponCode || notes.couponCode || notes.couponUsed || '').trim().toUpperCase();

    if (cleanCoupon && cleanCoupon !== 'NONE') {
      if (supabase) {
        try {
          const { data: dbCoupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', cleanCoupon)
            .eq('active', true)
            .maybeSingle();

          if (dbCoupon) {
            const isExpired = dbCoupon.expiry_date && new Date(dbCoupon.expiry_date) < new Date();
            const isExhausted = dbCoupon.max_uses && dbCoupon.current_uses >= dbCoupon.max_uses;
            if (!isExpired && !isExhausted) {
              discountPct = Number(dbCoupon.discount_percentage || 0);
              discountFixed = Number(dbCoupon.discount_amount || 0);
            }
          }

          if (discountPct === 0 && discountFixed === 0) {
            const { data: settingsCoupons } = await supabase
              .from('site_settings')
              .select('setting_value')
              .eq('setting_key', 'coupons')
              .maybeSingle();
            if (settingsCoupons && Array.isArray(settingsCoupons.setting_value)) {
              const matched = settingsCoupons.setting_value.find(
                c => c && String(c.code || '').toUpperCase() === cleanCoupon && c.isActive !== false
              );
              if (matched) {
                const isExpired = matched.validUntil && new Date(matched.validUntil) < new Date();
                const isExhausted = matched.maxUses && Number(matched.usedCount || 0) >= Number(matched.maxUses);
                if (!isExpired && !isExhausted) {
                  if (matched.discountType === 'percentage') discountPct = Number(matched.discountValue || 0);
                  if (matched.discountType === 'fixed') discountFixed = Number(matched.discountValue || 0);
                }
              }
            }
          }
        } catch (_err) {
          // Proceed to static fallback
        }
      }

      // Static authorized promo fallback
      if (discountPct === 0 && discountFixed === 0) {
        if (cleanCoupon === 'EARLYBIRD20' || cleanCoupon === 'TH3ORY20' || cleanCoupon === 'TH3ORY2026') discountPct = 20;
        if (cleanCoupon === 'HARVARD30') discountPct = 30;
        if (cleanCoupon === 'TH3ORY0') discountPct = 99.9;
        if (cleanCoupon === 'TECHLEAD5000') discountFixed = 5000;
        if (cleanCoupon === 'VIP50' && process.env.ENABLE_VIP_DISCOUNT !== 'false') discountPct = 50;
      }
    }

    // Compute discounted base price strictly on the server
    let discountedBaseAmount = basePrice;
    if (discountPct > 0) {
      discountedBaseAmount = Math.max(1, Math.round(basePrice * (1 - discountPct / 100)));
    } else if (discountFixed > 0) {
      const effectiveFixed = (validCurrency === 'USD' && discountFixed > 500)
        ? Math.round(discountFixed / 80)
        : discountFixed;
      discountedBaseAmount = Math.max(1, basePrice - effectiveFixed);
    }

    // Compute bundled Add-ons total (if purchasing a plan + add-ons)
    let addonsAmount = 0;
    const verifiedAddons = [];
    const rawAddonsList = Array.isArray(selectedAddons)
      ? selectedAddons
      : (typeof notes.selectedAddons === 'string' && notes.selectedAddons.trim()
          ? notes.selectedAddons.split(',').map(s => s.trim()).filter(Boolean)
          : []);

    if (!isStandaloneAddon && rawAddonsList.length > 0) {
      for (const item of rawAddonsList) {
        const key = String(typeof item === 'object' && item !== null ? item.id : item).toLowerCase().trim();
        if (key && dynamicAddonMap[key]) {
          const addonPrice = dynamicAddonMap[key][validCurrency] || dynamicAddonMap[key].INR;
          addonsAmount += addonPrice;
          verifiedAddons.push(key);
        }
      }
    }

    const finalAmount = Math.max(1, discountedBaseAmount + addonsAmount);

    // Amount in Razorpay is in sub-units (paise for INR, cents for USD)
    const subUnitMultiplier = 100;
    const orderOptions = {
      amount: Math.round(finalAmount * subUnitMultiplier),
      currency: validCurrency,
      receipt: String(receipt || `ORD-${Date.now()}`).slice(0, 40),
      notes: {
        couponCode: cleanCoupon || 'NONE',
        serverVerifiedPrice: String(finalAmount),
        serverBasePrice: String(basePrice),
        serverAddonsPrice: String(addonsAmount),
        orderType,
        planId: String(isStandaloneAddon ? (resolvedAddonKey || resolvedPlanKey) : (planId || 'masterclass')),
        addons: verifiedAddons.join(',') || 'NONE',
        clientIp
      },
    };

    const order = await instance.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      keyId: razorpayKeyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      pricing: {
        orderType,
        basePrice,
        discountedBaseAmount,
        addonsAmount,
        verifiedAddons,
        finalAmount,
        currency: validCurrency,
        couponCode: cleanCoupon || null
      }
    });
  } catch (error) {
    console.error('[Razorpay Order Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
}
