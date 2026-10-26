/* Sqaron · liquid founder portrait
 * The hero portrait behaves like liquid chrome. Moving through it raises ripples and lets the
 * other founder show through the wake; stir long enough, or click, and the whole frame flips.
 * Left alone it flips by itself at random moments, so neither founder is ever "first".
 */
// Client-only module: import it with import() inside an effect.
const SQ = (window.SQ = window.SQ || {});

  const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform float uAspA;
uniform float uAspB;
uniform float uTime;
uniform vec4 uDrops[24];
uniform int uCount;
uniform float uFlip;
uniform vec2 uFlipO;
uniform float uSwapped;
uniform float uCalm;
uniform float uMono;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float aspect() { return uRes.x / uRes.y; }
vec2 cover(vec2 uv, float texAsp) {
  float c = aspect();
  vec2 s = c > texAsp ? vec2(1.0, texAsp / c) : vec2(c / texAsp, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float front(vec2 uv) {
  return length((uv - uFlipO) * vec2(aspect(), 1.0)) + (fbm(uv * 4.0 + uTime * 0.25) - 0.5) * 0.3;
}
float height(vec2 uv) {
  vec2 q = vec2(uv.x * aspect(), uv.y);
  float h = 0.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uCount) break;
    vec4 d = uDrops[i];
    float r = length(q - vec2(d.x * aspect(), d.y));
    float ring = d.z * 0.34;
    float env = d.w * exp(-d.z * 1.7);
    h += env * exp(-pow((r - ring) * 8.0, 2.0)) * sin(r * 62.0 - d.z * 10.0);
    h += d.w * exp(-d.z * 5.0) * exp(-r * r * 260.0) * 0.8;
  }
  float m = texture(uMask, uv).r;
  h += 0.9 * m * (1.0 - m);
  if (uFlip > 0.0) h += 0.95 * exp(-pow((front(uv) - uFlip * 1.65) * 9.0, 2.0)) * (1.0 - uFlip * 0.6);
  return h;
}
vec3 tone(vec3 c) {
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(l), uMono);
  c = (c - 0.5) * 1.14 + 0.5;
  return c * vec3(0.97, 0.99, 1.04);
}
vec3 photo(sampler2D t, vec2 uv, float asp, vec2 g) {
  vec2 ca = g * 0.0035;
  vec2 p = cover(uv, asp);
  return tone(vec3(texture(t, cover(uv + ca, asp)).r, texture(t, p).g, texture(t, cover(uv - ca, asp)).b));
}
vec3 iri(float t) { return 0.5 + 0.5 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67))); }

