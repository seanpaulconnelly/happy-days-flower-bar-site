#!/usr/bin/env node
/**
 * Full-page screenshot sweep (plan Appendix H).
 *
 *   node scripts/screenshots.mjs [--url http://...] [--label baseline]
 *
 * Writes docs/qa/screenshots/<label>/{320,375,768,1280,1536}.png plus
 * 375-scrolled.png (375 viewport after scrolling 1200px, to check the sticky
 * header/CTA). Asserts no horizontal overflow at every width and prints the
 * offending selectors. Exits non-zero on overflow.
 */
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import {
  ensurePreview,
  launchOptions,
  overflowReport,
  parseArgs,
  repoRoot,
  waitForPaint,
} from './lib/preview.mjs';

const WIDTHS = [320, 375, 768, 1280, 1536];
const HEIGHT = 900;

const args = parseArgs();
const label = typeof args.label === 'string' ? args.label : 'latest';
const outDir = resolve(repoRoot, 'docs/qa/screenshots', label);

const { url, stop } = await ensurePreview(typeof args.url === 'string' ? args.url : undefined);
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch(launchOptions(chromium));
let failures = 0;

try {
  console.log(`screenshots: ${url} -> docs/qa/screenshots/${label}/`);
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: HEIGHT },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPaint(page);

    const { scrollWidth, innerWidth, offenders } = await overflowReport(page);
    if (scrollWidth > innerWidth) {
      failures += 1;
      console.error(
        `  x ${width}px OVERFLOW: scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`,
      );
      for (const offender of offenders) console.error(`      ${offender}`);
    } else {
      console.log(`  ok ${width}px (scrollWidth ${scrollWidth})`);
    }

    await page.screenshot({ path: resolve(outDir, `${width}.png`), fullPage: true });

    if (width === 375) {
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(400);
      await page.screenshot({ path: resolve(outDir, '375-scrolled.png'), fullPage: false });
      console.log('  ok 375-scrolled.png (viewport after 1200px scroll)');
    }

    await context.close();
  }
} finally {
  await browser.close();
  await stop();
}

if (failures > 0) {
  console.error(`\nFAIL: horizontal overflow at ${failures} width(s).`);
  process.exit(1);
}
console.log('\nOK: no horizontal overflow.');
process.exit(0);
