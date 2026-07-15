# Artifact Persistence Doctrine

**Scope: cross-project.** When reasoning produces a **load-bearing artifact** — a table, a matrix,
a survey, a derivation, an enumeration that a later decision or claim will rest on — that artifact
is **written to a file the moment it is produced**, not left to live in the conversation. A decision
is the *residue* of the work that produced it; this doctrine preserves the work, not just the residue.

---

## 0. The load-bearing rule

> **If a future turn would cite it, it must exist as a file. An artifact that lives only in
> conversation history is one truncation, compaction, or crash away from gone — and its absence then
> reads as "it never existed."**

Conversation history is **not durable storage.** It is truncated by tools operating on transcripts,
dropped by compaction, and lost outright on a crash. Worse than the loss itself is the *second-order*
failure: an agent that cannot find an artifact concludes it was never real, and then argues — often
confidently — against the person who remembers it. The person is holding the upstream artifact; the
agent is holding the residue the artifact was condensed into, and mistakes the residue for the whole
truth. **Writing the artifact to a file is what makes it grep-able, and grep-before-you-trust only
works on things that were written down.**

> **The worked example is this doctrine's own origin.** A four-row **manufacturer × doc-source ×
> expected-confidence** survey table was produced in a CameraConductor design session and drove three
> decisions (population, filters, the confidence floor). It classed *Panasonic → Medium*. It was
> **never written to a file** — it lived only in the conversation, which was later truncated by a
> botched `sed` over the transcript. When the owner cited "Panasonic was Medium," the agent grepped
> the committed record, found only the *decisions* the table had been condensed into, saw no table,
> and **argued twice that no such classification existed** — while the owner was holding the real
> artifact the whole time. Had the table been a dated file in `_working/research/`, the agent would
> have grepped it and agreed in one step. The rule below is written so that never recurs.

---

## 1. What counts as a load-bearing artifact

Save it when it will be **relied on**, not merely when it took effort. The test is forward-looking:
*would a later turn, a later decision, or a later reviewer need to cite this?* If yes, it is
load-bearing and it gets a file.

**Load-bearing (always save):**
- **Comparison tables / matrices** — vendor × capability, option × trade-off, model × version.
- **Surveys and enumerations** — the population a decision ranges over; the full option set weighed.
- **Derivations** — a computed grid, a threshold's calibration, the reasoning that produced a number.
- **Research findings** — what a source said, with the citation, before it is condensed into a claim.
- **Anything a decision's rationale references** — if a `D-nnn` entry says "as the survey showed," the
  survey is load-bearing **by definition** and must exist as a file.

**Ephemeral (need not be saved):**
- A one-off arithmetic check with no downstream citation.
- Scratch restating of something already written elsewhere.
- Intermediate steps of a calculation whose *result* is what gets recorded.

**When unsure, save.** The cost of a stray file in `_working/research/` is trivial and reversible;
the cost of a lost load-bearing artifact is a decision re-derived wrongly, or an agent arguing against
the record. **Err toward the file.** The bar is *"would losing this hurt,"* not *"was this hard."*

---

## 2. Where it lives, and how it relates to the decision log

- **Location:** a **dated file in `docs/_working/research/`** — `YYYY-MM-DD-<topic>.md` — per the
  [Documentation Doctrine](documentation-doctrine.md) (drafts are dated; `_working/` is git-tracked
  in full). The date is correct here: an artifact is working/derivation material, not an approved
  durable document, so it keeps its date and is **not** promoted into `docs/` unless it earns durable
  status on its own.
- **The decision is the residue; the artifact is the work.** A `DECISIONS.md` entry (or a spec claim)
  **cites the artifact by path**, and the artifact **carries the decision numbers it fed**. The link
  is bidirectional and greppable: from a decision you can find the survey it condensed; from the
  survey you can find every decision that leaned on it.
- **Do not paste the artifact into the decision log.** A table inline in `DECISIONS.md` bloats the log
  and fuses *derivation* with *decision* — the two have different lifecycles. The decision is durable
  and terse; the artifact is dated working material that may be superseded on its own. Keep them
  separate files, joined by a citation.

> **CameraConductor:** the confidence survey should have been
> `docs/_working/research/2026-07-14-vendor-confidence-survey.md`, cited from D-070/D-073, carrying
> `[D-070, D-073]` in its own header. D-073's floor ("Medium or better earns a description") was
> *calibrated against that table's rows* — so when D-078 later pulled Panasonic out entirely, the
> table's "Panasonic → Medium" row became **stale**, and the staleness would have been **visible in
> the file** (a `!!CC-SUPERSEDED!!` strike on that row) instead of silently rotting inside a decision's
> prose. *(Cross-ref: [Documentation Doctrine](documentation-doctrine.md) — greppable staleness
> markers; provenance is never deleted, only struck and pointed forward.)*

---

## 3. Save at the moment of production, unprompted

The artifact is written **in the same breath it is produced** — the same rule the
[global fact-recording discipline](decision-doctrine.md) applies to facts, applied to artifacts.
Do **not** defer it to end-of-session, do **not** ask "should I save this?", and do **not** wait for
the decision it feeds to be ratified. An artifact saved late is an artifact exposed to loss in the
window before it is saved — and that window is exactly where the truncation, the compaction, or the
crash lands.

**Recording ≠ ratifying.** Saving a survey does not promote its contents to fact; the artifact carries
its own provenance tags (`[V]` / `[D]` / `[A]`) exactly as a decision does, and an `[A]` survey row is
a hypothesis until verified. Writing it down makes the hypothesis *visible and greppable*, which is the
whole point — an unrecorded assumption is re-derived wrongly; a recorded one can be checked.

---

## 4. Provenance and staleness travel with the artifact

An artifact is subject to the **same marker discipline as any other record.** It is not a scratchpad
exempt from rigor — it is a first-class, citable source, and it must stay trustworthy the same way the
decision log does:

- **Tag each cell/row honestly** — `[V]` verified, `[D]` documented, `[A]` assumed. A survey built to
  *estimate* is mostly `[A]`; say so, so no one mistakes an estimate for a measurement.
- **When a decision downstream invalidates a row, strike it in place** — `!!CC-SUPERSEDED!!` with a
  pointer to what overtook it — rather than deleting it. The road not taken stays legible. *(A deleted
  row is a lie of omission; a struck row is history.)*
- **A superseded artifact is not deleted; it is marked.** If the whole survey is overtaken, it stays in
  `_working/research/` with a header note pointing to its successor. Provenance survives.

---

## 5. Checklist

Before moving on from any reasoning that produced structure:

- [ ] **Did this produce a table, matrix, survey, derivation, or enumeration?** If yes → it is a
      candidate; apply §1.
- [ ] **Will a later turn, decision, or reviewer cite it?** If yes (or unsure) → **save it.**
- [ ] **Written to `docs/_working/research/YYYY-MM-DD-<topic>.md`**, dated, git-tracked.
- [ ] **Cited by path from the decision(s) it feeds; carries those decision numbers in its header.**
      Bidirectional and greppable.
- [ ] **Not pasted inline into the decision log** — derivation and decision are separate files, joined
      by a citation.
- [ ] **Saved at production time, unprompted** — not deferred, not gated on ratification.
- [ ] **Cells tagged** `[V]`/`[D]`/`[A]`; a row invalidated later is **struck in place**, never deleted.
