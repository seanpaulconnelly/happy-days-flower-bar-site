#!/usr/bin/env node
/**
 * Asserts every canonical copy string exported from src/content/copy.ts is
 * actually rendered on the page (plan Appendix H). React renders client-side,
 * so this reads the DOM under `vite preview` via Playwright, not raw HTML.
 *
 *   node scripts/check-copy.mjs [--url http://...]
 *
 * The rendered text is read as `innerText` + `textContent`, so copy that is
 * present but not painted - the collapsed `<details>` answers in the FAQ, the
 * `<option>` labels in the form - still counts as rendered.
 *
 * It also asserts that `public/llms.txt` has not drifted from `copy.ts`
 * (requests SEO-7 and SEO-9): that file duplicates approved copy by design, so
 * every fact-carrying string it restates must still appear in it.
 *
 * And, because `check-seo.mjs` reads the *static* `dist/index.html`, this is
 * where the rendered DOM is checked for exactly one `<title>`, one meta
 * description and one JSON-LD block — a React regression that re-introduced any
 * of them at hydration would be invisible to the static check (SEO-9b).
 *
 * `copy.ts` is imported directly: Node >= 22.6 strips TypeScript types
 * natively, and this repo runs on a newer Node than that (checked below).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ensurePreview, launchOptions, parseArgs, repoRoot, waitForPaint } from './lib/preview.mjs';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 6)) {
  console.error(
    `check-copy needs Node >= 22.6 for native TypeScript type stripping (found ${process.versions.node}).`,
  );
  process.exit(1);
}

const args = parseArgs();

const copy = await import('../src/content/copy.ts');

/**
 * Every string that must be visible on the finished page. Deliberately
 * assembled from the exports rather than hard-coded, so adding copy to
 * copy.ts adds it to the check.
 */
function canonicalStrings() {
  const out = [];
  const add = (...values) => {
    for (const v of values) if (typeof v === 'string' && v.trim()) out.push(v);
  };

  add(copy.header.wordmark);
  add(...copy.header.nav.map((n) => n.label));

  add(copy.hero.eyebrow, copy.hero.heading, copy.hero.body, copy.hero.cta);

  add(
    copy.flowerBarIntro.heading,
    copy.flowerBarIntro.lead,
    ...copy.flowerBarIntro.body,
    copy.flowerBarIntro.emphasis,
    copy.flowerBarIntro.cta,
  );

  add(copy.howItWorks.heading, copy.howItWorks.closing);
  for (const step of copy.howItWorks.steps) add(step.number, step.title, step.body);

  add(copy.packages.heading, copy.packages.intro, copy.packages.footnote, copy.packages.cta);
  add(copy.packages.mostPopularLabel);
  for (const p of [...copy.packages.items, copy.packages.custom]) {
    add(p.name, p.guests, p.price, p.description);
  }

  add(copy.whyHappyDays.heading);
  for (const r of copy.whyHappyDays.reasons) add(r.title, r.body);

  add(copy.gallery.heading, copy.gallery.body, copy.gallery.emphasis);

  add(copy.about.heading, ...copy.about.body);

  add(copy.faq.heading);
  for (const item of copy.faq.items) add(item.question, item.answer);

  add(...copy.eventTypes);

  add(copy.inquiry.heading, ...copy.inquiry.body, copy.inquiry.submit);
  add(...copy.inquiry.fields.map((f) => f.label));

  add(...copy.footer.lines, copy.footer.tagline);
  add(...Object.values(copy.footer.socialLabels));

  // autoReply is email copy, not page copy - intentionally excluded.
  return [...new Set(out)];
}

