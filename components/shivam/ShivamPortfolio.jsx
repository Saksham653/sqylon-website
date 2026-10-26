'use client';

/* Shivam Jha's portfolio: a front-end developer's site that pays attention to you.
 * His 3D character turns to look wherever your cursor goes, the fluid behind him follows it, the cursor locks
 * onto anything you can click, and every section is built from ready-made components (React Bits, and
 * Aceternity and Magic UI from 21st.dev), restyled and wired together with GSAP, Motion and Lenis.
 * The colophon near the end lists which component does what. */
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon, BrowserIcon, Briefcase01Icon, CursorMagicSelection02Icon, GithubIcon, Home09Icon, Linkedin01Icon,
  Mail01Icon, PaintBoardIcon, SmartPhone01Icon, WorkflowSquare10Icon, Rocket01Icon, ComputerIcon,
} from '@hugeicons/core-free-icons';
import {
  SiNextdotjs, SiReact, SiTypescript, SiJavascript, SiGreensock, SiFramer, SiThreedotjs, SiWebgl, SiFigma, SiExpo,
  SiNodedotjs, SiVercel, SiNetlify, SiLangchain, SiOpenai, SiAnthropic, SiPostgresql, SiTailwindcss, SiAndroid, SiApple,
  SiGooglechrome, SiHtml5, SiCss3, SiGit,
} from 'react-icons/si';
import SmoothScroll from '../SmoothScroll';
import { SiteProvider, useSite } from '../SiteProvider';
import SiteBrowser from '../SiteBrowser';
import HeadTracker from './HeadTracker';
import MotionLab from './MotionLab';
import { Featured, Live, Screens, Index } from './PfWork';
import { SectionHead, useMedia } from './pfShared';
import {
  SiteVisual, MotionTile, PhoneVisual, ChatVisual, DesignVisual, SignalVisual,
  ListenPanel, SketchPanel, BuildPanel, PolishPanel, ShipPanel,
} from './visuals';
import SplitText from '../rb/SplitText/SplitText';
import RotatingText from '../rb/RotatingText/RotatingText';
import ShinyText from '../rb/ShinyText/ShinyText';
import DecryptedText from '../rb/DecryptedText/DecryptedText';
import GradientText from '../rb/GradientText/GradientText';
import StarBorder from '../rb/StarBorder/StarBorder';
import Magnet from '../rb/Magnet/Magnet';
import ScrollVelocity from '../rb/ScrollVelocity/ScrollVelocity';
import ScrollReveal from '../rb/ScrollReveal/ScrollReveal';
import ProfileCard from '../rb/ProfileCard/ProfileCard';
import CountUp from '../rb/CountUp/CountUp';
import MagicBento from '../rb/MagicBento/MagicBento';
import LogoLoop from '../rb/LogoLoop/LogoLoop';
import VariableProximity from '../rb/VariableProximity/VariableProximity';
import ClickSpark from '../rb/ClickSpark/ClickSpark';
import Dock from '../rb/Dock/Dock';
import StickyScroll from '../ui21/StickyScroll';
import TextHoverEffect from '../ui21/TextHoverEffect';
import { SHIVAM, ROTATING, STATEMENT, NUMBERS, CAPABILITIES, PROCESS } from '@/lib/shivam';
import { SITE } from '@/lib/site';
import '../ui21/ui21.css';
import './portfolio.css';

// the heavy WebGL and canvas pieces load on their own, after the page is up
const LiquidEther = dynamic(() => import('../rb/LiquidEther/LiquidEther'), { ssr: false });
const ElectricBorder = dynamic(() => import('../rb/ElectricBorder/ElectricBorder'), { ssr: false, loading: () => null });
const TargetCursor = dynamic(() => import('../rb/TargetCursor/TargetCursor'), { ssr: false });

