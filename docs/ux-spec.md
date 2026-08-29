# UX spec — Happy Days Flower Farm V1

|               |                                                                                                                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Author**    | `ux-strategist` (Phase 2a)                                                                                                                                                                                                                                                                               |
| **Date**      | 2026-08-29                                                                                                                                                                                                                                                                                               |
| **Sources**   | `website-spec.md` (approved copy + structure), `owner-answers.md` (approved FAQ, event types, service area, socials), `claude-code-prompt.md`, `websites.md` (owner taste notes), `visual-reference.png` (direction, not a comp), the 9 supplied images, build plan §2 (R1–R12), §3.2, Phase 2a, Phase 5 |
| **Copy rule** | Every string quoted below from the two approved sources is verbatim. The only copy authored in this document is form status/validation messaging (§6) and image alt text (§7).                                                                                                                           |
| **Consumers** | `ui-designer` (design-spec), `frontend-engineer` (batches 5a–5e), `seo-aeo-specialist` (heading outline, FAQ order), Phase 6 reviewers (§10 checklist)                                                                                                                                                   |

The page has one job: turn a visitor — usually arriving from Instagram on a phone — into an event inquiry. Two buyers matter equally: a business buying a guest/client/employee experience, and an individual planning a shower, fundraiser or celebration. Everything below is measured against "can either buyer find price, guest range, what's included and how to inquire fast, and does the page honour what the owner said she likes and dislikes."

Typographic marks: transcribe from the source files, not from this document. `website-spec.md` uses straight apostrophes (`Let's`, `We'll`) and em dashes (`01 — Choose Your Flower Bar`); `owner-answers.md` uses curly apostrophes (`What’s`, `can’t`, `We’ll`, `That’s`) and en dashes in ranges (`3–4 weeks`). Keep each as its source has it — `check:copy` compares byte-for-byte.

---

## 0. Reference-site research (what the taste notes actually point at)

All four URLs in `websites.md` fetched successfully on 2026-08-29 (text extraction; CSS colours could not be verified visually, see the caveat under Roots to Petals).

| Site                                                            | What the owner said                                                                                                                                                                                                  | Concrete pattern observed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Carry into Happy Days?                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Roots to Petals** (`/pages/event-flowers-flower-bars`)        | "Love the moody colors", "Easy to use", "Hate how many items on the drop down feels like too many", "I don't like how the events page has the contact form at the bottom would rather have it as a clickable button" | Header has **10 top-level items** plus a dropdown; five **edge-to-edge full-width photographs**; a top announcement bar; inquiry form sits mid-to-lower on the page with Name / Email / Phone / Event Date / Event Location / Number of Attendees / Budget / Additional Details and a "Submit inquiry" button; no CTA button in the hero. The fetch reports a white background and dark text, so the "moody" quality is most likely the garden-style photography (deep tones) rather than page chrome — could not confirm visually. | **Yes:** edge-to-edge photography; a short inquiry form. **No:** the 10-item nav (R4 fixes this at 3 items, no dropdowns) and the buried form (R3: persistent Inquire button in a sticky header). Moodiness comes from photography + the spec's charcoal/deep-green, not from dark sections.                                                                                                                                                          |
| **Blossom Flower Bar** (home)                                   | "First impression is the best. Love this colors and the clean look. Like the fonts. The way the page is layed out. Pictures. Everything"                                                                             | Light cream/white ground, dark text; **photography-driven**; **short headline lines dominate, minimal running paragraphs**; full-bleed hero photo with headline; card grid of six equal feature cards below the hero; alternating full-width and split (image + text) sections; no announcement bar; no contact form on the page (newsletter only); nav is 6 items with dropdowns.                                                                                                                                                  | **Yes:** the whole rhythm — big photo hero, short scannable headlines, split image/text sections, a card grid, generous white space, few words per block. This is the closest match to the spec's "elevated, warm, approachable" and to `visual-reference.png`. **No:** the dropdown nav.                                                                                                                                                             |
| **Flair Flower Bar** (`/pages/rent-a-flower-bar…`)              | "The soft pink is nice, picture spanning the page to the edge. I hate how much text there is that's not broken up at all."                                                                                           | Full-bleed edge-to-edge hero photo; ~15–20 substantial paragraphs on one page; multi-level dropdowns (6–12 items each); pricing tiers; an inquiry form mid-to-lower page ("Submit Inquiry"); Instagram feed embed.                                                                                                                                                                                                                                                                                                                  | **Yes:** edge-to-edge hero image; soft pink is already in the spec as restrained lavender. **No:** paragraph count. Rule for our page: no section carries more than the spec's own paragraphs, and every paragraph is separated by a heading, image or card. The FAQ — the most text-dense section — is collapsed by default (§1).                                                                                                                    |
| **Garden Muses Studio** (`/pages/pop-up-floral-bar-corporate…`) | "Banner at the top is nice. I like the clean look of this one. Not a fan of the colors"                                                                                                                              | Top announcement bar (workshop promo with a link); hero with headline and **two CTAs — "Request a Quote" and "View Packages" — both anchor links**, primary repeated down the page linking to `#inquire`; short lines and sectioned blocks; numbered 4-step "How It Works"; package cards; inquiry form mid-to-lower; FAQ **after** the form; footer with contact details.                                                                                                                                                          | **Yes:** the primary + secondary anchor-CTA pair is exactly our "Inquire About Your Date" / "View Flower Bar Packages" model; numbered steps; a clean sectioned page. **Partly:** the "banner at the top" she liked is a promo bar — R8 rules out a promo banner in V1; the sticky header with the Inquire button gives the same "always-present strip at the top" feel without a promo to fill it. **No:** their colours (spec palette governs, R9). |

Net: the owner likes photography-first pages with little text, a light clean ground, few nav items, and a CTA that is always reachable. The spec, the visual reference and R3/R4/R8 already encode this; this document makes the rules concrete.

