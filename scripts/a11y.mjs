#!/usr/bin/env node
/**
 * axe-core accessibility scan at 375 and 1280 (plan Appendix H).
 *
 *   node scripts/a11y.mjs [--url http://...]
 *
 * Exits non-zero on any violation.
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { ensurePreview, launchOptions, parseArgs, waitForPaint } from './lib/preview.mjs';

const WIDTHS = [375, 1280];

const args = parseArgs();
const { url, stop } = await ensurePreview(typeof args.url === 'string' ? args.url : undefined);
const browser = await chromium.launch(launchOptions(chromium));
let total = 0;

try {
  console.log(`a11y: ${url}`);
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPaint(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    if (results.violations.length === 0) {
      console.log(`  ok ${width}px - 0 violations`);
      continue;
    }
    total += results.violations.length;
    console.error(`  x ${width}px - ${results.violations.length} violation(s)`);
    for (const v of results.violations) {
      console.error(`      [${v.impact ?? 'n/a'}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 5)) {
        console.error(`        ${node.target.join(' ')}`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await stop();
}

if (total > 0) {
  console.error(`\nFAIL: ${total} axe violation(s).`);
  process.exit(1);
}
console.log('\nOK: zero axe violations.');
