'use client';

/* Selected work.
 * Laptop: the section pins and the giant word WORK flies at you through its O. The reel sits still
 * behind the letters (no motion fighting the zoom) and eases from a slight close-up to rest, so the O
 * becomes a window that opens onto the work. When the letters are gone the story panel fades in, and
 * scrolling moves the reel one project at a time. Everything runs on ONE scrubbed GSAP timeline, so the
 * zoom, the mask, the panel and the reel can never drift apart.
 * Clicking the centred project opens its live site in the in-page browser window; clicking a side
 * project or a tick scrolls to it.
 * Phones and reduced motion: no pin; the reel is moved by hand and the story sits under it.
 * No WebGL2: a plain grid of the same projects.
 */
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import FlexCarousel from './FlexCarousel/FlexCarousel';
import { gsap, useGSAP } from '@/lib/gsap';
import { useSite } from './SiteProvider';
import { PROJECTS } from '@/lib/projects';

const N = PROJECTS.length;
const ZOOM = 1.25; // viewport heights spent flying through WORK
const REEL = 0.62 * (N - 0.5); // viewport heights spent on the reel
const progressFor = (k) => (k + 0.25) / (N - 0.5);
const ITEMS = PROJECTS.map((p) => ({ src: p.img, alt: p.alt, title: p.title }));
const pad = (n) => String(n).padStart(2, '0');

