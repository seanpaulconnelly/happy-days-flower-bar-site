/**
 * Head metadata builder: title, description, canonical, robots, Open Graph and
 * Twitter cards.
 *
 * Pure functions. No DOM, no `import.meta.env`, no dependencies — so the same
 * code runs in Node inside a Vite `transformIndexHtml` hook (the recommended
 * injection path, see `docs/seo-aeo-spec.md` §9) and in a unit test.
 *
 * `mode` is a parameter, never read from the environment here.
 */

import { PREVIEW_URL } from './types.ts';
import type { LinkTag, MetaTag, SeoImage, SeoMeta, SeoSite, SiteMode } from './types.ts';

export interface BuildMetaInput {
  readonly site: SeoSite;
  readonly mode: SiteMode;
  /** The 1200×630 social card (`public/og.jpg`). `url` may be root-relative. */
  readonly ogImage: SeoImage;
  /** Override the preview host. Defaults to `PREVIEW_URL`. */
  readonly previewUrl?: string;
}

/** Ensure a URL ends with exactly one slash so it can be joined with paths. */
export function normalizeBase(url: string): string {
  return url.replace(/\/+$/, '') + '/';
}

/** Resolve a possibly root-relative path against the site base. */
export function absoluteUrl(base: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return normalizeBase(base) + pathOrUrl.replace(/^\/+/, '');
}

/**
 * The base URL for this build.
 *
 * `canonical` → `site.url`. `preview` → the GitHub Pages project URL, so that
 * OG previews shared from a staging link point at the page that actually exists.
 */
export function siteBaseUrl(input: Pick<BuildMetaInput, 'site' | 'mode' | 'previewUrl'>): string {
  const { site, mode, previewUrl } = input;
  return normalizeBase(mode === 'canonical' ? site.url : (previewUrl ?? PREVIEW_URL));
}

export function buildMeta(input: BuildMetaInput): SeoMeta {
  const { site, mode, ogImage } = input;
  const base = siteBaseUrl(input);
  const isCanonical = mode === 'canonical';

  const title = site.seo.title;
  const description = site.seo.description;
  const imageUrl = absoluteUrl(base, ogImage.url);

  // Preview builds emit `noindex,nofollow` and NO canonical link. A cross-host
  // canonical pointing at a domain that is not live yet is a contradictory
  // signal; `noindex` alone is unambiguous. See spec §6.
  const robots = isCanonical ? ('index,follow' as const) : ('noindex,nofollow' as const);
  const canonical = isCanonical ? base : null;

  const og = {
    title,
    description,
    type: 'website',
    url: base,
    siteName: site.name,
    locale: 'en_US',
    image: imageUrl,
    imageWidth: String(ogImage.width),
    imageHeight: String(ogImage.height),
    imageAlt: ogImage.alt,
  };

  const twitter = {
    card: 'summary_large_image',
    title,
    description,
    image: imageUrl,
    imageAlt: ogImage.alt,
  };

  const metaTags: MetaTag[] = [
    { name: 'description', content: description },
    { name: 'robots', content: robots },
  ];

  if (isCanonical) {
    // Opt in to full-size image previews and untruncated text snippets. This is
    // the one directive that measurably helps AI Overviews and rich snippets;
    // it is meaningless (and confusing) on a noindex build.
    metaTags.push({
      name: 'googlebot',
      content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    });
  }

  metaTags.push(
    { property: 'og:type', content: og.type },
    { property: 'og:site_name', content: og.siteName },
    { property: 'og:locale', content: og.locale },
    { property: 'og:title', content: og.title },
    { property: 'og:description', content: og.description },
    { property: 'og:url', content: og.url },
    { property: 'og:image', content: og.image },
    { property: 'og:image:width', content: og.imageWidth },
    { property: 'og:image:height', content: og.imageHeight },
    { property: 'og:image:alt', content: og.imageAlt },
    { name: 'twitter:card', content: twitter.card },
    { name: 'twitter:title', content: twitter.title },
    { name: 'twitter:description', content: twitter.description },
    { name: 'twitter:image', content: twitter.image },
    { name: 'twitter:image:alt', content: twitter.imageAlt },
  );

  const linkTags: LinkTag[] = [];
  if (canonical) linkTags.push({ rel: 'canonical', href: canonical });

  return { title, description, canonical, robots, og, twitter, metaTags, linkTags };
}

/** Minimal HTML attribute escaping for the build-time injector. */
export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render the meta/link tags as an HTML fragment for `transformIndexHtml`.
 * `<title>` is NOT included — replace the existing `<title>` element instead so
 * the document never ends up with two.
 */
export function renderHeadTags(meta: SeoMeta, indent = '    '): string {
  const lines: string[] = [];
  for (const tag of meta.metaTags) {
    const key = tag.name ? 'name' : 'property';
    const value = tag.name ?? tag.property ?? '';
    lines.push(
      `${indent}<meta ${key}="${escapeHtmlAttribute(value)}" content="${escapeHtmlAttribute(tag.content)}" />`,
    );
  }
  for (const tag of meta.linkTags) {
    const type = tag.type ? ` type="${escapeHtmlAttribute(tag.type)}"` : '';
    lines.push(
      `${indent}<link rel="${escapeHtmlAttribute(tag.rel)}" href="${escapeHtmlAttribute(tag.href)}"${type} />`,
    );
  }
  return lines.join('\n');
}
