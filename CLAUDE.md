# Happy Days Flowers — site

Single-page marketing site. Vite 8 · React 19 · Tailwind 4 · TypeScript. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.

- **All copy: `src/content/copy.ts`** — transcribed verbatim from the owner's approved spec and answers. Never paraphrase it, never invent business facts (no phone number, street address, opening hours or deposit terms exist for this business in V1). Wording changes need the owner's approval. `npm run check` fails if a canonical string stops rendering.
- Config (email, socials, inquiry provider/endpoint, SEO title/description): `src/config/site.ts`.
- **Design tokens: `@theme` in `src/styles/theme.css`**, imported by `src/styles/index.css` (see `docs/design-spec.md`). Tokens live in `theme.css`, app-level CSS in `index.css`. Don't add ad-hoc colours or fonts.
- Images: put originals in `assets-src/images/` (gitignored — originals are never committed), run `npm run images`, commit `public/images/` + `src/content/images.generated.ts`.
- **Before committing: `npm run check`** (strict — no `TODO_` placeholders remain; CI runs the same). Before releasing: `npm run qa`.
- **Brand name:** the site says **Happy Days Flowers** everywhere (D22). The only place the legal entity appears is the footer copyright, `© Happy Days Flower Farm, LLC`, from `site.legalName`. `alternateName` in JSON-LD keeps the old name searchable — don't remove it.
- **Inquiry endpoint = row append only** (D19): no mail scope, no notifications from the site (D20). Don't add `MailApp`/`UrlFetchApp` to `integrations/apps-script/Code.gs` without a decision row.
- FAQ: the order of `copy.faq.items` **is** the display order and the JSON-LD order, fixed by `docs/seo-aeo-spec.md` §11.1. Render and serialise from that one array — don't reorder it or introduce an index map. Question and answer text is verbatim.
- SEO head and JSON-LD are injected into `index.html` at **build time** from `src/seo/` (crawlers don't run JS). React must render no metadata and no `ld+json`.
- Inquiry backend: `integrations/apps-script/` (primary) or `integrations/web3forms/`. No secrets exist in this repo by design.
- Domain/DNS/release steps: `docs/RELEASE.md`. Content how-to for non-engineers: `docs/HANDOFF.md`. Post-launch search checklist: `docs/SEARCH-SETUP.md`.
- Decision record: `docs/qa/decisions.md` (numbered, newest at the bottom — check it before re-litigating a choice). Cross-file requests go in `docs/qa/requests.md` as a row addressed to the owner of the target file, who resolves it and marks the row done.
- Git: the only remote is `github.com/seanpaulconnelly/happy-days-flower-bar-site`; never force-push; `gh` is not used. (When working from the wrapper project, a hook enforces this.)
