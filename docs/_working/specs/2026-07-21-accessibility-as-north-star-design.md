# Accessibility as a stated value — per-modality (draft)

**Status:** DRAFT for owner review. Not sealed. Proposes edits to two sealed doctrines
(`north-stars-doctrine.md`, `terminology-migration-doctrine.md`); neither is edited by this draft.

**Date:** 2026-07-21

---

## 1. The problem

Accessibility is treated as near-axiomatic family-wide, but it is **defined only as machinery and
never stated as a value**. Every home for it is a *rendering* doctrine:

| Where a11y lives today | What it defines |
|---|---|
| `ui-ux-design-doctrine.md` §6 | the two-layer floor; `!important` inverts cascade layers |
| `visual-identity.md` §6, §1a | the floor verbatim; the accessibility *contract* |
| `language-selection-doctrine.md` | autonyms, `lang`/`dir` tagging — "accessibility first" |
| `web-ui-doctrine.md` §2.1 | a swapped stylesheet cannot break the floor |
| `north-stars-doctrine.md` §4 | *a parenthetical aside inside a worked example* |

Two consequences:

1. **The value is unstated.** The only value-shaped claim in the North Stars doctrine is the §4
   parenthetical *"the accessibility floor still ships — it is a family requirement"* — an aside
   inside an example, and §4 says examples **illustrate, never define**. This is the same
   "real framework with no designated home" failure the North Stars doctrine itself was written to
   fix, recurring one level down.
2. **The floor reads visual-only.** Because every home is a rendering doctrine, a11y presents as
   contrast ratios and screen readers. **Language** — identifiers, flag names, error strings, docs,
   UI copy — is nowhere covered, which is why non-inclusive terms (`whitelist`/`blacklist`) pass
   unchallenged.

---

## 2. The governing principle

> **Accessibility is non-negotiable in every modality the product actually has. A modality the
> product does not have generates no obligation — it is moot, not waived.**
>
> What varies between projects is their **modality surface**, never whether accessibility is a value.

