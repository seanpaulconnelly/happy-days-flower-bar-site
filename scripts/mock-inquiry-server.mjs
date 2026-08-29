#!/usr/bin/env node
/**
 * SKELETON - Phase 7. Local stand-in for the Apps Script endpoint so the
 * inquiry form's states can be exercised without the real backend.
 *
 *   node scripts/mock-inquiry-server.mjs --mode ok|quarantine|reject|error|slow|nonce-blocked
 *
 * Listens on :8787. Point the app at it with VITE_INQUIRY_ENDPOINT.
 * Planned behaviour:
 *   GET  /  -> { ts, nonce, sig }   ('nonce-blocked' returns 500 so the
 *              client's fail-open path is exercised)
 *   POST /  -> ok:          { ok: true }
 *              quarantine:  { ok: true }   (saved but flagged; visitor sees success)
 *              reject:      { ok: false, reason: 'rejected' }
 *              error:       HTTP 500
 *              slow:        { ok: true } after ~8s
 */
import { parseArgs } from './lib/preview.mjs';

const MODES = ['ok', 'quarantine', 'reject', 'error', 'slow', 'nonce-blocked'];
const PORT = 8787;

const args = parseArgs();
const mode = typeof args.mode === 'string' ? args.mode : 'ok';

if (!MODES.includes(mode)) {
  console.error(`Unknown --mode "${mode}". Choose one of: ${MODES.join(', ')}`);
  process.exit(1);
}

console.log('mock-inquiry-server: SKELETON - not implemented until Phase 7.');
console.log(`  would listen on http://localhost:${PORT} in mode "${mode}"`);
process.exit(0);
