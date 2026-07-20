# Handoff — session "CommonPractices"

Live snapshot, overwritten to stay current (session-continuity-doctrine §1). Written so a fresh
agent with no prior context can resume cold.

---

## ⚖️ STANDING LAW-POINTER BLOCK — read FIRST, do NOT drop on rewrite

Pointers, not copies (session-continuity §2; single-source-of-truth §1). At each decision moment,
go re-read the canonical file — memory of these has just been lost across the boundary.

- **Before calling anything "fixed"/"verified/done"** → re-read `verification-doctrine.md` + global
  CLAUDE.md "A Fix Is Not A Fix Until The Test Fails Without It". Watch it fail on the broken code,
  negative controls, say what was *measured* not assumed. (Applied this session: schema negative
  controls, integrity-gate attack, committed-blob revalidation.)
- **Before adding a field/axis to a downstream registry (Codex/Palette)** → re-read memory
  `feedback_registry_dont_restate_contract` + `single-source-of-truth-doctrine.md`. Do NOT restate a
  CommonTongue-owned axis (Access / Value oneof / RoleClass / Unit / Constraint / Predicate); do NOT
  model a per-DEVICE fact (read-write vs write-only) as a per-ROLE fact. Reference, never copy.
- **Before ANY non-trivial design choice** → run it through the FOUR lenses: **NS** (North Stars,
  ordered) + **BP = blueprints** (SHAPES layer — often n/a for a renderer/registry, say so) +
  **Best Practices** (idiomatic/correct-way, spelled out — NOT "BP") + **Correctness**. Analysis
  goes WITH the recommendation, consulted before deciding, never backfilled. (memory
  `feedback_bp_means_best_practices`, `feedback_north_star_analysis_before_choices`.)
- **Before a "cut"/promotion** → owner-triggered ONLY, one-way. These are pre-release repos:
  ceremony is STRIPPED — WIP lives at `docs/`, `_working/` is empty staging skeleton, NO seal/promote
  cycle, NO owner-approval hook, dates kept. (memory `feedback_prerelease_no_seal_ceremony`.)
- **Before stating ANY fact about a repo / file / device / system state** → have I actually READ
  it *this session*? If it is on disk and I have not opened it, READ it before asserting — do not
  describe from memory or inference. NEVER phrase an inference as the user's words ("you're saying
  X"). Naming an uncertainty is NOT closing it — a flagged unknown is a STOP sign, not a licence to
  proceed. (→ `feedback_never_assume_missing_facts`; same root as the "say what was *measured*, not
  assumed" laws `feedback_fix_not_fixed_until_test_fails`, `feedback_test_through_users_door_adversarially`.
  Failure it prevents: this session I invented "LC has no hardware" and reasoned from it, with LC
  sitting readable on disk.)
- **Before any accessibility wording** → the accessible fallback is FIRST-CLASS, never "degrade".
  Field name is `accessibleFallback`.
- **Before creating a dir/file/repo** → confirm exact path+structure first (memory
  `feedback_confirm_before_create`). **Before a subagent/workflow** → explicit approval.
- **Git**: shared-branch caution — stage by explicit path (never `add -A`), commit with pathspecs,
  never sweep the not-mine `assets/` churn. Author = `jschwefel@coldboreballisticsllc.com`, never
  `-c` override, never flag it. NEVER touch GitHub user `jschwefel` (read IS a touch).
- **A question is not a work order** (`feedback_question_then_stop`) — but this owner explicitly
  drives building; "do it", "fix them all", "merge and push" = execute.
- Precedence + full law index: `design-doctrine/README.md`.

---

## Changed this segment

Built and shipped the **SurfaceWorks vocabulary schema layer** — Palette (widgets) + Codex (roles) —
as **JSON-Schema data registries** (decided via the four lenses; proto rejected because cross-repo
buf import is topology-blocked and a data registry is idiomatic for an open grow-by-PR vocabulary).

