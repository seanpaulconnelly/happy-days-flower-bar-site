#!/usr/bin/env node
/**
 * Inquiry-form state sweep (plan Phase 5d / Phase 7 gate).
 *
 *   npm run qa:form
 *
 * Builds the site once with `VITE_INQUIRY_ENDPOINT` pointed at
 * `scripts/mock-inquiry-server.mjs`, serves it with `vite preview`, then for
 * each mock mode drives the real form in a real browser at 375 px and asserts
 * the behaviour the plan makes non-negotiable:
 *
 *   1. `ok`            → success panel        (confirmed `{ ok: true }`)
 *   2. `quarantine`    → success panel        (flagged, but saved — never told)
 *   3. `reject`        → error panel + mailto (`{ ok: false }` is not success)
 *   4. `error`         → error panel + mailto (5xx is not success)
 *   5. `nonce-blocked` → success panel        (fail open: no nonce, still sent)
 *   6. after an error, every field the visitor typed is still there
 *
 * Screenshots land in `docs/qa/screenshots/form/` (gitignored like the rest of
 * `docs/qa/screenshots`; Phase 7 copies the final set into the report).
 *
 * The build is restored to the committed configuration on the way out, so a
 * `dist/` left behind by this script never points at localhost.
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { ensurePreview, launchOptions, repoRoot } from './lib/preview.mjs';

const MOCK_PORT = 8787;
const MOCK_URL = `http://localhost:${MOCK_PORT}`;
const OUT_DIR = resolve(repoRoot, 'docs/qa/screenshots/form');
const VIEWPORT = { width: 375, height: 900 };

const FILLED = {
  name: 'Dana Whitfield',
  organization: 'Laurel Ridge Realty',
  email: 'dana@example.com',
  phone: '724 555 0134',
  eventLocation: 'Greensburg, PA',
  eventType: 'Client appreciation',
  guestCount: '40',
  notes: 'Mock submission from scripts/form-states.mjs.',
};

/** A date the "not in the past" rule will always accept. */
function futureDate() {
  const d = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function run(cmd, args, env) {
  return new Promise((done, fail) => {
    const child = spawn(cmd, args, {
      cwd: repoRoot,
      stdio: 'ignore',
      env: { ...process.env, ...env },
    });
    child.on('exit', (code) => (code === 0 ? done() : fail(new Error(`${cmd} exited ${code}`))));
    child.on('error', fail);
  });
}

async function waitForPort(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: 'GET' });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  return false;
}

/** Wait until nothing is listening on the mock port. */
async function waitForPortFree(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: 'GET' });
      await new Promise((r) => setTimeout(r, 150));
    } catch {
      return true;
    }
  }
  return false;
}

/** Every mock started by this run, so a thrown assertion cannot orphan one. */
const running = new Set();
process.on('exit', () => {
  for (const child of running) child.kill('SIGKILL');
});

/**
 * Start the mock in one mode; resolves once it is answering.
 *
 * The port is checked to be *free* first: a stray server left by an earlier
 * run would happily answer `waitForPort` in the wrong mode, and every
 * assertion after that would be testing the previous run's behaviour.
 */
async function startMock(mode) {
  if (!(await waitForPortFree(MOCK_URL))) {
    throw new Error(
      `port ${MOCK_PORT} is still in use — something else is listening there. ` +
        'Stop it (`pkill -f mock-inquiry-server`) and re-run.',
    );
  }

  const child = spawn('node', ['scripts/mock-inquiry-server.mjs', '--mode', mode], {
    cwd: repoRoot,
    stdio: 'ignore',
  });
  running.add(child);
  const stop = () =>
    new Promise((done) => {
      running.delete(child);
      if (child.exitCode !== null) return done();
      child.once('exit', done);
      child.kill('SIGTERM');
      setTimeout(done, 1500);
    });
  if (!(await waitForPort(MOCK_URL))) {
    await stop();
    throw new Error(`mock server (--mode ${mode}) did not come up on ${MOCK_PORT}`);
  }
  return stop;
}

