# Handoff — CommonStage

**Session:** CommonStage · **Updated:** 2026-07-22 · **Spec lives in:** `CommonPractices/CommonMind`

---

## ⚠️ Standing law-pointer block — DO NOT DROP. Re-read at these moments.

A pointer, never a copy. Go read the canonical file — memory of these was just lost across the
context boundary.

- **Before calling anything "fixed"/"verified"/"done"** → `verification-doctrine.md` + global
  CLAUDE.md *"A Fix Is Not A Fix Until The Test Fails Without It."* Watch it fail on the broken
  code; say what was **measured**, not assumed.
- **Before ANY non-trivial design choice** → run the **Prime Directives (PD)** = four lenses:
  **NS** (North Stars) + **BP = Blueprints** (SHAPES layer — say so if n/a) + **Best Practices**
  (spelled out, never "BP") + **Correctness**. SSoT = `decision-doctrine.md §11`; the NS framework's
  home is now `north-stars-doctrine.md`. Analysis goes **WITH** the recommendation, never backfilled.
  ⭐ **§5: a ranking says which star you may NOT LOSE, not which to sacrifice — don't trade, find the
  construction that satisfies both.** (I violated this once; see §8a/§4.1.)
- **Before stating ANY fact about a repo/file/branch/remote** → have I actually READ it *this
  session*? On disk + unread → **READ it.** Never describe from memory or inference. **A memory is
  not evidence** — I asserted "DeckLibre is a SurfaceWorks product" from a stale MEMORY.md index
  line and it was false.
- **Before editing a doc that names a renamed thing** → `terminology-migration-doctrine.md` §5
  ledger. **On-touch only**, except live/canonical docs (READMEs, current specs) which are swept
  proactively. **A `repo-name` rename does NOT rename a same-spelled concept** — "blueprint" the
  concept survived `blueprints`→`CommonFraming`.
- **Git gates** → off-main commit freely; **`main` commit and GitHub push both need the owner's
  say-so.** Never touch the `jschwefel` GitHub account at all.
- **Question → answer, then STOP.** A question is not a work order.
- **Don't push the next phase.** Finish, report, stop. The owner starts the next one.

---

## Where we are

**Design-complete. Nothing built. The CommonStage repo does not exist.**

Spec: `CommonMind/docs/_working/specs/2026-07-21-commonstage-design.md` — **472 lines**, on `main`.

CommonStage = the family's shared web presentation layer (org + product pages, rendered docs) for
every family Org **except ColdBoreBallistics**.

### Decided

