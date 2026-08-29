import Button from '../components/Button';
import Container from '../components/Container';
import Picture from '../components/Picture';
import { hero } from '../content/copy';
import { images } from '../content/images';
import { generatedImages } from '../content/images.generated';
import { HERO_DESKTOP_MEDIA, SIZES } from '../lib/images';

/**
 * Hero — design-spec §6.3, ux-spec §4.1/§9.
 *
 * DOM order is eyebrow → h1 → lead → CTA → image at every width, which is also
 * the mobile visual order; from `md` the image is lifted out of the flow and
 * pinned flush to the right viewport edge ("picture spanning the page to the
 * edge"), rounded on its inner corners only.
 *
 * The image is the LCP element: `priority` (eager + `fetchpriority="high"`) and
 * preloaded from the build-time head injection in `vite.config.ts` with the
 * same `SIZES.hero` string and the same two media conditions, so exactly one
 * hero file is fetched. It is art-directed — the native 3:4 crop from `md` up,
 * the 1:1 crop below — via `<source media>` rather than two hidden elements,
 * which would download both.
 *
 * Motion is the page's one orchestrated reveal (design-spec §11): the four text
 * elements rise 12 px, staggered 80 ms; the image only fades, because it must
 * not shift. `index.css` zeroes both under `prefers-reduced-motion`, and the
 * `both` fill mode lands everything in its final state.
 */
export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative bg-surface">
      {/* `md:min-h-[min(50vw,48rem)]` grows the section — the pinned image's
          containing block — so the band is at least square from 1024 up
          (design review 5a-02); the symmetric `md:py-16` lets `justify-center`
          centre the text on the image's true midline. */}
      <Container className="pt-10 pb-section md:flex md:min-h-[min(50vw,48rem)] md:flex-col md:justify-center md:py-16">
        <div className="max-w-[30rem] md:w-[45%]">
          <p className="animate-rise font-body text-eyebrow text-brand uppercase">{hero.eyebrow}</p>
          <h1
            id="hero-heading"
            className="animate-rise mt-3 font-display text-display text-ink text-balance [animation-delay:80ms]"
          >
            {hero.heading}
          </h1>
          <p className="animate-rise text-lead mt-5 max-w-[30rem] text-ink-muted [animation-delay:160ms]">
            {hero.body}
          </p>
          <div className="animate-rise mt-8 [animation-delay:240ms]">
            <Button as="a" href="#inquire">
              {hero.cta}
            </Button>
          </div>
        </div>

        {/* Below `md` the image sits in the flow under the CTA; from `md` the
            same element is pinned to the section's right edge. */}
        <div className="animate-fade mt-10 md:absolute md:inset-y-0 md:right-0 md:mt-0 md:w-1/2">
          <Picture
            image={generatedImages.heroSquare}
            media={[{ image: generatedImages.hero, media: HERO_DESKTOP_MEDIA }]}
            alt={images.hero.alt}
            sizes={SIZES.hero}
            priority
            className="aspect-square w-full rounded-photo object-cover md:aspect-auto md:h-full md:rounded-none md:rounded-l-hero"
          />
        </div>
      </Container>
    </section>
  );
}