function Digits({ value }) {
  return (
    <span className="works__num">
      {pad(value).split('').map((d, i) => (
        <span className="dg" key={i}>
          <span className="dg__reel" style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
            {'0123456789'.split('').map((n) => <span key={n}>{n}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}

const story = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
  exit: { opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.18, ease: [0.5, 0, 0.75, 0] } },
};
const line = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', visualDuration: 0.5, bounce: 0.12 } },
};
const titleWord = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { type: 'spring', visualDuration: 0.55, bounce: 0.16 } },
};

function Story({ project, index, onOpen }) {
  const words = project.title.split(' ');
  return (
    <motion.div className="wi" key={project.slug} variants={story} initial="hidden" animate="show" exit="exit">
      <div className="wi__a">
        <motion.p className="wd__kind" variants={line}><span>{pad(index + 1)}</span>{project.kind}</motion.p>
        <motion.h3 className="wd__title" aria-label={project.title} variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="wl" aria-hidden="true"><motion.span className="wl__in" variants={titleWord}>{w}</motion.span></span>
              {i < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </motion.h3>
        <motion.p className="wd__line" variants={line}>{project.line}</motion.p>
      </div>
      <div className="wi__b">
        <motion.p className="wd__body" variants={line}>{project.body}</motion.p>
      </div>
      <div className="wi__c">
        <motion.p className="credit" variants={line}>
          {project.credit.map((c, i) => (
            <span className="credit__row" key={i}>
              <span className="credit__role">{c.role}</span> <b>{c.name}</b>
              {c.note ? <em className="credit__note">{c.note}</em> : null}
            </span>
          ))}
        </motion.p>
        <motion.div className="wd__links" variants={line}>
          <button type="button" className="wd__open" onClick={onOpen} data-cursor="Open" aria-label={`Try ${project.title} here, in an in-page browser`}><span className="wd__dot" aria-hidden="true" />Try it here</button>
          {project.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit">{l.label} ↗</a>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Rider({ api, active, enabled }) {
  const { characters } = useSite();
  const box = useRef(null);
  const canvas = useRef(null);
  useEffect(() => {
    if (!enabled || !characters) return undefined;
    const { sheet, C } = characters;
    const SIZE = 104;
    const c = C.makeCanvas(SIZE);
    canvas.current = c;
    box.current.append(c);
    let raf = 0, lastActive = -1, hopStart = 0, frame = -1, who = '';
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const rect = api.current && api.current.activeRect();
      if (!rect) { box.current.style.opacity = '0'; return; }
      box.current.style.opacity = '1';
      const i = api.current.active;
      if (i !== lastActive) { lastActive = i; hopStart = now; }
      const k = (now - hopStart) / 520;
      const hop = k < 1 ? Math.sin(k * Math.PI) * 64 : 0;
      const x = rect.x0 + (rect.x1 - rect.x0) * 0.8 - SIZE / 2;
      const y = rect.y0 - sheet.anchors.seat * SIZE - hop;
      box.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const lead = PROJECTS[i] && PROJECTS[i].lead === 'A' ? 'A' : 'B';
      const frames = sheet[lead].sit;
      const f = k < 1 ? 0 : Math.floor(now / 190) % frames.length;
      if (f !== frame || lead !== who) { C.paint(c, frames[f]); frame = f; who = lead; }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); c.remove(); if (box.current) box.current.style.opacity = '0'; };
  }, [enabled, characters, api]);
  return <div className="works__rider" ref={box} aria-hidden="true" data-active={active} />;
}

export default function Works() {
  const { goTo, openSite, setCursor } = useSite();
  const root = useRef(null);
  const reelWrap = useRef(null);
  const mask = useRef(null);
  const word = useRef(null);
  const letterO = useRef(null);
  const intro = useRef(null);
  const hud = useRef(null);
  const api = useRef(null);
  const tlRef = useRef(null);
  const proxy = useRef({ p: 0 });
  const openRef = useRef(false);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState(null); // 'drive' | 'free' | 'plain'
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    let ok = false;
    try { ok = !!document.createElement('canvas').getContext('webgl2'); } catch { ok = false; }
    if (!ok) setMode('plain');
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useGSAP(() => {
    if (mode === 'plain') return;
    const mm = gsap.matchMedia();
    mm.add({ drive: '(min-width: 901px) and (prefers-reduced-motion: no-preference)', free: '(max-width: 900px), (prefers-reduced-motion: reduce)' }, (ctx) => {
      if (ctx.conditions.free) { setMode('free'); return undefined; }
      setMode('drive');
      // fly through the O: scale about a point in its left stroke, so the stroke fills the screen
      const setOrigin = () => {
        gsap.set(word.current, { scale: 1 });
        const wr = word.current.getBoundingClientRect();
        const r = letterO.current.getBoundingClientRect();
        gsap.set(word.current, { transformOrigin: `${(r.left - wr.left + r.width * 0.13).toFixed(1)}px ${(r.top - wr.top + r.height * 0.52).toFixed(1)}px` });
      };
      setOrigin();
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: () => '+=' + Math.round((ZOOM + REEL) * window.innerHeight),
          pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: setOrigin,
        },
      });
      tl.to(word.current, { scale: 46, ease: 'power3.in', duration: ZOOM }, 0)
        .to(intro.current, { autoAlpha: 0, y: -24, duration: ZOOM * 0.16 }, 0)
        .fromTo(reelWrap.current, { scale: 1.14 }, { scale: 1, ease: 'power2.out', duration: ZOOM }, 0)
        .to(mask.current, { autoAlpha: 0, duration: ZOOM * 0.12 }, ZOOM * 0.88)
        .fromTo(hud.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: ZOOM * 0.1 }, ZOOM * 0.98)
        .to(proxy.current, { p: 1, duration: REEL, onUpdate: () => api.current && api.current.setDrive(proxy.current.p) }, ZOOM);
      tl.eventCallback('onUpdate', () => {
        const isOpen = tl.time() >= ZOOM * 0.97;
        if (isOpen !== openRef.current) { openRef.current = isOpen; setOpen(isOpen); }
      });
      tlRef.current = tl;
      return () => {
        tlRef.current = null;
        openRef.current = false;
        setOpen(false);
        gsap.set([word.current, reelWrap.current], { clearProps: 'transform,transformOrigin' });
      };
    });
  }, { scope: root, dependencies: [mode === 'plain'] });

  // once the reel exists, give it the current scroll position (a reload can land mid-section)
  useEffect(() => {
    if (mode === 'drive' && api.current) api.current.setDrive(proxy.current.p);
  }, [mode]);

  const jump = useCallback((i) => {
    const tl = tlRef.current;
    if (mode !== 'drive' || !tl) { if (api.current) api.current.goTo(i); return; }
    const st = tl.scrollTrigger;
    const y = st.start + ((ZOOM + progressFor(i) * REEL) / (ZOOM + REEL)) * (st.end - st.start);
    goTo(y, { duration: 1.1 });
  }, [mode, goTo]);

  const openProject = useCallback((i) => {
    const holder = root.current && root.current.querySelector('.works__reel');
    const r = api.current && api.current.activeRect();
    let origin = null;
    if (holder && r) {
      const h = holder.getBoundingClientRect();
      origin = { x: h.left + r.x0, y: h.top + r.y0, w: r.x1 - r.x0, h: r.y1 - r.y0 };
    }
    setCursor(null);
    openSite(PROJECTS[i], origin);
  }, [openSite, setCursor]);

  const onHover = useCallback((kind) => {
    setCursor(kind === 'center' ? 'Open' : kind === 'side' ? 'View' : null);
  }, [setCursor]);

  const project = PROJECTS[active];
  const drive = mode === 'drive';

  return (
    <section className={`works${mode ? ` is-${mode}` : ''}${open ? ' is-open' : ''}`} id="work" ref={root} aria-labelledby="worksTitle">
      <div className="works__stage">
        <div className="works__glow" aria-hidden="true" />
        <div className="works__reel" ref={reelWrap}>
          {(mode === 'drive' || mode === 'free') && (
            <FlexCarousel
              items={ITEMS}
              preset="liquid"
              intro="bloom"
              cardHeight={drive ? 0.48 : phone ? 0.66 : 0.52}
              bend={drive ? 0.28 : phone ? 0.18 : 0.26}
              dispersion={0.26}
              gap={28}
              radius={14}
              squeeze={0.12}
              captions={false}
              captureWheel={false}
              focusOnClick={false}
              drive={drive}
              drag={!drive}
              apiRef={api}
              onChange={(i) => setActive(i)}
              onSelect={(i) => openProject(i)}
              onPick={(i) => jump(i)}
              onHover={onHover}
              ariaLabel="Selected work. Use the arrow keys to move between projects and Enter to open one."
            />
          )}
        </div>
        <div className="works__mask" ref={mask} aria-hidden="true">
          <span className="works__word" ref={word}>W<span ref={letterO}>O</span>RK</span>
        </div>
        <div className="works__intro" ref={intro} aria-hidden="true">
          <p className="works__kicker">Selected work · 2025 – 2026</p>
          <p className="works__hint">Scroll to dive in</p>
        </div>
        <div className="works__hud" ref={hud}>
          <div className="works__top">
            <h2 className="works__title" id="worksTitle">Selected <em>work</em></h2>
            <div className="works__ticks" role="group" aria-label="Jump to a project">
              {PROJECTS.map((p, i) => (
                <button key={p.slug} type="button" className="works__tick" aria-label={`Show ${p.title}`} aria-current={i === active} onClick={() => jump(i)}><i /></button>
              ))}
            </div>
            <p className="works__count" aria-hidden="true"><Digits value={active + 1} /><i>/</i><span>{pad(N)}</span></p>
          </div>
          <div className="works__info">
            <AnimatePresence mode="wait" initial={false}>
              <Story key={project.slug} project={project} index={active} onOpen={() => openProject(active)} />
            </AnimatePresence>
          </div>
        </div>
        <Rider api={api} active={active} enabled={drive && open} />
      </div>

      {/* every project in plain markup: the fallback without WebGL2, and the full list for search engines */}
      <ol className="works__list" aria-hidden={mode && mode !== 'plain' ? 'true' : undefined}>
        {PROJECTS.map((p, i) => (
          <li className="work" key={p.slug}>
            <button type="button" className="work__shot" onClick={() => openSite(p, null)} tabIndex={mode === 'plain' ? 0 : -1} aria-label={`Open ${p.title}`}>
              <img src={p.img} alt={p.alt} width={p.w} height={p.h} loading="lazy" />
            </button>
            <div className="work__detail">
              <p className="wd__kind"><span>{pad(i + 1)}</span>{p.kind}</p>
              <h3 className="wd__title">{p.title}</h3>
              <p className="wd__line">{p.line}</p>
              <p className="wd__body">{p.body}</p>
              <div className="wd__links">
                {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" tabIndex={mode === 'plain' ? 0 : -1}>{l.label} ↗</a>)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
