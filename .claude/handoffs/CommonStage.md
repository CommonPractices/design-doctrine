# Handoff — CommonStage

**Session:** CommonStage · **Updated:** 2026-07-21 · **Repo:** `CommonPractices/CommonMind`

---

## ⚠️ Standing law-pointer block — DO NOT DROP. Re-read at these moments.

A pointer, never a copy. Go read the canonical file — memory of these was just lost across the
context boundary.

- **Before calling anything "fixed"/"verified"/"done"** → `verification-doctrine.md` + global
  CLAUDE.md *"A Fix Is Not A Fix Until The Test Fails Without It."* Watch it fail on the broken
  code; say what was **measured**, not assumed.
- **Before ANY non-trivial design choice** → run the **Prime Directives (PD)** = four lenses:
  **NS** (North Stars, ordered) + **BP = Blueprints** (SHAPES layer — say so if n/a) + **Best
  Practices** (spelled out, never "BP") + **Correctness**. SSoT = `decision-doctrine.md §11`.
  Analysis goes **WITH** the recommendation, never backfilled.
- **Before stating ANY fact about a repo/file/branch/remote** → have I actually READ it *this
  session*? On disk + unread → **READ it**. Do not describe from memory or inference.
- **Before editing a doc that names a renamed thing** → `terminology-migration-doctrine.md` §5
  ledger. **On-touch only**, never a bulk sweep — *except* live/canonical docs (READMEs, current
  specs, org profiles), which are swept proactively. **A `repo-name` rename does NOT rename a
  same-spelled concept.**
- **Before a "cut"/promotion** → owner-triggered ONLY, one-way. Never agent-initiated.
- **Git gates** → off-main commit freely; **`main` commit and GitHub push both need the owner's
  say-so.** Never touch the `jschwefel` GitHub account at all.
- **Question → answer, then STOP.** A question is not a work order.

---

## Where we are

**CommonStage is DESIGN-COMPLETE and committed. Nothing is built. The repo does not exist.**

The spec: `CommonMind/docs/_working/specs/2026-07-21-commonstage-design.md` (270 lines), on `main`,
synced to GitHub.

CommonStage = the family's shared web presentation layer — standard, templates, styling, config
schema, and eventually a generator for the public web pages of every family Org/product. **All orgs
except ColdBoreBallistics.**

### Decided (in the spec)

- **A fourth repo in the CommonPractices org**, beside CommonMind / CommonFraming / CommonTongue.
  Justified by a four-lens PD run: all three existing charters would have to be weakened to host it.
- **One declared shape flag per org**, in that org's `.github` site config:
  `product` = the org IS the product (one product page; repos are plumbing, never enumerated) ·
  `portfolio` = every repo IS a product (org index + a product page each). Same product-page
  template both ways. **No per-repo role taxonomy, no release heuristic, no maintained product
  list** — the owner explicitly rejected those as overthinking.
- **Licence Apache-2.0** (client/local tool, not a managed service — Licensing Doctrine Q1).
- **`foundation.css` consumed by identity, never copied or `../`-path-referenced.** It keeps owning
  colour/theme/persona/a11y floor; CommonStage owns page structure only.
- **Scope includes rendered docs sites**, not just landing pages.
- **Sequencing: build two sites concretely, then extract** — TestingAutoPilot (`product`) +
  SurfaceWorks (`portfolio`).

**Key finding, surfaced before any site was built:** two different kinds of multiplicity — *one
product, many repos* (AutoPilot: core/macos/ios/android/web + tap) vs *many products, one org*
(SurfaceWorks: Lucidity/Palette/Codex). The flag exists to keep them from being conflated.

---

## Next — the gate

**§8.1 must be decided before an implementation plan is worth writing:** does **CommonPractices**
join the proving set as a third site?

It is itself a `portfolio` org and holds the family's heaviest documentation, so it adds no new page
kind — only brutal content behind the same template. It is the natural docs-rendering stress test,
and it makes CommonStage self-hosting. **Docs rendering is the dominant engineering cost**; if the
proving pair excludes a docs-heavy site, the extraction will not have proven the expensive half.

Then **§8.2 stack choice** (Rust/TS/Python/Hugo/Astro — Language-Selection Doctrine, own PD run),
then `writing-plans`. A plan written before the stack is chosen would be mostly placeholder.

---

## Also open (recorded in spec §8, all undecided)

- **DeckLibre nesting** — its own Org *and* a SurfaceWorks product. One page referenced twice, or
  two authored pages? An SSoT question, not cosmetic.
- **Hosting** — GitHub Pages vs the owner's VPS. Both support `*.schwefel.net`. Pages has **no
  access logs, ever**, and cannot serve dynamic content; the VPS needs a deploy pipeline per site.
  Static output makes it reversible for ~an afternoon, so it does not block building.
- **jschwefel-workshop's shape** — may hold repos not meant for public presentation, which
  `portfolio`'s render-everything rule would surface. **Check before applying `portfolio` to it.**

---

## Verification state

- `[V]` Rename verified against reality this session — `gh api orgs/CommonPractices/repos` + local
  dirs. `design-doctrine`→**CommonMind**, `blueprints`→**CommonFraming**.
- `[V]` All 13 relative links in the spec resolve (each `test -e`'d, not eyeballed).
- `[V]` Spec swept for the rename: repo refs updated; **the concept "blueprint" and the verbatim
  CommonTongue README quote deliberately preserved** — the live README was re-read to confirm it
  still literally says *"not part of blueprints"*.
- `[V]` Stale measured fact corrected: CommonMind is **37 files / ~7,250 lines** (was written as
  33 / ~6,900).
- `[V]` `CommonMind` `main` synced to GitHub (0 ahead).
- `[A]` **Nothing about CommonStage has been built or tested — there is no code to verify.**

---

## Files / branches

- `CommonMind/docs/_working/specs/2026-07-21-commonstage-design.md` — the spec.
- Commits: `e24243c` (spec) → `8c2c40c` (rename sweep), both on `main`, pushed to GitHub.
- No open branches from this session; both spec branches merged fast-forward and deleted.

**Do not touch (other sessions' work):**
- `.claude/handoffs/CommonPractices.md` — another session's live handoff, modified in the tree.
- `docs/_working/specs/2026-07-21-accessibility-as-north-star-design.md` — untracked, not ours.
- **Forgejo is handled outside this session.** CommonFraming/CommonTongue are behind on that remote;
  not our concern. Note the Forgejo-side repo rename had not happened as of 2026-07-21 (the
  `CommonMind` URL did not resolve; the old one did, via redirect).

---

## Known, not fixed

`CommonFraming/README.md` and `CommonTongue/README.md` link siblings via checkout paths
(`../CommonMind/`, `../LiteController/`). The rename updated the *names* but the **path coupling
remains** — exactly what Repository-Portability forbids; breaks for every off-machine reader and any
web render. Out of scope for CommonStage, recorded in spec §5.1, **must be fixed before those
READMEs are rendered to the web.**
