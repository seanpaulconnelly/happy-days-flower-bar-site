# SEO / AEO review — Phase 6

Reviewer: `seo-aeo-specialist`. Run 2026-08-29 against the built site.
Checklist source: `docs/seo-aeo-spec.md` (every section), `docs/qa/decisions.md`
D5 / D8 / D13 / D14 / D15, `docs/qa/requests.md` SEO-1…SEO-7.

**Verdict: PASS.** No blockers. One should-fix (a release-gate script, not the
page), six nits. Nothing on the page or in the markup needs to change to ship.

**What was actually run**

| #   | Artefact                                                                                             | How                                                                             |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `dist/index.html`, preview target, `base=/`                                                          | `npm run build`                                                                 |
| 2   | `dist/index.html`, preview target, `base=/happy-days-flower-bar-site/`                               | `BASE_PATH=/happy-days-flower-bar-site/ npm run build`                          |
| 3   | `dist/index.html`, canonical target                                                                  | `touch public/CNAME` → `npm run build` → reviewed → `rm public/CNAME` → rebuilt |
| 4   | Rendered DOM (headings, landmarks, `<details>`, images, anchors, full text)                          | throwaway Playwright script against `npx vite preview`                          |
| 5   | Lighthouse SEO, preview target                                                                       | existing `docs/qa/lighthouse.json`                                              |
| 6   | Lighthouse SEO, canonical target                                                                     | `npx lighthouse --only-categories=seo` against a temporary canonical build      |
| 7   | `check-seo` on both branches, incl. a deliberate negative (canonical `dist/` + no CNAME → must fail) | `node scripts/check-seo.mjs`                                                    |
| 8   | FAQ text: `copy.ts` → DOM → JSON-LD → `answers-from-bethany.md`                                      | node script, exact string compare                                               |

`git status --short` is empty; the working tree is exactly as found (`public/CNAME`
was created and removed twice, `dist/` is gitignored and was left in the default
preview state).

---

## 1. Summary table

| #   | Item                                                                                                                      | Spec          | Status                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Heading outline: one H1, H2 per section verbatim, H3s                                                                     | §4            | **PASS**                                                                                          |
| 2   | FAQ heading "Frequently Asked Questions"                                                                                  | §4, D8        | **PASS**                                                                                          |
| 3   | Graph shape: 15 nodes, all `@id`s on the mode's origin, all cross-refs resolve                                            | §5            | **PASS**                                                                                          |
| 4   | `Florist`: address locality/region/country only; no `telephone`/hours/rating/review/`geo`                                 | §5.1, §5.8    | **PASS**                                                                                          |
| 5   | `areaServed`: `GeoCircle` 80467 m @ Greensburg centroid + `City` Pittsburgh + `AdministrativeArea` Western PA, both nodes | §5.2          | **PASS**                                                                                          |
| 6   | `sameAs` (Instagram + Facebook), `email`, `priceRange`                                                                    | §5.1          | **PASS** (nit N4)                                                                                 |
| 7   | `image` = nine 1152 w JPEGs with `width`/`height`/`caption`                                                               | §5.7          | **PASS** (nit N3)                                                                                 |
| 8   | `Service` + `OfferCatalog`: 4 offers, 3 priced, `eligibleQuantity` on all 4                                               | §5.3          | **PASS**                                                                                          |
| 9   | `WebSite` / `WebPage`                                                                                                     | §5.4, §5.5    | **PASS**                                                                                          |
| 10  | `FAQPage`: 8 Q&As, byte-identical to the DOM, in §11.1 order                                                              | §5.6, §11.3   | **PASS**                                                                                          |
| 11  | Rich-Results/SDTT expectations (required + recommended properties)                                                        | §5            | **PASS** — warnings only, all deliberate (§2.3)                                                   |
| 12  | `<title>` / `<meta name="description">` = the approved strings                                                            | §3            | **PASS**                                                                                          |
| 13  | Canonical + `robots` per deploy target                                                                                    | §6, D5        | **PASS**                                                                                          |
| 14  | OG / Twitter: absolute `og:image`, dimensions, alt, `summary_large_image`                                                 | §6            | **PASS**                                                                                          |
| 15  | `theme-color`, `lang`                                                                                                     | §6            | **PASS** (nit N7)                                                                                 |
| 16  | `robots.txt`: AI crawlers allowed, `Sitemap:` line                                                                        | §7.1          | **PASS**                                                                                          |
| 17  | `sitemap.xml`: one URL, sensible `lastmod`                                                                                | §7.2          | **PASS**                                                                                          |
| 18  | `llms.txt`: approved content, drift check covers what SEO-7 asked                                                         | §7.3          | **PASS** (nits N1, N2)                                                                            |
| 19  | Image filenames descriptive + impersonal; alts from ux-spec §7                                                            | §12, D14, D15 | **PASS** (nit N8)                                                                                 |
| 20  | Hero preload present and matching the served AVIF                                                                         | §9            | **PASS**                                                                                          |
| 21  | Internal anchors: nav/CTA texts and targets                                                                               | §4            | **PASS**                                                                                          |
| 22  | Answer-engine extraction pass                                                                                             | §14           | **PASS** — 5/5 answerable from approved copy                                                      |
| 23  | Deploy-target correctness, both branches                                                                                  | §6, §9, D5    | **PASS**                                                                                          |
| 24  | `scripts/check-seo.mjs` enforces both branches                                                                            | SEO-2         | **PASS** (nit N6)                                                                                 |
| 25  | Lighthouse SEO                                                                                                            | —             | **SHOULD-FIX S1** — 100 on canonical, 66 on preview by design; the `qa` budget does not know that |
| 26  | SEO-1 … SEO-7 delivered as requested                                                                                      | requests.md   | **PASS** — all seven verified in the built output                                                 |

