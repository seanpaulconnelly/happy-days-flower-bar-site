import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { site } from './src/config/site.ts';
import { copy } from './src/content/copy.ts';
import { generatedImages } from './src/content/images.generated.ts';
import { HERO_DESKTOP_MEDIA, HERO_MOBILE_MEDIA, SIZES, preloadLinkFor } from './src/lib/images.ts';
import { buildJsonLd, serializeJsonLd } from './src/seo/jsonld.ts';
import { buildMeta, escapeHtmlAttribute, renderHeadTags } from './src/seo/meta.ts';
import { OG_IMAGE, jsonLdImages, seoPackages, serviceDescription } from './src/seo/pageInputs.ts';
import type { SiteMode } from './src/seo/types.ts';

// `public/CNAME` is the single switch for both the base path and indexability.
// Until it exists the site is served from the GitHub project-pages URL, so the
// CI workflow sets BASE_PATH=/happy-days-flower-bar-site/ and the build is
// marked 'preview' (noindex). Once CNAME lands, base is '/' and mode is
// 'canonical'. See plan §3.3 and decisions D5.
const hasCname = existsSync(fileURLToPath(new URL('./public/CNAME', import.meta.url)));
const siteMode: SiteMode = hasCname ? 'canonical' : 'preview';
const base = process.env.BASE_PATH ?? '/';

/**
 * Build-time head injection (request SEO-1, `docs/seo-aeo-spec.md` §9).
 *
 * The page is client-rendered and most AI retrieval crawlers do not execute
 * JavaScript, so React renders **no** metadata and **no** `ld+json` — all of it
 * is written into `index.html` here, once, for every fetcher. The hook also
 * runs in `vite dev`, so the head you debug is the head that ships.
 *
 * It additionally emits the hero's LCP preload. The `<picture>` in `Hero.tsx`
 * is art-directed, so there are two preload links carrying the *same* two media
 * conditions and the same `sizes` string, both from `src/lib/images.ts` — a
 * browser therefore matches exactly one and downloads exactly one hero file.
 * `type="image/avif"` narrows each link to browsers that accept AVIF; the rest
 * ignore it and fetch from `<picture>` as usual.
 */
function seoHead(mode: SiteMode, basePath: string): Plugin {
  return {
    name: 'happy-days-seo-head',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        const meta = buildMeta({ site, mode, ogImage: OG_IMAGE });
        const graph = buildJsonLd({
          site,
          mode,
          packages: seoPackages,
          faqs: copy.faq.items,
          faqHeading: copy.faq.heading,
          images: jsonLdImages,
          serviceDescription,
        });

        const heroPreloads = [
          { image: generatedImages.hero, media: HERO_DESKTOP_MEDIA },
          { image: generatedImages.heroSquare, media: HERO_MOBILE_MEDIA },
        ].map(({ image, media }) => {
          const link = preloadLinkFor(image, SIZES.hero, { base: basePath });
          const attrs = [
            'rel="preload"',
            'as="image"',
            `type="${escapeHtmlAttribute(link.type)}"`,
            `href="${escapeHtmlAttribute(link.href)}"`,
            `imagesrcset="${escapeHtmlAttribute(link.imagesrcset)}"`,
            `imagesizes="${escapeHtmlAttribute(link.imagesizes)}"`,
            `media="${escapeHtmlAttribute(media)}"`,
            'fetchpriority="high"',
          ];
          return `    <link ${attrs.join(' ')} />`;
        });

        const head = [
          ...heroPreloads,
          renderHeadTags(meta),
          `    <script type="application/ld+json">${serializeJsonLd(graph)}</script>`,
        ].join('\n');

        return (
          html
            // Exactly one <title>, always the built one.
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`)
            // Drop any hand-written description so it cannot be duplicated.
            .replace(/[ \t]*<meta\s+name="description"[\s\S]*?\/?>\s*\n/i, '')
            .replace('</head>', `${head}\n  </head>`)
        );
      },
    },
  };
}

/**
 * Base-path rewrite for `404.html` (QA-3).
 *
 * GitHub Pages serves `public/404.html` for unknown paths, and Vite copies it
 * out of `publicDir` byte for byte — so its "return home" link stayed `/`,
 * which is a *different site* for the whole pre-cutover period, when the build
 * runs with `BASE_PATH=/happy-days-flower-bar-site/`. Rewriting it here rather
 * than at runtime keeps the shipped page a static file with a correct link and
 * no script. `closeBundle` runs after the public dir has been copied, so this
 * edits the emitted copy; the source file keeps a valid `/` for local use.
 */
function notFoundBasePath(): Plugin {
  const MARKER = '<a id="home-link" href="/">';
  let outDir = 'dist';
  let basePath = '/';
  return {
    name: 'happy-days-404-base',
    apply: 'build',
    configResolved(config) {
      outDir = resolvePath(config.root, config.build.outDir);
      basePath = config.base;
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        const file = resolvePath(outDir, '404.html');
        if (!existsSync(file)) return;
        const html = readFileSync(file, 'utf8');
        if (!html.includes(MARKER)) {
          throw new Error(
            `404.html: expected the home link to be exactly \`${MARKER}\` so its href can be ` +
              'rewritten to the base path (see public/404.html).',
          );
        }
        writeFileSync(file, html.replace(MARKER, `<a id="home-link" href="${basePath}">`));
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), seoHead(siteMode, base), notFoundBasePath()],
  define: {
    'import.meta.env.VITE_SITE_MODE': JSON.stringify(siteMode),
  },
  build: {
    target: 'baseline-widely-available',
  },
  preview: {
    port: 4173,
  },
});