---

## 1. Section order and the job of each section

Anchor ids are the ones the engineer should use (§3). Sections are `<section aria-labelledby="…">` with the spec's H2 as the label; the header and footer are `<header>`/`<footer>` landmarks; the whole content column is `<main>`.

| #   | Section (spec name)                                | `id`            | Job (one line)                                                                                                                                                         | Grounding                                              |
| --- | -------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 0   | Header                                             | —               | Say who this is and keep "Inquire" one tap away at every scroll position.                                                                                              | R3, R4, R8; Roots to Petals dislike                    |
| 1   | Hero                                               | `#top`          | In one screen: business name, what it is ("Unique Floral Experiences"), for whom (businesses, events and gatherings across Western Pennsylvania), and the primary CTA. | Spec "Primary conversion"; Blossom first impression    |
| 2   | Flower Bar Introduction                            | `#flower-bar`   | Explain the product in four short paragraphs and route the "what does it cost?" visitor to Packages.                                                                   | Spec; R5                                               |
| 3   | How It Works                                       | `#how-it-works` | Remove the "how much work is this for me?" objection with four numbered steps.                                                                                         | Spec; Garden Muses numbered steps                      |
| 4   | Pricing — "Flower Bar Packages"                    | `#packages`     | Answer price, guest range and what's included in one glance; the primary CTA sits directly under the cards.                                                            | Spec; both personas' first question (§8)               |
| 5   | Why Happy Days?                                    | `#why`          | Differentiate (local, seasonal, turnkey, more than a favor) with the three farm photos doing most of the talking.                                                      | Spec; taste notes: pictures over text                  |
| 6   | Gallery — "A Little Happiness, One Stem at a Time" | `#gallery`      | Show the experience at real events; 4 images, no lightbox, no oversized portfolio.                                                                                     | Spec "4–6 images is enough for V1"                     |
| 7   | About — "Grown in Greensburg. Made to Be Shared."  | `#about`        | Give the business a place and a story (trust), in the only personal copy permitted.                                                                                    | Spec; R10                                              |
| 8   | **FAQ** (new in V1, 8 approved Q&As)               | `#faq`          | Clear the last practical objections — lead time, travel, weather, what's included — immediately before the ask.                                                        | `owner-answers.md` §3a; plan §1 "FAQ section is in V1" |
| 9   | Inquiry — "Let's Bring the Flower Bar to You"      | `#inquire`      | The conversion. Form, nothing else competing.                                                                                                                          | Spec "Primary conversion"; R3                          |
| 10  | Footer                                             | —               | Name, place, service area, three contact routes (Instagram, Facebook, Email), tagline.                                                                                 | Spec; R7                                               |

### 1.1 FAQ placement — decision: between About and Inquiry (position 8)

Why here and not between Packages and Why Happy Days:

- **Objection handling belongs right before the ask.** Six of the eight questions are pre-commitment practicalities ("How far in advance should we book?", "How far do you travel? Is there a travel fee?", "Can the flower bar be outdoors? What if it rains?", "What happens after the event?", "Do guests need any experience arranging flowers?", "Can the flowers match our event or brand colors?"). A visitor who has scrolled to the FAQ is qualifying; the form should be the next thing they see. Garden Muses puts FAQ _after_ the form, which means a visitor with a travel question has to scroll past the form and back up — worse for us.
- **Keeps the top half photography-led.** The FAQ is the most text-dense section on the page. Placing it at position 4–5 would put a text block between the pricing cards and the three farm photos, the opposite of what the owner liked on Blossom and disliked on Flair.
- **Packages already answers the two "what's included / how many stems" questions inline** (the intro paragraph and footnote are the same facts), so the FAQ does not need to sit near Packages to be useful.
- The `seo-aeo-specialist` owns the _order_ of the eight questions; this placement holds regardless of order.

### 1.2 FAQ interaction model — decision: native `<details>`/`<summary>`, collapsed by default

