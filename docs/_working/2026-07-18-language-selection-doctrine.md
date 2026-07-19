# Language-Selection Doctrine

> **Status: DRAFT.** A working draft in `docs/_working/`; not yet part of the approved doctrine
> set. It is promoted by moving it to the repo root under a stable, undated name when the owner
> approves it ([Documentation Doctrine](../../documentation-doctrine.md) §3). *(This repo is flat —
> approved doctrines live at the root, not under `docs/` — so promotion here targets the root.)*

**Scope: cross-project.** How a product lets a person choose their language — how it **detects** a
first choice, **names** each language, **tags** it, **orders** the list, and decides **when a language
earns more than one entry.** This is deliberately *not* the whole of localization: translation itself,
plural rules (ICU MessageFormat / CLDR plural categories), grammatical gender, and message formatting
are a separate concern, out of band here. This doctrine governs the **chooser**, not the strings it
chooses between.

A language chooser written in the interface's *current* language has a bootstrap problem: the person
most in need of it — someone who cannot read the current language — is exactly the person who cannot
read the list. "German", "Japanese", "Arabic" are useless labels to a reader of German, Japanese, or
Arabic. The list must be legible *before* the choice is made, so each language can be named only in
**itself**. This is accessibility first and convenience second: the difference between a language being
*findable* and being *lost in a list the user cannot parse.*