---

## 2. Findings

### Blockers

None.

### Should-fix

**S1 — `npm run qa:lighthouse` can never pass before cutover.**

`scripts/lighthouse.sh:56` budgets `seo: 100` unconditionally. On the preview
target the page is `noindex,nofollow` **by design** (D5), so Lighthouse scores
`is-crawlable` 0 and the SEO category 0.66 — the script then exits 1 and takes
`npm run qa` (`package.json:20`) down with it.

Evidence:

- `docs/qa/lighthouse.json` → `categories.seo.score = 0.66`;
  `audits["is-crawlable"].score = 0`, title "Page is blocked from indexing".
  Every other scored SEO audit is 1: `document-title`, `meta-description`,
  `http-status-code`, `link-text`, `crawlable-anchors`, `robots-txt`,
  `image-alt`, `hreflang`. `canonical` and `structured-data` are `null` (n/a).
- Measured on a temporary canonical build (`public/CNAME` present):
  `categories.seo.score = 1` with all ten scored audits — including
  `is-crawlable` **and** `canonical` — at 1.

So the page is correct on both targets; only the gate is wrong. It should be
gated on `public/CNAME` exactly the way `scripts/check-seo.mjs:79` already is.

Exact change — `scripts/lighthouse.sh`, in the node block at lines 49–70:

```diff
-# Thresholds: performance >= 90, accessibility 100, best-practices >= 95, seo 100.
+# Thresholds: performance >= 90, accessibility 100, best-practices >= 95.
+# SEO: 100 on the canonical target. On a preview build the page is noindex by
+# design (decision D5), so `is-crawlable` scores 0 and the category caps at 66 —
+# there, require every SEO audit *except* `is-crawlable` to pass instead.
```

```diff
 const report = JSON.parse(fs.readFileSync("docs/qa/lighthouse.json", "utf8"));
+const canonical = fs.existsSync("public/CNAME");
 const thresholds = {
   performance: 90,
   accessibility: 100,
   "best-practices": 95,
-  seo: 100,
+  ...(canonical ? { seo: 100 } : {}),
 };
 let failed = 0;
 for (const [key, min] of Object.entries(thresholds)) {
   const score = Math.round((report.categories[key].score ?? 0) * 100);
   const ok = score >= min;
   if (!ok) failed += 1;
   console.log(`  ${ok ? "ok" : "x "} ${key.padEnd(15)} ${String(score).padStart(3)} (min ${min})`);
 }
+if (!canonical) {
+  const offenders = report.categories.seo.auditRefs
+    .filter((ref) => ref.id !== "is-crawlable")
+    .filter((ref) => (report.audits[ref.id].score ?? 1) < 1)
+    .map((ref) => ref.id);
+  const ok = offenders.length === 0;
+  if (!ok) failed += 1;
+  console.log(
+    `  ${ok ? "ok" : "x "} ${"seo (preview)".padEnd(15)} ` +
+      (ok ? "all audits pass except is-crawlable (noindex by design, D5)" : offenders.join(", ")),
+  );
+}
```

Filed as **SEO-8** in `docs/qa/requests.md`.

### Nits

**N1 — the `llms.txt` drift check guards less than half of what `llms.txt`
restates.** `scripts/check-copy.mjs:114-137` asserts the 8 FAQ answers and the 4
package price strings — exactly what SEO-7 asked for, so the request is
correctly closed. But `public/llms.txt` also restates the flower-bar
introduction, the packages intro and footnote, all four How It Works step
bodies, all four Why Happy Days bodies, the four package descriptions and guest
lines, and the first About paragraph. All of those can drift silently.

I verified that 22 further `copy.ts` strings are present in `public/llms.txt`
today and would therefore be safe to assert (a script comparing each against the
whitespace-normalised file: all PRESENT). Extend `required` in
`checkLlmsTxt()`:

```js
const required = [
  ...copy.faq.items.map((item) => ({ label: 'faq answer', text: item.answer })),
  ...[...copy.packages.items, copy.packages.custom].flatMap((pkg) => [
    { label: `price (${pkg.name})`, text: pkg.price },
    { label: `guests (${pkg.name})`, text: pkg.guests },
    { label: `description (${pkg.name})`, text: pkg.description },
  ]),
  { label: 'flower bar intro 1', text: copy.flowerBarIntro.body[0] },
  { label: 'flower bar intro 2', text: copy.flowerBarIntro.body[1] },
  { label: 'flower bar emphasis', text: copy.flowerBarIntro.emphasis },
  { label: 'packages intro', text: copy.packages.intro },
  { label: 'packages footnote', text: copy.packages.footnote },
  ...copy.howItWorks.steps.map((s, i) => ({ label: `how it works ${i + 1}`, text: s.body })),
  ...copy.whyHappyDays.reasons.map((r) => ({ label: `why: ${r.title}`, text: r.body })),
  { label: 'about', text: copy.about.body[0] },
];
```

Two strings must **not** be added: `copy.hero.body` (llms.txt line-wraps it
inside a `>` blockquote, so the `> ` prefix breaks containment) and
`copy.about.body[1]` (deliberately not in `llms.txt`). Filed as **SEO-9**.

**N2 — `docs/seo-aeo-spec.md` §7.3 overstates what `llms.txt` contains.** It
says "**Every sentence is verbatim approved copy**". It is not: the opening
summary (`public/llms.txt:6-11`), the fact bullets (`:13-15`), the Service Area
lead-in, the contact framing (`:138-140`) and the "Optional / not offered"
list (`:142-145`) are connective prose I authored. None of it invents a business
fact — I re-checked every claim against
`1-genesis/…/questions/answers-from-bethany.md` §3c, which states GBP "Option B —
service-area business with the home address hidden", "Do not publish a personal
phone number in V1", and "Do not publish rigid retail hours" — so "no
storefront", "no published phone number" and "It is a service-area business" are
faithful restatements of the owner's own decisions. But the spec's claim would
let a future maintainer skip review of that prose. Exact change to §7.3:

```diff
-service, the four packages with prices, the service area, all eight Q&As, the
-"Why Happy Days" points, and how to make contact. **Every sentence is verbatim
-approved copy** from `website-spec.md` or `owner-answers.md`, plus the
-decided facts (canonical URL, email, socials). It ends by stating what is _not_
+service, the four packages with prices, the service area, all eight Q&As, the
+"Why Happy Days" points, and how to make contact. **Every business fact is
+verbatim approved copy** from `website-spec.md` or `owner-answers.md`, plus the
+decided facts (canonical URL, email, socials). A few connective sentences are
+authored for this file — the opening summary, the fact bullets, the contact
+framing and the "not offered in this version" list; they restate approved
+decisions (owner answers §3c: service-area business, no published phone, no
+retail hours) and add no new fact. Treat them as copy: review them when the
+approved sources change. It ends by stating what is _not_
```

`docs/seo-aeo-spec.md` is my file; I am not editing it in this read-only pass, so
this is listed for a follow-up commit rather than filed as a request.

**N3 — JSON-LD images are 1152 px wide, one notch under the 1200 px Google's
image guidelines want for large image previews and Discover.**
`src/seo/pageInputs.ts:93` selects the 1152 w JPEG because that is the widest
rendition `scripts/build-images.mjs` produces (`public/images/` has 480/768/1152
only). `public/og.jpg` is correctly 1200×630, so the social card is unaffected;
this only affects `Florist.image` / `WebPage.primaryImageOfPage`. Fixing it means
adding a 1200 (or 1536) width to the sharp width set, re-running `npm run
images` and committing ten new binaries — **recommend deferring to V2**; the
cost/benefit is poor for a business whose image search demand is negligible.

**N4 — `Florist.email` is emitted as `mailto:hello@happydaysflowers.com`**
(`src/seo/jsonld.ts:264`). Valid — `email` is a Text field and both forms are
common — but an assistant that lifts the value verbatim will print the URI
scheme. A bare `hello@happydaysflowers.com` extracts more cleanly.
Optional; no functional difference for Google.

**N5 — preview mode ignores `BASE_PATH`.** `src/seo/meta.ts:43` and
`src/seo/jsonld.ts:227` resolve preview URLs against the hard-coded
`PREVIEW_URL` (`src/seo/types.ts:25`), so a local `npm run build` with `base=/`
still emits `og:url` and every `@id` under
`https://seanpaulconnelly.github.io/happy-days-flower-bar-site/`. Harmless in
practice — the CI workflow (`.github/workflows/deploy.yml:46-49`) derives
`BASE_PATH` from the same `public/CNAME` switch as `siteMode`, so the two cannot
diverge on a real deploy, and preview builds are `noindex` anyway. Recorded, not
fixed.

