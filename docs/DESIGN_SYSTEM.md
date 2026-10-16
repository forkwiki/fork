# FORK — Design System

**Test for every decision: does it feel like branching?**

## Mark
A single stem with a base dot (the origin). Two-thirds up, one branch peels off to the right in a controlled curve and ends in a small open node; the stem continues. Asymmetric on purpose: inheritance continues, mutation leaves. Used as logo, favicon, origin marker, loader, cursor while tracing, and the mutation glyph on edges (miniaturised).

## Colour
Dark-first terminal palette; a light theme mirrors it.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--paper` | #0B0C0E | #F4F4F1 | ground |
| `--ink` | #E6E6E1 | #111214 | text, branches |
| `--ink-2` | #A3A39C | #4A4B4F | secondary text |
| `--muted` | #6B6C68 | #85867F | meta, `//` comments |
| `--rule` | #24262B | #D9D9D2 | hairlines |
| `--cobalt` | #7E97FF | #2B47D8 | the one accent: selection, primary action, cursor |

Families use an ANSI-like set (cyan, blue, yellow, magenta, green, violet, orange) and appear only on branches, dots and 8px keys.

## Type
One family: **JetBrains Mono** (300–700). Headings 500 with tight tracking, body 14px/1.6, labels 10.5–11px lowercase. Section eyebrows read as comments (`// hot forks`), buttons as `[ open the graph ]`, the trace field as a `$` prompt, the current nav item as `~/explore`.

## Components
- **Node**: open circle (diamond for tokens), name and `TYPE · MON YYYY` in mono. No cards.
- **Branch**: tapered ribbon (verified), dashed (likely), dotted (disputed), fork mark (mutation).
- **Status chip**: uppercase sans, 1px border; FORKING and PEAKING fill cobalt.
- **Rows** instead of cards: Hot Forks, Families, Deepest, Archive.
- **Buttons**: square, 1px ink border; primary is cobalt fill. Hover shifts to electric.
- **Fork rule**: section divider — a hairline from which a short branch rises to the heading.
- **Sample badge**: `SAMPLE DATA` / `SAMPLE LINEAGE` / `SIMULATED` in small caps with a dotted border — dotted means "not verified" across the system.

## Layout
Desktop: graph canvases go edge to edge; text columns max 68ch; tables full width with hairlines. Mobile (< 760px): stacks, bottom sheet, no spatial graph.
