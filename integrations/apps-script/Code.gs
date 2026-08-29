/**
 * Happy Days Flower Farm — website inquiry endpoint (Google Apps Script, V8 runtime).
 *
 * HOW IT WORKS, top to bottom:
 * 1. The website calls GET /exec when the form mounts and gets back a short-lived signed
 *    nonce ({ts, nonce, sig}); it echoes that back on submit. If the GET is blocked, the
 *    form submits without it — a missing nonce is only a hint, never a rejection.
 * 2. POST /exec (Content-Type text/plain, so the browser skips the CORS preflight that
 *    Apps Script cannot answer) is parsed from e.postData.contents.
 * 3. Every submission is SAVED FIRST. Spam signals (honeypot, too-fast, no interaction,
 *    bad nonce, link spam, duplicate) only choose which tab it lands in — "Inquiries" or
 *    "Quarantine" — and whether an email fires now. Missing required fields / a malformed
 *    email address are the ONLY hard rejects, and the client prevents those.
 * 4. Only after the row is written do we email NOTIFY_TO and send the visitor the
 *    auto-reply. A mail failure is logged and swallowed: a saved lead never becomes an
 *    error response. Quarantined rows are surfaced by sendQuarantineDigest() every
 *    morning, so a mis-flagged real lead is seen within a day.
 *
 * Governing rule (build plan §3.2): a real lead can never be lost.
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 * Copy the /exec URL into src/config/site.ts (inquiry.endpoint). Re-deploy (Manage
 * deployments → pencil → Version: New version) after any edit; the URL stays the same.
 * Script Properties (Project Settings → Script properties): SECRET (random 32+ chars).
 * Time-driven trigger: sendQuarantineDigest, daily, ~8am. Full walkthrough in SETUP.md.
 * This script must be container-bound to the inquiries spreadsheet (created via that
 * sheet's Extensions → Apps Script) — SpreadsheetApp.getActiveSpreadsheet() depends on it.
 */

const SHEET_OK = 'Inquiries';
const SHEET_Q = 'Quarantine';
const NOTIFY_TO = 'hello@happydaysflowers.com'; // inbox that receives inquiries (decided)
const AUTO_REPLY = true; // decided (owner, 2026-08-29)
const AUTO_REPLY_TEXT = // owner's wording, verbatim; {name} is replaced
  'Thanks, {name}! We received your inquiry and can’t wait to hear more about what you’re planning. ' +
  'We’ll be in touch within 2 business days to talk through your event and help you choose the right flower bar.\n\n' +
  'Happy Days Flower Farm';
const MAX_EMAILS_PER_DAY = 30; // beyond this, rows still save; one "high volume" notice is sent
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

    // 1) Save first. This is the step that must never be skipped.
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

    // 2) Notify. Quarantined rows go out in the daily digest instead. A failure here cannot lose the
    //    row and must not turn a saved lead into an error the visitor sees — so it is caught here,
    //    not by the outer catch (which exists for sheet-write failures).
    if (!quarantine) {
      try {
        if (underDailyEmailCap()) {
          MailApp.sendEmail({
            to: NOTIFY_TO,
            replyTo: p.email,
            name: 'Happy Days website',
            subject:
              'New flower bar inquiry — ' + oneLine(p.name) + ' (' + oneLine(p.eventDate) + ')',
            body: COLUMNS.map(function (c, i) {
              return c + ': ' + row[i];
            }).join('\n'),
          });
          if (AUTO_REPLY)
            MailApp.sendEmail({
              to: p.email,
              replyTo: NOTIFY_TO,
              name: 'Happy Days Flower Farm',
              subject: 'We received your inquiry — Happy Days Flower Farm',
              // function form: a name containing $& or $1 must not be treated as a replacement pattern
              body: AUTO_REPLY_TEXT.replace('{name}', function () {
                return oneLine(p.name);
              }),
            });
        }
      } catch (mailErr) {
        console.error('Notification failed (row already saved): ' + mailErr);
      }
    }
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

// Daily: list quarantined/unsent items from the last 24h so a mis-flagged real lead is seen within a day.
// 'error' rows (the exception path above) are included — those are leads too.
function sendQuarantineDigest() {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const sheet = getSheet(SHEET_Q);
  const rows = sheet
    .getDataRange()
    .getValues()
    .slice(1)
    .filter(function (r) {
      return (
        r[0] instanceof Date && r[0].getTime() >= since && (r[1] === 'review' || r[1] === 'error')
      );
    });
  if (!rows.length) return;
  const lines = rows.map(function (r) {
    if (r[1] === 'error')
      return '• (saved after a script error — open the sheet for the raw submission) — ' + r[12];
    return (
      '• ' +
      r[2] +
      ' <' +
      r[4] +
      '> — ' +
      r[6] +
      ' at ' +
      r[7] +
      ' — ' +
      r[9] +
      ' guests — flags: ' +
      r[12]
    );
  });
  MailApp.sendEmail({
    to: NOTIFY_TO,
    name: 'Happy Days website',
    subject: rows.length + ' inquiry submission(s) need a quick look',
    body:
      'These were held for review because they looked automated. Real ones are worth a reply:\n\n' +
      lines.join('\n') +
      '\n\nOpen the "Quarantine" tab of the inquiries sheet to see full details.',
  });
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
function oneLine(s) {
  return String(s || '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
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
function underDailyEmailCap() {
  // when the cap trips, send ONE notice; rows keep saving regardless
  const cache = CacheService.getScriptCache();
  const key = 'emails:' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  const n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 21600);
  if (n === MAX_EMAILS_PER_DAY + 1) {
    MailApp.sendEmail({
      to: NOTIFY_TO,
      subject: 'Website inquiries: high volume today',
      body:
        'More than ' +
        MAX_EMAILS_PER_DAY +
        ' submissions today. Notifications are paused until tomorrow; every submission is still being saved to the "Inquiries" sheet.',
    });
  }
  return n <= MAX_EMAILS_PER_DAY;
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
