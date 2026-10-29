'use client';

/* 01 · The front end, driven by your scroll. As the card scrolls up into place, "Meet THE FRONTEND DEVELOPER"
 * grows in letter by letter with the scroll, a loop of his 3D character's blinking eyes playing inside the letters
 * (React Bits' MaskedHeading) and a spotlight that follows your cursor. Then the card holds still in the middle of
 * the screen: scrolling on flies the words at you until they fill the screen, and then the letters shut like
 * eyelids over the eyes inside them, the ones nearest his face first and rippling outwards, until not one edge is
 * left. He is right behind them, close up, and blinks as the last one shuts; the camera pulls back to the whole
 * character, who steps aside while his name assembles letter by letter and his details follow (GSAP SplitText).
 * It is one GSAP timeline scrubbed by the scroll, so it plays forwards and backwards with you (scroll back and the
 * letters open their eyes again) and is finished before the card lets go and the back end scrolls in.
 * From then on he turns his head to look wherever your cursor goes. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SplitText } from 'gsap/SplitText';
import HeadTracker from './HeadTracker';
import MaskedHeading from '../rb/MaskedHeading/MaskedHeading';
import { gsap, useGSAP } from '@/lib/gsap';
import HEAD from '@/lib/shivam-head.json';

gsap.registerPlugin(SplitText);

// midpoint between the eyes, as a fraction of the 16:9 render: the camera pulls back about this point
const FACE = { x: HEAD.face[0], y: HEAD.face[1] };
const FACE_ORIGIN = `${(FACE.x * 100).toFixed(2)}% ${(FACE.y * 100).toFixed(2)}%`;
const EYES_LOOP = '/assets/video/shivam/eyes-loop.mp4';
const EYES_POSTER = '/assets/img/founders/shivam-3d/eyes-loop.webp';
const CLOSE = 2.4; // how close the camera starts on his face
const RUN = { desk: 1.8, phone: 1.4 }; // scroll distance of the pinned sequence, in screen heights

const TAGS = ['Next.js', 'React Native', 'GSAP & WebGL', 'Motion', 'LangGraph', 'LlamaIndex'];
const LINKS = [['Portfolio', 'https://myself-koej.vercel.app/'], ['GitHub', 'https://github.com/shivamj56'], ['LinkedIn', 'https://www.linkedin.com/in/shivam-jha-509482268/'], ['Fiverr', 'https://www.fiverr.com/heyshivm']];

// his details come in on the scroll: the name letter by letter out of a mask, the rest line by line after it.
// `at` is where in the timeline they start; the same steps are used inside the pin (desktop) and on their own
// scroll range below the card (phones).
function detailsIn(tl, info, at, span) {
  const name = SplitText.create(info.querySelector('.fe__first'), { type: 'chars', mask: 'chars' });
  const bio = SplitText.create(info.querySelector('.fe__bio'), { type: 'words', mask: 'words' });
  const k = span; // the whole entrance spans this much of the timeline
  tl.from(info.querySelector('.fe__kicker'), { yPercent: 120, opacity: 0, duration: k * 0.2 }, at)
    .from(name.chars, { yPercent: 115, duration: k * 0.3, stagger: k * 0.035 }, at + k * 0.06)
    .from(info.querySelector('.fe__name em'), { yPercent: 45, opacity: 0, duration: k * 0.3 }, at + k * 0.3)
    .from(info.querySelector('.fe__role'), { y: 14, opacity: 0, duration: k * 0.22 }, at + k * 0.42)
    .from(bio.words, { yPercent: 100, opacity: 0, duration: k * 0.22, stagger: k * 0.008 }, at + k * 0.5)
    .from(info.querySelectorAll('.fe__tags li'), { y: 10, opacity: 0, duration: k * 0.16, stagger: k * 0.025 }, at + k * 0.68)
    .from(info.querySelector('.fe__act'), { y: 14, opacity: 0, duration: k * 0.2 }, at + k * 0.8);
  return () => { name.revert(); bio.revert(); };
}

export default function FrontEndIntro({ onOpen }) {
  const root = useRef(null);
  const pin = useRef(null);
  const stage = useRef(null);
  const charRef = useRef(null);
  const titleRef = useRef(null);
  const hintRef = useRef(null);
  const glowRef = useRef(null);
  const infoRef = useRef(null);
  const ctl = useRef(null);
  const headingApi = useRef(null);
  // 'desk' or 'phone' once known; until then (and on the server) the desktop markup
  const [layout, setLayout] = useState(null);
  const [side, setSide] = useState(false);
  const phone = layout === 'phone';

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setLayout(mq.matches ? 'phone' : 'desk');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useGSAP(() => {
    if (!layout) return undefined;
    const mm = gsap.matchMedia();
    mm.add({
      desk: '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
      phone: '(max-width: 900px) and (prefers-reduced-motion: no-preference)',
      calmDesk: '(min-width: 901px) and (prefers-reduced-motion: reduce)',
      calmPhone: '(max-width: 900px) and (prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { desk, phone: small, calmDesk } = ctx.conditions;
      const char = charRef.current;
      const title = titleRef.current;
      const info = infoRef.current;
      const video = () => title.querySelector('video');

      // reduced motion: no pin and no title, just him at rest beside his details
      if (!desk && !small) {
        gsap.set(title, { display: 'none' });
        gsap.set(hintRef.current, { display: 'none' });
        gsap.set(char, { transformOrigin: FACE_ORIGIN, opacity: 1, scale: calmDesk ? 0.96 : 1, xPercent: calmDesk ? -25 : 0, y: calmDesk ? 6 : 0 });
        gsap.set(glowRef.current, { opacity: 1 });
        setSide(true);
        return () => setSide(false);
      }

      const lift = desk ? 40 : 24;
      const zoom = desk ? 7 : 8; // big enough that the letters spill over the whole screen, not just the card
      // the title sits exactly over the card (inside a screen-sized clip around it), and the words fly into the
      // point where his face is waiting behind them
      const face = { x: 0, y: 0 }; // that point again, in the heading's own pixels, where the letters shut from
      const aim = () => {
        pin.current.style.setProperty('--band-w', `${document.documentElement.clientWidth}px`);
        pin.current.style.setProperty('--fe-w', `${stage.current.offsetWidth}px`);
        pin.current.style.setProperty('--fe-h', `${stage.current.offsetHeight}px`);
        const fx = char.offsetLeft + FACE.x * char.offsetWidth;
        const fy = char.offsetTop + FACE.y * char.offsetHeight + lift;
        gsap.set(title, { transformOrigin: `${fx.toFixed(1)}px ${fy.toFixed(1)}px` });
        const heading = title.querySelector('.masked-heading');
        face.x = fx - (heading ? heading.offsetLeft : 0);
        face.y = fy - (heading ? heading.offsetTop : 0);
      };
      aim();
      gsap.set(char, { transformOrigin: FACE_ORIGIN, opacity: 0, scale: CLOSE, xPercent: 0, y: lift });
      gsap.set(glowRef.current, { opacity: 0 });

      // the letters shut like eyelids over the eyes inside them: the glyphs nearest his face first, rippling out,
      // each one faster as it closes. As the last one shuts he blinks, as if they had been his eyes all along.
      const lids = { p: 0 };
      let shutAt = [];
      let blinked = false;
      const shut = () => {
        const api = headingApi.current;
        if (!api) return;
        const glyphs = api.glyphs();
        if (shutAt.length !== glyphs.length) shutAt = new Array(glyphs.length).fill(0);
        let far = 1;
        const dist = glyphs.map((g) => {
          const d = g ? Math.hypot(g.x - face.x, g.y - face.y) : 0;
          far = Math.max(far, d);
          return d;
        });
        for (let i = 0; i < glyphs.length; i += 1) {
          const t = Math.min(1, Math.max(0, (lids.p - (dist[i] / far) * 0.45) / 0.55));
          shutAt[i] = t * t;
        }
        api.shut(lids.p > 0 ? shutAt : null);
        if (lids.p > 0.97 && !blinked) {
          blinked = true;
          if (ctl.current) ctl.current.blink();
        } else if (lids.p < 0.5) blinked = false;
      };

      // once the words have flown past, the title stops drawing (and its video stops) until you scroll back
      let gone = false;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin.current,
          start: 'center center',
          end: () => `+=${Math.round(window.innerHeight * (desk ? RUN.desk : RUN.phone))}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onRefresh: aim,
          onUpdate: (st) => {
            setSide(st.progress > 0.8);
            const hide = st.progress > 0.5;
            if (hide !== gone) {
              gone = hide;
              title.style.visibility = hide ? 'hidden' : '';
              const v = video();
              if (v) { if (hide) v.pause(); else v.play().catch(() => {}); }
            }
          },
        },
      });
      // the words grow until they fill the screen, then shut letter by letter to show him close up
      tl.to(hintRef.current, { opacity: 0, duration: 0.06 }, 0.02)
        .to(title, { scale: zoom, ease: 'power2.in', duration: 0.34 }, 0.08)
        .to(lids, { p: 1, duration: 0.2, onUpdate: shut }, 0.27)
        .to(title, { opacity: 0, duration: 0.03 }, 0.46)
        .to(char, { opacity: 1, duration: 0.12 }, 0.26)
        .to(glowRef.current, { opacity: 1, duration: 0.3 }, 0.34)
        .to(char, { scale: 1, y: 0, ease: 'power3.out', duration: 0.38 }, 0.36);

      let unsplit = () => {};
      if (desk) {
        tl.to(char, { xPercent: -25, scale: 0.96, y: 6, ease: 'power2.inOut', duration: 0.16 }, 0.74);
        unsplit = detailsIn(tl, info, 0.77, 0.19);
      } else {
        // phones: the details sit under the card and come in on their own stretch of scroll
        const below = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: info, start: 'top 92%', end: 'top 40%', scrub: 0.6 } });
        unsplit = detailsIn(below, info, 0, 1);
      }
      tl.to({}, { duration: 0.04 }, 0.96);

      return () => {
        unsplit();
        if (headingApi.current) headingApi.current.shut(null);
        title.style.visibility = '';
        setSide(false);
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [layout], revertOnUpdate: true });

  // he smiles when you reach for his portfolio
  const smile = (on) => { if (ctl.current && ctl.current.smile) ctl.current.smile(on); };
  const open = (e) => {
    smile(true);
    if (e.metaKey || e.ctrlKey || !onOpen) return;
    e.preventDefault();
    const r = stage.current.getBoundingClientRect();
    onOpen('/shivam-jha/', { x: r.left + r.width * (phone ? 0.5 : 0.25), y: r.top + r.height * 0.36 });
  };

  const details = (
    <div className="fe__info" ref={infoRef}>
      <p className="fe__kicker">01 — The front end</p>
      <h3 className="fe__name" id="feName"><span className="fe__first">Shivam</span> <em>Jha</em></h3>
      <p className="fe__role">Co-founder · AI architect, product &amp; frontend</p>
      <p className="fe__bio">He designs and builds what people touch: sites that sell, Android and iOS apps, AI products and Chrome extensions. He led OSHT – Agro Trading, founded Clonix and built NexeraAI.</p>
      <ul className="fe__tags">{TAGS.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="fe__act">
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
      </div>
    </div>
  );

  return (
    <article className={`fe${side ? ' is-side' : ''}`} aria-labelledby="feName" ref={root}>
      {/* pinned together: the card, and over it the title, which is not clipped by the card so it can fill the screen */}
      <div className="fe__pin" ref={pin}>
        <div className="fe__stage" ref={stage}>
          <div className="fe__glow" ref={glowRef} aria-hidden="true" />
          <div className="fe__char" ref={charRef}>
            <HeadTracker controllerRef={ctl} />
          </div>
          <p className="fe__hint" ref={hintRef} aria-hidden="true"><i />Scroll to meet him</p>
          {!phone && details}
        </div>
        {/* a screen-sized window centred on the card: the title grows inside it, so the letters can fill the whole
            screen but never spill past it (a pinned element is fixed, and fixed overflow would widen a phone's page) */}
        <div className="fe__band">
          <div className="fe__title" ref={titleRef}>
            <MaskedHeading
              tag="p"
              text="Meet THE FRONTEND DEVELOPER"
              mediaType="video"
              src={EYES_LOOP}
              poster={EYES_POSTER}
              reveal="scale"
              trigger="scroll"
              scrollStart="top 92%"
              scrollEnd="center 52%"
              duration={1.1}
              fillScale={1.3}
              parallax={34}
              drift={14}
              spotlight
              spotlightRadius={phone ? 140 : 300}
              brightness={1.15}
              saturation={1.1}
              outline
              outlineColor="rgba(241, 240, 236, 0.55)"
              weight={800}
              tracking={-0.035}
              lineHeight={0.98}
              textScale={phone ? 0.155 : 0.148}
              className="fe__masked"
              apiRef={headingApi}
            />
          </div>
        </div>
      </div>
      {phone && <div className="fe__more">{details}</div>}
    </article>
  );
}
