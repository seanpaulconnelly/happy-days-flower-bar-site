# Happy Days Flower Farm — website

[![Deploy to GitHub Pages](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/workflows/deploy.yml)

The marketing site for Happy Days Flower Farm — a single-page site for the farm's
pop-up flower bar, a turnkey floral experience brought to businesses, events and
gatherings in Greensburg, Pittsburgh and throughout Western Pennsylvania. One page,
one conversion: the inquiry form. Everything visible on the page is approved copy
transcribed verbatim from the owner's brief; nothing here paraphrases or invents
business facts.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind 4 (`@theme` tokens) · self-hosted variable
fonts. No runtime backend — the build output in `dist/` is plain static files served
by GitHub Pages. Images are pre-generated AVIF/WebP/JPEG at four widths by a `sharp`
script, so nothing is transformed at request time.

## Commands

| Command           | What it does                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR.                                                                                                          |
| `npm run build`   | Typecheck, then build to `dist/`.                                                                                                  |
| `npm run preview` | Serve the built `dist/` locally — the closest thing to production.                                                                 |
| `npm run check`   | The pre-commit gate: typecheck → lint → config check → build → copy check.                                                         |
| `npm run qa`      | Screenshots, axe accessibility scan and Lighthouse against a local preview. Writes into `docs/qa/`.                                |
| `npm run images`  | Re-generate `public/images/` (+ `og.jpg`, `apple-touch-icon.png`) and `src/content/images.generated.ts` from `assets-src/images/`. |

Run `npm run check` before every commit and `npm run qa` before a release. Until the
inquiry endpoint is filled in, use `npm run check -- --allow-todos`, which downgrades
unresolved `TODO_` placeholders in `src/config/site.ts` to a warning (this is also
what CI runs).

`npm run qa` and the copy check drive a headless Chromium via Playwright; if it is
missing locally, run `npx playwright install chromium` once.

## How deploys work

Push to `main` → the [`deploy.yml`](.github/workflows/deploy.yml) workflow runs
`npm ci`, `npm run check -- --allow-todos` and uploads `dist/` → GitHub Pages
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

Submissions post to a Google Apps Script web app that writes to a Google Sheet the
business owns and emails the inquiry inbox; Web3Forms is a documented fallback and
`mailto:` is the always-available escape hatch. No secrets live in this repository —
see [`integrations/README.md`](integrations/README.md).

## More documentation

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — plain-language guide to changing content (to be written)
- [`docs/RELEASE.md`](docs/RELEASE.md) — release and domain-cutover runbook (to be written)
- [`docs/SEARCH-SETUP.md`](docs/SEARCH-SETUP.md) — post-launch Search Console / Business Profile checklist
- [`integrations/README.md`](integrations/README.md) — inquiry form backends
- [`CLAUDE.md`](CLAUDE.md) — conventions for maintenance sessions in Claude Code

---

© Happy Days Flower Farm. All rights reserved.
