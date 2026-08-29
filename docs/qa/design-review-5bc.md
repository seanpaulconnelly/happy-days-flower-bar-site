# Design review — batches 5b + 5c (Intro, How It Works, Packages · Why, Gallery, About)

|                 |                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reviewer**    | `ui-designer` (evaluator, design-spec §13)                                                                                                                                                                                                                                                                                                                |
| **Date**        | 2026-08-29                                                                                                                                                                                                                                                                                                                                                |
| **Screenshots** | `docs/qa/screenshots/5c/{320,375,375-scrolled,768,1280,1536}.png` (2× DPR; coordinates below are CSS px, measured from section crops). `5b/*` consulted only to confirm the 5c shots supersede them.                                                                                                                                                      |
| **Code read**   | `src/sections/{FlowerBarIntro,HowItWorks,Packages,WhyHappyDays,Gallery,About}.tsx`, `src/components/{Button,Container,Picture,SectionHeading}.tsx`, `src/styles/{theme,index}.css`, `src/App.tsx` (clipPath), `src/lib/images.ts` (`SIZES`), `scripts/build-images.mjs` (focal table, `maxTop`), `src/content/copy.ts`, `docs/qa/{decisions,requests}.md` |
| **Scope**       | Six sections. Header, hero, footer and inquiry are out of scope (5a fix round and 5d in progress). Where a 5a item is still visible in these shots (hero 1.19:1 at 1280, wordmark 12 px high) it is noted once as **pending 5a fix** and not re-raised.                                                                                                   |
| **Token edits** | None. `theme.css` unchanged; every finding is a component change. Four spec clauses are amended in §5 (three of them ratify the engineer's calls).                                                                                                                                                                                                        |

---

## 1. Scores (§13 rubric; 5 must be earned; ≤ 2 is a blocker)

| Criterion               | Score | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | :---: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fidelity to design-spec |   4   | Tokens only — no ad-hoc hex, no fourth surface across the whole scroll (cream / warm white / green, counted at 375 and 1280). Chip `text-chip bg-accent-lavender rounded-full px-2.5 py-1.5`, Social border `border-[1.5px] border-brand`, band `bg-surface-brand` + orange/charcoal CTA, numerals `text-step text-accent-orange-ink`, trio `[clip-path:url(#bucket)]` on exactly three images, gallery radius 0 — all as §6/§8/§10. Off-spec but accepted: chip on its own row (5bc-07), band `p-6` below `sm`, gallery strip as a section child rather than a `w-screen` breakout (all three ratified in §5). Loses the point for the two things that are not yet what the spec describes: the How It Works "shelf" is ragged at lg (5bc-02) and the gallery's white ground does not disappear behind the strip — it shows as 117 px of empty warm white under it (5bc-01). |
| Hierarchy               |   4   | H2 → H3 → body unmistakable at 375 and 1280. Package card scan path is name → range → price with the price (46 px Newsreader) the second thing the eye hits; the 12 px chip does not out-shout it. The Social reads as recommended by chip + border only — Classic and Full are same size, same type, not dimmed, and their prices sit on the same baseline. One primary CTA per screen (the band's orange pill is the loudest thing in its screen, as intended; the Intro's outline button is the page's only secondary). Loses a point because the reserved chip row pushes every H3 36 px below the card's padding, so Classic and Full open with a band of air (5bc-07, accepted).                                                                                                                                                                                        |
| Spacing rhythm          |   3   | Section padding is the one fluid token everywhere and heading → content is `mt-stack` in all six sections. Three visible breaks in the rhythm: the full-bleed strip sits above ≈ 230 px of dead space at 1280 (117 white + 117 cream) — the largest gap on the page and the only one with nothing inside it (5bc-01); the 4-across How It Works row has body paragraphs starting 31 px apart because two titles wrap and two do not (5bc-02); the Custom band's text is indented 8 px further than the card text above it at ≥ lg (5bc-05).                                                                                                                                                                                                                                                                                                                                   |
| Typography              |   4   | Newsreader `opsz` working at every size: hairline-thin at the 48 px H2s, sturdy at the 26 px H3s and the 54 px numerals (weight 400 reads as ink, not as a display flourish). Prices `tabular-nums lining-nums` — `$1,495` and `$1,995` are pixel-identical in width and the three baselines align at 768, 1280, 1536. Bold copy lines are Work Sans 500 at lead size and never compete with H2s. `text-balance` on H3s gives the even "The Classic / Flower Bar" wraps at 768. Two faults: at 768 the pricing-card measure is ≈ 19 ch (5bc-04), and the About H2 balances to a mid-sentence three-liner at 768 (5bc-03).                                                                                                                                                                                                                                                     |
| Photography crops       |   4   | Every slot matches §9: intro 4:5 with the full stand and wheels; trio at 4:5 in bucket frames; `farm-zinnias` face intact with ≈ 30 px of headroom at 1280 and never clipped by the taper at 375 or 320 (the `maxTop: 250` override is doing its job); gallery squares with the four crops as specified and the stand/tin/lettering all inside; About 4:5 with full stems to base. Bucket shape leaks nowhere else. Loses a point for two source-limited tightnesses I am accepting (5bc-09): the About delphinium tips sit ≈ 10 px from the top edge and the gallery-1 casters sit on the frame line at 1280.                                                                                                                                                                                                                                                                |
| Mobile quality          |   4   | 320: "Inquire About Your Date" on one line inside the band (the `p-6` below `sm` bought it back — verified), cards stacked in spec order with all four facts visible, trio still three-across at ≈ 85 × 107 px, gallery 2 × 2 edge-to-edge with the 8 px gutter and no side padding, no horizontal scroll. 375: same, About image first. Loses a point for the orphaned "quote" on the band's second line at 320 (5bc-06) and for the same 128 px void under the gallery on phones (5bc-01).                                                                                                                                                                                                                                                                                                                                                                                  |
| "Reads as templated?"   |   4   | Up from the provisional 3. The bucket trio is the thing someone would remember — at 1280/1536 the taper and rounded base read unambiguously as buckets on a shelf, not as a blob, and it holds at 375. The edge-to-edge, radius-0 gallery against rounded photos elsewhere, the serif numerals in a burnt orange rather than a badge, and the no-icons reasons list all register as choices. What keeps it off a 5 is structural and mostly the brief's own: three pricing cards with a centre-card chip and border, and a numbered 01–04 row, are the two most-seen patterns on the web; the ragged shelf (5bc-02) and the top-heavy cards (5bc-07) make the pricing/steps block look slightly less deliberate than the rest.                                                                                                                                                |

---

## 2. Engineer's notes — verdicts

- **Chip on its own row above the H3, `grid-rows-subgrid` alignment.** Approved. Checked the alternative in the 768 shot's geometry: a card is 219 px wide there, 163 px inside the padding; "The Social Flower Bar" at 24 px plus a 96 px chip cannot share a line, and a border-straddling badge is the one treatment that would push this block into template territory. The subgrid keeps all four facts aligned however the names wrap — verified at 768 (2-line names), 1280 and 1536 (1-line names). Cost recorded as 5bc-07; §6.5 amended.
- **Band padding `p-6 sm:p-7 md:p-8`.** Approved; `320.png` shows the CTA on one line. §6.6 amended.
- **`text-balance` on H3s.** Approved — it is what makes the three package names wrap identically at 768. It is also the cause of 5bc-03, which is fixed by widening the column, not by removing the balance.
- **Trio at 4:5 bucket frames (D12).** Correct. The frame reads as a bucket at every width; at 320 it is at the limit (85 px wide) but still a tapered frame, not a rounded rectangle.
- **Gallery outside the container, radius 0, `gap-strip`.** Approved — and the way it is built is better than my §8 `w-screen` note: the `<ul>` is a plain block child of the section, so it is exactly the section's width and can never be wider than the viewport. With `overflow-x: clip` on `body` a `100vw`-based breakout would have been silently cut by the scrollbar width on Windows; this one cannot be. §8 amended to say so. The only fault is the padding under it (5bc-01).
- **About image-first in DOM.** Approved; one order serves both widths and matches ux-spec §4.7.
- **About H2 at 768 balancing to "Grown in / Greensburg. Made / to Be Shared."** Real, and a should-fix (5bc-03). The column is 354 px at 768 and "Grown in Greensburg." at the 39.4 px H2 needs ≈ 358 px, so the first sentence cannot fit and both balanced and unbalanced wrapping break mid-sentence. Widening the md text column to ≈ 391 px fixes it without touching the copy or the token.

---

## 3. Findings

Severity: **blocker** = must be fixed before 5d builds on it · **should-fix** = fix in the same round · **nit** = engineer's discretion. No blockers in this batch.

### Should-fix

- [ ] **5bc-01 · should-fix · Gallery: the full-bleed strip sits on 117 px of empty warm white, then 117 px of cream, before the About image.**
      `1280.png` y ≈ 5225–5455 (strip bottom → About image top, ≈ 230 px with nothing in it; the tallest gap on the page); `375.png` same structure at 64 + 64. §7 says the white ground "disappears behind" the photos — it should, by letting the strip close the section. `src/sections/Gallery.tsx:39`:

  ```tsx
  <section id="gallery" aria-labelledby="gallery-heading" className="bg-surface-alt pt-section">
  ```

  (`py-section` → `pt-section`; the strip is already the last child.) The visible gap becomes About's own `pt-section` — 117 px at 1280, 64 at 375 — the same value as hero → Intro, where the hero image also bleeds through its section's bottom padding. Nothing else moves. §7/§8 amended.

- [ ] **5bc-02 · should-fix · How It Works at ≥ lg: body paragraphs start 31 px apart across the row.**
      `1280.png` y ≈ 1800–1835: "Choose Your / Flower Bar" and "We Prepare / Everything" wrap to two lines (244 px column, 26 px H3), "We Deliver & Style" and "Your Guests Create" do not, so the four paragraphs begin on two different lines and the shelf reads ragged. Same at 1536 (the container is capped at 1152). Use the same subgrid device Packages already uses. `src/sections/HowItWorks.tsx:28` and `:30`:

  ```tsx
  <ol className="mt-stack grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] lg:gap-y-0">
    …
    <li key={step.number} className="lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:border-t lg:border-line lg:pt-6">
  ```

  Numeral (row 1), H3 `mt-3` (row 2), paragraph `mt-2` (row 3) keep their margins; the paragraphs share one row line. Below lg nothing changes (2 × 2 and the stack stay `gap-y-10`). Verify at 1280 that the four paragraphs' first lines are level.

- [ ] **5bc-03 · should-fix · About H2 breaks mid-sentence at 768 ("Grown in / Greensburg. Made / to Be Shared.").**
      `768.png` y ≈ 5730–5900. Cause: text column is 354 px at 768 (`md:w-[54%]` of the 705.6 px container, less its share of the 48 px gap) and the first sentence at the 39.4 px H2 measures ≈ 358 px. Give the md range a wider text column and a smaller gap, restoring 46/54 at lg where there is room. `src/sections/About.tsx:27, :28, :37`:

  ```tsx
  <Container className="flex flex-col md:flex-row md:items-center md:gap-8 lg:gap-16">
    <div className="md:w-[42%] lg:w-[46%]">            {/* image */}
    …
    <div className="mt-10 md:mt-0 md:w-[58%] lg:w-[54%]"> {/* text */}
  ```

  Text column ≈ 391 px at 768 → "Grown in Greensburg. / Made to Be Shared." on two lines at the sentence break; image 282 × 353 (was 304 × 380). Apply the same three values to `src/sections/FlowerBarIntro.tsx:28, :29, :56` so both splits follow one rule (Intro's H2 is unaffected either way; it also eases 5bc-08). Verify with a fresh 768 shot; if the H2 still takes three lines, drop to `md:gap-6` before touching anything else. No copy change, no `<br>`.

- [ ] **5bc-04 · should-fix · Pricing cards at 768: 19-character measure.**
      `768.png` y ≈ 2475–2895: cards are 219 px wide with `p-7` = 163 px of text, so every description runs 6 lines of ≈ 19 ch ("Perfect for / corporate events, / client / appreciation, open / houses and larger / gatherings."). This is also 1 px under ux-spec §4.4's ≥ 220 px card threshold. Trade 8 px of padding and 8 px of gutter for measure at md only. `src/sections/Packages.tsx:40–41` and `:55`:

  ```tsx
  const CARD_BASE =
    'flex flex-col rounded-card bg-surface-alt p-7 md:p-6 lg:p-8 border border-border md:row-span-5 md:grid md:grid-rows-subgrid';
  …
  className="mt-stack grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto_1fr] md:gap-x-4 md:gap-y-0 lg:gap-x-8"
  ```

  At 768: cards 224.5 px (meets the 220 threshold), text 176.5 px ≈ 21–22 ch, descriptions drop to 5 lines. Phone (`p-7`) and ≥ lg (`p-8`, `gap-x-8`) unchanged; chip still fits. Band padding is not a card and stays as built. §5/§6.5 amended.

### Nits

- [ ] **5bc-05 · nit · Custom band text is indented 8 px past the card text at ≥ lg.**
      `1280.png` Packages: card H3s start at x ≈ 136, "Custom Floral Experience" at x ≈ 144 (`lg:px-10` vs the cards' `p-8`); same at 1536. At 768 they align (both `p-8`). `src/sections/Packages.tsx:83`: delete `lg:px-10`. My §6.6 value; amended in §5.
- [ ] **5bc-06 · nit · Band's second line orphans "quote" at 320.**
      `320.png` y ≈ 4490: "75+ guests — Custom / quote" (232 px inside the band, the line needs ≈ 234). `src/sections/Packages.tsx:87`: add `text-balance` → "75+ guests — / Custom quote", breaking at the dash. Verify at 320; no change above it.
- [ ] **5bc-07 · nit · Reserved chip row leaves 36 px of air above the Classic and Full names.** Accepted.
      `1280.png` / `1536.png` Packages: card top → H3 is 68 px on every card (32 padding + 24 chip + 12 `mb-3`), so Classic and Full open with a blank strip and read a touch top-heavy next to their 32 px bottom padding. Both alternatives are worse (see §2); the row is the right trade. No change; §6.5 amended to describe what is built. If it nags after 5bc-04, `mb-3` → `mb-2.5` on `Packages.tsx:63` saves 2 px and is the only safe dial.
- [ ] **5bc-08 · nit · Intro and About at 768: a 304 × 380 image centred against a 520–655 px text column.**
      `768.png` Intro (y ≈ 645–1465) and About. The split is the ux-spec's from 768 and the vertical centring is the right choice; 5bc-03's md values shorten the column and shrink the image toward balance. No further action.
- [ ] **5bc-09 · nit · Two crops with no headroom.** Accepted.
      `1280.png` About: delphinium tips ≈ 10 px from the top edge, vase base ≈ 8 px from the bottom — the 4:5 cut from a 3:4 source removes only 96 px of height, so there is no slack to give. `1280.png` Gallery 1: the casters sit on the frame line (they are fully inside at 768 and 375). Both are source-limited; a re-shoot, not a focal change.

### Checked and correct (no action)

Surfaces ≤ 3 across the whole scroll (cream / warm white / green; How It Works and Gallery are the only warm-white sections; the band and the `#inquire` shell are the only green) · Intro: `align="left"` heading block, `max-w-prose-copy` on every text column, `space-y-4`, emphasis line `text-lead font-medium`, secondary button `border-[1.5px] border-brand text-brand-ink`, image `aspect-[4/5] rounded-photo`, image-left / text-right alternating with the hero (the hero's own ratio at 1280 is **pending 5a fix**) · How It Works: `<ol>`, numerals from data and `aria-hidden`, `sr-only` "01 — " inside each H3, hairlines at lg only, closing line centred `text-lead font-medium mt-stack`, warm-white ground making the orange read as ink · Packages: spec order H2 → intro → cards → band → footnote; one primary CTA in the section; prices `font-display text-price tabular-nums lining-nums`, guest ranges `text-eyebrow tabular-nums`; Classic and Full undimmed, unscaled, unshadowed; `data-surface="brand"` on the band; footnote roman/small/muted (D11) inside `max-w-prose-copy` · Why: `grid-cols-3 gap-3 sm:gap-6` at every width, `rounded-field` fallback under the clip, `<clipPath id="bucket">` inlined once in `App.tsx` and referenced only here; reasons `border-t border-line pt-5`, 2 × 2 from md, no icons · Gallery: `aspect-square object-cover`, `gap-strip`, radius 0, no captions/lightbox/hover, `flowerBarCloseupGallery` 1:1 rendition distinct from the Intro's 4:5 · About: 4:5 `rounded-photo`, H2 + two paragraphs and nothing else (R10), `about-still-life-*` outputs (D14) · `SIZES` per slot match §9 · no scroll-triggered motion anywhere in these six sections · all strings verbatim from `copy.ts`; no invented facts.

---

## 4. Rhythm note for 5d–5e (FAQ, Inquiry)

- The inter-section gap is 2 × `--spacing-section` (≈ 234 px at 1280, 128 at 375) everywhere a section does not bleed. It is consistent and magazine-airy; I am **not** changing the token this round. 5bc-01 removes the one place it reads as a void. If the FAQ (`py-section-sm`) → Inquiry (`py-section`, green) transition reads abrupt after 5d, the fix is on the FAQ side (its own padding), not the token.
- Inquiry's form card is the fourth warm-white surface _on_ green; that is still three surface colours. Keep `shadow-form` to the card only — nothing in 5b/5c carries a shadow and that restraint is part of what earns the "templated" 4.

---

## 5. Spec amendments (recorded here; `docs/design-spec.md` is updated at the next designer pass)

1. **§6.5 Pricing card:** the chip sits on its own row above the H3 (`mb-3`), and the three cards are a five-row `md:grid-rows-[auto_auto_auto_auto_1fr]` subgrid (chip, name, range, price, description) so the row is reserved on every card and the four facts align however the names wrap. Padding `p-7 md:p-6 lg:p-8`; grid `gap-6 md:gap-x-4 md:gap-y-0 lg:gap-x-8` (§5 grid-gaps row likewise). The "chip beside the H3" sketch is withdrawn.
2. **§6.6 Custom band:** padding `p-6 sm:p-7 md:p-8` — no `lg:px-10` — so the band's text aligns with the card text above it.
3. **§7 / §8 Gallery:** the section is `pt-section` only; the strip is the section's last child and closes it flush, so the warm-white ground is visible only above the strip. The strip is a block child of the `<section>` (never a `w-screen` / `calc(50% − 50vw)` breakout) — it is exactly the viewport width regardless of scrollbars.
4. **§8 Intro / About:** at md the split is image `42%` / text `58%` with `gap-8`; from lg it is the documented `46% / 54%` with `gap-16`.

---

## 6. Verdict

**FIX ROUND NEEDED** — small: no blockers, four should-fixes. Order: **5bc-01, 5bc-02, 5bc-03, 5bc-04**; nits 5bc-05 and 5bc-06 are two-token edits worth taking in the same pass; 5bc-07 – 5bc-09 need no change. Re-shoot 320, 768 and 1280 (the three widths where the fixes are visible) — this can share the 5a re-shoot.

### Summary

1. Both batches are built from tokens only; surfaces stay at three across the whole page and nothing carries a shadow, scale or overlay.
2. The bucket trio works — it reads as buckets from 1536 down to 375 and lifts the "templated" score from a provisional 3 to a 4; the face in `farm-zinnias` is intact at every width.
3. Pricing hierarchy is right: chip + 1.5 px border on The Social only, prices tabular and baseline-aligned, Classic and Full undiminished; the engineer's own-row chip is approved and the spec is amended to match.
4. The gallery is the one place the rhythm breaks — 117 px of empty white under a full-bleed strip; `py-section` → `pt-section` closes it (5bc-01).
5. The 4-across How It Works row needs the same subgrid the cards already use so its paragraphs line up (5bc-02).
6. About's H2 at 768 is a column-width problem, not a copy or balance problem — widen the md text column to 58 % (5bc-03), and mirror it on the Intro.
7. The 768 pricing cards are a 19-ch measure; `md:p-6` + `md:gap-x-4` buys it back and clears ux-spec's 220 px threshold (5bc-04).
8. Two nits are one-utility fixes (`lg:px-10` off the band; `text-balance` on its second line); the remaining three are accepted as built.
9. The gallery strip as a plain section child is safer than my spec's breakout under `overflow-x: clip`; spec amended to say so.
10. No token or favicon edits; four spec clauses amended in §5. Hero ratio and wordmark seen in these shots are pending the 5a fix.
