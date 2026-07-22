# CommonStage — Design

**Status:** DRAFT — working document, not approved.
**Date:** 2026-07-21
**Owner:** jschwefel

The family's shared web presentation layer: the standard, templates, styling, config schema, and
eventually a generator for the public web pages of every family Org and product.

---

## 1. Purpose

Seven family Orgs have no public web presence. Built ad hoc, they would read as seven unrelated
projects. CommonStage makes them read as one family — a common look, a common page shape, and a
common way of declaring what a site contains.

**In scope:** every Org except **ColdBoreBallistics** (CBB is a separate business identity with its
own branding rules; see the global CBB branding directive).

Current orgs in scope: TestingAutoPilot, DeckLibre, StudioEnsemble, jschwefel-workshop,
CommonPractices, SurfaceWorks, ObservationPost.

**Licence:** Apache-2.0. Per [Licensing Doctrine](../../../licensing-doctrine.md), Q1's
client-vs-service tie-breaker: a static-site generator an operator runs against their own repos is a
**client/local tool**, not a managed service others send data to — the same reading that puts Oscura
at Apache rather than BSL.

---

## 2. The shape flag

Each org declares its own shape as data, in a site config file in that org's `.github` repo.

| Flag | Means | Renders |
|---|---|---|
| `product` | **The org IS the product** | One product page. Repos are platforms/components behind the single product and are never enumerated as products. |
| `portfolio` | **Every repo IS a product** | An org index page, plus one product page per repo. |

The **same product-page template** serves both. `portfolio` adds an index above the product pages;
`product` is the case where the org itself is the single product.

**Why a declared flag and not an inferred one.** Repo count does not determine shape:
TestingAutoPilot has six repos and is one product; SurfaceWorks has three and is three products.
Only the org knows which it is, so the org states it. This is **data out of code** (Scripting
Philosophy: business data lives in an input file the code reads at runtime, never in the code) — the
generator branches on a declared fact, never on a heuristic it guessed.

**What the flag deliberately does NOT require.** No per-repo role taxonomy, no
release-implies-product heuristic, no maintained list of products. A `portfolio` org that gains a
repo gains a product page with no config edit — there is no currency obligation to forget. The
`.github` repo itself is excluded by a fixed rule in the generator, not by configuration.

### Worked pair

- **TestingAutoPilot** = `product`. One product (AutoPilot) across `autopilot-core`,
  `autopilot-macos`, `autopilot-ios`, `autopilot-android`, `autopilot-web`, plus
  `homebrew-autopilot`. Those five platform repos are implementation detail — surfacing them as five
  products would misrepresent the product entirely.
- **SurfaceWorks** = `portfolio`. Three distinct products: Lucidity, Palette, Codex.

These are two genuinely different kinds of multiplicity — *one product, many repos* versus *many
products, one org*. Conflating them is the failure this flag exists to prevent.

---

## 3. Page kinds

1. **Org index** — `portfolio` orgs only. Org identity band, product cards, org-level prose.
2. **Product page** — what it does, screenshots, install, downloads, docs link, status, repo link.
3. **Docs pages** — rendered markdown with navigation, anchors, and search.

---

## 4. Configuration

A **full site config** file in each org's `.github` repo, carrying:

- **Shape** — `product` | `portfolio`
- **Identity** — display name, org colour (from
  [Identity-Mark Doctrine](../../../identity-mark-doctrine.md), which assigns one colour per org),
  tagline, domain
- **Navigation** and **footer**
- **Docs sources** — which repos/paths supply rendered documentation

It lives in `.github` because that is where org-level facts already live (the profile README and the
community health set), per
[Org & Repo Bootstrap Doctrine](../../../org-and-repo-bootstrap-doctrine.md).

Data out of code: the generator holds logic only. Changing what a site shows means editing the
config, never the code.

---

## 5. Relationship to existing family assets

### 5.1 `foundation.css` is consumed, never copied

[`design-doctrine/assets/foundation.css`](../../../assets/foundation.css) (507 lines) already exists,
is meant to be dropped into consuming projects **unchanged**, and owns colour, themes, personas, and
the two-layer accessibility floor — verified by
[`audit.js`](../../../assets/audit.js) and [`_verify.html`](../../../assets/_verify.html).

