# Inquiry form backends

- **Primary: Google Apps Script** — `apps-script/Code.gs` appends every submission to a Google
  Sheet the business owns, and does nothing else. It **sends no email**: the manifest declares
  one scope (`spreadsheets.currentonly`, "only the specific Google Sheets files this script is
  attached to"), so a publicly callable endpoint holds no permission to send mail. Deploy it
  with `apps-script/SETUP.md` (~11 min, one-time).
- **Being told about new inquiries is out of scope for the site** (D20). The endpoint's
  contract ends at "the row is saved", to the `Inquiries` tab or the `Quarantine` tab; the
  spreadsheet is the record of truth. Learning that a row has landed — and triaging
  `Quarantine` — is a separate workflow owned outside this repo, and it can change without any
  change here.
- **The auto-reply to the visitor is not a website deliverable.** It is a rule on the inquiry
  inbox, owned outside this repo. The approved wording is still shown on screen in the form's
  success panel (`src/content/formCopy.ts`).
- **Fallback: Web3Forms** — `web3forms/SETUP.md`. Use it only if a Workspace policy blocks the
  Apps Script web app. Email only, no Sheet.
- **Switching providers is one line** in `src/config/site.ts`: `inquiry.provider` becomes
  `'apps-script' | 'web3forms' | 'mailto'`, and `inquiry.endpoint` holds the `/exec` URL or the
  Web3Forms access key accordingly.
- **`mailto` is the last resort**: it is both a provider setting (used when no endpoint is
  configured) and the inline "Or email us directly" escape hatch shown in the form's error state,
  prefilled from whatever the visitor already typed. A total backend outage still leaves a path.
- **No secrets live in this repo.** The `/exec` URL and the Web3Forms access key are
  public-by-design endpoints that ship in the client bundle. The only real secret — the HMAC
  `SECRET` used to sign form nonces — exists solely in Apps Script _Project Settings → Script
  properties_ and is never committed, logged, or sent to the browser.

## Local development without a backend

`scripts/mock-inquiry-server.mjs` answers on `:8787` exactly the way the Apps Script web
app does — a `GET` returns a nonce, a `POST` returns `{ ok: true }` — with `--mode`
switches for the failure paths (`quarantine`, `reject`, `error`, `slow`,
`nonce-blocked`). Point the app at it with `VITE_INQUIRY_ENDPOINT`, which overrides
`site.inquiry.endpoint` in dev and QA builds only:

```sh
node scripts/mock-inquiry-server.mjs --mode ok
VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev
```

`npm run qa:form` drives all six modes unattended and asserts the client rule that
matters most: **the confirmation is shown only on a confirmed `{ ok: true }`**. Every
other outcome keeps the visitor's answers on screen and offers the prefilled `mailto:`.
See the README's "Working on the form locally" for the mode table.
