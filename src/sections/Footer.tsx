import Container from '../components/Container';
import Wordmark from '../components/Wordmark';
import { site } from '../config/site';
import { footer } from '../content/copy';

/**
 * Footer — design-spec §6.12, ux-spec §1 row 10.
 *
 * Three rows: wordmark + the three contact routes; place and service area;
 * tagline and the copyright line. Text links only, no social icons in V1. No
 * heading elements (ux-spec §9). Every line is verbatim from `copy.footer`; the
 * URLs and the address come from `src/config/site.ts`.
 */
const COPYRIGHT = `© ${footer.lines[0]}`;

export default function Footer() {
  const [, place, serviceArea] = footer.lines;

  const links = [
    { label: footer.socialLabels.instagram, href: site.social.instagram },
    { label: footer.socialLabels.facebook, href: site.social.facebook },
    { label: footer.socialLabels.email, href: `mailto:${site.email}` },
  ];

  return (
    <footer className="border-t border-line bg-surface py-section-sm">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Wordmark variant="footer" />
          <ul className="flex flex-wrap items-center gap-x-6">
            {links.map((link) => (
              <li key={link.label} className="flex">
                <a
                  href={link.href}
                  className="flex min-h-tap items-center font-body text-small font-medium text-ink underline-offset-4 hover:text-brand-ink hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 flex flex-col text-small text-ink-muted md:flex-row md:items-center md:gap-2">
          <span>{place}</span>
          <span aria-hidden="true" className="hidden md:inline">
            ·
          </span>
          <span>{serviceArea}</span>
        </p>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-small text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>{footer.tagline}</p>
          <p>{COPYRIGHT}</p>
        </div>
      </Container>
    </footer>
  );
}
