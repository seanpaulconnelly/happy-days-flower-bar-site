# Design spec — Happy Days Flower Farm V1

|                    |                                                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Author**         | `ui-designer` (Phase 2b)                                                                                                                                                                                                                                             |
| **Date**           | 2026-08-29                                                                                                                                                                                                                                                           |
| **Token file**     | `src/styles/theme.css` (Tailwind 4 `@theme`; compiled and verified against the installed Tailwind 4.3)                                                                                                                                                               |
| **Also delivered** | `public/favicon.svg`                                                                                                                                                                                                                                                 |
| **Inputs**         | `website-spec.md` (palette, visual system, copy), `visual-reference.png` (direction), `websites.md` (taste), `answers-from-bethany.md`, the 9 source images (all 1152×1536 portrait), build plan §2 R2/R3/R4/R8/R9/R12, §3.4, Phase 5, Appendix B, `docs/ux-spec.md` |
| **Consumers**      | `frontend-engineer` (batches 5a–5e), `ui-designer` as evaluator (§13 rubric), Phase 6 reviewers                                                                                                                                                                      |

`docs/ux-spec.md` was present before this document was finished; section order, anchors, mobile rules, FAQ model (`<details>`), form layout and the "Most Popular" rules below follow it. Deliberate differences from the ux-spec are listed in §14 so the orchestrator can log them.

---

## 1. Direction in one paragraph

A garden-grown product photographed in daylight, presented like a good magazine feature: cream paper, charcoal ink, one deep green, and the photographs doing the talking. The page should feel like the flower bar itself — a calm white structure holding a lot of colour. So the chrome stays quiet (three surfaces, one serif, one sans, one accent doing real work) and every bit of personality comes from four things: the type pairing (Newsreader + Work Sans), the spacing rhythm, the crops, and one signature device — the **bucket frame** (§10) — that is taken from the product rather than from a template. Not bridal, not farm-market, not "florist template": no script faces, no pink washes, no kraft textures, no watercolour, no icon sets.

Page map (desktop, ≥ 1024 px; every section stacks to one column on phones per ux-spec §4):

```
┌ header (sticky, cream, 72px) Happy Days Flower Farm      Flower Bar  About  [Inquire] ┐
│ HERO   eyebrow / H1 (76px serif) / lead / [Inquire About Your Date] │ photo 3:4 flush→│
│ INTRO  photo 4:5 (rounded)            │ H2 / 4 short paragraphs / bold line / [View…] │
│ HOW    H2 centred · 01 ─ 02 ─ 03 ─ 04 (serif numerals in deep orange) · bold line     │
│ PACK   H2 / intro  ┌Classic┐ ┌Social ◦Most Popular┐ ┌Full┐  ▄▄ Custom band (green) ▄▄ │
│        [Inquire About Your Date]  footnote (muted)                                    │
│ WHY    H2 centred · ⌒ ⌒ ⌒ three photos in BUCKET FRAMES · 4 reasons 2×2                │
│ GALL   H2 / copy · ■ ■ ■ ■ full-bleed 1:1 strip, 8px gutters, no radius               │
│ ABOUT  photo 4:5 (rounded)            │ H2 / 2 paragraphs                              │
│ FAQ    H2 · 8 <details> rows, 44rem, hairlines                                        │
│ INQ    (green) H2 + 2 paras on-brand · warm-white form card, 1 column · [Send My…]     │
└ footer (cream) wordmark · place · links · tagline ─────────────────────────────────────┘
```

---

## 2. Token system (`src/styles/theme.css`)

### 2.1 Base colours — the seven from the brief, verbatim

| Token                | Hex       | Brief name  |
| -------------------- | --------- | ----------- |
| `--color-cream`      | `#F7F2EA` | Cream       |
| `--color-charcoal`   | `#26231F` | Charcoal    |
| `--color-green`      | `#435B47` | Deep green  |
| `--color-lavender`   | `#D9C8E8` | Lavender    |
| `--color-orange`     | `#E8884A` | Warm orange |
| `--color-mint`       | `#BFD9C3` | Soft mint   |
| `--color-warm-white` | `#FFFDF9` | Warm white  |

### 2.2 Derived shades (needed to pass AA; every ratio in §3)

| Token                                  | Hex                   | Why it exists                                                                                                     |
| -------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--color-green-deep`                   | `#34483A`             | Primary-button hover; green _as text_ on cream (`--color-brand-ink`)                                              |
| `--color-orange-deep`                  | `#A84E17`             | Orange _as text_ on cream (step numerals, required marks) — the spec orange is 2.34:1 on cream and cannot be text |
| `--color-orange-bright`                | `#F09A64`             | Hover of the orange CTA (lighter, so contrast with charcoal text rises)                                           |
| `--color-ink-soft`                     | `#5C574F`             | Muted body text (footnote, help text, guest ranges)                                                               |
| `--color-sage`                         | `#D6DFD6`             | Muted text on green surfaces                                                                                      |
| `--color-sand`                         | `#E3DBCF`             | Hairlines and card borders (decorative, not a control boundary)                                                   |
| `--color-stone`                        | `#8A8277`             | Form-field borders — control boundaries need ≥ 3:1 (WCAG 1.4.11)                                                  |
| `--color-mint-tint`                    | `#E6F0E7`             | Success panel ground                                                                                              |
| `--color-error` / `--color-error-tint` | `#9E3628` / `#F6E4DF` | Error text / error panel ground                                                                                   |

### 2.3 Semantic aliases — use these, not the base names

