// DotField: one canvas, two shapes, no framework.
//   wave    a sea of uniform dots rolling in perspective (login)
//   sphere  the same dots rolled into a globe; each dot is a member, sized and coloured by activity (home)
// morph(): the wave rolls up into the sphere, left to right. Pointer lifts the wave; dragging spins the sphere.
// Points: [{ size: 0..1, tone: 'hi'|'mid'|'lo', data }]. Framework-agnostic so it ports to React as is.
// sea: the wave's camera. span = width, near/depth = distance to the first row and how far back it runs,
//      height = how far the eye sits above the water, horizon = where the eye line sits (0 top, 1 bottom),
//      curve > 1 packs more rows toward the viewer.
export const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const DOT_TONES = { hi: [61, 214, 140], mid: [0, 176, 216], lo: [245, 162, 58], wave: [92, 205, 232] };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const SEA_DEFAULT = { span: 3.6, near: 1.2, depth: 3.2, height: .36, horizon: .5, curve: 1 };

export class DotField {
  constructor(canvas, { points, shape = 'wave', onHover, onPick, scale = 1, sea }) {
    this.cv = canvas; this.cx = canvas.getContext('2d'); this.sea = { ...SEA_DEFAULT, ...sea };
    this.onHover = onHover; this.onPick = onPick; this.scale = scale;
    this.t = 0; this.k = shape === 'sphere' ? 1 : 0; this.kTarget = this.k; this.morphStart = 0; this.morphDur = 2600;
    this.rotY = 0.6; this.rotX = -0.32; this.spin = 0.0016; this.spinK = 1; this.vx = 0; this.vy = 0;
    this.focus = null; this.hover = -1; this.spot = -1; this.turn = null; this.ptr = null; this.drag = null;
    this.setPoints(points);
    this.resize = this.resize.bind(this); this.frame = this.frame.bind(this);
    this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas);
    this.bind(); this.resize();
    this.visible = true;
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.kick(); });
    this.io.observe(canvas);
    this.onVis = () => document.hidden || this.kick(); document.addEventListener('visibilitychange', this.onVis);
    this.kick();
  }

  setPoints(points) {
    const n = points.length;
    this.cols = Math.round(Math.sqrt(n * 2.6)); this.rows = Math.ceil(n / this.cols);
    this.pts = points.map((p, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = GOLDEN * i;
      const col = i % this.cols, row = Math.floor(i / this.cols);
      return { ...p, i, sx: Math.cos(th) * r, sy: y, sz: Math.sin(th) * r,
        u: col / (this.cols - 1), v: row / Math.max(1, this.rows - 1), delay: (col / this.cols) * .45 + Math.random() * .12 };
    });
  }

  resize() {
    const r = this.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height; this.cv.width = r.width * d; this.cv.height = r.height * d;
    this.cx.setTransform(d, 0, 0, d, 0, 0); this.kick();
  }

  bind() {
    const c = this.cv;
    this.onMove = e => {
      if (this.spot >= 0) { this.spot = -1; this.turn = null; } // the pointer takes over from the spotlight
      const r = c.getBoundingClientRect(); this.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (this.drag) { const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y; this.vx = dx * .004; this.vy = dy * .004; this.rotY += dx * .006; this.rotX = Math.max(-1.2, Math.min(1.2, this.rotX + dy * .006)); this.drag = { x: e.clientX, y: e.clientY, moved: this.drag.moved + Math.abs(dx) + Math.abs(dy) }; }
      this.kick();
    };
    this.onLeave = () => { this.ptr = null; this.setHover(-1); };
    this.onDown = e => { if (this.k > .9) { this.drag = { x: e.clientX, y: e.clientY, moved: 0 }; c.setPointerCapture?.(e.pointerId); } };
    this.onUp = () => {
      const d = this.drag; this.drag = null;
      if (d && d.moved < 6 && this.hover >= 0 && this.onPick) this.onPick(this.pts[this.hover].data);
    };
    c.addEventListener('pointermove', this.onMove); c.addEventListener('pointerleave', this.onLeave);
    c.addEventListener('pointerdown', this.onDown); c.addEventListener('pointerup', this.onUp);
  }

  // Roll the wave up into the sphere (or back)
  morph(to = 1, dur = 2600) { this.kFrom = this.k; this.kTarget = to; this.morphStart = performance.now(); this.morphDur = REDUCED ? 1 : dur; this.kick(); }
  setFocus(tone) { this.focus = tone; this.kick(); }

  // Turn the sphere so dot i faces the viewer, and hold it there (i < 0 lets go)
  spotlight(i) {
    if (i === this.spot) return;
    this.spot = i; this.turn = null;
    if (i < 0) { this.setHover(-1); return; }
    const p = this.pts[i], r = Math.hypot(p.sx, p.sz);
    this.turn = { y: Math.atan2(-p.sx, -p.sz), x: Math.max(-1.2, Math.min(1.2, Math.atan2(-p.sy, r))) };
    if (REDUCED) { this.rotY = this.turn.y; this.rotX = this.turn.x; }
    this.setHover(i); this.kick();
  }

  setHover(i) {
    if (i === this.hover) return; this.hover = i;
    this.cv.style.cursor = i >= 0 ? 'pointer' : this.k > .9 ? 'grab' : '';
    if (this.onHover) {
      const p = this.pts[i];
      this.onHover(i >= 0 ? { data: p.data, x: p.px, y: p.py, r: p.pr } : null);
    }
  }

  kick() { if (!this.raf && !this.dead) this.raf = requestAnimationFrame(this.frame); }

  frame(now) {
    this.raf = 0;
    if (this.dead) return;
    const { cx, w, h } = this; if (!w || !h) return;
    if (this.kTarget !== this.k) {
      const q = Math.min(1, (now - this.morphStart) / this.morphDur);
      this.k = this.kFrom + (this.kTarget - this.kFrom) * q; if (q >= 1) this.k = this.kTarget;
    }
    if (!REDUCED) this.t += 1 / 60;
    // hovering a dot eases the spin to a stop so the dot stays under the pointer; leaving eases it back
    this.spinK += ((this.hover >= 0 ? 0 : 1) - this.spinK) * .09;
    if (!this.drag && !REDUCED) { this.rotY += this.spin * this.spinK + this.vx; this.vx *= .94; this.vy *= .94; }
    if (this.turn && !REDUCED) { // glide to the spotlighted dot along the shortest way round
      const dy = this.turn.y - this.rotY; this.rotY += Math.atan2(Math.sin(dy), Math.cos(dy)) * .1; this.rotX += (this.turn.x - this.rotX) * .1;
    }

    cx.clearRect(0, 0, w, h);
    const t = this.t, K = this.k, s = Math.min(w, h), f = s * 1.05 * this.scale, ox = w / 2, oy = h / 2;
    const cyR = Math.cos(this.rotY), syR = Math.sin(this.rotY), cxR = Math.cos(this.rotX), sxR = Math.sin(this.rotX);
    const R = .78, dist = 3.1, sea = this.sea, oyW = h * sea.horizon, fW = Math.max(w, h) * 1.05 * this.scale; // the sea scales to the long side so it always bleeds

    // soft halo behind the sphere
    if (K > .05) {
      const g = cx.createRadialGradient(ox, oy, 0, ox, oy, s * .46 * this.scale);
      g.addColorStop(0, `rgba(0,176,216,${.16 * K})`); g.addColorStop(.6, `rgba(0,120,170,${.06 * K})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    }

    const list = this.pts;
    for (const p of list) {
      // wave position: a sheet of dots below the eye line, rolling toward the viewer
      const wx = (p.u - .5) * sea.span, wz = sea.near + Math.pow(p.v, sea.curve) * sea.depth;
      const wy = sea.height + .16 * Math.sin(wx * 1.5 + t * .9) + .11 * Math.sin(wz * 2.1 - t * 1.2) + .05 * Math.sin((wx + wz) * 3.2 + t * 1.6);
      // sphere position
      let x = p.sx * R, y = p.sy * R, z = p.sz * R;
      let x2 = x * cyR - z * syR, z2 = x * syR + z * cyR; let y2 = y * cxR - z2 * sxR; z2 = y * sxR + z2 * cxR;
      const sz = z2 + dist;
      // per-dot progress so the wave rolls up left to right
      const kk = K <= 0 ? 0 : K >= 1 ? 1 : ease(Math.max(0, Math.min(1, (K * 1.6 - p.delay) / 1.0)));
      const X = wx + (x2 - wx) * kk, Y = wy + (y2 - wy) * kk, Z = wz + (sz - wz) * kk;
      const persp = (fW + (f - fW) * kk) / (Z + .0001) * (.55 + .7 * kk); // the sphere sits closer than the sea
      p.px = ox + X * persp; p.py = oyW + (oy - oyW) * kk + Y * persp; p.depth = Z;
      // pointer lifts the wave
      if (this.ptr && kk < .5) {
        const dx = p.px - this.ptr.x, dy = p.py - this.ptr.y, d2 = dx * dx + dy * dy, R2 = 130 * 130;
        if (d2 < R2) p.py -= (1 - d2 / R2) ** 2 * 26 * (1 - kk * 2);
      }
      const front = (1 - z2 / R) / 2; // 1 = nearest
      const waveR = Math.max(.6, 2.3 / Z) * (s / 700);
      const sphR = (2.1 + p.size * 6) * (.55 + front * .6) * (s / 640) * this.scale;
      p.pr = waveR + (sphR - waveR) * kk;
      const waveA = Math.max(.08, Math.min(.85, .99 - p.v * .75)); // fades toward the horizon
      const sphA = p.tone === 'lo' ? .55 + front * .45 : .22 + front * .78; // attention dots stay readable even when small
      p.pa = waveA + (sphA - waveA) * kk; p.kk = kk; p.front = front;
    }
    // painter's order
    const order = K > 0 ? [...list].sort((a, b) => b.depth - a.depth) : list;
    cx.globalCompositeOperation = 'lighter';
    for (const p of order) {
      const base = DOT_TONES.wave, tone = DOT_TONES[p.tone] || base, kk = p.kk;
      const r = Math.round(base[0] + (tone[0] - base[0]) * kk), g = Math.round(base[1] + (tone[1] - base[1]) * kk), b = Math.round(base[2] + (tone[2] - base[2]) * kk);
      let a = p.pa;
      if (this.focus && kk > .5 && p.tone !== this.focus) a *= .18;
      if (kk > .6 && p.size > .7 && p.front > .45) { // glow on the most active
        cx.fillStyle = `rgba(${r},${g},${b},${a * .16})`; cx.beginPath(); cx.arc(p.px, p.py, p.pr * 2.4, 0, 6.283); cx.fill();
      }
      cx.fillStyle = `rgba(${r},${g},${b},${a})`;
      cx.beginPath(); cx.arc(p.px, p.py, p.pr, 0, 6.283); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';

    // where the sphere sits, for the constellation behind it
    if (K > .95) { let m = 0; for (const p of list) { const d = (p.px - ox) ** 2 + (p.py - oy) ** 2; if (d > m) m = d; } this.sphere = { x: ox, y: oy, r: Math.sqrt(m) }; } else this.sphere = null;

    // hit test: nearest front-facing dot under the pointer
    if (this.ptr && K > .9 && !this.drag) {
      let best = -1, bd = 1e9;
      const cur = this.pts[this.hover]; // sticky: keep the hovered dot while it glides to a stop under the pointer
      if (cur && cur.front >= .45 && !(this.focus && cur.tone !== this.focus) && (cur.px - this.ptr.x) ** 2 + (cur.py - this.ptr.y) ** 2 < (cur.pr + 14) ** 2) best = this.hover;
      else for (const p of list) {
        if (p.front < .45 || (this.focus && p.tone !== this.focus)) continue;
        const dx = p.px - this.ptr.x, dy = p.py - this.ptr.y, d = dx * dx + dy * dy, lim = (p.pr + 5) ** 2;
        if (d < lim && d < bd) { bd = d; best = p.i; }
      }
      this.setHover(best);
    }
    if (this.hover >= 0) {
      const p = this.pts[this.hover];
      cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(p.px, p.py, p.pr + 4, 0, 6.283); cx.stroke();
      this.onHover && this.onHover({ data: p.data, x: p.px, y: p.py, r: p.pr });
    }

    const moving = !REDUCED || this.k !== this.kTarget;
    if (moving && this.visible && !document.hidden) this.kick();
  }

  destroy() {
    this.dead = true; cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
    const c = this.cv; c.removeEventListener('pointermove', this.onMove); c.removeEventListener('pointerleave', this.onLeave);
    c.removeEventListener('pointerdown', this.onDown); c.removeEventListener('pointerup', this.onUp);
  }
}
