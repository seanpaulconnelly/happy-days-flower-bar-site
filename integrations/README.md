# Inquiry form backends

- **Primary: Google Apps Script** — `apps-script/Code.gs` appends every submission to a Google
  Sheet the business owns, then emails `hello@happydaysflowers.com` and auto-replies to the
  visitor. Deploy it with `apps-script/SETUP.md` (~15 min, one-time).
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
