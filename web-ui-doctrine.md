# Web UI Doctrine

**Scope: cross-project.** How a project that has a **web UI** should structure it: the UI is a
**separate, independent client** — not embedded in the service it controls — and its **styling is a
replaceable asset**, not compiled-in. Applies to *any* family project with a web UI, service-shaped
or not.

It composes two existing doctrines rather than restating them: the [WebSocket Control
Doctrine](ws-control-doctrine.md)'s *"the UI is just another client, no privileged back channel"*
(§0), and the [Visual Identity](visual-identity.md) accessibility floor. This doctrine makes the
first **structural** and the second **operational**.

---

## 0. The load-bearing rule

> **The web UI is a separate client with its own crash domain, reaching the service only through the
> same public interface every other surface uses. Its styling is an editable, replaceable asset the
> service does not compile in. A privileged back channel is impossible by construction, and a
> restyle never requires a rebuild.**

Two independent properties, one rule each below (§1 process separation, §2 styling as an asset).
Both exist so the UI can be **replaced, restyled, restarted, or reimplemented entirely without
touching — or endangering — the service.**

---

## 1. The UI is a separate, independent client

The web UI runs as its **own artifact in its own process** (the browser, or a browser-like host),
and reaches the service **only over the service's public northbound interface** (the WS/REST/gRPC
control surface — whatever the project exposes to *all* clients). It is not linked into the service,
not privileged, not special.

**This is the structural form of "the UI is just another client."** The [WebSocket Control
Doctrine §0](ws-control-doctrine.md) states that rule as a principle — *route the service's own face
through its own front door, so the API is provably complete.* As a mere convention, that erodes: the
next expedient change adds a shortcut. Making the UI a **separate process** makes the rule
**impossible to violate** — there is no shared address space in which a privileged channel *could*
be added. *(Doctrine: [make the invariant structural, not advisory](decision-doctrine.md) §7.)*

**Why separation, concretely:**

- **Independent crash domain.** A bug in the UI cannot take the service down. This is the **same
  reliability reasoning** the family used to reject in-process dynamic module loading (a crashing
  in-process module kills the host — see [Service Foundations](service-foundations-doctrine.md) /
  the blueprint's module decision). A UI is exactly the kind of thing you do **not** want sharing a
  crash domain with a service whose top value is reliability.
- **Easy replacement / reimplementation.** The UI can be swapped for a different one, rewritten in a
  different stack, or dropped entirely — the service neither knows nor cares. Several different UIs
  can run against one service at once (it already supports multiple clients).
- **Independent deployment and versioning.** UI and service ship on their own cadence; a UI update
  is not a service redeploy.
- **Language independence.** The UI is whatever the browser runs; the service is whatever it is.
  Neither constrains the other.
- **Provably complete API.** Because the UI has no back channel, anything it can do, it did over the
  public interface — so an external client (a deck, an agent, another service) can do it too.

### 1.1 The service MAY serve the UI's assets — but only as static, overridable files

Separation does not mean the operator must host the UI themselves. The service **may serve** the
UI's static files (HTML/CSS/JS) over HTTP — convenient for a headless target (a Raspberry Pi) that
has no other web host. This is not a contradiction: **serving static files is not embedding.** The
served assets still execute as an **independent client in the browser**, still talk to the service
only over the public interface, and still have their own crash domain (the browser tab, not the
daemon).

The constraint: what the service serves are **plain, overridable, editable files** — not a compiled,
minified, opaque blob baked into the binary. Serving them is a *file-handout*, not a linkage. (If a
project prefers the service know nothing about the UI at all — the operator deploys it separately —
that is also conformant; §1's separation is the requirement, serving is a permitted convenience.)

---

## 2. Styling is a replaceable asset, not compiled in

The UI's styling — its CSS, its theme — lives as **editable, replaceable asset files**, so that
**restyling, rebranding, or accessibility-tuning never requires recompiling anything.**

- **CSS is a file, not a string in the binary.** A user or operator can edit it, or drop in a
  replacement, and reload — no build step.
- **This is the operational form of the [Visual Identity](visual-identity.md) theming model.** That
  doctrine already says type/size/density/colour are tokens the user must be able to override, and
  ships `foundation.css` as a drop-in. This doctrine adds: those assets are *operationally*
  replaceable at runtime, not frozen at compile time.

### 2.1 ⚠️ A replaceable stylesheet MUST NOT be able to break the accessibility floor

Freedom to swap the CSS is **cosmetic freedom only.** It must **not** be able to destroy focus
visibility, live regions, semantic structure, or minimum hit targets. This is not a new rule — it is
exactly the **two-layer accessibility floor** the [Visual Identity §6](visual-identity.md) already
designs: `@layer floor-hard` (first, `!important`) beats a hostile stylesheet's `!important`, and
`@layer floor-soft` (last, normal) beats its normal rules, so **total cosmetic freedom sits over a
small set of guarantees the stylesheet cannot override.**

So the two halves compose cleanly and are already reconciled by existing doctrine:

- **Swap the CSS freely** (this doctrine §2) — colours, fonts, spacing, shape, whole themes.
- **Cannot destroy accessibility** (Visual Identity §6) — the floor holds by cascade-layer
  construction, verified by an adversarial hostile-stylesheet test.

**Ship the attack.** Per Visual Identity, the floor is only trusted once a stylesheet that genuinely
tries to break it has been watched to fail against the unprotected version. A replaceable-CSS UI
makes that test *more* important, not less — the whole point is that arbitrary stylesheets will be
loaded.

---

## 3. What this does NOT require

- **Not a specific UI stack.** React, Svelte, plain HTML, whatever — the doctrine is about
  *separation and replaceability*, not technology.
- **Not that the service serve the UI.** Serving static assets is a *permitted convenience* (§1.1);
  a project may equally leave hosting to the operator. The requirement is the *separation*.
- **Not a second protocol.** The UI uses the **same public interface** as every other client. If the
  UI needs something the public interface can't do, the fix is to add it to the public interface (so
  every client gets it), never a private UI-only channel — that would re-create the back channel §1
  forbids.

---

## 4. Checklist

- [ ] The web UI is a **separate artifact with its own crash domain**; a UI bug cannot take the
      service down.
- [ ] The UI reaches the service **only over the public northbound interface** — no privileged back
      channel (impossible by construction, not by convention).
- [ ] If the service serves the UI, it serves **plain, overridable static files**, not a compiled-in
      blob — and the served UI still runs as an independent browser client.
- [ ] **Styling is an editable, replaceable asset** (CSS as a file); restyle never needs a rebuild.
- [ ] A replaceable stylesheet **cannot break the accessibility floor** — the [Visual Identity
      §6](visual-identity.md) two-layer `@layer` floor holds, **verified by an adversarial hostile
      stylesheet** watched to fail against the unprotected version.
- [ ] Anything the UI can do is doable over the public interface — so any other client can do it too.
