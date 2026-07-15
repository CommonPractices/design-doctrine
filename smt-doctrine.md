# Stupid Manufacturer Tricks (SMT) Doctrine

**Scope: cross-project.** How to model hardware that is **functionally identical but cosmetically
relabeled** — the same device sold under different names, USB ids, stickers, or firmware strings, with
**zero change in how it actually works** — so the relabels collapse into one definition instead of
multiplying into N.

The name is deliberately blunt. "Stupid Manufacturer Tricks" is what a maker does when it ships the same
board as three products, or white-labels someone else's hardware, or bumps a USB product id for a cosmetic
refresh. From the software's standpoint nothing changed; from a naive model's standpoint there are suddenly
three devices to describe, test, and keep in sync. SMT is the discipline that refuses that multiplication.

This doctrine was extracted from the [Device-Model Doctrine](device-model-doctrine.md) (where it began as
one section) because it is a **portable pattern in its own right** — it applies to any registry of things
that get relabeled without changing, not only to a hardware inheritance tree. The device-model doctrine
handles *variation* (real differences, modeled by tiers); SMT handles *sameness wearing a disguise*.

---

## 0. The load-bearing rule

> **A relabel is an *identity*, not a *definition*. One definition carries many identities; a new label
> adds an entry, never a description.**

When a maker relabels identical hardware, the wrong move is to write a second full description — a second
control set, a second protocol block, a second everything — that happens to be a copy of the first with a
different name and id on top. That is duplication, and duplication drifts: fix a bug in one copy, forget the
other, and now the "same" device behaves two different ways depending on which sticker it wore.

The right move: **one definition holds a *list* of the identities it is sold as.** The definition is the
behaviour (controls, protocol, geometry — the real thing); each identity is the thin cosmetic shell (a
name, a USB id, a serial pattern) the same behaviour ships inside.

---

## 1. One definition, an open array of identities

A concrete definition carries an **array of the identities it is sold as**, not a single identity. One
behaviour, **N cosmetic identities**. Adding a relabel means appending an entry — not authoring a
description.

**Make the entry shape open, on purpose.** You cannot buy one of every relabel, and you certainly cannot
predict a home-built clone or a future refresh. So the schema must **not** enumerate exactly which fields a
relabel is allowed to vary. An entry carries *whatever differs cosmetically* — a display name, hardware ids,
a serial pattern, a firmware string, something a future trick invents — over an **open** object. Validate
that each entry is *well-formed*, not that you foresaw every field it might carry.

**Presence overrides, absence inherits.** A field present in an identity entry overrides that one cosmetic
detail for that one label; a field absent inherits the definition's default. The entry is a *diff against
the definition*, and the diff is cosmetic-only by construction — if a relabel changed *behaviour*, it is not
an SMT identity, it is a different device (see §3).

> **DeckLibre.** A device definition carries a `supported_devices` array — the identities the one device is
> sold as. The D200/D200H/D200X, per the vendor's own configuration data, have byte-identical layouts and
> one protocol; they are one definition with (potentially) three identity entries, not three descriptions.

---

## 2. The "same device" claim is a claim about hardware — earn it, don't assume it

Collapsing two labels into one definition asserts **they genuinely behave identically.** That is a factual
claim about hardware, and the structure's convenience must not seduce you into making it on a hunch.

> ### ⚠️ Tidiness is not evidence.
>
> "These two probably work the same, and it would be so clean to collapse them" is exactly the reasoning
> that ships a bug. The array *lets* you collapse identities; it does **not** license you to assume
> sameness because it is convenient. Two products that *look* like relabels can differ in a way that
> matters — a changed encoder count, a different face size, a firmware quirk — and a wrongly-collapsed
> definition drives the divergent one incorrectly, silently.

**Earn the claim on verified behaviour**, at bring-up, on the actual hardware — not from a spec sheet, not
from a family resemblance, not from a shared vendor id. Until verified, keep them as separate definitions
(or one definition with the second identity explicitly marked *unverified*). The mechanism provides the
collapse; **the human provides the verdict.**

> **DeckLibre.** Whether the D200 and D200H actually collapse into one definition is decided per-device at
> hardware bring-up, on verified behaviour — the model provides the mechanism, the bring-up provides the
> verdict. The design draft that first *assumed* they were identical was corrected to *illustrate the
> mechanism without asserting the sameness*.

