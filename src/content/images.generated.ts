/**
 * GENERATED FILE — written by `scripts/build-images.mjs` (`npm run images`).
 * Hand edits are overwritten.
 *
 * One entry per *rendition*: a key from `images.ts` cropped for one slot at one
 * ratio (design-spec §9). Keys used at two ratios have two entries; `key` points
 * back at `images.ts` for the alt text, `slot` at where the rendition is used.
 * `src` paths are root-relative — `<Picture>` prefixes `import.meta.env.BASE_URL`.
 */
import type { ImageKey, ImageSlot } from './images';

export type GeneratedSource = {
  /** Intrinsic width in px, for the `srcset` `w` descriptor. */
  w: number;
  /** Root-relative path, e.g. `/images/hero-flower-bar-768.avif`. */
  src: string;
};

export type GeneratedImage = {
  key: ImageKey;
  slot: ImageSlot;
  /** Candidates per format, narrowest first. */
  src: { avif: GeneratedSource[]; webp: GeneratedSource[]; jpeg: GeneratedSource[] };
  /** Intrinsic size of the crop, for width/height and CLS. */
  width: number;
  height: number;
  /** Vertical offset of the crop in the 1152×1536 source (design-spec §9). */
  top: number;
  /** Dominant colour, painted behind the image while it loads. */
  placeholder: string;
};

export type RenditionId =
  | 'hero'
  | 'heroSquare'
  | 'flowerBarCloseupIntro'
  | 'flowerBarCloseupGallery'
  | 'farmBouquetPinkWhite'
  | 'farmBouquetColorful'
  | 'farmZinnias'
  | 'galleryEventDetail'
  | 'galleryArrangement'
  | 'galleryArrangementOutdoor'
  | 'about';

