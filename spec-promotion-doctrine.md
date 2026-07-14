# Spec Promotion Doctrine

How an approved document changes without drifting, and without the approval becoming a queue the
owner has to service.

**The principle:** *the approved document is the owner's. Work proceeds against a changeset that
contains nothing but intentional change — so nothing can enter the document that nobody decided.*

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
2. **The version is set.** *Computed by default* — pre-1.0, an additive or reversing change is a
   minor bump. **The computation is stated with its reason** (*"0.1.0 → 0.2.0: adds D-060…D-067,
   closes no open items"*) and the **owner may override it**. A tool that silently picks the
   number is deciding what kind of change it was — that is a judgment, and it is the owner's.
3. **The changeset empties** and begins accumulating the next round.

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

## 9. What "open" means — and it means two different things

A document may carry items that are **not settled**. Distinguish them, because they close in
completely different ways and conflating them hides one behind the other:

| State | Meaning | How it closes |
|---|---|---|
| **Blocked on evidence** | The *requirement* is decided; a **measurement is missing.** | Evidence arrives. |
| **Unratified proposal** | The agent proposed something and **the owner has not said yes.** | **The owner decides.** |

**These are not the same, and must not share a list.** An unratified proposal filed among
research tasks looks like work-in-progress when it is really **a question waiting on the owner** —
and it will sit there, unanswered, inside an approved document, looking settled.

Both are legitimately present in an approved document. **An approved document is not an omniscient
document** — approval means *"this is the current approved statement, including its honest
admissions of what is not yet known."*

---

## 10. The record survives all of it

Promotion never deletes provenance. A superseded decision is **struck, marked, and pointed
forward** — never removed. A reader must be able to see that a decision was reversed, and why, or
they will re-derive it.

See [Documentation Doctrine §7](documentation-doctrine.md) and [§10](documentation-doctrine.md).
