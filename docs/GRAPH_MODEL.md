# FORK — Graph Model

## Structure
A forest. Each object has at most one parent; roots are origins. Families group roots for the Map; a node whose own `family` differs from its root's family draws an ancestry thread to that family on the Map.

## Derived metrics (computed in `data.js`, all from the sample graph)
- `depth` — generations from root (root = 0).
- `forks` — direct children. `descendants` — whole subtree. `depthBelow` — deepest generation under it.
- `platforms` — distinct platforms in its subtree (including itself).
- `yearsActive` — first-seen date → newest descendant.
- **Fork Score** = `round(100 · (1 − e^(−raw/40)))`,
  `raw = 2·forks + 0.5·descendants + 5·depthBelow + 4·(platforms−1) + 2·yearsActive`. Leaves score 0.
- **Momentum** — direct forks in the last 30 days vs the 30 days before. The archive clock is 2026-10-16.
- **Path confidence** — product of link confidences from origin to object.

## Status rules (first match wins)
1. FORKING — ≥ 3 direct forks in last 30 days
2. ORIGIN — a root under 180 days old
3. PEAKING — ≥ 5 descendants in last 30 days
4. EMERGING — under 90 days old
5. SPREADING — ≥ 2 descendants in last 180 days
6. LEGACY — older than 3 years with score ≥ 55
7. COOLING — everything else

## Layouts
- **Lineage (time tree)** — x = log time since origin (`log1p(days/40)`), with a minimum generation gap so a child is always right of its parent; y = leaf order among *visible* nodes, parents centred on their children. Layout recomputes when visibility changes; nodes tween to new positions.
- **Culture graph (fork plates)** — each family is a plate of fork trees: x = generation, y = leaf order, origins stacked top to bottom. Plates are shelf-packed into a wide sheet. Used on the homepage and the Map.

## Visibility (progressive rendering)
A node is drawn if its parent is drawn **and** one of: depth ≤ base depth + zoom bonus (+2 generations per 2× zoom), it is an ancestor of / the focus, it is within 2 generations below the focus, or its parent was expanded with the `+N` stub. Hidden subtrees show `+N` and load on demand.

## Edges
Cubic curves that leave the parent horizontally (siblings share their first stretch, so one line visibly splits). Width = influence, `∝ √(descendants of child + 1)`; verified links are tapered ribbons, likely links are dashed, disputed links dotted. A fork mark sits midway on links where the child mutated type or ≥ 2 traits.

## Labels
Screen-space, constant size. Placed greedily by priority (focus, ancestors, shallow, large subtrees); a label that collides drops its meta line, then hides. Zooming out therefore simplifies labels progressively.

## Accessibility
Graph host is focusable: ← parent, → first child, ↑/↓ siblings, Enter inspect, +/− zoom, 0 fit. A polite live region announces the focused object. "List" swaps in the lineage stack (`role="tree"`).
