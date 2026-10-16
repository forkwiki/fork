# FORK — Motion System

Motion explains derivation. If a movement doesn't show a parent becoming a child (or the reverse), it isn't used.

| Motion | Trigger | Behaviour | Purpose | Timing |
|---|---|---|---|---|
| Loader | first load | a vertical line draws, forks, forks again, resolves into the mark | brand in one gesture | ~1.1s total |
| Branch growth | object/lineage loads, node revealed | edge grows parent → child (partial Bézier), node appears when the edge arrives | derivation | 600ms per generation, siblings staggered 40ms |
| Hero sequence | homepage | origin → one line → splits → splits again → dozens of descendants → headline | product in 5 seconds | ~3s |
| Camera travel | click a descendant / trace result | camera centre follows the actual branch curves from current focus through the common ancestor to the target | navigation = lineage | 500–1400ms, by path length |
| Re-layout | visibility changes | nodes tween to new positions | continuity | 520ms |
| Collapse | move focus to parent / collapse | child branches retract into the parent, then are removed | hierarchy | 360ms |
| New fork | simulated live event | a fresh branch splits from an existing node and grows; feed row slides in | the product feels alive | 900ms |
| Inspector | node click | slides from the right (desktop) / up (mobile) | detail without leaving the graph | 280ms |
| Hover | node / branch | node scales 1.25; its full lineage (ancestors + subtree) turns cobalt, the rest dims | read a path at a glance | 150ms |
| Trace cursor | while tracing | cursor becomes the fork mark | processing state in brand | — |

Easing: `cubic-bezier(.2,.7,.2,1)` for growth and camera; `ease-in` for retraction.
`prefers-reduced-motion`: loader skipped, growth and camera jump to end state, hover keeps colour change only.
