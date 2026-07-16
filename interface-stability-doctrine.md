# Interface Stability Doctrine

**Scope: cross-project.** How a **published interface** — a wire protocol, an API, a shared schema,
any contract other programs are built against — evolves **without ever breaking the programs that
depend on it.** The rule is old and it is Torvalds': *we do not break userspace.* This doctrine is
how that becomes structural rather than aspirational.

It is the **evolution-and-versioning** companion to the
[Forward-Compatible Format Doctrine](forward-compatible-format-doctrine.md) — that one shapes a
*single format's internal leaves* so a future capability is additive; this one governs *how the
whole interface changes over time and how peers agree on which version they speak.* They are
neighbours, not the same rule.

The worked example throughout is **CommonTongue** — the family's shared wire contracts (a protobuf
schema serialized as ProtoJSON). The pattern is not CommonTongue's; the example is.

---

## 0. The load-bearing rule

> **A published interface is a permanent contract with its consumers. The burden of compatibility is
> always on the interface, never on the consumer. A program written against it years ago must still
> work today — so the interface may GROW, but it may never SHRINK, retype, or tighten. When a
> genuine break is unavoidable, you publish a NEW version alongside the old; you never mutate the
> old one in place.**

The failure this prevents: a shared interface ships a "small cleanup" — a renamed field, a tightened
type, a removed method — and every consumer that has not been rebuilt against the change breaks at
once, in the field, at the worst time. The interface's owner saved themselves a little tidiness and
spent everyone else's reliability to do it. **The consumer's working code is sacred. The interface
serves it, not the reverse.**

---

## 1. Additive-only: grow, never shrink

The mechanical rule that implements §0. An interface may **add**; it may never do anything a consumer
could be relying on the absence of.

**Allowed (additive):** a new optional field · a new message/endpoint · a new enum value *(with the
caveat in §2)* · a new optional parameter.

**Forbidden (breaking), forever:** removing a field · renaming a field · changing a field's type ·
making an optional field required · narrowing a range or tightening a constraint · repurposing an
existing field's meaning · reusing an identifier that once meant something else.

**Identifiers are immutable.** A field number, a message tag, a route — once assigned a meaning, it
carries that meaning forever. A removed field's slot is **reserved, never reused.** This is the
single most reliable structural guard: if the wire identity of a field cannot be reassigned, a whole
class of silent breakage cannot occur.

> **CommonTongue:** the contract is protobuf, whose **immutable field numbers** make "grow, never
> shrink" a *property of the format*, not a discipline — you cannot renumber or reuse a field, and a
> removed field's number is reserved. Additive changes (a new field, a new `oneof` arm, a new message
> in the `Frame` envelope) are legal; everything in the forbidden list is refused by the gate (§4).

---

## 2. The contract has two halves — and BOTH must hold

Additive-only works **only if consumers ignore what they don't recognise.** State both halves,
because a scheme that disciplines only the producer silently fails:

- **Producers only add.** (§1.)
- **Consumers tolerate the unknown.** A consumer **must silently skip** a field, an enum value, or a
  message type it does not recognise — never reject, never crash. A ten-year-old client meeting a
  message full of fields it has never seen must read the ones it knows and ignore the rest.

If either half is missing, forward-compatibility is a fiction. The classic wreck is a disciplined
producer and a brittle consumer that throws on an unknown field — the producer kept its promise and
the consumer broke anyway. **Tolerate-unknowns is not optional politeness; it is half the contract.**

> This mirrors the [Documentation Doctrine](documentation-doctrine.md)'s and
> [Confidence-Scoring Doctrine](confidence-scoring-doctrine.md)'s treatment of unknown data: an
> unrecognised thing is *skipped and noted*, never fatal. Here it is load-bearing for wire survival.

---

## 3. Versioning: whole-interface, born at V1, parallel not in-place

When a change genuinely cannot be additive, you do not break §1 — you **cut a new version.**

**Whole-interface ("all or nothing"), not per-element.** The entire interface carries one version;
a break anywhere forks the whole interface to the next version, published **alongside** the old. The
alternative — versioning each message/type independently — turns "are we compatible?" into a
*matrix* of per-element versions, which multiplies the states a peer can be in and the ways it can be
subtly wrong. **Reliability's enemy is combinations; one version number is one unambiguous answer.**
(This is the ordering a reliability-first project's values demand: coarseness is a small,
rarely-paid cost; an incoherent half-a-version is a permanent failure surface.) Whole-interface is
also the proven pattern for a service exposing a contract to many clients (the `/v1/`, `/v2/` of the
web).

**Born at V1 — there is no null version.** Every interface is versioned *explicitly, from its first
line*, `V1`. Versioning is never bolted on later — a "version 0 that predates the version field" is
the artefact that makes the first real break a breaking change.

**Parallel, never in-place.** `V2` lives *beside* `V1`; V1 consumers keep working against V1
untouched. A version is not a migration of the old contract — it is a second contract. Old callers
are never forced to move.

> **CommonTongue:** the northbound contract is `commontongue.northbound.v1`. A genuine break becomes
> a new `…v2` package **alongside** v1, never an edit to v1. The coarseness is affordable precisely
> because §1 makes true breaks rare — and a v2 *reuses* every unchanged v1 type, so a fork is a new
> version *label* over mostly-shared shapes, not a mass rewrite.

---

## 4. Enforce it mechanically — a promise is not a guarantee

"We won't break userspace" held by good intentions erodes the first time a break is convenient. Make
it a **wall**, per [Decision Doctrine](decision-doctrine.md) *"make the invariant structural."*

- The interface is a **machine-readable schema** (an IDL / schema file), not prose. You cannot
  mechanically diff what was never formalised.
