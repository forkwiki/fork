# FORK — Design System

**Test for every decision: does it feel like branching?**

## Mark
A single stem with a base dot (the origin). Two-thirds up, one branch peels off to the right in a controlled curve and ends in a small open node; the stem continues. Asymmetric on purpose: inheritance continues, mutation leaves. Used as logo, favicon, origin marker, loader, cursor while tracing, and the mutation glyph on edges (miniaturised).

## Colour
| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | #F2EFE7 | #121315 | ground |
| `--paper-2` | #E9E5DA | #1B1C1F | hover, sheet |
| `--ink` | #151515 | #ECE8DE | text, branches |
| `--ink-2` | #4B4A46 | #B3AFA6 | secondary text |
| `--muted` | #8C8A83 | #75736D | meta, uncertain links |
| `--rule` | #D4CFC3 | #2D2E32 | hairlines |
| `--cobalt` | #1C3FB0 | #7E97FF | signal: selected lineage, primary action, score |
| `--electric` | #2B5CFF | #A4B6FF | hover / interaction only |

One accent for interaction. Families get muted printing-ink colours (teal, cobalt, ochre, crimson, green, plum, vermilion) so the culture graph reads like an atlas; they appear only on branches, dots and 8px family keys. No gradients or glows.

## Type
- **Newsreader** (display serif, optical sizes) — object names, page titles, lineage names, statements.
- **Schibsted Grotesk** (utility sans) — nav, labels, metadata, metrics, controls. Uppercase labels at 11px, +0.08em tracking. Tabular numerals everywhere digits align.

Scale: 11 · 13 · 15 · 18 · 24 · 34 · 52 · clamp(48–104).

## Components
- **Node**: 7px open circle (diamond for tokens), name in serif, `TYPE · MON YYYY` in sans below. No cards.
- **Branch**: tapered ribbon (verified), dashed (likely), dotted (disputed), fork mark (mutation).
- **Status chip**: uppercase sans, 1px border; FORKING and PEAKING fill cobalt.
- **Rows** instead of cards: Hot Forks, Families, Deepest, Archive.
- **Buttons**: square, 1px ink border; primary is cobalt fill. Hover shifts to electric.
- **Fork rule**: section divider — a hairline from which a short branch rises to the heading.
- **Sample badge**: `SAMPLE DATA` / `SAMPLE LINEAGE` / `SIMULATED` in small caps with a dotted border — dotted means "not verified" across the system.

## Layout
Desktop: graph canvases go edge to edge; text columns max 68ch; tables full width with hairlines. Mobile (< 760px): stacks, bottom sheet, no spatial graph.
