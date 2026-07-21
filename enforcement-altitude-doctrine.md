# Enforcement-Altitude Doctrine

**Scope: cross-project.** How hard to enforce a rule — and when enforcement is the wrong
answer. The counterweight to *"make the invariant structural, not advisory"*: that maxim
says a rule worth having is worth constructing, and it is right; this doctrine says the
construction has a **cost**, and that cost must be proportionate to what the violation
actually costs. A guard is not free, and a guard in the wrong place is itself a defect.

**Why this exists (the failure it is a response to).** Asked to relax a confirmation prompt
on `git commit` for non-main branches and add one for pushes to GitHub, an agent built a
`PreToolUse` hook that fired on **every shell command in the session**, shelling out to
`git` to resolve the branch and the remote's host — machinery, in the permission layer, to
enforce a preference whose worst-case violation is a commit on the wrong branch (fixed by
`git reset`, seconds). The owner's correction was exact:

> *"I am not a fan of hooks for anything other than HARD gates, where the fuck up is
> expensive. This does not rise to that level. Also commit/push hooks like that usually
> require me to do shit because you cannot."*

Two distinct objections, and the second is the deeper one. The first is **proportionality**
(machinery outweighed the mistake). The second is **displacement**: an enforcement the
enforcing party cannot satisfy does not prevent the work — it *moves the work to the human*.
Every rule needed to see this coming already existed in some local form — spec-promotion's
*"the guard must be a door, not a wall"*, its warning that a safety property must never widen
into *"a queue the owner has to service"* — but each was discovered **inside one doctrine,
about one artifact**, and never stated as the general bound on enforcement itself. Seven
doctrines cite *structural-not-advisory*; none states its limit. That asymmetry is what this
document fixes.

**Cross-references.** This is the bound on
[Decision Doctrine §7](decision-doctrine.md) (*make invariants structural, not advisory*) —
read them together; neither is complete alone. It shares a root with
[Decision Doctrine §3](decision-doctrine.md) (*never widen a scoped rule into a law*): an
over-broad guard is a widened rule wearing machinery. It supplies the general form of
[Spec-Promotion Doctrine](spec-promotion-doctrine.md)'s *door-not-a-wall* rule, and does not
restate that doctrine's promotion mechanics. Where a guard's *placement* across a
tier chain is the question, [Single-Source-of-Truth Doctrine §3](single-source-of-truth-doctrine.md)
governs the altitude of the rule; this governs the **hardness** of its enforcement.

---

## 0. The load-bearing rule

> **Enforcement must be proportionate to the cost of the violation, and must be payable by
> the party it binds. A guard that costs more than the mistake it prevents is a defect; a
> guard the bound party cannot satisfy is not enforcement at all — it is a transfer of work
> to someone else.**

*Structural-not-advisory* is a **floor for expensive invariants**, not a mandate for every
rule. "This rule matters" justifies writing it down. Only "violating it is expensive **and**
the guard is payable" justifies constructing it.

---

## 1. Price the violation before you price the guard

The first question is never *"how do I enforce this?"* It is *"what does it cost when this
is violated, and how is it discovered?"* Enforcement hardness follows that answer.

| Violation costs… | Enforce with |
|---|---|
| **Irreversible / silent / outward-facing** — data destroyed, secret leaked, wrong thing published, a record corrupted with no way back | **Construction.** Make it inexpressible. A hook, a type, a missing code path, a refusing commit-msg guard. |
| **Expensive but recoverable** — a bad release, a broken build, hours of rework | **A gate at the boundary.** CI check, pre-merge review, a confirm that names the blast radius. |
| **Cheap and self-announcing** — wrong branch, a typo'd name, a formatting slip | **A written rule.** A directive, a convention, a lint warning. Not a wall. |

Two properties do more work than severity alone:

- **Reversibility.** Recoverable-in-seconds is the strongest argument against machinery.
  `git reset` is cheap; an unrecoverable overwrite is not.
- **Discoverability.** A violation that announces itself needs far less guarding than one
  that stays silent for months. **A silent, cheap violation can outrank a loud, expensive
  one** — quiet rot accumulates, and this is the case people most often get backwards.

## 2. The payability test — never build a guard the bound party can't satisfy

**Ask before constructing: when this guard fires, who does the work?** If the answer is
"someone other than the party the rule binds," the guard has not prevented the mistake — it
has **relocated the labour**, usually onto the person with least time and most authority.

This is the failure that motivated this doctrine, and it has a signature: an agent, blocked
by its own guard, returns to the human with *"you'll need to run this yourself."* The rule
was meant to constrain the agent; it ended up conscripting the owner.

