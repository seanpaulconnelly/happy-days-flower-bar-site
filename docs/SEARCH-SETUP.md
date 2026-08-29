# Search setup — post-launch checklist

Written for **Sean** (technical). Steps that need **Bethany** (the business
owner, or her Google account) are marked. Nothing here can be automated by an
agent: every step is a browser or DNS action.

Run this **after** Phase 9 (domain cutover) is complete — i.e. after
`happydaysflowers.com` serves the site over HTTPS. Doing it before means
verifying and submitting a URL that redirects, which wastes a crawl budget you
do not have and can get the wrong host cached.

Total time: ~30 minutes for §1–§3, plus ~20 minutes with Bethany for §4.

Legend: 🔧 Sean · 🌸 Bethany · 🤝 both, one sitting

---

## 0. Before you start

| Need                                      | Where it is                                                   |
| ----------------------------------------- | ------------------------------------------------------------- |
| The Happy Days Google account             | 🌸 Bethany — `…@happydaysflowers.com`. **Use this account for everything below**, never a personal one. (Plan §8 Q22.) |
| DNSimple access                           | 🔧 Sean — same session as the Pages DNS records                |
| Canonical URL                             | `https://happydaysflowers.com/`                               |
| Sitemap URL                               | `https://happydaysflowers.com/sitemap.xml`                    |
| Business name, exactly                    | `Happy Days Flower Farm`                                      |
| City / region                             | Greensburg, Pennsylvania                                      |
| Service area                              | ≈ 50 miles / 1 hour around Greensburg, including Pittsburgh   |
| Email                                     | `hello@happydaysflowers.com`                                  |
| Instagram                                 | https://www.instagram.com/happydaysflowerfarm                 |
| Facebook                                  | https://www.facebook.com/happydaysflowers                     |

**Do not publish** anywhere in this process: a phone number, a street address,
retail opening hours, or deposit/payment terms. None is approved for V1
(`answers-from-bethany.md` §3c). §4.3 explains the one place Google will ask for
an address anyway and what to do about it.

---

## 1. 🔧 Verify the cutover before touching Search Console

Five commands. All five must pass; if any fails, fix it first — Search Console
will otherwise record the failure and you will wait days for a re-crawl.

```sh
DOMAIN=happydaysflowers.com

# 1. apex serves the site over HTTPS with a valid cert
curl -sI "https://$DOMAIN/" | head -1                      # expect: HTTP/2 200

# 2. www redirects to apex (GitHub Pages does this automatically once the
#    custom domain is set; DNSimple must have CNAME www -> seanpaulconnelly.github.io)
curl -sI "https://www.$DOMAIN/" | grep -i '^location'      # expect: https://happydaysflowers.com/

# 3. the noindex is GONE and the canonical is present
curl -s "https://$DOMAIN/" | grep -Eio '<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>'
#    expect exactly: robots content="index,follow"  AND  canonical href="https://happydaysflowers.com/"
#    if you still see noindex, public/CNAME is missing from the build (decision D5)

# 4. structured data is in the HTML response, not just after JS
curl -s "https://$DOMAIN/" | grep -c 'application/ld+json'  # expect: 1
curl -s "https://$DOMAIN/" | grep -o '"@type":"Florist"'    # expect: a match

# 5. robots.txt and sitemap.xml are served and point at the apex
curl -s "https://$DOMAIN/robots.txt" | tail -2
curl -s "https://$DOMAIN/sitemap.xml"
```

Step 4 is the one people skip. If `grep -c 'application/ld+json'` returns `0`,
the JSON-LD is being rendered by React instead of injected at build time, and
every non-JavaScript AI crawler sees a page with no structured data. See
`docs/seo-aeo-spec.md` §9.

Also confirm the old preview URL no longer serves the site: once a custom domain
is set, GitHub Pages redirects `seanpaulconnelly.github.io/happy-days-flower-bar-site/`
to the apex, so nothing is left to be indexed there.

---

## 2. 🤝 Google Search Console

