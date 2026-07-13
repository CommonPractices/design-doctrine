# Decision Doctrine

**Scope: cross-project.** How to make, record, and defend product and architecture decisions.

The companion to [UI/UX Design Doctrine](ui-ux-design-doctrine.md): that one is about *building
things*, this one is about *deciding what to build*. They are read on different days by
different moods.

As before: principles portable, examples concrete. Most rules here exist because a specific
decision went wrong, and the wrongness is named.

---

## 1. Have ordered values, and use them

**Name a small set of guiding values, put them in priority order, and check every non-trivial
decision against them.**

The **order is the entire point**. Unordered values are useless *precisely when you need them*
— when two of them conflict. "We value security and speed" resolves nothing at 2 a.m.

Rules of use:

- **Small.** Three to five. A list of ten is a list of none.
- **Ordered.** Not a set. A ranking.
- **Consulted before deciding**, not cited afterward to justify a decision already made.
- **A violation requires a recorded, approved exception.** Never a silent one.

> **CameraConductor's** are, in order: **Accessibility · Ease of use (for the primary flow) ·
> Speed · Choice.**
>
> **These are that project's judgment, not a universal ranking.** A different product might
> rightly put Speed first, or have Security or Cost as a star. The *machinery* transfers; the
> *contents* do not. (Adopting someone else's values wholesale is exactly the scope-widening
> failure in §3.)

**Present the analysis WITH the question, never after it.**

When you bring someone a decision, show what the values say about each option *in the question
itself*. Producing the analysis only when challenged is a tell that you decided first and
rationalised second.

> **CameraConductor:** this had to be said out loud — *"North Star analysis before every
> choice… present that analysis WITH the question, never after or on request."* It was a
> correction, and it was fair.

---

## 2. Ordered values are for resolving genuine conflicts

Most decisions don't need them. The ones that do are the ones where **two of your values point
in opposite directions** — and the temptation is to quietly sacrifice the lower-ranked one and
not mention it.

**Don't sacrifice. Look for the construction that satisfies both.** The ranking tells you who
wins *if you fail*; it is not permission to stop trying.

