import { Fragment, type CSSProperties } from 'react';
import type { GeneratedImage } from '../content/images.generated.ts';
import { srcSet, widest, withBase } from '../lib/images';

/**
 * The only way an image reaches the page (build plan Phase 4).
 *
 *   <Picture image={generatedImages.hero} alt={images.hero.alt} sizes={SIZES.hero} priority />
 *
 * Renders AVIF and WebP `<source>`s with a JPEG `<img>` fallback, explicit
 * intrinsic `width`/`height` so nothing shifts, and the crop's dominant colour
 * behind the frame until the bytes land. `priority` marks the hero: eager +
 * high fetch priority, the LCP element (plan §3.4). Pair it with the preload
 * link built by `preloadLinkFor()` in `src/lib/images.ts`, using the same
 * `sizes` string.
 *
 * `media` art-directs a slot: each entry emits its three `<source>`s ahead of
 * the default ones, so a different *crop* (not just a different width) can be
 * chosen per breakpoint. Only the hero needs it (design-spec §6.3/§9).
 *
 * `sizes` per slot is the `SIZES` record in `src/lib/images.ts` (design-spec §9).
 *
 * The `<picture>` element itself is `display: contents` so the `<img>` is the
 * direct layout child of whatever wrapper the section provides — sections size
 * images with `object-cover` inside a wrapper, never through `<picture>`.
 */
export type PictureSource = {
  /** The rendition to use when `media` matches. */
  image: GeneratedImage;
  /** A media condition, e.g. `(min-width: 768px)`. */
  media: string;
  /** Defaults to the component's `sizes`. */
  sizes?: string;
};

export type PictureProps = {
  /** One entry from `generatedImages`; the fallback when no `media` matches. */
  image: GeneratedImage;
  /** From `images[key].alt` (ux-spec §7, verbatim). `''` only if decorative. */
  alt: string;
  /** Slot `sizes` string; see above. */
  sizes: string;
  /** Art-directed renditions, tried in order before `image`. */
  media?: readonly PictureSource[];
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
  media = [],
  priority = false,
  className,
  loading = 'lazy',
  style,
}: PictureProps) {
  const fallback = widest(image.src.jpeg);

  return (
    <picture className="contents">
      {media.map((source) => {
        const sourceSizes = source.sizes ?? sizes;
        return (
          <Fragment key={source.media}>
            <source
              media={source.media}
              type="image/avif"
              srcSet={srcSet(source.image.src.avif)}
              sizes={sourceSizes}
            />
            <source
              media={source.media}
              type="image/webp"
              srcSet={srcSet(source.image.src.webp)}
              sizes={sourceSizes}
            />
            <source
              media={source.media}
              type="image/jpeg"
              srcSet={srcSet(source.image.src.jpeg)}
              sizes={sourceSizes}
            />
          </Fragment>
        );
      })}
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
