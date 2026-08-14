import React, { useEffect } from 'react';

export default function SEOHead({ 
  title = "TH3ORY | Masterclass of Influencing (30-Day Journey)", 
  description = "A 30-day online masterclass to master the psychology of influence, build magnetic presence, non-verbal engineering, and leave a lasting legacy. Powered by Mentalist Sravan Production.",
  canonicalUrl = "https://th3ory.online",
  ogImage = "https://th3ory.online/logo.png"
}) {
  useEffect(() => {
    // 1. Dynamic Title
    document.title = title;

    // 2. Dynamic Description Meta Tag
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Dynamic Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // 4. Dynamic Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // 5. Dynamic Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

  }, [title, description, canonicalUrl, ogImage]);

  return null;
}
