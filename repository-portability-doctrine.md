# Repository-Portability Doctrine

**Scope: cross-project.** How repositories address one another so that moving, renaming, or
re-organising a checkout never breaks a build, a link, or a contributor's clone. A repository
depends on *what* it needs — by the dependency's **identity** — never on *where it happens to sit
relative to the consumer* in one checkout.

A multi-repo ecosystem couples its repositories together constantly: one crate builds against
another, one package imports a second, a README links a sibling's doc, a service's CI checks out a
shared contract. Each coupling has to say *which* other repository it means. There are two ways to
say it. One names the repository **by its identity** — an address anchored to *what the repository
is*: a registry coordinate, a git ref, or a URL when it has a remote; the repository's own
identity-derived location (§1) when it does not. The other names it **by where it currently sits
relative to you** — `../CommonTongue/rust`. The first survives any move, because a repository's
identity does not change when folders do. The second is a machine-local fact wearing the costume of a
dependency: it holds only as long as nobody moves anything, and the first time the checkout is
re-organised, every position-relative coupling in the tree is silently wrong at once.

**This doctrine composes existing ones and restates none of them.** It is the physical-layout
companion to the [Single-Source-of-Truth Doctrine](single-source-of-truth-doctrine.md):
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

> **Couple by identity, not by consumer position.** A dependency is named by *what it is* — a remote
> coordinate (a name, URL, git ref, or registry coordinate) when it has a remote, or its own
> **identity-derived local repository** when it does not — never by *where it happens to sit relative
> to you* in one checkout.

A **consumer-relative** path (`../CommonTongue/rust`, `file:../CommonTongue/ts`) is not a weaker form
of identity — it is a different kind of statement. It asserts a fact about **where you sit on this
machine's disk** relative to the dependency, and that fact is true today only by coincidence: one
`git mv` — of your repository or the dependency's — ends it. A repository's identity does not move
when folders do; your position relative to it does.

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

## 2. Name a dependency by its identity — remote when it has one, the local repo when it doesn't

There are four channels through which repositories couple. Each is named by the dependency's
**identity**, never by your position relative to it. Identity takes two forms — a **remote
coordinate** once the dependency is published, and the **local repository itself** while it is not.

| Coupling | Wrong (consumer-relative path) | Right (by identity) |
|---|---|---|
| **Build dependency** | `commontongue = { path = "../CommonTongue/rust" }` | **Published:** a package (registry name + version) or a **git dependency** (`git = "…", tag = "…"`). **Pre-remote:** the **local repository** at its identity-derived location (below). |
| **Package import** | `"commontongue": "file:../CommonTongue/ts"` | **Published:** a registry package (`"commontongue": "^1.2.0"`) or a **git URL** dependency. **Pre-remote:** the **local repository** (below). |
| **Doc / README link** | `../../CommonTongue/rust/README.md` | the repository's **URL** (`github.com/<Org>/CommonTongue`), or a within-repo relative link that never crosses a repo boundary |
| **CI checkout** | assuming a sibling directory is present | an explicit **checkout of the named repository** at a pinned ref |

Once a remote exists, the coordinate is governed by the [Interface Stability
Doctrine](interface-stability-doctrine.md): you depend on a **version** of a published interface, so
the producer can evolve without breaking you. Both forms are identity; neither pins you to *where
someone's working tree happens to sit right now*.

**Before a remote exists, the local repository is the identity you have — couple to it.** A
dependency still in flux (additive, pre-V1) should not be forced onto a remote prematurely; the
honest coordinate is the local repo at its identity-derived location (`~/repositories/<Org>/<repo>`,
§1, §5). This is a first-class coupling, not a stopgap to apologise for — with one obligation: the
local path is **derived data**, computed from the layout convention, so it is **re-derived on every
reorg** (§3, §6), never fossilised. When the dependency publishes, the coupling migrates to its
remote coordinate — an *additive* change to the consumer; nothing already written breaks.

