# Design review — final (5d Inquiry + 5e FAQ + whole page after the 5a / 5bc fix rounds)

|                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reviewer**    | `ui-designer` (evaluator, design-spec §13)                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Date**        | 2026-08-29                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Screenshots** | `docs/qa/screenshots/5e/{320,375,375-scrolled,768,1280,1536}.png` (current page, 2× DPR; coordinates below are CSS px); `docs/qa/screenshots/form/{idle,invalid,submitting,success,error,nonce-blocked-success}.png` (375); `5a-fix/*` and `5bc-fix/*` to confirm earlier ids. Two states the batch did not capture were rendered read-only from `dist/` into the session scratchpad and are described in §3 (FAQ with two rows open at 375 and 1280; keyboard focus on the Name field and on the submit button at 375) |
| **Code read**   | `src/sections/{Inquiry,Faq,Header,Hero,Footer}.tsx`, `src/components/{Field,Button}.tsx`, `src/lib/fieldStyles.ts`, `src/content/formCopy.ts`, `src/styles/{theme,index}.css`, `src/App.tsx`, `dist/assets/*.css` (cascade order), `docs/qa/requests.md` Q8                                                                                                                                                                                                                                                             |
| **Scope**       | The inquiry form and its five states, the FAQ, FAQ → Inquiry → Footer, and one last whole-scroll pass at 375 and 1280. Every 5a and 5bc id is re-checked in §4.                                                                                                                                                                                                                                                                                                                                                         |
| **Token edits** | None made. One rule in `theme.css` `@layer base` — mine — is wrong for a light card inside a brand section (5f-01); the exact change is given there rather than applied, so this review is the one file written.                                                                                                                                                                                                                                                                                                        |

---

## 1. Scores — whole page (§13 rubric; 5 must be earned; ≤ 2 is a blocker)

