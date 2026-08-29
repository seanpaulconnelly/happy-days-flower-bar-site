import Button from '../components/Button';
import Container from '../components/Container';
import SectionHeading from '../components/SectionHeading';
import { packages } from '../content/copy';
import { cn } from '../lib/cn';

/**
 * Flower Bar Packages — ux-spec §4.4/§5, design-spec §6.5/§6.6, §8.
 *
 * Order is the spec's: H2 → intro → three cards → Custom band → footnote. The
 * primary CTA lives on the band and is not repeated below it (design-spec §14
 * item 3, decision D12), so the section holds exactly one primary button.
 *
 * Cards stack on phones and go three across from `md` (768 px: 3 × 224.5 px
 * with `md:gap-x-4`, clearing ux-spec §4.4's 220 px threshold), stretched to
 * equal heights by the grid. Padding is `p-7 md:p-6 lg:p-8`: the tablet step
 * down buys the descriptions a 21–22 ch measure instead of 19 (review 5bc-04). Name → guest range →
 * price → description is the top-down scan path; prices are tabular lining
 * figures so `$895 / $1,495 / $1,995` align across the row.
 *
 * "Most Popular" (ux-spec §5): the lavender chip plus exactly one more
 * differentiator — a 1.5 px brand border on The Social. Same size, padding,
 * type scale and spacing as the other two; Classic and Full are not dimmed,
 * scaled or filled.
 *
 * The chip sits on its own row above the H3 rather than beside it as
 * design-spec §6.5 sketches: at the 768 px three-across width the spec itself
 * fixes, a card is ~163 px wide inside its padding, and a chip on the H3 line
 * squeezed "The Social Flower Bar" onto four lines and pushed its price below
 * the other two — the opposite of §5's "same size, same type, don't make the
 * others look inferior". Above the H3 is ux-spec §5's other permitted position.
 *
 * The band keeps design-spec §6.6's `p-7 md:p-8` from `sm` up but drops to
 * `p-6` below it: at 320 px the spec's padding leaves 224 px inside the band
 * and "Inquire About Your Date" needs 226 px, so the primary CTA's label broke
 * onto two lines. 8 px of padding buys the label back. There is no `lg:px-10`
 * (review 5bc-05) so the band's text aligns with the card text above it, and
 * its guest-range line is `text-balance` so 320 px breaks it at the dash
 * rather than orphaning the last word (5bc-06).
 *
 * The footnote is set roman, small and muted rather than italic (decision D11)
 * and is constrained to the prose measure so a 140-character line does not run
 * the full 1152 px container.
 */
const CARD_BASE =
  'flex flex-col rounded-card bg-surface-alt p-7 md:p-6 lg:p-8 border border-border md:row-span-5 md:grid md:grid-rows-subgrid';

export default function Packages() {
  return (
    <section id="packages" aria-labelledby="packages-heading" className="bg-surface py-section">
      <Container>
        <SectionHeading id="packages-heading" heading={packages.heading} lead={packages.intro} />

        {/* Five subgrid rows — chip, name, guest range, price, description —
            so the four facts line up across the three cards however a name
            wraps, and the chip's row is reserved on every card. `gap-y-0` at
            md keeps the cards' internal rhythm the spec's `mt-*` values. */}
        <ul
          role="list"
          className="mt-stack grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto_1fr] md:gap-x-4 md:gap-y-0 lg:gap-x-8"
        >
          {packages.items.map((item) => (
            <li
              key={item.name}
              className={cn(CARD_BASE, item.mostPopular && 'border-[1.5px] border-brand')}
            >
              {item.mostPopular ? (
                <span className="text-chip mb-3 w-fit rounded-full bg-accent-lavender px-2.5 py-1.5 font-body text-ink uppercase">
                  {packages.mostPopularLabel}
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
              <h3 className="font-display text-h3 text-ink text-balance">{item.name}</h3>
              <p className="text-eyebrow mt-2 text-ink-muted uppercase tabular-nums">
                {item.guests}
              </p>
              <p className="text-price mt-6 font-display text-ink tabular-nums lining-nums">
                {item.price}
              </p>
              <p className="text-body mt-4 text-ink-muted">{item.description}</p>
            </li>
          ))}
        </ul>

        <div
          data-surface="brand"
          className="mt-6 flex flex-col gap-6 rounded-card bg-surface-brand p-6 text-on-brand sm:p-7 md:flex-row md:items-center md:justify-between md:p-8 lg:mt-8"
        >
          <div>
            <h3 className="font-display text-h3 text-on-brand">{packages.custom.name}</h3>
            <p className="text-lead mt-1 text-on-brand-muted tabular-nums text-balance">
              {`${packages.custom.guests} — ${packages.custom.price}`}
            </p>
            <p className="text-body mt-3 max-w-[38rem] text-on-brand">
              {packages.custom.description}
            </p>
          </div>
          <div className="shrink-0">
            <Button as="a" href="#inquire" onBrand>
              {packages.cta}
            </Button>
          </div>
        </div>

        <p className="text-small mt-6 mx-auto max-w-prose-copy text-center text-ink-muted">
          {packages.footnote}
        </p>
      </Container>
    </section>
  );
}
