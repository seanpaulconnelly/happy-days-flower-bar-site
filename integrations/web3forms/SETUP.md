# Fallback inquiry backend — Web3Forms

**This is the documented fallback, not what the site ships with.** The primary backend is the
Google Apps Script endpoint in [`../apps-script/SETUP.md`](../apps-script/SETUP.md), which also
saves every inquiry to a Google Sheet the business owns.

Switch to this only if Apps Script cannot be used — in practice, if a Google Workspace admin
policy prevents deploying a web app with _Who has access: **Anyone**_, so anonymous visitors
cannot reach it. Record the reason in `3-plans/happy-days-flower-bar-site/BLOCKERS.md`.

**Trade-off to accept before switching: no Google Sheet.** Sheets sync is a Web3Forms Pro
feature ("This is a PRO feature currently in Beta. You must have an active PRO plan subscription
to use this integration" — <https://docs.web3forms.com/>). On the free plan, inquiries arrive as
email only, so the inbox becomes the record of every lead.

Time: ~5 minutes.

---

## 1. Create a free access key

1. Go to <https://web3forms.com> and enter **hello@happydaysflowers.com** in the
   "Create Access Key" box.
2. Web3Forms sends a verification email to that address. Click the link in it — the access key
   is only issued once the address is confirmed, which is also what makes the key safe to
   publish: it can only ever deliver mail to the verified address.
3. The access key (a UUID) arrives by email. ([docs: getting started](https://docs.web3forms.com/))

There is no account password, no dashboard login required, and no API secret.

## 2. Point the site at it

One line in `src/config/site.ts`:

```ts
inquiry: {
  provider: 'web3forms',
  endpoint: '00000000-0000-0000-0000-000000000000',   // the access key, not a URL
  minElapsedMs: 3000,
},
```

Note that `endpoint` carries the **access key** in this mode, not a URL — the adapter always
posts to `https://api.web3forms.com/submit`.

## 3. What the adapter sends

A single JSON `POST` to `https://api.web3forms.com/submit` with
`Content-Type: application/json` and `Accept: application/json`:

```json
{
  "access_key": "00000000-0000-0000-0000-000000000000",
  "subject": "New flower bar inquiry — Test Person (2026-10-01)",
  "from_name": "Happy Days website",
  "replyto": "visitor@example.com",
  "botcheck": "",

  "name": "Test Person",
  "organization": "",
  "email": "visitor@example.com",
  "phone": "",
  "eventDate": "2026-10-01",
  "eventLocation": "Pittsburgh",
  "eventType": "Other",
  "guestCount": "25",
  "notes": "Message from the inquiry form."
}
```

- `access_key` — routes the submission to the verified inbox.
- `subject` — the email subject line.
- `from_name` — the display name on the notification email.
- `replyto` — the visitor's address, so replying from the inbox reaches them.
- `botcheck` — Web3Forms' own honeypot; it must be sent **empty**. Any non-empty value makes
  Web3Forms silently drop the submission as spam.
- Everything after the blank line is the form's own fields; Web3Forms renders unknown keys into
  the email body as-is.

A success response is `{"success": true, "message": "Email sent successfully!"}`; the adapter
maps anything else to the site's error state, which keeps the visitor's typed answers and offers
the prefilled `mailto:` fallback.

## 4. Limits and behaviour differences

|                           | Apps Script (primary)                                                     | Web3Forms (fallback)                                                                                        |
| ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Cost                      | Free                                                                      | Free tier: **250 submissions/month**, unlimited forms                                                       |
| Record of leads           | Google Sheet (`Inquiries` + `Quarantine` tabs), owned by the business     | Email only (Sheets sync is Pro)                                                                             |
| Auto-reply to the visitor | Yes, the owner's approved wording                                         | Not on the free tier — the adapter does not send one                                                        |
| Spam handling             | Honeypot + timing + nonce + content flags → quarantine, never a rejection | Web3Forms' own filtering plus the `botcheck` honeypot; a flagged submission is **dropped**, not quarantined |
| Daily quarantine digest   | Yes                                                                       | No                                                                                                          |
| Secrets in the repo       | None                                                                      | None                                                                                                        |

The last two rows are the reason this is a fallback: the "a real lead can never be lost" rule
(build plan §3.2) can only be fully honoured by the Apps Script backend, which saves every
submission before deciding anything. On Web3Forms, a false-positive spam classification is
invisible. If the site runs on this provider for any length of time, send a test submission
monthly to confirm delivery.

**Note on the free-tier number:** 250/month is what Web3Forms advertised at the time this was
written. Check <https://web3forms.com/#pricing> when you sign up.

## 5. The access key is public by design

It ships in the client bundle and is visible to anyone who views source. That is intended — the
Web3Forms docs say of the access key: _"Don't worry this can be public"_
(<https://docs.web3forms.com/>). It cannot be used to read past submissions or to send mail
anywhere except the verified address.

If the key is ever abused as a spam relay into the inbox, request a new key for the same address
and update the one line in `site.ts`.