| | |
|---|---|
| **Where it lives** | A 4th repo in the **CommonPractices org**. Four-lens PD run: all three existing CP charters would have to be weakened to host it |
| **Shape flag** | One per org, declared in `.github`. `product` = the org IS the product · `portfolio` = every repo IS a product. No per-repo roles, no heuristics, no maintained product list |
| **Licence** | Apache-2.0 (client tool, Licensing Doctrine Q1) |
| **Hosting** | **The owner's own fully-controlled server** — not GitHub Pages. Server-side analytics are the owner's, explicitly out of CS scope |
| **Config** | **Strict JSON.** 3 required fields (`org`, `hostname`, `shape`); rest authored-with-defaults or **computed-never-stored** (URL, colour/mark, licence, repo list) |
| **⭐ `hostname` ≠ `org`** | `jschwefel-workshop` → `workshop.schwefel.net`. **The ordinary case, not an edge case.** Every identifier that can diverge is its own field |
| **Hard exclusions** | No analytics field of any kind; **no field may lower the accessibility floor** |
| **GitHub signals** | Downloads/clones/stars ARE wanted as page **content** (≠ visitor measurement). Build-time vs client-side fetch = a plan decision |
| **Proving pair** | **TestingAutoPilot** (`product`) + **CommonPractices** (`portfolio`) — CP carries the heaviest docs, so docs rendering is proven in phase one and CS is self-hosting |
| **Sequencing** | Build both sites concretely, **then** extract the apparatus |
| **Build model** | **CI on the staging git host pulls** repo content + config and renders. Source repos know nothing about CS — no site config, no toolchain, no webhook. Coupling by identity. *Where CI runs = out of scope, doesn't change the design* |
| **Trigger** | Scheduled + manual to start. Push-triggering reintroduces the coupling the pull model avoids — later, if staleness annoys |
| **⭐ Optional signals** | A repo may have **no publication signals** (pre-public on staging). **Never an error, never fatal, never a placeholder** — it is a permanent, intended lifecycle stage, not migration lag. Content never degrades (builder renders from the host it runs on); signals are garnish. Generator needs ONE concept: *absence is meaningful*. **Loud ≠ fatal** — build reports its delta |
| **Signal naming** | Name for the concept, **not today's host**. No `github` block / `github_stars` / `not_on_github` — "publication signals from wherever a repo is published" |
| **Signals fetched** | **Build-time. RESOLVED** by the CI model — no visitor's browser ever contacts the git host |
| **Hostname chain** | 3 steps: repo/org name → explicit `hostname` → variant affix. ⭐ **Affix applies to the CHOSEN hostname, never the namespace** (`workshop-beta`, never `jschwefel-workshop-beta`) |
| **Variant affix** | **A value, not a boolean** (`-beta` hardcoded would fight `-staging`). **Independent of publication status** — coupling would silently change a URL the moment a repo goes public |
| **Publish branch** | `branch`, defaults to repo's default. Reads a maturity signal git **already has**. **Branch+variant are a PAIR** — pre-release branch without an affix publishes unreviewed content to the production hostname. Missing branch = reported, never silently substituted |
| **NOT building** | Multi-branch publishing (one repo → stable + beta simultaneously). **One branch, one site, one hostname**; both = two config entries |

---

## Next — owner chose "housekeeping first" (2026-07-22), now done

**The gate is §8.2 — the stack choice.** Hugo vs Astro/Starlight; **owner is reviewing sample
sites.** Treat the §4 schema as provisional until the stack is picked.

⚠️ **Wrong-doctrine error, caught and fixed 2026-07-22.** This file and spec §8.2 both said
"Language-Selection Doctrine governs" the stack pick. **It does not** — that doctrine governs the
*human*-language chooser (autonyms, BCP 47, RTL). The pointer was recorded from the file's **name**,
unread, and propagated into two files. What actually governs: **Conventions Doctrine** §0
(ecosystem default wins; "it was easier" = the tell) and **Web UI Doctrine** (§3 mandates no stack,
but §2/§2.1 bind the *output*). **Lesson: a doctrine pointer is a fact — read the file before
recording it.**

Then: **create the CommonStage repo** (Org & Repo Bootstrap Doctrine) and move the spec out of
CommonMind's `_working/` into its real home — CS design belongs in CS. Then `writing-plans`.

**Mild chicken-and-egg to decide, not a blocker:** CS would be a 4th CP repo, so building CP's
`portfolio` site means either creating the repo first or rendering three product cards and adding
the fourth later.

---

## Open (spec §8) — all recorded as undecided, none blocking per the owner

- **§8.2 stack choice** — unmade; owner reviewing samples. ⚠️ **Entangled with the §4.5 build
  model** — Hugo pulls sibling content natively (submodules/mounts), Starlight needs it wired by
  hand. ⚠️ **Unverified + disqualifying if wrong:** whether Starlight's build leaves CSS as separate
  files rather than inlining (Web UI §2 requires editable/replaceable). **Test, don't assume.**
- **§8.3 empty/single-repo `portfolio` org** — **not hypothetical: 2 of 7 orgs today.**
- **§8.5 CommonStage owes a stated ordered North Star set** — ⭐ **raised in priority 2026-07-22.**
  Still owner-driven and still a *not-yet* per the EARLY-stage framing, **but** the §8.2 run came up
  **empty on Lens 1**, on a decision expensive to reverse once two sites exist. First time the gap
  **cost** something. Moved from *eventually* → *before or alongside the stack pick.*
- **§8.6 (NEW) where deployment-shaped facts live** — the variant affix and `branch` are facts about
  *a deployment*, not about the org/repo identity. §4.1 split `hostname` from `org` on exactly that
  reasoning. Deliberately **not** defaulted into the identity config, to keep the placement a
  decision rather than an accident.
