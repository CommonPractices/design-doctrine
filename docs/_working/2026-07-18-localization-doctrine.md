# Localization Doctrine

> **Status: DRAFT.** A working draft in `docs/_working/`; not yet part of the approved doctrine
> set. It is promoted by moving it to the repo root under a stable, undated name when the owner
> approves it ([Documentation Doctrine](../../documentation-doctrine.md) §3). *(This repo is flat —
> approved doctrines live at the root, not under `docs/` — so promotion here targets the root.)*

**Scope: cross-project.** How a product lets a person choose their language, and how it names and
structures the languages it offers — so the choice is reachable by someone who cannot yet read the
interface, and the set of languages grows without sprawl or drift.

A language picker written in the interface's *current* language has a bootstrap problem: the person
most in need of it — someone who cannot read the current language — is exactly the person who cannot
read the list. "German", "Japanese", "Arabic" are useless labels to a reader of German, Japanese, or
Arabic. The list has to be legible *before* the choice is made, which means each language can be
named only in **itself**. This is an accessibility rule first and a convenience second: it is the
difference between a language being *findable* and being *lost in a list the user cannot parse.*

**This doctrine composes existing ones and restates none of them.** The accessibility floor it sits
on is the [UI/UX Design Doctrine](../../ui-ux-design-doctrine.md)'s. The **tag format is not this
doctrine's to define** — it is [BCP 47](https://www.rfc-editor.org/info/bcp47), adopted through the
[Conventions Doctrine](../../conventions-doctrine.md) (*follow the established convention of the
context you're in*), which is **supreme** on the point. The variant model borrows the
single-inheritance chain of the [Device-Model Doctrine](../../device-model-doctrine.md); the rule for
*when* two regions count as the same language is the [SMT Doctrine](../../smt-doctrine.md)'s
*sameness is earned, never assumed.*

The worked example is **DeckLibre's language picker.** The pattern is not DeckLibre's; the example
is. Any product that offers more than one language faces the same three questions — how to name a
language, how to tag it, and when a region deserves its own entry.

---

## 0. The load-bearing rule

> **Offer every language in its own name.** Each entry in a language chooser is written in the
> language it selects — its **autonym** — never in the interface's current language. A reader who
> cannot read the current language must still be able to find their own.

The failure this prevents is total, not cosmetic: a person who opens the app in a language they
cannot read, to a list of language names *also* in a language they cannot read, has no way out. The
autonym is the one label they are guaranteed to recognise.

---

## 1. The autonym must be machine-tagged, not merely typed

Rendering `日本語` as text is half the rule. The other half is telling the machine what it is: a screen
reader that meets `日本語` inside an English page will try to pronounce it *in English* — spelling out
characters it cannot voice — unless the markup says otherwise.

- Each picker entry carries its own **language tag** on the element (`lang="ja"`) so assistive tech
  switches to the right voice, and its **direction** (`dir="auto"`, or the resolved `rtl`/`ltr`) so a
  right-to-left autonym (`العربية`, `עברית`) lays out correctly inside an otherwise left-to-right list.
- The autonym renders in its **own script** — `العربية`, not "al-ʿArabiyyah"; `中文`, not "Zhōngwén".
  A transliteration is the current-language label in disguise, and it fails the §0 reader for the same
  reason a translation does.

The visible autonym is what a sighted user scans for; the tag and direction are what a screen-reader
user — and correct rendering — depend on. Both halves are the rule.

---

## 2. Tag every language with BCP 47 — the Conventions Doctrine is supreme

Every language is identified by a **BCP 47 language tag** — `en-US`, `es-419`, `zh-Hans` — used
**throughout**: the stored value, the `lang` attribute, the file name of a translation set, the key
in any map. This doctrine does not invent the format; it **defers** to the
[Conventions Doctrine](../../conventions-doctrine.md), which is supreme here. BCP 47 is the
established convention, so every tool that parses a locale — the platform, `Intl`, CLDR, `gettext`,
the HTML `lang` attribute — already understands it. A region-first or underscore dialect (`us_en`)
would be *this family's private spelling of a thing the world already spells*, which is exactly the
deviation the Conventions Doctrine forbids.

**The displayed entry pairs the tag with the autonym** — `en-US — English (US)`, `es-419 — Español
(Latinoamérica)`, `fr-CA — Français (Canada)`. Showing the tag as well as the name is a deliberate
prosumer affordance: a reader who knows tags can pick precisely. But **the tag is authoritative and
the name is the label** — where the two could ever pull apart, correctness and the convention win,
never the display. The tag is never bent to read tidily.

---

## 3. A region variant is an *overlay* on its base, never a re-translation

A regional variant is not a second, independent translation — it is a **diff over a base language**,
exactly the single-inheritance chain of the [Device-Model Doctrine](../../device-model-doctrine.md):
a base locale carries the whole string set, and a variant **inherits** it and **overrides only the
strings that genuinely differ.**

- **The base is the locale the source strings are authored in.** For DeckLibre that is **US English
  (`en-US`)**; `en-GB`, `en-CA`, `en-AU` are overlays that change `color`→`colour` and the handful of
  words that actually differ, inheriting the rest. A variant is *never* a full copy — a copy drifts
  (SMT Doctrine), an overlay cannot.
- **A variant exists only if its overlay is non-empty.** An `en-IE` with nothing to override is not a
  language entry; it falls back to its base and never appears in the picker. This makes "only where
  regions really differ" (§4) a **structural** property, not a matter of discipline: the empty variant
  is unrepresentable.

---

## 4. Split a language by region only where the difference is real — sameness is earned

Two regions are the **same language** until a genuine difference is shown; never split on the
assumption that a different country means a different language. This is the
[SMT Doctrine](../../smt-doctrine.md)'s *sameness is earned on verified difference, not assumed from
resemblance* — applied to language instead of hardware.

**What counts as a real difference** is a difference in the **translated strings themselves** —
spelling (`color`/`colour`), vocabulary (`elevator`/`lift`), idiom, or a term that would mislead a
regional reader. It is **not** date, number, currency, or unit **formatting**: those are locale
*data* (CLDR), applied to every variant of a language alike, and they do not by themselves mint a new
language entry. The test reduces to §3's: *is the region's overlay non-empty?*

> **Ecosystem:** the splits that are real and known. **Spanish** divides at
> `es-419 — Español (Latinoamérica)` vs `es-ES — Español (España)` — Latin-American and Iberian
> Spanish differ enough in vocabulary and usage to earn separate entries (and BCP 47's `419`
> macro-region names "Latin America" exactly, so the split needs no per-country sprawl). **French**
> divides at `fr-FR — Français (France)` vs `fr-CA — Français (Canada)`. What you do **not** do is
> pre-enumerate `es-MX`, `es-AR`, `es-CO`, `fr-BE`, `fr-CH` speculatively: each earns its entry only
> if and when a real overlay is produced for it.

*(The precise catalogue of which regions differ is deliberately left open — it is discovered as
translators produce real overrides, not decreed up front. The doctrine fixes the **mechanism** by
which a real difference reveals itself, so the catalogue can never be wrong, only incomplete.)*

---

## 5. Script and direction travel with the language, not as an afterthought

A language brings its **script** and its **writing direction** with it, and both must survive into
every surface that renders it:

- **Right-to-left** languages (`ar`, `he`, `fa`, `ur`) flip layout, not merely text alignment. The
  picker entry — and the interface once that language is chosen — resolve direction from the language
  (§1), never from a standing assumption that the world reads left-to-right.
- **Formatting is CLDR's job, not the string set's** (§4). Dates, numbers, currency, and units come
  from the locale's data, shared across a language's regional variants; the translated strings never
  hardcode a format they should be asking the locale for.

---

## 6. Checklist

Before shipping a language chooser, and before adding a language or a regional variant:

- [ ] Every entry is written in its **own language** (autonym), never in the current interface
      language, and never transliterated (§0, §1).
- [ ] Every entry carries its **`lang`** tag and resolved **direction**, so assistive tech voices it
      correctly and RTL names lay out correctly (§1).
- [ ] Every language is identified by a **BCP 47** tag, used throughout, per the supreme Conventions
      Doctrine — never a private or region-first spelling (§2).
- [ ] The displayed entry pairs **tag + autonym**; the tag is authoritative, the name is the label
      (§2).
- [ ] A regional variant is an **overlay** over its base locale, overriding only what really differs —
      never a full re-translation (§3).
- [ ] No variant with an **empty overlay** appears; it falls back to its base (§3, §4).
- [ ] A region split is justified by a real **translated-string** difference, not by formatting, which
      is CLDR locale data (§4, §5).
