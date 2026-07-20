# Session-Continuity (Handoff) Doctrine (DRAFT)

**Scope: cross-project.** How an agent's work survives the end of its context — a
compaction, a resume, a fresh session picking up where the last stopped — so that
continuity and the standing laws both persist across the boundary. This governs the
**handoff**: the one document an agent is structurally required to re-read.

**Why this exists (the failure it answers).** Laws that live only in a doctrine repo an
agent must *remember to open* are invisible at decision time. Across a compaction, whatever
was "learned" in a session evaporates unless it is wired into what actually reloads. On
LiteController, every cardinal law was already written (verification, single-source-of-truth,
held-out-oracle, naming-shape) and every one was still walked past — because none was in
front of the agent at the moment it mattered. The handoff is the fix: it is the **one thing
guaranteed to be re-ingested** on every resume, so it must carry not just *state* but a
*pointer back to the laws to re-read.*

**Belt and suspenders, deliberately.** A `SessionStart`/`PreCompact` hook fires the reminder
to read the handoff — that is the suspenders. But a hook can silently break (a schema-invalid
emission was observed doing exactly that). So the discipline is **also** written here as
doctrine — the belt — and the handoff itself names the laws, so continuity holds even when a
hook does not. This is one of the rare cases where redundant enforcement is justified: the
cost of the handoff not reloading is a whole session's context and every law lost with it.

**Cross-references.** Composes the [Single-Source-of-Truth Doctrine](../../single-source-of-truth-doctrine.md)
(the handoff is the **ephemeral tier** — session state — and it **references** the canonical
laws, never copies them) and the [Verification Doctrine](../../verification-doctrine.md) +
[README ⭐ Precedence rule](../../README.md) (the laws the standing block points at). It does
**not** restate any of them. Machine-specific mechanics (exact file location, when the hook
fires, the named-session gate) live in the agent's own config (`CLAUDE.md`) and are
**referenced, not duplicated** here.

---

## 0. The load-bearing rule

> **The handoff is the one document guaranteed to be re-read across every context boundary.
> So it must carry two things: enough state to resume cold, AND a standing pointer to the
> laws that must be re-read before acting. State without the laws lets the next session drift;
> laws copied in (instead of referenced) drift from their source. It carries state, and it
> points at the laws.**

---

## 1. What the handoff is for

A named, continuing effort will cross context boundaries — compaction, resume, a fresh agent.
The handoff is the bridge: written so an agent with **no prior context** could resume the work
correctly. It is a **live snapshot, overwritten to stay current** — not an append-only log.
It is the ephemeral tier of the record (SSoT §7): authoritative for *session state*, a
*reference* for everything else.

What "resume cold" requires (the state half):

- **Changed** — what was done this segment and the current state.
- **Next** — the immediate, concrete resume actions.
- **Files / branches / commits** — paths, branch, hashes; any live infra touched.
- **Open decisions / blockers** — unresolved questions and pending approval gates.
- **Verification state** — what is tested-and-confirmed vs. claimed-but-unverified
  (per the [Verification Doctrine](../../verification-doctrine.md) — the handoff must not
  launder an unattacked claim into "done").

## 2. The standing-law block — the belt

The handoff **must carry a standing block that points at the cardinal laws to re-read**,
placed where it is read *first* on resume, before any status. Its properties:

- **It is a POINTER, not a copy.** It names the doctrines (`verification-doctrine.md`,
  `single-source-of-truth-doctrine.md`, `held-out-oracle-doctrine.md`, `naming-shape-doctrine.md`,
  the README precedence rule) and the *decision moments* that should trigger re-reading each —
  and sends the agent to the canonical file to actually re-read it. Restating the law's content
  in the handoff would violate SSoT §1 and drift.
- **It is standing — carried forward verbatim on every rewrite.** The handoff is overwritten
  each refresh (§1); this block is the part that must **not** be dropped when the rest is
  replaced. Mark it explicitly as a do-not-drop standing block.
- **It is framed by decision moment, not by topic.** "Before saying done → re-read X" beats
  "testing: see X," because the trigger is the instant the law is about to be broken.

> The point is not the words in the block — those are pointers that can go stale and must be
> kept current like any reference (SSoT §5). The point is that the **guaranteed-read document
> forces the re-read of the laws** at the boundary where memory of them has just been lost.

## 3. Gating: named/continuing efforts only

A handoff is for work that will **continue** — a named session, a multi-session effort. A
throwaway one-off needs none; writing one there is noise. The precise gate (e.g. "a human
name was set") is a machine/config detail that lives in the agent's own config and is
referenced, not fixed here — the portable rule is only: **continuing work gets a handoff;
throwaway work does not.**

## 4. Refresh cadence — current, not chatty

The handoff is refreshed on the boundary events that risk losing context — before a
compaction, on the periodic reminder — **not** rewritten on every trivial stop. Over-writing
it constantly is as much a failure as letting it rot: a handoff refreshed on every turn
buries the signal. Keep it **current and complete enough to resume cold**, refreshed when the
context is actually at risk. (Exact triggers are a config/hook detail — referenced, not set
here.)

## 5. Read on resume is mandatory — and it is the re-ingestion

Resuming a continuing effort, the agent **reads the handoff first, before continuing** — to
reload state AND to re-read (via the standing block) the laws it points at. This is not
optional politeness; it is the mechanism by which the laws survive compaction. A hook may
remind; the doctrine requires it regardless of the hook.

## 6. Structural, not advisory

- The **hook** that surfaces the handoff on resume/compaction is the suspenders; **this
  doctrine** is the belt. Neither alone is trusted — the hook can break silently, and a
  doctrine with no delivery vehicle is unread. Both, on purpose.
- The standing block's pointers are **references** (SSoT) — so when a law's file is renamed or
  a new cardinal law is added, the block is updated like any reference graph, not left stale.
- The handoff **never becomes a second home** for a law. If it starts explaining a rule
  instead of pointing at it, that is the SSoT §1 violation and gets converted back to a
  pointer.

---

## 7. Checklist

- [ ] The effort is **continuing/named** → it has a handoff (throwaway → none) (§3).
- [ ] The handoff lets an agent **resume cold**: changed, next, files/branches/commits, open
      decisions, **verification state** (§1).
- [ ] It carries a **standing law-pointer block**, read first, **POINTER not copy**, marked
      do-not-drop, framed by decision moment (§2).
- [ ] It is **refreshed on boundary events**, current not chatty (§4).
- [ ] On resume the handoff is **read first**, reloading state and re-reading the pointed-at
      laws (§5).
- [ ] The block's pointers are **kept current** as references; the handoff holds **no copied
      law** (§6).
