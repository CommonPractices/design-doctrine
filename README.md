# Design Doctrine

Cross-project engineering doctrine. Rules that earned their place by being learned the
expensive way.

**How these documents work:** every principle is stated to be **portable** — it should transfer
to any project. Every *example* is drawn from a **real project**, because a rule without a
worked example is a slogan, and a rule without the mistake that produced it is unpersuasive.

Where a rule exists because something broke, the breakage is named. That is the argument.

## Documents

| Document | Covers |
|---|---|
| [Decision Doctrine](decision-doctrine.md) | **How to decide.** Ordered values and how to use them (including how to resolve a genuine conflict without sacrificing either side); never widening a scoped rule into a law; "if it has a defensible alternative, it's a setting"; absent vs hidden vs disabled; preview before writing to live things; making invariants structural; recording decisions *and* non-decisions; separating requirements from mechanisms. |
| [UI/UX Design Doctrine](ui-ux-design-doctrine.md) | **How to build it.** Themes, personas, colour, and accessibility. Axis separation; why a persona must change the product and not the paint; why colour must live in surfaces; the two-layer accessibility floor (and why `!important` inverts cascade layers); the taxonomy of accessibility needs; tokens; verifying the verifier. |

Both draw their examples from **CameraConductor** — a multi-camera control service with hard
accessibility requirements, a hostile hardware protocol, and a distributed deployment. It broke
enough ways to be instructive.

## North Stars

A small, **ordered** set of values, checked against every non-trivial decision. **The order is
the point** — unordered values are useless precisely when you need them, which is when two of
them conflict.

CameraConductor's, in order:

1. **Accessibility** — first-class, not a retrofit.
2. **Ease of use** — for the *primary flow*. Simple by default; power behind Advanced.
3. **Speed** — especially app/profile switching.
4. **Choice** — prosumer. Give options; don't hardcode one opinionated path.

Every decision aligns, or it is a **justified and approved exception** — recorded, never silent.
Small decisions where the stars give a clear answer: just act. Big ones: the star's answer is
what you *recommend*.

**The machinery is portable; these four are not.** Another project might rightly put Speed,
Security, or Correctness first. Adopting someone else's values wholesale would itself be an
instance of the scope-widening failure these documents warn about — see
[Decision Doctrine §3](decision-doctrine.md).

**And a value that never overrules a convenient decision is decoration.** The doctrine tracks
where each star *forced* an outcome; if you can't name one, it isn't a value, it's a slogan.

## The load-bearing rule

> **A guarantee you have not attacked is not a guarantee. It is a claim.**

An accessibility floor asserted to be "unbreakable by construction" was defeated by the first
hostile stylesheet written against it — the protection was defeated *by the very mechanism
added to make it strong*. A contrast audit reporting "all pass" was only sampling the elements
that already worked. A later audit reporting eighteen failures was measuring with a broken
instrument, and nearly caused correct code to be rewritten.

Assertion is not verification. Test the guarantee, then test the test.
