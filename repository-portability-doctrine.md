# Repository-Portability Doctrine

**Scope: cross-project.** How repositories address one another so that moving, renaming, or
re-organising a checkout never breaks a build, a link, or a contributor's clone. A repository
depends on *what* it needs — by a coordinate that resolves anywhere — never on *where that thing
happens to sit* on one machine's disk.

A multi-repo ecosystem couples its repositories together constantly: one crate builds against
another, one package imports a second, a README links a sibling's doc, a service's CI checks out a
shared contract. Each coupling has to say *which* other repository it means. There are two ways to
say it, and they look almost identical until the day the layout changes. One names the repository
by an address that resolves on every machine — a package name, a registry coordinate, a git remote,
a URL. The other names it by *where it currently sits in this checkout* — `../CommonTongue/rust`.
The second is a machine-local fact wearing the costume of a dependency, and it holds only as long as
nobody ever moves anything. The first time the checkout is re-organised, every path-coupling in the
tree is silently wrong at once.

**This doctrine composes existing ones and restates none of them.** It is the physical-layout
companion to the [Single-Source-of-Truth Doctrine](docs/_working/2026-07-17-single-source-of-truth-doctrine.md):
a repository's identity has **one home**, and its local path is *derived* from that identity, never
a second truth that can drift. It extends the [Conventions Doctrine](conventions-doctrine.md)'s
rule — *resolve a location from its convention, never hardcode a home path* — from a program's OS
config directory to a repository's inter-repo couplings. And it leans on the
[Interface Stability Doctrine](interface-stability-doctrine.md) for the *how* of an
off-machine coupling: a consumer depends on a **published, versioned interface** reached by a stable
coordinate, not on a producer's working tree.

The worked example throughout is **CommonTongue and its consumers** — a shared contract repository
that DeckLibre, CameraConductor, and LiteController are all meant to build against. The pattern is
not CommonTongue's; the example is. Any repository that another repository depends on has the same
choice to make.

---

## 0. The load-bearing rule

> **Couple by identity, not by checkout path.** A dependency names *what* it needs, by a coordinate
> that resolves on any machine — a name, a URL, a git ref, a registry coordinate. It never names
> *where that thing happens to sit* in one checkout.

A checkout path (`../CommonTongue/rust`, `file:../CommonTongue/ts`) is not a weaker form of the same
thing — it is a different kind of statement. It asserts a fact about **this machine's disk layout**
and smuggles it into a file that will be read on other machines, in CI, and after the next
reorganisation. It is true today by coincidence, and the coincidence is one `git mv` from ending.

---

## 1. A repository's identity is `(Org, name)`; its local path is derived from it

A repository is identified by the pair **`(organisation, repository-name)`** — the same pair its
git remote already carries (`github.com/<Org>/<name>`). That identity is stable, global, and the one
home for "which repository is this."

Locally, the checkout **materialises** at a deterministic address computed from that identity:
**`~/repositories/<Org>/<repo>`**, the directory named exactly for the repository's organisation.
The local path is an *output* of identity, not an input to anything. Given `(CommonPractices,
CommonTongue)` you can compute `~/repositories/CommonPractices/CommonTongue` — you never have to
store it, and nothing committed to the tree should depend on it.

> **Ecosystem:** `commontongue` is `(CommonPractices, CommonTongue)`. On this machine that resolves
> to `~/repositories/CommonPractices/CommonTongue`; on CI it resolves to a checkout path the runner
> chose; in a contributor's clone it resolves to wherever they keep their work. All three are the
> *same repository* — the identity is shared, the path is local scenery.

---

## 2. Declare a dependency by a coordinate that resolves anywhere

There are four channels through which repositories couple, and each has a coordinate that resolves
off this machine. Use it — never the checkout path.

