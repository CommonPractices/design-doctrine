# Hardware Compatibility Doctrine

**Scope: cross-project — any product that interfaces with more than one distinct piece of
hardware.** How such a product tracks *which* hardware it has met, *what* each device can actually
do, and *how sure* it is — in a living **Hardware Compatibility List (HCL)**. It exists so a
device's real, tested capabilities are a written record anyone can read, not folklore in one
agent's head or an assumption buried in a driver.

It exists because the moment a product touches a second device, three questions recur forever:
*have we seen this one? what can it actually do? did we verify that, or hope it?* Left unwritten,
each is re-answered by guessing — and a guess about hardware (this light is readable; this camera
supports that command) becomes a silent bug the first time reality disagrees. An HCL makes the
answer a **committed fact with a provenance tag**, so "we assumed it was read-write" can never
masquerade as "we verified it is."

**SSoT split (the shape this doctrine mandates):** the **rule** — what an HCL is, what it must
record, how a capability is tagged — lives **here, once**. The **data** — the actual device rows —
lives **at each product** (its HCL file), because which hardware a product supports is a product
fact, not a cross-project one. This is the same split as the
[Network Allocation Doctrine](network-allocation-doctrine.md) (the allocation *rule* is family; the
live assignments live at the product). A family-wide roll-up may exist later as an *additive*
view; it never replaces the per-product HCL.

**Companion:** [Device-Model Doctrine](device-model-doctrine.md) owns the *descriptor* (the
inheritance chain, the property model a driver produces) — the HCL is **not** that; it is the
**verification ledger** *about* devices, keyed to the descriptor but recording tested reality, not
declared model. [Confidence & Provenance Scoring](confidence-scoring-doctrine.md) owns the
provenance tags (`[V]`/`[D]`/`[A]`) the HCL uses. [SMT Doctrine](smt-doctrine.md) owns "sameness is
earned, never assumed" — the HCL is where a device's *earned* status is recorded. [Verification
Doctrine](verification-doctrine.md) + [Cold-Start Acceptance](cold-start-acceptance-doctrine.md)
govern *how* a row earns a `[V]`. This doctrine restates none of them.

---

## 0. The load-bearing rule

> **Every distinct piece of hardware a product can touch is a row in a living Hardware
> Compatibility List, and every capability claim in that row carries a provenance tag: verified on
> real hardware, documented from a source, or assumed. An untested capability is `[A]` — never
> stated as fact. The HCL is the single place the answer to "what can this device actually do, and
> how sure are we?" is written down, so it is never re-guessed.**

The tell you need an HCL: the product touches a second device, and someone asks "does *that* one
support X?" and the honest answer is "I think so" — that "I think so" is a missing row.

---

## 1. What the HCL is (and is not)

- **It is a verification ledger about real devices** — a table of the hardware the product has met
  or intends to support, each with its *tested* capabilities and how sure the product is. It is the
  answer to "what works, what's verified, what's still a hope."
- **It is not the device descriptor.** The descriptor (Device-Model Doctrine) is what a device
  *declares* it is — its model, property ranges, inheritance. The HCL records what was *observed to
  be true* when the product actually drove it. A descriptor can say "brightness 0–100"; the HCL
  says "brightness verified `[V]` on hardware 2026-07-19; readback confirmed `[V]`" — or "readback
  **assumed** `[A]`, not yet tested." When the two disagree, the HCL's tested reality wins and the
  descriptor is a bug to reconcile.
- **It is a living document.** New device met → new row, immediately. A capability verified → its
  tag upgrades from `[A]`/`[D]` to `[V]` **in the same change as the verification**, never
  batched. A device that turns out broken/unsupported → recorded as such, not silently dropped.

## 2. What each row must record (the required columns)

A device row carries at least:

- **Device** — the specific make/model (`Nanlite FS-200B`, `Godox P260C Pro`), keyed to its
  descriptor id where one exists. **Never a family placeholder** invented to stand in for a real
  model (the SMT "FS-300B" trap — a name assumed, never verified — is exactly what the HCL exists
  to prevent).
- **Access class** — the device's **verified interaction model**, from this closed set:
  - **`RW`** — read-write: settable *and* has genuine readback/confirmation.
  - **`RO`** — read-only: reports state, not settable (a sensor, a meter).
  - **`WO`** — write-only: settable, **no positive readback** (the FS-200B — "sent" is never
    truth; the confidence model caps at `commanded`).
  - **`Actions`** — dispatches/triggers rather than holding settable state (a button, a
    macro-trigger, a capture command).
  A device may carry more than one where a mix is real (a light that is `WO` for brightness but has
  an `RO` lamp-hours counter) — record per-capability where it differs, not one blurred label.
