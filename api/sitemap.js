import fs from 'fs';
import path from 'path';

/**
 * Serverless / Edge API handler for /sitemap.xml
 * Returns valid XML sitemap with secured caching and bot-indexing headers
 */
export default function handler(req, res) {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- 1. Home / Primary Landing Page -->
  <url>
    <loc>https://th3ory.online/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://th3ory.online/logo.png</image:loc>
      <image:title>TH3ORY Masterclass of Influencing Logo</image:title>
      <image:caption>Official Brand Identity for TH3ORY Masterclass powered by Mentalist Sravan Production</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://th3ory.online/instructor.png</image:loc>
      <image:title>Mentalist Sravan - Lead Instructor</image:title>
      <image:caption>Mentalist Sravan, Psychological Illusionist and Behavioral Engineering Instructor</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://th3ory.online/founding_launch_poster.png</image:loc>
      <image:title>TH3ORY Masterclass Founding Launch Poster</image:title>
      <image:caption>Official 30-Day Human Influence and Behavioral Engineering Masterclass</image:caption>
    </image:image>
  </url>

  <!-- 2. Masterclass Enrollment & Access -->
  <url>
    <loc>https://th3ory.online/enroll</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- 3. Curriculum Architecture & Deep Dive -->
  <url>
    <loc>https://th3ory.online/masterclass</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>

  <!-- 4. Enterprise Behavioral Consulting & Diagnostics -->
  <url>
    <loc>https://th3ory.online/enterprise</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- 5. University & Institutional Workshops -->
  <url>
    <loc>https://th3ory.online/colleges</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- 6. Affiliate Partner Network -->
  <url>
    <loc>https://th3ory.online/affiliate</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- 7. Campus Ambassador Recruitment -->
  <url>
    <loc>https://th3ory.online/ambassador</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- 8. Certificate Verification Portal -->
  <url>
    <loc>https://th3ory.online/verify</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>

  <!-- 9. Privacy Policy & DPDP Legal Framework -->
  <url>
    <loc>https://th3ory.online/privacy</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.50</priority>
  </url>
</urlset>`;

  // Explicit secured headers for Google Search Console & Search Crawlers
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'all');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  return res.status(200).send(xmlContent);
}
