# Licensing Doctrine

**Scope: cross-project.** Which licence a family repo gets, and the one question that decides it.
Codifies a pattern the family already follows repo-by-repo — it was practised before it was
written, and writing it down stops the licence being re-guessed (wrongly) each time.

It exists for one reason: **licence is not a per-repo whim, and it is not a family default.** It
is a deliberate answer to a single question about what the repo *is* — and getting it wrong in
either direction hurts. A permissive licence on a product you meant to protect invites exactly the
reselling you didn't want; a restrictive licence on a contract meant for universal adoption
strangles the ecosystem the contract exists to create.

---

## 0. The load-bearing rule

> **The licence answers one question about what the repo IS: could a cloud/commercial entity
> plausibly take this and stand it up as their own product or managed service (or resell/bundle it
> as-is) for their profit? If YES → protect it (BSL). If NO — including because the repo is a
> contract whose whole purpose is to be implemented by anyone → open it (Apache). Decided per repo,
> by the owner.**

The owner's framing: *"I do not want some commercial entity reselling my hard work for free. I do
not care if commercial entities USE my work and tooling."* **Use is welcome, including commercial
use. Strip-mining the work — operationalizing it into someone else's paid product or service — is
what is refused.** That is precisely the MongoDB / Elasticsearch / Redis story: a hyperscaler took
the maintainer's work and stood it up as a hosted, monetized service (managed DB, managed search,
managed cache). The threat is not "someone read my code" — it is **"someone with a platform turned
my work into their product and captured the value."**

### 0.1 The test — run it in order, stop at the first YES

The **"AWS test"** is the sharp lead, because it keys on what the repo *is*, not on what you'd
tolerate:

1. **Could a cloud/commercial entity operationalize this into a product or managed service?**
   ("Would this make a plausible AWS/SaaS offering — hosted, monetized, at scale?")
   → **YES → BSL (protected).** *(The primary test. An app, a control service, an engine, a
   backend others send data to — all pass it. A managed-anything is the tell.)*
   **Distinguish a service from a client, though:** a **local tool/client an operator runs against
   their *own* systems** (a debugger, a CLI, a viewer) is **not** a managed-service candidate —
   there is nothing to host; the operator points it at their own systems. A managed-observability
   SaaS is *an agent + a hosted backend*, which is a service (BSL); the local viewer the operator
   runs is a client (Apache). When a tool looks borderline, this client-vs-service line is the
   tie-breaker. *(This is the Oscura calibration — see §4.)*
2. **Could a commercial entity resell or bundle it as-is for a fee — e.g. shipped on their hardware
   or inside their paid product?**
   → **YES → BSL (protected).** *(The second prong — resale/bundling, not a hosted service. The
   BSL's own "bundling with hardware/products offered for sale" clause.)*
3. **Is the repo a contract / spec / protocol / shared vocabulary / reference whose entire purpose
   is to be implemented and adopted by anyone?**
   → **YES → Apache (open infrastructure).** *(A spec cannot be strip-mined — you cannot host "a
   contract" as a service; it exists to be implemented. Protecting it would only strangle the
   adoption it is for.)*
4. **None of the above — a genuine one-off / small utility with no product value to protect and no
   ecosystem to seed?**
   → **MIT (throwaway).**

**The seam the test cuts: open the standard, protect the implementation.** A protocol (Q3 → Apache)
and the product that implements it (Q1 → BSL) are *different repos with different licences*, by
design — the open contract even *helps* the protected product, because a competitor who wants a
client can write their own against the open spec (the ecosystem working) but cannot remarket *your*
implementation.

**Corner cases exist — when Q1–Q4 don't give a clean answer, the owner decides.** The test is built
to make the *common* case a one-line determination, not to eliminate judgment. A repo that is
genuinely ambiguous (a library that is half-shared-infra, half-product; a reference implementation
that is also a shippable tool) is an **ask-the-owner**, not a coin-flip — see §3.

---

## 1. The three tiers

Every family repo falls into one of three, decided by the §0.1 test:

| Tier | What it is (which test question) | Licence | Why |
|------|----------------------------------|---------|-----|
| **Protected product** | Something a cloud/commercial entity could operationalize into a product or managed service, or resell/bundle as-is (Q1 or Q2 → YES) — a shipping tool/app, a control service, an engine, the owner's load-bearing hard work. | **BSL 1.1** (source-available; §2) | Use freely, including commercially; but you may not stand it up as a paid/hosted service, resell it, or bundle it for sale without a commercial licence. Converts to open on the Change Date. |
| **Open infrastructure** | A **contract, spec, protocol, shared vocabulary, or reference** whose whole purpose is to be implemented and adopted by anyone (Q3 → YES). | **Apache-2.0** (permissive, with patent grant) | It **cannot be strip-mined** — you cannot host "a contract" as a service; it exists to be implemented. Protecting it would only strangle the adoption it is for. Apache over MIT for the explicit patent grant, appropriate to anything protocol-shaped. |
| **Throwaway / one-off** | A genuine one-off / small utility with no product value to protect and no ecosystem to seed (Q4). | **MIT** (permissive, minimal) | Nothing to protect, nothing to seed — minimal-friction permissive. Do not over-think it. |

**The split runs cleanly along one seam: open the standard, protect the implementation.** A
protocol and the product that implements it are *different repos with different licences* — and
that is correct, not inconsistent. The open contract even *helps* the protected product: a
competitor who wants a client can write their own against the open spec (the ecosystem working as
intended), but they cannot remarket *your* implementation.

## 2. The BSL shape (protected tier)

The family's BSL is **Business Source License 1.1** with these parameters (the DeckLibre / kiln
template — reuse it, do not re-draft):

