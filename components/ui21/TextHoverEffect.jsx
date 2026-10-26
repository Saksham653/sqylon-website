'use client';

/* Text hover effect: Aceternity UI's component (ui.aceternity.com), as listed on 21st.dev.
 * Ported to plain JSX and CSS: the outline draws itself in once it scrolls into view, and a soft spotlight
 * of colour follows the cursor across the letters. SVG ids are unique per instance. */
import { useId, useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function TextHoverEffect({ text, colors = ['#8BE9FF', '#A78BFF', '#FF8AD8', '#FFD08A'], duration = 0.25, className = '' }) {
  const ref = useRef(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [hovered, setHovered] = useState(false);
  const [spot, setSpot] = useState({ cx: '50%', cy: '50%' });
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    setSpot({ cx: `${((e.clientX - r.left) / r.width) * 100}%`, cy: `${((e.clientY - r.top) / r.height) * 100}%` });
  };
  const common = { x: '50%', y: '50%', textAnchor: 'middle', dominantBaseline: 'middle' };

  return (
    <svg
      ref={ref}
      className={`u21-thover ${className}`.trim()}
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerMove={move}
      role="img"
      aria-label={text}
    >
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
          {colors.map((c, i) => <stop key={c} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />)}
        </linearGradient>
        <motion.radialGradient id={`${id}r`} gradientUnits="userSpaceOnUse" r="24%" initial={{ cx: '50%', cy: '50%' }} animate={spot} transition={{ duration, ease: 'easeOut' }}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`${id}m`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}r)`} />
        </mask>
      </defs>
      <text {...common} className="u21-thover__ghost" style={{ opacity: hovered ? 0.7 : 0 }}>{text}</text>
      <motion.text
        {...common}
        className="u21-thover__draw"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        whileInView={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>
      <text {...common} className="u21-thover__color" stroke={`url(#${id}g)`} mask={`url(#${id}m)`} style={{ opacity: hovered ? 1 : 0 }}>{text}</text>
    </svg>
  );
}
