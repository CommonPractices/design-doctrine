# Forward-Compatible Format Doctrine

**Scope: cross-project.** When you must design a data format (a schema, a config shape, a wire
message, a descriptor) and you are **torn between a simple *descriptive* form and a powerful
*executable* one** — and you cannot yet justify the powerful one — do not choose. Build the simple
form as a **strict subset** of the powerful one, gated by a capability marker, so the powerful path
becomes a **non-breaking addition** instead of a migration you will regret.

This is the format-design companion to two rules you already know: the
[Decision Doctrine](decision-doctrine.md)'s *"if it has a defensible alternative, it's a setting"*
and *"make the invariant structural, not advisory,"* and YAGNI. It is about the specific, recurring
moment where **YAGNI says "don't build the powerful thing yet" and foresight says "but you'll want
it, and switching later will break every file already written."** The doctrine is how you honour
both.

The worked example throughout is **DeckLibre**, whose device descriptors carry a wire-protocol
block. The pattern is not DeckLibre's; the example is.

---

## 0. The load-bearing rule

> **When the future capability is *executing* what today you only *describe*, shape the description
> so the executable form is a strict superset of it. Then the powerful version is something you
> ADD, never something you MIGRATE TO.**

The trap this avoids has two jaws, and most designs get caught in one:

- **Build the powerful (executable) form now** — a mini-language, an interpreter, a rule engine —
  *before you have enough instances to know its shape.* You invent an abstraction against one or
  two examples, and it turns out under-powered against the third; now you have a bad programming
  language nobody asked for, on the hot path, that you must support forever.
- **Build the simple (descriptive) form now with a *throwaway* shape** — bare tags, flat strings,
  values chosen for brevity — and when the powerful form is finally justified, its shape is
  incompatible, so adding it is a **breaking change** to every file, message, and profile already
  in the wild.

The escape is neither. **Build the descriptive form, but with the *shape* the executable form would
need** — typed objects where an interpreter would read fields, not bare tags — plus a marker that
declares which mode is in force. Today a compiled consumer reads the descriptive fields. Tomorrow,
if and only if the capability earns its place, an interpreter reads the *same fields plus new ones*,
and the marker flips. Nothing already written breaks, because the old shape was a subset of the new
one all along.

---

## 1. The two moves that make it work

**Move 1 — a capability marker.** A single field declares how the format is consumed:
`driven_by: "driver"` today; a reserved future value (`"interpreter@1"`) tomorrow. It is present
from day one, with the conservative value, so the day the powerful path arrives it is a *value
change on an existing field*, not a new required field that older files lack.

**Move 2 — every leaf a typed object, never a bare tag.** Wherever the powerful form would need to
*read structure*, the descriptive form carries an **object with a named key**, not a scalar:

- `payload: { "encoding": "ascii_int" }`, **not** `payload: "ascii_int"`.
- `command: { "type": "u16", "endian": "be" }`, **not** `command: "u16-be"`.
- `index: { "u8_at": 8 }`, **not** `index: "byte8"`.

The bare-tag versions are *shorter* and read fine today — and each is a wall. `payload: "ascii_int"`
has nowhere to grow: to add executable steps you must change its type from string to object, which
breaks every existing file. `payload: { "encoding": "ascii_int" }` grows for free — an interpreter
later reads `{ "encoding": "...", "steps": [...] }` on the *same field*, and the string-only files
are still valid.

> **DeckLibre.** The `protocol_def` wire block is a **descriptive record a compiled driver
> executes** (`driven_by: "driver"`) — a command table, an event-decode table, framing, quirks. But
> every leaf an interpreter would one day execute is a typed object: a command's `payload` is
> `{ encoding }`, a framing field is `{ type, endian }`, an event field is `{ u8_at }`. The shape is
> a **strict subset** of a future executable form, so a daemon interpreter (`driven_by:
> "interpreter@N"`) could one day carry a `steps` array beside `encoding` and drive the device
> directly — with **no breaking change** to a single profile already shared. The interpreter is not
> built (YAGNI: there are not yet enough devices to generalise a byte-manipulation language safely,
> and one on the hot render path is a real cost). The doctrine is why *not building it* costs
> nothing later.