export const generatedImages: Record<RenditionId, GeneratedImage> = {
  hero: {
    // hero ≥ md, native 3:4
    key: 'hero',
    slot: 'hero',
    src: {
      avif: [
        { w: 480, src: '/images/hero-flower-bar-480.avif' },
        { w: 768, src: '/images/hero-flower-bar-768.avif' },
        { w: 1152, src: '/images/hero-flower-bar-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/hero-flower-bar-480.webp' },
        { w: 768, src: '/images/hero-flower-bar-768.webp' },
        { w: 1152, src: '/images/hero-flower-bar-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/hero-flower-bar-480.jpg' },
        { w: 768, src: '/images/hero-flower-bar-768.jpg' },
        { w: 1152, src: '/images/hero-flower-bar-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1536,
    top: 0,
    placeholder: '#c8a888',
  },
  heroSquare: {
    // hero < md
    key: 'hero',
    slot: 'hero',
    src: {
      avif: [
        { w: 480, src: '/images/hero-flower-bar-square-480.avif' },
        { w: 768, src: '/images/hero-flower-bar-square-768.avif' },
        { w: 1152, src: '/images/hero-flower-bar-square-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/hero-flower-bar-square-480.webp' },
        { w: 768, src: '/images/hero-flower-bar-square-768.webp' },
        { w: 1152, src: '/images/hero-flower-bar-square-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/hero-flower-bar-square-480.jpg' },
        { w: 768, src: '/images/hero-flower-bar-square-768.jpg' },
        { w: 1152, src: '/images/hero-flower-bar-square-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1152,
    top: 300,
    placeholder: '#c8b8a8',
  },
  flowerBarCloseupIntro: {
    key: 'flowerBarCloseup',
    slot: 'intro',
    src: {
      avif: [
        { w: 480, src: '/images/flower-bar-closeup-intro-480.avif' },
        { w: 768, src: '/images/flower-bar-closeup-intro-768.avif' },
        { w: 1152, src: '/images/flower-bar-closeup-intro-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/flower-bar-closeup-intro-480.webp' },
        { w: 768, src: '/images/flower-bar-closeup-intro-768.webp' },
        { w: 1152, src: '/images/flower-bar-closeup-intro-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/flower-bar-closeup-intro-480.jpg' },
        { w: 768, src: '/images/flower-bar-closeup-intro-768.jpg' },
        { w: 1152, src: '/images/flower-bar-closeup-intro-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1440,
    top: 48,
    placeholder: '#f8f8f8',
  },
  flowerBarCloseupGallery: {
    key: 'flowerBarCloseup',
    slot: 'gallery',
    src: {
      avif: [
        { w: 480, src: '/images/flower-bar-closeup-gallery-480.avif' },
        { w: 768, src: '/images/flower-bar-closeup-gallery-768.avif' },
        { w: 1152, src: '/images/flower-bar-closeup-gallery-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/flower-bar-closeup-gallery-480.webp' },
        { w: 768, src: '/images/flower-bar-closeup-gallery-768.webp' },
        { w: 1152, src: '/images/flower-bar-closeup-gallery-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/flower-bar-closeup-gallery-480.jpg' },
        { w: 768, src: '/images/flower-bar-closeup-gallery-768.jpg' },
        { w: 1152, src: '/images/flower-bar-closeup-gallery-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1152,
    top: 207,
    placeholder: '#b89878',
  },
  farmBouquetPinkWhite: {
    key: 'farmBouquetPinkWhite',
    slot: 'why',
    src: {
      avif: [
        { w: 480, src: '/images/farm-bouquet-pink-white-480.avif' },
        { w: 768, src: '/images/farm-bouquet-pink-white-768.avif' },
        { w: 1152, src: '/images/farm-bouquet-pink-white-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/farm-bouquet-pink-white-480.webp' },
        { w: 768, src: '/images/farm-bouquet-pink-white-768.webp' },
        { w: 1152, src: '/images/farm-bouquet-pink-white-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/farm-bouquet-pink-white-480.jpg' },
        { w: 768, src: '/images/farm-bouquet-pink-white-768.jpg' },
        { w: 1152, src: '/images/farm-bouquet-pink-white-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1440,
    top: 10,
    placeholder: '#687848',
  },
  farmBouquetColorful: {
    key: 'farmBouquetColorful',
    slot: 'why',
    src: {
      avif: [
        { w: 480, src: '/images/farm-bouquet-colorful-480.avif' },
        { w: 768, src: '/images/farm-bouquet-colorful-768.avif' },
        { w: 1152, src: '/images/farm-bouquet-colorful-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/farm-bouquet-colorful-480.webp' },
        { w: 768, src: '/images/farm-bouquet-colorful-768.webp' },
        { w: 1152, src: '/images/farm-bouquet-colorful-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/farm-bouquet-colorful-480.jpg' },
        { w: 768, src: '/images/farm-bouquet-colorful-768.jpg' },
        { w: 1152, src: '/images/farm-bouquet-colorful-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1440,
    top: 48,
    placeholder: '#384828',
  },
  farmZinnias: {
    // face-aware ceiling, decision D10
    key: 'farmZinnias',
    slot: 'why',
    src: {
      avif: [
        { w: 480, src: '/images/farm-zinnias-480.avif' },
        { w: 768, src: '/images/farm-zinnias-768.avif' },
        { w: 1152, src: '/images/farm-zinnias-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/farm-zinnias-480.webp' },
        { w: 768, src: '/images/farm-zinnias-768.webp' },
        { w: 1152, src: '/images/farm-zinnias-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/farm-zinnias-480.jpg' },
        { w: 768, src: '/images/farm-zinnias-768.jpg' },
        { w: 1152, src: '/images/farm-zinnias-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1440,
    top: 48,
    placeholder: '#283838',
  },
  galleryEventDetail: {
    key: 'galleryEventDetail',
    slot: 'gallery',
    src: {
      avif: [
        { w: 480, src: '/images/gallery-event-detail-480.avif' },
        { w: 768, src: '/images/gallery-event-detail-768.avif' },
        { w: 1152, src: '/images/gallery-event-detail-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/gallery-event-detail-480.webp' },
        { w: 768, src: '/images/gallery-event-detail-768.webp' },
        { w: 1152, src: '/images/gallery-event-detail-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/gallery-event-detail-480.jpg' },
        { w: 768, src: '/images/gallery-event-detail-768.jpg' },
        { w: 1152, src: '/images/gallery-event-detail-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1152,
    top: 207,
    placeholder: '#c8b8a8',
  },
  galleryArrangement: {
    key: 'galleryArrangement',
    slot: 'gallery',
    src: {
      avif: [
        { w: 480, src: '/images/gallery-arrangement-480.avif' },
        { w: 768, src: '/images/gallery-arrangement-768.avif' },
        { w: 1152, src: '/images/gallery-arrangement-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/gallery-arrangement-480.webp' },
        { w: 768, src: '/images/gallery-arrangement-768.webp' },
        { w: 1152, src: '/images/gallery-arrangement-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/gallery-arrangement-480.jpg' },
        { w: 768, src: '/images/gallery-arrangement-768.jpg' },
        { w: 1152, src: '/images/gallery-arrangement-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1152,
    top: 69,
    placeholder: '#e8b8b8',
  },
  galleryArrangementOutdoor: {
    key: 'galleryArrangementOutdoor',
    slot: 'gallery',
    src: {
      avif: [
        { w: 480, src: '/images/gallery-arrangement-outdoor-480.avif' },
        { w: 768, src: '/images/gallery-arrangement-outdoor-768.avif' },
        { w: 1152, src: '/images/gallery-arrangement-outdoor-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/gallery-arrangement-outdoor-480.webp' },
        { w: 768, src: '/images/gallery-arrangement-outdoor-768.webp' },
        { w: 1152, src: '/images/gallery-arrangement-outdoor-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/gallery-arrangement-outdoor-480.jpg' },
        { w: 768, src: '/images/gallery-arrangement-outdoor-768.jpg' },
        { w: 1152, src: '/images/gallery-arrangement-outdoor-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1152,
    top: 100,
    placeholder: '#989898',
  },
  about: {
    key: 'about',
    slot: 'about',
    src: {
      avif: [
        { w: 480, src: '/images/about-still-life-480.avif' },
        { w: 768, src: '/images/about-still-life-768.avif' },
        { w: 1152, src: '/images/about-still-life-1152.avif' },
      ],
      webp: [
        { w: 480, src: '/images/about-still-life-480.webp' },
        { w: 768, src: '/images/about-still-life-768.webp' },
        { w: 1152, src: '/images/about-still-life-1152.webp' },
      ],
      jpeg: [
        { w: 480, src: '/images/about-still-life-480.jpg' },
        { w: 768, src: '/images/about-still-life-768.jpg' },
        { w: 1152, src: '/images/about-still-life-1152.jpg' },
      ],
    },
    width: 1152,
    height: 1440,
    top: 33,
    placeholder: '#b8a898',
  },
};

/** Renditions belonging to each key, for sections that loop over a slot. */
export const renditionsByKey = {
  hero: ['hero', 'heroSquare'],
  flowerBarCloseup: ['flowerBarCloseupIntro', 'flowerBarCloseupGallery'],
  farmBouquetPinkWhite: ['farmBouquetPinkWhite'],
  farmBouquetColorful: ['farmBouquetColorful'],
  farmZinnias: ['farmZinnias'],
  galleryEventDetail: ['galleryEventDetail'],
  galleryArrangement: ['galleryArrangement'],
  galleryArrangementOutdoor: ['galleryArrangementOutdoor'],
  about: ['about'],
} as const satisfies Partial<Record<ImageKey, readonly RenditionId[]>>;