- A **breaking-change detector runs in CI as a required merge gate**, diffing the change against the
  last released version and **failing the build** on anything non-additive. A break does not merge;
  it becomes a new version.
- **Verify the gate by attack** (the family's standing rule): prove an additive change passes *and* a
  breaking change is refused, watched, before trusting it. A gate you have not seen reject a real
  break is a claim, not a guard.

> **CommonTongue:** `buf breaking` is the gate. It was **verified by attack** — an added field
> passed, a removed field was refused (*"field 2 'app' was deleted"*), and the versionless-meta lint
> exception was proven load-bearing by removing it and watching lint fail. The wall is real, not
> aspirational.

---

## 5. ⭐ The negotiation meta-layer is FROZEN — the one interface that is never versioned

Version negotiation happens *inside* the interface — a peer announces which version it speaks. But
the thing that carries that announcement **cannot itself be version-gated**, or it could not function
across a version boundary: how would two peers negotiate *which* negotiation format to use? This is a
real bootstrapping paradox, and it has one answer:

> **There is exactly one tiny, permanently-frozen, unversioned meta-layer whose sole job is to
> discover and negotiate every other version. It is minimal, it is forever, and it has no escape
> hatch — there is no "version 2" of the negotiator, ever.**

Because it can never be re-cut, it lives under the **strictest** form of §1: additive-only forever,
and it must be **right the first time** (mitigated in practice by exercising it against several real
peers before it is frozen). Keep the frozen set **as small as possible — ideally exactly one**; if a
thing *can* be versioned, it must be, and it does not belong in the frozen layer.

The design, grounded in how mature protocols solved it (TLS 1.3, MCP, WebSocket):

- **A frozen recognition marker.** A constant that *never changes and is never negotiated on* — its
  only job is to let a peer recognise the frozen shape and fail cleanly on a value it does not
  understand. (TLS 1.3's `legacy_version`: present, hardcoded, and explicitly *not* used for
  negotiation — the bug that sank early TLS was servers negotiating on the field that should have
  been frozen.)
- **An identity.** *Which* service this is, so a peer confirms it reached the right server before
  trusting anything else. (The purpose the WebSocket handshake's magic value serves.)
- **An offered-versions LIST — not a scalar.** A peer advertises *all* the versions it speaks, so it
  can offer several at once and parallel versions (§3) can actually coexist. A list from day one is
  non-negotiable; a frozen scalar here is an unfixable mistake. (TLS 1.3's `supported_versions`.)

And the negotiation *semantics*, equally frozen:

- **Counter-offer, don't reject.** The receiver picks the highest version both speak and echoes it;
  if it speaks none of the offered versions, it **counter-offers its own best** rather than failing.
  A hard failure occurs *only* when there is genuinely no overlap. (MCP's `initialize`.)
- **Never reject on the unrecognised — negotiate down.** A peer must **never** refuse a connection
  merely because it sees a version id (or marker value) it does not recognise; it ignores what it
  doesn't know and negotiates over the overlap. This is §2's tolerate-unknowns applied to the
  handshake — and its violation is the named failure ("version intolerance") that caused years of
  real-world TLS breakage.

> **CommonTongue:** the frozen layer is the `commontongue.meta` package (deliberately *versionless* —
> a `.v1` suffix would structurally imply a `.v2` the negotiator can never have; a scoped lint
> exception records the deviation). `Hello { frame_marker, app, speaks[] }` and its
> `HelloAck { …, agreed, offered[], no_common_version }` are additive-only forever, with no
> `helloV2`. `frame_marker` is the frozen recognition constant; `speaks`/`offered` are lists;
> `no_common_version` is the *only* hard failure — every other difference negotiates down.

---

## 6. Relationship to neighbouring doctrine

- **[Forward-Compatible Format Doctrine](forward-compatible-format-doctrine.md)** shapes one format's
  leaves so a future *capability* is additive. This doctrine governs the *whole interface's*
  evolution and version negotiation. A project often needs both: forward-compatible leaves *inside* a
  stably-versioned interface.
- **[Data Format Doctrine](data-format-doctrine.md)** — the additive marker and version ids are
  *data the consumer reads*, not conventions or comments; and additive-only pairs with "annotate in
  data" (a new field, never a repurposed one).
- **[Spec Promotion Doctrine](spec-promotion-doctrine.md)** — "a version cuts around what is open."
  Parallel versioning is the wire-level expression of the same instinct: the new capability is an
  additive path that never holds the existing contract hostage.
- **[Decision Doctrine](decision-doctrine.md)** — "make the invariant structural" (§4, the CI gate)
  and "never widen a scoped rule into a law" (do not let additive-only's *mechanics* forbid a
  genuinely-needed break — that is what §3's versioning is for).

---

## 7. Checklist

- [ ] The interface is treated as a **permanent contract**: the burden of compatibility is on it, not
      its consumers.
- [ ] **Additive-only** — grow, never shrink; the forbidden list (remove/rename/retype/tighten/
      repurpose/reuse-id) never happens; **identifiers are immutable, removed slots reserved.**
- [ ] **Both halves** of the contract hold: producers only add **and** consumers silently tolerate
      the unrecognised.
- [ ] Genuine breaks are handled by **whole-interface versioning**, **born at V1** (no null version),
      published **in parallel** — never a mutation in place.
- [ ] The rule is a **mechanical CI gate** over a machine-readable schema, **verified by attack**
      (additive passes, breaking is refused, watched).
- [ ] The **version-negotiation meta-layer is frozen** — minimal, unversioned, additive-only forever,
      no escape hatch; a recognition marker never negotiated on, an identity, an **offered-versions
      list**; **counter-offer not reject**, **never reject on the unrecognised.**
- [ ] The frozen set is **as small as possible** — if a thing can be versioned, it is.
