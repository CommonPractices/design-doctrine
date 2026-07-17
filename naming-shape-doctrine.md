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

## 6. Checklist

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
