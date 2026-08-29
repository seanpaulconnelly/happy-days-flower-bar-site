/**
 * Field chrome shared by `<Field>` and the controls it wraps (design-spec §6.9).
 *
 * These live outside `Field.tsx` so that file exports only its component and
 * fast refresh keeps working there — and so the class list and the ARIA wiring
 * that must agree with it are written down in one place.
 */

export function errorId(id: string): string {
  return `${id}-error`;
}

/** `h-field` is 48 px; the 16 px+ text size is what stops iOS zooming on focus. */
const CONTROL_BASE =
  'w-full rounded-field border border-border-strong bg-surface-alt px-3.5 font-body text-body text-ink focus:border-brand disabled:opacity-60';

export const controlClasses = {
  input: `${CONTROL_BASE} h-field`,
  textarea: `${CONTROL_BASE} min-h-32 py-3`,
  select: `${CONTROL_BASE} h-field appearance-none pr-10`,
} as const;

/**
 * Native `<select>` with the arrow drawn as a background image (design-spec
 * §6.9): `appearance-none` removes the platform control, and an inline SVG data
 * URI costs no request and no icon library.
 */
export const selectChevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='%2326231F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.875rem center',
  backgroundSize: '1.25rem 1.25rem',
} as const;

/** Everything a control needs to be wired to its label's error message. */
export function controlProps(id: string, error?: string) {
  return {
    id,
    'aria-describedby': error ? errorId(id) : undefined,
    'aria-invalid': error ? (true as const) : undefined,
  };
}

/**
 * The §6.9 error border, appended to the control's class list when invalid.
 *
 * `focus:border-danger` is what keeps the *focused* invalid field red: focus
 * lands on the first invalid control after a failed submit, and `CONTROL_BASE`'s
 * `focus:border-brand` sorts after `border-danger` in the generated stylesheet,
 * so without this the one field the visitor is looking at is the only invalid
 * one that does not look invalid (design review 5f-02).
 */
export function errorRing(error?: string): string | undefined {
  return error ? 'border-[1.5px] border-danger focus:border-danger' : undefined;
}
