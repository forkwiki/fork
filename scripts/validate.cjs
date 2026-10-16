#!/usr/bin/env node
// Checks every lineage in src/data.js before it can be merged.
const D = require('./load-data.cjs')();

const errors = [];
const warn = [];
const ids = new Set();
const fams = new Set(D.FAMILIES.map(f => f.id));

for (const n of D.nodes) {
  const where = `${n.id} (${n.name})`;
  if (ids.has(n.id)) errors.push(`duplicate id: ${where}`);
  ids.add(n.id);
  if (!/^[a-z0-9-]+$/.test(n.id)) errors.push(`id must be kebab-case: ${where}`);
  if (!D.TYPES.includes(n.type)) errors.push(`unknown type ${n.type}: ${where}`);
  if (!D.PLATFORMS[n.platform]) errors.push(`unknown platform ${n.platform}: ${where}`);
  if (!fams.has(n.family)) errors.push(`unknown family ${n.family}: ${where}`);
  if (!(n.conf >= 0 && n.conf <= 1)) errors.push(`confidence must be 0–1: ${where}`);
  if (Number.isNaN(n.t)) errors.push(`bad date ${n.date}: ${where}`);
  if (n.t > +D.SAMPLE_NOW) errors.push(`date is in the future: ${where}`);
  if (n.parent) {
    const p = D.byId.get(n.parent);
    if (!p) errors.push(`parent ${n.parent} not found: ${where}`);
    else if (n.t < p.t) errors.push(`child is older than its parent ${p.id}: ${where}`);
  }
  if (n.doc) {
    if (!n.sources.length) errors.push(`documented object has no source: ${where}`);
    for (const [title, url] of n.sources) if (!/^https:\/\//.test(url) || !title) errors.push(`source needs a title and an https URL: ${where}`);
    if (!n.desc) warn.push(`documented object has no description: ${where}`);
  }
  if (n.approx && !['month', 'year'].includes(n.approx)) errors.push(`approx must be "month" or "year": ${where}`);
}

const doc = D.nodes.filter(n => n.doc).length;
console.log(`FORK data: ${D.nodes.length} objects · ${D.roots.length} origins · ${doc} documented · ${D.nodes.length - doc} sample`);
warn.forEach(w => console.warn('  warn  ' + w));
if (errors.length) {
  errors.forEach(e => console.error('  error ' + e));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log('All lineages valid.');
