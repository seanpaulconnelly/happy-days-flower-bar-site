/**
 * Shared types for the SEO / AEO layer.
 *
 * Owned by `seo-aeo-specialist`. Pure types + constants — no DOM, no
 * `import.meta.env`, no dependencies, so the builders can run in Node at build
 * time (Vite `transformIndexHtml`) as well as in the browser.
 *
 * See `docs/seo-aeo-spec.md` for the reasoning behind every field.
 */

/**
 * Which host the build is destined for.
 *
 * `canonical` → https://happydaysflowers.com (indexable).
 * `preview`   → the GitHub Pages project URL (must be `noindex,nofollow`).
 *
 * Decided at build time (D5): `vite.config.ts` sets `VITE_SITE_MODE` to
 * `canonical` when `public/CNAME` exists, otherwise `preview`. Callers pass the
 * value in; this module never reads `import.meta.env` itself, so it stays
 * testable and Node-importable.
 */
export type SiteMode = 'canonical' | 'preview';

/** The temporary GitHub Pages host. Never indexable. */
export const PREVIEW_URL = 'https://seanpaulconnelly.github.io/happy-days-flower-bar-site/';

/**
 * The subset of `src/config/site.ts` (build plan Appendix D) that the SEO layer
 * reads. Structural, and every member is `readonly`, so the `as const` object in
 * `site.ts` satisfies it without a cast and without `site.ts` importing this file.
 */
export interface SeoSite {
  readonly name: string;
  readonly tagline: string;
  /** Canonical origin, e.g. `https://happydaysflowers.com` (with or without a trailing slash). */
  readonly url: string;
  readonly email: string;
  readonly location: {
    readonly city: string;
    readonly region: string;
    readonly serviceArea: string;
  };
  readonly social: {
    readonly instagram: string;
    readonly facebook: string;
  };
  readonly serviceArea: {
    readonly center: string;
    readonly radiusMiles: number;
    readonly named: readonly string[];
    /** Optional override for the `GeoCircle` midpoint. Defaults to `GREENSBURG_GEO`. */
    readonly centerLatitude?: number;
    readonly centerLongitude?: number;
  };
  /**
   * Decided V1: both are empty strings (service-area business, no personal
   * phone). The builders omit the corresponding schema.org keys when empty —
   * they never emit a blank `telephone` or `streetAddress`.
   */
  readonly contact: {
    readonly phone: string;
    readonly streetAddress: string;
  };
  readonly seo: {
    readonly title: string;
    readonly description: string;
    /** Decided: `true`. When `false`, `Offer` nodes carry no `price`/`priceCurrency`. */
    readonly exposePricesInStructuredData: boolean;
  };
}

/**
 * One Flower Bar package. `name`, `guests`, `price` and `description` are
 * approved copy and are passed in from `src/content/copy.ts` — this module
 * never holds copy of its own.
 */
export interface SeoPackage {
  /** e.g. "The Classic Flower Bar" */
  readonly name: string;
  /** Visible guest-count line, e.g. "Up to 25 guests" or "75+ guests — Custom quote". */
  readonly guests: string;
  /** Visible price string, e.g. "$895". Omit for the custom-quote package. */
  readonly price?: string;
  /** Numeric price for structured data, e.g. `895`. Omit for the custom-quote package. */
  readonly priceValue?: number;
  /** Approved package description sentence. */
  readonly description: string;
  /** Optional machine-readable guest range → `Offer.eligibleQuantity`. */
  readonly minGuests?: number;
  readonly maxGuests?: number;
}

/** One approved FAQ entry. Verbatim from `answers-from-bethany.md`. */
export interface SeoFaq {
  readonly question: string;
  readonly answer: string;
}

/** An image referenced by structured data or an OG/Twitter card. */
export interface SeoImage {
  /** Absolute URL, or a root-relative path (`/images/…`) resolved against the site base. */
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/** A `<meta>` tag to render into `<head>`. Exactly one of `name`/`property` is set. */
export interface MetaTag {
  readonly name?: string;
  readonly property?: string;
  readonly content: string;
}

/** A `<link>` tag to render into `<head>`. */
export interface LinkTag {
  readonly rel: string;
  readonly href: string;
  readonly type?: string;
}

export type RobotsDirective = 'index,follow' | 'noindex,nofollow';

/** The result of `buildMeta`. Data only — rendering is the caller's job. */
export interface SeoMeta {
  readonly title: string;
  readonly description: string;
  /** Absolute canonical URL, or `null` in `preview` mode (see the spec, §6). */
  readonly canonical: string | null;
  readonly robots: RobotsDirective;
  readonly og: {
    readonly title: string;
    readonly description: string;
    readonly type: string;
    readonly url: string;
    readonly siteName: string;
    readonly locale: string;
    readonly image: string;
    readonly imageWidth: string;
    readonly imageHeight: string;
    readonly imageAlt: string;
  };
  readonly twitter: {
    readonly card: string;
    readonly title: string;
    readonly description: string;
    readonly image: string;
    readonly imageAlt: string;
  };
  /** Every `<meta>` tag to emit, in head order. */
  readonly metaTags: readonly MetaTag[];
  /** Every `<link>` tag to emit, in head order. */
  readonly linkTags: readonly LinkTag[];
}
