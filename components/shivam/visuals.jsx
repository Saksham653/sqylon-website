'use client';

/* Small drawn pictures (CSS and SVG, no images) for the capability tiles and the process panels.
 * Each one moves a little, and holds still for people who ask for less motion. */

const CURVE = 'M14 106 C 70 106, 78 18, 186 14';

export function SiteVisual() {
  return (
    <div className="v-site">
      <div className="v-site__bar"><i /><i /><i /><span /></div>
      <div className="v-site__hero">
        <b /><b className="is-short" />
        <span className="v-site__cta">Book a call</span>
      </div>
      <div className="v-site__cards"><i /><i /><i /></div>
      <div className="v-site__cursor" />
    </div>
  );
}

export function MotionVisual({ big = false }) {
  return (
    <svg className={`v-motion${big ? ' is-big' : ''}`} viewBox="0 0 200 120" aria-hidden="true">
      <path className="v-motion__grid" d="M14 106H186M14 14V106" />
      <path className="v-motion__arm" d="M14 106L70 106M186 14L78 18" />
      <path className="v-motion__curve" d={CURVE} />
      <circle className="v-motion__handle" cx="70" cy="106" r="4.5" />
      <circle className="v-motion__handle" cx="78" cy="18" r="4.5" />
      <circle className="v-motion__dot" r="6">
        <animateMotion dur="2.6s" repeatCount="indefinite" path={CURVE} keyPoints="0;1;1" keyTimes="0;0.72;1" calcMode="spline" keySplines="0.2 0.8 0.2 1;0 0 1 1" />
      </circle>
    </svg>
  );
}

// the tall tile: the curve, and the CSS that draws it
export function MotionTile() {
  return (
    <div className="v-motion-tile">
      <MotionVisual />
      <code>cubic-bezier(0.2, 0.8, 0.2, 1)</code>
    </div>
  );
}

export function PhoneVisual() {
  return (
    <div className="v-phone">
      <div className="v-phone__body">
        <div className="v-phone__island" />
        <div className="v-phone__head"><i /><b /></div>
        <div className="v-phone__row"><i /><b /></div>
        <div className="v-phone__row"><i /><b /></div>
        <div className="v-phone__row"><i /><b /></div>
        <div className="v-phone__tab"><i /><i /><i /><i /></div>
      </div>
    </div>
  );
}

export function ChatVisual() {
  return (
    <div className="v-chat">
      <p className="v-chat__msg is-me">Summarise this week&apos;s orders</p>
      <p className="v-chat__msg">142 orders, up 18%. Wheat leads; two suppliers are late.</p>
      <p className="v-chat__msg is-typing"><i /><i /><i /></p>
    </div>
  );
}

export function DesignVisual() {
  return (
    <div className="v-design">
      <div className="v-design__type"><span className="v-design__aa">Aa</span><span className="v-design__serif">Aa</span></div>
      <div className="v-design__swatches"><i /><i /><i /><i /><i /></div>
      <div className="v-design__grid"><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
}

export function SignalVisual() {
  return (
    <div className="v-signal">
      <div className="v-signal__bars"><i /><i /><i /><i /></div>
      <div className="v-signal__lang"><span>हिंदी</span><span className="is-on">EN</span></div>
      <p className="v-signal__note">3G · 2 GB RAM</p>
    </div>
  );
}

/* ---- process panels -------------------------------------------------------------------------------------- */

export function ListenPanel() {
  return (
    <div className="p-panel p-panel--listen">
      <div className="p-thread">
        <p className="p-bubble is-them">Who is it for?</p>
        <p className="p-bubble">Grain brokers, in the field, on cheap phones.</p>
        <p className="p-bubble is-them">What should they do first?</p>
        <p className="p-bubble">Log a purchase in under a minute, by voice.</p>
        <p className="p-note">Then a written plan and a fixed price.</p>
      </div>
    </div>
  );
}

export function SketchPanel() {
  return (
    <div className="p-panel p-panel--sketch">
      <div className="p-wire">
        <div className="p-wire__phone">
          <i className="is-head" /><i className="is-hero" /><i /><i /><i className="is-half" /><i className="is-btn" />
        </div>
        <div className="p-wire__notes"><span>Flow</span><span>Type</span><span>Colour</span><span>Motion</span></div>
      </div>
    </div>
  );
}

export function BuildPanel() {
  return (
    <div className="p-panel p-panel--build">
      <pre className="p-code" aria-hidden="true">
        <span className="k">export default function</span> <span className="f">Purchase</span>() {'{'}{'\n'}
        {'  '}<span className="k">const</span> [qty, setQty] = <span className="f">useVoice</span>(<span className="s">&apos;hi-IN&apos;</span>);{'\n'}
        {'  '}<span className="k">return</span> ({'\n'}
        {'    '}&lt;<span className="t">Sheet</span> <span className="a">title</span>=<span className="s">&quot;खरीद&quot;</span>&gt;{'\n'}
        {'      '}&lt;<span className="t">Amount</span> <span className="a">value</span>={'{'}qty{'}'} /&gt;{'\n'}
        {'      '}&lt;<span className="t">Confirm</span> <span className="a">haptics</span> /&gt;{'\n'}
        {'    '}&lt;/<span className="t">Sheet</span>&gt;{'\n'}
        {'  '});{'\n'}
        {'}'}
      </pre>
      <div className="p-checks"><span>Typed</span><span>Accessible</span><span>Fast on 3G</span></div>
    </div>
  );
}

export function PolishPanel() {
  return (
    <div className="p-panel p-panel--polish">
      <MotionVisual big />
      <code className="p-ease">cubic-bezier(0.2, 0.8, 0.2, 1)</code>
    </div>
  );
}

export function ShipPanel() {
  return (
    <div className="p-panel p-panel--ship">
      <div className="p-live"><i /> Live</div>
      <div className="p-bars"><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="p-stores"><span>Google Play</span><span>App Store</span><span>Web</span></div>
    </div>
  );
}
