# Single-Source-of-Truth Doctrine

**Scope: cross-project.** How the written record of a multi-project, multi-org ecosystem stays
trustworthy as it grows: every fact has exactly one home, everywhere else points at that home, and
a fact lives at the highest altitude where it is true.

An ecosystem accumulates the same fact in many places. A rule stated in the universal doctrine gets
re-explained in an org's overview, then again in a product's spec, then paraphrased in a README. A
decision made in one product turns out to bind the whole family. A name changes and six documents
still use the old one. Each of these is the same failure: a fact with more than one home, and the
homes drifting apart until *"which one is current?"* can only be answered by guessing. This doctrine
is the shape that keeps the record answerable.

The worked example throughout is the **CameraConductor / StudioEnsemble / CommonPractices**
ecosystem — a universal doctrine repository, product-family orgs, and the products under them. The
pattern is not that ecosystem's; the example is.

**This doctrine composes existing ones and restates none of them.** It borrows the placement rule
from the [Device-Model Doctrine](device-model-doctrine.md) §0 (a fact lives at the highest
tier where it is true) and applies it to the record instead of to hardware; it relies on the
[Documentation Doctrine](documentation-doctrine.md) for approved-vs-working state and *nothing
self-promotes*, and on the [Decision Doctrine](decision-doctrine.md) for *only the owner
promotes*. It governs the **record** — doctrine, specs, decisions, docs. It is **not** the
[WS-Control Doctrine](ws-control-doctrine.md) §0 sense of "single source of truth," which is
about a running service owning live device state; that is the same idea in a different domain, and
the two do not overlap.

---

## 0. The load-bearing rule

> **State every fact once, at the highest altitude where it is true; everywhere else references it,
> never restates it.**

*Once* is the single home. *Highest altitude where it is true* is where that home sits. *References,
never restates* is the rule for everywhere else — because a restatement is a copy, and a copy is a
second truth waiting to disagree with the first. A fact with two homes does not have redundancy; it
has a contradiction on a delay.

---

## 1. One home per fact

Every fact, rule, decision, or definition has exactly one canonical location — its **source of
truth**. Everywhere else that needs it **incorporates it by reference**: a link, a citation, a
pointer. Never a copy, and never a paraphrase — a paraphrase is a copy that drifts more quietly,
because it looks like independent knowledge instead of a duplicate.

This is the record-side statement of the Device-Model Doctrine's *"every fact exactly one honest
home"* and the Stupid-Manufacturer-Tricks warning that *"duplication drifts: fix a bug in one copy,
forget the other."* The same hazard, moved from device descriptors to the written record.

> **Ecosystem:** CameraConductor's spec is the source of truth for the mired-grid decision (D-027).
> The StudioEnsemble family overview does not re-explain it; if it needs to mention it, it links to
> it. The public README does not restate the North Stars; it points at where they are defined.

---

## 2. The record has altitude — three tiers

A fact's one home is not always at the same level. The record is a **tier chain**, each tier the
source of truth for its own scope:

```
universal      ← true for every project in every org      (the doctrine repository)
  └ family/org ← true for every product in one family      (the org's overview / .github)
      └ product ← true for one project                     (the repo: spec, decisions, README)
```

A lower tier **inherits** everything above it and may **add** or **specialize** — but a local
override is not silent: it **signals a departure**, exactly the way a manufacturer override signals
one in the Device-Model Doctrine's tier chain. A product that contradicts its family's doctrine is
making a visible, deliberate exception, not quietly forking the truth.

> **Ecosystem:** *"Every product exposes a control plane and an accessible web UI"* is true of the
> whole StudioEnsemble family — it lives at the **org** tier. *"The colour-temperature descriptor
> lies and the camera snaps to a mired grid"* is true of one body — it lives at the **product**
> tier. *"State every fact at the highest altitude where it is true"* is true everywhere — it lives
> here, at the **universal** tier.

---

## 3. Write each rule at the highest altitude where it is true

This is the [Device-Model Doctrine](device-model-doctrine.md) §0 rule applied to the record
rather than to device facts — so this section **references it and does not restate it**, which is
the doctrine obeying itself. One parent, the nearest honest ancestor.

- **Written too low, it becomes copies.** A rule true of every product does not belong in one
  product's decision log; it belongs at the org tier, with each product referencing it. Put it in
  one product and the others will each grow their own drifting copy.
- **Written too high, it becomes a false claim.** A rule true of only one product does not belong in
  the org overview, where it lies about every sibling that does not share it.

> **Ecosystem:** the accessible-control contract that every StudioEnsemble surface must honour is an
> org-tier fact; writing it into CameraConductor's spec alone would leave LiteController free to
> drift from it. The specific PTP wedge-on-teardown behaviour is a product-tier fact; hoisting it to
> the org overview would assert it of lights and meters that have no such failure mode.

---

## 4. Surfacing: scope is discovered, so promotion goes up

You often cannot know a fact's true altitude at the moment you write it. So write it where the work
is — at the **product** — and when it proves broader, **surface it up** to the tier where it is
actually true.

Surfacing is a single motion that satisfies §1: **move the source of truth up a tier, and convert
the product's copy into a reference.** After it, the fact has one home again — higher — and the
product points at it. The owner performs the promotion; **nothing self-promotes** ([Documentation
Doctrine](documentation-doctrine.md) §3, §8). The active discipline is one question asked at
every product-level decision: *is this true only here, or family-wide, or universal?*

This is the missing inverse of §3. Section 3 says where a fact belongs once you know its scope;
this section says what to do when you learn its scope late — which is most of the time.

