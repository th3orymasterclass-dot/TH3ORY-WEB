import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * InteractiveCard
 * 
 * High-performance 3D perspective tilt card with touch and cursor responsive
 * holographic specular sheen.
 * 
 * Supports:
 * - Desktop: Smooth 3D tilt tracking cursor coordinates, dynamic radial specular spotlight, edge luminescence.
 * - Mobile Touch: Physical touch tracking and tilt with spring reset on touch end.
 * - Accessibility: Native prefers-reduced-motion detection.
 */
export default function InteractiveCard({
  children,
  className = '',
  glowColor = 'gold', // 'gold' | 'violet' | 'indigo' | 'emerald' | 'amber'
  maxTilt = 8, // Maximum tilt angle in degrees
  scale = 1.015, // Scale on hover/touch
  perspective = 1000,
  disabled = false,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [transformStyle, setTransformStyle] = useState('');
  const [specularPos, setSpecularPos] = useState({ x: 50, y: 50 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Glow color definitions
  const glowMap = {
    gold: {
      sheen: 'radial-gradient(circle 320px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 200, 87, 0.18), rgba(229, 170, 48, 0.05), transparent 70%)',
      border: 'rgba(255, 200, 87, 0.45)',
      ambient: 'rgba(255, 200, 87, 0.12)'
    },
    violet: {
      sheen: 'radial-gradient(circle 320px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(124, 92, 252, 0.22), rgba(99, 68, 224, 0.06), transparent 70%)',
      border: 'rgba(124, 92, 252, 0.50)',
      ambient: 'rgba(124, 92, 252, 0.15)'
    },
    indigo: {
      sheen: 'radial-gradient(circle 320px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(99, 102, 241, 0.20), rgba(79, 70, 229, 0.05), transparent 70%)',
      border: 'rgba(99, 102, 241, 0.45)',
      ambient: 'rgba(99, 102, 241, 0.14)'
    },
    emerald: {
      sheen: 'radial-gradient(circle 320px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(16, 185, 129, 0.20), rgba(5, 150, 105, 0.05), transparent 70%)',
      border: 'rgba(16, 185, 129, 0.45)',
      ambient: 'rgba(16, 185, 129, 0.14)'
    },
    amber: {
      sheen: 'radial-gradient(circle 320px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(245, 158, 11, 0.20), rgba(217, 119, 6, 0.05), transparent 70%)',
      border: 'rgba(245, 158, 11, 0.45)',
      ambient: 'rgba(245, 158, 11, 0.14)'
    }
  };

  const currentGlow = glowMap[glowColor] || glowMap.gold;

  const handlePointerMove = useCallback((clientX, clientY) => {
    if (disabled || prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative mouse coordinate in card (0 to 1)
    const xRatio = (clientX - rect.left) / width;
    const yRatio = (clientY - rect.top) / height;

    const xPct = Math.min(Math.max(xRatio * 100, 0), 100);
    const yPct = Math.min(Math.max(yRatio * 100, 0), 100);
    setSpecularPos({ x: xPct, y: yPct });

    // Calculate 3D tilt
    const tiltX = (0.5 - yRatio) * maxTilt;
    const tiltY = (xRatio - 0.5) * maxTilt;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
  }, [disabled, prefersReducedMotion, maxTilt, perspective, scale]);

  const handleMouseMove = (e) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleMouseEnter = () => {
    if (disabled || prefersReducedMotion) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  const handleTouchStart = (e) => {
    if (disabled || prefersReducedMotion) return;
    setIsTouched(true);
    if (e.touches && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (disabled || prefersReducedMotion) return;
    if (e.touches && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  const isActive = isHovered || isTouched;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className={`relative rounded-2xl transition-all duration-300 ${className}`}
      style={{
        transform: !disabled && !prefersReducedMotion ? transformStyle : undefined,
        transformStyle: 'preserve-3d',
        transition: isActive
          ? 'transform 0.12s ease-out, box-shadow 0.25s ease'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease',
        boxShadow: isActive
          ? `0 20px 45px -12px ${currentGlow.ambient}, 0 0 0 1px ${currentGlow.border}`
          : undefined,
        ...props.style
      }}
      {...props}
    >
      {/* Dynamic Specular Holographic Sheen Layer */}
      {!disabled && !prefersReducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-10 overflow-hidden"
          style={{
            opacity: isActive ? 1 : 0,
            background: currentGlow.sheen,
            '--glow-x': `${specularPos.x}%`,
            '--glow-y': `${specularPos.y}%`
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Child Content */}
      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </div>
  );
}