1. **Palette**: `schema/widget-registry.schema.json` (JSON Schema 2020-12) + `data/widgets.json`
   (69 widgets) + `scripts/check-registry.py` + decision log (D-001, D-002).
2. **Codex**: `schema/role-registry.schema.json` + `data/roles.json` (196 roles) +
   `scripts/check-registry.py` + decision log (D-001, D-002, D-003).
3. **`nature` bug fix (Codex D-002)**: `W/R/A` → `settable/readonly/action`. The old `W` conflated
   read-write vs write-only; RW/WO is a per-DEVICE fact owned by CommonTongue `PropertyPayload.Access`
   + `Confidence`, not a role fact. (Owner's FS-200B light is write-only — the driving example.)
4. **Critical-lens audit (Codex D-003 / Palette D-002)**: removed `valueShape` (restated contract's
   Value oneof) and `surfaceType` (derivable from `group`); renamed the a11y fallback field →
   `accessibleFallback` and struck all "degrade" wording; added the integrity-gate scripts; `$id` →
   real resolvable repo raw URL; documented `status` enum semantics (prototype = close-but-may-break
   until consumers build; stable = owner-triggered additive-only-forever; everything stays prototype).
5. **Pushed** Palette + Codex to `origin/main` (owner-bypass on the main ruleset = expected).

## Next (immediate, concrete)

- **Nothing pending on Palette/Codex** — complete, validated, pushed. They change next only when a
  consumer build (Lucidity / DeckLibre) proves a gap (grow-by-PR).
- **The natural next thread is Lucidity**: still an empty scaffold (README + LICENSE + empty docs
  skeleton). It now has all three inputs live (CommonTongue contract + Palette + Codex). Its **spec**
  is the next artifact — a design effort (brainstorm → spec → plan), owner-driven, NOT to be started
  unprompted.

## Files / branches / commits (all `main`)

- **Palette** `SurfaceWorks/Palette` — HEAD `9a01e1b`, pushed, ahead=0. (`e692fa4` schematize,
  `9a01e1b` audit.)
- **Codex** `SurfaceWorks/Codex` — HEAD `9bf48b5`, pushed, ahead=0. (`c50fdfb` schematize,
  `62ea051` nature, `9bf48b5` audit.)
- **CommonTongue** `CommonPractices/CommonTongue` — HEAD `f440a77`, pushed (contract: §14 ratified,
  surface.proto, 11 conformance vectors — done earlier this session).
- **Lucidity** `SurfaceWorks/Lucidity` — HEAD `cfce077`, **ahead=1 UNPUSHED**, empty scaffold.

## Open decisions / blockers

- **NONE mine outstanding.** No pending approval gate on the vocabulary work.
- **`assets/icon` identity-mark churn (NOT MINE — do not fix unprompted).** In Palette + Codex:
  `avatar.{png,svg}` staged-for-delete + untracked in worktree (from a later "Add repository identity
  mark" commit, not this session). In Lucidity: committed as `cfce077` but UNPUSHED, same worktree
  churn. I kept hands off it throughout — it belongs to the identity-mark effort. Flag to owner; don't
  sweep into any commit.

## Verification state

- **Tested & confirmed** `[V]`: both schemas valid draft-2020-12; committed blobs revalidated
  (Palette 69 widgets, Codex 196 roles conform to their committed schemas — checked via `git show
  HEAD:` not just working tree); both `scripts/check-registry.py` pass; negative controls confirm the
  schema rejects missing required fields / bad enums / stray props / (old) `W` / uppercase kinds, and
  the integrity gate rejects a dangling `accessibleFallback` (exit 1); referential integrity holds
  (every fallback/gatedBy resolves); pushes landed (ahead=0).
- **Not verified / claimed-only**: none load-bearing. (`$id` raw URLs will resolve once the schema
  files are on GitHub's default branch — they are now, post-push, but not fetched-to-confirm.)
