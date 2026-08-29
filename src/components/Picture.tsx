import type { CSSProperties } from 'react';
import type { GeneratedImage } from '../content/images.generated';
import { srcSet, widest, withBase } from '../lib/images';

/**
 * The only way an image reaches the page (build plan Phase 4).
 *
 *   <Picture image={generatedImages.hero} alt={images.hero.alt} sizes={…} priority />
 *
 * Renders AVIF and WebP `<source>`s with a JPEG `<img>` fallback, explicit
 * intrinsic `width`/`height` so nothing shifts, and the crop's dominant colour
 * behind the frame until the bytes land. `priority` marks the hero: eager +
 * high fetch priority, the LCP element (plan §3.4). Pair it with the preload
 * link built by `preloadLinkFor()` in `src/lib/images.ts`, using the same
 * `sizes` string.
 *
 * `sizes` per slot is in design-spec §9: hero `(min-width: 768px) 52vw, 100vw`;
 * intro/about `(min-width: 768px) 46vw, 100vw`; the Why trio
 * `(min-width: 1024px) 22rem, 30vw`; gallery `(min-width: 1024px) 25vw, 50vw`.
 */
export type PictureProps = {
  /** One entry from `generatedImages`. */
  image: GeneratedImage;
  /** From `images[key].alt` (ux-spec §7, verbatim). `''` only if decorative. */
  alt: string;
  /** Slot `sizes` string; see above. */
  sizes: string;
  /** The LCP image: eager, high fetch priority. At most one per page. */
  priority?: boolean;
  /** Classes for the `<img>` (aspect, radius, `object-cover`, clip-path). */
  className?: string;
  /** Ignored when `priority`. */
  loading?: 'lazy' | 'eager';
  /** Merged over the placeholder background. */
  style?: CSSProperties;
};

export default function Picture({
  image,
  alt,
  sizes,
  priority = false,
  className,
  loading = 'lazy',
  style,
}: PictureProps) {
  const fallback = widest(image.src.jpeg);

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.src.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.src.webp)} sizes={sizes} />
      <img
        src={withBase(fallback.src)}
        srcSet={srcSet(image.src.jpeg)}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        // Holds the frame's colour before the bytes arrive; the loaded image
        // paints over it, so it is invisible afterwards.
        style={{ backgroundColor: image.placeholder, ...style }}
      />
    </picture>
  );
}
