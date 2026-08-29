import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { errorId } from '../lib/fieldStyles';

/**
 * One labelled form control — design-spec §6.9, ux-spec §6.1/§6.3.
 *
 * Labels are always visible and above the control; there are no placeholders
 * anywhere in this form. The required mark is decorative (`aria-hidden`) and the
 * real signal is `required` / `aria-required` on the control, so a screen reader
 * hears "Name, required edit" rather than "Name star".
 *
 * The error message is rendered here and wired by id: the caller spreads
 * `controlProps(id, error)` from `lib/fieldStyles` onto its control to get the
 * matching `aria-describedby`, `aria-invalid` and error border.
 */
function AlertIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v3.75" strokeLinecap="round" />
      <path d="M8 11.1h.01" strokeLinecap="round" />
    </svg>
  );
}

export default function Field({
  id,
  label,
  required = false,
  error,
  hidden = false,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  /** Really hidden — out of the a11y tree and the tab order (ux-spec §6.2). */
  hidden?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // The `hidden` attribute alone would lose to the `flex` utility (the UA rule
  // is weaker than a class), and a field that is only visually gone is still in
  // the tab order — so the display utility switches with it.
  return (
    <div hidden={hidden} className={cn(hidden ? 'hidden' : 'flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-body text-small font-medium text-ink">
        {label}
        {required ? (
          <span className="text-accent-orange-ink" aria-hidden="true">
            {' *'}
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={errorId(id)} className="text-small mt-1 flex items-start gap-1.5 text-danger">
          <AlertIcon />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
