/**
 * schema.org JSON-LD graph builder for the single-page site.
 *
 * Pure functions. No DOM, no `import.meta.env`, no dependencies — the same code
 * runs in Node inside a Vite `transformIndexHtml` hook and in a unit test.
 *
 * Every fact in the graph comes from `src/config/site.ts`, `src/content/copy.ts`
 * or the parameters below. Nothing is invented here: there is no `telephone`,
 * no `streetAddress`, no `openingHours`, and no `aggregateRating`/`review`.
 *
 * Rationale for every node: `docs/seo-aeo-spec.md` §5.
 */

import { PREVIEW_URL } from './types.ts';
import type { SeoFaq, SeoImage, SeoPackage, SeoSite, SiteMode } from './types.ts';

export type JsonLdValue = string | number | boolean | JsonLdNode | JsonLdValue[];
export interface JsonLdNode {
  [key: string]: JsonLdValue;
}
export interface JsonLdGraph {
  readonly '@context': 'https://schema.org';
  readonly '@graph': JsonLdNode[];
}

/**
 * Municipal centroid of Greensburg, Pennsylvania (40°17′52″N 79°32′32″W,
 * Wikipedia, verified 2026-08-29). This is the published city centre, NOT the
 * owner's address — the business is a service-area business with the address
 * deliberately hidden (owner, 2026-08-29, GBP Option B).
 */
export const GREENSBURG_GEO = { latitude: 40.2978, longitude: -79.5422 } as const;

const METRES_PER_MILE = 1609.344;

/** schema.org type to use for each named service area. */
const NAMED_AREA_TYPES: Record<string, string> = {
  Pittsburgh: 'City',
  'Western Pennsylvania': 'AdministrativeArea',
};

/** Entity anchors so answer engines resolve the place names unambiguously. */
const NAMED_AREA_SAME_AS: Record<string, string> = {
  Pittsburgh: 'https://en.wikipedia.org/wiki/Pittsburgh',
  'Western Pennsylvania': 'https://en.wikipedia.org/wiki/Western_Pennsylvania',
};

export interface BuildJsonLdInput {
  readonly site: SeoSite;
  /** Approved package copy, in the order shown on the page. */
  readonly packages: readonly SeoPackage[];
  /** The 8 approved Q&As, in the DOM order used by the visible FAQ section. */
  readonly faqs: readonly SeoFaq[];
  /** Content images for `LocalBusiness.image`. First entry becomes the page's primary image. */
  readonly images: readonly SeoImage[];
  readonly mode: SiteMode;
  /**
   * Approved prose describing the Pop-Up Flower Bar service (pass the Flower Bar
   * Introduction body from `copy.ts`). Omitted from the graph when not supplied.
   */
  readonly serviceDescription?: string;
  /**
   * Visible heading of the FAQ section (pass `copy.faq.heading`). Used as
   * `FAQPage.name` so the node mirrors on-page text; omitted when not supplied.
   */
  readonly faqHeading?: string;
  readonly previewUrl?: string;
}

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, '') + '/';
}

function absoluteUrl(base: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return normalizeBase(base) + pathOrUrl.replace(/^\/+/, '');
}

