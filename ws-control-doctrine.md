# WebSocket Control Doctrine

**Scope: cross-project.** How a local service exposes control over a WebSocket so that any
number of surfaces — a native window, a browser admin page, a Stream Deck plugin, another
service, an AI agent — drive it through **one** interface, and so that a client written against
one family service feels like a client written against any other.

The worked example throughout is **CameraConductor** (`conductord`), whose control server was
designed first and whose `ws-control-protocol.md` is the concrete instance every rule here
generalises from. The pattern is not CameraConductor's; the example is. A second service —
**LiteController** (`litecontrollerd`), which controls lighting and is intended to be driven by
those same surfaces and by CameraConductor itself post-integration — is the reason the pattern had
to be lifted out of one app and made portable: two family services that speak the same idiom
integrate for nearly free.

---

## 0. The load-bearing rule

> **The service is the single source of truth, and every surface is just a client of it —
> including the service's own UI. There is no privileged back channel.**

If the service ships an admin window, that window talks to the service over the *same* WebSocket
every other client uses. This is not a convenience; it is the thing that makes the API provably
complete. If the built-in UI can do something no external client can, the API has a hole and you
will not find it until an integration needs exactly that. Route the service's own face through its
own front door, and the front door is complete by construction.

> **CameraConductor:** the app hosts the control server; the app's own controls and every external
> client (the MX/Ulanzi deck plugin, a Python script, LiteController later) go through it. Nothing
> reads or writes the camera except through the WebSocket's intents resolved against the one
> authoritative `CameraModel`. *(Doctrine cross-ref: [Decision Doctrine §7](decision-doctrine.md) —
> make invariants structural. "The UI is just another client" is that rule applied to transport.)*

---

## 1. Asymmetric shape: rich state flows down, thin intents flow up

The two directions are **not** symmetric, and pretending they are is a mistake.

- **Down (service → client): rich, authoritative state.** The service owns the truth and
  publishes it.
- **Up (client → service): thin, fire-and-forget intents.** The client says *what it wants*, not
  *how to achieve it*. The client owns **no** device logic; it cannot race the device, because
  every intent enqueues on the service's single-flight path to the hardware.

The three downward messages:

| Message | When | Contains |
|---|---|---|
| **`hello`** | once, immediately on connect | protocol version + an **app-identity string** (§5) |
| **`state`** | on connect, and on demand (a `getState`-style request) | the **complete** current snapshot |
| **`delta`** | whenever state changes | **only what changed** since the last message |

A client builds its whole model from `state`, then keeps it current by applying `delta`s. If it
ever believes it missed the baseline, it asks for a fresh `state`.

> **CameraConductor:** `hello → state → delta`, plus a `logInit`/`logLine` pair (§6). Deltas carry
> only changed props, and within each prop only changed keys; static descriptors (a range's
> min/max/step) are sent once in `state` and never re-sent. The change-gate suppresses redundant
> churn — a write's read-back that lands on the same value produces no message at all.

---

## 2. ⭐ Confirm by observation — the acknowledgement IS the resulting state

**This is the load-bearing interaction rule, and it is the one clients get wrong.**

Intents are **fire-and-forget**. There is **no per-command ack, no reply, no `ok: true`**. The
acknowledgement of a command is **the `delta` it causes.** A client verifies an intent took effect
by *observing the state change*, never by trusting that the send succeeded.

This is not laziness; it is honesty about a truth that holds for real hardware: **a transport-level
"sent" tells you nothing about whether the device did anything.** A GATT write returns success the
instant the bytes are queued; a PTP write can be silently refused because the device is in the
wrong mode. The only trustworthy signal is the device's *observed* resulting state.

**The client contract, therefore:**

1. Send the intent.
2. Wait for a `delta` (or poll a fresh `state`) and **check the value actually became what you
   asked for.**
3. If it didn't change within a timeout, treat it as failure — and inspect the state that explains
   why (a `writable` flag, a mode, a liveness field).

