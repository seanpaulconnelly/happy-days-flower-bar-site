/**
 * Single source of truth for business facts, endpoints and SEO defaults.
 * Values here are decided in the build plan (Appendix D) and the decision
 * record; do not invent new business facts. `scripts/check-config.mjs` fails
 * the build on any remaining `TODO_` placeholder unless `--allow-todos`.
 */
export const site = {
  name: 'Happy Days Flower Farm',
  tagline: 'Unique Floral Experiences',
  location: {
    city: 'Greensburg',
    region: 'PA',
    serviceArea: 'Pittsburgh + Western Pennsylvania',
  },
  url: 'https://happydaysflowers.com', // canonical; page is noindex until served from this host
  email: 'hello@happydaysflowers.com', // inquiry inbox; also mailto fallback + replyto
  social: {
    instagram: 'https://www.instagram.com/happydaysflowerfarm',
    facebook: 'https://www.facebook.com/happydaysflowers', // resolved from the share link (D2)
  },
  inquiry: {
    provider: 'apps-script' as 'apps-script' | 'web3forms' | 'mailto',
    endpoint:
      'https://script.google.com/macros/s/AKfycbzTyej_l9ni37wuGxnc5G9YzTgeFWhTIaT5Tfw-SYE3OZQr_BycrdeF_6hM50NEJ9ZQ/exec', // Apps Script web app URL (public by design); or the Web3Forms access key
    minElapsedMs: 3000,
  },
  analytics: { ga4MeasurementId: '' }, // empty = loader inert
  serviceArea: {
    center: 'Greensburg, PA',
    radiusMiles: 50,
    named: ['Pittsburgh', 'Western Pennsylvania'],
  },
  contact: { phone: '', streetAddress: '' }, // service-area business: none published in V1
  seo: {
    title: 'Happy Days Flower Farm | Pop-Up Flower Bars in Western PA',
    description:
      'Unique floral experiences and turnkey pop-up flower bars for businesses, events and gatherings in Greensburg, Pittsburgh and throughout Western Pennsylvania.',
    exposePricesInStructuredData: true,
  },
} as const;

export type Site = typeof site;
