# UI/UX Design Doctrine

**Scope: cross-project.** Every principle here is stated to be portable. Every *example* is
drawn from CameraConductor, because a rule without a worked example is a slogan.

Written after building — and repeatedly breaking — a themeable, persona-driven, accessible
control UI. Most of these rules exist because a specific, expensive mistake was made. Those
mistakes are named, because the mistake is the argument.

**Companion:** [Decision Doctrine](decision-doctrine.md) — how to decide *what* to build.
Several rules here descend from it: ordered values resolve the Accessibility-vs-Choice conflict
that produces the accessibility floor (§6); "if it has a defensible alternative, it's a setting"
is why themes, density and personas are all user choices rather than opinions.

---

## 0. The load-bearing rule

> **A guarantee you have not attacked is not a guarantee. It is a claim.**

Everything below descends from this. Accessibility floors, contrast, invariants, "the theme
works" — none of it is true until something *tried to break it and failed*. Assertion is not
verification, and the most dangerous defects are the ones your own test was structurally
incapable of seeing.

---

## 1. Separate the axes, or drown in combinations

A UI that must serve different people, in different rooms, with different bodies, has more
than one variable. **Name each axis, and let each own exactly one concern.** Where two axes
set the same property, you have a bug factory.

| Axis | Owns | Never touches |
|---|---|---|
| **Persona** | vocabulary, density, type scale, **what is on screen** | colour |
| **Theme** | **colour only** | type, density, presence |
| **Accessibility modifiers** | one narrow correction each | everything else |
| **OS/platform modes** | the whole palette, when active | — (it wins) |

**Why it matters:** the axes multiply. Three personas × five themes × a colour-blind toggle is
thirty states, and **each one must be independently correct**. If a persona also sets colour,
you cannot reason about any of them.

> **CameraConductor:** *Persona* is Casual / Professional / Studio — who you are (a hobbyist
> with one camera; a small studio doing weddings; a big rig with four bodies across two
> Raspberry Pis). *Theme* is Daylight / Studio dark / Warm / Print / Maximum contrast — what
> the room is like. **Studio-in-Maximum-contrast must work. Casual-in-colour-blind-safe must
> work.** They are orthogonal because they own disjoint token sets: the persona sets `--size`,
> `--density`, `--r`; the theme sets `--ink`, `--panel`, `--accent`.
>
> The first version had personas setting colour *and* type. It was untestable, and the themes
> and personas fought over the same tokens. Splitting them was the fix.

---

## 2. Personas change the product, not the paint

A persona is **not a skin**. If switching it only changes colours, it is a theme wearing a
costume, and users will notice the promise was empty.

A persona should be able to change:

- **Vocabulary** — the same underlying value, named for the person reading it.
- **Presence** — what is even *on screen*. Not "hidden behind Advanced" — **absent**.
- **Density and type** — a beginner needs room; an expert needs information.
- **Defaults** — including whether "Advanced" starts on.

**"Absent" and "hidden" are different, and the difference is respect.** Hiding a feature says
*"this exists and you're not ready."* Removing it says *"this isn't part of your world."* For a
person who will never have the underlying situation, removal is the honest choice.

> **CameraConductor:**
>
> | | Casual | Professional | Studio |
> |---|---|---|---|
> | Words | "Background blur", "Warmth" | Aperture, Colour temp | F, K |
> | Multi-camera strip | **absent** | shown | shown |
> | Lease / ownership chip | **absent** | shown | shown, terse |
> | Calibration offsets | **absent** | behind Advanced | always visible |
> | Raw protocol codes | **absent** | behind Advanced | visible |
> | Advanced default | off | off | **on** |
>
> A hobbyist with one camera has no second camera to compete for a *lease*, and no second body
> to *calibrate against*. Those aren't features they haven't unlocked — **they are concepts
> that do not exist in their world.** Showing a greyed-out "lease" control would be an
> unkindness, not a courtesy.
>
> Crucially, all of this rides the **same layout, same controls, same API**. The vocabulary map
> is presentation-only: "Lighting" and "White balance" are the *same canonical key on the
> wire*. **The service does not know personas exist.**

