# Logging & Diagnostics Doctrine

**Scope: cross-project.** How anything the family builds emits its activity log — the shape,
the levels, what belongs at each, and the one line it may never cross (leaking a secret). True
of every service and tool, so it sits cross-project ([Single-Source-of-Truth §3](single-source-of-truth-doctrine.md)),
not gated to FOSS projects.

It exists to consolidate a rule the family already states in three places and to add the two
pieces none of them covers. [Service Foundations §6](service-foundations-doctrine.md) already
owns the runtime shape (a first-class, loosely-parsed stream that may double as a published WS
channel); [Conventions Doctrine](conventions-doctrine.md) already owns *where* logs live per
OS; the global directive already bans unguarded debug output in production source. What no
existing home states is the **level set** and **what must never be logged** — this document
adds those and points at the rest.

**Companion:** [Service Foundations Doctrine](service-foundations-doctrine.md) §6 owns the
stream shape this lifts; [Conventions Doctrine](conventions-doctrine.md) owns per-OS log
locations; [Secrets & Credentials Doctrine](secrets-credentials-doctrine.md) §0 is composed by
§4 (a secret's value never reaches a log). This document restates none of them.

---

## 0. The load-bearing rule

> **The log is a first-class observation channel — often the only place you see what the
> hardware *actually* did (confirm-by-observation). So it must be three things at once:
> readable by a human, never parsed as an API, and safe — a secret never appears in it, at any
> level, ever. A log that leaks a secret is a compromise; a log that machine logic scrapes is a
> hidden API that will break.**

---

## 1. Shape — a loosely-parsed, human-oriented stream

Lifted from [Service Foundations §6](service-foundations-doctrine.md) (owned there; the shape
is named here for completeness, not re-decided):

- **Human-oriented; parse loosely.** The line *text* is a debugging aid, **never a stable
  API.** Machine logic reads structured state, never scraped log lines.
- **It may double as a published stream.** A service with a control channel may mirror its log
  over it (backlog on connect, then per-line) so a remote surface reconstructs the view — the
  "parse loosely" rule still binds, and §4 (no secrets) binds the published stream identically.

## 2. Levels — the ecosystem's standard set, not an invented one

Use the **established standard set** every logging framework and syslog already define —
because [Conventions Doctrine §1](conventions-doctrine.md) says *follow the established
convention of the context by default; you deviate only against a stated constraint.* The set
is not enumerated speculatively ([SMT](smt-doctrine.md)/YAGNI — don't invent levels for a use
you're guessing at); it is adopted because it is the convention the whole ecosystem (Rust
`tracing`, syslog, every framework) already speaks, and an idiom you fight is friction.

| Level | For | Default visibility |
|-------|-----|--------------------|
| `error` | A failure that stops or degrades the operation the user asked for. | on |
| `warn` | A recoverable anomaly the user should know about (a retry, a degraded delivery, a fallback taken). | on |
| `info` | Normal lifecycle a human wants to see (started, bound, connected, applied). | on |
| `debug` | Detail for diagnosing behaviour (decision branches, resolved config, chain steps). | off by default |
| `trace` | Wire-level firehose (BLE-mesh frames, PTP chatter, per-byte codec steps). | off by default |

- **The active level is settable through the family config chain** ([Service Foundations
  §1](service-foundations-doctrine.md) — CLI → env → file → default; default `info`), uniform
  with every other setting. Not a recompile.
- **`trace` earns its place as the convention's bottom floor** — the noisy protocol layers
  (mesh frames, PTP) get a level *below* `debug` so a debugging session can ask for them
  without drowning; this is adopting the standard 5-level set, not manufacturing a level.

## 3. No unguarded debug output in production source

Lifted from the global directive (owned there; stated here as it is the logging-specific face
of it): any debug print in non-test source (`println!`, `console.log`, `Log.d`,
`System.out.*`, or language equivalent) is **guarded** behind a compile-time/debug gate (e.g.
`if BuildConfig.DEBUG`, `#[cfg(debug_assertions)]`) or routed through the level system at
`debug`/`trace`. An unguarded debug print in production source is a **release-blocking
defect** — it ships noise, and (worse) it is the most common way a secret reaches a log,
bypassing §4.

## 4. A secret never reaches a log — made structural

Composes [Secrets & Credentials §0](secrets-credentials-doctrine.md). No secret, key, token,
credential, or private-key material appears in any log line or published stream — **by default,
at every level including `trace`.** `trace` is the *most* dangerous here (it dumps raw frames
and payloads), so the rule binds hardest exactly where the temptation is highest.

### 4.1 The one carve-out lives in the Debugging Doctrine

Redaction is the **default at every level and every sink**, but it is not the *only* possible
behaviour: a root-privileged diagnostic session sometimes must see a real secret to diagnose it
("is the service even loading the right key?"). That single exception — **per-secret, explicit,
and audited, never the default and never a wholesale off-switch** — is owned as a principle by
the [Debugging Doctrine §4](debugging-doctrine.md), which governs the root diagnostic surface.
This section does not restate it; it only records that the floor here has exactly one governed
exception, and that its home is the Debugging Doctrine. Everywhere else, and by default
everywhere, the floor is absolute.

Advisory "remember not to log secrets" is a hope ([Single-Source-of-Truth §9](single-source-of-truth-doctrine.md)
— an invariant you must remember is not one; [Decision Doctrine §7](decision-doctrine.md) —
make invariants structural). So make it **structural, at the source**, not a scan after the
fact:

- **A secret value flows through a redaction boundary** — a wrapper/type whose display and log
  representation is a fixed placeholder (`***`), so writing it to a log emits the placeholder,
  not the value. Prevention where the value lives beats detection over the output.
- **Raw frame/payload dumps at `trace` are redacted at the dump site** — the codec/transport
  layer that can emit a `trace` frame is the layer responsible for masking the key material
  and auth fields *before* the line is formed.
- The structural test is by **attack** ([Verification Doctrine](verification-doctrine.md)):
  log a wrapped secret and a raw `trace` frame that contains key material, and assert the
  placeholder appears and the value does not.

## 5. Location follows the platform

Where the log file lives is a per-OS convention, owned by [Conventions Doctrine](conventions-doctrine.md)
(`$XDG_STATE_HOME/<app>/` or the service-manager journal on Linux, `~/Library/Logs/<App>/` on
macOS, `%LOCALAPPDATA%\<App>\Logs\` on Windows) and **documented** — a service says where its
log is. Restated nowhere here.

## 6. Remote sinks — shipping the log off the box

The local file (§5) and the published WS stream (§1) are two sinks; a **remote log sink** is a
third. A service **may** push its log stream to a remote server, **off by default**, configured
through the family chain ([Service Foundations §1](service-foundations-doctrine.md) — CLI → env
→ file → default). The shape:

- **Emit a standard first.** The default remote form is an **industry-standard log protocol**
  (syslog RFC 5424, or the OTLP structured-log family) so any existing aggregator — Loki, ELK,
  Graylog, a plain `syslogd` — ingests it with no bespoke server. This is [Conventions §1](conventions-doctrine.md):
  adopt the ecosystem's convention; a user already runs a log server and wants the logs *there*.
  A family-specific logging/visualisation server is a permitted **later, additive** sink — it
  may or may not adopt an industry shape — but it is *in addition to* the standard emitter,
  never a replacement for it. The family ships an **emitter that speaks a standard sink**, not a
  mandatory server.
- **Push, not pull.** A log is a stream; the service ships lines to the configured remote
  (syslog-style). Pull/scrape is a metrics idiom, not a logging one.
- **Transport is selectable; TLS is the safe default.** Both **TCP+TLS** (ordered, encrypted —
  the default, because the log leaves the box carrying operational detail even when redacted)
  and **UDP** (classic, lossy, plaintext — for a trusted LAN or legacy syslog) are offered; the
  operator picks per deployment through the config chain.
- **Never block on the remote — buffer, then drop, and say so.** The remote sink is
  **non-essential**: if it is down or slow, the service **does not block** (a dead log server
  must never stall the product — [Service Foundations §2](service-foundations-doctrine.md)
  spirit: a non-essential dependency's failure is loud, not fatal). Buffer to a **bounded**
  buffer; when it fills, **drop oldest and emit a local warning**. The **local log stays
  complete** regardless — nothing that matters is lost, because the local sink always has it.
- **The §4 redaction floor binds the remote path — hardest of all.** A secret that slips
  redaction is now on a server the operator may not control, so the remote sink is the
  **highest-stakes** sink. Because §4 redacts **at the source**, a line is already `***` before
  it reaches *any* sink — but the **verify-by-attack** for §4 must explicitly include the
  remote path (assert a wrapped secret and a raw `trace` frame reach the remote as `***`).

---

## 7. Checklist

- [ ] **Loosely-parsed, human-oriented** (§1) — line text is not an API; machine logic reads
      state, not scraped lines; a published stream obeys the same rule.
- [ ] **Standard level set** (§2) — error/warn/info/debug/trace (the ecosystem convention, not
      invented); active level settable through the config chain, default `info`.
- [ ] **No unguarded debug output in production source** (§3) — guarded or routed through
      `debug`/`trace`; unguarded is release-blocking.
- [ ] **No secret in any log, structurally, by default** (§4) — redaction boundary at the
      source; `trace` frame dumps masked at the dump site; **verified by attack**. The sole
      exception (§4.1) is a root-privileged, **per-secret, explicit, audited** reveal — never a
      default, never a wholesale off-switch.
- [ ] **Log location follows the platform and is documented** (§5).
- [ ] **Remote sink is standard-first, off by default, non-blocking** (§6) — emits a standard
      protocol (syslog/OTLP) to any aggregator; TCP+TLS default / UDP optional; buffer-then-drop
      + local warning, never blocks; local log stays complete; **§4 redaction verified on the
      remote path**.
