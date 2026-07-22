# Staging Forge Doctrine

**Scope: cross-project (FOSS family).** How a **self-hosted forge** sits between local work and
the public GitHub remote — the `local → stage → GitHub` pipeline, why the stage exists, what it
must mirror, and the gate that makes "green on the stage" mean "green on GitHub." It is about the
**role** a staging forge plays in the family's flow, not about how any particular forge is
installed. Where a concrete forge is deployed, its host, ports, data paths, tool names, and tokens
live in *that deployment's* own docs — never here.

It exists for one reason: **GitHub is the published truth, and its CI must not fail in public.**
A red check on a public repo is the first thing a visitor, a contributor, or a future employer
sees. The stage is where that failure is *allowed* to happen instead — a self-hosted hop upstream
where the same CI runs first, against the same structure, so what reaches GitHub is already proven.

**Companion:** [Org & Repo Bootstrap Doctrine](org-and-repo-bootstrap-doctrine.md) owns how an
org/repo is *shaped* (the `.github` health set, settings, co-owners, the profile index) — this
doctrine **cites** it and adds only that the stage *mirrors* that shape. [Service Foundations
Doctrine](service-foundations-doctrine.md) owns the plumbing beneath any long-running service
(config resolution, binding, shutdown, single-instance) — a forge is such a service, and its
*deployment* obeys that doctrine; this one is about the forge's *place in the pipeline*, not its
daemon mechanics. [Secrets & Credentials Doctrine](secrets-credentials-doctrine.md) owns how
the stage's admin token is stored and read. The dated application record for the family's current
instance lives in memory (`reference_forgejo_identity_model`) and in the deployment's docs
(`local-resources/forgejo-deb005.md`); this doctrine is the durable *policy* those records apply.

> **The family's current instance** is **Forgejo**, self-hosted on the owner's LAN compute host,
> fronting a public hostname behind a reverse proxy. Forgejo appears below the way LiteController
> appears in Service Foundations: as *the worked example*, cited by name — the doctrine is about the
> staging-forge **role**, and would hold identically if the instance were Gitea, GitLab CE, or
> another self-hosted forge.

---

## 0. The load-bearing rule

> **GitHub is the published truth and its CI must never fail in public. So a self-hosted forge
> stands one hop upstream as a staging gate: work flows `local → stage → GitHub`, the stage mirrors
> GitHub's structure 1:1, and nothing reaches GitHub that the stage has not already proven green.
> The stage is the place where failure is allowed to happen.**

Each clause below is a section: *why the middle hop exists* (§1), *mirror 1:1* (§2), *identity —
same users as GitHub* (§3), *the gate that makes green mean green* (§4), *what is principle vs.
deployment detail* (§5), *the deliberate exclusion* (§6).

---

## 1. The pipeline has three positions, each with one job

```
local  ──►  stage (self-hosted forge)  ──►  GitHub (published)
author       release / CI / verify /            the public deal;
build         GATE                              CI is a formality,
test                                            already green upstream
```

- **local** — where work is authored, built, and tested. Fast, private, disposable. Failure here
  costs nothing.
- **stage** — the self-hosted forge. Runs the *same* CI GitHub will run, against the *same*
  structure (§2), and **gates** promotion (§4). This is the only position that is new; it is the
  subject of this doctrine.
- **GitHub** — the published remote. By the time a change lands here it has already passed the
  stage, so its CI **should be a formality**. A GitHub check that goes red is a signal the stage
  *failed to catch something* — a gap in the mirror or the gate, not merely a bad commit.

**Why a *self-hosted* middle, and not just GitHub Actions directly:** the stage exists to absorb
failure privately and to run under the owner's own control — no public red checks, no consumption
of a public CI budget on runs that were always going to be iterated, and CI that can touch
LAN-only resources a public runner cannot. The cost is running and mirroring one more system; the
buy is that GitHub only ever sees finished, green work.

> **This is the same instinct as [Held-Out Oracle Doctrine](held-out-oracle-doctrine.md)** —
> keep a trusted check upstream of the thing you are trying to make correct. Here the "oracle" is a
> full CI run on a faithful mirror, held one hop before publication.

---

