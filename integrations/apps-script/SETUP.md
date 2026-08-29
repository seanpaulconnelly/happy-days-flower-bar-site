# Deploying the inquiry endpoint (Google Apps Script)

**Time: ~15 minutes**, start to finish, including the two test submissions.
**Do this while signed in to the Happy Days Google account** — the script runs as the account
that deploys it, so notification and auto-reply emails come from that mailbox.

You need: a browser signed in to the Happy Days Google account, a terminal (for `openssl` and
`curl`), and this repo checked out.

Nothing here is secret to the repo. The finished `/exec` URL is a public endpoint by design; the
only real secret, `SECRET`, lives in Apps Script's own Script properties and is never committed.

---

## 1. Create the spreadsheet (1 min)

1. Go to <https://drive.google.com> — confirm the avatar top-right is the Happy Days account.
2. **New → Google Sheets → Blank spreadsheet**.
3. Click _Untitled spreadsheet_ top-left and name it **`Happy Days — Inquiries`**.

Leave the default `Sheet1` tab alone. The script creates its own `Inquiries` and `Quarantine`
tabs (with headers and a frozen header row) the first time each is needed.

## 2. Open the script editor and paste the code (2 min)

1. In that sheet: **Extensions → Apps Script**.
   ([docs: Extensions > Apps Script](https://developers.google.com/apps-script/guides/sheets))
   This makes the project _container-bound_ to this spreadsheet, which is what lets
   `SpreadsheetApp.getActiveSpreadsheet()` find it. A standalone script would not work.
2. The editor opens on a file called `Code.gs` containing a stub `myFunction()`.
   Select all of it (Cmd-A) and delete it.
3. Paste the entire contents of [`Code.gs`](./Code.gs) from this repo.
4. Click _Untitled project_ at the top and name it **`Happy Days inquiry endpoint`**.
5. Save: the disk icon in the toolbar, or Cmd-S.
6. **Limit the permissions the script asks for.** Left out, Apps Script _infers_ scopes from
   the services it sees and asks for the broadest version — "see, edit, create and delete all
   your spreadsheets". The script only needs the one sheet it is attached to plus the ability
   to send mail, so declare exactly that:
   1. Left sidebar **Project Settings** (gear) → tick **Show "appsscript.json" manifest file in
      editor** → back to **Editor** (`< >`).
   2. A second file, `appsscript.json`, now appears under Files. Open it, select all, and
      paste the contents of [`appsscript.json`](./appsscript.json) from this repo. Save.
   3. The consent screen in §4 will now list only two things: _"See, edit, create, and delete
      only the specific Google Sheets files this script is attached to"_ and _"Send email as
      you"_. If you already approved the broad version, no harm done — the narrower manifest
      takes effect on the next authorisation; to drop the old grant, visit
      <https://myaccount.google.com/permissions>, remove _Happy Days inquiry endpoint_, and
      run **`doGet`** once more.

`NOTIFY_TO` is already `hello@happydaysflowers.com` — no edit needed. If the inquiry inbox ever
changes, that constant near the top of the file is the only line to change.

## 3. Add the `SECRET` script property (2 min)

The script signs a short-lived nonce with this so the form can prove the page was actually
loaded from the site. A wrong or missing nonce is only a spam _hint_, never a rejection.

1. Generate one in your terminal:
   ```sh
   openssl rand -hex 32
   ```
2. In the Apps Script editor, left sidebar: **Project Settings** (gear icon).
3. Scroll to **Script Properties** → **Add script property**.
4. **Property**: `SECRET` · **Value**: paste the 64-character string from step 1.
5. **Save script properties**.
   ([docs: script properties in the editor](https://developers.google.com/apps-script/guides/properties))

Do not put this value anywhere in the repo or in a chat message. If it is ever lost, generate a
new one and save it — nothing breaks except that nonces issued before the change stop validating
(worst case, a few submissions pick up one extra spam flag for half an hour).

## 4. Authorise the script (3 min)

1. Back in the editor (left sidebar **Editor**, the `< >` icon), in the toolbar there is a
   function dropdown. Select **`doGet`**, then click **Run**.
2. A dialog appears: **Review permissions** → choose the **Happy Days** account.
3. You will then see **"Google hasn't verified this app"**. This is expected and is not a
   warning about your code: it appears for _every_ personal Apps Script that requests
   sensitive scopes (here: the attached spreadsheet and sending mail as you) because the project has
   not gone through Google's OAuth app-verification programme — which only applies to apps
   distributed to other people. You wrote this script; you are approving your own code.
   Click **Advanced** → **Go to Happy Days inquiry endpoint (unsafe)** → **Allow**.
4. The **Execution log** at the bottom should show `Notice  Execution started` /
   `Notice  Execution completed` with no red error lines.

Running one function authorises the whole project — the scopes come from `appsscript.json`
(§2 step 6), so you will not be prompted again for the mail or sheet calls.

## 5. Deploy as a web app (3 min)

1. Top right: **Deploy → New deployment**.
2. Next to _Select type_, click the gear — its tooltip is **Enable deployment types settings** —
   and choose **Web app**.
   ([docs: Deploy > New deployment > Web app](https://developers.google.com/apps-script/guides/web))
3. Fill in _Deployment configuration_:
   - **Description**: `v1`
   - **Execute as**: **Me (your-address@…)** — the script must run as the Happy Days account so
     it can write to the sheet and send mail. (Manifest value `USER_DEPLOYING`.)
   - **Who has access**: **Anyone** — _not_ "Anyone with Google account". Visitors to the site
     are not signed in to Google, so anything stricter blocks every real submission.
     (Manifest value `ANYONE_ANONYMOUS`;
     [manifest reference](https://developers.google.com/apps-script/manifest/web-app-api-executable))
4. **Deploy**. Copy the **Web app URL** — it ends in `/exec`. Keep it on the clipboard.
   (The `/dev` URL shown elsewhere in the editor only works for accounts with edit access to the
   script; never use it in the site config.)

> Google's public docs quote the `Deploy → New deployment → Web app` path and the manifest
> values, but do not quote the two dropdown labels verbatim. "Execute as" / "Who has access"
> are what the editor shows today; if the wording has changed, pick the option that maps to
> _the script owner_ and _anyone, including anonymous users_.

## 6. Add the daily quarantine digest trigger (2 min)

Submissions that look automated are still saved — to the `Quarantine` tab — but they do not fire
an immediate email. This trigger mails a summary each morning so a mis-flagged real lead is seen
within a day.

1. Left sidebar: **Triggers** (clock icon) → bottom right **Add Trigger**.
   ([docs: installable triggers](https://developers.google.com/apps-script/guides/triggers/installable))
2. In the dialog:
   - _Choose which function to run_: **`sendQuarantineDigest`**
   - _Choose which deployment should run_: **Head**
   - _Select event source_: **Time-driven**
   - _Select type of time based trigger_: **Day timer**
   - _Select time of day_: **8am to 9am**
3. **Save**. Approve the permission prompt again if asked.

Google runs day timers at a random minute inside the chosen hour. The digest sends nothing on
days when the `Quarantine` tab got no new rows.

> The trigger dialog's field labels above are the editor's current wording; Google's docs
> describe the flow ("At the left, click Triggers … click Add Trigger") without quoting the
> individual fields. Nothing depends on the exact strings — function, Time-driven, Day timer,
> 8am to 9am.

## 7. Smoke test — a good submission (1 min)

Replace `<EXEC_URL>` with the URL from step 5:

```sh
curl -L -X POST '<EXEC_URL>' \
  -H 'Content-Type: text/plain' \
  --data '{"name":"Test Person","email":"YOUR_OWN_ADDRESS@example.com","eventDate":"2026-10-01","eventLocation":"Pittsburgh","eventType":"Other","guestCount":"25","notes":"Setup smoke test — delete this row.","elapsedMs":9000,"interacted":true}'
```

Expected: `{"ok":true}`.

Two details that matter:

- **`-H 'Content-Type: text/plain'`** — the site posts JSON as `text/plain` on purpose. An
  Apps Script web app does not answer the CORS preflight (`OPTIONS`) that
  `application/json` would trigger, so `text/plain` is what keeps the browser request working.
  The script reads `e.postData.contents` and parses it itself.
- **`-L`** — a POST to `/exec` answers with a redirect to `script.googleusercontent.com`, where
  the actual response body is served. Without `-L`, curl prints nothing and it looks broken.

Then check, in order:

1. The spreadsheet has an **`Inquiries`** tab with a header row and one new row
   (Status `new`, Score `0`, Flags empty).
2. **hello@happydaysflowers.com** has a _"New flower bar inquiry — Test Person (2026-10-01)"_
   email, sent from the Happy Days account, with reply-to set to the submitter's address.
3. The address you put in `"email"` has the auto-reply _"We received your inquiry — Happy Days
   Flower Farm"_.

Delete the test row from the sheet when you are done.

## 8. Smoke test — a "botty" submission (1 min)

Same call with the two human signals removed (no `elapsedMs`, no `interacted`, no nonce), which
scores 3 flags:

```sh
curl -L -X POST '<EXEC_URL>' \
  -H 'Content-Type: text/plain' \
  --data '{"name":"Botty Test","email":"bot-test@example.com","eventDate":"2026-10-02","eventLocation":"Nowhere","eventType":"Other","guestCount":"5","notes":"Quarantine test — delete this row."}'
```

Expected: **`{"ok":true}` as well** — a suspected bot is never told it was caught, and a
mis-flagged human is never shown a failure. Then check:

1. A **`Quarantine`** tab now exists with this row, Status `review`, Flags something like
   `fast,no-interaction,nonce`.
2. **No** immediate email arrived for it.
3. To see the digest without waiting for 8 am: in the editor select **`sendQuarantineDigest`**
   in the function dropdown → **Run**. An email _"1 inquiry submission(s) need a quick look"_
   should arrive listing the row. (It looks at the last 24 hours, so run it the same day.)

Delete the test row when you are done.

## 9. Point the site at the endpoint (1 min)

In this repo, open `src/config/site.ts` and set:

```ts
inquiry: {
  provider: 'apps-script',
  endpoint: 'https://script.google.com/macros/s/…/exec',   // the URL from step 5
  minElapsedMs: 3000,
},
```

Commit and push. The URL is a public endpoint — it is meant to be in the client bundle, and
there is nothing to protect. (`SECRET` stays in Script properties and is never in the repo.)

## 10. Changing the script later

Edits to `Code.gs` in the editor are **not** live until you publish a new version:

**Deploy → Manage deployments** → select the active deployment → **Edit** (pencil icon) →
_Version_: **New version** → **Deploy**.
([docs: create and manage deployments](https://developers.google.com/apps-script/concepts/deployments))

The `/exec` URL stays the same, so nothing in the site needs to change. Keep the copy in
`integrations/apps-script/Code.gs` in this repo in sync with what is pasted in the editor — the
repo is the source of truth.

---

## Quotas and caps

| Limit                                            | Value                                                                | What happens at the limit                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `MailApp` recipients/day                         | ~100/day on a consumer Gmail account, ~1,500/day on Google Workspace | Mail calls throw; the row is still saved, and the error is logged rather than shown to the visitor                     |
| Script's own notification cap                    | `MAX_EMAILS_PER_DAY = 30` in `Code.gs`                               | Rows keep saving; one _"Website inquiries: high volume today"_ notice is sent, then notifications pause until tomorrow |
| Nonce lifetime                                   | 30 minutes                                                           | An older nonce is one spam flag, nothing more                                                                          |
| `CacheService` (duplicate + email-count signals) | 6-hour TTL, not durable storage                                      | Best-effort by design; the sheet write never depends on it                                                             |

The 30/day cap exists so a bot cannot burn the mail quota or flood the inbox. Real volume for
this site will not come close to it.

## If a Workspace admin policy blocks "Anyone" access

Some managed Google Workspace tenants disable Apps Script or restrict web apps to inside the
organisation ([Workspace Help: turn Apps Script on or
off](https://knowledge.workspace.google.com/admin/users/access/turn-apps-script-on-or-off-for-users)).
Symptoms: **Anyone** is missing from _Who has access_, or an anonymous `curl` gets a Google
sign-in page instead of `{"ok":true}`.

Fallback — one line, no code change:

```ts
inquiry: { provider: 'web3forms', endpoint: '<access key>', … }
```

Follow [`../web3forms/SETUP.md`](../web3forms/SETUP.md), and record the switch in
`3-plans/happy-days-flower-bar-site/BLOCKERS.md` with the exact admin setting that blocked it.
No Google Sheet in that mode — inquiries arrive by email only.

## Troubleshooting

| Symptom                                                 | Cause                                                                                                                   | Fix                                                                                                                                 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `curl` prints nothing, or exit code 0 with empty body   | Missing `-L`; POST to `/exec` answers with a 302 to `script.googleusercontent.com`                                      | Add `-L`                                                                                                                            |
| Browser console: _"blocked by CORS policy … preflight"_ | The request was sent as `application/json`, so the browser sent an `OPTIONS` preflight that Apps Script does not answer | Post the JSON string with `Content-Type: text/plain;charset=utf-8` (the site's adapter already does)                                |
| HTML sign-in page instead of JSON; 401/403              | _Who has access_ is not **Anyone**, or a Workspace policy blocks it                                                     | Re-deploy with **Anyone**; if that option is unavailable, see the section above                                                     |
| Redirect loop, or `{"ok":…}` never arrives              | Deployment was made from a different Google account than the sheet's owner                                              | Redeploy from the Happy Days account (the sheet's owner)                                                                            |
| _"Script function not found: doPost"_                   | Pasted an incomplete file, or the deployment predates the paste                                                         | Confirm `doPost` exists in the editor, save, then **Manage deployments → Edit → New version → Deploy**                              |
| `{"ok":false,"reason":"rejected"}`                      | A required field is empty or the email is malformed — the only hard rejects                                             | Check `name`, `email`, `eventDate`, `eventLocation`, `eventType`, `guestCount` in the payload                                       |
| `{"ok":false,"reason":"error"}`                         | The sheet write itself failed                                                                                           | Look in the `Quarantine` tab — the raw payload was saved with Status `error`; open **Executions** in the editor for the stack trace |
| Row appears, no email                                   | Daily mail quota, or the 30/day notification cap                                                                        | Check **Executions** for a _"Notification failed"_ log line; the lead is safe in the sheet either way                               |
| Submission landed in `Quarantine` unexpectedly          | 2+ spam flags — check the **Flags** column                                                                              | Reply to it normally; if a pattern shows up, adjust the flag thresholds in `Code.gs` and re-deploy                                  |
| Digest never arrives                                    | Trigger not saved, or no rows in the last 24 h                                                                          | **Triggers** sidebar → confirm the row exists; run `sendQuarantineDigest` manually to test                                          |
| Nothing writes to the sheet at all                      | The script is standalone, not bound to the spreadsheet                                                                  | It must be created from the sheet's own **Extensions → Apps Script**                                                                |
