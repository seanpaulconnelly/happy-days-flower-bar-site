import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
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

async function waitForPort(url, { timeoutMs = 60000, isDead = () => false } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status < 500) return true;
    } catch {
      // not up yet
    }
    if (isDead()) return false;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/** True when nothing is listening on `port` — checked by trying to bind it. */
function portIsFree(port) {
  return new Promise((done) => {
    const probe = createServer();
    probe.once('error', () => done(false));
    probe.once('listening', () => probe.close(() => done(true)));
    probe.listen(port, '127.0.0.1');
  });
}

/**
 * Returns `{ url, stop }`. When `explicitUrl` is given nothing is spawned.
 * Otherwise `vite preview` is started, waited for, and killed on exit.
 *
 * QA-4: the harness must never audit a server it did not start. `--strictPort`
 * makes vite exit when 4173 is taken, and the old code ignored both that exit
 * and the child's stderr, so `waitForPort` would succeed against whatever
 * foreign process held the port — reporting a confident pass (or a confident
 * `0/105`) against the wrong build. So: probe the port before spawning, keep
 * the child's stderr, and fail the moment it exits.
 */
export async function ensurePreview(explicitUrl) {
  if (explicitUrl) return { url: explicitUrl, stop: async () => {} };

  if (!existsSync(resolve(repoRoot, 'dist/index.html'))) {
    throw new Error('dist/ is missing - run `npm run build` first (or pass --url).');
  }

  if (!(await portIsFree(PREVIEW_PORT))) {
    throw new Error(
      `port ${PREVIEW_PORT} is already in use — something else is listening there, and this ` +
        'script will not audit a server it did not start. Stop it (`pkill -f "vite preview"`) ' +
        'and re-run.',
    );
  }

  // Spawn vite's own entry point, not `npx vite`: on Linux CI (npm 10) `npx`
  // runs the command through `sh`, so killing npx leaves the real `vite`
  // process orphaned. That orphan keeps the stderr pipe open, Node keeps the
  // parent's event loop alive for it, and `npm run check` hangs until the
  // runner's job timeout (observed on GitHub Actions, 2026-08-29). Running the
  // bin directly in its own process group lets `stop()` kill the whole group.
  const viteBin = resolve(repoRoot, 'node_modules/vite/bin/vite.js');
  const child = spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(PREVIEW_PORT), '--strictPort'],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
      detached: process.platform !== 'win32',
    },
  );

  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
    process.stderr.write(chunk);
  });

  let exit = null;
  child.on('exit', (code, signal) => {
    exit = { code, signal };
  });
  child.on('error', (error) => {
    exit = { code: null, signal: null, error };
  });

  const url = `http://localhost:${PREVIEW_PORT}${basePath()}`;

  /** Signal the whole preview process group (falls back to the child alone). */
  const signal = (sig) => {
    if (exit !== null) return;
    try {
      if (process.platform !== 'win32') process.kill(-child.pid, sig);
      else child.kill(sig);
    } catch {
      try {
        child.kill(sig);
      } catch {
        // already gone
      }
    }
  };

  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    signal('SIGTERM');
    // Give vite a moment to exit cleanly, then make sure nothing survives and
    // nothing keeps this process's event loop alive.
    const deadline = Date.now() + 3000;
    while (exit === null && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (exit === null) signal('SIGKILL');
    child.stderr.destroy();
    child.unref();
  };
  process.on('exit', () => signal('SIGTERM'));
  process.on('SIGINT', () => {
    signal('SIGTERM');
    process.exit(130);
  });

  if (!(await waitForPort(url, { isDead: () => exit !== null }))) {
    await stop();
    const why = exit
      ? `vite preview exited (code ${exit.code}, signal ${exit.signal})`
      : `vite preview did not come up at ${url}`;
    throw new Error(stderr.trim() ? `${why}:\n${stderr.trim()}` : why);
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
    await Promise.race([Promise.all(settled), new Promise((done) => setTimeout(done, 10000))]);
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
