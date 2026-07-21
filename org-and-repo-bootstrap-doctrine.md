# Org & Repo Bootstrap Doctrine

**Scope: cross-project (FOSS family).** How a new family **Organization** and a new **repo** in it
are stood up so they carry the family's standard health surface, identity, settings, and continuity
— codified because the shape has been built enough times (six orgs) that it is a known pattern, and
a known pattern repeated by hand drifts. This doctrine is that pattern written down.

It exists for one reason: **the namespace is not the org.** Creating `github.com/<org>` mints an
empty shell with a default identicon and no profile — an *unfinished* org, and the unfinished state
is the first thing every visitor sees. "Created" means the org carries its health files, its
identity mark, its settings, its co-owners, and a profile that indexes its real repos — not merely
that the login resolves.

**Companion:** [Identity-Mark Doctrine](identity-mark-doctrine.md) owns the profile image (§3);
[Repository-Portability Doctrine](repository-portability-doctrine.md) owns the `(Org, name)`
identity and derived on-disk path (§6); [Documentation Doctrine](documentation-doctrine.md) owns
the `docs/_working/` draft convention the FUNDING draft uses (§2); the family
[`~/repositories/CLAUDE.md`](../../CLAUDE.md) "FOSS org README stays current" rule owns the
org-README currency cadence this makes concrete (§2). This doctrine **cites** them and adds only
the bootstrap shape. The dated application records live in memory
(`project_github_account_topology`, `project_github_repo_settings_policy`); this doctrine is the
durable *policy* those records apply.

---

## 0. The load-bearing rule

> **A new org or repo is not "created" when its namespace exists — it is created when it carries
> the family's standard surface: the health files, the identity mark, the settings, the co-owners,
> and (for an org) a profile README that indexes exactly the repos that exist. An empty org with a
> default identicon is an unfinished org, and its emptiness is what every visitor sees first.**

---

## 1. Org and repo are two mechanisms — do not conflate them

- **An Organization's profile** renders from a repo literally named **`.github`**, file
  **`profile/README.md`** → shown at `github.com/<org>`. (A members-only variant lives in
  `.github-private/profile/README.md`.)
- **A repo's own README** is its root `README.md`.
- The name-the-repo-after-the-account trick (`<user>/<user>`) is **User-only** and renders nothing
  on an org. Verify which you have — `gh api users/<name> --jq .type` → `User` | `Organization` —
  before acting; an org ≠ a user and the mechanisms do not cross.
- **Org creation is browser-only.** There is no `gh org create`, no create-organization API on
  github.com SaaS. It is an honest manual step; everything *after* creation is scriptable (§7).

## 2. The org `.github` health set

Every family org's `.github` repo carries this set — proven identical across the family's orgs:

| File | Shape |
|------|-------|
| `profile/README.md` | The org home page. **An index that points, never a restatement** (SSoT): one line on what the org *is*, then a **current, exact link list of the repos that exist in the org** (§2.1). |
| `CODE_OF_CONDUCT.md` | Standard family conduct. |
| `CONTRIBUTING.md` | How to contribute (short; points at the repo's own docs). |
| `SECURITY.md` | Report privately — never a public issue. |
| `SUPPORT.md` | Where to ask (points at Discussions). |
| `ISSUE_TEMPLATE/config.yml` | **`blank_issues_enabled: false`**; contact links route *question → Discussions*, *security → the private `SECURITY.md` flow*. |
| `ISSUE_TEMPLATE/*.yml` | The issue forms appropriate to the org (a code org gets bug/feature; a doctrine org gets report/doctrine-change). |
| `PULL_REQUEST_TEMPLATE.md` | Standard PR template. |
| `FUNDING.yml` | **Held as a draft in `docs/_working/FUNDING.yml` until real handles exist**, promoted to `.github/FUNDING.yml` (root) only when the handles are confirmed. A funding file pointing at unset handles is a broken promise; keep it in `_working/` (Documentation Doctrine) until it is true. |
| `.gitignore` | Standard. |

### 2.1 The profile README indexes exactly the repos that exist

The org README's repo list is a **live index**, and its currency is a *checkable artifact*, not a
vibe:

- **Link the repos that EXIST — never planned, aspirational, or not-yet-created ones.** A link to a
  repo that does not exist is a lie about the org's world (Decision §5 — absent is not the same as
  present). One line + link per repo; the line says what the repo *is*, it does not restate the
  repo's README (SSoT).
- **Update the list in the SAME change set as any repo add / remove / rename / transfer** — the
  family CLAUDE.md "FOSS org README stays current" rule; the org README *is* the org's home page and
  a stale repo index rots silently (nothing fails, nothing warns). This doctrine makes that rule
  concrete: the specific thing that must move is the repo-link list.
- **Checkable:** the set of links should equal `gh api orgs/<org>/repos` (minus `.github` itself). A
  missing link or a phantom link is a **mechanically detectable defect**, not a judgment call —
  verify by comparing the two lists.

## 3. Identity mark

Governed by the [Identity-Mark Doctrine](identity-mark-doctrine.md); named here only as a required
bootstrap step, not restated:

- The org and each repo get a mark — one literal white glyph on a flat solid field; **the field
  colour encodes belonging** (one colour per org; repos inside it share the colour and differ by
  *glyph*, not colour); 512×512 PNG + SVG.
