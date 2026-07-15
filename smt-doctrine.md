# Stupid Manufacturer Tricks (SMT) Doctrine

**Scope: cross-project.** How to model hardware when a manufacturer's **naming does not match its
behaviour** — and how to keep a naive model from being fooled by the mismatch. The name is deliberately
blunt: "Stupid Manufacturer Tricks" is what a maker does when the label and the machine tell different
stories.

## The two faces of SMT — a name/behaviour mismatch runs in BOTH directions

A manufacturer's name and its actual behaviour can diverge two opposite ways, and **both are SMTs seen
in the wild.** They are mirror images, and the correct response to each is the mirror of the other:

| | **Face A — same behaviour, different names** | **Face B — same name, different behaviour** |
|---|---|---|
| The trick | one device relabeled/white-labelled as N products; new sticker, new USB id, zero behavioural change | one product name (e.g. a family) kept across a **quiet** behavioural break — one or two items changed |
| The trap | a naive model sees **N devices** where there is **one** → duplication that drifts | a naive model sees **one behaviour** where it **changed** → a poisoned fact inherited as if still valid |
| The danger | fix a bug in one copy, forget the others | 95% still inherits correctly, so the broken item **slides through because it looks inherited** |
| The response | **collapse** — one definition, an array of identities (§1–§6) | **quarantine** — mark the broken fact, break inheritance for it alone (§7) |
| The core move | *don't multiply sameness* | *don't trust continuity* |

**Both faces share one root:** a manufacturer's **name is not a reliable proxy for its behaviour** —
so never let a label, by itself, decide what a thing *does*. Face A: don't let N labels convince you of
N behaviours. Face B: don't let one label convince you the behaviour held. The rest of this doctrine is
Face A (§1–§6, the original and more common case), then Face B (§7).

This doctrine was extracted from the [Device-Model Doctrine](device-model-doctrine.md) (where it began as
one section) because it is a **portable pattern in its own right** — it applies to any registry of things
whose labels and behaviour drift apart, not only to a hardware inheritance tree. The device-model doctrine
handles honest *variation* (real differences, modeled by tiers); SMT handles the **dishonest** cases —
sameness wearing a disguise (Face A) and change hiding behind a stable name (Face B).

---

# Face A — same behaviour, different names (collapse)

## 0. The load-bearing rule (Face A)

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

# Face B — same name, different behaviour (quarantine)

## 7. The mirror case: a stable name across a quiet behavioural break

Face A is a maker giving **one behaviour many names**. Face B is the mirror: a maker keeping **one name
across changed behaviour** — a family, a model line, a product name held for marketing continuity while
the machine underneath is quietly altered. The canonical example is a camera family that spans a
re-platforming (Canon "EOS" carried from EF DSLRs to RF mirrorless) — the *name* is continuous, the
*wire behaviour* is not.

> ### 7.0 The load-bearing rule (Face B)
>
> **A continuous name is not a continuous behaviour. When a maker keeps a label across a behavioural
> break, do not let inheritance carry the changed fact down under the old name — mark it and quarantine
> it.**

**The danger is the opposite of Face A's, and subtler.** Face A's trap is loud (N stickers, obviously
different ids). Face B's trap is quiet: an SMT is usually **not** a wholesale reset — the maker changes
**one or two items** and keeps everything else. So **95% still inherits correctly**, and the one poisoned
item **slides through precisely because it looks inherited.** A model that resets everything at the break
would be safe but wasteful (re-deriving the 95% that didn't change); a model that inherits blindly ships
the poisoned fact. The doctrine threads between them: **inherit normally, quarantine surgically.**

### 7.1 The marker lives on the broken fact, and it is greppable

The SMT marker is **not** a barrier across a whole tier or a "reset here" flag. It sits **on the specific
fact(s) that broke**, in-band and greppable, and it names *what* changed and *against which ancestor*.
Everything else at that tier inherits normally. The marker is a **landmine annotation on the poisoned
item**, not a wall.

- It records: the fact broke, the **ancestor it broke away from**, *what* changed (ideally: the old
  meaning vs the new), and that it **requires re-verification**.
- It is greppable on purpose — a single token (e.g. `smt`) so that "show me every place this maker pulled
  a trick" is one search. Silent routing-around is exactly what this doctrine forbids; the trick is
  **marked**, the way a superseded decision is struck rather than deleted.

### 7.2 Semantics: warn **and force re-verification**

A marked fact **must not clear a trust threshold on inherited confidence alone.** Its inherited
confidence is **capped low until the fact is verified on the post-break device.** This is the whole
defence: the trick's danger is that the poisoned item *looks* inherited and therefore *looks* trustworthy,
so the model **refuses to trust inheritance for exactly that item** until fresh evidence lifts it. Warn
(the human sees the trick) **and** re-verify (the machine won't ship the inherited value).

This is the same discipline the [Documentation Doctrine](documentation-doctrine.md) applies to a
superseded fact — *keep it visible, mark it, don't silently route around it* — applied one tier up, to a
behaviour that changed under a name that didn't.

### 7.3 Face B is a real difference — so why is it here, not in the inheritance tree?

The [Device-Model Doctrine](device-model-doctrine.md) already models real behavioural difference with
child tiers, and a Face-B break *is* a real difference — so a broken fact **does** get overridden at a
more-specific tier, exactly as the tree prescribes. Face B adds one thing the plain tree does not: the
**marker that says the override exists because the maker was dishonest with the name**, and the
**re-verification cap** that follows. Without it, the override is silent — indistinguishable from ordinary
honest variation — and the next person to read the model cannot tell "this child genuinely differs" from
"this maker quietly broke compatibility and kept the name." **The tree records the difference; the SMT
marker records that the difference was a trick, and quarantines it accordingly.**

> **CameraConductor.** The device-description schema carries an in-band `smt` object on any property whose
> meaning broke across a family re-platforming (same family name, changed wire behaviour). Inheritance
> flows normally for every other property; the marked property's inherited confidence is capped until
> live-verified on the post-break body. *(Worked instance of §7.1–§7.2 — the family name is the cover
> story; the marker is the landmine.)*

---

## 8. Checklist

**Face A — surviving relabeling (same behaviour, different names):**

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

**Face B — surviving a stable name across a behavioural break (same name, different behaviour):**

- [ ] Inheritance flows **normally** across the break; the model does **not** wholesale-reset at a name
      that continued (that re-derives the 95% that didn't change).
- [ ] The broken fact carries a **greppable, in-band marker** naming *what* changed and *which ancestor* it
      broke from — a landmine on the fact, not a barrier across the tier.
- [ ] A marked fact **cannot clear a trust threshold on inherited confidence alone** — its inherited
      confidence is **capped until re-verified** on the post-break device (warn **and** re-verify).
- [ ] The marker distinguishes **"honest variation"** (an ordinary child-tier override) from **"a trick"**
      (a change the maker hid behind a continuous name) — so a reader can tell them apart.
