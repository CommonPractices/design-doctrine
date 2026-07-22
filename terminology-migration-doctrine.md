# Terminology-Migration Doctrine

**How a family-wide name change propagates without a stop-the-world sweep.** When a repo, concept,
or term is renamed, its old name is already written into dozens of files across every org — links,
prose, handoffs, memory, decision logs. Rewriting all of them in one atomic pass is expensive,
error-prone, and — for dormant history — mostly wasted. This doctrine gives a rename two things
instead: a **translation ledger** (the single authoritative old→new map) and an **on-touch rule**
(fix a stale term when you are already editing its file, never as a bulk sweep). Live/canonical docs
are still swept at once; the long tail heals as it is revisited, and the ledger makes any occurrence
instantly translatable in the meantime.

It exists because a rename has two failure modes and this doctrine answers both. **Stop-the-world**
— rewrite all N occurrences now — burns effort on files nobody will read again and risks a
half-finished sweep that looks done. **Fire-and-forget** — rename the canonical thing and leave the
rest — strands readers in front of a stale term with no way to know what it became. The ledger kills
the second (translation always exists); the on-touch rule kills the first (no forced mass edit).

---

## 1. What must be atomic, and what must not

The line is **breakage vs. staleness**, and it is not negotiable:

- **Atomic — anything whose old form is *broken*, not merely *old*.** A renamed directory, a
  repo/remote URL, a relative cross-repo link, a path in a build. A half-renamed directory is not
  "in migration" — it is simply broken: the link 404s, the build fails, the import can't resolve.
  These are rewritten **in the same change as the rename**, all at once, verified.
- **Lazy (on-touch) — anything whose old form still *reads*, just names the old thing.** Prose in a
  dormant decision log, a research note, an old handoff. It is stale, not broken; a reader hits the
  old name and — because the ledger exists — knows exactly what it became. These heal when the file
  is next edited for some other reason.

The tell for which bucket a reference is in: **does the old form fail, or merely mislead?** Fails →
atomic. Misleads → lazy. When unsure, treat it as atomic — a rewrite that wasn't strictly required
costs nothing; a missed broken link costs a debugging session.

**Live/canonical docs are swept proactively even when only stale, not broken** — a README, a
current spec, the org profile index, the code-map memory, an active handoff. These are read
constantly and are the family's public face; a stale term there rots in plain sight (the
[FOSS-org-README currency rule](../../CLAUDE.md) and [Single-Source-of-Truth](single-source-of-truth-doctrine.md)
both already demand it). "Lazy" is for the dormant long tail, never for the documents people
actually read.

---

## 2. The translation ledger — the single old→new map

**One table is the source of truth for every active and completed rename.** It lives in this
doctrine (below). A rename is *real* when its rows are committed here — not when the first file is
edited, and not when the directory is moved. Anyone (human or agent) who meets an unfamiliar or
suspiciously-old term looks here and gets the answer.

Each row records:

| Field | Meaning |
|---|---|
| **Old** | the exact old string (repo name, dir, concept word, term of art) |
| **New** | what it became |
| **Scope** | what kind of thing changed — `repo-name` (repo + dir + URLs + path refs), `concept` (a term of art in prose), or `both` |
| **Status** | `active` (migration in progress — the on-touch rule applies) or `complete` (no stale occurrences remain in live docs; row kept as permanent translation history) |
| **Since** | the date the rename was decided/started |

**A `concept`-scope row is the only kind the on-touch rule touches in dormant files.** A
`repo-name`-scope rename is handled by the atomic rule (§1) — its stale occurrences are *broken*
links/paths, swept at rename time — so a `repo-name` row is mostly a **translation record and a
completion tracker**, not a licence to rewrite prose. The distinction matters: renaming a repo does
**not** rename a concept that happens to share the word. If only the repo moved, the concept word
stays, and no prose that uses it as a concept is stale at all.

**A row never leaves the ledger.** `complete` rows stay forever: they are the dictionary that lets a
reader of a five-year-old document still translate a name nobody uses anymore. Deleting a completed
row reintroduces exactly the untranslatable-stale-term problem the ledger exists to prevent.

---

## 3. The on-touch rule

Stated once here, pointed at from the family `CLAUDE.md` so every agent carries it:

> **When you edit a file for any reason and encounter a term listed `active` + `concept`/`both` in
> the migration ledger, update that occurrence to the new term as part of your change. Do not open
> files you are not otherwise editing in order to sweep them. Live/canonical docs are swept
> proactively at rename time; dormant history heals on-touch.**

The rules around it:

- **On-touch, not on-sight.** The trigger is *already editing this file*, not *noticing the term
  somewhere*. Opening a dormant decision log solely to fix a name is the bulk sweep this doctrine
  rejects — it re-imports the stop-the-world cost one file at a time, and churns git history on
  files nobody was working in.
- **Only `active` rows, only `concept`/`both` scope.** A `complete` row is done; a pure `repo-name`
  row was handled atomically and its concept word (if any) never changed. Don't "fix" a word that
  was never renamed.