Sign in as **the Happy Days Google account**. If Sean sets it up under his own
account, ownership has to be migrated later — do it right the first time.

1. **Add a Domain property** (not a URL-prefix property). Enter
   `happydaysflowers.com` with no scheme and no `www`.
   *Why a Domain property:* it covers `http`/`https`, apex and `www`, and every
   subdomain in one property. A URL-prefix property would miss the `www` variant
   and you would need two.
2. Google shows a **TXT record** to add. 🔧 In DNSimple, on
   `happydaysflowers.com`, add a TXT record with an **empty/`@` name** and the
   `google-site-verification=…` string as the value. Same session as the Pages
   records.
3. Wait for propagation (usually < 5 min; `dig +short TXT happydaysflowers.com`
   should show it) and click **Verify**.
   *We verify by DNS, not by an HTML meta tag or file, so no verification token
   ever lands in the public repo.*
4. **Sitemaps → Add a new sitemap →** `sitemap.xml` → Submit. Expect "Success"
   and 1 discovered URL. "Couldn't fetch" usually just means Google has not
   retried yet; re-check the next day before debugging.
5. **URL Inspection** on `https://happydaysflowers.com/` → **Request indexing**.
   One-time nudge; do not use it repeatedly.
6. In URL Inspection, open **View crawled page → Screenshot / HTML**. Confirm
   Google's *rendered* HTML shows the real page content, not an empty
   `<div id="root">`. This is the check that catches a broken client-render.
7. **Settings → Users and permissions:** 🌸 Bethany is the verified owner;
   add Sean as a **Full** user so he can debug without holding ownership.

Nothing else in Search Console needs configuring. Ignore the Enhancements
reports for FAQ — Google stopped reporting on FAQ markup in mid-2026
(`docs/seo-aeo-spec.md` §5.6); its absence is expected, not a bug.

---

## 3. 🔧 Bing Webmaster Tools

Five minutes, and it feeds Bing, DuckDuckGo and Microsoft Copilot.

1. Sign in at https://www.bing.com/webmasters with the same Google account.
2. Choose **Import from Google Search Console** — it carries over the property,
   the verification and the sitemap. Manual verification is a DNS TXT record if
   the import route is unavailable.
3. Confirm the sitemap shows as submitted. Nothing else to do.

---

## 4. 🤝 Google Business Profile — service-area business, address hidden

**This is the highest-value item on the page.** For a local service business,
the Business Profile drives more discovery than the website does, and it is the
main input to Google's local pack and to "near me" answers in AI Overviews.

Decision already made (Bethany, `answers-from-bethany.md` §3c): **Option B —
service-area business with the home address hidden.** The profile basics exist
but are not published yet.

Sign in as **the Happy Days Google account** at
https://business.google.com. 🌸 Bethany drives; 🔧 Sean sits with her.

### 4.1 Identity

| Field       | Value                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Name        | `Happy Days Flower Farm` — exactly this, no city, no keywords appended. Adding "Pittsburgh Flower Bars" to the name is a guideline violation and a common cause of suspension. |
| Website     | `https://happydaysflowers.com/` — the apex, with `https`, no tracking parameters |
| Description | Use the site's About copy or the meta description. Do not write new claims. |

### 4.2 Categories

- **Primary: `Florist`**
- Secondary: `Event planning service`

Primary category carries far more ranking weight than secondary ones, so
`Florist` is the one that matters. There is no "flower bar" category — that is
what §4.5 is for.

### 4.3 Address and service area — the part to get right

Google will ask for a **street address during setup and verification**. That is
unavoidable and it is *not* the same as publishing it:

1. Enter the real address when asked (it is used for verification and to anchor
   the service area).
2. Answer **"No"** to *"Do you serve customers at this address?"* /
   tick **"I deliver goods and services to my customers"**.
3. Google then **hides the address from the public profile** and shows the
   service area instead. Verify this afterwards by viewing the live profile in a
   logged-out browser or incognito window — 🌸 do this before considering the
   step done.

