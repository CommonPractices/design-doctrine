# Design Doctrine

Cross-project engineering doctrine. Rules that earned their place by being learned the
expensive way.

**How these documents work:** every principle is stated to be **portable** — it should transfer
to any project. Every *example* is drawn from a **real project**, because a rule without a
worked example is a slogan, and a rule without the mistake that produced it is unpersuasive.

Where a rule exists because something broke, the breakage is named. That is the argument.

## ⭐ Precedence — when two sources of truth conflict, SURFACE it; do not reconcile it silently

**This doctrine repository is a source of truth.** So is the owner's in-session instruction. So
is a skill's built-in default, a tool's convention, a project's own `CLAUDE.md`, a decision-log
entry. Most of the time they agree. **When two of them genuinely conflict, the agent's job is to
STOP and surface the conflict — not to quietly pick a winner.**

> **The rule:** on a real conflict between two sources of truth, the agent **neither silently
> follows one nor silently follows the other.** It names the conflict, says which two sources
> disagree and how, and asks the owner to resolve it. Silent reconciliation — in *either*
> direction — is the failure.

**Why this is a top-level rule and not a footnote:**

- **The owner can err.** An in-session instruction may contradict this doctrine by mistake — a
  slip, a forgotten qualifier, a half-remembered rule. Silently *obeying* it drifts the work off
  doctrine; silently *overriding* it with doctrine ignores that the owner may be deliberately
  changing course. **Only the owner knows which** — so only the owner resolves it.
- **Resolution is usually cheap and usually improves the doctrine.** Very often the honest answer
  is *"the doctrine is right, I misspoke"* — or *"the doctrine is wrong/outdated here, amend it."*
  Either way the conflict surfacing is what produces the fix. A silently-reconciled conflict
  produces nothing but latent drift.
- **This is not a licence to override the owner.** Doctrine does not automatically "win." The
  owner is not overruled by a document. The agent's move is a **question**, not a veto — and the
  owner's answer governs (and may well be *"change the doctrine"*).

**The tell you are about to violate this:** you find yourself thinking *"the instruction
technically conflicts with the doctrine, but I know what they meant, so I'll just…"* — **stop.**
That is the silent reconciliation this rule forbids. Ask.

