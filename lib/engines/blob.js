/* Sqaron · liquid chrome blob
 * A raymarched metaball in a studio environment: it drifts, breathes and reaches toward the cursor.
 * Renders only while on screen, at a resolution that keeps it smooth.
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
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPull;
uniform float uCalm;

float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
float map(vec3 p) {
  float t = uTime * mix(0.55, 0.12, uCalm);
  float d = length(p) - 0.64;
  d += 0.035 * sin(p.x * 5.0 + t * 2.0) * sin(p.y * 4.0 - t * 1.4) * sin(p.z * 5.0 + t * 1.2);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec3 c = 0.6 * vec3(sin(t * 0.9 + fi * 1.7), cos(t * 0.7 + fi * 2.3), 0.6 * sin(t * 0.5 + fi * 1.1));
    d = smin(d, length(p - c) - (0.25 + 0.05 * sin(t + fi * 2.0)), 0.46);
  }
  d = smin(d, length(p - vec3(uMouse, 0.35)) - 0.2 * uPull, 0.5);
  return d;
}
vec3 normal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
vec3 env(vec3 r) {
  vec3 c = mix(vec3(0.03, 0.03, 0.045), vec3(0.42, 0.42, 0.5), smoothstep(-0.4, 0.95, r.y));
  c += vec3(1.0) * smoothstep(0.82, 0.98, dot(r, normalize(vec3(-0.6, 0.55, 0.6)))) * 4.0;
  c += vec3(0.7, 0.8, 1.0) * smoothstep(0.86, 0.99, dot(r, normalize(vec3(0.75, 0.15, 0.45)))) * 2.4;
  c += vec3(1.0, 0.7, 0.9) * smoothstep(0.9, 0.995, dot(r, normalize(vec3(0.1, -0.7, 0.6)))) * 1.4;
  c += vec3(0.65, 0.55, 1.0) * smoothstep(0.88, 0.99, dot(r, normalize(vec3(-0.8, -0.2, -0.2)))) * 1.6;
  c += vec3(0.9, 0.9, 1.0) * exp(-abs(r.y + 0.08) * 30.0) * 0.8;
  return c;
}
vec3 iri(float t) { return 0.5 + 0.5 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67))); }

void main() {
  vec2 uv = (2.0 * vUv * uRes - uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 3.1);
  vec3 rd = normalize(vec3(uv, -2.1));
  float b = dot(ro, rd), c = dot(ro, ro) - 1.5 * 1.5, h = b * b - c;
  if (h < 0.0) { o = vec4(0.0); return; }
  h = sqrt(h);
  float t = max(-b - h, 0.0), tmax = -b + h;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0008) { hit = true; break; }
    t += d * 0.9;
    if (t > tmax) break;
  }
  if (!hit) { o = vec4(0.0); return; }
  vec3 p = ro + rd * t, n = normal(p), r = reflect(rd, n);
  float ndv = max(dot(n, -rd), 0.0);
  vec3 col = env(r);
  col *= mix(vec3(0.95), iri(ndv * 1.3 + uTime * 0.04), 0.55);
  col += pow(1.0 - ndv, 4.0) * vec3(0.55, 0.5, 0.85) * 0.8;
  col = col / (1.0 + col * 0.6);
  o = vec4(pow(col, vec3(0.92)), 1.0);
}`;

  SQ.Blob = function (canvas) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ['uRes', 'uTime', 'uMouse', 'uPull', 'uCalm']) U[n] = gl.getUniformLocation(prog, n);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false, mouse = [0, 0], target = [0, 0], pull = 0, pullT = 0, scale = 0.75, frames = 0, acc = 0, last = 0;

    addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.height) * 2 - r.width / r.height;
      const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const k = 1.47;
      let mx = x * k, my = y * k;
      const len = Math.hypot(mx, my);
      if (len > 1.05) { mx *= 1.05 / len; my *= 1.05 / len; }
      target = [mx, my];
      pullT = len < 2.2 ? 1 : 0;
    }, { passive: true });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = 0; return; }
      if (last) {
        acc += now - last; frames++;
        if (frames === 40) { const avg = acc / frames; if (avg > 28 && scale > 0.45) scale *= 0.85; else if (avg < 18 && scale < 1) scale *= 1.08; frames = 0; acc = 0; }
      }
      last = now;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      mouse[0] += (target[0] - mouse[0]) * 0.06;
      mouse[1] += (target[1] - mouse[1]) * 0.06;
      pull += (pullT - pull) * 0.05;
      gl.viewport(0, 0, w, h);
      gl.useProgram(prog);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uTime, now / 1000);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uPull, calm ? 0 : pull);
      gl.uniform1f(U.uCalm, calm ? 1 : 0);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
    return true;
  };

export default SQ;