| Alias                                              | →                                                    | Job                                                                     |
| -------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `--color-surface`                                  | cream                                                | Page ground; Hero, Intro, Packages, About, FAQ, Footer                  |
| `--color-surface-alt`                              | warm white                                           | Cards, form card, How It Works, Gallery                                 |
| `--color-surface-brand`                            | green                                                | Custom-quote band, Inquiry section                                      |
| `--color-ink` / `--color-ink-muted`                | charcoal / ink-soft                                  | Text on light surfaces                                                  |
| `--color-on-brand` / `--color-on-brand-muted`      | warm white / sage                                    | Text on green                                                           |
| `--color-brand` / `--color-brand-ink`              | green / green-deep                                   | Fills, links, secondary-button border / green text and hover            |
| `--color-accent-orange`                            | orange                                               | **One job:** the primary CTA fill on green surfaces (band, form submit) |
| `--color-accent-orange-ink`                        | orange-deep                                          | **Two jobs:** step numerals 01–04; required-field asterisk              |
| `--color-accent-orange-hover`                      | orange-bright                                        | Hover of the above CTA                                                  |
| `--color-accent-lavender`                          | lavender                                             | **One job:** the "Most Popular" chip                                    |
| `--color-accent-mint` / `--color-accent-mint-tint` | mint / mint-tint                                     | Secondary-button hover ground / success panel ground                    |
| `--color-line`, `--color-border`                   | sand                                                 | Hairlines, card borders                                                 |
| `--color-border-strong`                            | stone                                                | Input borders                                                           |
| `--color-danger` / `--color-danger-tint`           | error / error-tint                                   | Validation                                                              |
| `--color-focus`                                    | green (→ warm white inside `[data-surface="brand"]`) | Focus ring                                                              |

**Surface rule (hard):** at most **three** surface colours on the page — cream, warm white, deep green. Cream is the ground; warm white is for _things that sit on_ the ground (cards, the form) and for two sections that hold white-edged cards or photos (How It Works, Gallery); green is for the two conversion moments only (Custom band, Inquiry). Lavender, mint and orange are never section backgrounds. Nothing else is ever introduced (no pinks, no browns, no greys other than the derived shades above).

---

## 3. CTA colour decision and contrast table

### 3.1 Decision

`#E8884A` with white text measures **2.57:1** (warm white `#FFFDF9`) — fails AA for text of any size below 24 px bold. Options weighed:

1. Darken the orange fill for white text: reaching 4.5:1 needs roughly `#B85518`, which reads as terracotta — exactly the "cream + serif + terracotta" default the R9 warning is about, and no longer the brief's warm orange.
2. Charcoal text on the spec orange: **6.00:1**, passes AA for all sizes with the palette untouched.
3. Green primary everywhere, orange demoted to accents.

**Chosen: 2 + 3 combined.** The primary button is **deep green with warm-white text (7.31:1)** on the cream/white surfaces — green is the brand colour and the spec calls orange a _restrained_ accent, so orange should not be on five buttons. On the two **green surfaces** the same primary button inverts to **warm orange with charcoal text (6.00:1)** — that is where the reference puts orange, and the two places it appears (Custom-quote band, Send My Inquiry) are the two conversion moments, so the one loud colour is spent exactly where it earns its keep. Non-text note: the orange fill against the green surface is 2.85:1; WCAG 1.4.11 does not require a fill/boundary contrast when the button's text alone (6.00:1) identifies the control, so this is compliant; the ratio is recorded here for the reviewer.

### 3.2 Contrast table — every text/background pair used

Measured with the WCAG 2.x relative-luminance formula. AA thresholds: ≥ 4.5:1 body, ≥ 3:1 large (≥ 24 px, or ≥ 18.66 px bold) and non-text UI boundaries.

| Foreground                           | Background                    | Ratio | Used for                                                 | AA                                         |
| ------------------------------------ | ----------------------------- | ----- | -------------------------------------------------------- | ------------------------------------------ |
| ink `#26231F`                        | surface `#F7F2EA`             | 14.04 | Body, headings                                           | pass                                       |
| ink                                  | surface-alt `#FFFDF9`         | 15.40 | Card/form text                                           | pass                                       |
| ink-muted `#5C574F`                  | surface                       | 6.43  | Footnote, guest ranges, help text                        | pass                                       |
| ink-muted                            | surface-alt                   | 7.05  | Same, on cards                                           | pass                                       |
| brand-ink `#34483A`                  | surface                       | 8.83  | Links, secondary-button label, success text              | pass                                       |
| brand-ink                            | surface-alt                   | 9.69  | Same, on cards                                           | pass                                       |
| brand `#435B47`                      | surface                       | 6.67  | Eyebrows (13 px, bold, tracked)                          | pass                                       |
| accent-orange-ink `#A84E17`          | surface                       | 5.00  | Step numerals (large), required asterisk                 | pass                                       |
| accent-orange-ink                    | surface-alt                   | 5.49  | Required asterisk on the form card                       | pass                                       |
| on-brand `#FFFDF9`                   | surface-brand `#435B47`       | 7.31  | Text on green sections; primary-button label             | pass                                       |
| on-brand-muted `#D6DFD6`             | surface-brand                 | 5.44  | Eyebrow / secondary line on green                        | pass                                       |
| ink                                  | accent-orange `#E8884A`       | 6.00  | Orange CTA label                                         | pass                                       |
| ink                                  | accent-orange-hover `#F09A64` | 7.08  | Orange CTA hover label                                   | pass                                       |
| ink                                  | accent-lavender `#D9C8E8`     | 9.96  | "Most Popular" chip                                      | pass                                       |
| brand-ink                            | accent-mint `#BFD9C3`         | 6.53  | Secondary-button hover label                             | pass                                       |
| brand-ink                            | accent-mint-tint `#E6F0E7`    | 8.43  | Success panel text                                       | pass                                       |
| danger `#9E3628`                     | surface-alt                   | 6.86  | Field error text                                         | pass                                       |
| danger                               | danger-tint `#F6E4DF`         | 5.67  | Error panel text                                         | pass                                       |
| ink                                  | danger-tint                   | 12.72 | Error panel body                                         | pass                                       |
| **Non-text** border-strong `#8A8277` | surface-alt                   | 3.73  | Input boundary                                           | pass (≥ 3)                                 |
| **Non-text** brand                   | surface                       | 6.67  | Primary-button fill; secondary-button border; focus ring | pass                                       |
| **Non-text** on-brand                | surface-brand                 | 7.31  | Focus ring on green                                      | pass                                       |
| **Non-text** line `#E3DBCF`          | surface                       | 1.23  | Decorative hairlines only — never a control boundary     | n/a                                        |
| _Rejected_ white                     | orange                        | 2.57  | —                                                        | fail                                       |
| _Rejected_ orange                    | surface                       | 2.34  | —                                                        | fail (so orange is never text on cream)    |
| _Rejected_ mint                      | surface-brand                 | 4.93  | —                                                        | pass but sage is calmer; not used for text |

