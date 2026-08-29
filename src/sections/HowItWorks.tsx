import Container from '../components/Container';
import SectionHeading from '../components/SectionHeading';
import { howItWorks } from '../content/copy';

/**
 * How It Works — ux-spec §4.3, design-spec §6.7, surface `surface-alt` (§7).
 *
 * An `<ol>` because the content is a sequence: stacked on phones, 2×2 on
 * tablet, four across from `lg`, where a hairline above each item makes the
 * row read as a shelf. From `lg` each item is a three-row subgrid (numeral,
 * title, body) so the four paragraphs start on one line however a title wraps
 * (review 5bc-02); below `lg` the items are plain blocks with `gap-y-10`.
 *
 * The numeral is data (`copy.howItWorks.steps[].number`), never typed inline.
 * It is rendered twice on purpose: once large and `aria-hidden` as the visible
 * figure, and once inside the H3 as `sr-only` "01 — " so the heading outline
 * carries the approved wording "01 — Choose Your Flower Bar" (ux-spec §9)
 * while the eye sees a single numeral.
 */
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-surface-alt py-section"
    >
      <Container>
        <SectionHeading id="how-it-works-heading" heading={howItWorks.heading} />

        <ol className="mt-stack grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] lg:gap-y-0">
          {howItWorks.steps.map((step) => (
            <li
              key={step.number}
              className="lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:border-t lg:border-line lg:pt-6"
            >
              <span
                aria-hidden="true"
                className="block font-display text-step text-accent-orange-ink"
              >
                {step.number}
              </span>
              <h3 className="mt-3 font-display text-h3 text-ink text-balance">
                <span className="sr-only">{`${step.number} — `}</span>
                {step.title}
              </h3>
              <p className="text-body mt-2 text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="text-lead mt-stack text-center text-ink text-balance">
          <strong className="font-medium">{howItWorks.closing}</strong>
        </p>
      </Container>
    </section>
  );
}
