# DRAFT — addition to `naming-shape-doctrine.md`: generic default names as a provenance signal

**Status: draft for owner promotion.** This file proposes a new section (§7) and two
checklist items for the sealed `naming-shape-doctrine.md`. It is written to slot into
that doctrine's voice (principle defines; example only illustrates). The owner promotes
by copying §7 in and appending the checklist items, then removing this draft.

**Why it belongs in naming-shape:** that doctrine's thesis is *a name is a communication
channel — spend its shape deliberately.* §§0–2 cover what a name's **casing/shape**
signals (field vs value, closed vs open). This adds what a **default name's content**
signals: whether a human has named the thing yet. Same channel, different bit.

**Origin:** LiteController. Auto-provisioned lights/meshes were briefly given
friendly-looking names (`key`, `fill`, `stage`) as defaults/examples. The owner: *"The
reason these are the default names and not `stage`, `key`, `fill` is so that they are
not confused by users as lights that are already named. These generic names ENSURE there
is [no] confusion… this should be a naming doctrine."*

---

## Proposed new section

### 7. A default name must announce that it is a default

> **An auto-assigned default name is a signal, not a placeholder to make pretty. Its job
> is to tell the user "no one has named this yet." A default that looks like a name
> someone chose destroys that signal.**

When a system auto-creates a thing — a discovered device, a new mesh, an untitled
document, a generated key — it must give it a name, and it is tempting to make that name
*friendly*: `key`, `stage`, `Fill Light`. Resist it. A friendly default is
**indistinguishable from a deliberate name**, and the user's first question about any
name is the same as the closed-vs-open question in §2, one level up:

> **"Did I (or someone) name this, or is it still waiting to be named?"**

A **generic, mechanical** default — `<manufacturer>_<kind>_<N>`: `nanlite_light_1`,
`mesh_1`, `Untitled-3`, `wg0` — answers that by looking. It reads as *provisional*
precisely because no human would choose it. A **plausible** default —
`key`/`fill`/`stage` — reads as *chosen*, and now the user cannot tell an un-named thing
from a named one, cannot tell which items still need attention, and may leave a
misleading name in place because it looked intentional.

So the rule inverts the usual instinct: for a **default**, generic is not lazy — it is
the honest signal. Effort spent making a default *friendly* spends it in the wrong
direction, buying confusion.

> **LiteController (illustrative, not definitional).** Provisioned lights default to
> `<mfgr>_light_N` (`nanlite_light_1`, `nanlite_light_2`) and meshes to `mesh_N`
> (`mesh_1`, `mesh_2`). The names are deliberately mechanical so a user scanning
> `litectl lights` sees at a glance which fixtures are still on their auto-name and which
> they have deliberately renamed. When friendly-looking defaults (`key`, `fill`, `stage`)
> slipped into the code and docs, they read as real names — the exact confusion the
> generic scheme exists to prevent.

Two obligations come with this:

- **The default must be trivially replaceable.** A generic default is only honest if the
  user can name the thing the moment they want to — renaming must be a first-class,
  easy operation (`rename <old> <new>`), and renaming a container updates the things that
  reference it. A default the user cannot change is not a signal, it is a life sentence.
- **The generic scheme is also the scheme in your examples and tests.** Documentation and
  fixtures must use the mechanical form (`nanlite_light_1`), never invented friendly names
  — a doc example named `key` teaches the user that friendly names are what the system
  produces, re-introducing the confusion in the one place they go to learn.

The distinction from §1's identifiers row (`kebab-case` = "a name someone chose"): that
row is about names a human **did** choose. This section is about the names the system
assigns **before** a human chooses — and they must not impersonate the former.

---

## Proposed checklist additions (append to §6)

- [ ] **Auto-assigned default names are generic and mechanical** (`<mfgr>_<kind>_<N>`,
      `Untitled-N`), so a user can tell at a glance what has **not** yet been named. No
      friendly/plausible defaults (`key`, `stage`) that impersonate a chosen name.
- [ ] **Defaults are trivially renameable** (rename is first-class; renaming a container
      repoints its members), and **examples/tests use the generic scheme**, never invented
      friendly names.
