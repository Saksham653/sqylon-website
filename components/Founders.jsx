'use client';

/* The founders, one at a time.
 * 01 · Shivam, the front end (components/shivam/FrontEndIntro.jsx).
 * 02 · Saksham, the back end: "Meet THE BACKEND EXPERT" gathers out of green particles (React Bits' ParticleText),
 * on one screen-sized canvas, so they can be pushed, burst and scattered anywhere with no edge in the way. The card
 * holds still while the scroll takes the words apart one line at a time, last line first: each line's particles
 * break away from the point nearest your cursor and rush past you, then his console comes in: a typographic wall
 * that decodes the words that describe him. Any word, or the button, opens his portfolio through a decode
 * transition. */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useInView, useSpring } from 'motion/react';
import TypographicWall from './TypographicWall/TypographicWall';
import FrontEndIntro from './shivam/FrontEndIntro';
import ParticleText from './rb/ParticleText/ParticleText';
import { RevealWords, Reveal } from './ui/motion';
import { gsap, useGSAP } from '@/lib/gsap';

const SHIVAM = {
  who: 'B', name: 'Shivam Jha', kicker: '01 — The front end', role: 'Co-founder · AI architect, product & frontend',
  img: '/assets/img/founders/shivam-wide.jpg', w: 1024, h: 571,
  bio: 'An AI architect and prompt engineer who designs and builds what people touch: sites that sell, Android and iOS apps, AI products and Chrome extensions. He led OSHT – Agro Trading, founded Clonix and built NexeraAI. Off-screen he also works as a freelance model.',
  tags: ['Next.js', 'React Native', 'LangGraph', 'LlamaIndex', 'pgvector', 'GSAP & WebGL'],
  built: 'OSHT (lead) · Clonix · NexeraAI · TBJ Properties · ADFusion · Safarline',
  links: [['Profile', '/shivam-jha/'], ['Portfolio', 'https://myself-koej.vercel.app/'], ['GitHub', 'https://github.com/shivamj56'], ['LinkedIn', 'https://www.linkedin.com/in/shivam-jha-509482268/'], ['X', 'https://x.com/heyshivm11'], ['Fiverr', 'https://www.fiverr.com/heyshivm']],
};

const PORTFOLIO = '/saksham-srivastava/';
const BACKEND_WORDS = [
  { label: 'Meet Saksham Srivastava', href: PORTFOLIO },
  { label: 'the back end', href: PORTFOLIO },
  { label: 'behind every screen', href: `${PORTFOLIO}#about` },
  { label: 'FastAPI', href: `${PORTFOLIO}#stack` },
  { label: 'PostgreSQL', href: `${PORTFOLIO}#stack` },
  { label: 'agentic AI', href: `${PORTFOLIO}#stack` },
  { label: 'MLOps', href: `${PORTFOLIO}#stack` },
  { label: 'background workers', href: `${PORTFOLIO}#how` },
  { label: 'ledgers that balance', href: `${PORTFOLIO}#work` },
  { label: 'the Clonix engine', href: `${PORTFOLIO}#work` },
  { label: 'open his portfolio →', href: PORTFOLIO },
];

function Shivam() {
  const p = SHIVAM;
  const rx = useSpring(0, { stiffness: 140, damping: 18 });
  const ry = useSpring(0, { stiffness: 140, damping: 18 });
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 4);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 3);
  };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.article
      className="person person--wide" data-who={p.who}
      initial={{ opacity: 0, y: 70 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', visualDuration: 0.8, bounce: 0.12 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1600 }}
      onPointerMove={move} onPointerLeave={leave}
    >
      <div className="person__photo"><img src={p.img} alt={p.name} width={p.w} height={p.h} loading="lazy" /></div>
      <div className="person__body">
        <p className="person__kicker">{p.kicker}</p>
        <h3>{p.name}</h3>
        <p className="person__role">{p.role}</p>
        <p>{p.bio}</p>
        <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="person__built"><span>Built</span> {p.built}</p>
        <div className="person__links">
          {p.links.map(([label, href]) => (href.startsWith('/')
            ? <Link key={href} href={href}>{label} →</Link>
            : <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>))}
        </div>
      </div>
    </motion.article>
  );
}

const BACKEND_TEXT = 'Meet THE\nBACKEND\nEXPERT';

