# Visual Identity

**How to build an application that is visibly of this family.**

The goal is **not** to recreate any particular application's screens. It is that a completely
unrelated tool — a log viewer, a deployment console, a fleet dashboard — should be recognisable
as a sibling.

The test: **if a rule only makes sense when the app has cameras (or logs, or deployments), it is
not part of the identity.** What transfers is the *system*, not the screens.

**Companion artifact:** [`assets/foundation.css`](assets/foundation.css) — the executable half.
Drop it in unchanged. This document is *why*; the CSS is *how*, and it is the single source of
truth for every value. **Do not transcribe the palette into your project.** A value written
twice is a value that will drift.

---

## 1. What is fixed, and what is free

| **FIXED** — this is the identity | **FREE** — this is your app |
|---|---|
| Token names and their meanings | Layout and composition |
| **The five themes** (required baseline — §1a) | Which components you use |
| The accessibility floor (verbatim) | Information design |
| The accessibility **contract** (§1a) | Whether you have personas at all |
| Semantic colour meanings | How many personas, and their names |
| Component grammar (what a chip *is*) | Density beyond the persona defaults |
| The four-axis separation | **Additional** themes, beyond the five |

Adopt the fixed column and your app is a sibling. Compose the free column however your problem
demands — a sibling, not a clone.

---

## 1a. Governance of the palette

**The five themes are required.** They are the baseline, not a menu of suggestions. A project
ships them.

Three different things can happen to that baseline, and they are governed differently:

### Expansion — free

**Adding a theme is not a deviation.** Ship a sixth, a seventh, whatever your users need. Adding
takes nothing away from the baseline: the five are still there, and the family still holds.
No justification required.

### Contraction or replacement — this is deviation

**Removing one of the five, or swapping one out for something else, IS a deviation.** It is
permitted — but only when it is **well reasoned and documented**. Write down *what* was dropped
or replaced, and *why*, where the project's other decisions live.

This is the case that needs ceremony, because it is the one that erodes the shared baseline. A
project that quietly ships three of the five has left the family without saying so.

### Tweaks — generally fine

Adjusting values *within* a theme is ordinary work. Themes are a starting point; a project may
tune them to its content.

### ⚠️ The one hard limit: the accessibility contract

**No tweak to an accessibility-focused theme may break its contract.**

The contract, not the hex codes, is the thing:

- **Maximum contrast** must remain **maximum contrast**. Its entire reason to exist is luminance
  separation far beyond the ordinary minimum. Softening it to taste destroys it — and it
  destroys it for the people who cannot use anything else.
- **Every theme**, tweaked or not, must still pass contrast **across the full matrix** (§8).
  A tweak is not done until it has been *measured*.
- **`forced-colors`** support is not a palette you own and **not subject to deviation.** It is
  an OS mode you honour.
- **The colour-blind modifier is not a theme.** It is a modifier that layers onto any of them.
  It is therefore **not eligible for "contraction"** — you cannot drop it, because there is no
  theme slot for it to occupy.

**Tweak the look. Never tweak the guarantee.**

---

## 2. The four axes

**Name each axis; let each own exactly one concern.** Where two axes set the same property, you
have a bug factory — and the states multiply, so each combination must be independently correct.

| Axis | Owns | Never touches |
|---|---|---|
| **Persona** | vocabulary, density, type scale, **what is present** | colour |
| **Theme** | **colour only** | type, density, presence |
| **Colour-blind safe** | status **hues** only | everything else |
| **`forced-colors`** | the whole palette, when active | — (it wins) |

```html
<html data-persona="intermediate" data-theme="dark" data-cb="on">
```

**Every combination must work.** Advanced-persona in maximum-contrast. Novice in
colour-blind-safe. Maximum-contrast *plus* colour-blind-safe. Audit the full matrix (§8) — not a
spot check.

---

## 3. Personas — an expertise ladder

A persona is **not a skin**. If switching it only changes colours, it is a theme wearing a
costume.

**A persona changes the product:**

- **Vocabulary** — the same underlying value, named for the person reading it.
- **Presence** — what is even *on screen*.
- **Density and type** — a beginner needs room; an expert needs information.
- **Defaults** — including whether "Advanced" starts on.

### The generic ladder

`foundation.css` defines three rungs — **Novice · Intermediate · Advanced** — as a *ladder of
user expertise*. That is the axis. **The names and the count are yours.**

**Three is a common shape, not a rule.** A project might have two, or five. A project whose
users do not stratify by expertise **should not force a ladder** — an empty persona axis is
worse than none, because it produces cargo-cult presets that mean nothing.

### The three questions a persona answers

For each rung, and for every element of your UI:

1. **What is this called?** (vocabulary)
2. **Is it here at all?** (presence)
3. **How much room does it get?** (density)

### Absent ≠ Hidden ≠ Disabled

Three different statements. **Choosing the wrong one lies to the user about their own world.**

| Form | Says | Use when |
|---|---|---|
| **Disabled** | *"This exists, applies to you, and is unavailable right now."* | A temporary state |
| **Hidden** (Advanced reveal) | *"This exists and applies to you; you asked not to see it."* | Power-user machinery |
| **Absent** | *"This is not part of your world."* | The situation cannot arise for this user |

