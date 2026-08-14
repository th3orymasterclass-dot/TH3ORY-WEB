import React from 'react';
import { useTh3oryLive } from '../data/adminData';

export default function StructuredData() {
  const { faqs, reviews, plans } = useTh3oryLive();
  const mainPlan = plans[0] || { priceFull: 149, priceINR: 11999 };

  // 1. Course Schema
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "TH3ORY: Masterclass of Psychological Influence & Behavioral Engineering",
    "description": "A 30-day intensive online masterclass covering non-verbal behavioral engineering, cognitive dynamics, decision architecture, and high-impact psychological influence.",
    "courseCode": "TH3ORY-2026",
    "educationalCredentialAwarded": "TH3ORY Masterclass Certificate of Completion",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Mentalist Sravan Production",
      "url": "https://th3ory.online",
      "logo": "https://th3ory.online/logo.png"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": "P30D",
      "instructor": {
        "@type": "Person",
        "name": "Mentalist Sravan",
        "jobTitle": "Behavioral Engineer & Psychological Performer",
        "description": "Founder of Mentalist Sravan Production and lead instructor of TH3ORY Masterclass."
      }
    },
    "offers": [
      {
        "@type": "Offer",
        "category": "Paid",
        "price": mainPlan.priceFull || "149",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://th3ory.online/#/enroll"
      },
      {
        "@type": "Offer",
        "category": "Paid",
        "price": mainPlan.priceINR || "11999",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://th3ory.online/#/enroll"
      }
    ]
  };

  // 2. FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (faqs || []).map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // 3. Organization Schema
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Mentalist Sravan Production",
    "url": "https://th3ory.online",
    "logo": "https://th3ory.online/logo.png",
    "sameAs": [
      "https://th3ory.online",
      "https://youtube.com",
      "https://instagram.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "th3orymasterclass@gmail.com",
      "contactType": "customer support",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  // 4. AggregateRating & Reviews Schema
  const reviewCount = reviews?.length || 10;
  const avgRating = 4.9;

  const ratingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "TH3ORY Masterclass Enrollment Access",
    "image": "https://th3ory.online/logo.png",
    "description": "30-Day Masterclass on Behavioral Engineering & Psychological Influence",
    "brand": {
      "@type": "Brand",
      "name": "Mentalist Sravan Production"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "bestRating": "5",
      "ratingCount": reviewCount,
      "reviewCount": reviewCount
    },
    "review": (reviews || []).slice(0, 5).map(rev => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rev.rating || 5,
        "bestRating": 5
      },
      "author": {
        "@type": "Person",
        "name": rev.name
      },
      "reviewBody": rev.comment
    }))
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://th3ory.online/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Curriculum",
        "item": "https://th3ory.online/#pillars"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Pricing",
        "item": "https://th3ory.online/#pricing"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Enrollment",
        "item": "https://th3ory.online/#/enroll"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
