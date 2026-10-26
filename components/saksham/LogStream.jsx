'use client';

/* `tail -f saksham.log`: what his systems do, written out as log lines. They describe real features;
 * the timestamps are this visitor's clock, not production data. */
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { LOG_LINES } from '@/lib/saksham';

const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

export default function LogStream({ max = 11 }) {
  const box = useRef(null);
  const inView = useInView(box, { amount: 0.3 });
  const [lines, setLines] = useState(() => LOG_LINES.slice(0, 5).map((l, i) => ({ id: i, t: '··:··:··', l })));
  const next = useRef(5);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const tick = () => {
      const l = LOG_LINES[next.current % LOG_LINES.length];
      next.current += 1;
      setLines((cur) => [...cur.slice(-(max - 1)), { id: next.current + 1000, t: stamp(), l }]);
    };
    tick();
    const id = setInterval(tick, 1300);
    return () => clearInterval(id);
  }, [inView, max]);

  return (
    <div className="sk-term sk-logs" ref={box}>
      <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>tail -f saksham.log</span><span className="sk-live"><i />live</span></div>
      <ol className="sk-logs__list" aria-label="What his systems do">
        {lines.map(({ id, t, l: [tag, msg, from] }) => (
          <li key={id}>
            <span className="sk-logs__t">{t}</span>
            <span className={`sk-logs__tag sk-tag--${tag}`}>[{tag}]</span>
            <span className="sk-logs__msg">{msg}</span>
            <span className="sk-logs__from">{from}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
