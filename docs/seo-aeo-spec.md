# SEO / AEO spec — Happy Days Flower Farm V1

Owner: `seo-aeo-specialist`. Written 2026-08-29 (Phase 2c).

Companion files this spec describes and that are already written:
`src/seo/{types.ts,meta.ts,jsonld.ts}`, `public/{robots.txt,sitemap.xml,llms.txt}`,
`docs/SEARCH-SETUP.md`. Requests for other agents are in `docs/qa/requests.md`.

Aligned with `docs/ux-spec.md` (§1 section order and anchors, §9 heading outline,
§1.2 FAQ interaction model) and `docs/qa/decisions.md` D5 (build-time indexability).

**Two rules govern everything below.** (1) Approved copy is final — the eight FAQ
Q&As, the package copy and every section heading are used verbatim; nothing here
rewrites them. (2) No invented facts — there is no telephone, street address,
opening hours, rating, review or deposit term anywhere in the markup, because
none exists in an approved source.

---

## 1. Scope, and what is already decided

| Item                              | Decision                                                                     | Where decided                                  |
| --------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Canonical URL                     | `https://happydaysflowers.com/` — apex, `www` redirects to apex              | Plan §8 Q6                                     |
| Preview host                      | `https://seanpaulconnelly.github.io/happy-days-flower-bar-site/` — `noindex` | Plan §8 Q14, decision D5                       |
| AI crawlers in `robots.txt`       | **Allowed**, all of them                                                     | Plan §8 Q19                                    |
| Package prices in structured data | **Yes**, as `Offer`s                                                         | Owner answers §3b; plan §8 Q20                 |
| Business model in markup          | Service-area business; locality + region only, **no** street address         | Owner answers §3c (GBP Option B)               |
| Phone / hours                     | Not published anywhere, on the site or in markup                             | Owner answers §3c                              |
| FAQ in V1                         | Yes, 8 approved Q&As, `FAQPage` JSON-LD                                      | Plan §8 Q18                                    |
| FAQ placement                     | Position 8, between About and Inquiry (`#faq`)                               | `docs/ux-spec.md` §1.1                         |
| FAQ interaction                   | Native `<details>`/`<summary>`, all answers in the DOM at first render       | `docs/ux-spec.md` §1.2                         |
| **FAQ display order**             | **Decided here — §11.1**                                                     | this document                                  |
| **Head + JSON-LD injection**      | **Build-time into `index.html` — §9**                                        | this document (request filed for the engineer) |

Site shape: one page, one URL, one conversion (the inquiry form). Everything in
this spec is sized for that. There is no blog, no location pages, no pagination,
no faceted anything — so the entire technical SEO surface is one HTML document,
three static files in `public/`, and the structured-data graph.

---

## 2. Keyword and entity map

### 2.1 What the market looks like

Fetched 2026-08-29 from the four reference URLs in `1-genesis/…/websites.md`:

| Site                                  | Market          | Title pattern                                                                                          | Prices?                          | FAQ?       | Take-away for us                                                                                                                                                                                             |
| ------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Roots to Petals (Oakmont, PA)         | **Our market**  | "Event Flowers & Flower Bar Services \| Roots to Petals"; H1 "Premier Pittsburgh Florist & Plant Shop" | "Packages begin at $400"         | No         | The only Pittsburgh-area result and it is a **retail florist** with a flower bar as one line item. Nobody local owns "pop-up flower bar" as an entity. That is the opening.                                  |
| Flair Flower Bar (Cincinnati / N. KY) | Direct analogue | "FLAIR Flower Bar Rental \| Private & Corporate Events in Cincinnati, OH & Northern KY"                | 4 tiers, $465–$1,050 + per-guest | No         | Service + geo in the title, and an explicit city/ZIP list on the page. Their guest-tier structure is the same as ours.                                                                                       |
| Garden Muses (DC / DMV)               | Direct analogue | "Pop Up Floral Bar for Corporate Events & Private Gatherings in Washington, DC"                        | Per-person tiers                 | **7 Q&As** | Their FAQ is ~6/8 the same questions the owner answered independently. Strong confirmation these are the real buyer questions. Their FAQ sits _after_ the form; ours sits before it (ux-spec §1.1) — better. |
| Blossom Flower Bar (Cleveland)        | Brand reference | Retail-led, multi-location                                                                             | No                               | No         | Taste reference only; not a competitor for our query set.                                                                                                                                                    |

Two of the three flower-bar specialists publish prices and put the service plus
the metro in the title. Both patterns are already in our plan. None of the four
publishes a `Florist` + `Service` + `OfferCatalog` graph, and only one has an
FAQ, so the structured-data layer is where we can be strictly better than the
comparable sites without touching approved copy.

### 2.2 Query clusters

**Primary (head terms, commercial intent).** The page must be unambiguously
about these:

| Cluster              | Terms                                                                                                                                  | Where the page earns it                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Service × geo        | pop-up flower bar Pittsburgh · flower bar Pittsburgh · flower bar rental Pittsburgh · flower bar Greensburg PA · flower bar Western PA | `<title>`, meta description, hero paragraph, FAQ #2, footer, `Service` + `GeoCircle` |
| Service, unmodified  | pop-up flower bar · flower bar · flower bar rental · flower bar for events                                                             | H2 "A Flower Bar, Brought to You"; "flower bar" appears 29× in approved copy         |
| Buyer occasion (B2B) | corporate event flowers · client appreciation event ideas · employee appreciation flowers · open house / grand opening flowers         | Flower Bar Introduction paragraph 3; package descriptions; `Offer.description`       |
| Buyer occasion (B2C) | bridal / baby shower flower bar · fundraiser flower bar · private celebration flowers                                                  | Flower Bar Introduction paragraph 3; Type of Event select                            |
| Format synonyms      | build your own bouquet bar · bouquet bar · DIY bouquet bar · floral bar · flower cart alternative                                      | "create their own bouquet", "build a bouquet"; `Service.serviceType`                 |