**Service area:** add `Greensburg, PA`, `Pittsburgh, PA`, and `Westmoreland
County, PA` / `Allegheny County, PA`. Google's service-area picker takes cities,
counties or ZIPs, not a radius; these approximate the "≈ 50 miles / one hour
from Greensburg" area from `answers-from-bethany.md` §3d and match the
`GeoCircle` in the site's structured data. Do not list twenty towns — a small
number of accurate areas outperforms a padded list.

**Hours:** set **"By appointment"** (or "Open with no main hours" if that is the
only option offered). Do not enter retail hours — §3c is explicit.

**Phone:** 🌸 **Bethany's decision, not ours.** No phone is published on the
website by decision. A GBP phone number is optional; it does help calls and is a
mild ranking signal, and a GBP number is *not* the same as putting one on the
site. If she does not want one, leave it blank — the profile works with a
website only.

**Verification:** service-area businesses are usually verified by **video** now
(a short recording showing the business, equipment and the owner). 🌸 Bethany's
job. Budget a few days for review; nothing else on this list blocks on it, but
the profile stays unpublished until it clears.

### 4.4 Photos

🌸 Upload 5–10 of the same optimised images used on the site (flower bar setups,
bouquets, the farm). Photos are the single biggest driver of profile engagement.
No photos of the house or anything that reveals the address.

### 4.5 Services

Add a service so the profile carries the exact phrase the site is optimised for:

- Service name: **`Pop-Up Flower Bar`**
- Description: reuse the approved Flower Bar Introduction copy from the site.

Optionally add `Custom Floral Experience`. Do **not** enter prices in GBP for V1 —
the site's `Offer` markup already carries them, and a price shown in two places
is a maintenance trap.

### 4.6 After it is live

- 🌸 Post the website link and encourage genuine reviews from past event clients.
  **Never** offer anything in exchange for a review — that is a suspension risk,
  and it is also why the site's structured data carries no ratings.
- Reviews will accumulate on GBP. They are **not** to be copied into the site's
  structured data as `aggregateRating`: self-serving review markup for a
  business's own reviews is against Google's policy and gets the whole graph
  ignored.

---

## 5. 🌸 Social profiles

Both are already in the site's `sameAs` structured data, so the link should go
both ways:

- **Instagram** (`@happydaysflowerfarm`) — put `https://happydaysflowers.com/` in
  the bio link field. If a link-in-bio aggregator is used, the site should still
  be the first entry.
- **Facebook** (`facebook.com/happydaysflowers`) — set the Website field to the
  apex URL, and set the page category to Florist.
- Use the exact name `Happy Days Flower Farm` on both, and the same city
  (Greensburg, PA).

---

## 6. NAP consistency — what it means when there is no P and no A

"NAP" is Name / Address / Phone. Happy Days publishes **neither an address nor a
phone**, by decision. That is a perfectly workable configuration for a
service-area business, but it changes what consistency means:

- **The name does all the work.** `Happy Days Flower Farm`, spelled exactly that
  way, everywhere: the site, GBP, Instagram, Facebook, any directory. No
  "Happy Days Flowers", no "Happy Days Flower Farm LLC", no appended city.
- **The website URL is the second identifier.** Always the apex
  `https://happydaysflowers.com/` — never `www`, never the old `github.io` URL,
  never with UTM parameters on a profile link.
- **The city is the third.** Greensburg, Pennsylvania. The site says it, the
  structured data says it, GBP says it.
- **Do not create directory listings** (Yelp, Yellow Pages, wedding directories)
  that require an address or phone. An inconsistent or invented address in a
  third-party listing is worse than no listing, and it is very hard to remove.
  If a listing is created later, it must use the same name, the same city, no
  street address, and the apex URL.
- If a phone number is ever published, it must appear in **all** places at once —
  site, GBP, socials — and `site.contact.phone` must be filled in so the
  structured data picks it up automatically (`src/seo/jsonld.ts` omits the key
  only while it is empty).

