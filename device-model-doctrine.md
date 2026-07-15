# Device-Model Doctrine

**Scope: cross-project.** How to describe a family of hardware (or any product with variants)
so that shared shape is written once, real-world messiness is absorbed without duplication, and
the description can be extended by people you'll never meet without breaking.

Any system that must *know about* a range of devices — a driver layer, a device registry, a
capability catalog, a fleet-management tool — faces the same three pressures: most models in a
line are nearly identical; manufacturers relabel identical hardware for marketing; and you will
never own one of every model, let alone every clone. A flat "one description per model" table
collapses under all three. This doctrine is the shape that doesn't.

The worked example throughout is **DeckLibre**, a control-surface deck controller whose device
descriptors must cover a maker's whole line plus third-party and home-built clones. The pattern
is not DeckLibre's; the example is.

---

## 0. The load-bearing rule

> **Describe the device once at the level where the trait is actually true, and let everything
> more specific inherit it.**

A trait that is true of a whole *manufacturer's line* belongs at the manufacturer level. A trait
true of a *family* belongs at the family. Only a trait genuinely unique to a *model* belongs on
the model. When you write a trait lower than it is true, you copy it — and copies drift. When you
write it higher than it is true, you lie about models that don't share it. The entire structure
below exists to give every fact exactly one honest home.

**"Trait" means *any* fact — including the wire protocol.** The rule is not about a device's *shape*
(grid, controls, geometry) specifically; it governs **every** inheritable fact. The temptation is to
treat the shape as the inheritable thing and the *protocol* — framing, command codes, an init
sequence, an image-upload encoding, event decoding — as something separate that each device carries
whole. That is the same duplication the rule forbids, sneaking in through a different door. A
manufacturer's base framing is usually **line-wide**: it belongs at the manufacturer tier and is
inherited down exactly like the shape, with a family or a device overriding only the protocol
*deltas* it genuinely differs on. If you find yourself building a second, parallel inheritance
mechanism for "the protocol," stop — there is one chain, and the protocol rides it.

> **DeckLibre.** The `0x7c7c`-framed vendor protocol (magic + a 2-byte command + length, brightness
> as one command, faces as a PNG-in-ZIP upload, key events decoded from a frame) is almost certainly
> *not* a per-model fact — the same framing spans the maker's whole deck line. So it is described once
> at the **manufacturer** tier and inherited down the `manufacturer → family → device` chain; a variant
> reverse-engineers only the protocol *deltas* it doesn't inherit. The protocol is not a new kind of
> thing needing a new mechanism — it is one more trait finding its truthful tier.

---

## 1. Tiers: a single-inheritance chain, deepest-truth-wins

Model the range as a **chain of tiers**, each inheriting from the one above and overriding or
adding only what differs:

```
manufacturer   ← what is common to a maker's whole line
  └ family     ← what a hardware family shares
      └ device ← a concrete, usable thing
```

**Rules of the chain:**

- **Single parent.** Each description names **exactly one** direct parent (the Delphi/Java
  model — one parent, one chain, no multiple inheritance, no mixins). Single inheritance keeps
  resolution total and predictable; multiple inheritance buys expressiveness you will pay for in
  diamond-conflict rules nobody remembers.
- **The parent is the *nearest* honest ancestor, not always the top.** A device that is a near-
  identical sibling of another device should inherit **that sibling**, not the bare family —
  carrying only its handful of deltas instead of re-deriving everything. So a parent may be a
  family *or another device*.
- **Depth is unbounded.** `manufacturer → family → family → device → device` is all legal. Do
  **not** bake a depth cap ("two or three levels") into the model — the moment you do, a real
  device that needs a fourth level breaks it. State the chain as arbitrary-depth single
  inheritance and let each description point at whatever ancestor is closest.
- **Only the leaf is real.** The top tiers (manufacturer, family) are **abstract bases** — never
  used directly, never bound, never the thing a consumer resolves to. They exist only to be
  inherited. Only a concrete leaf (`device`) is a usable, resolvable thing.

