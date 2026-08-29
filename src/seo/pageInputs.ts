/**
 * The concrete inputs for `buildMeta` and `buildJsonLd` — the bridge between
 * the approved content files and the pure SEO builders (request SEO-5).
 *
 * Kept in one module, separate from `vite.config.ts`, so the build config stays
 * a config and this stays testable. Like the rest of `src/seo/`, it must remain
 * **Node-safe**: no DOM, no CSS or asset imports, no `import.meta.env`. That is
 * what lets the `transformIndexHtml` plugin import it at build time.
 *
 * Nothing here authors copy. Every string comes from `copy.ts`, `site.ts` or
 * the ux-spec §7 alt text in `images.ts`.
 */
import { copy } from '../content/copy.ts';
import { images } from '../content/images.ts';
import { generatedImages, type RenditionId } from '../content/images.generated.ts';
import type { SeoImage, SeoPackage } from './types.ts';

/**
 * The 1200×630 card rendered from the hero by `npm run images`. ux-spec §7:
 * "The OG image needs no alt; `og:image:alt` may reuse the hero alt."
 */
export const OG_IMAGE: SeoImage = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
  alt: images.hero.alt,
};

/**
 * Approved prose for `Service.description`. The Flower Bar Introduction's first
 * body paragraph is the one that describes what the service *is*.
 */
export const serviceDescription: string = copy.flowerBarIntro.body[0];

/** The shape the two content sources agree on; `minGuests`/`maxGuests` are optional. */
type PackageCopy = {
  readonly name: string;
  readonly guests: string;
  readonly price: string;
  readonly description: string;
  readonly minGuests?: number;
  readonly maxGuests?: number;
};

const packageCopy: readonly PackageCopy[] = [...copy.packages.items, copy.packages.custom];

/**
 * `$1,495` → `1495`. The approved price *string* stays the only thing rendered;
 * this derives the machine-readable value so no number is transcribed twice.
 * The custom-quote package has no numeric price and correctly yields
 * `undefined`, so `buildOffers` emits no `price` key for it.
 */
function priceValueOf(price: string): number | undefined {
  const digits = price.replace(/[^\d.]/g, '');
  if (digits === '') return undefined;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export const seoPackages: readonly SeoPackage[] = packageCopy.map((pkg) => {
  const priceValue = priceValueOf(pkg.price);
  return {
    name: pkg.name,
    guests: pkg.guests,
    description: pkg.description,
    ...(priceValue === undefined ? {} : { price: pkg.price, priceValue }),
    ...(pkg.minGuests === undefined ? {} : { minGuests: pkg.minGuests }),
    ...(pkg.maxGuests === undefined ? {} : { maxGuests: pkg.maxGuests }),
  };
});

/**
 * Content images for `LocalBusiness.image` / `#primaryimage`, hero first
 * (SEO-5). JPEG on purpose: crawler support for AVIF/WebP is uneven, and these
 * URLs are read by machines, not negotiated by a browser. One rendition per
 * source photograph — the second crop of `flower-bar-closeup` is the same
 * picture and would only dilute the set.
 */
const JSONLD_RENDITIONS: readonly RenditionId[] = [
  'hero',
  'flowerBarCloseupIntro',
  'farmBouquetPinkWhite',
  'farmBouquetColorful',
  'farmZinnias',
  'galleryEventDetail',
  'galleryArrangement',
  'galleryArrangementOutdoor',
  'about',
];

export const jsonLdImages: readonly SeoImage[] = JSONLD_RENDITIONS.map((id) => {
  const rendition = generatedImages[id];
  const jpeg = rendition.src.jpeg.find((source) => source.w === 1152) ?? rendition.src.jpeg.at(-1);
  if (!jpeg) throw new Error(`No JPEG rendition for "${id}" in images.generated.ts`);
  return {
    url: jpeg.src,
    width: rendition.width,
    height: rendition.height,
    alt: images[rendition.key].alt,
  };
});
