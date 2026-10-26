'use client';

/* The custom cursor: a dot, a trailing ring, and a label for things you can act on ([data-cursor]).
 * Mouse and trackpad only; touch screens and reduced motion keep the system cursor. */
import { useEffect, useRef } from 'react';
import { useSite } from './SiteProvider';

export default function Cursor() {
  const { cursorRef } = useSite();
  const root = useRef(null);
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return undefined;
    const html = document.documentElement;
    html.classList.add('has-cursor');
    let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y, last = performance.now(), raf = 0;
    const setLabel = (text) => {
      if (!root.current) return;
      if (text) { label.current.textContent = text; root.current.classList.add('is-label'); }
      else root.current.classList.remove('is-label');
    };
    cursorRef.current = { setLabel };
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const down = () => root.current && root.current.classList.add('is-down');
    const up = () => root.current && root.current.classList.remove('is-down');
    const over = (e) => { const t = e.target.closest && e.target.closest('[data-cursor]'); if (t) setLabel(t.dataset.cursor); };
    const out = (e) => { const t = e.target.closest && e.target.closest('[data-cursor]'); if (t && !t.contains(e.relatedTarget)) setLabel(null); };
    const loop = (now) => {
      const k = 1 - Math.exp(-(now - last) / 45);
      last = now;
      rx += (x - rx) * k; ry += (y - ry) * k;
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.current.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      cursorRef.current = null;
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
    };
  }, [cursorRef]);

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span className="cursor__ring" ref={ring}><em className="cursor__label" ref={label} /></span>
      <span className="cursor__dot" ref={dot} />
    </div>
  );
}
