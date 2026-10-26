/* Sqaron · characters that travel with the scroll
 *
 * rope()   a founder climbs a rope on a screen edge; the rope doubles as the scroll progress bar
 * perch()  a founder sits on, peeks over, waves from or points beside a page element
 * walker() a founder walks along an element's top edge while it scrolls past
 *
 * Frames come from SQ.Founders.sprites(). Characters are decoration: aria-hidden, no focus.
 * Concepts theme them with --sq-rope, --sq-rope-done, --sq-bubble-bg, --sq-bubble-fg, --sq-bubble-font.
 */
// Client-only module: import it with import() inside an effect.
const SQ = (window.SQ = window.SQ || {});
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => window.matchMedia('(max-width: 640px)').matches;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  const pick = (who) => (who === 'random' ? (Math.random() < 0.5 ? 'A' : 'B') : who);
  const other = (who) => (who === 'A' ? 'B' : 'A');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  SQ.pointer = SQ.pointer || { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', (e) => { SQ.pointer.x = e.clientX; SQ.pointer.y = e.clientY; }, { passive: true });

  const css = `
.sq-rope{position:fixed;top:0;bottom:0;width:0;z-index:30;pointer-events:none}
.sq-rope__line,.sq-rope__done{position:absolute;top:0;width:2px;margin-left:-1px;border-radius:2px}
.sq-rope__line{bottom:0;background:var(--sq-rope,currentColor);opacity:.55}
.sq-rope__done{background:var(--sq-rope-done,currentColor);box-shadow:0 0 12px var(--sq-rope-done,transparent)}
.sq-rope__climber{position:absolute;top:0;pointer-events:auto;cursor:pointer;will-change:transform}
.sq-rope__climber canvas{display:block;transition:transform .35s cubic-bezier(.3,1.6,.5,1),opacity .2s}
.sq-rope__climber.is-swapping canvas{opacity:0;transform:scale(.6)}
.sq-rope__climber.is-idle canvas{animation:sq-sway 2.4s ease-in-out infinite;transform-origin:65% 20%}
.sq-rope--left .sq-rope__climber.is-idle canvas{transform-origin:35% 20%}
@keyframes sq-sway{0%,100%{rotate:-2.5deg}50%{rotate:2.5deg}}
.sq-bubble{position:absolute;left:50%;bottom:calc(100% - 14px);translate:-50% 0;white-space:nowrap;
  font:600 12.5px/1.2 var(--sq-bubble-font,system-ui,sans-serif);letter-spacing:.01em;
  background:var(--sq-bubble-bg,#111);color:var(--sq-bubble-fg,#fff);padding:8px 11px;border-radius:12px;
  box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;scale:.85;transform-origin:50% 100%;
  transition:opacity .25s,scale .35s cubic-bezier(.3,1.6,.5,1);pointer-events:none}
.sq-bubble::after{content:"";position:absolute;left:50%;top:100%;margin-left:-6px;border:6px solid transparent;border-top-color:var(--sq-bubble-bg,#111)}
.is-talking>.sq-bubble,.sq-perch.is-in .sq-bubble{opacity:1;scale:1}
.sq-rope--right .sq-bubble{left:auto;right:28%;translate:0 0}
.sq-rope--right .sq-bubble::after{left:auto;right:18px}
.sq-rope--left .sq-bubble{left:28%;translate:0 0}
.sq-rope--left .sq-bubble::after{left:18px}
.sq-perch{position:absolute;z-index:3;pointer-events:none}
.sq-perch canvas{display:block}
.sq-perch__fig{position:absolute;left:0;right:0;bottom:0;transition:transform .7s cubic-bezier(.25,1.4,.45,1)}
.sq-perch--peek .sq-perch__fig{transform:translateY(105%)}
.sq-perch--peek.is-in .sq-perch__fig{transform:none}
.sq-perch--sit .sq-perch__fig,.sq-perch--wave .sq-perch__fig,.sq-perch--point .sq-perch__fig,.sq-perch--stand .sq-perch__fig{transform:translateY(-36px) scale(.9);opacity:0;transition:transform .7s cubic-bezier(.25,1.5,.45,1),opacity .3s}
.sq-perch.is-in .sq-perch__fig{transform:none;opacity:1}
.sq-walker{position:absolute;left:0;z-index:3;pointer-events:none;will-change:transform}
@media (prefers-reduced-motion: reduce){.sq-perch__fig{transition:none!important;transform:none!important;opacity:1!important}.sq-rope__climber.is-idle canvas{animation:none}}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function makeCanvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = Math.round(size * dpr());
    c.style.width = c.style.height = size + 'px';
    return c;
  }
  function paint(canvas, frame) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
  }

  const items = [];
  let running = false;
  function loop(t) {
    for (const it of items) it.tick(t);
    requestAnimationFrame(loop);
  }
  function register(it) {
    items.push(it);
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  const $ = (el) => (typeof el === 'string' ? document.querySelector(el) : el);

  /* ---------- rope climber on a screen edge ---------- */
  function rope(sheet, opts = {}) {
    const o = Object.assign({
      side: 'right', who: 'random', size: 124, inset: 30, top: 0.1, bottom: 0.74,
      stride: 22, swap: 0.4, bubbles: [], onClick: null, className: '',
    }, opts);
    const size = narrow() ? Math.round(o.size * 0.66) : o.size;
    const inset = narrow() ? Math.round(o.inset * 0.55) : o.inset;
    const root = document.createElement('div');
    root.className = `sq-rope sq-rope--${o.side} ${o.className}`;
    root.setAttribute('aria-hidden', 'true');
    root.style[o.side] = inset + 'px';
    root.innerHTML = '<div class="sq-rope__line"></div><div class="sq-rope__done"></div><div class="sq-rope__climber"><span class="sq-bubble"></span></div>';
    const done = root.querySelector('.sq-rope__done');
    const climber = root.querySelector('.sq-rope__climber');
    const bubble = climber.querySelector('.sq-bubble');
    const canvas = makeCanvas(size);
    climber.prepend(canvas);
    document.body.appendChild(root);

    // keep the hands on the rope line
    const u = sheet.anchors.rope;
    climber.style.width = size + 'px';
    climber.style.left = o.side === 'right' ? -(u * size) + 'px' : -((1 - u) * size) + 'px';
    if (o.side === 'left') canvas.style.scale = '-1 1';
    const handV = 0.38;  // hands sit about here in a climb frame

    let who = pick(o.who), drawn = '', y = 0, acc = 0, lastMove = -1e9, frame = -1;
    const progress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    };
    y = (o.top + progress() * (o.bottom - o.top)) * innerHeight;

    function swapTo(next) {
      if (next === who) return;
      climber.classList.add('is-swapping');
      setTimeout(() => { who = next; climber.classList.remove('is-swapping'); }, 220);
    }
    if (o.onClick) climber.addEventListener('click', () => o.onClick(who));

    // speech bubbles keyed to sections
    let talkTimer = 0, lastSection = null;
    const say = (text) => {
      if (!text) return;
      bubble.textContent = text;
      climber.classList.add('is-talking');
      clearTimeout(talkTimer);
      talkTimer = setTimeout(() => climber.classList.remove('is-talking'), 3800);
    };
    if (o.bubbles.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.target === lastSection) continue;
          const first = lastSection === null;
          lastSection = e.target;
          const b = o.bubbles.find((x) => x.node === e.target);
          if (!first && Math.random() < o.swap) swapTo(other(who));
          setTimeout(() => say(b && b.text), first ? 1200 : 450);
        }
      }, { threshold: 0.45 });
      for (const b of o.bubbles) { b.node = $(b.el); if (b.node) io.observe(b.node); }
    }

    register({
      tick(t) {
        const target = (o.top + progress() * (o.bottom - o.top)) * innerHeight;
        const prev = y;
        y += (target - y) * (reduceMotion ? 1 : 0.1);
        const dy = Math.abs(y - prev);
        if (dy > 0.08) { acc += dy; lastMove = t; }
        climber.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        done.style.height = (y + handV * size).toFixed(1) + 'px';
        const frames = sheet[who].climb;
        const f = reduceMotion ? 0 : Math.floor(acc / o.stride) % frames.length;
        if (f !== frame || who !== drawn) { paint(canvas, frames[f]); frame = f; drawn = who; }
        climber.classList.toggle('is-idle', t - lastMove > 1200);
      },
    });
    return { root, say, swap: () => swapTo(other(who)), get who() { return who; } };
  }

  /* ---------- perches attached to page elements ---------- */
  function perch(target, sheet, opts = {}) {
    const el = $(target);
    if (!el) return null;
    const o = Object.assign({ pose: 'sit', who: 'random', at: 0.8, size: 116, fps: 5, flip: false, bubble: '', className: '', lift: 0 }, opts);
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const size = narrow() ? Math.round(o.size * 0.78) : o.size;
    const who = pick(o.who);
    const wrap = document.createElement('div');
    wrap.className = `sq-perch sq-perch--${o.pose} ${o.className}`;
    wrap.setAttribute('aria-hidden', 'true');
    const fig = document.createElement('div');
    fig.className = 'sq-perch__fig';
    const canvas = makeCanvas(size);
    fig.append(canvas);
    if (o.bubble) {
      const b = document.createElement('span');
      b.className = 'sq-bubble';
      b.textContent = o.bubble;
      fig.append(b);
    }
    wrap.append(fig);
    el.append(wrap);
    const A = sheet.anchors;
    const anchor = o.pose === 'sit' ? A.seat : o.pose === 'peek' ? A.edge : A.floor;
    wrap.style.width = size + 'px';
    wrap.style.left = `calc(${o.at * 100}% - ${size / 2}px)`;
    if (o.pose === 'peek') {
      wrap.style.height = Math.round(anchor * size) + 'px';
      wrap.style.top = -Math.round(anchor * size) + o.lift + 'px';
      wrap.style.overflow = 'hidden';
      fig.style.height = size + 'px';
      fig.style.bottom = 'auto';
      fig.style.top = '0';
    } else {
      wrap.style.height = size + 'px';
      wrap.style.top = -Math.round(anchor * size) + o.lift + 'px';
    }
    if (o.flip) canvas.style.scale = '-1 1';
    const frames = sheet[who][o.pose];
    let i = o.pose === 'peek' ? 1 : 0, lastT = 0, visible = false;
    paint(canvas, frames[i]);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      wrap.classList.toggle('is-in', visible);
    }, { threshold: 0.3 });
    io.observe(el);
    register({
      tick(t) {
        if (!visible || reduceMotion) return;
        if (o.pose === 'peek') {
          const r = wrap.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          let f = SQ.pointer.x < cx - 120 ? 0 : SQ.pointer.x > cx + 120 ? 2 : 1;
          if (o.flip) f = 2 - f;
          if (f !== i) { i = f; paint(canvas, frames[i]); }
          return;
        }
        if (frames.length < 2 || t - lastT < 1000 / o.fps) return;
        lastT = t;
        i = (i + 1) % frames.length;
        paint(canvas, frames[i]);
      },
    });
    return { wrap, who };
  }

  /* ---------- walker along an element's top edge ---------- */
  function walker(target, sheet, opts = {}) {
    const el = $(target);
    if (!el) return null;
    const o = Object.assign({ who: 'random', size: 104, stride: 18, className: '' }, opts);
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const size = narrow() ? Math.round(o.size * 0.78) : o.size;
    const who = pick(o.who);
    const wrap = document.createElement('div');
    wrap.className = `sq-walker ${o.className}`;
    wrap.setAttribute('aria-hidden', 'true');
    const canvas = makeCanvas(size);
    wrap.append(canvas);
    el.append(wrap);
    wrap.style.top = -Math.round(sheet.anchors.floor * size) + 'px';
    const frames = sheet[who].walk;
    let x = -1, acc = 0, frame = -1, facing = 1, visible = !!o.progress;
    if (!o.progress) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
    register({
      tick() {
        if (!visible) return;
        const r = el.getBoundingClientRect();
        // either an external progress (e.g. a horizontal reel) or how far the element has scrolled through the screen
        const p = o.progress ? clamp(o.progress(), 0, 1) : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        const nx = p * Math.max(0, r.width - size);
        if (x < 0) x = nx;
        const dx = nx - x;
        x += dx * (reduceMotion ? 1 : 0.14);
        if (Math.abs(dx) > 0.3) { acc += Math.abs(dx) * 0.14; facing = dx > 0 ? 1 : -1; }
        wrap.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        canvas.style.scale = facing > 0 ? '1 1' : '-1 1';
        const f = reduceMotion ? 0 : Math.floor(acc / o.stride) % frames.length;
        if (f !== frame) { paint(canvas, frames[f]); frame = f; }
      },
    });
    return { wrap, who };
  }

  SQ.Crawlers = { rope, perch, walker, paint, makeCanvas };

export default SQ;
