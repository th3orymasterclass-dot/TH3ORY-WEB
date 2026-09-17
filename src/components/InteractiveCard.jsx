import React from 'react';

/**
 * InteractiveCard
 * 
 * Clean, lightweight card container without cursor-responsive 3D tilt or mouse-tracking sheen.
 * Animation is retained exclusively in the background.
 */
export default function InteractiveCard({
  children,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl ${className}`}
      {...props}
    >
      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </div>
  );
}
