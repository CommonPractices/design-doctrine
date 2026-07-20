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
credential, or private-key material appears in any log line or published stream — **at any
level, including `trace`, never.** `trace` is the *most* dangerous here (it dumps raw frames
and payloads), so the rule binds hardest exactly where the temptation is highest.

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

---

## 6. Checklist

- [ ] **Loosely-parsed, human-oriented** (§1) — line text is not an API; machine logic reads
      state, not scraped lines; a published stream obeys the same rule.
- [ ] **Standard level set** (§2) — error/warn/info/debug/trace (the ecosystem convention, not
      invented); active level settable through the config chain, default `info`.
- [ ] **No unguarded debug output in production source** (§3) — guarded or routed through
      `debug`/`trace`; unguarded is release-blocking.
- [ ] **No secret in any log, structurally** (§4) — redaction boundary at the source; `trace`
      frame dumps masked at the dump site; **verified by attack**.
- [ ] **Log location follows the platform and is documented** (§5).