/** Drop keys whose value is undefined, null, an empty string or an empty array. */
function compact(node: Record<string, JsonLdValue | undefined | null>): JsonLdNode {
  const out: JsonLdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatUsd(value: number): string {
  const whole = Math.round(value).toString();
  return '$' + whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function ref(id: string): JsonLdNode {
  return { '@id': id };
}

function buildPostalAddress(site: SeoSite): JsonLdNode {
  // Locality + region only. `streetAddress` is intentionally absent: publishing a
  // residential address is excluded from V1 and mixing a street address with a
  // service-area radius is the classic service-area-business schema error.
  return compact({
    '@type': 'PostalAddress',
    streetAddress: site.contact.streetAddress || undefined,
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: 'US',
  });
}

function buildAreaServed(site: SeoSite): JsonLdNode[] {
  const latitude = site.serviceArea.centerLatitude ?? GREENSBURG_GEO.latitude;
  const longitude = site.serviceArea.centerLongitude ?? GREENSBURG_GEO.longitude;
  const radiusMetres = Math.round(site.serviceArea.radiusMiles * METRES_PER_MILE);

  const circle: JsonLdNode = {
    '@type': 'GeoCircle',
    name: `Approximately ${site.serviceArea.radiusMiles} miles around ${site.serviceArea.center}`,
    geoMidpoint: compact({
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
      address: buildPostalAddress(site),
    }),
    geoRadius: String(radiusMetres),
  };

  const named = site.serviceArea.named.map((name) =>
    compact({
      '@type': NAMED_AREA_TYPES[name] ?? 'Place',
      name,
      sameAs: NAMED_AREA_SAME_AS[name],
    }),
  );

  return [circle, ...named];
}

function buildImageObjects(base: string, images: readonly SeoImage[]): JsonLdNode[] {
  return images.map((image, index) =>
    compact({
      '@type': 'ImageObject',
      '@id': index === 0 ? `${base}#primaryimage` : `${base}#image-${index + 1}`,
      contentUrl: absoluteUrl(base, image.url),
      url: absoluteUrl(base, image.url),
      width: image.width,
      height: image.height,
      caption: image.alt,
    }),
  );
}

function buildPriceRange(
  packages: readonly SeoPackage[],
  exposePrices: boolean,
): string | undefined {
  if (!exposePrices) return undefined;
  const values = packages
    .map((pkg) => pkg.priceValue)
    .filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return undefined;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatUsd(min) : `${formatUsd(min)}–${formatUsd(max)}`;
}

function buildOffers(input: {
  base: string;
  packages: readonly SeoPackage[];
  exposePrices: boolean;
  businessId: string;
  serviceId: string;
}): JsonLdNode[] {
  const { base, packages, exposePrices, businessId, serviceId } = input;
  return packages.map((pkg) => {
    const hasPrice = exposePrices && typeof pkg.priceValue === 'number';
    const eligibleQuantity =
      typeof pkg.minGuests === 'number' || typeof pkg.maxGuests === 'number'
        ? compact({
            '@type': 'QuantitativeValue',
            unitText: 'guest',
            minValue: pkg.minGuests,
            maxValue: pkg.maxGuests,
          })
        : undefined;

    return compact({
      '@type': 'Offer',
      '@id': `${base}#offer-${slugify(pkg.name)}`,
      name: pkg.name,
      description: pkg.description,
      // The custom-quote package deliberately carries no price: the price is not
      // published, so no `price` key is emitted rather than a guessed value.
      price: hasPrice ? String(pkg.priceValue) : undefined,
      priceCurrency: hasPrice ? 'USD' : undefined,
      eligibleQuantity,
      itemOffered: ref(serviceId),
      seller: ref(businessId),
      url: `${base}#packages`,
    });
  });
}

/**
 * Build the complete `@graph`.
 *
 * Node ids (all fragments on the site base URL):
 *  - `#business`    Florist / LocalBusiness
 *  - `#service`     Service — "Pop-Up Flower Bar"
 *  - `#packages`    OfferCatalog, one Offer per package
 *  - `#website`     WebSite
 *  - `#webpage`     WebPage
 *  - `#faq`         FAQPage (kept as its own node — see spec §5.6)
 */
export function buildJsonLd(input: BuildJsonLdInput): JsonLdGraph {
  const { site, packages, faqs, images, mode, serviceDescription, faqHeading, previewUrl } = input;
  const base = normalizeBase(mode === 'canonical' ? site.url : (previewUrl ?? PREVIEW_URL));

  const businessId = `${base}#business`;
  const serviceId = `${base}#service`;
  const catalogId = `${base}#packages`;
  const websiteId = `${base}#website`;
  const webPageId = `${base}#webpage`;
  const faqId = `${base}#faq`;

  const areaServed = buildAreaServed(site);
  const imageObjects = buildImageObjects(base, images);
  const sameAs = [site.social.instagram, site.social.facebook].filter(
    (url) => typeof url === 'string' && url.length > 0 && !url.startsWith('TODO_'),
  );

  const offers = buildOffers({
    base,
    packages,
    exposePrices: site.seo.exposePricesInStructuredData,
    businessId,
    serviceId,
  });

  const catalog: JsonLdNode = compact({
    '@type': 'OfferCatalog',
    '@id': catalogId,
    name: 'Flower Bar Packages',
    itemListElement: offers,
  });

  const business: JsonLdNode = compact({
    '@type': 'Florist',
    '@id': businessId,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.formerName,
    slogan: site.tagline,
    description: site.seo.description,
    url: base,
    email: `mailto:${site.email}`,
    // Empty in V1 by decision; `compact` drops the key rather than emitting ''.
    telephone: site.contact.phone || undefined,
    image: imageObjects.map((image) => ref(String(image['@id']))),
    address: buildPostalAddress(site),
    areaServed,
    priceRange: buildPriceRange(packages, site.seo.exposePricesInStructuredData),
    sameAs,
    knowsLanguage: 'en-US',
    makesOffer: offers.map((offer) => ref(String(offer['@id']))),
    hasOfferCatalog: ref(catalogId),
  });

  const service: JsonLdNode = compact({
    '@type': 'Service',
    '@id': serviceId,
    name: 'Pop-Up Flower Bar',
    serviceType: 'Pop-Up Flower Bar',
    description: serviceDescription,
    provider: ref(businessId),
    areaServed,
    hasOfferCatalog: ref(catalogId),
    url: `${base}#flower-bar`,
  });

  const website: JsonLdNode = compact({
    '@type': 'WebSite',
    '@id': websiteId,
    url: base,
    name: site.name,
    description: site.seo.description,
    publisher: ref(businessId),
    inLanguage: 'en-US',
  });

  const webPage: JsonLdNode = compact({
    '@type': 'WebPage',
    '@id': webPageId,
    url: base,
    name: site.seo.title,
    description: site.seo.description,
    isPartOf: ref(websiteId),
    about: ref(businessId),
    primaryImageOfPage: imageObjects.length > 0 ? ref(String(imageObjects[0]['@id'])) : undefined,
    hasPart: faqs.length > 0 ? ref(faqId) : undefined,
    inLanguage: 'en-US',
  });

  const graph: JsonLdNode[] = [business, service, catalog, website, webPage, ...imageObjects];

  if (faqs.length > 0) {
    graph.push(
      compact({
        '@type': 'FAQPage',
        '@id': faqId,
        name: faqHeading,
        isPartOf: ref(webPageId),
        inLanguage: 'en-US',
        mainEntity: faqs.map((faq, index) =>
          compact({
            '@type': 'Question',
            '@id': `${base}#faq-${index + 1}`,
            name: faq.question,
            acceptedAnswer: compact({
              '@type': 'Answer',
              text: faq.answer,
            }),
          }),
        ),
      }),
    );
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/**
 * Serialise the graph for embedding in `<script type="application/ld+json">`.
 * `</` is escaped so a copy string can never terminate the script element.
 */
export function serializeJsonLd(graph: JsonLdGraph, pretty = false): string {
  const json = JSON.stringify(graph, null, pretty ? 2 : 0);
  return json.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '\\u003C!--');
}
