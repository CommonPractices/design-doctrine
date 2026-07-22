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
TestingAutoPilot has six repos and is one product; CommonPractices has four and is four products.
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
- **CommonPractices** = `portfolio`. Distinct products: CommonMind, CommonFraming, CommonTongue —
  and CommonStage itself once it exists.

These are two genuinely different kinds of multiplicity — *one product, many repos* versus *many
products, one org*. Conflating them is the failure this flag exists to prevent.

**CommonPractices as the `portfolio` half is deliberate, not incidental.** It carries by far the
family's heaviest documentation (CommonMind alone is 37 files / ~7,250 lines with dense
inter-doctrine cross-linking), so it proves the expensive half of the apparatus — docs rendering —
in phase one rather than deferring it. It also makes CommonStage **self-hosting**: the apparatus
renders the org that contains it, so a docs-rendering regression is visible on the doctrine site the
family reads most.

Other family orgs (SurfaceWorks, DeckLibre, StudioEnsemble, ObservationPost, jschwefel-workshop) are
in scope for the standard but are **not** proving sites; they adopt the shape once it is extracted.

---

## 3. Page kinds

1. **Org index** — `portfolio` orgs only. Org identity band, product cards, org-level prose.
2. **Product page** — what it does, screenshots, install, downloads, docs link, status, repo link.
3. **Docs pages** — rendered markdown with navigation, anchors, and search.

---

## 4. Configuration

A **full site config** file in each org's `.github` repo. It lives there because that is where
org-level facts already live (the profile README and the community health set), per
[Org & Repo Bootstrap Doctrine](../../../org-and-repo-bootstrap-doctrine.md).

Data out of code: the generator holds logic only. Changing what a site shows means editing the
config, never the code.

**Format: strict JSON** (RFC 8259), per
[Data Format Doctrine](../../../data-format-doctrine.md) — this is a format the family itself
defines, so the doctrine applies and JSONC/JSON5 are banned. Annotation goes in **data** (`_note`
fields), never comments.

### 4.1 The three tiers

Ease of use (few fields) and choice (many knobs) pull in opposite directions. **They are not traded
off against each other** — per [North Stars Doctrine §5](../../../north-stars-doctrine.md), a
ranking says which star you may not lose, *not* which to sacrifice: *"don't trade; find the
construction that satisfies both."*

The three-tier shape **is** that construction, and it is the same one the doctrine cites as the
model (CameraConductor's accessibility-vs-choice clash, resolved with a floor — total freedom above
guarantees that cannot be overridden):

- **A tiny required set** (3 fields) — ease of use fully served; a minimum viable config is three
  lines.
- **Unlimited optional knobs above it**, each with a working default — choice fully served; nothing
  a reasonable org might want to vary is hardcoded.
- **An inviolable floor beneath** (§4.2) — no config may lower the accessibility floor, whatever
  else it sets.

Neither star is sacrificed. Add: **nothing display-facing is derived from a namespace** (§4.1's
`hostname` rule).

> ⚠️ **CommonStage has no ratified North Star set — see §8.5.** The reasoning above invokes the
> family presentation-layer ordering (Accessibility · Ease-of-use · Speed · Choice) without
> CommonStage having stated a set of its own.
> [§2.1](../../../north-stars-doctrine.md) forbids that: a product "does not silently inherit an
> unstated" set, and naming a family set by reference is permissible "only as an explicit, ratified
> choice." **The construction above stands on its own merits — a satisfy-both design needs no
> ranking to justify it — but any claim that *the ordering* justifies it is not yet legitimate.**

**Required — 3 fields.** A minimum viable config is three lines.

| Field | Example | Why |
|---|---|---|
| `org` | `jschwefel-workshop` | The GitHub namespace. **Never rendered.** |
| `hostname` | `workshop` | Yields `workshop.schwefel.net`. |
| `shape` | `portfolio` | §2's flag. |

⭐ **`hostname` is NOT derived from `org`, and this is the ordinary case, not an edge case.** The org
name is a GitHub namespace; the hostname is a presentation choice. `jschwefel-workshop` becomes
`workshop.schwefel.net` — deriving it would produce `jschwefel-workshop.schwefel.net`, which no one
would choose. The same divergence applies to the display name. **Every identifier that can diverge
is its own field.**

**Authored — nothing else holds these facts.** `name` (display), `full_name`, `tagline`, `blurb`,
`status` (per User-Documentation Doctrine's honest-status rule), `links`, `exclude` (repos not to
surface — `portfolio` renders everything by default, so this is the escape hatch), `order`,
`featured`, `og_image`, `docs.*` (source, include/exclude globs, nav order, landing file),
`theme_default`.

