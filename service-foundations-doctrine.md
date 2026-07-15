# Service Foundations Doctrine

**Scope: cross-project.** The plumbing every family **service** shares beneath whatever it does —
how it is configured, how it binds, how it starts and stops without losing state, and how it keeps
a second copy of itself from racing the first. This is the base layer a control service sits on
*before* any protocol semantics; it is deliberately **not** about what the service controls.

It exists for one reason: **stop re-inventing the daemon.** Every family service needs the same
startup, config, and lifecycle scaffolding. Written once, it buys consistency (two services behave
the same way at the edges), interoperability (they coexist on one host predictably), and the
freedom to not re-derive — usually wrongly — the same plumbing each time.

Companion: **[WebSocket Control Doctrine](ws-control-doctrine.md)** sits *on top* of this and covers
protocol semantics (the message shape, confirm-by-observation, the identity handshake). Where the
two touch — binding, ports, headless-cleanliness — **this document owns the mechanism**; the WS
doctrine references it.

Worked examples: **CameraConductor** (`conductord`) and **LiteController** (`litecontrollerd`),
plus the Nanlite BLE-Mesh reverse-engineering that makes LiteController's shutdown requirement
unusually sharp. The pattern is neither project's; the examples are.

---

## 0. The load-bearing rule

> **Configuration is data resolved at startup, never a constant compiled into behaviour. Binding
> is explicit and fails loud. Shutdown flushes durable state before it dies. And a service refuses
> to become its own second instance.**

Each half of that sentence is a section below. None is exotic; all four are places a family service
has bled (or would have) by treating the plumbing as an afterthought.

---

## 1. Config resolution: one precedence chain, data out of code

Every operator-settable value — bind address, port, auth token, and every domain knob (matching
weights, write policies, timeouts) — is resolved at startup through **one documented precedence
chain**, most-specific wins:

```
CLI flag  →  environment variable  →  config file  →  compiled-in default
```

- **The compiled-in default is a *documented fallback*, not the value.** It exists so a zero-config
  first run works; it is never the only way to set the thing.
- **The chain is uniform across settings.** A service that reads the port from a flag but the auth
  token only from a file has two mental models where one would do. Same chain for all.
- **This is [Decision Doctrine §4](decision-doctrine.md) — "it's a setting, safe default" — applied
  to the whole config surface**, and it is the same *data-out-of-code* rule that keeps business
  data out of scripts: the code holds *logic*; the data of record lives in a file/flag/env the
  operator owns. A tuning constant buried in a function is a defect, not a default.

> **LiteController:** the WS **port is settable** via `--port` → `LITECONTROLLER_PORT` → config →
> compiled default. The same chain resolves the bind address, the LAN auth token, and the identity
> **match-score weights** — the weights live in a `[matching]` config block precisely so they can be
> tuned against real hardware without touching the match function. *(Owner directive: "make sure the
> levers are not so deep inside the code that we cannot easily tweak them.")*

### 1.1 Config file location and format follow the platform, and are documented

Where the config and state live is a **per-platform convention, stated explicitly** — not an
undocumented path a user discovers by `strace`. Use the platform's standard base directory (XDG on
Linux/Pi, `~/Library/Application Support` on macOS) and document the resolved path. A family
service says where its files are.

> **The Nanlite research** used `~/.config/nanlite/lights.json` for the live per-light bundle;
> **LiteController** inherits the *shape* (a service-owned per-light store) but must state its own
> documented, platform-correct location — not leave it implicit. `!!ASSUMED — exact paths/format
> are an open item (design draft O-105); the *principle* (documented, platform-standard) is the
> decided part.!!` `[A]`

---

## 2. Binding is explicit, coupled, and fails loud

- **Never hardcode the port** (§1 — it is settable). Host and port resolve **together as one
  binding config**, because they are one decision: *where can this be reached.*
