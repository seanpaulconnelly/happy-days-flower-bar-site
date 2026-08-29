import Button from '../components/Button';
import Container from '../components/Container';
import Picture from '../components/Picture';
import SectionHeading from '../components/SectionHeading';
import { flowerBarIntro } from '../content/copy';
import { images } from '../content/images';
import { generatedImages } from '../content/images.generated';
import { SIZES } from '../lib/images';

/**
 * Flower Bar Introduction — ux-spec §4.2, design-spec §8 ("Intro").
 *
 * DOM order is the mobile order: H2 → lead → the two paragraphs → the bold
 * line → secondary CTA → image (`mt-10`). From `md` the row reverses so the
 * 4:5 photo sits on the left at 46 % and the text on the right, alternating
 * with the hero's image-right split; the DOM order is unchanged, so reading
 * order stays text-first at every width.
 *
 * The CTA is the page's only secondary button (R5, ux-spec §2): the one
 * primary fill belongs to "Inquire About Your Date".
 *
 * No reveal animation: design-spec §11 allows exactly one orchestrated reveal
 * (the hero) and no scroll-triggered motion.
 */
export default function FlowerBarIntro() {
  return (
    <section id="flower-bar" aria-labelledby="flower-bar-heading" className="bg-surface py-section">
      <Container className="flex flex-col md:flex-row-reverse md:items-center md:gap-8 lg:gap-16">
        <div className="md:w-[58%] lg:w-[54%]">
          <SectionHeading
            id="flower-bar-heading"
            heading={flowerBarIntro.heading}
            lead={flowerBarIntro.lead}
            align="left"
          />

          <div className="mt-6 max-w-prose-copy space-y-4">
            {flowerBarIntro.body.map((paragraph) => (
              <p key={paragraph} className="text-body text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>

          <p className="text-lead mt-6 max-w-prose-copy text-ink text-balance">
            <strong className="font-medium">{flowerBarIntro.emphasis}</strong>
          </p>

          <div className="mt-8">
            <Button as="a" href="#packages" variant="secondary">
              {flowerBarIntro.cta}
            </Button>
          </div>
        </div>

        <div className="mt-10 md:mt-0 md:w-[42%] lg:w-[46%]">
          <Picture
            image={generatedImages.flowerBarCloseupIntro}
            alt={images.flowerBarCloseup.alt}
            sizes={SIZES.intro}
            className="aspect-[4/5] w-full rounded-photo object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