| Criterion               | Score | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | :---: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fidelity to design-spec |   4   | Tokens only, no ad-hoc hex (the select chevron's `#26231F` is the ink value inside a data URI, as §6.9 specifies). Surfaces are three across the whole scroll (§5). Button variants exactly §6.1 at every occurrence — the submit is orange + charcoal, `w-full sm:w-auto`. Field chrome, error border, alert glyph, status panels, FAQ item, marker, `::-webkit-details-marker` all as §6.9/6.10/6.13. Loses the point because the focus-ring contract (§6.15) does not hold inside the form card: `[data-surface="brand"]` swaps the ring to warm white and the warm-white card inherits it, so keyboard focus on the submit button is invisible (5f-01).                                                                        |
| Hierarchy               |   4   | H1 → H2 → H3 unmistakable at 375 and 1280; the header pill is now the quieter twin of the hero CTA; price is the second thing the eye hits on every card; the orange submit is the loudest thing on its screen and the only orange there. FAQ: eight serif questions over muted answers, marker in brand green — the question is the unit, the answer recedes. Loses a point for the success panel, where the H3 and the body's first sentence are the same words (copy, not layout — see 5f-08, flagged only), and for the still top-heavy Classic/Full cards (5bc-07, accepted).                                                                                                                                                 |
| Spacing rhythm          |   4   | Section padding is one fluid token; heading → content is `mt-stack` in all ten sections; the 5bc-01 gallery void is closed (strip closes the section, About's own `pt-section` is the gap); How It Works paragraphs are level at 1280. FAQ's `pt-section-sm pb-section` (80/117 px at 1280) is a deliberate 39 px pull toward About and reads as intended — the FAQ heading is nearer its predecessor than any other H2, but the asymmetry is invisible at scroll speed (measured: FAQ list → green band 117 px, band top → H2 117 px, card bottom → band bottom 117 px; 64 px at 375 for all three). Loses a point for the footer at 768, where row 1 wraps into a broken two-column place line and a two-row links list (5f-03). |
| Typography              |   5   | Newsreader's optical size is visibly working from 76 px (hairline) to the 26 px FAQ questions (sturdy, weight 500, never bold-looking). Work Sans: 14 px / 500 labels, 16–17 px controls (no iOS zoom), 14 px muted helper and error text. FAQ answers at ≈ 72 ch inside `max-w-prose-copy`; form labels sit 6 px above their control and 20 px below the previous one, so proximity reads correctly. Prices tabular and baseline-aligned at 768/1280/1536. No faux bold/italic anywhere, no uppercase H2s, wordmark never green. The straight apostrophes in the form-status strings (5f-07) are the only typographic seam and are not a design change.                                                                           |
| Photography crops       |   4   | Hero is 640² at 1280 and 768² at 1536 with the sign's full header and the wheels (5a-02 landed); 384 × ≈ 600 portrait at 768; 1:1 at 320/375 with ≈ 30 px of headroom over the sign (5a-09 landed). Intro 4:5 with the stand and wheels; bucket frames on the three Why images only (grep-confirmed: `[clip-path:url(#bucket)]` appears once, `WhyHappyDays.tsx:53`); face intact at every width; gallery squares edge-to-edge, radius 0, no side padding; About 4:5. The two source-limited tightnesses from 5bc-09 remain and stay accepted.                                                                                                                                                                                     |
| Mobile quality          |   4   | 320: header on one row, Inquire visible, no wrap, `scrollWidth` = viewport; band CTA on one line; "75+ guests — / Custom quote" breaks at the dash (5bc-06 landed); form single-column with every label on one line including "Estimated Number of Guests *". 375: LCP image inside the first scroll, 44 px links and controls (inputs 48 px, submit 44 px, summary rows 93 px), `375-scrolled.png` shows the sticky hairline. Footer order name → place → service area → links (5a-06 landed). Loses a point for the two inline actions in the status panels being 27 px tall (5f-06) and the accepted 11 px gutter at ≤ 359 px (Q8).                                                                                             |
| "Reads as templated?"   |   4   | See §6. The closing sequence — accordion FAQ, form on a dark band, light footer — is the most conventional stretch of the page, and it is the restraint that keeps it out of the template bin: no icons in the FAQ, a plus that becomes an ×, serif questions, labels above fields with no floating labels or placeholders, a single-column form, one shadow on the whole page, and an orange pill that appears exactly twice. The bucket trio, the flush square hero and the radius-0 strip against rounded photos elsewhere are what someone would remember. What keeps it off a 5 is the brief's own structure (three pricing cards with a centre chip, a 01–04 row) and the hero shape.                                        |

---

## 2. Engineer's notes — verdicts

- **FAQ marker is the §6.13 plus rotating to ×, not a chevron.** Correct and confirmed in the rendered open state: 20 px, two 1.5 px strokes, `currentColor` = brand green, 200 ms `ease-soft` rotation, `group-open:rotate-45`. One optical note (5f-04, nit): a rotated plus has the same bounding box but reads ≈ 15 % smaller than the upright one, so the × on open rows looks lighter than the + on closed rows in the same column.
- **FAQ padding `pt-section-sm pb-section`.** Approved. It follows the 5bc §4 instruction exactly (fix the About → FAQ → Inquiry transition on the FAQ's side, not the token). Measured at 1280: About text → FAQ H2 197 px, FAQ hairline → green 117 px, green → Inquiry H2 117 px. §6.13/§7 amended in §5.
- **Form single-column at all widths; the §6.9 optional Date + Guests pairing skipped to keep DOM = tab order.** Approved. At 608 px a date control and a number control side by side would have bought ≈ 70 px of height for a second reading order; the single column also keeps every label on its own line at 320. §6.9's "may share a row" clause is withdrawn in §5.
- **`shadow-form` only on the inquiry card.** Confirmed by grep — the only `shadow-*` utility in `src/` is `Inquiry.tsx:304`. `--shadow-card` is defined and unused; leave it, it costs nothing.
- **Safari `::-webkit-details-marker` hidden.** Present in `index.css:52`; `list-none` handles the rest. Correct.
- **Q8 (320 px gutter, 5a-11 not applied).** Accepted as resolved by the orchestrator. `320.png` header: nothing wraps, the pill sits inside the viewport; 11 px is the cost of a one-row header on a 320 px phone and it is the right trade.

---

## 3. Findings

Severity: **blocker** = must be fixed before release · **should-fix** = fix in the same round · **nit** = engineer's discretion. Ids are `5f-` (final).

### Blocker

- [ ] **5f-01 · blocker · Keyboard focus ring is invisible on everything inside the form card.**
      Rendered focus states (375, from `dist/`): Tab to the Name field — no ring, only the 1 px border darkening to green; Tab to "Send My Inquiry" — no visible focus indication at all (`getComputedStyle(button).outlineColor` = `rgb(255, 253, 249)`). Cause: `src/styles/theme.css:210–212` sets `--color-focus: var(--color-on-brand)` on `[data-surface="brand"]`; the custom property inherits into the `bg-surface-alt` (#FFFDF9) card, so the 2 px ring is #FFFDF9 on #FFFDF9 (1.00:1). The same is true for the "Send another inquiry" button and the `mailto:` link in the panels. Inputs keep a fallback (the `focus:border-brand` edge, 7.31:1), the submit button and the two links have none — this fails WCAG 2.4.7 on the page's conversion control. The rule is mine (5a review §3 "checked and correct" said the swap was right; it is, for the band and the section — not for a light card inside them). Fix in two places, one line each:

  `src/styles/theme.css` (`@layer base`, directly after the `[data-surface="brand"]` rule):

  ```css
  /* A light card inside a brand section (the inquiry form) takes the green ring back. */
  [data-surface='light'] {
    --color-focus: var(--color-green);
  }
  ```

  `src/sections/Inquiry.tsx:304` — add `data-surface="light"` to the `<form>`:

  ```tsx
  <form … data-surface="light" className="mt-stack mx-auto max-w-form rounded-card bg-surface-alt p-6 shadow-form sm:p-8 lg:p-10">
  ```

  `Button`'s `onBrand` is passed explicitly (`Inquiry.tsx:589`), not inferred from an ancestor, so the submit stays orange + charcoal. Result: brand-green ring (6.67:1 on warm white) on every control and link in the card, warm-white ring on the section's own content (nothing focusable there today). Verify with one Tab-focused shot of the submit button at 375 and 1280. I will fold the rule into §6.15 at the next spec pass; the engineer may apply the `theme.css` line — it is the fix, not a token change.

### Should-fix

- [ ] **5f-02 · should-fix · The first invalid field — the one focus lands on — loses its red border.**
      `docs/qa/screenshots/form/invalid.png` y ≈ 445–495 (Name field, 375): after a failed submit focus moves to the first invalid control and its border is _green_ (`focus:border-brand`) while every other invalid field is red; with 5f-01 the ring is invisible, so the focused field is the only invalid one that does not look invalid. Cause: in `dist/assets/*.css` `.focus\:border-brand:focus` (rule ≈ 342) sorts after `.border-danger` (rule ≈ 205) — same specificity, later wins. The error message with the alert glyph is still there, so clarity survives; but the border is the §6.9 signal. `src/lib/fieldStyles.ts:47`:

  ```ts
  return error ? 'border-[1.5px] border-danger focus:border-danger' : undefined;
  ```

  Invalid + focused = red edge + green ring (after 5f-01), which is the conventional reading. Verify by re-running `npm run qa:form` and checking `invalid.png`.

- [ ] **5f-03 · should-fix · Footer row 1 breaks at 768.**
      `docs/qa/screenshots/5e/768.png` footer (y ≈ 16390–16480 in the 2× file): the place line renders as two ragged columns — "Greensburg, / Pennsylvania" · "Serving Pittsburgh + Western / Pennsylvania" — with the middle dot floating between them, and the links wrap to "Instagram Facebook / Email". The row needs ≈ 720 px (place line ≈ 470 + links ≈ 250) in a 706 px container. `md:` is one breakpoint too early for this row; row 3 (tagline + ©) fits and stays. `src/sections/Footer.tsx`:

  - line 31: `md:flex-row md:items-center md:justify-between` → `lg:flex-row lg:items-center lg:justify-between`
  - line 34: `md:flex-row md:items-center md:gap-2` → `lg:flex-row lg:items-center lg:gap-2`
  - line 36: `hidden md:inline` → `hidden lg:inline`

  At 768 the footer then stacks exactly as at 375 (name, place, service area, links), which is right for a tablet; at ≥ 1024 (container 960) the row is unchanged from `1280.png`. Verify with a fresh 768 shot. §6.12 amended in §5.

### Nits

- [ ] **5f-04 · nit · The open-row × reads lighter than the closed-row +.**
      Rendered FAQ open state at 1280, rows 2–3 vs 1, 4–8: same 20 px box, but the diagonal strokes make the × look ≈ 15 % smaller in a column of pluses. `src/sections/Faq.tsx:49`: `group-open:rotate-45` → `group-open:rotate-45 group-open:scale-110`. Two transforms on one element compose; reduced-motion still zeroes the duration.
- [ ] **5f-05 · nit · "Sending…" on the disabled submit is ≈ 2.4:1, not the 6:1 §6.1 claims.** Accepted.
      `docs/qa/screenshots/form/submitting.png` y ≈ 1040–1120. `disabled:opacity-60` fades label and fill together against the white card: blended label ≈ #7D7B79 on blended fill ≈ #F1B790. WCAG 1.4.3 exempts inactive controls and the state lasts a network round-trip, so no change; §6.1's parenthetical is corrected in §5. If the owner ever asks for a stronger "sending" cue, the dial is `disabled:opacity-60` → `disabled:bg-accent-orange-hover disabled:text-ink-muted` (5.4:1), not an opacity change.
- [ ] **5f-06 · nit · The two inline actions in the status panels are 27 px tall.**
      `form/success.png` "Send another inquiry" (y ≈ 1330–1370); `form/error.png` "Or email us directly" (y ≈ 1325–1365). Both pass the 24 px minimum; the rest of the page's links carry 44 px (`min-h-tap`). `src/sections/Inquiry.tsx:323` and `:572`: add `inline-flex min-h-tap items-center` (the `:572` link already has `inline-block`; replace it). No visual change at rest.
- [ ] **5f-07 · nit · Straight apostrophes in the form-status strings.** For the UX reviewer, not a design change.
      `form/error.png` heading "We couldn't send your inquiry." uses `'`; every owner string on the page uses `’` ("Let’s", "you’re", "What’s"). Source: `src/content/formCopy.ts:34, :36, :53` (`hasn't`, `you're`, `couldn't`). Swapping `'` → `’` is punctuation, not wording — but the strings are ux-spec-owned, so I am flagging rather than requesting.
- [ ] **5f-08 · nit · Success panel: the H3 and the body's first sentence are the same words.** For the UX reviewer / owner; no design change.
      `form/success.png` y ≈ 800–960: "Thanks, Dana Whitfield!" as the heading, then "Thanks, Dana Whitfield! We received your inquiry…" as the body — D9 reuses the auto-reply paragraph verbatim, so the repetition is a copy decision. The panel's hierarchy (26 px serif H3, 17 px body, underlined action) is right; the words are outside my remit.

### Checked and correct (no action)

**Form.** Card `bg-surface-alt rounded-card p-6 sm:p-8 lg:p-10 shadow-form max-w-form mx-auto` (608 px at ≥ 768; 332 px at 375; 284 px at 320) · labels `text-small font-medium text-ink` above every control, no placeholders, required mark `text-accent-orange-ink` (5.49:1 on the card) and `aria-hidden` with the "Required fields are marked *" note above the first field · inputs/select/textarea one chrome: `border border-border-strong` (3.73:1 boundary, ≥ 3), `rounded-field`, `h-field` 48 px, `px-3.5`, 16–17 px text; textarea `min-h-32 py-3`; select `appearance-none pr-10` with the inline-SVG chevron, "Choose one" as a real disabled option in `text-ink` · error state `border-[1.5px] border-danger` (6.86:1) + 14 px `text-danger` message with the 16 px stroke glyph, `mt-1`, `gap-1.5`; summary line `text-small text-danger mt-6` directly above the button; nothing relies on colour alone · submit `bg-accent-orange text-ink` (6.00:1), `rounded-full`, 44 px, `w-full sm:w-auto`, hover `bg-accent-orange-hover`, no shadow or transform · success panel `rounded-field p-5 border border-accent-mint bg-accent-mint-tint text-brand-ink` (8.43:1), H3 `font-display text-h3`, action underlined in `text-brand-ink` · error panel `border-danger/30 bg-danger-tint text-ink`, H3 `text-danger` (5.67:1), `mailto:` link `text-brand-ink` underlined (8.00:1 on the tint) · both panels keep the card's white frame around them, which reads as the card "holding" the outcome rather than a fourth surface · `data-surface="brand"` on `#inquire` and on the custom band only · the native date placeholder ("mm/dd/yyyy") and the Chrome number spinner are platform chrome, accepted.

**FAQ.** `max-w-faq mx-auto divide-y divide-line border-y border-line mt-stack` · rows 72 px at 1280 (`py-5` + 31 px line), 93–94 px at 375 with two-line questions · `<h3 class="font-display text-h3 text-ink">` inside `<summary>`, marker `shrink-0 mt-1.5 size-5 text-brand`, its centre on the first line's centre at every width · answer `text-body text-ink-muted pb-6 max-w-prose-copy` starting 20 px under the question and ending 24 px above the hairline — balanced; two open rows at once read cleanly at 375 and 1280 · eight closed rows read as one hairline-bounded index block, the same device (sand hairline) as How It Works and the Why reasons, which ties the three lists together · no hover treatment on the summary (the plus and `cursor-pointer` carry affordance; adding one would be a fourth micro-interaction) · heading centred, block centred, `bg-surface`.

**Transitions.** About (cream) → FAQ (cream) → Inquiry (green) → Footer (cream): two cream sections in a row is allowed by §7; the green band starts flush after the FAQ's `pb-section`; the footer's `border-t border-line` sits against green (5.41:1, a faint lighter edge) and is harmless; footer `py-section-sm` makes it a light landing, not a section.

**Whole page.** Surfaces: cream / warm white / green — counted at 320, 375, 768, 1280, 1536; the mint-tint and danger-tint panels and the lavender chip are status/accent grounds under §2.3, not surfaces · signature element: the bucket clip on exactly three images · one orchestrated reveal (hero), one FAQ rotation, one hover set; nothing scroll-triggered · all strings verbatim from `copy.ts` / `formCopy.ts`; no invented facts; nothing stakeholder-private in this file.

---

## 4. Earlier ids — verified in `5a-fix/*`, `5bc-fix/*` and `5e/*`

| Id        | Status                 | Evidence                                                                                                                                                  |
| --------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5a-01     | fixed                  | `5e/768.png`, `1280.png`, `1536.png` header: wordmark x-height centred on the pill.                                                                       |
| 5a-03     | fixed (code + build)   | `App.tsx:43` carries `focus:px-4 focus:py-3 focus:min-h-tap focus:inline-flex focus:items-center`; `dist` CSS has `.focus\:px-4:focus{padding-inline:…}`. |
| 5a-02     | fixed                  | Hero 640² at 1280, 768² at 1536; sign header and wheels inside; CTA above an 800 px fold.                                                                 |
| 5a-07     | fixed                  | `Hero.tsx:57` `md:w-1/2`; column-to-image gap 54 px at 1280.                                                                                              |
| 5a-04     | fixed                  | `Header.tsx:67` `min-[360px]:gap-4`; `5e/375.png` shows 16 px gaps.                                                                                       |
| 5a-05     | fixed                  | `Button.tsx:28` `md:min-h-tap md:px-5 md:py-3 md:text-small`; header pill visibly the quieter twin at 768/1280/1536.                                      |
| 5a-06     | fixed                  | `5e/375.png` footer: name, place, service area, links, hairline, tagline, ©.                                                                              |
| 5a-08     | fixed                  | `focus-visible:underline` on `Header.tsx:72` and `Footer.tsx:47`.                                                                                         |
| 5a-09     | fixed                  | `build-images.mjs:90` `focalY: 0.55`; `5e/375.png` hero has headroom over the sign.                                                                       |
| 5a-10     | fixed                  | `Footer.tsx:56` `gap-3`.                                                                                                                                  |
| 5a-11     | not applied — resolved | Q8; accepted.                                                                                                                                             |
| 5bc-01    | fixed                  | `5e/1280.png`: the strip closes the white section; About's `pt-section` is the only gap.                                                                  |
| 5bc-02    | fixed                  | `5e/1280.png` How It Works: four paragraphs start on one line.                                                                                            |
| 5bc-03    | fixed                  | `5e/768.png` About: "Grown in Greensburg. / Made to Be Shared." on two lines at the sentence break.                                                       |
| 5bc-04    | fixed                  | `5e/768.png` Packages: cards ≈ 224 px, descriptions five lines at ≈ 21 ch.                                                                                |
| 5bc-05    | fixed                  | `5e/1280.png`: band text and card text share x ≈ 121.                                                                                                     |
| 5bc-06    | fixed                  | `5e/320.png` band: "75+ guests — / Custom quote".                                                                                                         |
| 5bc-07–09 | accepted, no change    | as recorded in the 5bc review.                                                                                                                            |

Nothing from the earlier rounds is outstanding.

---

## 5. Spec amendments (recorded here; `docs/design-spec.md` is updated at the next designer pass)

1. **§6.15 Focus ring:** add `[data-surface="light"] { --color-focus: var(--color-green) }`; any `surface-alt` card inside a `[data-surface="brand"]` section carries `data-surface="light"`. (5f-01)
2. **§6.9 Form fields:** error border is `border-[1.5px] border-danger focus:border-danger`; the "Date + Guests may share a row from md" clause is withdrawn — single column at every width.
3. **§6.1 Buttons:** the disabled orange primary is `opacity-60`, which is ≈ 2.4:1 for the label — acceptable because inactive controls are exempt; the "(keeps 6:1 legibility)" note is wrong and is struck. (5f-05)
4. **§6.12 Footer:** row 1 (name/place block · links) becomes a row from **lg**, not md; row 3 from md as built. (5f-03)
5. **§6.13 / §7 FAQ:** section padding `pt-section-sm pb-section`; the marker may add `group-open:scale-110` beside the rotation. (5f-04)
6. **§6.10 Status messages:** the inline actions carry `inline-flex min-h-tap items-center`. (5f-06)

---

## 6. "Reads as templated?" — the concrete case, at 375 and 1280

**What makes it read authored.**

- The type does the branding: Newsreader at 76 px in the hero is hairline-thin and at 26 px in the FAQ it is sturdy — the same face at two personalities, which a template with a static webfont cannot do. Nothing on the page is bold; emphasis is size and colour.
- Three photographic treatments that mean something: the flush-right square hero (the "bar spanning to the edge"), the bucket-clipped trio (the only non-rectangular shape, on the three farm photos), and the radius-0 edge-to-edge gallery against rounded photos elsewhere. At 375 all three survive: the 1:1 hero inside the first scroll, three 100 px buckets in a row, a 2 × 2 strip with no side padding.
- One device — the sand hairline — carries every list on the page (How It Works, the Why reasons, the FAQ), so the sections rhyme without repeating a card style. There are no icons anywhere except the 16 px alert glyph and the select chevron.
- Colour is spent, not sprayed: green is the brand and appears as text, the primary pill and one band; orange appears exactly twice and only on green; lavender exactly once; mint only inside the success panel. The hover and focus colours are derived from the same seven.
- The closing sequence is where most service landing pages go generic (accordion, form on a dark band, footer). Here the FAQ has no chevrons or boxed rows, the form has labels above fields and no placeholders, the button is left-aligned in a single column like a letter rather than centred like a modal, and the footer is cream and quiet rather than a dark block.

**What still reads as pattern.** The hero's eyebrow / big serif / lead / pill / photo-right shape; three pricing cards with a centre chip; a 01–04 step row. All three are the brief's structures and are executed with restraint (no gradients, no scale on the middle card, numerals as ink not badges). They cap the score at 4; changing them would mean changing the brief.

---

## 7. Verdict

**FIX ROUND NEEDED** — one blocker, two should-fixes, all one-line: **5f-01, 5f-02, 5f-03**; nits 5f-04 – 5f-06 are one-utility edits worth taking in the same pass; 5f-07 and 5f-08 are for the UX reviewer / owner and need no design change. Re-shoot: one Tab-focused shot of the submit button at 375 and 1280 (5f-01), `npm run qa:form` for `invalid.png` (5f-02), and a fresh 768 (5f-03).

### Summary

1. The page is built from tokens only, surfaces stay at three across the whole scroll, the bucket clip is on exactly three images, and the form card carries the page's only shadow.
2. Every 5a and 5bc id has landed and is visible in the fix-round shots; nothing earlier is outstanding.
3. One blocker, and it is my rule: `[data-surface="brand"]` swaps the focus ring to warm white and the warm-white form card inherits it, so keyboard focus on "Send My Inquiry" is invisible. Fix is a `[data-surface="light"]` rule plus one attribute on the form (5f-01).
4. The first invalid field turns green on focus because `focus:border-brand` sorts after `border-danger`; add `focus:border-danger` (5f-02).
5. The footer's row layout is one breakpoint early — at 768 the place line splits into columns and the links wrap; move row 1 to `lg:` (5f-03).
6. The form on the brand surface is otherwise right: labels 14/500 charcoal, 3.73:1 borders, orange + charcoal submit, error state that does not rely on colour, success and error panels with correct hierarchy and an underlined `mailto:` affordance.
7. The FAQ is right: 72 px rows, serif questions over muted answers, plus-to-× marker, balanced open state; the `pt-section-sm pb-section` padding is approved and the FAQ → Inquiry → Footer transition measures evenly at 117 / 64 px.
8. Typography earns its 5; hierarchy, rhythm, crops and mobile hold at 4; "templated" stays a 4, capped by the brief's own hero and pricing structures rather than by execution.
9. Copy is untouched; two copy observations (straight apostrophes, the repeated success greeting) are handed to the UX reviewer without a wording request.
10. No token or favicon edits made; six spec clauses amended in §5.
