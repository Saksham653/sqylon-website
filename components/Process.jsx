'use client';

/* How a project runs: four steps, with a rail that fills as you read down them (GSAP scrub). */
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { RevealWords, Reveal, Stagger, StaggerItem } from './ui/motion';
import { STEPS } from '@/lib/site';

export default function Process() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.process__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 55%', scrub: true } });
    });
  }, { scope: root });
  return (
    <section className="process wrap" id="process" aria-labelledby="procTitle" ref={root}>
      <div className="process__head">
        <Reveal as="p" className="eyebrow" y={20}>How a project runs</Reveal>
        <RevealWords as="h2" id="procTitle">From a call to <em>live</em>, in four steps.</RevealWords>
        <div className="process__rail" aria-hidden="true"><span className="process__fill" /></div>
      </div>
      <Stagger as="ol" className="steps" gap={0.09}>
        {STEPS.map((s, i) => (
          <StaggerItem key={s.title} className="step" y={40}>
            <span className="step__n">{String(i + 1).padStart(2, '0')}</span><div><h3>{s.title}</h3><p>{s.text}</p></div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
