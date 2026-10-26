'use client';

import { RevealWords, Stagger, StaggerItem } from './ui/motion';
import { LAB } from '@/lib/site';

export default function Lab() {
  return (
    <section className="lab wrap" aria-labelledby="labTitle">
      <RevealWords as="h2" className="lab__title" id="labTitle">More from the lab</RevealWords>
      <Stagger as="ul" className="lab__list" gap={0.05}>
        {LAB.map((item) => (
          <StaggerItem key={item.name} y={26}>
            <b>{item.name}</b><span>{item.what}</span><em>{item.who}</em>
            {item.href
              ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.cta} ↗</a>
              : <span className="lab__state">{item.state}</span>}
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