const IRI = ['#8BE9FF', '#A78BFF', '#FF8AD8', '#FFD08A'];
const FLUID = ['#6E4BFF', '#FF7AD1', '#7FE3FF'];
const EASE = [0.2, 0.8, 0.2, 1];
const SPRING = { type: 'spring', visualDuration: 0.8, bounce: 0.12 };
const rise = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: SPRING } };
const list = (gap = 0.08, delay = 0) => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } });
const icon = (i, size = 18) => <HugeiconsIcon icon={i} size={size} strokeWidth={1.7} />;

/* ---- top bar ---------------------------------------------------------------------------------------------- */

function TopBar() {
  return (
    <header className="pf-top">
      <div className="pf-top__in">
        <Link className="pf-top__brand cursor-target" href="/" data-cursor-label="Sqaron home">
          <span className="brand__drop" aria-hidden="true" />SQARON
        </Link>
        <span className="pf-top__path" aria-hidden="true">/ founders / <b>shivam</b></span>
        <nav className="pf-top__nav" aria-label="Page">
          <a className="cursor-target" href="#work">Work</a>
          <a className="cursor-target" href="#process">Process</a>
          <a className="cursor-target" href="#lab">Motion lab</a>
          <a className="cursor-target" href="#contact">Contact</a>
        </nav>
        <span className="pf-top__avail">
          <i aria-hidden="true" />
          <ShinyText text="Taking on new projects" color="#9C9EA8" shineColor="#FFFFFF" speed={2.6} delay={1.2} />
        </span>
        <StarBorder as="a" href="#contact" className="pf-top__cta cursor-target" data-cursor-label="Let's talk" radius={999} color="#C3B2FF" duration={5} thickness={1} glow={0.7} backgroundColor="#101016" borderColor="rgba(241, 240, 236, 0.16)">
          Start a project
        </StarBorder>
      </div>
    </header>
  );
}

/* ---- hero: the character in an arch, the fluid behind him --------------------------------------------------- */

