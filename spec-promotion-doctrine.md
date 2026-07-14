# Spec Promotion Doctrine

How an approved document changes without drifting, and without the approval becoming a queue the
owner has to service.

**The principle:** *the approved document is the owner's. Work proceeds against a changeset that
contains nothing but intentional change — so nothing can enter the document that nobody decided.*

**And its necessary other half:** *a version cuts **around** what is unsettled, never waits for it.
A document that can only be promoted once it is finished is a document that is never promoted.*

---

## 1. The problem this solves

A specification written before the code exists **will change** — that is not a failure of the
spec, it is what designing-while-building means. So a project has two needs that pull against
each other:

- **Iterate fast.** Design and build move together; a heavyweight approval ritual on every
  insight is friction that will simply be routed around.
- **Don't drift.** An approved document that quietly accumulates unapproved edits is worse than
  no document, because it is *trusted*.

**The two-tier approach is how both are had at once** — not a compromise between them. Work runs
freely in a changeset. The approved document changes only when the owner says so. Neither side
is slowed by the other.

> ### ⚠️ The failure mode this doctrine exists to prevent
>
> An agent, told *"don't edit what I approved,"* invented a **procedure** to compensate:
> mark every draft `AWAITING REVIEW`, hand it to the owner, and ask — repeatedly — whether it is
> time to approve it. **The owner never asked for that.** A **safety property** (*don't edit my
> document*) had been widened into a **usage mandate** (*route every change through my approval
> gate*).
>
> The result was worse than the original offence: the owner now had a queue to service, and the
> agent had a reason to interrupt them about it. **A guard constrains the AGENT. It must never
> generate work for the OWNER.**
>
> See [Decision Doctrine](decision-doctrine.md) — *never widen a scoped rule into a law.*

---

## 2. Two tiers

| | Where | Who writes it | What it holds |
|---|---|---|---|
| **The approved document** | `docs/<subdir>/<topic>.md` | **the owner promotes it** | the current approved statement, at a version |
| **The changeset** | `docs/_working/<subdir>/YYYY-MM-DD-<topic>.md` | the agent, freely | **only what is CHANGING** |

**Drafting in the changeset is unrestricted.** Work freely, commit often. The constraint is on
*promotion*, never on work.

---

## 3. ⭐ The changeset holds ONLY deltas — never a copy of the document

**This is the load-bearing rule.** The changeset is **not** a copy of the approved document with
edits woven into it. It contains **nothing that is already approved.**

**Why this is structural and not merely tidy:** if the changeset contains no copied text, then
**every line in it is, by definition, an intentional change.** There is no ambient approved
material for an unintended edit to hide inside. Silent drift is not *discouraged* — it is
**inexpressible**.

A changeset that is a full copy of the document re-creates exactly the problem it is meant to
solve: the reviewer must now diff two large documents and *hope* they catch what moved.

*Doctrine: **make the invariant structural, not advisory.** A rule you can violate by forgetting
is not a rule.*

### The entry form

Each entry names its **target**, its **kind**, and the **decisions** that authorise it:

```
### §7.4 — NEW: Every command is acknowledged        [D-061]
### §6.6 — REPLACES §6.6: cheap by RATE, not resolution   [D-060]
### §2.1a — REWRITE: no family tier; cameras self-describe  [D-064, D-066, D-067]
### §11.2 — CLOSES: the mired grid, settled by measurement  [D-0xx]
```

**Kinds:** `NEW` · `REPLACES` · `REWRITE` · `CLOSES` · `STRIKES`.

**An entry with no decision citation is a defect, not a change.** It is the thing this doctrine
exists to catch.

---

## 4. The trigger is the OWNER'S INSTRUCTION — never an event, never a question

Promotion happens when the owner says so. **"Bump the version." "Formalise this." "This section
is done."**

**Nothing else triggers it.** Not a commit. Not a merge. Not a tag. Not a green build. Not the
changeset reaching some size.

> ### ⚠️ And the agent NEVER ASKS whether it is time.
>
> *"Is this ready to promote?"* is the question that turns a gate into a queue. **Do not ask it.**
> Do not mark a changeset "awaiting review." Do not give it a version number. Do not present it as
> a pending decision. If the owner wants it promoted, **they will say so.**
>
> A changeset is not waiting for anything. It is a **living document**, versioned by its commits,
> that happens to be promoted from time to time.

---

## 5. Reconcile — an adversarial procedure, run WITH the owner

Promotion is gated on a **reconcile**: every delta is attacked, and survives only if it cannot be
refuted. This is a **procedure**, run interactively — not a batch job, and not a rubber stamp.

**The stance is refutation, not confirmation.** The agent reports **what survived the attack**,
not what it wrote. *A guarantee you have not attacked is not a guarantee; it is a claim.*

### What is checked

