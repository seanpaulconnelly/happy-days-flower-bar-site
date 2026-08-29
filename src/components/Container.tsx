import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * The page's one horizontal rhythm: centred, `max-w-site` (72rem), `px-gutter`
 * (20 → 40 px). design-spec §5. Sections that break out of it (the gallery
 * strip, the hero's flush-right image) do so deliberately and say so.
 */
export default function Container({
  as: Element = 'div',
  className,
  children,
}: {
  as?: 'div' | 'section' | 'header' | 'footer';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Element className={cn('mx-auto w-full max-w-site px-gutter', className)}>{children}</Element>
  );
}
