/**
 * Provider selection — the one place the form learns where a submission goes.
 *
 * The choice comes from `src/config/site.ts` (`inquiry.provider` +
 * `inquiry.endpoint`), with `VITE_INQUIRY_ENDPOINT` as a **dev-time override**
 * so `scripts/mock-inquiry-server.mjs` can stand in for the real backend
 * without editing committed config:
 *
 *   VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev
 *
 * An endpoint that is still a `TODO_` placeholder — or empty — is `unconfigured`.
 * That is not an error at build time (the site ships before the Apps Script is
 * deployed, plan Phase 7); it means a submission resolves
 * `{ ok: false, reason: 'unconfigured' }`, which the form renders as the normal
 * error panel with the prefilled `mailto:` — so even a wholly unconfigured
 * deploy leaves the visitor a working path.
 */
import { site } from '../../config/site';
import { createAppsScriptProvider, fetchAppsScriptNonce } from './appsScript';
import { mailtoProvider } from './mailto';
import type { InquiryNonce, InquiryPayload, InquiryResult } from './types';
import { createWeb3FormsProvider } from './web3forms';

export { mailtoHref } from './mailto';

export type ProviderKind = 'apps-script' | 'web3forms' | 'mailto' | 'unconfigured';

/** A placeholder from `site.ts` that `check-config.mjs` has not yet cleared. */
function isPlaceholder(endpoint: string): boolean {
  return endpoint === '' || endpoint.startsWith('TODO_');
}

/** `site.ts`, unless a dev override is set. */
export function inquiryEndpoint(): string {
  const override = import.meta.env?.VITE_INQUIRY_ENDPOINT;
  return typeof override === 'string' && override !== '' ? override : site.inquiry.endpoint;
}

export function providerKind(): ProviderKind {
  const configured = site.inquiry.provider;
  if (configured === 'mailto') return 'mailto';
  return isPlaceholder(inquiryEndpoint()) ? 'unconfigured' : configured;
}

/**
 * Only the Apps Script provider issues nonces. `undefined` here is the
 * fail-open path and is indistinguishable, on purpose, from a blocked `GET`.
 */
export async function fetchNonce(): Promise<InquiryNonce | undefined> {
  if (providerKind() !== 'apps-script') return undefined;
  return fetchAppsScriptNonce(inquiryEndpoint());
}

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  const endpoint = inquiryEndpoint();
  switch (providerKind()) {
    case 'apps-script':
      return createAppsScriptProvider(endpoint).submit(payload);
    case 'web3forms':
      return createWeb3FormsProvider(endpoint).submit(payload);
    case 'mailto':
      return mailtoProvider.submit(payload);
    default:
      return { ok: false, reason: 'unconfigured' };
  }
}