| Check | Asks |
|---|---|
| **Completeness** | Does every change cite a decision? Is every accepted decision either in the changeset or explicitly deferred? |
| **Provenance** | Does every non-obvious claim carry an evidence tag? **Nothing enters un-cited.** |
| **Staleness** | Does anything cite a **superseded** decision? Does an item still stand open that evidence has since closed? |
| **Correctness** | Does the text contradict a **verified fact**, its **own cited decision**, an **ordered value**, or a **recorded trap**? Does it assert as fact something tagged *assumed*? |
| **Drift** | Does anything appear here that **no decision authorises**? |
| **Open items** (§9) | **Every open item is re-examined.** Does its closing condition still hold — or has it changed, or has the question **dissolved**? A closer carried forward unchecked is a stale claim, and it is what everyone is planning against. |

**The open-item sweep is not optional and it is not the last item on the list.** It is the check
most likely to surface something real, because a closing condition is an `[A]` claim about the
future that nobody has revisited since the last cut.

**Correctness is checkable further than it looks.** "That's a judgment call" is usually an excuse.
A claim that contradicts a verified fact, over-states an assumed one, cites a decision that says
the opposite, or walks into a documented trap is **mechanically findable** — and each of those has
shipped as a real defect. What genuinely remains with the owner is *"is this the right design?"* —
taste and trade-off. Not *"is this claim supported?"*

### What the reconcile produces

**A clean, reviewable artifact** in which the only remaining question is the owner's: each change,
beside the decision it claims to implement. **Anything that fails a check comes back as a
question, not as a fix.** The agent does not repair a contradiction by choosing what the owner
must have meant.

---

## 6. Then the document cuts a version

Once reconciled:

1. **The deltas apply.** The changeset becomes the new approved document.
2. **The open items are carried across** (§9) — each restated, re-dated, and re-tagged. **The cut
   does not wait for them.**
3. **The version is set.** *Computed by default* — pre-1.0, an additive or reversing change is a
   minor bump. **The computation is stated with its reason** and the **owner may override it**. A
   tool that silently picks the number is deciding what kind of change it was — that is a
   judgment, and it is the owner's.
4. **The changeset empties** and begins accumulating the next round.

**The cut states what is still open.** A version announcement that reports only what closed is a
half-truth:

> *0.1.0 → 0.2.0: adds D-060…D-067. Closes 1 open item (the mired grid, settled by measurement).
> **3 remain open** — 1 blocked on evidence, 2 awaiting the owner. 1 closing condition changed;
> 1 question dissolved.*

**The version belongs to the DOCUMENT, not the product.** A spec can be at 0.4.0 while no code
exists. Versioning the spec means a later change reads as *"which version changed, and where"* —
not *"the spec, but the newer one."*

**⚠️ A version is the OWNER'S TO GRANT.** An agent does not bump it, and **a changeset never
carries one.** A draft that names its own version has already promoted itself.

---

## 7. The wall is mechanical

The rule *"the agent does not edit the approved document"* is not left to good intentions. It is
**enforced**, so that it cannot be violated by forgetting.

A pre-commit-message hook refuses any commit touching the approved tree unless the message carries
the owner's approval token. **The agent never adds that token — it is not the agent's to give.**

**And the guard must be a door, not a wall:**

- It **refuses the agent.**
- It **admits the owner.**
- It **ignores the changeset entirely** — drafting must never be impeded.

**Verify all three by attack**, not by assertion. A guard that also blocks the owner is not a
guard; it is a wall, and the owner will be forced to tear it down. *(This has happened: a first
implementation used the wrong hook — one that does not receive the commit message — and so refused
everyone, including the owner. It was caught only by asking "can the owner still get through?")*

**A blocked commit is not a prompt to ask the owner for approval.** It means the change belongs in
the changeset.

---

## 8. Vocabulary: a document CUTS A VERSION. It is not "sealed."

**"Seal" is the wrong word** and it produced the wrong behaviour. It connotes a **one-time
freeze** — a document finished forever — which is precisely what a pre-1.0 spec is not. A spec
being designed alongside its implementation is promoted **repeatedly**, and each promotion is a
routine, low-friction act.

Calling it *sealing* invites the ritual: a solemn one-way gate, an approval ceremony, and an agent
asking whether the moment has come.

**Say what actually happens: the document cuts a version.** Work continues.

---

## 9. ⭐ OPEN ITEMS — a version cuts AROUND them, never waits for them

> **If every item had to be settled before a version could be cut, no version would ever be cut.**
> There is always something open. A document that can only be promoted once it is finished is a
> document that is never promoted — and that is strictly worse than having no gate at all.

**An open item is a first-class citizen of the approved document. It does not block the cut.**
The version cuts **around** it: the settled material is promoted, the open item is carried into
the approved document *as an open item*, and the cut records exactly what remains unsettled.
**The openness is approved too.**

