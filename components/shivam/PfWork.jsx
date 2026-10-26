'use client';

/* Shivam's work, four ways: the flagship products as a stack of cards that swap, the live sites running
 * inside a Safari window and an iPhone, every screen on a gallery you can spin, and an index of everything.
 * Any of them opens the project's live site in the in-page browser. */
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useSite } from '../SiteProvider';
import CardSwap, { Card } from '../rb/CardSwap/CardSwap';
import FlowingMenu from '../rb/FlowingMenu/FlowingMenu';
import Safari from '../ui21/Safari';
import Iphone from '../ui21/Iphone';
import { SectionHead, useMedia } from './pfShared';
import { FEATURED, LIVE_SITES, WORK } from '@/lib/shivam';

const CircularGallery = dynamic(() => import('../rb/CircularGallery/CircularGallery'), { ssr: false });

const host = (url) => new URL(url).host.replace(/^www\./, '');
// host and path, so sites that share a domain (the three Safarline concepts) read differently
const address = (url) => { const u = new URL(url); return `${host(url)}${u.pathname}`.replace(/\/$/, ''); };
const rectOf = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const newTab = (e) => e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1);

/* ---- selected work: a stack of browser cards that swap on their own -------------------------------------- */

export function Featured() {
  const { openSite } = useSite();
  const [i, setI] = useState(0);
  const swap = useRef(null);
  const stack = useRef(null);
  const p = FEATURED[i];
  const open = (index, el) => openSite(FEATURED[index], rectOf(el || stack.current));

  return (
    <section className="pf-sec pf-wrap" id="work" aria-labelledby="pfWork">
      <SectionHead n="03" label="Selected work" id="pfWork" title={<>Shipped, <em>not just shown.</em></>} note="Three products I designed and built, live today. The cards swap on their own; drag one, or click it to use the real thing right here." />
      <div className="pf-feat">
        <div className="pf-feat__text">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.slug}
              className="pf-feat__copy"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="pf-feat__kind">{p.kind}</p>
              <h3 className="pf-feat__title">{p.title}</h3>
              <p className="pf-feat__line">{p.line}</p>
              <p className="pf-feat__body">{p.body}</p>
              <p className="pf-feat__role"><span>My part</span>{p.role}</p>
              <div className="pf-feat__act">
                <button type="button" className="pf-btn pf-btn--solid cursor-target" data-cursor-label="Open it here" onClick={(e) => open(i, e.currentTarget)}>
                  Try it here <span aria-hidden="true">↗</span>
                </button>
                {p.links.slice(0, 2).map((l) => (
                  <a key={l.href} className="pf-link cursor-target" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="pf-feat__nav">
            <button type="button" className="pf-round cursor-target" onClick={() => swap.current && swap.current.prev()} aria-label="Previous project"><span aria-hidden="true">←</span></button>
            <span className="pf-feat__count" aria-live="polite">
              <b>{String(i + 1).padStart(2, '0')}</b> / {String(FEATURED.length).padStart(2, '0')}
            </span>
            <button type="button" className="pf-round cursor-target" onClick={() => swap.current && swap.current.next()} aria-label="Next project"><span aria-hidden="true">→</span></button>
          </div>
        </div>
        <div className="pf-feat__stack" ref={stack}>
          <CardSwap
            ref={swap}
            width={600}
            height={400}
            cardDistance={56}
            verticalDistance={64}
            depth={110}
            skewAmount={5}
            delay={5600}
            cardRadius={20}
            dim={0.55}
            onChange={setI}
            onCardClick={(index) => open(index)}
            className="pf-swap"
          >
            {FEATURED.map((f) => (
              <Card key={f.slug} customClass="pf-swapcard cursor-target" data-cursor-label={`Open ${f.title}`}>
                <div className="pf-swapcard__bar" aria-hidden="true"><i /><i /><i /><span>{address(f.url)}</span></div>
                <img src={f.img} alt={f.alt} width={f.w} height={f.h} loading="lazy" draggable={false} />
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
}

/* ---- live: the real sites inside a Safari window and an iPhone --------------------------------------------- */

// a site rendered at its real width and scaled down to the frame, so the layout is the true desktop or phone one
// `after` staggers the frames, and each one starts while the browser is idle, so loading a site never
// lands on a frame you are scrolling through
function LiveFrame({ src, w, h, title, after = 0 }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / w));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  useEffect(() => {
    let idle = 0;
    const t = setTimeout(() => {
      if ('requestIdleCallback' in window) idle = requestIdleCallback(() => setGo(true), { timeout: 900 });
      else setGo(true);
    }, after);
    return () => { clearTimeout(t); if (idle) cancelIdleCallback(idle); };
  }, [after]);
  useEffect(() => setLoaded(false), [src]);
  return (
    <div className="pf-frame" ref={box} data-loaded={loaded ? '' : undefined}>
      {scale > 0 && go && (
        <iframe
          key={src}
          src={src}
          title={title}
          tabIndex={-1}
          onLoad={() => setLoaded(true)}
          style={{ width: w, height: h, transform: `scale(${scale})` }}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      )}
      <span className="pf-frame__load" aria-hidden="true"><i /></span>
    </div>
  );
}

export function Live() {
  const { openSite } = useSite();
  const [site, setSite] = useState(LIVE_SITES[0]);
  const stage = useRef(null);
  // the sites only run while you are near them, and stop again once you have scrolled well past
  const near = useInView(stage, { margin: '700px 0px 500px 0px' });
  const wide = useMedia('(min-width: 821px)');
  const open = (e) => openSite(site, rectOf(e.currentTarget));

  return (
    <section className="pf-sec pf-wrap" id="live" aria-labelledby="pfLive">
      <SectionHead n="04" label="Live" id="pfLive" title={<>Don&apos;t trust <em>screenshots.</em></>} note="These are the real sites, running inside the frames at their true desktop and phone widths. Pick one; open it full size to use it." />
      <div className="pf-chips pf-live__chips" role="group" aria-label="Choose a site">
        {LIVE_SITES.map((s) => (
          <button key={s.slug} type="button" className="pf-chip cursor-target" aria-pressed={site.slug === s.slug} onClick={() => setSite(s)}>{s.title}</button>
        ))}
      </div>
      <div className="pf-live" ref={stage}>
        {wide && (
          <motion.div className="pf-live__desk" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ type: 'spring', visualDuration: 0.9, bounce: 0.12 }}>
            <Safari url={address(site.url)}>
              {near && <LiveFrame src={site.url} w={1440} h={840} title={`${site.title}, live, at desktop width`} />}
              <button type="button" className="pf-live__hit cursor-target" onClick={open} data-cursor-label="Open full size" aria-label={`Open ${site.title} full size`} />
            </Safari>
          </motion.div>
        )}
        <motion.div className="pf-live__phone" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ type: 'spring', visualDuration: 1, bounce: 0.14, delay: 0.12 }}>
          <Iphone>
            {near && <LiveFrame src={site.url} w={390} h={844} title={`${site.title}, live, at phone width`} after={wide ? 700 : 0} />}
            <button type="button" className="pf-live__hit cursor-target" onClick={open} data-cursor-label="Open full size" aria-label={`Open ${site.title} full size`} />
          </Iphone>
        </motion.div>
      </div>
      <div className="pf-live__foot">
        <p className="pf-live__line"><b>{site.title}</b> · {site.line}</p>
        <button type="button" className="pf-btn pf-btn--ghost cursor-target" onClick={open} data-cursor-label="Open it here">Open full size <span aria-hidden="true">↗</span></button>
      </div>
    </section>
  );
}

