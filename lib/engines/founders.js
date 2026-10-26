/* Sqaron · stand-in founders
 *
 * Two dummy founders drawn as soft 3D figures with signed distance fields (WebGL2),
 * so the prototypes need no photos. Every concept uses them for hero portraits,
 * depth maps and the animated characters. Real photos or 3D renders replace them later.
 *
 *   A = Saksham stand-in: round glasses, neat side part
 *   B = Shivam stand-in: curly top, short beard
 */
// Client-only module: import it with import() inside an effect.
const SQ = (window.SQ = window.SQ || {});

  /* ---------------- vectors and matrices ---------------- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  function mm(A, B) {
    const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    return C;
  }
  const mv = (M, v) => [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
  ];
  // yaw turns toward +x, pitch tips the top toward +z (forward), roll tilts sideways
  function euler(yaw = 0, pitch = 0, roll = 0) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
    const Rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]];
    const Rz = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
    return mm(mm(Ry, Rx), Rz);
  }
  const colMajor = (M) => new Float32Array([M[0][0], M[1][0], M[2][0], M[0][1], M[1][1], M[2][1], M[0][2], M[1][2], M[2][2]]);

  /* ---------------- pose rig ---------------- */
  const ARM = [0.27, 0.26];
  const LEG = [0.3, 0.3];

  // Two-bone IK: middle joint for a limb from root to target, bending toward the pole direction.
  function ik(root, target, l1, l2, pole) {
    let d = sub(target, root);
    let dist = len(d);
    const reach = (l1 + l2) * 0.999;
    if (dist > reach) { target = add(root, scale(norm(d), reach)); d = sub(target, root); dist = reach; }
    const dir = norm(d);
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
    const p = norm(sub(pole, scale(dir, dot(pole, dir))));
    return { mid: add(add(root, scale(dir, a)), scale(p, h)), end: target };
  }

  // A pose is written in the figure's own space (facing +z, toward the camera); build() makes joints.
  function build(p) {
    const yawM = euler(p.yaw || 0, 0, 0);
    const tr = p.torso || [0, 0, 0];
    const T = euler(tr[0], tr[1], tr[2]);
    const pelvis = [0, 0.72 + (p.bob || 0), 0];
    const at = (v) => add(pelvis, mv(T, v));
    const neck = at([0, 0.55, -0.01]);
    const neckTop = at([0, 0.67, -0.01]);
    const hr = p.head || [0, 0, 0];
    const H = mm(T, euler(hr[0], hr[1], hr[2]));
    const headP = add(neckTop, mv(H, [0, 0.31, 0.02]));
    const J = [pelvis, neck];
    for (const s of [-1, 1]) {
      const sh = at([0.3 * s, 0.46, -0.01]);
      const target = s < 0 ? p.handL : p.handR;
      const pole = (s < 0 ? p.elbowL : p.elbowR) || [s, -0.4, -0.3];
      const r = ik(sh, target, ARM[0], ARM[1], pole);
      J.push(sh, r.mid, r.end);
    }
    for (const s of [-1, 1]) {
      const hip = add(pelvis, [0.13 * s, -0.02, 0]);
      const target = s < 0 ? p.footL : p.footR;
      const pole = (s < 0 ? p.kneeL : p.kneeR) || [0, 0, 1];
      const r = ik(hip, target, LEG[0], LEG[1], pole);
      J.push(hip, r.mid, r.end);
    }
    return {
      J: J.map((j) => mv(yawM, j)),
      headP: mv(yawM, headP),
      headM: mm(yawM, H),
      torsoM: mm(yawM, T),
      footYaw: p.yaw || 0,
      legs: p.legs !== false,
    };
  }

  const TAU = Math.PI * 2;
  const POSES = {
    stand: () => ({
      handL: [-0.43, 0.68, 0.08], handR: [0.43, 0.68, 0.08],
      footL: [-0.15, 0.1, 0], footR: [0.15, 0.1, 0],
    }),
    bust: () => ({
      torso: [0, 0, 0], head: [0.16, 0.03, 0.02],
      handL: [-0.44, 0.7, 0.1], handR: [0.44, 0.7, 0.1],
      footL: [-0.15, 0.1, 0], footR: [0.15, 0.1, 0], legs: false,
    }),
    // climbing a rope or wall that sits in front of the figure; turned to show a 3/4 face
    climb: (ph) => {
      const s = Math.sin(ph);
      return {
        yaw: 1.05, bob: 0.03 * Math.cos(2 * ph), torso: [0, 0.18, 0.05 * s],
        handL: [-0.2, 1.3 + 0.14 * s, 0.48], handR: [0.2, 1.3 - 0.14 * s, 0.48],
        elbowL: [-1, -0.6, -0.2], elbowR: [1, -0.6, -0.2],
        footL: [-0.13, 0.34 - 0.12 * s, 0.36], footR: [0.13, 0.34 + 0.12 * s, 0.36],
        kneeL: [-0.2, 0.3, 1], kneeR: [0.2, 0.3, 1],
        head: [-0.62, -0.12, 0],
      };
    },
    walk: (ph) => {
      const s = Math.sin(ph), c = Math.cos(ph);
      return {
        yaw: 0.75, bob: 0.03 * Math.abs(c) - 0.02, torso: [0, 0.06, 0.03 * s],
        footL: [-0.13, 0.1 + 0.09 * Math.max(0, s), 0.2 * s], footR: [0.13, 0.1 + 0.09 * Math.max(0, -s), -0.2 * s],
        handL: [-0.38, 0.72, -0.17 * s], handR: [0.38, 0.72, 0.17 * s],
        elbowL: [-0.6, 0, -1], elbowR: [0.6, 0, -1],
        head: [-0.45, -0.04, 0],
      };
    },
    sit: (ph) => {
      const s = Math.sin(ph);
      return {
        bob: -0.08, torso: [0, -0.06, 0],
        footL: [-0.15, 0.36 + 0.04 * s, 0.4 + 0.09 * s], footR: [0.15, 0.36 - 0.04 * s, 0.4 - 0.09 * s],
        kneeL: [0, 1, 0.4], kneeR: [0, 1, 0.4],
        handL: [-0.42, 0.6, 0.05], handR: [0.42, 0.6, 0.05],
        elbowL: [-1, 0.2, -0.5], elbowR: [1, 0.2, -0.5],
        head: [0.12 * s, 0.04, 0.06 * s],
      };
    },
    wave: (ph) => {
      const s = Math.sin(ph);
      return {
        torso: [0, 0, -0.04],
        handL: [-0.43, 0.68, 0.08], handR: [0.66 + 0.1 * s, 1.52 + 0.03 * s, 0.1], elbowR: [1, -0.6, 0],
        footL: [-0.15, 0.1, 0], footR: [0.15, 0.1, 0],
        head: [0.1, 0.02, -0.08 - 0.04 * s],
      };
    },
    // hands resting on an edge, head above it; dir -1 / 0 / 1 = looking left / ahead / right
    peek: (dir) => ({
      torso: [0, 0.12, 0],
      handL: [-0.3, 1.42, 0.34], handR: [0.3, 1.42, 0.34],
      elbowL: [-1, -0.5, 0], elbowR: [1, -0.5, 0],
      footL: [-0.15, 0.1, 0], footR: [0.15, 0.1, 0],
      head: [0.38 * dir, 0.06, -0.06 * dir],
    }),
    point: () => ({
      yaw: 0.2, torso: [0.1, 0, 0],
      handR: [0.82, 1.22, 0.14], elbowR: [0.3, -1, 0],
      handL: [-0.36, 0.86, 0.16], elbowL: [-1, 0, -0.4],
      footL: [-0.15, 0.1, 0], footR: [0.15, 0.1, 0.02],
      head: [0.25, 0, 0.05],
    }),
  };

  /* ---------------- WebGL helpers (shared with the concept effects) ---------------- */
  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error('Shader compile failed: ' + log);
    }
    return s;
  }
  function link(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Program link failed: ' + gl.getProgramInfoLog(p));
    return p;
  }
  function fullscreenTriangle(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }
  function uniforms(gl, prog, names) {
    const u = {};
    for (const n of names) u[n] = gl.getUniformLocation(prog, n);
    return u;
  }
  function textureFrom(gl, source, opts = {}) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, opts.flip !== false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !!opts.premultiply);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const f = opts.nearest ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  SQ.GL = { compile, link, fullscreenTriangle, uniforms, textureFrom };

  /* ---------------- the founder shader ---------------- */
  const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2 uRes;
