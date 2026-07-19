# Cold-Start Acceptance Doctrine

**Scope: cross-project.** How to prove a product works **for a new user starting from
nothing** — as opposed to unit testing (does a function compute correctly) or
regression testing (did this specific bug come back). This is the whole-system,
enter-through-the-user's-door test that a device/service project runs before claiming
it works.

Principles portable, examples concrete. This doctrine exists because a suite that
starts from state the developer happens to have **passes on a product a new user
cannot even start**. Every rule below closed a real gap.

**Cross-references.** Deeply related to the [Held-Out-Oracle Doctrine](../../held-out-oracle-doctrine.md)
— both say *do not evaluate from the state that hides the failure*. That one holds a
reference instance **out of a model's construction**; this one holds **known
device/app state out of an acceptance run**. Composes with the
[Service-Foundations Doctrine](../../service-foundations-doctrine.md) (what a service
must survive). It restates neither.

---

## 1. Start from zero knowledge — destroy the known state first

**An acceptance run begins from the state a new user has: nothing configured, nothing
adopted, nothing remembered.** If your product keeps state (saved keys, adopted
devices, provisioned meshes, cached credentials), a test that starts from *your*
accumulated state proves nothing about the path a new user takes.

So the run's **first action is to destroy the known state** — reset devices to
factory, retire saved keys/records, clear caches — and only then begin. A test that
cannot start from a wiped state is testing a privileged path no user has.

> **Worked example (LiteController).** The cold-start test resets **both** lights off
> the controller's mesh and retires their saved key files *before* the first real
> step. Only then does it try to discover them. Every prior verification had started
> from lights already known — which is exactly why the test found bugs those runs
> couldn't.

## 2. Discovery is gate #1

**The first capability that must work is finding the thing you've never seen.** It is
also the first that breaks (radio flakiness, permission prompts, the device not yet
advertising after a reset). A product that can drive a device it already knows but
cannot *discover* one is broken for every new user — and a test seeded with known
handles sails right past this.

Make discovery an explicit, early gate: a present-but-not-found device is a
**discovery failure**, retried within a stated bound; a second miss on a present
device is a real defect, not a flake to shrug off.

## 3. Walk the whole lifecycle, in order

Test the **full path a user actually travels**, each stage gating the next:

> discover → adopt/onboard → make controllable → operate (individually) → operate
> (as a group / at scale) → the higher-level model (looks, profiles, presets) → the
> honest-degradation path.

Skipping a stage because "we tested that piece separately" is the trap: the stages
**compose**, and the bug usually lives in the seam (state one stage leaves that the
next depends on), not in any single stage. A unit test of each stage is not an
acceptance test of the chain.

> **Worked example.** LiteController's run is: discover unprovisioned → provision a
> fresh mesh → join a second device to the *same* mesh → bind for control → drive each
> individually → drive both as one simultaneous group → apply a saved "look" through
> the auto-classifying model → apply a *degraded* look. Two bugs surfaced **only** in
> the seams — a reset path that assumed the wrong network, and a group-apply path that
> crashed on a device type the earlier stages hadn't fed it.

## 4. Negative controls, in opposite directions

**A test that only asserts "something happened" cannot tell success from the wrong
thing happening.** Build the run so a broken product produces a *distinguishable*
failure, not an ambiguous pass:

- **Opposite-direction controls.** When testing that N things are addressed
  independently, drive them to **opposite** states (one up, one down). If a single
  command moves *all* of them, individual addressing is broken — even though every
  command "succeeded." Same-direction changes hide this.
- **Sentinels and preconditions.** Assert the target does **not** already exist / is
  **not** already in the desired state before acting, so "it was already like that"
  can't read as "the action worked."

"Nothing happened" and "the wrong thing happened" must be different, visible outcomes.

## 5. Honesty under degraded delivery is part of acceptance

**Test the path where the product cannot fully deliver — and assert it says so.** A
product that claims success it didn't achieve is worse than one that fails loudly.
Include a case that forces partial or best-effort delivery (a mixed group, an
unreachable member, a fallback mode) and assert:

- The product **reports the degraded class honestly** (best-effort, not "simultaneous"
  when it wasn't).
- It **reports what it actually did** (reached 1 of 2), never silently counting the
  unreachable as done.
- One unreachable member **does not abort** the reachable ones (best-effort means
  best-effort), and the skip is **named**, not swallowed.

> **Worked example.** A LiteController look with one on-mesh and one unknown member
> must report *"fan-out, 1 of 2, 1 skipped"* — not *"applied to 2 lights."* The test
> asserts the honest label; it caught a delivery path that crashed instead of
> degrading, and a report that would have over-claimed.

## 6. Physical / external outcomes need an external witness

**When the true result is outside the software** — a light physically changes, a
motor moves, a message lands on a device that never replies — the tool's own "sent"
output is **not** proof. The acceptance run distinguishes two kinds of gate:

- **Machine-verifiable** — a cryptographic confirmation, an on-disk relationship, a
  returned status. The test asserts these itself.
- **Externally-witnessed** — a visible physical change on a write-only device. The
  test **pauses for a human (or an instrument) to confirm**, and records the
  confirmation. It never treats "command sent" as "outcome achieved."

Mark each step as one or the other. A write-only device makes this unavoidable, but it
is good discipline anywhere the ground truth lives outside the process. (This is the
whole-system form of the fix-isn't-fixed-until-you-watch-it-fail discipline: the
witness is what makes the pass real.)

## 7. Write the plan down; record what it found

The run is a **document**, not ad-hoc commands: a dated plan (`docs/_working/`) listing
each step, its expected output, and its gate type (machine / witnessed / negative
control). It is re-runnable and reviewable. And because a good acceptance run **finds
things**, its results — passes, and especially the bugs it surfaced and their fixes —
are recorded in the decision log, paired (bug + fix + the re-verification).

> A cold-start run that finds nothing on a product this young is more suspicious than
> one that finds two bugs. Silence usually means the test didn't actually start from
> zero.

---

## Checklist

A cold-start acceptance run is sound when:

1. It **destroys known state first** and starts from a new user's zero (§1).
2. **Discovery is an explicit early gate** (§2).
3. It walks the **whole lifecycle in order**, testing the seams (§3).
4. It uses **opposite-direction negative controls** so wrong ≠ nothing (§4).
5. It includes a **degraded-delivery case** and asserts honest reporting (§5).
6. Every **external outcome has a witness**; "sent" is never "done" (§6).
7. The **plan is written down** and its findings (bugs + fixes) recorded (§7).