- The mark lives at **`.github/profile/`** for the org, `assets/icon/` for a repo.
- **Committing the mark is not applying it.** There is no API to set an avatar; the UI upload is a
  separate, still-pending manual step (§7) and must be reported as pending, never as done.

## 4. Settings policy

Applied to every public FOSS org/repo (codified from the family's standing settings policy; the
dated application record is `project_github_repo_settings_policy`):

- **Discussions ON** for every non-`.github`, non-archived repo. (Toggle via GraphQL
  `updateRepository(hasDiscussionsEnabled:true)` — REST does not reliably expose it.)
- **`main` branch ruleset** on every public FOSS **code** repo: `required_approving_review_count: 1`,
  force-push (`non_fast_forward`) and `deletion` blocked, merge/squash/rebase allowed.
- **Owner merges without approval via an `OrganizationAdmin` bypass** (`bypass_mode: always`). The
  review requirement is **independent of the bypass**: the `1` is the real bar for outside
  contributors; the bypass is how a solo maintainer is not blocked by their own rule. (Never solve
  this by dropping the review count — that lowers the bar for everyone.)
- **Dependabot alerts + automated security fixes ON; secret scanning + push protection ON.**
- **Wiki: ON, repurposed for user-facing documentation** — distinct from the in-tree `docs/`
  (design/spec/plan SOT). Different audiences, no conflict.
- **Projects: ON** (harmless).

## 5. Continuity — every org gets both accounts as co-owners

The reason an org exists at all is **continuity** — surviving the fragility of a single personal
GitHub account. So every family org is created with **both family accounts as co-owners**, so the
projects survive the loss of either. An org boundary is an ownership/handoff boundary; a project
earns its own org when it has an **ecosystem**, otherwise it is a repo in the workshop org, promoted
later (transfers stay cheap). *(Detail: `project_github_account_topology`.)*

> **Who is a member of an org is NOT part of bootstrap — do not read it, do not enumerate it, do not
> act on it.** None of §1–§8 requires knowing the membership roster. Listing members surfaces
> accounts that are none of this work's business (and may surface an account that must never be
> touched at all), so the roster is **irrelevant to every step here** — creating the `.github` set,
> the mark, the settings, the profile index, the on-disk mirror all proceed without ever querying who
> belongs to the org. The **one** account action bootstrap takes is the deliberate, additive co-owner
> add above; it needs no roster read, and it touches no account beyond the one being added. If a
> membership question even arises, that is a signal you have stepped outside bootstrap — stop.

## 6. On-disk mirror

Local checkouts mirror the org structure: **`~/repositories/<Org>/<repo>`**, the org's `.github`
as a hidden dir at `~/repositories/<Org>/.github`. The path is **derived from identity**, never
depended upon as a coupling ([Repository-Portability Doctrine](repository-portability-doctrine.md)).
**The owner performs or authorizes every repo create / move / transfer** — an agent does not create
or relocate a repo unprompted.

## 7. Scriptable vs manual — name the seams honestly

- **Manual (browser/UI only):** creating the org; **uploading the avatar image** (no API sets it —
  committing the mark ≠ applying it).
- **Scriptable (the token already has `admin:org`):** adding the co-owner, pushing the `.github`
  repo, creating rulesets, toggling Discussions, setting Dependabot/secret-scanning, writing the
  profile README, re-pinning the profile.
- **Owner-gated:** repo create / move / transfer (§6).

Report a bootstrap as complete only for the parts actually done; the avatar upload in particular is
**pending until the human uploads it**, and saying "identity mark added" when only the file was
committed is the false-done this doctrine forbids.

---

## 8. Checklist — a new org is complete when…

- [ ] **Org exists** and its type is confirmed `Organization` (§1) — created in-browser.
- [ ] **`.github` repo carries the full health set** (§2): profile README, CoC, CONTRIBUTING,
      SECURITY, SUPPORT, ISSUE_TEMPLATE (`blank_issues_enabled: false` + routed contact links),
      PR template, FUNDING (draft in `_working/` until handles are real), `.gitignore`.
- [ ] **Profile README indexes exactly the repos that exist** (§2.1) — every existing repo linked,
      no phantom links; **verified against `gh api orgs/<org>/repos`**; updated in-changeset on any
      repo change.
- [ ] **Identity mark** committed to `.github/profile/` (org colour; §3) — **and the avatar upload
      reported as a pending manual step, not as done.**
- [ ] **Settings applied** (§4): Discussions, main ruleset + `OrganizationAdmin` bypass,
      Dependabot + secret-scanning + push-protection, Wiki-as-user-docs.
- [ ] **Both accounts are co-owners** (§5) — added deliberately; **the membership roster is never
      read or enumerated as part of bootstrap** (§5).
- [ ] **On-disk mirror** at `~/repositories/<Org>/` with `.github` present (§6).
- [ ] **Every composed doctrine cited, none restated** (§2–§6).

A new **repo** in an existing org is the same checklist minus the org-only rows: it carries its own
`README.md` + `assets/icon/` mark (org colour, its own glyph), gets the settings policy (§4), is
added to the org profile's repo index in the same change set (§2.1), and lands at
`~/repositories/<Org>/<repo>` — owner-created (§6).
