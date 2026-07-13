# Documentation Doctrine

How a project's written record is organised so that its currency is unambiguous.

**The principle:** *separate working state from approved state structurally, so that "is this
current?" is answerable by where a file lives — not by reading it and inferring.*

---

## 1. Two states, two locations

**`docs/` holds sealed content only.** Approved, current, authoritative.

**`docs/_working/` holds everything else.** Drafts, work in progress, analysis, scratch.
`_working/` is a subdirectory of `docs/`, and it **mirrors `docs/`'s subdirectory structure** —
one draft subdir for every `docs/` subdir except `_working` itself (there is no
`docs/_working/_working`):

```
docs/                     ← sealed (except for '_working')
  specs/
  plans/
  reference/
  research/
  _working/               ← drafts
    specs/
    plans/
    reference/
    research/
    feedback/
```

A file's location states its status. Nothing else has to.

---

## 2. Dated while drafting; undated when sealed

- **Draft:** `docs/_working/<subdir>/YYYY-MM-DD-<topic>.md`
- **Sealed:** `docs/<subdir>/<topic>.md`

The date prefix marks a document as working. Its **removal is part of the promotion**.

**Date prefixes are for working and temporary files only.** Durable, canonical documents get
stable, undated names — a name that changes when the content is revised is not a name.

---

## 3. Sealing is a move

Promotion from draft to sealed is:

1. `git mv docs/_working/<subdir>/YYYY-MM-DD-<topic>.md docs/<subdir>/<topic>.md`
2. Drop the date prefix.
3. Fix every internal reference to the old path.

Use `git mv` so history follows the file.

A document is sealed **only when the owner approves it**. Nothing self-promotes.

---

## 4. The two fates of a draft

Not every draft is destined to be sealed. A draft in `docs/_working/` has **one of two futures**,
decided by *what kind of document it is*:

| Draft kind | Fate | Why |
|---|---|---|
| **Durable reference** — a spec, an authoring guide, anything a reader will need *after* the work ships | **Sealed** — `git mv` up into `docs/` (§3) | It stays live; it earns a permanent, undated home. |
| **Working scaffolding** — an implementation plan, a design analysis, a bring-up finding | **Deleted at ship** — removed from the tree; git keeps it (§6) | Its job ends when the work lands; keeping it clutters the tree (§6). |

The fork is *"will a reader need this after shipping?"* Yes → it seals. No → it is deleted once
the work it guided is done. Sealing (§3) and deletion (§6) are the two exits from `_working/`, not
one path with an exception.

---

## 5. `docs/_working/` is tracked

`docs/_working/` is under version control, with one exception: `docs/_working/feedback/` is
untracked (it is the owner's private space).

Tracking drafts is deliberate. A draft that exists only on one machine has no recovery path,
and no one else can see what is in flight.

---

## 6. No historical documents in the shipped tree

Implementation plans, design analyses, and superseded specs become **history** once the work
ships. Remove them. **Git is the archive.**

What stays in the tree is what is **live**: reference material a reader needs now (README,
manual, authoring guide, CI documentation, roadmap).

A tree full of stale plans is a tree in which no plan is trusted.

---

## 7. Provenance is never deleted

§6 governs **documents**. It does not govern the **decision record**.

A superseded decision is **struck and marked**, with a pointer to what replaced it. It is not
removed. A reader must be able to see that a decision was reversed, and why — that information
is live, not historical, because it prevents the reversed decision from being re-derived.

The distinction:

| | Action when obsolete |
|---|---|
| A **document** (a plan, an analysis) | delete it; git holds it |
| A **decision record** | strike it, mark it, point forward; keep it |

---

## 8. Status is explicit, not inferred

Every decision record carries a **status** — proposed, accepted, superseded, reopened — and
every non-obvious claim carries a **provenance tag** distinguishing what was verified, what came
from an authoritative source, and what is assumed.

An unmarked claim is provisional by default.

**Only the owner promotes a proposal to accepted.** Confidence is not acceptance.

---

## 9. Markers are greppable

Staleness markers must be **mechanically findable** — a unique, unmistakable token, not prose.
Before building on any part of the record, the markers can be swept for in one command.

A convention that requires reading to enforce is not enforceable.

---

## 10. Never delete the record to tidy it

The record is not clutter. Reversals, rejected proposals, and open questions are the most
valuable entries in it, because they are the ones a future reader would otherwise re-derive
incorrectly.

Record what was decided, what was rejected, and what remains **open** — explicitly, and with
what would settle it.
