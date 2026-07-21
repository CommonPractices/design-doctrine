# Identity-Mark Doctrine

**How every organization and every repository in the family gets a profile image, and what
that image must be.**

This governs the small square **identity marks** — the avatars GitHub shows for an org and for
a repo. It is a sibling to [`visual-identity.md`](visual-identity.md), not a part of it:
visual-identity governs how an *application's UI* is built (themes, tokens, personas,
accessibility); this governs the *brand marks* that stand in for an org or repo. Two different
concerns, two different homes. On any overlap, the North Stars are shared —
**accessibility first** — but the rules below are specific to marks.

---

## 1. The rule

**Every organization and every repository has a deliberate profile image. A default
identicon is an unfinished repo.**

An org or repo left on GitHub's generated identicon is the first thing a visitor sees, and it
silently says "nobody is home." A mark is not decoration; it is the front door.

---

## 2. What a mark is

A mark is **one recognizable object, drawn white on a solid field**, that reads at avatar size.

| Property | Rule |
|---|---|
| **Form** | A single **literal object** grounded in what the thing *is* — a key grid for a deck controller, an aperture for a camera service, a clock+chip for an RTC library. Not an abstract squiggle, not a monogram, not a metaphor that needs explaining. |
| **Foreground** | **White** (`#FFFFFF`) only. High contrast against the field, no second colour. |
| **Field (background)** | A **flat, solid** colour. No gradients on generated marks (a genuine app icon that already ships a gradient is the exception — §5). |
| **Format** | **512×512 PNG**, **full-bleed hard square** — no `rx`, no clip, no pre-rounding of any kind (GitHub applies its own display rounding; pre-rounding double-clips the corners). Every family mark on disk is a plain 512 square — match that; do not model or pre-empt GitHub's display shape. Plus an **SVG source** where the mark was authored as vector. |
| **Legibility floor** | **Must read at 40 px.** That is the size GitHub actually displays. Few elements, thick strokes, no fine detail. A mark that only works at 512 is a failed mark. |

**Accessibility is the reason for every one of these.** White-on-solid is maximum luminance
separation; a single object survives shrinking; colour is never the only signal because the
*shape* differs per mark.

---

## 3. Colour: the field encodes belonging

- **Each organization owns one field colour.** Its org mark and **every repo mark inside it**
  use that same colour. The field is what makes a repo visibly part of its org.
- A repo mark differs from its org mark and its siblings **by its object, not its colour.** Same
  field, different glyph.
- The org colour is a fixed fact for that org; record it where the org's decisions live and
  reference it — never re-pick it per repo.
- **Keep a maintained org-colour registry — do not reverse-engineer it from the marks.** The set
  of "which org owns which colour" is itself a fact with one home (the org decision record, e.g.
  the topology memory), listed explicitly. If the only place the colours live is inside the
  committed `avatar.svg` files, then picking a *new* org's colour means reading every existing
  mark to avoid a collision — and the collision the whole rule exists to prevent slips through the
  first time someone skips that read. The registry is the list; the marks are its application, not
  its source of truth. *(This was learned the expensive way: the registry existed only implicitly
  in the marks, and a near-colliding colour was nearly chosen before the six taken hues were
  reverse-engineered out of the SVGs.)*

> A visitor should be able to tell, from the colour alone, which org a repo belongs to — and
> from the glyph, which repo it is.

---

## 4. Where a mark lives

Two locations, both required, because GitHub's avatar itself is not version-controllable (§6):

- **Org mark** → the org's `.github` repo at **`profile/avatar.png`** (+ `avatar.svg` source).
- **Repo mark** → the repo itself at **`assets/icon/avatar.svg`** + **`assets/icon/avatar.png`**.

The mark lives *with the thing it identifies*. A repo carries its own mark in its own tree, so
the source is where the code is — not stranded in a central asset repo.

---

## 5. Ground the mark in the real thing — and reuse a real icon when one exists

- **Design from the source, not the summary.** Read the repo's actual README/manifest/code
  before drawing. A stale one-line description produces a wrong mark. (Design a mark for a repo
  you called a "skeleton" that is actually a shipping product, and the mark lies.)
- **Research the GLYPH GEOMETRY — don't hand-author the shape from imagination.** Getting the
  *subject* right (a satellite dish) is not the same as getting the *shape* right; a
  hand-invented "dish" came out reading as a stick figure. Before drawing an object, study how a
  professional icon set already draws it (the family keeps a large on-disk glyph corpus for
  exactly this), and adapt that geometry rather than guessing at arcs and strokes. And **verify
  the render at 40 px before proposing it** — render it, look at it small; a shape that reads at
  512 but collapses into "a wand" or "goggles" or "a pie chart" at 40 px has failed the
  legibility floor (§2), and only rendering catches it. *(Learned the expensive way: four
  hand-drawn glyphs read as the wrong object at 40 px before the real icon geometry was used.)*
- **If the thing already has a real, designed icon, use it — do not invent a duplicate.** A
  native app that ships an app icon *is* its identity; its avatar is that icon, not a
  hand-drawn stand-in. When an existing icon's own background differs from the org field
  (e.g. an app icon on its own gradient), **keep the real icon's background** — forcing the org
  colour onto someone's finished icon is worse than the field-consistency it buys. Flag the
  exception; don't silently override.
- **A shared idiom gets a shared glyph.** Where the same kind of repo recurs (a Homebrew tap,
  say), the glyph is reused across every instance rather than re-invented.

---

## 6. Applying a mark is manual — there is no API

**GitHub has no API to set an organization's or a repository's avatar.** Not REST, not GraphQL,
not `gh`. The `PATCH /orgs/{org}` endpoint silently ignores an avatar field; there is no avatar
write route at all. The only paths are:

- **UI upload** — Settings → Profile picture, by hand, per org and per repo.
- **(Orgs only) Gravatar** — GitHub renders the Gravatar of the email in the org's *Gravatar
  email* field. This is automatable on the Gravatar side but still requires a manual per-org
  email entry in GitHub's UI, and buys nothing for marks that must differ per org. **Not worth
  it** — upload directly.

**Therefore the committed `avatar.png` is the source of record, and uploading it is a separate,
manual step.** Committing the file does *not* change what GitHub shows. Do not report a mark as
"applied" when only the file was committed — say the file is in place and the upload is pending.

---

## 7. Keep the mark current

A repo **added / renamed / retired** takes its mark with it, in the same change set that touches
the repo — same discipline as keeping the org README current
([`README`-currency rule in the family CLAUDE]). A repo whose purpose changes enough that
its object no longer fits gets a new mark; don't leave a clock on a repo that stopped being about
time.

---

## 8. Checklist

- [ ] Org has a mark; **every repo** in it has a mark. No identicons.
- [ ] Foreground is white; field is the **org's** flat colour.
- [ ] The object is literal and grounded in the repo's real purpose (read the source).
- [ ] An existing real icon was reused rather than duplicated (background exception flagged).
- [ ] **Verified legible at 40 px**, not just 512.
- [ ] `avatar.png` (512, full-bleed, unrounded) **+** `avatar.svg` source committed to the
      required location (§4).
- [ ] Understood that committing ≠ applying; the UI upload is a tracked, still-pending step.