async function fillForm(page) {
  await page.fill('#inquiry-name', FILLED.name);
  await page.fill('#inquiry-organization', FILLED.organization);
  await page.fill('#inquiry-email', FILLED.email);
  await page.fill('#inquiry-phone', FILLED.phone);
  await page.fill('#inquiry-eventDate', futureDate());
  await page.fill('#inquiry-eventLocation', FILLED.eventLocation);
  await page.selectOption('#inquiry-eventType', FILLED.eventType);
  await page.fill('#inquiry-guestCount', FILLED.guestCount);
  await page.fill('#inquiry-notes', FILLED.notes);
}

const results = [];
function assert(label, condition, detail = '') {
  results.push({ label, ok: Boolean(condition), detail });
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const shot = (page, name) =>
  page.locator('#inquire').screenshot({ path: resolve(OUT_DIR, `${name}.png`) });

async function openForm(browser, url) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await context.newPage();
  // `domcontentloaded` rather than `networkidle`: in `nonce-blocked` mode the
  // nonce GET fails, and waiting for the network to fall quiet is both slower
  // and flakier than waiting for the thing we actually need — the form.
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#inquiry-name', { state: 'visible' });
  await page.locator('#inquire').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600); // let the nonce GET settle before we submit
  return { context, page };
}

await mkdir(OUT_DIR, { recursive: true });

console.log('qa:form: building with VITE_INQUIRY_ENDPOINT -> the mock server');
await run('npx', ['vite', 'build'], { VITE_INQUIRY_ENDPOINT: MOCK_URL });

const { url, stop: stopPreview } = await ensurePreview();
const browser = await chromium.launch(launchOptions(chromium));