- **Licensor:** the owner. **Licensed Work:** the repo, `(c) <year> <owner>`.
- **Additional Use Grant:** free to use, modify, and distribute for **any non-Commercial-Use**
  purpose. **Commercial Use** — reselling the work for a fee, offering it as a paid or
  commercially-hosted service, or bundling it with hardware/products offered for sale — requires
  a separate commercial licence from the licensor.
- **Change Date:** four years from each version's first publication; on that date the version
  converts to a stated open licence (the family's is **Apache-2.0**, matching the open tier).
- **"Business Source License" is a MariaDB trademark** — the header says so; keep it.

BSL is **source-available, not OSI-open** — say so honestly wherever the distinction matters (an
org named `*-foss` mislabels a BSL repo; the org README and any "open source" claim must not
overstate it).

## 3. Decided by the owner, per repo — never defaulted

- **The owner decides the tier**, repo by repo, at creation. An agent does **not** default to the
  family's most common licence (Apache) out of habit — that is precisely the failure this doctrine
  prevents (a protected product silently shipped permissive). If the tier is not obvious, **ask**;
  the reseller test is a one-line question the owner answers.
- **A repo's `LICENSE` is set at scaffold time** ([org-and-repo-bootstrap](org-and-repo-bootstrap-doctrine.md))
  and its tier recorded where the repo's decisions live.
- **A CONTRIBUTING/README that states the licence must state it correctly** — a BSL repo does not
  call itself "open source"; an Apache repo does not imply restrictions it doesn't have.

---

## 4. The family, as licensed (worked examples, verified on disk)

The pattern was already in place before this doctrine — this is what made it codifiable:

- **Open infrastructure → Apache-2.0:** `CommonTongue` (the contract), the debug-channel
  contract (Debugging Doctrine + blueprint), all of **SurfaceWorks** (Codex / Palette / Lucidity —
  the shared vocabulary + reference renderer), `CameraConductor`. *Open the standard.*
- **Protected product → BSL 1.1:** **DeckLibre**, **kiln** (products a commercial entity could
  operationalize or bundle-for-sale). *Protect the implementation.*
- **Throwaway / one-off → MIT:** `medit`, `esp-idf-ds3231`, `autopilot-web`, `ulanzi-obs-plugin`.
- **Open — but a client/tool, not a contract → Apache-2.0:** **Oscura** (the debug client). See the
  nuance below.

> **Oscura sharpens Q1 — a *client* is not a *managed service*.** Oscura implements the debug
> surface/spec (which is itself Apache — open the standard), and at first glance a
> debug/observability tool *looks* like Q1 → BSL, because "managed observability" is a whole SaaS
> industry. But those SaaS products are an **agent + a hosted backend you send your data to**;
> Oscura is a **local client an operator runs to connect to their *own* debug channel** — there is
> no "Oscura-as-a-service" to host, because the operator points it at their own systems. A
> hyperscaler cannot operationalize a local viewer the way it operationalized MongoDB into
> DocumentDB. **So Q1 is NO, and Oscura is Apache** — an owner override (2026-07-21) that revealed
> the calibration: *a local tool/client an operator runs against their own systems is not a
> managed-service candidate; a service others send their data to, or a product bundled for sale,
> is.* When Q1 is genuinely uncertain for a tool, that distinction is the tie-breaker — and a
> genuinely ambiguous case remains an ask-the-owner (§3).

---

## 5. Checklist

- [ ] **§0.1 test run in order:** Q1 could a cloud entity make it a managed service? / Q2 resell or
      bundle it as-is? → **BSL**. Q3 is it a contract meant to be implemented? → **Apache**. Q4
      genuine one-off? → **MIT**. Stop at the first YES.
- [ ] **Tier chosen by the owner, not defaulted** (§3) — a genuinely ambiguous repo is an
      ask-the-owner, never auto-Apache out of habit.
- [ ] **Licence matches tier** (§1): protected → BSL 1.1 (family template, §2); open
      infrastructure → Apache-2.0; throwaway → MIT.
- [ ] **`LICENSE` set at scaffold time**, tier recorded where the repo's decisions live.
- [ ] **Claims are honest** (§2–§3): a BSL repo is **source-available, not "open source"**; an
      Apache repo doesn't imply restrictions it lacks; a `*-foss` label never covers a BSL repo.