- Each Q&A is a `<details>` whose `<summary>` contains the question as an `<h3>` (valid: `summary`'s content model allows one heading element). The answer is a `<p>` inside the `<details>`. **All answers are in the DOM on first render** whether open or closed, so crawlers and answer engines get the full text and the `FAQPage` JSON-LD mirrors visible text exactly.
- Collapsed by default on all widths. Rationale: the visitor's task at this point is _scanning the questions_ for the one that applies to them ("Is there a travel fee?"). Eight questions as a list fit one phone screen; eight expanded answers (~330 words) do not, and would read as the "wall of text" the owner explicitly dislikes. Native disclosure is keyboard-accessible (Enter/Space on the summary), needs no JS, and announces expanded state to screen readers for free.
- Optional: give every `<details>` the same `name="faq"` attribute so opening one closes the others (exclusive accordion; supported in current Chrome, Safari 17.2+, Firefox 130+; degrades gracefully to independent toggles elsewhere). Not required.
- Do not use a JS accordion or hide answers with `display:none` on a non-`details` element — that is what would risk answer-engine extraction.
- The designer styles the summary (chevron, brand-green focus ring, comfortable ≥ 44 px tap target, full-width hit area — the whole summary row, not just the marker).
- **Heading wording for this section is not in the approved copy.** Neither source supplies an FAQ section title. Recommended: `Frequently Asked Questions` (plain, entity-clear for answer engines). Listed as an open question in the summary; `seo-aeo-specialist` may propose an alternative under "needs approval".

---

## 2. CTA strategy

| CTA       | Label (verbatim)             | Style                                             | Target                 | Where it appears                                                                                                                                        |
| --------- | ---------------------------- | ------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary   | **Inquire About Your Date**  | Filled button (the one primary style on the page) | scrolls to `#inquire`  | Hero; under the Packages cards (the spec places it there); header button (label may be shortened to **Inquire** — the spec's own nav label — for width) |
| Secondary | **View Flower Bar Packages** | Outline/text-link button, visibly subordinate     | scrolls to `#packages` | End of Flower Bar Introduction only (spec)                                                                                                              |

Rules:

- Only "Inquire About Your Date" gets the primary fill (R5). Two filled buttons on one screen split attention; the secondary must be clearly the quieter one.
- Custom Floral Experience card/band: the spec puts a single "Inquire About Your Date" CTA under the whole Packages section, and the visual reference adds an "Inquire" button on the dark custom-quote band. Either is acceptable, but the band button must be the _same_ primary CTA and label ("Inquire About Your Date" or the nav's "Inquire"), not a new string.
- Anchor scrolling: `html { scroll-behavior: smooth }` gated behind `@media (prefers-reduced-motion: no-preference)`; every anchor target gets `scroll-margin-top: calc(var(--header-h) + 0.5rem)` so the sticky header never covers the section heading. `--header-h` is a single token the designer sets (≈ 56 px mobile, ≈ 72 px desktop).
- After an anchor jump, move focus to the target section (`tabindex="-1"` on the section, `focus({ preventScroll: true })`) so keyboard and screen-reader users land where the eye does. For the Inquire button specifically, focus the first field (`Name`) instead — the visitor came to fill the form.
- CTAs are real `<a href="#inquire">` links (not buttons) so they work without JS, show in the accessibility tree as navigation, and are copyable.

### 2.1 Sticky header on mobile (R3/R8)

- The header is `position: sticky; top: 0` at all widths. On mobile it is compact: wordmark left, nav links + **Inquire** button right, total height ≈ 56 px. No bottom bar, no floating button — a persistent header button is enough and avoids covering form fields on the very screen it points to.
- The Inquire button in the header is the _only_ element that needs to stay visually prominent while scrolling; the wordmark and the two text links can be quieter. Thumb reach: right-aligned, within the top-right thumb zone that Instagram users already use for "share/menu" gestures; acceptable because it is a low-frequency single tap, not a repeated control.
- When the form section (`#inquire`) is in view, the header Inquire button may switch to a non-primary style (or stay; designer's call) — do not hide it, since "Send another" and errors need the header stable.
- Header background: cream with a subtle bottom hairline once the page has scrolled ≥ 8 px; opaque (no blur) so the wordmark keeps contrast over photography.

---

## 3. Navigation

Exactly three items (R4), in this order and with these labels (verbatim from the spec's "Nav"):

| Label      | Element                            | Target                                                                                                                                                 |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Flower Bar | `<a>` text link                    | `#flower-bar` (the Introduction section — the first place the product is explained; Packages is one scroll further and reachable by the secondary CTA) |
| About      | `<a>` text link                    | `#about`                                                                                                                                               |
| Inquire    | `<a>` styled as the primary button | `#inquire`                                                                                                                                             |

- Wordmark **Happy Days Flower Farm** (typed, R12) links to `#top` (the hero). It is not a heading element — the H1 lives in the hero.
- No dropdowns, no "Home", no social icons in the header (footer only).
- **Mobile-first: inline compact nav, no hamburger.** At ≥ 360 px all three fit on one row beside a wordmark set at a small size (the wordmark may drop to two short lines or reduce tracking; it must not truncate). The `ui-designer` proves the 375 px layout in the design spec.
- **320 px fallback only:** if the row cannot fit at 320 px without wrapping the Inquire button, collapse _Flower Bar_ and _About_ behind a native `<details>` disclosure labelled **Menu** (icon + visually-hidden text is fine) and keep the Inquire button visible. Never hide Inquire behind the menu. This is the plan's R4 rule made concrete: hamburger is the fallback, not the default.
- Skip link ("Skip to content") as the first focusable element, targeting `<main>`; visible on focus.
- Full anchor id list for the page: `#top`, `#flower-bar`, `#how-it-works`, `#packages`, `#why`, `#gallery`, `#about`, `#faq`, `#inquire`.

---

## 4. Mobile-first layout rules per section

Breakpoints assumed from the plan's QA widths: 375 (phone), 768 (tablet), 1280/1536 (desktop). "Stack" = single column, full content width.

### 4.1 Hero

- DOM and mobile order: **eyebrow → H1 → paragraph → primary CTA → image.** Eyebrow `Happy Days Flower Farm` (small caps, `<p>`), H1 `Unique Floral Experiences` (R2), paragraph verbatim: "Locally grown and sourced floral experiences for businesses, events and gatherings across Western Pennsylvania.", CTA **Inquire About Your Date**.
- Why text first on mobile: the H1 and CTA land above the fold on a 375×667 viewport; the image (LCP element, eager + preloaded) follows within the first scroll. The current hero photo is temporary and carries third-party signage (spec: "will later be replaced"), which is another reason not to make it the only thing in the first viewport.
- Image on mobile: crop to 4:3 or 1:1 (`object-position` favouring the flower stand on the right half of the source) so it does not consume a whole screen; from 768 px up, the visual reference's split — text left (≈ 45%), portrait 3:4 image right, flush to the right viewport edge ("picture spanning the page to the edge", Flair/Roots to Petals). No text over the image (spec: avoid text overlays on busy images).
- Business name must be visible in both the header wordmark and the hero eyebrow (spec SEO starter).

### 4.2 Flower Bar Introduction

- Mobile: H2, then the four paragraphs in spec order, the bold line as `<p><strong>`, then the secondary CTA; image `flower-bar-closeup.jpeg` **below** the text on mobile, **beside** it (image left, text right — alternating with the hero's image-right) from 768 px.
- Line length 60–75 characters; each paragraph is its own `<p>` — never merge them (Flair dislike).

### 4.3 How It Works

- Four steps as an ordered list (`<ol>`) because the content is a sequence; each `<li>` contains an `<h3>` step title and one `<p>`.
- Mobile: single column stack, number large and in the accent colour, title, text. Tablet (768–1279): **2×2 grid**. Desktop: 4 across (visual reference).
- Closing line "Simple for you. Memorable for them." centred below the grid as `<p><strong>`.

### 4.4 Flower Bar Packages

- Order: H2 → intro paragraph → three cards → Custom Floral Experience → primary CTA → footnote (spec order). The footnote is the last thing in the section (`<p><small>` or a muted `<p>`, still ≥ 4.5:1 contrast).
- Mobile: cards **stack vertically** in spec order (Classic, Social, Full), full width, each card showing name (H3), guest range, price, one-sentence description — **all four facts visible without tapping**. Tablet: 3 across if ≥ 768 px allows ≥ 220 px per card, otherwise 2 + 1 with Social first in the second row is _not_ acceptable (it would demote it) — prefer stacking until 3-across fits. Desktop: 3 across, equal height.
- Custom Floral Experience: a full-width band under the cards (visual reference: dark green band with the "75+ guests — Custom quote" line and an Inquire button). On mobile it stacks like a fourth card. Its heading is an H3 like the others.
- Prices in tabular numerals; guest range directly beneath the name so name → range → price reads top-down as a scan path.

### 4.5 Why Happy Days?

- Mobile: H2 → three farm photos as a horizontal strip (three squares in a row, small gutters — they are portrait sources, crop to 1:1 with `attention` positioning) → four reasons stacked (H3 + `<p>`). Tablet/desktop: photos in a row, reasons in a **2×2** grid beneath (visual reference).
- The `farm-zinnias.jpeg` image includes a person; keep it in this trio as the spec suggests, uncropped through the face (Phase 4 has a manual position override for faces).

### 4.6 Gallery

- H2 → paragraph → bold line (`<p><strong>`) → 4 images (spec's suggested list: `flower-bar-closeup`, `gallery-event-detail`, `gallery-arrangement`, `gallery-arrangement-outdoor`).
- Mobile: 2×2 grid of squares, edge-to-edge (no side padding — the "spanning the page to the edge" note) with a 4–8 px gutter. Tablet/desktop: the visual reference's mosaic (one tall 3:4 + two stacked + one tall) or a plain 4-across row; designer's call, no lightbox, no captions (alt text does the describing).
- `flower-bar-closeup.jpeg` is used twice on the page (Intro and Gallery, per spec). Different crop in each slot (Intro: portrait; Gallery: square) so it does not read as a repeat.

### 4.7 About

- Mobile: **image first, then text** — the only section where the image leads on mobile, because the About section's job is warmth/trust and the photo carries it; also breaks the text-first rhythm of the preceding sections. Desktop: image left (4:5), text right (visual reference).
- H2 + two paragraphs verbatim. Nothing else — no bio bullets, no name caption (R10).

### 4.8 FAQ

- H2 → list of eight `<details>` (§1.2). Single column at every width; max-width equal to the text measure (~ 65ch) and centred on desktop. No two-column FAQ — it breaks reading order for the exclusive-accordion behaviour and screen readers.

### 4.9 Inquiry

- H2 → two intro paragraphs → form. **Single column at every width**, including desktop: nine fields in a two-column grid (as the visual reference shows) reads as denser and produces a zig-zag tab order; one column with a 560–640 px max width keeps label → input → error reading vertical and matches the field order exactly (Baymard/GOV.UK single-column guidance). The designer may pair _only_ Event Date + Estimated Number of Guests side by side from 768 px if it looks better; everything else stays stacked.
- Section surface: deep green background with a cream form card (visual reference) — this is one of the ≤ 3 surface colours on the page and gives the conversion section the "moody" note without darkening anything else.
- The submit button is full-width on mobile, natural width on desktop, always below the last field (never sticky over fields).

### 4.10 Footer

- Mobile: three stacked lines (name, "Greensburg, Pennsylvania", "Serving Pittsburgh + Western Pennsylvania"), then the three links **Instagram | Facebook | Email** as tappable ≥ 44 px targets, then the tagline line. Desktop: name/location left, links right, tagline below.
- Email link is `mailto:hello@happydaysflowers.com`; no phone, no street address, no hours (decided; `owner-answers.md` §3c).

---

## 5. "Most Popular" treatment — The Social Flower Bar

Owner's words: "The Social Flower Bar can receive subtle 'Most Popular' emphasis." Spec: "A small 'Most Popular' treatment is appropriate." Developer prompt: "subtle visual emphasis without making the other packages look inferior."

Do:

- A small chip/pill reading **Most Popular** (this exact phrase is in the spec) above or at the top edge of the Social card, in lavender or soft mint with charcoal text (≥ 4.5:1), small caps or uppercase tracked, ≤ 12–13 px.
- One additional differentiator only — e.g. a 1–1.5 px deep-green border or a slightly stronger shadow. Not both plus a colour fill.
- Same card size, padding, type sizes, price size and CTA parity as the other two. On mobile, where cards stack, the chip alone is enough; the border is optional.
- Keep the spec order (Classic → Social → Full): the emphasised card is naturally the centre card on desktop, which is the conventional "recommended" position and needs no reordering.

Don't:

- No scale transform, no taller card, no different background colour for the whole card, no "Best value" or other invented words, no strike-through/anchored pricing, no dimming or reduced opacity on Classic/Full. The other two packages sell real events (Classic is the entry point for showers and small client events); they must look like full-price, fully-supported choices.
- No badge on the Custom Floral Experience band.

Principle: social proof via a label steers the undecided buyer without penalising a decided one (the "default effect" — the cue should make choosing easier, not make alternatives feel wrong).

---

## 6. Inquiry form UX

### 6.1 Fields — order exactly as the spec

| #   | Label (verbatim from spec)    | Required | Element / `type`                         | `inputmode` | `autocomplete` | Notes                                                                                                                     |
| --- | ----------------------------- | -------- | ---------------------------------------- | ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Name                          | required | `<input type="text">`                    | —           | `name`         | `maxlength` 120                                                                                                           |
| 2   | Business / Organization       | optional | `<input type="text">`                    | —           | `organization` | Important for the corporate buyer; keep it second so a planner sees "you speak to businesses" immediately (spec order)    |
| 3   | Email                         | required | `<input type="email">`                   | `email`     | `email`        | `spellcheck="false"`, `autocapitalize="off"`                                                                              |
| 4   | Phone                         | optional | `<input type="tel">`                     | `tel`       | `tel`          | No pattern enforcement (international/format variety); light sanity check only (≥ 7 digits when non-empty)                |
| 5   | Event Date                    | required | `<input type="date">`                    | —           | `off`          | `min` = today (local); native picker on mobile. If a browser lacks a date picker it degrades to text; accept `YYYY-MM-DD` |
| 6   | Event Location                | required | `<input type="text">`                    | —           | `off`          | Venue or town is fine; free text; `maxlength` 160                                                                         |
| 7   | Type of Event                 | required | `<select>`                               | —           | `off`          | Options in §6.2, verbatim; "Other" reveals a text input                                                                   |
| 8   | Estimated Number of Guests    | required | `<input type="number" min="1" step="1">` | `numeric`   | `off`          | Whole number ≥ 1; no upper bound (Custom is 75+)                                                                          |
| 9   | Anything else we should know? | optional | `<textarea rows="4">`                    | —           | `off`          | `maxlength` 2000; no character counter needed                                                                             |

- Labels are always visible, above the field (spec: "do not rely on placeholder-only forms"). No placeholders at all — they lower contrast and disappear on focus.
- Required marking: an asterisk after the label text (`<span aria-hidden="true">*</span>`) plus `required` and `aria-required="true"` on the control; a single line above the first field reads **Required fields are marked *** (authored string, §6.4). Optional fields carry no suffix — the spec's own labels do not include "(optional)", and adding it would change approved label text.
- Honeypot, elapsed-time, interaction and nonce signals per plan §3.2 are invisible to the user and never block submission.
- Submit button label: **Send My Inquiry** (verbatim). Type `submit`; Enter in any single-line field submits.

### 6.2 Type of Event — `<select>` options (verbatim from `owner-answers.md` §2a, in the owner's order)

```
Client appreciation
Employee or corporate event
Open house
Grand opening
Fundraiser
Shower or private celebration
Community or hospitality event
Other
```

- The select's first option is an empty-valued, disabled placeholder option so the visitor must choose (no default selection). Its text is the authored string "Choose one" (§6.4).
- Choosing **Other** reveals a text input directly beneath the select ("with a box to type in"): label **Tell us the type of event** (authored, §6.4), `type="text"`, `maxlength` 120, becomes required while Other is selected. It is rendered with `hidden` toggled (not `display:none` via inline style) and receives focus when revealed. On submit the payload's `eventType` is `Other: <text>`.
- This list is the allowlist the server validates against (plan §3.2); "Other" is the escape hatch for the individual host whose event does not fit (§8).

### 6.3 States

| State                                                      | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idle**                                                   | All fields empty except any browser autofill. No validation messages shown.                                                                                                                                                                                                                                                                                                                                                                                           |
| **Field-level validation**                                 | Validate on `blur` after the field has been touched, and on submit. Message appears directly below the field, in the error colour with an icon, linked via `aria-describedby`; the field gets `aria-invalid="true"` and an error border. Messages clear as soon as the field becomes valid. Use `novalidate` on the form and run the same rules in JS so messaging is consistent across browsers; native constraint attributes stay on the inputs for no-JS fallback. |
| **Submit with errors**                                     | Do not send. Show the summary line (§6.4 "Check the highlighted fields…") in the `role="alert"` region above the submit button, then **move focus to the first invalid field** (DOM order). Keep everything the visitor typed.                                                                                                                                                                                                                                        |
| **Submitting**                                             | Button disabled, label changes to **Sending…** (with the ellipsis character `…`), `aria-busy="true"` on the form; fields stay visible and read-only. Status region announces "Sending…". Double-submit prevented.                                                                                                                                                                                                                                                     |
| **Success** (only on a confirmed `{ ok: true }`)           | Replace the form (not the whole section — H2 and intro stay) with a confirmation panel: heading, the approved auto-reply paragraph with `{name}` substituted, and a **Send another inquiry** link that restores an empty form and focuses `Name`. Focus moves to the confirmation heading. Announced via the `role="status"` region. Scroll position is left where it is.                                                                                             |
| **Error** (network, CORS, 5xx, `unconfigured`, `rejected`) | Keep the form and every value intact. Show the error panel above the submit button: heading, one sentence, and the prefilled `mailto:` link **Or email us directly**. Button re-enabled with its original label. Focus moves to the error heading. Announced via `role="alert"`. Never say the submission "looked like spam" (quarantined submissions return `ok: true` and show success).                                                                            |

Live regions: one `role="status" aria-live="polite"` container for submitting/success, one `role="alert"` (implicit `aria-live="assertive"`) container for the error summary and the error panel. Both exist in the DOM from first render (empty) so screen readers register them.

### 6.4 Exact strings (the only authored copy besides alt text)

Sentence case, active voice, specific. The engineer copies these as-is; nothing else in the form is new copy.

| Key                             | Where                                                                                                       | String                                                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form.requiredNote`             | Above first field                                                                                           | Required fields are marked *                                                                                                                                                                                   |
| `form.selectPlaceholder`        | First (disabled) option of Type of Event                                                                    | Choose one                                                                                                                                                                                                     |
| `form.otherLabel`               | Label of the text box revealed by "Other"                                                                   | Tell us the type of event                                                                                                                                                                                      |
| `error.name.required`           | Name                                                                                                        | Enter your name.                                                                                                                                                                                               |
| `error.email.required`          | Email                                                                                                       | Enter your email address.                                                                                                                                                                                      |
| `error.email.invalid`           | Email                                                                                                       | Enter a valid email address, like name@example.com.                                                                                                                                                            |
| `error.phone.invalid`           | Phone (only when non-empty)                                                                                 | Enter a valid phone number, or leave this blank.                                                                                                                                                               |
| `error.eventDate.required`      | Event Date                                                                                                  | Enter your event date.                                                                                                                                                                                         |
| `error.eventDate.past`          | Event Date                                                                                                  | Choose a date that hasn't passed yet.                                                                                                                                                                          |
| `error.eventLocation.required`  | Event Location                                                                                              | Enter where your event will be held.                                                                                                                                                                           |
| `error.eventType.required`      | Type of Event                                                                                               | Choose a type of event.                                                                                                                                                                                        |
| `error.eventTypeOther.required` | "Other" text box                                                                                            | Tell us what type of event you're planning.                                                                                                                                                                    |
| `error.guestCount.required`     | Estimated Number of Guests                                                                                  | Enter your estimated number of guests.                                                                                                                                                                         |
| `error.guestCount.invalid`      | Estimated Number of Guests                                                                                  | Enter a whole number of guests, like 40.                                                                                                                                                                       |
| `error.summary`                 | `role="alert"` above the button, on submit with invalid fields                                              | Check the highlighted fields and try again.                                                                                                                                                                    |
| `status.submitting`             | Button label + status region                                                                                | Sending…                                                                                                                                                                                                       |
| `success.heading`               | Confirmation heading (`<h3>`)                                                                               | Thanks, {name}! We received your inquiry.                                                                                                                                                                      |
| `success.body`                  | Confirmation body — **verbatim approved auto-reply** from `owner-answers.md` §2b, with `{name}` substituted | Thanks, {name}! We received your inquiry and can’t wait to hear more about what you’re planning. We’ll be in touch within 2 business days to talk through your event and help you choose the right flower bar. |
| `success.again`                 | Link under confirmation                                                                                     | Send another inquiry                                                                                                                                                                                           |
| `error.heading`                 | Error panel heading (`<h3>`)                                                                                | We couldn't send your inquiry.                                                                                                                                                                                 |
| `error.body`                    | Error panel body                                                                                            | Your details are still here. Try again, or email us directly.                                                                                                                                                  |
| `error.mailto`                  | Prefilled `mailto:` link text                                                                               | Or email us directly                                                                                                                                                                                           |

Notes on the success copy: the on-screen confirmation reuses the approved auto-reply paragraph so the visitor reads the same words on screen (and in the auto-reply, if the inbox rule outside the site sends one — decisions D19); the heading repeats its first sentence so the panel has a heading for focus/announcement without introducing a second message. If the orchestrator prefers no repetition, drop the heading's second sentence to **Thanks, {name}!** — either is acceptable. Use the visitor's `Name` field value as typed; if empty (cannot happen after validation) fall back to "Thanks! We received your inquiry."

### 6.5 Prefilled `mailto:` for the error state

`mailto:hello@happydaysflowers.com` with URL-encoded `subject` and `body`:

- Subject: `Flower bar inquiry — {name}`
- Body (one field per line, labels verbatim, blank optional fields omitted):

```
Name: {name}
Business / Organization: {organization}
Email: {email}
Phone: {phone}
Event Date: {eventDate}
Event Location: {eventLocation}
Type of Event: {eventType}
Estimated Number of Guests: {guestCount}
Anything else we should know?: {notes}
```

Keep the body under ~1,500 characters (truncate `notes` if needed) so it opens reliably in mobile mail clients. The same link is the whole UI when `provider === 'mailto'`.

---

## 7. Alt text for all 9 images

Descriptive and specific to what is in the frame; no names (R10), no keyword stuffing, no "image of". Each ≤ ~150 characters where possible. The hero photo's easel sign carries third-party wording and the image is temporary (spec), so the alt describes the sign's function, not its text. Filenames are the originals; the optimised outputs keep the same keys.

| Filename                           | Used in                          | Alt text                                                                                                                                                                       |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hero-flower-bar.jpeg`             | Hero                             | Pop-up flower bar set up indoors: a white three-tier stand of buckets filled with greenery, daisies, roses and baby's breath beside an easel sign with bouquet-building steps. |
| `flower-bar-closeup.jpeg`          | Flower Bar Introduction; Gallery | Close-up of the flower bar stand with twelve white buckets holding eucalyptus, pink spray roses, hypericum berries, yellow daisies and baby's breath.                          |
| `farm-bouquet-pink-white.jpeg`     | Why Happy Days?                  | A hand holding a freshly picked bouquet of magenta yarrow and white feverfew daisies above a green lawn.                                                                       |
| `farm-bouquet-colorful.jpeg`       | Why Happy Days?                  | A hand holding a bright mixed bouquet of yellow zinnias, red-and-gold coreopsis, purple dianthus and white button flowers in a garden.                                         |
| `farm-zinnias.jpeg`                | Why Happy Days?                  | A smiling woman in a blue shirt holding an armful of coral, pink and magenta zinnias in a farm field.                                                                          |
| `gallery-event-detail.jpeg`        | Gallery                          | Event dessert table with flower-shaped iced cookies and cupcakes in front of a galvanized tin of blush roses, purple daisies and yellow blooms.                                |
| `gallery-arrangement.jpeg`         | Gallery                          | Loose garden-style arrangement of purple daisies, yellow blooms, yarrow and airy greenery in a galvanized tin on a white-draped table with a pink backdrop.                    |
| `gallery-arrangement-outdoor.jpeg` | Gallery                          | Galvanized tin arrangement of blush roses, purple daisies, yellow daisies and baby's breath on a wicker table beside a sheer curtain.                                          |
| `about-still-life.jpeg`            | About                            | Glass cylinder vase of moss with tall blue delphinium, yellow craspedia, red carnations, pink spray roses and chamomile against a brick wall.                                  |

- Where `flower-bar-closeup.jpeg` appears the second time (Gallery), the same alt is fine; do not mark it decorative — it is content in both places.
- Never put the business name, "Greensburg", "Pittsburgh" or "flower bar rental" into alt text for ranking purposes; the surrounding copy already carries the entities.
- The OG image (generated from the hero) needs no alt; `og:image:alt` may reuse the hero alt.

---

## 8. Persona review

### 8.1 Corporate / event-planner buyer (client appreciation, employee event, open house, grand opening)

| Needs                       | Where they find it                                                                                                                                                            | Scroll depth on a 375 px phone (approx.) |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Is this for businesses?     | Hero paragraph ("for businesses, events and gatherings"); Intro paragraph 3 ("client appreciation, employee events, open houses, grand openings"); Social package description | Screen 1                                 |
| Price + guest range         | Packages cards — name, range, price all visible without tapping                                                                                                               | Screens 4–5 (after Intro + How It Works) |
| What's included             | Packages intro paragraph (verbatim list); FAQ "What’s included with a Happy Days Flower Bar?"                                                                                 | Screen 4; FAQ near the end               |
| Travel / service area       | Hero + footer ("Western Pennsylvania", "Serving Pittsburgh + Western Pennsylvania"); FAQ "How far do you travel? Is there a travel fee?"                                      | Screen 1; FAQ                            |
| Brand colours               | FAQ "Can the flowers match our event or brand colors?"                                                                                                                        | FAQ                                      |
| Lead time                   | FAQ "How far in advance should we book?"                                                                                                                                      | FAQ                                      |
| How to inquire              | Header Inquire button (always visible); hero CTA; CTA under Packages; form                                                                                                    | Any screen                               |
| Can I give my company name? | Field 2 "Business / Organization"                                                                                                                                             | Form                                     |

What could slow this buyer:

- Price is roughly four screens down. Mitigation already in the structure: the secondary CTA **View Flower Bar Packages** at the end of the Intro jumps straight there, and How It Works is short (four one-liners). Do not add anything between Hero and Packages beyond what the spec has.
- A planner often has a _flexible_ date; Event Date is required (spec). Acceptable — the field is a date, the planner picks the target date, and "Anything else we should know?" absorbs "flexible ±1 week". No change requested; noted for the Phase 6 review to watch drop-off at that field once analytics exist.
- No phone number to call (decided, V1). The 2-business-day promise in the auto-reply/confirmation sets the expectation; keep it visible in the success state.

### 8.2 Individual host (shower, fundraiser, private celebration)

| Needs                                                | Where they find it                                                                                                                                                                                            | Scroll depth             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Is this for a shower/fundraiser, not just corporate? | Intro paragraph 3 ("showers, fundraisers and special gatherings"); Classic package description ("smaller gatherings… celebrations"); the "Shower or private celebration" and "Fundraiser" options in the form | Screen 2; Packages; form |
| Price for a small group                              | The Classic Flower Bar — "Up to 25 guests", "$895" — first card, so first in the mobile stack                                                                                                                 | Screen 4                 |
| Do guests need skills? What do they take home?       | How It Works step 04; Gallery bold line ("Your guests choose. They create. They leave with flowers in hand."); FAQ "Do guests need any experience arranging flowers?"; FAQ "What happens after the event?"    | Screen 3; Gallery; FAQ   |
| Outdoors / rain                                      | FAQ "Can the flower bar be outdoors? What if it rains?"                                                                                                                                                       | FAQ                      |
| Who am I dealing with?                               | About section + photos                                                                                                                                                                                        | Screen 7–8               |
| How to inquire                                       | Same as above                                                                                                                                                                                                 | Any screen               |

What could slow this buyer:

- "Business / Organization" as the second field could make a private host feel the form is for companies. It is optional and unmarked; the mitigation is the `*` convention (only required fields marked) and keeping the field visually identical to the others. Do **not** reorder — the spec fixes the order.
- Guest count for a shower is a guess; the label already says "Estimated" and validation accepts any whole number ≥ 1. No range picker, no minimum beyond 1.
- The word "corporate" appears in the Social card and Why section; the individual host's reassurance is the Classic card, the Intro list and the "Shower or private celebration" option — all present, none need adding.

### 8.3 Both

- Both personas reach the form via the header button in one tap from anywhere; the form asks nine questions, six required, no account, no file upload, no budget field (Roots to Petals asks for budget; we deliberately do not — the packages _are_ the budget conversation).
- Both should see the confirmation's "within 2 business days" line — the only time expectation on the page.

---

## 9. SEO structure constraints for the page

Owned jointly with `seo-aeo-specialist` (they own FAQ order, JSON-LD and meta; this section fixes the heading outline so the copy stays verbatim).

- **Exactly one H1:** `Unique Floral Experiences` (spec "Suggested H1"; R2). The hero eyebrow `Happy Days Flower Farm` is a `<p>` (small caps), rendered _before_ the H1 in the DOM. The header wordmark is a link, not a heading.
- **One H2 per section, spec wording verbatim:**

| Section                 | H2                                                                              |
| ----------------------- | ------------------------------------------------------------------------------- |
| Flower Bar Introduction | A Flower Bar, Brought to You                                                    |
| How It Works            | How It Works                                                                    |
| Pricing                 | Flower Bar Packages                                                             |
| Why Happy Days          | Why Happy Days?                                                                 |
| Gallery                 | A Little Happiness, One Stem at a Time                                          |
| About                   | Grown in Greensburg. Made to Be Shared.                                         |
| FAQ                     | _(not in approved copy — proposed: Frequently Asked Questions; needs approval)_ |
| Inquiry                 | Let's Bring the Flower Bar to You                                               |

- **H3s** (all verbatim):
  - How It Works step titles: `01 — Choose Your Flower Bar`, `02 — We Prepare Everything`, `03 — We Deliver & Style`, `04 — Your Guests Create` (the number may be wrapped in a `<span>` for styling; it stays inside the H3 text so the outline reads as a sequence).
  - Package names: `The Classic Flower Bar`, `The Social Flower Bar`, `The Full Flower Bar`, `Custom Floral Experience`.
  - Why reasons: `Locally Grown + Thoughtfully Sourced`, `Designed Around the Season`, `Beautifully Simple`, `More Than a Favor`.
  - FAQ questions (inside `<summary>`), e.g. `What’s included with a Happy Days Flower Bar?` — the eight verbatim questions.
  - Form success/error panel headings (§6.4) are H3s inside the Inquiry section.
- **Not headings:** the bold taglines ("You host. We bring the flowers. Your guests create something beautiful.", "Simple for you. Memorable for them.", "Your guests choose. They create. They leave with flowers in hand."), the guest-range/price lines in cards (`<p>` with `<strong>`), the "Most Popular" chip, the footer name and tagline.
- No H4+ anywhere. No heading in the header or footer.
- Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main>`, `<footer>`; each section `aria-labelledby` its H2; the form `aria-labelledby` the Inquiry H2.
- The FAQ answers are visible DOM text (§1.2) so the `FAQPage` JSON-LD mirrors on-page content; package name/range/price are plain text in the cards for the `OfferCatalog`.
- Image alts per §7; filenames unchanged (they are already descriptive).

---

## 10. What the owner asked for → how the design honours it (Phase 6 checklist)

Each row is verifiable from screenshots and DOM. Reuse in `docs/qa/ux-review.md`.

| #   | She said (`websites.md` / answers)                                                                      | Design response                                                                                                                                                                                                    | How to verify in Phase 6                                                                            |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 1   | "Love the moody colors" (Roots to Petals)                                                               | Charcoal text, deep-green brand colour, deep-green Inquiry section and custom-quote band; photography with deep tones; cream ground keeps the "clean" half of the brief. No section-colour rainbow (≤ 3 surfaces). | Count distinct section backgrounds ≤ 3; Inquiry section is the dark one.                            |
| 2   | "Easy to use"                                                                                           | Single page, three nav items, one primary CTA, nine-field form, no account.                                                                                                                                        | Tab through the page: header → skip link → sections → form; no dead ends.                           |
| 3   | "Hate how many items on the drop down"                                                                  | Nav is exactly Flower Bar · About · Inquire; no dropdowns; no hamburger unless 320 px forces it.                                                                                                                   | Screenshot 375: three items inline. Screenshot 320: Inquire still visible.                          |
| 4   | "would rather have it as a clickable button" (than a form at the bottom)                                | Sticky header Inquire button at every width; hero and Packages CTAs; form remains last but is always one tap away.                                                                                                 | Scroll to each section at 375 px: Inquire button visible in every screenshot.                       |
| 5   | "Love this colors and the clean look… fonts… layout… pictures… everything" (Blossom)                    | Photography-first sections, alternating split layouts, short headline lines, editorial serif + clean sans, generous whitespace.                                                                                    | Designer rubric "does it read as templated?"; no paragraph > spec length.                           |
| 6   | "picture spanning the page to the edge" (Flair)                                                         | Hero image flush to the right edge on desktop; mobile gallery grid edge-to-edge.                                                                                                                                   | Screenshot 1280: hero image touches the viewport edge. Screenshot 375: gallery has no side padding. |
| 7   | "I hate how much text there is that's not broken up at all"                                             | Every paragraph is its own `<p>`; sections alternate text with images/cards; FAQ collapsed by default.                                                                                                             | No block of running text taller than one phone screen at 375 px.                                    |
| 8   | "Banner at the top is nice" (Garden Muses)                                                              | Persistent top strip = sticky header (R8: no promo banner in V1; a promo bar slot can be added later).                                                                                                             | Header sticky at all widths; nothing else fixed.                                                    |
| 9   | "Not a fan of the colors" (Garden Muses)                                                                | Spec palette only; no additional hues introduced.                                                                                                                                                                  | Token audit: colours used ⊆ spec palette.                                                           |
| 10  | "The Social Flower Bar can receive subtle 'Most Popular' emphasis"                                      | Chip + one differentiator; equal card size and type; no dimming of other packages (§5).                                                                                                                            | Screenshot Packages at 375 and 1280: three cards same size; only one chip.                          |
| 11  | Event types list (8, verbatim), "Other (with a box to type in)"                                         | `<select>` with her 8 options in her order; Other reveals a text box.                                                                                                                                              | DOM check of option text; select Other → text input appears and is required.                        |
| 12  | Auto-reply text (verbatim)                                                                              | Reused as the on-screen confirmation body.                                                                                                                                                                         | Success state string equals §6.4 `success.body`.                                                    |
| 13  | No public deposit/payment FAQ; no home address, personal phone, retail hours, ecommerce, online booking | None of these appear anywhere on the page, in alt text, JSON-LD or footer.                                                                                                                                         | grep the built page for "deposit", "payment", a phone pattern, a street pattern.                    |
| 14  | Service area "approximately one hour or 50 miles from Greensburg"                                       | Footer and hero use the spec wording; the FAQ travel answer carries the 50-mile detail verbatim.                                                                                                                   | FAQ answer text matches `owner-answers.md`.                                                         |
| 15  | Prefers the typed wordmark for V1                                                                       | Header is a typographic wordmark; no logo file requested.                                                                                                                                                          | No logo raster in `public/`.                                                                        |
| 16  | Both buyers must feel addressed (spec)                                                                  | Intro list names both business and private occasions; Classic (small) and Social (corporate) cards both fully styled; form has Business / Organization _and_ "Shower or private celebration".                      | Persona walk-through (§8) at 375 px: price + guest range + how to inquire reachable in < 10 s.      |
