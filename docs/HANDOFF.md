# Looking after the website

A plain-language guide to changing the Happy Days Flower Farm website. Nothing
here needs you to be a programmer. Every task below can be done **by you** by
editing one file, or **by Claude Code** — just describe what you want; the
suggested wording is at the end of each section.

---

## What the site is, and where it lives

One page. Everything a visitor needs — what the flower bar is, how it works, the
four packages, the gallery, the story, the FAQ, and the inquiry form at the
bottom — scrolls in a single view. There is no login, no database and no shopping
cart, which is why it is fast and there is very little that can break.

| Thing                      | Where                                                                   |
| -------------------------- | ----------------------------------------------------------------------- |
| The website's source files | https://github.com/seanpaulconnelly/happy-days-flower-bar-site          |
| The live site              | https://happydaysflowers.com _(once the domain is switched on)_         |
| Temporary preview address  | https://seanpaulconnelly.github.io/happy-days-flower-bar-site/          |
| All the words on the page  | `src/content/copy.ts`                                                   |
| The photos                 | `assets-src/images/` (originals) → `public/images/` (what visitors see) |

**How a change goes live.** You edit a file, save it, and it gets "committed and
pushed" — a one-line command that uploads the change. GitHub then rebuilds the
site automatically and publishes it. It takes about two minutes from push to
live. There is no separate "publish" button and no staging site to keep in sync.

The preview address above deliberately tells Google _not_ to list it, so the real
domain doesn't end up competing with a temporary one in search results.

---

## Change a price, a package name, or any sentence

**Every visible word on the page lives in one file: `src/content/copy.ts`.** Open
it, find the words you want to change, change them, save.

For example, the Classic package's price is this line:

```ts
{
  name: 'The Classic Flower Bar',
  guests: 'Up to 25 guests',
  maxGuests: 25,
  price: '$895',
  description:
    'A complete flower bar experience for smaller gatherings, client events and celebrations.',
```

To raise it to $950 you change `price: '$895',`to`price: '$950',`. That is the
whole edit. The price appears on the package card _and_ in the structured data
Google reads, but both come from this one line, so they can never disagree.

Then:

```sh
npm run check
git add -A
git commit -m "Update Classic Flower Bar price"
git push origin main
```

About two minutes later, the new price is live.

**A safety net worth knowing about.** The wording on this site was transcribed
word-for-word from your approved brief and your answers, and it is deliberately
kept that way: `src/content/copy.ts` is the only place any of it exists, and
`npm run check` builds the page and confirms that **every single string in that
file is genuinely visible on the finished page** — every heading, package name,
guest range, price, FAQ question and answer, event type and form label. If one
has gone missing, the check **fails and the change will not deploy**.

That is a feature, not a fault. It means a layout change, a refactor or a
mistyped edit can never quietly drop an approved sentence from the page. Because
the check reads the wording from `copy.ts` itself, a deliberate rewording needs
nothing extra — change the sentence and the check simply starts requiring the new
one. A failure means the page and the approved copy have drifted apart, which is
exactly when you want to be stopped.

> **Or ask Claude Code:** _"In this repo, change the Classic Flower Bar price to
> $950 in `src/content/copy.ts`, run `npm run check`, then commit and push."_

---

## Swap a photo

Nine photographs are used on the page. Each one has a fixed file name, and the
page finds the photo by that name — so **the simplest swap is to save the new
photo with the same file name as the one it replaces.** Nothing else has to
change.

The originals live in `assets-src/images/`. That folder is not uploaded to
GitHub — only the optimised, resized versions the website actually serves are.

| Where it appears on the page                      | File name in `assets-src/images/`                    |
| ------------------------------------------------- | ---------------------------------------------------- |
| Hero — the big photo at the very top              | `hero-flower-bar.jpeg`                               |
| "A Flower Bar, Brought to You" _and_ the gallery  | `flower-bar-closeup.jpeg`                            |
| "Why Happy Days?" — first of three                | `farm-bouquet-pink-white.jpeg`                       |
| "Why Happy Days?" — second of three               | `farm-bouquet-colorful.jpeg`                         |
| "Why Happy Days?" — third of three                | `farm-zinnias.jpeg`                                  |
| Gallery — second image                            | `gallery-event-detail.jpeg`                          |
| Gallery — third image                             | `gallery-arrangement.jpeg`                           |
| Gallery — fourth image                            | `gallery-arrangement-outdoor.jpeg`                   |
| About — "Grown in Greensburg. Made to Be Shared." | `about-still-life.jpeg`                              |

**About that last row.** The About section shows the photo your brief named for
that slot — the glass vase still life with blue delphinium, yellow craspedia and
pink spray roses against a brick wall. The file arrived under a name that
suggested a candid picture of someone at work, so it has been renamed to
`about-still-life.jpeg` to match what is actually in the frame (the same name
the public files already use). If you did mean a photo of the work in progress
rather than the still life, that is a one-line fix: save the new picture as
`about-still-life.jpeg` in `assets-src/images/`, update the short description of
the picture (the `alt` text in `src/content/images.ts`, which screen readers and
Google read), and re-run the image step below.

