import Container from './components/Container';
import SectionHeading from './components/SectionHeading';
import { copy } from './content/copy';
import FlowerBarIntro from './sections/FlowerBarIntro';
import Footer from './sections/Footer';
import Header from './sections/Header';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import Packages from './sections/Packages';

/**
 * Page shell. Section order and anchor ids are ux-spec §1. Built so far:
 * Header, Hero, Footer (5a) and Flower Bar Intro, How It Works, Packages (5b).
 * The sections still to come render their approved H2 inside a `<Placeholder>`
 * so the anchors, the heading outline and the `aria-labelledby` wiring are real
 * from the first batch; batches 5c–5e replace each placeholder in place.
 *
 * React renders no document metadata and no `ld+json`: the head is injected at
 * build time by the `happy-days-seo-head` plugin in `vite.config.ts` (SEO-1).
 */

/** design-spec §10, inlined once, used only by the Why Happy Days trio (Q4). */
function BucketClipPath() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <clipPath id="bucket" clipPathUnits="objectBoundingBox">
        <path d="M.02 0H.98Q1 0 1 .02L.94 .9Q.93 1 .86 1H.14Q.07 1 .06 .9L0 .02Q0 0 .02 0Z" />
      </clipPath>
    </svg>
  );
}

function Placeholder({
  id,
  heading,
  surface = 'surface',
}: {
  id: string;
  heading: string;
  surface?: 'surface' | 'surface-alt' | 'brand';
}) {
  const onBrand = surface === 'brand';

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-surface={onBrand ? 'brand' : undefined}
      className={
        onBrand
          ? 'bg-surface-brand py-section'
          : surface === 'surface-alt'
            ? 'bg-surface-alt py-section'
            : 'bg-surface py-section'
      }
    >
      <Container>
        <SectionHeading
          id={`${id}-heading`}
          heading={heading}
          tone={onBrand ? 'on-brand' : 'ink'}
        />
      </Container>
    </section>
  );
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-field bg-brand px-4 py-3 font-medium text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <BucketClipPath />
      <Header />
      <main id="main">
        <Hero />
        {/* Sections 2–9, ux-spec §1 order. Headings are the approved H2s. */}
        <FlowerBarIntro />
        <HowItWorks />
        <Packages />
        <Placeholder id="why" heading={copy.whyHappyDays.heading} />
        <Placeholder id="gallery" heading={copy.gallery.heading} surface="surface-alt" />
        <Placeholder id="about" heading={copy.about.heading} />
        <Placeholder id="faq" heading={copy.faq.heading} />
        <Placeholder id="inquire" heading={copy.inquiry.heading} surface="brand" />
      </main>
      <Footer />
    </>
  );
}