> **CameraConductor — Accessibility (#1) vs Choice (#4), head-on.** Users should be able to
> restyle the interface completely (Choice). Every restyling freedom is also a way to destroy
> focus visibility, contrast, or hit targets (Accessibility).
>
> The lazy resolutions were both bad: *"Choice loses, no custom CSS"* (a real need denied), or
> *"ship it and hope"* (an accessibility North Star in name only).
>
> The resolution was a **floor**: users get **total cosmetic freedom** — colours, fonts,
> spacing, shape — over a small set of guarantees they **cannot** override (focus rings, live
> regions, minimum hit targets), enforced by construction rather than by convention. **The one
> thing you may not do is make the product unusable for someone else.**
>
> Both values are satisfied. Neither was traded. **That is what the ranking is for — not to
> pick a loser, but to tell you which one you are not allowed to lose.**

---

## 3. Never widen a scoped rule into a law

**The single most common decision failure**, and the most expensive, because the invented rule
gets *cited with the authority of the evidence it corrupted*.

The mechanism: take a narrow, correct rule → restate it stripped of its qualifiers → enforce
the widened version, sometimes against the very person who gave you the original.

**The tell:** a **safety property** (*"don't destroy X"*, *"don't do Y unbidden"*) mutating into
a **usage mandate** (*"the user must do X by hand"*, *"Y is forbidden"*). **Evidence almost
never licenses the second.** If your rule tells a user how to do their job, you have probably
over-widened.

**Guards:**

- When restating a rule, **carry its qualifiers verbatim** — *"on connect"*, *"by default"*,
  *"for unknown devices"*. If the summary can't fit the qualifier, the summary is wrong.
- Before invoking a rule to **contradict someone**, re-read the source sentence. Does it
  actually say that, or something narrower you generalised?
- **Separate the two halves of every hard-won lesson:** the **scoped policy** ("don't do X by
  default in situation S") and the **universal mechanic** ("whenever you do X, do it via the
  robust path"). The second is usually universal. The first almost never is. Conflating them
  manufactures a false prohibition.
- **Defaults exist to be overridden.** That is what a default *is*. Someone choosing different
  behaviour is using the system as designed, not violating it.

> **CameraConductor, three times in one session:**
>
> 1. A hardware note said *"never auto-start live view **on connect**"* — a default for a device
>    the host has no instructions for. I dropped "on connect", restated it as the universal
>    *"never auto-start live view"*, and then **used my own over-generalisation to argue against
>    the user's design decision** — framing it as *"you're overriding a verified finding."* I
>    wasn't defending their evidence. I was defending my corruption of it.
>
>    The **scoped policy** was "don't surprise an unknown device". The **universal mechanic** —
>    the part actually worth keeping — was "a naive start call is unreliable *whatever* triggers
>    it, so always use the robust retry path."
>
> 2. The requirement was *"help me match my cameras."* I built *"flag every property that
>    differs"* — but two cameras legitimately differ on creative settings. **Warning about
>    intentional differences trains the user to ignore the warning that matters.**
>
> 3. The requirement was *"don't destroy what the user wrote"* (a **safety property**). I wrote
>    it into the decision log as *"the config is hand-authored and the service never writes
>    it"* (a **usage mandate**) — which forced every new user to hand-edit YAML before the
>    product would do anything. The user's verdict: *"This req violates north star(s) as it
>    sits now."* They were right: it trampled Ease-of-use and Choice both.
>
> All three were caught by the user, not by me. **Run new rules against your ordered values
> before recording them** — all three would have been caught.

---

## 4. If a behaviour has a defensible alternative, it is a setting

**Do not pick one and hard-code it. Do not ask which one to bake in.** Offer the choice, and
**default to the safe one.**

The default is safe not because it's better, but because **a wrong default must be
survivable**.

- Ask about **what the default should be**, not which behaviour to hard-code.
- Still ask when the alternatives are *genuinely different designs* with different costs — not
  merely risk-vs-speed.
- Pairs with a **reveal-not-enable** model: the setting always exists and its default is always
  in effect; the *control* to change it can hide behind an "Advanced" reveal. Non-default
  choices should appear in an inventory, so nothing is a hidden surprise.

> **CameraConductor:** the user gave me this same answer **four separate times** before I
> promoted it to a principle — *"make it selectable"*, *"default to X, same advanced for Y"*,
> *"immediate should be an advanced setting"*, *"2 is the default, but 1 and 3 are options"*,
> *"as with most of these, controllable via settings."*
>
> It now governs: save mode (manual/auto), confirmation prompts, reconnect behaviour, live-view
> auto-off, which properties are compared, layout, theme. **If I am building a 2–3 option
> question whose options are "behaviour A vs behaviour B" and both are defensible — the answer
> is almost certainly "all of them, A is the default."**

---

## 5. Absent, hidden, and disabled are three different statements

Choosing the wrong one lies to the user about their own world.

| Form | Says | Use when |
|---|---|---|
| **Disabled** | *"This exists, applies to you, and is unavailable right now."* | A temporary state the user can change |
| **Hidden** (behind a reveal) | *"This exists and applies to you; you asked not to see it."* | Power-user machinery, opt-in |
| **Absent** | *"This is not part of your world."* | The underlying situation cannot arise for this user |

> **CameraConductor:** a hobbyist with one camera has no *lease* to contend for and no second
> body to *calibrate against*. Those aren't features they haven't unlocked — **the concepts do
> not exist for them.** Showing a greyed-out "lease" control would be an unkindness dressed as
> a courtesy. They are **absent**.
>
> Conversely: a read-only telemetry value (a lens's focal length) is **text, not a disabled
> input** — a disabled input says *"you could set this if…"*, and you never can.

---

## 6. Preview before writing to anything live

Any action that **writes to a live, external, or shared thing** — a running device, another
user's state, N things at once — must **show exactly what it will change, and confirm.**

Safe **by design**, not by obscurity. Do not bury the action to make it safe; **surface it and
make it honest.** Burying a primary verb makes the primary flow worse.

And per §4: *skipping the confirmation* is itself a legitimate setting for someone who's earned
it — off by default.

> **CameraConductor:** *"apply this look"* writes to **every camera following it** — N live
> bodies re-exposed at once, mid-shoot, from one click. So it previews: which cameras, which
> values, old → new, and what it will **not** touch (anything deliberately overridden). The
> confirm button names the blast radius: **"Change 3 cameras."**
>
> Someone iterating on a look in a controlled setup will hit that dialog fifty times, so
> *"apply immediately, without confirming"* is an Advanced toggle. Someone mid-shoot with three
> cameras rolling should absolutely not have it off by default. **Same control, different risk,
> user picks.**

---

## 7. Make invariants structural, not advisory

If a rule matters, **make it impossible to violate** — not merely documented, reviewed, or
agreed. Conventions erode; constructions don't.

> **CameraConductor:** the coordinating "master" node must never drive a camera directly — all
> control must flow through the abstraction. Stated as a convention, that erodes in six months.
>
> The construction: **the master's UI contains no camera controls at all.** Want to control one
> camera from there? Give it a preset of its own — direct control becomes a *degenerate case of
> the general mechanism*, needing zero special-case code. The hierarchy is now enforced by the
> fact that **there is no code path that could violate it.** (Verified mechanically: zero camera
> controls present in that view.)
>
> A second dividend: since the master never writes to a camera, it **never needs a camera
> lease** — an entire class of cross-machine ownership problems was **deleted rather than
> solved.**

**The best decisions delete problems instead of solving them.** When a proposal makes a hard
question *moot* rather than answered, that is a strong signal it's right.

---

## 8. Record every decision, and record what is NOT decided

An unrecorded decision will be re-derived — differently — by someone (including you) in three
weeks.

- **One decision log.** Every entry: the decision, its **status**, why, what it supersedes, and
  the **provenance** of its evidence.
- **Distinguish evidence from reasoning.** Tag what was *verified* against reality, what came
  from an *authoritative source*, and what is merely *assumed*. **Never let an assumption
  travel as a fact.**
- **Record proposals that were not accepted**, marked as such. A proposal recorded as decided
  is how a project poisons itself.
- **Reverse loudly.** A superseded decision stays in the record, struck, pointing forward.
  Deleting it destroys the reasoning that a future reader needs.
- **Record what is still open**, explicitly, and what it's blocked on.

> **CameraConductor** is a *third* attempt; the prior two died from stale and assumed
> information being silently integrated as fact. It runs an explicit anti-taint protocol:
> greppable markers for *superseded* and *unverified*, confidence tags on every claim, and a
> hard rule that **only the human promotes a proposal to "accepted"** — a model's confidence,
> however high, produces a hypothesis, never a decision.

**Write it down at the moment you learn it, not at the end.** "Later" is where facts die.

---

## 9. Decide on evidence, or decide to get evidence

When a decision hinges on a fact you don't have, **there are two honest moves**: get the fact,
or *explicitly defer the decision and say what evidence would settle it.* The dishonest move —
and the tempting one — is to pick the plausible option and let the assumption harden into
architecture.

> **CameraConductor:** the isolation model (how a failing camera is prevented from taking down
> the whole service) depends on **how the USB layer actually fails** — does it return an error,
> or hard-crash the process? Nobody knew. The plausible answer was assumed for a while, and the
> architecture built on it was later found to have been derived from a premise that only held on
> one of three target platforms.
>
> The decision is now explicitly **open**, with the exact experiment named that will settle it,
> and the **requirement** (only that camera dies; it must auto-recover) recorded as **final and
> independent of the mechanism.** Requirements can be decided without the evidence. Mechanisms
> cannot.

**Separate the requirement from the mechanism.** The requirement is usually knowable now. The
mechanism often isn't, and pretending otherwise is how you get an architecture built on a
guess.

---

## 10. The person with the domain knowledge is right

When someone with real domain expertise contradicts your reasoning, **the default assumption is
that they know something you don't** — not that they've misunderstood.

Push back once, clearly, with the specific evidence. Then **listen to the answer**, and check
whether the evidence you cited actually says what you claimed (see §3 — usually it doesn't).

> **CameraConductor:** told to build something a certain way, I argued from a "verified
> finding." The user replied with the *scope* of that finding, which I had silently dropped.
> They were right; the finding never said what I claimed. **I was not defending the evidence. I
> was defending my distortion of it** — and I was using their own data to do it, which is worse
> than simply being wrong.

**The corollary:** their idea is often *better than the options you offered*, because they can
see the problem and you can only see your framing of it.

> Asked how to coordinate multiple machines, I offered three architectures. The user proposed a
> fourth — an *operating mode of the same binary* — that was **better than all three**, deleted
> two of the six open questions outright, and required no new protocol. My three options were a
> *false trichotomy*, and a menu is a bad instrument for an open design space.
>
> **When the answer space is genuinely open, ask an open question.**
