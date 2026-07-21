# Network Allocation Doctrine

**Scope: cross-project — FOSS projects only.** How the family hands out the shared,
collision-prone namespaces a project needs at the network edge: **TCP/UDP ports**, **mDNS
service names**, **private IPv4 networks**, and **BLE-mesh addresses**. It exists so two
projects never silently claim the same number, name, or subnet — and so an agent (or the
owner) can assign one by reading a single living record instead of guessing.

It exists for one reason: **a shared namespace with no registry is a collision waiting to
happen.** Ports, service names, and subnets are all spaces where "I'll just use 8080 /
`_app._tcp` / `172.x.0.0/24`" by two projects means they cannot run side by side on one
machine or one LAN. Written down once, with a rule for who assigns and a table of what is
taken, the collision becomes *inexpressible* rather than merely unlikely.

**This governs FOSS family projects only.** Personal infrastructure, the owner's VM/testing
labs, and anything outside the FOSS family are **explicitly out of scope** — this doctrine
never dictates their addressing.

**Companion:** [Service Foundations Doctrine](service-foundations-doctrine.md) owns *how* a
service treats its port (settable, resolved together with host, **bind failure loud and
fatal**); [WebSocket Control Doctrine](ws-control-doctrine.md) references a "family-coordinated
port contract" — **this document is that contract.** [Conventions Doctrine](conventions-doctrine.md)
owns the *platform mechanics* of mDNS (Bonjour on macOS, Avahi / `systemd-resolved` on Linux);
this document owns only the *names*. It restates none of them.

---

## 0. The load-bearing rule

> **A port number, a service name, or a subnet is a shared namespace. State every assignment
> once, in the living tables below; assign the next free slot by the rule for that namespace;
> and never invent a number a table could have told you was taken. The registry is the source
> of truth for what is allocated — an assignment is real when it is committed here, not when a
> service happens to bind it.**

---

## 1. Ports

**A port assignment reserves that number on both TCP *and* UDP.** Always both — a project
that reserves 2911 owns 2911/tcp and 2911/udp, whether or not it uses both today.

### 1.1 The main project range — `2900–2939`

- **`2900–2909` (290X) is owner-reserved.** Only the owner assigns a 290X port, explicitly,
  per project. An agent never assigns from this block.
- **`2910–2939` is the assignable pool.** Assign **sequentially** — next free number.
- **On exhaustion, wrap to `2840–2899`** and continue sequentially there. That lower block
  exists *only* as overflow; nothing is assigned from it until 2910–2939 is full.

### 1.2 Prefer one port — the second-channel decision

A project should expose **one** port. When it seems to need a second listener, resolve it in
this order — a new *fixed* port is the last resort, not the reflex:

1. **Multiplex over the main port.** If the extra channel can be reached through the main
   port's protocol (a sub-protocol, a framing/channel field on the WebSocket), do that. No
   new port. This is the default.
2. **Ephemeral + mDNS, for a dynamic auxiliary interface.** If the channel needs its own
   socket but its port need not be fixed, bind an **OS-ephemeral port** (§1.4) and **advertise
   it over mDNS** (§2) so clients discover it instead of hardcoding it. This is the preferred
   shape for a **debug interface** — the model is Android wireless debugging: it opens an
   ephemeral port and registers it via mDNS. Nothing well-known is consumed.
3. **A fixed auxiliary port, only if the channel must be well-known.** If a client genuinely
   needs a stable, pre-known aux port (it cannot discover via mDNS, cannot multiplex), assign
   one from the **auxiliary range `3129–3224`, sequentially, and document it** as a sub-entry
   of the project. **This range does not wrap** — if it ever exhausts, that is a signal to
   revisit, not to overflow silently.

The test for "needs its own socket": a **different transport / wire protocol** a client cannot
reach through the main channel's framing (e.g. a raw HTTP metrics scrape, a distinct protocol
family). *"It would be cleaner to separate"* is **not** a reason — that is the multiplex case.

### 1.3 Ephemeral (OS-assigned) ports

For any port the OS assigns dynamically (outbound connections, the §1.2.2 debug interface,
anything transient), use the **IANA-recommended dynamic range `49152–65535`**. The OS picks;
we do not assign these in the table.

### 1.4 Who assigns

The **agent may assign** from the main assignable pool (2910–2939) and the auxiliary range —
that is why the table below is living. **Only the owner assigns 290X** (§1.1). An assignment
is official when it is committed to the table here.

## 2. mDNS / Bonjour service names

Same protocol under two names: `.local` multicast DNS, whether via Apple Bonjour or Linux
Avahi / `systemd-resolved`. The **platform mechanics belong to the [Conventions Doctrine](conventions-doctrine.md)**;
this doctrine owns only the *naming*, because the service-type name is a LAN-shared namespace
two projects can collide on exactly like a port.

- **A service advertises under its product slug:** `_<product-slug>._tcp` (or `._udp`).
- **An auxiliary interface appends its role:** the debug interface of §1.2.2 advertises as
  **`<product-slug>-debug`**; other auxiliary channels follow the same `<product-slug>-<role>`
  form.
- **Discovery is by advertisement, never by editing another machine's hosts file.** Writing to
  a foreign host's `/etc/hosts` (or equivalent) is **forbidden** — it is a hostile act against
  someone else's system. A service makes itself findable by advertising, and resolves peers by
  their advertised `.local` name; it never rewrites another host's static resolution.

