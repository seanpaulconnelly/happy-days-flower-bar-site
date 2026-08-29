import Container from '../components/Container';
import SectionHeading from '../components/SectionHeading';
import { faq } from '../content/copy';

/**
 * FAQ — ux-spec §1.1/§1.2 and §4.8, design-spec §6.13, seo-aeo-spec §11.
 *
 * Position 8, between About and Inquiry: the six practical objections
 * (travel, lead time, rain, what's included) are cleared immediately before
 * the ask, so the form is the next thing a qualified visitor sees.
 *
 * Native `<details>`/`<summary>`, collapsed by default, no JavaScript. The
 * question is an `<h3>` inside the `<summary>` (summary's content model allows
 * one heading), so the outline reads H2 → eight H3s, and Space/Enter toggle
 * each row for free with the expanded state announced by the browser.
 *
 * The answer `<p>` is rendered unconditionally — never behind a React
 * condition, never `hidden`/`display:none`/`aria-hidden` (seo-aeo-spec §11.2's
 * three non-negotiables). `<details>` does its own hiding, so every answer is
 * in the DOM on first render for crawlers, answer engines and `check:copy`.
 *
 * No `name="faq"` grouping: ux-spec §1.2 makes the exclusive accordion
 * optional and design-spec §6.13 does not require it, so the rows open and
 * close independently — a visitor comparing the travel answer against the
 * lead-time answer keeps both open.
 *
 * `faq.items` is the single source of both this list and `FAQPage.mainEntity`
 * (seo-aeo-spec §11.3): rendered in array order, with no index map, so the DOM
 * order and the JSON-LD order cannot diverge.
 *
 * Padding is `pt-section-sm pb-section`: §6.13's `py-section-sm` left the
 * hairline-bounded list sitting too close to the green Inquiry band, and the
 * 5bc review §4 says that transition is fixed on the FAQ's side rather than on
 * the `--spacing-section` token.
 */

/**
 * design-spec §6.13's marker: a 20 px plus in `currentColor` that rotates 45°
 * into an × when the row is open. Two strokes, inline — no icon package. The
 * global `prefers-reduced-motion` rule in `index.css` cuts the transition to
 * ~0 ms, so under reduced motion the rotation is instant rather than absent.
 */
function Marker() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className="mt-1.5 size-5 shrink-0 text-brand transition-transform duration-200 ease-soft group-open:rotate-45"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </svg>
  );
}

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-surface pt-section-sm pb-section">
      <Container>
        <SectionHeading id="faq-heading" heading={faq.heading} />

        <div className="mt-stack mx-auto max-w-faq divide-y divide-line border-y border-line">
          {faq.items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-tap cursor-pointer list-none items-start justify-between gap-6 py-5">
                <h3 className="font-display text-h3 text-ink">{item.question}</h3>
                <Marker />
              </summary>
              <p className="text-body max-w-prose-copy pb-6 text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