**N6 — `check-seo` cannot see a runtime metadata regression.** It reads
`dist/index.html`, which is the right thing for SEO-1's purpose, but React
hoisting a `<title>` or a second `ld+json` block at hydration would not appear
there. I verified the rendered DOM by hand today: exactly one `<title>`, one
`<meta name="description">`, one `application/ld+json`. `scripts/check-copy.mjs`
already drives a browser over the built page, so the guard is ~8 lines there:

```js
const head = await page.evaluate(() => ({
  title: document.querySelectorAll('title').length,
  description: document.querySelectorAll('meta[name="description"]').length,
  jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
}));
const headProblems = Object.entries(head)
  .filter(([, count]) => count !== 1)
  .map(([key, count]) => `runtime head: expected exactly one ${key}, found ${count}`);
```

…reported alongside the existing `missing` list. Filed with N1 as **SEO-9**.

**N7 — `<html lang="en">` vs `inLanguage: "en-US"` / `og:locale: "en_US"`.**
Cosmetic inconsistency (`index.html:2`). `en` is a correct, valid value and no
search or answer engine cares. No action.

**N8 — two `<img>` elements share one alt string.**
`flower-bar-closeup-gallery-*` and `flower-bar-closeup-intro-*` are two crops of
the same photograph and carry byte-identical ux-spec §7 alt text. That is honest
(it is the same picture) and the gallery crop is correctly excluded from the
JSON-LD image set (`src/seo/pageInputs.ts:79-89`). No action.

### Needs approval (visible copy) — nothing new

No visible-copy change is proposed by this review. The three §13 items were
resolved before Phase 5: **A1** ship "Frequently Asked Questions" (D8 —
verified rendered and used as `FAQPage.name`), **A2** keep the approved
`<title>` (verified byte-identical), **A3** no keyword inserted into any
heading, package name or FAQ question (verified — the DOM heading outline is
the approved wording throughout).

---

## 3. Detail

### 3.1 Heading outline (spec §4)

Rendered outline, from the live DOM, matches §4 line for line — one `<h1>`, one
`<h2>` per section in the specified order, `<h3>` only for repeated items, no
`<h4>` or deeper, no headings in `<header>` or `<footer>`:

```
h1  Unique Floral Experiences                       #top
h2  A Flower Bar, Brought to You                    #flower-bar
h2  How It Works                                    #how-it-works   + 4 h3 (01–04)
h2  Flower Bar Packages                             #packages       + 4 h3
h2  Why Happy Days?                                 #why            + 4 h3
h2  A Little Happiness, One Stem at a Time          #gallery
h2  Grown in Greensburg. Made to Be Shared.         #about
h2  Frequently Asked Questions                      #faq            + 8 h3 (in <summary>)
h2  Let’s Bring the Flower Bar to You               #inquire
```

Every `<section>` carries `aria-labelledby` pointing at its own H2
(`#top` → `hero-heading`, … `#inquire` → `inquire-heading`), which is what gives
answer engines clean passage boundaries (§4 note 3). Landmarks: one `<header>`,
one `<nav aria-label="Primary">`, one `<main id="main">`, one `<footer>`.

### 3.2 JSON-LD (spec §5)

Canonical build, one `<script type="application/ld+json">`, one `@graph`,
15 nodes, `@context: "https://schema.org"`:

`Florist` `#business` · `Service` `#service` · `OfferCatalog` `#packages` ·
`WebSite` `#website` · `WebPage` `#webpage` · 9 × `ImageObject`
(`#primaryimage`, `#image-2` … `#image-9`) · `FAQPage` `#faq`.

Every `@id` is a fragment on `https://happydaysflowers.com/`; in the preview
build every `@id` is on
`https://seanpaulconnelly.github.io/happy-days-flower-bar-site/` and nothing
advertises the live host. Every reference resolves to a node in the same graph:
`Service.provider` → `#business`, `Offer.itemOffered` → `#service`,
`Offer.seller` → `#business`, `Florist.hasOfferCatalog` / `Service.hasOfferCatalog`
→ `#packages`, `WebSite.publisher` → `#business`, `WebPage.isPartOf` →
`#website`, `WebPage.about` → `#business`, `WebPage.primaryImageOfPage` →
`#primaryimage`, `WebPage.hasPart` → `#faq`, `FAQPage.isPartOf` → `#webpage`,
`Florist.image[9]` → the nine `ImageObject`s.

Checked against §5 item by item:

- **`Florist`** (§5.1): `name`, `slogan`, `description`, `url`, `email`,
  `image`, `address`, `areaServed`, `priceRange`, `sameAs`, `knowsLanguage`,
  `makesOffer`, `hasOfferCatalog`. `address` is a `PostalAddress` with exactly
  `addressLocality: "Greensburg"`, `addressRegion: "PA"`,
  `addressCountry: "US"` — **no `streetAddress` key at all**.
