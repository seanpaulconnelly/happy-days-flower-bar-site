import Container from '../components/Container';
import Picture from '../components/Picture';
import SectionHeading from '../components/SectionHeading';
import { gallery } from '../content/copy';
import { images } from '../content/images';
import { generatedImages } from '../content/images.generated';
import { SIZES } from '../lib/images';

/**
 * Gallery — ux-spec §4.6, design-spec §7, §8 ("Gallery"), §9.
 *
 * H2 → paragraph → bold line → four square photographs. The strip is the one
 * element that leaves the container on purpose: it is a direct child of the
 * section, so it runs edge to edge with only the `gap-strip` gutter between
 * frames and the warm-white ground disappears behind it (design-spec §7). Two
 * across on phone and tablet, four across from `lg`.
 *
 * The section is `pt-section` only (review 5bc-01): the strip is its last child
 * and closes it flush, so the warm-white ground shows above the photographs and
 * never as a band beneath them. The gap to About is About's own `pt-section`.
 *
 * No lightbox, no captions, no hover state (ux-spec §4.6): the alt text does
 * the describing, and every photograph is already shown at the width the
 * layout gives it. Radius 0 here — the rounded corners elsewhere and the
 * bucket frame in Why Happy Days stay the shaped slots.
 *
 * `flower-bar-closeup` appears twice on the page; this slot uses the 1:1
 * `flowerBarCloseupGallery` rendition (top flowers to wheels) against the
 * Intro's 4:5 crop, so it does not read as a repeat. Same alt in both places —
 * it is content, not decoration, in both (ux-spec §7).
 */

/** The four `gallery`-slot renditions in `images.ts` `order` (1–4). */
const STRIP = [
  'flowerBarCloseupGallery',
  'galleryEventDetail',
  'galleryArrangement',
  'galleryArrangementOutdoor',
] as const;

export default function Gallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="bg-surface-alt pt-section">
      <Container>
        <SectionHeading id="gallery-heading" heading={gallery.heading} lead={gallery.body} />

        <p className="text-lead mx-auto mt-6 max-w-prose-copy text-center text-ink text-balance">
          <strong className="font-medium">{gallery.emphasis}</strong>
        </p>
      </Container>

      <ul role="list" className="mt-stack grid grid-cols-2 gap-strip lg:grid-cols-4">
        {STRIP.map((id) => {
          const rendition = generatedImages[id];
          return (
            <li key={id}>
              <Picture
                image={rendition}
                alt={images[rendition.key].alt}
                sizes={SIZES.gallery}
                className="aspect-square w-full object-cover"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
