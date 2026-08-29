import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * The page's two button styles, exactly as design-spec §6.1. No transforms, no
 * shadows, no third variant. Every CTA on this site is a real `<a href="#…">`
 * (ux-spec §2) so it works without JS; `as="button"` exists for the form submit.
 *
 * `onBrand` is the §6.1 rule that the primary button inverts to warm orange on
 * charcoal inside a `[data-surface="brand"]` section (the custom-quote band and
 * the inquiry form). It is passed explicitly rather than inferred from an
 * ancestor selector so the variant is visible at the call site.
 *
 * `size="header"` is the compact header pill below `md` (36 px tall, hit area
 * padded back out to 44 px with a `::before` overlay). From `md` it grows to a
 * 44 px pill with a 14 px label — deliberately the quieter twin of the hero CTA,
 * which is the only full-size primary on the first screen (design review 5a-05).
 */
type Variant = 'primary' | 'secondary';
type Size = 'default' | 'header';

const BASE =
  'font-body font-medium leading-none tracking-[0.01em] rounded-full inline-flex items-center justify-center gap-2 transition-colors duration-150 ease-soft disabled:cursor-not-allowed';

const SIZES: Record<Size, string> = {
  default: 'text-[0.9375rem] md:text-base px-6 py-3.5 min-h-tap',
  header:
    "relative min-h-9 px-3.5 py-2.5 text-[0.8125rem] before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] md:min-h-tap md:px-5 md:py-3 md:text-small md:before:hidden",
};

const VARIANTS: Record<Variant, { light: string; brand: string }> = {
  primary: {
    light: 'bg-brand text-on-brand hover:bg-brand-ink disabled:opacity-50',
    brand: 'bg-accent-orange text-ink hover:bg-accent-orange-hover disabled:opacity-60',
  },
  secondary: {
    light:
      'border-[1.5px] border-brand bg-transparent text-brand-ink hover:bg-accent-mint disabled:opacity-50',
    brand: 'border-[1.5px] border-on-brand bg-transparent text-on-brand hover:bg-on-brand/10',
  },
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  onBrand?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = CommonProps & { as?: 'a'; href: string };
type AsButton = CommonProps & {
  as: 'button';
  href?: never;
} & Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'disabled' | 'onClick' | 'aria-describedby'
  >;

export type ButtonProps = AsLink | AsButton;

export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'default', onBrand = false, className, children } = props;
  const classes = cn(BASE, SIZES[size], VARIANTS[variant][onBrand ? 'brand' : 'light'], className);

  if (props.as === 'button') {
    return (
      <button
        className={classes}
        type={props.type ?? 'button'}
        disabled={props.disabled}
        onClick={props.onClick}
        aria-describedby={props['aria-describedby']}
      >
        {children}
      </button>
    );
  }

  return (
    <a href={props.href} className={classes}>
      {children}
    </a>
  );
}