| Coupling | Wrong (checkout path) | Right (resolves anywhere) |
|---|---|---|
| **Build dependency** | `commontongue = { path = "../CommonTongue/rust" }` | a **published package** (registry name + version), or a **git dependency** (`git = "…", tag = "…"`) |
| **Package import** | `"commontongue": "file:../CommonTongue/ts"` | a **registry package** (`"commontongue": "^1.2.0"`), or a **git URL** dependency |
| **Doc / README link** | `../../CommonTongue/rust/README.md` | the repository's **URL** (`github.com/<Org>/CommonTongue`), or a within-repo relative link that never crosses a repo boundary |
| **CI checkout** | assuming a sibling directory is present | an explicit **checkout of the named repository** at a pinned ref |

The coordinate you pick is governed by the [Interface Stability Doctrine](interface-stability-doctrine.md):
you depend on a **version** of a published interface, so the producer can evolve without breaking
you. A checkout path pins you to whatever is in someone's working tree *right now* — the opposite of
a stable contract.

---

## 3. A checkout-relative path is the anti-pattern — and it breaks the build, not just a link

The reason this is a doctrine and not a style note: a path coupling in a **build file** is a
different severity of failure from a path coupling in prose.

- **A stale doc link is annoying.** A reader hits a 404, notices, and routes around it. The failure
  is visible and local.
- **A stale build path is a hard failure that hides until the layout moves.** `cargo build` or
  `npm install` cannot find `../CommonTongue/rust`, and nothing warned you when the path was written
  — it *worked*, because the sibling happened to be there. It stops working the instant the checkout
  is re-organised, and it stops working for everyone at once.

The tell is a relative hop that **crosses a repository boundary**: `../<AnotherRepo>/…`. Inside one
repository, a relative path is fine — the whole repository moves as a unit, so a within-repo link
survives any relocation. The moment the `..` climbs out of your own repository and into a sibling,
you have hardcoded a disk-layout assumption.

> **Ecosystem:** DeckLibre's Cargo workspace couples only to its **own** crates
> (`crates/decklibre-*`) — all within-repo, so it survived the flat→org-dir move untouched.
> **CommonTongue's README recommends the opposite:** its stated consumption model is
> `commontongue = { path = "../CommonTongue/rust" }` (and `"commontongue": "file:../CommonTongue/ts"`
> for the TS side) — a boundary-crossing `..` that expects CommonTongue next door. That advice was
> correct under the flat layout and is wrong under the org-dir layout, with no edit in between: a
> consumer under `StudioEnsemble/` that follows it resolves `../CommonTongue/rust` to a sibling that
> isn't there, because CommonTongue now lives under `CommonPractices/`. The shared repo has
> institutionalised a coupling that was never really a dependency — just a coincidence of where the
> folders sat.

---

## 4. Off-machine coupling never sees your disk

The decisive question for any coupling: **does the thing on the other end run on this machine?** If
it does not — CI, another contributor's clone, a downstream consumer in a different org, a
doc rendered on the forge's website — then `~/repositories/` **does not exist there**, and neither
does any path relative to it.

For everything that must resolve off this machine, the coordinate is necessarily identity-based: a
git ref, a registry coordinate, a repository URL. This is not a second rule; it is §0 seen from the
outside. The local `~/repositories/<Org>/<repo>` convention (§5) is a **convenience for humans and
tooling on one machine** — it is never the thing a committed artifact couples to, precisely because
the artifact travels to places the convention doesn't reach.

> **Ecosystem:** CommonTongue is meant to be consumed across organisations — LiteController under
> `StudioEnsemble/`, and others elsewhere. A path coupling cannot serve that: `../CommonTongue/rust`
> is not a place that exists in LiteController's CI runner or in an outside contributor's clone. The
> coordinate that *does* resolve there is an identity one — a published package version or a git ref
> — which is also exactly what lets CommonTongue be published, versioned, and depended on the way the
> Interface Stability Doctrine requires. That its README currently recommends the path form is the
> gap this section names.

---

## 5. The local convention: `~/repositories/<Org>/<repo>`

