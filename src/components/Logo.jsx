import React from 'react';

export default function Logo({ className = "h-12", alt = "TH3ORY Logo", lightMode = false, src = "/logo-transparent.png" }) {
  const hasMixBlend = className.includes('mix-blend');
  const blendClass = hasMixBlend ? '' : (lightMode ? '' : 'mix-blend-screen');
  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${blendClass} ${className}`.trim()}
    />
  );
}