---

## 3. The anti-pattern is a *fossilised* position-relative path — and it breaks the build, not just a link

Coupling to a local repository is not the anti-pattern; the pre-remote case (§2) does exactly that,
legitimately. The anti-pattern is narrower: a path anchored to **your position** relative to the
dependency (`../CommonTongue/rust`) and then **left to fossilise** — written once and never re-derived
when the layout moves. Two things make it dangerous:

- **It's a build failure, not a broken link.** A stale doc link is annoying — a 404 a reader routes
  around. A stale build path is a hard failure: `cargo build` or `npm install` cannot find
  `../CommonTongue/rust`, and nothing warned you when it was written, because it *worked* while the
  sibling happened to be there. It stops working the instant the checkout is re-organised, and for
  everyone at once.
- **It hides its own assumption.** A position-relative hop across a repository boundary
  (`../<AnotherRepo>/…`) silently encodes *"that repo sits exactly there, relative to me"* — a guess
  that was true only by coincidence. Within one repository a relative path is fine: the repository
  moves as a unit, so the link survives. The failure is a boundary-crossing hop treated as
  **write-once** instead of as derived data recomputed on every move.

So the fix is not "never point at a local repo" — it is **anchor to the dependency's identity, and
re-derive on reorg.** A pre-remote local coupling recomputed when the layout changes is disciplined;
the same path left to rot is the anti-pattern.

> **Ecosystem:** DeckLibre's Cargo workspace couples only to its **own** crates (`crates/decklibre-*`)
> — all within-repo, so it survived the flat→org-dir move untouched. **CommonTongue's path dependency
> is the pre-remote case, adopted as a deliberate decision:** it stays remote-less until its interface
> solidifies at V1, and while that interface is still additive and in flux a remote would be
> premature. Its README recommends `commontongue = { path = "../CommonTongue/rust" }` — a legitimate
> local coupling whose *only* bug is that the relative form was not re-derived for the org-dir layout:
> a consumer now under `StudioEnsemble/` no longer sits one hop from `CommonPractices/CommonTongue`,
> so the fossilised `../CommonTongue/rust` misses. What the reorg demands is to **recompute that local
> path from the two repos' identity locations**, not to invent a remote CommonTongue does not yet
> have.

---

## 4. Off-machine consumers force the remote form

The local form of identity (§2) has one boundary: it resolves **only on this machine.** The decisive
question is **does the thing on the other end run here?** If it does not — CI, another contributor's
clone, a downstream consumer in a different org, a doc rendered on the forge's website — then
`~/repositories/` **does not exist there**, and neither does any local path.

So the moment a dependency gains an off-machine consumer, its coupling **must** take the remote form:
a git ref, a registry coordinate, a repository URL. This is what *forces* the pre-remote → published
migration (§2): a purely-local, pre-remote dependency legitimately couples to the local repo because
it has no off-machine consumer yet; the first one that appears is the event that requires the remote
coordinate. The local `~/repositories/<Org>/<repo>` convention (§5) can carry a **local, maintained**
coupling — but it can never back a **published** artifact, precisely because that artifact travels to
places the convention doesn't reach.

> **Ecosystem:** CommonTongue is *meant* to be consumed across organisations — LiteController under
> `StudioEnsemble/`, and others elsewhere — but it has **no off-machine consumer yet** and, by
> decision, no remote until its interface solidifies at V1. So today the local coupling is correct.
> The day a consumer builds off-machine — a CI runner, an outside clone — `../CommonTongue/rust` and
> `~/repositories/…` alike stop resolving, and the coupling must become a published version or a git
> ref, which is also exactly what lets CommonTongue be versioned and depended on the way the Interface
> Stability Doctrine requires. That migration is scheduled by *that* event; it is not owed now.

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
- **The convention backs only *local, maintained* couplings — never a published one.** A pre-remote
  local dependency (§2) does rely on it, and that is allowed *because the reliance is acknowledged and
  re-derived on every reorg* (§6), not hidden. What is forbidden is a **published** artifact — or
  anything that travels off this machine (§4) — relying on it, and any reliance left to fossilise. If
  an off-machine build or a shipped link breaks when this convention changes, that is a §0 violation.

