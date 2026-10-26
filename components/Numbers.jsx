'use client';

/* The studio in four numbers; each counts up once when it scrolls into view. */
import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { Stagger, StaggerItem } from './ui/motion';
import { NUMBERS } from '@/lib/site';

function Count({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const calm = useReducedMotion();
  useEffect(() => {
    if (calm || !ref.current) return;
    ref.current.textContent = '0';
  }, [calm]);
  useEffect(() => {
    if (!inView || calm) return undefined;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = String(Math.round(v)); } });
    return () => c.stop();
  }, [inView, calm, to]);
  return <b ref={ref}>{to}</b>;
}

export default function Numbers() {
  return (
    <Stagger as="section" className="numbers wrap" aria-label="Sqaron in numbers" gap={0.08}>
      {NUMBERS.map((n) => (
        <StaggerItem as="div" className="num" key={n.text} y={40}><Count to={n.n} /><span>{n.text}</span></StaggerItem>
      ))}
    </Stagger>
  );
}
