# QA report — Phase 6 verification

|                 |                                                                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**        | 2026-08-29                                                                                                                                                                                                |
| **Reviewer**    | `qa-reviewer` (adversarial verification: mechanical, accessibility, copy fidelity, keyboard, performance)                                                                                                 |
| **Commit**      | `12eb99a` on `main`, working tree clean (`git status --porcelain` empty before and after this review)                                                                                                     |
| **Scope**       | Plan §3.4 budgets, §7 Definition of Done, reconciliations R2/R3/R4/R5/R10. Deep SEO/AEO, UX strategy and visual design belong to the three concurrent reviewers; SEO here is the light sanity check only. |
| **Screenshots** | `docs/qa/screenshots/phase6/{320,375,375-scrolled,768,1280,1536}.png`, `docs/qa/screenshots/form/*.png`                                                                                                   |
| **Verdict**     | **No blockers.** 4 should-fixes, 6 nits. The site meets every §3.4 budget once measured against the build it will actually ship as.                                                                       |

---

## 1. Budget summary (plan §3.4)

| Budget                                                                    | Measured                                                                                                                                                           | Result                          | Evidence                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------- |
| Lighthouse mobile — Performance ≥ 90                                      | **93**                                                                                                                                                             | **pass**                        | `npm run qa:lighthouse`                                                          |
| Lighthouse mobile — Accessibility 100                                     | **100**                                                                                                                                                            | **pass**                        | `npm run qa:lighthouse`                                                          |
| Lighthouse mobile — Best Practices ≥ 95                                   | **100**                                                                                                                                                            | **pass**                        | `npm run qa:lighthouse`                                                          |
| Lighthouse mobile — SEO 100                                               | **66** preview / **100** canonical                                                                                                                                 | **pass (canonical)** — see SF-1 | preview `noindex` per D5; `is-crawlable` is the only failing audit (weight 4.04) |
| Total JS ≤ 90 KB gz                                                       | **71.5 KB gz** (73,171 B; 240.1 KB raw)                                                                                                                            | **pass**                        | `gzip -c dist/assets/index-*.js \| wc -c`                                        |
| CSS (no stated budget)                                                    | 7.8 KB gz (36.3 KB raw)                                                                                                                                            | —                               | same method                                                                      |
| Fonts: 2 variable families, `font-display: swap`, latin subset            | 2 families; **6 × `font-display:swap`**, 0 without; 3 `unicode-range` subsets per family so only latin transfers (**178 KB**: Newsreader 132 KB + Work Sans 50 KB) | **pass** (see N-3)              | `grep -o "font-display:[a-z]*" dist/assets/index-*.css` → `6 font-display:swap`  |
| Largest hero AVIF ≤ 160 KB (D13)                                          | **137.3 KB** (`hero-flower-bar-1152.avif`)                                                                                                                         | **pass**                        | `ls -l public/images/hero*`                                                      |
| Hero 768 px JPEG ≤ 160 KB (D13)                                           | **122.1 KB**                                                                                                                                                       | **pass**                        | same                                                                             |
| axe: zero violations                                                      | **0 at 375 px, 0 at 1280 px**                                                                                                                                      | **pass**                        | `npm run qa:a11y`                                                                |
| LCP element = hero, eager + `fetchpriority=high` + preload                | `loading=eager fetchpriority=high decoding=async`; two `<link rel=preload as=image>` (landscape ≥768, square <768) with `imagesrcset`/`imagesizes`                 | **pass**                        | DOM dump; `grep '<link rel="preload"' dist/index.html`                           |
| All other images lazy + async + explicit w/h                              | 9 of 10 `<img>` `loading=lazy decoding=async`, all 10 have `width`/`height`                                                                                        | **pass**                        | DOM dump                                                                         |
| CLS                                                                       | **0**                                                                                                                                                              | **pass**                        | Lighthouse `cumulative-layout-shift`                                             |
| Keyboard: full tab order, visible focus, skip link                        | 32 stops, every one with a visible ring; skip link is stop 1                                                                                                       | **pass**                        | §4 below                                                                         |
| Focus ring uses brand green                                               | `outline: solid 2px rgb(67, 91, 71)` = `#435B47`; switches to `rgb(255,253,249)` on the green band                                                                 | **pass**                        | §4 below                                                                         |
| `prefers-reduced-motion`: reveal/hover motion disabled                    | all animations/transitions collapse to `1e-05s`; end state `opacity:1, transform:none`                                                                             | **pass**                        | §5 below                                                                         |
| Meta: title, description, canonical, OG/Twitter, JSON-LD, sitemap, robots | all present; canonical emitted in the canonical build only (deliberate, `src/seo/meta.ts:55-59`)                                                                   | **pass**                        | §6 below                                                                         |
| No horizontal overflow at 320/375/768/1280/1536                           | `scrollWidth == innerWidth` at all five                                                                                                                            | **pass**                        | `npm run qa:screens`                                                             |
| Console errors / page errors / failed requests on load                    | **none**                                                                                                                                                           | **pass**                        | Playwright `console`/`pageerror`/`requestfailed` listeners                       |
| Copy traceable to the two approved sources                                | **116 of 122** rendered strings verbatim after D3 normalisation; the 6 exceptions are all authored UI microcopy accounted for by ux-spec §6.4 / D6 / D8            | **pass**                        | §3 below                                                                         |
| `git ls-files assets-src` empty                                           | empty                                                                                                                                                              | **pass**                        | read-only `git ls-files`                                                         |
| No `dist/`, screenshots, `lighthouse.json` or visual reference tracked    | none tracked (all in `.gitignore`)                                                                                                                                 | **pass**                        | `git ls-files \| grep -E "^dist/\|screenshots/\|lighthouse.json"` → empty        |
| No stakeholder-private information (R10)                                  | **0** occurrences of the owner's first name anywhere in the repo (tracked _and_ untracked); no street address, no personal phone, no brief-provenance notes        | **pass**                        | §7 below                                                                         |

