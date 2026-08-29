import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Wordmark from '../components/Wordmark';
import { header } from '../content/copy';
import { cn } from '../lib/cn';

/**
 * Sticky header, design-spec §6.11 + ux-spec §2.1/§3.
 *
 * Opaque cream, 56 px below `md` and 72 px above it, one row at every width:
 * wordmark left, the three nav items right. "Flower Bar" and "About" are text
 * links; "Inquire" is the primary CTA as a real `<a>`, compact below `md`. No
 * hamburger — the `<details>` fallback is only for 320 px if the row wraps, and
 * it does not (checked at 320 px, see the batch summary).
 *
 * The bottom hairline appears after 8 px of scroll rather than always-on
 * (design-spec §6.11 allows either): it keeps the hero's first screen free of
 * chrome, and the fade is one of the three micro-interactions §11 permits.
 */
const SCROLL_THRESHOLD = 8;

function useScrolledPast(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

export default function Header() {
  const scrolled = useScrolledPast(SCROLL_THRESHOLD);
  const [flowerBar, about, inquire] = header.nav;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-header border-b bg-surface transition-colors duration-150 ease-soft md:h-header-lg',
        scrolled ? 'border-line' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-site items-center justify-between gap-2 px-gutter sm:gap-6">
        <Wordmark variant="header" href="#top" />
        <nav aria-label="Primary">
          {/* gap-2 is only for the narrowest phones: at 320 px the row already
              spends part of its right gutter (measured 20 + 85 lockup + 8 +
              196 nav = 309, leaving 11 px of the 20 px gutter) and anything
              wider wraps. From 360 px there is real slack — 21 + 85 + 12 + 212
              + 21 = 351 ≤ 360 — so the nav opens up to 16 px gaps rather than
              reading as one run-on phrase (design review 5a-04). See requests
              Q8 for the 320 px gutter. */}
          <ul className="flex items-center gap-2 min-[360px]:gap-4 sm:gap-5 md:gap-8">
            {[flowerBar, about].map((item) => (
              <li key={item.href} className="flex">
                <a
                  href={item.href}
                  className="flex min-h-tap items-center whitespace-nowrap font-body text-[0.8125rem] font-medium text-ink underline-offset-4 hover:text-brand-ink hover:underline focus-visible:underline md:text-small"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="flex">
              <Button as="a" href={inquire.href} size="header">
                {inquire.label}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