---

## 7. 🔧 Google Analytics 4 — one-line change, owned by the engineer

The site ships with the loader inert. To turn it on:

1. 🤝 Create the GA4 property under the Happy Days Google account (plan P0.7).
   Web data stream for `https://happydaysflowers.com`. Copy the Measurement ID
   (`G-XXXXXXXXXX`).
2. 🔧 In `src/config/site.ts`, set:
   ```ts
   analytics: { ga4MeasurementId: 'G-XXXXXXXXXX' },
   ```
   Commit and push. That is the whole change.
3. `gtag.js` loads **only** when the ID is set *and* the page is served from
   `happydaysflowers.com` — never on the preview host (plan §1, Analytics).
   Verify in GA4 Realtime after the deploy.
4. Link the GA4 property to Search Console (GA4 → Admin → Product links →
   Search Console) so query data appears alongside behaviour data.

The wiring itself is owned by `frontend-engineer`; this is only the switch.

---

## 8. 🔧 Post-launch structured data validation

Could not be run before launch — both tools need a public URL.

1. **Rich Results Test** — https://search.google.com/test/rich-results on
   `https://happydaysflowers.com/`. Expect zero errors. Expect it to detect the
   `Offer`/merchant items and **not** to offer an FAQ preview (FAQ rich results
   were retired in May 2026 — this is expected, see `docs/seo-aeo-spec.md` §5.6).
2. **Schema Markup Validator** — https://validator.schema.org/ on the same URL.
   This one shows the whole graph, including the types Google no longer previews.
   Confirm: one `Florist`, one `Service`, one `OfferCatalog` with four `Offer`s,
   one `FAQPage` with eight `Question`s, and — the important negative check — no
   `telephone`, no `streetAddress`, no `aggregateRating`.
3. **Facebook Sharing Debugger** — https://developers.facebook.com/tools/debug/
   and **X Card Validator**. Both mainly to force a cache refresh of `og.jpg` so
   the first share does not show a stale or missing image.
4. 🔧 Sanity-check the AI-crawler view — this is what a non-JS fetcher sees:
   ```sh
   curl -s -A 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)' \
     https://happydaysflowers.com/ | grep -c 'happydaysflowers.com'
   curl -s https://happydaysflowers.com/llms.txt | head -5
   ```

---

## 9. 🔧 Check back

| When              | What                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| +3 days           | Search Console: is the URL indexed? (`URL Inspection` → "URL is on Google"). Sitemap read successfully.                     |
| +2 weeks          | GBP verification cleared and the profile is live; address confirmed hidden in an incognito window.                          |
| +30 days          | Search Console Performance: which queries produce impressions. Expect brand terms plus "flower bar" variants first.         |
| +90 days          | The real read. If "Pittsburgh"-modified queries show impressions but positions 15+, that is the trigger for the V2 `/pittsburgh` service page (`docs/seo-aeo-spec.md` §13, A5) — which needs new copy from Bethany. Also the point to revisit the `<title>` experiment (A2). |
| When copy changes | Bump `<lastmod>` in `public/sitemap.xml` and re-check `public/llms.txt` against `src/content/copy.ts`.                      |

---

## 10. Deliberately not done

So nobody adds them later thinking they were forgotten:

- **No third-party SEO plugins, tag managers or tracking scripts.** GA4 is the
  only script, and only on the canonical domain.
- **No directory submissions / citation-building services.** They need an address
  and a phone. See §6.
- **No review markup on the site.** Self-serving `aggregateRating` for a
  business's own reviews violates Google's policy. Reviews live on GBP.
- **No `meta` verification tags.** DNS TXT keeps tokens out of a public repo.
- **No `Disallow` for the preview host.** `noindex` handles it; a `Disallow`
  would stop crawlers reading the `noindex` (`docs/seo-aeo-spec.md` §7.1).
- **No second location page, no blog, no schema for services that do not exist
  yet.** V1 is one page and one service.
