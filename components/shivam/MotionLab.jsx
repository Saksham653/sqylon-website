'use client';

/* The motion lab: a cubic-bezier editor you can drag. The handles move with the pointer or the arrow keys,
 * the presets are the curves this site uses, and the same curve drives a dot, a card and a progress bar so
 * you can feel the difference. Copy gives you the CSS. */
import { useEffect, useRef, useState } from 'react';

const PRESETS = [
  ['Sqaron', [0.2, 0.8, 0.2, 1]],
  ['Expo out', [0.16, 1, 0.3, 1]],
  ['In-out', [0.65, 0, 0.35, 1]],
  ['Back out', [0.34, 1.56, 0.64, 1]],
  ['Linear', [0, 0, 1, 1]],
];

// the box the curve lives in, with room above and below for curves that overshoot
const S = 240, PX = 30, PY = 64, VW = S + PX * 2, VH = S + PY * 2;
const toXY = (x, y) => [PX + x * S, PY + (1 - y) * S];
const clampX = (v) => Math.min(1, Math.max(0, v));
const clampY = (v) => Math.min(1.4, Math.max(-0.4, v));
const r2 = (v) => Math.round(v * 100) / 100;

export default function MotionLab() {
  const [p, setP] = useState(PRESETS[0][1]);
  const [run, setRun] = useState(0);
  const [copied, setCopied] = useState(false);
  const svg = useRef(null);
  const drag = useRef(-1);
  const css = `cubic-bezier(${p.join(', ')})`;

  // every change replays the preview after a short pause, so dragging doesn't strobe it
  useEffect(() => {
    const t = setTimeout(() => setRun((n) => n + 1), 260);
    return () => clearTimeout(t);
  }, [css]);

  const setHandle = (i, x, y) => setP((q) => (i === 0 ? [r2(clampX(x)), r2(clampY(y)), q[2], q[3]] : [q[0], q[1], r2(clampX(x)), r2(clampY(y))]));
  const move = (e) => {
    if (drag.current < 0) return;
    const r = svg.current.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * VW;
    const sy = ((e.clientY - r.top) / r.height) * VH;
    setHandle(drag.current, (sx - PX) / S, 1 - (sy - PY) / S);
  };
  const key = (i) => (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setHandle(i, p[i * 2] + d[0], p[i * 2 + 1] + d[1]);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`transition-timing-function: ${css};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked: the text is on screen to select */ }
  };

  const [a, b] = [toXY(p[0], p[1]), toXY(p[2], p[3])];
  const [s0, s1] = [toXY(0, 0), toXY(1, 1)];

  return (
    <div className="pf-lab">
      <div className="pf-lab__panel pf-lab__editor">
        <p className="pf-lab__head"><span>Easing</span><span>drag the handles</span></p>
        <svg
          ref={svg}
          className="pf-lab__svg"
          viewBox={`0 0 ${VW} ${VH}`}
          onPointerMove={move}
          onPointerUp={() => { drag.current = -1; }}
          onPointerCancel={() => { drag.current = -1; }}
        >
          <title>{`Easing curve ${css}`}</title>
          <rect x={PX} y={PY} width={S} height={S} rx="6" className="pf-lab__box" />
          {[0.25, 0.5, 0.75].map((g) => (
            <g key={g}>
              <line x1={PX + S * g} y1={PY} x2={PX + S * g} y2={PY + S} className="pf-lab__grid" />
              <line x1={PX} y1={PY + S * g} x2={PX + S} y2={PY + S * g} className="pf-lab__grid" />
            </g>
          ))}
          <line x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]} className="pf-lab__diag" />
          <line x1={s0[0]} y1={s0[1]} x2={a[0]} y2={a[1]} className="pf-lab__arm" />
          <line x1={s1[0]} y1={s1[1]} x2={b[0]} y2={b[1]} className="pf-lab__arm" />
          <path d={`M${s0[0]} ${s0[1]} C${a[0]} ${a[1]} ${b[0]} ${b[1]} ${s1[0]} ${s1[1]}`} className="pf-lab__curve" />
          <circle cx={s0[0]} cy={s0[1]} r="4.5" className="pf-lab__end" />
          <circle cx={s1[0]} cy={s1[1]} r="4.5" className="pf-lab__end" />
          {[a, b].map((pt, i) => (
            <g key={i}>
              <circle cx={pt[0]} cy={pt[1]} r="20" className="pf-lab__hit" onPointerDown={(e) => { drag.current = i; svg.current.setPointerCapture(e.pointerId); }} />
              <circle
                cx={pt[0]}
                cy={pt[1]}
                r="9"
                className={`pf-lab__handle pf-lab__handle--${i} cursor-target`}
                data-cursor-label="Drag"
                tabIndex={0}
                role="slider"
                aria-label={`Handle ${i + 1}`}
                aria-valuetext={`${p[i * 2]}, ${p[i * 2 + 1]}`}
                aria-valuenow={p[i * 2 + 1]}
                aria-valuemin={-0.4}
                aria-valuemax={1.4}
                onPointerDown={(e) => { drag.current = i; svg.current.setPointerCapture(e.pointerId); }}
                onKeyDown={key(i)}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="pf-lab__side">
        <div className="pf-lab__panel pf-lab__code">
          <code><span className="k">transition-timing-function</span>: <span className="v">{css}</span>;</code>
          <button type="button" className="pf-lab__copy cursor-target" onClick={copy} data-cursor-label="Copy">{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <div className="pf-chips" role="group" aria-label="Easing presets">
          {PRESETS.map(([name, v]) => (
            <button key={name} type="button" className="pf-chip cursor-target" aria-pressed={v.join() === p.join()} onClick={() => setP(v)}>{name}</button>
          ))}
        </div>
        <div className="pf-lab__panel pf-lab__run" style={{ '--curve': css }} aria-hidden="true" key={run}>
          <div className="pf-lab__track"><span className="pf-lab__dot" /></div>
          <div className="pf-lab__stage">
            <span className="pf-lab__card"><i /><b /><b /></span>
          </div>
          <div className="pf-lab__bar"><span /></div>
        </div>
        <button type="button" className="pf-lab__replay cursor-target" onClick={() => setRun((n) => n + 1)}>Replay <span aria-hidden="true">↻</span></button>
      </div>
    </div>
  );
}