**Secondary (answer-engine / conversational).** These are the queries a one-page
site actually wins, because the answer is a single self-contained passage:

- "who does pop-up flower bars near Pittsburgh?" → FAQ #2 + `GeoCircle`
- "how much does a flower bar cost for 50 guests?" → `Offer` (The Social Flower Bar, $1,495, `eligibleQuantity` 26–50)
- "what's included in a flower bar rental?" → FAQ #1 + Packages intro
- "how far in advance do I need to book a flower bar?" → FAQ #3
- "how many flowers does each guest get at a flower bar?" → FAQ #4
- "can a flower bar match our company's brand colors?" → FAQ #5
- "flower bar ideas for a client appreciation event" → Flower Bar Introduction
- "can you do a flower bar outdoors?" → FAQ #7

### 2.3 Entity map

The job of the structured data is to make five entities and their relations
unambiguous. Everything in `src/seo/jsonld.ts` serves one of these:

| Entity                 | Type                                        | Anchored by                                                                             |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Happy Days Flower Farm | `Florist` (⊂ `LocalBusiness`)               | `name`, `url`, `email`, `sameAs` (Instagram + Facebook), `address` (Greensburg, PA, US) |
| The Pop-Up Flower Bar  | `Service`                                   | `name`/`serviceType` "Pop-Up Flower Bar", `provider` → the business                     |
| The four packages      | `OfferCatalog` → 4 × `Offer`                | `price`, `priceCurrency`, `eligibleQuantity` (guests), `itemOffered` → the Service      |
| The service area       | `GeoCircle` + `City` + `AdministrativeArea` | 50 mi / 80,467 m around the Greensburg centroid; Pittsburgh; Western Pennsylvania       |
| The eight answers      | `FAQPage` → 8 × `Question`/`Answer`         | text byte-identical to the visible `<details>` content                                  |

**Deliberately absent entities:** no `Person` (R10 — no owner named in markup),
no `Product`, no `Event`, no `Review`/`AggregateRating`, no `Organization`
separate from the `Florist` node (a `Florist` _is_ an `Organization`; two nodes
for one business is the most common local-schema error).

### 2.4 The one real gap, and what to do about it

"Pittsburgh" appears **twice** in the entire approved copy set — the footer line
and the travel FAQ answer. "Greensburg" appears 6×, "Western Pennsylvania" 3×.
For a business whose largest market is Pittsburgh, that is thin, and no visible
copy may be changed to fix it. Three levers that need no copy change:

1. Keep "Pittsburgh" in the `<title>`'s description and in the meta description (it is in both today).
2. **Move the travel/service-area FAQ to position 2** so the sentence containing "Pittsburgh" sits high in the DOM — see §11.1.
3. Emit `City` Pittsburgh in `areaServed` on _both_ the `Florist` and the `Service` node, with a `sameAs` entity anchor. Done.

If Search Console shows Pittsburgh impressions but weak position after ~90 days,
the V2 lever is a dedicated `/pittsburgh` service page — out of scope for V1 and
noted in `docs/SEARCH-SETUP.md`.

---

## 3. Title and meta description

**Recommendation: ship the spec's values unchanged.**

| Field       | Value                                                                                                                                                           | Length | Verdict                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `<title>`   | `Happy Days Flower Farm \| Pop-Up Flower Bars in Western PA`                                                                                                    | 57 ch  | Inside the ~60 ch desktop truncation point. Brand + service + geo.                                                |
| Description | `Unique floral experiences and turnkey pop-up flower bars for businesses, events and gatherings in Greensburg, Pittsburgh and throughout Western Pennsylvania.` | 157 ch | At the ~155–160 ch truncation point; the tail word may clip. Fine — every keyword is in the first 140 characters. |

Both come from `site.seo` in `src/config/site.ts`; `buildMeta` passes them
through untouched and must keep doing so.

**Listed under "needs approval", not applied (§13):** an alternative title,
`Pop-Up Flower Bars in Pittsburgh & Western PA | Happy Days Flower Farm` (70 ch,
would truncate to ~"Pop-Up Flower Bars in Pittsburgh & Western PA | Happy Da…").
It leads with the service and adds the biggest city, which usually wins for an
unknown brand. I am **not** recommending it for launch: the spec's title is
approved, is a good title, and swapping it now means we never learn which one
works. Revisit as a deliberate Search Console experiment ~90 days after launch.

Also not applied: no keyword is to be inserted into any H2, package name or FAQ
question. The copy is approved.

---

## 4. Heading outline

This mirrors `docs/ux-spec.md` §9 exactly — that section is the source of truth
for wording, this one records why it is also correct for search. One `<h1>`, one
`<h2>` per section, `<h3>` for repeated items, no `<h4>` or deeper, no headings
in the header or footer.

```
h1  Unique Floral Experiences                       (hero; eyebrow "Happy Days Flower Farm" is a <p> before it)
h2  A Flower Bar, Brought to You                    #flower-bar
h2  How It Works                                    #how-it-works
    h3  01 — Choose Your Flower Bar
    h3  02 — We Prepare Everything
    h3  03 — We Deliver & Style
    h3  04 — Your Guests Create
h2  Flower Bar Packages                             #packages
    h3  The Classic Flower Bar
    h3  The Social Flower Bar
    h3  The Full Flower Bar
    h3  Custom Floral Experience
h2  Why Happy Days?                                 #why
    h3  Locally Grown + Thoughtfully Sourced
    h3  Designed Around the Season
    h3  Beautifully Simple
    h3  More Than a Favor
h2  A Little Happiness, One Stem at a Time          #gallery
h2  Grown in Greensburg. Made to Be Shared.         #about
h2  Frequently Asked Questions                      #faq        ← wording needs approval (§13)
    h3  ×8, the approved questions inside <summary>, in the order in §11.1
h2  Let's Bring the Flower Bar to You               #inquire
```