### Command output as run

```
$ npm run check -- --allow-todos
--- typecheck ---   --- lint ---
--- check:config ---
check-config: 1 unresolved placeholder(s) (--allow-todos):
  src/config/site.ts:23  TODO_APPS_SCRIPT_EXEC_URL       <- expected until P0.5
--- build ---
dist/assets/index-DhkxIzOb.css   36.34 kB │ gzip:  8.04 kB
dist/assets/index-rfvp2Ckj.js   240.12 kB │ gzip: 74.02 kB
--- check:seo ---  check-seo: OK - head, JSON-LD and indexability are correct [preview (no public/CNAME)].
--- check:copy --- check-copy: llms.txt 12/12 approved string(s) present.
                   check-copy: 105/105 strings rendered.
check: all steps passed.

$ npm run qa:screens -- --label phase6
  ok 320px (scrollWidth 320)   ok 375px   ok 768px   ok 1280px   ok 1536px
OK: no horizontal overflow.

$ npm run qa:a11y
  ok 375px - 0 violations
  ok 1280px - 0 violations
OK: zero axe violations.

$ npm run qa:lighthouse                     # preview build, no public/CNAME
  ok performance      93 (min 90)
  ok accessibility   100 (min 100)
  ok best-practices  100 (min 95)
  x  seo              66 (min 100)          <- is-crawlable only; expected per D5
FAIL: 1 category(ies) below budget.

$ touch public/CNAME && npm run build && npm run qa:lighthouse && rm public/CNAME && npm run build
  ok performance      93 (min 90)
  ok accessibility   100 (min 100)
  ok best-practices  100 (min 95)
  ok seo             100 (min 100)
OK: all Lighthouse budgets met.

$ npm run qa:form
qa:form: 30/30 assertions passed            # idle, invalid, slow, ok, quarantine, reject, error, nonce-blocked

$ BASE_PATH=/happy-days-flower-bar-site/ npm run check -- --allow-todos   # exact CI configuration
check: all steps passed.
```

Lighthouse metric detail (mobile, throttled): FCP 2.3 s · **LCP 2.9 s** · TBT 0 ms · **CLS 0** · SI 2.3 s. Only `is-crawlable` fails outright; every other sub-100 audit is a metric score, not a failed assertion.

Repo state was restored after the canonical measurement: `public/CNAME` absent, `dist/` rebuilt as the preview build (`<meta name="robots" content="noindex,nofollow">`), `git status --porcelain` empty.

---

## 2. Findings

### Blockers

**None.**

---

### Should-fix

