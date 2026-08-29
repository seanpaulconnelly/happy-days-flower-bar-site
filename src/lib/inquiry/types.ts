/**
 * Inquiry form contract (plan §3.2). Types only in Phase 3; the Apps Script,
 * Web3Forms and mailto adapters land in Phase 5d / Phase 7.
 *
 * The anti-spam signals are all optional or always-present-but-advisory: they
 * decide where a submission lands server-side, never whether it is kept. The
 * form must be able to submit with every one of them missing (fail open).
 */

export type InquiryNonce = {
  ts: number;
  nonce: string;
  sig: string;
};

export type InquiryPayload = {
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  guestCount: string;
  notes?: string;
  // anti-spam signals (never shown to the visitor)
  hp_field?: string;
  elapsedMs: number;
  interacted: boolean;
  nonce?: InquiryNonce;
};

export type InquiryResult =
  { ok: true } | { ok: false; reason: 'network' | 'rejected' | 'unconfigured' };

export interface InquiryProvider {
  submit(p: InquiryPayload): Promise<InquiryResult>;
}
