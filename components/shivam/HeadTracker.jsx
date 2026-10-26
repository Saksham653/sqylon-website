'use client';

/* Shivam's 3D character, looking wherever your cursor is.
 * Left and right are real footage: two Flow clips that start on the same frame were aligned and joined into
 * one sweep, and every frame was measured for how far the head is turned (lib/shivam-head.json).
 * Up and down, blinks and smiles come from LivePortrait, run on frames of that same sweep.
 * All of it is drawn by headRig.js on the GPU: the nearest keyframes are warped along measured optical flow
 * to the exact angle the head is at, so the motion is continuous at the screen's refresh rate; nothing
 * steps from one picture to the next. The cursor gives the angles he should look at and springs move the
 * head there the way a person turns. He blinks wherever he is looking, smiles when asked to (the portfolio
 * button), glances back at you now and then while the cursor rests, and looks around on his own when
 * there is no cursor.
 *
 * `eyes` lays a native-4K layer of the eye region on top for the zoomed-in intro; the head holds still
 * then and blinks for real (a third clip). Without WebGL2 the sweep video is shown frame by frame instead. */
import { useEffect, useRef } from 'react';
import HEAD from '@/lib/shivam-head.json';
import { createRig } from './headRig';

const RIG = '/assets/img/founders/shivam-3d/rig';
const SWEEP_VIDEO = '/assets/video/shivam/head.mp4'; // only without WebGL2
const EYES_VIDEO = '/assets/video/shivam/eyes.mp4';
const POSTER = '/assets/img/founders/shivam-3d/head-poster.webp';

const YAW = HEAD.yaw;
const LAST = YAW.length - 1;
const CENTER = HEAD.center;
const [B0, B1] = HEAD.blink;
const [E0, E1] = HEAD.eyes.sweep;
const OMEGA = 11; // stiffness of the turn: settles in about 0.4 s
const PITCH_GAIN = 0.55; // the head takes about half of a vertical look; the eyes do the rest

const pct = (v) => `${(v * 100).toFixed(4)}%`;
const box = ([x, y, w, h]) => ({ left: pct(x), top: pct(y), width: pct(w), height: pct(h) });
const rand = (a, b) => a + Math.random() * (b - a);
const deg = (r) => (r * 180) / Math.PI;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeIn = (t) => t * t;
const easeOut = (t) => 1 - (1 - t) * (1 - t);

// fractional sweep frame for a head angle (YAW is ascending); for the video fallback
function frameFor(yaw) {
  if (yaw <= YAW[0]) return 0;
  if (yaw >= YAW[LAST]) return LAST;
  let lo = 0, hi = LAST;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (YAW[mid] <= yaw) lo = mid; else hi = mid;
  }
  return lo + (yaw - YAW[lo]) / (YAW[hi] - YAW[lo]);
}

// keeps a paused video on the wanted frame: one seek at a time, always to the latest frame wanted
function frameSeeker(video, fps, onShown) {
  let want = -1, have = -1, pending = -1, busy = false, since = 0, ready = false;
  const pump = () => {
    if (busy && performance.now() - since > 700) busy = false;
    if (!ready || busy || want < 0 || want === have) return;
    busy = true;
    since = performance.now();
    pending = want;
    video.currentTime = (want + 0.5) / fps;
  };
  const seeked = () => {
    busy = false;
    have = pending;
    if (onShown) onShown(have);
    pump();
  };
  video.addEventListener('seeked', seeked);
  return {
    set(i) { want = i; pump(); },
    ready() { ready = true; pump(); },
    destroy() { video.removeEventListener('seeked', seeked); },
  };
}

// the whole file as a blob, so every frame can be reached without waiting on the network
async function load(video, src, signal, kick) {
  const res = await fetch(src, { signal });
  if (!res.ok) throw new Error(`${src}: ${res.status}`);
  const url = URL.createObjectURL(await res.blob());
  video.preload = 'auto';
  video.src = url;
  video.load();
  const loaded = new Promise((resolve, reject) => {
    let id = 0;
    const done = () => { if (video.readyState >= 2) { clearInterval(id); resolve(); } };
    id = setInterval(done, 200);
    ['loadeddata', 'canplay', 'canplaythrough'].forEach((n) => video.addEventListener(n, done, { once: true }));
    video.addEventListener('error', () => { clearInterval(id); reject(new Error(`${src}: cannot decode`)); }, { once: true });
    done();
  });
  // phones (iOS above all) only start decoding once played; it is muted and never shown directly
  if (kick) {
    const p = video.play();
    if (p && p.then) p.then(() => video.pause()).catch(() => {});
  }
  await loaded;
  video.pause();
  return url;
}