**SF-1 — `npm run qa` can never exit 0 on the shipping preview build, so DoD §7.1 cannot be satisfied as written.**
`scripts/lighthouse.sh:56-66` hard-fails when SEO < 100. D5 makes the preview build `noindex,nofollow`, so Lighthouse's `is-crawlable` audit scores 0 (category weight 4.04 of 12) and SEO lands at **66**. `npm run qa` therefore exits 1 today and will keep doing so until `public/CNAME` exists — the gate is red for a reason the build intends.
_Verified against the real target:_ with a temporary `public/CNAME` and a rebuild, `<meta name="robots" content="index,follow">` and `<link rel="canonical" href="https://happydaysflowers.com/">` are emitted and Lighthouse returns **93 / 100 / 100 / 100** — every §3.4 budget met. The CNAME was removed and the preview build restored.
_Suggested fix (owner: `frontend-engineer` or `release-engineer`):_ in `scripts/lighthouse.sh`, drop the SEO threshold to the preview-attainable score (or skip `is-crawlable`) when `public/CNAME` is absent, and keep 100 when it is present. Otherwise the release gate trains everyone to ignore a red run.
_Evidence:_ both runs pasted above; `docs/qa/lighthouse.json` (gitignored) holds the preview run.

**SF-2 — The inquiry success panel says "Thanks, {name}!" twice, contradicting decision D9.**
D9 chose the "no repetition" option explicitly. In practice the heading is `formStatus.successHeading` = `'Thanks, {name}!'` (`src/content/formCopy.ts:47`) and the body immediately beneath is `autoReply.body`, which _opens with the same three words_ — `'Thanks, {name}! We received your inquiry and can't wait…'` (`src/content/copy.ts:284`), composed at `src/sections/Inquiry.tsx:273-276`. The visitor reads their own name twice in two adjacent lines on the page's single conversion moment.
_Evidence:_ `docs/qa/screenshots/form/success.png` — heading "Thanks, Dana Whitfield!" directly above "Thanks, Dana Whitfield! We received your inquiry and can't wait…".
_Constraint:_ the auto-reply paragraph is owner-approved text and must not be trimmed. The fix therefore has to be the heading — or D9 has to be amended to record that the repetition is accepted.

**SF-3 — `public/404.html` links to `/`, which is the wrong host path for the whole pre-cutover period.**
`public/404.html:39` is `<a href="/">Return to the home page</a>`. Until `public/CNAME` exists the deploy workflow builds with `BASE_PATH=/happy-days-flower-bar-site/` (`.github/workflows/deploy.yml:46-49`), so the site lives at `https://seanpaulconnelly.github.io/happy-days-flower-bar-site/` and that link resolves to `https://seanpaulconnelly.github.io/` — a different site. DoD §7.3 names the project-pages URL as the live target, so this is broken on the URL the DoD is written against. It self-corrects at DNS cutover when `base` becomes `/`.
_Suggested fix:_ make the href relative (`./`) or have the build rewrite it alongside the other base-path substitutions.

**SF-4 — The QA scripts silently audit a foreign server when port 4173 is already in use.**
`scripts/lib/preview.mjs:62-67` spawns `vite preview --strictPort` with `stdio: 'ignore'` and never inspects the child's exit code; `waitForPort` then succeeds against whatever process already holds 4173.
_Reproduced during this review:_ with a stale `vite preview` (default base) left running from an earlier step, `BASE_PATH=/happy-days-flower-bar-site/ npm run check:copy` reported `check-copy: 0/105 strings rendered` and **failed**. With port 4173 free, the identical command reported `105/105` and passed. The failure mode is symmetric — a stale server from an _older_ build would produce a false green on `check:copy`, `qa:a11y` and `qa:screens` with no warning at all.
_Suggested fix:_ fail fast if the spawned child exits before the port responds, or probe 4173 first and refuse to run against a server this script did not start.

---

### Nits

**N-1 — Footer `© Happy Days Flower Farm` is derived copy that no approved source or decision covers.**
`src/sections/Footer.tsx:14` builds it from `footer.lines[0]`. The spec's footer block is five lines and does not include a copyright notice; D6 covers the 404 message and the form status strings, D8 covers the FAQ heading — neither covers this. It is trivially defensible, but the project rule is that every string is either approved or logged. Either add it to `docs/qa/decisions.md` or drop it.