---

## 2. When this applies — and when it does not

**It applies when** the future capability is **"execute what we now describe"** and switching to it
would otherwise rewrite existing data:

- a descriptor read by compiled code today that a generic interpreter might read tomorrow;
- a config of declarative rules today that a rule *engine* might evaluate tomorrow;
- a template of static values today that a computed/parameterised template might replace tomorrow.

**It does not apply when:**

- **The powerful form is genuinely needed now.** Then build it now — the doctrine is for the case
  where YAGNI says *wait*. Do not manufacture a "future" to justify complexity you can defer.
- **The two forms are not subset-related.** If the powerful version is a genuinely *different*
  model, not a superset, there is no subset shape to build toward; forcing one produces a worse
  version of both. The whole doctrine rests on **superset-ness** being real.
- **There will be no "later."** A one-off throwaway, a format with a single internal consumer you
  can migrate atomically — pay nothing for a forward-compat you will never spend. The cost is real
  (see §4); it buys reach you must actually expect to need.

---

## 3. The discipline you are buying — and its price

The payoff is stated plainly so the price is too: **you commit to a shape you must not break.** The
typed-object leaves and the marker are a **contract with your future self.** If you later discover
the executable form needs a shape your descriptive leaves *cannot* extend to, you have not escaped
the migration — you have merely deferred discovering you chose the wrong subset.

So the leaves must be designed **once, carefully**, against the honest question *"what would an
interpreter reading this need?"* — not *"what is the shortest thing that works today?"* That design
tax is the cost. It is smaller than a migration, and it is paid once. But it is not zero, and a
design that skips it (bare tags "for now, we'll fix it later") has bought nothing — "later" is a
breaking change either way.

> **The tell you are doing it right:** you can point at a leaf and say *"if the interpreter ships, it
> reads this exact field plus a sibling, and every file written today still validates."* If you
> cannot say that of a leaf, that leaf is a bare tag wearing an object costume — fix its shape now.

---

## 4. Relationship to neighbouring doctrine

- **YAGNI is not violated — it is honoured.** You are *not* building the powerful form. You are
  building the simple form with a shape that does not foreclose it. Foreclosure, not construction,
  is the thing YAGNI is silent on and this doctrine addresses.
- **[Decision Doctrine](decision-doctrine.md) — "make the invariant structural."** Same instinct:
  encode the guarantee (here, *"the upgrade is non-breaking"*) in the **shape of the data**, so it
  holds by construction rather than by a promise to be careful at migration time.
- **[Spec Promotion Doctrine](spec-promotion-doctrine.md) — a version cuts around what is open.** A
  format built this way lets an *open* capability (the interpreter) sit in the design as a marked,
  non-blocking future without holding the descriptive form hostage — the additive path is the
  structural expression of "cut around the open item."
- **[Data Format Doctrine](data-format-doctrine.md) — annotate in data, not syntax.** The capability
  marker and typed leaves are themselves *data the consumer reads*, the same principle: what governs
  behaviour is a field, not a convention or a comment.

---

## 5. Checklist

- [ ] The future capability is **"execute what we describe"** and switching would otherwise **rewrite
      existing data** — the case this doctrine is for. (If the powerful form is needed *now*, build
      it now; if there is no "later," skip this.)
- [ ] A **capability marker** is present from day one with the conservative value (`driven_by:
      "driver"`), so the upgrade is a *value change*, not a new required field.
- [ ] Every leaf the powerful form would **read as structure** is a **typed object with a named
      key**, not a bare tag — so it grows by *adding a sibling field*, not by *changing its type*.
- [ ] You can say of each such leaf: *"the powerful consumer reads this exact field plus a sibling,
      and today's files still validate."* If not, that leaf is not forward-compatible yet.
- [ ] The subset relationship is **real** — the powerful form is a genuine superset, not a different
      model wearing the same name.
- [ ] The design tax (shaping leaves against *"what would the interpreter need?"*) is **paid once,
      up front** — not deferred behind bare tags that will break at migration anyway.
