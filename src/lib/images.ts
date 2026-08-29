/**
 * Helpers shared by `<Picture>` and the build-time head injection (Phase 5a).
 * They live outside `Picture.tsx` so a Node context can import them without
 * pulling in JSX, and so fast refresh keeps working in the component file.
 *
 * Node-safe (request SEO-5): nothing here imports CSS or assets, and the only
 * `import.meta.env` read is guarded and overridable via the `base` argument —
 * `vite.config.ts` should pass its own `base` rather than rely on the fallback.
 */
import type { GeneratedImage, GeneratedSource } from '../content/images.generated';

/** Vite's base in the browser bundle; `/` when imported from Node. */
export function baseUrl(): string {
  return import.meta.env?.BASE_URL ?? '/';
}

/**
 * Join a manifest path with the site base. A base always ends in `/`, so this
 * works for both `/` and `/happy-days-flower-bar-site/`.
 */
export function withBase(path: string, base: string = baseUrl()): string {
  return `${base}${path.replace(/^\//, '')}`;
}

/** `srcset` string for one format's candidates. */
export function srcSet(sources: GeneratedSource[], base?: string): string {
  return sources.map((s) => `${withBase(s.src, base ?? baseUrl())} ${s.w}w`).join(', ');
}

/** Widest candidate — the `<img src>` fallback for a browser without `srcset`. */
export function widest(sources: GeneratedSource[]): GeneratedSource {
  return sources.reduce((a, b) => (a.w > b.w ? a : b));
}

/**
 * Attributes for the hero's `<link rel="preload" as="image">` (plan §3.4). The
 * build-time head injection writes them into `index.html`:
 *
 *   const p = preloadLinkFor(generatedImages.hero, HERO_SIZES, { base });
 *   `<link rel="preload" as="image" type="${p.type}" href="${p.href}"
 *          imagesrcset="${p.imagesrcset}" imagesizes="${p.imagesizes}"
 *          fetchpriority="high">`
 *
 * AVIF is preloaded by default because `type` narrows the preload to browsers
 * that accept it; one that does not simply ignores the link and fetches from
 * `<picture>` as usual. Preload only the image also rendered with `priority`,
 * and pass the same `sizes` string, or the browser downloads a second file.
 */
export function preloadLinkFor(
  image: GeneratedImage,
  sizes: string,
  options: { format?: 'avif' | 'webp' | 'jpeg'; base?: string } = {},
): { imagesrcset: string; imagesizes: string; type: string; href: string } {
  const format = options.format ?? 'avif';
  const base = options.base ?? baseUrl();
  const sources = image.src[format];
  return {
    imagesrcset: srcSet(sources, base),
    imagesizes: sizes,
    type: format === 'jpeg' ? 'image/jpeg' : `image/${format}`,
    href: withBase(widest(sources).src, base),
  };
}
