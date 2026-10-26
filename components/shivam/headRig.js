// Shivam's head, drawn continuously on the GPU.
// The two keyframes of the real sweep around the wanted angle are warped toward it along measured optical
// flow and blended (left and right); the result is shifted by a measured displacement field to tip the head
// up or down; the closed-eye and smile patches ride the same warp. Every display frame is a fresh
// in-between, so the head never steps from one picture to the next.
// Data: public/assets/img/founders/shivam-3d/rig/ (built from the Flow footage and LivePortrait offline).

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uKey;    // keyframes
uniform sampler2DArray uFlow;   // per pair n: layer 2n forward (n to n+1), 2n+1 backward
uniform sampler2DArray uPitch;  // per keyframe n: layers 4n + (0: -12, 1: -6, 2: +6, 3: +12)
uniform sampler2DArray uBlinkT; // per keyframe: the eyes closed
uniform sampler2DArray uSmileT; // per keyframe: layers 2n (a smile), 2n+1 (a bigger one)
uniform vec4 uBlinkRect[32];
uniform vec4 uSmileRect[32];
uniform int uN;
uniform float uT;
uniform float uPitchDeg;
uniform float uBlink;
uniform float uSmile;
uniform vec2 uSize;
uniform float uFlowQ;
uniform float uPitchQ;
in vec2 vUv;
out vec4 outColor;

vec2 decode(vec4 v, float q) { return (v.rg * 255.0 - 128.0) / q / uSize; }

vec2 pitchField(int n, vec2 uv) {
  float a = abs(uPitchDeg);
  if (a < 0.01) return vec2(0.0);
  float lo = float(4 * n + (uPitchDeg < 0.0 ? 1 : 2));
  float hi = float(4 * n + (uPitchDeg < 0.0 ? 0 : 3));
  vec2 f6 = decode(texture(uPitch, vec3(uv, lo)), uPitchQ);
  if (a <= 6.0) return f6 * (a / 6.0);
  vec2 f12 = decode(texture(uPitch, vec3(uv, hi)), uPitchQ);
  return mix(f6, f12, min(1.0, (a - 6.0) / 6.0));
}

vec4 overlay(vec4 c, sampler2DArray tex, vec4 rect, float layer, vec2 uv, float a) {
  if (a <= 0.0) return c;
  vec2 q = (uv - rect.xy) / rect.zw;
  if (q.x <= 0.0 || q.y <= 0.0 || q.x >= 1.0 || q.y >= 1.0) return c;
  vec2 px = min(q, 1.0 - q) * rect.zw * uSize;     // distance to the patch edge, in pixels
  float m = smoothstep(0.0, 22.0, min(px.x, px.y)); // a soft edge so it melts in
  return mix(c, texture(tex, vec3(q, layer)), a * m);
}

vec4 keyAt(int n, vec2 uv) {
  vec4 c = texture(uKey, vec3(uv, float(n)));
  c = overlay(c, uBlinkT, uBlinkRect[n], float(n), uv, uBlink);
  if (uSmile > 0.0) {
    c = overlay(c, uSmileT, uSmileRect[n], float(2 * n), uv, min(uSmile, 1.0));
    c = overlay(c, uSmileT, uSmileRect[n], float(2 * n + 1), uv, clamp(uSmile - 1.0, 0.0, 1.0));
  }
  return c;
}

void main() {
  float t = uT;
  vec2 y = vUv + mix(pitchField(uN, vUv), pitchField(uN + 1, vUv), t);
  vec2 f01 = decode(texture(uFlow, vec3(y, float(2 * uN))), uFlowQ);
  vec2 f10 = decode(texture(uFlow, vec3(y, float(2 * uN + 1))), uFlowQ);
  vec2 ft0 = -(1.0 - t) * t * f01 + t * t * f10;
  vec2 ft1 = (1.0 - t) * (1.0 - t) * f01 - t * (1.0 - t) * f10;
  vec4 c = mix(keyAt(uN, y + ft0), keyAt(uN + 1, y + ft1), t);
  outColor = vec4(c.rgb, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}

async function bitmap(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
}

// one texture array from tiles of an atlas (or from separate images)
function arrayTexture(gl, w, h, layers) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, w, h, layers);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}
async function fillFromAtlas(gl, tex, atlas, tileW, tileH, cols, count, outW, outH) {
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const opts = { premultiplyAlpha: 'none', colorSpaceConversion: 'none' };
    if (outW !== tileW || outH !== tileH) Object.assign(opts, { resizeWidth: outW, resizeHeight: outH, resizeQuality: 'high' });
    const tile = await createImageBitmap(atlas, c * tileW, r * tileH, tileW, tileH, opts);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, outW, outH, 1, gl.RGBA, gl.UNSIGNED_BYTE, tile);
    tile.close();
  }
}

/**
 * createRig(canvas, { base, scale, signal }) -> { render({ yaw, pitch, blink, smile }), resize(w, h), destroy() }
 * base: folder with rig.json and its images. scale: texture size for the photos (1 = full).
 */
