# User-Documentation Doctrine

**Scope: cross-project.** How to write and publish documentation **for the people who
use the product** — as opposed to where any document lives on disk (that is the
[Documentation Doctrine](documentation-doctrine.md)) or how the decision record
stays trustworthy. This doctrine is about the reader who has the tool in front of them
and needs to make it work.

As with the rest: principles portable, examples concrete. Each rule below exists
because leaving it unwritten produced a real gap — a doc that assumed knowledge the
reader didn't have, drifted from the code, or lived in one place when the reader
looked in another.

**Cross-references.** Composes with the [Documentation Doctrine](documentation-doctrine.md)
(where docs live: `docs/` approved vs `docs/_working/` drafts; live runtime docs stay
in the tree) and the [Spec-Promotion Doctrine](spec-promotion-doctrine.md)
(owner-gated promotion). It does **not** restate them.

---

## 1. Write for zero prior experience

**Assume the reader has never used this tool, this platform, or this problem domain.**

Not "assume they're a beginner" as a tone — assume it as a *fact about their
knowledge*. Do not say "configure X" without saying how. Do not say "the usual place"
without the path. Do not assume the reader knows a term of art the product introduced
three commands ago; define it once, in place.

The tell that you violated this: an instruction that only works if the reader already
knew the answer. "Set the authentication key" is not an instruction — "run
`export NANLITE_TEA_KEY_FILE=/path/to/key`, in each terminal, before any command that
touches a light" is.

> **Worked example (LiteController `MANUAL.md`).** The manual opens by stating the
> hardware needed, the one environment variable that must be set and *when*, and how
> to run the binary if it isn't installed — before a single feature is described. A
> reader with no context can follow it from a cold start.

## 2. Two audiences, two shapes, one source of truth

A product usually needs documentation in **two shapes**, because people arrive two ways:

- **A reference** — complete, every command and option, authoritative. The reader who
  knows what they want and needs the exact syntax. Lives **in the repository** as a
  runtime doc (`MANUAL.md`), version-controlled and reviewed with the code.
- **A guide** — task-oriented, friendly, browsed page-by-page. The reader who knows
  what they want to *accomplish* but not which command does it. Often a **wiki**.

**These are two presentations of the same facts, not two facts.** Name one as the
**source of truth** (the reference) and make the guide defer to it explicitly. When
they disagree, the reference wins and the guide is corrected — never the reverse.
Two independent copies silently drift; a named authority makes drift a fixable bug
instead of an ambiguity.

> **Worked example.** LiteController's `docs/wiki/` pages each carry: *"the full,
> always-current reference is `MANUAL.md`; where these ever disagree, the MANUAL is
> authoritative."* The wiki is a different **shape** (Home / Getting-Started /
> per-task pages) but never a different **claim**.

## 3. A wiki is source-controlled like anything else

**Do not hand-author documentation only in a web UI.** A GitHub wiki is itself a git
repository (`<repo>.wiki.git`); treat its content as source:

- Keep the wiki pages **in the main repository** (e.g. `docs/wiki/`) so they are
  version-controlled, diffable, and reviewed in the same pull request as the code that
  changed their behaviour.
- **Publishing is a sync step**, not the authoring step: copy the tracked files into
  the wiki repo and push. The tracked copy is the source; the published wiki is an
  artifact of it.
- Structure the tracked files exactly as the wiki expects (`Home.md`, `_Sidebar.md`,
  `Title-With-Hyphens.md`, inter-page links without `.md`) so the sync is a copy, not
  a translation.

Why: a wiki edited only in the browser has no review, no diff, no history tied to the
code, and no way to tell whether it still matches the tool. In-repo-first fixes all
four.

## 4. Author-now, publish-when-you-can are separable

Publishing may be **blocked** — no remote yet, a security hold on the history, an
unreleased feature. That is not a reason to defer *writing*. Write the documentation
into the repository now (it ships value to anyone reading the source), and record
**what gate blocks publishing and what clears it**.

> **Worked example.** LiteController has no git remote (its history contains live keys
> that must be rotated first). The wiki source is written and committed today; a
> `docs/wiki/README.md` records that publishing waits on a clean remote and gives the
> exact sync commands for when it exists. The block is documented, not silently
> honoured.

Never let "we can't publish yet" become "so we didn't write it." The writing is the
work; publishing is a later, mechanical step.

## 5. Documentation is current with the release — a doc lag is a defect

**User documentation must describe the product as it actually is at the current
release.** A command that changed, an option added, a default flipped — the docs
change *in the same change set*, not "later." Stale user documentation is not a
lesser problem than a stale spec; it is the first thing a user sees, and it fails
silently (nothing errors, nothing warns).

Two concrete obligations:

- **Verify docs against the artifact, not memory.** Before committing user docs,
  check the documented commands/options against the built tool (its `--help`, its
  actual flags). Documenting from recollection is how a `--flag` that was renamed
  outlives the rename in the docs.
- **A stale runtime doc blocks nothing mechanically, so make it block *you*.** Fold
  the doc update into the same task as the behaviour change; a PR that changes a
  command and not its manual entry is incomplete.

> This mirrors the org-README currency rule (a stale front page is a defect the moment
> the repo changes) and the manual-current-with-release rule — the same standard,
> applied to the user's-eye documentation.

## 6. Be honest about status and limitations

User documentation states **what the tool does today**, including the parts that are
not built and the sharp edges. A doc that describes an aspirational product misleads
the reader the moment they try the missing piece.

- Mark the **status** plainly where it matters ("this flag is required until the
  daemon exists"; "the background service is not built yet").
- Document the **honest limitation**, not a rosy version of it. If the hardware never
  confirms a command, the docs say "commanded means *sent*, not *changed* — confirm by
  looking," rather than implying the tool knows the light's state.

A confident doc that over-promises is worse than a modest one that is accurate —
the same UX-over-accuracy-over-nothing ordering that governs the product itself.

---

## Checklist

A user-documentation change is done when:

1. It reads correctly for someone with **no prior experience** (§1) — no step assumes
   the answer.
2. Reference and guide agree, with the reference named as **source of truth** (§2).
3. Wiki content is **in the repo**, structured for a copy-sync publish (§3).
4. If publishing is blocked, the **gate and its release condition are recorded** (§4).
5. Every documented command/option is **verified against the built artifact** (§5).
6. **Status and limitations are stated honestly** (§6).
