# Deploying the inquiry endpoint (Google Apps Script)

**Time: ~12 minutes**, start to finish, including the two test submissions.
**Do this while signed in to the Happy Days Google account** — the script runs as the account
that deploys it, and it writes into that account's spreadsheet.

You need: a browser signed in to the Happy Days Google account, a terminal (for `openssl` and
`curl`), and this repo checked out.

The script **sends no email**. Its only capability is appending a row to the spreadsheet it is
attached to; notifications come from the spreadsheet's own notification rule (§6). That is
deliberate — a publicly callable endpoint should not hold a permission to send mail.

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
   your spreadsheets". The script only needs the one sheet it is attached to, so declare
   exactly that:
   1. Left sidebar **Project Settings** (gear) → tick **Show "appsscript.json" manifest file in
      editor** → back to **Editor** (`< >`).
   2. A second file, `appsscript.json`, now appears under Files. Open it, select all, and
      paste the contents of [`appsscript.json`](./appsscript.json) from this repo. Save.
   3. The consent screen in §4 will now list exactly one thing: _"See, edit, create, and delete
      only the specific Google Sheets files this script is attached to"_. If you already
      approved a broader version, no harm done — the narrower manifest takes effect on the next
      authorisation; to drop the old grant, visit <https://myaccount.google.com/permissions>,
      remove _Happy Days inquiry endpoint_, and run **`doGet`** once more.

There is no inbox address to configure. Where the notification email goes is decided in §6, by
the spreadsheet, not by the script.

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
   warning about your code: it appears for personal Apps Script projects that have not gone
   through Google's OAuth app-verification programme — which only applies to apps distributed
   to other people. You wrote this script; you are approving your own code.
   Click **Advanced** → **Go to Happy Days inquiry endpoint (unsafe)** → **Allow**.
   (If Google takes you straight to **Allow** without that screen, nothing is wrong — carry on.)
4. Check what you are granting: the consent screen should list **only** _"See, edit, create, and
   delete only the specific Google Sheets files this script is attached to"_. If it mentions
   sending email, or all of your spreadsheets, the manifest from §2 step 6 did not save — go
   back and paste it again.
5. The **Execution log** at the bottom should show `Notice  Execution started` /
   `Notice  Execution completed` with no red error lines.

Running one function authorises the whole project — the scopes come from `appsscript.json`
(§2 step 6), so you will not be prompted again for the sheet calls.

## 5. Deploy as a web app (3 min)

