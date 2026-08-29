#!/usr/bin/env node
/**
 * `npm run check` runner:
 *   typecheck -> lint -> check:config -> build -> check:seo -> check:copy.
 *
 *   npm run check
 *   npm run check -- --allow-todos      # used by the CI workflow for preview deploys
 *
 * A single runner exists so extra flags reach the right step: --allow-todos is
 * forwarded to check-config, and every other flag to check-copy.
 */
import { spawnSync } from 'node:child_process';
import { repoRoot } from './lib/preview.mjs';

const argv = process.argv.slice(2);
const allowTodos = argv.includes('--allow-todos');
const copyArgs = argv.filter((a) => a !== '--allow-todos');

// Order note: the plan lists check:copy before build, but check:copy reads the
// rendered DOM under `vite preview`, which serves dist/. Building first is the
// only order that checks the copy actually about to ship.
//
// check:copy and check:config go through `npm run` so their package.json
// definitions stay the single source of truth - that is where the Phase 3
// `--skip-until-phase-5` flag lives, and where it gets removed in Phase 5.
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const steps = [
  { name: 'typecheck', cmd: 'npx', args: ['tsc', '-b', '--force'] },
  { name: 'lint', cmd: 'npx', args: ['eslint', '.'] },
  {
    name: 'check:config',
    cmd: npm,
    args: ['run', 'check:config', ...(allowTodos ? ['--', '--allow-todos'] : [])],
  },
  { name: 'build', cmd: 'npx', args: ['vite', 'build'] },
  // Reads dist/index.html, so it has to follow the build (request SEO-2).
  { name: 'check:seo', cmd: npm, args: ['run', 'check:seo'] },
  {
    name: 'check:copy',
    cmd: npm,
    args: ['run', 'check:copy', ...(copyArgs.length ? ['--', ...copyArgs] : [])],
  },
];

for (const step of steps) {
  console.log(`\n--- ${step.name} ---`);
  const result = spawnSync(step.cmd, step.args, { cwd: repoRoot, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\ncheck: FAILED at "${step.name}".`);
    process.exit(result.status ?? 1);
  }
}

console.log('\ncheck: all steps passed.');
