/**
 * Web3Forms adapter — plan §3.2, the documented fallback when a Workspace
 * policy blocks the Apps Script web app. Email only, no Sheet.
 *
 * `site.inquiry.endpoint` holds the **access key** for this provider (not a
 * URL): Web3Forms' own docs say the key is public by design, and it ships in
 * the client bundle either way — there is no secret here to protect.
 *
 * Web3Forms answers `{ "success": true, "message": … }`; anything else is a
 * failure, and the same client rule applies as for Apps Script — the visitor
 * sees the confirmation only on a confirmed success.
 */
import type { InquiryPayload, InquiryProvider, InquiryResult } from './types';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/** Matches the Apps Script subject line so the inbox reads the same either way. */
function subjectFor(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `Flower bar inquiry — ${trimmed}` : 'Flower bar inquiry';
}

export function createWeb3FormsProvider(accessKey: string): InquiryProvider {
  return {
    async submit(payload: InquiryPayload): Promise<InquiryResult> {
      const { hp_field: honeypot, nonce, ...fields } = payload;

      const body = {
        ...fields,
        access_key: accessKey,
        subject: subjectFor(payload.name),
        from_name: payload.name,
        replyto: payload.email,
        // Web3Forms' own honeypot field name; a non-empty value makes them drop
        // the submission. We forward ours rather than adding a second trap.
        botcheck: honeypot ? honeypot : '',
        // Flattened so the notification email stays readable — the API turns the
        // JSON body into the message verbatim and cannot render a nested object.
        nonce: nonce ? `${nonce.ts}.${nonce.nonce}.${nonce.sig}` : '',
      };

      let response: Response;
      try {
        response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        return { ok: false, reason: 'network' };
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        return { ok: false, reason: 'network' };
      }

      const success =
        typeof data === 'object' &&
        data !== null &&
        (data as { success?: unknown }).success === true;
      if (success) return { ok: true };
      return { ok: false, reason: response.ok ? 'rejected' : 'network' };
    },
  };
}