## 2. The stage mirrors GitHub 1:1

The stage's value is entirely conditional on **faithfulness**: a gate that tests a *different*
structure from the one it guards proves nothing.

- **Same users, same orgs, same repos.** The stage replicates GitHub's namespace: every org that
  exists on GitHub exists on the stage (except the deliberate exclusion, §6); every repo mirrors to
  the same owner; both family accounts exist as the same two users.
- **Same *shape*, per Bootstrap.** The mirrored org/repo carries the shape the [Org & Repo Bootstrap
  Doctrine](org-and-repo-bootstrap-doctrine.md) defines — this doctrine does not restate that
  shape, it requires that the stage *match* it. Where the two touch — the org profile, the branch
  ruleset — Bootstrap owns *what the shape is*; this doctrine owns *that the stage carries it too*.
- **Divergence is a defect, not drift to tolerate.** A repo present on GitHub but missing on the
  stage means the next change to it is promoted **ungated**; a repo on the stage with different
  protection than GitHub means "green here" no longer predicts "green there." Reconcile at the point
  of change (a new repo is onboarded to the stage in the same effort it is created), not in a
  periodic sweep after the gap has already let something through.
- **Structure is replicated without asking.** Because the target *is* GitHub's structure, mirroring
  it is not a design decision to relitigate each time — it is mechanical. Create the analog, do not
  deliberate whether to.

> **Mirroring the structure ≠ mirroring the *content pointer* couplings.** A mirror that faithfully
> copies READMEs which link siblings by checkout path (`../OtherRepo/`) has faithfully copied a
> [Repository-Portability](repository-portability-doctrine.md) violation. The stage mirrors
> *identity and protection*, and the content is whatever the repo actually holds — fixing portability
> defects is that doctrine's job, not something the mirror step introduces or is expected to launder.

---

## 3. Identity on the stage

**Use the same users as GitHub.** The stage's accounts mirror GitHub's — same logins, and both
family accounts co-own every mirrored org, so the projects survive the loss of either account (the
same continuity reasoning as [Bootstrap §5](org-and-repo-bootstrap-doctrine.md)). One account is the
site admin; both are co-owners everywhere. Nothing about identity on the stage is special: it is
GitHub's account model, replicated.

---

## 4. The gate is the whole point

The stage earns its place only if promotion **through** it is conditional. That condition is branch
protection on the mirrored default branch, shaped so that the stage's green is a real precondition —
and shaped so it never blocks on a check that cannot run.

- **Green-here-gates-there.** The default branch requires the stage's CI status check to pass before
  a change can merge and flow onward. That is the mechanism that makes "green on the stage" mean
  something.
- **Push and merge are *separate* permissions — an owner needs both.** A forge's branch protection
  typically carries two independent allowlists: who may **push** directly to the protected branch,
  and who may **merge** a pull request into it. Being on the push allowlist alone does **not** let an
  owner merge through the gate. **Set both**, or the owner is blocked by their own rule — the exact
  failure this gate is supposed to prevent for *others* turned inward.
- **Solve owner-not-blocked by allowlist, never by weakening the bar.** The way a solo maintainer is
  not stopped by their own gate is to be *on the allowlists* — not to lower the required-review or
  status-check requirement for everyone. (Same philosophy as [Bootstrap
  §4](org-and-repo-bootstrap-doctrine.md)'s admin-bypass: the bar stays real for outside
  contributors; the owner is exempted *as a named party*, the requirement is not softened.)
- **Never gate on a check that will never run.** Protection is always applied, but *shaped to
  reality*: a repo with a CI workflow requires the status check; a repo with **no** workflow yet
  still blocks direct non-owner pushes (a PR is required) but does **not** require a nonexistent
  check — otherwise every merge deadlocks waiting on a check that can never turn green. When a
  workflow is later added, re-apply protection to require it.
- **Requirement vs. mechanism.** *That* the default branch is gated, owners on both allowlists, and
  protection shaped to whether CI exists — that is the family rule. The forge's exact API field
  names, the tool that applies it, and the token that authorizes it are **deployment mechanism**
  (§5), not doctrine.