- **Nothing invented** (§5.8): the graph contains no `telephone`,
  `streetAddress`, `openingHours`, `openingHoursSpecification`,
  `aggregateRating`, `review`, `geo` on the business, `Person`, `founder`,
  `employee`, `paymentAccepted`, `foundingDate`, `hasMap`, `Event` or
  `Product`. `site.contact.phone` and `.streetAddress` are `''` and `compact()`
  drops them (`src/seo/jsonld.ts:80-89`) — no blank keys either.
- **`areaServed`** (§5.2): identical three-element array on `#business` and
  `#service` — `GeoCircle` named "Approximately 50 miles around Greensburg, PA"
  with `geoMidpoint` `{40.2978, -79.5422}` (the published Greensburg municipal
  centroid, not a private address) carrying the same locality-only address, and
  `geoRadius: "80467"` (50 × 1609.344, rounded, as a string); `City` Pittsburgh
  with `sameAs` its Wikipedia page; `AdministrativeArea` Western Pennsylvania
  with `sameAs` its Wikipedia page.
- **`Service`** (§5.3): `name` and `serviceType` "Pop-Up Flower Bar",
  `description` = `copy.flowerBarIntro.body[0]` verbatim, `provider`,
  `areaServed`, `hasOfferCatalog`, `url` → `#flower-bar`.
- **`OfferCatalog`** (§5.3): 4 `Offer`s in page order. Classic `price "895"` /
  `eligibleQuantity {unitText: "guest", maxValue: 25}`; Social `"1495"` /
  `{minValue: 26, maxValue: 50}`; Full `"1995"` / `{minValue: 51, maxValue: 75}`;
  **Custom Floral Experience carries no `price` and no `priceCurrency` key at
  all**, only `{minValue: 75}` — exactly as specified. `priceCurrency: "USD"` on
  the three priced offers. `priceRange` on the business derives to `$895–$1,995`.
- **`WebSite`** (§5.4): `url`, `name`, `description`, `publisher`,
  `inLanguage`. No `SearchAction` — correct, there is no site search.
- **`WebPage`** (§5.5): all seven specified keys present.
- **`FAQPage`** (§5.6): its own node, `@type` a plain string (not an array), no
  `url` of its own, `name` = "Frequently Asked Questions", `isPartOf` →
  `#webpage`, `inLanguage`, `mainEntity` = 8 `Question` nodes `#faq-1`…`#faq-8`,
  each with `name` and `acceptedAnswer.text`.
- **`ImageObject`** (§5.7): nine nodes, all `contentUrl` + `url` pointing at
  `…-1152.jpg` (JPEG, not AVIF/WebP), each with real `width`/`height` and a
  `caption` equal to the ux-spec §7 alt. Hero is first and is
  `#primaryimage`. No `logo` key.

**FAQ text chain — verified with exact string comparison, no normalisation:**
all 8 `<summary>` `<h3>` strings equal `Question.name`, and all 8 answer `<p>`
strings equal `acceptedAnswer.text`, byte for byte. All 8 questions and answers
are also present verbatim in
`1-genesis/…/questions/answers-from-bethany.md`. DOM order = `mainEntity` order
= spec §11.1 order (source 1, 4, 3, 2, 5, 7, 8, 6):

1. What’s included with a Happy Days Flower Bar?
2. How far do you travel? Is there a travel fee?
3. How far in advance should we book?
4. How many flowers does each guest get?
5. Can the flowers match our event or brand colors?
6. Do guests need any experience arranging flowers?
7. Can the flower bar be outdoors? What if it rains?
8. What happens after the event?

**Spec §11.2's three non-negotiables all hold.** Every answer `<p>` is a direct
child of its `<details>`, rendered unconditionally and present in the DOM at
first render with all rows collapsed (`open=false` × 8). No `hidden`, no
`display:none`, no `aria-hidden` on any answer — the single `aria-hidden`
element inside each `<details>` is the decorative plus/× SVG marker in the
`<summary>` (`src/sections/Faq.tsx:47`), which is correct. No `name` grouping
attribute, no JS accordion.

**Rich Results / Schema Markup Validator expectations.** Google detects one
eligible type here, `LocalBusiness` (via `Florist`): required `name` and
`address` are present. It will emit _warnings_ for the recommended properties we
deliberately omit — `telephone`, `openingHoursSpecification`, `geo`,
`aggregateRating`, `review` — every one of which has no approved source (§5.8),
so the warnings are the correct outcome and must not be "fixed". `FAQPage`
parses but no longer produces a rich result (FAQ rich results ceased 2026-05-07,
§5.6). `Service`, `OfferCatalog` and `Offer` are valid schema.org with no
associated Google rich result, so no warnings apply to them — in particular the
absence of `availability` and `priceValidUntil` is not a warning here, and I
recommend **not** adding them (both would be soft claims about a service with a
3–4 week lead time). `Florist.image` is expressed as `@id` references into the
same `@graph`, which is the standard graph pattern and resolves correctly in
Google's parser; `docs/SEARCH-SETUP.md` already schedules a live Rich Results
Test after cutover, which is where that gets confirmed against a public URL.