**Absent is the one people get wrong.** If a novice will *never* have the underlying situation,
the control is not a feature they haven't unlocked — **the concept does not exist for them.** A
greyed-out control is an unkindness dressed as a courtesy.

### Worked example — a camera-control service

Rungs named for its users: **Casual · Professional · Studio**.

| | **Casual** (novice) | **Professional** (intermediate) | **Studio** (advanced) |
|---|---|---|---|
| Who | hobbyist, one or two cameras | small studio; paying clients | large rig, many cameras, high stakes |
| Vocabulary | "Lighting", "Background blur" | White balance, Aperture | WB, F, TV |
| Devices shown | 1 | 1 + comparison strip | all, always |
| Ownership/lease state | **absent** | shown | shown, terse |
| Hardware calibration | **absent** | Advanced | always visible |
| Raw protocol codes | **absent** | Advanced | visible |
| Advanced default | off | off | **on** |

*Why "absent":* a hobbyist with one camera has **no second device to contend with for ownership,
and no second body to calibrate against.** Those concepts do not exist in their world.

### Worked example — a different application

The same axis, instantiated for a **deployment console**. Note that nothing about the *ladder*
changed; only what fills it.

| | **Operator** (novice) | **Engineer** (intermediate) | **SRE** (advanced) |
|---|---|---|---|
| Who | triggers a deploy, watches it | owns the service | owns the platform |
| Vocabulary | "Release", "Roll back" | Revision, Rollback | rev, SHA, canary % |
| Environments shown | one (the current) | one + history | all, side by side |
| Raw manifests | **absent** | Advanced | always visible |
| Node-level detail | **absent** | **absent** | visible |
| Advanced default | off | off | **on** |

The mapping is mechanical: *who is this person, what do they call things, what exists in their
world, how dense do they want it.*

### A preset is a starting point, not a cage

Every element of a persona must remain **individually settable**. Someone on the novice rung who
wants exactly one advanced thing must not have to abandon their persona to get it.

---

## 4. Colour

### Colour lives in surfaces, not in dots

> **Colour that appears only in a 7-pixel accent dot is not colour.**

Put your identity in *accent tokens alone* — a status pip, one button — and you have built
several greyscale UIs that differ in a detail nobody notices. Users will say *"they all look the
same,"* and they will be right.

**The band is where the identity lives.** A coloured header surface (`.band`) — plus genuinely
tinted panels. This, more than any accent, is what makes an app recognisable as family.

**When you tint a surface, state its text colour.** Never assume the inherited one still works;
that is exactly how you get light text on a light header.

### Semantic colour means things

| Token | Means |
|---|---|
| `--accent` | authority · live · "this is yours" |
| `--amber` | pending · attention · mismatch |
| `--green` | confirmed · good · settled |
| `--cyan` | **data** — numeric readouts, measurements |
| `--focus` | the focus ring. **Never the same as `--accent`.** |

**Semantic colours are not the accent, and the accent is not decoration.** Keep them distinct or
"this is live" and "this is our brand colour" become indistinguishable.

### Never colour alone

**Every state = colour + shape/icon + text.** Colour-blind users, forced-colors users, and
screen-reader users each rely on a *different one of those three*.

- **Decorative marks MUST be `aria-hidden`**; the **meaning** must live in real text. A CSS
  `::before` glyph leaks into the accessible name, and a screen reader will read the *glyph*.
- **Draw marks; don't type them.** An exotic codepoint depends on font coverage and correct
  encoding, and *will* eventually render as mojibake or a tofu box on a machine you don't
  control. `.mark` is a CSS-drawn triangle: **no codepoint to corrupt, no font to be missing.**

### Data is the interface

Numbers get **monospace + `tabular-nums`** (`.num`, `.readout`). Columns align; a changing value
does not reflow its neighbours. In dark/instrument contexts, data reads in `--cyan` — the
readouts are the point of the screen and should look like it.

---

## 5. Accessibility is several needs, not one checkbox

| Need | Fixes | Mechanism |
|---|---|---|
| Low vision | **luminance** | a **theme** — `maxcontrast` |
| Colour blindness | **hue** | a **modifier** — `data-cb="on"` |
| OS accessibility mode | the whole palette | **honour it** — `forced-colors` |

**Colour-blind-safe is a MODIFIER, not a theme.** Maximum contrast fixes *luminance*;
colour-blind-safe fixes *hue*. **One person can need both.** As a sixth entry in the theme list,
that person would have to **choose which disability to accommodate** — which is not a choice
anyone should be asked to make.

**A shipped high-contrast theme is NOT a substitute for honouring `forced-colors`.** That is
what users who need it actually switch on. When it is active, the OS replaces the palette: stop
painting, keep every boundary a real border, and give anything conveyed by colour a shape or a
label. **Elements painted with `background-color` are flattened and vanish** — the foundation
gives status dots an explicit border for exactly this reason.

