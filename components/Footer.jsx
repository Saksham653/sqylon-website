'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export default function Footer() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.foot__mark', { yPercent: 35, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'top 45%', scrub: true } });
    });
  }, { scope: root });
  return (
    <footer className="foot" ref={root}>
      <div className="wrap">
        <p className="foot__mark" id="footMark" aria-label="Sqaron Technologies">SQARON</p>
        <div className="foot__row">
          <span>© 2026 Sqaron Technologies Pvt Ltd · Shivam Jha &amp; Saksham Srivastava · India</span>
          <nav className="foot__links" aria-label="Elsewhere">
            <a href="/shivam-jha/">Shivam Jha</a>
            <a href="/saksham-srivastava/">Saksham Srivastava</a>
            <a href="/osht/">OSHT – Agro Trading</a>
            <a href="https://github.com/shivamj56" target="_blank" rel="noopener noreferrer">GitHub · Shivam</a>
            <a href="https://github.com/Saksham653" target="_blank" rel="noopener noreferrer">GitHub · Saksham</a>
            <a href="/llms.txt">llms.txt</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