### 3.3 Meta and indexability (spec §6, D5)

| Tag                                      | Canonical build                                                                                                | Preview build (both base paths)                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `<title>`                                | `Happy Days Flower Farm \| Pop-Up Flower Bars in Western PA` (exactly `site.seo.title`, one `<title>` element) | same                                                             |
| `<meta name="description">`              | exactly `site.seo.description`, one element                                                                    | same                                                             |
| `<meta name="robots">`                   | `index,follow`                                                                                                 | `noindex,nofollow`                                               |
| `<meta name="googlebot">`                | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`                                     | absent                                                           |
| `<link rel="canonical">`                 | `https://happydaysflowers.com/`                                                                                | absent                                                           |
| `og:url`                                 | `https://happydaysflowers.com/`                                                                                | `https://seanpaulconnelly.github.io/happy-days-flower-bar-site/` |
| `og:image`                               | `https://happydaysflowers.com/og.jpg`                                                                          | the preview host equivalent                                      |
| `og:image:width` / `:height`             | `1200` / `630` (measured: `public/og.jpg` is 1200×630 JPEG)                                                    | same                                                             |
| `og:image:alt`                           | the hero alt, a standalone sentence                                                                            | same                                                             |
| `og:type` / `og:site_name` / `og:locale` | `website` / `Happy Days Flower Farm` / `en_US`                                                                 | same                                                             |
| `twitter:card`                           | `summary_large_image` + title, description, image, image:alt                                                   | same                                                             |
| `theme-color`                            | `#F7F2EA` (`index.html:15`, survives the build)                                                                | same                                                             |
| `<html lang>`                            | `en`                                                                                                           | same                                                             |

All URLs in the OG/Twitter block are absolute in both modes. Under
`BASE_PATH=/happy-days-flower-bar-site/` the icons, hero preloads and asset
`src`s are all correctly prefixed while the OG/JSON-LD URLs stay absolute.

**Deploy-target gate.** `scripts/check-seo.mjs:79-97` was exercised on all three
builds and on a deliberate mismatch:

| Build                                           | `public/CNAME` | Result                                                                                                                       |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| preview, `base=/`                               | absent         | `OK … [preview (no public/CNAME)]`                                                                                           |
| preview, `base=/happy-days-flower-bar-site/`    | absent         | `OK … [preview (no public/CNAME)]`                                                                                           |
| canonical                                       | present        | `OK … [canonical (public/CNAME present)]`                                                                                    |
| canonical `dist/` re-checked with CNAME removed | absent         | **FAIL, correctly** — "expected no canonical link, found 1" and "expected `<meta name="robots" content="noindex,nofollow">`" |

Both branches are genuinely enforced, and `scripts/check.mjs:37-39` runs
`check:seo` immediately after `vite build`, so the gate always reads the HTML
that is about to ship.

### 3.4 `robots.txt`, `sitemap.xml`, `llms.txt` (spec §7)

- `public/robots.txt` — `User-agent: * / Allow: /` plus explicit groups for
  Googlebot, Googlebot-Image, bingbot, DuckDuckBot, Applebot; the training
  crawlers GPTBot, ClaudeBot, Google-Extended, Applebot-Extended,
  meta-externalagent, Amazonbot, CCBot; and the retrieval crawlers that produce
  citations — OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
  PerplexityBot, Perplexity-User, DuckAssistBot, MistralAI-User. All allowed per
  plan §8 Q19. Ends with `Sitemap: https://happydaysflowers.com/sitemap.xml`.
  No `Disallow` anywhere — correct: a preview `Disallow` would stop Google
  reading the `noindex`. Lighthouse `robots-txt` audit scores 1. Copied verbatim
  into `dist/` by Vite. (On the preview host it lands at
  `/happy-days-flower-bar-site/robots.txt` and is therefore not read by
  crawlers; that is expected and harmless, since the preview page is `noindex`.
  After cutover, base is `/` and the file sits at the origin root.)
- `public/sitemap.xml` — one `<url>`, `<loc>https://happydaysflowers.com/</loc>`,
  `<lastmod>2026-08-29</lastmod>` (today, honest), no `changefreq`/`priority`.
  Well-formed XML in the correct namespace.
- `public/llms.txt` — 6,600 bytes, present in `dist/`. Content verified against
  `copy.ts`: the four packages with names, guest bands, prices and descriptions;
  the eight Q&As **in the §11.1 display order, matching the page**; the four Why
  Happy Days points; service area; contact block with the inquiry URL, email and
  both socials; and the explicit "does not publish a phone number, a street
  address or retail opening hours" line, which is the sentence that stops an
  assistant hallucinating a phone number. See nits N1 and N2.
