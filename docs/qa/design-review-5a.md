# Design review — batch 5a (header, hero, footer, skip link, section shells)

|                 |                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reviewer**    | `ui-designer` (evaluator, design-spec §13)                                                                                                                                                                                         |
| **Date**        | 2026-08-29                                                                                                                                                                                                                         |
| **Screenshots** | `docs/qa/screenshots/5a/{320,375,375-scrolled,768,1280,1536}.png` (all 2× DPR; coordinates below are CSS px)                                                                                                                       |
| **Code read**   | `src/App.tsx`, `src/sections/{Header,Hero,Footer}.tsx`, `src/components/{Button,Container,SectionHeading,Wordmark,Picture}.tsx`, `src/styles/{index,theme}.css`, `src/lib/images.ts`, `dist/assets/*.css` (compiled cascade order) |
| **Scope**       | Header, hero, footer, skip link, motion, tokens. Placeholder sections (H2 only) are not reviewed for design; one rhythm note for 5b–5e in §4.                                                                                      |
| **Token edits** | None. `theme.css` and `favicon.svg` are unchanged — every finding below is a component fix, not a token fix. Two spec clauses are amended in §5 (they were mine and they were wrong).                                              |

---

## 1. Scores (§13 rubric; 5 must be earned; ≤ 2 is a blocker)