**The hero photo is expected to change.** The one on the page now is a
placeholder for the new signage photo; when that is ready, drop it in as
`hero-flower-bar.jpeg` and follow the steps below.

To swap a photo:

```sh
# 1. put the new photo in assets-src/images/ with the same file name
npm run images
npm run check
git add -A
git commit -m "New hero photo"
git push origin main
```

`npm run images` resizes and re-compresses everything into the four sizes and
three formats browsers need, regenerates the social-sharing preview image, and
updates the list the page reads. It takes a few seconds. Then the commit
uploads `public/images/` and `src/content/images.generated.ts` — never the
originals.

Photos work best if they are **portrait, roughly 1152 × 1536 pixels or larger**,
and not already heavily compressed; the script does the compressing.

> **Or ask Claude Code:** _"I've put a new `hero-flower-bar.jpeg` in
> `assets-src/images/`. Run `npm run images`, check the result, then commit and
> push."_

---

## Change the FAQ

The eight questions and answers are in the same file, `src/content/copy.ts`,
under `faq`. Edit the text in place to reword an answer, or add a new
question-and-answer pair to the list.

**The order in that list is the order on the page** — and it is also the order
Google sees in the structured data behind the page. It was deliberately arranged
so the questions people actually search for come first. Rewording an answer is
easy; reordering the list is an SEO decision, so it is worth a conversation
before doing it. (If you add a question, adding it near a related one usually
reads best.)

> **Or ask Claude Code:** _"Add an FAQ entry to `src/content/copy.ts` — the
> question is '…' and the answer is '…', word for word. Put it after the
> delivery question, run `npm run check`, then commit and push."_

---

## Inquiries — where they land

When someone fills in the form at the bottom of the page:

- **A row is added to the Google Sheet** (`Happy Days — Inquiries`) in the Happy
  Days Google account, on the tab called **`Inquiries`**.
- **An email arrives at `hello@happydaysflowers.com`** with the details, so you
  don't have to watch the spreadsheet.
- **The visitor gets an automatic reply** confirming you received it — the same
  words they see on screen after submitting.

Some submissions look automated (a bot filling in forms all over the internet).
Those are **not thrown away** — they go to a second tab called **`Quarantine`**,
and they do not email you immediately. Instead, **once a day at about 8 am** you
get a short digest listing anything that was held overnight. On days when nothing
was held, no digest is sent.

**If a real person's inquiry ends up in `Quarantine`** — it happens occasionally,
usually when someone fills the form in very fast — just reply to them normally
from the address in that row, and move the row over to the `Inquiries` tab so
your records stay in one place. If it keeps happening to genuine inquiries, that
is worth flagging; the sensitivity can be adjusted.

**A habit worth keeping: once a month, send yourself a test inquiry** from the
live site. It takes thirty seconds and confirms three things at once — the form
still submits, the Sheet still receives it, and the emails still arrive. Silent
failure is the only real risk with a form like this, and a monthly test is how
you catch it in days rather than months. Delete the test row afterwards.

> **Or ask Claude Code:** _"Check the inquiry form on the live site is still
> working end to end and tell me what to look for in the Sheet."_

---

## Analytics and cookies

Visitor statistics come from Google Analytics, and the tag is set up to load
**only on `happydaysflowers.com`**. It does not run on the preview address or
while anyone is working on the site locally, so your own visits and any testing
never show up in the numbers.

There is no cookie banner in this first version. That is a deliberate choice: the
business is a US small business serving Western Pennsylvania and is not marketing
to the EU or UK, where a consent banner would be required. If that ever changes —
advertising into Europe, for instance — the banner question should be revisited.

---

## What might come later

Version one is inquiry-based on purpose: one page, one clear action. The site was
built so these can be added later without starting over. None of them are
promised or scheduled — they are simply what the structure leaves room for.

- Booking a package directly on the site
- Deposits and online payments
- Availability or calendar integration
- Corporate and event floral services as their own section
- Recurring commercial floral service
- Live floral experiences
- A brand identity pass — version one uses a typed wordmark rather than the logo,
  so a proper logo, colour and type treatment is a natural next step

---

## If something looks wrong

1. Check whether the deploy actually finished: the Actions tab at
   https://github.com/seanpaulconnelly/happy-days-flower-bar-site/actions — a
   green tick means the latest change is live.
2. Hard-refresh the page (Cmd-Shift-R on a Mac) — browsers cache aggressively.
3. If a change won't deploy, `npm run check` will say why, in plain English, and
   the answer is usually the copy safety net described above.
4. Anything else: ask Claude Code, and point it at this file and at
   `docs/RELEASE.md` (the technical runbook).

Nothing on this site can be permanently broken by an edit. Every version is kept,
and any change can be undone by reverting it — which is a one-line command, not a
recovery operation.