---

## 4. Typography

### 4.1 Faces

| Role      | Face                                  | Package                                 | Axes shipped                 | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------- | --------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display   | **Newsreader** (Production Type; OFL) | `@fontsource-variable/newsreader` 5.3.0 | `wght` 200–800 + `opsz` 6–72 | A real editorial serif — sharp, high-contrast at display sizes (the `opsz` axis tightens spacing and thins hairlines automatically above ~40 px), soft and readable at 16 px for prices. It carries "elevated" without tipping into bridal (no swashes, no Didone fashion) and, unlike Fraunces — the face the AI-default cluster reaches for — it does not announce itself with wonky terminals. Its lining figures are even and wide-set, so `$895 / $1,495 / $1,995` align cleanly. |
| Body / UI | **Work Sans** (Wei Huang; OFL)        | `@fontsource-variable/work-sans` 5.3.0  | `wght` 100–900               | A warm grotesque with a generous x-height and open apertures; friendly at 16–17 px on cream, crisp at 13 px for eyebrows and chips. It is not Inter / Manrope / Plus Jakarta / Instrument Sans, the four faces that make a page read as generated, and its slightly wide, low-contrast texture sits well next to Newsreader's sharpness (early-grotesque + newspaper serif is a print pairing, not a SaaS one). Supports `tnum` for prices in UI contexts.                             |

