import Container from '../components/Container';
import Picture from '../components/Picture';
import SectionHeading from '../components/SectionHeading';
import { whyHappyDays } from '../content/copy';
import { images } from '../content/images';
import { generatedImages } from '../content/images.generated';
import { SIZES } from '../lib/images';

/**
 * Why Happy Days? — ux-spec §4.5, design-spec §6.8, §8 ("Why"), §10.
 *
 * The section's argument ("locally grown, seasonal") is made as a picture: the
 * three farm photographs are clipped to the bucket silhouette (design-spec §10)
 * and sit in a three-column row at every width, so the row reads as a shelf of
 * the flower bar filled with what the farm grows. This is the page's only
 * non-rectangular shape and its only use of `clip-path: url(#bucket)` — the
 * `<clipPath>` itself is inlined once in `App.tsx` (request Q4). `rounded-field`
 * is the fallback for a browser without `clip-path` support and is otherwise
 * invisible; no shadow, no shelf line, no captions under the frames.
 *
 * design-spec §8 fixes the trio at 4:5 in the frame rather than the ux-spec's
 * 1:1 squares (decision D12); the crops are the ones `build-images.mjs` cut
 * with the §9 focal offsets, including the manual override that keeps the
 * person in `farm-zinnias` clear of the top edge.
 *
 * Reason order and text are `copy.whyHappyDays.reasons`, verbatim. Each item is
 * an H3 over a paragraph with a hairline above it; two across from `md`. No
 * icons (design-spec §6.8) and no scroll-triggered motion (§11).
 */

/**
 * The three `why`-slot renditions in `images.ts` `order` (1, 2, 3). Each key in
 * this slot has exactly one rendition, so the rendition id and the image key
 * match; `rendition.key` is what points back at `images.ts` for the alt text.
 */
const TRIO = ['farmBouquetPinkWhite', 'farmBouquetColorful', 'farmZinnias'] as const;

export default function WhyHappyDays() {
  return (
    <section id="why" aria-labelledby="why-heading" className="bg-surface py-section">
      <Container>
        <SectionHeading id="why-heading" heading={whyHappyDays.heading} />

        <ul role="list" className="mt-stack grid grid-cols-3 gap-3 sm:gap-6">
          {TRIO.map((id) => {
            const rendition = generatedImages[id];
            return (
              <li key={id}>
                <Picture
                  image={rendition}
                  alt={images[rendition.key].alt}
                  sizes={SIZES.why}
                  className="aspect-[4/5] w-full rounded-field object-cover [clip-path:url(#bucket)]"
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-stack grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          {whyHappyDays.reasons.map((reason) => (
            <div key={reason.title} className="border-t border-line pt-5">
              <h3 className="font-display text-h3 text-ink text-balance">{reason.title}</h3>
              <p className="text-body mt-2 text-ink-muted">{reason.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