**This doctrine composes existing ones and restates none of them.** Its accessibility floor is the
[UI/UX Design Doctrine](../../ui-ux-design-doctrine.md)'s. It does **not** define the tag format — that
is [BCP 47](https://www.rfc-editor.org/info/bcp47), adopted through the
[Conventions Doctrine](../../conventions-doctrine.md), which is **supreme** on the point; language
*matching* is [RFC 4647](https://www.rfc-editor.org/info/rfc4647); locale *data* (names, collation,
formatting) is [CLDR](https://cldr.unicode.org/). The variant model borrows the single-inheritance
chain of the [Device-Model Doctrine](../../device-model-doctrine.md); the rule for *when* two variants
are the same language is the [SMT Doctrine](../../smt-doctrine.md)'s *sameness is earned, never
assumed.*

The worked example is **DeckLibre's language picker.** The pattern is not DeckLibre's; the example is.

---

## 0. The load-bearing rule

> **Offer every language in its own name.** Each entry in a language chooser is written in the
> language it selects — its **autonym** (equivalently, endonym) — never in the interface's current
> language. A reader who cannot read the current language must still be able to find their own.

The failure this prevents is total, not cosmetic: a person who opens the app in a language they cannot
read, to a list of language names *also* in that language, has no way out. The autonym is the one label
they are guaranteed to recognise.

---

## 1. The autonym renders in its own language — script, orthography, and direction

Typing the autonym is only the start; it has to render the way that language actually renders, and
carry the markup assistive tech needs.

- **Machine-tagged.** Each entry carries its own **language tag** on the element (`lang="ja"`) so a
  screen reader switches to the right voice instead of spelling `日本語` out in the current language, and
  its **direction** so a right-to-left autonym (`العربية`, `עברית`) lays out correctly inside an
  otherwise left-to-right list. Isolate mixed-direction items (`<bdi>`, `unicode-bidi: isolate`) so an
  RTL name cannot reorder the text around it.
- **Its own script, never transliterated.** `العربية`, not "al-ʿArabiyyah"; `中文`, not "Zhōngwén". A
  transliteration is the current-language label in disguise, and it fails the §0 reader for the same
  reason a translation does.
- **Its own orthography, including case and punctuation.** The autonym obeys *its* language's rules,
  not English's: `Deutsch` and `English` capitalise, but `español`, `français`, and `português` do
  **not** — language names are lowercase in those languages. Even the brackets follow suit: `中文（简体）`
  uses full-width parentheses. Getting this wrong is the same error as transliteration — imposing one
  language's conventions on another's name.
- **Any region or script qualifier is also in the autonym's language.** `español (España)`, not
  `español (Spain)`; `中文（繁體）`, not `Chinese (Traditional)`.

**A widget caveat, not a licence to skip the rule:** a native `<select>` does not reliably honour
per-`<option>` `lang`/`dir` across assistive tech, so meeting this section often means a custom ARIA
`listbox` — which brings its own obligations (keyboard, focus, `aria-activedescendant`). The rule
stands; the widget choice is where you pay for it.

---

## 2. Tag every language with BCP 47 — the Conventions Doctrine is supreme

Every language is identified by a **BCP 47 language tag** — `en-US`, `es-419`, `zh-Hant` — used
**throughout**: the stored value, the `lang` attribute, the translation-set filename, the key in any
map. This doctrine does not invent the format; it **defers** to the
[Conventions Doctrine](../../conventions-doctrine.md), which is supreme here. BCP 47 is what every
locale-aware tool already parses — the platform, `Intl`, CLDR, `gettext`, the HTML `lang` attribute —
so a private, region-first, or underscore spelling (`us_en`) is exactly the deviation that doctrine
forbids.

- **Canonical case, per RFC 5646:** language **lowercase**, script **Title-case**, region
  **UPPERCASE** or numeric — `zh-Hant`, `es-419`, `sr-Latn`. Store tags in this form.
- **Match case-insensitively.** BCP 47 tags are case-insensitive, so `en-US` and `en-us` are the *same
  tag*. Case-fold before using a tag as a map key or comparing two — treating the raw string as a key
  silently splits one language into two.

**Displaying the tag is a deviation from convention — take it deliberately.** The near-universal
convention is to show the **autonym alone**. Showing the tag as well (`en-US — English (United
States)`) is a **prosumer affordance** — precise disambiguation for a user who reads tags — and it is
allowed only on the two conditions the Conventions Doctrine's deviation rule demands: the **autonym
alone must be sufficient** to choose (the tag is additive, never the thing the user must parse), and
where tag and name could ever diverge, **the tag is authoritative** — never bent to read tidily. A
project may keep the tag out of the default view, behind its Advanced surface; what it must not do is
make the *tag* the primary label.

---

## 3. A variant is an *overlay* on its base — and two "bases" are not the same thing

A regional or script variant is not a second, independent translation. It is a **diff over a base
language**, exactly the single-inheritance chain of the
[Device-Model Doctrine](../../device-model-doctrine.md): a base carries the whole string set; a variant
**inherits** it and **overrides only what genuinely differs**. A variant is never a full copy — a copy
drifts (SMT Doctrine); an overlay cannot.

Two distinct notions of "base" must not be conflated:

- **The authoring base** is the locale the source strings are written in — **US English (`en-US`)** for
  DeckLibre. It is the source of truth for the string set, and overlays diff against it.
- **The resolution fallback** is how a *missing* string is found at runtime, and it follows the **CLDR
  locale chain**, which is multi-level, not one hop: `es-AR → es-419 → es → root`. That is CLDR's data
  model, separate in shape from the app's own overlay; do not assume the two are identical.

Consequences to state, not leave implicit:

- **A missing string falls back up the chain — never shows a raw key.** An untranslated entry resolves
  to its base, ultimately the authoring base; the user never sees `settings.audio.gain`.
- **How the neutral tag resolves.** A bare `en` resolves to the authoring base (`en-US` here), since
  that is the English string set that exists, and `en-GB` is an overlay on it. This is the *app's*
  choice of source locale — deliberately distinct from CLDR's data model, where `en-US` and `en-GB` are
  siblings under a neutral `en`.

---

## 4. Split a language only where the difference is real — by region *or* script — sameness is earned

Two variants are the **same language** until a genuine difference is shown; never split on the
assumption that a different country — or a different script — automatically means a different entry.
This is the [SMT Doctrine](../../smt-doctrine.md)'s *sameness is earned on verified difference, not
assumed from resemblance.*

The split axis is **region or script:**

- **Region** — Latin-American vs Iberian Spanish, France vs Canadian French.
- **Script** — Simplified vs Traditional Chinese, Latin vs Cyrillic Serbian. This is not an edge case:
  the most common non-region split is by script, and BCP 47 carries it in the **script subtag**
  (`zh-Hans`/`zh-Hant`, `sr-Latn`/`sr-Cyrl`), not the region.

**What counts as a real difference** is a difference in the **rendered strings** — spelling
(`color`/`colour`), vocabulary (`elevator`/`lift`), idiom, script, or a term that would mislead a
reader. It is **not** date, number, currency, or unit **formatting**: that is locale *data* (CLDR),
applied to every variant of a language alike, and does not by itself mint a new entry. The test reduces
to §3's: **is the variant's overlay non-empty?** A region overlay is often thin; a script overlay is
often large (near a separate string set) — both are earned the same way. And because an overlay is
content, it is **reviewed like any translation** — a one-word overlay is a claim to verify, not an
automatic entry.

> **Ecosystem:** the splits that are real and known — `es-419 — español (Latinoamérica)` vs `es-ES —
> español (España)`; `fr-FR — français (France)` vs `fr-CA — français (Canada)`; `pt-BR — português
> (Brasil)` vs `pt-PT — português (Portugal)`; and by script, `zh-Hans — 中文（简体）` vs `zh-Hant —
> 中文（繁體）`. What you do **not** do is pre-enumerate `es-MX`, `es-AR`, `fr-BE`, `fr-CH` speculatively:
> each earns its entry only if and when a real overlay is produced for it. The catalogue is discovered
> as translators produce genuine overrides, never decreed up front — the doctrine fixes the
> **mechanism**, so the catalogue can be incomplete but never wrong.

---

## 5. Choose the first language by detecting, then matching — not by defaulting blindly

The picker is the **override**, not the primary path. Most users should never open it, because the
product picked their language correctly on first run.

- **Detect the preference,** don't default to the authoring language. Read the ordered languages the
  platform already exposes (OS locale list, `Accept-Language`) — themselves BCP 47 tags.
- **Match requested → available.** Use [RFC 4647](https://www.rfc-editor.org/info/rfc4647) **lookup**,
  progressively truncating a preferred tag until it meets an available language (`en-CA → en`), plus
  **CLDR region containment** for macroregions (a country tag like `es-CO` resolves into `es-419`).
  Take the first preference that resolves.
- **Fall back to the authoring base** (§3) only when nothing matches — never to a raw key, never to a
  blank screen.

---

## 6. Order the list for findability — an unordered cross-script list defeats §0

Findability (the §0 goal) is not just naming; a correct autonym buried at position 80 of an unordered,
multi-script list is still lost.

- **Surface the user's likely languages first** — the detected/OS languages (§5) and any recently
  chosen — above a separator, so the common case is a one-glance pick.
- **Collate the remainder by the current locale's collation** (CLDR), not by raw code-point order, and
  never assume a single cross-script alphabetical order exists — it does not.

---

## 7. Checklist

Before shipping a language chooser, and before adding a language or a variant:

- [ ] Every entry is in its **own language** (autonym) — own script, own orthography (case,
      punctuation), never the current language and never transliterated (§0, §1).
- [ ] Every entry carries its **`lang`** tag and resolved **direction**, with mixed-direction items
      isolated; the widget actually delivers this to assistive tech (§1).
- [ ] Every language is a **BCP 47** tag in canonical case, matched **case-insensitively**, per the
      supreme Conventions Doctrine (§2).
- [ ] If the tag is shown, the **autonym alone is sufficient**, and the tag is authoritative, additive,
      and out of the primary label's way (§2).
- [ ] A variant is an **overlay** over its base, overriding only what really differs; no **empty
      overlay** appears (§3, §4).
- [ ] **Authoring base** and **CLDR resolution fallback** are kept distinct; a missing string falls up
      the chain and **never** shows a raw key (§3).
- [ ] A split is justified by a real **rendered-string** difference — region **or script** — not by
      formatting, which is CLDR data (§4).
- [ ] The first language is **detected and matched** (RFC 4647 + CLDR containment), not defaulted
      blindly; the picker is the override (§5).
- [ ] The list **surfaces likely languages first** and collates the rest by the current locale (§6).
