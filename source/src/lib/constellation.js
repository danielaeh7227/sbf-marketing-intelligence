// Constellation: faint dots behind the home screen, linked to their near neighbours.
// With a sphere to follow, the dots gather in orbits around it, turn with it, and every so often
// one reaches in and links to a member dot on the sphere's near face, then lets go.
import { REDUCED } from './dotfield.js';

const TAU = Math.PI * 2;
const MAX_TETHERS = 7;

export class Constellation {
  // sphere(): null, or { x, y, r, dx, dy, dots: [{ px, py, front }] }; dot positions are offset by dx, dy into this canvas
  constructor(canvas, { density = 9000, link = 170, sphere = null } = {}) {
    this.cv = canvas; this.cx = canvas.getContext('2d'); this.density = density; this.link = link; this.sphere = sphere;
    this.nodes = []; this.tethers = []; this.nextTether = 0;
    this.frame = this.frame.bind(this); this.resize = this.resize.bind(this);
    this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  resize() {
    const r = this.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height; this.cv.width = r.width * d; this.cv.height = r.height * d;
    this.cx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.max(40, Math.min(150, Math.round(this.w * this.h / this.density)));
    while (this.nodes.length < n) this.nodes.push(this.spawn());
    this.nodes.length = n;
    if (REDUCED) this.frame(0);
  }

  // Each dot has an orbit: a distance from the sphere's rim (most sit close) and an angle that turns slowly
  spawn() {
    const q = Math.random();
    return { x: Math.random() * this.w, y: Math.random() * this.h, orbit: Math.pow(q, 2.4), ang: Math.random() * TAU, tilt: .55 + Math.random() * .4,
      wob: Math.random() * TAU, vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16,
      r: 1 + Math.random() * 1.8 * (1 - q * .5), ph: Math.random() * TAU, sp: .12 + Math.random() * .3 };
  }

  frame(now) {
    if (this.dead) return;
    const { cx, w, h, nodes, link } = this, t = now / 1000, L2 = link * link;
    const S = this.sphere ? this.sphere() : null;
    cx.clearRect(0, 0, w, h);

    for (const p of nodes) {
      if (S) {
        // orbit the sphere: inner orbits turn faster, like the sphere's own spin; the ring is flattened so it reads as 3D
        const far = Math.max(w, h) * .6, rad = S.r * 1.08 + p.orbit * (far - S.r);
        if (!REDUCED) p.ang += (.0009 + .0016 * (1 - p.orbit)) ;
        const tx = S.x + Math.cos(p.ang) * rad, ty = S.y + Math.sin(p.ang) * rad * p.tilt + Math.sin(t * .4 + p.wob) * 6;
        // ease toward the orbit, so a resize or the sign-in morph never snaps
        p.x += (tx - p.x) * .04; p.y += (ty - p.y) * .04;
      } else {
        if (!REDUCED) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
      }
      p.a = REDUCED ? .55 : Math.pow(Math.min(1, Math.max(0, Math.sin(t * p.sp + p.ph) * .8 + .35)), 1.4) * .9; // each dot fades out for a spell, so the field keeps changing
      if (S) { const d = Math.hypot(p.x - S.x, p.y - S.y); if (d < S.r * 1.04) p.a *= .2; } // never sit on top of the sphere
    }

    cx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]; if (a.a < .02) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]; if (b.a < .02) continue;
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > L2) continue;
        cx.strokeStyle = `rgba(0,176,216,${Math.min(a.a, b.a) * (1 - Math.sqrt(d2) / link) * .6})`;
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
      }
    }

    if (S && S.dots.length && !REDUCED) this.tether(S, t);

    for (const p of nodes) {
      if (p.a < .02) continue;
      cx.fillStyle = `rgba(120,214,240,${p.a})`; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.fill();
    }
    if (!REDUCED) this.raf = requestAnimationFrame(this.frame);
  }

  // Intermittent links into the sphere: a visible dot near the rim reaches the nearest front-facing member dot on its side
  tether(S, t) {
    const { cx } = this;
    if (t > this.nextTether && this.tethers.length < MAX_TETHERS) {
      this.nextTether = t + .35 + Math.random() * .9;
      const near = this.nodes.filter(p => p.a > .35 && !this.tethers.some(x => x.node === p) && Math.hypot(p.x - S.x, p.y - S.y) < S.r * 1.7);
      const node = near[Math.floor(Math.random() * near.length)];
      if (node) {
        const ux = node.x - S.x, uy = node.y - S.y, ul = Math.hypot(ux, uy) || 1;
        let best = -1, score = -1;
        for (let i = 0; i < S.dots.length; i++) {
          const d = S.dots[i]; if (d.front < .55) continue;
          const vx = d.px + S.dx - S.x, vy = d.py + S.dy - S.y, vl = Math.hypot(vx, vy) || 1;
          const sc = (ux * vx + uy * vy) / (ul * vl) * .8 + d.front * .5 + Math.random() * .5; // on the node's side, on the near face
          if (sc > score) { score = sc; best = i; }
        }
        if (best >= 0) this.tethers.push({ node, dot: best, born: t, life: 2.2 + Math.random() * 1.6 });
      }
    }
    this.tethers = this.tethers.filter(x => t - x.born < x.life);
    for (const x of this.tethers) {
      const p = S.dots[x.dot]; if (!p) continue;
      const d = { px: p.px + S.dx, py: p.py + S.dy, front: p.front };
      const q = (t - x.born) / x.life, env = Math.sin(Math.PI * q) * Math.min(1, d.front * 1.6 - .5); // fades in, holds, fades out; lets go as the dot turns away
      if (env <= .01) continue;
      const g = cx.createLinearGradient(x.node.x, x.node.y, d.px, d.py);
      g.addColorStop(0, `rgba(120,214,240,${.6 * env})`); g.addColorStop(1, `rgba(140,226,248,${.95 * env})`);
      cx.strokeStyle = g; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(x.node.x, x.node.y); cx.lineTo(d.px, d.py); cx.stroke();
      // a pulse travels from the dot into the sphere
      const k = Math.min(1, q * 1.8), px = x.node.x + (d.px - x.node.x) * k, py = x.node.y + (d.py - x.node.y) * k;
      cx.fillStyle = `rgba(190,240,255,${env})`; cx.beginPath(); cx.arc(px, py, 1.8, 0, TAU); cx.fill();
      cx.strokeStyle = `rgba(160,232,250,${.8 * env})`; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(d.px, d.py, 5 + 4 * q, 0, TAU); cx.stroke();
      cx.fillStyle = `rgba(120,214,240,${.25 * env})`; cx.beginPath(); cx.arc(x.node.x, x.node.y, 5, 0, TAU); cx.fill(); // the reaching dot glows
    }
    cx.lineWidth = 1;
  }

  destroy() { this.dead = true; cancelAnimationFrame(this.raf); this.ro.disconnect(); }
}