// the intro words: three lines of green particles on one canvas the size of the screen, gathering a beat apart
// once the card is on screen. They feel the cursor from anywhere (the canvas itself lets every click through).
function BackendWords({ exitRef }) {
  return (
    <ParticleText
      text={BACKEND_TEXT}
      particleSize={2}
      density={4}
      color="#6EF2A6"
      highlightColor="#00FF88"
      highlightMode="motion"
      shape="circle"
      intro="gather"
      scatter={180}
      gatherDuration={1600}
      stagger={420}
      clickBurst
      burstStrength={1}
      pointerRepel={40}
      repelRadius={120}
      idleDrift={0.7}
      trigger="hover"
      fontSize="min(15vw, 140px)"
      fontWeight={800}
      fontFamily="inherit"
      glow
      lineHeight={1.08}
      lineStagger={240}
      pointerScope="window"
      exitRef={exitRef}
    />
  );
}

function Saksham({ onOpen }) {
  const root = useRef(null);
  const pin = useRef(null);
  const card = useRef(null);
  const title = useRef(null);
  const hint = useRef(null);
  // how far each line of particles has gone (0 in place, 1 gone) and the camera's push-in; the particles read it
  const exitRef = useRef({ lines: [0, 0, 0], zoom: 1, wake: null });
  // the particles only start gathering once the card is on screen, so the intro is never missed
  const near = useInView(pin, { once: true, amount: 0.3 });
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setLayout(mq.matches ? 'phone' : 'desk');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // the card holds still while the scroll takes the words apart, line by line, and brings his console in
  useGSAP(() => {
    if (!layout) return undefined;
    const mm = gsap.matchMedia();
    mm.add({
      desk: '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
      phone: '(max-width: 900px) and (prefers-reduced-motion: no-preference)',
      calm: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { desk, calm } = ctx.conditions;
      if (calm) {
        gsap.set([title.current, hint.current], { display: 'none' });
        return undefined;
      }
      const words = title.current;
      // the particles' canvas covers the screen: as wide as the page's viewport, centred on the card
      const size = () => pin.current.style.setProperty('--band-w', `${document.documentElement.clientWidth}px`);
      size();
      const blocks = card.current.querySelectorAll('.bk__bar, .bk__id, .bk__wall');
      const lines = card.current.querySelectorAll('.bk__id > *');
      // what the scroll drives, handed to the particles as it changes: EXPERT goes first, then BACKEND, then
      // "Meet THE", while the camera pushes in a little
      const out = { meet: 0, backend: 0, expert: 0, zoom: 1 };
      const push = () => {
        const x = exitRef.current;
        x.lines[0] = out.meet;
        x.lines[1] = out.backend;
        x.lines[2] = out.expert;
        x.zoom = out.zoom;
        if (x.wake) x.wake();
      };
      push();
      // once the words are gone they stop drawing altogether, until you scroll back up
      let gone = false;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin.current,
          start: desk ? 'center center' : 'top top+=12',
          end: () => `+=${Math.round(window.innerHeight * (desk ? 1.6 : 1.4))}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -2,
          onRefresh: size,
          onUpdate: (st) => {
            const hide = st.progress > 0.64;
            if (hide !== gone) {
              gone = hide;
              words.style.display = hide ? 'none' : '';
            }
          },
        },
      });
      tl.to(hint.current, { opacity: 0, duration: 0.05 }, 0.02)
        .to(out, { expert: 1, duration: 0.22, onUpdate: push }, 0.05)
        .to(out, { backend: 1, duration: 0.22, onUpdate: push }, 0.22)
        .to(out, { meet: 1, duration: 0.22, onUpdate: push }, 0.39)
        .to(out, { zoom: 1.25, ease: 'power1.in', duration: 0.56, onUpdate: push }, 0.05)
        // the console has nothing to click until it is there (autoAlpha), since the canvas above lets clicks through
        .from(blocks, { autoAlpha: 0, duration: 0.14, stagger: 0.05 }, 0.5)
        .from(lines, { y: 26, duration: 0.14, stagger: 0.02 }, 0.5)
        .to({}, { duration: 0.08 }, 0.92);
      return () => {
        words.style.display = '';
        Object.assign(out, { meet: 0, backend: 0, expert: 0, zoom: 1 });
        push();
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [layout], revertOnUpdate: true });

  // words on the wall are links; send them through the decode transition instead of a hard cut
  const capture = (e) => {
    const a = e.target.closest && e.target.closest('a[href^="/saksham-srivastava"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    onOpen(a.getAttribute('href'));
  };
  return (
    <div className="bk-intro" ref={root}>
      <div className="bk__pin" ref={pin}>
        <article className="bk" aria-labelledby="bkName" ref={card}>
          <div className="bk__bar">
            <span className="bk__dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="bk__path">saksham@sqaron:<b>~/backend</b></span>
            <span className="bk__state"><i aria-hidden="true" />decoding</span>
          </div>
          <div className="bk__body">
            <div className="bk__id">
              <p className="bk__kicker">02 — The back end</p>
              <div className="bk__who">
                <img src="/assets/img/founders/saksham.jpg" alt="Saksham Srivastava" width="912" height="1142" loading="lazy" />
                <div>
                  <h3 id="bkName">Saksham Srivastava</h3>
                  <p className="bk__role">Co-founder · Backend, AI &amp; data</p>
                </div>
              </div>
              <p className="bk__bio">The systems behind the screen: APIs, databases, agentic AI, LLM apps and MLOps pipelines. He ran the backend on OSHT and leads the engine behind Clonix.</p>
              <p className="bk__cmd" aria-hidden="true"><span>$</span> open ./saksham --portfolio</p>
              <a className="bk__open" href={PORTFOLIO} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); onOpen(PORTFOLIO); }} data-cursor="Open">
                Open his portfolio <span aria-hidden="true">→</span>
              </a>
              <div className="bk__links">
                <a href="https://github.com/Saksham653" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                <a href="https://linkedin.com/in/saksham-srivastava-b689a8367" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              </div>
            </div>
            <div className="bk__wall" onClickCapture={capture}>
              <TypographicWall
                words={BACKEND_WORDS}
                colors={['#E9FFF3', '#6EF2A6']}
                charset="code"
                layout="scatter"
                fontSize={14}
                lineHeight={1.95}
                density={0.72}
                wallOpacity={0.12}
                scanDuration={2.8}
                holdDuration={5.5}
                linkAs={Link}
                ariaLabel="Saksham Srivastava, in words"
              />
            </div>
          </div>
        </article>
        {/* over the card but not clipped by it: a screen-sized window, so the particles can go anywhere on screen
            as they leave, without ever spilling past it */}
        <div className="bk__band">
          <div className="bk__title" ref={title}>{near && <BackendWords exitRef={exitRef} />}</div>
        </div>
        <p className="bk__hint" ref={hint} aria-hidden="true"><i />Scroll to meet him</p>
      </div>
    </div>
  );
}

export default function Founders() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(null);
  const open = useCallback((href) => setLeaving({ href, kind: 'back' }), []);
  const openFront = useCallback((href, at) => setLeaving({ href, kind: 'front', at }), []);

  return (
    <section className="duo wrap" id="founders" aria-labelledby="duoTitle">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow" y={20}>The founders</Reveal>
        <RevealWords as="h2" id="duoTitle">Two founders. <em>Zero hand-offs.</em></RevealWords>
        <Reveal as="p" className="sec-head__p" y={24} delay={0.1}>No account managers and no outsourcing. One builds what you see, one builds what keeps it running, and both are on your first call.</Reveal>
      </div>
      <div className="duo__stack" id="duoGrid">
        <FrontEndIntro onOpen={openFront} />
        <Saksham onOpen={open} />
      </div>
      <AnimatePresence>
        {leaving && leaving.kind === 'front' && (
          <motion.div
            className="fe-out"
            initial={{ clipPath: `circle(0% at ${leaving.at.x}px ${leaving.at.y}px)` }}
            animate={{ clipPath: `circle(150% at ${leaving.at.x}px ${leaving.at.y}px)` }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => router.push(leaving.href)}
            aria-hidden="true"
          />
        )}
        {leaving && leaving.kind === 'back' && (
          <motion.div
            className="bk-out"
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => router.push(leaving.href)}
            aria-hidden="true"
          >
            <TypographicWall
              words={['decoding', 'saksham.portfolio', 'backend · AI · data', '200 OK']}
              colors={['#E9FFF3', '#6EF2A6']}
              charset="code"
              layout="center"
              fontSize={16}
              lineHeight={2}
              density={0.8}
              wallOpacity={0.18}
              scanDuration={0.8}
              holdDuration={30}
              stagger={0.1}
              loop={false}
              interactive={false}
              clickToShuffle={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
