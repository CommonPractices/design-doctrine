# North Stars Doctrine

**Scope: cross-project.** What a North Star *is*, how a project states its own, and what that
statement must contain. **This is the single home for the North Stars *framework*** — the definition
lives here, once, and every project references it. [Decision Doctrine](decision-doctrine.md) §1
points here for the definition and covers only how the ranking *resolves conflicts*; [Decision
Doctrine §11](decision-doctrine.md) treats North Stars as **Lens 1** of the four-lens Prime
Directives.

It exists because the framework was defined and *used* family-wide, but the definition lived embedded
as a teaching example inside another repo's doctrine — the framework itself had **no designated
home**, so it kept being restated and re-derived. This doctrine fixes that: **the framework lives
here**, and a project states its own values *in its own docs*, referencing this doctrine for what a
North Star is. This doctrine does **not** create a dedicated per-project file and does **not** hold a
central registry of everyone's values — see §2.

---

## 1. What a North Star is

**A North Star is one of a small, ordered set of a project's core values, used to adjudicate every
non-trivial decision.** North Stars turn *"what should we do here?"* into a question with a
defensible answer.

They are a **framework for deciding, not a creed to recite.** The rules of use:

- **Small — three to five.** A list of ten is a list of none.
- **Ordered — a ranking, not a set.** The order is the entire point. Unordered values are useless
  *precisely when you need them* — when two of them conflict. *"We value security and speed"*
  resolves nothing at 2 a.m.; *"security outranks speed"* does.
- **Consulted before deciding**, not cited afterward to justify a decision already made.
- **A violation requires a recorded, approved exception** — never a silent one.

### 1.1 Alignment is near-non-negotiable; the *means* of alignment is not

The load-bearing distinction, kept sharp:

> **Alignment to your North Stars is (virtually) non-negotiable. *How* you align to them is (almost
> always) negotiable.**

The value is rigid; the construction that serves it is flexible. A decision must serve the values —
that duty is near-absolute, and dodging it takes a recorded, approved exception — but usually
several designs satisfy the stars, and picking one is a judgment call (often a setting; see [Decision
Doctrine §4](decision-doctrine.md)). Conflating the two — treating one particular *means* as if it
were the *value* — is the scope-widening failure [Decision Doctrine §3](decision-doctrine.md)
warns against.

### 1.2 The framework transfers; the values are the project's own

- **The framework transfers, and so does the duty to align.** Any project can — and should — have a
  small ordered set of values and check decisions against them. Within a project that has them,
  aligning to them is close to absolute.
- **The specific values are the project's own.** A different product might rightly put Speed first,
  or have Security, Reliability, Cost, or Correctness as a star. And for any given decision, several
  constructions usually satisfy the stars — which one you choose is open.
- **Convergence, not copying.** Two projects landing on the same values (as similar products often
  do) is convergence, not copying. The failure to avoid is *unthinking* adoption — importing a list,
  or freezing a particular *means* into a mandate, without checking it against the actual project.
  **Each project re-derives and states its own set, even when the result is identical to a
  sibling's.** (See §4: the family already runs two deliberately different rankings.)

### 1.3 Values only exist if they change outcomes

A stated value that never overrules a convenient decision is decoration. The reality test: for each
star, name a place where it **forced** an outcome the project would otherwise not have chosen. **If
you cannot fill that row, the star is not a value — it is a slogan.** A project's stated stars carry
this evidence (§3), and it is not optional.

---

## 2. Where a project's North Stars live

**This doctrine is the single home for the *framework*. It does not create a new file, and it does
not hold a registry of every project's values.** A project states its own ordered stars **in its own
project docs, where it already keeps them** — the spec's §"North Stars", the `CLAUDE.md`, the README
— and **references this doctrine for what a North Star is.** There is no mandated, dedicated
North-Stars file in any repo, and no central list enumerates every project's values here.

