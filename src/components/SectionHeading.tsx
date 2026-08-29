import { cn } from '../lib/cn';

/**
 * The section heading block from design-spec §6.2: optional eyebrow, the H2,
 * optional lead. Centred by default; left-aligned inside the split layouts.
 *
 * `id` is required because every section is `aria-labelledby` its own H2
 * (ux-spec §9) — the H2 element is the label, so it always carries an id.
 *
 * Only the Hero has an eyebrow in V1; it renders its own heading block because
 * its heading is the page's single `h1`.
 */
export default function SectionHeading({
  id,
  eyebrow,
  heading,
  lead,
  align = 'center',
  tone = 'ink',
  className,
}: {
  id: string;
  eyebrow?: string;
  heading: string;
  lead?: string;
  align?: 'center' | 'left';
  /** `on-brand` for the deep-green sections (design-spec §7). */
  tone?: 'ink' | 'on-brand';
  className?: string;
}) {
  const onBrand = tone === 'on-brand';

  return (
    <div
      className={cn(
        'max-w-prose-copy',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'font-body text-eyebrow uppercase',
            onBrand ? 'text-on-brand-muted' : 'text-brand',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={cn(
          'font-display text-h2 text-balance',
          onBrand ? 'text-on-brand' : 'text-ink',
          eyebrow && 'mt-3',
        )}
      >
        {heading}
      </h2>
      {lead ? (
        <p className={cn('text-lead mt-4', onBrand ? 'text-on-brand-muted' : 'text-ink-muted')}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