**CommonStage adds page structure only.** It must not restate or re-specify anything foundation.css
owns; that would be a second copy that drifts
([Single-Source-of-Truth Doctrine](../../../single-source-of-truth-doctrine.md)).

**The dependency is by identity, never by checkout path.** Per
[Repository-Portability Doctrine](../../../repository-portability-doctrine.md), CommonStage names
what it needs by a coordinate that resolves on any machine — never `../design-doctrine/assets/`.

> **Pre-existing violation to fix, noted here because this design surfaces it:**
> `blueprints/README.md` and `CommonTongue/README.md` both link to sibling repos via `../` paths
> (`../design-doctrine/`, `../LiteController/`). These resolve only on a machine with that exact
> checkout layout and break for every off-machine consumer — including any rendered web view of
> those READMEs. This is the exact coupling Repository-Portability forbids. It is **out of scope for
> CommonStage** but must be fixed before those READMEs are rendered to the web.

### 5.2 CommonStage versions; design-doctrine does not

design-doctrine states plainly: *no releases and no version numbers — these documents are always
current by definition.* A generator that consumers pin **must** version. That asymmetry is the
cleanest proof the two are different kinds of thing and belong in different repos.

### 5.3 Profile README vs. site — two surfaces, two audiences

Both are authored; neither generates the other. This is an **accepted currency obligation**, not
drift — but it only stays honest if each surface's ownership is stated explicitly:

| Surface | Audience | Owns |
|---|---|---|
| `.github` profile README | Developers already on GitHub | Repo index (must match `gh api orgs/<org>/repos`, per Org & Repo Bootstrap), contributing, issues, org-internal facts |
| CommonStage site | People discovering the product | What it does, screenshots, install, downloads, docs, status |

The precedent is [User-Documentation Doctrine](../../../user-documentation-doctrine.md): two
audiences, two shapes. The risk it names is equally real — two half-maintained copies. The standard
must therefore state the split above as a rule, not leave it to judgement.

---

## 6. Where CommonStage lives — a fourth CommonPractices repo

**Decision: a new repo, `CommonStage`, in the CommonPractices org — a fourth repo beside
design-doctrine, blueprints, and CommonTongue.**

(CommonPractices is a GitHub **Org**, not a grouping directory: it holds `.github` plus those three
repos. The local `~/repositories/CommonPractices/` is the on-disk org mirror per
[Repository-Portability Doctrine](../../../repository-portability-doctrine.md), which is why it is
not itself a git repository.)

### The Prime Directives analysis

Run per [Decision Doctrine §11](../../../decision-doctrine.md).

**Lens 1 — North Stars.** CommonPractices publishes no ordered North Stars of its own; DD's README
presents the *framework* and uses CameraConductor's four as a worked example. **This lens is thin
here, and is stated as thin rather than manufactured** — inventing a ranking to make the analysis
look complete is the failure §11 warns about. What the family altitude stack does assert is that
altitude separation is itself the organizing value; that argument is made under Correctness below.

**Lens 2 — Blueprints.** **No blueprint governs this shape.** Both existing blueprints are DRAFT and
hardware/service-shaped. Per the [Blueprint Charter §5](../../../../blueprints/CHARTER.md), the
charter is deliberately anemic about domain and explicitly anticipates a different genre — so a
*new* blueprint for a family web presence would be legitimate. But Charter §2 is absolute: **a
blueprint ships no code you depend on.** Since the chosen scope is a full apparatus (generator,
templates, CSS, schema), blueprints cannot be its home. A blueprint could later describe the
*shape*; it can never hold the apparatus.

**Lens 3 — Best Practices.** The idiomatic answer is unambiguous: a shared theme/generator is its
own versioned package consumed by many sites — Hugo themes, Jekyll gems, Astro integrations, Sphinx
themes all ship this way. Nobody vendors a generator inside a prose-docs repo. This lens points at a
separate repo, and equally hard *away* from `design-doctrine/assets/`.

**Lens 4 — Correctness / SSoT.** The decisive lens. **Every existing CP repo has a written charter
that this apparatus falsifies:**

| Repo | Its charter says | CommonStage would require |
|---|---|---|
| blueprints | "ships no code you depend on" | shipping code you depend on |
| CommonTongue | runtime wire contracts so independent *programs* interoperate | a build-time site tool — different consumers, lifecycle, failure mode |
| design-doctrine | "no releases and no version numbers" | a versioned artifact consumers pin |