Both are OFL, verified on npm on 2026-08-29 (`npm view` → `5.3.0`, `OFL-1.1`). Fontsource CSS declares `font-display: swap` and splits subsets by `unicode-range`, so a latin-only page downloads only the latin files: **Newsreader latin opsz 132 KB**, **Work Sans latin 52 KB**. No italic files are shipped (the spec's italic footnote is set roman + muted; `font-synthesis: none` in `theme.css` prevents a fake italic). If Lighthouse mobile Performance lands below 90 because of fonts, the fallback is `@fontsource-variable/newsreader/wght.css` (60 KB, no `opsz`) — say so in the QA report rather than swapping faces.

**Engineer must add** (index.css, above `@import "tailwindcss"` is fine — order does not matter for `@font-face`):

```css
@import '@fontsource-variable/newsreader/opsz.css'; /* wght + opsz axes, latin via unicode-range */
@import '@fontsource-variable/work-sans/index.css'; /* wght axis */
```

```
npm i @fontsource-variable/newsreader @fontsource-variable/work-sans
```

Preload (index.html, both `crossorigin`): the two latin `.woff2` files — `newsreader-latin-opsz-normal.woff2` and `work-sans-latin-wght-normal.woff2` — via Vite `?url` imports or a build-time copy; not mandatory, the hero image remains the LCP element.

Tokens: `--font-display`, `--font-body` (utilities `font-display`, `font-body`); `--font-sans`/`--font-serif` alias to them so nothing on the page can fall to a third family. `html { font-optical-sizing: auto }` is set in `theme.css` — never set `font-variation-settings: "opsz"` manually.

### 4.2 Scale (all fluid via `clamp()`; tokens are `--text-<role>` with `--line-height`, `--letter-spacing`, `--font-weight` sub-tokens, so `class="text-h2"` sets all four)

| Utility                         | Size (375 → 1440) | Face · weight  | Leading      | Tracking          | Used for                                                                        |
| ------------------------------- | ----------------- | -------------- | ------------ | ----------------- | ------------------------------------------------------------------------------- |
| `text-display`                  | 44 → 76 px        | display · 500  | 1.02         | −0.015em          | H1 only                                                                         |
| `text-h2`                       | 32 → 48 px        | display · 500  | 1.08         | −0.01em           | Section H2s                                                                     |
| `text-h3`                       | 22 → 26 px        | display · 500  | 1.2          | 0                 | Card names, step titles, reasons, FAQ questions, status headings                |
| `text-price`                    | 36 → 46 px        | display · 500  | 1            | −0.01em           | Package prices                                                                  |
| `text-step`                     | 40 → 54 px        | display · 400  | 1            | −0.01em           | Step numerals 01–04                                                             |
| `text-lead`                     | 18 → 21 px        | body · 400     | 1.5          | 0                 | Hero paragraph, section intro lines under H2s                                   |
| `text-body`                     | 16 → 17 px        | body · 400     | 1.6          | 0                 | Paragraphs, inputs, FAQ answers                                                 |
| `text-small`                    | 14 px             | body · 400/500 | 1.5          | 0                 | Footnote, help text, errors, footer lines                                       |
| `text-eyebrow`                  | 13 px             | body · 600     | 1.2          | 0.12em, uppercase | Hero eyebrow, guest ranges, "Custom Floral Experience" line, form section label |
| `text-chip`                     | 12 px             | body · 600     | 1            | 0.08em, uppercase | "Most Popular"                                                                  |
| `text-wordmark` / `-sm` / `-lg` | 20 / 15 / 24 px   | display · 500  | 1 / 1.05 / 1 | 0.005em           | Header (≥ sm) / header stacked (< sm) / footer                                  |

Rules:

- Headings are never uppercase and never bold above 500 — Newsreader at 600+ gets muddy on cream.
- Body measure 60–75 characters: `max-w-prose-copy` (40rem) on any text column.
- Bold copy lines from the spec ("You host. We bring the flowers…", "Simple for you. Memorable for them.", "Your guests choose…") are `text-lead font-medium` (Work Sans 500), not display serif, so they read as emphasis rather than as a second heading.
- **Numerals:** prices are `font-display text-price tabular-nums lining-nums` (Tailwind `tabular-nums`; add `lining-nums` via `[font-variant-numeric:tabular-nums_lining-nums]` if Tailwind's utility is not enough). Guest ranges ("26–50 guests") and the numeric input use `font-body tabular-nums`. The en dash in ranges is the copy's own character (decision D3).
- Underlines: in-copy links (footer email, "Or email us directly") use `underline underline-offset-4 decoration-1` in `brand-ink`; nav links have no underline at rest, underline on hover/focus.

---

## 5. Spacing, containers, breakpoints, radius

| Token / utility               | Value                                                                                   | Use                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `py-section`                  | 64 → 128 px                                                                             | Vertical padding of every section (Hero uses `pt-section-sm pb-section`)                     |
| `py-section-sm`               | 48 → 80 px                                                                              | FAQ, Footer                                                                                  |
| `px-gutter`                   | 20 → 40 px                                                                              | Horizontal page gutter on every container                                                    |
| `mt-stack` / `mb-stack`       | 32 → 56 px                                                                              | Gap from a section heading block to its content                                              |
| `max-w-site`                  | 72 rem (1152)                                                                           | Default container, centred                                                                   |
| `max-w-prose-copy`            | 40 rem                                                                                  | Any running-text column                                                                      |
| `max-w-form`                  | 38 rem                                                                                  | Inquiry form card                                                                            |
| `max-w-faq`                   | 44 rem                                                                                  | FAQ list                                                                                     |
| `h-header` / `md:h-header-lg` | 56 / 72 px                                                                              | Header height; `--spacing-scroll-offset` = 72 + 8 px feeds `index.css`'s `scroll-margin-top` |
| `gap-strip`                   | 8 px                                                                                    | Gallery gutters                                                                              |
| `h-field`                     | 48 px                                                                                   | Inputs, selects, buttons on the form                                                         |
| `min-h-tap`                   | 44 px                                                                                   | Every link/button/summary hit area                                                           |
| Grid gaps                     | `gap-6` (24) cards on phone/tablet, `gap-8` (32) ≥ lg; `gap-x-12 gap-y-10` reasons grid | —                                                                                            |
| Breakpoints                   | Tailwind defaults: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536                       | Not changed                                                                                  |
| `rounded-field`               | 8 px                                                                                    | Inputs, chips are `rounded-full`, status panels                                              |
| `rounded-card`                | 12 px                                                                                   | Cards, custom band, form card                                                                |
| `rounded-photo`               | 16 px                                                                                   | Intro and About images                                                                       |
| `rounded-hero`                | 20 px                                                                                   | Hero image's _inner_ (left) corners on desktop; 16 px all corners on mobile                  |
| Buttons                       | `rounded-full`                                                                          | Pills, per the reference; the only place a full radius appears besides the chip              |
| Gallery                       | radius 0                                                                                | Full-bleed strip — square corners read as edge-to-edge, rounded ones fight the viewport edge |

Section rhythm: heading block (eyebrow? → H2 → optional lead) is centred for How It Works, Packages, Why, Gallery, FAQ, Inquiry; left-aligned inside split layouts (Intro, About) and the Hero. Between the heading block and content: `mt-stack`. Within a text column paragraphs are spaced `space-y-4` (16 px) at body size; `space-y-5` at lead size.

---

## 6. Components (in tokens)

### 6.1 Buttons

Shared: `font-body font-medium text-[0.9375rem] md:text-base leading-none tracking-[0.01em] rounded-full min-h-tap px-6 py-3.5 inline-flex items-center justify-center gap-2 transition-colors duration-150 ease-soft`; real `<a href="#…">` per ux-spec §2. Focus ring from `theme.css` (`outline` on `:focus-visible`, offset 2 px). No transforms, no shadows.

| Variant                                                             | Rest                                                                                                                                        | Hover                    | Active         | Disabled                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------------------------------------- |
| Primary (light surfaces): hero, under Packages, header              | `bg-brand text-on-brand`                                                                                                                    | `bg-brand-ink`           | `bg-brand-ink` | `opacity-50 cursor-not-allowed`                   |
| Primary (inside `[data-surface="brand"]`): Custom band, form submit | `bg-accent-orange text-ink`                                                                                                                 | `bg-accent-orange-hover` | same as hover  | `opacity-60` (keeps 6:1 legibility of "Sending…") |
| Secondary (light): "View Flower Bar Packages"                       | `bg-transparent text-brand-ink border-[1.5px] border-brand`                                                                                 | `bg-accent-mint`         | same           | `opacity-50`                                      |
| Secondary (brand) — not used in V1                                  | `border-on-brand text-on-brand`                                                                                                             | `bg-on-brand/10`         | —              | —                                                 |
| Header compact (< md)                                               | Primary at `text-[0.8125rem] px-3.5 py-2.5 min-h-9` (36 px tall; hit area extended to 44 px with `before:` pseudo or padding on the `<li>`) |                          |                |                                                   |

Submit button is `w-full sm:w-auto` on the form.

### 6.2 Section heading with eyebrow

`<div class="text-center max-w-prose-copy mx-auto">` (or left-aligned in splits) containing: optional eyebrow `<p class="font-body text-eyebrow uppercase text-brand">`, H2 `font-display text-h2 text-ink text-balance`, optional lead `text-lead text-ink-muted mt-4`. Eyebrow → H2 gap `mt-3`. Only the Hero has an eyebrow in V1 ("Happy Days Flower Farm"); other sections have no eyebrow (their H2s are self-explanatory, and structure should not decorate). `text-balance` on all H2s and the H1.

### 6.3 Hero

Two columns from md: text column `md:w-[45%]`, image column flush to the right viewport edge (`md:absolute md:right-0 md:top-0 md:bottom-0 md:w-[52%]` inside a relative section, or a CSS grid with an asymmetric `max-w-site` — engineer's choice; the image must touch the right edge at ≥ md and the text stays inside `max-w-site px-gutter`). Order per ux-spec §4.1. Eyebrow `text-eyebrow text-brand`, H1 `font-display text-display text-ink`, lead `text-lead text-ink-muted max-w-[30rem]`, primary button `mt-8`. Vertical padding: `pt-10 md:pt-16 pb-section`. Mobile: image below CTA, `mt-10`, `rounded-photo`, 1:1 crop (§9). No overlay, no text on image.

### 6.4 Cards (generic)

`bg-surface-alt border border-border rounded-card p-6 md:p-8`. No shadow at rest. Cards do not hover (they are not links).

### 6.5 Pricing card and the "Most Popular" chip

Grid `grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch`. Card content order (top-down scan path per ux-spec §4.4):

1. Row: H3 `font-display text-h3 text-ink` and — Social only — the chip, right-aligned in the same row (`flex items-start justify-between gap-3`), so it never floats over the border.
2. Guest range `<p class="text-eyebrow uppercase text-ink-muted mt-2">` ("Up to 25 guests").
3. Price `<p class="font-display text-price text-ink tabular-nums lining-nums mt-6">` ("$895").
4. Description `<p class="text-body text-ink-muted mt-4">`.
   Padding `p-7 md:p-8`; no CTA inside cards (the spec's single CTA sits under the band).

**Chip:** `<span class="text-chip uppercase font-body bg-accent-lavender text-ink rounded-full px-2.5 py-1.5">Most Popular</span>` (12 px; 9.96:1). **One additional differentiator:** the Social card's border is `border-[1.5px] border-brand` instead of `border-border`; nothing else changes — same size, padding, type, no shadow, no scale, no fill. Classic and Full are not dimmed.

### 6.6 Custom-quote band

`<div data-surface="brand" class="bg-surface-brand text-on-brand rounded-card p-7 md:p-8 lg:px-10 mt-6 lg:mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">`. Left: H3 "Custom Floral Experience" `font-display text-h3 text-on-brand`; line "75+ guests — Custom quote" `text-lead text-on-brand-muted mt-1`; description `text-body text-on-brand mt-3 max-w-[38rem]`. Right: primary button (orange variant) labelled **Inquire About Your Date** — this _is_ the spec's Packages CTA, so it is not duplicated below the band; the footnote follows `mt-6 text-small text-ink-muted text-center` on cream.

### 6.7 How It Works step

`<ol class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">`; each `<li>`: numeral `<span class="font-display text-step text-accent-orange-ink block" aria-hidden="true">01</span>` (the visible numeral), then the H3 `font-display text-h3 text-ink mt-3` containing the verbatim string "01 — Choose Your Flower Bar" with the leading "01 — " wrapped in `<span class="sr-only">` so the outline and `check:copy` keep the full text while the eye sees one numeral; paragraph `text-body text-ink-muted mt-2`. A hairline `border-t border-line pt-6` above each item on lg (the row reads as a shelf). Numbering is justified: the content is a sequence. Closing line centred `text-lead font-medium mt-stack`.

### 6.8 Why-reason item

`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-stack`: each item `border-t border-line pt-5`; H3 `font-display text-h3 text-ink`; paragraph `text-body text-ink-muted mt-2`. No icons.

### 6.9 Form fields

Wrapper `<div class="flex flex-col gap-1.5">`.

- Label `<label class="font-body text-small font-medium text-ink">`; required mark `<span class="text-accent-orange-ink" aria-hidden="true"> *</span>`; the note "Required fields are marked *" above the first field: `text-small text-ink-muted`.
- Input / select / textarea: `bg-surface-alt text-ink text-body font-body border border-border-strong rounded-field h-field px-3.5 w-full` (textarea `min-h-32 py-3`). 16 px+ font size prevents iOS zoom. Placeholder: none.
- Focus: ring from base layer **plus** `focus:border-brand` so the field edge darkens.
- Error: `border-danger border-[1.5px]` + `aria-invalid`; message `<p class="text-small text-danger flex items-start gap-1.5 mt-1">` with a 16 px inline SVG exclamation-circle (stroke `currentColor`, ~200 B, inline in the Field component — no icon library).
- Help text `text-small text-ink-muted`.
- Select: native `<select>` with `appearance-none` and a chevron as an inline-SVG `background-image` data URI (`stroke="#26231F"`), `pr-10`. The disabled placeholder option "Choose one" stays in `text-ink` (it is a real option, not a placeholder).
- Field grid: single column; from md, only **Event Date + Estimated Number of Guests** may share a row (`md:grid-cols-2 gap-5`).
- Form card: `bg-surface-alt rounded-card p-6 sm:p-8 lg:p-10 shadow-form max-w-form mx-auto`.

### 6.10 Status messages

Live regions exist from first render (ux-spec §6.3). Panels: `rounded-field p-5 border`:

- Success: `bg-accent-mint-tint border-accent-mint text-brand-ink`; H3 `font-display text-h3`; body `text-body`; link "Send another inquiry" as an underlined link in `text-brand-ink`.
- Error: `bg-danger-tint border-danger/30 text-ink`; H3 in `text-danger`; body `text-body`; mailto link underlined in `text-brand-ink`.
- Summary line above the button: `text-small text-danger`.

### 6.11 Header

`<header class="sticky top-0 z-40 bg-surface h-header md:h-header-lg">`; inner `max-w-site px-gutter mx-auto h-full flex items-center justify-between gap-3`. Opaque, no blur. Bottom hairline `border-b border-line` appears after 8 px of scroll (toggle a class from a `scroll` listener with `requestAnimationFrame`, or always-on if the engineer prefers zero JS — always-on is acceptable).

- Wordmark: `<a href="#top" class="font-display text-wordmark text-ink">Happy Days Flower Farm</a>`. **Below sm (640 px)** it is the two-line lockup: `text-wordmark-sm` with `<span class="block">Happy Days</span><span class="block">Flower Farm</span>` (≈ 72 px wide). Width proof at 375 px: lockup 72 + links (Work Sans 13 px: "Flower Bar" ≈ 68, "About" ≈ 34) + compact pill (≈ 71) + three 16 px gaps = 293 px ≤ 343 px available. At 320 px with `gap-3` (12 px): 281 ≤ 288 px. No hamburger; the ux-spec's `<details>` "Menu" fallback should not be needed — the evaluator checks the 320 px screenshot.
- Nav links: `font-body text-[0.8125rem] md:text-small font-medium text-ink hover:text-brand-ink hover:underline underline-offset-4`, `min-h-tap` via padding.
- Inquire: primary (green) button, compact variant below md, full below lg? — keep compact below md only. Label **Inquire** (the spec's nav label). Stays primary while `#inquire` is in view (designer's call: no style change).

### 6.12 Footer

`bg-surface border-t border-line py-section-sm`. Row 1 (md: flex between): wordmark `text-wordmark-lg` (one line); links list "Instagram · Facebook · Email" as `text-small font-medium text-ink` with 44 px hit areas, `gap-6`. Row 2: "Greensburg, Pennsylvania" and "Serving Pittsburgh + Western Pennsylvania" `text-small text-ink-muted` (two lines on mobile, one line with a middle dot on md). Row 3 `mt-8 pt-6 border-t border-line`: tagline "Unique Floral Experiences • Locally Grown + Thoughtfully Sourced" `text-small text-ink-muted`; `© Happy Days Flower Farm` right-aligned on md (plan §8 Q17). No social icons in V1 — text links; icons come with the brand pass.

### 6.13 FAQ item (`<details>`)

Container `max-w-faq mx-auto divide-y divide-line border-y border-line mt-stack`. Each:

```html
<details class="group">
  <summary class="list-none cursor-pointer flex items-start justify-between gap-6 py-5 min-h-tap">
    <h3 class="font-display text-h3 text-ink">…question…</h3>
    <svg
      class="shrink-0 mt-1.5 size-5 text-brand transition-transform duration-200 ease-soft group-open:rotate-45"
      …
    >
      +
    </svg>
  </summary>
  <p class="text-body text-ink-muted pb-6 max-w-prose-copy">…answer…</p>
</details>
```

The marker is a plus that rotates to an × when open (inline 20 px SVG, two strokes, `currentColor`); `summary::-webkit-details-marker { display:none }`. Whole summary row is the hit area. Answers are always in the DOM. `name="faq"` optional per ux-spec. Under reduced motion the rotation is instant (global rule in `index.css`).

### 6.14 Skip link

`<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 bg-brand text-on-brand rounded-field px-4 py-3 font-medium">Skip to content</a>`.

### 6.15 Focus ring

Global, from `theme.css` `@layer base`: `outline: 2px solid var(--color-focus); outline-offset: 2px` on `:focus-visible` for links, buttons, fields, summaries. `--color-focus` = brand green; sections/bands with `data-surface="brand"` switch it to warm white. Never remove outlines elsewhere.

---

## 7. Section surfaces (the ≤ 3 rule applied)

| Section          | Surface           | Notes                                                                              |
| ---------------- | ----------------- | ---------------------------------------------------------------------------------- |
| Header           | surface           | hairline on scroll                                                                 |
| Hero             | surface           |                                                                                    |
| Flower Bar Intro | surface           | image `rounded-photo`                                                              |
| How It Works     | surface-alt       | white ground makes the orange numerals read as ink on paper; hairlines above items |
| Packages         | surface           | cards are surface-alt; band is surface-brand                                       |
| Why Happy Days   | surface           | bucket frames                                                                      |
| Gallery          | surface-alt       | photos edge-to-edge; the white ground disappears behind them                       |
| About            | surface           |                                                                                    |
| FAQ              | surface           |                                                                                    |
| Inquiry          | **surface-brand** | form card surface-alt                                                              |
| Footer           | surface           | top hairline; sits below the green section as a light landing                      |

Two cream sections in a row (Hero→Intro, About→FAQ) are fine; alternation is not a goal. Sections never carry their own border unless listed.

---

## 8. Layout notes per section (deltas from ux-spec §4 only)

- **Intro:** image left `md:w-[46%]`, text right; on mobile the image follows the secondary CTA with `mt-10`. Use the same 4:5 rendition as the About slot's rules.
- **Packages:** three cards from md (768 px: 3 × ≥ 224 px, fits with `gap-6`); stack below.
- **Why:** photo trio is a 3-column row at _every_ width (`grid-cols-3 gap-3 sm:gap-6`), each image in a bucket frame at 4:5 (§10) — at 375 px each frame is ≈ 105 × 131 px, which is enough for the three bouquets to read; reasons 2×2 from md beneath.
- **Gallery:** full-bleed (`w-screen` breakout or a `max-w-none` section), `grid-cols-2 lg:grid-cols-4 gap-strip`, all 1:1, radius 0, `aspect-square object-cover`. No captions, no lightbox, no hover.
- **About:** image first on mobile (`rounded-photo`), image left 4:5 on md+.
- **Inquiry:** `data-surface="brand"` on the section; H2 and two paragraphs in `text-on-brand` / `text-on-brand-muted`, centred, `max-w-prose-copy`; form card `mt-stack`.

---

## 9. Photography treatment

Rules: `object-fit: cover` always; explicit `width`/`height`; crop, never stretch; **no overlays, no duotone, no gradient scrims, no text on images** (the hero sign already carries text). Radius per slot below. Source images are all **1152 × 1536 (3:4)**; every crop below is a full-width band of the source, so only the vertical offset matters.

**Focal API for `scripts/build-images.mjs`** (requested in `docs/qa/requests.md`): each slot declares `ratio` and `focalY` (0–1, fraction of source height that should sit at the crop's vertical centre). Crop height `h = round(1152 / ratio)`; `top = clamp(round(focalY × 1536 − h / 2), 0, 1536 − h)`; then `sharp().extract({ left: 0, top, width: 1152, height: h })` before resizing to 480/768/1152 widths. `sharp`'s `position` gravity words (`top` / `centre`) are listed as the nearest fallback.

| Slot      | Image                                                                                           | Ratio                 | Crop (w×h)                                      | `focalY` → `top` | Nearest `position`             | Radius                                                                | What the crop keeps                                                                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------- | ---------------- | ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero ≥ md | `hero-flower-bar`                                                                               | 3:4 (native, no crop) | 1152×1536                                       | —                | —                              | `rounded-hero` on the left corners only; right edge flush to viewport | Whole scene: easel sign, all three tiers, floor                                                                                                                                            |
| Hero < md | `hero-flower-bar`                                                                               | 1:1                   | 1152×1152                                       | 0.57 → 300       | `centre` (≈ 192) is acceptable | `rounded-photo`                                                       | Sign body + all three bucket tiers; trims wall above and floor below                                                                                                                       |
| OG image  | `hero-flower-bar`                                                                               | 1200:630              | 1152×605, then resize to 1200×630 (4 % upscale) | 0.535 → 520      | —                              | —                                                                     | Sign steps 1–4 on the left, top two tiers of buckets on the right; centre the crop at 53.5 % of the source height. When the hero is replaced, re-check that the new sign sits in this band |
| Intro     | `flower-bar-closeup`                                                                            | 4:5                   | 1152×1440                                       | 0.50 → 48        | `centre`                       | `rounded-photo`                                                       | Full stand incl. wheels                                                                                                                                                                    |
| Why 1     | `farm-bouquet-pink-white`                                                                       | 4:5                   | 1152×1440                                       | 0.475 → 10       | `top`                          | bucket frame (§10)                                                    | Whole bouquet; trims most of the forearm                                                                                                                                                   |
| Why 2     | `farm-bouquet-colorful`                                                                         | 4:5                   | 1152×1440                                       | 0.50 → 48        | `centre`                       | bucket frame                                                          | Whole bouquet incl. seed heads                                                                                                                                                             |
| Why 3     | `farm-zinnias` (person holding zinnias — the filename undersells it)                            | 4:5                   | 1152×1440                                       | 0.50 → 48        | `centre`                       | bucket frame                                                          | Face lands at ≈ 38 % of the frame height, zinnias fill the lower half. **Never crop above y = 250 of the source** (hair) — this is the manual face override the ux-spec anticipates        |
| Gallery 1 | `flower-bar-closeup`                                                                            | 1:1                   | 1152×1152                                       | 0.51 → 207       | `centre`                       | 0                                                                     | Stand from top flowers to wheels — different from the Intro rendition, so it does not read as a repeat                                                                                     |
| Gallery 2 | `gallery-event-detail`                                                                          | 1:1                   | 1152×1152                                       | 0.51 → 207       | `centre`                       | 0                                                                     | Arrangement + cookie tray; cupcakes partially                                                                                                                                              |
| Gallery 3 | `gallery-arrangement`                                                                           | 1:1                   | 1152×1152                                       | 0.42 → 74        | `top`                          | 0                                                                     | Flowers + tin lettering; trims the table                                                                                                                                                   |
| Gallery 4 | `gallery-arrangement-outdoor`                                                                   | 1:1                   | 1152×1152                                       | 0.44 → 100       | `top`                          | 0                                                                     | Flowers + tin; trims wicker                                                                                                                                                                |
| About     | `about-bethany-working` (a delphinium vase on brick — no person in frame, despite the filename) | 4:5                   | 1152×1440                                       | 0.49 → 34        | `centre`                       | `rounded-photo`                                                       | Full stems to vase base                                                                                                                                                                    |

Renditions: AVIF + WebP + JPEG at 480 / 768 / 1152 w per plan §3.4; the hero and gallery also want a 2× for the 4-across strip (1152 covers it: 360 px slot × 2 = 720). `sizes`: hero `(min-width: 768px) 52vw, 100vw`; intro/about `(min-width: 768px) 46vw, 100vw`; trio `(min-width: 1024px) 22rem, 30vw`; gallery `(min-width: 1024px) 25vw, 50vw`.

Note for the orchestrator: two filenames are misleading (`farm-zinnias` = owner portrait; `about-bethany-working` = still life). The ux-spec's alt text already describes what is actually in each frame, so nothing needs changing — but the _About_ section will show a vase, not a person, until a new photo is supplied. Flagged in §14.

---

## 10. The signature element — the bucket frame

The Happy Days product is a white rack of twelve buckets, and every bucket is the same shape: a rectangle a little wider at the lip than at the base, with a softened bottom. That silhouette becomes the one non-rectangular shape on the page. The three farm photographs in **Why Happy Days?** are clipped to it and sit in a row, so the section reads as a shelf of the flower bar filled with what the farm grows — the argument of the section ("locally grown, seasonal") made as a picture instead of an icon set. It costs one `<clipPath>` of ~180 bytes inlined once in the app shell, works on portrait sources without any extra crop, degrades to a plain rounded image if `clip-path` is unsupported, and it is not something a template or another florist's site has. It appears **only** there (and as a faint echo in the favicon's rounded square); the hero, intro, about and gallery images stay honest rectangles so the device stays special.

Implementation (engineer, batch 5c):

```html
<!-- once, in App.tsx, before any use -->
<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
  <clipPath id="bucket" clipPathUnits="objectBoundingBox">
    <path d="M.02 0H.98Q1 0 1 .02L.94 .9Q.93 1 .86 1H.14Q.07 1 .06 .9L0 .02Q0 0 .02 0Z" />
  </clipPath>
</svg>
```

```css
/* on each trio <img> or its wrapper */
.bucket {
  clip-path: url(#bucket);
  border-radius: var(--radius-field);
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
```

Taper is 6 % per side (top width 100 %, base 88 %), bottom corners round over the last 10 % of height. `border-radius` is the no-`clip-path` fallback and is otherwise invisible. Do not add a shadow, a "shelf" line, or a label under the frames — the shape is enough.

---

## 11. Motion policy

- **One orchestrated reveal:** the hero on page load. Eyebrow, H1, lead and CTA use `animate-rise` (600 ms, `--ease-soft` = `cubic-bezier(.2,.7,.2,1)`, 12 px rise) with `animation-delay` 0 / 80 / 160 / 240 ms; the hero image uses `animate-fade` (700 ms, no transform — it is the LCP element and must not shift). Total sequence ≈ 0.9 s.
- **No scroll-triggered reveals.** `src/lib/useReveal.ts` is not needed; if the engineer scaffolds it, leave it unused.
- **Micro-interactions only:** button/link colour `transition-colors 150ms`; FAQ marker `transition-transform 200ms`; header hairline `transition-opacity 150ms`. No hover scaling, no parallax, no image zoom.
- **Reduced motion:** `index.css` already zeroes all animations/transitions and disables smooth scroll under `prefers-reduced-motion: reduce`; because the hero animations are declared with `both` fill, elements land in their final state instantly. Nothing else to do.

---

## 12. Wordmark and favicon

**Wordmark (typed, R12):** "Happy Days Flower Farm", Newsreader 500, title case, tracking +0.005 em, `font-optical-sizing: auto`. Header 20 px (≥ sm) / two-line lockup 15 px, leading 1.05 (< sm); footer 24 px. Colour `text-ink`; never green, never uppercase, never letter-spaced beyond 0.01 em (an all-caps tracked serif reads as a law firm). The hero eyebrow repeats the name in `text-eyebrow text-brand` — that is the only place the name is set in the sans.

**Favicon (`public/favicon.svg`, 347 bytes):** a deep-green rounded square (`#435B47`, radius 7/32) holding a warm-white **H** whose two verticals are stems (round caps) and whose crossbar is a single leaf, tilted a few degrees so it grows rather than sits. Checked rasterised at 16 / 32 / 64 / 128 px on light and dark tab bars: the H reads at 16 px, the leaf at 32 px+. Use `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`; a 180 px `apple-touch-icon.png` should be rendered from it by the image script (request logged).

A brand-identity / logo pass is a later phase; the existing logo was deliberately not requested (owner's decision, R12). The wordmark and favicon above are V1 placeholders designed to be replaced without touching layout.

---

## 13. Evaluator rubric (used for `docs/qa/design-review-<batch>.md`)

Score each 1–5; a 5 must be earned; anything ≤ 2 is a blocker.

| Criterion               | 5 looks like                                                                                                                                                                         | 2 looks like                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Fidelity to design-spec | Tokens only; surfaces ≤ 3; CTA variants exactly as §6.1; chip + border only on Social                                                                                                | Ad-hoc hex values, a fourth surface, orange text on cream, shadowed/scaled Social card                                                  |
| Hierarchy               | H1 → H2 → H3 sizes unmistakable at 375 and 1280; one primary CTA per screen; price is the second thing the eye hits on a package card                                                | Bold copy lines compete with H2s; two filled buttons in one view; the chip out-shouts the price                                         |
| Spacing rhythm          | Section padding fluid and equal; heading→content `mt-stack`; consistent card padding; no orphan gaps                                                                                 | Sections of visibly different heights for no reason; cramped cards; 100 px+ dead space on mobile                                        |
| Typography              | Newsreader with optical sizing (thin hairlines at 76 px, sturdier at 26 px); Work Sans body 16–17 px, 60–75 ch measure; prices tabular and aligned across cards; no faux bold/italic | System fallback showing; heading weight ≥ 600; measure > 85 ch; misaligned prices; uppercase H2s                                        |
| Photography crops       | Every slot matches §9 (face intact in Why 3; hero flush right; gallery squares edge-to-edge; bucket frames on the trio only)                                                         | Stretched images, hero not touching the edge, heads cropped, bucket shape leaking to other slots, any overlay                           |
| Mobile quality          | 320/375: no horizontal scroll, header on one row with Inquire visible, cards stacked, form single-column, 44 px hit areas, LCP image within first scroll                             | Wrapped header, hamburger, tiny tap targets, 1:1 hero missing, gallery with side padding                                                |
| "Reads as templated?"   | Someone who has seen a hundred AI landing pages would not file this with them: the bucket trio, the serif/sans pairing and the restraint register as choices                         | Generic hero + three-feature-cards + gradient buttons feel; icon sets; decorative blobs; a "trusted by" strip; scroll-reveal everywhere |

Each review lists blockers / should-fixes / nits with the screenshot path and the exact token, spacing or type change.

---

## 14. Deviations from ux-spec, open items, requests

1. **Why trio ratio:** ux-spec §4.5 suggests 1:1 squares on mobile; this spec uses 4:5 bucket frames at all widths (three still fit in a row at 375 px). Reason: the frames are the signature element and squares crop the bouquets.
2. **Form card surface:** ux-spec §4.9 says "cream form card"; this spec uses `surface-alt` (warm white) — cream is the page ground and would sit flat on green; warm white also gives input borders their measured 3.73:1.
3. **Packages CTA placement:** the spec's single "Inquire About Your Date" lives on the Custom band (ux-spec §2 allows either); it is not repeated under the band.
4. **Footnote italic:** the spec formats the packages footnote in italics; no italic font files are shipped (≈ 130 KB saved), so it is set roman, small, muted. Copy unchanged. Orchestrator to confirm.
5. **Image filenames vs. content:** `farm-zinnias.jpeg` is a portrait of the owner with zinnias; `about-bethany-working.jpeg` is a delphinium vase on brick. Alt text in ux-spec §7 already matches reality; the About section will show a still life. Flag to Sean/Bethany in the handoff if an "at work" photo was intended.
6. Requests to the engineer are in `docs/qa/requests.md` (font imports, focal-crop API, apple-touch-icon, `theme-color`, bucket clipPath placement).
