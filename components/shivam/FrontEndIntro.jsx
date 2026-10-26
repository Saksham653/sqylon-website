'use client';

/* 01 · The front end. The block starts black. Shivam's 3D character's eyes open out of the dark, look
 * toward your cursor and blink; then the camera pulls back to the whole character, who steps aside while
 * his details come in. From then on he turns his head to look wherever your cursor goes. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import HeadTracker from './HeadTracker';
import HEAD from '@/lib/shivam-head.json';

// midpoint between the eyes, as a fraction of the 16:9 render
const FACE = { x: HEAD.face[0], y: HEAD.face[1] };
const EASE = [0.7, 0, 0.2, 1];

// only transforms and opacity move, so the browser composites every frame without repainting
const PHASES = {
  desktop: {
    dark: { opacity: 0, scale: 3.6, x: '0%', y: 70 },
    eyes: { opacity: 1, scale: 3.6, x: '0%', y: 70 },
    full: { opacity: 1, scale: 1, x: '0%', y: 0 },
    side: { opacity: 1, scale: 0.96, x: '-25%', y: 6 },
  },
  phone: {
    dark: { opacity: 0, scale: 3.6, x: '0%', y: 40 },
    eyes: { opacity: 1, scale: 3.6, x: '0%', y: 40 },
    full: { opacity: 1, scale: 1, x: '0%', y: 0 },
    side: { opacity: 1, scale: 1, x: '0%', y: 0 },
  },
};

// the dark with an opening around the eyes; it grows and fades as the camera pulls back
const VEIL = {
  dark: { scale: 0.55, opacity: 1 },
  eyes: { scale: 1, opacity: 1 },
  full: { scale: 3.4, opacity: 0 },
  side: { scale: 3.4, opacity: 0 },
};
const VEIL_TRANSITIONS = {
  dark: { duration: 0 },
  eyes: { duration: 1.1, ease: [0.2, 0.8, 0.2, 1] },
  full: { scale: { duration: 1.5, ease: EASE }, opacity: { duration: 1.1, ease: [0.4, 0, 0.6, 1], delay: 0.35 } },
  side: { duration: 0 },
};

const TRANSITIONS = {
  dark: { duration: 0 },
  eyes: { duration: 1.1, ease: [0.2, 0.8, 0.2, 1] },
  full: { duration: 1.5, ease: EASE },
  side: { duration: 1.1, ease: EASE },
};

const TAGS = ['Next.js', 'React Native', 'GSAP & WebGL', 'Motion', 'LangGraph', 'LlamaIndex'];
const LINKS = [['Portfolio', 'https://myself-koej.vercel.app/'], ['GitHub', 'https://github.com/shivamj56'], ['LinkedIn', 'https://www.linkedin.com/in/shivam-jha-509482268/'], ['Fiverr', 'https://www.fiverr.com/heyshivm']];

const info = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } };
const line = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { type: 'spring', visualDuration: 0.7, bounce: 0.12 } } };

export default function FrontEndIntro({ onOpen }) {
  const stage = useRef(null);
  const ctl = useRef(null);
  const inView = useInView(stage, { once: true, amount: 0.5 });
  const [phase, setPhase] = useState('dark');
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPhase('side'); return undefined; }
    let alive = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      // the eyes only open once the footage is in, so they are never a blurry still
      if (ctl.current) await Promise.race([ctl.current.ready(), wait(2600)]);
      if (!alive) return;
      setPhase('eyes');
      await wait(1500);
      if (!alive) return;
      if (ctl.current) ctl.current.blink();
      await wait(1700);
      if (!alive) return;
      if (ctl.current) ctl.current.blink(true);
      await wait(1950);
      if (!alive) return;
      setPhase('full');
      await wait(1600);
      if (alive) setPhase('side');
    })();
    return () => { alive = false; };
  }, [inView]);

  const look = PHASES[phone ? 'phone' : 'desktop'][phase];
  // he smiles when you reach for his portfolio
  const smile = (on) => { if (ctl.current && ctl.current.smile) ctl.current.smile(on); };
  const open = (e) => {
    smile(true);
    if (e.metaKey || e.ctrlKey || !onOpen) return;
    e.preventDefault();
    const r = stage.current.getBoundingClientRect();
    onOpen('/shivam-jha/', { x: r.left + r.width * (phone ? 0.5 : 0.25), y: r.top + r.height * 0.36 });
  };

  return (
    <article className={`fe is-${phase}`} aria-labelledby="feName">
      <div className="fe__stage" ref={stage}>
        <div className="fe__glow" aria-hidden="true" />
        <motion.div
          className="fe__char"
          style={{ transformOrigin: `${(FACE.x * 100).toFixed(2)}% ${(FACE.y * 100).toFixed(2)}%` }}
          initial={PHASES[phone ? 'phone' : 'desktop'].dark}
          animate={look}
          transition={TRANSITIONS[phase]}
        >
          <HeadTracker controllerRef={ctl} eyes={phase === 'dark' || phase === 'eyes'} />
          <motion.div className="fe__veil" aria-hidden="true" initial={VEIL.dark} animate={VEIL[phase]} transition={VEIL_TRANSITIONS[phase]} />
        </motion.div>
        <motion.p className="fe__hint" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: phase === 'eyes' ? 1 : 0 }} transition={{ duration: 0.6 }}>
          he sees you
        </motion.p>
        <motion.div className="fe__info" initial="hidden" animate={phase === 'side' ? 'show' : 'hidden'} variants={info}>
          <motion.p className="fe__kicker" variants={line}>01 — The front end</motion.p>
          <motion.h3 className="fe__name" id="feName" variants={line}>Shivam <em>Jha</em></motion.h3>
          <motion.p className="fe__role" variants={line}>Co-founder · AI architect, product &amp; frontend</motion.p>
          <motion.p className="fe__bio" variants={line}>He designs and builds what people touch: sites that sell, Android and iOS apps, AI products and Chrome extensions. He led OSHT – Agro Trading, founded Clonix and built NexeraAI.</motion.p>
          <motion.ul className="fe__tags" variants={line}>{TAGS.map((t) => <li key={t}>{t}</li>)}</motion.ul>
          <motion.div className="fe__act" variants={line}>
            <Link
              className="fe__open"
              href="/shivam-jha/"
              onClick={open}
              onPointerEnter={() => smile(true)}
              onPointerLeave={() => smile(false)}
              onFocus={() => smile(true)}
              onBlur={() => smile(false)}
              data-cursor="Open"
            >
              Open his portfolio <span aria-hidden="true">→</span>
            </Link>
            <span className="fe__links">
              {LINKS.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </article>
  );
}