- **Fix the occurrence you're touching, not the whole file.** If your edit is in one section, the
  stale term three sections away in untouched prose can wait for the edit that touches *it*. (Whole
  file already being rewritten → fix all of them; that *is* touching them.)
- **Never let it corrupt a quotation or a historical record.** A decision-log entry that quotes the
  old name *as it was written at the time* may be load-bearing history; updating it silently rewrites
  the past. When the old name is part of a dated quote or provenance record, leave it and (if
  helpful) add the new name in brackets — never overwrite the original. (Same instinct as
  [Documentation Doctrine](documentation-doctrine.md): strike-and-point-forward, don't erase.)

---

## 4. Completion

A rename's rows flip `active → complete` when **a grep of the live/canonical docs shows zero stale
occurrences** — the READMEs, current specs, org profiles, code-map memory, active handoffs, and any
`concept`-scope prose in documents still in use. The dormant long tail may still hold occurrences;
that is expected and fine — the ledger row (now `complete`) still translates them, and any that
survive get fixed the next time their file is touched, forever, at zero scheduled cost.

**Completion is a grep, not a feeling.** Record the grep you ran (the term, the paths, the
zero-count) the way any verification claim is recorded — [say what you measured](verification-doctrine.md),
not that it "should be clean now."

---

## 5. The ledger

Active and completed family renames. **This table is the translation SSoT** — §2 governs its
shape, §3 the on-touch behaviour for `active` rows.

| Old | New | Scope | Status | Since |
|---|---|---|---|---|
| `design‑doctrine` (repo/dir/URL) | `CommonMind` | repo-name | active | 2026-07-21 |
| `blueprints` (repo/dir/URL) | `CommonFraming` | repo-name | active | 2026-07-21 |

> **Note — the "Old" column deliberately holds the pre-rename names as a *record*.** They must NOT
> be rewritten to the new name by any sweep (that would erase the translation and re-break the
> ledger — the exact §3 "never overwrite a provenance record" trap). The old-name cell for
> design‑doctrine uses a non-breaking hyphen (`‑`, U+2011) precisely so a mechanical
> `design-doctrine→CommonMind` pass does not eat it; read it as the ordinary ASCII repo name.

**Notes on the current renames:**

- Both are **`repo-name` scope only.** The repo/directory/remote-URL/path references are the atomic
  bucket (§1), swept at rename time. Neither renames a *concept*.
- **The word "blueprint" is NOT renamed.** It remains the family's term of art — *a blueprint is a
  reusable product-shape* ([the CommonFraming repo](../CommonFraming/) CHARTER; [Debugging
  Doctrine](debugging-doctrine.md)'s "debug-channel blueprint"). `CommonFraming` is *the repo that
  holds the blueprints*; the concept keeps its name. There is deliberately **no `concept`-scope row**
  for it, so the on-touch rule does not touch prose that says "blueprint."
- **Live-docs sweep is DONE (2026-07-21).** A grep of live/canonical docs shows zero old-name *repo*
  references remain (see §4 completion note below). A **dormant tail of ~41 old-name references**
  survives in dated `docs/_working/research/`, spec-changesets, and dormant decision logs across
  CameraConductor / LiteController / CommonTongue / DeckLibre — these are the **lazy/on-touch bucket**
  (§1): stale not live-breaking, left to heal when their file is next edited. The rows stay `active`
  until that tail is drained; the ledger translates every occurrence in the meantime.

---

## 6. Checklist

- [ ] **Every rename has a ledger row here before any file is edited** — translation exists from the
      first moment (§2).
- [ ] **Atomic vs. lazy split is correct** — broken-if-stale (dirs, URLs, links, paths) done at once;
      merely-old prose left for on-touch (§1).
- [ ] **Live/canonical docs swept proactively** — READMEs, current specs, org profiles, code-map
      memory, active handoffs, in-use `concept` prose (§1).
- [ ] **`repo-name` renames did NOT rename a same-spelled concept** unless a separate `concept` row
      says so (§2, §5).
- [ ] **On-touch rule pointed at from family `CLAUDE.md`** so agents carry it (§3).
- [ ] **Historical quotes/provenance not overwritten** — old name preserved, new added in brackets if
      useful (§3).
- [ ] **Completion is a recorded grep** (term, paths, zero-count), then the row flips `complete`; the
      row is never deleted (§4).

---

Composes [Single-Source-of-Truth](single-source-of-truth-doctrine.md) (the ledger is the one home
for the translation; on a rename, *grep the tree* — this doctrine is *how* that grep is staged over
time), [Documentation Doctrine](documentation-doctrine.md) (strike-and-point-forward, never erase
provenance), and [Repository-Portability](repository-portability-doctrine.md) (identity-not-path
coupling is *why* a repo rename breaks so few things — only path-coupled references, which are the
atomic bucket). Restates none.
