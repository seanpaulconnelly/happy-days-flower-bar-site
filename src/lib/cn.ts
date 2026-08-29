/**
 * Join class names, dropping falsy entries. Deliberately tiny — the page has no
 * conditional-variant explosion that would justify `clsx` + `tailwind-merge`,
 * and every component below composes its classes in one place.
 */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