> **The agent-hook trap.** A permission gate on `git push` sounds like a safety rail. But an
> agent that cannot complete a push now hands every push back to the human — so the guard's
> real effect is *"the owner pushes from now on."* Nobody chose that; it fell out of the
> mechanism. Meanwhile the mistake it prevented — a push to the wrong remote — was one
> `git revert` away.

- **Payable by the bound party** → a legitimate construction.
- **Payable only by escalation** → not a guard; a queue. Rewrite it as a **door** (§4) or
  demote it to a written rule.

This generalizes spec-promotion's correction verbatim: *"a guard constrains CLAUDE — it must
never become a queue the OWNER has to service."*

## 3. Prefer the check you already have over the machinery you'd have to build

**If the bound party already holds the fact, checking it is not enforcement — it is
attention.** Machinery is only warranted when the fact is *absent, forgettable at scale, or
adversarial*.

An agent about to commit already knows the branch; about to push, already knows the remote;
about to write a file, already knows the path. A rule over facts already in hand belongs in
the instructions the party reads, not in a mechanism that re-derives what it could simply
look at.

Build the mechanism when:
- the fact is **not present** at decision time (needs a lookup nobody will do),
- the rule must hold across **many actors or a long time** (conventions erode — §7's domain),
- the bound party is **adversarial or careless by assumption** (untrusted input, public API).

Otherwise: **write the rule where the actor will read it, and expect it to be read.** A rule
you can violate by *forgetting* wants structure; a rule you can only violate by *not looking
at what's in front of you* wants a directive.

## 4. A guard is a door, not a wall

When a guard is warranted, build it so the constrained party can **pass through it
correctly**, not merely be stopped.

- **Name the correct path in the refusal.** "Blocked: this belongs in `docs/_working/`" beats
  "permission denied." A refusal that doesn't say what to do instead converts into an
  escalation — §2's failure by another route.
- **Refuse the narrow thing.** Gate the act that is actually dangerous, not its whole
  category. (Push to *GitHub* — not all pushes. Writes to the *approved tree* — not all
  writes.) An over-broad guard is [Decision §3](decision-doctrine.md)'s widened rule in
  machine form, and it trains people to route around it.
- **Never let the guard become the workflow.** If satisfying it is now a routine ceremony,
  it has widened from a safety property into a usage mandate.

## 5. Enforcement has a maintenance cost, and it compounds

Every construction is code that can be wrong. A guard that mis-fires does damage a written
rule never could: **it teaches people to disable guards.**

- **False positives are the real budget.** A gate that blocks legitimate work gets bypassed,
  and the bypass becomes habit — for the guards that mattered too.
- **Machinery drifts from intent.** Enforcement written against today's shape keeps enforcing
  it after the shape changes. Written rules go stale visibly; guards go stale *silently and
  keep firing*.
- **Verify the guard, adversarially.** A guard is a claim about reality and inherits
  [Verification Doctrine](verification-doctrine.md)'s bar: watch it **fire on the bad case and
  stay silent on the good one**, or you have installed confidence rather than safety.

## 6. Escalate deliberately, and record why

Enforcement hardness is a **decision** — it aligns to the project's North Stars, it has a
rationale, and it gets recorded like any other ([Decision Doctrine §8](decision-doctrine.md)).

Start at the lowest hardness that could work; escalate when evidence arrives (it *was*
violated, and it *did* cost). *"Someone might get it wrong"* is not evidence — it is the
speculative construction YAGNI warns about, with a permission prompt attached.

When you do construct, record: **what it prevents, what it costs, and who pays when it
fires.** A guard whose entry cannot answer the third question should not be built yet.

---

## 7. The gate (before constructing any enforcement)

- [ ] **Priced.** The violation's cost, reversibility, **and discoverability** are stated —
      not just "this matters."
- [ ] **Proportionate.** The guard costs less than the mistake. Cheap + self-announcing →
      a written rule, not machinery.
- [ ] **Payable.** The party the rule binds can satisfy it unaided. It never resolves to
      "the owner does this by hand now."
- [ ] **Not already in hand.** The fact isn't one the bound party already holds at decision
      time (if it is: a directive, not a mechanism).
- [ ] **A door.** The refusal names the correct path, refuses the *narrow* dangerous act, and
      hasn't become routine ceremony.
- [ ] **Verified both ways.** Seen to fire on the violation **and** stay quiet on legitimate
      work.
- [ ] **Recorded.** What it prevents, what it costs, who pays when it fires.

Fail any box and the honest answer is not a weaker guard — it is **a written rule, and the
expectation that it will be read.**
