# Release runbook

Written for **Sean** (technical). Everything an agent can do is already done or is
listed here with its resume command; everything that needs a browser session or a
DNS console is written out click-by-click so it is unambiguous.

House rules that apply to every command on this page:

- **Plain `git` only.** The `gh` CLI is not used in this project and is blocked.
- The only remote is `https://github.com/seanpaulconnelly/happy-days-flower-bar-site.git`.
- **Never force-push.** A bad release is rolled back with a revert commit (§3).
- Read-only GitHub state is fetched with unauthenticated `curl` against the public
  REST API — the repository is public, so no token is needed.

Run every command from the repository root.

---

## 0. Current status

> Maintained by the orchestrator — update the Status column as each step lands.

| #   | Step                                                         | Owner           | Status                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Repo scaffolded, site built, QA gates green                  | agent           | see the build report                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2   | `deploy.yml` workflow committed                              | agent           | done                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3   | Phase 8 — first push to `main` (§1.2)                        | agent           | **done** 2026-08-29 17:20 UTC — `* [new branch] main -> main`                                                                                                                                                                                                                                                                                                                                                                        |
| 3b  | Phase 8 — first Pages deploy run (§1.3)                      | agent           | **done** — run 33265382781 and 33265484338 failed at `configure-pages` (Pages not enabled, B3); after Sean enabled Pages, re-run 33265555468 hung 35 min in `npm run check` (CI-only orphaned `vite preview`, fixed in `19c37e9`, decisions D18, cancelled by concurrency); [run 33269427780](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/runs/33269427780) **success** 2026-08-29 18:54 UTC (check 12 s) |
| 4   | Pages source click, **only if** auto-enable fails (§1.4)     | 🧑 Sean         | **done** — Sean set Source: GitHub Actions 2026-08-29 ~18:15 UTC                                                                                                                                                                                                                                                                                                                                                                     |
| 5   | Live-URL verification + `live` screenshots (§1.5)            | agent           | **done** 2026-08-29 18:56 UTC — 200, `noindex,nofollow`, no canonical, 1 JSON-LD, assets + hero AVIF 200, robots.txt 200, no overflow 375–1536, axe 0 on the live URL; `docs/qa/live/{375,1280}.png`                                                                                                                                                                                                                                 |
| 6   | Phase 9 (b) — `public/CNAME` commit (§2.1) — **after row 7** | agent           | **done** — `369efa8` pushed 2026-08-29 19:12 UTC after Sean had already set the custom domain; [run 33270129280](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/runs/33270129280) success                                                                                                                                                                                                                    |
| 7   | DNSimple records + verification TXT (§2.2, §2.3)             | 🧑 Sean         | **partial** — apex ALIAS → `seanpaulconnelly.github.io` present (GitHub: "DNS valid for primary"); **`www` CNAME missing** (GitHub: InvalidDNSError on www) — add `CNAME www → seanpaulconnelly.github.io`; verification TXT not yet added                                                                                                                                                                                           |
| 8   | GitHub custom domain + Enforce HTTPS (§2.4)                  | 🧑 Sean         | **partial** — custom domain `happydaysflowers.com` saved by Sean; Enforce HTTPS pending the certificate                                                                                                                                                                                                                                                                                                                              |
| 9   | `happydaysflowerfarm.com` URL forwarding (§2.5)              | 🧑 Sean         | pending (B4)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 10  | Post-cutover verification (§2.6)                             | agent           | **partial** 2026-08-29 19:15 UTC — apex 200, `index,follow`, canonical `https://happydaysflowers.com/`, 1 JSON-LD, assets 200, robots/sitemap/llms 200, base-aware 404, github.io → apex 301, no overflow, axe 0; `www` and HTTPS enforcement pending row 7/8                                                                                                                                                                        |
| 11  | Apps Script `/exec` URL into `site.ts` (§4)                  | 🧑 Sean → agent | **done** 2026-08-29 — `/exec` URL in `site.ts` (`29e4708`), `--allow-todos` removed from `deploy.yml`; preview submission → success, botty POST → `{ok:true}` |
| 12  | GA4 Measurement ID into `site.ts` (§5)                       | 🧑 Sean → agent | pending (B2)                                                                                                                                                                                                                                                                                                                                                                                                                         |

Blocker IDs (B1–B4) are the rows in
`3-plans/happy-days-flower-bar-site/BLOCKERS.md` in the wrapper project.

---

## 1. Phase 8 — first deploy to GitHub Pages

Target URL for this phase: `https://seanpaulconnelly.github.io/happy-days-flower-bar-site/`

