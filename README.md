# happy-days-flower-bar-site

[![Deploy to GitHub Pages](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/workflows/deploy.yml)

Source for a single-page static website with one inquiry form, deployed to GitHub
Pages. This README covers the engineering only; the site itself is the place for
what the business does. All visible copy is owner-approved text held in one file and
checked verbatim at build time.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind 4 (`@theme` tokens) · self-hosted variable
fonts. No runtime backend — the build output in `dist/` is plain static files served
by GitHub Pages. Images are pre-generated AVIF/WebP/JPEG at four widths by a `sharp`
script, so nothing is transformed at request time.

## Commands

| Command           | What it does                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR.                                                                                                                                                                             |
| `npm run build`   | Typecheck, then build to `dist/`.                                                                                                                                                                     |
| `npm run preview` | Serve the built `dist/` locally — the closest thing to production.                                                                                                                                    |
| `npm run check`   | The pre-commit gate: typecheck → lint → config check → build → copy check.                                                                                                                            |
| `npm run qa`      | Screenshots, axe accessibility scan and Lighthouse against a local preview. Writes into `docs/qa/`.                                                                                                   |
| `npm run images`  | Re-generate `public/images/` (+ `og.jpg`, `apple-touch-icon.png`) and `src/content/images.generated.ts` from `assets-src/images/`.                                                                    |
| `npm run qa:form` | Drive the inquiry form against the local mock backend in every mode and screenshot each state into `docs/qa/screenshots/form/`.                                                                       |
| mock backend      | `node scripts/mock-inquiry-server.mjs --mode ok`, then `VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev` — the form, live, with no deployed backend ([recipe](#working-on-the-form-locally)). |

Run `npm run check` before every commit and `npm run qa` before a release. If a
`TODO_` placeholder is ever reintroduced in `src/config/site.ts`, `npm run check --
--allow-todos` downgrades it to a warning; CI runs the strict form.

`npm run qa` and the copy check drive a headless Chromium via Playwright; if it is
missing locally, run `npx playwright install chromium` once.

## How deploys work

Push to `main` → the [`deploy.yml`](.github/workflows/deploy.yml) workflow runs
`npm ci`, `npm run check` and uploads `dist/` → GitHub Pages
publishes it. There is no manual deploy step and no other environment. The workflow
also enables Pages on its first run and picks the correct Vite `base` automatically:
the repository sub-path while the site lives on `github.io`, or `/` once
`public/CNAME` exists for the custom domain. A bad release is rolled back by
reverting the commit and pushing — the same pipeline redeploys.

## Where things live

| What                                                                           | Where                                                                                               |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| All visible copy                                                               | `src/content/copy.ts` (verbatim — change wording only with the owner's approval)                    |
| Site config (email, socials, inquiry provider/endpoint, SEO title/description) | `src/config/site.ts`                                                                                |
| Design tokens (colour, type, spacing)                                          | `src/styles/theme.css`, imported by `src/styles/index.css`                                          |
| Image sources / outputs                                                        | `assets-src/images/` (originals, gitignored) → `public/images/` + `src/content/images.generated.ts` |
| Structured data, meta, sitemap                                                 | `src/seo/`, `public/{robots.txt,sitemap.xml,llms.txt}`                                              |
| Specs and QA records                                                           | `docs/` — `ux-spec.md`, `design-spec.md`, `seo-aeo-spec.md`, `qa/`                                  |

## Inquiry form

Submissions post to a Google Apps Script web app whose only capability is appending a
row to a Google Sheet — it holds a single OAuth scope and sends no email. The endpoint's contract ends there: the Sheet is the record of truth, and being
told that a row has landed is out of scope for the site (D20), handled by a separate
workflow outside this repo. Web3Forms is a documented fallback and `mailto:` is the
always-available escape hatch. No secrets live in this repository — see
[`integrations/README.md`](integrations/README.md).

### Working on the form locally

There is no need for a deployed backend. `scripts/mock-inquiry-server.mjs` stands in
for the Apps Script `/exec` endpoint on `:8787`, and `VITE_INQUIRY_ENDPOINT` points the
app at it. In two terminals:

```sh
node scripts/mock-inquiry-server.mjs --mode ok
VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev
```

Change `--mode` to drive the state you want to see:

| Mode            | What the backend does                              | What the form shows                                                                                      |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ok`            | `{ ok: true }`                                     | Confirmation panel                                                                                       |
| `quarantine`    | `{ ok: true, quarantined: true }`                  | Confirmation panel — a flagged lead is still saved, and the visitor is never told they looked like a bot |
| `reject`        | `{ ok: false, reason: 'rejected' }`                | Error panel with the prefilled `mailto:`                                                                 |
| `error`         | HTTP 500                                           | Error panel with the prefilled `mailto:`                                                                 |
| `slow`          | 6 s, then `{ ok: true }`                           | "Sending…", button disabled                                                                              |
| `nonce-blocked` | 500 on the nonce `GET`, `{ ok: true }` on the POST | Confirmation panel — the missing nonce must never cost a lead (fail open)                                |

`npm run qa:form` runs all of that unattended: it builds with the override, walks the
form in each mode and asserts the outcomes, then rebuilds `dist/` on the committed
configuration. Screenshots land in `docs/qa/screenshots/form/` (gitignored).

## More documentation

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — plain-language guide to changing content
- [`docs/RELEASE.md`](docs/RELEASE.md) — release and domain-cutover runbook
- [`docs/SEARCH-SETUP.md`](docs/SEARCH-SETUP.md) — post-launch Search Console / Business Profile checklist
- [`integrations/README.md`](integrations/README.md) — inquiry form backends
- [`CLAUDE.md`](CLAUDE.md) — conventions for maintenance sessions in Claude Code

---

© Happy Days Flower Farm, LLC. All rights reserved.
