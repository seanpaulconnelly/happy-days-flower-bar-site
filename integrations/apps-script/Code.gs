/**
 * Happy Days Flower Farm — website inquiry endpoint (Google Apps Script, V8 runtime).
 *
 * HOW IT WORKS, top to bottom:
 * 1. The website calls GET /exec when the form mounts and gets back a short-lived signed
 *    nonce ({ts, nonce, sig}); it echoes that back on submit. If the GET is blocked, the
 *    form submits without it — a missing nonce is only a hint, never a rejection.
 * 2. POST /exec (Content-Type text/plain, so the browser skips the CORS preflight that
 *    Apps Script cannot answer) is parsed from e.postData.contents.
 * 3. Every submission is SAVED. Spam signals (honeypot, too-fast, no interaction, bad
 *    nonce, link spam, duplicate) only choose which tab it lands in — "Inquiries" or
 *    "Quarantine". Missing required fields / a malformed email address are the ONLY hard
 *    rejects, and the client prevents those.
 * 4. This script sends NO email and asks for NO mail permission (decision D19). Its only
 *    capability is appending rows to the spreadsheet it is bound to. Notifications come
 *    from the sheet's own Tools → Notification settings rule, set by the account owner;
 *    the inquirer's auto-reply is an inbox rule, not part of this script.
 *
 * Governing rule (build plan §3.2): a real lead can never be lost.
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 * Copy the /exec URL into src/config/site.ts (inquiry.endpoint). Re-deploy (Manage
 * deployments → pencil → Version: New version) after any edit; the URL stays the same.
 * Script Properties (Project Settings → Script properties): SECRET (random 32+ chars).
 * Manifest (appsscript.json): the single scope spreadsheets.currentonly. Full walkthrough
 * in SETUP.md. This script must be container-bound to the inquiries spreadsheet (created
 * via that sheet's Extensions → Apps Script) — SpreadsheetApp.getActiveSpreadsheet()
 * depends on it.
 */

const SHEET_OK = 'Inquiries';
const SHEET_Q = 'Quarantine';
const NONCE_MAX_AGE_MS = 30 * 60 * 1000;
const REQUIRED = ['name', 'email', 'eventDate', 'eventLocation', 'eventType', 'guestCount'];
const LIMITS = {
  name: 120,
  organization: 120,
  email: 200,
  phone: 40,
  eventDate: 40,
  eventLocation: 200,
  eventType: 60,
  guestCount: 10,
  notes: 2000,
};
const COLUMNS = [
  'Received',
  'Status',
  'Name',
  'Organization',
  'Email',
  'Phone',
  'Event date',
  'Event location',
  'Type of event',
  'Guests',
  'Notes',
  'Score',
  'Flags',
  'Source',
];

// GET: health check + short-lived signed nonce. A missing/invalid nonce on POST is a soft flag, never a reject.
function doGet() {
  const ts = Date.now(),
    nonce = Utilities.getUuid();
  return json({
    ok: true,
    service: 'happy-days-inquiry',
    ts: ts,
    nonce: nonce,
    sig: sign(ts + ':' + nonce),
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let holdsLock = false;
  try {
    holdsLock = lock.tryLock(10000); // best effort; we proceed either way rather than drop a lead

    let p = {};
    try {
      p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    } catch (_) {
      p = {};
    }
    if (p === null || typeof p !== 'object') p = {};
    Object.keys(LIMITS).forEach(function (k) {
      p[k] = String(p[k] || '').slice(0, LIMITS[k]);
    });

    // The ONLY hard rejects. The client validates these first, so a human never sees this path.
    const missing = REQUIRED.filter(function (k) {
      return !p[k].trim();
    });
    if (missing.length) return json({ ok: false, reason: 'rejected', fields: missing });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))
      return json({ ok: false, reason: 'rejected', fields: ['email'] });

    // Soft signals → score. Nothing below rejects.
    const flags = [];
    if (p.hp_field) flags.push('honeypot');
    if ((Number(p.elapsedMs) || 0) < 3000) flags.push('fast');
    if (!p.interacted) flags.push('no-interaction');
    if (!validNonce(p.nonce)) flags.push('nonce');
    if ((p.notes.match(/https?:\/\//g) || []).length > 1) flags.push('links');
    if (p.name.trim().toLowerCase() === p.email.split('@')[0].toLowerCase())
      flags.push('name-is-email');
    if (isDuplicate(p)) flags.push('duplicate');
    const score = flags.length;
    const quarantine = flags.indexOf('honeypot') !== -1 || score >= 2;

    // Save. This is the only thing the script does, and it must never be skipped.
    const row = [
      new Date(),
      quarantine ? 'review' : 'new',
      p.name,
      p.organization,
      p.email,
      p.phone,
      p.eventDate,
      p.eventLocation,
      p.eventType,
      p.guestCount,
      p.notes,
      score,
      flags.join(','),
      'website',
    ].map(clean);
    getSheet(quarantine ? SHEET_Q : SHEET_OK).appendRow(row);

    return json({ ok: true }); // quarantined submissions also get ok — the lead is saved; the visitor is not told they look like a bot
  } catch (err) {
    // Last resort: keep the raw payload so nothing is lost, then let the client offer the mailto fallback.
    console.error('doPost failed: ' + err);
    try {
      const raw = String((e && e.postData && e.postData.contents) || '').slice(0, 5000);
      getSheet(SHEET_Q).appendRow([
        new Date(),
        'error',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        clean(raw),
        '',
        'exception:' + String(err),
        'website',
      ]);
    } catch (_) {}
    return json({ ok: false, reason: 'error' });
  } finally {
    if (holdsLock) lock.releaseLock(); // releasing a lock we never acquired throws
  }
}

// ---- helpers ----
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  if (s.getLastRow() === 0) {
    s.appendRow(COLUMNS);
    s.setFrozenRows(1);
  } // also repairs a hand-made empty tab
  return s;
}
function clean(v) {
  // formula-injection guard: Sheets treats leading = + - @ as formulas
  if (v instanceof Date || typeof v === 'number') return v;
  const s = String(v == null ? '' : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function getSecret() {
  return PropertiesService.getScriptProperties().getProperty('SECRET') || '';
}
function sign(msg) {
  const secret = getSecret();
  if (!secret) return ''; // SECRET not set yet: never throw, just produce no signature
  const bytes = Utilities.computeHmacSha256Signature(String(msg), secret);
  let hex = ''; // explicit loop: no assumptions about the returned Byte[] having .map
  for (let i = 0; i < bytes.length; i++) hex += ('0' + (bytes[i] & 0xff).toString(16)).slice(-2);
  return hex;
}
function validNonce(n) {
  if (!getSecret()) return true; // fail open: an unset SECRET must not flag every real submission
  if (!n || !n.ts || !n.nonce || !n.sig) return false;
  if (Date.now() - Number(n.ts) > NONCE_MAX_AGE_MS) return false;
  return sign(n.ts + ':' + n.nonce) === String(n.sig);
}
function isDuplicate(p) {
  // same email+date+location within 24h
  const cache = CacheService.getScriptCache();
  const key =
    'dup:' +
    Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.MD5,
        [p.email, p.eventDate, p.eventLocation].join('|').toLowerCase(),
      ),
    );
  if (cache.get(key)) return true;
  cache.put(key, '1', 21600); // CacheService max TTL is 6h; good enough for the duplicate signal
  return false;
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
