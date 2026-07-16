# Conventions Doctrine

**Scope: cross-project.** When you operate inside an established context — an operating system, a
language, a protocol, an existing codebase — **follow its conventions by default.** The context has
a settled way of doing things; adopting it is what makes your work legible to everyone else already
there. Deviating is permitted, but only against a **recorded, articulable justification** — a real
constraint, never mere convenience.

**The principle is broad; the primary worked example is platform (OS) integration** — where a file
belongs, how a service launches, how an app behaves like a native citizen of its OS. But the same
rule governs a language's idioms, a protocol's norms, and an existing codebase's patterns. The
example is platform conventions; the doctrine is *conventions*.

---

## 0. The load-bearing rule

> **The established convention is the default, and the default wins. You deviate only with a reason
> you can state out loud — a real constraint — and you record the deviation where it can be found.
> "It was easier" is not a reason; it is the tell that you should not have deviated.**

A convention exists because a community of people (OS designers, a language's authors, the authors of
the codebase you are in) already agreed how this is done. Following it is not conformity for its own
sake — it is the single cheapest way to be **predictable to everyone who comes after you.** A file in
the place the OS says it goes is found by every tool that looks; a function written in the codebase's
existing style is read without friction by the next person. **Novelty here is a cost you pay and
others pay** — spend it only when a convention genuinely fails you.

---

## 1. Follow the platform's conventions (the primary worked example)

An application is a **citizen of the operating system it runs on**, and each OS has settled
conventions for how a well-behaved app behaves. Follow them per-platform — do **not** impose one
platform's habits on another, and do **not** invent your own where the OS already has an answer.

### 1.1 Filesystem placement — where files live

Every OS specifies where an app's config, state, cache, and logs belong. Use those locations; never
hardcode a home path; never carry one platform's layout onto another.