On a working machine, every repository lives at **`~/repositories/<Org>/<repo>`** — a directory per
organisation, each repository under its org. The convention exists so a local path is **derivable
from identity** (§1) rather than remembered, and so tooling can find any repository from its
`(Org, name)` alone.

Its discipline is entirely local:

- **Derive, never hardcode.** Compute the path from `(Org, name)`; never write the old flat
  `~/repositories/<repo>` form, and never assume a fixed **relative** position between two repos in
  different org directories — after the reorg they are no longer siblings.
- **The convention is not a dependency surface.** Nothing committed to any repository may rely on it.
  It is scaffolding for the human and the tools, not a contract. If a build, a link, or a script
  breaks when this convention changes, that break is a §0 violation — a checkout path in disguise.

> **Ecosystem:** the six family repositories materialise as
> `~/repositories/CommonPractices/{design-doctrine,blueprints,CommonTongue}`,
> `~/repositories/StudioEnsemble/{CameraConductor,LiteController}`, and
> `~/repositories/DeckLibre/DeckLibre`. Given any `(Org, name)` the path is computable; given any
> path the identity is readable back. The mapping is total in both directions — which is the whole
> point of deriving it instead of inventing it.

---

## 6. Re-organisation is the trigger that proves the coupling

Moving a repository — a flat layout into org directories, one org into another, a rename — is the
event that separates a real dependency from a coincidental one. It is a high-cascade trigger in the
[Single-Source-of-Truth Doctrine](docs/_working/2026-07-17-single-source-of-truth-doctrine.md) §8 sense, and it
fires this doctrine's obligation:

- **Before a move, grep for the anti-pattern.** Search the tree for boundary-crossing path
  couplings — `../` hops in build files, `path =` / `file:` dependencies, cross-repo relative links —
  because you cannot trust memory to enumerate them ([SSoT Doctrine](docs/_working/2026-07-17-single-source-of-truth-doctrine.md)
  §6). Every hit is a coupling to convert from path to identity *before* the layout changes under it.
- **A repository is portable when a move requires zero edits to it.** If relocating a checkout forces
  you to fix references inside a repository, those references were coupled to the layout, not to the
  identity. The goal state: you can move any repository anywhere and nothing inside any repository
  needs to change, because nothing inside any repository ever named a path across a boundary.

> **Ecosystem:** the flat→org-dir migration was exactly this trigger. DeckLibre needed **no** build
> edits (all couplings within-repo), and its doc references to sibling repos already used canonical
> names, so they survived. The couplings the move exposed are **CommonTongue's own consumption
> model** — its README still recommends `path = "../CommonTongue/rust"` — and **LiteController's
> spec**, which plans to adopt that same path form (already flagged ⚠️ there). Converting those to an
> identity coordinate, before a consumer's manifest is written against the path, is what makes the
> next move a non-event. (CameraConductor is still docs-only with no manifest, so it has nothing to
> convert yet — the place to fix this is the recommendation, before it is copied into a build file.)

---

## 7. Checklist

Before adding a cross-repository coupling, and before moving or renaming any repository:

- [ ] The coupling names the other repository by a coordinate that **resolves on any machine** (§0,
      §2) — a package name + version, a git ref, or a URL — never a checkout path.
- [ ] No build file, package manifest, or committed script contains a **boundary-crossing** `../`,
      `path =`, or `file:` reference to another repository (§3). Within-repo relative paths are fine.
- [ ] Anything that must resolve **off this machine** (CI, another clone, a downstream consumer, a
      rendered doc link) uses an identity coordinate, because `~/repositories/` isn't there (§4).
- [ ] The local checkout sits at **`~/repositories/<Org>/<repo>`**, and its path was **derived** from
      identity, not hardcoded and not assumed relative to a sibling in another org dir (§1, §5).
- [ ] Nothing committed **depends on** the local convention (§5) — if it breaks when the layout
      changes, it's a checkout path in disguise.
- [ ] On a **move / rename / re-org** (§6), the tree was **grepped** for boundary-crossing path
      couplings and each was converted to an identity coordinate before the move.
