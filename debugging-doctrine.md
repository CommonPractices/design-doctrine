# Debugging Doctrine

**Scope: cross-project.** The broad-strokes principle behind a family product's **debugging
capability** — the break-glass, root-privileged diagnostic surface an operator reaches for when
something is wrong and the normal interface cannot explain it. This document states *what that
capability owes and how it is postured*; the concrete architecture (attach, message contract,
conformance) is the **debug-channel blueprint** in [blueprints](../CommonFraming/), which this
doctrine points at and does not restate.

It exists because "add some debug output" is how every product grows an ad-hoc, inconsistent,
and unsafe diagnostic surface — one that leaks secrets, ships in release by accident, or
becomes a privileged back door nobody audited. Stated once as principle, the diagnostic
capability is deliberate: powerful when you need it, invisible and locked when you don't.

**Companion:** the **debug-channel blueprint** is the *shape* (how you build one);
[WebSocket Control Doctrine](ws-control-doctrine.md) §0 is the rule this reconciles with (a
root debug surface is not the "privileged back channel" §0 forbids — see §2); [Logging &
Diagnostics Doctrine](logging-diagnostics-doctrine.md) owns the log stream a debug session
reads and the secret-redaction floor whose one carve-out this doctrine governs (§4);
[Decision Doctrine](decision-doctrine.md) §4–§5 (safe/survivable default, reveal-not-enable)
and [Service Foundations §1](service-foundations-doctrine.md) (the config chain) are composed,
not restated.

---

## 0. The load-bearing rule

> **A family product's debugging capability is root — it can do anything that can be done —
> and precisely because it is that powerful, it is off by default, absent until deliberately
> enabled, and every step toward reaching it off-box is a separate, conscious act. "Most people
> will never use it; when you need it, you need it." Power and lock are not in tension: the
> capability is total, and its default posture is closed.**

---

## 1. It is root — a superset, not a separate feature set

The debug capability can do everything the normal control interface can do, **plus** things no
normal client should: deep introspection of internal state, forcing conditions, revealing what
is otherwise hidden. It is a *superset of authority*, break-glass — the tool of last resort
when the ordinary interface cannot tell you what is wrong.

Because it is a superset, one rule keeps it honest against [WS-Control §0](ws-control-doctrine.md):
**nothing a normal client legitimately needs may live *only* in debug.** Root is a superset for
emergencies, not a hiding place for capabilities that belong on the front door. If a normal
client would reasonably want it, it goes on the control interface; debug then also has it (root
supersets control), but the front door is never made incomplete to feed the debug channel.

## 2. Explicit privilege is not a back channel

[WS-Control §0](ws-control-doctrine.md) forbids a **privileged back channel** — a *hidden*
capability that makes the front door secretly incomplete, so an integration discovers the hole
too late. A root debug surface is the **opposite of hidden**: it is an explicit, advertised,
deliberately-privileged surface, the way `sudo`/`root` exists alongside a normal user account
without making the user API "incomplete." It does not violate §0, because §0's target is
*concealment*, and this capability is declared, gated, and auditable.

- The **control interface stays the complete, non-privileged front door** — §0 holds
  absolutely for it: every normal capability reachable by every client, no hidden powers.
- The **debug capability is an openly-privileged root tier** layered as its own surface — not a
  secret mode on the control channel.

*(The concrete surface — a separate, discoverable channel rather than a privileged mode on the
control channel — is the blueprint's to specify. This doctrine fixes only that the privilege is
explicit, not concealed.)*

## 3. Security posture: off by default, two dependent gates

The default is closed, and reaching root off-box is never a single switch. Two gates, each off
by default, the dangerous one gated behind the less-dangerous one — the model every developer
already knows from Android's USB-then-Wireless debugging:

- **Gate 1 — local debug (like Android USB Debugging).** A setting turns the root capability
  on, **loopback / same-machine only.** Until then the capability is *absent*
  ([Decision §5](decision-doctrine.md) — "not part of your world"), not merely disabled. A wrong
  default (off) has leaked nothing — [Decision §4](decision-doctrine.md) survivability.
