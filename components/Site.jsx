'use client';

/* The home page, client side: smooth scroll, page state, the sections, the characters and the
 * in-page browser. MotionConfig makes every Motion animation honour the reduced-motion setting. */
import { MotionConfig } from 'motion/react';
import SmoothScroll from './SmoothScroll';
import { SiteProvider } from './SiteProvider';
import Cursor from './Cursor';
import Nav from './Nav';
import Hero from './Hero';
import Works from './Works';
import Lab from './Lab';
import Services from './Services';
import Founders from './Founders';
import Process from './Process';
import Numbers from './Numbers';
import Contact from './Contact';
import Footer from './Footer';
import Characters from './Characters';
import SiteBrowser from './SiteBrowser';

export default function Site() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SiteProvider>
          <a className="skip" href="#main">Skip to content</a>
          <div className="grain" aria-hidden="true" />
          <Cursor />
          <Nav />
          <main id="main">
            <Hero />
            <Works />
            <Lab />
            <Services />
            <Founders />
            <Process />
            <Numbers />
            <Contact />
          </main>
          <Footer />
          <Characters />
          <SiteBrowser />
        </SiteProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