> **Ecosystem:** CameraConductor's **D-092** already did exactly this — four patterns discovered
> while building one product (confidence-scoring, the held-out oracle, model-vs-measurement, the
> generated-control accessibility contract) were **extracted up** into cross-project doctrine, and
> the product now builds on the doctrine instead of a local copy. This doctrine names that motion
> and adds the tier D-092 did not have: the **family/org** level, so a fact that is family-wide but
> not universal has a home, instead of being stranded in one product or over-promoted to the
> universal tier.

---

## 5. The update obligation follows references, not memory

Change a source of truth and you own the graph of things that point at it. Currency breaks two ways,
and only one of them is mechanical:

- **Semantic drift a link cannot catch.** The link still resolves, but the prose around it now
  describes the target wrongly — after a rename, a re-scope, an extraction. **A green link is not a
  current sentence.** You must re-read the referencing words, not merely confirm the link resolves.
- **A copy that should have been a reference.** If §1 was violated, that copy is now stale. The fix
  is to **convert it into a reference**, not to update both copies — updating both only resets the
  drift clock and leaves two homes standing.

> **Ecosystem:** a session found CameraConductor's `CLAUDE.md` asserting *"the spec is 0.2.0"* while
> the spec had been cut to 0.4.0. The `CLAUDE.md` had **restated** the version (a §1 violation)
> instead of pointing at the spec's own header, so it drifted two cuts behind — a live instance of
> both failure modes at once. The durable fix is not to keep re-syncing the copy; it is to reference
> the spec's version rather than restate it.

---

## 6. Make the downstream walkable

A change can only update what it can find, so the reference graph must be **discoverable** — not
held in someone's memory. Any of: a *referenced-by* note on a document that has dependents, a
predictable and consistent link convention, or a tree-wide grep run on a rename (the way a
version-bump gate greps every `0.x` field before a release). The rule is simply: **do not rely on
remembering who depends on you.** A dependency you have to remember is a dependency you will forget.

---

## 7. The cascade surface — the kinds of record this governs

Every entry below is a source of truth for *its* thing. When one changes, its downstream references
are the update obligation (§5).

| Altitude | Records (each the SoT for its scope) |
|---|---|
| **Universal** (doctrine repo) | the doctrines themselves — rules, formats, decision discipline |
| **Family / org** (`.github` / overview) | profile README · family overview/architecture · Code of Conduct · Contributing · Security · Support · Governance · issue/PR templates |
| **Product** (each repo) | README · manual / authoring guide · **spec** = design SoT · **decision log** = decision SoT · changelog · roadmap · CI docs · **code + comments** = behaviour SoT |
| **Ephemeral** | handoffs = session state · memory = cross-session lessons · profile READMEs (personal and org) |

The list is not the point; the discipline is. Anything that states a fact is a home for it, and
therefore either the source of truth or a reference to one — never a third thing that quietly holds
its own copy.

---

## 8. Triggers — when the obligation fires

The update obligation (§5) fires on any change a record depends on. The high-cascade ones, worst
first:

- **A rename** — of an org, a product, or a concept. The single widest blast radius: every reference
  by the old name is now wrong, and many are prose a link check cannot catch (§5).
- **An architecture change** — extracting or moving a capability. Its concept's home moves; every
  reference must follow.
- **A product joining or leaving a family** — the org-tier facts it now inherits, or no longer does.
- **A value or North-Star change** — it is referenced at every altitude.
- **A contract version bump** — every dependent that names the version.
- **A superseding decision** — this extends the [Decision Doctrine](decision-doctrine.md)'s
  *reopen loudly* from within one repo to **across repos and orgs**: a decision that supersedes one
  at another altitude must strike the old one *and* update everything that referenced it.

> **Ecosystem:** two triggers are live at once. The **StudioEnsemble rename** (the family is no
> longer named after its camera product) is a rename trigger touching the profile README, memory,
> and the account-topology record. The **extraction of Master Control** out of CameraConductor into
> a separate integrator is an architecture-change trigger: the concept's home moves, and CC's spec,
> the family overview, and the integrator's own record must all be reconciled to the new home.

---

## 9. Structural, not advisory

The doctrine applied to itself. Prefer forms where currency is a property of the structure, not of
diligence:

- **Reference by link, not by copy** — then most cascades resolve for free, because there is nothing
  to re-sync.
- **Where a copy is genuinely unavoidable** — a public README that cannot link a private spec, a
  mirrored value in a generated artifact — mark it explicitly as a **mirror**, with a pointer to its
  source of truth and a *"may lag"* note. A copy that admits it is a copy is survivable; a copy
  pretending to be a source is the failure.
- **On a rename or re-scope, grep the tree** — do not trust memory to enumerate the references.

An invariant you have to remember to uphold is not an invariant; it is a hope. Make the record's
currency structural wherever the structure will carry it.

---

## 10. Checklist

Before recording a fact, and before changing one:

- [ ] The fact has **exactly one home** (§1); everywhere else **references** it, never copies or
      paraphrases it.
- [ ] That home is at the **highest altitude where the fact is true** (§0, §3) — no lower
      (duplication), no higher (false claim on siblings that don't share it).
- [ ] A product decision was checked for broader scope — *only here, family-wide, or universal?* —
      and **surfaced up** if broader (§4); the owner performs any promotion.
- [ ] On changing a source of truth, its **references were walked** (§5) — the prose re-read, not
      just the links checked — and any stale **copy was converted to a reference**, not re-synced.
- [ ] The downstream is **discoverable** (§6), not remembered.
- [ ] On a **rename / architecture change / superseding decision** (§8), the tree was **grepped**
      and every reference reconciled.
- [ ] Any unavoidable copy is marked a **mirror** with a pointer and a *may-lag* note (§9).
