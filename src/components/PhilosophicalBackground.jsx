import React, { useEffect, useRef, useState } from 'react';

/**
 * PhilosophicalBackground
 * 
 * A symbolic, GPU-accelerated background visualization representing the core philosophy
 * of TH3ORY Masterclass: The Architecture of Influence, Cognitive Dynamics, and Unseen
 * Behavioral Threads.
 * 
 * Features:
 * 1. Sacred Perception Rings (Cipher of Influence): Concentric golden ratio rings that counter-rotate and expand with scroll depth.
 * 2. Synaptic Neural Constellation: Dynamic floating nodes with glowing synaptic connections and golden pulse packets.
 * 3. Interactive Gravitational Pointer/Touch Field: Smoothly interpolated (lerp) cursor/touch glow that attracts and excites the matrix.
 * 4. Multi-tier Depth Nebula: Ethereal violet (#7C5CFC), amber gold (#FFC857), and obsidian void layers.
 * 5. High Performance: requestAnimationFrame loop, DPR scaling capped at 2, visibility detection, prefers-reduced-motion support.
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
    radius: 180
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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Node Count scaled by viewport size
    const nodeCount = Math.min(Math.floor((width * height) / 22000), 55);
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx: (Math.random() - 0.5) * 0.35,
        baseVy: (Math.random() - 0.5) * 0.35,
        vx: 0,
        vy: 0,
        radius: Math.random() * 1.8 + 1.2,
        color: Math.random() > 0.38 ? '#7C5CFC' : '#FFC857',
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        layer: Math.random()
      });
    }

    // Synaptic pulses traveling along connections
    const pulses = [];
    const MAX_PULSES = 16;

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

      time += 0.008;

      // Smooth lerp for scroll progress
      scrollRef.current.progress += (scrollRef.current.targetProgress - scrollRef.current.progress) * 0.08;
      const progress = scrollRef.current.progress;

      // Smooth lerp for pointer
      if (pointerRef.current.active) {
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.12;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.12;
      } else {
        // Idle gentle float toward center if pointer is inactive
        const idleTargetX = width * 0.5 + Math.cos(time * 0.7) * (width * 0.18);
        const idleTargetY = height * 0.4 + Math.sin(time * 0.9) * (height * 0.14);
        pointerRef.current.x += (idleTargetX - pointerRef.current.x) * 0.03;
        pointerRef.current.y += (idleTargetY - pointerRef.current.y) * 0.03;
      }

      ctx.clearRect(0, 0, width, height);

      // ─── 1. DRAW SACRED PERCEPTION RINGS (The Cipher of Influence) ──────────
      const centerX = width * 0.5 + (pointerRef.current.x - width * 0.5) * 0.04;
      const centerY = height * 0.45 + (pointerRef.current.y - height * 0.5) * 0.04;
      const baseRadius = Math.min(width, height) * 0.38;

      // Rings rotate dynamically based on scroll depth & subtle time progression
      const ringRotation1 = time * 0.25 + progress * Math.PI * 2.5;
      const ringRotation2 = -time * 0.18 - progress * Math.PI * 1.8;
      const ringRotation3 = time * 0.12 + progress * Math.PI * 1.2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer Cipher Ring (Perception Horizon)
      ctx.save();
      ctx.rotate(ringRotation1);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * (1 + progress * 0.12), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 16, 2, 16]);
      ctx.stroke();

      // Cardinal tick marks on the horizon
      for (let a = 0; a < 12; a++) {
        const rad = (a * Math.PI) / 6;
        const r1 = baseRadius * (1 + progress * 0.12) - 6;
        const r2 = baseRadius * (1 + progress * 0.12) + 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * r1);
        ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2);
        ctx.strokeStyle = a % 3 === 0 ? 'rgba(255, 200, 87, 0.22)' : 'rgba(124, 92, 252, 0.12)';
        ctx.lineWidth = a % 3 === 0 ? 1.5 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // Mid Golden Ratio Ring (Behavioral Resonance)
      ctx.save();
      ctx.rotate(ringRotation2);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.618 * (1 - progress * 0.05), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.10)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12, 1, 8]);
      ctx.stroke();

      // Subconscious Geometric Triad (Equilateral focus)
      ctx.beginPath();
      for (let t = 0; t < 3; t++) {
        const angle = (t * Math.PI * 2) / 3;
        const tx = Math.cos(angle) * (baseRadius * 0.618);
        const ty = Math.sin(angle) * (baseRadius * 0.618);
        if (t === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Inner Cognitive Core (The Locus of Attention)
      ctx.save();
      ctx.rotate(ringRotation3);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.28, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([12, 8]);
      ctx.stroke();

      // Core Crosshair / Reticle
      const reticleSize = baseRadius * 0.12;
      ctx.beginPath();
      ctx.moveTo(-reticleSize, 0);
      ctx.lineTo(reticleSize, 0);
      ctx.moveTo(0, -reticleSize);
      ctx.lineTo(0, reticleSize);
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore center transform

      // ─── 2. SYNAPTIC NEURAL MATRIX NODES & CONNECTIONS ─────────────────────
      const maxConnectDist = Math.min(width, height) * 0.22;
      const pointerRadius = pointerRef.current.radius;
      const pointerX = pointerRef.current.x;
      const pointerY = pointerRef.current.y;

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Motion physics with depth parallax
        const depthFactor = 0.5 + n.layer * 0.5;
        n.x += (n.baseVx + n.vx) * depthFactor;
        n.y += (n.baseVy + n.vy) * depthFactor - scrollRef.current.velocity * 0.03 * n.layer;

        // Dampen velocity impulses
        n.vx *= 0.94;
        n.vy *= 0.94;

        // Wrap around screen boundaries with safety margin
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // Interactive Pointer / Touch Gravitational Attractor
        const dxP = pointerX - n.x;
        const dyP = pointerY - n.y;
        const distP = Math.hypot(dxP, dyP);

        if (distP < pointerRadius && distP > 1) {
          const force = (1 - distP / pointerRadius) * 0.8;
          n.vx += (dxP / distP) * force;
          n.vy += (dyP / distP) * force;
        }

        // Breathing pulse
        n.pulse += n.pulseSpeed;
        const pulseScale = 1 + Math.sin(n.pulse) * 0.25;

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = n.color === '#FFC857' ? 'rgba(255, 200, 87, 0.65)' : 'rgba(124, 92, 252, 0.65)';
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for performance

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n.color === '#FFC857' || n2.color === '#FFC857'
              ? `rgba(255, 200, 87, ${alpha * 1.2})`
              : `rgba(124, 92, 252, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Spawn synaptic energy pulses occasionally
            if (pulses.length < MAX_PULSES && Math.random() < 0.0012) {
              pulses.push({
                fromX: n.x,
                fromY: n.y,
                toX: n2.x,
                toY: n2.y,
                t: 0,
                speed: 0.015 + Math.random() * 0.02,
                color: Math.random() > 0.5 ? '#FFC857' : '#E9E4FF'
              });
            }
          }
        }
      }

      // ─── 3. DRAW TRAVELING SYNAPTIC PULSES ─────────────────────────────────
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
        ctx.arc(currX, currY, 2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── 4. POINTER / TOUCH AMBIENT ILLUMINATION GLOW ───────────────────────
      if (pointerRef.current.active) {
        const glowGrad = ctx.createRadialGradient(
          pointerX, pointerY, 0,
          pointerX, pointerY, pointerRadius * 1.5
        );
        glowGrad.addColorStop(0, 'rgba(255, 200, 87, 0.08)');
        glowGrad.addColorStop(0.4, 'rgba(124, 92, 252, 0.05)');
        glowGrad.addColorStop(1, 'rgba(7, 10, 17, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, pointerRadius * 1.5, 0, Math.PI * 2);
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
      className={`fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#070A11] ${className}`}
      aria-hidden="true"
    >
      {/* Deep Obsidian Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Atmospheric Nebula Spotlights that gently modulate with scroll */}
      <div 
        className="absolute top-0 left-1/4 w-[750px] h-[750px] rounded-full bg-[#7C5CFC]/12 blur-[160px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${Math.sin(scrollRef.current.progress * Math.PI) * 120}px, 0)`
        }}
      />
      <div 
        className="absolute top-1/3 right-10 w-[650px] h-[650px] rounded-full bg-[#FFC857]/08 blur-[180px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${-Math.cos(scrollRef.current.progress * Math.PI) * 100}px, 0)`
        }}
      />
      <div 
        className="absolute bottom-10 left-1/3 w-[800px] h-[550px] rounded-full bg-[#6344E0]/10 blur-[190px] pointer-events-none"
      />

      {/* Subtle Film Grain Noise Texture for cinematic texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#FAFAF7 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