/** Collapse whitespace and decode the entities React may emit. */
function normalise(text) {
  return (
    text
      .replace(/&nbsp;|\u00a0/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      // llms.txt is hand-wrapped and uses straight quotes; copy.ts uses
      // typographic marks (decision D3). Fold both so the comparison is about
      // words, not about which apostrophe glyph a file happens to carry.
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * SEO-7 / SEO-9a: `public/llms.txt` restates approved copy for answer engines,
 * so it silently rots when copy.ts changes. Assert every string it carries.
 *
 * Two strings are deliberately absent from this list and must stay absent:
 * `copy.hero.body`, which llms.txt line-wraps inside a `>` blockquote so the
 * `> ` prefix breaks containment, and `copy.about.body[1]`, which llms.txt does
 * not restate at all (seo-review §2, N1).
 */
function checkLlmsTxt() {
  const path = resolve(repoRoot, 'public/llms.txt');
  const haystack = normalise(readFileSync(path, 'utf8'));
  const required = [
    ...copy.faq.items.map((item) => ({ label: 'faq answer', text: item.answer })),
    ...[...copy.packages.items, copy.packages.custom].flatMap((pkg) => [
      { label: `price (${pkg.name})`, text: pkg.price },
      { label: `guests (${pkg.name})`, text: pkg.guests },
      { label: `description (${pkg.name})`, text: pkg.description },
    ]),
    { label: 'flower bar intro 1', text: copy.flowerBarIntro.body[0] },
    { label: 'flower bar intro 2', text: copy.flowerBarIntro.body[1] },
    { label: 'flower bar emphasis', text: copy.flowerBarIntro.emphasis },
    { label: 'packages intro', text: copy.packages.intro },
    { label: 'packages footnote', text: copy.packages.footnote },
    ...copy.howItWorks.steps.map((step, i) => ({
      label: `how it works ${i + 1}`,
      text: step.body,
    })),
    ...copy.whyHappyDays.reasons.map((reason) => ({
      label: `why: ${reason.title}`,
      text: reason.body,
    })),
    { label: 'about', text: copy.about.body[0] },
  ];
  const missing = required.filter((entry) => !haystack.includes(normalise(entry.text)));

  console.log(
    `check-copy: llms.txt ${required.length - missing.length}/${required.length} approved string(s) present.`,
  );
  if (missing.length === 0) return;

  console.error('\nFAIL: public/llms.txt has drifted from src/content/copy.ts:');
  for (const entry of missing) {
    const text = entry.text.length > 90 ? `${entry.text.slice(0, 90)}...` : entry.text;
    console.error(`  - ${entry.label}: ${text}`);
  }
  process.exit(1);
}

const expected = canonicalStrings();

// Independent of the rendered page, so it runs first and without a browser.
checkLlmsTxt();

const { url, stop } = await ensurePreview(typeof args.url === 'string' ? args.url : undefined);
const browser = await chromium.launch(launchOptions(chromium));
const missing = [];
/** Assigned inside the try below; anything that throws first never reaches the report. */
let headProblems;

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForPaint(page);

  // innerText collapses hidden content; textContent keeps <details> answers and
  // <option> labels. Check against both.
  const rendered = await page.evaluate(() => ({
    innerText: document.body.innerText,
    textContent: document.body.textContent ?? '',
  }));
  const haystack = normalise(`${rendered.innerText}\n${rendered.textContent}`);

  for (const string of expected) {
    if (!haystack.includes(normalise(string))) missing.push(string);
  }

  // SEO-9b: the head is injected at build time and React must not re-introduce
  // any of it at hydration. check-seo reads the static HTML, so this is the
  // only place that can see a runtime duplicate.
  const head = await page.evaluate(() => ({
    title: document.querySelectorAll('title').length,
    description: document.querySelectorAll('meta[name="description"]').length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
  }));
  headProblems = Object.entries(head)
    .filter(([, count]) => count !== 1)
    .map(([key, count]) => `runtime head: expected exactly one ${key}, found ${count}`);
} finally {
  await browser.close();
  await stop();
}

console.log(`check-copy: ${expected.length - missing.length}/${expected.length} strings rendered.`);
console.log(
  headProblems.length === 0
    ? 'check-copy: runtime head is unique (one title, one description, one JSON-LD).'
    : 'check-copy: runtime head is NOT unique.',
);
if (missing.length > 0 || headProblems.length > 0) {
  if (missing.length > 0) {
    console.error('\nFAIL: copy missing from the rendered page:');
    for (const string of missing) {
      console.error(`  - ${string.length > 90 ? `${string.slice(0, 90)}...` : string}`);
    }
  }
  if (headProblems.length > 0) {
    console.error('\nFAIL: document head regressed at runtime (SEO-1):');
    for (const problem of headProblems) console.error(`  - ${problem}`);
  }
  process.exit(1);
}
console.log('OK: all canonical copy is on the page.');
// Explicit exit: never let a lingering browser/preview handle keep CI waiting.
process.exit(0);