Note that **no org currently sets a GitHub org description**, so taglines and blurbs cannot fall
back to GitHub metadata — they must be authored.

**Computed — never stored.** Storing these creates a second home for one fact
([Single-Source-of-Truth](../../../single-source-of-truth-doctrine.md)):

| Value | Resolved from | Never |
|---|---|---|
| Canonical URL | `hostname` + domain | a stored `url` field that can diverge |
| Org colour + mark | the Identity-Mark asset in `.github/profile/` | a restated hex value |
| Licence | the repo's own `LICENSE` | a restated licence name |
| Repo list | the GitHub API | a hand-maintained product list |

### 4.2 Two hard exclusions

- **No analytics field of any kind.** Sites are hosted on a server the owner fully controls (§8.4);
  server-side analytics land there and are the owner's to surface. CommonStage introduces no
  third-party beacon and no client-side collector.
- **No field may lower the accessibility floor.** There is deliberately no way for a config to
  disable the contrast audit or override the `@layer` floor that
  [`foundation.css`](../../../assets/foundation.css) establishes. Accessibility is the family
  presentation layer's first North Star; a knob that can switch it off would make it advisory.

### 4.3 GitHub repo signals are content

Download counts, clone/view traffic, and stars are **wanted on the page** — they are content fetched
from the GitHub API, not visitor measurement. Distinct from §4.2's exclusion, which concerns
observing site visitors.