**N-2 — Two rendered images share identical alt text.**
`flower-bar-closeup` fills both the Flower Bar Intro and the Gallery slot (D10 keeps the spec's slot mapping), so the same 25-word alt from `src/content/images.ts:41` is announced twice. A screen-reader user hears "Close-up of the flower bar stand with twelve white buckets…" in two different sections. Consider a second, slot-specific alt for the gallery instance.

**N-3 — No font preload; 178 KB of fonts is the heaviest thing on first paint.**
`design-spec.md:160` planned `<link rel="preload" as="font" crossorigin>` for the two latin `.woff2` files and marked it "not mandatory". It is not implemented — `dist/index.html` has image preloads only — so the fonts are discovered only after the CSS parses. Newsreader latin ships the two-axis `opsz` build at **132 KB** (Work Sans latin 50 KB), against FCP 2.3 s / LCP 2.9 s. This is **inside budget** (Performance 93, and `font-optical-sizing: auto` in `theme.css:197` genuinely uses the axis), so no action is required — recording it because `design-spec.md:147` asks the QA report to name the escape hatch: switching to `@fontsource-variable/newsreader/wght.css` (≈60 KB, no `opsz`) is the lever if Performance ever drops below 90.

**N-4 — Error-state microcopy repeats "email us directly" in three lines.**
`src/content/formCopy.ts:52-53`: body "Your details are still here. Try again, or email us directly." sits directly above a link labelled "Or email us directly". Screenshot `docs/qa/screenshots/form/error.png`.

**N-5 — The native date input contributes four tab stops, the last without a visible ring.**
Tab stops 21–24 are all `#inquiry-eventDate`: Chromium's mm / dd / yyyy segments plus the calendar-picker button, and the picker button computes `outline: none`. This is the browser's own shadow control, not authored markup — no action, logged so it is not re-raised as a focus-visibility regression.

**N-6 — 320 px is the tightest point in the header.**
The two-line wordmark's second line ("Flower Farm") sits ≈11 px from "Flower Bar" in the nav. No overflow at any width (`scrollWidth 320`), and this was already adjudicated as requests **Q8** / design nit 5a-11 (the reviewer's 20 px assumption was wrong; the real gutter is 11 px). Recorded for continuity only.
_Evidence:_ `docs/qa/screenshots/phase6/320.png`.

---

## 3. Copy fidelity

Method: the rendered DOM (all `<details>` forced open, plus every `<option>`) was normalised per **D3** — `---`→`—`, `--`→`–`, straight→curly apostrophes, markdown emphasis and line-break backslashes stripped, whitespace and case collapsed — and every resulting string was required to appear in the concatenation of `website-spec.md` and the owner's answers. **116 of 122 matched verbatim.** The six that did not are all authored interface text with a written home:

| String                                           | Sanctioned by                                             |
| ------------------------------------------------ | --------------------------------------------------------- |
| `Skip to content`                                | accessibility utility (plan §3.4 skip-link requirement)   |
| `Frequently Asked Questions`                     | **D8** (flagged for the owner's optional review)          |
| `Required fields are marked *`                   | ux-spec §6.4 (`formCopy.requiredNote`)                    |
| `Choose one` (×2 — visible label and `<option>`) | ux-spec §6.2/§6.4 (`formCopy.selectPlaceholder`)          |
| `Leave this field empty`                         | off-screen honeypot label, `src/sections/Inquiry.tsx:543` |

Plus `© Happy Days Flower Farm`, which normalises to an approved phrase and so passed the automated check — raised manually as **N-1**.

Item-by-item, all verbatim, **no word-level differences found**:

- **Prices and guest ranges** — `$895` / `Up to 25 guests`, `$1,495` / `26–50 guests`, `$1,995` / `51–75 guests`, `75+ guests — Custom quote`. The three card ranges are set uppercase by CSS `text-transform`; the underlying strings are the spec's sentence case.
- **Packages footnote** — "Packages include approximately 10 stems per participating guest. Flower varieties and colors vary seasonally based on availability." Set roman, small, muted per **D11**.
- **All 8 FAQ Q&As** — read out of the collapsed `<details>` via the DOM, not the source. All eight questions and answers match owner-answers.md §3a word for word. Display order is 1, 4, 3, 2, 5, 7, 8, 6 (seo-aeo-spec §11.1) — order only, no wording change.
- **8 event-type `<option>`s** — Client appreciation · Employee or corporate event · Open house · Grand opening · Fundraiser · Shower or private celebration · Community or hospitality event · Other. Exactly the eight from §2a, in source order, with the parenthetical "(with a box to type in)" correctly implemented as the conditional `#inquiry-eventTypeOther` field rather than printed as label text.
- **Form labels** — Name · Business / Organization · Email · Phone · Event Date · Event Location · Type of Event · Estimated Number of Guests · Anything else we should know? — all nine, in spec order, all visible above their control (no placeholder-only fields anywhere).
- **Submit label** — "Send My Inquiry".
- **Footer** — the three identity lines, `Instagram | Facebook | Email`, and "Unique Floral Experiences • Locally Grown + Thoughtfully Sourced". The place and service-area lines are joined by a decorative `aria-hidden` "·" at `md`+ and stacked below; the words are unchanged.
- **H1 / eyebrow (R2)** — eyebrow "HAPPY DAYS FLOWER FARM" (small caps), `<h1>` "Unique Floral Experiences". Exactly the R2 reconciliation; the business name also appears in the header wordmark.
- **Nav (R4)** — exactly `Flower Bar · About · Inquire`. No dropdown, no hamburger; the inline nav survives 320 px.
- **R5** — "View Flower Bar Packages" is the outlined secondary style scrolling to `#packages`; "Inquire About Your Date" is the only filled primary. Confirmed in `docs/qa/screenshots/phase6/375-scrolled.png` and `1280.png`.
- **Auto-reply (D9)** — the success-panel body and `integrations/apps-script/Code.gs:35-37` carry byte-identical text, and both match owner-answers.md §2b. (The duplication _within_ the panel is SF-2; the wording itself is correct in both places.)

---

## 4. Keyboard and focus

32 tab stops, in DOM order, every one with a visible ring:

```
 1 A  "Skip to content"            outline solid 2px #435B47 off:2px   box 12,12 154x48  (visible on first Tab)
 2 A  "Happy Days Flower Farm"     #435B47
 3-5 A  Flower Bar / About / Inquire      (5 = #FFFDF9 on the green pill)
 6 A  "Inquire About Your Date"    #FFFDF9      7 A "View Flower Bar Packages"  #34483A
 8 A  "Inquire About Your Date"    #26231F      (Custom band, on orange)
 9-16 SUMMARY  the 8 FAQ questions  #435B47
17-28 the 10 form controls          #FFFDF9      (21-24 are the date input's own segments, N-5)
29 BUTTON "Send My Inquiry"         #26231F
30-32 A  Instagram / Facebook / Email  #435B47
```

- **Skip link** appears on the very first Tab at `12,12`, `154×48` (above the 44 px target minimum), `opacity: 1`, not clipped.
- **Focus ring** is the brand green `#435B47` throughout, swapping to warm white `#FFFDF9` on the deep-green band and charcoal `#26231F` on orange — contrast preserved on every surface.
- **`<details>`** toggles with both Enter (opens) and Space (closes); the summary keeps a visible ring.
- **Enter submits the form** from a text field: with only Name filled, Enter produced the summary line "Check the highlighted fields and try again." and moved focus to `#inquiry-email`, the first invalid control in DOM order.
- **Anchor navigation is not covered by the sticky header** — clicking each nav item leaves the target heading below the header's bottom edge (`#flower-bar` 212 > 72, `#about` 376 > 72, `#inquire` 197 > 72).
- **Honeypot** (`#hd-ref-code`) is `tabIndex={-1}` inside an `aria-hidden="true"` off-screen wrapper, so it never appears in the tab order and never reaches the a11y tree — consistent with axe reporting no `aria-hidden-focus` violation.
- **Conditional "Other" field** is truly hidden: `Field` sets both the `hidden` attribute and `display:none` (`src/components/Field.tsx:56-57`), keeping it out of both the tab order and the a11y tree until "Other" is chosen, at which point focus moves into it.
- **Live regions** — `role="status" aria-live="polite"` and `role="alert"` are both mounted empty from first render (`src/sections/Inquiry.tsx:307, 558`), so a screen reader has registered them before anything is announced. Confirmed by `qa:form` assertion "idle: both live regions present from first render".

Landmarks and outline: one `<h1>`; nine `<section>`s each `aria-labelledby` its own H2; `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`. No heading levels skipped (H1 → H2 → H3 throughout). `<html lang="en">`, `viewport width=device-width, initial-scale=1`.

---

## 5. Reduced motion

Under `prefers-reduced-motion: reduce`, every animation and transition on the page resolves to `1e-05s`, and the animated hero elements settle at `opacity: 1, transform: none` — the reveal is not merely shortened, it lands correctly with nothing left invisible or offset. Verified by comparing computed styles for `.animate-rise` / `.animate-fade` under `reduce` and `no-preference`; both end identical. No hover motion survives.

---

## 6. SEO sanity check (light — deep review belongs to `seo-aeo-specialist`)

- `<title>` "Happy Days Flower Farm | Pop-Up Flower Bars in Western PA" and the spec's meta description are both present and match `website-spec.md`.
- **Canonical**: present in the canonical build (`https://happydaysflowers.com/`); deliberately _absent_ in the preview build, which carries `noindex,nofollow` instead — documented at `src/seo/meta.ts:55-59` ("a cross-host canonical pointing at a domain that is not live yet is a contradictory signal"). Reasonable and intentional.
- **JSON-LD**: exactly one `application/ld+json` block, parses cleanly, 15 `@graph` nodes — `Florist`, `Service`, `OfferCatalog`, `WebSite`, `WebPage`, 9 × `ImageObject`, `FAQPage`. All eight `FAQPage` entities' question and answer text match `copy.ts` byte for byte, i.e. the markup mirrors the visible text. Offers carry `USD 895 / 1495 / 1995` with the custom tier priceless, as intended. `address` is locality/region only, `telephone` is absent, `priceRange` is `$895–$1,995` — no invented business facts.
- Head/JSON-LD are injected at **build time** by the `seoHead()` Vite plugin; React renders no metadata. Confirmed: one `<title>`, one `ld+json`, no duplicates.
- `public/404.html` exists with `<meta name="robots" content="noindex">` and a return link (see SF-3), and `robots.txt`, `sitemap.xml`, `llms.txt` are all present. `check-copy` asserts the 8 FAQ answers and 4 price strings appear verbatim in `llms.txt` (12/12).

---

## 7. Placeholder and privacy scan

- **Placeholders**: the only unresolved token in the repo is `TODO_APPS_SCRIPT_EXEC_URL` at `src/config/site.ts:23`, expected until P0.5. Every other `TODO_` hit is documentation _about_ that mechanism (`README.md`, `CLAUDE.md`, `docs/RELEASE.md`, `scripts/check-config.mjs`, `src/lib/inquiry/index.ts`, `src/seo/jsonld.ts`, the workflow). No `lorem`, no `TBD`, no `FIXME`, no empty `href="#"` anywhere.
- **R10 / D15**: `grep -ril` for the owner's first name returns **zero** hits across the whole working tree (tracked _and_ untracked, excluding `node_modules`/`dist`). No "apartment", "wife", "husband" or "son's". No street address matches any address pattern. No brief-provenance or AI-authorship notes. The About paragraph's "our then 4-year-old son" (`src/content/copy.ts:161`) is approved spec copy and is the only personal content on the page. Public image filenames are impersonal (`about-still-life-*` per D14), and the one photograph containing a person carries impersonal alt text ("A smiling woman in a blue shirt…").
- **Phone numbers**: the only phone-shaped string in the repo is the fictional `724 555 0134` test fixture in `scripts/form-states.mjs:40` (555 is the reserved range). No real number is published anywhere, per owner-answers.md §3c.
- **Repo hygiene**: `git ls-files assets-src` → empty; no `visual-reference` file tracked; no `dist/`, screenshots or `lighthouse.json` tracked. 185 tracked files. Single remote, correct: `https://github.com/seanpaulconnelly/happy-days-flower-bar-site.git`. `git-guard.log` has 8 BLOCK lines, all "could not parse a command containing git/gh" on multi-line commit messages — each was re-issued in a parseable form to the same allowed repo, so nothing was routed around.

---

## 8. Buyer-persona pass (375 px screenshots)

**Corporate / event-planner buyer — can they find price, guest range and how to inquire within one screen of the packages section?** Yes. Each package card carries name → guest range → price → who it suits in a single unbroken block, so `26–50 guests` and `$1,495` are never more than ~90 px apart and both sit above the fold of their own card. The "Most Popular" chip lands on The Social tier, which is also the one whose description names corporate events, client appreciation and open houses — the buyer's own vocabulary. The Custom band directly beneath the three cards answers "we're bigger than 75" and carries the only in-section CTA. The sticky header's "Inquire" pill is present at every scroll position (`375-scrolled.png`), so the route to the form is always one tap. The one thing a corporate buyer must scroll for is the travel/lead-time answer, which lives in the FAQ two sections below — acceptable for V1, and the FAQ order puts "How far do you travel? Is there a travel fee?" second.

**Individual host — can they tell what they get?** Yes. "A Flower Bar, Brought to You" states the offer in one sentence before any price; How It Works gives the four-step sequence with the numerals as the visual anchor; the Packages intro lists everything included (flowers, greenery, 12-bucket display, sleeves, signage, prep, delivery, setup, pickup) _before_ the first price, so the number arrives with context; and the footnote ("approximately 10 stems per participating guest") answers the obvious next question in place. No jargon, no stated minimum other than the guest bands.

**Where both personas are least served:** neither can find out _when_ they need to book without opening the FAQ, and the page never states a deposit or booking mechanism — both deliberate for V1 (no deposit/payment copy, per owner-answers.md §5). Noted, not a finding.

---

## 9. Definition of Done (plan §7)

| #      | Item                                                                                        | Status                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `npm run check` and `npm run qa` green; §3.4 budgets met; zero open blockers in this report | **`check` green; budgets met; zero blockers.** `qa` red only on `is-crawlable` in the preview build — **SF-1**                      |
| 2      | Every string traceable to the spec via `copy.ts` except the ux-spec form status messages    | **met** — 116/122 verbatim, 6 accounted for (§3); one derived string raised as **N-1**                                              |
| 3      | Live on GitHub Pages, green deploy, no git write to another repo                            | **not verifiable here** — Pages enablement is Sean's; guard log shows no worked-around BLOCK, one correct remote                    |
| 4      | Inquiry form works end to end or is one config line away                                    | **met** — `qa:form` 30/30 against the mock; endpoint is the single `TODO_` at `site.ts:23`                                          |
| 5 / 5b | `docs/RELEASE.md` runbook; everything from owner-answers.md built in                        | **met** — FAQ (8), auto-reply, event types (8), socials, service area all present and verbatim; GA4 ID is the only post-launch item |
| 6      | `README.md` + `docs/HANDOFF.md` let a future session change copy/prices/photos quickly      | present; not audited in depth (release-engineer's deliverable)                                                                      |
| 7      | No stakeholder-private information (R10)                                                    | **met** — §7, zero hits                                                                                                             |

---

## 10. Summary

No blockers. The build meets every §3.4 budget: JS 71.5 KB gz against 90, zero axe violations at both widths, zero console errors, zero CLS, no horizontal overflow from 320 to 1536, and Lighthouse 93 / 100 / 100 / 100 when measured against the canonical build it will ship as.

Copy fidelity is the strongest part of this build. 116 of 122 rendered strings are verbatim from the two approved sources, the six exceptions all have a written sanction, and the FAQ JSON-LD mirrors the visible answers byte for byte. Keyboard use is genuinely complete — skip link on first Tab, brand-green ring on all 32 stops with a deliberate swap on the green band, `<details>` on Enter and Space, Enter-to-submit with focus moved to the first invalid field, and anchors that clear the sticky header. Reduced motion resolves to the correct end state rather than merely a shorter one.

Four things should be fixed before release. The release gate itself is the most important: `npm run qa` cannot exit 0 until the CNAME lands, which makes DoD §7.1 unsatisfiable and, worse, teaches the team to ignore a red run (SF-1). The success panel greets the visitor by name twice in adjacent lines, which is exactly what decision D9 set out to avoid (SF-2). The 404 page's home link points off-site for the entire pre-cutover period (SF-3). And the QA harness will happily audit a stale server on port 4173 and report a confident 0/105 — or a confident pass against the wrong build (SF-4); that one bit this review before it was diagnosed.

The six nits are small: an unlogged copyright line, a duplicated alt string, a missing-but-optional font preload, a repeated phrase in the error state, and two items recorded only so they are not re-raised.