> **Worked example (this repo's own history).** A brainstorming skill's built-in default said to
> write specs to a `docs/superpowers/…` path. That conflicted with the [Documentation
> Doctrine](documentation-doctrine.md) (drafts live in `docs/_working/`) **and** with an explicit
> owner guardrail forbidding any `superpowers` path. Two sources of truth (skill default vs.
> doctrine + owner) in direct conflict. The correct move was not to follow the skill silently, nor
> even to follow the doctrine silently, but to **note the conflict and confirm** the doctrine path
> was intended before writing. The cost was one sentence; the alternative was a file written to a
> forbidden location under the authority of a default nobody had ratified.

**Cross-references:** this is the meta-rule behind [Decision Doctrine §3](decision-doctrine.md)
(never widen a scoped rule into a law — a conflict often *is* a widened rule meeting its
source) and §10 (the person with the domain knowledge is right — push back once, then listen).
The precedence rule is what those look like at the level of *the doctrine's own authority.*

## Documents

| Document | Covers |
|---|---|
| [Decision Doctrine](decision-doctrine.md) | **How to decide.** Ordered values and how to use them (including how to resolve a genuine conflict without sacrificing either side); never widening a scoped rule into a law; "if it has a defensible alternative, it's a setting"; absent vs hidden vs disabled; preview before writing to live things; making invariants structural; recording decisions *and* non-decisions; separating requirements from mechanisms. |
| [Documentation Doctrine](documentation-doctrine.md) | **How to keep the record trustworthy.** `docs/` approved vs `docs/_working/` drafts; dated while drafting, undated once approved; promotion is a `git mv`; no historical documents in the shipped tree — but never delete provenance; explicit status and provenance tags; greppable staleness markers. |
| [Artifact Persistence Doctrine](artifact-persistence-doctrine.md) | **How to keep reasoning from being lost.** A load-bearing artifact — a table, matrix, survey, derivation, enumeration a later decision rests on — is written to a dated file in `docs/_working/research/` **the moment it is produced**, not left in conversation history where a truncation, compaction, or crash destroys it. The decision is the *residue*; the artifact is the work it condensed from. Cited by path from the decision(s) it feeds, and carrying those decision numbers itself — bidirectional and greppable. Because *grep-before-you-trust only works on things that were written down*, and an artifact's silent absence otherwise reads as "it never existed." |
| [Spec Promotion Doctrine](spec-promotion-doctrine.md) | **How an approved document changes without drifting.** The changeset holds **only deltas** — never a copy of the document — so silent drift is inexpressible rather than merely discouraged. Promotion is triggered **only by the owner's instruction**, never by an event and **never by the agent asking**. An adversarial reconcile (completeness, provenance, staleness, correctness, drift) before the document cuts a version. **A version cuts AROUND open items, never waits for them** — and every open item carries *what would close it*, which is itself a dated, tagged claim that can be **falsified**, sometimes revealing the question was wrong. Why the guard must be a **door, not a wall** — and why a safety property must never widen into a queue the owner has to service. |
| [Visual Identity](visual-identity.md) | **How to look and feel like the family.** The four axes (persona × theme × colour-blind × forced-colors); personas as an expertise ladder; colour in surfaces, not dots; the five required themes and how deviation is governed; the two-layer accessibility floor. Ships with [`assets/foundation.css`](assets/foundation.css) — drop it in unchanged — and [`assets/audit.js`](assets/audit.js), a self-testing contrast audit. |
| [UI/UX Design Doctrine](ui-ux-design-doctrine.md) | **How to build it.** Themes, personas, colour, and accessibility. Axis separation; why a persona must change the product and not the paint; why colour must live in surfaces; the two-layer accessibility floor (and why `!important` inverts cascade layers); the taxonomy of accessibility needs; tokens; verifying the verifier. |
| [Web UI Doctrine](web-ui-doctrine.md) | **How to structure a web UI.** The UI is a **separate, independent client** with its own crash domain, reaching the service only through the same public interface every client uses — so a privileged back channel is impossible *by construction* (the structural form of "the UI is just another client"), and a UI bug can't take the service down (the same reliability logic that rejects in-process dynamic modules). The service **may serve** the UI's assets, but only as **plain, overridable static files** — not a compiled-in blob. **Styling is a replaceable asset** (CSS as a file; restyle never needs a rebuild), and a swapped stylesheet **cannot break the accessibility floor** (the Visual-Identity two-layer `@layer` floor holds, verified by a hostile-stylesheet attack). Composes WS-Control §0 + Visual Identity; restates neither. |
| [Device-Model Doctrine](device-model-doctrine.md) | **How to describe a range of hardware.** A single-inheritance tier chain (manufacturer → family → device) so shared shape is written once; parent-first merge; partial-on-disk vs complete-after-merge validation; ids that mirror the lineage under a namespace you own; public/private extension contracts; never hoisting a fact to a tier where it isn't universally true. **Every** inheritable fact rides the one chain — including the **wire protocol**, described at its truthful tier (usually the manufacturer) and inherited down, not carried whole per model. |
| [SMT Doctrine](smt-doctrine.md) | **When a manufacturer's name doesn't match its behaviour** ("Stupid Manufacturer Tricks") — and it runs in **both directions.** **Face A — same behaviour, different names:** one definition carries an **open array of identities**, a relabel is an *entry* not a description; sameness is **earned on verified behaviour, never assumed from resemblance**; the cosmetic-vs-behavioural line (*would driving code have to change?*); vendor id is not a manufacturer-tier constant, branding ≠ reported identity; **relabel-robust recognition** (exact-id, fingerprint fallback, unknown last). **Face B — same name, different behaviour:** a maker keeps a name across a **quiet** behavioural break (one or two items), so the poisoned fact **slides through because it looks inherited**; inherit normally but **quarantine surgically** — a greppable in-band marker on the broken fact, its inherited confidence **capped until re-verified**. The root of both: *a name is not a proxy for behaviour.* |
| [Confidence & Provenance Scoring Doctrine](confidence-scoring-doctrine.md) | **How to score a machine-authored record built from mixed-quality sources.** Every fact carries a **provenance tag** (`[V]` verified / `[D]` documented / `[A]` assumed) and a **computed, multi-dimensional** confidence (e.g. *existence* vs *meaning* — a cheap strong dimension must never mask a weak load-bearing one), both **travelling with the fact** on override. The raw 0–10 comes from an **evidence-source ladder** (verified → first-party → sibling → community → single → inferred → none), not a self-graded vibe. The whole-record aggregate is **weighted toward the load-bearing dimension and clamped to its weakest fact** — a plain mean is a bug. The trust floor is a **human-review trigger**: below it, queue for a person (accept-as-is or direct-more-work), never silent-discard, never silent-ship. State the **uneven evidence ceiling** so a low score reads as a thin source, not a failure; and **never dress an `[A]` value as measured** — a wrong value stated confidently is worse than a gap. |
| [Held-Out-Oracle Doctrine](held-out-oracle-doctrine.md) | **How to prove a model generalises instead of overfitting the one instance you know best.** When you build a model/extractor/description from sources **and** possess a deeply-understood reference instance, **hold it OUT** of the build, construct the model from the *other* (partial, production-like) sources, then **grade the model on the reference it never saw.** Building *from* the perfect reference hides source gaps, fits the instance instead of the method, and launders assumption into apparent fact. Make the quarantine **structural** — role-mark each instance (`built_from` vs `validated_against`) so seeding from the oracle **fails the build**, not merely warns. A grading disagreement is a **finding to investigate** (model bug / oracle error / hidden variable), never auto-dismissed. *A model graded on the data it was built from has proven nothing.* |
| [Conventions Doctrine](conventions-doctrine.md) | **Follow the established convention of the context you're in — OS, language, protocol, existing codebase — by default.** The primary worked example is **platform integration**: files go where the OS says (XDG on Linux, `~/Library` on macOS, `%APPDATA%` on Windows — resolved from the platform, never a hardcoded home path, never one OS's layout on another), plus launch/autostart idioms, permission prompts, presence idioms, native look-and-feel, signal handling. The principle generalises to language idioms, protocol norms, and a codebase's own patterns. **Deviation is allowed only against a recorded, articulable constraint** — never convenience; *"it was easier" is the tell you should not have deviated* — and every deviation is greppable in the decision record. |
| [Data Format Doctrine](data-format-doctrine.md) | **Every format the family itself defines — interchange payloads and our own config/data files — is strict JSON** (RFC 8259, no dialects), chosen for universality: every language, tool, human, and agent already parses it. **No comments → annotate in *data*** (`_note`/`meta`/`smt` fields), which is *better* than comments — the loader can enforce it, it's greppable, and it survives the read-rewrite cycle a state store does every update. **JSONC/JSON5 are banned** — they break the universal readability that is the whole reason to pick JSON. Does **not** touch a tool's own format for its own files (`Cargo.toml` stays TOML — that's the [Conventions Doctrine](conventions-doctrine.md)), human docs, or binary/bulk payloads. |
| [Forward-Compatible Format Doctrine](forward-compatible-format-doctrine.md) | **How to design a format so a future capability is additive, not a migration.** When torn between a simple *descriptive* form and a powerful *executable* one you can't yet justify, build neither prematurely: shape the descriptive form as a **strict subset** of the executable one — a **capability marker** (`driven_by: "driver"` → `"interpreter@N"`) present from day one, and **every leaf a typed object** (`{ "encoding": "ascii_int" }`, never the bare tag `"ascii_int"`) so it grows by *adding a sibling field*, not *changing its type*. Then the powerful path is something you ADD, never MIGRATE TO — no file already written breaks. Honours YAGNI (you don't build the interpreter) without foreclosing it. The price: a shape you design once, carefully, and must not break. |
| [Interface Stability Doctrine](interface-stability-doctrine.md) | **How a published interface evolves without ever breaking its consumers** — *we do not break userspace.* The burden of compatibility is always on the interface: it may **grow, never shrink/retype/tighten**; identifiers are immutable and removed slots reserved. Both halves of the contract hold — **producers only add, consumers silently tolerate the unrecognised**. Genuine breaks are **whole-interface versioning** ("all or nothing," not a per-element matrix), **born at V1** (no null version), published **in parallel** — never a mutation in place. Made structural by a **CI breaking-change gate over a machine-readable schema, verified by attack**. And the ⭐ **version-negotiation meta-layer is frozen** — minimal, unversioned, no escape hatch: a recognition marker never negotiated on, an identity, an offered-versions **list**; **counter-offer, never reject on the unrecognised** (the "version intolerance" that broke early TLS). The evolution/versioning companion to Forward-Compatible-Format. |
| [Service Foundations Doctrine](service-foundations-doctrine.md) | **The plumbing every family service shares beneath what it does.** One config-resolution chain (CLI → env → file → compiled default), data out of code; platform-standard documented config/state paths; port/host settable and resolved together, **bind failure loud and fatal** (never a silent relocate); **shutdown flushes the state whose loss is unrecoverable** before exiting (the mesh seq that bricks control if dropped is the sharp example); a service **refuses to become its own second instance** (guarding the shared-hardware race, not just the port); headless/zero-client-correct; loosely-parsed logging; auto-start units shipped + documented, not self-installed. Undesigned foundations named as seams, not silent gaps. The base layer the WS doctrine sits on. |
| [WebSocket Control Doctrine](ws-control-doctrine.md) | **How a local service exposes control over a WebSocket.** The service is the single source of truth and its own UI is just another client — no privileged back channel; asymmetric shape (rich `state`/`delta` down, thin fire-and-forget intents up); **confirm by observation** — the ack is the resulting delta, never a trusted send; loopback + no-auth by default, off-loopback ⇒ mandatory coupled auth; headless-clean (correct with zero clients); a stable `hello` identity handshake and a family-coordinated port contract; a loosely-parsed log stream as a first-class channel. Sits on the [Service Foundations Doctrine](service-foundations-doctrine.md). |

