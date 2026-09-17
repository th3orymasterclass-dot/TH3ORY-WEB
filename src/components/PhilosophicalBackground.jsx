import React, { useEffect, useRef, useState, useMemo } from 'react';

/**
 * PhilosophicalBackground — The Influence Roadmap to Sovereign Mastery
 * 
 * A high-performance, GPU-accelerated canvas background that visualizes the student's
 * 30-day journey as a luminous cosmic roadmap leading to the Final Goal of Sovereign Influence.
 * 
 * Key Features:
 * 1. Serpentine Spline Conduit: Ethereal dashed roadmap ahead, dynamically filled with radiant golden-violet laser light as the user scrolls.
 * 2. 6 Waypoint Stations:
 *    - 0: Origin (Cognitive Ground Zero)
 *    - I: Level 01 (Somatic Presence & Posture)
 *    - II: Level 02 (Micro-Expressions & Deception Decoding)
 *    - III: Level 03 (Conversational Dominance & Calibrated Empathy)
 *    - IV: Level 04 (High-Stakes Asymmetric Negotiation)
 *    - V: Level 05 (Behavioral Engineering & Mass Influence)
 *    - ★: The Final Goal (Sovereign Master of Influence — Climax Singularity)
 * 3. Traveler Seeker Consciousness: Multi-layered glowing orb with stardust comet tail tracking scroll depth.
 * 4. Final Goal Ascension Climax: Multi-ring sacred geometry solar corona that activates upon approaching the goal.
 * 5. Gravitational Touch/Cursor Interactivity: Elastic electromagnetic distortion near pointer.
 * 6. Minimalist Luxury HUD: Non-intrusive status pill displaying active stage & progress toward Zenith.
 */
