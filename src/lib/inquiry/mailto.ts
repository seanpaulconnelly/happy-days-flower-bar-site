/**
 * `mailto:` adapter — ux-spec §6.5, plan §3.2.
 *
 * Two jobs:
 *  1. `mailtoHref()` builds the prefilled link. The error panel of the other two
 *     providers renders it ("Or email us directly"), so a total backend outage
 *     still leaves the visitor a one-click path with everything they typed.
 *  2. `mailtoProvider` is the provider itself when `site.inquiry.provider` is
 *     `'mailto'` — submitting hands the composed message to the mail client.
 *
 * The body is one field per line using the *approved* labels from
 * `copy.inquiry.fields`, in spec order, with blank optional fields omitted. It
 * is capped at ~1500 characters (truncating `notes`, the only unbounded field)
 * because long `mailto:` URLs are silently dropped by some mobile mail clients.
 */
import { site } from '../../config/site';
import { inquiry } from '../../content/copy';
import type { InquiryPayload, InquiryProvider } from './types';

/** ux-spec §6.5: `Flower bar inquiry — {name}`. */
const SUBJECT_PREFIX = 'Flower bar inquiry';
/** Ceiling on the composed body, before URL encoding. */
export const MAILTO_BODY_LIMIT = 1500;

/** The nine payload keys that are real fields, in the spec's order. */
const FIELD_KEYS = inquiry.fields.map((f) => f.name);
const LABELS = new Map(inquiry.fields.map((f) => [f.name as string, f.label as string]));

type FormValues = Partial<Record<string, string>>;

function bodyFor(values: FormValues): string {
  const lines: string[] = [];
  for (const key of FIELD_KEYS) {
    const value = (values[key] ?? '').trim();
    if (!value) continue; // blank optional fields are omitted
    lines.push(`${LABELS.get(key)}: ${value}`);
  }
  const body = lines.join('\n');
  if (body.length <= MAILTO_BODY_LIMIT) return body;
  // Only `notes` can be long enough to matter; trim the tail rather than a field.
  return `${body.slice(0, MAILTO_BODY_LIMIT - 1)}…`;
}

/**
 * The prefilled link. Safe to call with a half-filled form — it is offered in
 * the error state, where validation has passed but the send did not.
 */
export function mailtoHref(values: FormValues, to: string = site.email): string {
  const name = (values.name ?? '').trim();
  const subject = name ? `${SUBJECT_PREFIX} — ${name}` : SUBJECT_PREFIX;
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyFor(values))}`;
  return `mailto:${to}?${query}`;
}

export const mailtoProvider: InquiryProvider = {
  async submit(payload: InquiryPayload) {
    // No network call to confirm, so this is the one provider whose success is
    // "the mail client was handed the message". Only reachable when the site is
    // deliberately configured with `provider: 'mailto'`.
    if (typeof window !== 'undefined') {
      window.location.href = mailtoHref(payload as unknown as FormValues);
    }
    return { ok: true as const };
  },
};