### 9.1 Open items live IN the approved document — visibly, loudly

They are **quarantined, not hidden**: a dedicated section, headed so that no reader can mistake
it — *"Open items — do NOT build on these."*

**The alternative — holding open items back in the changeset until they settle — is wrong**, and
it is worth naming why, because it is the tempting option. It would give you an approved document
containing only settled material, which sounds clean. What it actually gives you is a
**complete-looking document with a silent hole in it**: a reader sees no gap, does not know the
question exists, and builds on the absence. **An unrecorded open question is re-derived — wrongly,
by someone who never knew it was a question.**

The cost of doing it this way is real and must be held correctly: the approved document now
contains material that is explicitly **not to be built on.** Hence the loud heading. That cost is
worth paying; the alternative hides the most important information in the document.

### 9.2 "Open" means two different things — do not let them share a list

| State | Meaning | How it closes |
|---|---|---|
| **Blocked on evidence** | The *requirement* is decided; a **measurement is missing.** | Evidence arrives. |
| **Unratified proposal** | The agent proposed something and **the owner has not said yes.** | **The owner decides.** |

**Conflating them hides one behind the other.** An unratified proposal filed among research tasks
**looks like work in progress when it is really a question waiting on the owner** — and it will sit
there, unanswered, inside an approved document, looking settled and looking like somebody else's
job.

### 9.3 Every open item carries WHAT WOULD CLOSE IT — dated, tagged, and re-examined at every cut

An open item that says only *"TBD"* is not a record; it is a shrug. Each one carries **what would
settle it**, **if known** — the measurement to run, the decision needed, the evidence awaited.

> ### ⚠️ THE CLOSING CONDITION IS ITSELF A CLAIM — and it can be WRONG.
>
> *"What would close this"* is **an assertion made at a moment, from the knowledge available
> then.** It is not a fact about the future. It therefore carries a **provenance tag and the
> version it was stated at**, exactly like any other claim:
>
> > *"As of 0.2.0: settled by writing every computed stop and asserting no snap. `[A]`"*
>
> **A closing condition is presumed `[A]` (assumed) unless it is genuinely verified or
> documented.** *"This measurement will settle it"* is a hypothesis until the measurement runs.
> Tag it honestly, or the next reader will mistake a guess for a plan.

**At every cut, every open item's closing condition is RE-EXAMINED and RE-STATED.** A closer
inherited unchanged across three cuts, never re-checked, is precisely the taint pattern that kills
projects: **it reads as current, and it is what everyone is planning against.**

### 9.4 An open item has THREE fates at a cut, not two

| Fate | What it means | What the changeset must do |
|---|---|---|
| **Still open — closer holds** | What we said would settle it still looks right. | Restate it, re-dated. |
| **Still open — closer CHANGED** | We learned something; **what would settle this is now different.** | **A delta, citing a decision.** A revised closing condition is not a silent edit. |
| **DISSOLVED** | **The question was wrong.** It does not close — it **goes away**, and *why* is the finding. | A delta. **Record the dissolution and what replaced the question.** |

> ### ⭐ A FALSIFIED CLOSING CONDITION IS OFTEN THE MOST VALUABLE FINDING AVAILABLE.
>
> If you go to run the measurement that was supposed to settle an item and discover that the
> measurement **does not answer the question** — the question was malformed. And **a wrong
> question quietly steers every decision downstream of it.**
>
> **Worked example.** A device-model design carried the open item *"what is the right FAMILY axis
> — generation? market tier? product class?"*, with the closing condition *"research how the
> mature open-source implementation discriminates these devices."* The research ran. The answer
> was that **there is no family axis for that vendor at all** — the devices **enumerate their own
> capability at connect**, and a family tier asserting capability would assert something you can
> simply *ask the hardware*.
>
> The item did not close. **It dissolved.** And the finding that came out of it — that what cannot
> be probed is not *which* properties exist but **what the values mean** — was never asked for, and
> turned out to be the load-bearing fact of the whole design.
>
> Had the closing condition been treated as settled truth rather than a dated hypothesis, that
> finding would have been read as noise. **Hold the closer loosely. It is a guess about what will
> answer a question you may not have asked correctly.**

### 9.5 An approved document is not an omniscient document

Approval means *"this is the current approved statement — **including its honest admissions of
what is not yet known.**"* A document with no open items is not a mature document; it is a
document that is lying, or one whose author stopped asking.

---

## 10. The record survives all of it

Promotion never deletes provenance. A superseded decision is **struck, marked, and pointed
forward** — never removed. A reader must be able to see that a decision was reversed, and why, or
they will re-derive it.

See [Documentation Doctrine §7](documentation-doctrine.md) and [§10](documentation-doctrine.md).
