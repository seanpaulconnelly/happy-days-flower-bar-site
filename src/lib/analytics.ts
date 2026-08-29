import { site } from '../config/site';

/**
 * GA4 loader (build plan Phase 5, analytics bullet).
 *
 * `gtag.js` is injected only when BOTH hold:
 *   1. `site.analytics.ga4MeasurementId` is non-empty — it is empty until the
 *      P0.7 session, so the loader ships inert; and
 *   2. the page is being served from the canonical host. Preview builds on
 *      `*.github.io`, `localhost` and `vite preview` therefore never send a
 *      hit, so the property's data starts clean.
 *
 * No cookie banner in V1 (decided: US small business, no EU targeting) — noted
 * in `docs/HANDOFF.md`. Nothing here runs before user interaction beyond the
 * script tag itself, and the module is a no-op when the id is unset.
 */

/** Derived from `site.url` so there is one place the canonical host is named. */
function canonicalHostname(): string {
  try {
    return new URL(site.url).hostname;
  } catch {
    return '';
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let started = false;

export function initAnalytics(): void {
  if (started) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const measurementId = site.analytics.ga4MeasurementId;
  if (!measurementId) return;

  const host = canonicalHostname();
  if (!host || window.location.hostname !== host) return;

  started = true;

  window.dataLayer = window.dataLayer ?? [];
  // Must push the `arguments` object itself, exactly like Google's snippet:
  // gtag.js ignores plain arrays on the dataLayer, so an arrow function with a
  // rest parameter would make `config` a silent no-op.
  function gtag(this: unknown): void {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  }
  window.gtag = gtag as (...args: unknown[]) => void;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', measurementId);
}