> **DeckLibre:** a device descriptor carries a `tier ∈ manufacturer | family | device` and an
> `extends` naming its single parent. The daemon resolves the whole ancestor chain at load. A
> `family` (the D200 line's shared 5×3 grid + double-wide key) is never bound to a profile; only
> a concrete `device` is. A variant descriptor `extends` its nearest sibling device rather than
> restating the family.

---

## 2. Resolution: merge parent-first, child overwrites

A leaf's real definition is computed by **walking the chain root-first and merging each level
onto the accumulated result**, child overwriting parent. The merge rule has to be stated per
*kind* of member, or it is ambiguous:

- **Maps merge at the key level.** A child re-declaring an entry by key **replaces that whole
  entry**, not a deep field-merge inside it. (Overriding one property of one control means
  restating that control's full object — deep-merging keys individually is where "I changed one
  pixel and three unrelated things moved" bugs come from.)
- **Keyed sub-objects merge key-over-key.** The child's keys overwrite the parent's matching
  keys; keys the child omits are inherited unchanged.
- **Scalars replace outright.** A child's value wins.
- **No member *removal* in v1.** A child can add or override, but cannot *delete* an inherited
  member. Removal is a genuine hazard (it lets a child silently drop a member a consumer relied
  on) and it is only ever needed once a base is a *published* contract (see §5) — so defer it to
  an explicit, designed mechanism rather than a merge side-effect.

> **DeckLibre:** `controls` merge at the map level (a re-declared control id replaces the whole
> control); `transport` and per-device settings merge key-over-key; scalars replace; removal is
> deferred behind a named future hatch, prioritized specifically for public families.

---

## 3. Two validation moments: partial on disk, complete after merge

An abstract base is *supposed* to be incomplete — a family with no transport, no usable control
set, is not an error; it is a base. But a resolved device that is still missing those is broken.
So validate **twice, differently:**

1. **On disk, each description is validated as a legal *partial*.** Required-ness is
   **conditional on inheritance**: a small identity core (schema version, id, tier) is always
   required; the fields that make a device *usable* are required **only on a self-contained leaf**
   (a `device` with no parent). An extending description may omit them and inherit them.
2. **After merge, the *resolved leaf* is validated as complete.** Once the chain is flattened,
   the concrete device must carry every unconditionally-required field. A family that never
   resolves to a complete device is fine; a *device* that doesn't is a load error.

Conflating these — demanding completeness on disk — makes abstract bases impossible to express.
Skipping the second — never checking the resolved result — ships broken devices. You need both.

> **DeckLibre:** the on-disk schema accepts a family with no `transport`; the loader refuses a
> resolved `device` that lacks `display_name`, `driver`, `transport`, or `controls`.

---

## 4. Identifiers mirror the lineage, and you own the namespace

Two rules for the ids, both load-bearing:

**The id encodes the chain.** Each tier's id is **its parent's id plus one segment**, so the
identifier itself shows the ancestry — you can read the lineage off the string without loading
anything:

```
com.decklibre.driver.ulanzi              ← manufacturer
com.decklibre.driver.ulanzi.d200         ← family     (parent + ".d200")
com.decklibre.driver.ulanzi.d200.d200x   ← device     (parent + ".d200x")
```

**You own the namespace root — not the vendors.** The ids are **your** system's artifacts; the
manufacturer and model are *segments*, never the root. Rooting a description at the vendor's
apparent domain (`com.ulanzi.*`) quietly claims a namespace you don't control and can't defend
against a collision. Root everything at a namespace you actually own; put the maker in as a
segment.

> **DeckLibre** learned this as a correction: an early draft rooted device ids at the vendor
> (`com.ulanzi.d200x`) while families sat under the project's own namespace
> (`com.decklibre.driver.*`) — the two were inconsistent, and the vendor-rooted form claimed a
> namespace DeckLibre doesn't own. The fix rooted **every** tier under `com.decklibre.driver.*`
> with vendor and model as segments, so the id both stays owned and reads as its own family tree.

---

## 5. Abstract bases become public contracts the moment they're extended

The instant a *third party* can inherit from one of your bases, that base's member set is a
**public API**: renaming or dropping a member silently breaks every external description built on
it. But freezing *every* internal base by accident is just as bad — you lose the freedom to
refactor your own guts.

Resolve it by making the intent **explicit and default-safe**: a base declares whether it is a
**public** extension point (a supported contract that evolves additive-only within a major
version) or **private/internal** (first-party-only; a third-party attempt to extend it is
refused; free to change). **Default to private** — nothing becomes a frozen contract merely by
existing; a base is public only when it says so.

> **DeckLibre:** a `family` carries `visibility: public | private`, default private. A public
> family evolves under the same additive-only-within-major discipline as the rest of the plugin
> API; a private one the loader refuses to let a third-party descriptor extend.

---

## 6. One definition, many cosmetic identities — see the SMT Doctrine

Manufacturers relabel *functionally identical* hardware — a different product name, a different
USB/hardware id, a different sticker — with **zero change in how the thing actually works**.
Modeling each relabel as its own full description is the duplication tiers were supposed to kill,
sneaking back in at the leaf. So a concrete device carries a **list of the identities it is sold
as** (one definition — one control set, one protocol, one behaviour — and **N cosmetic
identities**); a relabel adds an *entry*, not a description.

This pattern is portable beyond a hardware tree, so it has its **own document**: the
[**Stupid Manufacturer Tricks (SMT) Doctrine**](smt-doctrine.md). It covers the open identity array,
the "earn the sameness claim, never assume it" rule, the cosmetic-vs-behavioural dividing line, why a
vendor id is not a manufacturer-tier constant, branding ≠ reported identity, and relabel-robust
recognition. **Where the device-model tree handles real *variation*, SMT handles *sameness wearing a
disguise*; they are complementary and used together.**

> **DeckLibre:** a device definition carries a `supported_devices` array — the identities the one
> device is sold as (see the SMT doctrine's worked example: sold-as "ulanzi", reports `Zkswe`, vid
> `0x2207` — three identities, none a stand-in for the others).

---

## 7. Checklist

Before shipping a model for a range of devices:

- [ ] Every shared trait — **including the wire protocol** — lives at the **highest tier where it is
      actually true**: no lower (duplication), no higher (false claim). One inheritance chain carries
      *every* fact; there is no separate mechanism for "the protocol."
- [ ] **Single** parent per description; parent is the **nearest** honest ancestor; **depth
      uncapped**.
- [ ] Abstract bases are **never usable directly**; only concrete leaves resolve.
- [ ] Merge rule stated **per member kind** (maps key-level-replace, sub-objects key-over-key,
      scalars replace); removal deferred to a designed hatch, not a merge side-effect.
- [ ] **Two validation moments**: partial-on-disk (required-ness conditional on inheritance),
      complete-after-merge.
- [ ] Ids **mirror the chain** (parent id + one segment) and are rooted in a namespace **you
      own**, vendor/model as segments.
- [ ] Extensible bases declare **public/private**, default **private**.
- [ ] Relabeled-identical hardware follows the [**SMT Doctrine**](smt-doctrine.md): **one definition
      + an open identity array**, sameness **verified not assumed**, no cosmetic id hoisted to a
      shared tier, branding ≠ reported identity, relabel-robust recognition.
