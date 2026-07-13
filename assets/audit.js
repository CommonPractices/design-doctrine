/* ============================================================================
   CONTRAST AUDIT — full matrix, self-testing.

   Paste into the browser console on any page using foundation.css:

       await audit()

   It sweeps EVERY text node across every persona × theme × colour-blind
   combination, and refuses to run if its own self-test fails.

   ── WHY THE SELF-TEST EXISTS ───────────────────────────────────────────────
   A broken audit does not fail loudly. It reports confident, specific,
   ENTIRELY FICTITIOUS failures — and you will "fix" correct code to satisfy
   it. Building this, the instrument was wrong three separate times:

     1. It mis-parsed modern colour syntax. `color(srgb 0.93 0.94 0.95)` has
        0–1 floats; a regex parser read them as 0–255 ints and computed BLACK
        for a near-white background. Reported 18 false catastrophes.

     2. It walked past an element's own background. A button paints its own
        fill; the walk started too high and measured the button's text against
        the PAGE behind it.

     3. It measured MID-TRANSITION. Buttons carry a 120 ms fade; the audit
        sampled at 12 ms and read a colour that belongs to NEITHER theme.

   All three are now asserted before a single reading is trusted.
   ========================================================================= */

window.audit = async function audit({
  personas = ['novice', 'intermediate', 'advanced'],
  themes   = ['daylight', 'dark', 'warm', 'paper', 'maxcontrast'],
  colourblind = [false, true],
  personaSelect = '#persona',
  themeSelect   = '#theme',
  cbCheckbox    = '#cb',
} = {}) {

  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const root = document.documentElement;

  /* ── Kill motion. An audit must measure a SETTLED page; otherwise you are
        auditing an animation frame. ─────────────────────────────────────── */
  const freeze = document.createElement('style');
  freeze.textContent = `*, *::before, *::after {
    transition: none !important; animation: none !important; }`;
  document.head.append(freeze);

  /* ── Parse ANY colour syntax: paint to a 1×1 canvas, read the pixel back.
        The browser does the conversion, so no syntax can fool us. ────────── */
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const toRGB = css => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  const lum = ([r, g, b]) => {
    const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  };
  const ratio = (fg, bg) => {
    const [a, b] = [lum(toRGB(fg)), lum(toRGB(bg))].sort((x, y) => y - x);
    return (a + .05) / (b + .05);
  };

  /* Start the walk AT the element — an element that paints its own background
     (a button) must be measured against IT, not against what is behind it. */
  const bgOf = el => {
    let n = el;
    while (n) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
      n = n.parentElement;
    }
    return 'rgb(255,255,255)';
  };

  /* ── SELF-TEST. Every failure mode that has ever bitten this instrument.
        If it cannot measure a known quantity, it cannot measure an unknown
        one — so it refuses to run. ──────────────────────────────────────── */
  const probe = document.querySelector('button') || document.body;
  const selfTest = {
    black_on_white_is_21: +ratio('#000', '#fff').toFixed(1) === 21,
    parses_modern_syntax: toRGB('color(srgb 0.936 0.944 0.951)')[0] > 200,
    reads_own_background: bgOf(probe) === getComputedStyle(probe).backgroundColor
                          || getComputedStyle(probe).backgroundColor.includes('rgba(0, 0, 0, 0)'),
    motion_is_frozen:     getComputedStyle(probe).transitionDuration === '0s',
  };
  if (Object.values(selfTest).some(v => !v)) {
    freeze.remove();
    console.error('INSTRUMENT BROKEN — refusing to report:', selfTest);
    return { INSTRUMENT_BROKEN: selfTest };
  }

  /* ── Sweep EVERY text node. A test that only looks where you expect the bug
        not to be is theatre. ────────────────────────────────────────────── */
  const sweep = () => {
    const fails = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const text = n.textContent.trim();
      if (!text) continue;
      const el = n.parentElement;
      if (!el || el.offsetParent === null || el.closest('.sr-only')) continue;

      const cs = getComputedStyle(el);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const need = large ? 3.0 : 4.5;                    // WCAG AA
      const r = ratio(cs.color, bgOf(el));

      if (r < need) fails.push({ text: text.slice(0, 30), ratio: +r.toFixed(2), need });
    }
    return fails;
  };

  const set = (sel, val, attr) => {
    const el = $(sel);
    if (el) { el.value = val; el.dispatchEvent(new Event('change')); }
    else if (attr) root.dataset[attr] = val;
  };

  const failures = {};
  let passing = 0, total = 0;

  for (const p of personas) {
    set(personaSelect, p, 'persona');
    for (const t of themes) {
      set(themeSelect, t, 'theme');
      for (const cb of colourblind) {
        const box = $(cbCheckbox);
        if (box) { box.checked = cb; box.dispatchEvent(new Event('change')); }
        else if (cb) root.dataset.cb = 'on'; else root.removeAttribute('data-cb');

        await wait(20);
        total++;
        const f = sweep();
        if (f.length) failures[`${p}/${t}${cb ? '/cb' : ''}`] = f;
        else passing++;
      }
    }
  }

  freeze.remove();

  const result = {
    selfTest,
    tested: total,
    passing,
    ALL_PASS: Object.keys(failures).length === 0,
    failures,
  };
  console[result.ALL_PASS ? 'log' : 'error'](
    `Contrast audit: ${passing}/${total} combinations pass WCAG AA`, result);
  return result;
};