### 1.1 Pre-flight

```sh
npm run check -- --allow-todos
```

`check` runs typecheck → lint → `check:config` → `vite build` → `check:copy`.
`--allow-todos` downgrades the unresolved `TODO_` placeholder in
`src/config/site.ts` (the Apps Script `/exec` URL) from an error to a warning. It
is exactly what CI runs, so a green local run means a green build job. Drop the
flag once §4 is done.

### 1.2 Push

```sh
git status
git push -u origin main
```

The push to `main` is the deploy trigger. There is no other deploy mechanism and
no other environment.

### 1.3 What the workflow does

`.github/workflows/deploy.yml`, job `build` then job `deploy`:

1. `actions/checkout@v7`, `actions/setup-node@v7` (Node 22, npm cache), `npm ci`.
2. `npx playwright install --with-deps chromium` — `check:copy` reads the rendered
   DOM under `vite preview`, so the browser binary must exist in CI.
3. `actions/configure-pages@v6` with `enablement: true` — turns Pages on with the
   workflow token, so nobody normally has to click anything.
4. **Resolve base path**: if `public/CNAME` exists → `BASE_PATH=/`, else
   `BASE_PATH=/happy-days-flower-bar-site/`.
5. `npm run check -- --allow-todos`.
6. `actions/upload-pages-artifact@v5` with `path: dist`, then
   `actions/deploy-pages@v5` in the `github-pages` environment.

`concurrency: { group: pages, cancel-in-progress: true }` means a newer push
supersedes an in-flight run — pushing twice quickly is safe.

### 1.4 Watch the run without `gh`

```sh
curl -s https://api.github.com/repos/seanpaulconnelly/happy-days-flower-bar-site/actions/runs?per_page=1 \
  | python3 -c 'import json,sys; r=json.load(sys.stdin)["workflow_runs"][0]; print(r["status"], r["conclusion"], r["html_url"])'
```

Poll every ~20 s until it prints `completed success` (a first run takes roughly
2–4 minutes). `completed failure` → open the printed `html_url` for the log.

**If the run fails with a "Pages is not enabled" / "Resource not accessible"
error from `configure-pages`** (blocker B3 — the workflow token was refused), this
is the one-time fallback, and it is the only click Phase 8 can need:

> GitHub → the repository → **Settings** → **Pages** (left sidebar) →
> **Build and deployment** → **Source**: select **GitHub Actions** →
> then the **Actions** tab → open the failed _Deploy to GitHub Pages_ run →
> **Re-run all jobs**.

Then poll the command above again. Nothing needs re-pushing.

**This is exactly what happened on the first run (2026-08-29 17:20 UTC).**
Run [33265382781](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/runs/33265382781),
job `build` — the step list from the public API:

```
1 Set up job                          success
2 Run actions/checkout@v7             success
3 Run actions/setup-node@v7           success
4 Run npm ci                          success
5 Install Chromium for the copy check success
6 Run actions/configure-pages@v6      FAILURE   <-- B3
7 Resolve base path                   skipped
8 Run npm run check -- --allow-todos  skipped
9 Run actions/upload-pages-artifact@v5 skipped
   (job `deploy`                      skipped)
```

Corroborating evidence that this is enablement and not a build error: `npm ci`
and the Chromium install both passed, the build never ran, and

```sh
curl -s https://api.github.com/repos/seanpaulconnelly/happy-days-flower-bar-site/pages
```

returns `404 Not Found` — i.e. **no Pages site exists on the repository yet**, so
`enablement: true` was refused by the workflow token. The step's own log text is
not readable without a token (`.../actions/jobs/<id>/logs` → `403 Must have admin
rights to Repository`); open the run URL above in a browser to see it.

The failure is **reproducible, not transient**: the second push (run
[33265484338](https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions/runs/33265484338))
failed at the same step 6 with the same steps 7–9 skipped.

Nothing in the repository needs changing — no code fix would help, because the
build never runs. After the click, use **Re-run all jobs** on the most recent
run on the Actions tab; the remaining Phase 8 verification (§1.5) then resumes
with no further pushes.

### 1.5 Verify

```sh
curl -sI https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ | head -1
```

Expect `HTTP/2 200`. The first successful deploy can take another ~1 minute to
appear on the CDN; a `404` immediately after `completed success` usually resolves
on the next try.

```sh
npm run qa:screens -- --url https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ --label live
```

Writes `docs/qa/screenshots/live/{375,768,1280,1536}.png` plus the scrolled 375
shot. Compare against `docs/qa/screenshots/latest/` — they should match; a
difference means an asset path resolved differently under the repository
sub-path than it does locally.

