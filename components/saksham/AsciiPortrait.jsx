'use client';

/* The founder's photo rebuilt from characters, decoding top to bottom when it comes into view.
 * Move over it and the real photo shows through a lens that follows the cursor. */
import { useEffect, useRef } from 'react';

const RAMP = ' .:-=+*#%@';
const NOISE = '{}[]()<>/\\|=+-*_:;#$%&@!?01';

export default function AsciiPortrait({ src, alt, cols = 70, color = '110, 242, 166', className = '' }) {
  const wrap = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alive = true;
    let raf = 0;
    let lum = null;
    let rows = 0;
    let started = 0;
    let lock = null;
    let seen = false;

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    const sample = () => {
      // a 4:5 crop around the face, so every cell is about one character tall by half wide
      // a tight 4:5 crop on the head (the photo is framed like the hero portrait: face centred, eyes ~35% down)
      const W = img.naturalWidth, H = img.naturalHeight;
      const sh = Math.min(H * 0.6, (W * 0.62) / 0.8), sw = sh * 0.8;
      const sx = Math.max(0, Math.min(W - sw, W * 0.47 - sw / 2)), sy = H * 0.04;
      rows = Math.round(cols * (sh / sw) * 0.5);
      // work at 3x the character grid: equalise the tones, find the edges (glasses, eyes, beard, hairline),
      // then fold both into one value per character
      const K = 3, gw = cols * K, gh = rows * K;
      const off = document.createElement('canvas');
      off.width = gw;
      off.height = gh;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.drawImage(img, sx, sy, sw, sh, 0, 0, gw, gh);
      const data = o.getImageData(0, 0, gw, gh).data;
      const g = new Float32Array(gw * gh);
      const hist = new Uint32Array(256);
      for (let i = 0; i < gw * gh; i++) {
        const v = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        g[i] = v / 255;
        hist[Math.min(255, Math.round(v))] += 1;
      }
      const cdf = new Float32Array(256);
      let acc = 0;
      for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc / (gw * gh); }
      const eq = (v) => cdf[Math.min(255, Math.round(v * 255))];
      const edge = new Float32Array(gw * gh);
      let emax = 0.001;
      for (let y = 1; y < gh - 1; y++) {
        for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x;
          const gx = -g[i - gw - 1] - 2 * g[i - 1] - g[i + gw - 1] + g[i - gw + 1] + 2 * g[i + 1] + g[i + gw + 1];
          const gy = -g[i - gw - 1] - 2 * g[i - gw] - g[i - gw + 1] + g[i + gw - 1] + 2 * g[i + gw] + g[i + gw + 1];
          edge[i] = Math.sqrt(gx * gx + gy * gy);
          emax = Math.max(emax, edge[i]);
        }
      }
      lum = new Float32Array(cols * rows);
      let lo = 1, hi = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let tone = 0, ed = 0;
          for (let j = 0; j < K; j++) for (let k = 0; k < K; k++) {
            const i = (y * K + j) * gw + (x * K + k);
            tone += eq(g[i]);
            ed = Math.max(ed, edge[i] / emax);
          }
          tone /= K * K;
          // vignette: the face stays lit, the busy background falls away
          const dx = (x / cols - 0.5) / 0.52, dy = (y / rows - 0.48) / 0.62;
          const d = Math.sqrt(dx * dx + dy * dy);
          const t = Math.min(1, Math.max(0, (d - 0.4) / 0.62));
          const keep = 1 - 0.86 * t * t * (3 - 2 * t);
          const v = (0.5 * tone + 0.85 * Math.pow(ed, 0.8)) * keep;
          lum[y * cols + x] = v;
          lo = Math.min(lo, v); hi = Math.max(hi, v);
        }
      }
      for (let i = 0; i < lum.length; i++) lum[i] = Math.pow((lum[i] - lo) / Math.max(0.01, hi - lo), 1.25);
      lock = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) lock[r * cols + c] = (r / rows) * 1100 + Math.random() * 500;
    };

    const draw = (now) => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      ctx.clearRect(0, 0, w, h);
      const cw = w / cols, chh = h / rows;
      ctx.font = `500 ${Math.floor(chh * 0.92)}px ${getComputedStyle(box).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const e = reduced ? Infinity : now - started;
      let busy = false;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const v = lum[i];
          let ch;
          let a;
          if (e >= lock[i]) {
            ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
            a = 0.2 + v * 0.8;
          } else {
            busy = true;
            if (e < lock[i] - 650) continue;
            ch = NOISE[Math.floor(Math.random() * NOISE.length)];
            a = 0.35;
          }
          if (ch === ' ') continue;
          ctx.fillStyle = `rgba(${color}, ${a.toFixed(3)})`;
          ctx.fillText(ch, x * cw + cw / 2, y * chh + chh / 2);
        }
      }
      return busy;
    };

    const loop = (now) => {
      raf = 0;
      if (!alive || !lum) return;
      if (draw(now)) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting || seen || !lum) return;
      seen = true;
      started = performance.now();
      raf = requestAnimationFrame(loop);
    }, { threshold: 0.25 });

    img.onload = () => {
      if (!alive) return;
      sample();
      if (reduced) { draw(0); return; }
      io.observe(box);
    };
    const ro = new ResizeObserver(() => { if (lum && (!raf)) draw(seen ? performance.now() + 1e9 : 0); });
    ro.observe(box);

    return () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [src, cols, color]);

  const move = (e) => {
    const r = wrap.current.getBoundingClientRect();
    wrap.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    wrap.current.style.setProperty('--my', `${e.clientY - r.top}px`);
    wrap.current.classList.add('is-lens');
  };
  const leave = () => wrap.current.classList.remove('is-lens');

  return (
    <div className={`ascii ${className}`.trim()} ref={wrap} onPointerMove={move} onPointerLeave={leave}>
      <canvas ref={canvas} aria-hidden="true" />
      <img className="ascii__photo" src={src} alt={alt} />
    </div>
  );
}
