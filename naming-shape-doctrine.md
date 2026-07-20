# Naming-Shape Doctrine

**Scope: cross-project.** When you define a format, an API, or a schema, you must choose how each
kind of token is **cased**. The tempting answer — *"pick one casing and use it everywhere"* — is
wrong, and it is wrong in an interesting way: **a name's shape is a communication channel.** Spend
it deliberately.

The worked example is **DeckLibre**, which chased one-casing-everywhere, discovered it was
structurally unreachable, and landed somewhere better. The pattern is not DeckLibre's; the example is.

This composes the [Conventions Doctrine](conventions-doctrine.md) — *follow the established
convention of the context you're in* — and does not restate it. That doctrine says **follow the
convention**; this one says **which convention, and why there is more than one.**

---

## 0. The load-bearing rule

> **Uniformity is not consistency. A token's SHAPE tells the reader what KIND of thing it is —
> field, value, identifier, method. Flattening every category to one casing destroys that channel
> and calls it tidiness.**

The instinct behind "one casing everywhere" is real and good: fewer rules to remember, nothing to
look up, no bikeshedding. But it optimises **recall** at the cost of **comprehension**, and
comprehension is what you actually need at 2am reading someone else's config. Consider:

```json
{ "userName": "ada", "status": "ACTIVE", "planId": "acme-pro", "method": "user/setName" }
```

Four tokens, four shapes, and you know what each **is** without a schema: a field, a closed value,
an identifier, a method. Now flatten them:

```json
{ "userName": "active", "planId": "acmePro", "method": "user/setName" }
```

Nothing is *wrong*. But every token now looks like every other token, and the reader must consult
the schema to learn what they are looking at. **You removed information and called it consistency.**

---

## 1. The categories, and what each shape signals

The industry converged on these independently, which is the argument for them:

| Category | Convention | The signal |
|---|---|---|
| **Field / property names** | `camelCase` | "this is a field" |
| **Closed enum values** | `SCREAMING_SNAKE` | "this is a value — and these are ALL of them" |
| **Extensible/open-registry values** | `lowercase_snake` | "this is a value — **and you may add one**" |
| **Identifiers / slugs** | `kebab-case` | "this is a name someone chose" |
| **Method / RPC names** | `ns/camelCase` | "this is a verb, not a noun" |
| **Schema-internal type names** | `PascalCase` or `snake_case` | authoring layer; never appears in data |

Grounding (not taste): camelCase fields — Google JSON Style Guide, Microsoft REST Guidelines,
GraphQL, Stripe/Shopify/Discord. SCREAMING_SNAKE enum values — Protocol Buffers style guide,
GraphQL. kebab slugs/paths — Google, Stripe, GitHub.

**The table is not the doctrine.** The doctrine is *§0*: categories get distinct shapes, and the
distinction carries meaning. A project that picks different shapes per category — for a recorded
reason — is conformant. A project that picks **one shape for everything** is not, however tidy it
looks.

---

## 2. ⭐ The best signal available: closed vs open

Of everything here, this is the one most formats miss, and it is nearly free:

> **A closed vocabulary and an extensible one should not look the same — because the reader's most
> urgent question about a value is "am I allowed to invent a new one?"**

Give a closed set one shape and an open registry another, and that question is answered **by
looking**, with no schema, no docs, no asking.

> **DeckLibre.** Its schema already carried the fact — every enum had an `x-decklibre-enum` policy of
> `closed` or `extensible`, machine-checked. And the five open registries (`link`, `interface`,
> `protocol`, `encoding`, `kind`) were *already* pattern-locked to lowercase **precisely because** a
> driver may register a new value into them. So the casing fell out of a distinction the format had
> been making all along:
>
> ```
> "tier": "DEVICE"   ← SCREAMING = CLOSED.      That is every value there is.
> "link": "usb"      ← lowercase = EXTENSIBLE.  A driver may register another.
> ```
>
> No pattern changed. The signal was free, because **the format already knew** — it just wasn't
> saying so out loud. *(Cross-ref: [Data Format Doctrine](data-format-doctrine.md) — what governs
> behaviour should be legible in the data.)*

---

## 3. The trap: chasing uniformity you cannot have

Uniformity is not merely suboptimal — it is often **unreachable**, and you discover this late, after
you have already committed to it.

> **DeckLibre — the named breakage.** The owner chose "camelCase everywhere, descriptors included."
> The work then hit three walls in succession, each found only by measuring:
>
> 1. **Ids were pattern-blocked.** `slug_id` = `^[a-z0-9]+([_-][a-z0-9]+)*$` and `namespaced_id`
>    **reject uppercase** — `buttonA` and `com.example.toggleMute` are refused by the schema, and a
>    negative fixture actively guarded it. camelCase ids were never reachable.
> 2. **The scope was under-reported 5.75×.** "20 enum values" counted only the *underscored* ones;
>    the real reach was **115** — including `device`, `usb`, `be`, `bgr`. The decision had been taken
>    on a wrong number and had to be re-confirmed on the right one.
> 3. **An entire category had been missed.** `link` was not an enum at all; it was an open registry.
>
> Uniformity was impossible from the first wall onward. The *category-differentiated* answer was
> reachable all along, is what every cited standard already does, and is **better** — it says more.

**The tell:** you find yourself arguing that a rule should apply to a category it was never written
for ("field-*name* casing" being stretched over enum *values*), or rewriting a guard to make a
convention fit. **Both mean you are flattening a distinction the format was drawing on purpose.**

---

## 4. A convention can be a legality, not a preference

Some casing choices are not aesthetics; something downstream **refuses** them. Check before you
choose:

> **DeckLibre.** Its reverse-DNS ids used underscores (`com.decklibre.driver.ulanzi_d100h`). **Apple
> bundle identifiers permit only alphanumerics, hyphen and period — the underscore is illegal** — on
> a product that ships on macOS. Kebab was not a nicer-looking option; snake was a latent defect.
> (And the schema's patterns *already* allowed hyphen, so the fix cost one rename and no schema
> change.)

The general rule: **a name that will cross into another system inherits that system's grammar** — a
bundle id, a package name, a DNS label, a URL slug, an env var, a code identifier. Java forbids the
hyphen in a package name; Apple forbids the underscore in a bundle id. If a name may travel, its
shape is a **constraint**, not a taste.

---

## 5. Costs, honestly

- **More than one rule to remember.** Real, and the strongest argument for uniformity. The answer is
  that the rules are *the industry's*, not yours — anyone who has used a JSON API knows them already
  — and they are **learned once, per career, not per project.**
- **Boundary calls.** Some tokens sit between categories (a closed enum used as a *map key*; an RPC
  method declared *as* an enum value). **Decide by what the token IS, not where it happens to sit**,
  and record the call.
- **Homonyms across categories bite.** The same string may be a closed value in one place and an
  extensible one in another (DeckLibre: `plugin` is both `package.type` — a package *is* a plugin —
  and a readout style — rendered *by* a plugin). **A global string rename corrupts one of them**, so
  a casing migration must be **position-aware, never string-level.** (See the
  [load-bearing rule](README.md#the-load-bearing-rule): the migration is a guarantee, and a guarantee
  you have not attacked is a claim. Cross-check a rename against an independent transform and refuse
  to write while they disagree.)

---

## 6. A default name must announce that it is a default

> **An auto-assigned default name is a signal, not a placeholder to make pretty. Its job is to tell
> the user "no one has named this yet." A default that looks like a name someone chose destroys that
> signal.**

When a system auto-creates a thing — a discovered device, a new mesh, an untitled document, a
generated key — it must give it a name, and it is tempting to make that name *friendly*: `key`,
`stage`, `Fill Light`. Resist it. A friendly default is **indistinguishable from a deliberate name**,
and the user's first question about any name is the closed-vs-open question of §2, one level up:

> **"Did I (or someone) name this, or is it still waiting to be named?"**

A **generic, mechanical** default — `<manufacturer>_<kind>_<N>`: `nanlite_light_1`, `mesh_1`,
`Untitled-3`, `wg0` — answers that by looking. It reads as *provisional* precisely because no human
would choose it. A **plausible** default — `key`/`fill`/`stage` — reads as *chosen*, and now the user
cannot tell an un-named thing from a named one, cannot tell which items still need attention, and may
leave a misleading name in place because it looked intentional.

So the rule inverts the usual instinct: for a **default**, generic is not lazy — it is the honest
signal. Effort spent making a default *friendly* spends it in the wrong direction, buying confusion.

> **LiteController.** Provisioned lights default to `<mfgr>_light_N` (`nanlite_light_1`,
> `nanlite_light_2`) and meshes to `mesh_N` (`mesh_1`, `mesh_2`). The names are deliberately mechanical
> so a user scanning the light list sees at a glance which fixtures are still on their auto-name and
> which they have deliberately renamed. When friendly-looking defaults (`key`, `fill`, `stage`) slipped
> into the code and docs, they read as real names — the exact confusion the generic scheme exists to
> prevent.

Two obligations come with this:

- **The default must be trivially replaceable.** A generic default is only honest if the user can name
  the thing the moment they want to — renaming must be a first-class, easy operation
  (`rename <old> <new>`), and renaming a container updates the things that reference it. A default the
  user cannot change is not a signal, it is a life sentence.
- **The generic scheme is also the scheme in your examples and tests.** Documentation and fixtures must
  use the mechanical form (`nanlite_light_1`), never invented friendly names — a doc example named
  `key` teaches the user that friendly names are what the system produces, re-introducing the confusion
  in the one place they go to learn.

The distinction from §1's identifiers row (`kebab-case` = "a name someone chose"): that row is about
names a human **did** choose. This section is about the names the system assigns **before** a human
chooses — and they must not impersonate the former.

---

## 7. Checklist

- [ ] Each **category** of token has a **distinct, deliberate shape** — and you can say what each
      shape *tells* the reader.
- [ ] **Closed vs extensible vocabularies look different**, so "may I invent a value?" is answerable
      by looking. Best if the format already records the distinction — then the signal is free.
- [ ] Conventions are the **context's**, not invented: field names, enum values, slugs and methods
      follow the established standards ([Conventions Doctrine](conventions-doctrine.md)).
- [ ] Any name that **crosses into another system** satisfies *that* system's grammar (bundle id,
      package name, DNS label, URL, identifier) — a **legality check, not a preference**.
- [ ] You have **not** flattened categories into one casing for tidiness — and if you tried, you
      **measured** before committing (scope, blocking patterns, missed categories).
- [ ] Any casing migration is **position-aware and cross-checked**, because homonyms across
      categories make a string-level rename silently wrong.
- [ ] **Auto-assigned default names are generic and mechanical** (`<mfgr>_<kind>_<N>`, `Untitled-N`),
      so a user can tell at a glance what has **not** yet been named. No friendly/plausible defaults
      (`key`, `stage`) that impersonate a chosen name.
- [ ] **Defaults are trivially renameable** (rename is first-class; renaming a container repoints its
      members), and **examples/tests use the generic scheme**, never invented friendly names.
