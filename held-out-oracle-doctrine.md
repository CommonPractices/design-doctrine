# Held-Out-Oracle Doctrine

**Scope: cross-project.** When you build a model, description, or extractor from a set of sources **and you
happen to possess one instance you already understand deeply**, do not use that instance to build. **Hold
it OUT**, build the model from the *other* sources, and then **grade the model on the held-out instance it
was never shown.** Passing that grade is evidence the method generalises; failing it catches
overfitting and confirmation bias *before* the model ships.

The worked example is **CameraConductor**: a live, exhaustively-tested reference camera (the D850) exists,
but the characterization tool is built from *other* bodies' sources and validated against the D850 — never
seeded from it.

---

## 0. The load-bearing rule

> **The instance you know best is your test set, not your training set. Build from everything else; grade
> on the one you held out. A model graded on the data it was built from has proven nothing.**

The trap this avoids is quiet and seductive: you have a perfect reference, so you *build the model to match
it* — and now the model matches that one instance beautifully and generalises to nothing, because you
fitted the answer instead of the method. Holding the known instance out forces the model to be built from
the same partial, imperfect sources it will face in production, and then subjects it to an honest exam.

---

## 1. Why the instance you know best is the WRONG thing to build from

A deeply-understood reference is the most *tempting* source — it is complete, correct, and right in front
of you. That is exactly why it corrupts the build:

- **It hides source gaps.** The real sources (docs, community data, probing) are incomplete; building from
  the perfect reference lets you paper over every gap with knowledge the sources don't actually contain —
  so you never discover the method can't handle the gaps.
- **It fits the instance, not the process.** A model tuned until it reproduces the reference has learned
  *that reference*, not *how to characterise an unknown*. The next instance, which you don't have a
  reference for, is the real job — and you've optimised for the one case that was never the job.
- **It launders assumption into apparent fact.** Knowledge from the reference leaks in as `[A]` dressed as
  `[V]`, and because it "matches the reference," nobody questions it.

---

## 2. Build from the others; grade on the held-out one

The method:

1. **Pick the oracle** — the instance you understand best, ideally one you can exercise live.
2. **Quarantine it.** It does not seed the model. If it appears in a shared source (an SDK that covers
   every instance including the oracle), the build **must not read the oracle's entries** — enforce it,
   don't just intend it.
3. **Build from the rest** — the same partial sources production will use.
4. **Grade the finished model against the oracle** it never saw. Agreement is evidence of generalisation;
   each disagreement is a finding — either a real model bug, or a place the oracle itself was
   misunderstood.

> **CameraConductor:** the D850 is in both the vendor SDK *and* a live `[V]` reference doc. The tool is
> built from *other* bodies and graded on the D850. The record even carries a machine-checkable marker —
> each instance is tagged `built_from` or `validated_against` — so a build that illegally seeds from the
> oracle is a **detectable discipline violation**, not a silent one.

---

## 3. Make the quarantine STRUCTURAL, not a good intention

"I'll remember not to look at the oracle" fails the moment the oracle is convenient. Enforce the hold-out:

- **Mark each instance's role** (`built_from` vs `validated_against`) as data the build reads, so seeding
  from a validation instance is a rule the tooling can **refuse**.
- **Fail the build, don't warn**, if a `validated_against` instance is used as a source.
- This is the doctrine's own recurring corollary — *make the invariant structural, not advisory* — applied
  to the train/test boundary.

---

## 4. What a failed grade means (it is not always the model)

A disagreement between model and oracle is a **finding to investigate, ranked, not auto-resolved either
way**:

- **The model is wrong** — a real generalisation bug the oracle caught. Fix the method (the win).
- **The oracle was misunderstood** — your "known-good" reference had an error or an untested corner. Now
  you've improved the reference too.
- **Both were right about different things** — the disagreement reveals a hidden variable (a firmware
  version, a mode) neither had modelled.

The value is the same in all three: the grade **surfaced** something a build-from-the-oracle approach would
have silently absorbed.

---

## 5. When this applies (and when it doesn't)

**Applies** whenever you build a general model/extractor/description from sources **and** hold at least one
deeply-known instance you can validate against — characterization tools, reverse-engineering, data
extraction, migration verifiers, any "learn the pattern from examples" task.

**Does not apply** when you have no trustworthy oracle (then every instance is a source, and confidence
scoring — [Confidence & Provenance Scoring Doctrine](confidence-scoring-doctrine.md) — carries the honesty
instead), or when the "model" is a single bespoke thing with no generalisation claim to test.

---

## 6. Checklist

- [ ] **The best-understood instance is held OUT** of the build and used only to grade.
- [ ] **The quarantine is structural** — instances are role-marked, and seeding from a validation instance
      **fails the build**, not merely warns.
- [ ] **The model is built from the same partial sources production faces** — not from the oracle's
      completeness.
- [ ] **Grading disagreements are findings to investigate** (model bug / oracle error / hidden variable),
      not auto-dismissed in either direction.
- [ ] **Applied only where a trustworthy oracle exists** and a generalisation claim needs testing.