## 3. Private IPv4 networks — `172.23.0.0/16`

All family-defined private networks (container bridges, and any other case where *we* choose
the addressing) live inside **`172.23.0.0/16`**, carved by purpose:

| Block | CIDR | Purpose |
|-------|------|---------|
| **Container networks** | `172.23.0.0/18` | Per-project container bridge networks (Docker / Podman / compose). Sub-allocated **one `/24` per project** (254 usable hosts) — 64 projects fit. If a project needs less, a `/26` (62 hosts) is the tightening unit; if the `/18` ever fills, that is the signal to sub-allocate at `/26` or extend. |
| **Documentation / examples** | `172.23.240.0/20` | The block for example IPs that must **never** be real infrastructure — the family analog to RFC 5737. Any address written into a doc, README, or example comes from here. Placed at the top of the space so it is visibly not live infrastructure. |
| **Reserved / future** | `172.23.64.0`–`172.23.239.255` | Unallocated. New purposes are assigned into the middle of the space as needs appear, leaving room above and below each new block to grow. |

Assignment: the **agent assigns the next free `/24`** in the container block and records the
project → subnet mapping in the table below; the owner may override.

### 3.1 VMs are not a network allocation

- **A local VM does not consume a `172.23` allocation.** If we must run a VM on a dev machine
  it is **bridged** (it takes an address from the real LAN it bridges onto) or, failing that,
  **NAT behind the host** (a host-private range that never touches family space). Either way it
  gets no block here. **The owner's own VM / testing infrastructure is out of scope entirely
  (§0 scope) — this doctrine never governs it.**
- **A VM spun up on pre-existing VM infrastructure is a product-behaviour rule, not a range.**
  When a product must provision a VM on infrastructure that already owns its addressing, the
  product must **offer "static or DHCP," or default to DHCP; if static, the user enters the
  address.** No block is allocated here for it.

## 4. BLE-mesh addresses

BLE mesh has its own 16-bit address space, **separate from IP**. A product that provisions a
mesh (today: LiteController) allocates within it; this doctrine sets the *scheme* so any mesh
product allocates consistently. The **live per-node assignments live at the product** (its
device/mesh model) — this section owns only the allocation convention (SSoT: the rule here,
the data at the product).

- **Unicast `0x0001–0x7FFF`** — one per provisioned node. Assign **sequentially from
  `0x0001`**. Addresses freed by `reset`/unprovision **are reclaimable** (a mesh is small and
  churns, unlike ports).
- **Group `0xC000–0xFEFF`** — **`0xC000` is reserved as the default "all-in-this-mesh"
  group** (matches current use); named look-groups assign **sequentially from `0xC001`**.
- **Virtual `0x8000–0xBFFF` and fixed/broadcast (`0xFF00–0xFFFF`, incl. all-nodes `0xFFFF`)**
  — **reserved by the mesh specification; do not allocate.** Listed so nothing reuses them.

---

## 5. The living tables

These are the source of truth. An assignment exists when it is committed here.

### 5.1 Port assignments

| Project (slug) | Main port | 290X? | Auxiliary (3129–3224) | Notes |
|----------------|-----------|-------|-----------------------|-------|
| litecontroller | 2910 | no | — | The `litecontrollerd` northbound WS (CommonTongue `northbound.v1`). TCP+UDP. Debug surface uses an ephemeral port + `litecontroller-debug` mDNS (§1.2.2), not a fixed aux port. |

*Assign the next free 2910–2939 sequentially; 290X owner-only; wrap to 2840–2899 on
exhaustion. Every reservation is TCP+UDP.*

### 5.2 mDNS service names

| Project (slug) | Service type | Auxiliary services |
|----------------|--------------|--------------------|
| _(none assigned yet)_ | `_<slug>._tcp` | `<slug>-debug`, … |

### 5.3 Network assignments (`172.23.0.0/16`)

| Project (slug) | Container /24 | Notes |
|----------------|---------------|-------|
| _(none assigned yet)_ | | |

*Assign the next free /24 in `172.23.0.0/18`; docs/examples use `172.23.240.0/20`.*

---

## 6. Checklist

- [ ] **FOSS family project?** If not — personal infra, owner's VM/testing labs — this
      doctrine does **not** apply (§0).
- [ ] **Port assigned from the right pool**, sequentially, recorded in §5.1: 2910–2939
      (agent) / 290X (owner only) / 2840–2899 (overflow only). TCP+UDP reserved together.
- [ ] **Second channel resolved in order** (§1.2): multiplex → ephemeral+mDNS → fixed
      3129–3224. A new fixed port is justified against a real wire-protocol need, not
      convenience.
- [ ] **mDNS name is the product slug** (`_<slug>._tcp`), aux is `<slug>-<role>`; no foreign
      hosts file was touched (§2).
- [ ] **Network is a /24 inside `172.23.0.0/18`**, recorded in §5.3; example IPs come from
      `172.23.240.0/20`; no block invented for a VM (§3.1).
- [ ] **BLE-mesh allocation follows §4**; live addresses recorded at the product, not here.
- [ ] **The assignment is committed to the living table** — it is not real until it is (§0).
