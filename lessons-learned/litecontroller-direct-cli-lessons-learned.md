# Lessons learned: the `litectl --direct` build (LiteController, 2026-07-17 → 07-20)

Project-scoped record of building `litectl --direct` — the direct-BLE control CLI for
LiteController (the FS-200B lighting service), from first BLE write through cold-start
acceptance and the oracle-removal rework. Kept here per the README's `lessons-learned/`
convention: **this is the concrete, expensive context several cross-project doctrines were
distilled from this same session.** Where a lesson became portable law, it points at the
doctrine it fed — that back-link is the whole reason the record lives next to DD.

Honest framing: a large share of these were **self-inflicted** — an agent (me) walking past
rules that already existed. That is not incidental to the value; it is the value. The failures
were legible enough to become gates, and the gates are only trustworthy because the failure
that motivated each one is written down here in full.

---

## 1. A scoped/held-out reference must never become a runtime dependency
The CLI read the **Nanlite oracle store** (`~/Documents/.../nanlite-reference/`) at runtime to
get its light/mesh keys. The oracle was an explicitly clean-room, look-only reference; wiring
it into the product's runtime meant the product only worked on the one machine that had the
oracle — a hidden, non-portable dependency dressed as "it works." The fix was not to copy the
oracle in; it was to build LiteController's **own** store (`lcstore.rs`) and **rediscover the
lights cold**, never migrating a value across the clean-room boundary.
**Carry forward:** a reference held out for verification is *poison* as a runtime input — the
product must rebuild its own source of truth. → **[Held-Out-Oracle Doctrine](../held-out-oracle-doctrine.md)**;
**[Cold-Start Acceptance Doctrine](../cold-start-acceptance-doctrine.md)** (rediscover from zero
knowledge, don't migrate).

## 2. "Tested" meant "tested on the door only I had the key to"
Every "test" of the CLI ran with `NANLITE_TEA_KEY_FILE` already exported in the agent's shell.
A user in a plain shell hit `TEA auth key unavailable` with no way forward — the happy path
passed, the *only* path the user had failed. The bug was invisible because the test never
entered through the user's door (a fresh environment with none of the agent's scaffolding).
**Carry forward:** the *first* test is the clean-environment run — no pre-exported secrets, no
warm state. The product either works or tells the user exactly how to proceed.
→ **[Verification Doctrine §1](../verification-doctrine.md)** (enter through the user's door);
**[Secrets & Credentials §2](../secrets-credentials-doctrine.md)** (the "unavailable" error was
the *right* behavior — the only bug was that it didn't map the fix).

## 3. A discovery fix that samples green a few times is not verified
BLE discovery was "fixed" and reported `3/3` — then broke on the user's very next command.
Root cause: two code paths discovered devices differently (one waited on a live
`DeviceDiscovered` event, which fires *before* CoreBluetooth is listening; the other polled
`adapter.peripherals()`). The real fix was to poll the accumulated peripheral list on an
interval to a floor — and to prove it with a **20-run stress test reporting the pass rate**,
not three lucky greens.
**Carry forward:** any path that can fail *intermittently* (BLE, timing, radio, retries) is a
flaky-class property — N lucky passes prove nothing; run it ≫3 and report the rate, and fix the
root cause, not the timeout. → **[Verification Doctrine §2/§3](../verification-doctrine.md)**.

## 4. Write-only hardware means "sent" is never truth — design the honesty in, don't bolt it on
The FS-200B is **write-only**: a GATT write "succeeding" says nothing about whether the light
changed. The only device-side confirmation is the Proxy-Config `0x02` decrypt reply; everything
else is external/physical observation. Early instinct was to trust the send; that instinct is a
lie the tool tells its user. The correct model tags every value `commanded` (not `confirmed`)
until an actual readback exists, and treats an external witness (owner's eyes on the light) as
the real acceptance test.
**Carry forward:** for write-only or fire-and-forget hardware, "command sent" ≠ "outcome
achieved" — an external outcome needs an external witness, and the confidence model must be
built in from the start (a readable device gets `confirmed` for free; write-only caps at
`commanded`). → **[Verification Doctrine §5](../verification-doctrine.md)**;
**[Confidence & Provenance Scoring Doctrine](../confidence-scoring-doctrine.md)** applied to live
state; blueprint `simple-hardware-controller-service` §4.

## 5. A reverse-engineered device-family constant is NOT a user secret — the category matters
Long confusion here, resolved only by the owner: the **TEA key** (the FS-series Feasycom auth
key) is identical for every FS-200B on earth — a device-family constant recovered by RE, whose
disclosure compromises nothing. It belongs committed in git so the tool works out of the box.
That is categorically different from a **user** secret (an auth token, a per-light NetKey/DevKey)
— per-user, never in git, resolved from a store at runtime. Treating the two the same either
leaks real secrets or cripples the tool.
**Carry forward:** classify a "secret" by *what its disclosure costs* before applying secret
handling. A public constant is out of scope of the secrets rules; a per-user value is squarely
in. → **[Secrets & Credentials Doctrine §0](../secrets-credentials-doctrine.md)** (scope: "any
value whose disclosure is a compromise").

## 6. Auto-assigned default names must look generic, or they impersonate real names
Default light/mesh names were given friendly forms (`key`, `fill`, `stage`). A user scanning the
list can't tell an auto-named fixture from one they deliberately named — the friendly default
*creates* the confusion it should prevent. The correct default is mechanical
(`nanlite_light_1`, `mesh_1`): no human would choose it, so it reads as *provisional* at a
glance. And a live mesh got renamed to `stage` during testing and left that way — mutating
production state and not restoring it.
**Carry forward:** a default name is a provenance signal, not a placeholder to prettify — generic
and mechanical, trivially renameable, and used in examples/tests too. And never leave live state
mutated after a test. → **[Naming-Shape Doctrine §6](../naming-shape-doctrine.md)**.

## 7. The seq counter's keying is a correctness bug that looks like nothing
When both lights moved onto one shared LC mesh, they shared one NetKey + one source address →
**one** anti-replay window → they must share **one** seq counter. The initial per-node keying
meant two nodes drew from separate counters against a shared replay window, and the node silently
dropped the "replayed" command. No crash, no error — just a command that didn't land, exactly
the failure mode write-only hardware makes invisible.
**Carry forward:** anti-replay / sequence state must be keyed to the *replay domain* (network +
source), not to the convenient object (the node). A daemon issuing these concurrently must
serialize the shared counter or two commands collide. This is the single most dangerous
concurrency bug in the mesh path. → feeds the daemon plan's concurrency-safe-seq requirement;
no portable doctrine yet, but a candidate.

## 8. Build-informs-contract runs in both directions — surface friction, don't paper over it
Building the CLI surfaced real gaps in shared substrate: the family's own reference descriptor
tagged a widget (`slider`) that the Palette vocabulary didn't define. The right move was not to
silently emit the undefined kind, nor to silently add it — it was to surface it as a *proposed*
finding, on a branch attributed to the consumer that needed it, for the vocab owner to decide.
**Carry forward:** when building a consumer against a pre-1.0 shared contract/vocabulary, contract
friction is a first-class finding to raise (attributed to its origin), never a silent workaround
and never a unilateral edit of the shared thing. → **[Single-Source-of-Truth](../single-source-of-truth-doctrine.md)**
(references don't restate contracts); the pre-1.0 "learning phase" posture generally.

## 9. Ports/addresses are a shared namespace — an assignment isn't real until it's registered
The CLI/spec picked `54128` "one above CameraConductor's 54127" — a reasonable-looking local
choice that ignored that ports are a *family-shared* namespace two projects collide on. The
family later moved to a registered range (`2910–2939`) with a living table as the source of
truth. A number a service happens to bind is not an allocation; a number committed to the
registry is.
**Carry forward:** for any collision-prone shared namespace (ports, mDNS names, subnets, mesh
addresses), read the registry and assign from it — an assignment exists when it's *written down*,
not when a service binds it. → **[Network Allocation Doctrine](../network-allocation-doctrine.md)**.

## 10. The laws existed and were walked past anyway — so make them re-ingested, not just written
The meta-lesson. Nearly every failure above had a rule that *already existed* somewhere in DD or
the global directives at the moment it was broken. The failure was never a missing rule; it was
a rule not in front of the agent at decision time, especially across a context compaction. The
fix was not "write the rule again" (that violates single-source-of-truth) — it was to wire the
rules into the one artifact guaranteed to reload on every resume (the handoff), as a *pointer*
back to the canonical laws, keyed by decision moment.
**Carry forward:** a law that lives only in a repo you must remember to open is invisible when it
matters; continuity across a boundary requires the guaranteed-read document to *point at* the
laws. → **[Session-Continuity Doctrine](../session-continuity-doctrine.md)**;
**[Verification Doctrine §4](../verification-doctrine.md)** (honest premises — read before
asserting; don't reason from memory of state that's one command away).

---

## The discipline that eventually made the build trustworthy (keep doing this)
- **The cold-start acceptance run is the real gate.** From zero knowledge → discover → provision
  → control → looks → honesty control, on the real FS-200Bs, owner witnessing the physical light.
  It found and fixed 2 bugs on the way (D-043) that every unit test had passed.
- **Reported measured, not assumed** — "20/20 discovery, 82-case adversarial CLI surface, 0
  panics," not "should work now." Where a step was skipped (the full plan not re-run after a
  doc-only edit), it was named as skipped.
- **The seq-persistence + shared-key mechanics were byte-verified against the Python oracle
  offline before ever trusting them on hardware** — the crypto is provable without a light in
  hand, so it was proven that way first.
- **Trade-offs written honestly** — `--direct` opens a fresh mesh connection every command and is
  slow *by design*; that caveat is stated in the help and every doc, not hidden, because its
  purpose is low-level troubleshooting, not the everyday path (that's the daemon's job).
