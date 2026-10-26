'use client';

/* The founder characters that travel down the page: one climbs the rope on the right edge (it doubles
 * as the scroll bar and says something about each section), others sit, peek, point and wave from
 * page elements. The sprite sheet is baked once in WebGL when the browser is idle, then shared with
 * the Work section, where the founder who led a project sits on top of it. */
import { useEffect } from 'react';
import { useSite } from './SiteProvider';

const LOOK = {
  hood: ['#6F5BFF', '#EDEBE6'], pants: ['#1B1D22', '#1B1D22'], trim: ['#F1F0EC', '#111318'], shoe: ['#F4F4F2', '#F4F4F2'],
  rim: '#B8A6FF', sky: '#C9D3E6', ground: '#2A2D35', key: '#FFF6EA',
};

export default function Characters() {
  const { setCharacters, goTo } = useSite();
  useEffect(() => {
    let cancelled = false;
    const cleanups = [];
    const idle = () => new Promise((r) => (window.requestIdleCallback ? window.requestIdleCallback(() => r(), { timeout: 1500 }) : setTimeout(r, 600)));
    const loaded = () => new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', () => r(), { once: true })));
    (async () => {
      await loaded();
      await idle();
      if (cancelled) return;
      const Founders = (await import('@/lib/engines/founders')).default.Founders;
      const C = (await import('@/lib/engines/crawlers')).default.Crawlers;
      if (cancelled || !Founders || !Founders.supported || !C) return;
      let sheet;
      try { sheet = await Founders.sprites(LOOK, { size: 256 }); } catch (err) { console.warn('[sqylon] characters unavailable', err); return; }
      if (cancelled) return;
      const rope = C.rope(sheet, {
        side: 'right', inset: 24, top: 0.16, bottom: 0.76, size: 116,
        onClick: () => goTo('#contact'),
        bubbles: [
          { el: '.hero', text: 'Stir the portrait. Go on.' },
          { el: '#work', text: 'Click a project. It opens right here.' },
          { el: '#services', text: 'Pick one. We build it.' },
          { el: '#founders', text: "That's us. Hi!" },
          { el: '#process', text: 'Plan + price in 72 hours.' },
          { el: '#contact', text: 'Your turn. Tell us the idea.' },
        ],
      });
      cleanups.push(rope);
      cleanups.push(C.perch('.briefbar__in', sheet, { pose: 'sit', at: 0.93, size: 118 }));
      cleanups.push(C.perch('#duoGrid', sheet, { pose: 'peek', at: 0.5, size: 176 }));
      cleanups.push(C.perch('.brief', sheet, { pose: 'point', at: 0.08, size: 128 }));
      cleanups.push(C.perch('#footMark', sheet, { pose: 'wave', at: 0.88, size: 122, fps: 8 }));
      setCharacters({ sheet, C });
    })();
    return () => {
      cancelled = true;
      cleanups.forEach((c) => { const el = c && (c.root || c.wrap); if (el && el.remove) el.remove(); });
    };
  }, [setCharacters, goTo]);
  return null;
}