**Worked case (owner's).** A CLI tool has no colour theme, so "high-contrast theme" is a **moot
point** — the CLI is not thereby inaccessible. The same CLI still owes a11y in the modalities it
*does* have: no meaning encoded in colour alone, no structure conveyed only by box-drawing
alignment, screen-reader-sane output, and inclusive language.

**Language is a modality every project has.** Flag names, identifiers, error strings, docs, UI copy.
This is what gives the inclusive-language rule universal reach.

### 2.1 Why not the alternatives

| Rejected | Why |
|---|---|
| Mandate a **ranked a11y star** in every project | Fails §1.3's reality test. A headless daemon cannot fill the "where it forced an outcome" row for contrast, so the mandate would manufacture **slogans** — which §1.3 says are not values. Also contradicts §4's LiteController example. |
| Merely **"state your relationship to a11y"** | Too weak — satisfied by one dismissive line. |
| Create a **family ordered set** holding a11y | §2.1's family slot **already exists and is populated** — SurfaceWorks states *Accessibility · Ease-of-use · Speed · Choice* on its org profile. Adding another would duplicate a working mechanism, and would require inventing other stars, which §7 forbids the doctrine from doing. |

### 2.2 This codifies existing practice; it does not import a list

Surveyed 2026-07-21:

- **DeckLibre** (spec §2) already states a11y as **#1**, and its gloss already spans **two modality
  surfaces** — the authoring WebUI *and* the operated device output ("the faces, feedback, and
  confirmation an operating user perceives while pressing keys and turning dials, **even a user who
  never opens the WebUI**"), enumerating l10n/i18n, keyboard navigability, screen-reader support, and
  contrast.
- **SurfaceWorks** (`.github/profile/README.md`) states the family set, a11y first, with a refusal
  clause: *"a control that can't be operated by keyboard and screen reader, or whose meaning lives in
  colour alone, does not ship."*
- **CommonTongue** (`docs/specs/2026-07-19-surface-descriptor-design.md:11-12`) derived the **hardest**
  version unprompted — a project with **no human surface of its own**, reasoning about its obligation
  to surfaces downstream:
  > **North Stars — CT infra (ordered):** Reliability → Interop/Speed → Extensibility.
  > Product-UI stars the descriptor must *enable*: Accessibility → Ease-of-use → Speed → Choice.

  This is the **third form** in §3, and it was found in the field, not designed here. §13 of that spec
  is a per-star evaluation, satisfying §1.3's forced-an-outcome requirement.

**Three** projects derived per-modality a11y independently, before any doctrine said to — including
the enable-downstream case that a two-form rule could not have expressed. Extracting that up into the
framework is the family's own established pattern, not an imported mandate.

**Retroactive burden: zero.** Every project surveyed already complies. §1.4 ships without a
transition provision because there is nothing to transition.

---

## 3. Proposed edit A — `north-stars-doctrine.md`, new §1.4

Placed in §1 (*what a North Star is*) because it constrains **what a project's stated set must
contain** — the same kind of rule as "small, ordered, 3–5" (§1) and "every star shows forcing an
outcome" (§1.3). It is framework, not a family value competing in a family ranking.

> ### 1.4 Accessibility is a value, not only machinery
>
> Accessibility is a **standing family value**, non-negotiable in **every modality the product
> actually has**. A modality the product does not have generates no obligation — it is **moot, not
> waived**. What varies between projects is their **modality surface**, never whether accessibility
> is a value.
>
> The obligation is per-modality, so it is met differently by different products. A persona-stratified
> app owes the visual, pointer, and language surfaces; a headless service owes its protocol, logs, and
> language. A CLI has no colour theme — high-contrast theming is moot there, and its absence is not a
> gap. **Language is a modality every project has**: identifiers, flag names, error strings,
> documentation, and UI copy are read by people, and inclusive terminology is part of the floor
> ([Terminology Migration §5](terminology-migration-doctrine.md)).
>
> A project states this in its own set in **one of three forms**:
>
> - **A ranked star** — where the modality surface makes accessibility a live tradeoff against other
>   stars (CameraConductor #1; DeckLibre #1).
> - **A stated non-negotiable floor outside the ranking** — where the surface is narrow enough that
>   ranking it would be decoration, so ranking it would fail §1.3 (LiteController).
> - **A stated obligation to enable it downstream** — where the product has no human surface of its
>   own but its output determines whether a consuming surface can be accessible. A wire contract or
>   descriptor format names the product-UI stars it must **enable** (CommonTongue: *"Product-UI stars
>   the descriptor must enable: Accessibility → Ease-of-use → Speed → Choice"*).
>
> **All three are statements. Silence is none of them.** A stated set that does not account for
> accessibility across its modality surface is incomplete, and the §4 parenthetical is not sufficient
> to satisfy it.
>
> **A project that does not account for accessibility across its modality surface requires a
> recorded, approved exception** in its decision log — never a silent one (§1).
>
> This doctrine states the **value**; the mechanisms that satisfy it live in their own doctrines and
> are not restated here ([UI/UX §6](ui-ux-design-doctrine.md), [Visual
> Identity §6](visual-identity.md), [Language Selection](language-selection-doctrine.md), [Web
> UI §2.1](web-ui-doctrine.md)). Per §1.1, the **value** is rigid and the **means** is negotiable:
> naming any one mechanism as the value is the scope-widening failure [Decision Doctrine
> §3](decision-doctrine.md) warns against.

**Consequential edits if §1.4 is adopted:**

- **§4, LiteController aside** — the current parenthetical becomes the sanctioned second form,
  reworded to name the modality surface rather than dismiss the value. Suggested: *"This ranking
  states accessibility as a floor outside the ranking rather than as a star: the modality surface is
  protocol, logs, and language, with no visual surface to rank. The floor binds on the surfaces it
  has."*
- **§6 checklist** — add: *"Accessibility is accounted for across the product's modality surface,
  as a ranked star or as a stated floor (§1.4)."*

---

## 4. Proposed edit B — `terminology-migration-doctrine.md` §5 ledger

The value in §1.4 has no teeth without term mappings in the translation SSoT, because the
**on-touch rule (§3)** is what actually fixes occurrences as files are edited.

### 4.1 Sources

Four primary sources, converging. Cited so the rows are attributable, not asserted freestanding
(Decision Doctrine §11, "name the doctrine that owns each rule"):

- **IETF** — [draft-knodel-terminology-10](https://www.ietf.org/archive/id/draft-knodel-terminology-10.html),
  *Terminology, Power, and Inclusive Language in Internet-Drafts and RFCs*. Supplies the reasoning
  categories and the load-bearing argument: **"Why use a metaphor when a direct description is both
  succinct and clear?"** — the alternatives are *descriptions*, not counter-metaphors.
- **Linux kernel** — [coding-style.rst §Inclusive
  Terminology](https://docs.kernel.org/process/coding-style.html), merged in 5.8. Supplies the
  **exception clause**, quoted in §4.3.
- **Google** — [developer documentation style
  guide](https://developers.google.com/style/inclusive-documentation) + [word
  list](https://developers.google.com/style/word-list). The most exhaustive; covers ableist,
  gendered, violent, and culturally-charged categories.
- **RFC 9309** (robots.txt) — evidence that the direct form wins in practice: it uses plain
  **allow / disallow** and never reaches for a colour metaphor at all.

### 4.2 Rows to add

`concept` scope, so the §3 on-touch rule reaches prose and identifiers alike. Grouped by the
reasoning category, because the category is what makes a row defensible.

**Tier 1 — rename on touch.** Direct descriptions that are strictly clearer than the term they
replace; no established family usage is disturbed.

| Old | New | Category | Scope | Status | Since |
|---|---|---|---|---|---|
| `whitelist` | `allowlist` | racial metaphor | concept | active | 2026-07-21 |
| `blacklist` | `denylist` (or `blocklist`) | racial metaphor | concept | active | 2026-07-21 |
| `blackhat` / `whitehat` | `malicious` / `ethical` (actor) | racial metaphor | concept | active | 2026-07-21 |
| `master` / `slave` | `primary`/`replica`, `controller`/`device`, `leader`/`follower`, `initiator`/`responder` — pick by **relationship**, not by rote | slavery metaphor | concept | active | 2026-07-21 |
| `master` (branch/node, no `slave` pair) | `main` (branch), `parent`/`controller` (node) | slavery metaphor | concept | active | 2026-07-21 |
| `man-in-the-middle` / `MITM` | `on-path attacker` | gendered | concept | active | 2026-07-21 |
| `man-hours` / `manpower` / `manned` | `person-hours` / `staff`, `workforce` / `staffed`, `crewed` | gendered | concept | active | 2026-07-21 |
| `manmade` | `artificial`, `manufactured`, `synthetic` | gendered | concept | active | 2026-07-21 |
| `male` / `female` connector | `plug` / `socket` | gendered | concept | active | 2026-07-21 |
| `guys` / `you guys` (addressing people) | `everyone`, `folks` | gendered | concept | active | 2026-07-21 |
| `sanity check` | `validity check`, `soundness check`, `confidence check` | ableist | concept | active | 2026-07-21 |
| `dumb down` | `simplify` | ableist | concept | active | 2026-07-21 |
| `cripple` / `crippled` | `slow down`, `degrade`, `limit` | ableist | concept | active | 2026-07-21 |
| `crazy` / `insane` (re: behaviour) | `baffling`, `unexpected`, `extreme` | ableist | concept | active | 2026-07-21 |
| `lame` | name the actual flaw | ableist | concept | active | 2026-07-21 |
| `blind to` / `turn a blind eye` | `ignore`, `unaware of`, `disregard` | ableist | concept | active | 2026-07-21 |
| `grandfathered` | `legacy`, `pre-existing`, `exempt` | origin (racial) | concept | active | 2026-07-21 |
| `ghetto` (re: a workaround) | `clumsy`, `inelegant`, `workaround` | racial/ethnic | concept | active | 2026-07-21 |
| `gypsy` / `gypped` | `Romani`; `cheated`, `swindled` | ethnic slur | concept | active | 2026-07-21 |
| `brown bag` (session) | `learning session`, `lunch and learn` | racial (segregation-era) | concept | active | 2026-07-21 |
| `first-class citizen` | `fully supported`, `built-in` | civil-status metaphor | concept | active | 2026-07-21 |
| `mom test` / `grandmother test` | `novice-user test`, `beginner test` | gendered + ageist | concept | active | 2026-07-21 |
| `ninja` / `rockstar` / `guru` (re: people) | `expert`, `specialist` | cultural appropriation | concept | active | 2026-07-21 |
| `native` / `non-native speaker` | name the actual requirement (e.g. "fluent in X") | othering | concept | active | 2026-07-21 |

**No Tier 2 rows.** *(Decided 2026-07-21 — the ledger table stays purely mechanical.)* Violent and
graphic metaphors are a **preference for the direct form, not a rename**, so they do not belong in a
table whose §3 on-touch rule is mechanical. They are stated as a prose note beneath the table instead:

> **Note — violent and graphic metaphors.** Prefer the direct form where one is at least as precise:
> `kill` → *stop / end*, `nuke` → *remove / purge*, `hang` → *stop responding*. **This is a
> preference, not a ledger row: there is no on-touch obligation and no rename.** API and syscall names
> (`SIGKILL`, `kill(1)`, `abort(3)`, `AbortController`) are names, not prose — §5's exception clause
> applies unchanged.
>
> **Two family terms of art are deliberately kept**: *blast radius* (`north-stars-doctrine.md` §2,
> "widest-blast-radius edits") and *break-glass* (the debug-channel doctrine's name for emergency root
> access). Both are precise, load-bearing, and neither is a metaphor for a person. **Renaming a
> working family term to satisfy an external style guide is the means-over-value inversion §1.1
> warns against** — the value is inclusive language, and these terms do not violate it.

### 4.3 The exception clause — quoted names are preserved verbatim

Adapted from the **Linux kernel's** wording, which is the strongest available precedent and matches
the trap §3 already names ("never overwrite a provenance record"):

> Exceptions for introducing new usage is to maintain a userspace ABI/API, or when updating code for
> an existing (as of 2020) hardware or protocol specification that mandates those terms. For new
> specifications translate specification usage of the terminology to the kernel coding standard where
> possible.
> — *Linux kernel, `coding-style.rst`*

Stated for this family:

> **These rows bind terms *we* author. They do not bind a name we are quoting.** Preserved verbatim:
> - **Third-party API/ABI symbols, filenames, and protocol fields** — renaming another vendor's
>   symbol inside our own notes makes **our record false**.
> - **Dated quotes and provenance records** (§3, already doctrine).
> - **Wire-format and on-disk field names already shipped** — governed by [Interface
>   Stability](interface-stability-doctrine.md) and [Forward-Compatible
>   Format](forward-compatible-format-doctrine.md), cited by name per Decision Doctrine §11. A rename
>   here is a **breaking change**, not a terminology fix.
>
> Where we author a *new* interface over a spec that mandates the old term, **translate at our
> boundary**: the vendor's term stays in the quoted layer, our own surface uses the direct form.

**Surveyed 2026-07-21 — every occurrence found was exactly this exempt kind:**
- `BLACKLISTED_KEY_CONTROL_ELEMENTS` — vendored Sphinx JS inside Sony's CrSDK reference.
- `commandsBlacklist.txt` / `commandGroupsBlacklist.txt` — Logitech's own resource filenames, quoted
  in `logi-plugin-re` provenance notes.

Both **stay as written**. The rule is therefore **forward-looking**: these rows carry no migration
backlog.

**Measurement honesty.** The survey covered `*.md`, `*.swift`, `*.js`, `*.ts`, `*.py`, `*.sh`,
`*.json`, `*.yaml`, `*.yml` under `~/repositories/`, excluding `node_modules` and `.git`. It is
**"none in the surveyed set,"** not a proof of zero first-party occurrences family-wide. Tier-2 terms
were **not** surveyed beyond the two family usages noted above.

---

## 5. Prime Directives analysis

Per [Decision Doctrine §11](decision-doctrine.md) — presented **with** the recommendation.

| Lens | Finding |
|---|---|
| **1 — North Stars** | §1.3 (a star must force an outcome, else it is a slogan) is the binding constraint, and it is what **rules out** mandating a ranked a11y star universally. The per-modality form satisfies §1.3 rather than fighting it: a headless daemon can fill the forced-an-outcome row for its *language* modality. §1.1 (value rigid, means negotiable) requires §1.4 to state the value and name no mechanism as the mandate — hence the explicit means/value split in the drafted text. |
| **2 — Blueprints** | The live objection: §1.4 is a values claim inside a file that holds the *framework*. Answered by shape — the rule constrains **what a stated set must contain**, which is what §1 and §3 already do; and the doctrine already carries this content once, as the §4 aside. §1.4 promotes existing content from aside to rule rather than introducing a new kind. Confirmed by survey: §2.1's family slot already works (SurfaceWorks), so no family set is needed here. |
| **3 — Best Practices** | Supportive; the family is behind convention, not ahead of it. WCAG/WAI scope conformance by the content you actually have — "moot, not waived" is the standard framing, not an improvisation. Inclusive-language guidance is likewise industry-standard, including the preserved-quotation carve-out for third-party identifiers. |
| **4 — Correctness** | *Claim "a11y is machinery-only, never a value"* — **verified** by grep; every hit is a rendering doctrine, and the only value-shaped statements are the §4 parenthetical and projects' own sets. *Claim "forward-looking, near-clean tree"* — **verified with the stated sampling limit** (§4 above). **SSoT:** §1.4 states the value and explicitly points at the mechanism doctrines rather than restating them, per [single-source-of-truth](single-source-of-truth-doctrine.md). |

---

## 6. Out of scope — recorded, not resolved

Owner-driven per §7 (*"this doctrine defines the framework, it does not invent any project's
values"*). Listed so they are not lost:

1. **~~CommonTongue has no stated set~~ — WITHDRAWN, this was my error.** Two successive readings were
   wrong and are corrected here rather than quietly deleted. First read (decision-log D-017 only)
   concluded CT had no set; it does — `docs/specs/2026-07-19-surface-descriptor-design.md:11`. Second
   read concluded it owed an a11y line; it does not — **line 12 already states it**, in the
   enable-downstream form now promoted into §3. **No edit to CommonTongue is proposed or needed.**
2. **~~"The family North Stars" names two different sets~~ — WITHDRAWN, not a defect.** They are **two
   altitudes**, and CommonTongue states the relationship between them on the very line I initially
   misread: its *own infra* stars are Reliability → Interop/Speed → Extensibility, and the
   *product-UI* stars it must **enable** are SurfaceWorks' set verbatim. Cited loosely as "the family
   North Stars" in D-017 prose, which is what misled me. **Possible minor cleanup, owner's call:**
   D-017's phrasing could name which altitude it means.
3. **§7's projects-with-stated-sets list is imprecise.** It names CommonTongue as already stating a
   set — true, but the set lives in a *dated `docs/specs/` design doc*, not an obvious durable home,
   and CT has no `CLAUDE.md`. Per §2 ("one home per project for the values themselves") the owner may
   want a more durable location. Not a §1.4 blocker.
4. **§7's existing gaps** — Oscura owes an enumerated ordered set; CommonFraming lacks a
   self-contained list. Unchanged by this draft.

---

## 7. Decisions taken (owner, 2026-07-21)

All six open questions are settled. Recorded here so the provenance is greppable, per §3 of the
North Stars doctrine.

| # | Question | Decision |
|---|---|---|
| 1 | Where does §1.4 live? | **§1** — *what a North Star is*. It constrains what a stated set must contain, alongside "small, ordered, 3–5" (§1) and the §1.3 reality test. |
| 2 | How strong? | **Harder than drafted** — a project that does not account for accessibility across its modality surface requires a **recorded, approved exception** in its decision log. Folded into §3's text. |
| 3 | Tier-1 scope | **All 24 rows.** The tree is clean, so breadth costs nothing; a narrow list would conspicuously omit the ableist and othering categories. |
| 4 | Tier 2 | **Prose note, not table rows.** The ledger stays purely mechanical; the preference is still stated so the category is not pretended away. |
| 5 | `blast radius` / `break-glass` | **Both kept.** Established, precise family terms of art; renaming them to satisfy an external style guide is the §1.1 means-over-value inversion. |
| 6 | CommonTongue | **Record only — no edit.** Investigating the LoE proved CT *already complies* (see §6.1); the proposed line would have duplicated its line 12. §1.4 ships with **no transition provision** because the retroactive burden is zero. |

**Note on how #6 resolved.** The answer changed twice under measurement: CT was first believed to
have no stated set, then believed to owe an a11y line, and is in fact fully compliant — and its
compliance produced the **third form** now in §3. Both prior readings are recorded as withdrawn in
§6 rather than deleted.

---

## 8. Remaining owner calls (not blockers)

1. **A forward-looking home for the inclusive-language rule.** The ledger is a *migration* mechanism
   — it translates old→new for files being touched. It is not where a new contributor looks to learn
   how we write. The Linux kernel's real insight is not its word list but its **placement**: the rule
   lives in the style guide, read before writing, not in a migration table consulted afterward.
   `conventions-doctrine.md` and `naming-shape-doctrine.md` are the candidates; **neither has been
   read.** Proposal: ledger keeps the on-touch migration half, a style-guide doctrine states the
   forward-looking rule, each pointing at the other.
2. **D-017 phrasing** (§6.2) — could name which altitude "the family North Stars" refers to.
3. **CommonTongue's durable home** (§6.3) — its set lives in a dated `docs/specs/` design doc.
