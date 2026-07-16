# Confidence & Provenance Scoring Doctrine

**Scope: cross-project.** When a program **authors a record of facts it learned from mixed-quality
sources** — a reverse-engineered device description, an extracted dataset, a scraped spec, anything an
agent assembles from docs + probing + inference — each fact must carry **how sure we are and why**, on a
scale the program can compute and act on. This doctrine is the scoring model: how a raw fact earns a
number, how facts roll up to a whole-record score, and what that score gates.

The worked example throughout is **CameraConductor's** device description — a machine-authored map of what
a camera *actually does*, built from vendor SDKs, community sources, and live probing. But nothing here is
camera-specific: the same model fits any record whose facts come from sources of unequal trust.

---

## 0. The load-bearing rule

> **A fact without a provenance and a confidence is not a fact — it is a rumour the program will treat as
> true. Score every fact by WHERE it came from, keep the score ON the fact, and let the weakest facts,
> not the average, decide whether the record can be trusted.**

The failure this prevents: a machine assembles a record from a strong source here and a guess there, and
because the file *looks* uniform, a downstream consumer trusts the guess exactly as much as the
measurement. A wrong value stated confidently is worse than a missing one — the missing one gets
investigated; the confident-wrong one gets *built on*. Scoring makes the guess **visibly** a guess.

---

## 1. Provenance tags — where a fact came from

Every fact carries one tag naming its source class. These are the same three the [Documentation
Doctrine](documentation-doctrine.md) uses for prose, applied to individual data facts:

- **`[V]` Verified** — exercised live against the real thing and observed to behave as stated. The only
  tag that means "true here, now."
- **`[D]` Documented** — from a first-party / authoritative external source (a vendor SDK, an official
  spec), but not independently re-tested. Trustworthy; confirm on target.
- **`[A]` Assumed** — inferred, reasoned, pattern-matched, convenient. A hypothesis. **Never propagated
  as fact**; it travels marked so the gap stays visible.

**Provenance travels WITH the fact.** When a more-specific source overrides a fact, its tag rides with the
overriding value — a live-measured `[V]` fact is genuinely stronger than the `[D]` it replaced, and the
record must show *which* source backs each final value, not erase it into an average.

---

## 2. Confidence is COMPUTED, not asserted — and MULTI-DIMENSIONAL

A single hand-waved "high/medium/low" invites the author to grade their own homework. Instead:

- **Computed from evidence** (§3), so it is reproducible and auditable — you can always ask "why is this a
  7?" and get an answer from the inputs, not a vibe.
- **Multi-dimensional**, because "how sure" often splits into independent questions that a single number
  fuses and hides. In CameraConductor the two axes are **existence** (does this property exist? — cheap;
  the device self-reports) and **meaning** (what does this value *do*? — hard; cannot be probed, must be
  sourced). A record can be existence-certain and meaning-blind at the same time, and a one-number score
  would average that blindness away. **Pick the axes that are genuinely independent for your domain;**
  the point is that a strong cheap dimension must not mask a weak load-bearing one.

> **CameraConductor:** the same property code carries different value tables across camera bodies —
> *existence* is discovered for free at connect, but *meaning* is exactly what a device will not tell you.
> Scoring them separately is what stops "the camera has property 0x5010" (certain) from vouching for
> "value 5560 means 5560 Kelvin" (a guess).

---

## 3. The evidence-source ladder — how a raw fact earns its number

The raw 0–10 for a single fact is a function of **where it came from**, not how confident the author
feels. A concrete ladder (tune the bands per project; the *shape* is the doctrine):

| Score | Source class | |
|---|---|---|
| **10** | Verified live on the real instance `[V]` |
| **8–9** | First-party authoritative doc, for **this** instance `[D]` |
| **6–7** | First-party doc for a **sibling** instance, inherited via a known model `[D]` |
| **4–5** | Independent corroborating source (community, cross-reference) |
| **2–3** | A single unconfirmed source |
| **1** | Inferred / pattern-matched `[A]` |
| **0** | No evidence — the honest zero |

Deterministic and greppable: the number is defensible because it traces to a source class, not a mood.
*(An alternative raw-scoring basis is agreement-count — confidence rises with independent sources that
concur. Source-ladder and agreement-count can combine; pick deliberately and record which.)*

