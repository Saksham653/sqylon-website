'use client';

/* Page-wide state: smooth scrolling to a target, the in-page browser window, the brief that the
 * hero bar hands to the contact form, the founder sprites, and the custom cursor's label. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLenisInstance } from './SmoothScroll';
import { NEEDS, WHENS, BUDGETS } from '@/lib/site';

const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const lenis = useLenisInstance();
  const [browser, setBrowser] = useState(null);
  const [brief, setBrief] = useState({ need: NEEDS[0], when: WHENS[0], budget: BUDGETS[0], nonce: 0 });
  const [characters, setCharacters] = useState(null);
  const cursorRef = useRef(null);

  const goTo = useCallback((target, { duration = 1.3, offset = 0, onComplete } = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el == null) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) {
      lenis.scrollTo(el, { duration, offset, onComplete });
      return;
    }
    const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: calm ? 'auto' : 'smooth' });
    if (onComplete) setTimeout(onComplete, calm ? 0 : 800);
  }, [lenis]);

  // in-page anchors (#work, #contact...) glide with Lenis
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      goTo(el);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [goTo]);

  const setCursor = useCallback((text) => cursorRef.current && cursorRef.current.setLabel(text), []);
  const openSite = useCallback((project, origin) => setBrowser({ project, origin }), []);
  const closeSite = useCallback(() => setBrowser(null), []);

  const value = useMemo(() => ({
    lenis, goTo, browser, openSite, closeSite, brief, setBrief, characters, setCharacters, cursorRef, setCursor,
  }), [lenis, goTo, browser, openSite, closeSite, brief, characters, setCursor]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