- **Off-loopback couples authentication.** Binding anywhere but loopback makes auth mandatory, as a
  single coupled choice — a service never boots into reachable-and-unauthenticated. *(Full rule:
  [WebSocket Control Doctrine §3](ws-control-doctrine.md); the mechanism — resolving host+port+auth
  together at startup — is this document's.)*
- **Bind failure is loud and fatal.** If the chosen address/port is already held, the service
  **logs it and refuses to start.** It does **not** silently pick a different port — a service that
  quietly moves is a service its own clients can no longer find.

> **CameraConductor** binds `127.0.0.1:54127` and, on a port collision, logs *"Control server failed
> to start"* rather than relocating — because the MX/Ulanzi plugin expects it at `54127`. A silent
> move would strand every configured client. **LiteController** must choose a *different* default
> port for exactly this reason (§4) and fails the same loud way.

---

## 3. Graceful shutdown flushes durable state BEFORE the process dies

On a termination signal (SIGTERM/SIGINT) the service must **persist anything whose loss corrupts
future operation, then exit** — it does not just drop.

**This is not generic hygiene for this family; it has teeth.** The kind of state that must survive a
restart is often *exactly* the state whose loss is unrecoverable:

> **LiteController / Nanlite:** BLE-Mesh uses a **24-bit sequence number that must be persisted and
> monotonic — the node rejects any message with a seq it has already seen.** The research is
> explicit: *"persist seq even on failure — those numbers are burned the moment they're built."* A
> service that dies without flushing the last-consumed seq can **brick control** of the light until
> the seq climbs back past the stale value. So "flush durable state on shutdown" is, for this
> service, the difference between a clean restart and a light that ignores you. `[V]` (research)

> **CameraConductor** drains its single-flight PTP command chain rather than severing mid-write.

**The requirement is portable; the mechanism is per-service.** *What* must be flushed (seq, an
in-flight command queue, the commanded-state store) is domain-specific — but *that* a service flushes
its durable state before exiting is the family rule. Identify, per service, the state whose loss is
unrecoverable, and make shutdown flush it. *([Decision Doctrine §9](decision-doctrine.md): separate
the requirement from the mechanism.)*

---

## 4. A service refuses to become its own second instance

Two copies of the same service on one host **race the resources the service assumes it owns** — the
bind port, and worse, exclusive hardware. A family service **detects and refuses** a second instance
rather than letting two fight.

- **The port is one guard but not enough.** A bind collision (§2) catches a second instance that
  reached the socket — but the damage of two instances is often *upstream* of the socket (two
  processes both driving the same radio).
- **State the requirement; the mechanism is per-platform.** *That* a second instance is prevented is
  the rule. *How* — a lock file, an advertised single-instance socket, a platform service manager
  that only ever runs one — is a per-service, per-platform choice, and is left open rather than
  mandated. `!!ASSUMED — no single-instance mechanism is yet designed for either service; this states
  the requirement, not the implementation.!!` `[A]`

> **LiteController** is the sharp case: the BLE-Mesh stack and a given light's live session are
> **exclusive** — a second `litecontrollerd` connecting to the same light produces exactly the
> half-open-session / stale-filter failures the research documents (control-spec §7.4). Two
> instances is not untidy; it is a source of the hardest-to-diagnose failures in the system.

---

## 5. Headless-clean and zero-client-correct

A service runs correctly with **no clients and no local UI attached.** Nothing it does is gated on
someone watching; a client connecting changes *who is listening*, never *what the service does*.

This is stated in the [WebSocket Control Doctrine §4](ws-control-doctrine.md) as a protocol
property, but it is truer as a **service** property and is repeated here as a foundation: it is what
lets the *same binary* run as a background daemon on a headless Raspberry Pi and as the backend of a
desktop admin UI, with **no code-path difference.** If the service needs a client to function, it is
a UI with a socket bolted on, not a service.

> **LiteController's** natural Pi deployment has *no* local client at all — only remote surfaces that
> come and go. The service must be complete on its own.

---

## 6. Logging is a first-class, loosely-parsed stream

A service's activity log is part of how anything observes it (especially under confirm-by-observation,
where the log is where you see what the hardware *actually* did). The family shape:

- **Human-oriented; parse loosely.** Log line *text* is a debugging aid, **never** a stable API.
  Machine logic reads structured state, never scraped log lines.
- **It may double as a published stream.** A service that exposes a control channel can mirror its
  log over it (backlog on connect, then per-line) so a remote surface reconstructs the log view —
  but the "parse loosely" rule still binds.

> **CameraConductor** publishes `logInit` + `logLine` over its WS and warns in its own protocol doc
> that the format is not an API. **LiteController** reuses this — and the identity-match subsystem
> deliberately **emits its score breakdown to the log stream** so tuning is *reading*, not guessing.

---

## 7. Auto-start is shipped and documented, not self-installed (default)

A service that should launch on boot/login ships the platform launch units and **documents enabling
them** — it does not, by default, edit system-level launch configuration itself (that needs
privilege and invites a sudo/again-privilege-escalation surface).

- **macOS:** a `launchd` LaunchAgent (login) or LaunchDaemon (boot).
- **Linux/Pi:** a `systemd` user service (login) or system service (boot — the natural choice for a
  headless Pi with no login session).
- **Deployment-aware default scope:** login-scoped on a desktop, system/boot-scoped on a headless
  box. A self-managing install toggle is a permitted *later* nicety, not the default.

> **LiteController** ships both unit kinds and documents them; a Pi is set up once by someone
> comfortable with `systemctl`, and the service does not try to install its own system unit. `[A]`
> (design decision; not yet built)

---

## 8. Out of scope for now — named seams, not silent gaps

These are real and will matter; they are **not yet designed**, and this doctrine does **not** invent
rules for them. They are listed so their absence is legible rather than mistaken for completeness (a
document with no admitted gaps is lying — cf. [Spec Promotion Doctrine §9.5](spec-promotion-doctrine.md)):

- **Health / status / liveness surface** beyond the log and state stream.
- **Crash-recovery / auto-restart policy** (beyond what the platform service manager provides).
- **Metrics / telemetry.**
- **Log rotation and retention.**
- **IPC beyond the service's own control channel.**

When one of these is designed, it earns a section here (or its own doctrine), grounded in a real
example — not before.

---

## 9. Checklist

Before shipping a family service:

- [ ] **One config precedence chain** (CLI → env → file → compiled default), uniform across all
      settings; no tuning constant buried in code.
- [ ] **Config/state file locations are platform-standard and documented.**
- [ ] **Port/host settable, resolved together; bind failure is loud and fatal** (no silent relocate).
- [ ] **Off-loopback couples mandatory auth** (mechanism resolved here; rule in WS doctrine).
- [ ] **Shutdown flushes the state whose loss is unrecoverable** before exiting — the specific state
      identified per service (seq, in-flight queue, commanded store).
- [ ] **A second instance is refused** — requirement met by *some* mechanism; the shared-hardware
      race, not just the port, is what it guards.
- [ ] **Correct with zero clients**; same binary headless or UI-backed, no code-path fork.
- [ ] **Logging is loosely-parsed**, optionally mirrored over the control channel.
- [ ] **Auto-start units shipped + documented**, deployment-aware default scope; not self-installed
      by default.
- [ ] **Undesigned foundations are named as seams**, not left as silent gaps.