Confirm the base path took effect (asset URLs must carry the repo prefix):

```sh
curl -s https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ | grep -o '/happy-days-flower-bar-site/assets/[^"]*' | head -3
```

### 1.6 The preview URL is `noindex` — by design

Decision **D5**: indexability is decided at _build_ time, not at runtime.
`vite.config.ts` sets `VITE_SITE_MODE=canonical` when `public/CNAME` exists and
`preview` when it does not, and `preview` emits `<meta name="robots"
content="noindex">` into the HTML. `robots.txt` and `sitemap.xml` are static and
always describe the canonical host.

So on `seanpaulconnelly.github.io` the page is deliberately not indexable:

```sh
curl -s https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ | grep -i 'name="robots"'
```

Expect a `noindex` line. Seeing it here is a **pass**, not a bug — it stops
Google from indexing the throwaway host and later competing with
`happydaysflowers.com`. It disappears automatically in §2.1, because the same
`public/CNAME` file that flips the base path to `/` also flips the mode to
`canonical`.

---

## 2. Phase 9 — domain cutover to `happydaysflowers.com`

Order of operations matters: **DNS first → then the `public/CNAME` commit → then
the GitHub custom-domain field → then Enforce HTTPS.** Setting the custom domain
before the records exist makes GitHub's DNS check fail and can leave the field in
an error state; ticking Enforce HTTPS before the certificate is issued is simply
not offered.

Variables used below: `REPO=happy-days-flower-bar-site`,
`DOMAIN=happydaysflowers.com` (apex is canonical), GitHub user
`seanpaulconnelly`.

### 2.0 Sequencing — do these four things in this order

The `public/CNAME` commit is not a safe "get ahead of it" step. That one file
flips the Vite `base` to `/` **and** turns indexing on, so pushing it before DNS
exists leaves the `github.io` preview serving root-absolute asset URLs that 404,
with nowhere else for the site to live yet. So:

| Step    | Who     | What                                                                              | Section    |
| ------- | ------- | --------------------------------------------------------------------------------- | ---------- |
| **(a)** | 🧑 Sean | Add the DNSimple records (ALIAS/CNAME) **and** the `_github-pages-challenge…` TXT | §2.2, §2.3 |
| **(b)** | agent   | Commit + push `public/CNAME` — **only after (a)**                                 | §2.1       |
| **(c)** | 🧑 Sean | _Settings → Pages → Custom domain_ → `happydaysflowers.com` → **Save**            | §2.4       |
| **(d)** | 🧑 Sean | Wait for the certificate, then tick **Enforce HTTPS**                             | §2.4       |

Between **(b)** and **(c)** — roughly two minutes — the `github.io` URL may 404
its CSS, JS and images, because the build now points assets at `/` while Pages is
still serving the site from `/happy-days-flower-bar-site/`. **This is expected**
and it clears the moment (c) is saved, at which point the `github.io` URL starts
redirecting to the custom domain.

Sean triggers (b) by telling Claude Code _"the DNS records are in"_, or by running
the five commands in §2.1 himself.

### 2.1 (b) The `public/CNAME` commit — only after Sean's DNS records exist (§2.2, §2.3)

```sh
echo happydaysflowers.com > public/CNAME
npm run check -- --allow-todos
git add public/CNAME
git commit -m "release: custom domain happydaysflowers.com"
git push origin main
```

One file does three things (D5 + §3.3 of the build plan): the presence of
`public/CNAME` switches the Vite `base` from `/happy-days-flower-bar-site/` to
`/`, switches `VITE_SITE_MODE` from `preview` to `canonical` (removing the
`noindex` meta), and tells GitHub Pages which host to serve — and `site.url` is
already `https://happydaysflowers.com`, so canonical, OG, sitemap and JSON-LD
URLs need no edit.

Wait for `completed success` with the poll command from §1.4, then go straight to
(c) in §2.4 — the shorter the gap, the shorter the 404 window described in §2.0.

### 2.2 (a) 🧑 Sean — DNSimple records for `happydaysflowers.com`

DNSimple → `happydaysflowers.com` → **DNS**.

**Option A (recommended, one click):**

> **One-click services** → **Hosting** → **GitHub Pages** → enter
> `seanpaulconnelly.github.io` → apply.

This creates the ALIAS record on the apex and the `www` CNAME for you.

**Option B (manual, if you prefer explicit records):**

| Type  | Name  | Value                        |
| ----- | ----- | ---------------------------- |
| ALIAS | `@`   | `seanpaulconnelly.github.io` |
| CNAME | `www` | `seanpaulconnelly.github.io` |

