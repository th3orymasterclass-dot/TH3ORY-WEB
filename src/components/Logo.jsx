import React from 'react';

export default function Logo({ className = "h-12" }) {
  return (
    <img
      src="/logo-transparent.png"
      alt="TH3ORY Logo"
      className={`object-contain mix-blend-screen ${className}`}
    />
  );
}