1. Top right: **Deploy → New deployment**.
2. Next to _Select type_, click the gear — its tooltip is **Enable deployment types settings** —
   and choose **Web app**.
   ([docs: Deploy > New deployment > Web app](https://developers.google.com/apps-script/guides/web))
3. Fill in _Deployment configuration_:
   - **Description**: `v1`
   - **Execute as**: **Me (your-address@…)** — the script must run as the Happy Days account so
     it can write to the sheet. (Manifest value `USER_DEPLOYING`.)
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

## 6. Turn on sheet notifications (1 min)

The script never emails anyone. Google Sheets does it instead: a notification rule on the
spreadsheet emails the account that set it whenever a row is added — to **either** tab, so a
quarantined submission is visible straight away rather than waiting for a summary.

Back in the spreadsheet (not the script editor), signed in as the Happy Days account:

1. **Tools → Notification settings → Edit notifications**.
   (Older Sheets UI: **Tools → Notification rules**.)
2. Under _Notify you when…_ choose **Any changes are made**.
3. Under _Notify you with…_ choose **Email - right away** (or **Email - daily digest** if a
   message per submission would be too much).
4. **Save**.
   ([docs: Set notifications in a spreadsheet](https://support.google.com/docs/answer/91588))

Two things to know:

- **Notification rules are per user, not per spreadsheet.** The rule belongs to whoever sets it.
  If a second person should be emailed too, share the sheet with them and have them set their
  own rule from their own account.
- **The email is Google's generic "changes were made" message with a link to the sheet** — it
  does not contain the inquiry itself. Open the sheet to read the details. The sheet, not the
  email, is the record.

## 7. Smoke test — a good submission (1 min)

Replace `<EXEC_URL>` with the URL from step 5:

```sh
curl -L '<EXEC_URL>' \
  -H 'Content-Type: text/plain' \
  --data '{"name":"Test Person","email":"YOUR_OWN_ADDRESS@example.com","eventDate":"2026-10-01","eventLocation":"Pittsburgh","eventType":"Other","guestCount":"25","notes":"Setup smoke test — delete this row.","elapsedMs":9000,"interacted":true}'
```

Use `-L` and let curl pick the method from `--data`: Apps Script answers a POST with a 302 to `script.googleusercontent.com`, and that hop must be followed as a **GET**. Forcing `-X POST` re-POSTs to the redirect target and you get a Google "Page Not Found" page instead of the JSON — the row was still saved, you just can't see the reply.

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
2. The Happy Days account has **Google's notification email** — subject along the lines of
   _"Happy Days — Inquiries was updated"_, with a link back to the sheet. On _right away_ it
   arrives within a few minutes; on _daily digest_, the next day.

There is no email from the script itself, and the person who submitted gets no reply from it —
that is by design (see §6 and `docs/HANDOFF.md`).

Delete the test row from the sheet when you are done.

## 8. Smoke test — a "botty" submission (1 min)

Same call with the two human signals removed (no `elapsedMs`, no `interacted`, no nonce), which
scores 3 flags:

```sh
curl -L '<EXEC_URL>' \
  -H 'Content-Type: text/plain' \
  --data '{"name":"Botty Test","email":"bot-test@example.com","eventDate":"2026-10-02","eventLocation":"Nowhere","eventType":"Other","guestCount":"5","notes":"Quarantine test — delete this row."}'
```

Expected: **`{"ok":true}` as well** — a suspected bot is never told it was caught, and a
mis-flagged human is never shown a failure. Then check:

1. A **`Quarantine`** tab now exists with this row, Status `review`, Flags something like
   `fast,no-interaction,nonce`.
2. **A notification email arrives for this one too.** The rule watches the whole spreadsheet, so
   held rows are seen the same day rather than waiting for a summary. Quarantine is a sorting
   decision, not a delay.

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

If you ever add a call that needs a new permission, add its scope to `appsscript.json` in the
same edit and re-run `doGet` once to re-consent — and think twice before adding one. The one
scope is the security property that makes a public endpoint safe to leave running.

---

## Quotas and caps

| Limit                             | Value                                      | What happens at the limit                                                                       |
| --------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Notification emails               | Rate-limited by Google, not by this script | Google may batch or delay its own change notifications; every row is still written to the sheet |
| Nonce lifetime                    | 30 minutes                                 | An older nonce is one spam flag, nothing more                                                   |
| `CacheService` (duplicate signal) | 6-hour TTL, not durable storage            | Best-effort by design; the sheet write never depends on it                                      |

The script has no mail quota to exhaust, so a flood of bot submissions cannot cost you a lost
lead — it can only add rows. **The sheet is the record of truth**; the notification email is a
convenience that tells you to go and look at it.

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

| Symptom                                                        | Cause                                                                                                                   | Fix                                                                                                                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `curl` prints nothing, or exit code 0 with empty body          | Missing `-L`; POST to `/exec` answers with a 302 to `script.googleusercontent.com`                                      | Add `-L`                                                                                                                                                        |
| Browser console: _"blocked by CORS policy … preflight"_        | The request was sent as `application/json`, so the browser sent an `OPTIONS` preflight that Apps Script does not answer | Post the JSON string with `Content-Type: text/plain;charset=utf-8` (the site's adapter already does)                                                            |
| HTML sign-in page instead of JSON; 401/403                     | _Who has access_ is not **Anyone**, or a Workspace policy blocks it                                                     | Re-deploy with **Anyone**; if that option is unavailable, see the section above                                                                                 |
| Redirect loop, or `{"ok":…}` never arrives                     | Deployment was made from a different Google account than the sheet's owner                                              | Redeploy from the Happy Days account (the sheet's owner)                                                                                                        |
| _"Script function not found: doPost"_                          | Pasted an incomplete file, or the deployment predates the paste                                                         | Confirm `doPost` exists in the editor, save, then **Manage deployments → Edit → New version → Deploy**                                                          |
| `{"ok":false,"reason":"rejected"}`                             | A required field is empty or the email is malformed — the only hard rejects                                             | Check `name`, `email`, `eventDate`, `eventLocation`, `eventType`, `guestCount` in the payload                                                                   |
| `{"ok":false,"reason":"error"}`                                | The sheet write itself failed                                                                                           | Look in the `Quarantine` tab — the raw payload was saved with Status `error`; open **Executions** in the editor for the stack trace                             |
| Row appears, but no notification email                         | The notification rule is missing, or was set by a different account — rules are **per user**                            | In the sheet, as the Happy Days account: **Tools → Notification settings → Edit notifications** → _Any changes are made_ → _Email - right away_ → **Save** (§6) |
| Notification email says the sheet changed but shows no details | Google's change notification never includes cell contents                                                               | Expected — follow the link and read the row in the sheet                                                                                                        |
| Consent screen asks to send email as you                       | An old broad authorisation, or `appsscript.json` was not saved                                                          | Re-paste `appsscript.json` (§2 step 6), remove the grant at <https://myaccount.google.com/permissions>, run `doGet` again                                       |
| Submission landed in `Quarantine` unexpectedly                 | 2+ spam flags — check the **Flags** column                                                                              | Reply to it normally; if a pattern shows up, adjust the flag thresholds in `Code.gs` and re-deploy                                                              |
| Nothing writes to the sheet at all                             | The script is standalone, not bound to the spreadsheet                                                                  | It must be created from the sheet's own **Extensions → Apps Script**                                                                                            |