- **Gate 2 — network debug (like Android Wireless Debugging).** A **dependent** setting —
  it cannot be enabled unless Gate 1 is on, never the reverse. Enabling it opens the root
  capability off-box, and does so as one coupled decision with its credential
  ([WS-Control §3](ws-control-doctrine.md) — reachable-off-box and authenticated ship together,
  never separably). It carries three operator-set sub-settings, all at enable-time:
  1. **A settable credential**, set in the network-debug setting itself — **distinct from the
     control credential** (root ⊋ control, so its key is its own; holding the normal LAN
     control token does not grant root).
  2. **The off-box bind** (dependent on Gate 1).
  3. **A host / network allowlist** — restrict off-box root to specific **Host(s) (IPs) or
     Network(s) (CIDR)**. These are the **operator's own real network addresses**, arbitrary
     and operator-supplied — *not* family address space (network-allocation has no bearing
     here; a user's LAN is theirs). Defaults **most-restrictive** (empty = nothing reaches root
     even with the credential; the operator widens deliberately).

Two independent off-box gates therefore guard root: **a valid credential AND an allowed
source.** Either alone is insufficient — deliberately stronger than Android (credential/pairing
only).

## 4. A debug session may reveal a secret — the one governed carve-out

The [Logging & Diagnostics §4](logging-diagnostics-doctrine.md) redaction floor is absolute *by
default at every level and every sink* — a secret is `***`. But a legitimate need exists: a
root diagnostic session sometimes must see a real secret to diagnose it ("is the service even
loading the right key?"). Blinding the session defeats the purpose break-glass exists for. So
(most) every secret has a **deliberate way to be unveiled for a legitimate purpose** — and this
doctrine owns that carve-out as its principle (logging §4.1 references it, does not restate it):

- **Per-secret, explicit, deliberate** — an action the root operator *takes*, never a mode that
  disables redaction wholesale, never the default stream. The passively-observed session still
  sees `***`; unveiling is a conscious request for *that one value*.
- **Audited** — the reveal is recorded as a first-class event (who, which secret, when). An
  invisible un-redaction is exactly the leak the floor forbids; a *recorded, consented* one is a
  governed exception. This is [Decision §4–§5](decision-doctrine.md) reveal-not-enable applied
  to secrets: the value is **hidden, not absent** — revealed only by explicit consent-action,
  and the act of revealing is itself logged.
- **Crystal-clear and as gated-by-deliberacy as possible** — the single named exception to the
  floor, reachable only from the root-privileged surface, which is itself off-by-default and
  twice-gated (§3). Everywhere else, and by default everywhere, the floor is absolute.

## 5. What the blueprint owns (named, not decided here)

This doctrine is broad strokes; the **debug-channel blueprint** owns the shape and must specify
(each composing the doctrines above, not restating them):

- The **attach model** — the discoverable surface (the ephemeral-port + mDNS `<slug>-debug`
  advertisement, advertised only while enabled).
- The **capability set** — the concrete introspection/observation and mutation verbs, and how
  mutation composes the control contract versus what is genuinely root-only.
- The **message contract** and how it supersets the control channel's shape.
- The **conformance checklist** — how you know you have built one.

---

## 6. Checklist

- [ ] **Root, but a superset** (§1) — debug can do everything control can, plus root-only; but
      **nothing a normal client needs lives only in debug** (no front-door hole).
- [ ] **Explicit, not concealed** (§2) — an advertised, deliberately-privileged surface, not a
      hidden mode on the control channel; §0 holds for the control interface.
- [ ] **Off by default, two dependent gates** (§3) — local (Gate 1, loopback) then network
      (Gate 2, dependent), each off by default; Gate 2 couples a **distinct settable
      credential** + off-box bind + a **most-restrictive host/network allowlist** of the
      operator's own addresses.
- [ ] **Secret reveal is the one governed carve-out** (§4) — per-secret, explicit, **audited**;
      redaction stays the default everywhere else.
- [ ] **Shape deferred to the blueprint** (§5) — attach, capability set, contract, conformance.