/* ---- screens: every project on a gallery you can spin --------------------------------------------------- */

const GALLERY = WORK.map((w) => ({ image: w.img, text: w.title, alt: w.alt }));

export function Screens() {
  const { openSite } = useSite();
  const [font, setFont] = useState('600 24px system-ui');
  useEffect(() => { setFont(`600 24px ${getComputedStyle(document.body).fontFamily}`); }, []);
  return (
    <section className="pf-screens" aria-labelledby="pfScreens">
      <div className="pf-wrap">
        <SectionHead n="05" label="Screens" id="pfScreens" title={<>Every screen, <em>one spin.</em></>} note="Drag sideways to spin it, use the arrow keys, or click a screen to open that site." />
      </div>
      <div className="pf-screens__stage cursor-target" data-cursor-label="Drag">
        <CircularGallery
          items={GALLERY}
          bend={2.2}
          textColor="#F1F0EC"
          borderRadius={0.035}
          font={font}
          scrollSpeed={2}
          scrollEase={0.06}
          itemSize={1}
          itemAspect={1.62}
          gap={0.22}
          autoScroll={0.35}
          openOnClick={false}
          wheel="x"
          onItemClick={(item, index) => openSite(WORK[index % WORK.length], null)}
        />
      </div>
    </section>
  );
}

/* ---- index: everything, as a menu that floods with a marquee on hover --------------------------------------- */

const MENU = WORK.map((w) => ({ text: w.title, marquee: w.line, image: w.img, link: w.url, meta: w.role }));

export function Index() {
  const { openSite } = useSite();
  return (
    <section className="pf-sec pf-wrap" id="index" aria-labelledby="pfIndex">
      <SectionHead n="06" label="Index" id="pfIndex" title={<>Everything, <em>at a glance.</em></>} note="Each row opens that live site right here; hold ⌘ or Ctrl to open it in a new tab instead." />
      <div className="pf-index">
        <FlowingMenu
          items={MENU}
          speed={70}
          textColor="#F1F0EC"
          bgColor="#0B0B10"
          marqueeBgColor="#F1F0EC"
          marqueeTextColor="#0A0B0E"
          borderColor="rgba(241, 240, 236, 0.12)"
          showIndex
          showArrow
          align="left"
          imageShape="pill"
          ariaLabel="All projects"
          onItemClick={(item, index, e) => {
            if (newTab(e)) return;
            e.preventDefault();
            openSite(WORK[index], rectOf(e.currentTarget));
          }}
        />
      </div>
    </section>
  );
}
