'use client';

/* Saksham Srivastava's portfolio: the back end of Sqaron, presented like the systems he builds.
 * A console top bar with a live clock, a typographic wall that decodes his stack behind a decoding
 * name, an ASCII portrait, about.json, a stack table, his deployments (live ones open in the in-page
 * browser), the shape of his systems, a log stream, and a ping to start a project. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import SmoothScroll from '../SmoothScroll';
import { SiteProvider, useSite } from '../SiteProvider';
import Cursor from '../Cursor';
import SiteBrowser from '../SiteBrowser';
import TypographicWall from '../TypographicWall/TypographicWall';
import ScrambleText from './ScrambleText';
import AsciiPortrait from './AsciiPortrait';
import LogStream from './LogStream';
import Diagram from './Diagram';
import { SAKSHAM, STACK, DEPLOYMENTS, WALL_WORDS } from '@/lib/saksham';
import { SITE } from '@/lib/site';
import './saksham.css';

const SPRING = { type: 'spring', visualDuration: 0.7, bounce: 0.12 };
const rise = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: SPRING } };
const list = (gap = 0.06) => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="sk-clock">IST {t || '--:--:--'}</span>;
}

function TopBar() {
  return (
    <header className="sk-top">
      <div className="sk-top__in">
        <Link className="sk-top__brand" href="/"><span className="brand__drop" aria-hidden="true" />SQARON</Link>
        <span className="sk-top__path" aria-hidden="true">/ founders / <b>saksham</b></span>
        <span className="sk-top__status"><i aria-hidden="true" />online · <Clock /></span>
        <nav className="sk-top__nav" aria-label="Page">
          <a href="#work">deployments</a>
          <a href="#stack">stack</a>
          <a href="#ping">ping</a>
          <Link className="sk-top__home" href="/">← sqaron</Link>
        </nav>
      </div>
    </header>
  );
}

function Head({ n, cmd, title, id }) {
  return (
    <motion.header className="sk-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={list(0.08)}>
      <motion.p className="sk-head__cmd" variants={rise}><span className="sk-head__n">{n}</span><span className="sk-ps">$</span> {cmd}</motion.p>
      <motion.h2 className="sk-head__title" id={id} variants={rise}>{title}</motion.h2>
    </motion.header>
  );
}

function Hero() {
  const github = SAKSHAM.links[0].href;
  return (
    <section className="sk-hero" aria-labelledby="skName">
      <TypographicWall
        className="sk-hero__wall"
        words={WALL_WORDS}
        colors={['#DFFBEA', '#6EF2A6']}
        charset="code"
        layout="scatter"
        fontSize={13}
        lineHeight={2.1}
        density={0.55}
        wallOpacity={0.075}
        scanDuration={3.4}
        holdDuration={4.5}
        edgeFade={0.12}
        ariaLabel="What Saksham works with"
      />
      <div className="sk-hero__scrim" aria-hidden="true" />
      <div className="sk-hero__in sk-wrap">
        <div className="sk-hero__copy">
          <p className="sk-prompt"><span className="sk-ps">$</span> whoami</p>
          <h1 className="sk-name" id="skName">
            <ScrambleText text="Saksham" delay={200} />
            <ScrambleText text="Srivastava" delay={520} className="sk-name__last" />
          </h1>
          <p className="sk-role"><span className="sk-ps">→</span> backend · AI · data<span className="sk-caret" aria-hidden="true" /></p>
          <p className="sk-intro">{SAKSHAM.intro}</p>
          <div className="sk-cta">
            <a className="sk-btn sk-btn--solid" href="#work" data-cursor="Scroll">./deployments <span aria-hidden="true">↓</span></a>
            <a className="sk-btn" href={github} target="_blank" rel="noopener noreferrer" data-cursor="Visit">github <span aria-hidden="true">↗</span></a>
          </div>
          <dl className="sk-meta">
            <div><dt>based</dt><dd>{SAKSHAM.based}</dd></div>
            <div><dt>company</dt><dd>{SITE.legalName}</dd></div>
            <div><dt>with</dt><dd><Link href="/shivam-jha/">Shivam Jha</Link>, front end</dd></div>
          </dl>
        </div>
        <motion.div className="sk-hero__portrait" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }}>
          <div className="sk-term">
            <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>portrait.ascii</span><span className="sk-term__hint">hover to see</span></div>
            <AsciiPortrait src={SAKSHAM.photo} alt="Saksham Srivastava" cols={86} />
          </div>
        </motion.div>
      </div>
      <a className="sk-scroll" href="#about" aria-label="Scroll to about">scroll <span aria-hidden="true">↓</span></a>
    </section>
  );
}

const ABOUT_LINES = [
  ['{'],
  ['  ', 'k', '"name"', ': ', 's', `"${SAKSHAM.name}"`, ','],
  ['  ', 'k', '"role"', ': ', 's', `"${SAKSHAM.role}"`, ','],
  ['  ', 'k', '"company"', ': ', 's', `"${SITE.legalName}"`, ','],
  ['  ', 'k', '"cofounder"', ': ', 's', '"Shivam Jha"', ','],
  ['  ', 'k', '"builds"', ': ['],
  ['    ', 's', '"APIs and databases"', ','],
  ['    ', 's', '"agentic AI and LLM apps"', ','],
  ['    ', 's', '"MLOps pipelines"', ','],
  ['    ', 's', '"automation: workers, OCR, PDFs"'],
  ['  ],'],
  ['  ', 'k', '"shipped"', ': ', 'n', '10', ','],
  ['  ', 'k', '"based"', ': ', 's', '"India"'],
  ['}'],
];

function JsonLine({ parts }) {
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === 'k' || p === 's' || p === 'n') { out.push(<span key={i} className={`sk-j${p}`}>{parts[i + 1]}</span>); i += 1; }
    else out.push(<span key={i}>{p}</span>);
  }
  return out;
}

function About() {
  return (
    <section className="sk-sec sk-wrap" id="about" aria-labelledby="skAbout">
      <Head n="01" cmd="cat about.json" title="The person behind the server" id="skAbout" />
      <div className="sk-about">
        <motion.div className="sk-term sk-json" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={list(0.05)}>
          <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>about.json</span></div>
          <pre className="sk-json__pre">
            {ABOUT_LINES.map((parts, i) => (
              <motion.span className="sk-json__line" key={i} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.25 } } }}>
                <span className="sk-json__no" aria-hidden="true">{String(i + 1).padStart(2, ' ')}</span><JsonLine parts={parts} />{'\n'}
              </motion.span>
            ))}
          </pre>
        </motion.div>
        <motion.div className="sk-prose" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={list(0.1)}>
          <motion.p variants={rise}>Saksham builds the parts nobody sees and everybody depends on. If a screen shows a number, he is the reason it is right.</motion.p>
          <motion.p variants={rise}>On <Link href="/osht/">OSHT – Agro Trading</Link> he ran the backend: the servers and APIs the Android, iOS and web apps talk to, double-entry books that always balance, background workers, OCR and PDF automation, and releases with no downtime.</motion.p>
          <motion.p variants={rise}>He co-founded Clonix, where he leads the engine that turns a website into design tokens and components, and on his own he has shipped LUMIQ, StockWaves, FlowCraft and a run of agent, MLOps and data tools.</motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="sk-sec sk-wrap" id="stack" aria-labelledby="skStack">
      <Head n="02" cmd="saksham --stack" title="What he reaches for" id="skStack" />
      <div className="sk-term sk-table" role="table" aria-label="Tools, what they are for, and where they shipped">
        <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>stack --list</span><span className="sk-term__hint">{STACK.length} rows</span></div>
        <div className="sk-table__row sk-table__row--head" role="row"><span role="columnheader">tool</span><span role="columnheader">used for</span><span role="columnheader">shipped in</span></div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={list(0.045)} role="rowgroup">
          {STACK.map((s) => (
            <motion.div className="sk-table__row" role="row" key={s.tool} variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }}>
              <span role="cell" className="sk-table__tool">{s.tool}</span>
              <span role="cell">{s.use}</span>
              <span role="cell" className="sk-table__where">{s.where}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Deployment({ d, index }) {
  const { openSite } = useSite();
  const canOpen = !!d.img;
  const open = () => openSite({ ...d, img: d.img || '/assets/img/work/osht.jpg', alt: d.alt || d.title, links: d.links || [] }, null);
  return (
    <motion.article className={`sk-dep${d.img ? ' has-shot' : ''}`} variants={rise}>
      {d.img && (
        <button type="button" className="sk-dep__shot" onClick={open} data-cursor="Open" aria-label={`Open ${d.title} here`}>
          <img src={d.img} alt={d.alt || ''} loading="lazy" />
        </button>
      )}
      <div className="sk-dep__body">
        <p className="sk-dep__head">
          <span className={`sk-st sk-st--${d.status.replace(/\W/g, '')}`}><i aria-hidden="true" />{d.status}</span>
          <span className="sk-dep__n">{String(index + 1).padStart(2, '0')}</span>
        </p>
        <h3 className="sk-dep__title">{d.title}</h3>
        <p className="sk-dep__role">{d.role}</p>
        <p className="sk-dep__did">{d.did}</p>
        <ul className="sk-chips">{d.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="sk-dep__act">
          {canOpen && d.img && <button type="button" className="sk-btn sk-btn--solid sk-btn--sm" onClick={open} data-cursor="Open"><i className="sk-dot" aria-hidden="true" />try it here</button>}
          {(d.links || []).slice(0, 2).map((l) => <a key={l.href} className="sk-btn sk-btn--sm" href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit">{l.label.toLowerCase()} <span aria-hidden="true">↗</span></a>)}
        </div>
      </div>
    </motion.article>
  );
}

function Work() {
  return (
    <section className="sk-sec sk-wrap" id="work" aria-labelledby="skWork">
      <Head n="03" cmd="saksham --deployments" title="What he has shipped" id="skWork" />
      <motion.div className="sk-deps" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} variants={list(0.07)}>
        {DEPLOYMENTS.map((d, i) => <Deployment key={d.slug} d={d} index={i} />)}
      </motion.div>
    </section>
  );
}

function How() {
  const rules = [
    ['Data has to be right.', 'Books that balance and figures checked before anyone sees them.'],
    ['Nothing waits on a person.', 'Workers keep systems in step on their own, and documents produce themselves.'],
    ['AI on top of facts.', 'Numbers come from code, words come from the model, never the other way round.'],
  ];
  return (
    <section className="sk-sec sk-wrap" id="how" aria-labelledby="skHow">
      <Head n="04" cmd="cat architecture.svg" title="The shape of what he builds" id="skHow" />
      <motion.div className="sk-term sk-diagram-wrap" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={SPRING}>
        <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>architecture.svg</span></div>
        <Diagram />
      </motion.div>
      <motion.ul className="sk-rules" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={list(0.1)}>
        {rules.map(([t, d], i) => (
          <motion.li key={t} variants={rise}><span className="sk-rules__n">0{i + 1}</span><b>{t}</b><span>{d}</span></motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

function Logs() {
  return (
    <section className="sk-sec sk-wrap" id="logs" aria-labelledby="skLogs">
      <Head n="05" cmd="tail -f saksham.log" title="What his systems are doing" id="skLogs" />
      <LogStream />
      <p className="sk-note">Each line describes a real feature of a project he built. The times are your clock, not production data.</p>
    </section>
  );
}

function Ping() {
  return (
    <section className="sk-sec sk-wrap" id="ping" aria-labelledby="skPing">
      <Head n="06" cmd="ping saksham" title="Build something with him" id="skPing" />
      <div className="sk-ping">
        <div className="sk-term">
          <div className="sk-term__bar"><span className="sk-dots"><i /><i /><i /></span><span>ping</span></div>
          <pre className="sk-ping__out">{`PING saksham (${SITE.legalName})
reply from a founder within one working day
then: a written plan and a fixed price`}</pre>
        </div>
        <div className="sk-ping__links">
          <Link className="sk-btn sk-btn--solid sk-btn--lg" href="/#contact" data-cursor="Let's talk">start a project <span aria-hidden="true">→</span></Link>
          <a className="sk-ping__mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <ul>
            {SAKSHAM.links.map((l) => (
              <li key={l.href}><span>{l.label.toLowerCase()}</span><a href={l.href} target="_blank" rel="noopener noreferrer">{l.handle} ↗</a></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="sk-foot">
      <div className="sk-wrap sk-foot__in">
        <span>© 2026 {SITE.legalName}</span>
        <span><Link href="/">home</Link> · <Link href="/shivam-jha/">shivam jha, front end →</Link></span>
      </div>
    </footer>
  );
}

export default function SakshamPortfolio() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SiteProvider>
          <div className="sk">
            <a className="skip" href="#sk-main">Skip to content</a>
            <Cursor />
            <TopBar />
            <main id="sk-main">
              <Hero />
              <About />
              <Stack />
              <Work />
              <How />
              <Logs />
              <Ping />
            </main>
            <Foot />
          </div>
          <SiteBrowser />
        </SiteProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