**Accessibility palettes are not automatically legible.** Okabe-Ito's orange is a beautifully
distinguishable *hue* and is ~2:1 on white. Hue separation and contrast are different properties;
check both.

---

## 6. The accessibility floor

Users may restyle everything. **They may not break these:** focus visibility, live regions,
semantic structure, minimum hit targets.

Enforced by **construction**, not convention:

```css
@layer floor-hard, tokens, base, components, app, user, floor-soft;
```

> **`!important` INVERTS cascade-layer order.** Normal declarations: the *later* layer wins.
> `!important` declarations: the **earlier** layer wins.
>
> **The naive construction — floor declared last, marked `!important` — is silently broken.** It
> lands at the *bottom* of the important-cascade, and a user stylesheet with `!important`
> defeats every guarantee. **Both halves, or it does not hold.**

- `floor-hard` — **first**, `!important` → beats a user's `!important`
- `floor-soft` — **last**, normal → beats a user's normal rules

**The floor protects capability, not taste.** Total cosmetic freedom — colours, fonts, spacing,
shape. The one thing a user may not do is **make the product unusable for someone else.**

**Ship the attack.** Every such guarantee gets an adversarial test — a stylesheet that genuinely
tries to destroy it — and the test must be **watched to fail against the unprotected version**
before it is trusted. *A guarantee you have not attacked is not a guarantee; it is a claim.*

---

## 7. Type and space are tokens too

Colour is the token people remember. **Type size and density are the ones that matter for
accessibility**, and they are the ones most often left as literals.

Hard-coding `padding: 10px 14px` and `font-size: 13px` means a user who needs 20px text **has no
path**. That is an accessibility gap, not a taste gap.

- `--size` — base type. The persona sets it; **the user must be able to override it.**
- `--density` — **one number** drives all spacing (`--pad`, `--gap` derive from it).
- `--r` — radius. Small radii read as instrument; large radii read as approachable.

**A token redefined on a subtree does nothing unless something in that subtree consumes it.**
Set `color: var(--ink)` on `<body>` and then redefine `--ink` on a child, and the *already
resolved* colour inherits straight past it. The themed container must consume its own tokens.

---

## 8. Verify — and verify the verifier

**Contrast must be measured, never eyeballed.** Your eye is trained on your own palette and will
forgive it.

**Audit the full matrix.** Personas × themes × the colour-blind modifier. Every combination you
ship is a combination someone will use.

**Sweep every text node — not the elements you think are interesting.** *A test that only looks
where you expect the bug not to be is theatre.*

**Check the DOM, not the screenshot.** The accessibility tree is what a screen reader actually
receives. It catches leaked pseudo-element text, mislabelled controls, and muted live regions —
none of which a picture shows.

### ⚠️ The instrument is the most dangerous part

A broken audit does not fail loudly. It reports **confident, specific, entirely fictitious
failures** — and you will "fix" correct code to satisfy it.

Verifying this foundation, the instrument was wrong **three separate times**, each time
producing a plausible catastrophe. **All three failure modes are now in its self-test.** Yours
should be too:

| The instrument must prove | Or it will |
|---|---|
| **21.0 for black on white** | be miscalibrated in a way no test catches |
| **It parses modern colour syntax** | mis-read `color(srgb 0.93 …)` — 0–1 floats taken as 0–255 ints — and report near-white as black |
| **It reads an element's OWN background** | measure a button's text against the *page* instead of the button, because the walk climbed straight past the fill |
| **Transitions are disabled** | **measure mid-fade** — sampling a 120 ms transition at 12 ms reads a colour that belongs to *neither* theme |

That last one is the one nobody expects: **an audit must measure a settled page.** Inject
`* { transition: none !important; animation: none !important; }` before measuring, and assert it
took effect. Otherwise you are auditing an animation frame.

**The rule:** *self-test every failure mode that has ever bitten you, and make the instrument
refuse to run if the self-test fails.* An instrument that cannot measure a known quantity cannot
measure an unknown one.

---

## 9. Adoption checklist

- [ ] `<!doctype html>` — **first line, always.** Without it, quirks mode silently breaks colour
      inheritance in tables.
- [ ] `<meta charset="utf-8">` — the page must be correct **standalone**, not dependent on a
      server declaring the charset.
- [ ] `foundation.css` dropped in **unchanged**. Extend in `@layer app`, never by editing it.
- [ ] Axes set on `<html>`: `data-persona`, `data-theme`, `data-cb`.
- [ ] A **theme picker** — five themes in **one menu**; the accessibility theme is not shunted
      into a separate "accessibility mode".
- [ ] A **colour-blind toggle**, separate from the theme picker.
- [ ] Persona rungs defined for **your** users, or **no persona axis at all**.
- [ ] Every state = colour **+ shape + text**; decorative marks `aria-hidden`.
- [ ] Live-region announcements **queued**, not clobbered.
- [ ] Every derived status readout has an explicit **not-applicable** state — *say nothing rather
      than something false.*
- [ ] Contrast audited across the **full matrix**, with a **self-tested instrument**.
- [ ] The floor **attacked** with a hostile stylesheet, and it held.
