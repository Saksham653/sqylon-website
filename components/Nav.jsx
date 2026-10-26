'use client';

/* The floating nav: hides on the way down, comes back on the way up. */
import { useEffect, useState } from 'react';
import { Magnetic } from './ui/motion';

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 400);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`nav${hidden ? ' is-hidden' : ''}`} id="nav">
      <div className="nav__in">
        <a className="brand" href="#top" aria-label="Sqaron Technologies, back to top"><span className="brand__drop" aria-hidden="true" /><span>SQARON</span></a>
        <nav className="nav__links" aria-label="Sections">
          <a href="#work">Work</a><a href="#services">Services</a><a href="#founders">Founders</a><a href="#process">Process</a>
        </nav>
        <span className="nav__status"><i aria-hidden="true" />Taking new projects</span>
        <Magnetic className="btn btn--light btn--sm" href="#contact" data-cursor="Let's talk">Start a project <span aria-hidden="true">↗</span></Magnetic>
      </div>
    </header>
  );
}
