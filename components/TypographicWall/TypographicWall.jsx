'use client';

/* Typographic Wall: Sqaron's own implementation (written from scratch, not React Bits Pro code; the
 * props follow the Pro component's documented API so the two are interchangeable).
 *
 * A wall of faint monospace glyphs that keep changing slowly. A bright band sweeps across it; glyphs
 * inside the band scramble fast, and as the band reaches each word the word types itself in. The words
 * hold, dissolve, and the wall decodes again, in new places when `shuffle` is on. Hover or focus a word to
 * clear the noise around it (the wall holds while you do); click an empty spot to deal a new arrangement.
 * The wall is drawn on a canvas from a glyph atlas; the words are real links or buttons in the DOM.
 * Reduced motion shows the still, fully revealed state. */
import { createElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import './TypographicWall.css';

const CHARSETS = {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  code: '{}[]()<>/\\|=+-*_:;.#$%&@!?01ABCDEFabcdef',
  binary: '01',
  hex: '0123456789ABCDEF',
};
const DEFAULT_WORDS = 'Work|Studio|Journal|Archive|Careers|Press|Contact|Newsletter';
const DISSOLVE = 0.6;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const parse = (words) =>
  (typeof words === 'string' ? words.split('|') : words || [])
    .map((w) => (typeof w === 'string' ? { label: w } : w))
    .filter((w) => w && w.label);

const TypographicWall = forwardRef(function TypographicWall(props, ref) {
  const {
    words = DEFAULT_WORDS,
    colors = ['#F4F1FF', '#B19EEF'],
    charset = 'letters',
    layout = 'scatter',
    direction = 'down',
    fontFamily,
    fontWeight = 500,
    fontSize = 14,
    lineHeight = 1.8,
    letterSpacing = 0.12,
    density = 0.7,
    wallOpacity = 0.1,
    shimmer = 0.35,
    scrambleRate = 12,
    scanDuration = 2.6,
    holdDuration = 5,
    restDuration = 0.8,
    stagger = 0.5,
    bandWidth = 0.09,
    loop = true,
    shuffle = true,
    edgeFade = 0.1,
    interactive = true,
    clickToShuffle = true,
    onWordClick,
    paused = false,
    quality = 1,
    linkAs = 'a',
    ariaLabel = 'Words',
    children,
    className = '',
    style,
  } = props;

  const items = useMemo(() => parse(words), [words]);
  const itemsKey = items.map((w) => `${w.label}>${w.href || ''}`).join('|');
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const wordRefs = useRef([]);
  const settings = useRef(null);
  const api = useRef(null);
  settings.current = {
    colors, charset, layout, direction, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, density, wallOpacity,
    shimmer, scrambleRate, scanDuration, holdDuration, restDuration, stagger, bandWidth, loop, shuffle, edgeFade,
    interactive, clickToShuffle, onWordClick, paused, quality,
  };

  useImperativeHandle(ref, () => ({
    shuffle: () => api.current && api.current.shuffle(),
    replay: () => api.current && api.current.replay(),
    focus: (i) => api.current && api.current.focus(i),
  }), []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const S = () => settings.current;
    const chars = () => CHARSETS[S().charset] || S().charset || CHARSETS.letters;

    let alive = true;
    let raf = 0;
    let visible = true;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cw = 8;
    let ch = 14;
    let x0 = 0;
    let y0 = 0;
    let glyph = new Uint8Array(0);
    let next = new Float32Array(0);
    let on = new Uint8Array(0);
    let phaseSeed = new Float32Array(0);
    let clear = new Float32Array(0);
    let covered = new Uint8Array(0);
    let atlas = null;
    let atlasHot = null;
    let atlasW = 0;
    let placed = [];
    let phase = 'idle';
    let phaseAt = 0;
    let last = performance.now();
    let focusIdx = -1;
    let built = false;

    const rand = Math.random;
    const pick = () => {
      const c = chars();
      return Math.floor(rand() * c.length);
    };

    const makeAtlas = (color, family) => {
      const c = chars();
      const cell = Math.ceil(cw * dpr);
      const tall = Math.ceil(ch * dpr);
      const a = document.createElement('canvas');
      a.width = Math.max(1, cell * c.length);
      a.height = Math.max(1, tall);
      const x = a.getContext('2d');
      x.font = `${S().fontWeight} ${S().fontSize * dpr}px ${family}`;
      x.textBaseline = 'middle';
      x.textAlign = 'center';
      x.fillStyle = color;
      for (let i = 0; i < c.length; i++) x.fillText(c[i], i * cell + cell / 2, tall / 2);
      atlasW = cell;
      return a;
    };

    const along = (row, col, len = 1) => {
      const dir = S().direction;
      const v = (row + 0.5) / Math.max(1, rows);
      const h = (col + len / 2) / Math.max(1, cols);
      if (dir === 'up') return 1 - v;
      if (dir === 'right') return h;
      if (dir === 'left') return 1 - h;
      if (dir === 'diagonal') return (v + h) / 2;
      return v;
    };

    const place = () => {
      const s = S();
      const n = items.length;
      const margin = cols > 30 ? 2 : 1;
      const usable = Math.max(1, rows - 2);
      const band = usable / Math.max(1, n);
      const maxLen = items.reduce((m, w) => Math.max(m, w.label.length), 0);
      placed = items.map((w, i) => {
        const len = w.label.length;
        if (i >= usable) return { ...w, len, row: -1, col: 0, at: 0 };
        let row = 1 + Math.floor((i + 0.5) * band);
        let col = margin;
        const room = Math.max(0, cols - len - margin * 2);
        if (s.layout === 'scatter') {
          row = 1 + Math.min(usable - 1, Math.floor(i * band + rand() * Math.max(1, band - 0.6)));
          col = margin + Math.floor(rand() * (room + 1));
        } else if (s.layout === 'diagonal') {
          col = margin + Math.round((n > 1 ? i / (n - 1) : 0) * Math.max(0, cols - maxLen - margin * 2));
        } else if (s.layout === 'center') {
          col = Math.max(0, Math.floor((cols - len) / 2));
        } else {
          row = 1 + Math.floor(i * band);
        }
        return { ...w, len, row, col: clamp(col, 0, Math.max(0, cols - len)), at: 0 };
      });
      placed.forEach((p, i) => {
        const el = wordRefs.current[i];
        if (!el) return;
        if (p.row < 0) { el.style.visibility = 'hidden'; return; }
        el.style.visibility = '';
        el.style.transform = `translate3d(${(x0 + p.col * cw).toFixed(1)}px, ${(y0 + p.row * ch).toFixed(1)}px, 0)`;
      });
    };

    const build = () => {
      const s = S();
      const r = root.getBoundingClientRect();
      width = Math.max(1, r.width);
      height = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2) * clamp(s.quality, 0.25, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const family = s.fontFamily || getComputedStyle(root).fontFamily || 'ui-monospace, monospace';
      ctx.font = `${s.fontWeight} ${s.fontSize}px ${family}`;
      cw = ctx.measureText('M').width + s.letterSpacing * s.fontSize;
      ch = s.fontSize * s.lineHeight;
      cols = Math.max(1, Math.floor(width / cw));
      rows = Math.max(1, Math.floor(height / ch));
      x0 = (width - cols * cw) / 2;
      y0 = (height - rows * ch) / 2;
      const total = cols * rows;
      glyph = new Uint8Array(total);
      next = new Float32Array(total);
      on = new Uint8Array(total);
      phaseSeed = new Float32Array(total);
      clear = new Float32Array(total);
      covered = new Uint8Array(total);
      for (let i = 0; i < total; i++) {
        glyph[i] = pick();
        next[i] = rand() * 2;
        on[i] = rand() < s.density ? 1 : 0;
        phaseSeed[i] = rand() * Math.PI * 2;
      }
      atlas = makeAtlas(s.colors[0], family);
      atlasHot = makeAtlas(s.colors[1], family);
      place();
      built = true;
    };

    const setText = (i, done, tail) => {
      const el = wordRefs.current[i];
      if (!el) return;
      const key = done + '\u0000' + tail;
      if (el.__tw === key) return;
      el.__tw = key;
      const a = el.querySelector('[data-tw-done]');
      const b = el.querySelector('[data-tw-tail]');
      if (a) a.textContent = done;
      if (b) b.textContent = tail;
    };

    const scrambled = (n) => {
      const c = chars();
      let out = '';
      for (let k = 0; k < n; k++) out += c[Math.floor(rand() * c.length)];
      return out;
    };

    const startScan = (now, reshuffle) => {
      const s = S();
      if (reshuffle) place();
      phase = 'scan';
      phaseAt = now;
      placed.forEach((p) => {
        p.at = now / 1000 + along(p.row, p.col, p.len) * s.scanDuration * (1 - s.bandWidth) + rand() * s.stagger * 0.35;
      });
    };

    const revealAll = () => {
      placed.forEach((p, i) => setText(i, p.label, ''));
    };

    const letterTime = () => 0.035 + S().stagger * 0.03;

    const updateWords = (t) => {
      const s = S();
      const li = letterTime();
      covered.fill(0);
      let allDone = true;
      placed.forEach((p, i) => {
        if (p.row < 0) return;
        let shown = 0;
        let tail = 0;
        if (phase === 'scan' || phase === 'hold') {
          const e = t - p.at;
          shown = clamp(Math.floor(e / li), 0, p.len);
          tail = e > 0 && shown < p.len ? Math.min(2, p.len - shown) : 0;
          if (shown < p.len) allDone = false;
        } else if (phase === 'dissolve') {
          const k = clamp((t - phaseAt / 1000) / DISSOLVE, 0, 1);
          shown = Math.round(p.len * (1 - k));
          tail = shown > 0 ? Math.min(2, shown) : 0;
          shown = Math.max(0, shown - tail);
        }
        const done = p.label.slice(0, shown);
        setText(i, done, tail ? scrambled(tail) : '');
        const upto = shown + tail;
        for (let k = 0; k < upto; k++) {
          const c = p.col + k;
          if (c < cols) covered[p.row * cols + c] = 1;
        }
      });
      return allDone;
    };

    const draw = (t, band) => {
      const s = S();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cell = atlasW;
      const tall = Math.ceil(ch * dpr);
      const fx = s.edgeFade;
      const focus = focusIdx >= 0 ? placed[focusIdx] : null;
      for (let r = 0; r < rows; r++) {
        const y = (y0 + r * ch) * dpr;
        const ny = (r + 0.5) / rows;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          // the noise clears around a focused word and eases back when focus leaves
          let target = 0;
          if (focus && focus.row >= 0) {
            const dr = Math.abs(r - focus.row) / 2.6;
            const dc = c < focus.col ? (focus.col - c) / 6 : c >= focus.col + focus.len ? (c - (focus.col + focus.len - 1)) / 6 : 0;
            target = 1 - smooth(0.55, 1.15, Math.hypot(dr, dc));
          }
          clear[i] += (target - clear[i]) * 0.18;
          if (!on[i] || covered[i]) continue;
          const nx = (c + 0.5) / cols;
          const edge = fx > 0 ? smooth(0, fx, Math.min(nx, 1 - nx, ny, 1 - ny)) : 1;
          if (edge <= 0.001) continue;
          const q = along(r, c);
          const hot = band >= -1 ? 1 - smooth(0, s.bandWidth, Math.abs(q - band)) : 0;
          const shim = 1 - s.shimmer + s.shimmer * (0.5 + 0.5 * Math.sin(t * 1.7 + phaseSeed[i]));
          let alpha = s.wallOpacity * shim + hot * 0.55;
          alpha *= edge * (1 - clear[i]);
          if (alpha <= 0.004) continue;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.drawImage(hot > 0.2 ? atlasHot : atlas, glyph[i] * cell, 0, cell, tall, (x0 + c * cw) * dpr, y, cell, tall);
        }
      }
      ctx.globalAlpha = 1;
    };

    const scramble = (t, band) => {
      const s = S();
      const rest = reduced ? 0 : 0.6;
      for (let i = 0; i < glyph.length; i++) {
        if (t < next[i]) continue;
        const r = Math.floor(i / cols);
        const c = i - r * cols;
        const hot = band >= -1 ? 1 - smooth(0, s.bandWidth * 1.4, Math.abs(along(r, c) - band)) : 0;
        const rate = hot > 0.05 ? s.scrambleRate : rest;
        if (rate <= 0) { next[i] = Infinity; continue; }
        glyph[i] = pick();
        next[i] = t + (0.5 + rand()) / rate;
      }
    };

    const frame = (now) => {
      raf = 0;
      if (!alive) return;
      const s = S();
      if (!built) build();
      const t = now / 1000;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (phase === 'idle') startScan(now, false);

      let band = -9;
      if (!s.paused) {
        const since = (now - phaseAt) / 1000;
        if (phase === 'scan') {
          band = -s.bandWidth + (since / s.scanDuration) * (1 + 2 * s.bandWidth);
          const allDone = updateWords(t);
          if (since >= s.scanDuration && allDone) { phase = 'hold'; phaseAt = now; }
        } else if (phase === 'hold') {
          updateWords(t);
          if (focusIdx >= 0) phaseAt += dt * 1000;
          else if (since >= s.holdDuration && s.loop) { phase = 'dissolve'; phaseAt = now; }
        } else if (phase === 'dissolve') {
          updateWords(t);
          if (since >= DISSOLVE) { phase = 'rest'; phaseAt = now; placed.forEach((p, i) => setText(i, '', '')); covered.fill(0); }
        } else if (phase === 'rest') {
          if (since >= s.restDuration) startScan(now, s.shuffle);
        }
        scramble(t, band);
      } else {
        last = now;
      }
      draw(t, band);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !alive || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const still = () => {
      build();
      phase = 'hold';
      revealAll();
      covered.fill(0);
      placed.forEach((p) => { for (let k = 0; k < p.len; k++) if (p.row >= 0 && p.col + k < cols) covered[p.row * cols + p.col + k] = 1; });
      draw(0, -9);
    };

    const shuffleNow = () => {
      if (reduced) { place(); still(); return; }
      if (phase === 'scan' || phase === 'hold') { phase = 'dissolve'; phaseAt = performance.now(); }
      start();
    };

    api.current = {
      shuffle: shuffleNow,
      replay: () => {
        if (reduced) return;
        placed.forEach((p, i) => setText(i, '', ''));
        startScan(performance.now(), false);
        start();
      },
      focus: (i) => {
        const el = wordRefs.current[i];
        const target = el && el.querySelector('a,button');
        if (target) target.focus();
      },
    };

    // pointer and keyboard focus on words: clear the noise around it, dim the rest, hold the wall
    const setFocus = (i) => {
      if (!S().interactive) return;
      focusIdx = i;
      root.classList.toggle('is-focusing', i >= 0);
      wordRefs.current.forEach((el, k) => el && el.classList.toggle('is-focus', k === i));
      start();
    };
    const wordIndex = (e) => {
      const li = e.target.closest && e.target.closest('.tw__word');
      return li ? Number(li.dataset.index) : -1;
    };
    const onOver = (e) => { const i = wordIndex(e); if (i >= 0) setFocus(i); };
    const onOut = (e) => {
      const li = e.target.closest && e.target.closest('.tw__word');
      if (li && !li.contains(e.relatedTarget)) setFocus(-1);
    };
    const onFocusIn = (e) => { const i = wordIndex(e); if (i >= 0) setFocus(i); };
    const onFocusOut = (e) => { if (!root.contains(e.relatedTarget)) setFocus(-1); };
    const onClick = (e) => {
      if (!S().clickToShuffle) return;
      if (e.target.closest && e.target.closest('.tw__word, a, button')) return;
      shuffleNow();
    };
    root.addEventListener('pointerover', onOver);
    root.addEventListener('pointerout', onOut);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('click', onClick);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }, { rootMargin: '120px' });
    io.observe(root);
    const ro = new ResizeObserver(() => {
      built = false;
      if (reduced) still();
      else { build(); startScan(performance.now(), false); start(); }
    });
    ro.observe(root);
    const onVisibility = () => { if (!document.hidden) start(); };
    document.addEventListener('visibilitychange', onVisibility);

    const begin = () => {
      if (!alive) return;
      built = false;
      if (reduced) still();
      else { build(); phase = 'idle'; start(); }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(begin);
    else begin();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerout', onOut);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('click', onClick);
      api.current = null;
    };
    // the engine reads live props from `settings`; it only rebuilds when the words themselves change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  return (
    <div
      ref={rootRef}
      className={`tw ${className}`.trim()}
      style={{
        ...style,
        '--tw-c0': colors[0],
        '--tw-c1': colors[1],
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
      }}
    >
      <canvas ref={canvasRef} className="tw__wall" aria-hidden="true" />
      <ul className="tw__words" aria-label={ariaLabel}>
        {items.map((w, i) => {
          const inner = [
            <span key="s" className="tw__sr">{w.label}</span>,
            <span key="d" data-tw-done="" aria-hidden="true" />,
            <span key="t" data-tw-tail="" className="tw__tail" aria-hidden="true" />,
          ];
          let el;
          if (w.href) el = createElement(linkAs, { href: w.href }, inner);
          else if (onWordClick) el = <button type="button" onClick={() => onWordClick(w.label, i)}>{inner}</button>;
          else el = <span>{inner}</span>;
          return (
            <li key={`${w.label}-${i}`} className="tw__word" data-index={i} ref={(node) => { wordRefs.current[i] = node; }}>
              {el}
            </li>
          );
        })}
      </ul>
      {children}
    </div>
  );
});

export default TypographicWall;