---

## 4. Roll-up: the weakest load-bearing fact clamps the whole record

A record's aggregate confidence is **not a plain mean.** A plain mean lets an abundant, cheap, uniformly-
high dimension (existence) drown a sparse, weak, load-bearing one (meaning) — the exact inflation §0
warns about. Two rules:

1. **Weight the load-bearing dimension.** The aggregate is a mean weighted toward the axis that actually
   determines trust (meaning over existence — a starting ratio is `[A]` until calibrated on real data).
2. **Clamp to the weakest load-bearing fact.** `aggregate = min(weighted_mean, lowest_meaning_score)`. A
   record with **any** blind load-bearing fact cannot average its way above the floor. This is the one
   guard that keeps the simple aggregate honest: a strong record with one poisoned value lands *at* that
   value, not above it.

---

## 5. The floor is a HUMAN-REVIEW TRIGGER — it queues, it does not discard

A confidence threshold below which a record is untrusted must **route to a human**, not silently drop or
silently ship:

- **At or above the floor → auto-accept** the record.
- **Below the floor → WITHHELD and QUEUED for a person**, recorded as *known-but-untrusted* with the
  reason and whatever partial data exists. The person **confirms it (accept as-is) or directs more work**
  (probe X, find source Y). **Nothing below the floor ships unratified, and nothing below it is silently
  thrown away.**

"We don't know this well enough" becomes a **first-class, actioned outcome** — a decision a human makes,
not a low number buried in a shipped file. Silent-discard loses real work; silent-ship is the confident-
wrong-fact failure. Queue-for-review is the only honest third option.

---

## 6. The evidence ceiling is uneven — say so

Different sources cap out at different confidence *before you even start*. One vendor documents behaviour
richly (reachable to high confidence from docs alone); another documents only surface meaning (behaviour
needs live probing to score at all); another hides the underlying layer entirely (some facts are
unobservable without hardware). **The same floor therefore costs different work to clear per source** —
and a record sitting in the review queue for *under-confidence on a source that documents little* is the
**expected case, not an anomaly.** Do not present a uniform threshold as if it were uniformly reachable;
state the ceiling so a low score reads as "this source is thin," not "the tool failed."

---

## 7. Never ship a guessed value dressed as a measured one

The discipline that underwrites the whole model: an `[A]` value that *cannot be derived cleanly* degrades
to an **honest lower-confidence fact or an explicit "unknown"** — never a confident-looking value invented
to fill the slot. A guessed value that *looks* measured lies more convincingly than a blank. If you cannot
earn the number, record the gap; the review floor (§5) exists to catch exactly that gap and hand it to a
person.

> **CameraConductor — the named breakage.** A device's white-balance descriptor *declares* a smooth range
> but the hardware snaps to a coarser grid. Publishing the declared range as if measured would be a
> confident lie. The rule: measure it (write-read-back), publish the **real** values with `[V]`, keep the
> declared range beside them marked untrustworthy — and if it cannot be measured cleanly, degrade to an
> honest coarse control, never a guessed fine one. **A wrong grid lies confidently; an honest gap does
> not.**

---

## 8. Checklist

- [ ] **Every fact carries a provenance tag** (`[V]`/`[D]`/`[A]`) and a **computed** confidence, and both
      **travel with the fact** on override — never averaged away.
- [ ] **Confidence is multi-dimensional** where the domain has independent "how sure" axes; a cheap strong
      dimension never masks a weak load-bearing one.
- [ ] **The raw score comes from an evidence-source ladder** (or agreement-count) — reproducible and
      auditable, not a self-graded vibe.
- [ ] **The aggregate is weighted toward the load-bearing dimension and clamped to its weakest fact** — a
      plain mean is a bug.
- [ ] **The trust floor is a human-review trigger** — below it, queue for a person (accept-as-is or
      direct-more-work); never silent-discard, never silent-ship.
- [ ] **The evidence ceiling's unevenness is stated**, so a low score reads as a thin source, not a
      failure.
- [ ] **No `[A]` value is ever dressed as measured** — degrade to an honest gap and let the floor catch it.