Notes:

- The H1 "Unique Floral Experiences" carries no keyword. That is correct and
  deliberate: it is the brand descriptor, R2 fixes it, and the `<title>`, the
  hero paragraph and the first H2 all carry "flower bar" within the first
  viewport. An H1 is one signal among many; overriding approved brand copy to
  stuff a keyword into it would be a bad trade.
- "Grown in Greensburg. Made to Be Shared." is an unusually good local-SEO H2
  that happens to be approved copy — it puts the locality in the outline for free.
- Every section is `<section aria-labelledby>` its H2 (ux-spec §9); that also
  gives answer engines clean passage boundaries, which is the single most useful
  structural thing a page can do for passage-level extraction.

---

## 5. The JSON-LD graph

One `<script type="application/ld+json">` containing one `@graph`. Built by
`buildJsonLd()` in `src/seo/jsonld.ts`; serialise with `serializeJsonLd()`,
which escapes `</script` and `<!--` so no copy string can ever break out of the
script element.

All node `@id`s are fragments on the site base URL, so every node is
addressable and cross-referenced rather than duplicated:

```
{base}#business    Florist
{base}#service     Service — "Pop-Up Flower Bar"
{base}#packages    OfferCatalog → 4 × Offer ({base}#offer-the-classic-flower-bar, …)
{base}#website     WebSite
{base}#webpage     WebPage
{base}#primaryimage, {base}#image-2 …   ImageObject
{base}#faq         FAQPage → 8 × Question ({base}#faq-1 … #faq-8)
```

`{base}` is `https://happydaysflowers.com/` in `canonical` mode and the GitHub
Pages URL in `preview` mode, so a preview build never advertises a live URL.

### 5.1 `Florist` — the business node

`Florist` rather than plain `LocalBusiness`: it is a real schema.org subtype of
`LocalBusiness`, it is the closest match, and a more specific type is always
preferred. `Service` and `OfferCatalog` carry the flower-bar specificity that
`Florist` alone would under-describe.

Emitted: `name`, `slogan` (the tagline), `description` (= `site.seo.description`),
`url`, `email` (as `mailto:`), `image` (refs to the `ImageObject` nodes),
`address`, `areaServed`, `priceRange`, `sameAs`, `knowsLanguage`, `makesOffer`,
`hasOfferCatalog`.

`address` is `PostalAddress` with `addressLocality: "Greensburg"`,
`addressRegion: "PA"`, `addressCountry: "US"` — and **no `streetAddress`**.
`site.contact.streetAddress` is the empty string and `compact()` drops empty
keys, so the key is absent rather than blank. Same for `telephone`. This is the
correct shape for a service-area business, and the standard 2026 guidance is
explicit that mixing a real street address with a tight `areaServed` radius is
what confuses Google into treating a service-area business as a storefront.

`priceRange` is **derived**, not typed: `$895–$1,995`, computed from the
packages' `priceValue`s. It disappears automatically if
`exposePricesInStructuredData` is ever set to `false`.

There is no top-level `geo` on the business node. The only coordinate in the
graph is the `GeoCircle` midpoint, and it is the **published municipal centroid
of Greensburg** (40.2978, −79.5422), not a private address.

### 5.2 `areaServed`

Identical array on both the `Florist` and the `Service` node:

1. `GeoCircle` — `geoMidpoint` = the Greensburg centroid, `geoRadius: "80467"`
   (metres; 50 mi × 1609.344, rounded). Computed from
   `site.serviceArea.radiusMiles`, so changing the radius in one place changes
   the graph. The midpoint carries the same locality-only `PostalAddress`.
2. `City` — Pittsburgh, `sameAs` its Wikipedia page.
3. `AdministrativeArea` — Western Pennsylvania, `sameAs` its Wikipedia page.

The `sameAs` links are entity anchors, not citations: they let an engine resolve
"Pittsburgh" to the right Pittsburgh without guessing. `site.serviceArea.named`
drives the list; unknown names fall back to `Place`.

### 5.3 `Service` and `OfferCatalog`

`Service` is `name`/`serviceType` "Pop-Up Flower Bar", `provider` → `#business`,
`areaServed`, `hasOfferCatalog` → `#packages`, `url` → `{base}#flower-bar`, and
`description` — which is **passed in as a parameter** (`serviceDescription`), so
the copy stays in `copy.ts` and this module holds none of it. Pass the Flower Bar
Introduction body paragraph.

Each `Offer` carries `name`, `description` (both approved copy, passed in),
`price` + `priceCurrency: "USD"`, `eligibleQuantity` (a `QuantitativeValue` with
`unitText: "guest"` and `minValue`/`maxValue`), `itemOffered` → `#service`,
`seller` → `#business`, `url` → `{base}#packages`.

**Custom Floral Experience carries no `price` key at all.** Its price is genuinely
"custom quote"; emitting `0`, `null` or a guessed number would be an invented
fact. A price-less `Offer` is valid schema and simply is not eligible for
price-based rich results — which is the honest outcome.

`site.seo.exposePricesInStructuredData` is honoured at one place: when `false`,
no `Offer` gets `price`/`priceCurrency` and the business node loses `priceRange`.
The catalogue, guest ranges and descriptions stay. Validated (§10 run, block 2).

### 5.4 `WebSite`

`url`, `name`, `description`, `publisher` → `#business`, `inLanguage: "en-US"`.
No `SearchAction`/sitelinks-searchbox: there is no site search, and claiming one
that does not exist is a spam signal.

### 5.5 `WebPage`

`url` (the canonical), `name` (= the `<title>`), `description`, `isPartOf` →
`#website`, `about` → `#business`, `primaryImageOfPage` → `#primaryimage`,
`hasPart` → `#faq`, `inLanguage`.

