'use client';

/* Motion helpers: headings that rise word by word, blocks that settle in, buttons that lean toward the
 * cursor. All of them respect MotionConfig reducedMotion="user" from the page root. */
import { Children, isValidElement } from 'react';
import { motion, useSpring } from 'motion/react';

const SPRING = { type: 'spring', visualDuration: 0.75, bounce: 0.14 };

const word = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { type: 'spring', visualDuration: 0.8, bounce: 0.16 } },
};

function Word({ children }) {
  return (
    <span className="wl">
      <motion.span className="wl__in" variants={word}>{children}</motion.span>
    </span>
  );
}

/* <RevealWords as="h2">Two founders. <em>Zero hand-offs.</em></RevealWords>
 * Plain text rises a word at a time; an element such as <em> rises as one piece so its styling stays whole. */
export function RevealWords({ as = 'h2', children, amount = 0.5, ...rest }) {
  const Tag = motion[as];
  const parts = [];
  // a word that touches the one before it (", in four steps" after <em>live</em>) stays on its line
  const push = (node, key, glued) => {
    const prev = parts[parts.length - 1];
    if (glued && prev && prev !== ' ') {
      parts[parts.length - 1] = <span className="wl-pair" key={`pair-${key}`}>{prev}{node}</span>;
    } else {
      parts.push(node);
    }
  };
  Children.forEach(children, (child, ci) => {
    if (typeof child === 'string') {
      child.split(/(\s+)/).forEach((bit, bi) => {
        if (!bit) return;
        if (/^\s+$/.test(bit)) parts.push(' ');
        else push(<Word key={`${ci}-${bi}`}>{bit}</Word>, `${ci}-${bi}`, bi === 0);
      });
    } else if (isValidElement(child)) {
      push(<Word key={ci}>{child}</Word>, ci, true);
    }
  });
  return (
    <Tag initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={{ show: { transition: { staggerChildren: 0.06 } } }} {...rest}>
      {parts}
    </Tag>
  );
}

/* A block that settles in from below once it is on screen. */
export function Reveal({ as = 'div', y = 44, delay = 0, amount = 0.2, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount }} transition={{ ...SPRING, delay }} {...rest}>
      {children}
    </Tag>
  );
}

/* A list whose items settle in one after another. Children should be <StaggerItem>s. */
export function Stagger({ as = 'ul', gap = 0.07, amount = 0.15, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={{ show: { transition: { staggerChildren: gap } } }} {...rest}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ as = 'li', y = 34, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: SPRING } }} {...rest}>
      {children}
    </Tag>
  );
}

/* A link or button that leans toward the cursor and springs back. */
export function Magnetic({ as = 'a', pull = [0.26, 0.34], children, style, ...rest }) {
  const Tag = motion[as];
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.7 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.7 });
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * pull[0]);
    y.set((e.clientY - (r.top + r.height / 2)) * pull[1]);
  };
  const onPointerLeave = () => { x.set(0); y.set(0); };
  return (
    <Tag style={{ ...style, x, y }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} {...rest}>
      {children}
    </Tag>
  );
}