| Criterion               | Score | Why                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | :---: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fidelity to design-spec |   4   | Tokens only — no ad-hoc hex, no fourth surface (cream / warm white / green counted at 1280 and 375). Button variants, radii, eyebrow, wordmark sizes, hairline-on-scroll, `mt-3 / mt-5 / mt-8` hero stack all as §6. Off-spec: hero desktop ratio (5a-02), footer mobile order vs ux-spec §4.10 (5a-06), skip link loses its padding on focus (5a-03).      |
| Hierarchy               |   4   | H1 → H2 unmistakable at 375 and 1280; eyebrow reads as a label, not a heading. Two filled green pills share the first screen at every width (header + hero) — by spec, same target — but at ≥ md the header pill is the _same weight_ as the hero CTA (48 px, 16 px label) and competes with it (5a-05).                                                    |
| Spacing rhythm          |   4   | Section padding fluid and equal; hero → Intro gap is 128 px at both 375 and 1440 (the image bleeds through the hero's bottom padding at ≥ md, which is right). Loses a point for the header: the wordmark sits ~12 px above the nav's centre line at every width ≥ 640 (5a-01) and the 375 nav is set at 8 px gaps with 60 px to spare (5a-04).             |
| Typography              |   5   | Newsreader's `opsz` is visibly working — hairline thins at 76 px, sturdy at the 15 px lockup; Work Sans 16–17 px body, lead at 21 px / ~48 ch inside `max-w-[30rem]`; eyebrow 13 px / 600 / 0.12 em; no faux bold or italic anywhere; wordmark 20 / 15 / 24 and never green or uppercase.                                                                   |
| Photography crops       |   3   | Hero touches the right viewport edge at 768 / 1280 / 1536 and has the 20 px inner radius — good. But at 1280 the image is 666 × 560 (1.19:1) and at 1536 it is 799 × 563 (1.42:1): a landscape banner cut from a 3:4 source, sign top pinned to the frame edge, bottom tier sliced mid-bucket (5a-02). Mobile 1:1 crop is right; sign top is tight (5a-09). |
| Mobile quality          |   4   | 320: one row, no wrap, Inquire visible, pill inside the gutter. 375: 1:1 hero within the first scroll, 44 px hit areas on links (`min-h-tap`) and the compact pill (36 px + `::before` overlay). Sticky header + hairline confirmed in `375-scrolled.png`. Nav gap cramped at 375 (5a-04).                                                                  |
| "Reads as templated?"   |   3   | The hero _shape_ — eyebrow / big serif / muted lead / pill / photo right — is the generic one; what saves it is the restraint (no gradient, no second CTA, no icons), the flush photo and the type pairing. The signature element (bucket trio) is 5c's job, so this score is provisional. 5a-02 and 5a-05 both move it toward a 4.                         |

---

## 2. Engineer's questions — verdicts

- **Hero band at ≥ 1280 (1.2–1.4:1).** My spec was internally inconsistent: §9 asks for the native 3:4 while §6.3's `md:absolute inset-y-0` ties the image height to a ~560 px text column. The fix is not a taller text column and not a 3:4 (888 px at 1280 — the CTA would sit below the fold on a 1280 × 800 screen). It is a **minimum height that makes the band at least square at 1024–1536**, with the text vertically centred in it. Exact change in 5a-02. `object-cover` centred on the 3:4 source at 1:1 keeps the sign header, all three tiers and the wheels — no `object-position` needed.
- **`overflow-x: clip` on `body`.** Approved. It is the right value — a plain clip, no new scroll container, sticky header unaffected (`375-scrolled.png` proves it). Note for 5c: the gallery's full-bleed strip must be sized `mx-[calc(50%-50vw)]`-style and checked at 1280 on an OS that shows scrollbars — with `clip`, an over-wide strip is silently cut rather than causing a scrollbar, so the defect would be invisible in headless screenshots.
- **Sticky hairline after 8 px.** Approved; matches §6.11 exactly. `transition-colors` on `border-color` is an acceptable stand-in for the spec's `transition-opacity`.
- **320 px inline nav, `gap-2` + `nowrap`.** Approved. Measured in `320.png`: lockup ends at ≈ 80, "Flower Bar" starts at ≈ 88, pill's right edge at ≈ 300 (inside the 20 px gutter). No wrap, no `<details>` fallback needed. Keep `gap-2` _only_ below 360 px — see 5a-04.

---

## 3. Findings

Severity: **blocker** = must be fixed before 5b builds on it · **should-fix** = fix in the same round · **nit** = engineer's discretion.

### Blockers

- [ ] **5a-01 · blocker · Header wordmark sits ~12 px above the nav centre line at ≥ 640.**
      `768.png` header row (wordmark baseline y ≈ 30 vs nav/pill centre y ≈ 36 in a 72 px header); `1280.png` and `1536.png` identical. Cause: `src/components/Wordmark.tsx:57` — `'inline-flex min-h-tap shrink-0 flex-col justify-center sm:block'`. At `sm:` the `<a>` becomes `display: block` but keeps `min-h-tap` (44 px) with a 20 px line-height, so the text sits at the top of a 44 px box that the header's `items-center` then centres. Fix — keep the anchor a flex box at every width and let a plain span carry the block/inline lockup switch:

  ```tsx
  <a href={href} className={cn(classes, 'inline-flex min-h-tap shrink-0 items-center')}>
    <span>{content}</span>
  </a>
  ```

  (`content` is unchanged: the two `block whitespace-nowrap sm:inline` spans and the `{' '}` text node stay inside the wrapper span, so the accessible name is still "Happy Days Flower Farm".) Verify at 375 (two-line lockup still centred) and 1280 (wordmark x-height centred on the pill).

- [ ] **5a-03 · blocker · Skip link renders with zero padding on focus.**
      Not visible in the batch screenshots (no focused-state shot); found in `dist/assets/index-*.css`: `.focus\:not-sr-only:focus{…padding:0;position:static…}` sorts _after_ the base `.px-4` / `.py-3`, so on keyboard focus the green pill collapses to the text box. `src/App.tsx:71`: add the padding under the same variant — `focus:px-4 focus:py-3` (keep `focus:fixed`, which already wins over `position: static`; confirmed in the compiled order). While there, add `focus:min-h-tap focus:inline-flex focus:items-center` so the target is 44 px. This was my §6.14 snippet; the spec is amended in §5. Verify: load, press Tab once, screenshot at 375 and 1280.

### Should-fix

- [ ] **5a-02 · should-fix · Hero image ratio at ≥ 1024 — make the band at least square, centre the text in it.**
      `1280.png` hero (image 666 × 560, 1.19:1; sign's top edge at the frame edge, bottom tier cut); `1536.png` hero (799 × 563, 1.42:1 — a banner). Exact change, `src/sections/Hero.tsx:32`:

  ```tsx
  <Container className="pt-10 pb-section md:flex md:min-h-[min(50vw,48rem)] md:flex-col md:justify-center md:py-16">
  ```

  `min-h` on the Container grows the section (the image's containing block) with it; symmetric `md:py-16` so `justify-center` centres the text on the image's true midline (the current `pt-16 / pb-section` pair would bias it 27 px upward). Resulting image boxes: 768 → 384 × ~600 (unchanged, portrait); 1024 → 512²; 1280 → 640²; 1536 → 768²; 1920 → 960 × 768 (1.25:1, acceptable above the QA widths). Below `md` nothing changes. The 1:1 crop of the 3:4 source at `object-cover` centre keeps sign header, three tiers and wheels — checked against `public/images/hero-flower-bar-480.jpg`. Hero height + header at 1280 = 712 px, so the CTA stays above an 800 px fold. Pairs with 5a-07 (same lines).

- [ ] **5a-07 · should-fix · Hero image column 52 % → 50 %, and the `sizes` string with it.**
      `768.png` hero: "Experiences" (58 px) ends at x ≈ 341, image begins at x ≈ 369 — a 27 px gap against a 40 px gutter; at 1280 the column-to-image gap is 28 px by construction. `src/sections/Hero.tsx:53`: `md:w-[52%]` → `md:w-1/2`. `src/lib/images.ts` `SIZES.hero`: `'(min-width: 768px) 52vw, 100vw'` → `'(min-width: 768px) 50vw, 100vw'` (one constant, shared with the preload link — change it in exactly one place). Gaps become 43 px at 768 and 54 px at 1280 / 1536; the image still touches the right edge. The `min(50vw, …)` in 5a-02 assumes this width.

- [ ] **5a-04 · should-fix · 375 nav is set at 8 px gaps with 60 px of slack.**
      `375.png` header: "Flower Bar", "About" and the pill are 8 px apart and read as one run-on phrase; the row needs 314 px and has 375. `src/sections/Header.tsx:62`: `gap-2 sm:gap-5 md:gap-8` → `gap-2 min-[360px]:gap-4 sm:gap-5 md:gap-8`. Width proof at 360 with 16 px gaps: 20 + 85 + 8 + (68 + 34 + 71 + 32) + 20 = 338 ≤ 360; 320 keeps `gap-2` (314 ≤ 320, already proven in `320.png`).

- [ ] **5a-05 · should-fix · Header "Inquire" pill at ≥ md is as heavy as the hero CTA.**
      `1280.png` / `768.png` header: 48 px pill with a 16 px label beside 14 px nav links and a 20 px wordmark; in the same screen the hero CTA is the identical pill. The header pill should be the quieter twin. `src/components/Button.tsx:27` (`header` size), replace `md:min-h-tap md:px-6 md:py-3.5 md:text-base` with `md:min-h-tap md:px-5 md:py-3 md:text-small` → 44 px tall, 14 px label, matching the nav links' size. Compact variant below `md` unchanged. §6.11 amended in §5.

- [ ] **5a-06 · should-fix · Footer mobile order: name → place → links, not name → links → place.**
      `375.png` footer: "Happy Days Flower Farm" / Instagram Facebook Email / Greensburg, Pennsylvania / Serving… — the links split the identity block. ux-spec §4.10 fixes the mobile order as name, place, service area, then links, then tagline; my §6.12 only described the ≥ md rows and the engineer read it literally. `src/sections/Footer.tsx:28–50`: group the wordmark and the place `<p>` in one `<div>` as the first flex child, keep the `<ul>` as the second:

  ```tsx
  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div>
      <Wordmark variant="footer" />
      <p className="mt-4 flex flex-col text-small text-ink-muted md:flex-row md:items-center md:gap-2">
        {/* place · serviceArea, unchanged */}
      </p>
    </div>
    <ul …>{/* links, unchanged */}</ul>
  </div>
  ```

  and delete the standalone place `<p>` that follows. At ≥ md the links centre against the two-line name/place block, which reads fine (`1280.png` footer). No copy changes.

- [ ] **5a-08 · should-fix · Nav and footer links underline on hover but not on keyboard focus.**
      §4 says "underline on hover/focus". `src/sections/Header.tsx:67` and `src/sections/Footer.tsx:35`: add `focus-visible:underline` next to `hover:underline`. The green outline ring is present (theme.css base layer, `:where(a…):focus-visible`) — this is the second cue, not a replacement.

### Nits

- [ ] **5a-09 · nit · Mobile hero crop: the sign's top edge is on the frame line.**
      `375.png` hero image, top-left (the clip is visible, the board's top edge is cut by a few px). `scripts/build-images.mjs` `heroSquare.focalY` `0.57` → `0.55` gives ≈ 30 px of headroom at 375 without losing the wheels (the source has ~12 % of floor below the stand). My §9 value; spec amended in §5. Re-run `npm run images`.
- [ ] **5a-10 · nit · Footer row 3 stacks tightly on mobile.** `375.png` footer bottom: the wrapped tagline and "© Happy Days Flower Farm" are 8 px apart while every other footer gap is ≥ 16 px. `src/sections/Footer.tsx:52`: `gap-2` → `gap-3`.
- [ ] **5a-11 · nit · Header wordmark ↔ nav gap at 320 is 8 px.** `320.png` header: lockup and "Flower Bar" nearly touch. Only if it fits after 5a-04 is in: `src/sections/Header.tsx:57` `gap-2 sm:gap-6` → `gap-3 sm:gap-6` (318 ≤ 320 — verify in a fresh 320 shot; if it wraps, leave it).
- [ ] **5a-12 · nit · `Picture` placeholder colour.** `style={{ backgroundColor: image.placeholder }}` paints a dominant-colour swatch before the bytes land — technically a non-token colour, invisible once loaded. Accepted; keep it.

### Checked and correct (no action)

Surfaces ≤ 3 at every width · primary button `bg-brand text-on-brand`, `rounded-full`, `px-6 py-3.5`, `tracking-[0.01em]`, `leading-none`, hover `bg-brand-ink`, no shadow, no transform · orange/lavender/mint variants defined but not yet used (correct for 5a) · eyebrow `text-eyebrow uppercase text-brand`, `mt-3` to H1 · H1 `text-display text-balance` = 44 px at 320/375, 58 at 768, 76 at 1280 · lead `text-lead text-ink-muted max-w-[30rem]` · hero mobile image `mt-10 rounded-photo aspect-square`, desktop `rounded-l-hero` only, flush right · header 56 / 72 px, `bg-surface`, opaque, hairline only after scroll · nav `text-[0.8125rem] md:text-small font-medium text-ink`, no tracking, no underline at rest · footer `border-t border-line py-section-sm`, wordmark 24 px `<p>`, links `text-small font-medium` with 44 px hit areas at `gap-x-6`, place line with a middle dot on md, row 3 `mt-8 pt-6 border-t border-line`, © right on md · focus ring 2 px brand green offset 2 px on `:focus-visible`, swapped to warm white under `[data-surface="brand"]` (the `#inquire` shell already carries the attribute) · motion: four `animate-rise` at 0/80/160/240 ms + `animate-fade` on the image, `both` fill, no scroll reveals, reduced-motion zeroed in `index.css` · `<clipPath id="bucket">` inlined once and not applied anywhere yet (correct) · no invented facts, all strings verbatim from `copy.ts`.

---

## 4. Placeholder rhythm — only what constrains 5b–5e

- Hero → Intro: the desktop image bleeds through the hero's bottom padding, so the visible gap is the Intro's own `pt-section` (128 px at 1440); on mobile it is 64 + 64 = 128. Both are at the airy end of acceptable. **5b: keep `py-section` and `bg-surface` on the Intro, no extra top margin.** If the 5b screenshots read loose at 375, the remedy is the token (`--spacing-section` floor 4rem → 3.5rem), not a per-section override — flag it, don't patch it.
- `SectionHeading` defaults to centred; Intro and About must pass `align="left"` (spec §5 rhythm).
- After 5a-02 the hero is ≥ 1:1 from 1024; the Intro's 4:5 photo directly below it will be the second tall image in a row. That is intended (hero right, intro left, alternating), but 5b should check the 1280 screenshot for the two images reading as one column.

---

## 5. Spec amendments (recorded here; `docs/design-spec.md` is updated at the next designer pass)

1. §6.3 Hero: "`md:absolute … inset-y-0`" stays, **plus** `md:min-h-[min(50vw,48rem)]` on the Container with `md:flex md:flex-col md:justify-center md:py-16`; image column `md:w-1/2`; `sizes` `(min-width: 768px) 50vw, 100vw` (also §9's `sizes` line). §9 Hero ≥ md row: "3:4 native" → "3:4 source, rendered ≥ 1:1 from 1024 (square at 1024–1536), centre crop".
2. §6.11 Header Inquire ≥ md: `text-small px-5 py-3 min-h-tap` (44 px), not the default size.
3. §6.12 Footer: mobile order is ux-spec §4.10 (name, place, service area, links, tagline); ≥ md rows unchanged.
4. §6.14 Skip link: padding declared under `focus:` (`focus:px-4 focus:py-3 focus:min-h-tap focus:inline-flex focus:items-center`).
5. §9 Hero < md `focalY` 0.57 → 0.55.
6. §4 links: `focus-visible:underline` alongside `hover:underline`.

---

## 6. Verdict

**FIX ROUND NEEDED** — address in this order: **5a-01, 5a-03, 5a-02, 5a-07, 5a-04, 5a-05, 5a-06, 5a-08**; nits 5a-09 – 5a-11 at the engineer's discretion. Re-shoot the same six widths plus one Tab-focused shot at 375 and 1280 for 5a-03.

### Summary

1. Tokens, surfaces, type and motion are exactly the spec — nothing ad-hoc, nothing invented; typography earns its 5.
2. Two rendering bugs block: the desktop wordmark sits 12 px high (`sm:block` + `min-h-tap` in `Wordmark.tsx:57`) and the skip link loses its padding on focus (`focus:not-sr-only` resets `padding: 0` after `px-4 py-3`).
3. Hero verdict: my §6.3/§9 contradicted each other; fix is `md:min-h-[min(50vw,48rem)]` + vertical centring, image at 50 %, `sizes` 50vw. Not a 3:4 — that would push the CTA under a 1280 × 800 fold.
4. Header pill at ≥ md is demoted to 14 px / 44 px so the hero CTA is the loudest thing on the first screen.
5. Footer mobile order follows ux-spec §4.10 (name, place, links); my §6.12 was under-specified.
6. `overflow-x: clip`, hairline-after-8 px and the 320 px `gap-2`/`nowrap` row are all approved as built.
7. No token or favicon edits were needed; six spec clauses are amended in §5 of this file.
8. Placeholder rhythm is fine; 5b keeps `py-section` on the Intro and flags (does not patch) if 375 reads loose.
9. Templated-ness is a provisional 3 — the hero shape is generic; the bucket trio in 5c is where the page earns its 4–5.