export default function HeadTracker({ className = '', controllerRef, eyes = false, depth = 0.5, alt = 'Shivam Jha as a 3D character' }) {
  const rootRef = useRef(null);
  const glRef = useRef(null);
  const fbRef = useRef(null);
  const sweepRef = useRef(null);
  const eyesRef = useRef(null);
  const live = useRef({ eyes, depth, eyesOffAt: -Infinity });
  if (live.current.eyes && !eyes) live.current.eyesOffAt = typeof performance !== 'undefined' ? performance.now() : 0;
  live.current.eyes = eyes;
  live.current.depth = depth;

  useEffect(() => {
    const root = rootRef.current;
    const glCanvas = glRef.current;
    const fbCanvas = fbRef.current;
    const sweepVid = sweepRef.current;
    const eyeVid = eyesRef.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const fps = HEAD.fps;
    const abort = new AbortController();
    const urls = [];
    let alive = true, raf = 0, visible = false, loading = false, last = 0;
    let rig = null, fallback = null, yawLo = YAW[0], yawHi = YAW[LAST];
    let lastDrawn = '';

    let markReady;
    const readyPromise = new Promise((r) => { markReady = r; });
    let shown = false, eyesShown = !(eyeVid && live.current.eyes);
    const settle = () => { if (shown && eyesShown) markReady(); };
    const goLive = () => { if (!shown) { shown = true; root.dataset.live = ''; settle(); } };
    const eyeSeek = eyeVid ? frameSeeker(eyeVid, fps, () => { root.dataset.eyesLive = ''; eyesShown = true; settle(); }) : null;

    // ---- the canvas follows its size on screen (sharp on any display) ----------------------------------
    const ro = new ResizeObserver(() => {
      const r = glCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      glCanvas.width = Math.max(2, Math.min(HEAD.out[0] * 1.5, Math.round(r.width * dpr)));
      glCanvas.height = Math.max(2, Math.round((glCanvas.width * HEAD.out[1]) / HEAD.out[0]));
      lastDrawn = '';
    });
    ro.observe(glCanvas);

    // ---- where he should look --------------------------------------------------------------------------
    const head = { yaw: 0, vel: 0, pitch: 0, pvel: 0 };
    let hold = false;
    let pointer = null, present = false, touching = false, touchEnd = -Infinity, quietSince = 0;
    let nextCheckIn = rand(9000, 14000), checkIn = false, settleUntil = 0;
    let glanceUntil = 0, glanceYaw = 0, glancePitch = 0, nextGlance = performance.now() + rand(2500, 5000);
    let wantBlink = 0, nextBlink = performance.now() + rand(2600, 5200);
    let blinkAt = -1, blinkAgain = false;
    let smileOn = false, smile = 0;
    let rect = null, rectAt = -Infinity;
    let realBlink = -1, realAgain = 0; // the intro's blink: real footage, facing you

    const targets = (now) => {
      if (hold || now < settleUntil || checkIn) return [0, 0];
      if (wantBlink > 0 && live.current.eyes) return [0, 0];
      if (touching === false && pointer && !fine && now - touchEnd > 2600) present = false;
      if (pointer && present) {
        // a cursor that rests: every so often he looks back at you and blinks, then returns to it
        if (fine && now - quietSince > nextCheckIn && !smileOn) {
          checkIn = true;
          quietSince = now;
          nextCheckIn = rand(9000, 14000);
          return [0, 0];
        }
        // where his face is on screen; read at most every 100 ms so a frame never waits on layout
        if (now - rectAt > 100) { rect = root.getBoundingClientRect(); rectAt = now; }
        const fx = rect.left + HEAD.face[0] * rect.width;
        const fy = rect.top + HEAD.face[1] * rect.height;
        const D = Math.max(220, root.offsetWidth * live.current.depth);
        return [deg(Math.atan2(pointer.x - fx, D)), deg(Math.atan2(pointer.y - fy, D)) * PITCH_GAIN];
      }
      // nobody pointing: he looks around now and then
      if (now > nextGlance) {
        glanceUntil = now + rand(900, 1900);
        glanceYaw = (Math.random() < 0.5 ? -1 : 1) * rand(10, 34);
        glancePitch = rand(-7, 6);
        nextGlance = glanceUntil + rand(2600, 6200);
      }
      return now < glanceUntil ? [glanceYaw, glancePitch] : [0, 0];
    };

    const endBlink = (now) => {
      nextBlink = now + (Math.random() < 0.15 ? rand(350, 600) : rand(2400, 5600));
      if (checkIn) { checkIn = false; settleUntil = now + rand(180, 480); }
    };

    // how closed the eyes are: quick down, a beat closed, a softer way up (and a second one when asked)
    const blinkAmount = (now) => {
      if (blinkAt < 0) return 0;
      const e = now - blinkAt;
      if (e < 0) return 0;
      if (e < 75) return easeIn(e / 75);
      if (e < 125) return 1;
      if (e < 255) return 1 - easeOut((e - 125) / 130);
      if (blinkAgain) { blinkAgain = false; blinkAt = now + 110; return 0; }
      blinkAt = -1;
      endBlink(now);
      return 0;
    };

    const frame = (now) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const eyesMode = live.current.eyes || now - live.current.eyesOffAt < 1150;
      if (!eyesMode && rig && realBlink >= 0) realBlink = -1; // the intro's blink ends with the intro
      let [ty, tp] = targets(now);
      if (eyesMode) { ty = 0; tp = 0; } // the zoomed intro: he holds still and blinks for real
      ty = clamp(ty, yawLo, yawHi);
      tp = rig ? clamp(tp, -12, 12) : 0;

      if (realBlink < 0) {
        head.vel += (OMEGA * OMEGA * (ty - head.yaw) - 2 * OMEGA * head.vel) * dt;
        head.yaw = clamp(head.yaw + head.vel * dt, yawLo, yawHi);
        head.pvel += (OMEGA * OMEGA * (tp - head.pitch) - 2 * OMEGA * head.pvel) * dt;
        head.pitch += head.pvel * dt;
      }

      // blinks: real footage in the intro (and without WebGL2), the closed-eye patch anywhere otherwise
      const due = wantBlink > 0 || checkIn || now > nextBlink;
      let f = null;
      if (eyesMode || !rig) {
        if (realBlink >= 0) {
          head.yaw = 0;
          head.vel = 0;
          const k = Math.floor(((now - realBlink) / 1000) * fps);
          if (now < realBlink) f = CENTER;
          else if (k <= B1 - B0) f = B0 + k;
          else if (realAgain > 0) { realAgain -= 1; realBlink = now + 110; f = CENTER; }
          else { realBlink = -1; endBlink(now); f = CENTER; }
        } else if (due && Math.abs(head.yaw) < 0.9 && Math.abs(head.vel) < 14) {
          realBlink = now;
          realAgain = wantBlink > 1 ? 1 : 0;
          wantBlink = 0;
          f = B0;
        } else {
          f = Math.round(frameFor(head.yaw));
        }
        if (eyeSeek && eyesMode) eyeSeek.set(f >= B0 ? HEAD.eyes.blink + (f - B0) : Math.min(E1, Math.max(E0, f)) - E0);
      } else if (blinkAt < 0 && due) {
        const steady = Math.abs(head.vel) < 60 && Math.abs(head.pvel) < 60;
        const faced = !checkIn || (Math.abs(head.yaw) < 2 && Math.abs(head.pitch) < 1.5);
        if (steady && faced) { blinkAt = now; blinkAgain = wantBlink > 1; wantBlink = 0; }
      }
      const blink = rig ? blinkAmount(now) : 0;

      // smile: eases in when asked, out when not
      smile += ((smileOn ? 2 : 0) - smile) * (1 - Math.exp(-dt / 0.12));
      if (Math.abs(smile - (smileOn ? 2 : 0)) < 0.003) smile = smileOn ? 2 : 0;

      if (rig) {
        const key = `${head.yaw.toFixed(3)} ${head.pitch.toFixed(3)} ${blink.toFixed(3)} ${smile.toFixed(3)} ${glCanvas.width}`;
        if (key !== lastDrawn && rig.render({ yaw: head.yaw, pitch: head.pitch, blink, smile })) {
          lastDrawn = key;
          root.__shown = key; // for debugging (a property, so no style work)
          goLive();
        }
      } else if (fallback && f !== null) {
        fallback.show(f);
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && alive && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    // ---- without WebGL2: the sweep video on a 2D canvas, the newest decoded frame as it comes -------------
    const startFallback = () => {
      if (fallback || !alive) return;
      const ctx = fbCanvas.getContext('2d');
      fbCanvas.width = HEAD.out[0];
      fbCanvas.height = HEAD.out[1];
      const seek = frameSeeker(sweepVid, fps, () => { ctx.drawImage(sweepVid, 0, 0, fbCanvas.width, fbCanvas.height); root.dataset.fallback = ''; goLive(); });
      fallback = { show: (i) => seek.set(i), destroy: () => seek.destroy() };
      load(sweepVid, SWEEP_VIDEO, abort.signal, !fine)
        .then((url) => { urls.push(url); seek.ready(); })
        .catch((err) => { if (alive) console.warn('[sqaron] head video unavailable', err); markReady(); });
    };

    const begin = () => {
      if (loading) return;
      loading = true;
      const small = !fine || (navigator.deviceMemory && navigator.deviceMemory < 6);
      createRig(glCanvas, { base: RIG, scale: small ? 0.6 : 1, signal: abort.signal })
        .then((r) => {
          if (!alive) { r.destroy(); return; }
          rig = r;
          [yawLo, yawHi] = r.yawRange;
          root.dataset.rig = '';
          lastDrawn = '';
          start();
        })
        .catch((err) => {
          if (!alive) return;
          console.warn('[sqaron] continuous head unavailable, using the video', err);
          root.dataset.fallback = '';
          startFallback();
        });
      if (eyeVid && live.current.eyes) {
        load(eyeVid, EYES_VIDEO, abort.signal, !fine)
          .then((url) => { urls.push(url); eyeSeek.ready(); })
          .catch(() => { eyesShown = true; settle(); });
      }
    };

    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) begin();
      visible = en.isIntersecting;
      if (visible) start();
    }, { rootMargin: '400px 0px' });
    io.observe(root);

    const onMove = (e) => {
      if (e.pointerType === 'touch') {
        if (e.type === 'pointerdown') touching = true;
        if (!touching) return;
      }
      // moving the cursor while he is turning to glance at you calls the glance off
      if (checkIn && blinkAt < 0 && realBlink < 0 && pointer && Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 24) checkIn = false;
      pointer = { x: e.clientX, y: e.clientY };
      present = true;
      quietSince = performance.now();
    };
    const onUp = (e) => { if (e.pointerType === 'touch') { touching = false; touchEnd = performance.now(); } };
    const onLeave = () => { present = false; };
    const onVis = () => { if (!document.hidden) start(); };
    const onScroll = () => { rectAt = -Infinity; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVis);

    if (controllerRef) {
      controllerRef.current = {
        // in the intro he faces you first, then blinks; twice when asked
        blink: (twice = false) => { wantBlink = Math.max(wantBlink, twice ? 2 : 1); start(); },
        hold: (on) => { hold = !!on; start(); },
        lookAt: (x, y) => { pointer = { x, y }; present = true; quietSince = performance.now(); start(); },
        smile: (on) => { smileOn = !!on; start(); },
        ready: () => { begin(); return readyPromise; },
      };
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      abort.abort();
      io.disconnect();
      ro.disconnect();
      if (rig) rig.destroy();
      if (fallback) fallback.destroy();
      if (eyeSeek) eyeSeek.destroy();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('blur', onLeave);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      urls.forEach((u) => URL.revokeObjectURL(u));
      if (controllerRef) controllerRef.current = null;
    };
  }, [controllerRef]);

  return (
    <div className={`ht ${className}`.trim()} data-eyes={eyes ? 'on' : 'off'} ref={rootRef}>
      <img className="ht__poster" src={POSTER} alt={alt} width={HEAD.out[0]} height={HEAD.out[1]} style={box(HEAD.crop)} />
      <canvas className="ht__canvas ht__canvas--fb" ref={fbRef} aria-hidden="true" style={box(HEAD.crop)} />
      <canvas className="ht__canvas ht__canvas--gl" ref={glRef} aria-hidden="true" style={box(HEAD.crop)} />
      <div className="ht__src" aria-hidden="true">
        <video ref={sweepRef} muted playsInline preload="none" disablePictureInPicture disableRemotePlayback tabIndex={-1} />
      </div>
      <div className="ht__eyes" style={box(HEAD.eyes.rect)} aria-hidden="true">
        <video ref={eyesRef} muted playsInline preload="none" disablePictureInPicture disableRemotePlayback tabIndex={-1} />
      </div>
    </div>
  );
}
