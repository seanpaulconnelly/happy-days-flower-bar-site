#!/usr/bin/env node
/**
 * Fails the build on unresolved `TODO_` placeholders in src/config/site.ts.
 *
 *   node scripts/check-config.mjs [--allow-todos]
 *
 * `--allow-todos` downgrades to a warning; it is used only for intermediate
 * deploys to the github.io preview URL, and the remaining TODOs are listed.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs, repoRoot } from './lib/preview.mjs';

const args = parseArgs();
const allow = Boolean(args['allow-todos']);

const file = resolve(repoRoot, 'src/config/site.ts');
const source = readFileSync(file, 'utf8');

const todos = [];
source.split('\n').forEach((line, index) => {
  const match = line.match(/TODO_[A-Z0-9_]+/g);
  if (match) todos.push({ line: index + 1, text: line.trim(), tokens: match });
});

if (todos.length === 0) {
  console.log('check-config: OK - no TODO_ placeholders in src/config/site.ts.');
  process.exit(0);
}

const report = todos
  .map((t) => `  src/config/site.ts:${t.line}  ${t.tokens.join(', ')}\n      ${t.text}`)
  .join('\n');

if (allow) {
  console.warn(
    `check-config: ${todos.length} unresolved placeholder(s) (--allow-todos):\n${report}`,
  );
  process.exit(0);
}

console.error(`check-config: FAIL - ${todos.length} unresolved placeholder(s):\n${report}`);
console.error('\nResolve them, or pass --allow-todos for a preview deploy.');
process.exit(1);
