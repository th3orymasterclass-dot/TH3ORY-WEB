import React, { useEffect, useRef, useState } from 'react';

/**
 * PhilosophicalBackground
 * 
 * A high-visibility, GPU-accelerated background visualization representing the core philosophy
 * of TH3ORY Masterclass: The Architecture of Influence, Sacred Cognitive Ciphers, and
 * Synaptic Resonance.
 * 
 * Architecture:
 * - Positioned at `fixed inset-0 pointer-events-none z-0` so it sits directly beneath page content
 * - 1. Sacred Perception Cipher: Concentric golden ratio rings with cardinal ticks and rotating triad
 * - 2. Synaptic Neural Constellation: Crisp glowing nodes (gold/violet) with traveling energy pulses
 * - 3. Quantum Stardust Embers: Parallax floating particles drifting with scroll velocity
 * - 4. Interactive Pointer / Touch Gravitational Field: Dynamic luminous aura attracting neural nodes
 * - 5. Ambient Nebulae: Pulsing deep violet and golden atmosphere
 */
export default function PhilosophicalBackground({
  variant = 'default',
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    radius: 200
  });

  const scrollRef = useRef({
    progress: 0,
    targetProgress: 0,
    scrollY: 0,
    velocity: 0,
    lastScrollY: 0
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Track global scroll progression with dampening
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      
      const velocity = scrollY - scrollRef.current.lastScrollY;
      scrollRef.current.targetProgress = progress;
      scrollRef.current.scrollY = scrollY;
      scrollRef.current.velocity = velocity;
      scrollRef.current.lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track pointer / touch coordinates
  useEffect(() => {
    const handlePointerMove = (e) => {
      pointerRef.current.targetX = e.clientX;
      pointerRef.current.targetY = e.clientY;
      pointerRef.current.active = true;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        pointerRef.current.targetX = e.touches[0].clientX;
        pointerRef.current.targetY = e.touches[0].clientY;
        pointerRef.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ─── 1. SYNAPTIC NODES ───────────────────────────────────────────────
    const nodeCount = Math.min(Math.floor((width * height) / 16000), 75);
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx: (Math.random() - 0.5) * 0.45,
        baseVy: (Math.random() - 0.5) * 0.45,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2.2 + 2.0, // 2.0px - 4.2px
        color: Math.random() > 0.4 ? '#7C5CFC' : '#FFC857',
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.025 + Math.random() * 0.025,
        layer: Math.random()
      });
    }

    // ─── 2. QUANTUM STARDUST PARTICLES ────────────────────────────────────
    const emberCount = 35;
    const embers = [];
    for (let e = 0; e < emberCount; e++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -0.3 - Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.25,
        color: Math.random() > 0.5 ? '#FFC857' : '#A78BFA'
      });
    }

    // Synaptic pulses traveling along connections
    const pulses = [];
    const MAX_PULSES = 25;

    let time = 0;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.012;

      // Smooth lerp for scroll progress
      scrollRef.current.progress += (scrollRef.current.targetProgress - scrollRef.current.progress) * 0.1;
      const progress = scrollRef.current.progress;

      // Smooth lerp for pointer
      if (pointerRef.current.active) {
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.14;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.14;
      } else {
        // Idle gentle float if pointer is inactive
        const idleTargetX = width * 0.5 + Math.cos(time * 0.5) * (width * 0.22);
        const idleTargetY = height * 0.4 + Math.sin(time * 0.7) * (height * 0.16);
        pointerRef.current.x += (idleTargetX - pointerRef.current.x) * 0.025;
        pointerRef.current.y += (idleTargetY - pointerRef.current.y) * 0.025;
      }

      ctx.clearRect(0, 0, width, height);

      // ─── 1. DRAW SACRED PERCEPTION CIPHER RINGS (High Visibility) ────────
      const centerX = width * 0.5 + (pointerRef.current.x - width * 0.5) * 0.05;
      const centerY = height * 0.45 + (pointerRef.current.y - height * 0.5) * 0.05;
      const baseRadius = Math.min(width, height) * 0.36;

      // Dynamic rotation with scroll speed
      const scrollRotationMultiplier = scrollRef.current.velocity * 0.002;
      const ringRotation1 = time * 0.35 + progress * Math.PI * 3 + scrollRotationMultiplier;
      const ringRotation2 = -time * 0.22 - progress * Math.PI * 2.2;
      const ringRotation3 = time * 0.18 + progress * Math.PI * 1.5;

      ctx.save();
      ctx.translate(centerX, centerY);

      // A. Center Singularity Radial Glow
      const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.35);
      centerGlow.addColorStop(0, 'rgba(255, 200, 87, 0.22)');
      centerGlow.addColorStop(0.35, 'rgba(124, 92, 252, 0.16)');
      centerGlow.addColorStop(1, 'rgba(7, 10, 17, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // B. Outer Cipher Ring (Perception Horizon)
      ctx.save();
      ctx.rotate(ringRotation1);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * (1 + progress * 0.1), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 14, 3, 14]);
      ctx.stroke();

      // Cardinal & Subcardinal Ticks on the Horizon
      for (let a = 0; a < 16; a++) {
        const rad = (a * Math.PI) / 8;
        const isMajor = a % 4 === 0;
        const r1 = baseRadius * (1 + progress * 0.1) - (isMajor ? 10 : 5);
        const r2 = baseRadius * (1 + progress * 0.1) + (isMajor ? 10 : 5);
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * r1);
        ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2);
        ctx.strokeStyle = isMajor ? 'rgba(255, 200, 87, 0.75)' : 'rgba(124, 92, 252, 0.45)';
        ctx.lineWidth = isMajor ? 2.2 : 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // C. Mid Golden Ratio Ring (Behavioral Resonance)
      ctx.save();
      ctx.rotate(ringRotation2);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.618, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([8, 10, 2, 8]);
      ctx.stroke();

      // Subconscious Geometric Triad
      ctx.beginPath();
      for (let t = 0; t < 3; t++) {
        const angle = (t * Math.PI * 2) / 3;
        const tx = Math.cos(angle) * (baseRadius * 0.618);
        const ty = Math.sin(angle) * (baseRadius * 0.618);
        if (t === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // D. Inner Cognitive Core
      ctx.save();
      ctx.rotate(ringRotation3);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.28, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(147, 119, 255, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([14, 8]);
      ctx.stroke();

      // Core Reticle Crosshair
      const reticleSize = baseRadius * 0.14;
      ctx.beginPath();
      ctx.moveTo(-reticleSize, 0);
      ctx.lineTo(reticleSize, 0);
      ctx.moveTo(0, -reticleSize);
      ctx.lineTo(0, reticleSize);
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore center transform

      // ─── 2. QUANTUM STARDUST EMBERS (Parallax Floating) ─────────────────
      for (let e = 0; e < embers.length; e++) {
        const ember = embers[e];
        ember.y += ember.vy - scrollRef.current.velocity * 0.04;
        ember.x += ember.vx + Math.sin(time + e) * 0.2;

        if (ember.y < -10) ember.y = height + 10;
        if (ember.y > height + 10) ember.y = -10;
        if (ember.x < -10) ember.x = width + 10;
        if (ember.x > width + 10) ember.x = -10;

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = ember.color === '#FFC857' 
          ? `rgba(255, 200, 87, ${ember.alpha})` 
          : `rgba(167, 139, 250, ${ember.alpha})`;
        ctx.fill();
      }

      // ─── 3. SYNAPTIC NEURAL MATRIX NODES & CONNECTIONS ──────────────────
      const maxConnectDist = Math.min(width, height) * 0.26;
      const pointerRadius = pointerRef.current.radius;
      const pointerX = pointerRef.current.x;
      const pointerY = pointerRef.current.y;

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Motion physics with depth parallax
        const depthFactor = 0.6 + n.layer * 0.5;
        n.x += (n.baseVx + n.vx) * depthFactor;
        n.y += (n.baseVy + n.vy) * depthFactor - scrollRef.current.velocity * 0.02 * n.layer;

        // Dampen velocity impulses
        n.vx *= 0.93;
        n.vy *= 0.93;

        // Wrap around boundaries
        if (n.x < -30) n.x = width + 30;
        if (n.x > width + 30) n.x = -30;
        if (n.y < -30) n.y = height + 30;
        if (n.y > height + 30) n.y = -30;

        // Interactive Pointer / Touch Gravitational Attractor
        const dxP = pointerX - n.x;
        const dyP = pointerY - n.y;
        const distP = Math.hypot(dxP, dyP);

        let isNearPointer = false;
        if (distP < pointerRadius && distP > 1) {
          isNearPointer = true;
          const force = (1 - distP / pointerRadius) * 1.1;
          n.vx += (dxP / distP) * force;
          n.vy += (dyP / distP) * force;
        }

        // Breathing pulse
        n.pulse += n.pulseSpeed;
        const pulseScale = 1 + Math.sin(n.pulse) * 0.3;

        // Draw node
        ctx.beginPath();
        const currentRadius = isNearPointer ? n.radius * 1.4 : n.radius * pulseScale;
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        
        ctx.fillStyle = n.color === '#FFC857' ? 'rgba(255, 200, 87, 0.95)' : 'rgba(147, 119, 255, 0.95)';
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isNearPointer ? 18 : 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.42; // High contrast
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            
            ctx.strokeStyle = n.color === '#FFC857' || n2.color === '#FFC857'
              ? `rgba(255, 200, 87, ${alpha * 1.3})`
              : `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = isNearPointer ? 1.8 : 1.2;
            ctx.stroke();

            // Spawn synaptic energy pulses
            if (pulses.length < MAX_PULSES && Math.random() < 0.0035) {
              pulses.push({
                fromX: n.x,
                fromY: n.y,
                toX: n2.x,
                toY: n2.y,
                t: 0,
                speed: 0.02 + Math.random() * 0.025,
                color: Math.random() > 0.4 ? '#FFC857' : '#E9E4FF'
              });
            }
          }
        }
      }

      // ─── 4. DRAW TRAVELING SYNAPTIC PULSES ─────────────────────────────────
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.t += pulse.speed;

        if (pulse.t >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const currX = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.t;
        const currY = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.t;

        ctx.beginPath();
        ctx.arc(currX, currY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── 5. POINTER / TOUCH LUMINOUS SPOTLIGHT AURA ────────────────────────
      if (pointerRef.current.active) {
        const glowGrad = ctx.createRadialGradient(
          pointerX, pointerY, 0,
          pointerX, pointerY, pointerRadius * 1.4
        );
        glowGrad.addColorStop(0, 'rgba(255, 200, 87, 0.18)');
        glowGrad.addColorStop(0.35, 'rgba(124, 92, 252, 0.14)');
        glowGrad.addColorStop(1, 'rgba(7, 10, 17, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, pointerRadius * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070A11] ${className}`}
      aria-hidden="true"
    >
      {/* Deep Obsidian Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Atmospheric Nebula Spotlights that gently modulate with scroll */}
      <div 
        className="absolute top-0 left-1/4 w-[850px] h-[850px] rounded-full bg-[#7C5CFC]/25 blur-[160px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${Math.sin(scrollRef.current.progress * Math.PI) * 140}px, 0)`
        }}
      />
      <div 
        className="absolute top-1/3 right-10 w-[750px] h-[750px] rounded-full bg-[#FFC857]/15 blur-[180px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${-Math.cos(scrollRef.current.progress * Math.PI) * 120}px, 0)`
        }}
      />
      <div 
        className="absolute bottom-10 left-1/3 w-[900px] h-[650px] rounded-full bg-[#6344E0]/20 blur-[190px] pointer-events-none"
      />

      {/* Film Grain Texture */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#FAFAF7 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