export async function createRig(canvas, { base, scale = 1, signal }) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL2 unavailable');
  const meta = await (await fetch(`${base}/rig.json`, { signal })).json();
  const N = meta.frames.length;
  if (N > 32) throw new Error('too many keyframes for the shader');
  const [W, H] = meta.size;

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  gl.useProgram(prog);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  const kw = Math.round(W * scale), kh = Math.round(H * scale);
  const [fw, fh] = meta.flows.tile;
  const [pw, ph] = meta.pitch.tile;
  const [bw, bh] = meta.blink.size;
  const [sw, sh] = meta.smile.size;
  const bwS = Math.max(4, Math.round(bw * scale)), bhS = Math.max(4, Math.round(bh * scale));
  const swS = Math.max(4, Math.round(sw * scale)), shS = Math.max(4, Math.round(sh * scale));
  const tKey = arrayTexture(gl, kw, kh, N);
  const tFlow = arrayTexture(gl, fw, fh, meta.flows.count);
  const tPitch = arrayTexture(gl, pw, ph, meta.pitch.count);
  const tBlink = arrayTexture(gl, bwS, bhS, N * meta.blink.levels);
  const tSmile = arrayTexture(gl, swS, shS, N * meta.smile.levels);

  // fields first (small), then the photos
  const [flows, pitch, blinkA, smileA] = await Promise.all([
    bitmap(`${base}/${meta.flows.file}`, signal), bitmap(`${base}/${meta.pitch.file}`, signal),
    bitmap(`${base}/${meta.blink.file}`, signal), bitmap(`${base}/${meta.smile.file}`, signal),
  ]);
  await fillFromAtlas(gl, tFlow, flows, fw, fh, meta.flows.cols, meta.flows.count, fw, fh);
  await fillFromAtlas(gl, tPitch, pitch, pw, ph, meta.pitch.cols, meta.pitch.count, pw, ph);
  await fillFromAtlas(gl, tBlink, blinkA, bw, bh, meta.blink.cols, N * meta.blink.levels, bwS, bhS);
  await fillFromAtlas(gl, tSmile, smileA, sw, sh, meta.smile.cols, N * meta.smile.levels, swS, shS);
  [flows, pitch, blinkA, smileA].forEach((b) => b.close());
  const keys = await Promise.all(meta.frames.map((_, n) => bitmap(`${base}/k${String(n).padStart(2, '0')}.webp`, signal)));
  for (let n = 0; n < N; n++) {
    let img = keys[n];
    if (scale !== 1) img = await createImageBitmap(keys[n], { resizeWidth: kw, resizeHeight: kh, resizeQuality: 'high', premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tKey);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, n, kw, kh, 1, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (img !== keys[n]) img.close();
    keys[n].close();
  }

  const U = (name) => gl.getUniformLocation(prog, name);
  const units = [['uKey', tKey], ['uFlow', tFlow], ['uPitch', tPitch], ['uBlinkT', tBlink], ['uSmileT', tSmile]];
  units.forEach(([name, tex], i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.uniform1i(U(name), i);
  });
  const rects = (list) => new Float32Array(32 * 4).map((_, k) => (list[Math.floor(k / 4)] ? list[Math.floor(k / 4)][k % 4] : 0));
  gl.uniform4fv(U('uBlinkRect[0]'), rects(meta.blink.rects));
  gl.uniform4fv(U('uSmileRect[0]'), rects(meta.smile.rects));
  gl.uniform2f(U('uSize'), W, H);
  gl.uniform1f(U('uFlowQ'), meta.flows.q);
  gl.uniform1f(U('uPitchQ'), meta.pitch.q);
  const uN = U('uN'), uT = U('uT'), uPitch = U('uPitchDeg'), uBlink = U('uBlink'), uSmile = U('uSmile');
  const yaws = meta.frames.map((_, n) => meta.yaw[n]);
  const ymin = yaws[0], ymax = yaws[N - 1];

  let lost = false;
  const onLost = (e) => { e.preventDefault(); lost = true; };
  canvas.addEventListener('webglcontextlost', onLost);

  return {
    yawRange: [ymin, ymax],
    gl,
    render({ yaw, pitch: p = 0, blink = 0, smile = 0 }) {
      if (lost) return false;
      const y = Math.min(ymax, Math.max(ymin, yaw));
      let n = 0;
      while (n < N - 2 && yaws[n + 1] < y) n++;
      const t = (y - yaws[n]) / (yaws[n + 1] - yaws[n]);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1i(uN, n);
      gl.uniform1f(uT, Math.min(1, Math.max(0, t)));
      gl.uniform1f(uPitch, Math.min(12, Math.max(-12, p)));
      gl.uniform1f(uBlink, blink);
      gl.uniform1f(uSmile, smile);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    },
    destroy() {
      canvas.removeEventListener('webglcontextlost', onLost);
      [tKey, tFlow, tPitch, tBlink, tSmile].forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    },
  };
}
