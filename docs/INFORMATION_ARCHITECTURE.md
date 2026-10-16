# FORK — Information Architecture

Single-page app, hash-routed (bare-token hashes so links survive sharing).

```
FORK
├── #explore            Home
│   ├── Hero / Trace    sample lineage (Midnight Frog) + trace input
│   ├── Live lineage    Jean Phil, simulated fork events
│   ├── Hot forks       compact ranked rows
│   ├── Cultural families  7 families → open cluster in Map
│   ├── Mutation explorer  embedded compare
│   ├── Deepest lineages
│   └── Archive CTA
├── #trace              Trace workspace (input → 4 steps → lineage + ancestry path)
├── #map  / #map.<family>   Global lineage landscape, semantic zoom
├── #archive            Research library: filters + sortable table
├── #o.<id>             Object page
│   title · type · status · score → primary lineage → origin → direct forks
│   → mutation history → platform spread → evidence → descendants → related families
├── #compare.<a>.<b>    Mutation view (ancestor → descendant)
└── #about              Method, scoring, sample-data notice
```

## Global UI
- **Nav** (sticky): logo · EXPLORE TRACE MAP ARCHIVE · SEARCH ABOUT. The active item is marked by a branch that peels off the nav's bottom rule.
- **Search** (`/` or ⌘K): name, phrase, URL, ticker, handle. Results: name, type, origin date, score, status.
- **Inspector**: right panel on desktop, bottom sheet on mobile. Opens from any node anywhere.

## Every node, everywhere, leads to
inspector → object page → compare with ancestor → map cluster.

## Mobile
No spatial graph. Every lineage renders as a **lineage stack**: ancestry breadcrumb on top, active object, children as expandable branch rows. The same stack is the desktop "List" view for keyboard and screen-reader users.