| Kind | Linux (XDG Base Dir) | macOS | Windows |
|---|---|---|---|
| Config | `$XDG_CONFIG_HOME` → `~/.config/<app>/` | `~/Library/Application Support/<App>/` | `%APPDATA%\<App>\` |
| State / data | `$XDG_STATE_HOME` / `$XDG_DATA_HOME` | `~/Library/Application Support/<App>/` | `%LOCALAPPDATA%\<App>\` |
| Cache | `$XDG_CACHE_HOME` → `~/.cache/<app>/` | `~/Library/Caches/<App>/` | `%LOCALAPPDATA%\<App>\Cache\` |
| Logs | `$XDG_STATE_HOME/<app>/` (or the service manager's journal) | `~/Library/Logs/<App>/` | `%LOCALAPPDATA%\<App>\Logs\` |

- **Resolve the base directory from the platform, not a literal.** Read the env var (with its
  documented fallback); do not write `~/.config` on macOS or `~/Library` on Linux.
- **Document the resolved path** so an operator can find their files (Service-Foundations §1.1).

> **LiteController — the misstep that motivated this doctrine.** The Nanlite reverse-engineering used
> `~/.config/nanlite/lights.json` — a Linux-style path, and simply *wrong* on macOS. That was fine
> for quick-and-dirty spelunking, but it is not how the shipping service places files. The owner's
> correction, verbatim: *"The research was just to figure shit out in a quick and dirty way. For
> something real, we should abide by platform conventions."* The real service resolves
> `~/.config/litecontroller/` (Linux) vs `~/Library/Application Support/LiteController/` (macOS) from
> the platform, and documents each.

### 1.2 The rest of OS integration

Filesystem placement is the most common case, not the only one. A native citizen also follows the
platform on:

- **Launch / autostart** — the OS's service/agent mechanism (launchd on macOS, systemd on
  Linux, the Service Control Manager on Windows), not a hand-rolled cron line or a login-script hack.
  *(Service-Foundations §7 covers the ship-and-document rule.)*
- **Permission & notification prompts** — request through the OS's consent flow; never try to
  route around it.
- **Presence idioms** — a menu-bar/tray item where that is the platform norm; a headless daemon
  where that is; not a foreign metaphor bolted on.
- **Native look and feel** — where an app has a UI, it should feel like it belongs on that OS, not
  like a foreign toolkit ported over. *(This codifies a standing family value: build the native
  thing, not a cross-platform port that reads as alien on every platform it runs on. medit is a
  native macOS editor for exactly this reason; a GTK port would violate it.)*
- **Signal & lifecycle handling** — respond to the platform's termination/reload signals the way
  the platform expects (and flush durable state on the way down — Service-Foundations §3).

---

## 2. The same rule beyond the OS

The platform is the worked example; the principle is general. Follow the established convention of
whatever context you are in:

- **A language's idioms.** Write Rust that reads like Rust, Python that reads like Python — the
  community's accepted style, error handling, and project layout. An idiom you fight is friction you
  impose on every reader.
- **A protocol's norms.** When you speak an existing protocol, honour its conventions rather than
  inventing a private dialect on top. *(The [WebSocket Control Doctrine](ws-control-doctrine.md) is
  itself a family convention — a service that follows it interoperates for free.)*
- **An existing codebase's patterns.** Code you add to a project should match the naming, structure,
  and comment density already there. The convention that is already in the tree wins over your
  personal preference — a codebase written in two styles is harder than one written in either.

---

## 3. Deviation is allowed — but it is a recorded, justified exception

Conventions are the default, not a cage. Sometimes following one is genuinely wrong — two platforms'
conventions conflict irreconcilably, a convention predates a capability you need, a hard technical
limit makes it impossible, or a convention actively breaks a user-visible requirement. **In those
cases you deviate — and you do it in the open.**

The governance mirrors [Decision Doctrine §1](decision-doctrine.md)'s "a violation requires a
recorded, approved exception, never a silent one":

- **State the real constraint.** Name *specifically* why the convention fails here. A legitimate
  reason is a **constraint you can articulate** (a cross-platform conflict, a technical
  impossibility, a requirement the convention breaks). An illegitimate one is **convenience or
  effort** — and per §0, "it was easier" is the *tell* that you should have followed the convention.
- **Record it where deviations are found.** The exception goes in the project's decision record, and
  it carries a **greppable marker** so "everywhere we broke a convention, and why" is one search —
  the same discipline the [Documentation Doctrine](documentation-doctrine.md) applies to superseded
  facts. A convention broken *silently* is the failure; a convention broken *on the record, for a
  named reason* is ordinary engineering.
- **Deviate as narrowly as the constraint demands.** Break the one convention the constraint forces,
  not the whole family of related ones. A single justified exception is not a licence to go your own
  way generally.

> **The tell, restated.** If your justification for deviating is *"it was faster / simpler / I'm more
> used to it"*, you have not justified a deviation — you have described the cost the convention was
> saving everyone else. Follow the convention. If your justification is *"macOS and Linux disagree
> here and I must pick one for this shared file,"* that is a real constraint: deviate, record it,
> mark it, move on.

---

## 4. Checklist

- [ ] **Files go where the platform says** (config/state/cache/logs), resolved from the platform's
      base-dir mechanism — never a hardcoded home path, never one OS's layout on another.
- [ ] **OS integration follows the platform** — launch/autostart, permission prompts, presence
      idioms, native look-and-feel, signal/lifecycle handling.
- [ ] **Language idioms, protocol norms, and the existing codebase's patterns are followed** by
      default; your personal preference does not override the convention already in place.
- [ ] **Every deviation carries an articulable constraint** — not convenience; "it was easier" is the
      tell you should not have deviated.
- [ ] **Every deviation is recorded and greppable** — in the decision record, with a marker, so all
      broken conventions can be found in one search.
- [ ] **Deviations are as narrow as the constraint demands** — one justified exception is not a
      general licence.