### 5.6 `FAQPage` — kept as its own node, deliberately

The common alternative is to type the page node `"@type": ["WebPage","FAQPage"]`.
I chose a **separate `FAQPage` node** at `{base}#faq`, linked by
`WebPage.hasPart` and `FAQPage.isPartOf`, and with **no `url` of its own** (so no
two nodes claim the same URL). Reason: a large share of answer-engine and
SEO-tool parsers test `node["@type"] === "FAQPage"` with string equality and
silently miss an array-valued `@type`. With separate nodes, both a naive
`=== "WebPage"` check and a naive `=== "FAQPage"` check succeed. Answer-engine
extraction is the whole point of this section, so robustness to dumb parsers
beats elegance.

`mainEntity` is 8 × `Question` (`name` = the question, `acceptedAnswer` = an
`Answer` with `text`), in **the same order as the DOM** (§11.1). `FAQPage.name`
is passed in from `copy.faq.heading`, so it mirrors the visible heading rather
than inventing a label.

**Hard rule for the engineer:** the `Question`/`Answer` strings must come from
the same `copy.faq.items` array the `<details>` elements render. Never a second
transcription. Google's FAQ policy still requires the markup to match visible
page content, and a divergence would be both a policy problem and a copy-drift
problem. The validation run asserts byte-identity against
`owner-answers.md` (§10, block 1).

Note on value: FAQ **rich results** stopped appearing in Google Search on
2026-05-07 and Search Console reporting is being retired through mid-2026. The
markup is kept anyway because (a) `FAQPage` remains valid schema.org, (b) the
content here is genuinely Q&A-shaped — the exact case where current guidance
says keep it — and (c) it is the cleanest machine-readable form of our eight
best answer-engine passages. It costs ~2 KB. What we are explicitly _not_ doing
is claiming a rich result we will not get.

### 5.7 `ImageObject`

Content images are emitted as `ImageObject` nodes with `contentUrl`, `url`,
`width`, `height` and `caption` (= the alt text from ux-spec §7), then referenced
by `@id` from `Florist.image` and `WebPage.primaryImageOfPage`. Passing full
`ImageObject`s rather than bare URLs gives Google the dimensions and a caption
without a second fetch. Pass the 1152 w JPEG variants — the widely-supported
format, not AVIF, since crawler format support is uneven.

No `logo` key: there is no logo file. The V1 wordmark is type (R12), and pointing
`logo` at a photograph would be wrong.

### 5.8 Deliberately absent — the checklist a reviewer should run

`telephone` · `streetAddress` · `openingHours` / `openingHoursSpecification` ·
`aggregateRating` · `review` · `geo` on the business · `founder` / `employee` /
any `Person` · `paymentAccepted` / `currenciesAccepted` · `foundingDate` ·
`hasMap` · `Event` · `Product`. None of these has an approved source. The
validation run asserts the absence of the first six (§10).

---

## 6. Meta, canonical, and indexability

Built by `buildMeta()` in `src/seo/meta.ts`. `mode` is a **parameter**, never
read from `import.meta.env` inside the module, so it is testable and importable
from Node at build time.

| Tag                         | `canonical` mode                                                                     | `preview` mode                               |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| `<title>`                   | `site.seo.title`                                                                     | same                                         |
| `<meta name="description">` | `site.seo.description`                                                               | same                                         |
| `<meta name="robots">`      | `index,follow`                                                                       | **`noindex,nofollow`**                       |
| `<meta name="googlebot">`   | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`           | _omitted_                                    |
| `<link rel="canonical">`    | `https://happydaysflowers.com/`                                                      | **omitted** (see below)                      |
| `og:url`                    | the canonical                                                                        | the GitHub Pages URL                         |
| `og:*` / `twitter:*`        | title, description, `og:image` = `/og.jpg` (1200×630) made absolute, dimensions, alt | same, resolved against the preview base path |
| `twitter:card`              | `summary_large_image`                                                                | same                                         |

**Why preview builds emit no canonical.** A `noindex` page that also declares a
canonical pointing at a different host is a contradictory pair of directives, and
the canonical target does not exist yet before cutover. `noindex,nofollow`
alone is unambiguous. At cutover, `public/CNAME` appears, `VITE_SITE_MODE`
flips to `canonical` (D5), the `noindex` disappears and the canonical link
appears — one switch, no second edit.

**`max-image-preview:large`** is the one robots directive that measurably helps:
it is required for large image thumbnails in Search and Discover, and
`max-snippet:-1` removes the text-snippet length cap, which matters for
AI Overviews and for assistant citations. It is meaningless on a `noindex`
build, so it is only emitted in canonical mode.

**`www` → apex.** Handled at DNS/host level, not in the app: DNSimple
`CNAME www → seanpaulconnelly.github.io`, and GitHub Pages issues the redirect
to the configured apex custom domain automatically. Nothing to build; verify
after cutover with `curl -sI https://www.happydaysflowers.com/` and expect a
301 to `https://happydaysflowers.com/` (`docs/SEARCH-SETUP.md` step 1).

**Not included and not wanted:** `<meta name="keywords">` (dead since 2009),
`<meta name="author">` (R10 — no person named), `geo.position`/`ICBM` meta tags
(obsolete, and we do not publish a precise location), any verification
`<meta>` tag — Search Console is verified by DNS TXT, which keeps the token out
of the repo.

---

## 7. `public/robots.txt`, `sitemap.xml`, `llms.txt`

### 7.1 `robots.txt` — policy: fully open

Nothing on this site is private, and the entire point of the AEO work is to be
cited when someone asks an assistant for a flower bar near Pittsburgh. So:
`User-agent: *` / `Allow: /`, plus explicit per-bot groups for the search
crawlers, the AI training crawlers and — the ones that actually matter for
citations — the AI **retrieval** crawlers.

