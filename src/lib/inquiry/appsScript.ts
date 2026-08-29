/**
 * Google Apps Script adapter — plan §3.2, the primary provider.
 *
 * Two deliberate choices, both from the plan:
 *
 * - **`Content-Type: text/plain;charset=utf-8`.** An Apps Script web app does
 *   not answer `OPTIONS`, so any header that would trigger a CORS preflight
 *   fails the request outright. `text/plain` is a CORS-safelisted value, so the
 *   POST goes straight out; the script reads `e.postData.contents` and parses
 *   the JSON itself. The body is still JSON — only the header is a lie.
 * - **Success only on a confirmed `{ ok: true }` body.** A 200 with an
 *   unparseable body, an HTML error page, or `{ ok: false }` is *not* success:
 *   the client rule (plan §3.2) is that the visitor sees the confirmation only
 *   when the submission is known to be saved. A quarantined submission also
 *   returns `{ ok: true }` — it was saved, and the visitor should never be told
 *   they looked like a bot.
 *
 * The nonce `GET` is best-effort with a hard timeout: an ad-blocker, a captive
 * portal or a cold Apps Script instance must not stop a real lead from
 * submitting, so any failure resolves to `undefined` and the POST goes without
 * it (**fail open** — the server treats a missing nonce as one flag, never a
 * rejection).
 */
import type { InquiryNonce, InquiryPayload, InquiryProvider, InquiryResult } from './types';

/** Ceiling on the nonce fetch. Past this the form submits unsigned. */
export const NONCE_TIMEOUT_MS = 3000;

function isNonce(value: unknown): value is InquiryNonce {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ts === 'number' &&
    typeof candidate.nonce === 'string' &&
    typeof candidate.sig === 'string'
  );
}

/** `GET` the signed nonce. Never throws; resolves `undefined` on any failure. */
export async function fetchAppsScriptNonce(
  endpoint: string,
  timeoutMs: number = NONCE_TIMEOUT_MS,
): Promise<InquiryNonce | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      // The nonce is short-lived and per-visit; a cached one is worse than none.
      cache: 'no-store',
    });
    if (!response.ok) return undefined;
    const data: unknown = await response.json();
    return isNonce(data) ? data : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export function createAppsScriptProvider(endpoint: string): InquiryProvider {
  return {
    async submit(payload: InquiryPayload): Promise<InquiryResult> {
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
      } catch {
        return { ok: false, reason: 'network' };
      }

      if (!response.ok) return { ok: false, reason: 'network' };

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        // 200 with a body we cannot read (an HTML error page, a redirect to a
        // sign-in screen) is not a confirmation. Phase 7 verifies the real
        // deployment answers with readable JSON cross-origin.
        return { ok: false, reason: 'network' };
      }

      const ok =
        typeof data === 'object' && data !== null && (data as { ok?: unknown }).ok === true;
      return ok ? { ok: true } : { ok: false, reason: 'rejected' };
    },
  };
}
