/* FORK — graph engine: GraphCanvas (camera, growth, labels), LineageGraph (time tree),
   MapGraph (radial families), LineageStack (mobile / list view), mountLineage controller. */
(function () {
  'use strict';
  const D = window.FORK_DATA;
  const { byId, DAY } = D;
  const NOW = +D.SAMPLE_NOW;

  /* ---------------- utils ---------------- */
  const U = {};
  U.$ = (s, r = document) => r.querySelector(s);
  U.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const MQ = matchMedia('(max-width: 759px)');
  U.MQ = MQ;
  U.reduced = () => RM.matches;
  U.mobile = () => MQ.matches;
  const clamp = U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  U.fmtMon = t => { const d = new Date(t); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
  U.fmtDay = t => { const d = new Date(t); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
  U.mon = n => n.approx === 'year' ? '~' + new Date(n.t).getUTCFullYear() : (n.approx ? '~' : '') + U.fmtMon(n.t);
  U.day = n => n.approx ? U.mon(n) : (n.reported ? 'Reported ' : '') + U.fmtDay(n.t);
  U.typeL = t => t.charAt(0) + t.slice(1).toLowerCase();
  U.plat = p => D.PLATFORMS[p] || p;
  U.famName = id => (D.family(id) || {}).name || id;
  U.pct = v => Math.round(v * 100);
  U.age = t => { const y = (NOW - t) / (365.25 * DAY); if (y >= 1) return y.toFixed(1) + ' yr'; const m = (NOW - t) / (30.4 * DAY); return m >= 1 ? Math.round(m) + ' mo' : Math.max(1, Math.round((NOW - t) / DAY)) + ' d'; };
  U.svg = function (tag, attrs, parent) { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  U.announce = msg => { const r = document.getElementById('live-region'); if (r) { r.textContent = ''; setTimeout(() => { r.textContent = msg; }, 30); } };
  U.MARK = '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 20V3.5"/><path d="M9 14.2C9 9.6 15.5 10.4 15.5 6.6"/><circle class="dot" cx="9" cy="20" r="2.4"/><circle class="end" cx="15.5" cy="5" r="1.7"/></svg>';
  U.FORKGLYPH = '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13H22M10 13C15 13 14 5 21 5"/></svg>';

  const mctx = document.createElement('canvas').getContext('2d');
  const tw = (text, font, track) => { mctx.font = font; return mctx.measureText(text).width + (track || 0) * text.length; };
  const F_NM = '400 15px Newsreader, Georgia, serif';
  const F_ROOT = 'italic 400 22px Newsreader, Georgia, serif';
  const F_HUB = '400 30px Newsreader, Georgia, serif';
  const F_MT = '600 9.5px "Schibsted Grotesk", Arial, sans-serif';

  /* bezier helpers (screen space) */
  function bz(P, t) { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; }
  function bzd(P, t) { const u = 1 - t; return [3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]), 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1])]; }
  function split(P, t) { const l = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; const p01 = l(P[0], P[1]), p12 = l(P[1], P[2]), p23 = l(P[2], P[3]); const p012 = l(p01, p12), p123 = l(p12, p23); return [P[0], p01, p012, l(p012, p123)]; }
  const f1 = v => v.toFixed(1);
  function ribbon(Q, w0, w1) {
    const n = 14, L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = bz(Q, t), d = bzd(Q, t), len = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / len, ny = d[0] / len, w = (w0 + (w1 - w0) * t) / 2;
      L.push(f1(p[0] + nx * w) + ',' + f1(p[1] + ny * w)); R.push(f1(p[0] - nx * w) + ',' + f1(p[1] - ny * w));
    }
    return 'M' + L.join('L') + 'L' + R.reverse().join('L') + 'Z';
  }
  const cpath = Q => `M${f1(Q[0][0])},${f1(Q[0][1])}C${f1(Q[1][0])},${f1(Q[1][1])} ${f1(Q[2][0])},${f1(Q[2][1])} ${f1(Q[3][0])},${f1(Q[3][1])}`;
  U.curvePath = cpath;

  /* ---------------- GraphCanvas ---------------- */
  const ALL = new Set();
  class GraphCanvas {
    constructor(host, o) {
      this.host = host; this.o = Object.assign({ minK: .2, maxK: 2.6, wheel: 'modifier' }, o);
      host.classList.add('gc'); host.tabIndex = 0;
      host.setAttribute('role', 'application');
      host.setAttribute('aria-roledescription', 'lineage graph');
      host.setAttribute('aria-label', (this.o.label || 'Lineage graph') + '. Arrow keys move between objects, Enter opens one, plus and minus zoom.');
      this.svg = U.svg('svg', { class: 'gc-svg', 'aria-hidden': 'true' }, host);
      this.gRuler = U.svg('g', { class: 'ruler' }, this.svg);
      this.gThreads = U.svg('g', {}, this.svg);
      this.gEdges = U.svg('g', {}, this.svg);
      this.gMarks = U.svg('g', {}, this.svg);
      this.gNodes = U.svg('g', {}, this.svg);
      this.N = new Map(); this.E = new Map();
      this.cam = { x: 0, y: 0, k: 1 }; this.kFit = 1; this.W = 0; this.H = 0;
      this.camAnim = null; this.raf = 0; this.hover = null; this.sel = null; this.kb = null;
      this.pathSet = new Set();
      this.measure();
      this.ro = new ResizeObserver(() => {
        const was = this.W; this.measure();
        if (!was && this.W && this.pendingFit) { this.pendingFit = false; this.fit(false); }
        this.kick();
      });
      this.ro.observe(host);
      this.bindPointer(); this.bindKeys();
      ALL.add(this);
    }
    destroy() { this.ro.disconnect(); cancelAnimationFrame(this.raf); ALL.delete(this); this.host.innerHTML = ''; this.host.classList.remove('gc', 'has-hl', 'dragging'); this.host.removeAttribute('tabindex'); this.host.removeAttribute('role'); this.destroyed = true; }
    measure() { this.W = this.host.clientWidth; this.H = this.host.clientHeight; }
    kick() { if (!this.raf && !this.destroyed) this.raf = requestAnimationFrame(t => this.frame(t)); }
    frame(now) {
      this.raf = 0;
      if (!this.W || !this.H) return;
      const active = this.step(now);
      this.draw();
      if (active) this.kick();
    }
    sx(x) { return (x - this.cam.x) * this.cam.k + this.W / 2; }
    sy(y) { return (y - this.cam.y) * this.cam.k + this.H / 2; }
    step(now) {
      let active = false;
      for (const n of this.N.values()) {
        if (n.mv) { const p = clamp((now - n.mv.t0) / n.mv.d, 0, 1), e = easeInOut(p); n.x = n.mv.fx + (n.mv.tx - n.mv.fx) * e; n.y = n.mv.fy + (n.mv.ty - n.mv.fy) * e; if (p >= 1) n.mv = null; else active = true; }
        if (n.ap) { const p = clamp((now - n.ap.t0) / n.ap.d, 0, 1); n.alpha = easeOut(p); if (p >= 1) n.ap = null; else active = true; }
      }
      for (const e of this.E.values()) {
        if (!e.an) continue;
        const a = e.an, p = clamp((now - a.t0 - a.delay) / a.d, 0, 1), f = a.to > a.from ? easeOut(p) : easeIn(p);
        e.g = a.from + (a.to - a.from) * f;
        if (p >= 1) { e.an = null; if (e.g <= 0 && e.removing) this.removeEdge(e); } else active = true;
      }
      if (this.camAnim) active = this.stepCam(now) || active;
      if (this.tick) active = this.tick(now) || active;
      return active;
    }
    stepCam(now) {
      const a = this.camAnim, p = a.d ? clamp((now - a.t0) / a.d, 0, 1) : 1, e = easeInOut(p);
      let x, y; const k = a.k0 + (a.k1 - a.k0) * e;
      if (a.pts) {
        const target = e * a.total; let i = 1; while (i < a.lens.length - 1 && a.lens[i] < target) i++;
        const s0 = a.lens[i - 1], s1 = a.lens[i], q = s1 > s0 ? (target - s0) / (s1 - s0) : 1;
        x = a.pts[i - 1][0] + (a.pts[i][0] - a.pts[i - 1][0]) * q; y = a.pts[i - 1][1] + (a.pts[i][1] - a.pts[i - 1][1]) * q;
      } else { x = a.x0 + (a.x1 - a.x0) * e; y = a.y0 + (a.y1 - a.y0) * e; }
      this.cam = { x: x + (a.off || 0) / k, y: y + (a.offy || 0) / k, k };
      if (p >= 1) { this.camAnim = null; const cb = a.done; if (cb) cb(); this.zoomChanged(); return false; }
      return true;
    }
    // world point → camera centre, honouring a horizontal screen offset (inspector)
    // world point (wx, wy) is brought to the focus point: screen centre shifted left by `off` and to the band centre
    bandOffY() { if (!this.band) return 0; const b = this.band(); return (this.H / 2) - (b.top + (this.H - b.top - b.bottom) / 2); }
    flyTo(wx, wy, k, d, off) {
      off = off || 0; d = U.reduced() ? 0 : (d == null ? 650 : d);
      const c = this.cam, offy = this.bandOffY();
      this.camAnim = { x0: c.x - off / c.k, y0: c.y - offy / c.k, x1: wx, y1: wy, k0: c.k, k1: k, t0: performance.now(), d, off, offy };
      this.kick();
    }
    flyPath(pts, k, d, off, done) {
      off = off || 0; const c = this.cam, offy = this.bandOffY();
      const start = [c.x - off / c.k, c.y - offy / c.k];
      pts = [start].concat(pts);
      const lens = [0]; for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      this.camAnim = { pts, lens, total: lens[lens.length - 1] || 1, k0: c.k, k1: k, t0: performance.now(), d: U.reduced() ? 0 : d, off, offy, done };
      this.kick();
    }
    inspOffset() {
      if (U.mobile()) return 0;
      const r = this.host.getBoundingClientRect();
      const iw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--insp-w')) || 388;
      return r.right > window.innerWidth - iw + 20 ? Math.min(iw / 2, this.W / 4) : 0;
    }
    zoomAt(mx, my, f) {
      const c = this.cam, k1 = clamp(c.k * f, this.o.minK * this.kFit, this.o.maxK);
      const wx = c.x + (mx - this.W / 2) / c.k, wy = c.y + (my - this.H / 2) / c.k;
      this.camAnim = null;
      this.cam = { x: wx - (mx - this.W / 2) / k1, y: wy - (my - this.H / 2) / k1, k: k1 };
      this.kick(); this.zoomChanged();
    }
    zoomBy(f) {
      const c = this.cam, k1 = clamp(c.k * f, this.o.minK * this.kFit, this.o.maxK);
      this.camAnim = { x0: c.x, y0: c.y, x1: c.x, y1: c.y, k0: c.k, k1, t0: performance.now(), d: U.reduced() ? 0 : 260 };
      this.kick();
    }
    zoomChanged() { clearTimeout(this.zt); this.zt = setTimeout(() => this.onZoomSettled && this.onZoomSettled(), 140); }

    curveOf(e) {
      const P = this.N.get(e.p), C = this.N.get(e.c);
      if (!P || !C) return null;
      return this.curve(P, C).map(p => [this.sx(p[0]), this.sy(p[1])]);
    }
    draw() {
      const k = this.cam.k, zw = Math.sqrt(clamp(k / this.kFit, .55, 1.8));
      for (const e of this.E.values()) {
        const S = this.curveOf(e);
        if (!S || e.g <= .002) { if (e.on) { e.wrap.style.display = 'none'; if (e.mm) e.mm.style.display = 'none'; e.on = false; } continue; }
        const xs = [S[0][0], S[3][0]], ys = [S[0][1], S[3][1]];
        if (Math.max(...xs) < -40 || Math.min(...xs) > this.W + 40 || Math.max(...ys) < -40 || Math.min(...ys) > this.H + 40) {
          if (e.on) { e.wrap.style.display = 'none'; if (e.mm) e.mm.style.display = 'none'; e.on = false; } continue;
        }
        if (!e.on) { e.wrap.style.display = ''; e.on = true; }
        const Q = e.g >= .999 ? S : split(S, e.g);
        if (e.rib) e.el.setAttribute('d', ribbon(Q, e.w0 * zw, (e.w0 + (e.w1 - e.w0) * e.g) * zw));
        else e.el.setAttribute('d', cpath(Q));
        if (e.g > .95) e.hit.setAttribute('d', cpath(S)); else e.hit.removeAttribute('d');
        if (e.mm) {
          if (e.g > .6) { const p = bz(S, .5), d = bzd(S, .5); e.mm.style.display = ''; e.mm.setAttribute('transform', `translate(${f1(p[0])},${f1(p[1])}) rotate(${f1(Math.atan2(d[1], d[0]) * 57.2958)})`); }
          else e.mm.style.display = 'none';
        }
      }
      for (const n of this.N.values()) {
        const x = this.sx(n.x), y = this.sy(n.y);
        const ie = n.inE ? this.E.get(n.id) : null;
        const alpha = ie ? clamp((ie.g - .8) / .2, 0, 1) : (n.alpha == null ? 1 : n.alpha);
        n.sx = x; n.sy = y; n.vis = alpha > .02 && x > -260 && x < this.W + 260 && y > -60 && y < this.H + 60;
        if (!n.vis) { if (n.shown !== false) { n.el.style.display = 'none'; n.shown = false; } continue; }
        if (n.shown === false) { n.el.style.display = ''; n.shown = true; }
        n.el.setAttribute('transform', `translate(${f1(x)},${f1(y)})`);
        const op = alpha < 1 ? String(alpha) : '';
        if (n.op !== op) { n.el.style.opacity = op; n.op = op; }
      }
      this.placeLabels();
      if (this.drawExtra) this.drawExtra();
    }
    placeLabels() {
      const vis = []; for (const n of this.N.values()) if (n.vis && n.nmEl) vis.push(n);
      vis.sort((a, b) => (b.pri + (this.pathSet.has(b.id) ? 1e5 : 0) + (b.id === this.hover ? 2e5 : 0)) - (a.pri + (this.pathSet.has(a.id) ? 1e5 : 0) + (a.id === this.hover ? 2e5 : 0)));
      const boxes = [];
      const hit = b => { for (const o of boxes) if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true; return false; };
      const limit = this.labelLimit ? this.labelLimit() : -Infinity;
      for (const n of vis) {
        let mode = 0;
        if (n.labelOk === false || n.pri < limit) mode = 0;
        else {
          const full = this.box(n, 2), nm = this.box(n, 1);
          if (n.force || !hit(full)) { mode = 2; boxes.push(full); } else if (!hit(nm)) { mode = 1; boxes.push(nm); }
        }
        if (n.lm !== mode) {
          n.lm = mode;
          n.nmEl.style.display = mode ? '' : 'none';
          if (n.mtEl) n.mtEl.style.display = mode === 2 ? '' : 'none';
          if (n.moreEl) n.moreEl.style.display = mode === 2 && n.hidden ? '' : 'none';
        }
      }
    }
    box(n, mode) {
      const w = mode === 2 ? Math.max(n.nmW, n.mtW + (n.hidden ? n.moreW + 8 : 0)) : n.nmW;
      if (n.left) return { x0: n.sx - 16 - w, x1: n.sx + 4, y0: n.sy - 18, y1: n.sy + (mode === 2 ? 28 : 12) };
      if (n.center) return { x0: n.sx - w / 2 - 6, x1: n.sx + w / 2 + 6, y0: n.sy - n.nmH - 18, y1: n.sy + (mode === 2 ? 22 : 4) };
      return { x0: n.sx + 6, x1: n.sx + 14 + w, y0: n.sy - n.nmH - 4, y1: n.sy + (mode === 2 ? 15 : 3) };
    }
    measureNode(n) {
      if (!n.nmEl) return;
      n.nmW = tw(n.nmEl.textContent, n.hub ? F_HUB : (n.root ? F_ROOT : F_NM));
      n.mtW = n.mtEl ? tw(n.mtEl.textContent, F_MT, .76) : 0;
      if (n.moreEl) { n.moreW = tw(n.moreEl.textContent, F_MT, .4); n.moreEl.setAttribute('x', (n.left ? -14 : 9) + (n.left ? 0 : n.mtW + 8)); }
    }
    remeasure() { for (const n of this.N.values()) this.measureNode(n); this.kick(); }

    setHover(id) {
      if (this.hover === id) return;
      U.$$('.hl', this.svg).forEach(e => e.classList.remove('hl'));
      this.hover = id;
      this.host.classList.toggle('has-hl', !!id);
      if (!id) { this.kick(); return; }
      const set = this.lineageSet(id);
      for (const nid of set) {
        const n = this.N.get(nid); if (n) n.el.classList.add('hl');
        const e = this.E.get(nid); if (e && set.has(e.p)) { e.wrap.classList.add('hl'); if (e.mm) e.mm.classList.add('hl'); }
      }
      this.kick();
    }
    lineageSet(id) {
      const set = new Set([id]);
      let n = this.N.get(id); while (n && n.pid && this.N.has(n.pid)) { set.add(n.pid); n = this.N.get(n.pid); }
      const down = pid => { for (const e of this.E.values()) if (e.p === pid && !e.removing) { set.add(e.c); down(e.c); } };
      down(id); return set;
    }
    setPath(id) {
      U.$$('.path', this.svg).forEach(e => e.classList.remove('path'));
      U.$$('.sel', this.svg).forEach(e => e.classList.remove('sel'));
      this.pathSet = new Set();
      if (!id) return;
      let n = this.N.get(id);
      if (n) n.el.classList.add('sel');
      while (n) {
        this.pathSet.add(n.id); n.el.classList.add('path');
        const e = this.E.get(n.id); if (e) e.wrap.classList.add('path');
        n = n.pid ? this.N.get(n.pid) : null;
      }
    }
    kidsOf(id) { const out = []; for (const e of this.E.values()) if (e.p === id && !e.removing) out.push(this.N.get(e.c)); return out.filter(Boolean).sort((a, b) => (a.mv ? a.mv.ty : a.y) - (b.mv ? b.mv.ty : b.y)); }
    setKb(id, opts) {
      if (this.kb) { const o = this.N.get(this.kb); if (o) o.el.classList.remove('kb'); }
      this.kb = id; const n = this.N.get(id); if (!n) return;
      n.el.classList.add('kb');
      this.setHover(id);
      if (!opts || !opts.quiet) U.announce(this.describe(id));
      const m = 70;
      if (n.sx < m || n.sx > this.W - m || n.sy < m || n.sy > this.H - m) this.flyTo(n.x, n.y, this.cam.k, 380, this.inspOffset());
    }

    bindPointer() {
      const host = this.host; const pts = new Map(); let drag = null, moved = 0, pinch = null;
      host.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('.gc-tools, .ls-overlay')) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: this.cam.k }; }
        drag = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y }; moved = 0; this.camAnim = null; this.engaged = true; host.classList.add('engaged');
      });
      host.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2 && pinch) {
          const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = host.getBoundingClientRect();
          const f = (pinch.k * d / pinch.d) / this.cam.k; this.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, f); moved = 99; return;
        }
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
        if (moved > 4) {
          if (!host.classList.contains('dragging')) { host.classList.add('dragging'); try { host.setPointerCapture(e.pointerId); } catch (_) { } this.setHover(null); }
          this.cam = { x: drag.cx - dx / this.cam.k, y: drag.cy - dy / this.cam.k, k: this.cam.k }; this.kick();
        }
      });
      const up = e => {
        pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
        if (pts.size === 0) {
          if (moved > 4) { this.noClick = true; setTimeout(() => { this.noClick = false; }, 30); }
          drag = null; host.classList.remove('dragging');
        }
      };
      host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
      host.addEventListener('click', e => {
        if (this.noClick) return;
        const more = e.target.closest('.more'); if (more) { this.expand(more.parentNode.dataset.id); return; }
        const nd = e.target.closest('.nd'); if (nd && this.N.has(nd.dataset.id)) this.clickNode(nd.dataset.id);
      });
      host.addEventListener('pointerover', e => {
        if (host.classList.contains('dragging')) return;
        const nd = e.target.closest('.nd');
        if (nd) this.setHover(nd.dataset.id);
        const h = e.target.closest('.e-hit');
        if (h && this.edgeTip) window.FORK_TIP && window.FORK_TIP.show(this.edgeTip(h.dataset.c), e.clientX, e.clientY);
      });
      host.addEventListener('pointermove', e => { if (e.target.closest && e.target.closest('.e-hit') && window.FORK_TIP) window.FORK_TIP.move(e.clientX, e.clientY); });
      host.addEventListener('pointerout', e => {
        const to = e.relatedTarget;
        if (e.target.closest('.e-hit') && window.FORK_TIP) window.FORK_TIP.hide();
        if (!to || !to.closest || !to.closest('.nd')) { if (!this.kbActive) this.setHover(null); }
        if (!to || !host.contains(to)) { this.engaged = false; host.classList.remove('engaged'); }
      });
      host.addEventListener('wheel', e => {
        if (!(this.o.wheel === 'always' || (this.o.wheel === 'engage' && this.engaged) || e.ctrlKey || e.metaKey)) { if (this.onWheelHint) this.onWheelHint(); return; }
        e.preventDefault();
        const r = host.getBoundingClientRect();
        this.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0018)));
      }, { passive: false });
    }
    bindKeys() {
      this.host.addEventListener('focus', () => { this.kbActive = true; if (!this.kb) { const id = this.sel || this.defaultKb(); if (id) this.setKb(id); } });
      this.host.addEventListener('blur', () => { this.kbActive = false; this.setHover(null); });
      this.host.addEventListener('keydown', e => {
        let id = this.kb || this.defaultKb(); const n = this.N.get(id); if (!n) return;
        switch (e.key) {
          case 'ArrowLeft': if (n.pid && this.N.has(n.pid) && !this.N.get(n.pid).hub) id = n.pid; else if (n.pid && this.N.get(n.pid) && this.N.get(n.pid).hub) id = n.pid; break;
          case 'ArrowRight': { const k = this.kidsOf(id); if (k.length) id = k[0].id; else if (n.hidden) { this.expand(id); } break; }
          case 'ArrowUp': case 'ArrowDown': {
            const sib = n.pid ? this.kidsOf(n.pid) : [...this.N.values()].filter(x => !x.pid).sort((a, b) => a.y - b.y);
            const i = sib.findIndex(s => s.id === id), j = clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, sib.length - 1);
            if (sib[j]) id = sib[j].id; break;
          }
          case 'Enter': case ' ': e.preventDefault(); this.clickNode(id); return;
          case '+': case '=': this.zoomBy(1.3); e.preventDefault(); return;
          case '-': case '_': this.zoomBy(1 / 1.3); e.preventDefault(); return;
          case '0': this.fit(true); e.preventDefault(); return;
          default: return;
        }
        e.preventDefault(); this.setKb(id);
      });
    }
    defaultKb() { return this.sel || this.root || (this.N.keys().next().value); }
    removeEdge(e) {
      e.wrap.remove(); if (e.mm) e.mm.remove(); this.E.delete(e.id);
      const n = this.N.get(e.c); if (n && n.removing) { n.el.remove(); this.N.delete(e.c); }
    }
    clear() { this.gEdges.innerHTML = ''; this.gNodes.innerHTML = ''; this.gMarks.innerHTML = ''; this.gThreads.innerHTML = ''; this.gRuler.innerHTML = ''; this.N.clear(); this.E.clear(); this.hover = null; this.kb = null; this.pathSet = new Set(); }
  }

  function makeEdge(g, pid, cid, d, maxDesc) {
    const rel = d.relation || 'VERIFIED';
    const wrap = U.svg('g', { class: 'e' + (d.simulated ? ' sim' : '') }, g.gEdges);
    const rib = rel === 'VERIFIED';
    const w = 1.3 + 5.2 * Math.sqrt((d.descendants || 0) + 1) / Math.sqrt(maxDesc + 1);
    const el = U.svg('path', { class: rib ? 'e-rib' : 'e-line ' + rel.toLowerCase() }, wrap);
    if (!rib) el.setAttribute('stroke-width', rel === 'DISPUTED' ? '2.2' : Math.max(1.4, w * .7).toFixed(2));
    const hit = U.svg('path', { class: 'e-hit' }, wrap); hit.dataset.c = cid;
    let mm = null;
    if (d.mutation) { mm = U.svg('g', { class: 'mm' }, g.gMarks); U.svg('path', { d: 'M-7 0H7M-1 0C3 0 3 -6 8 -6' }, mm); U.svg('circle', { cx: 9.4, cy: -6, r: 1.9 }, mm); }
    const e = { id: cid, p: pid, c: cid, g: 1, el, hit, mm, wrap, w0: w, w1: Math.max(1, w * .4), rib, on: true };
    g.E.set(cid, e); return e;
  }

  /* ---------------- LineageGraph ---------------- */
  class LineageGraph extends GraphCanvas {
    constructor(host, o) {
      super(host, Object.assign({ baseDepth: 2, rowH: 42, gap: 128, ruler: true, band: () => ({ top: 36, right: 60, bottom: 56, left: 60 }) }, o));
      this.expanded = new Set(); this.virtual = new Map(); this.vkids = new Map(); this.bonus = 0;
      this.onZoomSettled = () => {
        if (!this.root) return;
        const b = Math.max(0, Math.floor(Math.log2(this.cam.k / this.kFit) * 2 + 1e-6));
        if (b !== this.bonus) { this.bonus = b; this.refresh({ anchor: true }); }
      };
    }
    get(id) { return byId.get(id) || this.virtual.get(id); }
    kids(id) { const n = this.get(id); return (n.children || []).concat(this.vkids.get(id) || []); }
    has(id) { return this.N.has(id); }
    ancIds(id) { const out = []; let n = this.get(id); while (n && n.parent && n.id !== this.root) { out.push(n.parent); n = this.get(n.parent); } return out; }
    T(n) { return Math.log1p(Math.max(0, (n.t - this.t0) / DAY) / this.tau); }
    setRoot(rootId, opt) {
      opt = opt || {};
      this.clear(); this.expanded.clear(); this.bonus = 0; this.xs = null;
      this.root = rootId; const r = this.get(rootId); this.t0 = r.t; this.maxDesc = r.descendants || 1;
      this.tau = clamp((NOW - r.t) / DAY / 65, 3, 40);
      this.focus = opt.focus || null; this.sel = null;
      const vis = this.computeVis(); const pos = this.layout(vis);
      const now = performance.now(), intro = opt.intro && !U.reduced();
      const minD = r.depth;
      vis.forEach(id => {
        const p = pos.get(id); const n = this.addNode(id, p.x, p.y);
        if (id === rootId) { if (intro) { n.alpha = 0; n.ap = { t0: now, d: 380 }; } return; }
        const d = this.get(id), e = makeEdge(this, d.parent, id, d, this.maxDesc);
        if (intro) { const sibI = this.kids(d.parent).indexOf(id); e.g = 0; e.an = { from: 0, to: 1, t0: now, delay: 380 + (d.depth - minD - 1) * 560 + sibI * 38, d: 640 }; }
      });
      this.updateHidden(vis);
      this.introEnd = intro ? 380 + (Math.max(...[...vis].map(id => this.get(id).depth - minD)) * 560) + 300 : 0;
      if (this.W) this.fit(false); else this.pendingFit = true;
      this.kick();
      return this.introEnd;
    }
    computeVis() {
      const vis = new Set(), root = this.root, rd = this.get(root).depth;
      const foc = this.focus, anc = new Set(foc ? this.ancIds(foc).concat(foc) : []);
      const fd = foc ? this.get(foc).depth : 0;
      const lim = this.o.baseDepth + this.bonus;
      const walk = (id, underFoc) => {
        vis.add(id);
        for (const c of this.kids(id)) {
          const cn = this.get(c), uf = underFoc || c === foc;
          const ok = cn.depth - rd <= lim || anc.has(c) || this.expanded.has(id) || (underFoc && cn.depth - fd <= 2) || cn.simulated;
          if (ok) walk(c, uf || id === foc);
        }
      };
      walk(root, root === foc); return vis;
    }
    layout(vis) {
      const rowH = this.o.rowH, gap = this.o.gap;
      if (this.xs == null) {
        let maxT = 0, leaves = 0;
        vis.forEach(id => { maxT = Math.max(maxT, this.T(this.get(id))); if (!this.kids(id).some(c => vis.has(c))) leaves++; });
        const b = this.band(), bw = Math.max(200, this.W - b.left - b.right - 160), bh = Math.max(160, this.H - b.top - b.bottom);
        const want = (bw / bh) * leaves * rowH;
        this.xs = clamp(want / Math.max(maxT, .5), 120, 340);
      }
      let leafY = 0; const pos = new Map();
      const place = (id, px) => {
        const n = this.get(id);
        const x = id === this.root ? 0 : Math.max(this.T(n) * this.xs, px + gap);
        const kids = this.kids(id).filter(c => vis.has(c)); let y;
        if (!kids.length) { y = leafY; leafY += rowH; }
        else { const ys = kids.map(c => place(c, x).y); y = (ys[0] + ys[ys.length - 1]) / 2; }
        const p = { x, y }; pos.set(id, p); return p;
      };
      place(this.root, -Infinity);
      return pos;
    }
    band() { return this.o.band(this); }
    addNode(id, x, y) {
      const d = this.get(id), isRoot = id === this.root;
      const g = U.svg('g', { class: 'nd' + (isRoot ? ' root' : '') + (d.simulated ? ' sim' : ''), 'data-id': id }, this.gNodes);
      U.svg('circle', { class: 'hit', r: 15 }, g);
      U.svg('circle', { class: 'ring', r: 10 }, g);
      if (isRoot) {
        const og = U.svg('g', { class: 'og' }, g);
        U.svg('path', { d: 'M0 0H26' }, og); U.svg('path', { d: 'M9 0C15 0 14 -10 21 -10' }, og);
        U.svg('circle', { class: 'dot', r: 5.2 }, og); U.svg('circle', { class: 'end', cx: 22.6, cy: -10.4, r: 2.4 }, og);
      } else if (d.type === 'TOKEN') U.svg('path', { class: 'dot', d: 'M0 -5.2L5.2 0 0 5.2 -5.2 0Z' }, g);
      else U.svg('circle', { class: 'dot', r: 4.2 }, g);
      const nm = U.svg('text', isRoot ? { class: 'nm', x: -16, y: 7, 'text-anchor': 'end' } : { class: 'nm', x: 9, y: -7 }, g);
      nm.textContent = d.name;
      const mt = U.svg('text', isRoot ? { class: 'mt', x: -16, y: 25, 'text-anchor': 'end' } : { class: 'mt', x: 9, y: 12 }, g);
      mt.textContent = d.simulated ? 'SIMULATED · NOW' : (isRoot ? 'ORIGIN · ' + U.plat(d.platform).toUpperCase() + ' · ' : d.type + ' · ') + U.mon(d).toUpperCase();
      let more = null;
      if (!isRoot) { more = U.svg('text', { class: 'more', x: 9, y: 12 }, g); more.style.display = 'none'; }
      const rec = { id, x, y, el: g, nmEl: nm, mtEl: mt, moreEl: more, pid: isRoot ? null : d.parent, inE: !isRoot, root: isRoot, left: isRoot, force: isRoot, nmH: 15,
        pri: isRoot ? 1e6 : 1000 - (d.depth - this.get(this.root).depth) * 120 + Math.log1p(d.descendants || 0) * 30 };
      this.measureNode(rec);
      if (this.pathSet.has(id)) { g.classList.add('path'); }
      if (this.sel === id) g.classList.add('sel');
      this.N.set(id, rec); return rec;
    }
    updateHidden(vis) {
      const cnt = new Map();
      const walk = id => { let c = 0; for (const k of this.kids(id)) if (vis.has(k)) c += 1 + walk(k); cnt.set(id, c); return c; };
      walk(this.root);
      for (const [id, n] of this.N) {
        if (!n.moreEl || n.removing) continue;
        const d = this.get(id), h = (d.descendants || 0) - (cnt.get(id) || 0);
        n.hidden = h > 0 ? h : 0;
        n.moreEl.textContent = n.hidden ? '+' + n.hidden : '';
        this.measureNode(n); n.lm = -1;
      }
    }
    refresh(opt) {
      opt = opt || {};
      const vis = this.computeVis(), pos = this.layout(vis), now = performance.now(), dur = U.reduced() ? 0 : 520;
      let anchor = null;
      if (opt.anchor) {
        let best = Infinity;
        for (const n of this.N.values()) { if (!vis.has(n.id) || n.removing) continue; const d = Math.hypot(n.sx - this.W / 2, n.sy - this.H / 2); if (d < best) { best = d; anchor = n; } }
      }
      const ax = anchor ? anchor.x : 0, ay = anchor ? anchor.y : 0;
      for (const [id, n] of this.N) {
        if (vis.has(id) || n.removing) continue;
        n.removing = true; const e = this.E.get(id);
        if (e) { e.removing = true; e.an = { from: e.g, to: 0, t0: now, delay: 0, d: U.reduced() ? 0 : 360 }; }
      }
      const fresh = [];
      vis.forEach(id => {
        const p = pos.get(id); let n = this.N.get(id);
        if (!n) { n = this.addNode(id, p.x, p.y); const d = this.get(id); const e = makeEdge(this, d.parent, id, d, this.maxDesc); e.g = 0; fresh.push([d, e]); return; }
        if (n.removing) { n.removing = false; const e = this.E.get(id); if (e) { e.removing = false; e.an = { from: e.g, to: 1, t0: now, delay: 0, d: 300 }; } }
        if (Math.abs(n.x - p.x) > .5 || Math.abs(n.y - p.y) > .5) n.mv = { fx: n.x, fy: n.y, tx: p.x, ty: p.y, t0: now, d: dur };
      });
      if (fresh.length) {
        const minD = Math.min(...fresh.map(f => f[0].depth));
        fresh.forEach(([d, e], i) => { e.an = { from: 0, to: 1, t0: now, delay: (U.reduced() ? 0 : (opt.delay || 160) + (d.depth - minD) * 300 + (i % 12) * 22), d: U.reduced() ? 0 : 560 }; });
      }
      this.updateHidden(vis);
      if (anchor && dur) {
        const p = pos.get(anchor.id), c = this.cam;
        this.camAnim = { x0: c.x, y0: c.y, x1: c.x + (p.x - ax), y1: c.y + (p.y - ay), k0: c.k, k1: c.k, t0: now, d: dur };
      } else if (anchor) { const p = pos.get(anchor.id); this.cam = { x: this.cam.x + p.x - ax, y: this.cam.y + p.y - ay, k: this.cam.k }; }
      this.setPath(this.sel);
      this.kick();
      return pos;
    }
    expand(id) { this.expanded.add(id); this.refresh({ anchor: true }); }
    bounds() {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const n of this.N.values()) { if (n.removing) continue; const x = n.mv ? n.mv.tx : n.x, y = n.mv ? n.mv.ty : n.y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return { x0, x1, y0, y1 };
    }
    fit(animate) {
      if (!this.W) { this.pendingFit = true; return; }
      const b = this.bounds(), band = this.band();
      const bw = b.x1 - b.x0 + 210, bh = b.y1 - b.y0 + 30;   // label room right
      const aw = Math.max(120, this.W - band.left - band.right), ah = Math.max(120, this.H - band.top - band.bottom);
      const k = clamp(Math.min(aw / bw, ah / bh), this.o.minFitK || .25, this.o.maxFitK || 1.15);
      this.kFit = k;
      const cxS = band.left + aw / 2, cyS = band.top + ah / 2;
      const wx = (b.x0 + b.x1 + 210) / 2, wy = (b.y0 + b.y1) / 2;
      const cam = { x: wx - (cxS - this.W / 2) / k, y: wy - (cyS - this.H / 2) / k, k };
      if (animate) { const c = this.cam; this.camAnim = { x0: c.x, y0: c.y, x1: cam.x, y1: cam.y, k0: c.k, k1: k, t0: performance.now(), d: U.reduced() ? 0 : 500 }; }
      else this.cam = cam;
      this.kick();
    }
    curve(P, C) {
      const dx = C.x - P.x;
      return [[P.x, P.y], [P.x + dx * .62, P.y], [P.x + dx * .38, C.y], [C.x, C.y]];
    }
    // world-space samples along a lineage path between two visible nodes
    routePoints(fromId, toId) {
      const up = id => { const a = [id]; let n = this.N.get(id); while (n && n.pid) { a.push(n.pid); n = this.N.get(n.pid); } return a; };
      const A = up(fromId), B = up(toId), setB = new Set(B);
      const lca = A.find(id => setB.has(id)) || this.root;
      const seq = A.slice(0, A.indexOf(lca) + 1).concat(B.slice(0, B.indexOf(lca)).reverse());
      const tp = n => n.mv ? { x: n.mv.tx, y: n.mv.ty } : { x: n.x, y: n.y };
      const pts = [];
      for (let i = 1; i < seq.length; i++) {
        const a = this.N.get(seq[i - 1]), b = this.N.get(seq[i]); if (!a || !b) continue;
        const downward = b.pid === a.id;
        const P = downward ? tp(a) : tp(b), C = downward ? tp(b) : tp(a);
        const W = this.curve(P, C);
        for (let s = 1; s <= 10; s++) { const t = downward ? s / 10 : 1 - s / 10; pts.push(bz(W, t)); }
      }
      if (!pts.length) { const n = this.N.get(toId); if (n) pts.push([tp(n).x, tp(n).y]); }
      return pts;
    }
    select(id, opt) {
      opt = opt || {};
      const d = this.get(id); if (!d || d.simulated) return;
      const from = this.sel || this.focus || this.root;
      this.sel = id; this.focus = id;
      this.refresh({});
      this.setPath(id);
      if (this.kb) { const o = this.N.get(this.kb); if (o) o.el.classList.remove('kb'); }
      this.kb = id; const n = this.N.get(id); if (n && this.kbActive) n.el.classList.add('kb');
      if (opt.travel !== false) {
        const willOpen = opt.open !== false && this.o.onSelect;
        const off = willOpen ? this.inspOffset() : 0;
        const pts = this.routePoints(this.N.has(from) ? from : this.root, id);
        let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        const k = clamp(Math.max(this.cam.k, this.kFit * 1.05), .5, 1.1);
        this.flyPath(pts, k, clamp(380 + len * .5, 600, 1500), off);
      }
      U.announce(this.describe(id));
      if (opt.open !== false && this.o.onSelect) this.o.onSelect(id, this);
    }
    clickNode(id) { this.select(id); }
    describe(id) {
      const d = this.get(id); if (!d) return '';
      if (d.simulated) return d.name + '. Simulated fork.';
      const p = d.parent ? byId.get(d.parent) : null;
      return `${d.name}. ${U.typeL(d.type)}, ${U.fmtMon(d.t)}. ${d.forks} direct forks, ${d.descendants} descendants.` + (p ? ` ${U.typeL(d.relation)} fork of ${p.name}.` : ' Origin.');
    }
    edgeTip(cid) {
      const c = this.get(cid); if (!c) return '';
      const p = this.get(c.parent);
      if (c.simulated) return `<b>${U.esc(p.name)}</b> → <b>${U.esc(c.name)}</b><br>Simulated fork, not in the archive`;
      return `<span class="tl">Parent → child</span><br><b>${U.esc(p.name)}</b> → <b>${U.esc(c.name)}</b><br>${c.relation} · ${U.pct(c.conf)}% confidence · ${c.evidence.length} evidence items` + (c.mutation ? '<br>⑂ Mutation: ' + c.changed.length + ' traits changed' : '');
    }
    addVirtual(parentId, data) {
      const p = this.get(parentId);
      const v = Object.assign({ parent: parentId, depth: p.depth + 1, children: [], descendants: 0, t: NOW, simulated: true, relation: 'VERIFIED', conf: .9 }, data);
      this.virtual.set(v.id, v);
      this.vkids.set(parentId, (this.vkids.get(parentId) || []).concat(v.id));
      this.refresh({ anchor: true, delay: 40 });
      return v;
    }
    drawExtra() {
      if (!this.o.ruler) return;
      const g = this.gRuler; g.innerHTML = '';
      const band = this.band(), y = this.H - band.bottom + 16;
      if (y > this.H - 6) return;
      U.svg('line', { x1: 0, x2: this.W, y1: y, y2: y }, g);
      const startY = new Date(this.t0).getUTCFullYear(), endT = NOW, span = (endT - this.t0) / DAY;
      const ticks = [];
      if (span > 900) for (let yr = startY + 1; yr <= 2026; yr++) ticks.push([Date.UTC(yr, 0, 1), String(yr)]);
      else { const d0 = new Date(this.t0); for (let m = d0.getUTCMonth() + 1, yr = d0.getUTCFullYear(); Date.UTC(yr, m, 1) <= endT; m++) { if (m > 11) { m = 0; yr++; } ticks.push([Date.UTC(yr, m, 1), MON[m].toUpperCase() + (m === 0 ? ' ' + yr : '')]); } }
      let last = -1e9;
      const x0 = this.sx(0); U.svg('line', { class: 'tk', x1: x0, x2: x0, y1: y - 5, y2: y + 5 }, g);
      const t0l = U.svg('text', { x: x0 + 4, y: y + 15 }, g); t0l.textContent = U.fmtMon(this.t0).toUpperCase();
      last = x0 + 60;
      for (const [t, lb] of ticks) {
        const x = this.sx(this.T({ t }) * this.xs);
        if (x < 0 || x > this.W - 20 || x - last < 46) continue; last = x;
        U.svg('line', { class: 'tk', x1: x, x2: x, y1: y - 3, y2: y + 3 }, g);
        const tx = U.svg('text', { x: x + 4, y: y + 15 }, g); tx.textContent = lb;
      }
      const lt = U.svg('text', { x: this.W - 8, y: y - 7, 'text-anchor': 'end' }, g); lt.textContent = 'TIME, LOG SCALE →';
    }
  }

  /* ---------------- MapGraph ---------------- */
  class MapGraph extends GraphCanvas {
    constructor(host, o) {
      super(host, Object.assign({ wheel: 'always', minK: .5, maxK: 2.8, label: 'Map of all sample lineages' }, o));
      this.level = -1;
      this.build();
      if (this.W) this.fit(false); else this.pendingFit = true;
      this.onZoomSettled = () => this.applyLevel();
    }
    build() {
      const R0 = 150, RS = 62;
      this.cross = []; const agg = new Map();
      for (const f of D.FAMILIES) {
        const roots = D.roots.filter(r => r.family === f.id);
        const leaves = id => { const n = byId.get(id); return n.children.length ? n.children.reduce((s, c) => s + leaves(c), 0) : 1; };
        const total = roots.reduce((s, r) => s + leaves(r.id), 0);
        const [hx, hy] = f.hub;
        const hub = { id: 'hub:' + f.id, x: hx, y: hy, hub: true, fam: f.id, r: 0, a: 0, hx, hy, pri: 2e6, force: true, center: true, nmH: 30 };
        this.mkNode(hub, f.name, roots.length + ' ORIGINS · ' + roots.reduce((s, r) => s + r.descendants + 1, 0) + ' OBJECTS');
        let acc = -Math.PI * .1;
        const place = (id, depth, pid) => {
          const n = byId.get(id), L = leaves(id), span = (L / total) * Math.PI * 2;
          const a = acc + span / 2;
          if (!n.children.length) acc += span;
          else { const s0 = acc; n.children.forEach(c => place(c, depth + 1, id)); acc = s0 + span; }
          const r = R0 + depth * RS;
          const rec = { id, x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, r, a, hx, hy, depth, fam: f.id, pid: pid, inE: true,
            pri: depth === 0 ? 1e5 + n.descendants : 1000 - depth * 100 + Math.log1p(n.descendants) * 40, nmH: 15, root: false };
          this.mkNode(rec, n.name, n.type + ' · ' + U.mon(n).toUpperCase(), n);
          const e = makeEdge(this, pid, id, depth === 0 ? Object.assign({}, n, { relation: 'VERIFIED', mutation: false, descendants: n.descendants }) : n, 60);
          if (depth === 0) { e.rib = false; e.el.setAttribute('class', 'e-line'); e.el.setAttribute('stroke-width', '1'); e.el.style.strokeDasharray = '2 4'; }
          if (n.family !== f.id) { if (!n.generated) this.cross.push({ id, dst: n.family }); const key = f.id + '>' + n.family; agg.set(key, (agg.get(key) || 0) + 1); }
          return rec;
        };
        roots.forEach(r => place(r.id, 0, hub.id));
      }
      this.agg = [...agg].map(([k, c]) => { const [s, d] = k.split('>'); return { s, d, c }; });
      // threads layer elements
      this.aggEls = this.agg.map(a => ({ a, p: U.svg('path', { class: 'thread' }, this.gThreads), t: U.svg('text', { class: 'thread-lb', 'text-anchor': 'middle' }, this.gThreads) }));
      this.aggEls.forEach(o => { o.p.setAttribute('stroke-width', (1.2 + Math.sqrt(o.a.c) * .55).toFixed(2)); o.t.textContent = o.a.c + (o.a.c === 1 ? ' fork into ' : ' forks into ') + U.famName(o.a.d); });
      this.crossEls = this.cross.map(c => ({ c, p: U.svg('path', { class: 'thread', 'stroke-width': '1.4' }, this.gThreads), t: U.svg('text', { class: 'thread-lb', 'text-anchor': 'middle' }, this.gThreads) }));
      this.crossEls.forEach(o => { o.t.textContent = '→ ' + U.famName(o.c.dst); });
      for (const e of this.E.values()) e.g = 0;
    }
    mkNode(rec, name, meta, d) {
      const g = U.svg('g', { class: 'nd' + (rec.hub ? ' hub' : ''), 'data-id': rec.id }, this.gNodes);
      U.svg('circle', { class: 'hit', r: rec.hub ? 22 : 12 }, g);
      U.svg('circle', { class: 'ring', r: rec.hub ? 12 : 9 }, g);
      if (d && d.type === 'TOKEN') U.svg('path', { class: 'dot', d: 'M0 -4.6L4.6 0 0 4.6 -4.6 0Z' }, g);
      else U.svg('circle', { class: 'dot', r: rec.hub ? 6 : (rec.depth === 0 ? 4.8 : 3.4) }, g);
      const nm = U.svg('text', rec.hub ? { class: 'nm', x: 0, y: -18, 'text-anchor': 'middle' } : { class: 'nm', x: 8, y: -6 }, g); nm.textContent = name;
      const mt = U.svg('text', rec.hub ? { class: 'mt', x: 0, y: 24, 'text-anchor': 'middle' } : { class: 'mt', x: 8, y: 11 }, g); mt.textContent = meta;
      Object.assign(rec, { el: g, nmEl: nm, mtEl: mt });
      this.measureNode(rec); this.N.set(rec.id, rec);
    }
    curve(P, C) {
      if (P.hub) return [[P.x, P.y], [P.x + (C.x - P.x) * .4, P.y + (C.y - P.y) * .4], [P.x + (C.x - P.x) * .7, P.y + (C.y - P.y) * .7], [C.x, C.y]];
      const rm = (P.r + C.r) / 2;
      return [[P.x, P.y], [P.hx + Math.cos(P.a) * rm, P.hy + Math.sin(P.a) * rm], [C.hx + Math.cos(C.a) * rm, C.hy + Math.sin(C.a) * rm], [C.x, C.y]];
    }
    levelFor(k) { return k < .3 ? 0 : k < .55 ? 1 : k < .95 ? 2 : 3; }
    applyLevel(force) {
      const lv = this.levelFor(this.cam.k);
      if (lv === this.level && !force) return;
      const prev = this.level; this.level = lv;
      const maxD = [0, 1, 3, 99][lv], now = performance.now();
      for (const e of this.E.values()) {
        const n = this.N.get(e.c), want = n.depth <= maxD ? 1 : 0;
        if (e.an ? e.an.to === want : e.g === want) continue;
        const rel = want ? Math.max(0, n.depth - ([0, 1, 3, 99][Math.max(0, prev)] || 0) - 1) : 0;
        e.an = { from: e.g, to: want, t0: now, delay: U.reduced() ? 0 : (want ? rel * 160 + (n.depth === 0 ? 120 : 0) : 0), d: U.reduced() ? 0 : (want ? 520 : 260) };
      }
      const lb = document.getElementById('mapLvl'); if (lb) lb.textContent = ['Families and origins', 'First forks', 'Three generations', 'Every descendant'][lv];
      this.kick();
    }
    labelLimit() { return this.level <= 0 ? 5e4 : -Infinity; }
    fit(animate) {
      if (!this.W) { this.pendingFit = true; return; }
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const n of this.N.values()) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); }
      const side = U.mobile() ? 0 : 280;
      const k = Math.min((this.W - side - 60) / (x1 - x0 + 200), (this.H - 60) / (y1 - y0 + 120));
      this.kFit = k;
      const wx = (x0 + x1) / 2 - (side / 2) / k, wy = (y0 + y1) / 2;
      if (animate) this.flyTo(wx, wy, k, 600); else { this.cam = { x: wx, y: wy, k }; }
      if (this.level < 0) this.applyLevel(true);
      this.kick();
    }
    flyFamily(fid) {
      const hub = this.N.get('hub:' + fid); if (!hub) return;
      let r = 0; for (const n of this.N.values()) if (n.fam === fid && !n.hub) r = Math.max(r, n.r);
      const side = U.mobile() ? 0 : 280;
      const k = clamp(Math.min((this.W - side - 40) / (2 * r + 260), (this.H - 40) / (2 * r + 120)), .6, 1.4);
      this.flyTo(hub.x - (side / 2) / k, hub.y, k, 900);
      this.camAnim.done = () => this.applyLevel();
      U.$$('#mapFams button').forEach(b => b.setAttribute('aria-current', String(b.dataset.f === fid)));
      U.announce(U.famName(fid) + '. ' + hub.mtEl.textContent.toLowerCase());
    }
    clickNode(id) {
      const n = this.N.get(id);
      if (n.hub) { this.flyFamily(n.fam); return; }
      this.sel = id; this.setPath(id);
      const off = this.inspOffset();
      this.flyTo(n.x, n.y, Math.max(this.cam.k, 1.05), 700, off);
      this.camAnim.done = () => this.applyLevel();
      if (this.o.onSelect) this.o.onSelect(id, this);
    }
    has(id) { return this.N.has(id); }
    select(id) { if (this.N.has(id)) { const n = this.N.get(id); const e = this.E.get(id); if (e && e.g < 1) { this.cam.k = Math.max(this.cam.k, 1); this.applyLevel(true); } this.clickNode(id); } }
    expand() { }
    describe(id) { const n = this.N.get(id); if (!n) return ''; if (n.hub) return n.nmEl.textContent + ' family. ' + n.mtEl.textContent.toLowerCase(); const d = byId.get(id); return `${d.name}. ${U.typeL(d.type)}, ${U.fmtMon(d.t)}, generation ${d.depth}. ${d.descendants} descendants.`; }
    edgeTip(cid) { const c = byId.get(cid); if (!c || !c.parent) return c ? `<b>${U.esc(c.name)}</b><br>Origin in ${U.esc(U.famName(c.family))}` : ''; const p = byId.get(c.parent); return `<b>${U.esc(p.name)}</b> → <b>${U.esc(c.name)}</b><br>${c.relation} · ${U.pct(c.conf)}% confidence`; }
    drawExtra() {
      const k = this.cam.k, lv = this.level;
      this.aggEls.forEach(o => {
        const A = this.N.get('hub:' + o.a.s), B = this.N.get('hub:' + o.a.d);
        const ax = this.sx(A.x), ay = this.sy(A.y), bx = this.sx(B.x), by = this.sy(B.y);
        const mx = (ax + bx) / 2 + (by - ay) * .18, my = (ay + by) / 2 - (bx - ax) * .18;
        const show = lv <= 1;
        o.p.style.display = show ? '' : 'none'; o.t.style.display = show ? '' : 'none';
        if (!show) return;
        o.p.setAttribute('d', `M${f1(ax)},${f1(ay)}Q${f1(mx)},${f1(my)} ${f1(bx)},${f1(by)}`);
        o.t.setAttribute('x', f1((ax + 2 * mx + bx) / 4)); o.t.setAttribute('y', f1((ay + 2 * my + by) / 4));
      });
      this.crossEls.forEach(o => {
        const n = this.N.get(o.c.id), e = this.E.get(o.c.id), B = this.N.get('hub:' + o.c.dst);
        const show = lv >= 2 && e.g > .9 && n.vis;
        o.p.style.display = show ? '' : 'none'; o.t.style.display = show ? '' : 'none'; if (!show) return;
        const ax = n.sx, ay = n.sy, bx = this.sx(B.x), by = this.sy(B.y);
        const mx = (ax + bx) / 2 + (by - ay) * .12, my = (ay + by) / 2 - (bx - ax) * .12;
        o.p.setAttribute('d', `M${f1(ax)},${f1(ay)}Q${f1(mx)},${f1(my)} ${f1(bx)},${f1(by)}`);
        const tx = .8 * .8 * ax + 2 * .8 * .2 * mx + .2 * .2 * bx, ty = .8 * .8 * ay + 2 * .8 * .2 * my + .2 * .2 * by;
        o.t.setAttribute('x', f1(tx)); o.t.setAttribute('y', f1(ty - 6));
      });
    }
  }

  /* ---------------- LineageStack ---------------- */
  class LineageStack {
    constructor(host, o) {
      this.host = host; this.o = o; this.root = o.root; this.active = o.active || o.root;
      this.open = new Set(); this.virtual = new Map(); this.vkids = new Map();
      this.el = document.createElement('div'); this.el.className = 'ls'; host.appendChild(this.el);
      this.el.addEventListener('click', e => this.onClick(e));
      this.render(false);
    }
    get(id) { return byId.get(id) || this.virtual.get(id); }
    kids(id) { const n = this.get(id); return (n.children || []).concat(this.vkids.get(id) || []); }
    has(id) { const n = this.get(id); return !!n && (id === this.root || D.ancestors(id).some(a => a.id === this.root)); }
    destroy() { this.el.remove(); }
    setActive(id) {
      if (!this.get(id)) return;
      const goingUp = this.get(this.active) && D.ancestors(this.active).some(a => a.id === id);
      const go = () => { this.el.classList.remove('retract'); this.active = id; this.open.clear(); this.render(true); U.announce(this.describe(id)); };
      if (goingUp && !U.reduced()) { this.el.classList.add('retract'); setTimeout(go, 200); } else go();
    }
    select(id) { if (!this.has(id)) return; this.setActive(id); if (this.o.onSelect) this.o.onSelect(id, this); }
    describe(id) { const d = this.get(id); return `${d.name}. ${U.typeL(d.type)}. ${d.forks || 0} direct forks.`; }
    addVirtual(parentId, data) {
      const p = this.get(parentId);
      const v = Object.assign({ parent: parentId, depth: p.depth + 1, children: [], descendants: 0, forks: 0, t: NOW, simulated: true, relation: 'VERIFIED' }, data);
      this.virtual.set(v.id, v); this.vkids.set(parentId, (this.vkids.get(parentId) || []).concat(v.id));
      this.fresh = v.id; this.render(false); return v;
    }
    row(id, lvl, anim, i) {
      const d = this.get(id), ks = this.kids(id), open = this.open.has(id);
      const w = (1.2 + 2.2 * Math.sqrt((d.descendants || 0) + 1) / Math.sqrt((this.get(this.root).descendants || 1) + 1)).toFixed(2);
      const cls = 'r-' + (d.relation || 'VERIFIED') + (d.simulated ? ' sim' : '') + ((anim || this.fresh === id) ? ' grow-in' : '');
      const meta = d.simulated ? 'Simulated · now' : `${U.typeL(d.type)} · ${U.mon(d)} · ${U.plat(d.platform)}`;
      return `<li role="treeitem" class="${cls}" style="--w:${w}px;animation-delay:${(i || 0) * 45}ms" aria-level="${lvl + 1}"${ks.length ? ` aria-expanded="${open}"` : ''}>
        <div class="ls-row">
          <button class="ls-tog" type="button" data-tog="${U.esc(id)}"><span class="n">${U.esc(d.name)}</span><span class="m">${U.esc(meta)}${d.mutation ? ' · ⑂ mutated' : ''}</span></button>
          ${ks.length ? `<span class="ls-cnt" aria-hidden="true">${ks.length} <span class="chev">›</span></span>` : ''}
          ${d.simulated ? '' : `<button class="ls-go" type="button" data-go="${U.esc(id)}" aria-label="Follow ${U.esc(d.name)}">→</button>`}
        </div>
        ${open && ks.length ? `<ul role="group">${ks.map((c, j) => this.row(c, lvl + 1, this.justOpened === id, j)).join('')}</ul>` : ''}
      </li>`;
    }
    render(anim) {
      const a = this.get(this.active), anc = this.active === this.root ? [] : D.ancestors(this.active).filter(x => x.depth >= this.get(this.root).depth);
      const ks = this.kids(this.active);
      const sep = '<svg class="sep" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 5H8M8 5C12 5 12 1 17 1"/></svg>';
      this.el.innerHTML = `
        ${anc.length ? `<nav class="ls-path" aria-label="Ancestry">${anc.map(x => `<button type="button" data-go="${x.id}">${U.esc(x.name)}</button>${sep}`).join('')}<span>${U.esc(a.name)}</span></nav>` : ''}
        <div class="ls-active">
          <p class="eyebrow">${a.parent ? 'Generation ' + a.depth : 'Origin'} · ${U.typeL(a.type)} · ${U.esc(U.famName(a.family))}</p>
          <h3>${U.esc(a.name)}</h3>
          <div class="ls-meta"><span class="chip s-${a.status}">${a.status}</span><span>Fork score <b class="num">${a.score}</b></span><span>${U.day(a)} · ${U.plat(a.platform)}</span></div>
          <div class="ls-actions"><button class="btn sm" type="button" data-insp="${a.id}">Inspect</button><a class="btn sm" href="#o.${a.id}">Object page</a></div>
        </div>
        <p class="label">Direct forks · ${ks.length}</p>
        ${ks.length ? `<ul class="ls-tree" role="tree" aria-label="Forks of ${U.esc(a.name)}">${ks.map((c, i) => this.row(c, 0, anim, i)).join('')}</ul>` : '<p class="ls-empty">No forks yet. This is the end of the line, for now.</p>'}`;
      this.justOpened = null; this.fresh = null;
    }
    onClick(e) {
      const go = e.target.closest('[data-go]'), tog = e.target.closest('[data-tog]'), ins = e.target.closest('[data-insp]');
      if (go) { this.setActive(go.dataset.go); this.el.scrollIntoView({ block: 'nearest', behavior: U.reduced() ? 'auto' : 'smooth' }); return; }
      if (ins) { if (this.o.onSelect) this.o.onSelect(ins.dataset.insp, this); return; }
      if (tog) {
        const id = tog.dataset.tog, d = this.get(id);
        if (d.simulated) return;
        if (this.kids(id).length) { if (this.open.has(id)) this.open.delete(id); else { this.open.add(id); this.justOpened = id; } this.render(false); const b = this.el.querySelector(`[data-tog="${CSS.escape(id)}"]`); if (b) b.focus(); }
        else if (this.o.onSelect) this.o.onSelect(id, this);
      }
    }
  }

  /* ---------------- controller: graph on desktop, stack on mobile / list view ---------------- */
  function mountLineage(graphHost, stackHost, o) {
    const ctl = { o, graph: null, stack: null, list: false, sel: o.select || null };
    let gwrap = null, tools = null, hint = null, ov = null;
    function onSelect(id, src) { ctl.sel = id; if (o.onSelect) o.onSelect(id, ctl); }
    function buildGraph() {
      if (getComputedStyle(graphHost).position === 'static') graphHost.style.position = 'relative';
      gwrap = document.createElement('div'); gwrap.style.cssText = 'position:absolute;inset:0'; graphHost.appendChild(gwrap);
      ctl.graph = new LineageGraph(gwrap, { wheel: o.wheel || 'modifier', minFitK: o.minFitK, gap: o.gap || 128, baseDepth: o.baseDepth || 2, band: o.band || (() => ({ top: 30, right: 50, bottom: o.ruler === false ? 30 : 60, left: 150 })), ruler: o.ruler !== false, rowH: o.rowH || 42, onSelect, label: o.label, maxFitK: o.maxFitK });
      ctl.graph.onWheelHint = () => { if (hint) { hint.style.color = 'var(--electric)'; clearTimeout(hint.t); hint.t = setTimeout(() => { hint.style.color = ''; }, 900); } };
      const end = ctl.graph.setRoot(o.root, { focus: o.focus || o.select, intro: o.intro });
      if (o.select) { const go = () => ctl.graph && ctl.graph.select(o.select, { open: false }); if (o.intro && end) setTimeout(go, end); else go(); }
      if (o.onIntroDone) setTimeout(o.onIntroDone, o.intro ? end : 0);
      if (o.tools !== false) {
        tools = document.createElement('div'); tools.className = 'gc-tools';
        tools.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" class="txt" data-z="fit">Fit</button><button type="button" class="txt" data-z="list" aria-pressed="false">List</button>';
        tools.style.bottom = (o.toolsBottom || 14) + 'px';
        graphHost.appendChild(tools);
        hint = document.createElement('div'); hint.className = 'gc-hint'; hint.textContent = o.wheel === 'engage' ? 'Click the graph, then scroll to zoom · drag to pan · zoom in for deeper generations' : 'Drag to pan · ⌘/Ctrl + scroll to zoom · zoom in for deeper generations';
        hint.style.left = 'var(--gut)'; hint.style.top = (o.hintTop || 12) + 'px';
        graphHost.appendChild(hint);
        tools.addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          const z = b.dataset.z;
          if (z === 'in') ctl.graph && ctl.graph.zoomBy(1.4);
          if (z === 'out') ctl.graph && ctl.graph.zoomBy(1 / 1.4);
          if (z === 'fit') ctl.graph && ctl.graph.fit(true);
          if (z === 'list') { ctl.list = !ctl.list; b.setAttribute('aria-pressed', String(ctl.list)); toggleList(); }
        });
      }
    }
    function toggleList() {
      if (ctl.list) {
        ov = document.createElement('div'); ov.className = 'ls-overlay';
        ov.style.cssText = `position:absolute;left:0;right:0;top:${o.listTop || 0}px;bottom:${(o.toolsBottom || 14) + 46}px;overflow:auto;background:var(--paper);z-index:1;padding:8px var(--gut-r) 24px var(--gut)`;
        const inner = document.createElement('div'); inner.style.cssText = 'max-width:760px;margin:0 auto'; ov.appendChild(inner);
        graphHost.appendChild(ov);
        ctl.stack = new LineageStack(inner, { root: o.root, active: ctl.sel || o.focus || o.root, onSelect });
        if (gwrap) gwrap.style.visibility = 'hidden';
        if (hint) hint.style.display = 'none';
        const first = ov.querySelector('button'); if (first) first.focus();
      } else {
        if (ctl.stack) ctl.stack.destroy(); ctl.stack = null; if (ov) ov.remove(); ov = null;
        if (gwrap) gwrap.style.visibility = ''; if (hint) hint.style.display = '';
      }
    }
    function build() {
      teardown();
      if (U.mobile()) {
        if (stackHost) ctl.stack = new LineageStack(stackHost, { root: o.root, active: ctl.sel || o.focus || o.root, onSelect });
        if (o.onIntroDone) setTimeout(o.onIntroDone, 0);
      } else buildGraph();
    }
    function teardown() {
      if (ctl.graph) { ctl.graph.destroy(); ctl.graph = null; }
      if (ctl.stack) { ctl.stack.destroy(); ctl.stack = null; }
      [gwrap, tools, hint, ov].forEach(x => x && x.remove()); gwrap = tools = hint = ov = null; ctl.list = false;
    }
    ctl.has = id => (ctl.graph && ctl.graph.has(id)) || (ctl.stack && ctl.stack.has(id));
    ctl.select = id => { if (ctl.stack) ctl.stack.select(id); else if (ctl.graph) ctl.graph.select(id); };
    ctl.addVirtual = (pid, data) => { if (ctl.graph) ctl.graph.addVirtual(pid, data); if (ctl.stack) ctl.stack.addVirtual(pid, data); };
    ctl.destroy = () => { teardown(); MQ.removeEventListener('change', build); };
    ctl.rebuild = () => build();
    MQ.addEventListener('change', build);
    build();
    return ctl;
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ALL.forEach(g => g.remeasure()));

  window.FORK_CORE = { U, GraphCanvas, LineageGraph, MapGraph, LineageStack, mountLineage, bz };
})();
