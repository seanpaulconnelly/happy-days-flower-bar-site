#!/usr/bin/env node
/**
 * Stand-in for the Apps Script `/exec` endpoint (plan Appendix H, Phase 7).
 * It exists so every UI state — including the ones that only happen when the
 * backend misbehaves — can be exercised and screenshotted without a Google
 * account, a deploy, or a network.
 *
 *   node scripts/mock-inquiry-server.mjs --mode ok
 *   VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev
 *
 * Modes:
 *   ok             GET → nonce · POST → { ok: true }              → success panel
 *   quarantine     GET → nonce · POST → { ok: true, quarantined } → success panel
 *                  (a flagged submission is still saved; the visitor is never
 *                  told they looked like a bot — plan §3.2)
 *   reject         GET → nonce · POST → { ok: false, reason }     → error panel
 *   error          GET → nonce · POST → 500                       → error panel
 *   slow           GET → nonce · POST → 6 s, then { ok: true }    → submitting state
 *   nonce-blocked  GET → 500     · POST → { ok: true }            → success anyway
 *                  (the fail-open path: no nonce must never cost a real lead)
 *
 * CORS is wide open because the real Apps Script web app is a public endpoint
 * and the browser calls it cross-origin from the site. The POST is answered
 * without needing a preflight — the client sends `text/plain` for exactly that
 * reason — but `OPTIONS` is handled anyway so a stricter client still works.
 */
import { createServer } from 'node:http';
import { parseArgs } from './lib/preview.mjs';

const MODES = new Set(['ok', 'quarantine', 'reject', 'error', 'slow', 'nonce-blocked']);
const PORT = 8787;
const SLOW_MS = 6000;

const args = parseArgs();
const mode = typeof args.mode === 'string' ? args.mode : 'ok';
const port = Number(args.port ?? PORT);

if (!MODES.has(mode)) {
  console.error(`Unknown --mode "${mode}". One of: ${[...MODES].join(', ')}`);
  process.exit(1);
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '600',
};

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return { _unparseable: raw.slice(0, 200) };
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    if (mode === 'nonce-blocked') {
      console.log('  GET  /  -> 500 (nonce blocked; the form must submit anyway)');
      send(res, 500, { ok: false, reason: 'nonce unavailable' });
      return;
    }
    console.log('  GET  /  -> 200 nonce');
    send(res, 200, {
      ts: Date.now(),
      nonce: Math.random().toString(36).slice(2, 14),
      sig: 'mock-signature-not-verified',
    });
    return;
  }

  if (req.method !== 'POST') {
    send(res, 405, { ok: false, reason: 'method not allowed' });
    return;
  }

  const payload = await readBody(req);
  const summary = [
    `name=${JSON.stringify(payload.name ?? '')}`,
    `eventType=${JSON.stringify(payload.eventType ?? '')}`,
    `elapsedMs=${payload.elapsedMs ?? '?'}`,
    `interacted=${payload.interacted ?? '?'}`,
    `hp=${JSON.stringify(payload.hp_field ?? '')}`,
    `nonce=${payload.nonce ? 'yes' : 'no'}`,
  ].join(' ');

  switch (mode) {
    case 'reject':
      console.log(`  POST /  -> 200 { ok: false } · ${summary}`);
      send(res, 200, { ok: false, reason: 'rejected' });
      return;
    case 'error':
      console.log(`  POST /  -> 500 · ${summary}`);
      send(res, 500, { ok: false, reason: 'server error' });
      return;
    case 'slow':
      console.log(`  POST /  -> waiting ${SLOW_MS} ms · ${summary}`);
      await sleep(SLOW_MS);
      send(res, 200, { ok: true });
      return;
    case 'quarantine':
      console.log(`  POST /  -> 200 { ok: true, quarantined: true } · ${summary}`);
      send(res, 200, { ok: true, quarantined: true });
      return;
    default:
      console.log(`  POST /  -> 200 { ok: true } · ${summary}`);
      send(res, 200, { ok: true });
  }
});

server.listen(port, () => {
  console.log(`mock-inquiry-server: http://localhost:${port}  --mode ${mode}`);
  console.log(`  point the app at it: VITE_INQUIRY_ENDPOINT=http://localhost:${port} npm run dev`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close();
    process.exit(0);
  });
}
