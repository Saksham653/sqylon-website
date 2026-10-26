'use client';

/* What we build. On a laptop a preview of related work follows the cursor over the list. */
import { useEffect, useRef, useState } from 'react';
import { RevealWords, Reveal, Stagger, StaggerItem } from './ui/motion';
import { SERVICES } from '@/lib/site';

export default function Services() {
  const peek = useRef(null);
  const [img, setImg] = useState(SERVICES[0].img);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0, last = performance.now();
    const move = (e) => {
      const w = 340;
      tx = e.clientX + 28 + w > window.innerWidth ? e.clientX - w - 28 : e.clientX + 28;
      ty = Math.min(window.innerHeight - 230, Math.max(12, e.clientY - 110));
    };
    const loop = (now) => {
      const k = 1 - Math.exp(-(now - last) / 70);
      last = now;
      px += (tx - px) * k; py += (ty - py) * k;
      if (peek.current) peek.current.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${((tx - px) * 0.03).toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); };
  }, []);

  return (
    <section className="services wrap" id="services" aria-labelledby="svcTitle">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow" y={20}>What we build</Reveal>
        <RevealWords as="h2" id="svcTitle">One team, from the first screen <em>to the last API call.</em></RevealWords>
      </div>
      <Stagger as="ul" className="svc" gap={0.06}>
        {SERVICES.map((s, i) => (
          <StaggerItem key={s.title} className="svc__item" onPointerEnter={() => { setImg(s.img); setOn(true); }} onPointerLeave={() => setOn(false)}>
            <span className="svc__n">{String(i + 1).padStart(2, '0')}</span><h3>{s.title}</h3><p>{s.text}</p><span className="svc__tags">{s.tags}</span>
          </StaggerItem>
        ))}
      </Stagger>
      <div className={`svc__peek${on ? ' is-on' : ''}`} ref={peek} aria-hidden="true"><img alt="" src={img} /></div>
    </section>
  );
}