**A-record fallback** — only if ALIAS is unavailable. Four A records on `@`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

(Keep the `www` CNAME either way. Prefer ALIAS over A records: GitHub can change
those IPs, and the ALIAS follows.)

### 2.3 (a) 🧑 Sean — account-level domain verification TXT (do once, keep forever)

This stops anyone else from ever attaching this domain to their own Pages site
after you detach it.

> GitHub → your **profile** picture → **Settings** (account settings, _not_ the
> repository's) → **Pages** in the left sidebar → **Add a domain** → enter
> `happydaysflowers.com` → GitHub shows the record to create.

It will be a TXT record named `_github-pages-challenge-seanpaulconnelly` with a
one-time token as its value. **The value is only visible on that GitHub screen —
copy it from there**, add it at DNSimple:

| Type | Name                                       | Value                    |
| ---- | ------------------------------------------ | ------------------------ |
| TXT  | `_github-pages-challenge-seanpaulconnelly` | (the token GitHub shows) |

then click **Verify** back on the GitHub screen. If it does not verify
immediately, wait — TXT propagation can take up to 24 h, though it is usually
minutes. Check it yourself with:

```sh
dig +short TXT _github-pages-challenge-seanpaulconnelly.happydaysflowers.com
```

### 2.4 (c) + (d) 🧑 Sean — GitHub custom domain, then HTTPS

Once §2.2 resolves (check with `dig +short happydaysflowers.com`) **and the
§2.1 `public/CNAME` push has gone green**:

> GitHub → the **repository** → **Settings** → **Pages** → **Custom domain** →
> `happydaysflowers.com` → **Save**.

GitHub runs a DNS check on save; it passes once the records in §2.2 exist. Saving
also makes `https://seanpaulconnelly.github.io/happy-days-flower-bar-site/`
redirect to the custom domain automatically.

Then wait for the certificate. The same page shows _"Certificate is being
provisioned"_ and then the **Enforce HTTPS** checkbox becomes available — usually
within an hour of the DNS check passing.

> Same page → tick **Enforce HTTPS**.

Do not skip this; without it the site answers on plain `http://` as well.

### 2.5 🧑 Sean — redirect `happydaysflowerfarm.com`

So the second domain redirects rather than becoming a second site (which would
split search signals):

> DNSimple → `happydaysflowerfarm.com` → **URL forwarding** (Domain services) →
> add a record for the **apex** and one for **`www`**, both →
> `https://happydaysflowers.com`, permanent (301).

Do **not** point `happydaysflowerfarm.com` at GitHub Pages, and do not add it as
a second custom domain — Pages accepts only one.

### 2.6 Verify the cutover

```sh
dig +short happydaysflowers.com
dig +short www.happydaysflowers.com
curl -sI https://happydaysflowers.com | head -1
curl -sI https://www.happydaysflowers.com | grep -i location
curl -s https://happydaysflowers.com | grep -c ld+json
```

Expected:

| Command                           | Expected                                                   |
| --------------------------------- | ---------------------------------------------------------- |
| `dig +short happydaysflowers.com` | the four `185.199.10x.153` GitHub Pages addresses          |
| `dig +short www.…`                | `seanpaulconnelly.github.io.` then the same four addresses |
| `curl -sI https://…` head         | `HTTP/2 200`                                               |
| `www` `location` header           | a redirect to `https://happydaysflowers.com/`              |
| `grep -c ld+json`                 | `≥ 1` — the build-time JSON-LD graph is present            |

Also confirm the `noindex` is gone (this is what §2.1 bought):

```sh
curl -s https://happydaysflowers.com | grep -i 'name="robots"'   # expect no output
curl -s https://happydaysflowers.com/robots.txt
curl -sI https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ | head -1   # now a 301
```

Then re-shoot the live screenshots and commit them:

```sh
npm run qa:screens -- --url https://happydaysflowers.com/ --label live
```

**Expected propagation times**

| Step                                             | Typical   | Worst case         |
| ------------------------------------------------ | --------- | ------------------ |
| DNSimple records visible to `dig`                | 1–10 min  | 1 h                |
| GitHub's DNS check on **Save**                   | immediate | retry after 10 min |
| TLS certificate issued (Enforce HTTPS available) | 10–30 min | ~1 h               |
| `_github-pages-challenge` TXT verifies           | minutes   | 24 h               |

After the cutover, work through `docs/SEARCH-SETUP.md` (Search Console, sitemap
submission, Bing, Google Business Profile). Do it **after** HTTPS is enforced,
not before.

---

## 3. Routine releases

```sh
# 1. edit content or code
npm run check          # drop `-- --allow-todos` once §4 is done
git add -A
git commit -m "feat(copy): …"
git push origin main
```

Push to `main` is the release. Watch it with the poll command in §1.4; the site
updates roughly two minutes after the run goes green.

**Rollback** — revert, never rewrite history:

```sh
git log --oneline -5
git revert <sha>       # or: git revert --no-commit <sha1> <sha2> && git commit
git push origin main
```

The same pipeline redeploys the reverted tree. **Never force-push** — the branch
is the deploy source and there is no other copy of it.

Run `npm run qa` (screenshots + axe + Lighthouse) before anything that changes
layout, images or the head. The §3.4 budgets are Performance ≥ 90,
Accessibility 100, Best Practices ≥ 95, SEO 100.

---

## 4. Apps Script endpoint (blocker B1)

`src/config/site.ts` → `inquiry.endpoint` currently holds
`'TODO_APPS_SCRIPT_EXEC_URL'`, which is why every build so far passes
`--allow-todos`.

1. 🧑 Deploy the script by following
   [`integrations/apps-script/SETUP.md`](../integrations/apps-script/SETUP.md)
   (~12 min, signed in to the Happy Days Google account). That document is the
   click-by-click source — it is not duplicated here. Note that the script sends
   no email (one OAuth scope, `spreadsheets.currentonly`); §6 of that document
   turns on the spreadsheet's own notification rule instead, and it must be set
   from the Happy Days account because Sheets notification rules are per user.
2. Paste the resulting `/exec` URL into `src/config/site.ts`:

   ```ts
   inquiry: {
     provider: 'apps-script',
     endpoint: 'https://script.google.com/macros/s/AKfycb…/exec',
     minElapsedMs: 3000,
   },
   ```

3. **Drop `--allow-todos` everywhere from now on**:

   ```sh
   npm run check
   ```

   `check:config` now has no placeholder to complain about, so a bare `npm run
check` is the gate. Also remove the flag from the `npm run check` step in
   `.github/workflows/deploy.yml` in the same commit, so CI regains the
   protection.

4. Commit and push. Then run a real submission from `npm run preview` and a
   deliberately "botty" one, and confirm the `Inquiries` and `Quarantine` rows
   plus Google's "spreadsheet was updated" email for each — the verification
   steps are in §7 and §8 of `SETUP.md`. No email comes from the script itself,
   and the visitor gets no reply from it; the auto-reply is an inbox rule handled
   outside this repo (decision D19).

If a Workspace policy blocks "Anyone" access to the web app, switch
`inquiry.provider` to `'web3forms'` and put the access key in `endpoint`
(`integrations/web3forms/SETUP.md`). It is a one-line change; no component code
moves.

---

## 5. GA4 (blocker B2)

The analytics loader ships inert. One line turns it on, in
`src/config/site.ts`:

```ts
analytics: { ga4MeasurementId: 'G-XXXXXXXXXX' },
```

Commit and push; that is the whole change. Two properties of the loader worth
knowing:

- An empty string means **no tag is loaded at all** — no request, no cookie.
- The tag loads **only on the canonical host** (`happydaysflowers.com`). Local
  `dev`/`preview` and the `github.io` preview URL never send hits, so your own
  testing does not pollute the property.

Create the GA4 property and the Search Console domain property in the same
sitting — the checklist is `docs/SEARCH-SETUP.md`.

---

## 6. Quick reference

| Need                      | Command / path                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Pre-commit gate           | `npm run check` (`-- --allow-todos` until §4)                                        |
| Full QA                   | `npm run qa`                                                                         |
| Latest workflow run       | the `curl … actions/runs?per_page=1` one-liner in §1.4                               |
| Actions page              | https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions               |
| Repo settings → Pages     | Settings → Pages (repository), for source / custom domain / Enforce HTTPS            |
| Account settings → Pages  | profile → Settings → Pages, for **Add a domain** (verification TXT)                  |
| Preview URL               | https://seanpaulconnelly.github.io/happy-days-flower-bar-site/ (`noindex` by design) |
| Live URL (after §2)       | https://happydaysflowers.com                                                         |
| Content how-to (owner)    | [`docs/HANDOFF.md`](HANDOFF.md)                                                      |
| Search / Business Profile | [`docs/SEARCH-SETUP.md`](SEARCH-SETUP.md)                                            |
| Inquiry backends          | [`integrations/README.md`](../integrations/README.md)                                |