uniform vec3 uCamPos;
uniform vec3 uCamTarget;
uniform float uFov;
uniform vec4 uBound;
uniform float uMorph;
uniform float uWobble;
uniform float uTime;
uniform int uMode;
uniform int uLegs;
uniform int uQuality;
uniform vec3 uBgTop;
uniform vec3 uBgBot;
uniform vec3 uBgGlow;
uniform float uBgAlpha;
uniform vec3 uRim;
uniform vec3 uSky;
uniform vec3 uGround;
uniform vec3 uKey;
uniform vec3 uHood[2];
uniform vec3 uPants[2];
uniform vec3 uTrim[2];
uniform vec3 uSkin[2];
uniform vec3 uShoe[2];
uniform vec3 uEye;
uniform mat3 uHeadM;
uniform vec3 uHeadP;
uniform mat3 uTorsoM;
uniform float uFootYaw;
uniform vec3 uJ[14];

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
vec2 opU(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
vec2 opSU(vec2 a, vec2 b, float k) { return vec2(smin(a.x, b.x, k), a.x < b.x ? a.y : b.y); }
float sdEll(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}
float sdCap(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
float sdTor(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}
float sdRBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

vec2 headSDF(vec3 q, int id) {
  float d = sdEll(q, vec3(0.36, 0.38, 0.35));
  d = smin(d, sdEll(q - vec3(0.0, -0.12, 0.05), vec3(0.30, 0.26, 0.29)), 0.06);
  vec3 qa = vec3(abs(q.x), q.y, q.z);
  d = smin(d, sdEll(qa - vec3(0.35, -0.03, -0.02), vec3(0.055, 0.1, 0.07)), 0.03);
  d = smin(d, sdEll(q - vec3(0.0, -0.05, 0.335), vec3(0.045, 0.06, 0.05)), 0.03);
  vec2 res = vec2(d, 1.0);

  vec3 qe = vec3(abs(q.x - uEye.x), q.y - uEye.y, q.z);
  float eye = sdEll(qe - vec3(0.13, 0.02, 0.312), vec3(0.046, 0.056 * (1.0 - 0.85 * uEye.z), 0.032));
  res = opU(res, vec2(eye, 7.0));
  float by = uEye.y * 0.5;
  float brow = sdCap(qa, vec3(0.075, 0.145 + by, 0.322), vec3(0.195, 0.132 + by, 0.292), 0.017);
  res = opU(res, vec2(brow, 2.0));

  float hair;
  if (id == 0) {
    float cap = sdEll(q - vec3(0.0, 0.025, -0.015), vec3(0.378, 0.405, 0.372));
    float line = mix(-0.16, 0.17, smoothstep(-0.28, 0.12, q.z));
    line -= 0.05 * smoothstep(0.22, 0.34, abs(q.x)) * step(0.0, q.z);
    cap = max(cap, line - q.y);
    vec3 qs = q - vec3(0.07, 0.27, 0.15);
    qs.xy = rot(-0.35) * qs.xy;
    hair = smin(cap, sdEll(qs, vec3(0.27, 0.11, 0.2)), 0.05);
    hair -= 0.004 * sin(q.x * 70.0 + q.z * 20.0);
  } else {
    float cap = sdEll(q - vec3(0.0, 0.02, -0.02), vec3(0.37, 0.395, 0.365));
    float line = mix(-0.12, 0.2, smoothstep(-0.3, 0.1, q.z));
    line += 0.03 * smoothstep(0.2, 0.34, abs(q.x));
    cap = max(cap, line - q.y);
    vec3 c = q * 24.0;
    float curls = sdEll(q - vec3(0.0, 0.31, 0.03), vec3(0.33, 0.17, 0.3)) - 0.016 * sin(c.x) * sin(c.y) * sin(c.z);
    hair = smin(cap, curls, 0.06);
  }
  res = opU(res, vec2(hair, 2.0));

  if (id == 0) {
    vec3 g = qa - vec3(0.135, 0.02, 0.352);
    float ring = sdTor(g.xzy, vec2(0.085, 0.011));
    float bridge = sdCap(q, vec3(-0.052, 0.046, 0.37), vec3(0.052, 0.046, 0.37), 0.009);
    float temple = sdCap(qa, vec3(0.218, 0.03, 0.34), vec3(0.345, 0.05, 0.02), 0.009);
    res = opU(res, vec2(min(min(ring, bridge), temple), 8.0));
  }
  return res;
}

vec2 bodySDF(vec3 p) {
  vec3 t = transpose(uTorsoM) * (p - uJ[0]);
  float belly = sdEll(t - vec3(0.0, 0.13, 0.0), vec3(0.27, 0.22, 0.195));
  float chest = sdEll(t - vec3(0.0, 0.36, 0.0), vec3(0.31, 0.2, 0.2));
  float shoulders = sdCap(t, vec3(-0.21, 0.455, -0.01), vec3(0.21, 0.455, -0.01), 0.11);
  float hips = sdEll(t, vec3(0.25, 0.13, 0.19));
  float torso = smin(smin(belly, chest, 0.1), shoulders, 0.08);
  torso = smin(torso, hips, 0.06);
  vec2 res = vec2(torso, t.y < 0.035 ? 4.0 : (t.y < 0.085 ? 9.0 : 3.0));

  vec3 h = t - vec3(0.0, 0.5, -0.02);
  h.yz = rot(0.25) * h.yz;
  res = opSU(res, vec2(sdTor(h, vec2(0.19, 0.075)), 3.0), 0.03);
  vec3 ts = vec3(abs(t.x), t.y, t.z);
  res = opU(res, vec2(sdCap(ts, vec3(0.07, 0.47, 0.17), vec3(0.085, 0.27, 0.215), 0.012), 6.0));

  float neck = sdCap(p, uJ[1], uHeadP + uHeadM * vec3(0.0, -0.3, -0.02), 0.088);
  res = opSU(res, vec2(neck, 1.0), 0.02);

  for (int s = 0; s < 2; s++) {
    vec3 a = uJ[2 + s * 3];
    vec3 e = uJ[3 + s * 3];
    vec3 w = uJ[4 + s * 3];
    float arm = smin(sdCap(p, a, e, 0.078), sdCap(p, e, w, 0.07), 0.03);
    vec3 ew = w - e;
    float along = clamp(dot(p - e, ew) / dot(ew, ew), 0.0, 1.0);
    res = opSU(res, vec2(arm, along > 0.8 ? 9.0 : 3.0), 0.05);
    vec3 hd = normalize(ew);
    res = opSU(res, vec2(sdEll(p - (w + hd * 0.045), vec3(0.075, 0.08, 0.07)), 1.0), 0.02);
  }

  if (uLegs == 1) {
    float cy = cos(uFootYaw), sy = sin(uFootYaw);
    for (int s = 0; s < 2; s++) {
      vec3 hp = uJ[8 + s * 3];
      vec3 kn = uJ[9 + s * 3];
      vec3 ft = uJ[10 + s * 3];
      float leg = smin(sdCap(p, hp, kn, 0.098), sdCap(p, kn, ft, 0.086), 0.03);
      res = opSU(res, vec2(leg, 4.0), 0.04);
      vec3 f = p - ft;
      f = vec3(cy * f.x - sy * f.z, f.y, sy * f.x + cy * f.z);
      f -= vec3(0.0, -0.035, 0.06);
      res = opU(res, vec2(sdEll(f, vec3(0.1, 0.075, 0.16)), 5.0));
      res = opU(res, vec2(sdRBox(f - vec3(0.0, -0.05, 0.0), vec3(0.098, 0.022, 0.158), 0.02), 6.0));
    }
  }
  return res;
}

vec2 map(vec3 p) {
  vec2 res = bodySDF(p);
  if (length(p - uHeadP) - 0.66 < res.x) {
    vec3 q = transpose(uHeadM) * (p - uHeadP);
    vec2 h;
    if (uMorph <= 0.001) h = headSDF(q, 0);
    else if (uMorph >= 0.999) h = headSDF(q, 1);
    else {
      vec2 a = headSDF(q, 0);
      vec2 b = headSDF(q, 1);
      h = vec2(mix(a.x, b.x, uMorph), uMorph < 0.5 ? a.y : b.y);
    }
    res = opSU(res, h, 0.012);
  }
  if (uWobble > 0.0) {
    res.x += uWobble * 0.03 * sin(p.x * 9.0 + uTime * 3.1) * sin(p.y * 7.0 - uTime * 2.3) * sin(p.z * 8.0 + uTime * 2.7);
  }
  return res;
}

vec3 calcNormal(vec3 p) {
  const float e = 0.0012;
  vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * e).x + k.yyx * map(p + k.yyx * e).x +
                   k.yxy * map(p + k.yxy * e).x + k.xxx * map(p + k.xxx * e).x);
}
float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0, t = 0.03;
  int n = uQuality == 1 ? 26 : 12;
  for (int i = 0; i < 26; i++) {
    if (i >= n) break;
    float h = map(ro + rd * t).x;
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.025, 0.22);
    if (res < 0.004 || t > 2.2) break;
  }
  return clamp(res, 0.0, 1.0);
}
float calcAO(vec3 p, vec3 n) {
  float occ = 0.0, sca = 1.0;
  int k = uQuality == 1 ? 5 : 3;
  for (int i = 0; i < 5; i++) {
    if (i >= k) break;
    float h = 0.015 + 0.1 * float(i) / 4.0;
    occ += (h - map(p + n * h).x) * sca;
    sca *= 0.8;
  }
  return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
}