- **Reference the framework, don't re-derive it.** Wherever a project states its stars, it opens by
  **citing this doctrine** for the definition (small, ordered, alignment-near-non-negotiable /
  means-negotiable) and then lists *its own* ordered values. A spec that restates the *definition* is
  duplicating doctrine ([single-source-of-truth](single-source-of-truth-doctrine.md)); a spec that
  states its *values* is doing exactly its job.
- **One home per project for the values themselves.** Pick the project's natural durable home for the
  stated set (most projects: the spec's §"North Stars", mirrored briefly where the README/`CLAUDE.md`
  need it) and keep the *authoritative* statement in one place; other mentions point back to it, not
  re-list it. Which doc is authoritative is the project's call — this doctrine does not dictate it.
- **A North Star change is a cross-altitude event.** The values are referenced at many altitudes, so
  changing them is one of the widest-blast-radius edits a project makes — coordinate it across the
  repo per [single-source-of-truth](single-source-of-truth-doctrine.md), don't patch one mention.

### 2.1 Altitude — family-level vs. product-level stars

North Stars are stated at whichever tier owns them:

- **Product stars** → the product repo's own docs (spec / README / `CLAUDE.md`).
- **Family / org stars** → the org's `.github/profile/README.md` (the family overview) is the natural
  place a family's shared stars are stated.