**A preset is a starting point, not a cage.** Every element of it must remain individually
settable. A hobbyist who wants exactly one advanced thing must not have to abandon their
persona to get it.

---

## 3. Colour lives in surfaces, not in dots

> **Colour that appears only in a 7-pixel dot is not colour.**

If you put your identity in *accent tokens* — a status pip, one button, a chip — and leave the
panels white, you have built three greyscale UIs that differ in a detail nobody sees. The user
will say *"they all look the same,"* and they will be right.

Identity lives in **surfaces**: header bands, panel fills, grounds.

> **CameraConductor:** the first pass gave each persona an accent hue and called it a colour
> identity. The user's response: *"They do not look all that different."* Inspecting the code
> showed why — Casual's "cream" panel was `#FFFDFB`, which is **white**. Professional's was
> `#FFFFFF`, which is **also white**. **The comment said cream; the code said white.**
>
> The fix was a coloured **header band** and genuinely tinted panels: terracotta-on-cream for
> Casual, deep navy for Professional, red-black with cyan data readouts for Studio.

**Corollary — when you tint a surface, state its text colour.** Do not assume the inherited
one still works.

> **CameraConductor:** tinting a panel header and letting its text inherit `--band-ink` (chosen
> for a *dark* band) produced **light text on a light header — 1.2:1, invisible**. A tinted
> surface must declare its own foreground.

---

## 4. Colour is signal or it is noise

In a status-bearing UI, colour is **information**, and information must be redundant.

- **Never colour alone.** Every state carries **colour + shape/icon + text**.
- **Announce state changes**, don't just repaint them.
- Decorative marks must be `aria-hidden`; the *meaning* must live in real text.

> **CameraConductor:** a mismatched camera reads `⚠ 1/160` visually, and announces
> **"1/160, differs from Key"** to a screen reader. The triangle is `aria-hidden`; the words
> carry the meaning.
>
> This was got wrong first: the warning glyph and status pip were CSS `::before` content, which
> leaked into the accessible name — a screen reader would say *"warning-sign one-slash-one-
> sixty"* and *"dot Confirmed."* **Decorative content injected via CSS must never carry
> meaning.**

**Draw marks; don't type them.** An exotic glyph (`⚠︎`, U+26A0 + variation selector) depends on
font coverage and correct encoding — and it will eventually render as mojibake or a tofu box.

> **CameraConductor:** replaced with a CSS-drawn triangle. **No codepoint means nothing to
> corrupt, and no font to be missing** — which matters on a Raspberry Pi browser you don't
> control.

---

## 5. Accessibility is several different needs, not one checkbox

"High contrast" is not one thing, and conflating the needs makes the accommodation decorative.

| Need | Fixes | Correct mechanism |
|---|---|---|
| Low vision | **luminance** | a **theme** (ship a maximum-contrast one) |
| Colour blindness | **hue** | a **modifier** (a toggle, layered on any theme) |
| OS accessibility mode | the whole palette | **honour it**; get out of the way |

**Colour-blind-safe must be a modifier, not a theme.** It fixes *hue*; maximum-contrast fixes
*luminance*. **One person can need both.** If colour-blind-safe is just another entry in the
theme list, that person must **choose which disability to accommodate.** That is not a choice
anyone should be asked to make.

> **CameraConductor:** the status model is green = confirmed, amber = pending, red = live —
> **precisely the palette ~8% of men cannot separate.** The colour-blind modifier remaps only
> those hues (Okabe-Ito: blue / orange / vermilion) *on top of whichever theme is selected*, so
> maximum-contrast **plus** colour-blind-safe is a valid, working combination.

**A shipped high-contrast theme is not a substitute for honouring the OS mode.** When a user
turns on Windows/macOS High Contrast, the system replaces the palette. Your job is to *stop
fighting it*: stop painting backgrounds, keep every boundary a real border, and make sure
anything conveyed by colour also has a shape or a label.

> **CameraConductor:** under `forced-colors: active`, status dots painted with
> `background-color` are flattened by the OS and **vanish entirely** — so they are given an
> explicit `1px solid CanvasText` border. Without that, the entire status system silently
> disappears for the users who most need it.

