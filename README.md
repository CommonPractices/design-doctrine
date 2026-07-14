# Design Doctrine

Cross-project engineering doctrine. Rules that earned their place by being learned the
expensive way.

**How these documents work:** every principle is stated to be **portable** — it should transfer
to any project. Every *example* is drawn from a **real project**, because a rule without a
worked example is a slogan, and a rule without the mistake that produced it is unpersuasive.

Where a rule exists because something broke, the breakage is named. That is the argument.

## Documents

| Document | Covers |
|---|---|
| [Decision Doctrine](decision-doctrine.md) | **How to decide.** Ordered values and how to use them (including how to resolve a genuine conflict without sacrificing either side); never widening a scoped rule into a law; "if it has a defensible alternative, it's a setting"; absent vs hidden vs disabled; preview before writing to live things; making invariants structural; recording decisions *and* non-decisions; separating requirements from mechanisms. |
| [Documentation Doctrine](documentation-doctrine.md) | **How to keep the record trustworthy.** `docs/` approved vs `docs/_working/` drafts; dated while drafting, undated once approved; promotion is a `git mv`; no historical documents in the shipped tree — but never delete provenance; explicit status and provenance tags; greppable staleness markers. |
| [Spec Promotion Doctrine](spec-promotion-doctrine.md) | **How an approved document changes without drifting.** The changeset holds **only deltas** — never a copy of the document — so silent drift is inexpressible rather than merely discouraged. Promotion is triggered **only by the owner's instruction**, never by an event and **never by the agent asking**. An adversarial reconcile (completeness, provenance, staleness, correctness, drift) before the document cuts a version. **A version cuts AROUND open items, never waits for them** — and every open item carries *what would close it*, which is itself a dated, tagged claim that can be **falsified**, sometimes revealing the question was wrong. Why the guard must be a **door, not a wall** — and why a safety property must never widen into a queue the owner has to service. |
| [Visual Identity](visual-identity.md) | **How to look and feel like the family.** The four axes (persona × theme × colour-blind × forced-colors); personas as an expertise ladder; colour in surfaces, not dots; the five required themes and how deviation is governed; the two-layer accessibility floor. Ships with [`assets/foundation.css`](assets/foundation.css) — drop it in unchanged — and [`assets/audit.js`](assets/audit.js), a self-testing contrast audit. |
| [UI/UX Design Doctrine](ui-ux-design-doctrine.md) | **How to build it.** Themes, personas, colour, and accessibility. Axis separation; why a persona must change the product and not the paint; why colour must live in surfaces; the two-layer accessibility floor (and why `!important` inverts cascade layers); the taxonomy of accessibility needs; tokens; verifying the verifier. |
| [Device-Model Doctrine](device-model-doctrine.md) | **How to describe a range of hardware.** A single-inheritance tier chain (manufacturer → family → device) so shared shape is written once; parent-first merge; partial-on-disk vs complete-after-merge validation; ids that mirror the lineage under a namespace you own; public/private extension contracts; one definition + an open identity array for relabeled-identical hardware; never hoisting a fact to a tier where it isn't universally true. |

Most examples come from **CameraConductor** — a multi-camera control service with hard
accessibility requirements, a hostile hardware protocol, and a distributed deployment. It broke
enough ways to be instructive. The device-model doctrine draws its worked example from
**DeckLibre**, a control-surface deck controller with the same appetite for breaking.

## North Stars — a decision framework

North Stars are a **framework for deciding**, not a creed to recite. A small, **ordered** set of
values, checked against every non-trivial decision, that turns "what should we do here?" into a
question with a defensible answer. Any project can adopt the framework; each project fills in its
own values.

**The framework is what transfers.** Its rules:

- **Small** — three to five values. A list of ten is a list of none.
- **Ordered** — a ranking, not a set. **The order is the point:** unordered values are useless
  precisely when you need them, which is when two of them conflict.
- **Consulted before deciding**, not cited afterward to justify a decision already made.

**The distinction that keeps the framework honest:**

> **Alignment to your North Stars is (virtually) non-negotiable. *How* you align to them is
> (almost always) negotiable.**

A decision must serve the values — that duty is close to absolute, and a violation is a
**justified, approved, recorded exception**, never a silent one. But *the construction that
serves them* is open: usually several designs satisfy the stars, and which one you pick is a
judgment call, a setting, a tradeoff — the negotiable part. Confusing the two (treating a
particular *means* as if it were the *value*) is the scope-widening failure these documents warn
about; see [Decision Doctrine §3](decision-doctrine.md).

Small decisions where the stars give a clear answer: just act. Big ones: the star's answer is
what you *recommend*.

**A worked example — CameraConductor's, in order:**

1. **Accessibility** — first-class, not a retrofit.
2. **Ease of use** — for the *primary flow*. Simple by default; power behind Advanced.
3. **Speed** — especially app/profile switching.
4. **Choice** — prosumer. Give options; don't hardcode one opinionated path.

These four are *this* project's contents, not a universal ranking — another project might rightly
put Speed, Security, or Correctness first. Two projects arriving at the same values (as similar
products often will) is convergence, not copying; the caution is only against adopting a list
*unthinkingly*, without checking it against the actual project.

**And a value that never overrules a convenient decision is decoration.** The doctrine tracks
where each star *forced* an outcome; if you can't name one, it isn't a value, it's a slogan.

## Working in this repo

**Any change to a document here must be committed.** Doctrine that exists only in a working
tree is not doctrine — it cannot be relied on, cited, or read by anyone else.

**Use a branch** for any edit that is not effectively atomic — i.e. any change that will not be
written and committed in one uninterrupted step. Multi-file edits, reorganisations, and anything
left mid-thought belong on a branch, not on `main`.

**No releases and no version numbers.** These documents are always current by definition; there
is no such thing as an old version to support. Git is the history.

## The load-bearing rule

> **A guarantee you have not attacked is not a guarantee. It is a claim.**

An accessibility floor asserted to be "unbreakable by construction" was defeated by the first
hostile stylesheet written against it — the protection was defeated *by the very mechanism
added to make it strong*. A contrast audit reporting "all pass" was only sampling the elements
that already worked. A later audit reporting eighteen failures was measuring with a broken
instrument, and nearly caused correct code to be rewritten.

Assertion is not verification. Test the guarantee, then test the test.