try {
  // ---- idle + client-side validation (no server involved) -------------------
  {
    const stopMock = await startMock('ok');
    const { context, page } = await openForm(browser, url);

    await shot(page, 'idle');
    assert(
      'idle: no error message rendered',
      (await page.locator('#inquire p.text-danger').count()) === 0,
    );
    assert(
      'idle: both live regions present from first render',
      (await page.locator('#inquire [role="status"]').count()) === 1 &&
        (await page.locator('#inquire [role="alert"]').count()) === 1,
    );
    assert(
      'idle: the "Other" text box is hidden',
      await page.locator('#inquiry-eventTypeOther').isHidden(),
    );

    await page.click('#inquire button[type="submit"]');
    await page.waitForTimeout(200);
    const summary = await page.locator('#inquire [role="alert"]').innerText();
    const focused = await page.evaluate(() => document.activeElement?.id ?? '');
    await shot(page, 'invalid');
    assert(
      'invalid: summary line shown',
      summary.includes('Check the highlighted fields'),
      summary,
    );
    assert('invalid: focus moved to the first invalid field', focused === 'inquiry-name', focused);
    assert(
      'invalid: every required field is marked aria-invalid',
      (await page.locator('#inquire [aria-invalid="true"]').count()) === 6,
      `${await page.locator('#inquire [aria-invalid="true"]').count()} of 6`,
    );
    assert(
      'invalid: nothing was sent (form still on screen)',
      await page.locator('#inquire button[type="submit"]').isVisible(),
    );

    await context.close();
    await stopMock();
  }

  // ---- submitting ----------------------------------------------------------
  {
    const stopMock = await startMock('slow');
    const { context, page } = await openForm(browser, url);
    await fillForm(page);
    await page.click('#inquire button[type="submit"]');
    await page.waitForSelector('#inquire button[type="submit"][disabled]', { timeout: 5000 });
    const label = await page.locator('#inquire button[type="submit"]').innerText();
    const busy = await page.locator('#inquire form').getAttribute('aria-busy');
    await shot(page, 'submitting');
    assert('slow: button disabled while sending', true);
    assert('slow: button label is "Sending…"', label.trim() === 'Sending…', label.trim());
    assert('slow: form is aria-busy', busy === 'true', String(busy));
    await context.close();
    await stopMock();
  }

  // ---- the two success outcomes -------------------------------------------
  for (const mode of ['ok', 'quarantine']) {
    const stopMock = await startMock(mode);
    const { context, page } = await openForm(browser, url);
    await fillForm(page);
    await page.click('#inquire button[type="submit"]');
    await page.waitForTimeout(800);

    const status = page.locator('#inquire [role="status"]');
    const text = await status.innerText();
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
    if (mode === 'ok') await shot(page, 'success');

    assert(
      `${mode}: success panel shown`,
      text.includes(`Thanks, ${FILLED.name}!`),
      text.split('\n')[0],
    );
    assert(
      `${mode}: body is the approved auto-reply with the name substituted`,
      text.includes('We received your inquiry and can’t wait to hear more'),
    );
    assert(
      `${mode}: focus moved to the confirmation heading`,
      focused.includes('Thanks,'),
      focused,
    );
    assert(
      `${mode}: the form is gone, "Send another inquiry" is offered`,
      (await page.locator('#inquire button[type="submit"]').count()) === 0 &&
        (await page.getByRole('button', { name: 'Send another inquiry' }).count()) === 1,
    );

    if (mode === 'ok') {
      await page.getByRole('button', { name: 'Send another inquiry' }).click();
      await page.waitForTimeout(300);
      assert(
        'ok: "Send another inquiry" restores an empty form and focuses Name',
        (await page.inputValue('#inquiry-name')) === '' &&
          (await page.evaluate(() => document.activeElement?.id)) === 'inquiry-name',
      );
    }

    await context.close();
    await stopMock();
  }

  // ---- the two failure outcomes -------------------------------------------
  for (const mode of ['reject', 'error']) {
    const stopMock = await startMock(mode);
    const { context, page } = await openForm(browser, url);
    await fillForm(page);
    await page.click('#inquire button[type="submit"]');
    await page.waitForTimeout(800);

    const alert = page.locator('#inquire [role="alert"]');
    const text = await alert.innerText();
    const mailto = await alert.locator('a[href^="mailto:"]').getAttribute('href');
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
    if (mode === 'error') await shot(page, 'error');

    assert(`${mode}: error panel shown`, text.includes("We couldn't send your inquiry."));
    assert(`${mode}: focus moved to the error heading`, focused.includes("couldn't send"), focused);
    assert(
      `${mode}: prefilled mailto offered`,
      Boolean(mailto) &&
        mailto.includes('mailto:hello@happydaysflowers.com') &&
        mailto.includes(encodeURIComponent(FILLED.name)) &&
        mailto.includes(encodeURIComponent(FILLED.eventType)),
      mailto ? `${mailto.slice(0, 60)}…` : 'none',
    );
    assert(
      `${mode}: fields preserved`,
      (await page.inputValue('#inquiry-name')) === FILLED.name &&
        (await page.inputValue('#inquiry-email')) === FILLED.email &&
        (await page.inputValue('#inquiry-guestCount')) === FILLED.guestCount &&
        (await page.inputValue('#inquiry-notes')) === FILLED.notes,
    );
    assert(
      `${mode}: submit button re-enabled with its original label`,
      (await page.locator('#inquire button[type="submit"]').isDisabled()) === false &&
        (await page.locator('#inquire button[type="submit"]').innerText()).trim() ===
          'Send My Inquiry',
    );

    await context.close();
    await stopMock();
  }

  // ---- fail open: no nonce must never cost a lead --------------------------
  {
    const stopMock = await startMock('nonce-blocked');
    const { context, page } = await openForm(browser, url);
    await fillForm(page);
    await page.click('#inquire button[type="submit"]');
    await page.waitForTimeout(800);
    const text = await page.locator('#inquire [role="status"]').innerText();
    await shot(page, 'nonce-blocked-success');
    assert(
      'nonce-blocked: the form still submits and still succeeds (fail open)',
      text.includes(`Thanks, ${FILLED.name}!`),
      text.split('\n')[0],
    );
    await context.close();
    await stopMock();
  }
} finally {
  await browser.close();
  await stopPreview();
  // Put dist/ back on the committed configuration.
  console.log('qa:form: rebuilding without the endpoint override');
  await run('npx', ['vite', 'build']);
}

const failed = results.filter((r) => !r.ok);
console.log(`\nqa:form: ${results.length - failed.length}/${results.length} assertions passed`);
console.log(`screenshots -> docs/qa/screenshots/form/`);
if (failed.length > 0) {
  console.error(`FAIL: ${failed.map((r) => r.label).join('; ')}`);
  process.exit(1);
}