**Palettes chosen for hue separation are not automatically legible.** Okabe-Ito's orange
(`#E69F00`) is a beautiful, distinguishable hue — and it is **~2:1 on white**. Accessibility
palettes must be re-checked for *contrast* on each ground.

---

## 6. The accessibility floor: make it structural, not polite

Some guarantees must survive **any** user restyle: focus visibility, live regions, minimum hit
targets, screen-reader-only text. These cannot be a convention — they must be **unbreakable by
construction**.

**In CSS, use cascade layers — and know that `!important` inverts them.**

- Normal declarations: the **later** layer wins.
- `!important` declarations: the **earlier** layer wins.

The inversion is deliberate (it exists so page authors cannot stomp a *user's* accessibility
overrides), and it makes the obvious construction **backwards and silently broken**.

```css
/* WRONG — and it fails silently. */
@layer tokens, theme, user, floor;      /* floor last... */
@layer floor { *:focus-visible { outline: 3px solid !important; } }   /* ...and !important */
/* → the floor lands at the BOTTOM of the important-cascade.
     A user stylesheet with !important defeats every guarantee. */

/* RIGHT — two halves, or it does not hold. */
@layer floor-hard, tokens, base, theme, user, floor-soft;

@layer floor-hard {          /* FIRST + !important → beats a user's !important */
  :where(a,button,input,select,summary,[tabindex]):focus-visible {
    outline: 3px solid var(--focus) !important; outline-offset: 2px !important;
  }
  [aria-live] { display: block !important; visibility: visible !important; }
  button, select { min-height: 24px !important; }
}
@layer floor-soft {          /* LAST + normal → beats a user's normal rules */
  :where(a,button,input,select,summary,[tabindex]):focus-visible {
    outline: 3px solid var(--focus); outline-offset: 2px;
  }
}
```

> **CameraConductor:** the first floor was declared last, marked `!important`, and asserted to
> be unbreakable "by construction." **A hostile stylesheet defeated every single guarantee** —
> focus rings removed, live region muted (silencing the screen reader entirely), buttons shrunk
> to 2px, screen-reader text hidden. **The floor was defeated by the very thing added to make
> it strong.** It was only caught because it was *attacked before being believed*.

**Ship the attack.** Every such guarantee gets an adversarial test — a stylesheet that
genuinely tries to destroy it — and the test must be **watched to fail against the unprotected
version** before it is trusted.

**The floor protects capability, not taste.** Users get total cosmetic freedom — colours,
radii, fonts, spacing. The one thing they may not do is make the product **unusable for someone
else**.

---

## 7. Everything is a token — especially the ones you'd rather hard-code

Colour is the token people remember. **Type size and density are the ones that matter for
accessibility**, and they are the ones most often left as literals.

```css
:root {
  --size: 14px;                       /* base type — a user setting */
  --density: 1;                       /* spacing multiplier — a user setting */
  --pad: calc(10px * var(--density));
  --gap: calc(8px  * var(--density));
  --r: 3px;
}
```

> **CameraConductor:** asked *"is the UI fully CSS-configurable?"*, the honest answer was **no**
> — colours were tokenised, but padding was written as `10px 14px` and font sizes as `13px`.
> **That is an accessibility gap, not a taste gap:** a user who needs 20px text or a denser
> layout had *no path*. Hard-coding those numbers quietly excludes people.

**A token redefined on a subtree does nothing unless something in that subtree consumes it.**

> **CameraConductor:** `color: var(--ink)` was set on `<body>`; the persona classes sat on a
> *child*. They redefined `--ink` — and the already-resolved `color` inherited straight past
> them. **Near-black text on a near-black panel.** The container must consume its own tokens.

---

## 8. Verify with instruments — and verify the instruments

**Contrast must be measured, never eyeballed.** Your eye is trained on your own palette and
will forgive it.

But the harder lesson:

> **A test that only looks where you expect the bug not to be is theatre.**