> **The current instance** applies this with a small set of self-service tools that onboard a repo
> (create → mirror → push → gate) and set protection idempotently, owners on both the push and merge
> allowlists, status-check required only when a workflow is present. The tools and their field names
> are the deployment's; the *policy they encode* is this section.

---

## 5. Principle here, deployment detail there — keep the doctrine portable

This doctrine names **principles**. Everything that ties the pipeline to a *particular machine* lives
in that deployment's own documentation, never in this file:

| Belongs in the doctrine (portable) | Belongs in the deployment's docs (machine-specific) |
|---|---|
| The `local → stage → GitHub` flow and why the stage exists | The stage's host, IP, hostname, reverse-proxy front |
| Mirror-GitHub-1:1; reconcile at point of change | Which orgs/repos are onboarded, and their on-disk roots |
| Same users as GitHub; two-account co-ownership of every org | The accounts' emails, where their passwords are stored |
| Gate policy: green-gates, push+merge allowlists, shape-to-reality | The forge's API field names, the onboarding tool names |
| CBB-style deliberate exclusion (§6) | The admin token's path and read mechanism |

The test: **could this sentence be true of a second family stage on a different machine?** If yes, it
is doctrine. If it names a path, a port, or a product-specific field, it is a deployment detail and
belongs with the deployment. A doctrine that has absorbed one machine's specifics has stopped being a
doctrine.

---

## 6. The deliberate exclusion — one org is not staged

Not everything is mirrored. **ColdBoreBallistics (CBB) is intentionally not put on the stage.** It is
a distinct concern with its own replication path (a standalone guide, applied on its own terms), and
the family's staging tools **refuse** it by name rather than silently onboarding it.

- The exclusion is **explicit and enforced**, not an omission: the onboarding tools decline CBB, so
  it cannot be added by reflex.
- **An exclusion is not a gap — it is a named boundary.** Recorded here so its absence from the
  mirror reads as *intended*, not as a mirror defect to "fix" (§2 would otherwise flag it as
  divergence). The one org that *should* differ is the one the doctrine says so.

---

## 7. Out of scope for now — named seams, not silent gaps

Real, and not yet given rules here. Listed so their absence is legible rather than mistaken for
completeness (a doctrine with no admitted gaps is lying — cf. [Spec Promotion Doctrine
§9.5](spec-promotion-doctrine.md)):

- **CI runner isolation for untrusted PRs.** The current stage runs a trusted, solo pipeline; the day
  external untrusted PRs execute on it, runner hardening (rootless / DinD / ephemeral) becomes a real
  design question. Named as the trigger, not designed here.
- **Backup / restore of the stage's data.** Relied on by whatever host-level sweep exists; not yet a
  forge-specific policy.
- **Multiple stages / multi-machine.** This doctrine assumes one stage; a second (per-machine, or a
  failover) would raise reconciliation and authority questions §2–§3 do not yet answer.
- **What "promotion" automates.** Whether the `stage → GitHub` hop is a manual push once green or a
  triggered mirror is currently a per-repo operator choice, not a codified policy.

When one of these is designed, it earns a section here (or its own doctrine), grounded in the real
instance — not before.

---

## 8. Checklist

A family repo is correctly on the staging pipeline when…

- [ ] **It exists on the stage under the same owner as on GitHub** (§2) — same user/org/repo
      namespace; divergence reconciled at the point of change, not swept later.
- [ ] **The mirrored org/repo carries the Bootstrap shape** (§2) — cited, not restated; the stage
      matches GitHub's org profile + ruleset, it does not invent a different one.
- [ ] **The stage uses the same users as GitHub** (§3) — both family accounts co-own every mirrored
      org; one is site admin.
- [ ] **The default branch is gated** (§4): status check required where a workflow exists; non-owner
      direct push blocked (PR required) where none does; **owners on BOTH the push and merge
      allowlists**; the bar never lowered to unblock the owner.
- [ ] **No sentence in the deployment's setup has leaked into this doctrine, and no principle has
      leaked out of it into machine notes** (§5).
- [ ] **CBB is excluded by explicit refusal, not omission** (§6), and that exclusion is not mistaken
      for a mirror gap.
- [ ] **Undesigned areas are named as seams** (§7), not left as silent gaps.