function Hero() {
  const ctl = useRef(null);
  const fine = useMedia('(hover: hover) and (pointer: fine)');
  const big = useMedia('(min-width: 901px)');
  const calm = useMedia('(prefers-reduced-motion: reduce)');
  const smile = (on) => ctl.current && ctl.current.smile && ctl.current.smile(on);
  const smiles = { onPointerEnter: () => smile(true), onPointerLeave: () => smile(false), onFocus: () => smile(true), onBlur: () => smile(false) };

  // once he is drawn, he blinks twice: hello
  useEffect(() => {
    let alive = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      if (!ctl.current) return;
      await Promise.race([ctl.current.ready(), wait(3200)]);
      await wait(900);
      if (alive && ctl.current) ctl.current.blink(true);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="pf-hero" id="top" aria-labelledby="pfTitle">
      <div className="pf-hero__bg" aria-hidden="true">
        {fine && big && !calm && (
          <LiquidEther colors={FLUID} mouseForce={16} cursorSize={120} resolution={0.4} maxDevicePixelRatio={1.5} autoDemo autoSpeed={0.35} autoIntensity={1.7} intensity={1.15} />
        )}
      </div>
      <div className="pf-hero__scrim" aria-hidden="true" />

      <div className="pf-hero__in pf-wrap">
        <div className="pf-hero__copy">
          <p className="pf-hero__kicker">
            <i aria-hidden="true" />
            <DecryptedText text="Shivam Jha · frontend developer & product designer" animateOn="view" sequential speed={18} characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}=+*" encryptedClassName="pf-enc" />
          </p>
          <h1 className="pf-hero__title" id="pfTitle">
            <span className="sr">Shivam Jha, frontend developer and product designer: </span>
            <SplitText tag="span" className="pf-hero__l1" text="Interfaces that" splitType="chars" delay={28} duration={1.1} effect="rise" textAlign="left" rootMargin="0px" threshold={0} />
            <motion.span
              className="pf-hero__l2"
              initial={{ clipPath: 'inset(-10% 100% -20% 0%)' }}
              animate={{ clipPath: 'inset(-10% 0% -20% 0%)' }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.7, 0, 0.2, 1] }}
            >
              <GradientText colors={IRI} animationSpeed={7} className="pf-hero__accent">look back.</GradientText>
            </motion.span>
          </h1>
          <motion.div initial="hidden" animate="show" variants={list(0.1, 1.05)}>
            <motion.p className="pf-hero__lead" variants={rise}>
              I design and build{' '}
              <RotatingText texts={ROTATING} mainClassName="pf-rotate" highlight highlightColor="#A78BFF" staggerFrom="last" staggerDuration={0.014} rotationInterval={2600} splitBy="characters" />
            </motion.p>
            <motion.p className="pf-hero__sub" variants={rise}>
              Co-founder of {SITE.name}. I led OSHT – Agro Trading, founded Clonix and built NexeraAI: designed, coded and shipped by one person, with no hand-offs.
            </motion.p>
            <motion.div className="pf-hero__cta" variants={rise}>
              <Magnet padding={70} magnetStrength={3.2}>
                <a className="pf-btn pf-btn--solid pf-btn--lg cursor-target" href="#contact" data-cursor-label="He'll smile" {...smiles}>
                  Start a project <span aria-hidden="true">→</span>
                </a>
              </Magnet>
              <StarBorder as="a" href="#work" className="pf-btn pf-btn--star pf-btn--lg cursor-target" data-cursor-label="Scroll" radius={999} color="#D7CCFF" duration={4.2} thickness={1.2} glow={0.85} backgroundColor="#0E0E14" borderColor="rgba(241, 240, 236, 0.16)" {...smiles}>
                See the work <span aria-hidden="true">↓</span>
              </StarBorder>
            </motion.div>
            <motion.ul className="pf-hero__meta" variants={rise}>
              <li><span>Based in</span>India</li>
              <li><span>Works at</span><Link className="cursor-target" href="/">{SITE.name}</Link></li>
              <li><span>Replies</span>within one working day</li>
            </motion.ul>
          </motion.div>
        </div>

        <motion.figure
          className="pf-arch"
          initial={{ opacity: 0, y: 56, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', visualDuration: 1.3, bounce: 0.14, delay: 0.25 }}
        >
          <div className="pf-arch__window">
            <span className="pf-arch__halo" aria-hidden="true" />
            <HeadTracker className="pf-arch__char" controllerRef={ctl} depth={0.42} alt="Shivam Jha as a 3D character. He turns to look wherever your cursor goes." />
            <span className="pf-arch__floor" aria-hidden="true" />
          </div>
          <span className="pf-arch__rim" aria-hidden="true" />
          <figcaption className="pf-arch__hint"><i aria-hidden="true" />{fine ? 'Move your cursor. He’s watching.' : 'Touch the screen. He’ll look.'}</figcaption>
        </motion.figure>
      </div>

      <a className="pf-hero__scroll cursor-target" href="#about" aria-label="Scroll to the next section"><span>Scroll</span><i aria-hidden="true" /></a>
    </section>
  );
}

/* ---- the band: two lines that speed up with your scroll ----------------------------------------------------- */

function Band() {
  return (
    <div className="pf-band" aria-hidden="true">
      <ScrollVelocity
        texts={['Design that sells ✦ Code that moves ✦ ', 'Next.js · React Native · GSAP · WebGL · Motion · ']}
        velocity={42}
        numCopies={4}
        outlineAlternate
        className="pf-band__item"
        parallaxClassName="pf-band__par"
        scrollerClassName="pf-band__row"
        skewWithVelocity={4}
      />
    </div>
  );
}

/* ---- about: the statement reads itself as you scroll; his real photo on a holo card ------------------------ */