- **SEO-7 coverage** — `scripts/check-copy.mjs:114-137` asserts the 8 FAQ answers
  and the 4 package price strings appear in `public/llms.txt`, whitespace- and
  quote-normalised. That is exactly the assertion SEO-7 asked for, so the row is
  correctly marked done; N1 proposes widening it.

### 3.5 Images (spec §12, D13/D14/D15)

Ten `<img>` elements, all with real alt text, none decorative, no keyword
stuffing, and the business name in **zero** alts (§12 allows one or two — none
is also fine). Filenames are lowercase, hyphenated and descriptive with the
stem preserved across every width variant: `hero-flower-bar`,
`hero-flower-bar-square`, `flower-bar-closeup-intro`,
`flower-bar-closeup-gallery`, `farm-bouquet-pink-white`,
`farm-bouquet-colorful`, `farm-zinnias`, `gallery-event-detail`,
`gallery-arrangement`, `gallery-arrangement-outdoor`, `about-still-life`.

D14/D15 both hold: no public filename names a person. `about-still-life-*` is
accurate (a delphinium still life, no person in frame) and impersonal, per D14;
`farm-zinnias-*` depicts a person but is named for the subject matter, not the
individual.

**Hero preload matches the served AVIF.** The head carries two
`<link rel="preload" as="image" type="image/avif" fetchpriority="high">` links,
one per art-direction branch, using the same media constants and the same
`sizes` string as the `<picture>` (`HERO_DESKTOP_MEDIA` / `HERO_MOBILE_MEDIA`
and `SIZES.hero`, `src/lib/images.ts:70-85`, shared with `src/sections/Hero.tsx:60-62`).
A browser therefore matches exactly one link and, within it, resolves the same
srcset candidate the `<picture>` resolves. Verified at 1280×900: `currentSrc` is
`/images/hero-flower-bar-768.avif`, which is the candidate the desktop preload's
`imagesrcset` + `imagesizes` selects. `loading="eager"` +
`fetchpriority="high"` on the hero, `loading="lazy"` on the other nine.

### 3.6 Internal anchors (spec §4)

| href                                            | text                                          | target exists            |
| ----------------------------------------------- | --------------------------------------------- | ------------------------ |
| `#main`                                         | Skip to content                               | yes (`<main id="main">`) |
| `#top`                                          | Happy Days Flower Farm (wordmark)             | yes                      |
| `#flower-bar` / `#about` / `#inquire`           | Flower Bar / About / Inquire (nav)            | yes                      |
| `#inquire`                                      | Inquire About Your Date (hero, packages) — ×2 | yes                      |
| `#packages`                                     | View Flower Bar Packages                      | yes                      |
| `https://www.instagram.com/happydaysflowerfarm` | Instagram                                     | external                 |
| `https://www.facebook.com/happydaysflowers`     | Facebook                                      | external                 |
| `mailto:hello@happydaysflowers.com`             | Email                                         | —                        |

No dead fragments, no bare "click here"/"learn more", nothing behind JavaScript.
Lighthouse `link-text` and `crawlable-anchors` both score 1. The two social URLs
are identical to `Florist.sameAs`, which is what lets an engine tie the profiles
to the entity.

---

## 4. Answer-engine extraction pass

Method: take the rendered `document.body` text (which includes the collapsed
`<details>` answers) plus `public/llms.txt` plus the JSON-LD graph, and write the
answer an assistant would produce. Every sentence below traces to approved copy
or a decided fact; nothing is inferred.

**Q1. "What is Happy Days Flower Farm?"**
→ _"Happy Days Flower Farm is a specialty cut flower farm in Greensburg,
Pennsylvania creating unique floral experiences throughout Western PA. Its
service is the Pop-Up Flower Bar — a fully stocked build-your-own-bouquet bar
that it delivers, sets up and collects for corporate and private events."_
Sources: `copy.about.body[0]` (About section, verbatim), the Flower Bar
Introduction paragraph, `Florist.description`, `Service.description`,
`llms.txt:6-11`. **Correct, entirely approved copy.** The `Florist` +
`Service` pair means an engine gets the category ("florist / flower farm") and
the specific offering ("Pop-Up Flower Bar") without having to guess.

**Q2. "How much does a flower bar cost for 50 guests?"**
→ *"$1,495 — The Social Flower Bar, which covers 26–50 guests. Packages run
$895 (up to 25 guests) to $1,995 (51–75); 75+ guests is a custom quote."*
Sources: the packages cards in the DOM (name, guest band, price and description
are all plain adjacent text), `#offer-the-social-flower-bar` with
`price: "1495"`, `priceCurrency: "USD"` and
`eligibleQuantity {minValue: 26, maxValue: 50, unitText: "guest"}`,
`Florist.priceRange: "$895–$1,995"`, `llms.txt:45-53`. **Correct.** This is the
question `eligibleQuantity` exists for: without it "$1,495" is an unattached
number. The §14 ⚠️ against this query is now resolved — the guest band is plain
text beside the price in the card and machine-readable in the offer.

