'use client';

/* The hero: the headline, the liquid founder portrait (WebGL), the quick brief bar and the
 * marquee of live work. The portrait flips between Shivam and Saksham at random moments or when
 * you stir it, and the headline line that belongs to whoever is in the frame lights up. */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useSite } from './SiteProvider';
import { Magnetic } from './ui/motion';
import { FOUNDERS, NEEDS, WHENS, BUDGETS } from '@/lib/site';
import { PROJECTS } from '@/lib/projects';

const rise = (delay) => ({
  initial: { opacity: 0, y: 46 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', visualDuration: 1.1, bounce: 0.1, delay },
});

function LiquidPortrait({ who, onFlip }) {
  const canvas = useRef(null);
  const engine = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const SQ = (await import('@/lib/engines/liquid')).default;
        if (cancelled || !SQ.Liquid) return;
        const liquid = await SQ.Liquid(canvas.current, { A: FOUNDERS.A.img, B: FOUNDERS.B.img }, { onFlip: (k) => onFlip(k) });
        if (cancelled || !liquid) return;
        engine.current = liquid;
        onFlip(liquid.who);
        setLive(true);
      } catch (err) {
        console.warn('[sqylon] liquid portrait unavailable', err);
      }
    })();
    return () => { cancelled = true; };
    // the engine is created once; onFlip only sets state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swap = () => {
    if (engine.current) engine.current.flip();
    else onFlip(who === 'A' ? 'B' : 'A');
  };

  return (
    <motion.figure className={`portrait${live ? ' is-live' : ''}`} id="portrait" {...rise(0.3)}>
      <div className="portrait__frame">
        <canvas ref={canvas} role="img" aria-label="Portrait of a Sqaron founder. Move through it to stir it like liquid metal and reveal the other founder, or use Switch founder." data-cursor="Stir" />
        <img className="portrait__still" src={FOUNDERS[who].img} alt={`${FOUNDERS[who].name}, co-founder of Sqaron Technologies`} width="456" height="571" />
        <span className="portrait__tag" aria-hidden="true">Live · stir me</span>
      </div>
      <figcaption className="portrait__cap">
        <Now who={who} />
        <button className="chip" type="button" data-cursor="Swap" onClick={swap}>Switch founder <span aria-hidden="true">⇄</span></button>
      </figcaption>
    </motion.figure>
  );
}

function Now({ who }) {
  const [shown, setShown] = useState(who);
  const [changing, setChanging] = useState(false);
  useEffect(() => {
    if (who === shown) return undefined;
    setChanging(true);
    const t = setTimeout(() => { setShown(who); setChanging(false); }, 280);
    return () => clearTimeout(t);
  }, [who, shown]);
  return (
    <span className={`now${changing ? ' is-changing' : ''}`} aria-live="polite">
      <small>In the frame</small><b>{FOUNDERS[shown].name}</b><span>{FOUNDERS[shown].role}</span>
    </span>
  );
}

function BriefBar() {
  const { setBrief, goTo } = useSite();
  const [need, setNeed] = useState(NEEDS[0]);
  const [when, setWhen] = useState(WHENS[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const submit = (e) => {
    e.preventDefault();
    setBrief((b) => ({ need, when, budget, nonce: b.nonce + 1 }));
    goTo('#contact', { onComplete: () => document.getElementById('fName')?.focus({ preventScroll: true }) });
  };
  return (
    <motion.form className="briefbar wrap" aria-label="Quick brief" onSubmit={submit} {...rise(0.45)}>
      <div className="briefbar__in">
        <label className="bb"><span>I need</span>
          <select name="need" value={need} onChange={(e) => setNeed(e.target.value)}>{NEEDS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="bb"><span>Timeline</span>
          <select name="timeline" value={when} onChange={(e) => setWhen(e.target.value)}>{WHENS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="bb"><span>Budget</span>
          <select name="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>{BUDGETS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <Magnetic as="button" className="btn btn--light bb__go" type="submit" data-cursor="Go">Get a proposal <span aria-hidden="true">→</span></Magnetic>
      </div>
    </motion.form>
  );
}

export default function Hero() {
  const [who, setWho] = useState('B');
  const [ready, setReady] = useState(false);
  const root = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.portrait__frame', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__glow', { opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }, { scope: root });

  const names = PROJECTS.map((p) => p.title);
  return (
    <section className="hero" id="top" aria-label="Introduction" ref={root}>
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__inner wrap">
        <div className="hero__copy">
          <motion.p className="eyebrow" {...rise(0.05)}><span className="pulse" aria-hidden="true" />Sqaron Technologies · a two-founder product studio · India</motion.p>
          <h1 className={`hero__title is-${who}${ready ? ' is-ready' : ''}`}>
            <span className="hl" data-who="B"><motion.span className="hl__rise" {...rise(0.15)}><span className="hl__a">Design that</span> <em>sells.</em></motion.span></span>
            <span className="hl" data-who="A"><motion.span className="hl__rise" {...rise(0.27)} onAnimationComplete={() => setReady(true)}><span className="hl__a">Code that</span> <em>scales.</em></motion.span></span>
          </h1>
          <motion.p className="hero__sub" {...rise(0.35)}>Shivam designs and builds what people touch. Saksham builds what keeps it running. Together we ship websites, mobile apps, SaaS and AI agents, from the first call to launch day, with no hand-offs in between.</motion.p>
          <motion.div className="hero__cta" {...rise(0.42)}>
            <Magnetic className="btn btn--light" href="#contact" data-cursor="Let's talk">Get a proposal <span aria-hidden="true">→</span></Magnetic>
            <Magnetic className="btn btn--ghost" href="#work" data-cursor="Scroll">See the work</Magnetic>
          </motion.div>
        </div>
        <LiquidPortrait who={who} onFlip={setWho} />
      </div>

      <BriefBar />

      <motion.div className="proof" aria-label="Live work" {...rise(0.55)}>
        <p className="proof__label">Live in production</p>
        <div className="marquee"><div className="marquee__track">
          {names.map((n) => <span key={n}><span>{n}</span><i aria-hidden="true">✦</i></span>)}
          {names.map((n) => <span key={`b-${n}`} aria-hidden="true"><span>{n}</span><i>✦</i></span>)}
        </div></div>
      </motion.div>
    </section>
  );
}