export default function PhilosophicalBackground({
  variant = 'default',
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Pointer tracking for cursor / touch gravitational attraction
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    radius: 180
  });

  // Scroll tracking with velocity dampening
  const scrollRef = useRef({
    progress: 0,
    targetProgress: 0,
    scrollY: 0,
    velocity: 0,
    lastScrollY: 0
  });

  // Current active stage state for HUD display
  const [hudState, setHudState] = useState({
    levelName: 'ORIGIN: GROUND ZERO',
    stageIndex: 0,
    percentage: 0
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Global scroll progression listener
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

  // Pointer / touch coordinates listener
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

  // Waypoints definition for the 30-day journey
  const waypoints = useMemo(() => [
    { id: 0, t: 0.04, roman: '0', title: 'ORIGIN', subtitle: 'Unconscious Demeanor', days: 'Day 0' },
    { id: 1, t: 0.20, roman: 'I', title: 'SOMATIC PRESENCE', subtitle: 'Postural Authority & Resonance', days: 'Days 1–6' },
    { id: 2, t: 0.38, roman: 'II', title: 'DECEPTION DECODER', subtitle: 'Micro-Expressions & Baseline', days: 'Days 7–12' },
    { id: 3, t: 0.54, roman: 'III', title: 'CONVERSATIONAL DOMINANCE', subtitle: 'Calibrated Empathy & Framing', days: 'Days 13–18' },
    { id: 4, t: 0.70, roman: 'IV', title: 'ASYMMETRIC LEVERAGE', subtitle: 'High-Stakes Power Dynamics', days: 'Days 19–24' },
    { id: 5, t: 0.84, roman: 'V', title: 'BEHAVIORAL ARCHITECTURE', subtitle: 'Subconscious Mass Influence', days: 'Days 25–30' },
    { id: 6, t: 0.96, roman: '★', title: 'THE FINAL GOAL', subtitle: 'Sovereign Influence Mastery', days: 'Day 30+ Climax' }
  ], []);

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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ─── Spline Control Points Calculation ────────────────────────────────
    // Adapts smoothly to mobile portrait vs. widescreen desktop
    const getControlPoints = (w, h) => {
      const isMobile = w < 768;
      const midX = w * 0.5;
      const spreadX = isMobile ? w * 0.26 : w * 0.28;

      return [
        { x: midX, y: h * 0.06 },                    // 0: Origin (Center Top)
        { x: midX - spreadX * 0.85, y: h * 0.20 },   // 1: Level 1 (Left Sweep)
        { x: midX + spreadX * 0.95, y: h * 0.36 },   // 2: Level 2 (Right Sweep)
        { x: midX - spreadX * 0.75, y: h * 0.52 },   // 3: Level 3 (Left Sweep)
        { x: midX + spreadX * 0.85, y: h * 0.68 },   // 4: Level 4 (Right Sweep)
        { x: midX - spreadX * 0.45, y: h * 0.82 },   // 5: Level 5 (Gentle Inward)
        { x: midX, y: h * 0.93 }                     // 6: Final Goal (Center Climax)
      ];
    };

    // Cubic Hermite / Catmull-Rom Spline point evaluation
    const getSplinePoint = (pts, t) => {
      const pCount = pts.length;
      const f = t * (pCount - 1);
      const i = Math.floor(f);
      const u = f - i;

      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[Math.min(i + 1, pCount - 1)];
      const p3 = pts[Math.min(i + 2, pCount - 1)];

      // Standard Catmull-Rom formulation (alpha = 0.5)
      const u2 = u * u;
      const u3 = u2 * u;

      const f0 = -0.5 * u3 + u2 - 0.5 * u;
      const f1 = 1.5 * u3 - 2.5 * u2 + 1.0;
      const f2 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
      const f3 = 0.5 * u3 - 0.5 * u2;

      return {
        x: p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3,
        y: p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3
      };
    };

    // Pre-sample the spline to build a calibrated Arc-Length parametrization
    const SAMPLE_COUNT = 240;
    const sampleSpline = (ctrlPts) => {
      const samples = [];
      let prev = getSplinePoint(ctrlPts, 0);
      samples.push({ t: 0, x: prev.x, y: prev.y, dist: 0 });
      let totalDist = 0;

      for (let s = 1; s <= SAMPLE_COUNT; s++) {
        const t = s / SAMPLE_COUNT;
        const pt = getSplinePoint(ctrlPts, t);
        const d = Math.hypot(pt.x - prev.x, pt.y - prev.y);
        totalDist += d;
        samples.push({ t, x: pt.x, y: pt.y, dist: totalDist });
        prev = pt;
      }

      return { samples, totalDist };
    };

    // Stardust comet tail for the traveler seeker
    const tailParticles = [];
    const MAX_TAIL = 45;

    // Ambient floating embers
    const ambientEmbers = [];
    for (let i = 0; i < 30; i++) {
      ambientEmbers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.15,
        color: Math.random() > 0.5 ? '#FFC857' : '#9277FF'
      });
    }

    // Light pulses traveling forward along the active roadmap path
    const pathPulses = [];
    const MAX_PATH_PULSES = 16;

    let time = 0;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Throttle HUD update to once every 6 frames
    let frameCount = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.014;
      frameCount++;

      // Smooth lerp for scroll progression
      scrollRef.current.progress += (scrollRef.current.targetProgress - scrollRef.current.progress) * 0.085;
      const progress = Math.min(Math.max(scrollRef.current.progress, 0), 1);

      // Smooth pointer lerp
      if (pointerRef.current.active) {
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.14;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.14;
      } else {
        const idleX = width * 0.5 + Math.cos(time * 0.6) * (width * 0.15);
        const idleY = height * 0.5 + Math.sin(time * 0.5) * (height * 0.15);
        pointerRef.current.x += (idleX - pointerRef.current.x) * 0.02;
        pointerRef.current.y += (idleY - pointerRef.current.y) * 0.02;
      }

      ctx.clearRect(0, 0, width, height);

      // ─── Spline Coordinates & Arc-Length Sampling ───────────────────────
      const ctrlPts = getControlPoints(width, height);
      const { samples } = sampleSpline(ctrlPts);

      // Apply interactive cursor gravitational ripple distortion to spline samples
      const pX = pointerRef.current.x;
      const pY = pointerRef.current.y;
      const pRadius = pointerRef.current.radius;
      const isPointerActive = pointerRef.current.active;

      const dynamicSamples = samples.map((s) => {
        let x = s.x;
        let y = s.y;
        if (isPointerActive) {
          const dx = pX - x;
          const dy = pY - y;
          const dist = Math.hypot(dx, dy);
          if (dist < pRadius && dist > 1) {
            const pull = (1 - dist / pRadius) * 22;
            x += (dx / dist) * pull;
            y += (dy / dist) * pull;
          }
        }
        return { ...s, x, y };
      });

      // Find current seeker position along the dynamic spline
      const activeSampleIndex = Math.min(
        Math.floor(progress * (dynamicSamples.length - 1)),
        dynamicSamples.length - 1
      );
      const seekerPt = dynamicSamples[activeSampleIndex] || dynamicSamples[0];

      // Update HUD state every few frames to avoid React overhead
      if (frameCount % 6 === 0) {
        let currentWp = waypoints[0];
        for (let w = waypoints.length - 1; w >= 0; w--) {
          if (progress >= waypoints[w].t - 0.04) {
            currentWp = waypoints[w];
            break;
          }
        }
        setHudState({
          levelName: currentWp.id === 6 ? 'ZENITH: SOVEREIGN INFLUENCE' : `${currentWp.title} (${currentWp.days})`,
          stageIndex: currentWp.id,
          percentage: Math.round(progress * 100)
        });
      }

      // ─── 1. AMBIENT PARTICLES (Cosmic Dust) ─────────────────────────────
      for (let i = 0; i < ambientEmbers.length; i++) {
        const ember = ambientEmbers[i];
        ember.y += ember.vy - scrollRef.current.velocity * 0.03;
        ember.x += ember.vx + Math.sin(time + i) * 0.25;

        if (ember.y < -10) ember.y = height + 10;
        if (ember.y > height + 10) ember.y = -10;
        if (ember.x < -10) ember.x = width + 10;
        if (ember.x > width + 10) ember.x = -10;

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = ember.color === '#FFC857'
          ? `rgba(255, 200, 87, ${ember.alpha})`
          : `rgba(146, 119, 255, ${ember.alpha})`;
        ctx.fill();
      }

      // ─── 2. DRAW UNREACHED DORMANT ROADMAP PATH (Ahead Trajectory) ──────
      ctx.save();
      ctx.beginPath();
      for (let s = 0; s < dynamicSamples.length; s++) {
        const pt = dynamicSamples[s];
        if (s === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.22)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 10]);
      ctx.stroke();

      // Outer faint aura for unreached path
      ctx.strokeStyle = 'rgba(233, 228, 255, 0.06)';
      ctx.lineWidth = 7;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // ─── 3. DRAW ACTIVE COMPLETED ROADMAP PATH (Golden Energy Conduit) ──
      if (activeSampleIndex > 0) {
        ctx.save();

        // Layer A: Radiant Outer Bloom
        ctx.beginPath();
        for (let s = 0; s <= activeSampleIndex; s++) {
          const pt = dynamicSamples[s];
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'rgba(255, 200, 87, 0.25)';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#FFC857';
        ctx.shadowBlur = 18;
        ctx.stroke();

        // Layer B: Violet/Amber Gradient Mid Beam
        const pathGrad = ctx.createLinearGradient(
          dynamicSamples[0].x, dynamicSamples[0].y,
          seekerPt.x, seekerPt.y
        );
        pathGrad.addColorStop(0, 'rgba(124, 92, 252, 0.85)');
        pathGrad.addColorStop(0.5, 'rgba(255, 174, 25, 0.92)');
        pathGrad.addColorStop(1, 'rgba(255, 200, 87, 0.98)');

        ctx.strokeStyle = pathGrad;
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]);
        ctx.stroke();

        // Layer C: High-Intensity White Core Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      // ─── 4. SPAWN & DRAW TRAVELING SYNAPTIC ENERGY PULSES ────────────────
      if (pathPulses.length < MAX_PATH_PULSES && Math.random() < 0.08 && activeSampleIndex > 10) {
        pathPulses.push({
          progressOnActive: 0,
          speed: 0.015 + Math.random() * 0.02,
          color: Math.random() > 0.4 ? '#FFC857' : '#FFFFFF',
          size: Math.random() * 2.2 + 2.0
        });
      }

      for (let p = pathPulses.length - 1; p >= 0; p--) {
        const pulse = pathPulses[p];
        pulse.progressOnActive += pulse.speed;
        if (pulse.progressOnActive >= 1) {
          pathPulses.splice(p, 1);
          continue;
        }

        const pulseIdx = Math.floor(pulse.progressOnActive * activeSampleIndex);
        const pulsePt = dynamicSamples[pulseIdx];
        if (pulsePt) {
          ctx.beginPath();
          ctx.arc(pulsePt.x, pulsePt.y, pulse.size, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.shadowColor = pulse.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ─── 5. DRAW WAYPOINTS ALONG THE ROADMAP ─────────────────────────────
      waypoints.forEach((wp) => {
        const wpIdx = Math.min(
          Math.floor(wp.t * (dynamicSamples.length - 1)),
          dynamicSamples.length - 1
        );
        const pt = dynamicSamples[wpIdx];
        if (!pt) return;

        const isReached = progress >= wp.t - 0.02;
        const isActiveCurrent = Math.abs(progress - wp.t) < 0.08;
        const isFinalGoal = wp.id === 6;

        ctx.save();
        ctx.translate(pt.x, pt.y);

        // A. FINAL GOAL SPECIAL: Sovereign Solar Singularity & Crown
        if (isFinalGoal) {
          const finalGoalIntensity = Math.max((progress - 0.75) / 0.25, 0); // 0 at 75%, 1 at 100%
          const baseR = 36 + finalGoalIntensity * 24;

          // Solar Flare Rays
          const rayCount = 12;
          ctx.save();
          ctx.rotate(time * 0.3);
          for (let r = 0; r < rayCount; r++) {
            const angle = (r * Math.PI * 2) / rayCount;
            const rayLen = baseR * (1.2 + Math.sin(time * 2 + r) * 0.3 * finalGoalIntensity);
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * (baseR * 0.6), Math.sin(angle) * (baseR * 0.6));
            ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
            ctx.strokeStyle = r % 2 === 0
              ? `rgba(255, 200, 87, ${0.4 + finalGoalIntensity * 0.5})`
              : `rgba(146, 119, 255, ${0.3 + finalGoalIntensity * 0.4})`;
            ctx.lineWidth = r % 2 === 0 ? 2.2 : 1.4;
            ctx.stroke();
          }
          ctx.restore();

          // Rotating Sacred Geometry Rings
          ctx.save();
          ctx.rotate(-time * 0.2);
          ctx.beginPath();
          ctx.arc(0, 0, baseR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 200, 87, ${0.6 + finalGoalIntensity * 0.4})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 8, 2, 8]);
          ctx.stroke();

          // Triad of Mastery Seal
          ctx.beginPath();
          for (let s = 0; s < 3; s++) {
            const a = (s * Math.PI * 2) / 3;
            const tx = Math.cos(a) * baseR;
            const ty = Math.sin(a) * baseR;
            if (s === 0) ctx.moveTo(tx, ty);
            else ctx.lineTo(tx, ty);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(255, 200, 87, ${0.35 + finalGoalIntensity * 0.45})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();

          // Core Radiant Flare
          const finalCoreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 1.5);
          finalCoreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          finalCoreGlow.addColorStop(0.3, 'rgba(255, 200, 87, 0.7)');
          finalCoreGlow.addColorStop(0.65, 'rgba(124, 92, 252, 0.35)');
          finalCoreGlow.addColorStop(1, 'rgba(7, 10, 17, 0)');
          ctx.fillStyle = finalCoreGlow;
          ctx.beginPath();
          ctx.arc(0, 0, baseR * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Central Trophy Glyphic Crown
          ctx.fillStyle = '#070A11';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFC857';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#FFC857';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);

          // Milestone Title Label Banner
          ctx.font = '800 11px system-ui, sans-serif';
          ctx.fillStyle = '#FFC857';
          ctx.shadowColor = '#FFC857';
          ctx.shadowBlur = 10;
          ctx.fillText('FINAL GOAL: SOVEREIGN INFLUENCE', 0, baseR + 24);
          ctx.font = '500 9px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(233, 228, 255, 0.75)';
          ctx.shadowBlur = 0;
          ctx.fillText('THE ZENITH OF COGNITIVE MASTERY', 0, baseR + 38);

        } else {
          // B. STANDARD LEVEL WAYPOINT STATION (0, I, II, III, IV, V)
          const nodeRadius = isActiveCurrent ? 18 : (isReached ? 14 : 11);

          // Radar Ping Wave (if active or just passed)
          if (isReached || isActiveCurrent) {
            const radarPhase = (time * 2 + wp.id) % 2;
            const radarRadius = nodeRadius + radarPhase * 24;
            const radarAlpha = Math.max(1 - radarPhase / 2, 0) * (isActiveCurrent ? 0.65 : 0.35);

            ctx.beginPath();
            ctx.arc(0, 0, radarRadius, 0, Math.PI * 2);
            ctx.strokeStyle = isReached
              ? `rgba(255, 200, 87, ${radarAlpha})`
              : `rgba(147, 119, 255, ${radarAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Ambient Beacon Halo
          const wpHalo = ctx.createRadialGradient(0, 0, 0, 0, 0, nodeRadius * 2);
          if (isReached) {
            wpHalo.addColorStop(0, 'rgba(255, 200, 87, 0.5)');
            wpHalo.addColorStop(0.5, 'rgba(255, 174, 25, 0.25)');
            wpHalo.addColorStop(1, 'rgba(7, 10, 17, 0)');
          } else {
            wpHalo.addColorStop(0, 'rgba(124, 92, 252, 0.3)');
            wpHalo.addColorStop(0.6, 'rgba(124, 92, 252, 0.1)');
            wpHalo.addColorStop(1, 'rgba(7, 10, 17, 0)');
          }
          ctx.fillStyle = wpHalo;
          ctx.beginPath();
          ctx.arc(0, 0, nodeRadius * 2, 0, Math.PI * 2);
          ctx.fill();

          // Node Solid Disc
          ctx.beginPath();
          ctx.arc(0, 0, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = isReached ? '#0D111C' : '#0B0D14';
          ctx.fill();
          ctx.strokeStyle = isReached ? '#FFC857' : 'rgba(147, 119, 255, 0.5)';
          ctx.lineWidth = isActiveCurrent ? 2.5 : 1.8;
          ctx.stroke();

          // Roman Numeral / ID Glyphs
          ctx.font = isActiveCurrent ? 'bold 11px monospace' : 'bold 9px monospace';
          ctx.fillStyle = isReached ? '#FFC857' : 'rgba(233, 228, 255, 0.6)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(wp.roman, 0, 0.5);

          // Waypoint Text Annotations (Positioned alternate Left / Right to prevent overlap)
          const textOnRight = pt.x < width * 0.5;
          const textOffsetX = textOnRight ? (nodeRadius + 14) : -(nodeRadius + 14);
          ctx.textAlign = textOnRight ? 'left' : 'right';

          // Waypoint Stage Title
          ctx.font = '800 10px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = isReached ? '#FAFAF7' : 'rgba(250, 250, 247, 0.45)';
          if (isActiveCurrent) {
            ctx.shadowColor = '#FFC857';
            ctx.shadowBlur = 8;
          }
          ctx.fillText(`${wp.days} • ${wp.title}`, textOffsetX, -2);
          ctx.shadowBlur = 0;

          // Subtitle
          ctx.font = '500 8.5px system-ui, sans-serif';
          ctx.fillStyle = isReached ? 'rgba(255, 200, 87, 0.85)' : 'rgba(147, 119, 255, 0.45)';
          ctx.fillText(wp.subtitle, textOffsetX, 11);
        }

        ctx.restore();
      });

      // ─── 6. TRAVELER SEEKER CONSCIOUSNESS ORB (Current Scroll Position) ──
      if (seekerPt) {
        // Emit stardust trail particles
        if (tailParticles.length < MAX_TAIL) {
          tailParticles.push({
            x: seekerPt.x + (Math.random() - 0.5) * 8,
            y: seekerPt.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - scrollRef.current.velocity * 0.05,
            size: Math.random() * 2.2 + 1.2,
            life: 1.0,
            decay: 0.03 + Math.random() * 0.03,
            color: Math.random() > 0.4 ? '#FFC857' : '#FFFFFF'
          });
        }

        // Draw and update stardust trail
        for (let t = tailParticles.length - 1; t >= 0; t--) {
          const tp = tailParticles[t];
          tp.x += tp.vx;
          tp.y += tp.vy;
          tp.life -= tp.decay;

          if (tp.life <= 0) {
            tailParticles.splice(t, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(tp.x, tp.y, tp.size * tp.life, 0, Math.PI * 2);
          ctx.fillStyle = tp.color === '#FFC857'
            ? `rgba(255, 200, 87, ${tp.life * 0.8})`
            : `rgba(255, 255, 255, ${tp.life * 0.85})`;
          ctx.fill();
        }

        ctx.save();
        ctx.translate(seekerPt.x, seekerPt.y);

        // Seeker Luminous Radial Flare
        const seekerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
        seekerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        seekerGlow.addColorStop(0.25, 'rgba(255, 200, 87, 0.85)');
        seekerGlow.addColorStop(0.6, 'rgba(124, 92, 252, 0.4)');
        seekerGlow.addColorStop(1, 'rgba(7, 10, 17, 0)');

        ctx.fillStyle = seekerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();

        // High-Intensity White Spark Core
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFC857';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rotating Reticle Crosshair around Seeker
        ctx.rotate(time * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.restore();
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
  }, [prefersReducedMotion, waypoints]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070A11] ${className}`}
      aria-hidden="true"
    >
      {/* Deep Obsidian Canvas for GPU Roadmap Spline */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Atmospheric Nebula Highlights that modulate with scroll */}
      <div 
        className="absolute top-10 left-1/4 w-[750px] h-[750px] rounded-full bg-[#7C5CFC]/20 blur-[170px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${Math.sin(scrollRef.current.progress * Math.PI) * 120}px, 0)`
        }}
      />
      <div 
        className="absolute top-1/2 right-12 w-[700px] h-[700px] rounded-full bg-[#FFC857]/14 blur-[180px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(0, ${-Math.cos(scrollRef.current.progress * Math.PI) * 110}px, 0)`
        }}
      />
      <div 
        className="absolute bottom-10 left-1/3 w-[850px] h-[650px] rounded-full bg-[#6344E0]/18 blur-[190px] pointer-events-none"
      />

      {/* Subtle Film Grain Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#FAFAF7 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Minimalist Floating Roadmap HUD Pill */}
      <div className="absolute top-20 right-4 sm:right-8 z-10 pointer-events-auto transition-all duration-300">
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#0B0F19]/85 backdrop-blur-xl border border-amber-500/25 shadow-xl shadow-black/60 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-400 font-bold uppercase tracking-wider hidden sm:inline">
              Roadmap:
            </span>
          </div>

          <span className="text-slate-300 font-semibold tracking-tight truncate max-w-[180px] sm:max-w-[280px]">
            {hudState.levelName}
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-amber-400 font-extrabold">
              {hudState.percentage}%
            </span>
            <span className="text-slate-500 text-[10px]">
              to Zenith
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