> **CameraConductor** documents this as the first thing to read before writing a client: unknown
> command type, malformed JSON, an unknown prop, a write refused by the current mode — **every one
> fails silently.** The camera write may even produce a `delta` showing a *different* value than
> asked (the service clamps/snaps ranges). You confirm by watching state, full stop.
>
> **LiteController** is the extreme case that proves the rule: its first target light is
> **write-only** — no readback exists *at all*. It cannot even offer a `delta` sourced from the
> device. So it publishes **commanded** state carrying an explicit **confidence** (`confirmed` /
> `commanded` / `unknown` / `stale`) — "confirm by observation" degrading gracefully to "the
> service tells you the best it honestly knows, and never dresses a command up as a confirmation."

### 2.1 Errors: an explicit channel is permitted, but it is never the primary contract

A service **may** add a structured error/nack message. But the primary contract is *still*
confirm-by-observation — a client that relies on errors arriving will break against a service (or a
device) that cannot produce them. Design the client to observe state; treat any error message as a
bonus that shortens a timeout, not as the thing you wait for.

**Do not invert this.** Mandating a reply for every command re-introduces the fiction §2 exists to
kill: that "the service accepted it" means "the device did it." For fire-and-forget control of real
hardware, it does not.

---

## 3. Binding and auth: loopback is the default; off-loopback couples auth

**Default posture: bind loopback only, no auth.** When the only clients that can reach the service
are on the same machine, an authentication handshake guards nothing and adds friction. A local
admin UI, a local deck plugin, and a local sibling service all reach it with zero ceremony.

**The moment a service binds anywhere off loopback, authentication becomes mandatory — and the two
decisions are coupled, never separable.** "Reachable from the network" and "requires a credential"
ship as **one** choice. A service must never boot into a state where it is reachable off-box *and*
unauthenticated — not as a default, not as a convenience, not transiently.

- **Loopback + no auth** — the default. Nothing off-box can reach it.
- **Off-loopback + mandatory auth** — a deliberate, deployment-driven choice (a headless box with
  no local surface *needs* this). Enabling the bind auto-provisions the credential; there is no
  window in which one is on without the other.

The safe default is loopback because a wrong default must be **survivable**: a service that starts
loopback-only can be opened up deliberately; a service that starts wide-open has already leaked
before anyone decides anything. *(Cross-ref: [Decision Doctrine §4](decision-doctrine.md) — the
default is safe not because it is better, but because a wrong default must be survivable; and §5 —
absent/hidden/disabled: off-box reachability is **absent** until deliberately enabled, not merely
disabled.)*

> **CameraConductor:** binds `127.0.0.1` with `requiredInterfaceType = .loopback`, auth **none by
> design, precisely because it is loopback-only.** It deliberately does **not** solve the remote
> case — and that is correct: it never needed to.
>
> **LiteController** is the service that *does* need it — a Raspberry Pi in a rig is headless, with
> no local surface, so its natural deployment is off-loopback. It is a **superset** of
> CameraConductor's posture, not a contradiction of it: same loopback+no-auth default on the
> desktop, plus the token-gated-LAN path CameraConductor had no reason to build. The doctrine gives
> that path a home so it is not a per-project improvisation.

---

## 4. Headless-clean: the service never depends on a client

A control service must run correctly with **zero clients connected.** It does not gate device
behaviour on someone watching; with no clients, broadcasts are simply no-ops. A client connecting
or disconnecting changes *who is listening*, never *what the service does*.

This falls out of §0 (the service is the source of truth) and it is what makes the same binary run
as a background daemon on a headless box and as the backend of a local UI — with no code path
difference. If the service needs a client to function, it is not a service; it is a UI with a socket
bolted on.

> **CameraConductor** never gates camera behaviour on a client being present; with no clients,
> state broadcasts go nowhere and the camera pipeline runs unchanged. **LiteController** must hold
> this even harder — its headless Pi deployment frequently has *no* local client at all, only remote
> surfaces that come and go.