The explicit groups are not redundant. robots.txt group matching is
most-specific-wins: a bot that matches its own group ignores `*` entirely. So
listing them documents the policy, and protects it if `*` is ever narrowed.

The file always describes the **canonical** host and is never rewritten per
build (D5). Preview builds are kept out of the index by the `noindex` meta tag,
not by a `Disallow` — a `Disallow` would prevent Google from ever _reading_ the
`noindex`, which is the classic way to get a staging URL stuck in the index.

The file ends with `Sitemap: https://happydaysflowers.com/sitemap.xml`.

Bot names verified 2026-08-29 against the operators' own documentation (§8).

### 7.2 `sitemap.xml`

One `<url>`: `https://happydaysflowers.com/` with a `<lastmod>`.
`<changefreq>` and `<priority>` are omitted — Google has ignored both for years
and Bing treats them as advisory noise; emitting them is cargo cult.

**Maintenance rule (put this in `docs/HANDOFF.md`):** bump `<lastmod>` when the
page's _copy_ changes, not on every deploy. A `lastmod` that changes on every
CSS tweak trains crawlers to ignore it.

A one-URL sitemap is nearly worthless for discovery (the page is linked from the
GBP profile and both socials) but it is what Search Console wants submitted, and
it is where `lastmod` lives. Keep it.

### 7.3 `llms.txt`

A plain-Markdown summary at `/llms.txt`: what the business is, where it is, the
service, the four packages with prices, the service area, all eight Q&As, the
"Why Happy Days" points, and how to make contact. **Every business fact is
verbatim approved copy** from `website-spec.md` or `owner-answers.md`, plus the
decided facts (canonical URL, email, socials). A few connective sentences are
authored for this file — the opening summary, the fact bullets, the contact
framing and the "not offered in this version" list; they restate approved
decisions (owner answers §3c: service-area business, no published phone, no
retail hours) and add no new fact. Treat them as copy: review them when the
approved sources change. It ends by stating what is _not_
available — no phone, no address, no hours, no online booking — because a
"no phone number listed" statement prevents an assistant from confidently
hallucinating one.

Honest framing: `llms.txt` is a community proposal, not a standard; no major AI
vendor has confirmed it reads the file, and Google's May 2026 AI guide says
explicitly that it is **not needed** for AI Overviews or AI Mode. It is in V1
because it costs one static file and ~6.6 KB, it is a genuinely useful canonical
plain-text fallback if the JS-rendered page is not executed by a fetcher (§9),
and it is trivially removable. Do not let it substitute for anything in §9.

**Maintenance rule:** `llms.txt` duplicates copy, so it _will_ drift. Whenever
`copy.ts` changes, `llms.txt` must be re-checked. Requested in
`docs/qa/requests.md` as an optional `scripts/check-copy.mjs` assertion.

---

## 8. AI crawler reference (names verified 2026-08-29)

Two categories, and only the second one affects whether we get cited:

| Operator     | Training / archival  | **Retrieval, search and citation**                |
| ------------ | -------------------- | ------------------------------------------------- |
| OpenAI       | `GPTBot`             | `OAI-SearchBot`, `ChatGPT-User`                   |
| Anthropic    | `ClaudeBot`          | `Claude-SearchBot`, `Claude-User`                 |
| Google       | `Google-Extended`    | `Googlebot` (AI Overviews/AI Mode use core index) |
| Perplexity   | —                    | `PerplexityBot`, `Perplexity-User`                |
| Apple        | `Applebot-Extended`  | `Applebot`                                        |
| Meta         | `meta-externalagent` | —                                                 |
| Amazon       | `Amazonbot`          | —                                                 |
| Common Crawl | `CCBot`              | —                                                 |
| DuckDuckGo   | —                    | `DuckAssistBot`                                   |
| Mistral      | —                    | `MistralAI-User`                                  |

All are allowed. Two details worth knowing:

- Blocking `GPTBot` does **not** block `OAI-SearchBot`; they are independent
  groups. A site that blocks GPTBot for training reasons and expects to stay in
  ChatGPT search is confusing the two. We block neither.
- Anthropic documents all three of its bots as honouring `robots.txt` (updated
  Feb 2026); OpenAI's docs no longer promise `robots.txt` compliance for
  `ChatGPT-User` specifically. Irrelevant here — we allow everything — but worth
  recording so nobody assumes a future `Disallow` would be universally obeyed.

Sources for this table are in §15.

---

## 9. How to inject the head tags and JSON-LD — **recommendation: build time**

This is the highest-stakes technical decision in this spec.

**The situation.** The site is client-rendered React with no SSR and no
prerender step. If the `<title>`, meta, canonical and JSON-LD are rendered by
React, they exist only after JavaScript executes.

**The evidence.** Googlebot renders JavaScript and would see them. Most other
AI crawlers do not: the broadest public measurement to date (Vercel/MERJ,
December 2024) found that none of the major AI crawlers it examined executed
JavaScript at all, and Google's own May 2026 AI-features guidance says AI can
process JS-rendered content "only when it isn't blocked" and calls the approach
"more complex", with an explicit recommendation that sites relying on
client-side rendering consider an alternative. A page whose only structured data
appears after hydration is, to `OAI-SearchBot`, `PerplexityBot` and
`Claude-SearchBot`, a page with no structured data and no meta description.

**Recommendation.** Inject everything at build time into `index.html` with a
tiny Vite plugin using `transformIndexHtml`, which imports `buildMeta`,
`buildJsonLd` and `serializeJsonLd` directly. The head is then present in the
raw HTML response for every crawler, JS or no JS. React renders **no** document
metadata — no `<title>` from React 19's metadata hoisting, no JSON-LD component
— so there is exactly one of each tag and no possibility of a duplicate or a
divergence.

