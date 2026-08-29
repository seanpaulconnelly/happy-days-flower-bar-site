/**
 * The 9 content images, keyed. Originals live in `assets-src/images/`
 * (gitignored, copied from 1-genesis in Phase 4) and are never committed;
 * `scripts/build-images.mjs` reads `src` from there and writes responsive
 * AVIF/WebP/JPEG variants named from `out` into `public/images/`.
 *
 * Swapping a photo (R6): drop the new original into `assets-src/images/`,
 * update `src` here, re-run `npm run images`.
 */

export type ImageSlot = 'hero' | 'intro' | 'why' | 'gallery' | 'about';

export type ImageEntry = {
  /** Filename of the original in `assets-src/images/`. */
  src: string;
  /** Basename for the generated files in `public/images/`. */
  out: string;
  /** Where the image is used. `flowerBarCloseup` serves two slots. */
  slots: readonly ImageSlot[];
  /** Order within the slot, for the multi-image sections. */
  order: number;
  /** Alt text, verbatim from docs/ux-spec.md §7. Never edit without the ux-spec. */
  alt: string;
};

export const images = {
  hero: {
    src: 'hero-flower-bar.jpeg',
    out: 'hero-flower-bar',
    slots: ['hero'],
    order: 1,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: "Pop-up flower bar set up indoors: a white three-tier stand of buckets filled with greenery, daisies, roses and baby's breath beside an easel sign with bouquet-building steps.",
  },
  flowerBarCloseup: {
    src: 'flower-bar-closeup.jpeg',
    out: 'flower-bar-closeup',
    slots: ['intro', 'gallery'],
    order: 1,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: "Close-up of the flower bar stand with twelve white buckets holding eucalyptus, pink spray roses, hypericum berries, yellow daisies and baby's breath.",
  },
  farmBouquetPinkWhite: {
    src: 'farm-bouquet-pink-white.jpeg',
    out: 'farm-bouquet-pink-white',
    slots: ['why'],
    order: 1,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'A hand holding a freshly picked bouquet of magenta yarrow and white feverfew daisies above a green lawn.',
  },
  farmBouquetColorful: {
    src: 'farm-bouquet-colorful.jpeg',
    out: 'farm-bouquet-colorful',
    slots: ['why'],
    order: 2,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'A hand holding a bright mixed bouquet of yellow zinnias, red-and-gold coreopsis, purple dianthus and white button flowers in a garden.',
  },
  farmZinnias: {
    src: 'farm-zinnias.jpeg',
    out: 'farm-zinnias',
    slots: ['why'],
    order: 3,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'A smiling woman in a blue shirt holding an armful of coral, pink and magenta zinnias in a farm field.',
  },
  galleryEventDetail: {
    src: 'gallery-event-detail.jpeg',
    out: 'gallery-event-detail',
    slots: ['gallery'],
    order: 2,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'Event dessert table with flower-shaped iced cookies and cupcakes in front of a galvanized tin of blush roses, purple daisies and yellow blooms.',
  },
  galleryArrangement: {
    src: 'gallery-arrangement.jpeg',
    out: 'gallery-arrangement',
    slots: ['gallery'],
    order: 3,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'Loose garden-style arrangement of purple daisies, yellow blooms, yarrow and airy greenery in a galvanized tin on a white-draped table with a pink backdrop.',
  },
  galleryArrangementOutdoor: {
    src: 'gallery-arrangement-outdoor.jpeg',
    out: 'gallery-arrangement-outdoor',
    slots: ['gallery'],
    order: 4,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: "Galvanized tin arrangement of blush roses, purple daisies, yellow daisies and baby's breath on a wicker table beside a sheer curtain.",
  },
  about: {
    src: 'about-bethany-working.jpeg',
    out: 'about-still-life',
    slots: ['about'],
    order: 1,
    // alt text: docs/ux-spec.md §7, verbatim
    alt: 'Glass cylinder vase of moss with tall blue delphinium, yellow craspedia, red carnations, pink spray roses and chamomile against a brick wall.',
  },
} as const satisfies Record<string, ImageEntry>;

export type ImageKey = keyof typeof images;

export const imageKeys = Object.keys(images) as ImageKey[];

/** Keys used in a given slot, in `order`. */
export function imagesInSlot(slot: ImageSlot): ImageKey[] {
  return imageKeys
    .filter((key) => (images[key].slots as readonly ImageSlot[]).includes(slot))
    .sort((a, b) => images[a].order - images[b].order);
}
