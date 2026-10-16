/* FORK — Culture Graph: every lineage on one sheet.
   Each family is a plate of fork trees (origin on the left, generations branching right);
   plates are packed like an atlas. Canvas renderer with time playback, signals running down
   recent branches, hover cards and lineage focus. Colours come from CSS tokens. */
(function () {
  'use strict';
  const D = window.FORK_DATA, C = window.FORK_CORE, U = C.U;
  const { byId, DAY } = D;
  const NOW = +D.SAMPLE_NOW;
  const T_START = Date.UTC(2016, 0, 1);
  const GROW = 110 * DAY;
  const clamp = U.clamp;
  const FAM_VAR = { 'viral-animals': '--f-viral', 'ai-celebrities': '--f-ai', 'crypto-mascots': '--f-crypto', 'brainrot': '--f-brainrot', 'reaction-formats': '--f-reaction', 'political-memes': '--f-political', 'game-memes': '--f-game' };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const SANS = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
  const SERIF = SANS;

  let PAL = null, palAt = 0;
  function palette() {
    const now = performance.now(); if (PAL && now - palAt < 800) return PAL;
    const cs = getComputedStyle(document.documentElement), g = v => cs.getPropertyValue(v).trim();
    PAL = { paper: g('--paper'), ink: g('--ink'), ink2: g('--ink-2'), muted: g('--muted'), rule: g('--rule'), cobalt: g('--cobalt'), fam: {} };
    for (const k in FAM_VAR) PAL.fam[k] = g(FAM_VAR[k]) || PAL.cobalt;
    palAt = now; return PAL;
  }
  function rgba(c, a) {
    if (c && c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
    const m = (c || '').match(/[\d.]+/g); return m ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : c;
  }
  function bz(P, t) { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * P[0] + b * P[2] + c * P[4] + d * P[6], a * P[1] + b * P[3] + c * P[5] + d * P[7]]; }

  class CultureNet {
    constructor(host, o) {
      this.host = host; this.o = o || {};
      this.cv = document.createElement('canvas'); this.cv.className = 'net-cv'; this.cv.setAttribute('aria-hidden', 'true');
      host.appendChild(this.cv);
      this.ctx = this.cv.getContext('2d');
      this.cam = { x: 0, y: 0, k: .3 }; this.kFit = .3; this.camAnim = null;
      this.t = U.reduced() || this.o.startNow ? NOW : T_START; this.playing = false;
      this.sel = null; this.hover = null; this.fam = null; this.focusSet = null; this.engaged = false;
      this.build(); this.measure();
      new ResizeObserver(() => { const had = this.W; this.measure(); if (!had || !this.userMoved) this.fit(false, this.fam); this.loop(); }).observe(host);
      this.visible = true;
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }).observe(host);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.loop(); });
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { PAL = null; this.loop(); });
      window.addEventListener('fork-theme', () => { PAL = null; this.loop(); });
      this.bind(); this.loop();
    }
    build() {
      const DX = 118, DY = 12, TITLE = 96, PADX = 30, LABEL = 190;
      this.nodes = []; this.edges = []; this.hubs = [];
      const idx = new Map();
      const blocks = D.FAMILIES.map(f => {
        const roots = D.roots.filter(r => r.family === f.id).sort((a, b) => a.t - b.t);
        const recs = []; let leafY = 0, maxDepth = 0;
        const place = (id, depth, parent) => {
          const n = byId.get(id); let y;
          if (!n.children.length) { y = leafY; leafY += DY; }
          else { const ys = n.children.map(c => place(c, depth + 1, id)); y = (ys[0] + ys[ys.length - 1]) / 2; }
          maxDepth = Math.max(maxDepth, depth);
          recs.push({ id, d: n, lx: depth * DX, ly: y, depth, fam: f.id, famOf: n.family, pid: parent, t: n.t, rad: 1.7 + Math.sqrt(n.descendants + 1) * (depth === 0 ? .9 : .6) });
          return y;
        };
        roots.forEach((r, i) => { if (i) leafY += DY * 1.8; place(r.id, 0, null); });
        return { f, recs, w: PADX * 2 + maxDepth * DX + LABEL, h: TITLE + leafY + 24 };
      });
      const area = blocks.reduce((s, b) => s + b.w * b.h, 0), target = Math.sqrt(area * 1.45), GAP = 130;
      blocks.sort((a, b) => b.h - a.h);
      let x = 0, y = 0, rowH = 0, maxW = 0;
      for (const b of blocks) {
        if (x > 0 && x + b.w > target) { x = 0; y += rowH + GAP; rowH = 0; }
        b.x = x; b.y = y; x += b.w + GAP; rowH = Math.max(rowH, b.h); maxW = Math.max(maxW, x - GAP);
      }
      const totH = y + rowH, ox = -maxW / 2, oy = -totH / 2;
      for (const b of blocks) {
        b.x += ox; b.y += oy;
        this.hubs.push({ id: 'hub:' + b.f.id, fam: b.f.id, x: b.x, y: b.y, w: b.w, h: b.h, hub: true, name: b.f.name, count: b.recs.length });
        for (const r of b.recs) { r.x = b.x + PADX + r.lx; r.y = b.y + TITLE + r.ly; idx.set(r.id, r); this.nodes.push(r); }
      }
      this.idx = idx;
      const maxD = Math.max(...D.roots.map(r => r.descendants));
      for (const n of this.nodes) {
        if (!n.pid) continue;
        const P = idx.get(n.pid), dx = n.x - P.x;
        this.edges.push({ p: P, c: n, cp: [P.x, P.y, P.x + dx * .62, P.y, P.x + dx * .38, n.y, n.x, n.y],
          w: .8 + 3.2 * Math.sqrt(n.d.descendants + 1) / Math.sqrt(maxD + 1), rel: n.d.relation, seed: Math.random() * 10 });
      }
    }
    measure() {
      const r = this.host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      this.W = r.width; this.H = r.height; this.dpr = dpr;
      this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.height * dpr);
      this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px';
    }
    band() { return this.o.band ? this.o.band(this) : { top: 20, right: 20, bottom: 20, left: 20 }; }
    fit(animate, fam) {
      if (!this.W) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const h of this.hubs) { if (fam && h.fam !== fam) continue; x0 = Math.min(x0, h.x); x1 = Math.max(x1, h.x + h.w); y0 = Math.min(y0, h.y); y1 = Math.max(y1, h.y + h.h); }
      const b = this.band(), aw = Math.max(100, this.W - b.left - b.right), ah = Math.max(100, this.H - b.top - b.bottom);
      const k = Math.min(aw / (x1 - x0), ah / (y1 - y0), fam ? 1.8 : 1.2);
      if (!fam) this.kFit = k;
      const sxc = b.left + aw / 2, syc = b.top + ah / 2;
      const cam = { x: (x0 + x1) / 2 - (sxc - this.W / 2) / k, y: (y0 + y1) / 2 - (syc - this.H / 2) / k, k };
      if (animate && !U.reduced()) this.camAnim = { from: Object.assign({}, this.cam), to: cam, t0: performance.now(), d: 850 }; else this.cam = cam;
      this.loop();
    }
    flyTo(x, y, k, off) {
      const b = this.band(), sxc = (this.W - (off || 0)) / 2 - 60, syc = b.top + (this.H - b.top - b.bottom) / 2;
      const cam = { x: x - (sxc - this.W / 2) / k, y: y - (syc - this.H / 2) / k, k };
      if (U.reduced()) this.cam = cam; else this.camAnim = { from: Object.assign({}, this.cam), to: cam, t0: performance.now(), d: 850 };
      this.loop();
    }
    sx(x) { return (x - this.cam.x) * this.cam.k + this.W / 2; }
    sy(y) { return (y - this.cam.y) * this.cam.k + this.H / 2; }

    play() {
      if (U.reduced()) { this.t = NOW; this.emitTime(); return; }
      this.playing = true; this.p0 = performance.now(); this.tFrom = this.t >= NOW - DAY ? T_START : this.t;
      this.playDur = 9000 * (NOW - this.tFrom) / (NOW - T_START);
      if (this.o.onPlay) this.o.onPlay(true); this.loop();
    }
    pause() { this.playing = false; if (this.o.onPlay) this.o.onPlay(false); }
    setTime(t) { this.t = clamp(t, T_START, NOW); this.pause(); this.emitTime(); this.loop(); }
    emitTime() { if (this.o.onTime) this.o.onTime(this.t); }
    engage() { if (this.o.onEngage) this.o.onEngage(); }

    lineage(id) { const s = new Set([id]); let n = byId.get(id); while (n && n.parent) { s.add(n.parent); n = byId.get(n.parent); } D.subtree(id).forEach(x => s.add(x.id)); return s; }
    select(id, opt) {
      const n = this.idx.get(id); if (!n) return;
      this.sel = id; this.focusSet = this.lineage(id); this.fam = null;
      if (this.t < n.t) this.setTime(NOW);
      this.engage();
      this.flyTo(n.x, n.y, Math.max(this.cam.k, this.kFit * 2.4, .9), opt && opt.off);
      if (this.o.onSelect && !(opt && opt.silent)) this.o.onSelect(id);
    }
    clear() { this.sel = null; this.focusSet = null; this.loop(); }
    setFamily(fid) {
      this.sel = null; this.fam = fid; this.focusSet = null;
      if (fid) this.engage();
      this.userMoved = !!fid; this.fit(true, fid);
    }

    bind() {
      const cv = this.cv; const pts = new Map(); let drag = null, moved = 0, pinch = null;
      const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener('pointerdown', e => {
        pts.set(e.pointerId, pos(e)); this.engaged = true; this.camAnim = null;
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: this.cam.k }; }
        drag = { p: pos(e), cx: this.cam.x, cy: this.cam.y }; moved = 0;
      });
      cv.addEventListener('pointermove', e => {
        const p = pos(e);
        if (pts.has(e.pointerId)) {
          pts.set(e.pointerId, p);
          if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; this.engage(); this.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d / this.cam.k); moved = 99; return; }
          if (drag) {
            const dx = p[0] - drag.p[0], dy = p[1] - drag.p[1]; moved = Math.max(moved, Math.hypot(dx, dy));
            if (moved > 4) { this.engage(); this.userMoved = true; cv.style.cursor = 'grabbing'; try { cv.setPointerCapture(e.pointerId); } catch (_) { } this.cam = { x: drag.cx - dx / this.cam.k, y: drag.cy - dy / this.cam.k, k: this.cam.k }; this.hideCard(); this.loop(); return; }
          }
        }
        const h = this.pick(p[0], p[1]);
        if (h !== this.hover) { this.hover = h; cv.style.cursor = h ? 'pointer' : 'grab'; this.loop(); }
        if (h) this.showCard(h, e.clientX, e.clientY); else this.hideCard();
      });
      const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { drag = null; cv.style.cursor = this.hover ? 'pointer' : 'grab'; } };
      cv.addEventListener('pointerup', e => {
        const was = moved; up(e); if (was > 4) return;
        const p = pos(e), h = this.pick(p[0], p[1]);
        if (h && h.hub) this.setFamily(h.fam);
        else if (h) this.select(h.id, { off: this.o.inspOffset ? this.o.inspOffset() : 0 });
        else if (this.sel || this.fam) { this.fam = null; this.clear(); if (this.o.onClear) this.o.onClear(); }
        else this.engage();
      });
      cv.addEventListener('pointercancel', up);
      cv.addEventListener('pointerleave', () => { this.engaged = false; this.hover = null; this.hideCard(); this.loop(); });
      cv.addEventListener('wheel', e => {
        if (!(this.engaged || this.o.alwaysWheel || e.ctrlKey || e.metaKey)) { if (this.o.onWheelHint) this.o.onWheelHint(); return; }
        e.preventDefault(); const p = pos(e); this.userMoved = true; this.engage();
        this.zoomAt(p[0], p[1], Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0018)));
      }, { passive: false });
    }
    zoomAt(mx, my, f) {
      const c = this.cam, k1 = clamp(c.k * f, this.kFit * .6, 3.4);
      const wx = c.x + (mx - this.W / 2) / c.k, wy = c.y + (my - this.H / 2) / c.k;
      this.camAnim = null; this.cam = { x: wx - (mx - this.W / 2) / k1, y: wy - (my - this.H / 2) / k1, k: k1 }; this.loop();
    }
    zoomBy(f) { this.userMoved = true; this.engage(); this.zoomAt(this.W / 2, this.H / 2, f); }
    titleBox(h) { const x = this.sx(h.x), y = this.sy(h.y), fs = clamp(30 * this.cam.k, 15, 30); return [x, y - 4, x + 30 + h.name.length * fs * .5 + 90, y + fs + 12]; }
    pick(mx, my) {
      let best = null, bd = 11;
      const rs = this.rScale();
      for (const n of this.nodes) {
        if (n.t > this.t) continue;
        const d = Math.hypot(this.sx(n.x) - mx, this.sy(n.y) - my) - n.rad * rs;
        if (d < bd) { bd = d; best = n; }
      }
      if (best) return best;
      for (const h of this.hubs) { const b = this.titleBox(h); if (mx >= b[0] && mx <= b[2] && my >= b[1] && my <= b[3]) return h; }
      return null;
    }
    rScale() { return clamp(this.cam.k / this.kFit * .85, .8, 2.2); }
    showCard(n, cx, cy) {
      const card = this.o.card; if (!card) return;
      const P = palette();
      if (n.hub) card.innerHTML = `<p class="nc-fam" style="--fc:${P.fam[n.fam]}">Family</p><b>${U.esc(n.name)}</b><p class="nc-meta">${n.count} objects · click to isolate</p>`;
      else {
        const d = n.d, p = d.parent ? byId.get(d.parent) : null;
        card.innerHTML = `<p class="nc-fam" style="--fc:${P.fam[d.family]}">${U.esc(U.famName(d.family))} · ${d.type}</p><b>${U.esc(d.name)}</b>
          <p class="nc-meta">${U.day(d)} · ${U.plat(d.platform)}${p ? ' · from ' + U.esc(p.name) : ' · origin'}</p>
          <div class="nc-stats"><span><i>${d.score}</i>score</span><span><i>${d.forks}</i>forks</span><span><i>${d.descendants}</i>desc.</span></div>
          <p class="nc-foot"><span class="chip s-${d.status}">${d.status}</span>${d.doc ? '<span class="doc-b">Documented</span>' : '<span class="sample">Sample</span>'}</p>`;
      }
      card.hidden = false;
      const r = card.getBoundingClientRect(), hr = this.host.getBoundingClientRect();
      let L = cx - hr.left + 16, T = cy - hr.top + 16;
      if (L + r.width > this.W - 8) L = cx - hr.left - r.width - 16;
      if (T + r.height > this.H - 8) T = cy - hr.top - r.height - 16;
      card.style.left = Math.max(8, L) + 'px'; card.style.top = Math.max(8, T) + 'px';
    }
    hideCard() { if (this.o.card) this.o.card.hidden = true; }

    loop() { if (!this.raf) this.raf = requestAnimationFrame(t => this.frame(t)); }
    frame(now) {
      this.raf = 0;
      if (!this.W || !this.visible || document.hidden) return;
      if (this.playing) {
        const p = clamp((now - this.p0) / this.playDur, 0, 1), w = 1 - Math.pow(1 - p, 1.9);
        this.t = this.tFrom + (NOW - this.tFrom) * w;
        if (p >= 1) { this.t = NOW; this.playing = false; if (this.o.onPlay) this.o.onPlay(false); }
        if (!this.lastEmit || now - this.lastEmit > 60 || !this.playing) { this.lastEmit = now; this.emitTime(); }
      }
      if (this.camAnim) { const a = this.camAnim, p = clamp((now - a.t0) / a.d, 0, 1), e = ease(p); this.cam = { x: a.from.x + (a.to.x - a.from.x) * e, y: a.from.y + (a.to.y - a.from.y) * e, k: a.from.k + (a.to.k - a.from.k) * e }; if (p >= 1) this.camAnim = null; }
      this.draw(now);
      if (this.playing || this.camAnim || (this.t >= NOW - DAY && !U.reduced())) this.loop();
    }
    draw(now) {
      const ctx = this.ctx, k = this.cam.k, t = this.t, P = palette();
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.W, this.H);
      const hov = this.hover && !this.hover.hub ? this.lineage(this.hover.id) : null, lit = hov || this.focusSet;
      const zw = Math.sqrt(clamp(k / this.kFit, .7, 3));
      // plate rules: a hairline that forks into each family title
      for (const h of this.hubs) {
        const x = this.sx(h.x), y = this.sy(h.y), w = h.w * k;
        if (x > this.W || x + w < 0 || y > this.H || y + h.h * k < 0) continue;
        const col = P.fam[h.fam];
        ctx.globalAlpha = this.fam && this.fam !== h.fam ? .25 : 1;
        ctx.strokeStyle = rgba(P.ink, .28); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y + .5); ctx.lineTo(x + w, y + .5); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x, y + .5); ctx.bezierCurveTo(x + 11, y + .5, x + 9, y + 13, x + 21, y + 13); ctx.stroke();
        ctx.fillStyle = P.paper; ctx.beginPath(); ctx.arc(x + 23, y + 13, 2.5, 0, 7); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // branches
      ctx.lineCap = 'round';
      for (const e of this.edges) {
        const c = e.c, g = clamp((t - c.t) / GROW, 0, 1); if (g <= 0) continue;
        const S = e.cp.map((v, i) => i % 2 ? this.sy(v) : this.sx(v));
        if (Math.max(S[0], S[6]) < -20 || Math.min(S[0], S[6]) > this.W + 20 || Math.max(S[1], S[7]) < -20 || Math.min(S[1], S[7]) > this.H + 20) continue;
        const age = (t - c.t) / DAY, inLit = lit ? lit.has(c.id) && lit.has(c.pid) : true;
        const col = P.fam[c.famOf] || P.cobalt;
        let a = age < 75 ? 1 : age < 500 ? .8 : .6;
        if (lit && !inLit) a *= .12; else if (this.fam && c.fam !== this.fam) a *= .18;
        ctx.strokeStyle = rgba(col, a);
        ctx.lineWidth = e.w * zw * (lit && inLit ? 1.4 : 1) * (age < 75 ? 1.25 : 1);
        ctx.setLineDash(e.rel === 'DISPUTED' ? [.5, 3.6 * zw] : e.rel === 'LIKELY' ? [5 * zw, 3.5 * zw] : []);
        ctx.beginPath(); ctx.moveTo(S[0], S[1]);
        if (g >= 1) ctx.bezierCurveTo(S[2], S[3], S[4], S[5], S[6], S[7]);
        else { for (let i = 1; i <= 14; i++) { const q = bz(S, g * i / 14); ctx.lineTo(q[0], q[1]); } }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // signals running down branches forked in the last 75 days
      if (t >= NOW - DAY && !U.reduced()) {
        const sec = now / 1000;
        for (const e of this.edges) {
          if (NOW - e.c.t > 75 * DAY) continue;
          if (lit && !lit.has(e.c.id)) continue;
          if (this.fam && e.c.fam !== this.fam) continue;
          const ph = ((sec * .45 + e.seed) % 1.7) / 1.7; if (ph > 1) continue;
          const S = e.cp.map((v, i) => i % 2 ? this.sy(v) : this.sx(v)), col = P.fam[e.c.famOf] || P.cobalt;
          for (let j = 0; j < 4; j++) { const q = bz(S, clamp(ph - j * .04, 0, 1)); ctx.fillStyle = rgba(col, j ? .35 / j : 1); ctx.beginPath(); ctx.arc(q[0], q[1], (j ? 1.6 : 2.5) * Math.min(1.4, zw), 0, 7); ctx.fill(); }
        }
      }
      // nodes
      const rs = this.rScale();
      for (const n of this.nodes) {
        const g = clamp((t - n.t) / GROW, 0, 1); if (g <= .02) continue;
        const x = this.sx(n.x), y = this.sy(n.y); if (x < -20 || x > this.W + 20 || y < -20 || y > this.H + 20) continue;
        const age = (t - n.t) / DAY, inLit = lit ? lit.has(n.id) : true, col = P.fam[n.famOf] || P.cobalt;
        let a = inLit ? 1 : .15; if (this.fam && n.fam !== this.fam) a *= .2;
        const r = n.rad * rs * (this.hover === n ? 1.5 : 1) * (.4 + .6 * g);
        ctx.globalAlpha = a;
        if (n.depth === 0) {
          // origin: the FORK mark lying along the time axis
          ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, r + 1.4, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x + r * .6, y - r * .3); ctx.bezierCurveTo(x + r + 4, y - r * .3, x + r + 2, y - r - 7, x + r + 9, y - r - 7); ctx.stroke();
          ctx.fillStyle = P.paper; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x + r + 10.5, y - r - 7, 2, 0, 7); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillStyle = age < 75 || n.d.doc ? col : P.paper; ctx.strokeStyle = col; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        }
        if (this.sel === n.id) { ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 7); ctx.stroke(); }
        const rip = t - n.t;
        if (!U.reduced() && rip >= 0 && rip < 45 * DAY && inLit) {
          const q = this.playing ? rip / (45 * DAY) : ((now / 1000 * .55 + (n.d.t / DAY) % 7 / 7) % 1);
          ctx.strokeStyle = rgba(col, .6 * (1 - q)); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r + 3 + q * 15, 0, 7); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      this.drawLabels(lit, P);
    }
    drawLabels(lit, P) {
      const ctx = this.ctx, k = this.cam.k, rel = k / this.kFit, t = this.t, boxes = [];
      const free = b => !boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
      ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.textAlign = 'left';
      for (const h of this.hubs) {
        const x = this.sx(h.x), y = this.sy(h.y);
        if (x > this.W || x + h.w * k < 0 || y > this.H || y + h.h * k < 0) continue;
        const fs = clamp(26 * k, 12, 22);
        ctx.globalAlpha = this.fam && this.fam !== h.fam ? .3 : 1;
        ctx.font = `500 ${fs}px ${SERIF}`; ctx.fillStyle = P.ink;
        ctx.fillText(h.name, x + 32, y + fs * .95 + 4);
        const tw = ctx.measureText(h.name).width;
        const vis = this.nodes.filter(n => n.fam === h.fam && n.t <= t).length;
        ctx.font = `400 ${clamp(10.5 * Math.sqrt(rel), 9.5, 11.5)}px ${SANS}`; ctx.fillStyle = P.muted;
        ctx.fillText(`${vis} objects`, x + 32 + tw + 10, y + fs * .95 + 3);
        boxes.push([x, y - 4, x + 32 + tw + 90, y + fs + 12]);
        ctx.globalAlpha = 1;
      }
      const cands = [];
      for (const n of this.nodes) {
        if (n.t > t) continue;
        const inLit = lit ? lit.has(n.id) : false;
        let pri;
        if (this.hover === n) pri = 1e7; else if (this.sel === n.id) pri = 1e6;
        else if (inLit) pri = 5e5 - n.depth * 10;
        else if (lit) continue;
        else {
          if (this.fam && n.fam !== this.fam) continue;
          pri = n.d.forks30 * 300 + (n.depth === 0 ? 2000 : 0) + (n.d.doc ? 600 : 0) + n.d.score * 4;
          if (rel < 1.5 && n.depth > 0 && !n.d.doc && n.d.forks30 < 4 && !this.fam) continue;
        }
        cands.push([pri, n]);
      }
      cands.sort((a, b) => b[0] - a[0]);
      const max = lit ? 70 : Math.round((this.W < 600 ? 7 : 28) * rel * (this.fam ? 2.2 : 1));
      let shown = 0;
      const rs = this.rScale();
      for (const [pri, n] of cands) {
        if (shown >= max && pri < 1e6) break;
        const x = this.sx(n.x), y = this.sy(n.y); if (x < -10 || x > this.W || y < 0 || y > this.H) continue;
        const big = pri >= 1e6 || n.depth === 0;
        ctx.font = big ? `500 ${n.depth === 0 ? 13 : 12}px ${SERIF}` : `400 11px ${SERIF}`;
        const w = ctx.measureText(n.d.name).width, r = n.rad * rs;
        const lx = x + r + (n.depth === 0 ? 16 : 6), ly = n.depth === 0 ? y + 5 : y - 3, b = [lx - 2, ly - 11, lx + w + 3, ly + 4];
        if (pri < 1e6 && !free(b)) continue;
        boxes.push(b); shown++;
        ctx.lineWidth = 4; ctx.strokeStyle = rgba(P.paper, .92); ctx.strokeText(n.d.name, lx, ly);
        ctx.fillStyle = pri >= 1e6 ? P.cobalt : (lit || n.depth === 0 ? P.ink : P.ink2); ctx.fillText(n.d.name, lx, ly);
      }
    }
  }

  /* ---------------- timeline scrubber ---------------- */
  function Scrubber(host, net) {
    const months = []; for (let y = 2016, m = 0; Date.UTC(y, m, 1) <= NOW; m++) { if (m > 11) { m = 0; y++; } months.push(Date.UTC(y, m, 1)); }
    const cnt = f => months.map((m, i) => { const end = months[i + 1] || NOW + DAY; return D.nodes.filter(n => f(n) && n.t >= m && n.t < end).length; });
    const all = cnt(n => n.parent), doc = cnt(n => n.doc);
    const max = Math.max(...all), W = 1000, H = 40, bw = W / months.length;
    const bar = (c, cls) => c.map((v, i) => v ? `<rect x="${(i * bw + .5).toFixed(2)}" y="${(H - v / max * H).toFixed(2)}" width="${(bw - 1).toFixed(2)}" height="${(v / max * H).toFixed(2)}" class="${cls}"/>` : '').join('');
    const years = []; for (let y = 2016; y <= 2026; y++) years.push(`<span style="left:${((Date.UTC(y, 0, 1) - T_START) / (NOW - T_START) * 100).toFixed(2)}%">${y}</span>`);
    host.innerHTML = `
      <button class="sc-play" type="button" aria-label="Replay ten years of forks"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="pl" d="M4 2.5L13 8 4 13.5Z"/><g class="pa"><rect x="3.5" y="2.5" width="3" height="11"/><rect x="9.5" y="2.5" width="3" height="11"/></g></svg></button>
      <div class="sc-track" role="slider" tabindex="0" aria-label="Timeline" aria-valuemin="2016" aria-valuemax="2026">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${bar(all, 'sb')}${bar(doc, 'sd')}</svg>
        <div class="sc-head"><span></span></div><div class="sc-years">${years.join('')}</div>
      </div>
      <div class="sc-read"><b class="sc-date">—</b><span class="sc-live">Now</span></div>`;
    const track = host.querySelector('.sc-track'), head = host.querySelector('.sc-head'), date = host.querySelector('.sc-date'), live = host.querySelector('.sc-live'), play = host.querySelector('.sc-play');
    const at = e => { const r = track.getBoundingClientRect(); return T_START + clamp((e.clientX - r.left) / r.width, 0, 1) * (NOW - T_START); };
    let dragging = false;
    track.addEventListener('pointerdown', e => { dragging = true; track.setPointerCapture(e.pointerId); net().setTime(at(e)); });
    track.addEventListener('pointermove', e => { if (dragging) net().setTime(at(e)); });
    track.addEventListener('pointerup', () => { dragging = false; });
    track.addEventListener('keydown', e => { const n = net(), step = 90 * DAY; if (e.key === 'ArrowLeft') { n.setTime(n.t - step); e.preventDefault(); } if (e.key === 'ArrowRight') { n.setTime(n.t + step); e.preventDefault(); } if (e.key === 'End') n.setTime(NOW); if (e.key === 'Home') n.setTime(T_START); });
    play.addEventListener('click', () => { const n = net(); if (n.playing) n.pause(); else n.play(); });
    return {
      set(t) { const p = (t - T_START) / (NOW - T_START) * 100; head.style.left = p + '%'; date.textContent = U.fmtMon(t); live.classList.toggle('on', t >= NOW - DAY); track.setAttribute('aria-valuetext', U.fmtMon(t)); },
      setPlaying(p) { play.classList.toggle('on', p); play.setAttribute('aria-label', p ? 'Pause' : 'Replay ten years of forks'); }
    };
  }

  window.FORK_NET = { CultureNet, Scrubber, FAM_VAR, palette, T_START };
})();