**Q3. "Do they serve Pittsburgh?"**
→ _"Yes. Happy Days Flower Farm is based in Greensburg and serves Pittsburgh
and surrounding communities throughout Western Pennsylvania. Standard delivery,
setup and pickup are included within approximately one hour or 50 miles of
Greensburg; events beyond that may receive a custom travel quote."_
Sources: FAQ #2 verbatim (and it is #2, high in the DOM, which is the §11.1
lever for exactly this), the footer line "Greensburg, Pennsylvania · Serving
Pittsburgh + Western Pennsylvania", `GeoCircle` 80,467 m around the Greensburg
centroid, `City` Pittsburgh and `AdministrativeArea` Western Pennsylvania on
both the business and the service node, each with a Wikipedia `sameAs` anchor.
**Correct**, and this is the single strongest passage on the page.

**Q4. "What's included?"**
→ _"Every flower bar includes a curated selection of seasonal flowers and
greenery, the 12-bucket flower bar display, bouquet sleeves, signage,
preparation, delivery, setup and pickup — approximately 10 stems per
participating guest."_
Sources: FAQ #1 verbatim, `copy.packages.intro` (same sentence, above the
cards), `copy.packages.footnote` for the stem count, `llms.txt:41-43, 55-56`.
**Correct.** Two independent statements of the same fact on the page, and the
FAQ version is fully self-contained.

**Q5. "How do I book?"**
→ _"Through the inquiry form at happydaysflowers.com/#inquire, or by email at
hello@happydaysflowers.com. Book at least 3–4 weeks ahead — earlier for spring,
summer and fall dates — though shorter notice may be possible. There is no phone
number, no street address and no online booking."_
Sources: the Inquiry section and form, `Florist.email`, FAQ #3 verbatim,
`llms.txt:131-140`. **Correct**, and the explicit negative statement in
`llms.txt` is what keeps an assistant from inventing a phone number — the single
highest-value line in that file.

**Answer gaps.** Two questions the page cannot answer, and what to do:

- _"Do you do weddings?"_ — not claimed anywhere, correctly: the brief rules out
  wedding-florist positioning. An engine will say it does not know. Right
  outcome; no change.
- _"What months do you operate / are you available in winter?"_ — nothing
  approved says. FAQ #3 names "spring, summer and fall dates" and several
  passages stress seasonality, so an engine could infer a closed season that may
  not exist. **This is the one gap worth an owner answer**, but it needs new
  approved copy and therefore belongs to V2, not to this review. Noted for
  `docs/SEARCH-SETUP.md`'s post-launch list rather than filed as a request.
- _Deposit, payment terms, farm visits_ — deliberately absent per the owner's
  answers; no change wanted.

---

## 5. Summary

1. **Verdict: PASS.** Nothing blocks release; nothing on the page changes.
2. Heading outline, section anchors and `aria-labelledby` match spec §4 exactly.
3. The JSON-LD graph is complete and correct on both targets: 15 nodes, every
   cross-reference resolves, every `@id` on the right origin.
4. The absence checks all hold — no phone, street address, hours, rating,
   review, `geo` or `Person` anywhere in the markup.
5. All 8 FAQ answers are byte-identical across `copy.ts` → DOM → JSON-LD →
   the owner's answers, in the spec §11.1 order, with every answer in the DOM
   at first render.
6. Offers carry the guest bands (`eligibleQuantity`); the custom package
   correctly carries no price at all.
7. Title, description, OG and Twitter tags are the approved strings, absolute
   URLs, correct dimensions and alt.
8. Deploy targeting is right in both directions and `check-seo` genuinely
   enforces both branches — proven with a deliberate negative test.
9. Lighthouse SEO is **100 on the canonical target**; the preview target's 66 is
   the intended `noindex` and nothing else.
10. Answer-engine extraction: 5 of 5 buyer questions answerable from approved
    copy, including "how much for 50 guests" and "do you serve Pittsburgh".
11. SEO-1 through SEO-7 are all verified as delivered in the built output.
12. One should-fix, and it is a script, not the site: the `qa:lighthouse` SEO
    budget cannot pass on a preview build (**SEO-8**).
13. Six nits, all optional; the two worth doing are widening the `llms.txt`
    drift check and a runtime head-uniqueness assertion (**SEO-9**).
14. No visible-copy change is proposed; §13's A1–A3 stay as decided (D8).
15. **PASS** — ordered follow-ups: SEO-8, SEO-9, N2, N3.