vec3 albedo(float m, float k) {
  if (m < 1.5) return mix(uSkin[0], uSkin[1], k);
  if (m < 2.5) return vec3(0.014, 0.011, 0.01);
  if (m < 3.5) return mix(uHood[0], uHood[1], k);
  if (m < 4.5) return mix(uPants[0], uPants[1], k);
  if (m < 5.5) return mix(uShoe[0], uShoe[1], k);
  if (m < 6.5) return mix(uTrim[0], uTrim[1], k);
  if (m < 7.5) return vec3(0.005);
  if (m < 8.5) return vec3(0.03, 0.02, 0.014);
  return mix(uHood[0], uHood[1], k) * 0.62;
}
void matProps(float m, out float ks, out float pw, out float sheen) {
  ks = 0.08; pw = 16.0; sheen = 0.0;
  if (m < 1.5) { ks = 0.22; pw = 22.0; }
  else if (m < 2.5) { ks = 0.32; pw = 34.0; }
  else if (m < 3.5) { ks = 0.04; pw = 8.0; sheen = 0.5; }
  else if (m < 4.5) { ks = 0.05; pw = 10.0; sheen = 0.25; }
  else if (m < 5.5) { ks = 0.25; pw = 30.0; }
  else if (m < 6.5) { ks = 0.12; pw = 18.0; }
  else if (m < 7.5) { ks = 1.4; pw = 140.0; }
  else if (m < 8.5) { ks = 1.0; pw = 90.0; }
  else { ks = 0.04; pw = 8.0; sheen = 0.5; }
}
vec3 decal(vec3 col, float m, vec3 p, float k) {
  if (m > 1.5) return col;
  vec3 q = transpose(uHeadM) * (p - uHeadP);
  if (q.z < 0.04 || length(q) > 0.6) return col;
  vec2 mq = q.xy - vec2(0.0, -0.065);
  float ang = atan(mq.y, mq.x);
  float arc = abs(length(mq) - 0.1);
  float onArc = step(-2.55, ang) * step(ang, -0.6);
  float mouth = (1.0 - smoothstep(0.008, 0.012, arc)) * onArc;
  // founder B: short stubble along the jaw, chin and upper lip, clear of the mouth
  if (k > 0.0) {
    float top = mix(-0.15, 0.01, smoothstep(0.1, 0.3, abs(q.x)));
    float jaw = 1.0 - smoothstep(top - 0.025, top + 0.025, q.y);
    vec2 lip = (q.xy - vec2(0.0, -0.1)) / vec2(0.105, 0.028);
    float upper = 1.0 - smoothstep(0.8, 1.0, length(lip));
    float clear = 1.0 - (1.0 - smoothstep(0.012, 0.03, arc)) * onArc;
    float grain = 0.7 + 0.3 * fract(sin(dot(floor(q.xy * 260.0), vec2(12.9898, 78.233))) * 43758.5453);
    float st = max(jaw, upper) * clear * k * smoothstep(0.04, 0.12, q.z);
    col = mix(col, col * 0.32, st * 0.8 * grain);
  }
  if (q.z > 0.12) {
    vec2 cq = vec2(abs(q.x), q.y) - vec2(0.19, -0.1);
    col = mix(col, col * vec3(1.15, 0.82, 0.78), 0.4 * (1.0 - smoothstep(0.0, 0.08, length(cq))) * (1.0 - 0.7 * k));
  }
  return mix(col, vec3(0.09, 0.025, 0.02), mouth * step(0.12, q.z));
}
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = vUv * uRes;
  vec2 uv = (2.0 * frag - uRes) / uRes.y;
  vec3 ro = uCamPos;
  vec3 fw = normalize(uCamTarget - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(fw / tan(0.5 * uFov) + rt * uv.x + up * uv.y);

  vec2 g = vUv - vec2(0.5, 0.62);
  vec3 bgc = mix(uBgBot, uBgTop, vUv.y) + uBgGlow * exp(-5.0 * dot(g, g));
  vec4 bg = vec4(bgc, 1.0) * uBgAlpha;

  vec3 oc = ro - uBound.xyz;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uBound.w * uBound.w;
  float disc = b * b - c;
  if (disc < 0.0) { outColor = uMode == 1 ? vec4(0.0) : bg; return; }
  disc = sqrt(disc);
  float t = max(-b - disc, 0.0);
  float tmax = -b + disc;
  float m = -1.0;
  float stepK = uWobble > 0.0 ? 0.7 : 0.9;
  for (int i = 0; i < 140; i++) {
    vec2 r = map(ro + rd * t);
    if (r.x < 0.0006 * t) { m = r.y; break; }
    t += r.x * stepK;
    if (t > tmax) break;
  }
  if (m < 0.0) { outColor = uMode == 1 ? vec4(0.0) : bg; return; }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  if (uMode == 1) {
    outColor = vec4(clamp(0.5 + (p.z - uBound.z) * 0.9, 0.0, 1.0), n.z * 0.5 + 0.5, n.y * 0.5 + 0.5, 1.0);
    return;
  }

  float k = smoothstep(0.25, 0.75, uMorph);
  vec3 alb = decal(albedo(m, k), m, p, k);
  float ks, pw, sheen;
  matProps(m, ks, pw, sheen);

  vec3 L1 = normalize(vec3(-0.55, 0.75, 0.62));
  vec3 L2 = normalize(vec3(0.85, 0.2, 0.45));
  vec3 L3 = normalize(vec3(0.35, 0.45, -0.85));
  float d1 = dot(n, L1);
  float dif1 = m < 1.5 ? clamp((d1 + 0.35) / 1.35, 0.0, 1.0) : clamp(d1, 0.0, 1.0);
  float sh = dif1 > 0.0 ? softShadow(p + n * 0.004, L1) : 0.0;
  float occ = calcAO(p, n);
  float dif2 = clamp(dot(n, L2), 0.0, 1.0);
  float fres = clamp(1.0 + dot(n, rd), 0.0, 1.0);
  float rim = pow(fres, 3.0) * clamp(dot(n, L3) * 0.5 + 0.6, 0.0, 1.0);
  vec3 hal = normalize(L1 - rd);
  float spe = pow(clamp(dot(n, hal), 0.0, 1.0), pw) * ks * dif1 * sh;

  vec3 sky = mix(uGround, uSky, 0.5 + 0.5 * n.y);
  vec3 col = alb * (uKey * 1.25 * dif1 * sh + vec3(0.6, 0.7, 0.95) * 0.32 * dif2 + sky * 0.55 * occ);
  if (m < 1.5) col += alb * vec3(0.55, 0.18, 0.12) * 0.25 * clamp(1.0 - abs(d1) * 2.0, 0.0, 1.0);
  col += uRim * rim * 0.65 * occ;
  col += sheen * alb * fres * fres * 0.6;
  col += spe * vec3(1.0, 0.97, 0.92);
  if (m > 6.5 && m < 7.5) col += pow(clamp(dot(n, normalize(L2 - rd)), 0.0, 1.0), 200.0) * 0.8;
  col = pow(aces(col), vec3(1.0 / 2.2));
  outColor = vec4(col, 1.0);
}`;

  /* ---------------- looks ---------------- */
  const lin = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.pow(c / 255, 2.2));
  };
  const srgb = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  };
  const BASE_LOOK = {
    skin: ['#B9825F', '#A26C4B'],
    hood: ['#2E6B57', '#C8562D'],
    pants: ['#262A31', '#2B2F38'],
    trim: ['#F1EFEA', '#F1EFEA'],
    shoe: ['#EDEDEA', '#EDEDEA'],
    key: '#FFF4E6',
    rim: '#9FC7FF',
    sky: '#DCE6F5',
    ground: '#5A4D44',
    bgTop: '#20242B',
    bgBot: '#0E1013',
    bgGlow: '#000000',
  };

  const CAMERAS = {
    bust: { pos: [0, 1.56, 4.2], target: [0, 1.56, 0], fov: 21, bound: [0, 1.5, 0, 0.98] },
    sprite: { pos: [0, 1.05, 7], target: [0, 1.05, 0], fov: 22, bound: [0, 1.05, 0, 1.45] },
  };

  // Where a figure-space point lands in a frame rendered with this camera: [u, v] in 0..1 from top-left.
  function project(cam, pt, aspect = 1) {
    const t = Math.tan((cam.fov * Math.PI) / 360);
    const z = cam.pos[2] - pt[2];
    return [0.5 + (0.5 * (pt[0] - cam.pos[0])) / (z * t * aspect), 0.5 - (0.5 * (pt[1] - cam.target[1])) / (z * t)];
  }

  const UNIFORMS = ['uRes', 'uCamPos', 'uCamTarget', 'uFov', 'uBound', 'uMorph', 'uWobble', 'uTime', 'uMode', 'uLegs', 'uQuality',
    'uBgTop', 'uBgBot', 'uBgGlow', 'uBgAlpha', 'uRim', 'uSky', 'uGround', 'uKey', 'uHood', 'uPants', 'uTrim', 'uSkin', 'uShoe',
    'uEye', 'uHeadM', 'uHeadP', 'uTorsoM', 'uFootYaw', 'uJ'];

  class Renderer {
    constructor(canvas, opts = {}) {
      this.canvas = canvas || document.createElement('canvas');
      const gl = this.canvas.getContext('webgl2', {
        alpha: true, premultipliedAlpha: true, antialias: false,
        preserveDrawingBuffer: !!opts.preserve, powerPreference: 'high-performance',
      });
      if (!gl) throw new Error('WebGL2 is not available');
      this.gl = gl;
      this.prog = link(gl, VERT, FRAG);
      this.vao = fullscreenTriangle(gl);
      this.u = uniforms(gl, this.prog, UNIFORMS);
      this.setLook(opts.look || {});
      this.setCamera(opts.camera || CAMERAS.bust);
      this.setPose(build(POSES.bust()));
    }
    setLook(look) {
      this.look = Object.assign({}, BASE_LOOK, look);
      return this;
    }
    setCamera(cam) { this.cam = cam; return this; }
    setPose(pose) { this.pose = pose; return this; }
    draw(w, h, s = {}) {
      const gl = this.gl, u = this.u, L = this.look, P = this.pose, C = this.cam;
      if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.useProgram(this.prog);
      gl.uniform2f(u.uRes, w, h);
      gl.uniform3fv(u.uCamPos, C.pos);
      gl.uniform3fv(u.uCamTarget, C.target);
      gl.uniform1f(u.uFov, (C.fov * Math.PI) / 180);
      gl.uniform4fv(u.uBound, C.bound);
      gl.uniform1f(u.uMorph, s.morph || 0);
      gl.uniform1f(u.uWobble, s.wobble || 0);
      gl.uniform1f(u.uTime, s.time || 0);
      gl.uniform1i(u.uMode, s.mode || 0);
      gl.uniform1i(u.uLegs, P.legs && s.legs !== false ? 1 : 0);
      gl.uniform1i(u.uQuality, s.quality == null ? 1 : s.quality);
      gl.uniform3fv(u.uBgTop, srgb(L.bgTop));
      gl.uniform3fv(u.uBgBot, srgb(L.bgBot));
      gl.uniform3fv(u.uBgGlow, srgb(L.bgGlow));
      gl.uniform1f(u.uBgAlpha, s.bgAlpha == null ? 1 : s.bgAlpha);
      gl.uniform3fv(u.uRim, lin(L.rim));
      gl.uniform3fv(u.uSky, lin(L.sky));
      gl.uniform3fv(u.uGround, lin(L.ground));
      gl.uniform3fv(u.uKey, lin(L.key));
      gl.uniform3fv(u.uHood, [...lin(L.hood[0]), ...lin(L.hood[1])]);
      gl.uniform3fv(u.uPants, [...lin(L.pants[0]), ...lin(L.pants[1])]);
      gl.uniform3fv(u.uTrim, [...lin(L.trim[0]), ...lin(L.trim[1])]);
      gl.uniform3fv(u.uSkin, [...lin(L.skin[0]), ...lin(L.skin[1])]);
      gl.uniform3fv(u.uShoe, [...lin(L.shoe[0]), ...lin(L.shoe[1])]);
      gl.uniform3fv(u.uEye, s.eye || [0, 0, 0]);
      gl.uniformMatrix3fv(u.uHeadM, false, colMajor(P.headM));
      gl.uniform3fv(u.uHeadP, P.headP);
      gl.uniformMatrix3fv(u.uTorsoM, false, colMajor(P.torsoM));
      gl.uniform1f(u.uFootYaw, P.footYaw);
      gl.uniform3fv(u.uJ, P.J.flat());
      gl.bindVertexArray(this.vao);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    // Render at w*ss by h*ss and copy into a new 2D canvas of w by h (supersampled edges).
    snapshot(w, h, ss, s) {
      const W = Math.round(w * ss), H = Math.round(h * ss);
      this.draw(W, H, s);
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.canvas, 0, 0, W, H, 0, 0, w, h);
      return out;
    }
  }

  /* ---------------- baking ---------------- */
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  let baker = null;
  function getBaker() {
    if (!baker) baker = new Renderer(null, { preserve: true });
    return baker;
  }

  // Both founders in the same pose and framing, so a swap between them lines up.
  async function portraits(look, opts = {}) {
    const w = opts.w || 720, h = opts.h || 900, ss = opts.ss || 1.5;
    const r = getBaker().setLook(look).setCamera(opts.camera || CAMERAS.bust).setPose(build(opts.pose || POSES.bust()));
    const out = {};
    for (const [key, morph] of [['A', 0], ['B', 1]]) {
      out[key] = r.snapshot(w, h, ss, { morph, legs: false, bgAlpha: opts.transparent ? 0 : 1 });
      if (opts.depth) out['depth' + key] = r.snapshot(opts.depthW || 240, opts.depthH || 300, 1, { morph, legs: false, mode: 1 });
      await nextFrame();
    }
    return out;
  }

  const SPRITE_SET = {
    climb: { n: 8, pose: (i, n) => POSES.climb((i / n) * TAU) },
    walk: { n: 8, pose: (i, n) => POSES.walk((i / n) * TAU) },
    sit: { n: 6, pose: (i, n) => POSES.sit((i / n) * TAU) },
    wave: { n: 6, pose: (i, n) => POSES.wave((i / n) * TAU) },
    peek: { n: 3, pose: (i) => POSES.peek(i - 1) },
    point: { n: 1, pose: () => POSES.point() },
    stand: { n: 1, pose: () => POSES.stand() },
  };

  // Every animated pose for both founders, plus where the rope, seat, edge and floor fall in a frame.
  async function sprites(look, opts = {}) {
    const size = opts.size || 256;
    const cam = CAMERAS.sprite;
    const r = getBaker().setLook(look).setCamera(cam);
    const out = { size, A: {}, B: {} };
    let done = 0;
    for (const [key, morph] of [['A', 0], ['B', 1]]) {
      for (const [name, def] of Object.entries(SPRITE_SET)) {
        out[key][name] = [];
        for (let i = 0; i < def.n; i++) {
          r.setPose(build(def.pose(i, def.n)));
          out[key][name].push(r.snapshot(size, size, 2, { morph, bgAlpha: 0 }));
          if (++done % 4 === 0) await nextFrame();
        }
      }
    }
    const climb = build(POSES.climb(0));
    const hands = scale(add(climb.J[4], climb.J[7]), 0.5);
    out.anchors = {
      floor: project(cam, [0, 0, 0])[1],
      seat: project(cam, [0, 0.52, 0.1])[1],
      edge: project(cam, [0, 1.36, 0.3])[1],
      rope: project(cam, hands)[0],
      head: project(cam, [0, 2.1, 0])[1],
    };
    return out;
  }

  SQ.Founders = {
    supported: (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })(),
    Renderer, build, POSES, CAMERAS, euler, project, portraits, sprites,
    names: { A: 'Saksham Srivastava', B: 'Shivam Jha' },
  };

export default SQ;