**The trade-off, stated plainly.** Build-time injection means the head is static
for a given build: a copy or config change requires a rebuild. That costs
nothing here — the site is static, has one URL, no per-request variation and no
user-specific content, and it rebuilds on every push anyway. The other cost is a
constraint on `src/seo/`: it must stay Node-importable — no DOM, no
`import.meta.env`, no CSS or asset imports. That is exactly how `types.ts`,
`meta.ts` and `jsonld.ts` are written, and why `mode` is a parameter.

**The alternative, and why not.** React-rendered tags would work for Googlebot
and would let the head vary at runtime. We do not need runtime variation, and
the population we would be giving up — the retrieval crawlers that produce
assistant citations — is precisely the audience the AEO work exists to reach.
Not worth it.

Full plugin spec, including the `mode` derivation and the exact `<title>`
replacement, is in `docs/qa/requests.md` (request SEO-1) for the
`frontend-engineer`.

A build-time gate is also cheap to add and worth it: after `vite build`, assert
that `dist/index.html` contains `application/ld+json`, exactly one `<title>`,
and — when `public/CNAME` exists — a canonical link and no `noindex`. Requested
as SEO-2.

---

## 10. Validation

Run 2026-08-29 against the compiled modules with representative data
(the real `site.ts` values, the four approved packages, all eight approved Q&As,
two images). Script was throwaway and is not in the repo.

**59 assertions, 59 passed, 0 failed.** Coverage:

- **Graph shape** — `@context`, non-empty `@graph`, every node `@id` on the
  canonical origin; all six node types present and cross-referenced
  (`Service.provider` → Florist, `Offer.itemOffered` → Service,
  `Offer.seller` → Florist, `WebSite.publisher` → Florist,
  `WebPage.primaryImageOfPage` → the primary `ImageObject`).
- **Nothing invented** — asserts the **absence** of `telephone`, `streetAddress`,
  `openingHours`, `openingHoursSpecification`, `aggregateRating` and `review`,
  and that `address` has exactly locality + region + country.
- **Service area** — `geoRadius` is the string `"80467"`; `geoMidpoint` is the
  Greensburg centroid; `City` Pittsburgh and `AdministrativeArea` Western
  Pennsylvania both present.
- **Prices** — 4 `Offer`s, exactly 3 with a `price` (895 / 1495 / 1995, all
  `USD`), custom quote has none; `priceRange` derives to `$895–$1,995`;
  `eligibleQuantity` ranges correct. With
  `exposePricesInStructuredData: false`: zero prices and no `priceRange`.
- **FAQ** — 8 `Question`s, every one with a non-empty `name` and
  `acceptedAnswer.text`; order is the §11.1 order; and the answer strings are
  **byte-identical** to `owner-answers.md`.
- **Preview mode** — every `@id` uses the GitHub Pages host.
- **Serialisation safety** — a hostile string containing `</script>` and `<!--`
  round-trips through `JSON.parse` with no raw `</script` or `<!--` in the output.
- **Meta** — title/description passed through unchanged; canonical is the apex
  with a trailing slash; `index,follow` + `max-image-preview:large` on canonical;
  `noindex,nofollow` **and no canonical link** on preview; `og:image` made
  absolute and correct under the preview base path; rendered attributes escaped.

`tsc --strict --noUnusedLocals --noUnusedParameters` is clean on all three
modules.

**Still to do after launch** (`docs/SEARCH-SETUP.md`): Google Rich Results Test
and Schema Markup Validator against the live URL. These need a public URL and
cannot be run now.

---

## 11. The FAQ section

### 11.1 Order — decided

Placement is fixed by ux-spec §1.1 (position 8, between About and Inquiry).
Order is decided here. **This is a display-order decision only — not one word of
any question or answer changes.**

| #   | Question                                          | Source # |
| --- | ------------------------------------------------- | -------- |
| 1   | What's included with a Happy Days Flower Bar?     | 1        |
| 2   | How far do you travel? Is there a travel fee?     | 4        |
| 3   | How far in advance should we book?                | 3        |
| 4   | How many flowers does each guest get?             | 2        |
| 5   | Can the flowers match our event or brand colors?  | 5        |
| 6   | Do guests need any experience arranging flowers?  | 7        |
| 7   | Can the flower bar be outdoors? What if it rains? | 8        |
| 8   | What happens after the event?                     | 6        |

Three principles, applied in order:

1. **Define, then qualify.** #1 tells a reader (and an engine) _what the thing
   is_ — an engine needs the entity before the geography. #2 and #3 are the two
   questions that decide whether a deal is possible at all: can you come to me,
   and can you come in time. A visitor who fails either one is not a lead, and
   they deserve to find that out in two seconds. Everything after #3 is detail
   for someone who already qualified.
2. **Net-new facts outrank restatements.** The FAQ's job is to add information,
   not repeat the page. #1 and #4 largely restate the Packages intro and its
   footnote; #2 and #3 contain the travel radius and the 3–4 week lead time,
   which appear **nowhere else on the page**. That is the argument for moving
   travel from source position 4 to position 2 — and, per §2.4, it also lifts the
   only load-bearing "Pittsburgh" sentence in the copy set high into the DOM,
   which is the one geographic lever available without touching approved copy.
3. **Close on the reassuring note.** #8 "What happens after the event?" is
   chronologically last and ends on "Your guests take their bouquets home with
   them" — a good final line to read immediately before "Let's Bring the Flower
   Bar to You" and the form. #6 and #7 (no experience needed, rain plan) sit
   just above it as the lowest-stakes reassurances.

The order is preserved identically in the DOM and in `FAQPage.mainEntity`
because both derive from the same array (§11.3).

### 11.2 Markup — concur with ux-spec §1.2, with three non-negotiables

Native `<details>`/`<summary>`, collapsed by default, question as an `<h3>`
inside the `<summary>`. That is the right call for this page and it is safe for
search — but only if all three of the following hold:

