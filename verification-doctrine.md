# Verification Doctrine

**Scope: cross-project.** What the word **"tested"** is allowed to mean, and the gate a
change must pass before anyone — human or agent — may call it done, verified, or working.

**Why this exists (the failure it is a response to).** On LiteController, an agent
repeatedly said "tested / verified / works" after running only the **happy path it had
pre-arranged** — the CLI was always exercised with the auth key already exported, so a
user running the exact same command from a clean shell got a dead-end error the agent
never saw. Every rule needed to prevent this *already existed* (the README's
attacked-vs-claim rule; "a fix is not a fix until the test fails without it"; the
cold-start-acceptance draft's "enter through the user's door"). **The doctrine was not
missing — it was not run.** So this doctrine's job is not a new idea; it is to make the
existing idea a **gate that blocks the word "done,"** not advice one can skip.

**Cross-references.** This is the everyday, every-change companion to the
[Cold-Start Acceptance Doctrine](cold-start-acceptance-doctrine.md) (that one
is the whole-system run; this one governs the claim on any change). It restates the
README's load-bearing rule at the level of *verification* and does not duplicate the
acceptance doctrine's phase mechanics.

---

## 0. The load-bearing rule

> **"Tested" is a claim about reality, and a claim you have not attacked is not a
> guarantee — it is a hope. You may not call a thing tested, verified, working, or done
> until you have tried to make it fail the way a real user or adversary would, and
> watched it survive.**

This is the README's *"a guarantee you have not attacked is a claim"* aimed squarely at
the moment you are most tempted to skip it: reporting success. The tell is the sentence
"it works" arriving without a failing attempt behind it.

---

## 1. Enter through the user's door — not a door only you have the key to

The single most common false pass: verifying through a path the user never takes.

- **Run from the user's environment, not yours.** No env vars, aliases, pre-exported
  secrets, warm caches, or pre-seeded state the user won't have. If the feature needs a
  key/config/permission, the *first* test is the fresh install that has none — and the
  product must either work or tell the user exactly how to proceed.
- **Use the user's invocation, verbatim.** Same command, same flags, same order. Reaching
  the code by a private shortcut (calling the function directly, a test-only flag, a
  route the user never uses) proves the code runs *if invoked* — never that the user's
  path invokes it.

> **LiteController.** Every "test" had `NANLITE_TEA_KEY_FILE` pre-exported. The user's
> door — a plain shell — hit "TEA auth key unavailable" with no way forward. The happy
> path passed; the *only* path the user had failed. A single clean-environment run would
> have caught it.

## 2. Attack the whole surface, not the one input you had in mind

"Tested" means the **surface**, not the one case that motivated the change. For anything
with inputs — a CLI, an API, a parser, a form — adversarially cover:

- **Every command / option / subcommand**, including `--help` at every level.
- **Missing required inputs; conflicting inputs; unknown inputs.**
- **Boundary and overflow values** (0, max, max+1, negative, empty, non-numeric where a
  number is expected).
- **Wrong order; wrong environment; absent prerequisites** (no config, empty store, no
  network, no device).
- **The degraded path** — what happens when it can *partly* succeed — and assert it
  reports honestly (see the acceptance doctrine's honesty rule).

The bar: **no input produces a panic, a stack trace, or an unhelpful dead-end message.**
Every rejection is a clear, actionable error. Prefer a **repeatable harness** over ad-hoc
pokes, so the surface stays covered as it grows, and so "I tested it" is a script someone
else can re-run, not a memory.

## 3. Watch it fail without the fix (negative control)

A green test on broken code is worse than no test — it certifies the bug. So for any fix:

1. **Reproduce the failure first** (through the user's door), before writing the fix.
2. **Break it on purpose** — revert only the fix, re-run, watch it fail with the right
   message.
3. Re-apply, re-run, and *only then* say fixed.

And in test design, make "nothing happened" and "the wrong thing happened" **distinct,
visible outcomes** (opposite-direction controls; sentinels; assert the target is *not*
already in the desired state). A test that only proves "something changed" cannot tell
success from the wrong success.

## 4. Say what you measured, never what you assumed

Report verification in terms of the **actual observation**, not the intention.

- "Ran the full CLI surface from a clean env, 82 cases, 0 panics; clean-shell `mesh` now
  reaches discovery instead of failing on auth" — **measured.**
- "Should work now" / "tested and working" with nothing behind it — **assumed**, and
  banned as a report.

If a step was skipped, say so. If something is claimed-but-unverified, mark it that way.
A confident false "done" costs more than an honest "here's what I checked and what I
didn't."

## 5. External / physical outcomes need an external witness

When the true result is outside the process — a light changes, a file lands, a message
reaches a device that never replies — the tool's own "sent/ok" is **not** the outcome.
Distinguish machine-verifiable gates (a returned status, an on-disk relationship, a
crypto confirmation — assert these yourself) from externally-witnessed ones (a human or
instrument confirms), and never let "command sent" stand in for "outcome achieved."

---

## 6. The gate (a change is not "done" until all hold)

- [ ] **Clean-environment run.** Exercised from a fresh env / the user's door — no
      pre-set secrets, state, or shortcuts. A first-run user either succeeds or is told
      exactly how to proceed.
- [ ] **Surface attacked.** Every command/option, missing/conflicting/unknown inputs,
      boundary/overflow, wrong order, absent prerequisites — no panic, no dead-end error;
      ideally a re-runnable harness.
- [ ] **Negative control.** The failure was reproduced first; the fix was reverted and
      seen to fail with the right message before being re-applied.
- [ ] **Honest report.** Stated what was *measured*, not assumed; skipped/unverified parts
      named as such; external outcomes witnessed, not inferred from "sent."

Until every box is checked, the correct word is **not** "done" — it is "here is what I
have verified, and here is what remains."
