#!/usr/bin/env node
/**
 * Asserts every canonical copy string exported from src/content/copy.ts is
 * actually rendered on the page (plan Appendix H). React renders client-side,
 * so this reads the DOM under `vite preview` via Playwright, not raw HTML.
 *
 *   node scripts/check-copy.mjs [--url http://...] [--skip-until-phase-5]
 *
 * `copy.ts` is imported directly: Node >= 22.6 strips TypeScript types
 * natively, and this repo runs on a newer Node than that (checked below).
 */
import { chromium } from 'playwright';
import { ensurePreview, launchOptions, parseArgs, waitForPaint } from './lib/preview.mjs';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 6)) {
  console.error(
    `check-copy needs Node >= 22.6 for native TypeScript type stripping (found ${process.versions.node}).`,
  );
  process.exit(1);
}

const args = parseArgs();
const skip = Boolean(args['skip-until-phase-5']);

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
  return text
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const expected = canonicalStrings();

if (skip) {
  console.warn(
    `check-copy: SKIPPED (--skip-until-phase-5). ${expected.length} canonical string(s) will be enforced once the sections exist.`,
  );
  process.exit(0);
}

const { url, stop } = await ensurePreview(typeof args.url === 'string' ? args.url : undefined);
const browser = await chromium.launch(launchOptions(chromium));
const missing = [];

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
} finally {
  await browser.close();
  await stop();
}

console.log(`check-copy: ${expected.length - missing.length}/${expected.length} strings rendered.`);
if (missing.length > 0) {
  console.error('\nFAIL: copy missing from the rendered page:');
  for (const string of missing) {
    console.error(`  - ${string.length > 90 ? `${string.slice(0, 90)}...` : string}`);
  }
  process.exit(1);
}
console.log('OK: all canonical copy is on the page.');