This means a product page is not purely static output. Whether the numbers are **build-time fetched**
(accurate as of last build, no client request) or **client-side fetched** (live, requires a request
to GitHub from the visitor's browser) is an **implementation decision for the plan**, with a real
tradeoff: the client-side form contacts a third party from the visitor's browser, which §4.2's
spirit disfavours.

---

## 5. Relationship to existing family assets

### 5.1 `foundation.css` is consumed, never copied

[`CommonMind/assets/foundation.css`](../../../assets/foundation.css) (507 lines) already exists,
is meant to be dropped into consuming projects **unchanged**, and owns colour, themes, personas, and
the two-layer accessibility floor — verified by
[`audit.js`](../../../assets/audit.js) and [`_verify.html`](../../../assets/_verify.html).

**CommonStage adds page structure only.** It must not restate or re-specify anything foundation.css
owns; that would be a second copy that drifts
([Single-Source-of-Truth Doctrine](../../../single-source-of-truth-doctrine.md)).

**The dependency is by identity, never by checkout path.** Per
[Repository-Portability Doctrine](../../../repository-portability-doctrine.md), CommonStage names
what it needs by a coordinate that resolves on any machine — never `../CommonMind/assets/`.

> **Pre-existing violation to fix, noted here because this design surfaces it:**
> `CommonFraming/README.md` and `CommonTongue/README.md` both link to sibling repos via `../` paths
> (`../CommonMind/`, `../LiteController/`). These resolve only on a machine with that exact
> checkout layout and break for every off-machine consumer — including any rendered web view of
> those READMEs. This is the exact coupling Repository-Portability forbids. It is **out of scope for
> CommonStage** but must be fixed before those READMEs are rendered to the web.

### 5.2 CommonStage versions; CommonMind does not

CommonMind states plainly: *no releases and no version numbers — these documents are always
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
CommonMind, CommonFraming, and CommonTongue.**

(CommonPractices is a GitHub **Org**, not a grouping directory: it holds `.github` plus those three
repos. The local `~/repositories/CommonPractices/` is the on-disk org mirror per
[Repository-Portability Doctrine](../../../repository-portability-doctrine.md), which is why it is
not itself a git repository.)

### The Prime Directives analysis

Run per [Decision Doctrine §11](../../../decision-doctrine.md).

**Lens 1 — North Stars.** **CommonStage has no stated ordered set, so this lens cannot be run
properly yet — stated as thin rather than manufactured**, since inventing a ranking to make the
analysis look complete is the failure §11 warns about. The framework's home is now
[North Stars Doctrine](../../../north-stars-doctrine.md) (formalized 2026-07-21, after this
analysis was first written; Decision Doctrine §1 was slimmed to point at it). That doctrine's §2.1
is why the gap cannot simply be closed by borrowing the family set — see §8.5. What the family
altitude stack does assert is that altitude separation is itself the organizing value; that argument
is made under Correctness below.

**Lens 2 — Blueprints.** **No blueprint governs this shape.** Both existing blueprints are DRAFT and
hardware/service-shaped. Per the [Blueprint Charter §5](../../../../CommonFraming/CHARTER.md), the
charter is deliberately anemic about domain and explicitly anticipates a different genre — so a
*new* blueprint for a family web presence would be legitimate. But Charter §2 is absolute: **a
blueprint ships no code you depend on.** Since the chosen scope is a full apparatus (generator,
templates, CSS, schema), CommonFraming cannot be its home. A blueprint could later describe the
*shape*; it can never hold the apparatus.

**Lens 3 — Best Practices.** The idiomatic answer is unambiguous: a shared theme/generator is its
own versioned package consumed by many sites — Hugo themes, Jekyll gems, Astro integrations, Sphinx
themes all ship this way. Nobody vendors a generator inside a prose-docs repo. This lens points at a
separate repo, and equally hard *away* from `CommonMind/assets/`.

**Lens 4 — Correctness / SSoT.** The decisive lens. **Every existing CP repo has a written charter
that this apparatus falsifies:**

| Repo | Its charter says | CommonStage would require |
|---|---|---|
| CommonFraming | "ships no code you depend on" | shipping code you depend on |
| CommonTongue | runtime wire contracts so independent *programs* interoperate | a build-time site tool — different consumers, lifecycle, failure mode |
| CommonMind | "no releases and no version numbers" | a versioned artifact consumers pin |

Three charter amendments to avoid one repo is the worse trade. CommonTongue's own README sets the
precedent for splitting on altitude rather than stretching a repo: *"this is why it is its own repo
and not part of blueprints."*

**Recommendation:** new repo. Its cost is one more repo in the family; the alternative is weakening
three charters that are currently true.

---

## 7. Sequencing — two sites, then extract

**Build two sites concretely first. Extract the shared apparatus from proven duplication second.**

1. **Build TestingAutoPilot's site** (`product`) — real HTML/CSS, hand-assembled.
2. **Build CommonPractices' site** (`portfolio`) — likewise, including rendered docs.
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

### 8.1 Docs rendering — RESOLVED by the choice of proving pair

Scope includes rendered documentation sites. Navigation generation, anchors, search, cross-document
linking, and code highlighting are most of the engineering — far more than landing pages.

An earlier draft paired TestingAutoPilot with SurfaceWorks and flagged that **neither is the hard
docs case**, leaving the expensive half of the apparatus unproven. **Resolved 2026-07-21 by the
owner: the `portfolio` half of the pair is CommonPractices, not SurfaceWorks.** CommonMind alone is
37 files / ~7,250 lines with dense inter-doctrine cross-linking and a README whose Documents table
is ~35 substantial paragraphs in markdown table cells — the family's hardest docs target.

Docs rendering is therefore proven in phase one rather than deferred, and CommonStage is
self-hosting (see §2, *Worked pair*).

**What remains open** is not *whether* to render docs but *how far*: search, per-doctrine navigation,
anchor stability across renames, and how the CommonMind README's dense table renders on the web are
all unspecified. Those are implementation questions for the plan, not design questions.

### 8.2 Stack choice is unmade

"Extract a generator" implies a language/framework decision — Rust, TypeScript, Python, Hugo, Astro,
or other. Governed by
[Language-Selection Doctrine](../../../language-selection-doctrine.md) and deserving its own PD run.
**Not decided.** Deliberately deferred until the two hand-built sites show what the generator must
actually do.

### 8.3 An empty `portfolio` org renders nothing

**Withdrawn as originally written.** An earlier draft claimed DeckLibre existed both as its own Org
and as a SurfaceWorks product, and raised a nesting/SSoT question. **That premise was false**,
asserted from a stale memory rather than checked: verified 2026-07-21 against
`gh api orgs/{DeckLibre,SurfaceWorks}/repos` — SurfaceWorks holds exactly `.github`, Lucidity,
Palette, Codex, and **DeckLibre is a separate org that does not appear in it.** No product is
currently nested in two orgs, so there is no nesting question to answer.

The real open item the check surfaced instead: **DeckLibre is an org holding only `.github` — no
product repos.** Under `portfolio` (every repo is a product, with `.github` excluded by rule) it
renders an index with **zero** product cards. The standard must say what an empty or single-repo
`portfolio` org does — render an empty index, fall back to a placeholder, or be excluded from
generation until it has a product. **Undecided.**

### 8.4 Hosting — DECIDED: the owner's own server

**Resolved 2026-07-21 by the owner: sites are hosted on a server the owner fully controls**, not
GitHub Pages. The VPS already serves other sites, so the marginal cost per site is near zero, and
`schwefel.net` is owner-controlled DNS.

**Server-side analytics are explicitly OUT OF SCOPE for CommonStage.** Access logs land on the
owner's server and the owner surfaces them by their own means. CommonStage neither configures,
collects, nor reports them, and **the site config carries no analytics field.** No third-party
beacon and no client-side collector is introduced by the standard.

What remains open is only the **deploy path** (Actions→rsync over a deploy key, a pull-based hook,
or otherwise) — an implementation question for the plan, not a design question.

### 8.5 CommonStage owes a stated ordered North Star set

**CommonStage has no stated North Stars, and this design leaned on a borrowed set without saying
so.** The §4.1 config tiering was derived from the SurfaceWorks family ordering (Accessibility ·
Ease-of-use · Speed · Choice) — specifically the claim that *ease-of-use outranks choice*, which is
what produced the tiny-required-set / everything-else-defaults shape.

[North Stars Doctrine §2.1](../../../north-stars-doctrine.md) (formalized 2026-07-21) forbids this
directly: a product "does not silently inherit an unstated" set, and naming a family set by
reference rather than restating the values is permissible "**only as an explicit, ratified
choice**… never as a default to dodge the work of choosing."

**The borrowed set is itself real and ratified** — verified 2026-07-21 in
`SurfaceWorks/.github/profile/README.md`, which states *"North Stars (in order): Accessibility ·
Ease-of-use · Speed · Choice"*, exactly where §2.1 says family stars live. So the defect is not a
fabricated ranking; it is that **CommonStage invoked a sibling's set without stating one of its
own** — the silent-inheritance failure, not an invented-values failure. That also makes the
by-reference route genuinely available to CommonStage, *if* the owner ratifies it explicitly.

**This is a gap, recorded rather than papered over.** The conclusions may survive ratification
unchanged — CommonStage is a presentation-layer product and the family ordering may genuinely be
right for it — but *"the ordering justifies the design"* is not a claim this spec is currently
entitled to make.

**What closing it requires** — the doctrine's own §6 checklist, owner-driven per §7 (the doctrine
defines the framework; it does not invent any project's values):

- [ ] **3–5 ordered stars**, each with a one-line gloss, in CommonStage's own docs.
- [ ] **The framework referenced, not re-derived** — cite the doctrine, then list CommonStage's own
      values.
- [ ] **No silent inheritance** — a by-reference set (e.g. "same as the family presentation layer")
      is legitimate *only* as an explicit ratified choice, never as a default.
- [ ] **Each star shown forcing an outcome** — an empty row means a slogan.
- [ ] **Accessibility accounted for across CommonStage's modality surface**, in one of §1.4's three
      forms; silence requires a recorded, approved exception.
- [ ] **Pinned to the decision log** — accepted, dated, provenance greppable.
- [ ] **One authoritative statement**; other mentions reference it.

**Candidate evidence already in hand** (§1.3's reality test — each is a place a value *forced* a
design outcome, not a slogan):

| Star | Where it forced something |
|---|---|
| Accessibility | §4.2 — no config field may lower the floor, and there is deliberately no knob to disable the contrast audit. A **floor outside the ranking** (§1.4's second form) is the likely fit: CommonStage's modality surface is the rendered page, and the mechanisms already live in `foundation.css`. |
| Ease of use | §4.1 — the required set is 3 fields; a minimum viable config is three lines. |
| Choice | §4.1 — every display-facing identifier that can diverge is its own field (`hostname` ≠ `org`), and `exclude`/`order`/`featured` exist so `portfolio`'s render-everything default is never a mandate. |

**Note the modality surface is narrow.** CommonStage's own surface is generated HTML/CSS; it has no
persona ladder, no pointer interaction to speak of, and no language chooser. Per §1.3, ranking
accessibility as star #1 here may fail the reality test the way it does for LiteController — which
is exactly why §1.4 provides the floor form. **That is a judgement for ratification, not something
this spec should presume.**

Until the set exists, §4.1's ⚠️ note stands.

---

## 9. What this design does not cover

- The visual design itself — CommonStage owns page *structure*; foundation.css owns the *look*.
- Per-product content (copy, screenshots) — authored per product, not by this standard.
- ColdBoreBallistics, which is out of scope by the global CBB branding directive.
- jschwefel-workshop's shape — in scope for the family but not part of the proving pair; note that a
  workshop org may contain repos not intended for public presentation, which the `portfolio`
  render-everything rule would surface. **Check before applying `portfolio` to it.**