function About() {
  return (
    <section className="pf-sec pf-wrap pf-about" id="about" aria-labelledby="pfAboutLabel">
      <div className="pf-about__main">
        <p className="pf-head__label" id="pfAboutLabel"><span className="pf-head__n">01</span><span className="pf-head__rule is-on" aria-hidden="true" />About</p>
        <ScrollReveal containerClassName="pf-about__statement" textClassName="pf-about__text" baseOpacity={0.12} enableBlur blurStrength={6} baseRotation={2} rotationEnd="bottom 70%" wordAnimationEnd="bottom 70%">
          {STATEMENT}
        </ScrollReveal>
        <motion.div className="pf-about__body" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={list(0.1)}>
          <motion.p variants={rise}>I co-founded {SITE.name} with <Link className="cursor-target" href="/saksham-srivastava/">Saksham Srivastava</Link>. He builds what keeps things running; I build what people touch, from the first sketch to the store listing.</motion.p>
          <motion.p variants={rise}>On <Link className="cursor-target" href="/osht/">OSHT – Agro Trading</Link> I led the product: the Android and iOS app brokers use in the field, the web console the office lives in, Hindi-first screens, and voice so a quantity can be spoken instead of typed.</motion.p>
        </motion.div>
      </div>
      <motion.div className="pf-about__card" initial={{ opacity: 0, y: 50, rotate: 2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', visualDuration: 1, bounce: 0.18 }}>
        <ProfileCard
          avatarUrl={SHIVAM.photo}
          name={SHIVAM.name}
          title="Frontend & product design"
          handle="heyshivm11"
          status="The person behind the character"
          contactText="Email"
          onContactClick={() => { window.location.href = `mailto:${SITE.email}`; }}
          backdropColor="#1A1430"
          radius={26}
          holo={0.85}
          glare={0.5}
          tiltStrength={10}
          className="pf-profile cursor-target"
        />
      </motion.div>
    </section>
  );
}

function Numbers() {
  return (
    <section className="pf-wrap pf-numbers-sec" aria-label="In numbers">
      <motion.ul className="pf-numbers" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={list(0.08)}>
        {NUMBERS.map((n) => (
          <motion.li key={n.label} variants={rise}>
            <span className="pf-numbers__n"><CountUp to={n.to} from={n.from ?? 0} direction={n.direction ?? 'up'} duration={n.duration ?? 1.8} /></span>
            <span className="pf-numbers__label">{n.label}</span>
            <span className="pf-numbers__note">{n.note}</span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

/* ---- what I make: a bento of drawn tiles ---------------------------------------------------------------------- */

const VISUALS = { site: SiteVisual, motion: MotionTile, phone: PhoneVisual, chat: ChatVisual, design: DesignVisual, signal: SignalVisual };
const KIND_ICON = { site: BrowserIcon, motion: CursorMagicSelection02Icon, phone: SmartPhone01Icon, chat: AiChat02Icon, design: PaintBoardIcon, signal: Rocket01Icon };

const BENTO = CAPABILITIES.map((c) => {
  const Visual = VISUALS[c.kind];
  return { ...c, id: c.kind, icon: icon(KIND_ICON[c.kind], 16), visual: <Visual /> };
});

function Capabilities() {
  return (
    <section className="pf-sec pf-wrap" id="make" aria-labelledby="pfMake">
      <SectionHead n="02" label="What I make" id="pfMake" title={<>Things people <em>actually use.</em></>} note="Six kinds of work, one standard: it has to load fast, read clearly and earn every bit of movement on the screen." />
      <MagicBento
        items={BENTO}
        columns={4}
        rowHeight={300}
        gap={14}
        radius={26}
        glowColor="#A78BFF"
        textAutoHide={false}
        enableStars
        particleCount={10}
        spotlightRadius={380}
        className="pf-bento"
      />
    </section>
  );
}

/* ---- process: the steps scroll past while the panel shows the one you are reading ------------------------- */

const PANELS = { listen: ListenPanel, sketch: SketchPanel, build: BuildPanel, polish: PolishPanel, ship: ShipPanel };

const STEPS = PROCESS.map((p) => {
  const Panel = PANELS[p.panel];
  return { ...p, content: <Panel /> };
});

function Process() {
  return (
    <section className="pf-sec pf-wrap" id="process" aria-labelledby="pfProcess">
      <SectionHead n="07" label="Process" id="pfProcess" title={<>How a project <em>moves.</em></>} note="Five steps, the same every time, so you always know what happens next and when." />
      <StickyScroll content={STEPS} className="pf-sticky" />
    </section>
  );
}

function Lab() {
  return (
    <section className="pf-sec pf-wrap" id="lab" aria-labelledby="pfLab">
      <SectionHead n="08" label="Motion lab" id="pfLab" title={<>Every move <em>is a decision.</em></>} note="The curve behind most of the movement on this page. Drag the handles, or focus one and use the arrow keys, and copy the CSS when you like it." />
      <MotionLab />
    </section>
  );
}

/* ---- stack and colophon -------------------------------------------------------------------------------------- */

const STACK_A = [
  [SiNextdotjs, 'Next.js'], [SiReact, 'React'], [SiTypescript, 'TypeScript'], [SiJavascript, 'JavaScript'], [SiGreensock, 'GSAP'],
  [SiFramer, 'Motion'], [SiThreedotjs, 'Three.js'], [SiWebgl, 'WebGL'], [SiTailwindcss, 'Tailwind'], [SiHtml5, 'HTML'], [SiCss3, 'CSS'],
];
const STACK_B = [
  [SiFigma, 'Figma'], [SiExpo, 'Expo'], [SiAndroid, 'Android'], [SiApple, 'iOS'], [SiGooglechrome, 'Chrome extensions'], [SiNodedotjs, 'Node.js'],
  [SiPostgresql, 'PostgreSQL'], [SiLangchain, 'LangChain'], [SiOpenai, 'OpenAI'], [SiAnthropic, 'Claude'], [SiVercel, 'Vercel'], [SiNetlify, 'Netlify'], [SiGit, 'Git'],
];
const logos = (rows) => rows.map(([Icon, title]) => ({ node: <Icon aria-hidden="true" />, title }));
// built once: the loops re-measure whenever this array changes identity
const LOGOS_A = logos(STACK_A);
const LOGOS_B = logos(STACK_B);

// what this page is made of, so you can build the same
const COLOPHON = [
  ['Liquid Ether', 'React Bits', 'WebGL', 'the fluid behind the hero'],
  ['Split Text', 'React Bits', 'GSAP', 'the headline'],
  ['Decrypted Text', 'React Bits', 'Motion', 'the line above it'],
  ['Gradient Text', 'React Bits', 'CSS', '“look back.”'],
  ['Rotating Text', 'React Bits', 'Motion', 'what I build'],
  ['Star Border', 'React Bits', 'Canvas', 'the glowing buttons'],
  ['Magnet', 'React Bits', 'Springs', 'buttons that lean in'],
  ['Target Cursor', 'React Bits', 'Springs', 'the cursor'],
  ['Click Spark', 'React Bits', 'Canvas', 'every click'],
  ['Scroll Velocity', 'React Bits', 'Motion', 'the band'],
  ['Scroll Reveal', 'React Bits', 'GSAP', 'the about line'],
  ['Profile Card', 'React Bits', 'Springs', 'my photo'],
  ['Count Up', 'React Bits', 'Motion', 'the numbers'],
  ['Magic Bento', 'React Bits', 'Canvas', 'what I make'],
  ['Card Swap', 'React Bits', 'Springs', 'selected work'],
  ['Safari & iPhone', 'Magic UI · 21st.dev', 'SVG', 'the live sites'],
  ['Circular Gallery', 'React Bits', 'WebGL', 'every screen'],
  ['Flowing Menu', 'React Bits', 'Springs', 'the index'],
  ['Sticky Scroll Reveal', 'Aceternity · 21st.dev', 'Motion', 'the process'],
  ['Logo Loop', 'React Bits', 'Springs', 'the stack'],
  ['Variable Proximity', 'React Bits', 'Variable font', 'the contact line'],
  ['Electric Border', 'React Bits', 'WebGL', 'the contact card'],
  ['Text Hover Effect', 'Aceternity · 21st.dev', 'SVG', 'the footer'],
  ['Dock', 'React Bits', 'Springs', 'the dock'],
  ['Head rig', 'Built by hand', 'WebGL2', 'the character, 120 fps'],
  ['Lenis', 'Smooth scroll', 'GSAP ticker', 'the whole page'],
];

function Stack() {
  return (
    <section className="pf-sec" id="stack" aria-labelledby="pfStack">
      <div className="pf-wrap">
        <SectionHead n="09" label="Stack" id="pfStack" title={<>Tools I <em>reach for.</em></>} note="What I build with, and below it, exactly what this page is made of." />
      </div>
      <div className="pf-loops">
        <LogoLoop logos={LOGOS_A} speed={46} logoHeight={30} gap={56} labels="inline" fadeOut scaleOnHover ariaLabel="Front-end tools" className="pf-loop" />
        <LogoLoop logos={LOGOS_B} speed={38} direction="right" logoHeight={30} gap={56} labels="inline" fadeOut scaleOnHover ariaLabel="Design, mobile, AI and hosting tools" className="pf-loop" />
      </div>
      <div className="pf-wrap">
        <motion.div className="pf-colophon" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={list(0.03)}>
          <div className="pf-colophon__head">
            <h3>This page, taken apart</h3>
            <p>{COLOPHON.length} pieces. Ready-made components from React Bits and 21st.dev, restyled and wired together, plus the parts I wrote myself.</p>
          </div>
          <ul className="pf-colophon__list">
            {COLOPHON.map(([name, from, tech, where]) => (
              <motion.li key={name} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                <b>{name}</b>
                <span className="pf-colophon__from">{from}</span>
                <span className="pf-colophon__tech">{tech}</span>
                <span className="pf-colophon__where">{where}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ---- contact ------------------------------------------------------------------------------------------------ */

function Contact() {
  const ref = useRef(null);
  const fine = useMedia('(hover: hover) and (pointer: fine)');
  const card = (
    <div className="pf-contact__in">
      <p className="pf-contact__kicker"><i aria-hidden="true" />Taking on new projects</p>
      <p className="pf-contact__text">Tell me what you are making and who it is for. You get a reply from me within one working day, then a written plan and a fixed price.</p>
      <a className="pf-contact__mail cursor-target" href={`mailto:${SITE.email}`} data-cursor-label="Write">{SITE.email}</a>
      <div className="pf-contact__act">
        <StarBorder as="a" href={`mailto:${SITE.email}?subject=${encodeURIComponent('A project for Shivam')}`} className="pf-btn pf-btn--star pf-btn--lg cursor-target" radius={999} color="#D7CCFF" duration={4} glow={0.9} backgroundColor="#F1F0EC" textColor="#0A0B0E" borderColor="rgba(255, 255, 255, 0.4)">
          Email me <span aria-hidden="true">→</span>
        </StarBorder>
        <Link className="pf-link cursor-target" href="/#contact">Or use the project form <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
  return (
    <section className="pf-sec pf-wrap pf-contact" id="contact" aria-labelledby="pfContact" ref={ref}>
      <p className="pf-head__label"><span className="pf-head__n">10</span><span className="pf-head__rule is-on" aria-hidden="true" />Contact</p>
      <h2 className="pf-contact__title" id="pfContact">
        <VariableProximity label="Let's build something" fromFontVariationSettings="'wght' 420" toFontVariationSettings="'wght' 800" containerRef={ref} radius={160} falloff="gaussian" className="pf-vp" />
        <em> that looks back.</em>
      </h2>
      <div className="pf-contact__grid">
        {fine ? (
          <ElectricBorder color="#A78BFF" glowColor="#FF8AD8" speed={0.7} chaos={0.35} thickness={1.4} borderRadius={30} className="pf-contact__card">{card}</ElectricBorder>
        ) : (
          <div className="pf-contact__card pf-contact__card--plain">{card}</div>
        )}
        <ul className="pf-contact__links">
          {SHIVAM.links.map((l) => (
            <li key={l.href}>
              <span>{l.label}</span>
              <a className="cursor-target" href={l.href} target="_blank" rel="noopener noreferrer me">{l.handle} <span aria-hidden="true">↗</span></a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="pf-foot">
      <div className="pf-wrap">
        <TextHoverEffect text="SHIVAM" className="pf-foot__word" />
        <div className="pf-foot__row">
          <span>© 2026 {SITE.legalName}</span>
          <span>Designed and built by Shivam Jha, with ready-made components from React Bits and 21st.dev.</span>
          <span><Link className="cursor-target" href="/">Home</Link> · <Link className="cursor-target" href="/saksham-srivastava/">Saksham Srivastava, back end →</Link></span>
        </div>
      </div>
    </footer>
  );
}

/* ---- the dock and the cursor -------------------------------------------------------------------------------- */

const SECTIONS = ['top', 'about', 'make', 'work', 'live', 'index', 'process', 'lab', 'stack', 'contact'];

function useActiveSection() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, ratio = 0;
      SECTIONS.forEach((id) => { const r = seen.get(id) || 0; if (r > ratio) { ratio = r; best = id; } });
      if (best) setActive(best);
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.7], rootMargin: '-30% 0px -40% 0px' });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}

function PageDock() {
  const { goTo, browser } = useSite();
  const active = useActiveSection();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const items = useMemo(() => {
    const go = (id) => () => goTo(`#${id}`);
    const out = (href) => () => window.open(href, '_blank', 'noopener,noreferrer');
    return [
      { icon: icon(Home09Icon, 22), label: 'Top', onClick: go('top'), active: active === 'top' },
      { icon: icon(Briefcase01Icon, 22), label: 'Work', onClick: go('work'), active: ['work', 'live', 'index'].includes(active) },
      { icon: icon(ComputerIcon, 22), label: 'What I make', onClick: go('make'), active: active === 'make' },
      { icon: icon(WorkflowSquare10Icon, 22), label: 'Process', onClick: go('process'), active: active === 'process' },
      { icon: icon(CursorMagicSelection02Icon, 22), label: 'Motion lab', onClick: go('lab'), active: active === 'lab' },
      { separator: true },
      { icon: icon(GithubIcon, 22), label: 'GitHub', onClick: out('https://github.com/shivamj56') },
      { icon: icon(Linkedin01Icon, 22), label: 'LinkedIn', onClick: out('https://www.linkedin.com/in/shivam-jha-509482268/') },
      { icon: icon(Mail01Icon, 22), label: 'Email me', onClick: () => { window.location.href = `mailto:${SITE.email}`; }, active: active === 'contact' },
    ];
  }, [active, goTo]);
  return (
    <div className="pf-dock" data-hidden={!shown || browser ? '' : undefined}>
      <Dock items={items} baseItemSize={46} magnification={66} distance={170} panelHeight={62} gap={8} accentColor="#A78BFF" className="pf-dock__dock" />
    </div>
  );
}

function Cursorline() {
  const { browser } = useSite();
  const fine = useMedia('(hover: hover) and (pointer: fine)');
  const calm = useMedia('(prefers-reduced-motion: reduce)');
  // the in-page browser holds a live site the cursor can't follow into, so it steps aside while that is open
  if (!fine || calm || browser) return null;
  return <TargetCursor targetSelector=".cursor-target" cursorColor="#F1F0EC" spinDuration={3} size={34} cornerSize={11} thickness={2} padding={7} blendMode="difference" />;
}

export default function ShivamPortfolio() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SiteProvider>
          <div className="pf">
            <a className="skip" href="#pf-main">Skip to content</a>
            <Cursorline />
            <TopBar />
            <ClickSpark sparkColor={['#C9B8FF', '#FF8AD8', '#8BE9FF']} sparkCount={10} sparkRadius={28} sparkSize={12} duration={520} className="pf-spark">
              <main id="pf-main">
                <Hero />
                <Band />
                <About />
                <Numbers />
                <Capabilities />
                <Featured />
                <Live />
                <Screens />
                <Index />
                <Process />
                <Lab />
                <Stack />
                <Contact />
              </main>
              <Foot />
            </ClickSpark>
            <PageDock />
          </div>
          <SiteBrowser />
        </SiteProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
