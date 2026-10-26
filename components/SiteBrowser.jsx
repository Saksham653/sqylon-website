'use client';

/* The in-page browser: a macOS-style window that opens a project's live site right here.
 * It grows out of the card that was clicked, keeps the page behind it still, and closes with the red
 * light, the backdrop, or Escape. Sites that forbid being framed (Clonix and LUMIQ send headers that
 * say so) show their screenshot with a button to the live site instead of an empty window. */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useSite } from './SiteProvider';

const SPRING = { type: 'spring', visualDuration: 0.5, bounce: 0.12 };

function windowRect(max) {
  const vw = window.innerWidth, vh = window.innerHeight;
  if (vw < 700 || max) return { w: vw, h: vh, x: 0, y: 0 };
  const w = Math.min(1320, vw * 0.92), h = Math.min(860, vh * 0.88);
  return { w, h, x: (vw - w) / 2, y: (vh - h) / 2 };
}

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
}

function Window({ project, origin, onClose }) {
  const [max, setMax] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const closeBtn = useRef(null);
  const url = new URL(project.url);
  const rect = windowRect(max);

  // grow out of the card that was clicked
  const from = origin
    ? { x: origin.x + origin.w / 2 - (rect.x + rect.w / 2), y: origin.y + origin.h / 2 - (rect.y + rect.h / 2), scale: Math.max(0.2, origin.w / rect.w), opacity: 0.4 }
    : { x: 0, y: 40, scale: 0.94, opacity: 0 };

  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 9000);
    return () => clearTimeout(t);
  }, [nonce]);

  useEffect(() => { closeBtn.current && closeBtn.current.focus({ preventScroll: true }); }, []);

  return (
    <motion.div
      className={`sb__win${max ? ' is-max' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title}, live site`}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      initial={from}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      exit={{ ...from, opacity: 0, transition: { type: 'spring', visualDuration: 0.38, bounce: 0 } }}
      transition={SPRING}
    >
      <div className="sb__bar" onDoubleClick={() => setMax((m) => !m)}>
        <div className="sb__lights">
          <button ref={closeBtn} type="button" className="sb__light sb__light--close" onClick={onClose} aria-label="Close the window"><span aria-hidden="true">×</span></button>
          <button type="button" className="sb__light sb__light--min" onClick={onClose} aria-label="Minimise"><span aria-hidden="true">–</span></button>
          <button type="button" className="sb__light sb__light--max" onClick={() => setMax((m) => !m)} aria-label={max ? 'Exit full size' : 'Full size'}><span aria-hidden="true">+</span></button>
        </div>
        <div className="sb__nav">
          <button type="button" onClick={() => setNonce((n) => n + 1)} aria-label="Reload"><Icon d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></button>
          <button type="button" onClick={() => setNonce((n) => n + 1)} aria-label="Back to the first page"><Icon d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></button>
        </div>
        <div className="sb__url" title={project.url}>
          <Icon size={13} d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z" />
          <span className="sb__host">{url.host.replace(/^www\./, '')}</span>
          <span className="sb__path">{url.pathname === '/' ? '' : url.pathname}</span>
        </div>
        <a className="sb__out" href={project.url} target="_blank" rel="noopener noreferrer" data-cursor="New tab">Open in new tab <span aria-hidden="true">↗</span></a>
      </div>
      <div className="sb__view">
        {project.embed ? (
          <>
            <iframe
              key={nonce}
              src={project.url}
              title={`${project.title}, live site`}
              onLoad={() => setLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
              allow="fullscreen; clipboard-write; autoplay"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className={`sb__loading${loaded ? ' is-done' : ''}`} aria-hidden={loaded}>
              <img src={project.img} alt="" />
              <span className="sb__progress" />
              {slow && !loaded && <a className="sb__slow" href={project.url} target="_blank" rel="noopener noreferrer">Taking a while? Open it in a new tab ↗</a>}
            </div>
          </>
        ) : (
          <div className="sb__blocked">
            <img src={project.img} alt={project.alt} />
            <div className="sb__note">
              <p className="sb__note-kicker">{project.title}</p>
              <p>This site only opens in its own tab. It asks browsers not to show it inside other pages.</p>
              <a className="btn btn--light" href={project.url} target="_blank" rel="noopener noreferrer" data-cursor="Visit">Open the live site <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SiteBrowser() {
  const { browser, closeSite, lenis } = useSite();
  const [mounted, setMounted] = useState(false);
  const lastFocus = useRef(null);
  useEffect(() => setMounted(true), []);

  const open = !!browser;
  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    if (lenis) lenis.stop();
    document.documentElement.classList.add('is-browsing');
    const onKey = (e) => { if (e.key === 'Escape') closeSite(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-browsing');
      if (lenis) lenis.start();
      if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus({ preventScroll: true });
    };
  }, [open, lenis, closeSite]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {browser && (
        <motion.div className="sb" key={browser.project.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
          <div className="sb__backdrop" onClick={closeSite} aria-hidden="true" />
          <Window project={browser.project} origin={browser.origin} onClose={closeSite} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