> **Ecosystem:** the six family repositories materialise as
> `~/repositories/CommonPractices/{CommonMind,CommonFraming,CommonTongue}`,
> `~/repositories/StudioEnsemble/{CameraConductor,LiteController}`, and
> `~/repositories/DeckLibre/DeckLibre`. Given any `(Org, name)` the path is computable; given any
> path the identity is readable back. The mapping is total in both directions — which is the whole
> point of deriving it instead of inventing it.

---

## 6. Re-organisation is the trigger that proves the coupling

Moving a repository — a flat layout into org directories, one org into another, a rename — is the
event that separates a real dependency from a coincidental one. It is a high-cascade trigger in the
[Single-Source-of-Truth Doctrine](single-source-of-truth-doctrine.md) §8 sense, and it
fires this doctrine's obligation:

- **Before a move, grep for every cross-boundary path.** Search the tree for `../` hops in build
  files, `path =` / `file:` dependencies, and cross-repo relative links — you cannot trust memory to
  enumerate them ([SSoT Doctrine](single-source-of-truth-doctrine.md) §6).
  Each hit is one of two things: a coupling that should have been **remote** (a published dependency
  named by a path — convert it), or a **pre-remote local** coupling (§2) whose path must be
  **re-derived** for the new layout. Either way it is handled *before* the layout changes under it.
- **A repository is portable when a move costs it no *authoring* — only re-derivation.** If relocating
  a checkout forces you to *rethink* a dependency — invent a coordinate, rewrite a guess — it was
  coupled to your position, not to identity. A pre-remote local path is allowed to be **recomputed**
  from the convention (it is derived data); what must never happen is a reference that has to be
  re-*decided*.

> **Ecosystem:** the flat→org-dir migration was exactly this trigger. DeckLibre needed **no** build
> edits (all couplings within-repo), and its doc references to sibling repos already used canonical
> names, so they survived. What the move exposed is **CommonTongue's pre-remote local coupling**: its
> README recommends `path = "../CommonTongue/rust"`, and **LiteController's spec** plans to adopt that
> same form (flagged ⚠️ there). This is not a coordinate to invent a remote for — CommonTongue has no
> remote by decision until V1 — it is a local path to **re-derive** for the org-dir layout so it
> resolves again. (CameraConductor is still docs-only with no manifest, so there is nothing to
> re-derive there yet.)

---

## 7. Checklist

Before adding a cross-repository coupling, and before moving or renaming any repository:

- [ ] The coupling names the other repository **by its identity** (§0, §2), never by your position
      relative to it — a **remote coordinate** (package + version, git ref, URL) if it has a remote,
      or its **identity-derived local repository** if it does not.
- [ ] Any **pre-remote local** coupling (§2) is treated as **derived data** — computed from the layout
      convention and re-derived on every reorg (§6), never authored once and left to fossilise (§3).
- [ ] Anything with an **off-machine consumer** — CI, another clone, a downstream consumer, a rendered
      doc link — uses the **remote** form, because `~/repositories/` isn't there (§4).
- [ ] No **published** artifact, and nothing that travels off-machine, relies on the local
      `~/repositories/<Org>/<repo>` convention (§4, §5); a local coupling that does rely on it is
      acknowledged and maintained, not hidden.
- [ ] The local checkout sits at **`~/repositories/<Org>/<repo>`**, its path **derived** from identity
      (§1, §5), not hardcoded.
- [ ] On a **move / rename / re-org** (§6), the tree was **grepped** for cross-boundary paths and each
      was either **converted** to a remote coordinate or **re-derived** for the new layout before the
      move.