1. **Every answer is in the DOM on first render**, open or closed. `<details>`
   hides its content with the browser's own mechanism; the text is still in the
   HTML, and both Google and raw-HTML fetchers read it. What would break this is
   React conditionally rendering the `<p>` on toggle. It must not.
2. **No `hidden`, `display:none` or `aria-hidden` on the answer element.**
   `<details>` needs none of them.
3. **No JS accordion.** If the exclusive-accordion `name="faq"` attribute is
   used, that is fine — it is a native HTML attribute and does not change what is
   in the DOM.

A pure-HTML crawler check after build: `grep` the eight answer strings in
`dist/index.html`… which will fail, because the page is client-rendered. That is
the same problem §9 solves for the head, and it is why the `FAQPage` JSON-LD
must be injected at build time: **for a non-JS-executing fetcher, the JSON-LD is
the only copy of the answers in the HTML response.** This is the strongest single
argument for the build-time recommendation.

### 11.3 `FAQPage` JSON-LD rules

- Questions and answers come from `copy.faq.items` — the same array the
  `<details>` render from. Never a second transcription.
- Order in `mainEntity` = order in the DOM. Guaranteed structurally by deriving
  both from one array: **reorder `copy.faq.items` in `copy.ts` to the §11.1
  order** and render/serialise it in array order. (Its current comment says the
  SEO specialist may specify a display order; this is that specification.
  Reordering the array beats an index-map because it makes divergence
  impossible.) Requested as SEO-3.
- `Answer.text` is the plain answer sentence(s), no HTML, no truncation.
- `FAQPage.name` = `copy.faq.heading` (currently "Frequently Asked Questions").
- Exactly one `FAQPage` node on the page.
- If a Q&A is ever removed from the page, it must be removed from the markup in
  the same commit.

---

## 12. Images — filenames and alt text for search

Alt text is owned by `ux-spec.md` §7 and is already written; nothing here
overrides it. Two search-specific points:

**Filenames.** The nine source filenames are already descriptive and keyword-honest
(`hero-flower-bar`, `flower-bar-closeup`, `farm-bouquet-pink-white`,
`farm-zinnias`, `gallery-event-detail`, `about-still-life`, …). Keep them —
lowercase, hyphenated, no stuffing. Two notes:

- `about-still-life.*` names a private individual, and per request Q6 in
  `docs/qa/requests.md` the photo contains **no person at all** — it is a
  delphinium still life. So the filename is both a small R10 exposure on a
  publicly served file and simply inaccurate. Prefer renaming the optimised
  output to `about-the-farm` or `about-delphinium-vase`; the gitignored source
  name stays as supplied. Low priority; the engineer's call. Filed as SEO-4.
- The `sharp` pipeline emits width-suffixed variants (`-480`, `-768`, `-1152`).
  Keep the descriptive stem in every variant; do not collapse to hashes.

**Alt text, search-specific guidance** (to check against ux-spec §7, not replace it):

- Describe the picture, not the keyword list. "A guest choosing stems at a Happy
  Days flower bar" is good; "flower bar Pittsburgh pop-up flower bar rental" is
  spam and is exactly what an image-alt spam filter is tuned for.
- The hero alt is the one worth 15 seconds of care — it is the LCP element and
  the most likely image to surface in Images/Discover.
- Do not put the business name in all nine alts. Once or twice is plenty.
- Decorative images: none on this page; every image is content and needs real alt
  text.
- `og.jpg` gets its alt via `og:image:alt` from `buildMeta`; write it as a
  standalone sentence — it is read aloud in some social clients and by some
  assistants, with no page context around it.

**Structured data:** pass the 1152 w **JPEG** variants to `buildJsonLd`, not AVIF
or WebP. Crawler format support for AVIF is still uneven and this is the one place
where the widely-supported format is the right default.

---

## 13. Needs approval — visible-copy items, listed not applied

Nothing in this list has been implemented. All of it is optional.

| #   | Item                                                                                              | Who approves     | Recommendation                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | FAQ section heading. Neither source supplies one. Proposed: **"Frequently Asked Questions"**.     | Owner (via Sean) | **Ship it.** Plain, entity-clear, universally understood. "Flower Bar FAQ" is a reasonable alternative; "Good to Know" and similar are worse for search because they name nothing. |
| A2  | Alternative `<title>`: `Pop-Up Flower Bars in Pittsburgh & Western PA \| Happy Days Flower Farm`. | Sean             | **Not for launch.** Ship the approved title; revisit as a measured experiment ~90 days after launch (§3).                                                                          |
| A3  | Adding "Pittsburgh" to a visible heading or the hero paragraph.                                   | Owner            | **No.** The copy is approved and reads well. §2.4 lever 2 gets most of the benefit for free.                                                                                       |
| A4  | Renaming the optimised output of `about-still-life.*` (§12).                                      | Sean / engineer  | Minor; do it if it is free.                                                                                                                                                        |
| A5  | A dedicated `/pittsburgh` service page.                                                           | Sean             | **V2, not now.** Only if Search Console shows Pittsburgh impressions with weak position after ~90 days. It would need new copy from the owner.                                     |

---

## 14. What an answer engine would extract — pre-check

For each high-intent question, the exact passage an engine would lift, and
whether it stands alone without its surrounding context. A passage that needs
context is a passage that gets misquoted.