- **Per-repo overrides** in `portfolio` orgs — raised, never ruled on.

---

## Verification state

- `[V]` Per-org repo inventory, `gh api orgs/<org>/repos`, 2026-07-21 — in spec §1.
- `[V]` **StudioEnsemble and DeckLibre have NO pushed product repos** (`.github` only). CameraConductor
  + LiteController exist **locally, unpushed**. 2 of 7 in-scope orgs render an empty index today.
- `[V]` SurfaceWorks *does* state its ordered NS set in `.github/profile/README.md` — so the §8.5
  defect was **silent inheritance**, not invented values.
- `[V]` All relative links in the spec resolve (each `test -e`'d, not eyeballed).
- `[V]` Rename verified: `design-doctrine`→**CommonMind**, `blueprints`→**CommonFraming**.
- `[A]` **Nothing about CommonStage has been built or tested. There is no code.** Every design claim
  is unproven by construction.

---

## Corrections I made to my own work (do not re-derive)

1. **"DeckLibre is a SurfaceWorks product" — FALSE.** From a stale MEMORY.md index line, trusted
   instead of checked. SurfaceWorks = `.github`+Lucidity+Palette+Codex. Memory fixed at source.
2. **Traded ease-of-use against choice** — forbidden by North Stars §5. The three-tier config *is* a
   satisfy-both construction; the design was right, the justification wasn't. Rewritten.
3. **Attacked §8a A3 wrongly** — the org is a **suite** (M365 : Word/Excel), so org identity in
   `.github` and product facts in the product repo are two tiers, not a split.
4. **Cited Language-Selection Doctrine for the stack pick — WRONG doctrine.** It governs the
   *human*-language chooser. Recorded from the filename, unread, then propagated into two files.
   **A doctrine pointer is a fact: read the file before recording it.** Also missed
   `web-ui-doctrine.md` entirely — never opened until 2026-07-22, and it is squarely on-topic.
5. **Modeled pre-public repos as migration lag — WRONG.** Corrected by the owner: being on the
   staging host and not the public one is a **permanent, recurring, intended lifecycle stage**
   (the *don't push until worthy* rule), not a transitional defect. I had also recommended "fail
   loudly, publish nothing," which would have **blocked the very pattern it must support.**
   Migration is explicitly **not our concern.**

---

## §8a — adversarial review, dispositioned by the owner

Six attacks recorded **with rulings**, so a dismissal reads as judgement, not oversight. A1 rejected
(`product` is a real shape) · A2 accepted+deferred (product-page template fits shipping products, not
docs/spec repos — surface when the build hits it) · A3 moot · A4 bounded (workshop is *sui generis*)
· A5 "then we prove it" · A6 executive decision (coupling is deployment-time only).

> **Owner framing governing all of it:** *"All of the PDs will be satisfied. This is EARLY stage."*
> An unratified NS set and an unchosen stack are **not yet**, not defects.

---

## Files / branches / state

- Spec: `CommonMind/docs/_working/specs/2026-07-21-commonstage-design.md`
- Commits: `e24243c` → `8c2c40c` → `3eb3938` → `d5b6dda` → `90c234a` → `ac5d1a0` → `ea4dedd`
- All on `main`; every working branch merged fast-forward and deleted. **No open branches.**

**Do not touch (other sessions' work):**
- `.claude/handoffs/CommonPractices.md` — another session's live handoff, modified in the tree.
- `docs/_working/specs/2026-07-21-accessibility-as-north-star-design.md` — not ours.
- **Forgejo is handled outside this session.** Note its repo rename had not happened as of
  2026-07-21 (`CommonMind` URL did not resolve; old one did, via redirect).

---

## Known, not fixed

`CommonFraming/README.md` and `CommonTongue/README.md` link siblings via checkout paths
(`../CommonMind/`, `../LiteController/`). The rename updated the *names*; the **path coupling
remains** — exactly what Repository-Portability forbids. Breaks for every off-machine reader and any
web render. Out of scope for CommonStage (spec §5.1), **must be fixed before those READMEs render to
the web.**
