# FORK — Product Model

**Everything comes from something.** FORK is a lineage explorer for internet culture: it shows where an object started, what it became, what it spawned, how far it travelled, and what changed on the way.

## Core primitive
One object → forks → many objects. Every screen is a view onto that one relation (`parent → child`). There is no feed, no social graph, no dashboard.

## Object
A cultural unit with a single known parent (or none, if it is an origin).

| Field | Notes |
|---|---|
| `id`, `name`, `type` | POST · MEME · CHARACTER · TOKEN · COMMUNITY · VIDEO · FORMAT · NARRATIVE · EVENT |
| `platform`, `handle`, `url` | Where it was first seen. Documented objects link to their first source; sample objects carry `sample://` URLs. |
| `date` | First-seen date. |
| `parent`, `children` | Lineage edges. `children` is derived. |
| `family` | Cultural family (AI Celebrities, Brainrot, …). Can differ from the root's family — that is how families connect. |
| `link` | Relation to parent: `confidence` (0–1) + `evidence[]`. |
| `traits` | Visual identity, format, platform, audience, tone, symbols, tokenization, character traits. Used by Mutation. |
| `tags`, `aliases`, `ticker` | Search surface. |

Derived per object: `depth`, `forks` (direct children), `descendants`, `depthBelow`, `platforms`, `forkScore`, `status`, `momentum` (forks in a 14-day window vs the previous 14).

## Lifecycle states (cultural, not financial)
ORIGIN · EMERGING · SPREADING · FORKING · PEAKING · COOLING · LEGACY — computed from fork timing, age and score (see GRAPH_MODEL).

## Relation confidence
VERIFIED (≥ 0.85) · LIKELY (0.55–0.85) · DISPUTED (< 0.55). Each link lists its evidence: timestamp precedence, direct reference, shared media, caption reference, cross-link, press mention, community reference, counter-claim.

## Fork Score
How much culture an object spawned downstream, 0–100. Computed only from the lineage graph (forks, descendants, depth below, platforms reached, years active). It never uses reach, followers or prices.

## Two kinds of data
- **Documented** objects are real (2005 → Oct 2026) and carry `sources`: public links behind their date and their parent. Dates can be exact, `approx` (month/year) or `reported` (first date a source mentions it).
- **Sample** objects are fictional and show how deep lineages behave. They are labelled **Sample** everywhere.

## Honesty rules
- No live feeds. Trace searches the archive only; unknown URLs return "not in archive", never an invented lineage.
- No follower counts, market caps or view counts anywhere.
- Uncertain links are drawn dashed or dotted and carry counter-evidence.

## Core loop
Land → see a lineage grow → paste something → origin found → lineage grows → click a branch → camera follows → open descendant → compare mutation → find deeper ancestry.