- **A product may share its family's set** — that is convergence (§1.2). It still *states* its own
  ordered set in its own docs; it does not silently inherit an unstated one. Naming a family/renderer
  set *by reference instead of restating the values* is permissible **only as an explicit, ratified
  choice** for a product that genuinely serves that renderer (e.g. a component whose whole job is to
  render another product's surfaces), never as a default to dodge the work of choosing.

---

## 3. What a project's stated North Stars contain

Wherever a project states its stars, the statement carries three things — no fixed file, but a fixed
*shape*:

1. **A citation of this doctrine for the framework**, then the project's own values, e.g.:

   > *North Stars (framework: [North Stars Doctrine](<path>/north-stars-doctrine.md); this project's
   > own ordered values):*
   > 1. **\<Star>** — \<one-line gloss of what it means and what it refuses>.
   > 2. **\<Star>** — \<gloss>. *(3–5 total; ordered; the order does real work.)*

2. **Evidence each star is real** — for each, a place where it **forced** an outcome the project would
   otherwise not have chosen (§1.3). If a star can't be shown forcing anything, it is a slogan, not a
   value. A short "where each star forced a decision" table is the usual form.

3. **The exception rule** — any decision that does not align is a **recorded, approved exception** in
   the project's decision log, never silent. The set is itself a decision worth an accepted, dated,
   owner-ratified decision-log entry, so its provenance is greppable (LiteController's D-007 is the
   model).

---

## 4. Worked examples — illustrations, never the definition

> **These illustrate; they do not define.** Each is *one way a project filled in the framework*, not
> the ranking every project must adopt. The framework is §1; a reader who mistakes an example below
> for "the North Stars" has let the example become the definition — the exact drift this family has
> corrected before. Two rankings are shown precisely to make the point that the *values* diverge by
> design while the *framework* is shared.

**A persona/app product — CameraConductor.** Accessibility first because a persona-stratified app
lives or dies on it:

1. **Accessibility** — first-class, not a retrofit. If a design is fast, elegant, and unusable with
   a screen reader, it is not a design.
2. **Ease of use — for the *primary flow*** — simple by default; power behind an Advanced reveal.
   The default path must be walkable by someone who has never read the manual.
3. **Speed** — especially app/profile switching. Latency in the thing you do a hundred times a day
   is a feature that is nearly impossible to retrofit.
4. **Choice** — prosumer. Where a reasonable person could want it the other way, they get to have it
   the other way. (This is the star that produces "make it a setting"; [Decision Doctrine §4](decision-doctrine.md).)

**A service/infra product — LiteController.** A different product, a **deliberately different
ranking** — convergence/divergence by design, not copying:

1. **Reliability / honesty of state** — the service never claims a value it cannot confirm. This star
   exists because of a hard hardware fact: the controlled device is write-only, with no positive
   readback, so honesty-of-state is not a nicety — it is the load-bearing response to the hardware.
2. **Speed** — low-latency control; the persistent-connection win over per-call reconnect is the
   portable finding.
3. **Extensibility** — new models / manufacturers / transports as a first-class architectural
   concern.

*(In this ranking the accessibility floor still ships — it is a family requirement — but it is not a
driver, because this is a service, not a persona-stratified app.)*

**What the two illustrate together:** the framework is one thing; the values are the project's own.
CameraConductor and LiteController could not have swapped rankings without becoming worse at their
actual jobs. That is convergence-and-divergence working as intended — not two teams copying, and not
one team importing a list.

---

## 5. How North Stars are used

North Stars are **Lens 1 of the four-lens Prime Directives** ([Decision Doctrine §11](decision-doctrine.md)) — necessary but not sufficient; they tell you *what to serve*, not whether the thing is shaped right (Blueprints), built idiomatically (Best Practices), or actually true (Correctness). Beyond that, four rules govern their use:

- **Present the analysis WITH the recommendation**, never after it or only when challenged.
  Producing the analysis only when asked is a tell that you decided first and rationalised second.
  For every genuine decision put to a person, work each option through the stars *in the question
  itself*.
- **The ranking resolves genuine conflicts by telling you which star you may not lose — not which to
  sacrifice.** When two stars point opposite ways, **don't trade; find the construction that
  satisfies both.** The ranking says which one is non-negotiable, which *forces* the search for a
  design that keeps both. (CameraConductor's Accessibility-vs-Choice clash over user CSS was resolved
  with an accessibility **floor** — total cosmetic freedom above guarantees that cannot be
  overridden — satisfying #1 and #4 at once. See [Decision Doctrine §2](decision-doctrine.md).)
- **Small vs. big decisions.** If the values give a clear answer to a small decision, just act —
  don't ask. For a big decision, the answer the values give is the one you *recommend*.
- **Run every new rule through the stars before recording it.** Ease-of-use and Choice are exactly
  what an over-widened "usage mandate" tramples; the stars are the check that catches it
  ([Decision Doctrine §3](decision-doctrine.md)).

---

## 6. Checklist

- [ ] **Stated + ordered + 3–5** stars, each with a one-line gloss, in the project's own docs (§1–§3).
- [ ] **The framework is referenced, not re-derived** — the statement cites this doctrine and then
      lists the project's own values (§2, §3).
- [ ] **Each project states its own set** — no silent inheritance; a by-reference set is an explicit,
      ratified choice only (§2.1).
- [ ] **Every star is shown forcing an outcome** — a "where it forced a decision" row per star; an
      empty row means a slogan (§1.3, §3).
- [ ] **Pinned to the decision log** — an accepted, dated decision-log entry records the set and its
      provenance (§3).
- [ ] **One authoritative statement per project** — other mentions reference it, don't re-list it
      ([single-source-of-truth](single-source-of-truth-doctrine.md)).
- [ ] **Lens-1 analysis is presented WITH decisions**, and conflicts are resolved by
      satisfying-both, not sacrificing the lower star (§5).

---

## 7. Known gaps (as of writing — projects with no stated ordered set)

Recorded so they are not lost; **filling them is a separate, owner-driven act — this doctrine defines
the framework, it does not invent any project's values.**

- **ObservationPost / Oscura** names a single top value (*"Security is the North Star"*, plus
  "accessibility is not optional") but has **no enumerated ordered set** stated anywhere. Owes a
  stated set (in its own docs — not a dedicated file).
- **Blueprints** assert "NS #1 = reliability" for the service shape via the exemplar, without a
  self-contained enumerated list at the blueprint level.

*(Projects that already state their sets — CameraConductor, DeckLibre, LiteController, SurfaceWorks
family, CommonTongue — keep them exactly where they are: their spec / README / `CLAUDE.md`. This
doctrine does not move them into a new file.)*
