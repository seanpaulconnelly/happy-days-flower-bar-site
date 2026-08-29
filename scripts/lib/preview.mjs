import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const PREVIEW_PORT = 4173;

/** Base path the built site is served under, mirroring vite.config.ts. */
export function basePath() {
  return process.env.BASE_PATH ?? '/';
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [], flags: new Set() };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [name, inlineValue] = token.slice(2).split('=');
    if (inlineValue !== undefined) {
      args[name] = inlineValue;
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args[name] = argv[i + 1];
      i += 1;
    } else {
      args[name] = true;
      args.flags.add(name);
    }
  }
  return args;
}

async function waitForPort(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status < 500) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/**
 * Returns `{ url, stop }`. When `explicitUrl` is given nothing is spawned.
 * Otherwise `vite preview` is started, waited for, and killed on exit.
 */
export async function ensurePreview(explicitUrl) {
  if (explicitUrl) return { url: explicitUrl, stop: async () => {} };

  if (!existsSync(resolve(repoRoot, 'dist/index.html'))) {
    throw new Error('dist/ is missing - run `npm run build` first (or pass --url).');
  }

  const child = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  const url = `http://localhost:${PREVIEW_PORT}${basePath()}`;
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    child.kill('SIGTERM');
  };
  process.on('exit', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => {
    child.kill('SIGTERM');
    process.exit(130);
  });

  if (!(await waitForPort(url))) {
    await stop();
    throw new Error(`vite preview did not come up at ${url}`);
  }
  return { url, stop };
}

const CHROME_FALLBACK = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * Launch options for Playwright chromium, falling back to the system Chrome
 * when the bundled browser was never downloaded.
 */
export function launchOptions(chromium) {
  try {
    const path = chromium.executablePath();
    if (path && existsSync(path)) return {};
  } catch {
    // executablePath() throws when nothing is installed
  }
  if (existsSync(CHROME_FALLBACK)) {
    console.warn(`! bundled chromium missing - using ${CHROME_FALLBACK}`);
    return { executablePath: CHROME_FALLBACK };
  }
  throw new Error(
    'No browser available: run `npx playwright install chromium` or install Google Chrome.',
  );
}

/**
 * Wait for web fonts and every <img> to settle.
 *
 * Every image below the hero is `loading="lazy"`, and a lazy image that has
 * never come near the viewport stays `complete === false` forever — waiting on
 * its `load` event hangs. So walk the page top to bottom first to bring them
 * all into range, return to the top, and then wait, with a ceiling so one
 * stalled request cannot block the sweep.
 */
export async function waitForPaint(page) {
  await page.evaluate(async () => {
    // `index.css` sets `scroll-behavior: smooth`, which turns every scrollTo
    // into an animation the loop below would out-run; force instant jumps for
    // the duration of the pass and put the declaration back afterwards.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const step = Math.max(200, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y < root.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((done) => setTimeout(done, 80));
    }
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const settled = Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((done) => {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          }),
      );
    await Promise.race([
      Promise.all(settled),
      new Promise((done) => setTimeout(done, 10000)),
    ]);
  });
  await page.waitForTimeout(200);
}

/**
 * Returns `{ scrollWidth, innerWidth, offenders }` where offenders are CSS
 * selectors for elements sticking out past the viewport.
 */
export async function overflowReport(page) {
  return page.evaluate(() => {
    const innerWidth = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const offenders = [];
    if (scrollWidth > innerWidth) {
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.right <= innerWidth + 1 && rect.left >= -1) continue;
        const id = el.id ? `#${el.id}` : '';
        const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 3).join('.')}` : '';
        offenders.push(
          `${el.tagName.toLowerCase()}${id}${cls} (left ${Math.round(rect.left)}, right ${Math.round(rect.right)})`,
        );
        if (offenders.length >= 10) break;
      }
    }
    return { scrollWidth, innerWidth, offenders };
  });
}