---

## 3. What is cosmetic vs. what is a real difference — the dividing line

The whole doctrine rests on one distinction, so state it sharply:

- **Cosmetic (→ an identity entry):** name, marketing model number, USB vendor/product id, serial format,
  packaging, a firmware version string. The device *reports* something different but *does* the same thing.
- **Behavioural (→ a different definition, or a delta on a child tier):** a different control count, a
  changed grid, a different report layout, a new/absent capability, an altered protocol. The device *does*
  something different.

The test: **would any code that drives the device have to change?** If yes, it is not cosmetic — it does
not belong in the identity array; it belongs in a real definition (its own, or a child in the inheritance
tree — see the [Device-Model Doctrine](device-model-doctrine.md)). If no code path branches on the
difference, it is cosmetic, and it is an identity entry.

SMT and the inheritance tree are complementary: **the tree models real difference; SMT models fake
difference.** A maker's line has both — genuine variants (tree) and mere relabels (identity array).

---

## 4. A reported identity is not a brand, and neither is a manufacturer-tier constant

Relabeling breaks the naive assumptions about identity fields, so two corollaries:

- **A "manufacturer-level" id often is not one.** A USB vendor id *looks* like a maker-wide constant — but
  SMT means the "same" maker ships hardware under different vendor ids (a white-labeled board carries the
  *original* maker's vid; a refresh bumps the pid). So a vendor/product id belongs in the **per-identity
  entry**, not hoisted to a manufacturer tier where it would falsely claim to hold for every descendant.
- **Branding ≠ reported identity.** What a device is *sold as* (a brand on the box) and what it *reports
  about itself* (a manufacturer string, a vendor id in its descriptor) need not match, and for relabeled or
  white-label hardware routinely do not. Keep the human-facing name and the machine-reported identity as
  **separate facts**; neither is automatically the other, and matching on one when you meant the other is a
  recognition bug.

> **DeckLibre.** The connected deck is *sold as* "ulanzi", *reports* its manufacturer string as `Zkswe`, and
> *lives under* vendor id `0x2207`. Three different identities for one physical device — none a safe
> stand-in for the others, none a manufacturer-tier constant. Recognition that matched only the brand, or
> only the vid, would mis-identify a relabel.

---

## 5. Recognition must be relabel-robust

If relabels are real, then matching a plugged-in (or configured) thing to its definition **cannot rely on a
single cosmetic key.** A pure vendor/product-id match misses the relabel that shipped a new id for identical
hardware — the exact case SMT exists to handle.

So recognition degrades gracefully:

1. **Exact identity match** (the fast path): the reported id equals an entry in some definition's identity
   array → resolved, done.
2. **Fingerprint fallback:** on a miss, match on a **signature of what the thing actually is** (its
   structural fingerprint — for hardware, endpoint layout, descriptor shape, capability report) rather than
   its label, scored by similarity and **surfaced to a human to confirm** a low-confidence match. This
   catches the relabel whose id you have never seen but whose behaviour matches a known definition.
3. **Unknown:** no identity and no confident fingerprint → a genuinely new thing; characterize it, and its
   result becomes a new definition (or, if it turns out to match, a new identity entry appended to an
   existing one).

The point: **an unrecognized *id* must not be read as an unrecognized *device*.** The fingerprint is what
tells them apart.

---

## 6. Checklist

Before shipping a model that must survive relabeling:

- [ ] A definition holds an **array of identities**, not a single one; a relabel is a **new entry**, never a
      new description.
- [ ] The identity entry shape is **open** — validated as well-formed, not enumerated; presence overrides,
      absence inherits.
- [ ] Every "these are the same device" collapse rests on **verified behaviour**, not resemblance or
      tidiness; unverified pairings stay separate or are marked unverified.
- [ ] The **cosmetic vs. behavioural** line is applied by the test *"would driving code have to change?"* —
      behavioural differences go to the inheritance tree, not the identity array.
- [ ] No cosmetic id (vendor/product id, serial) is **hoisted to a shared tier** where it would falsely
      hold for every descendant.
- [ ] **Branding and reported identity are separate facts**; matching uses the right one.
- [ ] Recognition is **relabel-robust**: exact-id fast path, **fingerprint fallback** on a miss (human
      confirms low-confidence), unknown only when both fail. An unknown *id* is never treated as an unknown
      *device* without the fingerprint check.