---

## 5. Identity handshake: prove the client reached the right server

A local port is a **shared namespace**. Another process may hold it, or a *different* family service
may answer. The `hello` therefore carries a stable **app-identity string**, and a client **verifies
it** before trusting anything else on the connection.

- The identity string is **stable across renames and versions** — it identifies the *protocol
  endpoint*, not the current product name. Changing it breaks every client for a cosmetic reason.
- A client that connects and sees the wrong identity is talking to the wrong server and must **not**
  proceed.

> **CameraConductor:** `hello.app == "d850control"` — kept stable across the app's rename to
> CameraConductor precisely so existing clients did not break. The `hello` also carries a numeric
> protocol version for evolution.

### 5.1 Ports are a shared contract across the family

When several family services (and their plugins) can run on one machine, their default ports are a
**coordinated contract**, documented per service, and each distinct — a collision means one service
silently fails to bind. A service that fails to bind says so; it does not pretend it started.

> **CameraConductor** owns `54127` (a fixed contract it shares with the MX/Ulanzi plugin defaults).
> **LiteController** must therefore choose a *different* default and document it the same way, so
> the two can coexist on one box.

---

## 6. A log stream is part of the protocol, not a side feature

Because §2 makes *observation* the way a client knows anything, the service's activity log is a
first-class channel: it is where a developer sees what the device actually said when a command
"did nothing." Publish it over the same socket — a backlog on connect, then each new line as it is
appended.

- **The log is human-oriented; parse it loosely.** Line format is a debugging aid, **not** a stable
  API. Never build machine logic on log-line text; that is what `state`/`delta` are for.
- It doubles as the data source for a **remote log view** — a surface can reconstruct the service's
  log pane from the backlog plus the stream.

> **CameraConductor:** `logInit` (backlog, capped) on connect, then a `logLine` per appended line —
> reads, writes, failures, connection events, inbound-command echoes. Its own doc says to subscribe
> to it while developing, and warns that the format is not an API.

---

## 7. Multiple clients, and mixed frame kinds

- **Multiple clients are supported and symmetric.** Every client gets `hello` + full `state` + log
  backlog on connect; state changes broadcast to all. No client is privileged (§0).
- **If the service streams bulk/binary data** (video frames, images), send it as **binary** frames
  distinct from the **text** (JSON) control frames, make it **opt-in per connection**, and
  **throttle** it — a client must handle both frame kinds and must not receive the firehose unless
  it asked. Bulk streaming is a droppable path; control traffic is not.

> **CameraConductor:** live-view frames are raw-JPEG **binary** frames, sent **only** to clients
> that sent `subscribeFrames`, throttled to a monitoring rate — never confused with the JSON control
> messages, and never forced on a client that only wants control.

---

## 8. Checklist

Before shipping a family WebSocket control service:

- [ ] **The service is the source of truth; its own UI is just another client** — no privileged
      back channel.
- [ ] **Asymmetric:** rich `state`/`delta` down, thin fire-and-forget intents up. Client owns no
      device logic.
- [ ] **Confirm by observation** — the ack is the resulting `delta`; the client verifies by watching
      state, never by trusting the send. Any error channel is a bonus, not the contract.
- [ ] **Loopback + no-auth by default; off-loopback ⇒ mandatory, coupled auth.** No reachable-and-
      unauthenticated state ever exists.
- [ ] **Headless-clean:** correct with zero clients; no behaviour gated on a client being present.
- [ ] **`hello` carries a stable app-identity string**, and clients verify it. Default **port is a
      documented, family-coordinated, distinct contract.**
- [ ] **A loosely-parsed log stream** (backlog + per-line) is published over the same socket.
- [ ] **Multiple clients** supported; **bulk/binary** streams are a separate frame kind, opt-in, and
      throttled.
