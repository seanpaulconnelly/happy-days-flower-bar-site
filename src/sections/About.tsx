import Container from '../components/Container';
import Picture from '../components/Picture';
import SectionHeading from '../components/SectionHeading';
import { about } from '../content/copy';
import { images } from '../content/images';
import { generatedImages } from '../content/images.generated';
import { SIZES } from '../lib/images';

/**
 * About — ux-spec §4.7, design-spec §8 ("About"), §9.
 *
 * The only section where the image leads on mobile: its job is warmth and
 * trust, the photograph carries that, and it breaks the text-first rhythm of
 * the five sections above it. The DOM order (image, then H2 and the two
 * paragraphs) is also the desktop order — image left at 46 %, text right — so
 * one source order serves both widths and nothing is reordered visually.
 *
 * H2 plus two paragraphs verbatim and nothing else: no bio bullets, no name,
 * no caption (R10). The `about` rendition is a 4:5 still life, not a portrait
 * — the source filename is misleading (decisions D10/D12, request Q6) and its
 * public outputs are named `about-still-life-*` (D14). The alt text describes
 * what is actually in the frame.
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-surface py-section">
      <Container className="flex flex-col md:flex-row md:items-center md:gap-12 lg:gap-16">
        <div className="md:w-[46%]">
          <Picture
            image={generatedImages.about}
            alt={images.about.alt}
            sizes={SIZES.about}
            className="aspect-[4/5] w-full rounded-photo object-cover"
          />
        </div>

        <div className="mt-10 md:mt-0 md:w-[54%]">
          <SectionHeading id="about-heading" heading={about.heading} align="left" />

          <div className="mt-6 max-w-prose-copy space-y-4">
            {about.body.map((paragraph) => (
              <p key={paragraph} className="text-body text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