> **CameraConductor, twice:**
>
> 1. A contrast audit reported *"all pass, 70 samples"* — because it only sampled **inside the
>    panels I had built**. The broken summary table wasn't in the selector, so *as far as the
>    test was concerned it did not exist.* The user saw it instantly. The audit now sweeps
>    **every text node on the page**.
>
> 2. A later audit reported **18 of 30 theme combinations failing at 1.2:1**. They were not
>    failing. The `bgOf()` walk returned `color(srgb 0.936 0.943 0.951)` — modern colour syntax
>    from `color-mix()` — and the parser read those **0–1 floats as 0–255 integers**, computing
>    "black" for a near-white background. **The instrument was lying, and I nearly rewrote
>    correct CSS to satisfy it.**
>
>    The fix: paint the colour onto a 1×1 canvas and read the pixel back — the *browser* does
>    the conversion, so no syntax can fool it. **And give the instrument a self-test:**
>    black-on-white must return exactly 21.0. If your measuring device can't measure a known
>    quantity, it cannot measure an unknown one.

**Audit the full matrix, not a spot check.** Personas × themes × modifiers. Every combination
you ship is a combination someone will use.

**Check the DOM, not the screenshot.** The accessibility tree is what a screen reader actually
receives — it is the ground truth, and it catches things no picture can (leaked pseudo-element
text, mislabelled controls, muted live regions).

---

## 9. Announce state, and don't clobber the announcement

A live region is **a speaker, not a log**. It has a speaking rate.

> **CameraConductor:** writing a second message into `aria-live` before the first was spoken
> meant a screen-reader user who changed two properties quickly heard **only the last one, or
> nothing at all**. And rapid bursts are *routine* here — a burst of property changes is the
> normal case, which is why the system already coalesces them. Announcements are now **queued**,
> each given time to land.

**Say nothing rather than something false.** Every derived status readout needs an explicit
*not-applicable* state, designed in — not discovered.

> **CameraConductor:** a "2 of 2 matched" chip kept displaying its count **after the camera was
> detached from the thing it was matching against.** Nothing was being matched; the number was
> meaningless, and it read as *reassuring*. The value states were obvious; the **null state was
> forgotten.** Now it is hidden.

---

## 10. Render initial state through the same path as every update

Hand-authored initial markup that duplicates what a renderer produces will drift from it —
usually immediately.

> **CameraConductor:** the initial "following" state was hand-written in HTML *and* produced by
> a `setPropState()` function. They disagreed about a button attribute, so **the very first
> interaction failed.** If a renderer exists, the page must **start by calling it**, not by
> mocking its output.

---

## 11. Demonstrate on the real product, never on a fresh invention

If you build a mockup to show a variation — a theme, a persona, a mode — **build it on the
actual layout.** A demo that invents its own simplified UI demonstrates nothing about the
product, and it will look wrong precisely *because it is not the thing*.

> **CameraConductor:** to show three personas, I abandoned the approved layout and invented
> three small cards. The user's response was immediate: *"WTF happened. I thought you were going
> to use cues from the original layout."* They were right — the page wasn't *"the product, as
> three personas."* **It was three mockups of something that does not exist.** Everything was
> rebuilt on the real UI, and the personas became obviously, visibly meaningful.

---

## 12. Baseline checklist

Before shipping any themeable, configurable UI:

- [ ] `<!doctype html>` — **first line, always.** (Without it, quirks mode silently breaks
      colour inheritance in tables. This produced a **1.01:1 — literally invisible** — theme,
      with every token correct.)
- [ ] `<meta charset="utf-8">` — the page must be correct **standalone**, not dependent on the
      server declaring a charset.
- [ ] Axes separated; no two set the same token.
- [ ] Type size and density are **tokens**, not literals.
- [ ] Accessibility floor built with **two** cascade layers, and **attacked**.
- [ ] Contrast audited **across the full matrix**, with a **self-tested instrument**.
- [ ] `forced-colors` honoured; colour-carrying elements given borders.
- [ ] Colour-blind modifier available **on top of** any theme.
- [ ] Every state = colour **+ shape + text**; decorative marks `aria-hidden`.
- [ ] Live-region announcements **queued**.
- [ ] Every derived status has a **not-applicable** state.
- [ ] Initial state **rendered**, not hand-authored.
- [ ] Wide content scrolls (`overflow-x: auto`) rather than clipping.
- [ ] Focus visible on **everything**; nothing reachable by mouse only.