- **Verified state** — the provenance tag on the access class and on each notable capability:
  **`[V]`** verified on real hardware (with the date + on what unit), **`[D]`** documented from a
  source (manual, research, protocol doc), **`[A]`** assumed/hoped, untested. **`[A]` is the
  default for anything not yet driven** — a device you *expect* to be `RW` but haven't confirmed is
  `RW [A]`, and the `[A]` is load-bearing: it is the difference between a hope and a fact.
- **Transport / protocol** — how the product talks to it (BLE-mesh/Feasycom, plain BLE GATT,
  USB-PTP, …) and at what tier, so a second device on the same transport is visible as such.
- **Notes** — anything valuable a future integrator needs: quirks, firmware caveats, a required
  reset gesture, a known bug, the RE-capture method that worked, why a capability is still `[A]`.
- **Provenance / date** — when each `[V]` was established and on which physical unit, so a stale
  verification is visible as stale (a `[V]` from a firmware ago is not a current `[V]`).

The exact file format is the product's (strict JSON/Markdown table per the [Data Format
Doctrine](data-format-doctrine.md) where it is machine-read); the **columns above are the
contract**, the rendering is not.

## 3. A capability is `[A]` until driven — the honesty rule

The whole value collapses if an assumed capability is written as fact. So:

- **Default to `[A]`.** A newly-added device — even one whose spec sheet promises read-write — is
  `[A]` on every capability until the product has actually exercised it. "The datasheet says it's
  readable" is `[D]`, not `[V]`; "I expect it's readable" is `[A]`.
- **Upgrade only on real verification, through the user's door** ([Verification
  Doctrine](verification-doctrine.md)): a capability becomes `[V]` when it has been driven on the
  real device and the outcome externally witnessed where the outcome is physical (a light changed,
  a value read back and matched). "Command sent" is not verification of `RW`.
- **Never let a hoped access class read as confirmed.** A device you are *building toward* being
  `RW` (you hope it has readback) is `RW? [A]` or plainly `[A] — access class unverified`, never a
  bare `RW`. Recording an assumption as fact is worse than leaving it blank — it certifies a guess.
- **Downgrade honestly.** If a firmware update or a re-test contradicts a prior `[V]`, the row
  changes; a `[V]` is a claim about a moment, and a superseded one is corrected, not preserved as
  comforting.

## 4. Why it must exist the moment there are two devices

One device needs no compatibility *list* — the product *is* its support matrix. The second device
is the inflection: now "which one supports X" is a real question, the same transport may or may not
carry both, and the read/write axis may differ between them (a write-only light and a readable
meter on one product is the canonical case that tests whether the abstraction even spans them). The
HCL is where that second-device knowledge is deposited so it compounds instead of evaporating —
and where the *next* device's integration starts from written prior art, not a cold read.

This is also where a product proves an architectural claim honestly: "the same transport carries
both devices unchanged; only the driver differs" is a sentence that is either `[V]` in the HCL
(both rows, same transport, both driven) or it is a hope. The HCL keeps that claim from being
asserted before it is earned.

---

## 5. Checklist

- [ ] **A product touching ≥2 distinct devices has a living HCL** at the product (data at the
      product; this rule in the family — SSoT split).
- [ ] **Every device is a row** with: device (a real model, never an invented placeholder), access
      class (`RW`/`RO`/`WO`/`Actions`, per-capability where mixed), verified-state tag
      (`[V]`/`[D]`/`[A]`), transport/protocol, notes, provenance+date.
- [ ] **Untested = `[A]`, never fact** — a hoped access class reads as `[A]`, upgraded to `[V]`
      only on real-hardware verification through the user's door, externally witnessed for physical
      outcomes.
- [ ] **The HCL is updated in the same change as the verification** — a new device, or a capability
      moving `[A]`→`[V]`, is recorded immediately, not batched.
- [ ] **Provenance is dated and unit-specific**, so a stale `[V]` (a firmware ago) is visible as
      stale, and a corrected/downgraded row is honest.
- [ ] **It composes, never restates:** descriptor from Device-Model, tags from Confidence &
      Provenance, sameness-is-earned from SMT, how-a-row-earns-`[V]` from Verification.
