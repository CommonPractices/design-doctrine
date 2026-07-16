# Data Format Doctrine

**Scope: cross-project.** The serialization format for **every data format the family itself
defines** — interchange payloads it sends over the wire, and the config and data files its apps
read and write — is **strict JSON**. One format, known to everyone and every tool, so nothing we
define needs a special parser or a format decision re-litigated per file.

**This governs formats we define; it does not touch formats a tool defines for itself.** A tool or
ecosystem that mandates its own format for its own files keeps it — `Cargo.toml` stays TOML, a
third-party tool's dotfile stays whatever that tool requires. Those follow the
[Conventions Doctrine](conventions-doctrine.md) (respect the ecosystem's convention). This doctrine
is about the formats that are *ours to choose*, where there is no external convention to defer to.

---

## 0. The load-bearing rule

> **Where we choose the format, it is strict JSON — RFC 8259, no dialects. What JSON can't express
> in comments, we express in data.**

JSON's universality is the entire reason to pick it: every language, every tool, every human, and
every AI agent already has a parser and a mental model. That reach is worth more than any single
format's ergonomic edge — but it is worth it **only if we keep to the JSON everyone actually parses.**
The moment we reach for a comment-carrying dialect, "everyone can read our files" stops being true,
and we have traded away the one property we chose JSON for.

---

## 1. Strict JSON everywhere we define a format

- **Interchange / wire formats** — control payloads, state snapshots, anything crossing a process or
  network boundary that we define. JSON text.
- **Our config and data files** — a service's own config, its runtime state store, device
  descriptors it defines — JSON on disk.

One serialization stack per project (in Rust, `serde_json` for all of it): one dependency, one set
of types, one test surface, no "which format for which file" confusion.

> **CameraConductor:** the WS control protocol is JSON text frames (state/delta/command).
> **LiteController:** device descriptors, the per-light runtime store, and the WS payloads are all
> JSON — ratifying what the family was already doing, not imposing something new.

---

## 2. No comments — annotate in DATA, not in syntax

Strict JSON has no comments. This is the one real cost, and the doctrine turns it into a **better
pattern than comments**: what you would have written in a comment becomes a **structured field.**

- Instead of `// verified on FS-200B`, carry `"_note": "verified on FS-200B"` or a `"meta"` block.
- Instead of a `// provenance: assumed` comment, carry `"_provenance": "A"`.
- A marker that must be *acted on* (e.g. an SMT break that caps a fact's confidence) is an object:
  `"smt": { "broke_from": "...", "changed": "...", "reverify": true }`.

**Why this is better than a comment, not merely a substitute for one:**

- **The loader can enforce it.** A comment is invisible to code; a field is data the program reads,
  validates, and acts on (capping confidence on an SMT-marked fact — [SMT Doctrine §7.2](smt-doctrine.md)).
- **It is greppable as data**, with the same discipline the rest of the record uses.
- **It survives round-tripping.** A program that reads and rewrites a JSON file (a runtime state
  store rewritten on every update) **destroys any comment** the moment it saves — so a comment there
  was never durable anyway. A field round-trips.

The residual cost is honest: a purely human-authored config where someone just wants an inline
`// this is high because the Pi's BLE is slow` is slightly clunkier as `"_comment": {...}`. That tax
is small, and it buys strict universality. Pay it.

---

## 3. ⚠️ JSONC / JSON5 are banned — they defeat the reason JSON was chosen

The tempting escape from §2 is a comment-carrying dialect — JSONC (`//` comments) or JSON5. **Do not
use them for any format we define.**

The reason is not purity; it is the **whole point of the standard.** JSON was chosen for
universality — that *every* parser reads it. `jq`, a browser's `JSON.parse`, a random language's
stdlib, an AI agent reading a file: many of these **choke on `//` comments.** The instant a file is
JSONC, "anyone can read our JSON" is false, and the standard has bought nothing. A dialect
re-introduces exactly the fragmentation this doctrine exists to kill.

If you need a comment, §2 is the answer: **put it in a field.** If you find yourself wanting JSONC,
you want §2.

---

## 4. What this does NOT govern

- **A tool's own format for its own files.** `Cargo.toml`, a linter's config, any third-party tool's
  mandated format — untouched. Follow the [Conventions Doctrine](conventions-doctrine.md): the
  ecosystem's convention wins for the ecosystem's own files.
- **Human-facing documents.** Markdown docs, READMEs, this doctrine — prose is prose.
- **Binary/bulk payloads.** A JPEG frame is bytes, not JSON (it rides as a binary frame alongside the
  JSON control messages — [WebSocket Control Doctrine §7](ws-control-doctrine.md)). JSON is for the
  structured control/config data, not for wrapping a blob in base64 for no reason.

---

## 4a. A MODEL and a MEASUREMENT are separate artifacts

When one file describes *what a thing is* (a durable model — a device description, a schema, a config) and
another records *what we measured about running it* (a spike result, a fault probe, a benchmark), **keep
them in separate files**, each with an explicit `kind`, cross-referenced by id — never fold the measurement
into the model.

They have different **lifecycles** (the model is stable per-thing-forever; a measurement can shift with an
OS update, a driver version, or the weather of the moment under the *same* thing), different **consumers**
(the model feeds the thing's normal operation; the measurement feeds a *decision about how to run it* —
e.g. an isolation strategy), and different **provenance ceilings**. Bundling them makes the durable model
carry volatile data and quietly couples two things that should version independently. A `kind` field on
each makes the two impossible to confuse even when both are loaded together.

> **CameraConductor:** the device description (a model the driver binds to) and the fault-behaviour record
> (a per-transport measurement the supervisor reads to choose in-process vs process-per-camera isolation)
> are **two sibling JSON files** — `<id>.json` and `<id>.fault-behaviour.json` — cross-referenced by id.
> The description stays a clean model; the fault record evolves on its own cadence.

---

## 5. Deviation

Like any convention, this yields to a **recorded, articulable constraint** (Conventions Doctrine §3)
— e.g. an external system we integrate with mandates a different format for a file it also reads. The
bar is the same: a real constraint, stated and recorded, never convenience. "I wanted comments" is
not a constraint — §2 covers it. "This file is consumed by a tool that only accepts YAML" is.

---

## 6. Checklist

- [ ] **Every format we define is strict JSON** (RFC 8259) — interchange and our config/data files.
- [ ] **No comments; annotations are structured fields** (`_note` / `meta` / `smt`), which the loader
      can enforce and which survive round-tripping.
- [ ] **JSONC / JSON5 are not used** for anything we define — they break universal readability.
- [ ] **A tool's own file keeps the tool's format** (Conventions Doctrine); we did not touch it.
- [ ] **A model and a measurement about it are separate `kind`-tagged files** (§4a), cross-referenced by
      id — never folded together.
- [ ] **Any deviation is a recorded, articulable constraint** — not "I wanted comments."
