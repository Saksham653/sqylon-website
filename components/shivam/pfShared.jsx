'use client';

/* Small pieces the portfolio's sections share: the section heading and a media-query hook. */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const EASE = [0.2, 0.8, 0.2, 1];

export function useMedia(query, initial = false) {
  const [on, setOn] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return on;
}

// number and label over a rule that draws itself, then the title rising out of a mask, then the note
export function SectionHead({ n, label, title, note, id, className = '' }) {
  return (
    <motion.header
      className={`pf-head ${className}`.trim()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      <p className="pf-head__label">
        <span className="pf-head__n">{n}</span>
        <motion.span className="pf-head__rule" aria-hidden="true" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } } }} />
        <motion.span variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.35 } } }}>{label}</motion.span>
      </p>
      <h2 className="pf-head__title" id={id}>
        <motion.span className="pf-head__rise" variants={{ hidden: { y: '108%' }, show: { y: '0%', transition: { duration: 1, ease: [0.7, 0, 0.2, 1], delay: 0.1 } } }}>
          {title}
        </motion.span>
      </h2>
      {note && (
        <motion.p className="pf-head__note" variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.45 } } }}>
          {note}
        </motion.p>
      )}
    </motion.header>
  );
}