void main() {
  vec2 uv = vUv;
  float e = 1.5 / uRes.y;
  float hx = height(uv + vec2(e, 0.0)) - height(uv - vec2(e, 0.0));
  float hy = height(uv + vec2(0.0, e)) - height(uv - vec2(0.0, e));
  vec2 g = vec2(hx, hy) / (2.0 * e) * (1.0 - uCalm);
  vec2 ruv = clamp(uv - g * 0.0028, 0.001, 0.999);

  float m = texture(uMask, uv).r;
  m = smoothstep(0.3, 0.7, m + (fbm(uv * 7.0 + uTime * 0.12) - 0.5) * 0.22);
  float flipM = uFlip > 0.0 ? 1.0 - smoothstep(-0.03, 0.03, front(uv) - uFlip * 1.65) : 0.0;
  float other = max(m, flipM);

  vec3 cA = photo(uA, ruv, uAspA, g);
  vec3 cB = photo(uB, ruv, uAspB, g);
  vec3 base = mix(cA, cB, uSwapped);
  vec3 alt = mix(cB, cA, uSwapped);
  vec3 col = mix(base, alt, other);

  float slope = length(g);
  float chrome = clamp(slope * 0.05, 0.0, 0.9);
  vec3 n = normalize(vec3(-g * 0.02, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float bands = 0.5 + 0.5 * sin(r.x * 7.0 + r.y * 11.0 + uTime * 0.4);
  vec3 env = mix(vec3(0.05, 0.06, 0.09), vec3(0.95, 0.96, 1.0), smoothstep(0.3, 0.8, bands));
  env *= mix(vec3(1.0), iri(r.x * 0.8 + r.y * 0.6 + uTime * 0.05), 0.45);
  float spec = pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.75))), 0.0), 80.0);
  col = mix(col, env * (0.7 + 0.3 * col), chrome);
  col += spec * 1.1 * clamp(slope * 0.02, 0.0, 1.0);

  vec2 v = (uv - 0.5) * vec2(1.0, 0.9);
  col *= 1.0 - smoothstep(0.35, 0.85, length(v)) * 0.45;
  o = vec4(col, 1.0);
}`;

  const rand = (a, b) => a + Math.random() * (b - a);
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function texture(gl, img) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // images: { A: url, B: url } (A = Saksham, B = Shivam). Resolves to a controller, or null without WebGL2.
  SQ.Liquid = async function (canvas, images, opts = {}) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return null;
    const [imgA, imgB] = await Promise.all([load(images.A), load(images.B)]);
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ['uA', 'uB', 'uMask', 'uRes', 'uAspA', 'uAspB', 'uTime', 'uDrops', 'uCount', 'uFlip', 'uFlipO', 'uSwapped', 'uCalm', 'uMono']) U[n] = gl.getUniformLocation(prog, n);
    const tA = texture(gl, imgA), tB = texture(gl, imgB);
    const mask = document.createElement('canvas');
    mask.width = 120;
    mask.height = 150;
    const mctx = mask.getContext('2d');
    const tM = texture(gl, mask);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let swapped = opts.start === 'B' ? 1 : opts.start === 'A' ? 0 : Math.random() < 0.5 ? 1 : 0;
    let flip = 0, flipping = false, flipStart = 0, flipO = [0.5, 0.5];
    let hover = false, last = null, stir = 0, lastAmbient = 0, visible = true;
    let nextAuto = performance.now() + rand(6000, 9500);
    const drops = [];
    const dropData = new Float32Array(24 * 4);
    const who = () => (swapped ? 'B' : 'A');

    function at(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      return { u: x, v: 1 - y, mx: x * mask.width, my: y * mask.height };
    }
    function drop(x, y, s) {
      drops.push({ x, y, t0: performance.now(), s });
      if (drops.length > 24) drops.shift();
    }
    function ink(mx, my, a) {
      const g = mctx.createRadialGradient(mx, my, 0, mx, my, 24);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g;
      mctx.beginPath();
      mctx.arc(mx, my, 24, 0, Math.PI * 2);
      mctx.fill();
    }
    function startFlip(x, y) {
      if (flipping) return;
      flipping = true;
      flipStart = performance.now();
      nextAuto = flipStart + rand(7000, 12000);
      flipO = [x, y];
      drop(x, y, 1);
      stir = 0;
      if (opts.onFlip) opts.onFlip(swapped ? 'A' : 'B');
    }
    canvas.addEventListener('pointerenter', (e) => { hover = true; const p = at(e); drop(p.u, p.v, 0.9); last = p; });
    canvas.addEventListener('pointerleave', () => { hover = false; last = null; nextAuto = Math.max(nextAuto, performance.now() + 4000); });
    let cx = -1, cy = -1;
    canvas.addEventListener('pointermove', (e) => {
      // the page scrolling under a resting cursor also fires pointermove; only real movement stirs
      if (e.clientX === cx && e.clientY === cy) return;
      cx = e.clientX; cy = e.clientY;
      const p = at(e);
      if (!last) { last = p; return; }
      const d = Math.hypot(((p.u - last.u) * canvas.width) / canvas.height, p.v - last.v);
      ink(p.mx, p.my, 0.2);
      if (d > 0.018) { drop(p.u, p.v, Math.min(0.9, 0.25 + d * 6)); stir += d; last = p; }
      if (stir > 2.2) startFlip(p.u, p.v);
    });
    canvas.addEventListener('click', (e) => { const p = at(e); startFlip(p.u, p.v); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      mctx.globalCompositeOperation = 'destination-out';
      mctx.fillStyle = `rgba(0,0,0,${hover ? 0.03 : 0.06})`;
      mctx.fillRect(0, 0, mask.width, mask.height);
      mctx.globalCompositeOperation = 'source-over';
      if (!calm && !hover) {
        if (now - lastAmbient > 1700) { lastAmbient = now; drop(rand(0.12, 0.88), rand(0.12, 0.88), 0.22); }
        if (!flipping && now > nextAuto) startFlip(Math.random(), Math.random() < 0.5 ? 0.04 : 0.96);
      }
      if (flipping) {
        const k = Math.min(1, (now - flipStart) / (calm ? 450 : 1500));
        flip = ease(k);
        if (k >= 1) {
          flipping = false;
          flip = 0;
          swapped = 1 - swapped;
          mctx.clearRect(0, 0, mask.width, mask.height);
          if (opts.onSwap) opts.onSwap(who());
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) if ((now - drops[i].t0) / 1000 > 2.8) drops.splice(i, 1);
      let n = 0;
      for (const d of drops) { dropData.set([d.x, d.y, (now - d.t0) / 1000, calm ? 0 : d.s], n * 4); n++; }

      gl.viewport(0, 0, w, h);
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tA); gl.uniform1i(U.uA, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tB); gl.uniform1i(U.uB, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tM);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.uniform1i(U.uMask, 2);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uAspA, imgA.naturalWidth / imgA.naturalHeight);
      gl.uniform1f(U.uAspB, imgB.naturalWidth / imgB.naturalHeight);
      gl.uniform1f(U.uTime, now / 1000);
      gl.uniform4fv(U.uDrops, dropData);
      gl.uniform1i(U.uCount, n);
      gl.uniform1f(U.uFlip, flip);
      gl.uniform2f(U.uFlipO, flipO[0], flipO[1]);
      gl.uniform1f(U.uSwapped, swapped);
      gl.uniform1f(U.uCalm, calm ? 1 : 0);
      gl.uniform1f(U.uMono, opts.mono == null ? 1 : opts.mono);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
    return {
      flip: () => startFlip(rand(0.3, 0.7), rand(0.35, 0.65)),
      get who() { return who(); },
    };
  };

export default SQ;
