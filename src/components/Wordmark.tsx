import { header as headerCopy } from '../content/copy';
import { cn } from '../lib/cn';

/**
 * The typed wordmark (design-spec §12, R12): Newsreader 500, title case, ink.
 * Never green, never uppercase, never a heading element — the page's only `h1`
 * lives in the hero (ux-spec §9).
 *
 * `variant="header"` sets it 20 px and, below `sm`, breaks it into the two-line
 * lockup at 15 px so all three nav items still fit on one row at 320 px. The
 * break is a line break, not new copy: both halves are sliced out of
 * `copy.header.wordmark` and rejoined by a real space text node, so the
 * accessible name and `check-copy` both read "Happy Days Flower Farm".
 *
 * `variant="footer"` is the 24 px single line.
 */
const WORDS = headerCopy.wordmark.split(' ');
/** "Happy Days" / "Flower Farm" — the lockup breaks after the second word. */
const LOCKUP_BREAK_AFTER = 2;

export default function Wordmark({
  variant,
  href,
  className,
}: {
  variant: 'header' | 'footer';
  /** Renders an `<a>` when set (the header links to `#top`). */
  href?: string;
  className?: string;
}) {
  const classes = cn(
    'font-display text-ink',
    variant === 'header' ? 'text-wordmark-sm sm:text-wordmark' : 'text-wordmark-lg',
    className,
  );

  const content =
    variant === 'header' ? (
      <>
        {/* `whitespace-nowrap`: at 320 px the flex row squeezes this item, and
            without it each half wraps again into two lines. */}
        <span className="block whitespace-nowrap sm:inline">
          {WORDS.slice(0, LOCKUP_BREAK_AFTER).join(' ')}
        </span>{' '}
        <span className="block whitespace-nowrap sm:inline">
          {WORDS.slice(LOCKUP_BREAK_AFTER).join(' ')}
        </span>
      </>
    ) : (
      headerCopy.wordmark
    );

  if (href) {
    return (
      <a href={href} className={cn(classes, 'inline-flex min-h-tap shrink-0 items-center')}>
        {/* The anchor stays a centred flex box at every width; this span carries
            the block/inline lockup switch, so the two-line lockup below `sm` and
            the single line above it are both centred on the header's midline
            (design review 5a-01 — `sm:block` on the anchor left the text at the
            top of a 44 px box). */}
        <span>{content}</span>
      </a>
    );
  }

  return <p className={classes}>{content}</p>;
}
