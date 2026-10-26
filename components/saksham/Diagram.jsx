'use client';

/* The shape of most things he builds: apps talk to an API, the API leans on a database, workers and
 * agents, and documents flow out the other end. Packets travel the wires (SVG SMIL, paused for
 * reduced motion). */
import { useEffect, useRef } from 'react';

const NODES = [
  { id: 'apps', x: 30, y: 150, w: 180, h: 74, t: 'Apps', s: 'Android · iOS · web' },
  { id: 'api', x: 300, y: 150, w: 180, h: 74, t: 'API', s: 'FastAPI · async' },
  { id: 'db', x: 580, y: 40, w: 240, h: 74, t: 'PostgreSQL', s: 'data that has to be right' },
  { id: 'work', x: 580, y: 150, w: 240, h: 74, t: 'Workers', s: 'jobs that sync on their own' },
  { id: 'ai', x: 580, y: 260, w: 240, h: 74, t: 'Agents + LLMs', s: 'answers on checked facts' },
  { id: 'docs', x: 900, y: 150, w: 200, h: 74, t: 'OCR → PDF', s: 'papers in, reports out' },
];
const WIRES = [
  ['w1', 'M210 187 H300'],
  ['w2', 'M480 175 C 530 175, 530 77, 580 77'],
  ['w3', 'M480 187 H580'],
  ['w4', 'M480 199 C 530 199, 530 297, 580 297'],
  ['w5', 'M820 187 H900'],
  ['w6', 'M820 77 C 860 77, 860 175, 900 175'],
];

export default function Diagram() {
  const svg = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && svg.current && svg.current.pauseAnimations) svg.current.pauseAnimations();
  }, []);
  return (
    <svg ref={svg} className="sk-diagram" viewBox="0 0 1130 374" role="img" aria-label="Apps talk to an API built with FastAPI. The API uses PostgreSQL, background workers, and agents with LLMs. Documents come out through OCR and PDF generation.">
      <defs>
        <linearGradient id="skWire" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="910" y2="0">
          <stop offset="0" stopColor="#6EF2A6" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#6EF2A6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7BE3FF" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {WIRES.map(([id, d]) => <path key={id} id={id} d={d} className="sk-wire" />)}
      {WIRES.map(([id], i) => (
        <circle key={`p-${id}`} r="3.2" className="sk-packet">
          <animateMotion dur={`${2.2 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.35}s`}>
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ))}
      {NODES.map((n) => (
        <g key={n.id} className={`sk-node sk-node--${n.id}`}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="12" />
          <text x={n.x + 18} y={n.y + 31} className="sk-node__t">{n.t}</text>
          <text x={n.x + 18} y={n.y + 53} className="sk-node__s">{n.s}</text>
        </g>
      ))}
    </svg>
  );
}