Most examples come from **CameraConductor** — a multi-camera control service with hard
accessibility requirements, a hostile hardware protocol, and a distributed deployment. It broke
enough ways to be instructive. The device-model doctrine draws its worked example from
**DeckLibre**, a control-surface deck controller with the same appetite for breaking. The
WebSocket-control doctrine generalises CameraConductor's control server, with **LiteController** —
a lighting-control service driven by those same surfaces — as the second instance that forced the
pattern to be made portable.

## Lessons learned — project-scoped, kept for their context

[`lessons-learned/`](lessons-learned/) holds **project-specific** findings and lessons — not portable
doctrine, but the concrete context a portable rule is eventually distilled *from*. They live here
deliberately: a lesson learned the expensive way on one project is where the next cross-project doctrine
often starts, and the project context (what was measured, on what build, why it mattered) is load-bearing
and worth keeping close to the doctrine it may feed. Current entries come from **medit** (a native macOS
text editor) — a main-thread performance pass: [`medit-perf-findings.md`](lessons-learned/medit-perf-findings.md)
(the numbers) and [`medit-perf-lessons-learned.md`](lessons-learned/medit-perf-lessons-learned.md) (what to
carry forward).

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

The same rule governs a **declarative contract** — a JSON Schema, a validation guard, a type. A
guard you have not watched **reject** is not a guarantee that it rejects; it is a claim. So a
guard ships with a **negative fixture** that violates it, and you confirm the fixture is refused —
and refused **for the reason you intended**, not incidentally. A fixture that "fails" because it
also happens to be malformed some *other* way tests nothing about your guard: it is the schema
equivalent of a green test on broken code. (Seen in the wild: a schema change that looked enforced
but wasn't, because the object it tightened lacked `additionalProperties: false`, so the field it
"removed" was silently still accepted — caught only by writing the fixture and watching it *pass*
when it should have failed. And a negative fixture that rejected on an unrelated missing field, so
it certified a guard that did not actually bite until the two errors were teased apart.) This is
"a fix isn't fixed until the test fails without it," applied one layer down — to the contract, not
the code.

Assertion is not verification. Test the guarantee, then test the test — including the guarantees
your schema only *claims* to enforce.
