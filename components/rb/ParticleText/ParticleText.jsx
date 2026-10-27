'use client';

import { useEffect, useRef } from 'react';
import './ParticleText.css';

const INHERIT = /^(currentcolor|inherit)$/i;
const TONES = 12;
const FADES = 8;
const GHOSTS = 10; // Sqaron: alpha steps for the particles on their way out (see exitRef)
const HEAT_RANGE = 36;
const HEAT_DEADZONE = 3;
const TAU = Math.PI * 2;
const REST_ANGLE = -Math.PI / 4;
const BURST_SPRING = 18;
const BURST_DAMPING = 7.5;
const SCAN_FADE = [0, 0.12, 0.42, 0.78, 1, 0.78, 0.42, 0.12, 0];
const FADE_FLOOR = { gather: 0, rain: 0.55, spiral: 0.45, scan: 0.35 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInFall = t => Math.pow(t, 1.7);
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const fadeAlpha = level => 0.35 + (0.65 * level) / (FADES - 1);
const wrapHalfTurn = angle => (((angle % Math.PI) + Math.PI * 1.5) % Math.PI) - Math.PI / 2;

const resolveFontSize = (value, container, fontWeight, fontFamily) => {
  if (typeof value === 'number') return value;

  const probe = document.createElement('span');
  probe.textContent = 'M';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.fontSize = value;
  probe.style.fontWeight = String(fontWeight);
  probe.style.fontFamily = fontFamily;
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
  probe.remove();
  return size;
};

const waitForFonts = async font => {
  if (!('fonts' in document)) return;

  try {
    await document.fonts.load(font);
  } catch {}

  await document.fonts.ready;
};

const ParticleText = ({
  text = 'React Bits',
  particleSize = 2,
  density = 4,
  color = 'currentColor',
  highlightColor = '#ff5a36',
  highlightMode = 'motion',
  shape = 'circle',
  intro = 'gather',
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  clickBurst = true,
  burstStrength = 1,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = 'mount',
  fontSize = 'clamp(3rem, 12vw, 8rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = true,
  className = '',
  style,
  // Sqaron: several lines ("\n"), a beat between the lines in the intro, the pointer read from the whole window (so
  // the canvas can lie over a page without blocking anything under it), and exitRef for a scroll-driven exit:
  // exitRef.current = { lines: [0..1 per line, 0 in place, 1 gone], zoom: camera push-in }; it gets a wake() back
  lineHeight = 1.1,
  lineStagger = 0,
  pointerScope = 'canvas',
  exitRef
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const settingsRef = useRef(null);
  const wakeRef = useRef(() => {});

  useEffect(() => {
    settingsRef.current = {
      text,
      particleSize,
      density,
      color,
      highlightColor,
      highlightMode,
      shape,
      intro,
      scatter,
      gatherDuration,
      stagger,
      clickBurst,
      burstStrength,
      pointerRepel,
      repelRadius,
      idleDrift,
      trigger,
      fontSize,
      fontWeight,
      fontFamily,
      glow,
      lineHeight,
      lineStagger,
      pointerScope,
      exitRef
    };
    wakeRef.current();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const layer = document.createElement('canvas');
    const layerCtx = layer.getContext('2d');
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });
    if (!container || !canvas || !ctx || !layerCtx || !probeCtx) return undefined;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let reducedMotion = !!motionQuery?.matches;
    let particles = [];
    let raf = 0;
    let sampleFrame = 0;
    let buildId = 0;
    let introPending = true;
    let sampledKey = '';
    let sampledText = '';
    let requestedSize = '';
    let gathering = false;
    let gatherStart = 0;
    let introMode = 'gather';
    let bursting = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let last = 0;
    let visible = true;
    let alive = true;
    let colorKey = '';
    let palette = [];
    let glowColor = '#000000';
    let accent = { r: 0, g: 0, b: 0 };
    const bounds = { left: 0, right: 0, top: 0, bottom: 0 };
    const swirl = { x: 0, y: 0, aspect: 1 };
    const scan = { from: 0, to: 0, top: 0, bottom: 0, duration: 1 };
    const buckets = Array.from({ length: TONES * FADES }, () => []);
    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };
    // Sqaron: the lines, the camera, the exit, and where the pointer really is on the canvas (raw) before the
    // camera's zoom is taken off it (pointer.x/y, in the particles' own space)
    const windowScope = settingsRef.current?.pointerScope === 'window';
    const exitHolder = settingsRef.current?.exitRef;
    const ghosts = Array.from({ length: GHOSTS * TONES }, () => []);
    const center = { x: 0, y: 0 };
    const raw = { x: 0, y: 0 };
    const client = { x: 0, y: 0 };
    let lineBoxes = [];
    let origins = [];
    let zoom = 1;
    let hoverLine = -1;
    let lastScroll = -1;
    const unproject = () => {
      pointer.x = center.x + (raw.x - center.x) / zoom;
      pointer.y = center.y + (raw.y - center.y) / zoom;
    };

    const family = s =>
      !s.fontFamily || s.fontFamily === 'inherit'
        ? window.getComputedStyle(container).fontFamily || 'sans-serif'
        : s.fontFamily;
    const layoutKey = s => [s.text, s.fontSize, s.fontWeight, family(s), s.density, s.lineHeight].join('|'); // Sqaron: + lineHeight
    // Sqaron: sizes come from layout (clientWidth/Height), not getBoundingClientRect, so a CSS transform on an
    // ancestor (the founders intro scales this up to fill the screen) never resamples the text at the wrong size
    const sizeKey = () => `${container.clientWidth}x${container.clientHeight}@${Math.min(window.devicePixelRatio || 1, 2)}`;

    const toRgb = value => {
      probeCtx.clearRect(0, 0, 1, 1);
      probeCtx.fillStyle = '#000000';
      probeCtx.fillStyle = value;
      probeCtx.fillRect(0, 0, 1, 1);
      const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;
      return { r, g, b };
    };

    const ensureColors = s => {
      const current = window.getComputedStyle(container).color || '#000000';
      const pick = value => (!value || INHERIT.test(String(value).trim()) ? current : value);
      const base = pick(s.color);
      const highlight = pick(s.highlightColor);
      const key = `${base}|${highlight}`;
      if (key === colorKey) return;
      colorKey = key;
      const from = toRgb(base);
      accent = toRgb(highlight);
      glowColor = `rgb(${accent.r}, ${accent.g}, ${accent.b})`;
      palette = Array.from({ length: TONES }, (_, i) => {
        const t = i / (TONES - 1);
        const r = Math.round(from.r + (accent.r - from.r) * t);
        const g = Math.round(from.g + (accent.g - from.g) * t);
        const b = Math.round(from.b + (accent.b - from.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
      });
    };

    const travelTime = (s, particle) => {
      if (reducedMotion) return 1;
      if (introMode === 'scan') return s.gatherDuration * 0.4;
      if (introMode === 'rain') return s.gatherDuration * (0.45 + particle.depth * 0.3);
      return s.gatherDuration;
    };

    const startIntro = (initial, only = -1) => {
      const s = settingsRef.current;
      if (!particles.length || !s) return;
      const now = performance.now();
      introMode = s.intro;
      const spread = reducedMotion ? 0 : s.scatter;
      const tall = Math.max(1, bounds.bottom - bounds.top);
      swirl.x = (bounds.left + bounds.right) / 2;
      swirl.y = (bounds.top + bounds.bottom) / 2;
      swirl.aspect = clamp(width / Math.max(1, height), 1, 2.5);
      scan.from = bounds.left - 24;
      scan.to = bounds.right + 24;
      scan.top = bounds.top - tall * 0.3;
      scan.bottom = bounds.bottom + tall * 0.3;
      scan.duration = Math.max(200, s.gatherDuration * 0.8);
      let reach = 1;

      if (introMode === 'spiral') {
        for (const particle of particles) {
          const dx = particle.targetX - swirl.x;
          const dy = (particle.targetY - swirl.y) * swirl.aspect;
          particle.radius = Math.hypot(dx, dy);
          particle.heading = Math.atan2(dy, dx);
          reach = Math.max(reach, particle.radius);
        }
      }

      for (const particle of particles) {
        if (only >= 0 && particle.line !== only) continue; // Sqaron: replay one line only (hover)
        let delay = particle.seed * s.stagger;
        let startX;
        let startY;

        if (introMode === 'rain') {
          startX = particle.targetX + (particle.depth - 0.9) * 16;
          startY = -12 - particle.depth * 30 - particle.seed * height * 0.22;
          delay = particle.seed * s.stagger * 1.3;
        } else if (introMode === 'spiral') {
          particle.startRadius = particle.radius * (1.04 + particle.depth * 0.22) + spread * 0.3 * particle.seed;
          particle.swirl = (1.5 + 2.6 * (1 - particle.radius / reach)) * (0.85 + particle.seed * 0.3);
          const angle = particle.heading + particle.swirl;
          startX = swirl.x + Math.cos(angle) * particle.startRadius;
          startY = swirl.y + (Math.sin(angle) * particle.startRadius) / swirl.aspect;
          delay = particle.seed * s.stagger;
        } else if (introMode === 'scan') {
          const along = (particle.targetX - scan.from) / Math.max(1, scan.to - scan.from);
          startX = particle.targetX + 3 + particle.seed * 8;
          startY = scan.top + ((particle.seed * 7.31 + particle.depth * 3.7) % 1) * (scan.bottom - scan.top);
          delay = along * scan.duration + particle.seed * s.stagger * 0.15;
        } else {
          const angle = particle.seed * TAU;
          const distance = spread * (0.35 + particle.depth * 0.75);
          startX = particle.targetX + Math.cos(angle) * distance + (particle.seed - 0.5) * spread * 0.45;
          startY = particle.targetY + Math.sin(angle) * distance + (particle.depth - 0.9) * spread * 0.45;
        }

        particle.startX = startX;
        particle.startY = startY;
        // Sqaron: the lines a beat apart, each particle timed from its own start (a line can replay on its own)
        particle.delay = reducedMotion ? 0 : delay + (only >= 0 ? 0 : particle.line * (Number(s.lineStagger) || 0));
        particle.from = now;
        if (initial) {
          particle.x = startX;
          particle.y = startY;
        }
      }

      gatherStart = now;
      gathering = true;
      wake();
    };

    const burst = (x, y) => {
      const s = settingsRef.current;
      if (!s || !particles.length) return;
      const strength = Math.max(0, Number(s.burstStrength) || 0);
      if (!strength) return;
      const radius = 90 + 70 * Math.sqrt(strength) + s.repelRadius * 0.25;

      for (const particle of particles) {
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const falloff = 1 - distance / radius;
        const power = 950 * strength * (0.2 + 0.8 * falloff * falloff) * (0.65 + particle.depth * 0.45);
        const angle = Math.atan2(dy, dx) + (particle.seed - 0.5) * 0.9;
        particle.vx += Math.cos(angle) * power;
        particle.vy += Math.sin(angle) * power;
      }

      bursting = true;
      wake();
    };

    const drawGroup = (target, group, base, shape) => {
      target.beginPath();
      // Sqaron: drawn where the camera and the exit put them (px, py), at their grown size
      if (shape === 'line') {
        for (const particle of group) {
          const dx = Math.cos(particle.angle) * particle.length * 0.5 * particle.grow;
          const dy = Math.sin(particle.angle) * particle.length * 0.5 * particle.grow;
          target.moveTo(particle.px - dx, particle.py - dy);
          target.lineTo(particle.px + dx, particle.py + dy);
        }
        target.stroke();
        return;
      }

      const square = shape === 'square';
      for (const particle of group) {
        const size = (square ? base : Math.max(0.6, base * (0.75 + particle.weight * 0.45))) * particle.grow;
        if (square || size <= 2.1) {
          target.rect(particle.px - size / 2, particle.py - size / 2, size, size);
        } else {
          target.moveTo(particle.px + size / 2, particle.py);
          target.arc(particle.px, particle.py, size / 2, 0, TAU);
        }
      }
      target.fill();
    };

    const drawScan = (now, s) => {
      const progress = (now - gatherStart) / scan.duration;
      if (introMode !== 'scan' || progress < 0 || progress > 1.3 || reducedMotion) return false;
      const x = scan.from + (scan.to - scan.from) * clamp(progress, 0, 1);
      const alpha = clamp(progress / 0.08, 0, 1) * clamp((1.3 - progress) / 0.3, 0, 1);
      const gradient = ctx.createLinearGradient(0, scan.top, 0, scan.bottom);
      SCAN_FADE.forEach((level, i) => {
        gradient.addColorStop(i / (SCAN_FADE.length - 1), `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${level})`);
      });
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = gradient;
      if (s.glow) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8 * dpr;
      }
      ctx.fillRect(x - 0.75, scan.top, 1.5, scan.bottom - scan.top);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;
      return true;
    };

    const step = now => {
      const s = settingsRef.current;
      if (!s) return false;
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;
      last = now;
      ensureColors(s);

      const frames = Math.max(dt * 60, 0.001);
      const follow = reducedMotion ? 1 : 1 - Math.pow(0.78, frames);
      const chase = 1 - Math.pow(0.82, frames);
      const turn = 1 - Math.pow(0.72, frames);
      // Sqaron: the exit as it stands, and the pointer through the camera (read from the window, it is re-read
      // whenever the page has scrolled, since the canvas moved under a cursor that did not)
      const exitState = s.exitRef?.current;
      const leaving = exitState?.lines || [];
      zoom = Math.max(0.1, Number(exitState?.zoom) || 1);
      if (windowScope && pointer.active && window.scrollY !== lastScroll) {
        lastScroll = window.scrollY;
        if (!fromClient()) pointer.active = false;
      }
      unproject();
      // a line that starts to leave does so from the point nearest the cursor (or from its middle)
      for (let i = 0; i < lineBoxes.length; i++) {
        const box = lineBoxes[i];
        if (!box || !(leaving[i] > 0)) {
          origins[i] = null;
          continue;
        }
        if (!origins[i]) origins[i] = { x: pointer.active ? clamp(pointer.x, box.left, box.right) : box.cx, y: box.cy };
      }
      pointer.smoothX += (pointer.x - pointer.smoothX) * chase;
      pointer.smoothY += (pointer.y - pointer.smoothY) * chase;

      const repel = pointer.active && !reducedMotion && s.pointerRepel > 0 && s.repelRadius > 0;
      const drift = !reducedMotion && s.idleDrift > 0;
      const motionHeat = s.highlightMode !== 'gradient';
      const lines = s.shape === 'line';
      const floor = gathering ? (FADE_FLOOR[introMode] ?? 0) : 0;
      const time = now * 0.001;
      const sizeBase = Math.max(0.1, Number(s.particleSize) || 0);
      const restLength = Math.max(2, sizeBase * 0.8 + Math.max(2, Math.floor(Number(s.density) || 0)) * 0.7);
      let complete = true;
      let moving = false;
      let settling = false;

      for (const bucket of buckets) bucket.length = 0;
      for (const bucket of ghosts) bucket.length = 0; // Sqaron
      let shown = 0;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const particle of particles) {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;
        let hidden = false;

        if (gathering) {
          const local = (now - particle.from - particle.delay) / Math.max(1, travelTime(s, particle)); // Sqaron: own start
          progress = clamp(local, 0, 1);
          if (introMode === 'scan' && local < 0) hidden = true;
          if (introMode === 'spiral') {
            const eased = easeInOutCubic(progress);
            const radius = particle.startRadius + (particle.radius - particle.startRadius) * eased;
            const angle = particle.heading + particle.swirl * (1 - eased);
            baseX = swirl.x + Math.cos(angle) * radius;
            baseY = swirl.y + (Math.sin(angle) * radius) / swirl.aspect;
          } else {
            const eased = introMode === 'rain' ? easeInFall(progress) : easeOutCubic(progress);
            baseX = particle.startX + (particle.targetX - particle.startX) * eased;
            baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          }
          if (progress < 1) complete = false;
        } else if (drift) {
          baseX += Math.sin(time * 0.9 + particle.seed * 10) * s.idleDrift * particle.depth;
          baseY += Math.cos(time * 0.75 + particle.depth * 10) * s.idleDrift * particle.depth;
        }

        if (bursting) {
          particle.vx += (-BURST_SPRING * particle.ox - BURST_DAMPING * particle.vx) * dt;
          particle.vy += (-BURST_SPRING * particle.oy - BURST_DAMPING * particle.vy) * dt;
          particle.ox += particle.vx * dt;
          particle.oy += particle.vy * dt;
          if (
            Math.abs(particle.ox) + Math.abs(particle.oy) > 0.05 ||
            Math.abs(particle.vx) + Math.abs(particle.vy) > 1
          ) {
            settling = true;
          } else {
            particle.ox = 0;
            particle.oy = 0;
            particle.vx = 0;
            particle.vy = 0;
          }
          baseX += particle.ox;
          baseY += particle.oy;
        }

        if (repel) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < s.repelRadius) {
            const force = Math.pow(1 - distance / s.repelRadius, 2) * s.pointerRepel;
            baseX += (dx / distance) * force;
            baseY += (dy / distance) * force;
          }
        }

        const moveX = (baseX - particle.x) * follow;
        const moveY = (baseY - particle.y) * follow;
        particle.x += moveX;
        particle.y += moveY;
        if (Math.abs(moveX) + Math.abs(moveY) > 0.02) moving = true;

        if (lines) {
          const speed = Math.hypot(moveX, moveY) / frames;
          const aim = speed > 0.3 ? Math.atan2(moveY, moveX) : REST_ANGLE;
          const offset = wrapHalfTurn(aim - particle.angle);
          particle.angle += offset * turn;
          if (Math.abs(offset) > 0.01) moving = true;
          particle.length = restLength + Math.min(restLength * 4, speed * 1.6);
        }

        if (hidden) continue;

        // Sqaron: where it is drawn. Through the camera, and once its line is leaving, flying out at you: the
        // particles nearest where the line began to go leave first, each one rushing outwards from the middle of
        // the text as if it were passing the camera, growing, brightening and fading as it goes
        let px = particle.x;
        let py = particle.y;
        let grow = 1;
        let gone = 0;
        const out = leaving[particle.line] || 0;
        if (out > 0) {
          const origin = origins[particle.line];
          const box = lineBoxes[particle.line];
          const order =
            origin && box
              ? Math.min(1, Math.hypot(particle.targetX - origin.x, (particle.targetY - origin.y) * 1.5) / box.reach)
              : particle.seed;
          const local = (out - order * 0.55 - particle.seed * 0.2) / 0.25;
          if (local >= 1) continue;
          if (local > 0) {
            const e = local * local;
            const k = (1.4 + particle.depth * 2.2) * e;
            px = center.x + (px - center.x) * (1 + k) + particle.jx * e;
            py = center.y + (py - center.y) * (1 + k) + particle.jy * e;
            grow = 1 + e * (1.2 + particle.depth * 1.8);
            gone = local;
          }
        }
        if (zoom !== 1) {
          px = center.x + (px - center.x) * zoom;
          py = center.y + (py - center.y) * zoom;
          grow *= zoom;
        }
        particle.px = px;
        particle.py = py;
        particle.grow = grow;

        const heat = motionHeat
          ? clamp(
              (Math.hypot(particle.x - particle.targetX, particle.y - particle.targetY) - HEAT_DEADZONE) / HEAT_RANGE,
              0,
              1
            )
          : particle.tone;
        const tone = Math.round(heat * (TONES - 1));
        // Sqaron: on their way out they turn to the highlight colour and fade, in alpha steps of their own
        if (gone > 0) {
          const alpha = gone < 0.25 ? 1 : 1 - (gone - 0.25) / 0.75;
          const level = clamp(Math.ceil(alpha * GHOSTS) - 1, 0, GHOSTS - 1);
          const hot = Math.max(tone, Math.round(Math.min(1, gone * 3) * (TONES - 1)));
          ghosts[level * TONES + hot].push(particle);
        } else {
          const fade = Math.round((floor + (1 - floor) * progress) * (FADES - 1));
          buckets[fade * TONES + tone].push(particle);
        }
        shown += 1;
        const reach = sizeBase * 2 * grow + 2;
        if (px - reach < minX) minX = px - reach;
        if (px + reach > maxX) maxX = px + reach;
        if (py - reach < minY) minY = py - reach;
        if (py + reach > maxY) maxY = py + reach;
      }

      if (gathering && complete) gathering = false;
      if (bursting && !settling) bursting = false;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const strokeWidth = Math.max(1, sizeBase * 0.65);
      if (lines) {
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
      }

      if (s.glow) {
        layerCtx.setTransform(1, 0, 0, 1, 0, 0);
        layerCtx.clearRect(0, 0, layer.width, layer.height);
        layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        layerCtx.fillStyle = glowColor;
        layerCtx.strokeStyle = glowColor;
        layerCtx.lineWidth = strokeWidth;
        layerCtx.lineCap = 'round';
        let lit = false;
        for (let fade = 0; fade < FADES; fade++) {
          for (let tone = 1; tone < TONES; tone++) {
            const group = buckets[fade * TONES + tone];
            if (!group.length) continue;
            layerCtx.globalAlpha = (tone / (TONES - 1)) * fadeAlpha(fade);
            drawGroup(layerCtx, group, sizeBase, s.shape);
            lit = true;
          }
        }
        // Sqaron: the particles on their way out glow too
        for (let level = 0; level < GHOSTS; level++) {
          for (let tone = 1; tone < TONES; tone++) {
            const group = ghosts[level * TONES + tone];
            if (!group.length) continue;
            layerCtx.globalAlpha = (tone / (TONES - 1)) * ((level + 1) / GHOSTS);
            drawGroup(layerCtx, group, sizeBase, s.shape);
            lit = true;
          }
        }
        layerCtx.globalAlpha = 1;
        if (lit) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = (3 + sizeBase * 1.5) * dpr;
          // Sqaron: blur only the part of the canvas that has particles on it (the canvas can be screen-sized)
          const pad = (3 + sizeBase * 1.5) * 3;
          const x0 = clamp(Math.floor((minX - pad) * dpr), 0, layer.width);
          const y0 = clamp(Math.floor((minY - pad) * dpr), 0, layer.height);
          const x1 = clamp(Math.ceil((maxX + pad) * dpr), 0, layer.width);
          const y1 = clamp(Math.ceil((maxY + pad) * dpr), 0, layer.height);
          if (x1 > x0 && y1 > y0) ctx.drawImage(layer, x0, y0, x1 - x0, y1 - y0, x0 / dpr, y0 / dpr, (x1 - x0) / dpr, (y1 - y0) / dpr);
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }
      }

      for (let fade = 0; fade < FADES; fade++) {
        ctx.globalAlpha = fadeAlpha(fade);
        for (let tone = 0; tone < TONES; tone++) {
          const group = buckets[fade * TONES + tone];
          if (!group.length) continue;
          if (lines) ctx.strokeStyle = palette[tone];
          else ctx.fillStyle = palette[tone];
          drawGroup(ctx, group, sizeBase, s.shape);
        }
      }
      // Sqaron: then the particles on their way out
      for (let level = 0; level < GHOSTS; level++) {
        ctx.globalAlpha = (level + 1) / GHOSTS;
        for (let tone = 0; tone < TONES; tone++) {
          const group = ghosts[level * TONES + tone];
          if (!group.length) continue;
          if (lines) ctx.strokeStyle = palette[tone];
          else ctx.fillStyle = palette[tone];
          drawGroup(ctx, group, sizeBase, s.shape);
        }
      }
      ctx.globalAlpha = 1;

      const scanning = drawScan(now, s);

      // Sqaron: every line gone: rest until the exit is scrolled back (exitRef.current.wake)
      if (!shown && particles.length && !gathering && !bursting && !scanning) return false;

      return gathering || moving || repel || drift || bursting || scanning;
    };

    const frame = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      if (s) {
        const key = layoutKey(s);
        if (key !== sampledKey) {
          queueSample(s.text !== sampledText);
          sampledKey = key;
          sampledText = s.text;
        }
      }
      const busy = step(now);
      if (busy && visible && alive) raf = requestAnimationFrame(frame);
    };

    function wake() {
      if (raf || !visible || !alive) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    wakeRef.current = wake;

    const sampleText = async () => {
      const s = settingsRef.current;
      if (!s) return;
      const currentBuild = ++buildId;
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      requestedSize = sizeKey();
      sampledKey = layoutKey(s);
      sampledText = s.text;

      if (nextWidth <= 0 || nextHeight <= 0) return;

      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const resolvedFamily = family(s);
      let resolvedSize = resolveFontSize(s.fontSize, container, s.fontWeight, resolvedFamily);
      let font = `${s.fontWeight} ${resolvedSize}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (currentBuild !== buildId || !alive) return;

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      // Sqaron: one or more lines ("\n"), each sampled on its own so that every particle knows its line; the
      // block is centred as the single line was, and shrinks to fit the width (and, with several lines, the height)
      const rows = String(s.text || ' ')
        .split('\n')
        .map(row => row || ' ');
      const lead = Math.max(0.6, Number(s.lineHeight) || 1.1);
      const maxTextWidth = nextWidth * 0.92;
      offCtx.font = font;
      const measuredWidth = Math.max(1, ...rows.map(row => offCtx.measureText(row).width));
      const fit = Math.min(
        maxTextWidth / measuredWidth,
        rows.length > 1 ? (nextHeight * 0.9) / (resolvedSize * lead * rows.length) : 1
      );
      if (fit < 1) {
        resolvedSize = Math.max(18, resolvedSize * fit);
        font = `${s.fontWeight} ${resolvedSize}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (currentBuild !== buildId || !alive) return;
      }

      const targets = [];
      const sampleStep = Math.max(2, Math.floor(s.density));
      const rowStep = resolvedSize * lead;
      rows.forEach((row, line) => {
        offCtx.font = font;
        const metrics = offCtx.measureText(row);
        const left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
        const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width);
        const ascent = Math.ceil(metrics.actualBoundingBoxAscent || resolvedSize * 0.78);
        const descent = Math.ceil(metrics.actualBoundingBoxDescent || resolvedSize * 0.22);
        const padding = Math.max(12, Math.ceil(resolvedSize * 0.08));
        const textWidth = Math.max(1, left + right);
        const textHeight = Math.max(1, ascent + descent);

        offscreen.width = textWidth + padding * 2;
        offscreen.height = textHeight + padding * 2;
        offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
        offCtx.font = font;
        offCtx.textAlign = 'left';
        offCtx.textBaseline = 'alphabetic';
        offCtx.fillStyle = '#ffffff';
        offCtx.fillText(row, padding - left, padding + ascent);

        const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const middle = nextHeight / 2 + (line - (rows.length - 1) / 2) * rowStep;
        for (let y = 0; y < offscreen.height; y += sampleStep) {
          for (let x = 0; x < offscreen.width; x += sampleStep) {
            const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3];
            if (alpha > 40) {
              targets.push({
                x: nextWidth / 2 - offscreen.width / 2 + x,
                y: middle - offscreen.height / 2 + y,
                alpha: alpha / 255,
                line
              });
            }
          }
        }
      });

      const maxParticles = Math.max(900, Math.min(5200, Math.floor((nextWidth * nextHeight) / 90)));
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const selected = targets.filter((_, index) => index % stride === 0);
      const intro = introPending && !reducedMotion;
      introPending = false;

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      layer.width = canvas.width;
      layer.height = canvas.height;

      bounds.left = Infinity;
      bounds.right = -Infinity;
      bounds.top = Infinity;
      bounds.bottom = -Infinity;
      for (const target of selected) {
        bounds.left = Math.min(bounds.left, target.x);
        bounds.right = Math.max(bounds.right, target.x);
        bounds.top = Math.min(bounds.top, target.y);
        bounds.bottom = Math.max(bounds.bottom, target.y);
      }
      if (!selected.length) {
        bounds.left = bounds.right = width / 2;
        bounds.top = bounds.bottom = height / 2;
      }

      particles = selected.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;

        // Sqaron: its line, and a sideways throw of its own for the exit
        const spin = (((index * 7919 + 13) % 1000) / 1000) * TAU;
        const fling = (40 + depth * 90) * clamp(width / 1200, 0.6, 1.6);

        return {
          line: target.line || 0,
          jx: Math.cos(spin) * fling,
          jy: Math.sin(spin) * fling - fling * 0.5,
          from: 0,
          px: target.x,
          py: target.y,
          grow: 1,
          x: target.x,
          y: target.y,
          startX: target.x,
          startY: target.y,
          targetX: target.x,
          targetY: target.y,
          weight: target.alpha,
          tone: clamp(target.x / Math.max(1, width) + (seed - 0.5) * 0.35, 0, 1),
          seed,
          depth,
          delay: 0,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          angle: REST_ANGLE,
          length: 0,
          radius: 0,
          heading: 0,
          startRadius: 0,
          swirl: 0
        };
      });
      bursting = false;

      // Sqaron: each line's extent, and the middle of the text, which the camera zooms about
      lineBoxes = [];
      for (const particle of particles) {
        const box =
          lineBoxes[particle.line] ||
          (lineBoxes[particle.line] = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
        box.left = Math.min(box.left, particle.targetX);
        box.right = Math.max(box.right, particle.targetX);
        box.top = Math.min(box.top, particle.targetY);
        box.bottom = Math.max(box.bottom, particle.targetY);
      }
      for (const box of lineBoxes) {
        if (!box) continue;
        box.cx = (box.left + box.right) / 2;
        box.cy = (box.top + box.bottom) / 2;
        box.reach = Math.max(1, (box.right - box.left) / 2);
      }
      origins = [];
      center.x = width / 2;
      center.y = height / 2;

      if (!pointer.active) {
        pointer.x = width / 2;
        pointer.y = height / 2;
        raw.x = pointer.x;
        raw.y = pointer.y;
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;
      }

      if (intro) {
        startIntro(true);
      } else {
        gathering = false;
      }

      step(performance.now());
      wake();
    };

    function queueSample(intro) {
      if (intro) introPending = true;
      if (sampleFrame) cancelAnimationFrame(sampleFrame);
      sampleFrame = requestAnimationFrame(() => {
        sampleFrame = 0;
        sampleText();
      });
    }

    // Sqaron: map the pointer through any CSS scale on the way to the canvas, then through the camera
    const locate = event => {
      const rect = canvas.getBoundingClientRect();
      raw.x = ((event.clientX - rect.left) * width) / (rect.width || 1);
      raw.y = ((event.clientY - rect.top) * height) / (rect.height || 1);
      unproject();
    };

    // Sqaron: pointerScope="window". The pointer is read from the whole window, so the canvas (pointer-events:
    // none) blocks nothing under it, yet the particles feel the cursor anywhere over it: no edge to push them into
    function fromClient() {
      const rect = canvas.getBoundingClientRect();
      raw.x = ((client.x - rect.left) * width) / (rect.width || 1);
      raw.y = ((client.y - rect.top) * height) / (rect.height || 1);
      unproject();
      return client.x >= rect.left && client.x <= rect.right && client.y >= rect.top && client.y <= rect.bottom;
    }

    const lineAt = (x, y) =>
      lineBoxes.findIndex(
        box => box && x >= box.left - 14 && x <= box.right + 14 && y >= box.top - 14 && y <= box.bottom + 14
      );

    const handleWindowMove = event => {
      client.x = event.clientX;
      client.y = event.clientY;
      lastScroll = window.scrollY;
      if (!fromClient()) {
        if (pointer.active) {
          pointer.active = false;
          hoverLine = -1;
          wake();
        }
        return;
      }
      if (!pointer.active) {
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;
      }
      pointer.active = true;
      // moving onto a line replays that line's intro, as each line did when it had a canvas of its own
      const line = lineAt(pointer.x, pointer.y);
      if (line !== hoverLine) {
        hoverLine = line;
        const leaving = settingsRef.current?.exitRef?.current?.lines;
        if (line >= 0 && settingsRef.current?.trigger === 'hover' && !(leaving && leaving[line] > 0)) {
          startIntro(false, line);
        }
      }
      wake();
    };

    const handleWindowDown = event => {
      const s = settingsRef.current;
      if (!s || s.trigger === 'click' || !s.clickBurst || reducedMotion) return;
      client.x = event.clientX;
      client.y = event.clientY;
      lastScroll = window.scrollY;
      if (fromClient()) burst(pointer.x, pointer.y);
    };

    const handleWindowLeave = () => {
      pointer.active = false;
      hoverLine = -1;
      wake();
    };

    const handlePointerMove = event => {
      locate(event);
      if (!pointer.active) {
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;
      }
      pointer.active = true;
      wake();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      wake();
    };

    const handlePointerEnter = event => {
      handlePointerMove(event);
      if (settingsRef.current?.trigger === 'hover') startIntro(false);
    };

    const handlePointerDown = event => {
      const s = settingsRef.current;
      if (!s || s.trigger === 'click' || !s.clickBurst || reducedMotion) return;
      locate(event);
      burst(pointer.x, pointer.y);
    };

    const handleClick = () => {
      if (settingsRef.current?.trigger === 'click') startIntro(false);
    };

    const handleReduceMotionChange = event => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        gathering = false;
        bursting = false;
        particles.forEach(particle => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.ox = 0;
          particle.oy = 0;
          particle.vx = 0;
          particle.vy = 0;
        });
      }
      wake();
    };

    motionQuery?.addEventListener?.('change', handleReduceMotionChange);
    if (windowScope) {
      // Sqaron
      window.addEventListener('pointermove', handleWindowMove, { passive: true });
      window.addEventListener('pointerdown', handleWindowDown, { passive: true });
      window.addEventListener('pointercancel', handleWindowLeave, { passive: true });
      window.addEventListener('blur', handleWindowLeave);
      document.documentElement.addEventListener('pointerleave', handleWindowLeave);
    } else {
      canvas.addEventListener('pointerenter', handlePointerEnter);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerleave', handlePointerLeave);
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('click', handleClick);
    }
    // Sqaron: whoever drives the exit wakes the loop when it changes
    if (exitHolder?.current) exitHolder.current.wake = wake;

    const resizeObserver = new ResizeObserver(() => {
      if (sizeKey() !== requestedSize) queueSample(false);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(container);

    const themeObserver = new MutationObserver(wake);
    for (const node of [document.documentElement, document.body]) {
      if (node) themeObserver.observe(node, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    }
    const schemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    schemeQuery?.addEventListener?.('change', wake);

    sampleText();

    return () => {
      alive = false;
      buildId += 1;
      wakeRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      schemeQuery?.removeEventListener?.('change', wake);
      motionQuery?.removeEventListener?.('change', handleReduceMotionChange);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('click', handleClick);
      // Sqaron
      window.removeEventListener('pointermove', handleWindowMove);
      window.removeEventListener('pointerdown', handleWindowDown);
      window.removeEventListener('pointercancel', handleWindowLeave);
      window.removeEventListener('blur', handleWindowLeave);
      document.documentElement.removeEventListener('pointerleave', handleWindowLeave);
      if (exitHolder?.current && exitHolder.current.wake === wake) exitHolder.current.wake = null;
      if (raf) cancelAnimationFrame(raf);
      if (sampleFrame) cancelAnimationFrame(sampleFrame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`particle-text ${className}`.trim()}
      style={pointerScope === 'window' ? { ...style, pointerEvents: 'none' } : style}
    >
      <canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" />
      <span className="particle-text__sr">{text}</span>
    </div>
  );
};

export default ParticleText;
