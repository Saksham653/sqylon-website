'use client';

/* Text that decodes itself: each character cycles through code glyphs, then locks, left to right.
 * Every character keeps the width of its final letter, so the line never jitters. */
import { useEffect, useMemo, useState } from 'react';

const GLYPHS = '{}[]()<>/\\|=+-*_:;#$%&@!?01ABCDEF';

export default function ScrambleText({ text, as: Tag = 'span', delay = 0, step = 34, className = '', play = true }) {
  const chars = useMemo(() => text.split(''), [text]);
  const [state, setState] = useState(() => chars.map(() => null));

  useEffect(() => {
    if (!play) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setState(chars.map(() => null)); return undefined; }
    const lockAt = chars.map((_, i) => delay + i * step + Math.random() * 160);
    let raf = 0;
    let t0 = 0;
    let last = 0;
    const tick = (now) => {
      if (!t0) t0 = now;
      const e = now - t0;
      if (now - last > 45) {
        last = now;
        let done = true;
        setState(chars.map((c, i) => {
          if (c === ' ' || e >= lockAt[i]) return null;
          done = false;
          return e < delay ? '' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }));
        if (done) return;
      }
      raf = requestAnimationFrame(tick);
    };
    setState(chars.map((c) => (c === ' ' ? null : '')));
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chars, delay, step, play]);

  return (
    <Tag className={`scr ${className}`.trim()} aria-label={text}>
      {chars.map((c, i) => (
        <span className={`scr__ch${state[i] === null ? '' : ' is-busy'}`} key={i} aria-hidden="true">
          <span className="scr__f">{c === ' ' ? ' ' : c}</span>
          {state[i] !== null && <span className="scr__g">{state[i]}</span>}
        </span>
      ))}
    </Tag>
  );
}