Three charter amendments to avoid one repo is the worse trade. CommonTongue's own README sets the
precedent for splitting on altitude rather than stretching a repo: *"this is why it is its own repo
and not part of blueprints."*

**Recommendation:** new repo. Its cost is one more repo in the family; the alternative is weakening
three charters that are currently true.

---

## 7. Sequencing — two sites, then extract

**Build two sites concretely first. Extract the shared apparatus from proven duplication second.**

1. **Build TestingAutoPilot's site** (`product`) — real HTML/CSS, hand-assembled.
2. **Build SurfaceWorks' site** (`portfolio`) — likewise.
3. **Extract** templates, config schema, and generator from what actually proved invariant across
   the two shapes.

**Why not design the generator up front.** A shape derived from a single instance is a hypothesis —
the discipline behind [Held-Out-Oracle Doctrine](../../../held-out-oracle-doctrine.md) and Blueprint
Charter §5's warning against over-abstracting from one instance. The proving pair already earned its
keep before either site exists: it surfaced the *one product, many repos* vs *many products, one
org* distinction, which a single-org design would have missed entirely.

---

## 8. Open questions

These are **not decided.** Recorded per Decision Doctrine §8 (record what is NOT decided).

### 8.1 Docs rendering is the dominant cost, and the proving pair may not prove it

Scope includes rendered documentation sites. Navigation generation, anchors, search, cross-document
linking, and code highlighting are most of the engineering — far more than landing pages.

**The problem:** neither TestingAutoPilot nor SurfaceWorks is the hard docs case.
**design-doctrine is** — 33 files, ~6,900 lines, dense inter-doctrine cross-linking, and a README
whose Documents table is ~35 substantial paragraphs rendered in markdown table cells. If the proving
pair excludes a docs-heavy site, the extraction will not have proven the expensive half of the
apparatus.

**CommonPractices is itself an Org** (`.github` + design-doctrine + blueprints + CommonTongue, soon
+ CommonStage) and is therefore a **`portfolio` org — the same shape as SurfaceWorks.** This makes
it a cheap third proving site rather than an expensive special case: it introduces no new page kind,
only the same `portfolio` template carrying by far the family's heaviest documentation behind each
product card. It is the natural stress test for docs rendering.

It also makes CommonStage self-hosting — the apparatus renders the org that contains it, so a
regression in docs rendering is visible on the doctrine site the family reads most.

**Options:** add CommonPractices as a third proving site (now the cheapest option); substitute it
for one of the pair; or explicitly defer docs rendering to a second phase.

**Unresolved.** Flagged during design; owner elected to start building rather than resolve it first.

### 8.2 Stack choice is unmade

"Extract a generator" implies a language/framework decision — Rust, TypeScript, Python, Hugo, Astro,
or other. Governed by
[Language-Selection Doctrine](../../../language-selection-doctrine.md) and deserving its own PD run.
**Not decided.** Deliberately deferred until the two hand-built sites show what the generator must
actually do.

### 8.3 Nesting: DeckLibre exists in two places

DeckLibre is its own Org *and* is recorded as a SurfaceWorks product. Under the recursive rule
(every product renders with the same template), a DeckLibre product page could legitimately appear
in both contexts. Whether that is one page referenced twice or two authored pages is **undecided** —
and it is an SSoT question, not a cosmetic one.

### 8.4 Hosting

GitHub Pages vs. the owner's existing VPS was analyzed in conversation and **not decided**. Both
support custom `*.schwefel.net` subdomains. The live differences: Pages provides no access logs of
any kind and cannot serve dynamic content, ever; the VPS provides both but requires a deploy
pipeline maintained per site. Static output means the choice is reversible for roughly the cost of
an afternoon, so it does not block building.

---

## 9. What this design does not cover

- The visual design itself — CommonStage owns page *structure*; foundation.css owns the *look*.
- Per-product content (copy, screenshots) — authored per product, not by this standard.
- ColdBoreBallistics, which is out of scope by the global CBB branding directive.
- jschwefel-workshop's shape — in scope for the family but not part of the proving pair; note that a
  workshop org may contain repos not intended for public presentation, which the `portfolio`
  render-everything rule would surface. **Check before applying `portfolio` to it.**
