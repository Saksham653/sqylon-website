'use client';

/* Sticky scroll reveal: Aceternity UI's component (ui.aceternity.com), as listed on 21st.dev.
 * Ported to plain JSX and CSS and to the page's own scroll: the steps scroll past while one panel stays
 * put and shows the step you are reading. On phones each step carries its own picture instead. */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';

export default function StickyScroll({ content, className = '' }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.55', 'end 0.55'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(content.length - 1, Math.max(0, Math.floor(v * content.length)));
    setActive((a) => (a === i ? a : i));
  });

  return (
    <div className={`u21-sticky ${className}`.trim()} ref={ref}>
      <ol className="u21-sticky__steps">
        {content.map((c, i) => (
          <motion.li key={c.title} className="u21-sticky__step" animate={{ opacity: active === i ? 1 : 0.28 }} transition={{ duration: 0.45 }}>
            {c.kicker && <p className="u21-sticky__kicker">{c.kicker}</p>}
            <h3 className="u21-sticky__title">{c.title}</h3>
            <p className="u21-sticky__text">{c.description}</p>
            <div className="u21-sticky__inline" aria-hidden="true">{c.content}</div>
          </motion.li>
        ))}
      </ol>
      <div className="u21-sticky__aside" aria-hidden="true">
        <div className="u21-sticky__panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="u21-sticky__content"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {content[active].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
