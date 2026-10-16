/* FORK — views, routing, inspector, search, trace, mutation, archive. */
(function () {
  'use strict';
  const D = window.FORK_DATA, C = window.FORK_CORE, U = C.U;
  const { byId, DAY } = D;
  const NOW = +D.SAMPLE_NOW;
  const { $, $$, esc } = U;
  const node = id => byId.get(id);
  const TRAIT_L = Object.fromEntries(D.TRAITS);

  /* ---------------- tooltip ---------------- */
  const tip = $('#tip');
  const TIP = {
    show(html, x, y) { if (!html) return; tip.innerHTML = html; tip.classList.add('on'); this.move(x, y); },
    move(x, y) { const r = tip.getBoundingClientRect(); let L = x + 14, T = y + 16; if (L + r.width > innerWidth - 8) L = x - r.width - 14; if (T + r.height > innerHeight - 8) T = y - r.height - 12; tip.style.left = Math.max(8, L) + 'px'; tip.style.top = Math.max(8, T) + 'px'; },
    hide() { tip.classList.remove('on'); }
  };
  window.FORK_TIP = TIP;
  const BASIS = [['timestamp', 'Timestamp precedence'], ['reference', 'Direct reference'], ['media', 'Shared media'], ['crosslink', 'Platform links']];
  function confTip(n) {
    if (!n.parent) return `<span class="tl">Origin confidence · ${U.pct(n.conf)}%</span><br>How sure the archive is that this is the earliest copy.<ul><li><i>✓</i>Earliest timestamp in the sample archive</li>${n.evidence.map(e => `<li><i>✓</i>${esc(D.EVIDENCE_KINDS[e.kind])}</li>`).join('')}</ul>`;
    const k = new Set(n.evidence.map(e => e.kind));
    const extra = n.evidence.filter(e => !BASIS.some(b => b[0] === e.kind));
    return `<span class="tl">Link confidence · ${U.pct(n.conf)}% · ${n.relation}</span><br>Based on:<ul>${BASIS.map(([kk, l]) => `<li class="${k.has(kk) ? '' : 'no'}"><i>${k.has(kk) ? '✓' : '–'}</i>${l}</li>`).join('')}${extra.map(e => `<li><i>${e.kind === 'counter' ? '✕' : '✓'}</i>${esc(D.EVIDENCE_KINDS[e.kind])}</li>`).join('')}</ul><br>Sample evidence. Path confidence from origin: ${U.pct(n.pathConf)}%.`;
  }
  function scoreTip(n) {
    return `<span class="tl">Fork score · ${n.score} / 100</span><br>How much culture this spawned downstream, from the lineage graph only. No reach, followers or prices.<ul>
      <li><i>${n.forks}</i>direct forks ×2</li><li><i>${n.descendants}</i>descendants ×0.5</li><li><i>${n.depthBelow}</i>generations below ×5</li>
      <li><i>${n.platforms}</i>platforms reached ×4 (minus one)</li><li><i>${n.yearsActive.toFixed(1)}</i>years active ×2</li></ul><br>score = 100·(1 − e^(−sum/40)). Sample data.`;
  }
  const TIPS = { conf: id => confTip(node(id)), score: id => scoreTip(node(id)), path: id => `<span class="tl">Path confidence</span><br>Product of every link's confidence from the origin down to this object.` };
  function tipFor(el) { const [k, id] = el.dataset.tipk.split(':'); return TIPS[k] ? TIPS[k](id) : ''; }
  let tipPinned = null;
  document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('[data-tipk]'); if (t && e.pointerType === 'mouse') { const r = t.getBoundingClientRect(); TIP.show(tipFor(t), r.left, r.bottom); } });
  document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('[data-tipk]'); if (t && t !== tipPinned) TIP.hide(); });
  document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('[data-tipk]'); if (t) { const r = t.getBoundingClientRect(); TIP.show(tipFor(t), r.left, r.bottom); } });
  document.addEventListener('focusout', e => { if (e.target.closest && e.target.closest('[data-tipk]')) TIP.hide(); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tipk]');
    if (t) { e.preventDefault(); if (tipPinned === t) { tipPinned = null; TIP.hide(); } else { tipPinned = t; const r = t.getBoundingClientRect(); TIP.show(tipFor(t), r.left, r.bottom); } return; }
    if (tipPinned) { tipPinned = null; TIP.hide(); }
  });
  const info = (k, id, label) => `<button class="info" type="button" data-tipk="${k}:${id}" aria-label="${esc(label)}">i</button>`;

  /* ---------------- shared bits ---------------- */
  const chipS = s => `<span class="chip s-${s}">${s}</span>`;
  const chipR = r => `<span class="chip r-${r}">${r}</span>`;
  function autoDesc(n) {
    if (n.desc) return n.desc;
    const p = node(n.parent);
    const ch = n.changed.filter(k => k !== 'platform').map(k => TRAIT_L[k].toLowerCase());
    return `A ${U.typeL(n.type).toLowerCase()} forked from ${p.name} on ${U.plat(n.platform)}.` + (ch.length ? ` It changed the ${ch.join(', ')}.` : ' It kept the parent’s traits.');
  }
  function spark(vals) {
    const w = 128, h = 34, m = Math.max(1, ...vals), st = w / (vals.length - 1);
    const pts = vals.map((v, i) => [i * st, h - 3 - v / m * (h - 9)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
    const last = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line class="g" x1="0" x2="${w}" y1="${h - 3}" y2="${h - 3}"/><path class="a" d="${line}L${w},${h - 3}L0,${h - 3}Z"/><path class="l" d="${line}"/><circle cx="${last[0]}" cy="${last[1]}" r="2.6"/></svg>`;
  }
  function miniTree(rootId, w, h) {
    const r = node(rootId); let leaf = 0; const pos = new Map(), maxD = r.depthBelow || 1;
    const place = id => { const n = node(id); let y; if (!n.children.length) y = leaf++; else { const ys = n.children.map(place); y = (ys[0] + ys[ys.length - 1]) / 2; } pos.set(id, y); return y; };
    place(rootId);
    const sx = d => 4 + (d - r.depth) / maxD * (w - 10), sy = y => 4 + (leaf > 1 ? y / (leaf - 1) : .5) * (h - 8);
    let paths = '';
    const walk = id => { const n = node(id); n.children.forEach(c => { const cn = node(c); const x0 = sx(n.depth), y0 = sy(pos.get(id)), x1 = sx(cn.depth), y1 = sy(pos.get(c)), dx = x1 - x0; paths += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)}C${(x0 + dx * .62).toFixed(1)},${y0.toFixed(1)} ${(x0 + dx * .38).toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}" stroke-width="${(.6 + 1.6 * Math.sqrt(cn.descendants + 1) / Math.sqrt(r.descendants + 1)).toFixed(2)}"${cn.relation === 'VERIFIED' ? '' : ' stroke-dasharray="2 2.5"'}/>`; walk(c); }); };
    walk(rootId);
    return `<svg class="mini" viewBox="0 0 ${w} ${h}" aria-hidden="true">${paths}<circle cx="${sx(r.depth)}" cy="${sy(pos.get(rootId))}" r="3.2"/></svg>`;
  }
  function pathTo(id) { return D.ancestors(id).concat(node(id)); }

  /* ---------------- inspector ---------------- */
  const insp = $('#insp'), scrim = $('#scrim');
  let inspCtx = null;
  function openInspector(id, ctl) {
    const n = node(id); if (!n) return;
    inspCtx = { id, ctl };
    const p = n.parent ? node(n.parent) : null;
    const cmp = p ? `#compare.${D.ancestors(id)[0].id}.${id}` : (n.children.length ? `#compare.${id}.${deepestChange(id)}` : null);
    insp.innerHTML = `
      <div class="insp-top"><p class="eyebrow">${U.typeL(n.type)} · ${esc(U.famName(n.family))} ${n.doc ? '<span class="doc-b">Documented</span>' : '<span class="sample">Sample</span>'}</p><button class="insp-x" type="button" aria-label="Close inspector">×</button></div>
      <h2>${esc(n.name)}</h2>
      <p class="desc">${esc(autoDesc(n))}</p>
      <div class="insp-score">
        <div><span class="label">Fork score ${info('score', id, 'How fork score is computed')}</span><span class="v c">${n.score}</span></div>
        <div><span class="label">Confidence ${info('conf', id, 'What confidence is based on')}</span><span class="v">${U.pct(n.conf)}%</span></div>
      </div>
      <dl class="dl">
        <dt>Type</dt><dd>${U.typeL(n.type)}</dd>
        <dt>Origin date</dt><dd>${U.day(n)}</dd>
        <dt>Source</dt><dd>${U.plat(n.platform)}${n.handle ? ' · ' + esc(n.handle) : ''}${n.ticker ? ' · ' + esc(n.ticker) : ''}</dd>
        <dt>Parent</dt><dd>${p ? `<button class="link" type="button" data-parent="${p.id}">${esc(p.name)}</button> ${chipR(n.relation)}` : 'None. This is an origin.'}</dd>
        <dt>Direct forks</dt><dd>${n.forks}</dd>
        <dt>Total descendants</dt><dd>${n.descendants}</dd>
        <dt>Fork depth</dt><dd>Generation ${n.depth} · ${n.depthBelow} below</dd>
        <dt>Status</dt><dd>${chipS(n.status)}</dd>
      </dl>
      <div class="insp-acts">
        <a class="btn primary" href="#o.${id}">View full lineage</a>
        <div class="row2">${cmp ? `<a class="btn" href="${cmp}">Compare mutation</a>` : '<button class="btn" type="button" disabled>Compare mutation</button>'}${n.doc ? `<a class="btn" href="${esc(n.url)}" target="_blank" rel="noopener">Open source ↗</a>` : '<button class="btn" type="button" aria-disabled="true" title="Sample object: no live source">Open source</button>'}</div>
      </div>
      ${n.doc ? `<div style="margin-top:18px"><p class="label" style="margin:0 0 8px">Sources</p><ul class="srcs">${n.sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></div>
      <p class="insp-note">Documented from public reporting. Dates marked ~ are approximate; “Reported” means first reported on that date.</p>` : `<p class="insp-note"><span class="sample">Sample data</span> Fictional object for demonstration. Its source is a placeholder (${esc(n.url)}).</p>`}`;
    insp.classList.add('open'); document.body.classList.add('insp-open');
    if (U.mobile()) { scrim.classList.add('on'); insp.focus({ preventScroll: true }); }
    insp.scrollTop = 0;
  }
  window.addEventListener('scroll', () => {
    if (!inspCtx || !inspCtx.ctl || U.mobile()) return;
    const g = inspCtx.ctl.graph || inspCtx.ctl;
    const host = g && g.host; if (!host || !host.getBoundingClientRect) return;
    const r = host.getBoundingClientRect(); if (r.bottom < 60 || r.top > innerHeight) closeInspector();
  }, { passive: true });
  function closeInspector() { insp.classList.remove('open'); scrim.classList.remove('on'); document.body.classList.remove('insp-open'); inspCtx = null; }
  insp.addEventListener('click', e => {
    if (e.target.closest('.insp-x')) { closeInspector(); return; }
    const pb = e.target.closest('[data-parent]');
    if (pb) {
      const pid = pb.dataset.parent;
      if (inspCtx && inspCtx.ctl && inspCtx.ctl.has && inspCtx.ctl.has(pid)) inspCtx.ctl.select(pid);
      else location.hash = '#o.' + pid;
      return;
    }
    if (e.target.closest('a[href^="#"]')) closeInspector();
  });
  scrim.addEventListener('click', closeInspector);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#srch').hidden) closeSearch(); else if (insp.classList.contains('open')) closeInspector(); } });
  const onSelect = (id, ctl) => openInspector(id, ctl);

  function deepestChange(aid) {
    const sub = D.subtree(aid); if (!sub.length) return null;
    const a = node(aid);
    let best = sub[0], bs = -1;
    sub.forEach(n => { const s = D.TRAITS.filter(([k]) => n.fullTraits[k] !== a.fullTraits[k]).length * 10 + n.depth - n.t / 1e13; if (s > bs) { bs = s; best = n; } });
    return best.id;
  }

  /* ---------------- search ---------------- */
  function parseUrl(q) {
    const s = q.trim();
    if (/^sample:\/\//i.test(s)) { const id = s.split('/').pop(); return { isUrl: true, sampleId: id, platform: null }; }
    if (!/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/|$)/i.test(s)) return { isUrl: false };
    const u = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const host = u.split('/')[0].toLowerCase(), parts = u.split(/[/?#]/).slice(1).filter(Boolean);
    const map = [[/(^|\.)x\.com$|twitter\.com$/, 'X'], [/facebook\.com$/, 'FACEBOOK'], [/roblox\.com$/, 'ROBLOX'], [/tiktok\.com$/, 'TIKTOK'], [/instagram\.com$/, 'INSTAGRAM'], [/reddit\.com$/, 'REDDIT'], [/youtube\.com$|youtu\.be$/, 'YOUTUBE'], [/tumblr\.com$/, 'TUMBLR'], [/twitch\.tv$/, 'TWITCH'], [/discord\.(gg|com)$/, 'DISCORD']];
    const m = map.find(([re]) => re.test(host));
    let handle = null;
    if (parts[0] === 'u' || parts[0] === 'user') handle = 'u/' + parts[1];
    else if (parts[0]) handle = parts[0].startsWith('@') ? parts[0] : (m && /^(X|INSTAGRAM|TIKTOK)$/.test(m[1]) ? '@' + parts[0] : null);
    return { isUrl: true, platform: m ? m[1] : null, host, handle };
  }
  function scoreNode(n, q, url) {
    const ql = q.toLowerCase().replace(/[“”"']/g, '').trim(); if (!ql) return 0;
    let s = 0;
    if (url) {
      if (url.sampleId && url.sampleId === n.id) return 100;
      const bare = h => (h || '').toLowerCase().replace(/^@|^u\//, '');
      if (url.handle && n.handle && bare(n.handle) === bare(url.handle)) s = 92;
      const qq = q.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
      if ((n.sources || []).some(([, u]) => u.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '') === qq)) s = Math.max(s, n.parent ? 80 : 96);
      return s;
    }
    const name = n.name.toLowerCase();
    if (ql.startsWith('$')) { if (n.ticker && n.ticker.toLowerCase() === ql) return 100; if (n.ticker && n.ticker.toLowerCase().startsWith(ql)) s = 70; }
    if (ql.startsWith('@') || ql.startsWith('u/')) { if (n.handle && n.handle.toLowerCase() === ql) return 98; if (n.handle && n.handle.toLowerCase().includes(ql.slice(1))) s = Math.max(s, 62); }
    if (name === ql) s = Math.max(s, 96); else if (name.startsWith(ql)) s = Math.max(s, 76); else if (name.includes(ql)) s = Math.max(s, 58);
    (n.aliases || []).forEach(a => { a = a.toLowerCase(); if (a === ql) s = Math.max(s, 90); else if (a.includes(ql) || ql.includes(a)) s = Math.max(s, 52); });
    if (n.ticker && n.ticker.toLowerCase().slice(1) === ql) s = Math.max(s, 88);
    if (n.handle && n.handle.toLowerCase().replace(/^@|^u\//, '') === ql.replace(/^@|^u\//, '')) s = Math.max(s, 90);
    if (n.desc && ql.length > 4 && n.desc.toLowerCase().includes(ql)) s = Math.max(s, 46);
    (n.tags || []).forEach(t => { if (t === ql) s = Math.max(s, 40); });
    if (!s) { const words = ql.split(/\s+/).filter(w => w.length > 2); const hits = words.filter(w => name.includes(w)).length; if (hits) s = 20 + hits * 12; }
    if (s) s += (n.generated ? 0 : 3) + n.score / 50;
    return s;
  }
  function search(q, limit) {
    const url = parseUrl(q);
    const res = D.nodes.map(n => [n, scoreNode(n, q, url.isUrl ? url : null)]).filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
    return { url, res: res.slice(0, limit || 10) };
  }
  const srch = $('#srch'), srchIn = $('#srchInput'), srchRes = $('#srchRes');
  let srchSel = 0, srchItems = [], srchPrevFocus = null;
  function openSearch() { srchPrevFocus = document.activeElement; srch.hidden = false; srchIn.value = ''; renderSearch(); srchIn.focus(); }
  function closeSearch() { srch.hidden = true; if (srchPrevFocus && srchPrevFocus.focus) srchPrevFocus.focus(); }
  function renderSearch() {
    const q = srchIn.value.trim();
    let items;
    if (!q) items = D.nodes.filter(n => n.status === 'FORKING' || (n.doc && !n.parent)).sort((a, b) => b.forks30 - a.forks30 || b.t - a.t).slice(0, 8).map(n => [n, 0]);
    else items = search(q, 12).res;
    srchItems = items.map(r => r[0]); srchSel = 0;
    if (!items.length) { srchRes.innerHTML = `<li class="srch-empty">Nothing in the sample archive matches “${esc(q)}”. Try a name, a phrase like “he waits”, a ticker like $FROG, or a handle.</li>`; return; }
    srchRes.innerHTML = (q ? '' : '<li class="label" style="padding:12px 14px 4px">Forking now and documented origins</li>') + items.map(([n], i) => `<li><a href="#o.${n.id}" role="option" id="sr-${i}" aria-selected="${i === 0}"><span><span class="n">${esc(n.name)}</span><span class="m">${n.type} · ${U.day(n)} · ${n.ticker ? esc(n.ticker) + ' · ' : ''}${n.handle ? esc(n.handle) : U.plat(n.platform)} · ${n.doc ? 'documented' : 'sample'}</span></span>${chipS(n.status)}<span class="sc">${n.score}</span></a></li>`).join('');
    srchIn.setAttribute('aria-activedescendant', 'sr-0');
  }
  srchIn.addEventListener('input', renderSearch);
  srchIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); srchSel = U.clamp(srchSel + (e.key === 'ArrowDown' ? 1 : -1), 0, srchItems.length - 1);
      $$('a', srchRes).forEach((a, i) => a.setAttribute('aria-selected', String(i === srchSel)));
      const a = $('#sr-' + srchSel); if (a) { a.scrollIntoView({ block: 'nearest' }); srchIn.setAttribute('aria-activedescendant', a.id); }
    } else if (e.key === 'Enter') { e.preventDefault(); const n = srchItems[srchSel]; if (n) { closeSearch(); location.hash = '#o.' + n.id; } }
  });
  srchRes.addEventListener('click', e => { if (e.target.closest('a')) { srch.hidden = true; } });
  srch.addEventListener('click', e => { if (e.target === srch) closeSearch(); });
  $('#srchClose').addEventListener('click', closeSearch);
  $('#searchBtn').addEventListener('click', openSearch);
  document.addEventListener('keydown', e => {
    const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); if (srch.hidden) openSearch(); }
  });

  /* ---------------- examples + trace forms ---------------- */
  const EXAMPLES = ['jean phil', '$JEANPHIL', 'chill guy', '6-7', 'tung tung', 'nihilistic penguin', 'midnight frog'];
  function fillExamples(el, input, onPick) {
    el.innerHTML = '<span>Try</span>' + EXAMPLES.map(x => `<button type="button">${esc(x)}</button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; input.value = b.textContent; onPick(b.textContent); });
  }
  let pendingTrace = null;
  function goTrace(q) { q = (q || '').trim(); if (!q) return; pendingTrace = q; if (location.hash === '#trace') routeNow(); else location.hash = '#trace'; }
  $('#heroTrace').addEventListener('submit', e => { e.preventDefault(); goTrace($('#heroInput').value); });
  $('#traceForm').addEventListener('submit', e => { e.preventDefault(); goTrace($('#traceInput').value); });
  fillExamples($('#heroEx'), $('#heroInput'), goTrace);
  fillExamples($('#traceEx'), $('#traceInput'), goTrace);

  /* ---------------- EXPLORE ---------------- */
  let heroNet = null, heroStarted = false, exploring = false;
  const NETMOD = window.FORK_NET;
  function famColor(id) { return `var(${NETMOD.FAM_VAR[id] || '--cobalt'})`; }
  function enterExplore(refit) {
    if (exploring || U.mobile()) return; exploring = true;
    $('.hero').classList.add('exploring');
    if (refit) setTimeout(() => heroNet.fit(true, heroNet.fam), 30);
  }
  function exitExplore() {
    if (!exploring) return; exploring = false;
    $('.hero').classList.remove('exploring'); closeInspector();
    heroNet.fam = null; heroNet.clear(); heroNet.userMoved = false; heroNet.fit(true);
    markNow(null); $$('#famChips button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === '')));
  }
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    const copy = $('.hero-copy'), side = $('.hero-side'), dock = $('.hero-dock');
    const band = () => U.mobile() ? { top: 20, right: 16, bottom: 16, left: 16 }
      : exploring ? { top: 64, right: 30, bottom: dock.offsetHeight + 40, left: 30 }
      : { top: 30, right: side.offsetWidth + 34, bottom: dock.offsetHeight + 40, left: copy.offsetWidth * .8 };
    const scrub = NETMOD.Scrubber($('#scrub'), () => heroNet);
    heroNet = new NETMOD.CultureNet($('#net'), {
      band, card: $('#netCard'),
      inspOffset: () => U.mobile() ? 0 : 392,
      onEngage: () => enterExplore(false),
      onSelect: id => { openInspector(id, { has: x => !!heroNet.idx.get(x), select: x => heroNet.select(x, { off: 392 }) }); markNow(id); },
      onClear: () => { closeInspector(); markNow(null); $$('#famChips button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === ''))); },
      onTime: t => { scrub.set(t); renderStats(t); },
      onPlay: p => scrub.setPlaying(p),
      onWheelHint: () => { const h = $('#netHint'); h.classList.add('flash'); clearTimeout(h.t); h.t = setTimeout(() => h.classList.remove('flash'), 900); }
    });
    const tools = $('#netTools'), hint = $('#netHint');
    const place = () => { tools.style.bottom = (dock.offsetHeight + 30) + 'px'; hint.style.bottom = (dock.offsetHeight + 30) + 'px'; };
    place(); new ResizeObserver(place).observe(dock);
    tools.addEventListener('click', e => { const z = (e.target.closest('button') || {}).dataset; if (!z) return; if (z.z === 'in') heroNet.zoomBy(1.4); if (z.z === 'out') heroNet.zoomBy(1 / 1.4); if (z.z === 'fit') { heroNet.clear(); heroNet.setFamily(null); } });
    $('#exploreBtn').addEventListener('click', () => { if (U.mobile()) $('#net').scrollIntoView({ behavior: U.reduced() ? 'auto' : 'smooth', block: 'center' }); else enterExplore(true); });
    $('#exploreExit').addEventListener('click', exitExplore);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && exploring && !insp.classList.contains('open') && $('#srch').hidden) exitExplore(); });
    $('#famChips').innerHTML = `<button type="button" data-f="" aria-pressed="true">All families</button>` + D.FAMILIES.map(f => `<button type="button" data-f="${f.id}" aria-pressed="false" style="--fc:${famColor(f.id)}"><i></i>${esc(f.name)}</button>`).join('');
    $('#famChips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#famChips button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); closeInspector(); if (b.dataset.f) { enterExplore(false); heroNet.setFamily(b.dataset.f); } else exitExplore(); });
    renderNow();
    renderStats(heroNet.t); scrub.set(heroNet.t);
    setTimeout(() => heroNet.play(), U.reduced() ? 0 : 250);
  }
  window.FORK_APP = { get net() { return heroNet; } };
  const SORTED_T = D.nodes.slice().sort((a, b) => a.t - b.t);
  function renderStats(t) {
    let objs = 0, roots = 0, f30 = 0, doc = 0, deep = 0;
    for (const n of SORTED_T) { if (n.t > t) break; objs++; if (!n.parent) roots++; else if (t - n.t <= 30 * DAY) f30++; if (n.doc) doc++; if (n.depth > deep) deep = n.depth; }
    $('#stats').innerHTML = `<div><span class="label">Objects</span><b>${objs}</b></div><div><span class="label">Forks · 30 d</span><b class="hot">${f30}</b></div><div><span class="label">Origins</span><b>${roots}</b></div><div><span class="label">Deepest chain</span><b>${deep}</b></div>`;
    $('#heroDate').textContent = U.fmtDay(t);
  }
  function renderNow() {
    const hot = D.nodes.filter(n => n.forks30 > 0).sort((a, b) => b.forks30 - a.forks30 || b.score - a.score).slice(0, 5);
    $('#fnow').innerHTML = hot.map(n => `<li><button type="button" data-id="${n.id}" style="--fc:${famColor(n.family)}"><span class="dot"></span><span class="nm">${esc(n.name)}<small>${esc(U.famName(n.family))} · ${n.doc ? 'documented' : 'sample'}</small></span><span class="ct">+${n.forks30}</span></button></li>`).join('');
    $('#fnow').onclick = e => { const b = e.target.closest('button'); if (b) { enterExplore(false); heroNet.select(b.dataset.id, { off: U.mobile() ? 0 : 392 }); } };
  }
  function markNow(id) { $$('#fnow button').forEach(b => b.setAttribute('aria-current', String(b.dataset.id === id))); }

  function renderHot() {
    const hot = D.nodes.filter(n => n.forks30 > 0).sort((a, b) => b.forks30 - a.forks30 || b.score - a.score).slice(0, 6);
    $('#hotRows').innerHTML = hot.map((n, i) => {
      const p = n.parent ? node(n.parent) : null;
      const vel = n.forksPrev30 ? Math.round((n.forks30 - n.forksPrev30) / n.forksPrev30 * 100) : null;
      return `<a class="hot-row" href="#o.${n.id}">
        <span class="rk">${i + 1}</span>
        <span class="nm"><b>${esc(n.name)}</b><span>${U.typeL(n.type)} · ${esc(U.famName(n.family))}${p ? ' · from ' + esc(p.name) : ' · origin'} · ${n.doc ? 'documented' : 'sample'}</span></span>
        ${spark(n.weekly)}
        <span class="metric m-f"><span class="label">Forks 30d</span><b>${n.forks30}</b></span>
        <span class="metric m-v"><span class="label">Velocity</span><b class="${vel == null || vel > 0 ? 'up' : ''}">${vel == null ? 'New' : (vel > 0 ? '+' : '') + vel + '%'}</b></span>
        <span class="st">${chipS(n.status)}</span>
        <span class="arrow" aria-hidden="true">→</span></a>`;
    }).join('');
  }
  function renderFamilies() {
    $('#famRows').innerHTML = D.FAMILIES.map(f => {
      const roots = D.roots.filter(r => r.family === f.id), objs = D.nodes.filter(n => n.family === f.id).length, docs = D.nodes.filter(n => n.family === f.id && n.doc).length;
      const big = roots.slice().sort((a, b) => b.descendants - a.descendants)[0];
      const depth = Math.max(...roots.map(r => r.depthBelow));
      return `<a class="fam-row" href="#map.${f.id}" style="--fc:${famColor(f.id)}"><h3><i></i>${esc(f.name)}</h3><p>${esc(f.blurb)}</p><span class="mini-c">${miniTree(big.id, 240, 58)}</span><span class="counts num">${objs} objects · ${docs} documented<br>${roots.length} origins · ${depth} generations deep</span><span class="arrow" aria-hidden="true">→</span></a>`;
    }).join('');
  }
  function renderDeep() {
    const roots = D.roots.slice().sort((a, b) => b.depthBelow - a.depthBelow || b.descendants - a.descendants).slice(0, 6);
    const maxD = roots[0].depthBelow;
    $('#deepRows').innerHTML = roots.map(r => {
      const pctW = d => (d / maxD * 100).toFixed(2);
      const dots = Array.from({ length: r.depthBelow + 1 }, (_, i) => `<circle cx="${pctW(i) * .96 + 1}%" cy="8" r="${i === r.depthBelow ? 3.6 : 2.4}"${i === 0 ? ' style="fill:var(--cobalt)"' : ''}/>`).join('');
      return `<a class="deep-row" href="#o.${r.id}"><div><b>${esc(r.name)}</b><span class="sub">${U.typeL(r.type)} · ${esc(U.famName(r.family))} · ${U.mon(r)}</span></div>
        <div class="ruler-d"><svg aria-hidden="true"><line x1="1%" x2="${pctW(r.depthBelow) * .96 + 1}%" y1="8" y2="8" style="stroke:${famColor(r.family)};stroke-width:1.6"/>${dots}</svg><span class="num">Depth ${r.depthBelow}</span></div>
        <div><span class="big-n">${r.descendants}</span><span class="sub">descendants</span></div>
        <div class="c-age"><span class="big-n">${U.age(r.t)}</span><span class="sub">age</span></div>
        <div><span class="big-n" style="color:var(--cobalt)">${r.score}</span><span class="sub">fork score</span></div>
        <span class="arrow" aria-hidden="true">→</span></a>`;
    }).join('');
  }

  /* live lineage: Jean Philanthrope, real and sourced */
  let liveCtl = null, liveSeen = false;
  const LIVE_ROOT = 'jean-philanthrope';
  function renderFeed(upTo) {
    const all = [node(LIVE_ROOT)].concat(D.subtree(LIVE_ROOT)).sort((a, b) => b.t - a.t);
    const list = upTo == null ? all : all.slice(all.length - upTo);
    $('#liveFeed').innerHTML = list.map(n => {
      const p = n.parent ? node(n.parent) : null;
      return `<li${upTo != null && list[0] === n ? ' class="sim"' : ''}><span class="t">${U.day(n)} · ${U.plat(n.platform)}</span><span class="x"><b>${esc(n.name)}</b>${p ? ' forked from ' + esc(p.name) : ' first appears'}</span>${n.sources[0] ? `<a class="src" href="${esc(n.sources[0][1])}" target="_blank" rel="noopener">↗ ${esc(n.sources[0][0].split(' — ')[0])}</a>` : ''}</li>`;
    }).join('');
  }
  function startLive() {
    if (liveSeen) return; liveSeen = true;
    liveCtl = C.mountLineage($('#liveGraph'), $('#liveStack'), {
      root: LIVE_ROOT, baseDepth: 3, intro: true, rowH: 54, gap: 150, minFitK: .78, maxFitK: 1.1, wheel: 'engage', onSelect, label: 'Lineage of Jean Philanthrope', ruler: true,
      band: () => ({ top: 56, right: 60, bottom: 74, left: 200 }), toolsBottom: 14, hintTop: 16 });
    replayFeed();
  }
  function replayFeed() {
    const total = 1 + D.subtree(LIVE_ROOT).length;
    if (U.reduced()) { renderFeed(); return; }
    let i = 1; renderFeed(1);
    clearInterval(replayFeed.iv);
    replayFeed.iv = setInterval(() => { i++; renderFeed(i); if (i >= total) clearInterval(replayFeed.iv); }, 260);
  }
  $('#replayBtn').addEventListener('click', () => { if (!liveSeen) { startLive(); return; } if (liveCtl) liveCtl.rebuild(); replayFeed(); });

  let exploreMounted = false;
  function mountExplore() {
    if (exploreMounted) return; exploreMounted = true;
    renderHot(); renderFamilies(); renderDeep(); renderFeed();
    const docN = D.nodes.filter(n => n.doc).length;
    $('#ctaText').innerHTML = `${D.nodes.length} objects in <em>${D.FAMILIES.length} families.</em> ${docN} documented with sources, the rest labelled sample.`;
    mountCompare($('#homeMut'), { a: 'herzog-penguin', b: 'xinhua-penguin', page: false });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { startLive(); io.disconnect(); } }), { rootMargin: '0px 0px -20% 0px' });
    io.observe($('#live'));
  }

  /* ---------------- mutation ---------------- */
  let mutUid = 0;
  function mountCompare(host, o) {
    const uid = 'm' + (++mutUid);
    const anc = D.nodes.filter(n => n.descendants > 0);
    const groups = D.roots.map(r => [r, anc.filter(n => n.root === r.id).sort((a, b) => a.depth - b.depth || a.t - b.t)]);
    host.innerHTML = `
      <div class="mut-ctl">
        <div class="field"><label class="label" for="${uid}a">Ancestor</label><select id="${uid}a">${groups.map(([r, list]) => `<optgroup label="${esc(r.name)} lineage">${list.map(n => `<option value="${n.id}">${'  '.repeat(Math.min(n.depth, 4))}${esc(n.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>
        <svg class="mut-arrow" viewBox="0 0 40 20" aria-hidden="true"><path d="M2 10H38M16 10C24 10 24 3 34 3"/></svg>
        <div class="field"><label class="label" for="${uid}b">Descendant</label><select id="${uid}b"></select></div>
        ${o.page ? '' : `<a class="btn primary" id="${uid}go" href="#compare">Open mutation view</a>`}
      </div>
      <div class="mut-out" id="${uid}o"></div>`;
    const sa = $('#' + uid + 'a'), sb = $('#' + uid + 'b'), out = $('#' + uid + 'o');
    function fillB(keep) {
      const list = D.subtree(sa.value).sort((x, y) => x.depth - y.depth || x.t - y.t);
      sb.innerHTML = list.map(n => `<option value="${n.id}">Gen +${n.depth - node(sa.value).depth} · ${esc(n.name)}</option>`).join('');
      if (keep && list.some(n => n.id === keep)) sb.value = keep; else sb.value = deepestChange(sa.value);
    }
    function render() {
      const a = node(sa.value), b = node(sb.value); if (!a || !b) return;
      const chain = pathTo(b.id).filter(n => n.depth >= a.depth);
      if (!o.page) $('#' + uid + 'go').href = `#compare.${a.id}.${b.id}`;
      else history.replaceState(null, '', `#compare.${a.id}.${b.id}`);
      let mutated = 0;
      const rows = D.TRAITS.map(([k, label]) => {
        const vals = chain.map(n => n.fullTraits[k]);
        const at = []; for (let i = 1; i < chain.length; i++) if (vals[i] !== vals[i - 1]) at.push(chain[i]);
        const changed = vals[0] !== vals[vals.length - 1];
        if (changed) mutated++;
        const note = changed ? (at.length > 1 ? `changed ${at.length}× · last at ${at[at.length - 1].name}` : `changed at ${at[0].name}`) : (at.length ? 'drifted, then restored' : 'kept');
        const con = changed
          ? `<svg viewBox="0 0 100 66" preserveAspectRatio="none" aria-hidden="true"><path class="nw" d="M0 30H28"/><path class="old" d="M28 30H74"/><path class="nw" d="M28 30C46 30 44 12 62 12C80 12 80 30 100 30"/></svg>`
          : `<svg viewBox="0 0 100 66" preserveAspectRatio="none" aria-hidden="true"><path class="k" d="M0 30H100"/></svg>`;
        return `<div class="mut-row ${changed ? 'changed' : 'kept'}"><span class="tl">${label}</span><span class="v then">${esc(vals[0])}</span><span class="mut-con">${con}<span class="note">${esc(note)}</span></span><span class="v now">${esc(vals[vals.length - 1])}</span></div>`;
      }).join('');
      out.innerHTML = `
        <div class="mut-path" aria-label="Line of descent">${chain.map((n, i) => `<div class="mut-step${i === 0 ? ' start' : ''}${i === chain.length - 1 ? ' end last' : ''}"><span class="ln"><s></s><i></i></span><a href="#o.${n.id}"><b>${esc(n.name)}</b></a><span>${i === 0 ? 'Ancestor' : 'Gen +' + i} · ${U.fmtMon(n.t)}</span>${n.mutation && i ? '<span class="mutated">⑂ mutation</span>' : ''}</div>`).join('')}</div>
        <div class="mut-head"><span class="label">Trait</span><span class="then-now"><b>Then</b><span class="label">${esc(a.name)}</span></span><span></span><span class="then-now"><b>Now</b><span class="label">${esc(b.name)}</span></span></div>
        ${rows}
        <div class="mut-sum"><p><em>${mutated} of ${D.TRAITS.length}</em> traits mutated across ${chain.length - 1} generation${chain.length === 2 ? '' : 's'}.</p><span class="label">Path confidence ${U.pct(chain.slice(1).reduce((s, n) => s * n.conf, 1))}% <span class="sample">Sample data</span></span></div>`;
    }
    sa.value = o.a; fillB(o.b); render();
    sa.addEventListener('change', () => { fillB(); render(); });
    sb.addEventListener('change', render);
  }

  /* ---------------- TRACE ---------------- */
  const STEP_L = ['Searching origin', 'Finding parents', 'Finding forks', 'Checking sources'];
  let traceRun = 0, traceCtl = null;
  function setSteps(state, detail) {
    $('#steps').innerHTML = STEP_L.map((l, i) => `<li class="${state[i] || ''}"><span class="st"><i></i>${l}</span><span class="sd">${detail[i] ? esc(detail[i]) : (state[i] === 'run' ? '…' : '')}</span></li>`).join('');
  }
  async function runTrace(q) {
    const run = ++traceRun;
    $('#traceInput').value = q; $('#heroInput').value = q;
    if (traceCtl) { traceCtl.destroy(); traceCtl = null; }
    $('#traceRes').innerHTML = '';
    const { url, res } = search(q, 5);
    const best = res[0] && res[0][1] >= 45 ? res[0][0] : null;
    const how = best ? (url.isUrl ? 'URL handle' : q.trim().startsWith('$') ? 'ticker' : /^(@|u\/)/.test(q.trim()) ? 'handle' : (best.name.toLowerCase() === q.toLowerCase().trim() ? 'name' : 'phrase or alias')) : null;
    const wait = ms => new Promise(r => setTimeout(r, U.reduced() ? 0 : ms));
    const st = ['', '', '', ''], dt = ['', '', '', ''];
    document.body.classList.add('tracing');
    const done = () => document.body.classList.remove('tracing');
    st[0] = 'run'; setSteps(st, dt); await wait(650); if (run !== traceRun) return done();
    if (!best) {
      st[0] = 'no'; dt[0] = url.isUrl ? `Detected a ${url.platform ? U.plat(url.platform) : 'web'} URL${url.handle ? ' for ' + url.handle : ''}. Not in the sample archive.` : `Nothing called “${q}” in the sample archive.`;
      for (let i = 1; i < 4; i++) { st[i] = 'no'; dt[i] = 'Skipped'; }
      setSteps(st, dt); done(); renderNoMatch(q, res); return;
    }
    const anc = D.ancestors(best.id), root = anc[0] || best, path = anc.slice(1).concat(best);
    st[0] = 'ok'; dt[0] = `Matched “${q}” → ${best.name} (${how}).`; st[1] = 'run'; setSteps(st, dt); await wait(600); if (run !== traceRun) return done();
    st[1] = 'ok'; dt[1] = anc.length ? `${anc.length} ancestor${anc.length > 1 ? 's' : ''}. Origin: ${root.name}, ${U.day(root)}.` : 'It is an origin. No earlier copy in the archive.';
    st[2] = 'run'; setSteps(st, dt); await wait(560); if (run !== traceRun) return done();
    st[2] = 'ok'; dt[2] = `${best.forks} direct forks, ${best.descendants} descendants across ${best.depthBelow} generation${best.depthBelow === 1 ? '' : 's'}.`;
    st[3] = 'run'; setSteps(st, dt); await wait(560); if (run !== traceRun) return done();
    const evN = path.reduce((s, n) => s + n.evidence.length, 0) + (anc.length ? 0 : best.evidence.length);
    const srcN = new Set(anc.concat(best).flatMap(n => n.sources.map(x => x[1]))).size;
    const disp = path.filter(n => n.relation === 'DISPUTED').length;
    st[3] = 'ok'; dt[3] = `${evN} evidence items${srcN ? `, ${srcN} public source${srcN > 1 ? 's' : ''}` : ' (sample data)'}. ${disp} disputed link${disp === 1 ? '' : 's'}. Path confidence ${U.pct(best.pathConf)}%.`;
    setSteps(st, dt); done();
    renderTraceResult(best, anc, root);
  }
  function renderNoMatch(q, res) {
    const near = res.filter(r => r[1] >= 20).slice(0, 4).map(r => r[0]);
    $('#traceRes').innerHTML = `<div class="tr-sum"><div><p class="eyebrow">No lineage</p><h2>Not in the sample archive.</h2><p>This demo can only trace objects it has archived, and it has no live sources. Anything outside the sample set returns nothing rather than a guessed lineage.</p></div></div>
      ${near.length ? `<div><p class="label">Closest names in the archive</p><ol class="descent">${near.map(n => `<li><span class="g">${n.type}</span><a class="n" href="#o.${n.id}">${esc(n.name)}<small>${U.day(n)} · ${U.plat(n.platform)}</small></a>${chipS(n.status)}</li>`).join('')}</ol></div>` : ''}`;
  }
  function renderTraceResult(n, anc, root) {
    const gens = anc.length;
    $('#traceRes').innerHTML = `
      <div class="tr-sum"><div><p class="eyebrow">${n.doc ? '<span class="doc-b">Documented lineage</span>' : '<span class="sample">Sample lineage</span>'}</p>
        <h2>${gens ? `Started as <em>${esc(root.name)}</em>.` : `<em>${esc(n.name)}</em> is an origin.`}</h2>
        <p>${gens ? `${esc(n.name)} is ${gens} generation${gens > 1 ? 's' : ''} from ${esc(root.name)}, first seen on ${U.plat(root.platform)} (${U.day(root)}). ` : `First seen on ${U.plat(n.platform)} (${U.day(n)}). `}It has ${n.descendants} descendant${n.descendants === 1 ? '' : 's'}.</p></div>
        <div class="tr-acts">${gens ? `<a class="btn" href="#compare.${root.id}.${n.id}">Compare mutation</a>` : ''}<a class="btn primary" href="#o.${n.id}">Open object</a></div></div>
      <div class="tr-graph" id="trGraph"></div>
      <div><p class="label" style="margin-bottom:8px">Line of descent</p><ol class="descent">${anc.concat(n).map((x, i) => `<li class="${x.id === n.id ? 'hit' : ''}"><span class="g">${i ? 'Gen ' + i : 'Origin'}</span><a class="n" href="#o.${x.id}">${esc(x.name)}<small>${U.typeL(x.type)} · ${U.day(x)} · ${U.plat(x.platform)}</small></a>${i ? chipR(x.relation) : '<span class="chip">Origin</span>'}</li>`).join('')}</ol></div>`;
    const host = $('#trGraph');
    traceCtl = C.mountLineage(host, host, { root: root.id, select: n.id, focus: n.id, baseDepth: 1, intro: true, onSelect, label: 'Traced lineage', band: () => ({ top: 30, right: 50, bottom: 70, left: 170 }),
      onIntroDone: () => { if (!U.mobile()) setTimeout(() => openInspector(n.id, traceCtl), 900); } });
    if (U.mobile() && traceCtl.stack) traceCtl.stack.setActive(n.id);
  }

  /* ---------------- MAP ---------------- */
  let mapG = null;
  function mountMap(fid) {
    if (!U.mobile()) {
      if (!mapG) {
        const host = $('#mapGraph');
        const card = document.createElement('div'); card.className = 'panel netcard'; card.hidden = true;
        mapG = new NETMOD.CultureNet(host, { startNow: true, card, alwaysWheel: true,
          band: () => ({ top: 30, right: 40, bottom: 40, left: 300 }),
          onSelect: id => openInspector(id, { has: x => !!mapG.idx.get(x), select: x => mapG.select(x, { off: 392 }) }),
          onClear: closeInspector, inspOffset: () => 392,
          onWheelHint: () => {} });
        host.appendChild(card);
        $('#mapFams').innerHTML = D.FAMILIES.map(f => `<li><button type="button" data-f="${f.id}" style="--fc:${famColor(f.id)}"><b><i style="display:inline-block;width:9px;height:9px;background:var(--fc);margin-right:8px;vertical-align:0"></i>${esc(f.name)}</b><span>${D.nodes.filter(n => n.family === f.id).length}</span></button></li>`).join('') + '<li><button type="button" data-f=""><b>Whole map</b><span>' + D.nodes.length + '</span></button></li>';
        $('#mapFams').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#mapFams button').forEach(x => x.setAttribute('aria-current', String(x === b))); closeInspector(); mapG.setFamily(b.dataset.f || null); });
        const tools = document.createElement('div'); tools.className = 'net-tools'; tools.style.bottom = '20px'; tools.style.flexDirection = 'row';
        tools.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="fit" aria-label="Fit whole map">⤢</button>';
        tools.addEventListener('click', e => { const z = (e.target.closest('button') || {}).dataset; if (!z) return; if (z.z === 'in') mapG.zoomBy(1.4); if (z.z === 'out') mapG.zoomBy(1 / 1.4); if (z.z === 'fit') { mapG.setFamily(null); mapG.clear(); } });
        host.appendChild(tools);
        const lv = $('#mapLvl'); if (lv) lv.textContent = 'Scroll to zoom';
      }
      if (fid) setTimeout(() => { $$('#mapFams button').forEach(x => x.setAttribute('aria-current', String(x.dataset.f === fid))); mapG.setFamily(fid); }, 80);
    }
    renderMapMobile(fid);
  }
  let mapMobCtl = null;
  function renderMapMobile(fid) {
    const host = $('#mapMobile');
    host.innerHTML = `<header class="page-h"><p class="eyebrow">Map</p><h1>Families</h1><p class="lede">On a phone the map becomes an index. Pick a family, then an origin, and follow its forks.</p></header>
      <div class="rows">${D.FAMILIES.map(f => `<button type="button" class="fam-row" data-mf="${f.id}" style="width:100%;text-align:left" aria-expanded="${f.id === fid}"><h3>${esc(f.name)}</h3><p>${esc(f.blurb)}</p><span class="arrow" aria-hidden="true">${f.id === fid ? '↓' : '→'}</span></button>${f.id === fid ? `<div class="mm-roots" style="padding:8px 0 24px">${D.roots.filter(r => r.family === f.id).map(r => `<button type="button" class="btn sm" data-mr="${r.id}" style="margin:0 8px 8px 0">${esc(r.name)}</button>`).join('')}<div id="mmStack"></div></div>` : ''}`).join('')}</div>`;
    host.onclick = e => {
      const f = e.target.closest('[data-mf]'), r = e.target.closest('[data-mr]');
      if (f) { renderMapMobile(f.dataset.mf === fid ? null : f.dataset.mf); return; }
      if (r) { if (mapMobCtl) mapMobCtl.destroy(); $('#mmStack').innerHTML = ''; mapMobCtl = new C.LineageStack($('#mmStack'), { root: r.dataset.mr, onSelect: id => openInspector(id, mapMobCtl) }); }
    };
    if (fid) { const first = D.roots.find(r => r.family === fid); if (first && $('#mmStack')) mapMobCtl = new C.LineageStack($('#mmStack'), { root: first.id, onSelect: id => openInspector(id, mapMobCtl) }); }
  }

  /* ---------------- ARCHIVE ---------------- */
  const AF = { q: '', data: '', type: '', platform: '', year: '', family: '', status: '', depth: 0, score: 0, conf: 0, sort: 'origin', dir: -1, limit: 60 };
  let archMounted = false;
  function mountArchive() {
    if (archMounted) { renderArchive(); return; } archMounted = true;
    $('#archLede').textContent = `${D.nodes.length} objects from ${D.roots.length} origins; ${D.nodes.filter(n => n.doc).length} documented with sources. Filter by what they are, where they started and how far they forked.`;
    const years = [...new Set(D.nodes.map(n => new Date(n.t).getUTCFullYear()))].sort();
    const sel = (id, label, opts) => `<div class="field"><label class="label" for="af-${id}">${label}</label><select id="af-${id}" data-k="${id}"><option value="">All</option>${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></div>`;
    const rng = (id, label, max) => `<div class="rng"><div class="top"><label class="label" for="af-${id}">${label}</label><output id="af-${id}-o">≥ 0</output></div><input type="range" id="af-${id}" data-k="${id}" min="0" max="${max}" value="0"></div>`;
    $('#filters').innerHTML = `<div class="field wide"><label class="label" for="af-q">Name, phrase, ticker or handle</label><input type="search" id="af-q" data-k="q" placeholder="frog, $HONK, @jeanphil_bakes"></div>
      ${sel('data', 'Data', [['doc', 'Documented'], ['sample', 'Sample']])}${sel('type', 'Type', D.TYPES.map(t => [t, U.typeL(t)]))}${sel('platform', 'Platform', Object.entries(D.PLATFORMS))}${sel('year', 'Year', years.map(y => [y, y]))}
      ${sel('family', 'Family', D.FAMILIES.map(f => [f.id, f.name]))}${sel('status', 'Status', D.STATUSES.map(s => [s, U.typeL(s)]))}
      ${rng('depth', 'Min generation', 10)}${rng('score', 'Min fork score', 100)}${rng('conf', 'Min confidence %', 100)}`;
    $('#filters').addEventListener('input', e => {
      const k = e.target.dataset.k; if (!k) return;
      AF[k] = e.target.type === 'range' ? +e.target.value : e.target.value; AF.limit = 60;
      if (e.target.type === 'range') $('#af-' + k + '-o').textContent = '≥ ' + e.target.value;
      renderArchive();
    });
    $('#archReset').addEventListener('click', () => { Object.assign(AF, { q: '', data: '', type: '', platform: '', year: '', family: '', status: '', depth: 0, score: 0, conf: 0, limit: 60 }); $$('#filters select, #filters input').forEach(i => { i.value = i.type === 'range' ? 0 : ''; }); $$('#filters output').forEach(o => { o.textContent = '≥ 0'; }); renderArchive(); });
    $('#archMore').addEventListener('click', () => { AF.limit += 60; renderArchive(); });
    $('#archTbl').addEventListener('click', e => { const b = e.target.closest('[data-sort]'); if (!b) return; const k = b.dataset.sort; if (AF.sort === k) AF.dir *= -1; else { AF.sort = k; AF.dir = k === 'name' ? 1 : -1; } renderArchive(); });
    renderArchive();
  }
  function renderArchive() {
    const q = AF.q.trim();
    let rows = D.nodes.filter(n => (!AF.data || (AF.data === 'doc') === !!n.doc) && (!AF.type || n.type === AF.type) && (!AF.platform || n.platform === AF.platform) && (!AF.year || new Date(n.t).getUTCFullYear() === +AF.year) && (!AF.family || n.family === AF.family) && (!AF.status || n.status === AF.status) && n.depth >= AF.depth && n.score >= AF.score && n.conf * 100 >= AF.conf);
    if (q) { const url = parseUrl(q); rows = rows.filter(n => scoreNode(n, q, url.isUrl ? url : null) >= 30); }
    const key = { name: n => n.name.toLowerCase(), type: n => n.type, origin: n => n.t, depth: n => n.depth, desc: n => n.descendants, score: n => n.score, status: n => D.STATUSES.indexOf(n.status) }[AF.sort];
    rows.sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * AF.dir || b.score - a.score; });
    const th = (k, l, cls) => `<th class="${cls || ''}" aria-sort="${AF.sort === k ? (AF.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" data-sort="${k}">${l}${AF.sort === k ? `<span class="sa">${AF.dir > 0 ? '↑' : '↓'}</span>` : ''}</button></th>`;
    $('#archTbl').innerHTML = `<thead><tr>${th('name', 'Name')}${th('type', 'Type', 'c-type')}${th('origin', 'Origin', 'c-origin')}${th('depth', 'Depth', 'r c-depth')}${th('desc', 'Descendants', 'r c-desc')}${th('score', 'Score', 'r')}${th('status', 'Status')}</tr></thead>
      <tbody>${rows.slice(0, AF.limit).map(n => `<tr><td class="n"><a href="#o.${n.id}">${esc(n.name)}</a>${n.doc ? ' <span class="doc-b">Doc</span>' : ''}<small>${n.type} · ${U.mon(n)}</small></td><td class="c-type">${U.typeL(n.type)}</td><td class="c-origin">${U.day(n)}<br><span style="color:var(--muted)">${U.plat(n.platform)}</span></td><td class="r c-depth">${n.depth}</td><td class="r c-desc">${n.descendants}</td><td class="r sc">${n.score}</td><td>${chipS(n.status)}</td></tr>`).join('') || '<tr><td colspan="7" class="srch-empty">No objects match these filters.</td></tr>'}</tbody>`;
    $('#archCount').textContent = `${rows.length} of ${D.nodes.length} objects` + (rows.length > AF.limit ? ` · showing ${AF.limit}` : '');
    $('#archMore').hidden = rows.length <= AF.limit;
  }

  /* ---------------- OBJECT PAGE ---------------- */
  let objCtl = null;
  const secH = (eyebrow, title, lede) => `<header class="block-h"><svg class="fr" viewBox="0 0 30 22" aria-hidden="true"><path d="M0 .5C14 .5 12 15 27 15"/><circle cx="28" cy="15" r="2.6"/></svg><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ''}</header>`;
  function platformFlow(n) {
    const set = pathTo(n.id).concat(D.subtree(n.id));
    const first = new Map();
    set.slice().sort((a, b) => a.t - b.t).forEach(x => { if (!first.has(x.platform)) first.set(x.platform, x); });
    const parentPlat = new Map();
    first.forEach((x, p) => { let cur = x; let from = null; while (cur.parent) { cur = node(cur.parent); if (cur.platform !== p) { from = cur.platform; break; } } parentPlat.set(p, from && first.has(from) ? from : null); });
    const rootP = [...first.keys()][0]; parentPlat.set(rootP, null);
    const kids = p => [...first.keys()].filter(q => q !== p && parentPlat.get(q) === p);
    [...first.keys()].forEach(p => { if (p !== rootP && !parentPlat.get(p)) parentPlat.set(p, rootP); });
    let leaf = 0; const pos = new Map(), depthOf = new Map();
    const place = (p, d) => { depthOf.set(p, d); const ks = kids(p); let y; if (!ks.length) y = leaf++; else { const ys = ks.map(k => place(k, d + 1)); y = (ys[0] + ys[ys.length - 1]) / 2; } pos.set(p, y); return y; };
    place(rootP, 0);
    const maxD = Math.max(...depthOf.values()), colW = 230, rowH = 74, W = Math.max(640, (maxD + 1) * colW + 60), H = Math.max(1, leaf) * rowH + 30;
    const X = p => 30 + depthOf.get(p) * colW, Y = p => 40 + pos.get(p) * rowH;
    let s = '';
    first.forEach((x, p) => { const pp = parentPlat.get(p); if (!pp) return; const x0 = X(pp), y0 = Y(pp), x1 = X(p), y1 = Y(p), dx = x1 - x0; s += `<path d="M${x0},${y0}C${x0 + dx * .62},${y0} ${x0 + dx * .38},${y1} ${x1},${y1}" stroke-width="1.8"/>`; });
    first.forEach((x, p) => { s += `<circle cx="${X(p)}" cy="${Y(p)}" r="5"/><text class="pn" x="${X(p) + 12}" y="${Y(p) - 4}">${esc(U.plat(p))}</text><text class="pm" x="${X(p) + 12}" y="${Y(p) + 14}">${esc(U.fmtMon(x.t).toUpperCase())} · VIA ${esc(x.name.toUpperCase().slice(0, 26))}</text>`; });
    return `<div class="pflow"><svg viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W, 900)}px" role="img" aria-label="Platform spread: ${[...first.keys()].map(U.plat).join(', then ')}">${s}</svg></div>`;
  }
  function renderObject(id) {
    const n = node(id), wrap = $('#objWrap');
    if (objCtl) { objCtl.destroy(); objCtl = null; }
    if (!n) { wrap.innerHTML = `<header class="page-h"><p class="eyebrow">Object</p><h1>Not in the archive.</h1><p class="lede">No sample object has the id “${esc(id)}”. <a class="link" href="#archive">Browse the archive</a>.</p></header>`; return; }
    const anc = D.ancestors(id), root = anc[0] || n, p = n.parent ? node(n.parent) : null, path = anc.concat(n);
    const sub = D.subtree(id), fams = new Map();
    path.concat(sub).forEach(x => fams.set(x.family, (fams.get(x.family) || 0) + 1));
    const kids = n.children.map(node);
    const descRows = sub.slice().sort((a, b) => a.depth - b.depth || a.t - b.t);
    wrap.innerHTML = `
      <header class="obj-h">
        <p class="eyebrow">${U.typeL(n.type)} · ${esc(U.famName(n.family))} · ${n.parent ? 'Generation ' + n.depth : 'Origin'} ${n.doc ? '<span class="doc-b">Documented</span>' : '<span class="sample">Sample data</span>'}</p>
        <h1>${esc(n.name)}</h1>
        <p class="lede">${esc(autoDesc(n))}</p>
        <div class="obj-stats">
          <div><span class="label">Status</span><span>${chipS(n.status)}</span></div>
          <div><span class="label">Fork score ${info('score', id, 'How fork score is computed')}</span><span class="v c">${n.score}</span></div>
          <div><span class="label">Confidence ${info('conf', id, 'What confidence is based on')}</span><span class="v">${U.pct(n.conf)}%</span></div>
          <div><span class="label">Direct forks</span><span class="v">${n.forks}</span></div>
          <div><span class="label">Descendants</span><span class="v">${n.descendants}</span></div>
          <div><span class="label">First seen</span><span class="v s">${U.day(n)}<br>${U.plat(n.platform)}${n.handle ? ' · ' + esc(n.handle) : ''}</span></div>
        </div>
      </header>

      <section class="osec">${secH('Primary lineage', anc.length ? `From ${esc(root.name)} to ${esc(n.name)}.` : `Everything ${esc(n.name)} became.`, 'Click a branch to follow it. Zoom in to reveal deeper generations; the +N marks open hidden forks.')}<div class="obj-graph" id="objGraph"></div></section>

      <section class="osec">${secH('Origin', anc.length ? 'Where it started.' : 'This is an origin.')}
        <div class="two">
          <dl class="kv"><dt>Origin</dt><dd><a class="link" href="#o.${root.id}">${esc(root.name)}</a></dd><dt>First seen</dt><dd>${U.day(root)} · ${U.plat(root.platform)}${root.handle ? ' · ' + esc(root.handle) : ''}</dd><dt>What it was</dt><dd>${esc(autoDesc(root))}</dd><dt>Generations</dt><dd>${anc.length} from origin to here</dd><dt>Path confidence ${info('path', id, 'What path confidence means')}</dt><dd>${U.pct(n.pathConf)}%</dd></dl>
          <ol class="descent">${path.map((x, i) => `<li class="${x.id === id ? 'hit' : ''}"><span class="g">${i ? 'Gen ' + i : 'Origin'}</span><a class="n" href="#o.${x.id}">${esc(x.name)}<small>${U.typeL(x.type)} · ${U.day(x)}</small></a>${i ? chipR(x.relation) : '<span class="chip">Origin</span>'}</li>`).join('')}</ol>
        </div></section>

      <section class="osec">${secH('Direct forks', kids.length ? `${kids.length} direct fork${kids.length > 1 ? 's' : ''}.` : 'No forks yet.')}
        ${kids.length ? `<div class="list-rows">${kids.map(k => `<a class="lrow" href="#o.${k.id}"><b>${esc(k.name)}</b><span class="m c-x">${U.typeL(k.type)} · ${U.plat(k.platform)}</span><span class="m c-x">${U.day(k)}</span><span class="m">${k.descendants} desc.</span>${chipR(k.relation)}</a>`).join('')}</div>` : '<p class="ls-empty">Nothing in the archive descends from this yet.</p>'}</section>

      <section class="osec">${secH('Mutation history', 'What changed, generation by generation.')}
        <ol class="timeline">${path.map((x, i) => {
          const prev = i ? path[i - 1] : null;
          const ch = prev ? D.TRAITS.filter(([k]) => x.fullTraits[k] !== prev.fullTraits[k]) : [];
          return `<li class="${x.mutation ? 'mut' : ''}"><span class="when">${i ? 'Gen ' + i : 'Origin'} · ${U.mon(x)}</span><span class="glyph">${U.FORKGLYPH}</span><div class="what"><b>${esc(x.name)}</b>${prev ? (ch.length ? `<ul>${ch.map(([k, l]) => `<li><span class="tk">${l}</span>${esc(prev.fullTraits[k])} → ${esc(x.fullTraits[k])}</li>`).join('')}</ul>` : '<ul><li>No traits changed. A straight copy.</li></ul>') : `<ul><li>${esc(x.fullTraits.visual)}. ${esc(x.fullTraits.tone)}.</li></ul>`}</div></li>`;
        }).join('')}</ol>
        ${anc.length ? `<p style="margin-top:16px"><a class="btn" href="#compare.${root.id}.${id}">Compare origin → ${esc(n.name)}</a></p>` : ''}</section>

      <section class="osec">${secH('Platform spread', 'Where the lineage travelled.', 'First arrival on each platform, along this object’s ancestry and everything descended from it.')}${platformFlow(n)}</section>

      <section class="osec">${secH('Evidence', p ? `Why ${esc(n.name)} descends from ${esc(p.name)}.` : 'Why this counts as the origin.')}
        <div class="evi">${evidenceBlock(n)}${anc.length > 1 ? `<details style="padding:14px 0"><summary class="label" style="cursor:pointer">Earlier links on the path (${anc.length - 1})</summary>${anc.slice(1).reverse().map(evidenceBlock).join('')}</details>` : ''}</div></section>

      <section class="osec">${secH('Descendants', sub.length ? `${sub.length} descendant${sub.length > 1 ? 's' : ''}.` : 'No descendants yet.')}
        ${sub.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th class="c-type">Type</th><th class="r">Gen</th><th class="c-origin">First seen</th><th class="r">Score</th><th>Link</th></tr></thead><tbody id="objDesc">${descRows.slice(0, 25).map(descRow(n)).join('')}</tbody></table></div>${sub.length > 25 ? `<div class="more-row"><button class="btn" type="button" id="objMore">Show all ${sub.length}</button></div>` : ''}` : ''}</section>

      ${(() => { const srcs = [...new Map(path.concat(sub).flatMap(x => x.sources).map(x => [x[1], x])).values()]; return srcs.length ? `<section class="osec">${secH('Sources', 'Public reporting behind this lineage.', 'Every documented object links to where its date and relationship were reported. Sample objects have no sources.')}<ul class="srcs">${srcs.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></section>` : ''; })()}

      <section class="osec">${secH('Related families', 'Families this lineage touches.')}
        <div class="fam-chips">${[...fams].map(([f, c]) => `<a href="#map.${f}"><b>${esc(U.famName(f))}</b><span>${c} object${c > 1 ? 's' : ''} in this lineage</span></a>`).join('')}</div></section>`;
    const more = $('#objMore'); if (more) more.addEventListener('click', () => { $('#objDesc').innerHTML = descRows.map(descRow(n)).join(''); more.parentNode.remove(); });
    const host = $('#objGraph');
    objCtl = C.mountLineage(host, host, { root: root.id, focus: id, select: id === root.id ? null : id, baseDepth: anc.length ? 1 : 2, intro: false, onSelect, label: 'Lineage of ' + n.name, band: () => ({ top: 30, right: 50, bottom: 70, left: 170 }) });
  }
  const descRow = base => d => `<tr><td class="n"><a href="#o.${d.id}">${esc(d.name)}</a><small>${d.type} · ${U.fmtMon(d.t)}</small></td><td class="c-type">${U.typeL(d.type)}</td><td class="r">+${d.depth - base.depth}</td><td class="c-origin">${U.day(d)}</td><td class="r sc">${d.score}</td><td>${chipR(d.relation)}</td></tr>`;
  function evidenceBlock(x) {
    const p = x.parent ? node(x.parent) : null;
    return `<div class="evi-link"><h4>${p ? `${esc(p.name)} → ${esc(x.name)}` : esc(x.name) + ' (origin)'}</h4><span class="evi-conf">${p ? chipR(x.relation) : ''}<span>${U.pct(x.conf)}%</span>${info('conf', x.id, 'What confidence is based on')}</span>
      <ul>${x.evidence.map(e => `<li class="${e.kind}"><span class="k">${esc(D.EVIDENCE_KINDS[e.kind])}</span><span>${esc(e.text)}</span></li>`).join('')}</ul></div>`;
  }

  /* ---------------- ABOUT ---------------- */
  function renderAbout() {
    $('#aboutWrap').innerHTML = `
      <header class="page-h"><p class="eyebrow">About · Docs</p><h1>Everything comes from something.</h1><p class="lede">FORK traces how memes, posts, characters, tokens and formats descend from one another, and shows what changed on the way.</p></header>
      <div class="prose">
        <p>Every object in FORK has at most one parent. A meme becomes a template, the template becomes a token, the token gets a mascot. FORK draws that as a lineage: one line that keeps splitting.</p>
        <h2>Reading a branch</h2>
        <ul><li>On the homepage graph each colour is a family; bright, glowing dots forked in the last two months, and pulses travel down branches forked in the last 75 days.</li><li>A thick tapered line is a <b>verified</b> link. Thickness is influence: how much descends from the child.</li><li>A dashed line is <b>likely</b>. A dotted line is <b>disputed</b>.</li><li>A small blue fork on a line marks a <b>mutation</b>: the child changed type or at least two traits.</li><li>Left to right is time, on a log scale, so early years get room.</li></ul>
        <h2>Fork score</h2>
        <p>One number for how much culture an object spawned downstream. It uses only the lineage graph. It never uses reach, followers, views or prices.</p>
        <div class="formula">raw = 2·forks + 0.5·descendants + 5·generations_below + 4·(platforms − 1) + 2·years_active<br>score = round(100 · (1 − e^(−raw / 40)))</div>
        <h2>Confidence</h2>
        <p>Each link carries a confidence from its evidence: timestamp precedence, direct references, shared media, platform cross-links, caption and community references. A counter-claim lowers it. Path confidence multiplies every link from the origin down.</p>
        <h2>States</h2>
        <p><b>Forking</b>: three or more direct forks in 30 days. <b>Origin</b>: a root younger than six months. <b>Peaking</b>: five or more new descendants in 30 days. <b>Emerging</b>: younger than 90 days. <b>Spreading</b>: still gaining descendants this half-year. <b>Legacy</b>: older than three years with a high score. <b>Cooling</b>: everything else.</p>
        <h2>Data</h2>
        <p>FORK mixes two kinds of objects, and labels every one. <b>Documented</b> objects (${D.nodes.filter(n => n.doc).length}) are real lineages from 2007 to October 2026, such as Jean Philanthrope, the nihilistic penguin, 6-7, Italian brainrot, Chill Guy and Moo Deng. Each carries links to the public reporting behind its date and its parent. Dates marked ~ are approximate; “Reported” means the first date a source mentions it. <b>Sample</b> objects (${D.nodes.filter(n => !n.doc).length}) are fictional and show how deep lineages behave.</p>
        <p>There are no live feeds, no view counts and no prices. Trace only searches this archive, so a URL outside it returns “not in the archive” instead of a guessed lineage. The clock is 16 October 2026.</p>
        <h2>Keyboard</h2>
        <p>Press <code>/</code> or <code>⌘K</code> to search. In any graph: arrow keys move between parent, children and siblings; <code>Enter</code> opens an object; <code>+</code> and <code>−</code> zoom; <code>0</code> fits. Every graph also has a List view.</p>
      </div>`;
  }

  /* ---------------- routing + nav ---------------- */
  const VIEWS = ['explore', 'trace', 'map', 'archive', 'object', 'compare', 'about'];
  let curView = null, navX = null;
  function drawNav(animate) {
    const nav = $('#nav'), W = nav.clientWidth, y = 13.5;
    const a = $('.nav [data-nav][aria-current="page"]');
    $('#navLine').setAttribute('d', `M0 ${y}H${W}`);
    const br = $('#navBranch'), end = $('#navEnd');
    if (!a) { br.setAttribute('d', ''); end.style.display = 'none'; navX = null; return; }
    const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    const target = [r.left - nr.left + 12, r.right - nr.left - 12];
    const set = (x0, x1) => { br.setAttribute('d', `M${x0 - 26} ${y}C${x0 - 12} ${y} ${x0 - 12} 5 ${x0} 5H${x1}`); end.setAttribute('cx', x1 + 2.6); end.setAttribute('cy', 5); end.style.display = ''; };
    if (!animate || !navX || U.reduced()) { set(...target); navX = target; return; }
    const from = navX.slice(), t0 = performance.now();
    const f = now => { const p = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - p, 3); const x0 = from[0] + (target[0] - from[0]) * e, x1 = from[1] + (target[1] - from[1]) * e; set(x0, x1); navX = [x0, x1]; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  window.addEventListener('resize', () => drawNav(false));

  function routeNow() {
    const raw = decodeURIComponent(location.hash.slice(1)) || 'explore';
    const parts = raw.split('.'); let view = parts[0] === 'o' ? 'object' : parts[0];
    let anchor = null;
    if (!VIEWS.includes(view)) { anchor = document.getElementById(raw); view = 'explore'; }
    closeInspector(); TIP.hide();
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
    $$('.nav [data-nav]').forEach(a => { if (a.dataset.nav === (view === 'object' || view === 'compare' ? '' : view)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    drawNav(curView !== null);
    const changed = curView !== view; curView = view;
    if (view === 'explore') { mountExplore(); if (anchor) anchor.scrollIntoView(); else if (changed) window.scrollTo(0, 0); if (loaderDone) startHero(); document.title = 'FORK'; return; }
    window.scrollTo(0, 0);
    if (view === 'trace') { document.title = 'Trace · FORK'; if (pendingTrace) { const q = pendingTrace; pendingTrace = null; runTrace(q); } else if (!$('#steps').innerHTML) { setSteps(['', '', '', ''], ['', '', '', '']); } setTimeout(() => $('#traceInput').focus({ preventScroll: true }), 50); }
    if (view === 'map') { document.title = 'Map · FORK'; mountMap(parts[1]); }
    if (view === 'archive') { document.title = 'Archive · FORK'; mountArchive(); }
    if (view === 'object') { const n = node(parts[1]); document.title = (n ? n.name : 'Object') + ' · FORK'; renderObject(parts[1]); }
    if (view === 'compare') {
      document.title = 'Mutation · FORK';
      let a = parts[1], b = parts[2];
      if (!node(a) || !node(a).descendants) a = 'midnight-frog';
      if (!b || !D.subtree(a).some(x => x.id === b)) b = deepestChange(a);
      mountCompare($('#pageMut'), { a, b, page: true });
    }
    if (view === 'about') { document.title = 'About · FORK'; renderAbout(); }
  }
  window.addEventListener('hashchange', routeNow);

  /* ---------------- boot ---------------- */
  let loaderDone = false;
  function finishLoader() {
    if (loaderDone) return; loaderDone = true;
    const l = $('#loader'); l.classList.add('out'); setTimeout(() => l.remove(), 320);
    if (curView === 'explore') startHero();
  }
  routeNow();
  if (U.reduced()) finishLoader(); else setTimeout(finishLoader, 1120);
  U.MQ.addEventListener("change", () => { drawNav(false); if (curView === "map") mountMap(); });
})();
