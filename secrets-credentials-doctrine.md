# Secrets & Credentials Doctrine

**Scope: cross-project.** How the family handles a secret — an auth token, an API key, a
crypto/mesh key, a private key file, any value whose disclosure is a compromise. Where it
lives, how a service resolves it at runtime, and what it must never touch (git, logs, a data
file). This is true of everything the family builds, so it sits at the cross-project altitude
([Single-Source-of-Truth §3](single-source-of-truth-doctrine.md) — write each rule at the
highest altitude where it is true); it is **not** gated to FOSS projects the way network
allocation is, because a secret's handling is universal, not a shared-namespace fact.

It exists to consolidate a rule the family already states in pieces — the global directive
"secrets come from the secret store at runtime; the file names *which* secret, never holds
it"; [Service Foundations §1](service-foundations-doctrine.md) (an auth token resolves through
the one config chain) and §2 (a failed bind is loud and fatal); [WebSocket Control
§3](ws-control-doctrine.md) (off-loopback auto-provisions the credential). Scattered, each is
easy to walk past. Consolidated and made **structural**, the leak becomes hard to commit
rather than merely discouraged.

**Companion:** [Service Foundations Doctrine](service-foundations-doctrine.md) owns the config
chain this refines and the loud-fatal binding rule this mirrors; [Logging & Diagnostics
Doctrine](logging-diagnostics-doctrine.md) owns "a secret never reaches a log" and composes
this document's §0; [Conventions Doctrine](conventions-doctrine.md) owns the per-platform
state/secret-store locations. This document restates none of them.

---

## 0. The load-bearing rule

> **A secret is referenced, never embodied. Code names *which* secret; the value is fetched
> from a store at runtime. The value never lives in source, never in git, never in a log,
> never in a data/config file in cleartext — it lives in the secret store (or a documented
> key-file), and everything else points at it by name or path. A secret with a second home is
> already leaked; it just hasn't been noticed yet.**

The split the whole doctrine turns on, from the global directive: **data** (the input file —
names *which* secret) · **the secret value** (the store, at runtime) · **machine identity**
(env/`${VAR}`) · **logic** (the code). Four homes, and the secret value lives in exactly one.

---

## 1. Resolution: the family chain, secret-tailored

A secret resolves at startup through the **same precedence chain every other setting uses**
([Service Foundations §1](service-foundations-doctrine.md) — one uniform chain, most-specific
wins), with two secret-specific deviations:

```
CLI flag / env var  →  secret store  →  ✗ (no compiled default)
                        ├─ OS keystore where available   (default)
                        └─ mode-0600 key-file in the state dir (sanctioned alternative)
```

- **Deviation 1 — no compiled-in default.** Every other setting's chain ends in a documented
  compiled default (SF §1). A secret's must not: a hardcoded secret is in git, is public, and
  is identical for every user — the catastrophe the whole doctrine exists to prevent. The tail
  of a secret chain is **"not found," never a baked value.**
- **Deviation 2 — the store tier is keystore-preferred, file-sanctioned, and this is a
  setting.** Keystore-vs-file are both defensible, so per [Decision Doctrine §4](decision-doctrine.md)
  (*a behaviour with a defensible alternative is a setting with a safe default — do not
  hard-code, do not ask which to bake in*) it is a **setting**: the **OS keystore is the
  default where it exists** (macOS Keychain, Linux Secret Service / `libsecret`, Windows
  Credential Manager — encrypted at rest, OS-access-controlled), and a **mode-0600 key-file in
  the platform state dir is the fully-sanctioned alternative** — not a fallback to apologise
  for. It is first-class because the family's real deployments require it: a headless
  Raspberry Pi has no keyring session, and FOSS users will not all configure one. The default
  is safe (keystore where easy); the alternative always works (file where not).
- **The chain is uniform.** A service that reads its port from a flag but its key only from a
  file has two mental models where one would do (SF §1). Same chain, so `--key-file` /
  `NANLITE_TEA_KEY_FILE` / keystore-lookup are one resolution, documented once.

## 2. A missing required secret fails loud and fatal — with a map

Exactly the shape of a failed bind ([Service Foundations §2](service-foundations-doctrine.md)
— log it and refuse to start, never silently relocate). A service that needs a secret it
cannot resolve **refuses to start and says how to proceed**:

- **Name the secret** it was looking for.
- **Name where it looked** — the chain, in order (env checked, keystore checked, file path
  checked).
- **Name the fix** — the exact flag/env/keystore entry that would satisfy it.
- **Never start half-crippled, never blank it, never invent one.**

> This is the LiteController lesson made correct. A user's clean shell hitting *"TEA auth key
> unavailable"* is the **right** behaviour — the bug was only that it did not map the fix. The
> first run from a clean environment (the [Verification Doctrine](verification-doctrine.md)
> user's-door test) either resolves the secret or tells the user precisely how to provide it.

## 3. Never in git, never in a data file — made structural

Advisory "don't commit secrets" is a hope ([Single-Source-of-Truth §9](single-source-of-truth-doctrine.md)
— an invariant you have to remember is not an invariant). Make it structural:

- **Key-file paths are documented, in the platform state dir, and `.gitignore`d** — a fixed,
  known set of paths, never scattered.
- **A pre-commit gate asserts no gitignored secret path is ever staged** — a mechanical check
  over a *knowable* thing (the documented paths), the same shape as the existing `superpowers`
  path-block hook and the CommonTongue `buf breaking` gate. **Verified by attack** (the
  family's standing rule, [Interface Stability §"verify the gate by attack"](interface-stability-doctrine.md)):
  prove a clean commit passes *and* an attempt to stage a secret path is rejected. A
  deterministic path-block is chosen over an entropy/content scanner precisely because it has a
  clean, attackable pass/fail — a scanner does not.
- **The data/config file names the secret, never holds it.** The input file of record (SF §1,
  global data-out-of-code) carries *which* secret (a key id, a keystore entry name, a
  file-path reference) — never the value.

## 4. Off-loopback couples the credential

A service reachable off-loopback is authenticated, as one coupled decision, and enabling the
off-box bind **auto-provisions** the credential — there is no window in which it is reachable
and unauthenticated. This is owned by [WebSocket Control §3](ws-control-doctrine.md) and
[Service Foundations §2](service-foundations-doctrine.md); named here only so the credential's
lifecycle (provisioned on bind, resolved through §1, never logged per the Logging doctrine)
is visible from the secrets side. Restated nowhere.

---

## 5. Checklist

- [ ] **Referenced, not embodied** (§0) — the secret's value lives in one store; code, config,
      and data files point at it by name/path, never hold it.
- [ ] **Resolved through the family chain** (§1) — CLI/env → keystore-or-0600-file, uniform
      with every other setting; **no compiled default**; keystore is the default where
      available, file the sanctioned alternative (a setting, not a hard-code).
- [ ] **Missing required secret is loud and fatal with a map** (§2) — names the secret, the
      chain it searched, and the fix; never starts blank or invents one.
- [ ] **Never in git / data file, structurally** (§3) — key paths gitignored; a pre-commit
      path-block gate **verified by attack**; the data file names the secret, never holds it.
- [ ] **A secret never reaches a log** — enforced structurally by the [Logging &
      Diagnostics Doctrine](logging-diagnostics-doctrine.md), which composes §0.
- [ ] **Off-box ⇒ authenticated, coupled** (§4) — no reachable-and-unauthenticated window.
