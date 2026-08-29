#!/usr/bin/env node
/**
 * Build gate for the head injection (request SEO-2).
 *
 *   node scripts/check-seo.mjs        # reads dist/index.html
 *
 * Runs against the *built* HTML, after `vite build`, because the whole point of
 * SEO-1 is that the head exists without JavaScript. It is the only thing that
 * catches a regression where the `happy-days-seo-head` plugin stops running or
 * React starts hoisting metadata of its own.
 *
 * Asserts:
 *   - exactly one <title>, non-empty;
 *   - exactly one <meta name="description">, non-empty;
 *   - exactly one application/ld+json block that JSON.parses and whose @graph
 *     contains a Florist node and an FAQPage node;
 *   - indexability matches the `public/CNAME` switch (decision D5):
 *       CNAME present -> <link rel="canonical" href="https://happydaysflowers.com/">
 *                        and no `noindex` anywhere in the head;
 *       CNAME absent  -> `noindex,nofollow` present and NO canonical link.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './lib/preview.mjs';

const CANONICAL_HREF = 'https://happydaysflowers.com/';

const distIndex = resolve(repoRoot, 'dist/index.html');
if (!existsSync(distIndex)) {
  console.error('check-seo: dist/index.html is missing - run `npx vite build` first.');
  process.exit(1);
}

const html = readFileSync(distIndex, 'utf8');
const head = html.slice(0, html.toLowerCase().indexOf('</head>') + 7);
const failures = [];
const fail = (message) => failures.push(message);

const matchAll = (pattern) => [...html.matchAll(pattern)];

// --- title ------------------------------------------------------------------
const titles = matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi);
if (titles.length !== 1) fail(`expected exactly one <title>, found ${titles.length}`);
else if (titles[0][1].trim() === '') fail('<title> is empty');

// --- description ------------------------------------------------------------
const descriptions = matchAll(/<meta\s+name=["']description["'][^>]*>/gi);
if (descriptions.length !== 1) {
  fail(`expected exactly one <meta name="description">, found ${descriptions.length}`);
} else if (!/content=["'][^"']+["']/i.test(descriptions[0][0])) {
  fail('<meta name="description"> has no content');
}

// --- JSON-LD ----------------------------------------------------------------
const blocks = matchAll(
  /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
);
if (blocks.length !== 1) {
  fail(`expected exactly one application/ld+json block, found ${blocks.length}`);
} else {
  let graph;
  try {
    graph = JSON.parse(blocks[0][1]);
  } catch (error) {
    fail(`the ld+json block does not parse: ${error.message}`);
  }
  if (graph) {
    const nodes = Array.isArray(graph['@graph']) ? graph['@graph'] : [];
    const types = new Set(nodes.map((node) => node['@type']));
    if (graph['@context'] !== 'https://schema.org') fail('ld+json @context is not schema.org');
    if (!types.has('Florist')) fail('ld+json has no "@type":"Florist" node');
    if (!types.has('FAQPage')) fail('ld+json has no "@type":"FAQPage" node');
    const faqPages = nodes.filter((node) => node['@type'] === 'FAQPage');
    if (faqPages.length > 1) fail(`expected one FAQPage node, found ${faqPages.length}`);
  }
}

// --- indexability, gated on public/CNAME (decision D5) ----------------------
const hasCname = existsSync(resolve(repoRoot, 'public/CNAME'));
const canonicals = matchAll(/<link\s+rel=["']canonical["'][^>]*>/gi);
const hasNoindex = /content=["'][^"']*noindex[^"']*["']/i.test(head);

if (hasCname) {
  if (canonicals.length !== 1) {
    fail(`CNAME present: expected exactly one canonical link, found ${canonicals.length}`);
  } else if (!canonicals[0][0].includes(`href="${CANONICAL_HREF}"`)) {
    fail(`CNAME present: canonical is not href="${CANONICAL_HREF}" (${canonicals[0][0]})`);
  }
  if (hasNoindex) fail('CNAME present: the head still carries a noindex directive');
} else {
  if (canonicals.length !== 0) {
    fail(`CNAME absent: expected no canonical link, found ${canonicals.length}`);
  }
  if (!/content=["']noindex,nofollow["']/i.test(head)) {
    fail('CNAME absent: expected <meta name="robots" content="noindex,nofollow">');
  }
}

const mode = hasCname ? 'canonical (public/CNAME present)' : 'preview (no public/CNAME)';
if (failures.length > 0) {
  console.error(`check-seo: FAIL - ${failures.length} problem(s) in dist/index.html [${mode}]:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`check-seo: OK - head, JSON-LD and indexability are correct [${mode}].`);