| Query                                   | Passage it lifts                                                                 | Self-contained? | Note                                                                                                                                                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| what is a pop-up flower bar             | Flower Bar Introduction, para 2 ("Our Pop-Up Flower Bar arrives fully stocked…") | ✅ Yes          | Names the service, the deliverable and the logistics in two sentences. Also `Service.description`.                                                                                                                             |
| who does flower bars near Pittsburgh    | FAQ #2, full answer                                                              | ✅ Yes          | Contains the business name, Greensburg, Pittsburgh, Western Pennsylvania and the 50 mi / 1 h radius. The single best passage on the page. Mirrored by `GeoCircle` + `City`.                                                    |
| what's included in a flower bar         | FAQ #1 / Packages intro                                                          | ✅ Yes          | Both say the same thing; the FAQ version is the cleaner standalone.                                                                                                                                                            |
| how much does a flower bar cost         | Package cards; `Offer` nodes                                                     | ⚠️ Partly       | "$1,495" alone is meaningless. **The guest range must be plain text adjacent to the price in the card DOM** (ux-spec §4.4 requires all four facts visible) and `eligibleQuantity` carries it in the markup. Both are in place. |
| how many flowers per guest              | FAQ #4 / Packages footnote                                                       | ✅ Yes          | "approximately 10 stems per participating guest" — quotable verbatim.                                                                                                                                                          |
| how far in advance to book a flower bar | FAQ #3                                                                           | ✅ Yes          | "at least 3–4 weeks" with the seasonal caveat.                                                                                                                                                                                 |
| can a flower bar match our brand colors | FAQ #5                                                                           | ✅ Yes          | Leads with "Yes." — the ideal shape for an extracted answer.                                                                                                                                                                   |
| do you need experience / is it hard     | FAQ #6                                                                           | ✅ Yes          | Leads with "No."                                                                                                                                                                                                               |
| can it be outdoors / what if it rains   | FAQ #7                                                                           | ✅ Yes          | Leads with "Yes, with…" and states the condition.                                                                                                                                                                              |
| how do I book / contact                 | Inquiry section + footer                                                         | ⚠️ Partly       | There is no phone number, by decision. `llms.txt` states this explicitly so an assistant says "inquiry form or email" rather than inventing a number. `Florist.email` carries it in the graph.                                 |
| do they serve weddings                  | —                                                                                | ❌ No           | Not claimed anywhere, correctly — the brief rules out wedding-florist positioning. An engine will say it does not know. That is the right answer.                                                                              |

**The one structural risk, restated:** every ✅ above assumes the passage is in
the HTML a fetcher receives. For a non-JS crawler, none of the visible copy is —
only the head and the JSON-LD are, and only if §9 is implemented. The
`FAQPage` graph and `llms.txt` are the two places those answers survive without
JavaScript.

---

## 15. Sources — verified 2026-08-29

Search and fetch, not memory. This area changes monthly; re-verify §8 before any
future robots.txt change.

**Crawler identity**

- OpenAI, "Overview of OpenAI Crawlers" — `GPTBot` (training), `OAI-SearchBot` (search/citation), `ChatGPT-User` (user-initiated). https://developers.openai.com/api/docs/bots
- Anthropic crawler documentation (updated ~2026-02-20) — `ClaudeBot`, `Claude-User`, `Claude-SearchBot`, all honouring robots.txt independently. Reported: Search Engine Land, https://searchengineland.com/anthropic-claude-bots-470171 · Search Engine Roundtable, https://www.seroundtable.com/anthropic-updates-its-crawler-docs-40978.html
- 2026 consolidated crawler references (cross-checked for the names in §8): https://www.honeyb.ai/blog/ai-crawler-user-agents-reference-2026 · https://www.cite.sh/blog/ai-crawler-guide/

**Google guidance**

- Google, "Optimizing your website for generative AI features on Google Search", published 2026-05-15 — structured data is not _required_ for AI features; JS-rendered content is processed "only when it isn't blocked" and the approach is "more complex"; client-side-rendering sites should consider an alternative. Analyses: https://www.seostrategy.co.uk/llm-optimisation/google-ai-optimisation-guide-2026/ · https://ethanlazuk.com/blog/what-i-think-about-googles-optimizing-your-website-for-generative-ai-features-on-google-search-guidance/ · https://meowapps.com/google-may-2026-ai-guide-seo-engine/
- FAQ rich results ceased appearing 2026-05-07; Search Console reporting retired June 2026, API August 2026; `FAQPage` remains valid schema.org and is worth keeping where content is genuinely Q&A-shaped. https://www.quattr.com/blog/faq-schema-in-2026 · https://alevdigital.com/blog/faq-structured-data-2026/ · https://launchcodex.com/blog/seo-geo-ai/google-drops-faq-rich-results/

**AI crawlers and JavaScript**

- Vercel / MERJ crawler study, December 2024 — none of the major AI crawlers measured executed JavaScript. Still the broadest public measurement as of August 2026; summarised in the 2026 JS-SEO reference at https://www.seo-kreativ.de/en/blog/javascript-seo-rendering/

**Service-area business schema**

- 2026 guidance on service-area schema: omit `streetAddress`; do not mix a street address with a tight `areaServed` radius; `GeoCircle`/`GeoShape` refinements (schema.org, late 2025) are weighted by Google's service-area handling from early 2026. https://innovativegroup.io/blog/schema-markup-service-area-businesses-2026/ · https://thebomb.ca/blog/schema-markup-local-business-2026/
- `schema.org/areaServed`: https://schema.org/areaServed

**llms.txt**

- Status as of 2026: community proposal, not an IETF/W3C standard; adoption rising but low outside tech/docs sites; Google's May 2026 guide states it is not needed for AI Overviews or AI Mode. https://ai.aeo.press/the-state-of-llms-txt-in-2026 · https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained

**Reference sites** (fetched 2026-08-29, §2.1)

- https://rootstopetalsstudio.com/pages/event-flowers-flower-bars
- https://flairflowerbar.com/pages/rent-a-flower-bar-in-cincinnati-ohio-and-florence-kentucky
- https://www.gardenmusesstudio.com/pages/pop-up-floral-bar-corporate-events-washington-dc-maryland-virginia
- https://www.blossomflowerbar.com

**Geography**

- Greensburg, Pennsylvania city centre 40°17′52″N 79°32′32″W → 40.2978, −79.5422. https://en.wikipedia.org/wiki/Greensburg,_Pennsylvania
